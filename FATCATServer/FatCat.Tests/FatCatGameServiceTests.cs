using FatCat.Application;
using FatCat.Domain;
using FatCat.Infrastructure;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace FatCat.Tests;

public sealed class FatCatGameServiceTests
{
    [Fact]
    public async Task AuthGuestAsync_ReusesExistingDevicePlayer()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));

        var first = await service.AuthGuestAsync(new AuthGuestRequest("device-1", "肥猫咖啡公司"), CancellationToken.None);
        var second = await service.AuthGuestAsync(new AuthGuestRequest("device-1", "改名不会覆盖"), CancellationToken.None);

        Assert.True(first.IsNewPlayer);
        Assert.False(second.IsNewPlayer);
        Assert.Equal(first.PlayerId, second.PlayerId);
        Assert.NotNull(await dbContext.ResourceStates.FindAsync([first.PlayerId], CancellationToken.None));
    }

    [Fact]
    public async Task ClaimMailAsync_ClaimsWelcomeMailOnlyOnce()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("mail-device", "FatCat"), CancellationToken.None);

        var mails = await service.GetMailAsync(auth.PlayerId, CancellationToken.None);
        var firstClaim = await service.ClaimMailAsync(auth.PlayerId, "welcome", CancellationToken.None);
        var secondClaim = await service.ClaimMailAsync(auth.PlayerId, "welcome", CancellationToken.None);

        Assert.Contains(mails, mail => mail.Id == "welcome");
        Assert.NotNull(firstClaim);
        Assert.Null(secondClaim);
        Assert.Equal(2500, firstClaim!.RewardCoin);
        Assert.Equal(20, firstClaim.RewardCatFood);
        Assert.Equal(12452500, firstClaim.CoinBalance);
        Assert.Equal(3530, firstClaim.CatFoodBalance);
        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        Assert.Equal(12452500, resources!.Coin);
        Assert.Equal(3530, resources.CatFood);
        var transaction = Assert.Single(dbContext.ResourceTransactions.Where(item => item.PlayerId == auth.PlayerId));
        Assert.Equal("mail_claim", transaction.SourceType);
        Assert.Equal("welcome", transaction.SourceKey);
        Assert.Equal(2500, transaction.CoinDelta);
        Assert.Equal(20, transaction.CatFoodDelta);
    }

    [Fact]
    public async Task PurchaseShopItemAsync_DeductsAuthoritativeResource()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("shop-device", "FatCat"), CancellationToken.None);

        var purchase = await service.PurchaseShopItemAsync(auth.PlayerId, new ShopPurchaseRequest("shop_cat_food_1", 1), CancellationToken.None);

        Assert.NotNull(purchase);
        Assert.Equal("item_cat_food_pack", purchase!.ItemId);
        Assert.Equal("coin", purchase.PriceType);
        Assert.Equal(500, purchase.PricePaid);
        Assert.Equal(4, purchase.RemainingDaily);
        Assert.Equal(12449500, purchase.CoinBalance);
        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        Assert.Equal(12449500, resources!.Coin);
        var transaction = Assert.Single(dbContext.ResourceTransactions.Where(item => item.PlayerId == auth.PlayerId));
        Assert.Equal("shop_purchase", transaction.SourceType);
        Assert.Equal("shop_cat_food_1", transaction.SourceKey);
        Assert.Equal(-500, transaction.CoinDelta);
        Assert.Equal(12449500, transaction.CoinBalance);
        var history = Assert.Single(dbContext.ShopPurchaseHistories.Where(item => item.PlayerId == auth.PlayerId));
        Assert.Equal("shop_cat_food_1", history.ShopItemId);
        Assert.Equal(1, history.Count);
    }

    [Fact]
    public async Task PurchaseShopItemAsync_RejectsWhenDailyLimitReached()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("shop-limit-device", "FatCat"), CancellationToken.None);

        var first = await service.PurchaseShopItemAsync(auth.PlayerId, new ShopPurchaseRequest("shop_cat_food_1", 5), CancellationToken.None);
        var second = await service.PurchaseShopItemAsync(auth.PlayerId, new ShopPurchaseRequest("shop_cat_food_1", 1), CancellationToken.None);

        Assert.NotNull(first);
        Assert.Equal(0, first!.RemainingDaily);
        Assert.Null(second);
        var history = Assert.Single(dbContext.ShopPurchaseHistories.Where(item => item.PlayerId == auth.PlayerId));
        Assert.Equal(5, history.Count);
        Assert.Single(dbContext.ResourceTransactions.Where(item => item.PlayerId == auth.PlayerId));
    }

    [Fact]
    public async Task GetShopStateAsync_ReturnsAuthoritativeRemainingDailyCounts()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("shop-state-device", "FatCat"), CancellationToken.None);

        var initial = await service.GetShopStateAsync(auth.PlayerId, CancellationToken.None);
        await service.PurchaseShopItemAsync(auth.PlayerId, new ShopPurchaseRequest("shop_cat_food_1", 2), CancellationToken.None);
        var afterPurchase = await service.GetShopStateAsync(auth.PlayerId, CancellationToken.None);

        Assert.NotNull(initial);
        var initialCatFood = Assert.Single(initial!, item => item.ShopItemId == "shop_cat_food_1");
        Assert.Equal(5, initialCatFood.LimitDaily);
        Assert.Equal(0, initialCatFood.PurchasedToday);
        Assert.Equal(5, initialCatFood.RemainingDaily);
        Assert.NotNull(afterPurchase);
        var catFood = Assert.Single(afterPurchase!, item => item.ShopItemId == "shop_cat_food_1");
        Assert.Equal("item_cat_food_pack", catFood.ItemId);
        Assert.Equal("coin", catFood.PriceType);
        Assert.Equal(500, catFood.PriceAmount);
        Assert.Equal(2, catFood.PurchasedToday);
        Assert.Equal(3, catFood.RemainingDaily);
    }

    [Fact]
    public async Task Inventory_PurchaseAndUseReplayWithoutDuplicatingMutation()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("inventory-device", "FatCat"), CancellationToken.None);

        var initial = await service.GetInventoryAsync(auth.PlayerId, CancellationToken.None);
        var purchase = await service.PurchaseShopItemAsync(
            auth.PlayerId,
            new ShopPurchaseRequest("shop_cat_food_1", 1, "purchase-once"),
            CancellationToken.None);
        var purchaseReplay = await service.PurchaseShopItemAsync(
            auth.PlayerId,
            new ShopPurchaseRequest("shop_cat_food_1", 1, "purchase-once"),
            CancellationToken.None);
        var use = await service.UseInventoryItemAsync(
            auth.PlayerId,
            "item_cat_food_pack",
            new InventoryUseRequest("use-once", 1),
            CancellationToken.None);
        var useReplay = await service.UseInventoryItemAsync(
            auth.PlayerId,
            "item_cat_food_pack",
            new InventoryUseRequest("use-once", 1),
            CancellationToken.None);
        var final = await service.GetInventoryAsync(auth.PlayerId, CancellationToken.None);

        Assert.NotNull(initial);
        Assert.Equal(2, Assert.Single(initial!, item => item.ItemId == "item_cat_food_pack").Quantity);
        Assert.Equal(5, Assert.Single(initial!, item => item.ItemId == "item_coin_pack_small").Quantity);
        Assert.NotNull(purchase);
        Assert.False(purchase!.Replayed);
        Assert.Equal(3, purchase.ItemQuantityAfter);
        Assert.NotNull(purchaseReplay);
        Assert.True(purchaseReplay!.Replayed);
        Assert.Equal(purchase.CoinBalance, purchaseReplay.CoinBalance);
        Assert.NotNull(use);
        Assert.False(use!.Replayed);
        Assert.Equal(100, use.RewardAmount);
        Assert.Equal(2, use.Item.Quantity);
        Assert.NotNull(useReplay);
        Assert.True(useReplay!.Replayed);
        Assert.Equal(use.CatFoodBalance, useReplay.CatFoodBalance);
        Assert.Equal(3_610, use.CatFoodBalance);
        Assert.Equal(2, Assert.Single(final!, item => item.ItemId == "item_cat_food_pack").Quantity);
        Assert.Equal(2, await dbContext.InventoryTransactions.CountAsync(item => item.PlayerId == auth.PlayerId));
        Assert.Equal(2, await dbContext.ResourceTransactions.CountAsync(item => item.PlayerId == auth.PlayerId));
        Assert.Equal(1, Assert.Single(dbContext.ShopPurchaseHistories.Where(item => item.PlayerId == auth.PlayerId)).Count);
    }

    [Fact]
    public async Task Inventory_AddsMissingCatalogRowsWithoutGrantingDefaultsAgain()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("inventory-catalog-migration", "FatCat"), CancellationToken.None);
        await service.GetInventoryAsync(auth.PlayerId, CancellationToken.None);
        var removed = Assert.Single(dbContext.InventoryItems.Where(item =>
            item.PlayerId == auth.PlayerId && item.ItemKey == "item_coin_pack_small"));
        dbContext.InventoryItems.Remove(removed);
        await dbContext.SaveChangesAsync();

        var migrated = await service.GetInventoryAsync(auth.PlayerId, CancellationToken.None);

        Assert.NotNull(migrated);
        Assert.Equal(0, Assert.Single(migrated!, item => item.ItemId == "item_coin_pack_small").Quantity);
        Assert.Equal(3, dbContext.InventoryItems.Count(item => item.PlayerId == auth.PlayerId));
    }

    [Fact]
    public async Task PurchaseDecorationAsync_AddsPermanentOwnedDecorAndDeductsOnce()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("decor-shop-device", "Decor Shop"), CancellationToken.None);

        var initialCatalog = await service.GetDecorCatalogAsync(auth.PlayerId, CancellationToken.None);
        var purchase = await service.PurchaseDecorationAsync(auth.PlayerId, "decor_shop_neon_paw", CancellationToken.None);
        var duplicate = await service.PurchaseDecorationAsync(auth.PlayerId, "decor_shop_neon_paw", CancellationToken.None);
        var catalog = await service.GetDecorCatalogAsync(auth.PlayerId, CancellationToken.None);

        Assert.NotNull(initialCatalog);
        Assert.Equal(6, initialCatalog!.Count);
        Assert.All(initialCatalog, item => Assert.False(item.Owned));
        Assert.NotNull(purchase);
        Assert.Equal("decor_shop_neon_paw", purchase!.Decor.DecorId);
        Assert.Equal("building_cafe_1f", purchase.Decor.BuildingId);
        Assert.False(purchase.Decor.IsPlaced);
        Assert.Equal(58, purchase.Decor.Score);
        Assert.Equal(28_000, purchase.PricePaid);
        Assert.Equal(12_422_000, purchase.CoinBalance);
        Assert.Null(duplicate);
        Assert.Contains(catalog!, item => item.DecorId == "decor_shop_neon_paw" && item.Owned);
        Assert.Equal(13, await dbContext.DecorStates.CountAsync(item => item.PlayerId == auth.PlayerId));
        var transaction = Assert.Single(dbContext.ResourceTransactions.Where(item => item.PlayerId == auth.PlayerId));
        Assert.Equal("decor_purchase", transaction.SourceType);
        Assert.Equal("decor_shop_neon_paw", transaction.SourceKey);
        Assert.Equal(-28_000, transaction.CoinDelta);
    }

    [Fact]
    public async Task DecorCollection_UnlocksClaimsAndPersistsEachRewardOnce()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("decor-collection-device", "Collector Cafe"), CancellationToken.None);

        var initial = await service.GetDecorCollectionAsync(auth.PlayerId, CancellationToken.None);
        var lockedClaim = await service.ClaimDecorCollectionTierAsync(auth.PlayerId, "collector_1", CancellationToken.None);
        await service.PurchaseDecorationAsync(auth.PlayerId, "decor_shop_neon_paw", CancellationToken.None);
        var unlocked = await service.GetDecorCollectionAsync(auth.PlayerId, CancellationToken.None);
        var claim = await service.ClaimDecorCollectionTierAsync(auth.PlayerId, "collector_1", CancellationToken.None);
        var duplicate = await service.ClaimDecorCollectionTierAsync(auth.PlayerId, "collector_1", CancellationToken.None);

        Assert.NotNull(initial);
        Assert.Equal(0, initial!.OwnedCount);
        Assert.Equal(6, initial.TotalCount);
        Assert.All(initial.Tiers, tier => Assert.False(tier.Claimable));
        Assert.Null(lockedClaim);
        Assert.NotNull(unlocked);
        Assert.Equal(1, unlocked!.OwnedCount);
        Assert.Equal(58, unlocked.OwnedScore);
        Assert.True(Assert.Single(unlocked.Tiers, tier => tier.TierId == "collector_1").Claimable);
        Assert.NotNull(claim);
        Assert.Equal("coin", claim!.RewardType);
        Assert.Equal(10_000, claim.RewardAmount);
        Assert.Equal(12_432_000, claim.CoinBalance);
        Assert.True(Assert.Single(claim.Collection.Tiers, tier => tier.TierId == "collector_1").Claimed);
        Assert.Null(duplicate);

        var state = await dbContext.DecorCollectionStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(state);
        Assert.Equal(1, state!.ClaimedTierMask);
        var rewardTransaction = Assert.Single(dbContext.ResourceTransactions.Where(item => item.SourceType == "decor_collection_claim"));
        Assert.Equal("collector_1", rewardTransaction.SourceKey);
        Assert.Equal(10_000, rewardTransaction.CoinDelta);
    }

    [Fact]
    public async Task DecorCollection_TracksAllPremiumDecorAndThreeRewardTiers()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("decor-collection-complete", "Grand Collector"), CancellationToken.None);
        var decorIds = new[]
        {
            "decor_shop_neon_paw",
            "decor_shop_bean_globe",
            "decor_shop_ferment_chime",
            "decor_shop_roast_phonograph",
            "decor_shop_office_trophy",
            "decor_shop_storage_cart",
        };
        foreach (var decorId in decorIds)
        {
            Assert.NotNull(await service.PurchaseDecorationAsync(auth.PlayerId, decorId, CancellationToken.None));
        }

        Assert.NotNull(await service.ClaimDecorCollectionTierAsync(auth.PlayerId, "collector_1", CancellationToken.None));
        var middle = await service.ClaimDecorCollectionTierAsync(auth.PlayerId, "collector_3", CancellationToken.None);
        var final = await service.ClaimDecorCollectionTierAsync(auth.PlayerId, "collector_6", CancellationToken.None);

        Assert.NotNull(middle);
        Assert.Equal("diamond", middle!.RewardType);
        Assert.Equal(30, middle.RewardAmount);
        Assert.NotNull(final);
        Assert.Equal("researchPoint", final!.RewardType);
        Assert.Equal(100, final.RewardAmount);
        Assert.Equal(6, final.Collection.OwnedCount);
        Assert.Equal(434, final.Collection.OwnedScore);
        Assert.All(final.Collection.Tiers, tier => Assert.True(tier.Claimed));
        Assert.Equal(7, (await dbContext.DecorCollectionStates.FindAsync([auth.PlayerId], CancellationToken.None))!.ClaimedTierMask);
    }

    [Fact]
    public async Task UpgradeCatAsync_DeductsCoinAndWritesTransaction()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("cat-upgrade-device", "FatCat"), CancellationToken.None);

        var upgrade = await service.UpgradeCatAsync(auth.PlayerId, new CatUpgradeRequest("c_001"), CancellationToken.None);

        Assert.NotNull(upgrade);
        Assert.Equal("c_001", upgrade!.CatId);
        Assert.Equal(1, upgrade.PreviousLevel);
        Assert.Equal(2, upgrade.Level);
        Assert.Equal(100, upgrade.CoinSpent);
        Assert.Equal(12449900, upgrade.CoinBalance);
        var cat = await dbContext.CatStates.FirstOrDefaultAsync(item => item.PlayerId == auth.PlayerId && item.CatKey == "c_001");
        Assert.NotNull(cat);
        Assert.True(cat!.IsUnlocked);
        Assert.Equal(2, cat.Level);
        var transaction = Assert.Single(dbContext.ResourceTransactions.Where(item => item.PlayerId == auth.PlayerId));
        Assert.Equal("cat_upgrade", transaction.SourceType);
        Assert.Equal("c_001", transaction.SourceKey);
        Assert.Equal(-100, transaction.CoinDelta);
    }

    [Fact]
    public async Task FeedCatAsync_DeductsCatFoodAndWritesTransaction()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("cat-feed-device", "FatCat"), CancellationToken.None);

        var feed = await service.FeedCatAsync(auth.PlayerId, new CatFeedRequest("c_001"), CancellationToken.None);

        Assert.NotNull(feed);
        Assert.Equal("c_001", feed!.CatId);
        Assert.Equal(20, feed.PreviousWeight);
        Assert.Equal(21, feed.Weight);
        Assert.Equal(9, feed.CatFoodSpent);
        Assert.Equal(3501, feed.CatFoodBalance);
        var cat = await dbContext.CatStates.FirstOrDefaultAsync(item => item.PlayerId == auth.PlayerId && item.CatKey == "c_001");
        Assert.NotNull(cat);
        Assert.True(cat!.IsUnlocked);
        Assert.Equal(21, cat.Weight);
        var transaction = Assert.Single(dbContext.ResourceTransactions.Where(item => item.PlayerId == auth.PlayerId));
        Assert.Equal("cat_feed", transaction.SourceType);
        Assert.Equal("c_001", transaction.SourceKey);
        Assert.Equal(-9, transaction.CatFoodDelta);
    }

    [Fact]
    public async Task UnlockCatAsync_DeductsCoinAndWritesTransaction()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("cat-unlock-device", "FatCat"), CancellationToken.None);

        var unlock = await service.UnlockCatAsync(auth.PlayerId, new CatUnlockRequest("c_005"), CancellationToken.None);

        Assert.NotNull(unlock);
        Assert.Equal("c_005", unlock!.CatId);
        Assert.True(unlock.IsUnlocked);
        Assert.Equal(1, unlock.Level);
        Assert.Equal(22, unlock.Weight);
        Assert.Equal(12000, unlock.CoinSpent);
        Assert.Equal(12438000, unlock.CoinBalance);
        var cat = await dbContext.CatStates.FirstOrDefaultAsync(item => item.PlayerId == auth.PlayerId && item.CatKey == "c_005");
        Assert.NotNull(cat);
        Assert.True(cat!.IsUnlocked);
        Assert.Equal(22, cat.Weight);
        var transaction = Assert.Single(dbContext.ResourceTransactions.Where(item => item.PlayerId == auth.PlayerId));
        Assert.Equal("cat_unlock", transaction.SourceType);
        Assert.Equal("c_005", transaction.SourceKey);
        Assert.Equal(-12000, transaction.CoinDelta);
    }

    [Fact]
    public async Task GetCatsAsync_ReturnsFullCatalogWithAuthoritativeCatStateSnapshot()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("cat-snapshot-device", "FatCat"), CancellationToken.None);

        await service.UpgradeCatAsync(auth.PlayerId, new CatUpgradeRequest("c_001"), CancellationToken.None);
        await service.FeedCatAsync(auth.PlayerId, new CatFeedRequest("c_001"), CancellationToken.None);
        await service.UnlockCatAsync(auth.PlayerId, new CatUnlockRequest("c_005"), CancellationToken.None);

        var cats = await service.GetCatsAsync(auth.PlayerId, CancellationToken.None);

        Assert.Equal(5, cats.Count);
        var orange = Assert.Single(cats, cat => cat.CatId == "c_001");
        Assert.True(orange.IsUnlocked);
        Assert.Equal(2, orange.Level);
        Assert.Equal(21, orange.Weight);
        Assert.Equal("building_cafe_1f", orange.AssignedBuildingId);
        Assert.Equal("equip_cup_lucky", orange.Equipment["cup"]);
        Assert.Equal(1, orange.EquipmentLevels["equip_cup_lucky"]);
        Assert.Equal("B", orange.Rarity);
        Assert.Equal("producer", orange.Role);
        Assert.Equal(10, orange.BaseProduction);
        Assert.Equal(5, orange.BaseBeanCost);
        Assert.Equal(1, orange.BaseSalary);
        Assert.Equal(20, orange.BaseWeight);
        Assert.Equal("s_001", orange.SkillId);
        var tuxedo = Assert.Single(cats, cat => cat.CatId == "c_005");
        Assert.True(tuxedo.IsUnlocked);
        Assert.Equal(1, tuxedo.Level);
        Assert.Equal(22, tuxedo.Weight);
        var locked = Assert.Single(cats, cat => cat.CatId == "c_002");
        Assert.False(locked.IsUnlocked);
        Assert.Equal(1, locked.Level);
        Assert.Equal(15, locked.Weight);
        Assert.Equal("A", locked.Rarity);
        Assert.Equal("launcher", locked.Role);
    }

    [Fact]
    public async Task EquipCatSkinAsync_PersistsOwnedSkinAndRejectsLockedSkin()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("cat-skin-device", "FatCat"), CancellationToken.None);

        var initial = await service.GetCatsAsync(auth.PlayerId, CancellationToken.None);
        var equipped = await service.EquipCatSkinAsync(auth.PlayerId, "c_001", "apron", CancellationToken.None);
        var locked = await service.EquipCatSkinAsync(auth.PlayerId, "c_001", "manager", CancellationToken.None);
        var unknown = await service.EquipCatSkinAsync(auth.PlayerId, "c_001", "missing", CancellationToken.None);
        var refreshed = await service.GetCatsAsync(auth.PlayerId, CancellationToken.None);

        var initialOrange = Assert.Single(initial, cat => cat.CatId == "c_001");
        Assert.Equal(["default", "apron"], initialOrange.OwnedSkinIds);
        Assert.Equal("default", initialOrange.EquippedSkinId);
        Assert.NotNull(equipped);
        Assert.Equal("apron", equipped!.EquippedSkinId);
        Assert.Equal(["default", "apron"], equipped.OwnedSkinIds);
        Assert.Null(locked);
        Assert.Null(unknown);
        var orange = Assert.Single(refreshed, cat => cat.CatId == "c_001");
        Assert.Equal("apron", orange.EquippedSkinId);
        var saved = Assert.Single(dbContext.CatStates.Where(cat => cat.PlayerId == auth.PlayerId && cat.CatKey == "c_001"));
        Assert.Equal("apron", saved.EquippedSkinKey);
        Assert.Contains("\"apron\"", saved.OwnedSkinsJson);
    }

    [Fact]
    public async Task UnlockCatSkinAsync_DeductsResourcesOnceAndReturnsCatalogOwnership()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("cat-skin-unlock-device", "FatCat"), CancellationToken.None);

        var initialCatalog = await service.GetCatSkinCatalogAsync(auth.PlayerId, "c_001", CancellationToken.None);
        var manager = await service.UnlockCatSkinAsync(auth.PlayerId, "c_001", "manager", CancellationToken.None);
        var duplicate = await service.UnlockCatSkinAsync(auth.PlayerId, "c_001", "manager", CancellationToken.None);
        var festival = await service.UnlockCatSkinAsync(auth.PlayerId, "c_001", "festival", CancellationToken.None);
        var refreshedCatalog = await service.GetCatSkinCatalogAsync(auth.PlayerId, "c_001", CancellationToken.None);

        Assert.NotNull(initialCatalog);
        var initialManager = Assert.Single(initialCatalog!, item => item.SkinId == "manager");
        Assert.False(initialManager.Owned);
        Assert.True(initialManager.Purchasable);
        Assert.Equal("coin", initialManager.PriceType);
        Assert.Equal(75_000, initialManager.PriceAmount);
        Assert.NotNull(manager);
        Assert.Equal("manager", manager!.EquippedSkinId);
        Assert.Equal(12_375_000, manager.CoinBalance);
        Assert.Null(duplicate);
        Assert.NotNull(festival);
        Assert.Equal("festival", festival!.EquippedSkinId);
        Assert.Equal(2_500, festival.DiamondBalance);
        Assert.NotNull(refreshedCatalog);
        Assert.True(Assert.Single(refreshedCatalog!, item => item.SkinId == "manager").Owned);
        Assert.True(Assert.Single(refreshedCatalog!, item => item.SkinId == "festival").Owned);
        Assert.Equal(2, dbContext.ResourceTransactions.Count(item =>
            item.PlayerId == auth.PlayerId && item.SourceType == "cat_skin_unlock"));
        Assert.Equal(-75_000, dbContext.ResourceTransactions.Single(item => item.SourceKey == "manager").CoinDelta);
        Assert.Equal(-80, dbContext.ResourceTransactions.Single(item => item.SourceKey == "festival").DiamondDelta);
    }

    [Fact]
    public async Task FactoryAppearanceAsync_EnforcesLevelAndPersistsOwnershipAndEquip()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("factory-appearance-device", "FatCat"), CancellationToken.None);

        var initial = await service.GetFactoryAppearanceStateAsync(auth.PlayerId, CancellationToken.None);
        var locked = await service.UnlockFactoryAppearanceAsync(auth.PlayerId, "classic", CancellationToken.None);
        var player = await dbContext.Players.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(player);
        player!.Level = 60;
        await dbContext.SaveChangesAsync();
        var unlocked = await service.UnlockFactoryAppearanceAsync(auth.PlayerId, "steam", CancellationToken.None);
        var equippedDefault = await service.EquipFactoryAppearanceAsync(auth.PlayerId, "simple", CancellationToken.None);
        var refreshed = await service.GetFactoryAppearanceStateAsync(auth.PlayerId, CancellationToken.None);

        Assert.NotNull(initial);
        Assert.Equal("simple", initial!.EquippedAppearanceId);
        Assert.Equal(["simple"], initial.OwnedAppearanceIds);
        var simpleCatalog = Assert.Single(initial.Catalog, item => item.AppearanceId == "simple");
        Assert.Equal(4, simpleCatalog.Bonuses.Count);
        Assert.Equal(3, simpleCatalog.Bonuses.Count(bonus => bonus.ProductionEffective));
        Assert.False(Assert.Single(initial.Catalog, item => item.AppearanceId == "classic").CanUnlock);
        Assert.Null(locked);
        Assert.NotNull(unlocked);
        Assert.Equal("steam", unlocked!.EquippedAppearanceId);
        Assert.Contains("steam", unlocked.OwnedAppearanceIds);
        Assert.True(Assert.Single(unlocked.Catalog, item => item.AppearanceId == "classic").CanUnlock);
        Assert.NotNull(equippedDefault);
        Assert.Equal("simple", equippedDefault!.EquippedAppearanceId);
        Assert.NotNull(refreshed);
        Assert.Equal("simple", refreshed!.EquippedAppearanceId);
        Assert.Contains("steam", refreshed.OwnedAppearanceIds);
        var saved = Assert.Single(dbContext.FactoryAppearanceStates.Where(state => state.PlayerId == auth.PlayerId));
        Assert.Equal("simple", saved.EquippedAppearanceKey);
        Assert.Contains("\"steam\"", saved.OwnedAppearanceIdsJson);
    }

    [Fact]
    public async Task FactoryAppearanceBonus_AffectsPreviewAndPersistsLaunchModifierSnapshot()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("factory-appearance-bonus-device", "FatCat"), CancellationToken.None);
        var player = await dbContext.Players.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(player);
        player!.Level = 60;
        await dbContext.SaveChangesAsync();

        var simplePreview = await service.PreviewServerProductionAsync(auth.PlayerId, CancellationToken.None);
        var steam = await service.UnlockFactoryAppearanceAsync(auth.PlayerId, "steam", CancellationToken.None);
        var steamPreview = await service.PreviewServerProductionAsync(auth.PlayerId, CancellationToken.None);
        var launch = await service.LaunchAsync(auth.PlayerId, new LaunchRequest(
            "appearance-modifier-snapshot",
            10,
            999999,
            new ProductionPreviewRequest(999999, 0, 0)), CancellationToken.None);
        await service.EquipFactoryAppearanceAsync(auth.PlayerId, "simple", CancellationToken.None);
        var replay = await service.LaunchAsync(auth.PlayerId, new LaunchRequest(
            "appearance-modifier-snapshot",
            10,
            0,
            new ProductionPreviewRequest(0, 999999, 999999)), CancellationToken.None);

        Assert.NotNull(simplePreview);
        Assert.NotNull(steam);
        Assert.NotNull(steamPreview);
        var simpleSource = Assert.Single(simplePreview!.ModifierSources!);
        Assert.Equal("simple", simpleSource.SourceId);
        Assert.Equal(10, simpleSource.GrossCoinPercent);
        Assert.Equal(-5, simpleSource.WageCostPercent);
        var steamSource = Assert.Single(steamPreview!.ModifierSources!);
        Assert.Equal("steam", steamSource.SourceId);
        Assert.Equal(22, steamSource.GrossCoinPercent);
        Assert.Equal(6, steamSource.BeanCostReducePercent);
        Assert.True(steamPreview.GrossCoinPerSecond > simplePreview.GrossCoinPerSecond);
        Assert.True(steamPreview.BeanCostPerSecond < simplePreview.BeanCostPerSecond);
        Assert.True(launch.Accepted);
        Assert.Equal("steam", launch.EquippedFactoryAppearanceId);
        Assert.Equal("steam", Assert.Single(launch.ModifierSources!).SourceId);
        Assert.Equal(launch.LaunchId, replay.LaunchId);
        Assert.Equal(launch.CoinGained, replay.CoinGained);
        Assert.Equal("steam", replay.EquippedFactoryAppearanceId);
        Assert.Equal("steam", Assert.Single(replay.ModifierSources!).SourceId);
        var record = Assert.Single(dbContext.LaunchRecords.Where(item => item.PlayerId == auth.PlayerId));
        Assert.Equal("steam", record.EquippedFactoryAppearanceKey);
        Assert.Contains("factory_appearance", record.ModifierSourcesJson);
    }

    [Fact]
    public async Task AssignCatAsync_UpdatesAuthoritativeBuildingSchedule()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("cat-assignment-device", "FatCat"), CancellationToken.None);

        await service.UnlockCatAsync(auth.PlayerId, new CatUnlockRequest("c_005"), CancellationToken.None);
        await service.UnlockCatAsync(auth.PlayerId, new CatUnlockRequest("c_002"), CancellationToken.None);
        var assigned = await service.AssignCatAsync(auth.PlayerId, "c_001", new CatAssignmentRequest("building_material_2f"), CancellationToken.None);
        var secondAssigned = await service.AssignCatAsync(auth.PlayerId, "c_005", new CatAssignmentRequest("building_material_2f"), CancellationToken.None);
        var overCapacity = await service.AssignCatAsync(auth.PlayerId, "c_002", new CatAssignmentRequest("building_material_2f"), CancellationToken.None);
        var invalidBuilding = await service.AssignCatAsync(auth.PlayerId, "c_001", new CatAssignmentRequest("building_missing"), CancellationToken.None);
        var unassigned = await service.AssignCatAsync(auth.PlayerId, "c_001", new CatAssignmentRequest(""), CancellationToken.None);
        var cats = await service.GetCatsAsync(auth.PlayerId, CancellationToken.None);

        Assert.NotNull(assigned);
        Assert.Equal("c_001", assigned!.CatId);
        Assert.Equal("building_material_2f", assigned.AssignedBuildingId);
        Assert.NotNull(secondAssigned);
        Assert.Equal("building_material_2f", secondAssigned!.AssignedBuildingId);
        Assert.Null(overCapacity);
        Assert.Null(invalidBuilding);
        Assert.NotNull(unassigned);
        Assert.Equal("", unassigned!.AssignedBuildingId);
        var cat = Assert.Single(cats, item => item.CatId == "c_001");
        Assert.Equal("", cat.AssignedBuildingId);
        var saved = Assert.Single(dbContext.CatStates.Where(item => item.PlayerId == auth.PlayerId && item.CatKey == "c_001"));
        Assert.Equal("", saved.AssignedBuildingKey);
    }

    [Fact]
    public async Task UpgradeBuildingAsync_DeductsCoinAndUpdatesAuthoritativeLevel()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("building-upgrade-device", "FatCat"), CancellationToken.None);

        var before = await service.GetBuildingsAsync(auth.PlayerId, CancellationToken.None);
        var upgrade = await service.UpgradeBuildingAsync(auth.PlayerId, "building_cafe_1f", CancellationToken.None);
        var after = await service.GetBuildingsAsync(auth.PlayerId, CancellationToken.None);

        var cafeBefore = Assert.Single(before, building => building.BuildingId == "building_cafe_1f");
        Assert.Equal(6, cafeBefore.Level);
        Assert.Equal(2, cafeBefore.ScheduleCapacity);
        Assert.NotNull(upgrade);
        Assert.Equal("building_cafe_1f", upgrade!.BuildingId);
        Assert.Equal(6, upgrade.PreviousLevel);
        Assert.Equal(7, upgrade.Level);
        Assert.Equal(59481, upgrade.CoinSpent);
        Assert.Equal(12390519, upgrade.CoinBalance);
        var cafeAfter = Assert.Single(after, building => building.BuildingId == "building_cafe_1f");
        Assert.Equal(7, cafeAfter.Level);
        var saved = Assert.Single(dbContext.BuildingStates.Where(item => item.PlayerId == auth.PlayerId && item.BuildingKey == "building_cafe_1f"));
        Assert.Equal(7, saved.Level);
        var transaction = Assert.Single(dbContext.ResourceTransactions.Where(item => item.PlayerId == auth.PlayerId));
        Assert.Equal("building_upgrade", transaction.SourceType);
        Assert.Equal("building_cafe_1f", transaction.SourceKey);
        Assert.Equal(-59481, transaction.CoinDelta);
    }

    [Fact]
    public async Task UpgradeEquipmentAsync_DeductsCoinAndUpdatesEquipmentLevel()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("equipment-upgrade-device", "FatCat"), CancellationToken.None);

        var upgrade = await service.UpgradeEquipmentAsync(auth.PlayerId, "c_001", "equip_cup_lucky", CancellationToken.None);
        var feed = await service.FeedCatAsync(auth.PlayerId, new CatFeedRequest("c_001"), CancellationToken.None);
        var cats = await service.GetCatsAsync(auth.PlayerId, CancellationToken.None);

        Assert.NotNull(upgrade);
        Assert.Equal("c_001", upgrade!.CatId);
        Assert.Equal("equip_cup_lucky", upgrade.ItemId);
        Assert.Equal(1, upgrade.PreviousLevel);
        Assert.Equal(2, upgrade.Level);
        Assert.Equal(5, upgrade.MaxLevel);
        Assert.Equal(90, upgrade.CoinSpent);
        Assert.Equal(12449910, upgrade.CoinBalance);
        Assert.NotNull(feed);
        Assert.Equal(9, feed!.CatFoodSpent);
        var cat = Assert.Single(cats, item => item.CatId == "c_001");
        Assert.Equal(2, cat.EquipmentLevels["equip_cup_lucky"]);
        Assert.Equal(2, dbContext.ResourceTransactions.Count(item => item.PlayerId == auth.PlayerId));
        Assert.Equal(-90, dbContext.ResourceTransactions.Single(item => item.SourceType == "equipment_upgrade").CoinDelta);
    }

    [Fact]
    public async Task UnlockResearchAsync_DeductsResearchPointAndDiscountsCatUpgrade()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("research-device", "FatCat"), CancellationToken.None);
        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        resources!.ResearchPoint = 500;
        await dbContext.SaveChangesAsync();

        var blocked = await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_cheap_upgrade"), CancellationToken.None);
        var basic = await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_basic_prod"), CancellationToken.None);
        var cheap = await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_cheap_upgrade"), CancellationToken.None);
        var upgrade = await service.UpgradeCatAsync(auth.PlayerId, new CatUpgradeRequest("c_001"), CancellationToken.None);
        var research = await service.GetResearchAsync(auth.PlayerId, CancellationToken.None);

        Assert.Null(blocked);
        Assert.NotNull(basic);
        Assert.Equal("res_basic_prod", basic!.ResearchId);
        Assert.Equal(100, basic.ResearchPointSpent);
        Assert.Equal(400, basic.ResearchPointBalance);
        Assert.NotNull(cheap);
        Assert.Equal(200, cheap!.ResearchPointSpent);
        Assert.Equal(200, cheap.ResearchPointBalance);
        Assert.NotNull(upgrade);
        Assert.Equal(95, upgrade!.CoinSpent);
        Assert.Equal(12449905, upgrade.CoinBalance);
        Assert.Contains(research, item => item.ResearchId == "res_basic_prod" && item.IsUnlocked);
        Assert.Contains(research, item => item.ResearchId == "res_cheap_upgrade" && item.IsUnlocked);
        Assert.Contains(research, item => item.ResearchId == "res_bean_save" && !item.IsUnlocked);
        var beanResearch = Assert.Single(research, item => item.ResearchId == "res_bean_save");
        Assert.Equal(150, beanResearch.Cost);
        Assert.Equal("bean_reduce", beanResearch.EffectType);
        Assert.Equal(5, beanResearch.EffectValue);
        Assert.Equal("res_basic_prod", beanResearch.ParentResearchId);
        Assert.Equal(7, research.Count);
        Assert.Equal(3, dbContext.ResourceTransactions.Count(item => item.PlayerId == auth.PlayerId));
        Assert.Equal(-200, dbContext.ResourceTransactions.Single(item => item.SourceKey == "res_cheap_upgrade").ResearchPointDelta);
    }

    [Fact]
    public async Task UnlockResearchAsync_EnforcesParentBeforeSecondTierResearch()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("research-chain-device", "FatCat"), CancellationToken.None);
        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        resources!.ResearchPoint = 500;
        await dbContext.SaveChangesAsync();

        var blockedBean = await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_bean_save"), CancellationToken.None);
        var blockedCheap = await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_cheap_upgrade"), CancellationToken.None);
        var basic = await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_basic_prod"), CancellationToken.None);
        var bean = await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_bean_save"), CancellationToken.None);
        var cheap = await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_cheap_upgrade"), CancellationToken.None);
        var repeatBean = await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_bean_save"), CancellationToken.None);
        var research = await service.GetResearchAsync(auth.PlayerId, CancellationToken.None);

        Assert.Null(blockedBean);
        Assert.Null(blockedCheap);
        Assert.NotNull(basic);
        Assert.NotNull(bean);
        Assert.NotNull(cheap);
        Assert.Null(repeatBean);
        Assert.Equal(100, basic!.ResearchPointSpent);
        Assert.Equal(150, bean!.ResearchPointSpent);
        Assert.Equal(200, cheap!.ResearchPointSpent);
        Assert.Equal(50, cheap.ResearchPointBalance);
        Assert.Contains(research, item => item.ResearchId == "res_basic_prod" && item.IsUnlocked);
        Assert.Contains(research, item => item.ResearchId == "res_bean_save" && item.IsUnlocked);
        Assert.Contains(research, item => item.ResearchId == "res_cheap_upgrade" && item.IsUnlocked);
        Assert.Equal(3, dbContext.ResourceTransactions.Count(item => item.PlayerId == auth.PlayerId));
        Assert.DoesNotContain(dbContext.ResourceTransactions, item => item.SourceKey == "blocked");
    }

    [Fact]
    public async Task UnlockResearchAsync_RequiresEveryBranchBeforeFinalResearch()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("research-final-device", "FatCat"), CancellationToken.None);
        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        resources!.ResearchPoint = 2500;
        await dbContext.SaveChangesAsync();

        Assert.NotNull(await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_basic_prod"), CancellationToken.None));
        Assert.NotNull(await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_bean_save"), CancellationToken.None));
        Assert.NotNull(await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_cheap_upgrade"), CancellationToken.None));
        Assert.NotNull(await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_extract_2"), CancellationToken.None));
        Assert.NotNull(await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_roast_2"), CancellationToken.None));

        var blockedFinal = await service.UnlockResearchAsync(
            auth.PlayerId,
            new ResearchUnlockRequest("res_espresso"),
            CancellationToken.None);
        var ferment = await service.UnlockResearchAsync(
            auth.PlayerId,
            new ResearchUnlockRequest("res_ferment_2"),
            CancellationToken.None);
        var final = await service.UnlockResearchAsync(
            auth.PlayerId,
            new ResearchUnlockRequest("res_espresso"),
            CancellationToken.None);
        var upgrade = await service.UpgradeCatAsync(
            auth.PlayerId,
            new CatUpgradeRequest("c_001"),
            CancellationToken.None);
        var research = await service.GetResearchAsync(auth.PlayerId, CancellationToken.None);

        Assert.Null(blockedFinal);
        Assert.NotNull(ferment);
        Assert.NotNull(final);
        Assert.Equal(500, final!.ResearchPointSpent);
        Assert.Equal(575, final.ResearchPointBalance);
        Assert.NotNull(upgrade);
        Assert.Equal(90, upgrade!.CoinSpent);
        Assert.Equal(7, research.Count);
        Assert.All(research, item => Assert.True(item.IsUnlocked));
        var finalState = Assert.Single(research, item => item.ResearchId == "res_espresso");
        Assert.Equal(
            ["res_extract_2", "res_roast_2", "res_ferment_2"],
            finalState.ParentResearchIds);
        Assert.Equal(8, dbContext.ResourceTransactions.Count(item => item.PlayerId == auth.PlayerId));
        Assert.Equal(
            -500,
            dbContext.ResourceTransactions.Single(item => item.SourceKey == "res_espresso").ResearchPointDelta);
    }

    [Fact]
    public async Task UpgradeResearchAsync_UsesGrowingCostAndScaledEconomyEffect()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("research-level-device", "FatCat"), CancellationToken.None);
        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        resources!.ResearchPoint = 2000;
        await dbContext.SaveChangesAsync();

        var root = await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_basic_prod"), CancellationToken.None);
        var first = await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_cheap_upgrade"), CancellationToken.None);
        var second = await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_cheap_upgrade"), CancellationToken.None);
        var upgrade = await service.UpgradeCatAsync(auth.PlayerId, new CatUpgradeRequest("c_001"), CancellationToken.None);
        var snapshot = await service.GetResearchAsync(auth.PlayerId, CancellationToken.None);

        Assert.NotNull(root);
        Assert.Equal(1, root!.Level);
        Assert.NotNull(first);
        Assert.Equal(0, first!.PreviousLevel);
        Assert.Equal(1, first.Level);
        Assert.Equal(200, first.ResearchPointSpent);
        Assert.Equal(5, first.CurrentEffectValue);
        Assert.Equal(6, first.NextEffectValue);
        Assert.NotNull(second);
        Assert.Equal(1, second!.PreviousLevel);
        Assert.Equal(2, second.Level);
        Assert.Equal(270, second.ResearchPointSpent);
        Assert.Equal(6, second.CurrentEffectValue);
        Assert.Equal(7, second.NextEffectValue);
        Assert.NotNull(upgrade);
        Assert.Equal(94, upgrade!.CoinSpent);
        var cheap = Assert.Single(snapshot, item => item.ResearchId == "res_cheap_upgrade");
        Assert.Equal(2, cheap.Level);
        Assert.Equal(10, cheap.MaxLevel);
        Assert.Equal(364, cheap.NextCost);
        Assert.Equal(6, cheap.CurrentEffectValue);
        Assert.Equal(7, cheap.NextEffectValue);
        Assert.Equal(
            "research_upgrade",
            dbContext.ResourceTransactions.Single(item => item.SourceKey == "res_cheap_upgrade" && item.ResearchPointDelta == -270).SourceType);
    }

    [Fact]
    public async Task UpgradeResearchAsync_StopsAtConfiguredMaxLevel()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("research-max-device", "FatCat"), CancellationToken.None);
        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        resources!.ResearchPoint = 6000;
        await dbContext.SaveChangesAsync();

        ResearchUnlockResponse? latest = null;
        for (var level = 1; level <= 10; level++)
        {
            latest = await service.UnlockResearchAsync(
                auth.PlayerId,
                new ResearchUnlockRequest("res_basic_prod"),
                CancellationToken.None);
            Assert.NotNull(latest);
            Assert.Equal(level, latest!.Level);
        }
        var blocked = await service.UnlockResearchAsync(
            auth.PlayerId,
            new ResearchUnlockRequest("res_basic_prod"),
            CancellationToken.None);
        var snapshot = await service.GetResearchAsync(auth.PlayerId, CancellationToken.None);

        Assert.Null(blocked);
        Assert.NotNull(latest);
        Assert.Equal(10, latest!.Level);
        Assert.Equal(10, latest.MaxLevel);
        Assert.Equal(1489, latest.ResearchPointSpent);
        Assert.Equal(19, latest.CurrentEffectValue);
        Assert.Equal(19, latest.NextEffectValue);
        Assert.Equal(543, latest.ResearchPointBalance);
        var root = Assert.Single(snapshot, item => item.ResearchId == "res_basic_prod");
        Assert.Equal(10, root.Level);
        Assert.Equal(0, root.NextCost);
        Assert.Equal(19, root.CurrentEffectValue);
        Assert.Equal(10, dbContext.ResourceTransactions.Count(item => item.SourceKey == "res_basic_prod"));
    }

    [Fact]
    public async Task FriendAndSettingsState_CanBeUpdated()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("friend-device", "FatCat"), CancellationToken.None);

        var visited = await service.VisitFriendAsync(auth.PlayerId, "mocha", CancellationToken.None);
        var gifted = await service.SendFriendGiftAsync(auth.PlayerId, "mocha", CancellationToken.None);
        var settings = await service.UpdateSettingsAsync(auth.PlayerId, new SettingsDto(new Dictionary<string, bool>
        {
            ["music"] = false,
            ["sync"] = true,
        }), CancellationToken.None);

        Assert.NotNull(visited?.Friend.LastVisitedAt);
        Assert.True(visited!.Friend.Rooms.Count >= 3);
        Assert.Contains(visited.Friend.Rooms, room => room.Floor == "5F" && room.ProductionPerSecond >= 0);
        Assert.Contains(visited.Friend.Rooms, room => room.AssignedCatCount >= 0 && !string.IsNullOrWhiteSpace(room.FeaturedCatName) && room.DecorScore >= 0);
        Assert.All(visited.Friend.Rooms, room =>
        {
            Assert.Equal(2, room.Decorations.Count);
            Assert.Equal(room.Decorations.Sum(decor => decor.Score), room.DecorScore);
            Assert.All(room.Decorations, decor => Assert.True(decor.IsPlaced));
        });
        Assert.Equal(12, dbContext.DecorStates.Count(item => item.PlayerId == auth.PlayerId));
        Assert.NotNull(gifted?.Friend.LastGiftAt);
        Assert.False(settings!.Settings["music"]);
        Assert.True(settings.Settings["sync"]);
    }

    [Fact]
    public async Task FriendActions_RewardResourcesOncePerDay()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("friend-reward-device", "FatCat"), CancellationToken.None);

        var visit = await service.VisitFriendAsync(auth.PlayerId, "mocha", CancellationToken.None);
        var repeatVisit = await service.VisitFriendAsync(auth.PlayerId, "mocha", CancellationToken.None);
        var gift = await service.SendFriendGiftAsync(auth.PlayerId, "mocha", CancellationToken.None);
        var repeatGift = await service.SendFriendGiftAsync(auth.PlayerId, "mocha", CancellationToken.None);

        Assert.NotNull(visit);
        Assert.True(visit!.Rewarded);
        Assert.Equal(520, visit.RewardCoin);
        Assert.Equal(12450520, visit.CoinBalance);
        Assert.NotNull(repeatVisit);
        Assert.False(repeatVisit!.Rewarded);
        Assert.Equal("daily_visit_claimed", repeatVisit.LimitedReason);
        Assert.Equal(12450520, repeatVisit.CoinBalance);
        Assert.NotNull(gift);
        Assert.True(gift!.Rewarded);
        Assert.Equal(12, gift.RewardCatFood);
        Assert.Equal(3522, gift.CatFoodBalance);
        Assert.NotNull(repeatGift);
        Assert.False(repeatGift!.Rewarded);
        Assert.Equal("daily_gift_claimed", repeatGift.LimitedReason);
        Assert.Equal(3522, repeatGift.CatFoodBalance);
        Assert.Equal(2, dbContext.ResourceTransactions.Count(item => item.PlayerId == auth.PlayerId));
    }

    [Fact]
    public async Task GetLeaderboardAsync_ReturnsIncomeRankingWithSelfEntry()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("leaderboard-device", "FatCat"), CancellationToken.None);

        var leaderboard = await service.GetLeaderboardAsync(auth.PlayerId, "income", CancellationToken.None);

        Assert.NotNull(leaderboard);
        Assert.Equal("income", leaderboard!.BoardId);
        Assert.Equal(4, leaderboard.Entries.Count);
        Assert.Equal([1, 2, 3, 4], leaderboard.Entries.Select(entry => entry.Rank).ToArray());
        Assert.Single(leaderboard.Entries, entry => entry.IsSelf);
        Assert.NotNull(leaderboard.Self);
        Assert.True(leaderboard.Self!.Score > 0);
        Assert.Equal("cocoa", leaderboard.Entries[0].PlayerId);
        Assert.Equal(680, leaderboard.Entries[0].Score);
    }

    [Fact]
    public async Task AddFriendAsync_CreatesRealPlayerFriendSnapshot()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var player = await service.AuthGuestAsync(new AuthGuestRequest("real-friend-a", "Alpha Cafe"), CancellationToken.None);
        var target = await service.AuthGuestAsync(new AuthGuestRequest("real-friend-b", "Beta Beans"), CancellationToken.None);

        var added = await service.AddFriendAsync(player.PlayerId, new AddFriendRequest(target.PlayerId.ToString("N")), CancellationToken.None);
        var duplicate = await service.AddFriendAsync(player.PlayerId, new AddFriendRequest(target.PlayerId.ToString()), CancellationToken.None);
        var self = await service.AddFriendAsync(player.PlayerId, new AddFriendRequest(player.PlayerId.ToString("N")), CancellationToken.None);
        var friends = await service.GetFriendsAsync(player.PlayerId, CancellationToken.None);
        var leaderboard = await service.GetLeaderboardAsync(player.PlayerId, "income", CancellationToken.None);

        Assert.NotNull(added);
        Assert.Equal($"player:{target.PlayerId:N}", added!.Id);
        Assert.Equal("Beta Beans", added.Name);
        Assert.True(added.IncomePerSecond > 0);
        Assert.True(added.Profile.IsRealPlayer);
        Assert.Equal("online", added.Profile.PresenceStatus);
        Assert.Equal(target.PlayerId.ToString("N"), added.Profile.PlayerId);
        Assert.StartsWith("FC", added.Profile.InviteCode);
        Assert.NotNull(added.Profile.LastActiveAt);
        Assert.True(added.Profile.UnlockedCatCount > 0);
        Assert.True(added.Profile.TotalBuildingLevel > 0);
        Assert.All(added.Rooms, room =>
        {
            Assert.Equal(2, room.Decorations.Count);
            Assert.Equal(room.Decorations.Sum(decor => decor.Score), room.DecorScore);
        });
        Assert.Equal(12, dbContext.DecorStates.Count(item => item.PlayerId == target.PlayerId));
        Assert.NotNull(duplicate);
        Assert.Null(self);
        Assert.Equal(4, friends.Count);
        Assert.Single(friends, friend => friend.Id == $"player:{target.PlayerId:N}");
        Assert.All(friends.Where(friend => !friend.Profile.IsRealPlayer), friend => Assert.Null(friend.Profile.PlayerId));
        Assert.NotNull(leaderboard);
        Assert.Contains(leaderboard!.Entries, entry => entry.PlayerId == $"player:{target.PlayerId:N}");
    }

    [Fact]
    public async Task GetFriendAsync_RefreshesOneRealPlayerSnapshot()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var player = await service.AuthGuestAsync(new AuthGuestRequest("refresh-friend-a", "Alpha Cafe"), CancellationToken.None);
        var target = await service.AuthGuestAsync(new AuthGuestRequest("refresh-friend-b", "Beta Beans"), CancellationToken.None);
        var friendKey = $"player:{target.PlayerId:N}";

        var added = await service.AddFriendAsync(
            player.PlayerId,
            new AddFriendRequest(target.PlayerId.ToString("N")),
            CancellationToken.None);
        var targetPlayer = await dbContext.Players.SingleAsync(item => item.Id == target.PlayerId);
        targetPlayer.CompanyName = "Beta Roastery";
        targetPlayer.Level = 9;
        targetPlayer.UpdatedAt = DateTimeOffset.UtcNow.AddMinutes(-10);
        var hiddenDecor = await dbContext.DecorStates.SingleAsync(item =>
            item.PlayerId == target.PlayerId && item.DecorKey == "decor_cafe_sign");
        hiddenDecor.IsPlaced = false;
        await dbContext.SaveChangesAsync();

        var refreshed = await service.GetFriendAsync(player.PlayerId, friendKey, CancellationToken.None);
        var presence = await service.TouchPresenceAsync(target.PlayerId, CancellationToken.None);
        var online = await service.GetFriendAsync(player.PlayerId, friendKey, CancellationToken.None);
        var missing = await service.GetFriendAsync(player.PlayerId, "missing-friend", CancellationToken.None);

        Assert.NotNull(added);
        Assert.NotNull(refreshed);
        Assert.Equal(friendKey, refreshed!.Id);
        Assert.Equal("Beta Roastery", refreshed.Name);
        Assert.Equal(9, refreshed.Level);
        Assert.True(refreshed.Profile.IsRealPlayer);
        Assert.Equal("recent", refreshed.Profile.PresenceStatus);
        var cafeRoom = Assert.Single(refreshed.Rooms, room => room.BuildingId == "building_cafe_1f");
        Assert.Single(cafeRoom.Decorations);
        Assert.Equal("decor_cafe_cup", cafeRoom.Decorations[0].DecorId);
        Assert.Equal(34, cafeRoom.DecorScore);
        Assert.NotNull(presence);
        Assert.Equal("online", presence!.Status);
        Assert.True(presence.LastActiveAt > refreshed.Profile.LastActiveAt);
        Assert.NotNull(online);
        Assert.Equal("online", online!.Profile.PresenceStatus);
        Assert.Equal(presence.LastActiveAt, online.Profile.LastActiveAt);
        Assert.Null(missing);
    }

    [Fact]
    public async Task AuthGuestAsync_RefreshesReturningPlayerPresence()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var first = await service.AuthGuestAsync(new AuthGuestRequest("presence-login", "Presence Cafe"), CancellationToken.None);
        var player = await dbContext.Players.SingleAsync(item => item.Id == first.PlayerId);
        player.UpdatedAt = DateTimeOffset.UtcNow.AddHours(-2);
        await dbContext.SaveChangesAsync();
        var staleAt = player.UpdatedAt;

        var returning = await service.AuthGuestAsync(new AuthGuestRequest("presence-login", "Ignored Rename"), CancellationToken.None);

        Assert.False(returning.IsNewPlayer);
        Assert.True(player.UpdatedAt > staleAt);
    }

    [Fact]
    public async Task GetFriendsAsync_FillsMissingDefaultRowsWhenAnotherFriendExists()
    {
        await using var dbContext = CreateDbContext();
        var repository = new EfFatCatRepository(dbContext);
        var service = new FatCatGameService(repository);
        var player = await service.AuthGuestAsync(new AuthGuestRequest("partial-friends", "Partial Cafe"), CancellationToken.None);
        await repository.AddFriendAsync(new FatCat.Domain.FriendSnapshot
        {
            PlayerId = player.PlayerId,
            FriendKey = "custom-preview",
            Name = "Custom Preview",
            Level = 3,
            IncomePerSecond = 90,
        }, CancellationToken.None);
        await repository.SaveChangesAsync(CancellationToken.None);

        var friends = await service.GetFriendsAsync(player.PlayerId, CancellationToken.None);

        Assert.Equal(4, friends.Count);
        Assert.Contains(friends, friend => friend.Id == "custom-preview");
        Assert.Contains(friends, friend => friend.Id == "mocha");
        Assert.Contains(friends, friend => friend.Id == "latte");
        Assert.Contains(friends, friend => friend.Id == "cocoa");
    }

    [Fact]
    public async Task DecorPlacement_UpdatesOwnerInventoryAndFriendSnapshot()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var owner = await service.AuthGuestAsync(new AuthGuestRequest("decor-owner", "Decor Cafe"), CancellationToken.None);
        var visitor = await service.AuthGuestAsync(new AuthGuestRequest("decor-visitor", "Visitor Cafe"), CancellationToken.None);
        var added = await service.AddFriendAsync(
            visitor.PlayerId,
            new AddFriendRequest(owner.PlayerId.ToString("N")),
            CancellationToken.None);

        var initial = await service.GetDecorationsAsync(owner.PlayerId, CancellationToken.None);
        var removed = await service.UpdateDecorPlacementAsync(
            owner.PlayerId,
            "decor_cafe_sign",
            new DecorPlacementRequest("building_cafe_1f", false),
            CancellationToken.None);
        var moved = await service.UpdateDecorPlacementAsync(
            owner.PlayerId,
            "decor_cafe_sign",
            new DecorPlacementRequest("building_office_5f", true),
            CancellationToken.None);
        var invalid = await service.UpdateDecorPlacementAsync(
            owner.PlayerId,
            "decor_cafe_sign",
            new DecorPlacementRequest("missing-building", true),
            CancellationToken.None);
        var refreshed = await service.GetFriendAsync(visitor.PlayerId, added!.Id, CancellationToken.None);

        Assert.NotNull(initial);
        Assert.Equal(12, initial!.Count);
        Assert.NotNull(removed);
        Assert.False(removed!.IsPlaced);
        Assert.NotNull(moved);
        Assert.True(moved!.IsPlaced);
        Assert.Equal("building_office_5f", moved.BuildingId);
        Assert.Null(invalid);
        Assert.NotNull(refreshed);
        var cafe = Assert.Single(refreshed!.Rooms, room => room.BuildingId == "building_cafe_1f");
        var office = Assert.Single(refreshed.Rooms, room => room.BuildingId == "building_office_5f");
        Assert.DoesNotContain(cafe.Decorations, decor => decor.DecorId == "decor_cafe_sign");
        Assert.Contains(office.Decorations, decor => decor.DecorId == "decor_cafe_sign");
        Assert.Equal(100, office.DecorScore);
    }

    [Fact]
    public async Task SocialProfileAndFriendSearch_SupportInviteCodes()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var player = await service.AuthGuestAsync(new AuthGuestRequest("invite-friend-a", "Alpha Cafe"), CancellationToken.None);
        var target = await service.AuthGuestAsync(new AuthGuestRequest("invite-friend-b", "Beta Beans"), CancellationToken.None);

        var profile = await service.GetSocialProfileAsync(target.PlayerId, CancellationToken.None);
        var searchBefore = await service.SearchFriendAsync(player.PlayerId, profile!.InviteCode, CancellationToken.None);
        var added = await service.AddFriendAsync(player.PlayerId, new AddFriendRequest("", profile.InviteCode), CancellationToken.None);
        var searchAfter = await service.SearchFriendAsync(player.PlayerId, profile.InviteCode.ToLowerInvariant(), CancellationToken.None);
        var selfSearch = await service.SearchFriendAsync(player.PlayerId, $"FC{player.PlayerId:N}", CancellationToken.None);

        Assert.NotNull(profile);
        Assert.Equal(target.PlayerId.ToString("N"), profile.PlayerId);
        Assert.StartsWith("FC", profile.InviteCode);
        Assert.True(profile.InviteCode.Length is >= 10 and <= 20);
        Assert.NotNull(searchBefore);
        Assert.Equal("Beta Beans", searchBefore!.CompanyName);
        Assert.False(searchBefore.IsFriend);
        Assert.NotNull(added);
        Assert.Equal($"player:{target.PlayerId:N}", added!.Id);
        Assert.NotNull(searchAfter);
        Assert.True(searchAfter!.IsFriend);
        Assert.NotNull(selfSearch);
        Assert.True(selfSearch!.IsSelf);
        Assert.Equal(2, dbContext.InviteCodes.Count());
        Assert.Single(dbContext.FriendRelations.Where(item => item.PlayerId == player.PlayerId && item.FriendPlayerId == target.PlayerId));
    }

    [Fact]
    public async Task FriendRequests_CanBeAcceptedIntoBidirectionalRelations()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var player = await service.AuthGuestAsync(new AuthGuestRequest("request-friend-a", "Alpha Cafe"), CancellationToken.None);
        var target = await service.AuthGuestAsync(new AuthGuestRequest("request-friend-b", "Beta Beans"), CancellationToken.None);
        var targetProfile = await service.GetSocialProfileAsync(target.PlayerId, CancellationToken.None);

        var request = await service.CreateFriendRequestAsync(player.PlayerId, new CreateFriendRequestRequest("", targetProfile!.InviteCode), CancellationToken.None);
        var received = await service.GetFriendRequestsAsync(target.PlayerId, "received", CancellationToken.None);
        var sent = await service.GetFriendRequestsAsync(player.PlayerId, "sent", CancellationToken.None);
        var accepted = await service.AcceptFriendRequestAsync(target.PlayerId, Guid.Parse(request!.Id), CancellationToken.None);
        var playerFriends = await service.GetFriendsAsync(player.PlayerId, CancellationToken.None);
        var targetFriends = await service.GetFriendsAsync(target.PlayerId, CancellationToken.None);

        Assert.NotNull(request);
        Assert.Equal("pending", request!.Status);
        Assert.Equal("sent", request.Direction);
        Assert.Single(received!);
        Assert.Single(sent!);
        Assert.Equal("received", received![0].Direction);
        Assert.NotNull(accepted);
        Assert.Equal("accepted", accepted!.Status);
        Assert.Contains(playerFriends, friend => friend.Id == $"player:{target.PlayerId:N}");
        Assert.Contains(targetFriends, friend => friend.Id == $"player:{player.PlayerId:N}");
        Assert.Equal(2, dbContext.FriendRelations.Count(item =>
            (item.PlayerId == player.PlayerId && item.FriendPlayerId == target.PlayerId)
            || (item.PlayerId == target.PlayerId && item.FriendPlayerId == player.PlayerId)));
        Assert.Single(dbContext.FriendRequests.Where(item => item.RequesterPlayerId == player.PlayerId && item.TargetPlayerId == target.PlayerId && item.Status == "accepted"));
    }

    [Fact]
    public async Task FriendRequests_CanBeRejected()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var player = await service.AuthGuestAsync(new AuthGuestRequest("reject-friend-a", "Alpha Cafe"), CancellationToken.None);
        var target = await service.AuthGuestAsync(new AuthGuestRequest("reject-friend-b", "Beta Beans"), CancellationToken.None);

        var request = await service.CreateFriendRequestAsync(player.PlayerId, new CreateFriendRequestRequest(target.PlayerId.ToString("N")), CancellationToken.None);
        var rejected = await service.RejectFriendRequestAsync(target.PlayerId, Guid.Parse(request!.Id), CancellationToken.None);
        var friends = await service.GetFriendsAsync(player.PlayerId, CancellationToken.None);

        Assert.NotNull(rejected);
        Assert.Equal("rejected", rejected!.Status);
        Assert.DoesNotContain(friends, friend => friend.Id == $"player:{target.PlayerId:N}");
        Assert.Empty(dbContext.FriendRelations.Where(item => item.PlayerId == player.PlayerId && item.FriendPlayerId == target.PlayerId));
    }

    [Fact]
    public async Task FriendActions_WriteRecentSocialActivities()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var player = await service.AuthGuestAsync(new AuthGuestRequest("activity-friend-a", "Alpha Cafe"), CancellationToken.None);
        var target = await service.AuthGuestAsync(new AuthGuestRequest("activity-friend-b", "Beta Beans"), CancellationToken.None);

        var added = await service.AddFriendAsync(player.PlayerId, new AddFriendRequest(target.PlayerId.ToString("N")), CancellationToken.None);
        Assert.NotNull(added);
        await service.VisitFriendAsync(player.PlayerId, added!.Id, CancellationToken.None);
        await service.SendFriendGiftAsync(player.PlayerId, added.Id, CancellationToken.None);

        var activities = await service.GetFriendActivitiesAsync(player.PlayerId, 10, CancellationToken.None);

        Assert.NotNull(activities);
        Assert.Equal(3, activities!.Count);
        Assert.Equal("friend_gift", activities[0].ActivityType);
        Assert.Equal("friend_visit", activities[1].ActivityType);
        Assert.Equal("friend_add", activities[2].ActivityType);
        Assert.All(activities, activity =>
        {
            Assert.Equal(added.Id, activity.FriendId);
            Assert.Equal("Beta Beans", activity.FriendName);
            Assert.True(activity.CreatedAt > 0);
        });
    }

    [Fact]
    public async Task FriendActions_PublishRealtimeEventsToTargetPlayer()
    {
        await using var dbContext = CreateDbContext();
        var broker = new SocialEventBroker();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext), null, broker);
        var actor = await service.AuthGuestAsync(new AuthGuestRequest("realtime-actor", "Actor Roastery"), CancellationToken.None);
        var target = await service.AuthGuestAsync(new AuthGuestRequest("realtime-target", "Target Cafe"), CancellationToken.None);
        var friend = await service.AddFriendAsync(
            actor.PlayerId,
            new AddFriendRequest(target.PlayerId.ToString("N")),
            CancellationToken.None);
        using var subscription = broker.Subscribe(target.PlayerId);

        await service.VisitFriendAsync(actor.PlayerId, friend!.Id, CancellationToken.None);
        await service.SendFriendGiftAsync(actor.PlayerId, friend.Id, CancellationToken.None);
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(2));
        Assert.True(await subscription.Reader.WaitToReadAsync(timeout.Token));
        Assert.True(subscription.Reader.TryRead(out var visitEvent));
        Assert.True(subscription.Reader.TryRead(out var giftEvent));

        Assert.Equal("friend_visit", visitEvent.EventType);
        Assert.Equal("friend_gift", giftEvent.EventType);
        Assert.Equal(actor.PlayerId.ToString("N"), visitEvent.ActorPlayerId);
        Assert.Equal("Actor Roastery", visitEvent.ActorCompanyName);
        Assert.True(visitEvent.RewardValue > 0);
        Assert.Equal(12, giftEvent.RewardValue);
        Assert.True(visitEvent.CreatedAt > 0);
        var targetActivities = await service.GetFriendActivitiesAsync(target.PlayerId, 10, CancellationToken.None);
        Assert.NotNull(targetActivities);
        Assert.Equal(["friend_gift_received", "friend_visited_by"], targetActivities!.Select(item => item.ActivityType).ToArray());
        Assert.All(targetActivities, item => Assert.Equal("Actor Roastery", item.FriendName));
    }

    [Fact]
    public async Task FriendHelp_AppliesPersistentProductionBoostOncePerDay()
    {
        await using var dbContext = CreateDbContext();
        var broker = new SocialEventBroker();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext), null, broker);
        var actor = await service.AuthGuestAsync(new AuthGuestRequest("help-actor", "Helper Roastery"), CancellationToken.None);
        var target = await service.AuthGuestAsync(new AuthGuestRequest("help-target", "Boosted Cafe"), CancellationToken.None);
        var friend = await service.AddFriendAsync(
            actor.PlayerId,
            new AddFriendRequest(target.PlayerId.ToString("N")),
            CancellationToken.None);
        var before = await service.PreviewServerProductionAsync(target.PlayerId, CancellationToken.None);
        using var subscription = broker.Subscribe(target.PlayerId);

        var helped = await service.HelpFriendAsync(actor.PlayerId, friend!.Id, CancellationToken.None);
        var repeated = await service.HelpFriendAsync(actor.PlayerId, friend.Id, CancellationToken.None);
        var boost = await service.GetFriendBoostAsync(target.PlayerId, CancellationToken.None);
        var after = await service.PreviewServerProductionAsync(target.PlayerId, CancellationToken.None);
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(2));
        Assert.True(await subscription.Reader.WaitToReadAsync(timeout.Token));
        Assert.True(subscription.Reader.TryRead(out var realtimeEvent));

        Assert.True(helped!.Applied);
        Assert.Equal(10, helped.Boost.BoostPercent);
        Assert.True(helped.Boost.BoostEndsAt > helped.Boost.ServerTime);
        Assert.NotNull(helped.Friend.LastHelpAt);
        Assert.False(repeated!.Applied);
        Assert.Equal("daily_help_claimed", repeated.LimitedReason);
        Assert.True(boost!.Active);
        Assert.Equal("Helper Roastery", boost.BoostedByName);
        Assert.Equal(before!.GrossCoinPerSecond * 1.1, after!.GrossCoinPerSecond, 6);
        Assert.Equal("friend_help", realtimeEvent.EventType);
        Assert.Equal(10, realtimeEvent.BoostPercent);
        Assert.Equal(helped.Boost.BoostEndsAt, realtimeEvent.BoostEndsAt);
        var targetActivities = await service.GetFriendActivitiesAsync(target.PlayerId, 10, CancellationToken.None);
        Assert.Equal("friend_help_received", targetActivities![0].ActivityType);
    }

    [Fact]
    public async Task FriendBoostHistory_TracksSourcesExtendsStackAndPreservesExpiredEntries()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var target = await service.AuthGuestAsync(new AuthGuestRequest("boost-history-target", "History Cafe"), CancellationToken.None);
        var helpers = new[]
        {
            await service.AuthGuestAsync(new AuthGuestRequest("boost-history-a", "Maple Beans"), CancellationToken.None),
            await service.AuthGuestAsync(new AuthGuestRequest("boost-history-b", "Sunny Roast"), CancellationToken.None),
            await service.AuthGuestAsync(new AuthGuestRequest("boost-history-c", "Moon Cafe"), CancellationToken.None),
            await service.AuthGuestAsync(new AuthGuestRequest("boost-history-d", "Cloud Coffee"), CancellationToken.None),
        };

        foreach (var helper in helpers)
        {
            var friend = await service.AddFriendAsync(
                helper.PlayerId,
                new AddFriendRequest(target.PlayerId.ToString("N")),
                CancellationToken.None);
            Assert.True((await service.HelpFriendAsync(helper.PlayerId, friend!.Id, CancellationToken.None))!.Applied);
        }
        var active = await service.GetFriendBoostHistoryAsync(target.PlayerId, CancellationToken.None);

        Assert.NotNull(active);
        Assert.Equal(30, active!.ActiveBoostPercent);
        Assert.Equal(30, active.MaxBoostPercent);
        Assert.Equal(4, active.ActiveContributionCount);
        Assert.Equal(4, active.Entries.Count);
        Assert.All(active.Entries, entry =>
        {
            Assert.True(entry.Active);
            Assert.Equal(10, entry.BoostPercent);
            Assert.True(entry.ExpiresAt > entry.CreatedAt);
        });
        Assert.Single(active.Entries.Select(entry => entry.ExpiresAt).Distinct());
        Assert.Equal(
            ["Cloud Coffee", "Moon Cafe", "Sunny Roast", "Maple Beans"],
            active.Entries.Select(entry => entry.SourceName).ToArray());

        var player = await dbContext.Players.FindAsync([target.PlayerId], CancellationToken.None);
        player!.FriendBoostUntil = DateTimeOffset.UtcNow.AddMinutes(-1);
        foreach (var contribution in dbContext.FriendBoostContributions.Where(item => item.PlayerId == target.PlayerId))
        {
            contribution.ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(-1);
        }
        await dbContext.SaveChangesAsync();
        var expired = await service.GetFriendBoostHistoryAsync(target.PlayerId, CancellationToken.None);

        Assert.Equal(0, expired!.ActiveBoostPercent);
        Assert.Equal(0, expired.ActiveContributionCount);
        Assert.All(expired.Entries, entry => Assert.False(entry.Active));
    }

    [Fact]
    public async Task FriendCoopGoal_AccumulatesUniqueHelpersAndClaimsOnce()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var target = await service.AuthGuestAsync(new AuthGuestRequest("coop-target", "Coop Cafe"), CancellationToken.None);
        var helpers = new[]
        {
            await service.AuthGuestAsync(new AuthGuestRequest("coop-helper-a", "Helper A"), CancellationToken.None),
            await service.AuthGuestAsync(new AuthGuestRequest("coop-helper-b", "Helper B"), CancellationToken.None),
            await service.AuthGuestAsync(new AuthGuestRequest("coop-helper-c", "Helper C"), CancellationToken.None),
        };

        foreach (var helper in helpers)
        {
            var friend = await service.AddFriendAsync(
                helper.PlayerId,
                new AddFriendRequest(target.PlayerId.ToString("N")),
                CancellationToken.None);
            var result = await service.HelpFriendAsync(helper.PlayerId, friend!.Id, CancellationToken.None);
            Assert.True(result!.Applied);
        }

        var ready = await service.GetFriendCoopGoalAsync(target.PlayerId, CancellationToken.None);
        var claimed = await service.ClaimFriendCoopGoalAsync(target.PlayerId, CancellationToken.None);
        var repeated = await service.ClaimFriendCoopGoalAsync(target.PlayerId, CancellationToken.None);

        Assert.Equal(3, ready!.Progress);
        Assert.True(ready.Claimable);
        Assert.True(claimed!.Claimed);
        Assert.Equal(30, claimed.RewardDiamond);
        Assert.Equal(2610, claimed.DiamondBalance);
        Assert.True(claimed.Goal.Claimed);
        Assert.False(repeated!.Claimed);
        Assert.Equal("already_claimed", repeated.LimitedReason);
        var transaction = Assert.Single(dbContext.ResourceTransactions.Where(item =>
            item.PlayerId == target.PlayerId && item.SourceType == "friend_coop_goal"));
        Assert.Equal(30, transaction.DiamondDelta);
    }

    [Fact]
    public async Task FriendCoopTiers_UnlockAndGrantThreeResourceRewardsOnce()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var target = await service.AuthGuestAsync(new AuthGuestRequest("coop-tier-target", "Tier Cafe"), CancellationToken.None);
        var helpers = new[]
        {
            await service.AuthGuestAsync(new AuthGuestRequest("coop-tier-a", "Tier Helper A"), CancellationToken.None),
            await service.AuthGuestAsync(new AuthGuestRequest("coop-tier-b", "Tier Helper B"), CancellationToken.None),
            await service.AuthGuestAsync(new AuthGuestRequest("coop-tier-c", "Tier Helper C"), CancellationToken.None),
        };

        FriendCoopTierClaimResponse? first = null;
        FriendCoopTierClaimResponse? second = null;
        FriendCoopTierClaimResponse? third = null;
        for (var index = 0; index < helpers.Length; index++)
        {
            var helper = helpers[index];
            var friend = await service.AddFriendAsync(
                helper.PlayerId,
                new AddFriendRequest(target.PlayerId.ToString("N")),
                CancellationToken.None);
            Assert.True((await service.HelpFriendAsync(helper.PlayerId, friend!.Id, CancellationToken.None))!.Applied);
            var tierId = $"assist_{index + 1}";
            var claim = await service.ClaimFriendCoopTierAsync(target.PlayerId, tierId, CancellationToken.None);
            Assert.True(claim!.Claimed);
            if (index == 0) first = claim;
            if (index == 1) second = claim;
            if (index == 2) third = claim;
            Assert.False((await service.ClaimFriendCoopTierAsync(target.PlayerId, tierId, CancellationToken.None))!.Claimed);
        }

        Assert.Equal("coin", first!.RewardType);
        Assert.Equal(5_000, first.RewardAmount);
        Assert.Equal(12_455_000, first.CoinBalance);
        Assert.Equal("researchPoint", second!.RewardType);
        Assert.Equal(20, second.RewardAmount);
        Assert.Equal(220, second.ResearchPointBalance);
        Assert.Equal("diamond", third!.RewardType);
        Assert.Equal(30, third.RewardAmount);
        Assert.Equal(2610, third.DiamondBalance);
        Assert.All(third.Goal.Tiers, tier => Assert.True(tier.Claimed));

        var state = await dbContext.CoopGoalStates.FindAsync([target.PlayerId], CancellationToken.None);
        Assert.Equal(7, state!.ClaimedTierMask);
        Assert.True(state.IsClaimed);
        var transactions = dbContext.ResourceTransactions
            .Where(item => item.PlayerId == target.PlayerId && item.SourceType == "friend_coop_tier")
            .ToArray();
        Assert.Equal(3, transactions.Length);
        Assert.Equal(5_000, Assert.Single(transactions, item => item.SourceKey.EndsWith("assist_1")).CoinDelta);
        Assert.Equal(20, Assert.Single(transactions, item => item.SourceKey.EndsWith("assist_2")).ResearchPointDelta);
        Assert.Equal(30, Assert.Single(transactions, item => item.SourceKey.EndsWith("assist_3")).DiamondDelta);
    }

    [Fact]
    public async Task FriendCoopTiers_RecognizeLegacyFinalClaim()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var target = await service.AuthGuestAsync(new AuthGuestRequest("coop-tier-legacy", "Legacy Cafe"), CancellationToken.None);
        dbContext.CoopGoalStates.Add(new PlayerCoopGoalState
        {
            PlayerId = target.PlayerId,
            GoalDate = int.Parse(DateTime.UtcNow.ToString("yyyyMMdd")),
            Progress = 3,
            IsClaimed = true,
            ClaimedTierMask = 0,
        });
        await dbContext.SaveChangesAsync();

        var goal = await service.GetFriendCoopGoalAsync(target.PlayerId, CancellationToken.None);

        Assert.False(goal!.Claimable);
        Assert.True(goal.Claimed);
        Assert.False(goal.Tiers[0].Claimed);
        Assert.False(goal.Tiers[1].Claimed);
        Assert.True(goal.Tiers[2].Claimed);
    }

    [Fact]
    public void PreviewProduction_CalculatesNetIncomeAndBuildingBreakdown()
    {
        using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));

        var result = service.PreviewProduction(new ProductionPreviewRequest(
            GrossCoinPerSecond: 213,
            WageCostPerSecond: 0.25,
            BeanCostPerSecond: 4,
            Buildings:
            [
                new ProductionBuildingPreviewDto("building_cafe_1f", 213, 0.25, 0, 4),
                new ProductionBuildingPreviewDto("building_empty", -1, double.PositiveInfinity, 0, -5),
            ]));

        Assert.Equal(213, result.GrossCoinPerSecond);
        Assert.Equal(0.25, result.WageCostPerSecond);
        Assert.Equal(212.75, result.NetCoinPerSecond);
        Assert.Equal(4, result.BeanCostPerSecond);
        Assert.Equal(212.75, result.Buildings[0].NetCoinPerSecond);
        Assert.Equal(0, result.Buildings[1].GrossCoinPerSecond);
        Assert.Equal(0, result.Buildings[1].WageCostPerSecond);
        Assert.Equal(0, result.Buildings[1].BeanCostPerSecond);
    }

    [Fact]
    public async Task PreviewServerProductionAsync_UsesServerCatsBuildingsAndEquipment()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("server-production-device", "FatCat"), CancellationToken.None);

        var before = await service.PreviewServerProductionAsync(auth.PlayerId, CancellationToken.None);
        var upgrade = await service.UpgradeBuildingAsync(auth.PlayerId, "building_cafe_1f", CancellationToken.None);
        var after = await service.PreviewServerProductionAsync(auth.PlayerId, CancellationToken.None);

        Assert.NotNull(before);
        Assert.NotNull(after);
        var cafeBefore = Assert.Single(before!.Buildings, building => building.BuildingId == "building_cafe_1f");
        // Default soft cushion gives c_001 105% mood, which now scales server-side production.
        Assert.Equal(246.7931004, before.GrossCoinPerSecond, 5);
        Assert.Equal(0.0158333, before.WageCostPerSecond, 5);
        Assert.Equal(4, before.BeanCostPerSecond, 5);
        Assert.Equal(before.GrossCoinPerSecond - before.WageCostPerSecond, before.NetCoinPerSecond, 5);
        Assert.Equal(before.NetCoinPerSecond, cafeBefore.NetCoinPerSecond, 5);
        var appearanceSource = Assert.Single(before.ModifierSources!);
        Assert.Equal("factory_appearance", appearanceSource.SourceType);
        Assert.Equal("simple", appearanceSource.SourceId);
        Assert.Equal(10, appearanceSource.GrossCoinPercent);
        Assert.NotNull(upgrade);
        Assert.Equal(7, upgrade!.Level);
        var cafeAfter = Assert.Single(after!.Buildings, building => building.BuildingId == "building_cafe_1f");
        Assert.Equal(254.051721, after.GrossCoinPerSecond, 4);
        Assert.Equal(after.GrossCoinPerSecond - after.WageCostPerSecond, after.NetCoinPerSecond, 5);
        Assert.True(cafeAfter.GrossCoinPerSecond > cafeBefore.GrossCoinPerSecond);
    }

    [Fact]
    public async Task LaunchAsync_CalculatesAuthoritativeRewardAndBeanCost()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("launch-device", "FatCat"), CancellationToken.None);

        var result = await service.LaunchAsync(auth.PlayerId, new LaunchRequest(
            ClientRequestId: "unit-test",
            LaunchSeconds: 10,
            AvailableBean: 3200,
            Production: new ProductionPreviewRequest(
                GrossCoinPerSecond: 213,
                WageCostPerSecond: 0.25,
                BeanCostPerSecond: 4)),
            CancellationToken.None);

        Assert.True(result.Accepted);
        Assert.Equal(10, result.RequestedSeconds);
        Assert.Equal(10, result.ProductiveSeconds);
        Assert.Equal(2467, result.CoinGained);
        Assert.Equal(40, result.BeanSpent);
        Assert.Equal(246.777267, result.NetCoinPerSecond, 5);
        Assert.Equal(12452467, result.CoinBalance);
        Assert.Equal(8200, result.BeanBalance);
        Assert.StartsWith("launch_", result.LaunchId);
        Assert.Equal("simple", result.EquippedFactoryAppearanceId);
        Assert.Equal("simple", Assert.Single(result.ModifierSources!).SourceId);
        Assert.Equal(250, result.ExperienceGained);
        Assert.NotNull(result.PlayerProgression);
        Assert.Equal(28, result.PlayerProgression!.Level);
        Assert.Equal(2810, result.PlayerProgression.Exp);
        Assert.Equal(3200, result.PlayerProgression.ExpToNext);
        Assert.Equal(60, result.PlayerProgression.LevelCap);

        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        Assert.Equal(12452467, resources!.Coin);
        Assert.Equal(8200, resources.Bean);
        var transaction = Assert.Single(dbContext.ResourceTransactions.Where(item => item.PlayerId == auth.PlayerId));
        Assert.Equal("launch", transaction.SourceType);
        Assert.Equal("unit-test", transaction.SourceKey);
        Assert.Equal(2467, transaction.CoinDelta);
        Assert.Equal(-40, transaction.BeanDelta);
    }

    [Fact]
    public async Task LaunchAsync_WhenExperienceCrossesLevelBoundary_PersistsAndReplaysProgressionOnce()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("launch-level-device", "FatCat"), CancellationToken.None);
        var player = await dbContext.Players.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(player);
        player!.Level = 28;
        player.Exp = 3100;
        player.ExpToNext = 3200;
        await dbContext.SaveChangesAsync();
        var request = new LaunchRequest(
            "level-boundary-request",
            10,
            3200,
            new ProductionPreviewRequest(213, 0.25, 4));

        var launch = await service.LaunchAsync(auth.PlayerId, request, CancellationToken.None);
        var replay = await service.LaunchAsync(auth.PlayerId, request with { LaunchSeconds = 600 }, CancellationToken.None);
        var refreshed = await service.GetPlayerAsync(auth.PlayerId, CancellationToken.None);

        Assert.True(launch.Accepted);
        Assert.Equal(250, launch.ExperienceGained);
        Assert.NotNull(launch.PlayerProgression);
        Assert.Equal(29, launch.PlayerProgression!.Level);
        Assert.Equal(150, launch.PlayerProgression.Exp);
        Assert.Equal(3300, launch.PlayerProgression.ExpToNext);
        Assert.Equal(launch.LaunchId, replay.LaunchId);
        Assert.Equal(launch.ExperienceGained, replay.ExperienceGained);
        Assert.Equal(launch.PlayerProgression, replay.PlayerProgression);
        Assert.NotNull(launch.LevelUpReward);
        Assert.Equal(28, launch.LevelUpReward!.FromLevel);
        Assert.Equal(29, launch.LevelUpReward.ToLevel);
        Assert.Equal(5_000, launch.LevelUpReward.Coin);
        Assert.Equal(5, launch.LevelUpReward.Diamond);
        Assert.Equal(20, launch.LevelUpReward.ResearchPoint);
        Assert.Equal(launch.LevelUpReward, replay.LevelUpReward);
        Assert.NotNull(refreshed);
        Assert.Equal(29, refreshed!.Level);
        Assert.Equal(150, refreshed.Exp);
        Assert.Equal(3300, refreshed.ExpToNext);
        var record = Assert.Single(dbContext.LaunchRecords.Where(item => item.PlayerId == auth.PlayerId));
        Assert.Equal(250, record.ExperienceGained);
        Assert.Equal(29, record.PlayerLevelAfter);
        Assert.Equal(150, record.PlayerExpAfter);
        Assert.Equal(3300, record.PlayerExpToNextAfter);
        Assert.Equal(28, record.LevelRewardFromLevel);
        Assert.Equal(29, record.LevelRewardToLevel);
        Assert.Equal(5_000, record.LevelRewardCoin);
        Assert.Equal(5, record.LevelRewardDiamond);
        Assert.Equal(20, record.LevelRewardResearchPoint);
        Assert.Equal(29, player.RewardedThroughLevel);
        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        Assert.Equal(12_457_467, resources!.Coin);
        Assert.Equal(2_585, resources.Diamond);
        Assert.Equal(220, resources.ResearchPoint);
        var transaction = Assert.Single(dbContext.ResourceTransactions.Where(item => item.PlayerId == auth.PlayerId));
        Assert.Equal(7_467, transaction.CoinDelta);
        Assert.Equal(250, transaction.ExperienceDelta);
        Assert.Equal(29, transaction.PlayerLevelAfter);
    }

    [Fact]
    public async Task LaunchAsync_IgnoresSubmittedProductionSnapshot()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("launch-tamper-device", "FatCat"), CancellationToken.None);

        var result = await service.LaunchAsync(auth.PlayerId, new LaunchRequest(
            ClientRequestId: "tamper-unit-test",
            LaunchSeconds: 10,
            AvailableBean: 999999,
            Production: new ProductionPreviewRequest(
                GrossCoinPerSecond: 999999,
                WageCostPerSecond: 0,
                BeanCostPerSecond: 0,
                IncludesClientModifiers: true)),
            CancellationToken.None);

        Assert.True(result.Accepted);
        Assert.Equal(2467, result.CoinGained);
        Assert.Equal(40, result.BeanSpent);
        Assert.Equal(246.777267, result.NetCoinPerSecond, 5);
        Assert.Equal(12452467, result.CoinBalance);
    }

    [Fact]
    public async Task LaunchAsync_AppliesUnlockedBeanResearchReduction()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("launch-bean-research-device", "FatCat"), CancellationToken.None);
        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        resources!.ResearchPoint = 500;
        await dbContext.SaveChangesAsync();
        await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_basic_prod"), CancellationToken.None);
        await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_bean_save"), CancellationToken.None);

        var preview = await service.PreviewProductionAsync(auth.PlayerId, new ProductionPreviewRequest(
            GrossCoinPerSecond: 213,
            WageCostPerSecond: 0.25,
            BeanCostPerSecond: 4,
            Buildings:
            [
                new ProductionBuildingPreviewDto("building_cafe_1f", 213, 0.25, 0, 4),
            ],
            IncludesClientModifiers: false), CancellationToken.None);
        var result = await service.LaunchAsync(auth.PlayerId, new LaunchRequest(
            ClientRequestId: "bean-research-unit-test",
            LaunchSeconds: 10,
            AvailableBean: 3200,
            Production: new ProductionPreviewRequest(
                GrossCoinPerSecond: 213,
                WageCostPerSecond: 0.25,
                BeanCostPerSecond: 4,
                IncludesClientModifiers: false)),
            CancellationToken.None);

        Assert.Equal(287.55, preview.GrossCoinPerSecond, 3);
        Assert.Equal(287.3125, preview.NetCoinPerSecond, 3);
        Assert.Equal(3.8, preview.BeanCostPerSecond, 3);
        Assert.Equal(3.8, preview.Buildings[0].BeanCostPerSecond, 3);
        Assert.True(result.Accepted);
        Assert.Equal(2682, result.CoinGained);
        Assert.Equal(38, result.BeanSpent);
        Assert.Equal(3.75, result.BeanCostPerSecond, 3);
        Assert.Equal(8202, result.BeanBalance);
    }

    [Fact]
    public async Task PreviewProductionAsync_DoesNotDoubleApplyModifiersForClientSnapshot()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("production-client-snapshot-device", "FatCat"), CancellationToken.None);
        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        resources!.ResearchPoint = 500;
        await dbContext.SaveChangesAsync();
        await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_basic_prod"), CancellationToken.None);
        await service.UnlockResearchAsync(auth.PlayerId, new ResearchUnlockRequest("res_bean_save"), CancellationToken.None);

        var preview = await service.PreviewProductionAsync(auth.PlayerId, new ProductionPreviewRequest(
            GrossCoinPerSecond: 213,
            WageCostPerSecond: 0.25,
            BeanCostPerSecond: 3.8), CancellationToken.None);

        Assert.Equal(213, preview.GrossCoinPerSecond);
        Assert.Equal(0.25, preview.WageCostPerSecond);
        Assert.Equal(212.75, preview.NetCoinPerSecond);
        Assert.Equal(3.8, preview.BeanCostPerSecond);
    }

    [Fact]
    public async Task PreviewProductionAsync_AppliesServerEquipmentWageEffectForBaseSnapshot()
    {
        await using var dbContext = CreateDbContext();
        var config = new BalanceConfig(
            new Dictionary<string, ResearchDefinition>(),
            new Dictionary<string, EquipmentDefinition>
            {
                ["equip_test_cushion"] = new(
                    "equip_test_cushion",
                    "cushion",
                    5,
                    25,
                    [new EquipmentEffectDefinition("wageCost", -20, 0)]),
            },
            new Dictionary<string, string>
            {
                ["cushion"] = "equip_test_cushion",
            });
        var service = new FatCatGameService(new EfFatCatRepository(dbContext), config);
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("production-wage-equipment-device", "FatCat"), CancellationToken.None);

        var preview = await service.PreviewProductionAsync(auth.PlayerId, new ProductionPreviewRequest(
            GrossCoinPerSecond: 100,
            WageCostPerSecond: 1,
            BeanCostPerSecond: 0,
            IncludesClientModifiers: false), CancellationToken.None);

        Assert.Equal(110, preview.GrossCoinPerSecond, 3);
        Assert.Equal(0.75, preview.WageCostPerSecond, 3);
        Assert.Equal(109.25, preview.NetCoinPerSecond, 3);
    }

    [Fact]
    public async Task LaunchAsync_CapsProductiveSecondsByServerBeanBalance()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("launch-bean-device", "FatCat"), CancellationToken.None);
        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        resources!.Coin = 100;
        resources.Bean = 12;
        resources.CatFood = 0;
        resources.Diamond = 0;
        resources.ResearchPoint = 0;
        await dbContext.SaveChangesAsync();

        var result = await service.LaunchAsync(auth.PlayerId, new LaunchRequest(
            ClientRequestId: "bean-cap",
            LaunchSeconds: 10,
            AvailableBean: 999999,
            Production: new ProductionPreviewRequest(
                GrossCoinPerSecond: 213,
                WageCostPerSecond: 0,
                BeanCostPerSecond: 4)),
            CancellationToken.None);

        Assert.True(result.Accepted);
        Assert.Equal(3, result.ProductiveSeconds);
        Assert.Equal(740, result.CoinGained);
        Assert.Equal(12, result.BeanSpent);
        Assert.Equal(840, result.CoinBalance);
        Assert.Equal(0, result.BeanBalance);
    }

    [Fact]
    public async Task LaunchAsync_ReusesExistingRecordForSameClientRequestId()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("launch-idempotent-device", "FatCat"), CancellationToken.None);
        var request = new LaunchRequest(
            ClientRequestId: "same-request",
            LaunchSeconds: 10,
            AvailableBean: 3200,
            Production: new ProductionPreviewRequest(
                GrossCoinPerSecond: 213,
                WageCostPerSecond: 0.25,
                BeanCostPerSecond: 4));

        var first = await service.LaunchAsync(auth.PlayerId, request, CancellationToken.None);
        var second = await service.LaunchAsync(auth.PlayerId, request with
        {
            LaunchSeconds = 600,
            AvailableBean = 999999,
        }, CancellationToken.None);

        Assert.Equal(first.LaunchId, second.LaunchId);
        Assert.Equal(first.CoinGained, second.CoinGained);
        Assert.Equal(first.BeanSpent, second.BeanSpent);
        Assert.Equal(first.CoinBalance, second.CoinBalance);
        Assert.Equal(first.BeanBalance, second.BeanBalance);
        Assert.Equal(first.ExperienceGained, second.ExperienceGained);
        Assert.Equal(first.PlayerProgression, second.PlayerProgression);
        Assert.Single(dbContext.LaunchRecords);
        Assert.Single(dbContext.ResourceTransactions.Where(item => item.PlayerId == auth.PlayerId));
        var dailyOrder = await service.GetDailyOrderAsync(auth.PlayerId, CancellationToken.None);
        Assert.NotNull(dailyOrder);
        Assert.Equal(1, dailyOrder!.LaunchesUsed);
        Assert.Equal(4, dailyOrder.LaunchesRemaining);
        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        Assert.Equal(12452467, resources!.Coin);
        Assert.Equal(8200, resources.Bean);
    }

    [Fact]
    public async Task DailyOrder_StartsAtReferenceProgressAndRejectsEarlyClaim()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("daily-order-start-device", "FatCat"), CancellationToken.None);

        var order = await service.GetDailyOrderAsync(auth.PlayerId, CancellationToken.None);
        var claim = await service.ClaimDailyOrderAsync(auth.PlayerId, CancellationToken.None);

        Assert.NotNull(order);
        Assert.Equal(56, order!.Progress);
        Assert.Equal(60, order.Target);
        Assert.False(order.Claimable);
        Assert.False(order.Claimed);
        Assert.NotNull(claim);
        Assert.False(claim!.Claimed);
        Assert.Equal("order_not_complete", claim.LimitedReason);
        Assert.Empty(dbContext.ResourceTransactions.Where(item => item.SourceType == "daily_order_claim"));
    }

    [Fact]
    public async Task LaunchAsync_AdvancesDailyOrderOnlyForNewSettlement()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("daily-order-launch-device", "FatCat"), CancellationToken.None);
        var request = new LaunchRequest(
            ClientRequestId: "daily-progress-1",
            LaunchSeconds: 10,
            AvailableBean: 3200,
            Production: new ProductionPreviewRequest(213, 0.25, 4));

        await service.LaunchAsync(auth.PlayerId, request, CancellationToken.None);
        await service.LaunchAsync(auth.PlayerId, request, CancellationToken.None);
        var afterReplay = await service.GetDailyOrderAsync(auth.PlayerId, CancellationToken.None);
        for (var index = 2; index <= 4; index++)
        {
            await service.LaunchAsync(
                auth.PlayerId,
                request with { ClientRequestId = $"daily-progress-{index}" },
                CancellationToken.None);
        }
        var complete = await service.GetDailyOrderAsync(auth.PlayerId, CancellationToken.None);

        Assert.NotNull(afterReplay);
        Assert.Equal(57, afterReplay!.Progress);
        Assert.NotNull(complete);
        Assert.Equal(60, complete!.Progress);
        Assert.True(complete.Claimable);
    }

    [Fact]
    public async Task LaunchAsync_EnforcesDailyQuotaAndKeepsReplayIdempotent()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("daily-launch-limit-device", "FatCat"), CancellationToken.None);
        var request = new LaunchRequest(
            ClientRequestId: "daily-limit-1",
            LaunchSeconds: 1,
            AvailableBean: 8240,
            Production: new ProductionPreviewRequest(213, 0.25, 4));
        var accepted = new List<LaunchResponse>();
        for (var index = 1; index <= 5; index++)
        {
            accepted.Add(await service.LaunchAsync(
                auth.PlayerId,
                request with { ClientRequestId = $"daily-limit-{index}" },
                CancellationToken.None));
        }

        var rejected = await service.LaunchAsync(
            auth.PlayerId,
            request with { ClientRequestId = "daily-limit-6" },
            CancellationToken.None);
        var replay = await service.LaunchAsync(auth.PlayerId, request, CancellationToken.None);
        var player = await service.GetPlayerAsync(auth.PlayerId, CancellationToken.None);

        Assert.All(accepted, result => Assert.True(result.Accepted));
        Assert.All(accepted, result => Assert.NotNull(result.DailyOrder));
        Assert.Equal(0, accepted[^1].DailyOrder!.LaunchesRemaining);
        Assert.False(rejected.Accepted);
        Assert.Equal("daily_launch_limit_reached", rejected.RejectedReason);
        Assert.NotNull(rejected.DailyOrder);
        Assert.Equal(5, rejected.DailyOrder!.LaunchesUsed);
        Assert.Equal(0, rejected.DailyOrder.LaunchesRemaining);
        Assert.True(replay.Accepted);
        Assert.Equal(accepted[0].LaunchId, replay.LaunchId);
        Assert.All(accepted, result => Assert.Equal(25, result.ExperienceGained));
        Assert.Equal(accepted[0].PlayerProgression, replay.PlayerProgression);
        Assert.NotNull(player);
        Assert.Equal(2685, player!.Exp);
        Assert.Equal(5, dbContext.LaunchRecords.Count(item => item.PlayerId == auth.PlayerId));
        Assert.Equal(5, dbContext.ResourceTransactions.Count(item =>
            item.PlayerId == auth.PlayerId && item.SourceType == "launch"));
    }

    [Fact]
    public async Task DailyOrder_ClaimRewardsResourcesExactlyOnce()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("daily-order-claim-device", "FatCat"), CancellationToken.None);
        await service.GetDailyOrderAsync(auth.PlayerId, CancellationToken.None);
        var state = await dbContext.DailyOrderStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(state);
        state!.Progress = 60;
        await dbContext.SaveChangesAsync();

        var first = await service.ClaimDailyOrderAsync(auth.PlayerId, CancellationToken.None);
        var second = await service.ClaimDailyOrderAsync(auth.PlayerId, CancellationToken.None);

        Assert.NotNull(first);
        Assert.True(first!.Claimed);
        Assert.True(first.Order.Claimed);
        Assert.Equal(12451000, first.CoinBalance);
        Assert.Equal(210, first.ResearchPointBalance);
        Assert.NotNull(second);
        Assert.False(second!.Claimed);
        Assert.Equal("already_claimed", second.LimitedReason);
        Assert.Equal(first.CoinBalance, second.CoinBalance);
        Assert.Equal(first.ResearchPointBalance, second.ResearchPointBalance);
        var transaction = Assert.Single(dbContext.ResourceTransactions.Where(item => item.SourceType == "daily_order_claim"));
        Assert.Equal(1000, transaction.CoinDelta);
        Assert.Equal(10, transaction.ResearchPointDelta);
        Assert.Equal(400, transaction.ExperienceDelta);
        Assert.Equal(28, transaction.PlayerLevelAfter);
        Assert.Equal(2960, transaction.PlayerExpAfter);
        Assert.Equal(400, first.ExperienceGained);
        Assert.NotNull(first.PlayerProgression);
        Assert.Equal(2960, first.PlayerProgression!.Exp);
        Assert.Null(first.LevelUpReward);
    }

    [Fact]
    public async Task DailyOrder_ClaimCrossesLevelAndGrantsPersistedLevelReward()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("daily-order-level-device", "FatCat"), CancellationToken.None);
        await service.GetDailyOrderAsync(auth.PlayerId, CancellationToken.None);
        var state = await dbContext.DailyOrderStates.FindAsync([auth.PlayerId], CancellationToken.None);
        var player = await dbContext.Players.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(state);
        Assert.NotNull(player);
        state!.Progress = 60;
        player!.Exp = 3000;
        await dbContext.SaveChangesAsync();

        var result = await service.ClaimDailyOrderAsync(auth.PlayerId, CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result!.Claimed);
        Assert.Equal(400, result.ExperienceGained);
        Assert.Equal(29, result.PlayerProgression!.Level);
        Assert.Equal(200, result.PlayerProgression.Exp);
        Assert.NotNull(result.LevelUpReward);
        Assert.Equal(5_000, result.LevelUpReward!.Coin);
        Assert.Equal(12_456_000, result.CoinBalance);
        Assert.Equal(2_585, result.DiamondBalance);
        Assert.Equal(230, result.ResearchPointBalance);
        Assert.Equal(29, player.RewardedThroughLevel);
    }

    [Fact]
    public async Task Achievement_RequiresGoalAndClaimsExperienceAndLevelRewardOnce()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("achievement-device", "FatCat"), CancellationToken.None);

        var initial = await service.GetAchievementsAsync(auth.PlayerId, CancellationToken.None);
        var blocked = await service.ClaimAchievementAsync(auth.PlayerId, "task_ach_1", CancellationToken.None);
        Assert.NotNull(initial);
        Assert.False(Assert.Single(initial!).Claimable);
        Assert.NotNull(blocked);
        Assert.False(blocked!.Claimed);
        Assert.Equal("achievement_not_complete", blocked.LimitedReason);

        foreach (var cat in dbContext.CatStates.Where(cat => cat.PlayerId == auth.PlayerId))
        {
            cat.IsUnlocked = true;
        }
        await dbContext.SaveChangesAsync();

        var first = await service.ClaimAchievementAsync(auth.PlayerId, "task_ach_1", CancellationToken.None);
        var second = await service.ClaimAchievementAsync(auth.PlayerId, "task_ach_1", CancellationToken.None);

        Assert.NotNull(first);
        Assert.True(first!.Claimed);
        Assert.Equal(800, first.ExperienceGained);
        Assert.Equal(29, first.PlayerProgression!.Level);
        Assert.Equal(160, first.PlayerProgression.Exp);
        Assert.NotNull(first.LevelUpReward);
        Assert.Equal(12_455_000, first.CoinBalance);
        Assert.Equal(2_585, first.DiamondBalance);
        Assert.Equal(420, first.ResearchPointBalance);
        Assert.NotNull(second);
        Assert.False(second!.Claimed);
        Assert.Equal("already_claimed", second.LimitedReason);
        Assert.Single(dbContext.AchievementClaims.Where(claim => claim.PlayerId == auth.PlayerId));
        var transaction = Assert.Single(dbContext.ResourceTransactions.Where(item => item.SourceType == "achievement_claim"));
        Assert.Equal(800, transaction.ExperienceDelta);
        Assert.Equal(5_000, transaction.CoinDelta);
        Assert.Equal(5, transaction.DiamondDelta);
        Assert.Equal(220, transaction.ResearchPointDelta);
        Assert.Contains(first.InventoryItems, item => item.ItemId == "item_coin_pack_small" && item.Quantity == 6);
        Assert.Contains(second.InventoryItems, item => item.ItemId == "item_coin_pack_small" && item.Quantity == 6);
        var inventoryTransaction = Assert.Single(dbContext.InventoryTransactions.Where(item => item.SourceType == "achievement_claim"));
        Assert.Equal("item_coin_pack_small", inventoryTransaction.ItemKey);
        Assert.Equal(1, inventoryTransaction.QuantityDelta);
        Assert.Equal(6, inventoryTransaction.QuantityAfter);
    }

    [Fact]
    public async Task Achievement_BackfillsLegacyInventoryRewardExactlyOnce()
    {
        await using var dbContext = CreateDbContext();
        var service = new FatCatGameService(new EfFatCatRepository(dbContext));
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("achievement-item-backfill", "FatCat"), CancellationToken.None);
        await service.GetInventoryAsync(auth.PlayerId, CancellationToken.None);
        dbContext.AchievementClaims.Add(new PlayerAchievementClaim
        {
            PlayerId = auth.PlayerId,
            AchievementKey = "task_ach_1",
        });
        await dbContext.SaveChangesAsync();

        var first = await service.ClaimAchievementAsync(auth.PlayerId, "task_ach_1", CancellationToken.None);
        var second = await service.ClaimAchievementAsync(auth.PlayerId, "task_ach_1", CancellationToken.None);

        Assert.NotNull(first);
        Assert.False(first!.Claimed);
        Assert.Equal("already_claimed", first.LimitedReason);
        Assert.Contains(first.InventoryItems, item => item.ItemId == "item_coin_pack_small" && item.Quantity == 6);
        Assert.NotNull(second);
        Assert.Contains(second!.InventoryItems, item => item.ItemId == "item_coin_pack_small" && item.Quantity == 6);
        var transaction = Assert.Single(dbContext.InventoryTransactions.Where(item => item.SourceType == "achievement_claim"));
        Assert.Equal(1, transaction.QuantityDelta);
        Assert.Equal(6, transaction.QuantityAfter);
    }

    [Fact]
    public void BalanceConfig_FromJson_LoadsResearchEquipmentAndDefaults()
    {
        var json = """
        {
          "researchDefinitions": {
            "res_test": {
              "researchId": "res_test",
              "cost": 10,
              "effectType": "bean_reduce",
              "effectValue": 3,
              "parentResearchId": null
            }
          },
          "equipmentDefinitions": {
            "equip_test_cup": {
              "itemId": "equip_test_cup",
              "slot": "cup",
              "maxLevel": 4,
              "upgradeCost": 25,
              "effects": [
                {
                  "type": "catFoodCost",
                  "baseValue": -20,
                  "perLevel": -2
                }
              ]
            }
          },
          "defaultEquipment": {
            "cup": "equip_test_cup"
          },
          "skillDefinitions": {
            "s_test": {
              "skillId": "s_test",
              "type": "production_boost",
              "value": 25
            }
          },
          "catDefinitions": {
            "c_test": {
              "catId": "c_test",
              "rarity": "A",
              "role": "producer",
              "baseProduction": 20,
              "baseBeanCost": 6,
              "baseSalary": 2,
              "baseWeight": 18,
              "skillId": "s_test"
            }
          }
        }
        """;

        var config = BalanceConfig.FromJson(json);

        Assert.Equal(10, config.ResearchDefinitions["res_test"].Cost);
        Assert.Equal(4, config.EquipmentDefinitions["equip_test_cup"].MaxLevel);
        Assert.Equal("equip_test_cup", config.DefaultEquipment["cup"]);
        Assert.Equal(20, config.CatDefinitions["c_test"].BaseProduction);
        Assert.Equal("A", config.CatDefinitions["c_test"].Rarity);
        Assert.Equal("production_boost", config.SkillDefinitions["s_test"].Type);
        Assert.Equal(25, config.SkillDefinitions["s_test"].Value);
    }

    [Fact]
    public async Task FeedCatAsync_UsesInjectedBalanceConfigEquipmentEffects()
    {
        await using var dbContext = CreateDbContext();
        var config = new BalanceConfig(
            new Dictionary<string, ResearchDefinition>(),
            new Dictionary<string, EquipmentDefinition>
            {
                ["equip_test_cup"] = new(
                    "equip_test_cup",
                    "cup",
                    5,
                    25,
                    [new EquipmentEffectDefinition("catFoodCost", -20, 0)]),
            },
            new Dictionary<string, string>
            {
                ["cup"] = "equip_test_cup",
            });
        var service = new FatCatGameService(new EfFatCatRepository(dbContext), config);
        var auth = await service.AuthGuestAsync(new AuthGuestRequest("custom-balance-feed-device", "FatCat"), CancellationToken.None);

        var feed = await service.FeedCatAsync(auth.PlayerId, new CatFeedRequest("c_001"), CancellationToken.None);

        Assert.NotNull(feed);
        Assert.Equal(8, feed!.CatFoodSpent);
        Assert.Equal(3502, feed.CatFoodBalance);
    }

    [Fact]
    public async Task EnsureRuntimeSchemaAsync_MigratesUnlockedResearchToLevelOne()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        var playerId = Guid.NewGuid();
        var researchId = Guid.NewGuid();
        await using (var command = connection.CreateCommand())
        {
            command.CommandText = """
                CREATE TABLE "Players" (
                    "Id" TEXT NOT NULL PRIMARY KEY,
                    "FriendBoostPercent" INTEGER NOT NULL DEFAULT 0,
                    "FriendBoostUntil" TEXT NULL,
                    "FriendBoostedBy" TEXT NOT NULL DEFAULT ''
                );
                CREATE TABLE "FriendSnapshots" (
                    "Id" TEXT NOT NULL PRIMARY KEY,
                    "LastHelpAt" TEXT NULL
                );
                CREATE TABLE "ResearchStates" (
                    "Id" TEXT NOT NULL PRIMARY KEY,
                    "PlayerId" TEXT NOT NULL,
                    "ResearchKey" TEXT NOT NULL,
                    "IsUnlocked" INTEGER NOT NULL,
                    "UpdatedAt" TEXT NOT NULL
                );
                CREATE TABLE "DailyOrderStates" (
                    "PlayerId" TEXT NOT NULL PRIMARY KEY,
                    "OrderDate" INTEGER NOT NULL,
                    "Progress" INTEGER NOT NULL,
                    "IsClaimed" INTEGER NOT NULL,
                    "UpdatedAt" TEXT NOT NULL
                );
                CREATE TABLE "CatStates" (
                    "Id" TEXT NOT NULL PRIMARY KEY,
                    "PlayerId" TEXT NOT NULL,
                    "CatKey" TEXT NOT NULL,
                    "Level" INTEGER NOT NULL,
                    "Weight" INTEGER NOT NULL DEFAULT 20,
                    "IsUnlocked" INTEGER NOT NULL,
                    "AssignedBuildingKey" TEXT NOT NULL DEFAULT 'building_cafe_1f',
                    "EquipmentJson" TEXT NOT NULL DEFAULT '{}',
                    "EquipmentLevelsJson" TEXT NOT NULL DEFAULT '{}',
                    "UpdatedAt" TEXT NOT NULL
                );
                INSERT INTO "Players" ("Id") VALUES ($playerId);
                INSERT INTO "ResearchStates"
                    ("Id", "PlayerId", "ResearchKey", "IsUnlocked", "UpdatedAt")
                VALUES ($researchId, $playerId, 'res_basic_prod', 1, '2026-07-03T00:00:00+00:00');
                INSERT INTO "DailyOrderStates"
                    ("PlayerId", "OrderDate", "Progress", "IsClaimed", "UpdatedAt")
                VALUES ($playerId, 20260703, 58, 0, '2026-07-03T00:00:00+00:00');
                INSERT INTO "CatStates"
                    ("Id", "PlayerId", "CatKey", "Level", "Weight", "IsUnlocked", "UpdatedAt")
                VALUES ($catId, $playerId, 'c_001', 1, 20, 1, '2026-07-03T00:00:00+00:00');
                """;
            command.Parameters.AddWithValue("$playerId", playerId.ToString());
            command.Parameters.AddWithValue("$researchId", researchId.ToString());
            command.Parameters.AddWithValue("$catId", Guid.NewGuid().ToString());
            await command.ExecuteNonQueryAsync();
        }

        var options = new DbContextOptionsBuilder<FatCatDbContext>()
            .UseSqlite(connection)
            .Options;
        await using var dbContext = new FatCatDbContext(options);
        await dbContext.EnsureRuntimeSchemaAsync();

        await using var verify = connection.CreateCommand();
        verify.CommandText = """SELECT "Level" FROM "ResearchStates" WHERE "Id" = $researchId;""";
        verify.Parameters.AddWithValue("$researchId", researchId.ToString());
        var level = Convert.ToInt32(await verify.ExecuteScalarAsync());
        await using var verifyDailyOrder = connection.CreateCommand();
        verifyDailyOrder.CommandText = """SELECT "LaunchCount" FROM "DailyOrderStates" WHERE "PlayerId" = $playerId;""";
        verifyDailyOrder.Parameters.AddWithValue("$playerId", playerId.ToString());
        var launchCount = Convert.ToInt32(await verifyDailyOrder.ExecuteScalarAsync());
        await using var verifyCatSkin = connection.CreateCommand();
        verifyCatSkin.CommandText = """SELECT "OwnedSkinsJson", "EquippedSkinKey" FROM "CatStates" WHERE "PlayerId" = $playerId;""";
        verifyCatSkin.Parameters.AddWithValue("$playerId", playerId.ToString());
        await using var skinReader = await verifyCatSkin.ExecuteReaderAsync();
        Assert.True(await skinReader.ReadAsync());

        Assert.Equal(1, level);
        Assert.Equal(0, launchCount);
        Assert.Equal("[\"default\"]", skinReader.GetString(0));
        Assert.Equal("default", skinReader.GetString(1));
        await using var verifyAppearanceTable = connection.CreateCommand();
        verifyAppearanceTable.CommandText = """SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'FactoryAppearanceStates';""";
        Assert.Equal(1, Convert.ToInt32(await verifyAppearanceTable.ExecuteScalarAsync()));
        await using var verifyPlayerProgressionColumns = connection.CreateCommand();
        verifyPlayerProgressionColumns.CommandText = """SELECT COUNT(*) FROM pragma_table_info('Players') WHERE name IN ('Level', 'Exp', 'ExpToNext', 'RewardedThroughLevel');""";
        Assert.Equal(4, Convert.ToInt32(await verifyPlayerProgressionColumns.ExecuteScalarAsync()));
        await using var verifyPlayerProgression = connection.CreateCommand();
        verifyPlayerProgression.CommandText = """SELECT "Level", "Exp", "ExpToNext", "RewardedThroughLevel" FROM "Players" WHERE "Id" = $playerId;""";
        verifyPlayerProgression.Parameters.AddWithValue("$playerId", playerId.ToString());
        await using var progressionReader = await verifyPlayerProgression.ExecuteReaderAsync();
        Assert.True(await progressionReader.ReadAsync());
        Assert.Equal(28, progressionReader.GetInt32(0));
        Assert.Equal(2560, progressionReader.GetInt32(1));
        Assert.Equal(3200, progressionReader.GetInt32(2));
        Assert.Equal(28, progressionReader.GetInt32(3));
        await using var verifyLaunchSnapshotColumns = connection.CreateCommand();
        verifyLaunchSnapshotColumns.CommandText = """SELECT COUNT(*) FROM pragma_table_info('LaunchRecords') WHERE name IN ('EquippedFactoryAppearanceKey', 'ModifierSourcesJson', 'ExperienceGained', 'PlayerLevelAfter', 'PlayerExpAfter', 'PlayerExpToNextAfter', 'LevelRewardFromLevel', 'LevelRewardToLevel', 'LevelRewardCoin', 'LevelRewardDiamond', 'LevelRewardResearchPoint');""";
        Assert.Equal(11, Convert.ToInt32(await verifyLaunchSnapshotColumns.ExecuteScalarAsync()));
        await using var verifyTransactionProgressionColumns = connection.CreateCommand();
        verifyTransactionProgressionColumns.CommandText = """SELECT COUNT(*) FROM pragma_table_info('ResourceTransactions') WHERE name IN ('ExperienceDelta', 'PlayerLevelAfter', 'PlayerExpAfter', 'PlayerExpToNextAfter');""";
        Assert.Equal(4, Convert.ToInt32(await verifyTransactionProgressionColumns.ExecuteScalarAsync()));
        await using var verifyAchievementTable = connection.CreateCommand();
        verifyAchievementTable.CommandText = """SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'AchievementClaims';""";
        Assert.Equal(1, Convert.ToInt32(await verifyAchievementTable.ExecuteScalarAsync()));
        await using var verifyInventoryTables = connection.CreateCommand();
        verifyInventoryTables.CommandText = """SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name IN ('InventoryItems', 'InventoryTransactions');""";
        Assert.Equal(2, Convert.ToInt32(await verifyInventoryTables.ExecuteScalarAsync()));
    }

    private static FatCatDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<FatCatDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new FatCatDbContext(options);
    }
}
