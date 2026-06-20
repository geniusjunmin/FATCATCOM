using FatCat.Application;
using FatCat.Infrastructure;
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
        Assert.Equal(3, research.Count);
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
        Assert.NotNull(duplicate);
        Assert.Null(self);
        Assert.Equal(4, friends.Count);
        Assert.Single(friends, friend => friend.Id == $"player:{target.PlayerId:N}");
        Assert.NotNull(leaderboard);
        Assert.Contains(leaderboard!.Entries, entry => entry.PlayerId == $"player:{target.PlayerId:N}");
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
        Assert.Equal(224.357364, before.GrossCoinPerSecond, 5);
        Assert.Equal(0.016667, before.WageCostPerSecond, 5);
        Assert.Equal(4, before.BeanCostPerSecond, 5);
        Assert.Equal(before.GrossCoinPerSecond - before.WageCostPerSecond, before.NetCoinPerSecond, 5);
        Assert.Equal(before.NetCoinPerSecond, cafeBefore.NetCoinPerSecond, 5);
        Assert.NotNull(upgrade);
        Assert.Equal(7, upgrade!.Level);
        var cafeAfter = Assert.Single(after!.Buildings, building => building.BuildingId == "building_cafe_1f");
        Assert.Equal(230.95611, after.GrossCoinPerSecond, 4);
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
        Assert.Equal(2243, result.CoinGained);
        Assert.Equal(40, result.BeanSpent);
        Assert.Equal(224.340697, result.NetCoinPerSecond, 5);
        Assert.Equal(12452243, result.CoinBalance);
        Assert.Equal(8200, result.BeanBalance);
        Assert.StartsWith("launch_", result.LaunchId);

        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        Assert.Equal(12452243, resources!.Coin);
        Assert.Equal(8200, resources.Bean);
        var transaction = Assert.Single(dbContext.ResourceTransactions.Where(item => item.PlayerId == auth.PlayerId));
        Assert.Equal("launch", transaction.SourceType);
        Assert.Equal("unit-test", transaction.SourceKey);
        Assert.Equal(2243, transaction.CoinDelta);
        Assert.Equal(-40, transaction.BeanDelta);
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
        Assert.Equal(2243, result.CoinGained);
        Assert.Equal(40, result.BeanSpent);
        Assert.Equal(224.340697, result.NetCoinPerSecond, 5);
        Assert.Equal(12452243, result.CoinBalance);
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

        Assert.Equal(266.25, preview.GrossCoinPerSecond, 3);
        Assert.Equal(266, preview.NetCoinPerSecond, 3);
        Assert.Equal(3.8, preview.BeanCostPerSecond, 3);
        Assert.Equal(3.8, preview.Buildings[0].BeanCostPerSecond, 3);
        Assert.True(result.Accepted);
        Assert.Equal(2438, result.CoinGained);
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

        Assert.Equal(100, preview.GrossCoinPerSecond);
        Assert.Equal(0.8, preview.WageCostPerSecond, 3);
        Assert.Equal(99.2, preview.NetCoinPerSecond, 3);
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
        Assert.Equal(673, result.CoinGained);
        Assert.Equal(12, result.BeanSpent);
        Assert.Equal(773, result.CoinBalance);
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
        Assert.Single(dbContext.LaunchRecords);
        Assert.Single(dbContext.ResourceTransactions.Where(item => item.PlayerId == auth.PlayerId));
        var resources = await dbContext.ResourceStates.FindAsync([auth.PlayerId], CancellationToken.None);
        Assert.NotNull(resources);
        Assert.Equal(12452243, resources!.Coin);
        Assert.Equal(8200, resources.Bean);
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

    private static FatCatDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<FatCatDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new FatCatDbContext(options);
    }
}
