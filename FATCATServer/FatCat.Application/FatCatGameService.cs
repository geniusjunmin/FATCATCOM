using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Nodes;
using FatCat.Domain;

namespace FatCat.Application;

public sealed class FatCatGameService(
    IFatCatRepository repository,
    BalanceConfig? balanceConfig = null,
    SocialEventBroker? socialEventBroker = null)
{
    private readonly BalanceConfig balance = balanceConfig ?? BalanceConfig.Default;
    private readonly SocialEventBroker socialEvents = socialEventBroker ?? new SocialEventBroker();
    private static readonly ConcurrentDictionary<Guid, SemaphoreSlim> ResearchUnlockGates = new();
    private static readonly ConcurrentDictionary<Guid, SemaphoreSlim> LaunchSettlementGates = new();
    private static readonly ConcurrentDictionary<Guid, SemaphoreSlim> CatSkinUnlockGates = new();
    private static readonly HashSet<string> CatSkinIds = ["default", "apron", "manager", "festival"];
    private static readonly CatSkinCatalogDefinition[] CatSkinCatalog =
    [
        new("default", "默认工作服", "肥猫咖啡公司的经典制服", "", 0, false),
        new("apron", "烘焙围裙", "适合烘焙车间的耐热围裙", "", 0, false),
        new("manager", "店长披肩", "象征管理岗位的青绿色披肩", "coin", 75_000, true),
        new("festival", "节日礼服", "庆典期间限定的紫金礼服", "diamond", 80, true),
    ];
    private const double InitialCoin = 12_450_000;
    private const double InitialBean = 8_240;
    private const double InitialCatFood = 3_510;
    private const double InitialDiamond = 2_580;
    private const double InitialResearchPoint = 200;
    private static readonly Dictionary<string, ShopItemDefinition> ShopItems = new()
    {
        ["shop_cat_food_1"] = new ShopItemDefinition("shop_cat_food_1", "item_cat_food_pack", "coin", 500, 5),
        ["shop_coin_pack_1"] = new ShopItemDefinition("shop_coin_pack_1", "item_coin_pack_small", "diamond", 10, 10),
        ["shop_shard_orange_1"] = new ShopItemDefinition("shop_shard_orange_1", "item_shard_orange", "coin", 2000, 1),
    };
    private static readonly (string DecorId, string BuildingId, string Name, int Score)[] DefaultDecorations =
    [
        ("decor_office_clock", "building_office_5f", "复古挂钟", 32),
        ("decor_office_plant", "building_office_5f", "绿植书架", 26),
        ("decor_roast_lamp", "building_roast_4f", "铜制烘焙灯", 38),
        ("decor_roast_beans", "building_roast_4f", "豆袋陈列架", 30),
        ("decor_ferment_gauge", "building_ferment_3f", "发酵温度计", 34),
        ("decor_ferment_plate", "building_ferment_3f", "管道铭牌", 28),
        ("decor_material_mill", "building_material_2f", "黄铜磨豆机", 40),
        ("decor_material_crates", "building_material_2f", "原料木箱", 30),
        ("decor_cafe_sign", "building_cafe_1f", "猫爪招牌", 42),
        ("decor_cafe_cup", "building_cafe_1f", "幸运咖啡杯", 34),
        ("decor_storage_lamp", "building_storage_b1", "仓库吊灯", 28),
        ("decor_storage_bags", "building_storage_b1", "咖啡麻袋组", 26),
    ];
    private static readonly DecorCatalogDefinition[] DecorCatalog =
    [
        new("decor_shop_neon_paw", "霓虹猫爪灯", "点亮咖啡厅的夜间招牌", "building_cafe_1f", 58, "coin", 28_000),
        new("decor_shop_bean_globe", "咖啡豆地球仪", "原料车间的收藏陈列", "building_material_2f", 64, "coin", 42_000),
        new("decor_shop_ferment_chime", "发酵铜风铃", "记录每一次神奇反应", "building_ferment_3f", 72, "coin", 55_000),
        new("decor_shop_roast_phonograph", "烘焙留声机", "让烘焙节奏更加从容", "building_roast_4f", 80, "diamond", 45),
        new("decor_shop_office_trophy", "金爪奖杯", "管理室的荣誉陈列", "building_office_5f", 92, "diamond", 60),
        new("decor_shop_storage_cart", "复古运豆车", "仓库专用的黄铜推车", "building_storage_b1", 68, "coin", 36_000),
    ];

    private static readonly DecorCollectionTierDefinition[] DecorCollectionTiers =
    [
        new("collector_1", 1, "coin", 10_000, 1 << 0),
        new("collector_3", 3, "diamond", 30, 1 << 1),
        new("collector_6", 6, "researchPoint", 100, 1 << 2),
    ];
    private static readonly FriendCoopTierDefinition[] FriendCoopTiers =
    [
        new("assist_1", 1, "coin", 5_000, 1 << 0),
        new("assist_2", 2, "researchPoint", 20, 1 << 1),
        new("assist_3", 3, "diamond", FriendCoopGoalRewardDiamond, 1 << 2),
    ];

    public async Task<AuthGuestResponse> AuthGuestAsync(AuthGuestRequest request, CancellationToken cancellationToken)
    {
        var deviceId = NormalizeDeviceId(request.DeviceId);
        var existing = await repository.FindPlayerByDeviceIdAsync(deviceId, cancellationToken);
        if (existing is not null)
        {
            await EnsureResourceStateAsync(existing.Id, cancellationToken);
            await EnsureDefaultCatStateAsync(existing.Id, cancellationToken);
            await EnsureDefaultBuildingStatesAsync(existing.Id, cancellationToken);
            await EnsureDefaultDecorStatesAsync(existing.Id, cancellationToken);
            await EnsureInviteCodeAsync(existing.Id, cancellationToken);
            existing.UpdatedAt = DateTimeOffset.UtcNow;
            await repository.SaveChangesAsync(cancellationToken);
            return new AuthGuestResponse(existing.Id, "", false);
        }

        var player = new PlayerProfile
        {
            DeviceId = deviceId,
            CompanyName = string.IsNullOrWhiteSpace(request.CompanyName) ? "肥猫咖啡公司" : request.CompanyName.Trim(),
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        await repository.AddPlayerAsync(player, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        await EnsureResourceStateAsync(player.Id, cancellationToken);
        await EnsureDefaultCatStateAsync(player.Id, cancellationToken);
        await EnsureDefaultBuildingStatesAsync(player.Id, cancellationToken);
        await EnsureDefaultDecorStatesAsync(player.Id, cancellationToken);
        await EnsureInviteCodeAsync(player.Id, cancellationToken);
        return new AuthGuestResponse(player.Id, "", true);
    }

    public async Task<PlayerDto?> GetPlayerAsync(Guid playerId, CancellationToken cancellationToken)
    {
        var player = await repository.FindPlayerByIdAsync(playerId, cancellationToken);
        return player is null
            ? null
            : new PlayerDto(player.Id, player.DeviceId, player.CompanyName, player.Level, player.Exp, player.ExpToNext);
    }

    public async Task<PlayerPresenceDto?> TouchPresenceAsync(Guid playerId, CancellationToken cancellationToken)
    {
        var player = await repository.FindPlayerByIdAsync(playerId, cancellationToken);
        if (player is null)
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        player.UpdatedAt = now;
        await repository.SaveChangesAsync(cancellationToken);
        return new PlayerPresenceDto("online", now.ToUnixTimeMilliseconds(), now.ToUnixTimeMilliseconds());
    }

    public BootstrapDto GetBootstrap()
    {
        return new BootstrapDto(
            "fatcat-config-2026-06-13",
            1,
            ["auth", "save-sync", "mail-shell", "friend-shell", "friend-invite", "friend-decor", "decor-shop", "decor-collection", "friend-realtime-events", "friend-production-boost", "friend-boost-history", "friend-coop-goal", "friend-coop-tiers", "daily-order", "leaderboard", "settings-shell", "production-preview", "server-production-preview", "launch-settlement", "resource-state", "resource-snapshot", "shop-state", "cat-upgrade", "cat-feed", "cat-unlock", "cat-snapshot", "cat-skin-equip", "cat-skin-unlock", "equipment-upgrade", "research-state", "research-unlock", "building-state", "building-upgrade"]);
    }

    public async Task<ResourceStateDto?> GetResourcesAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        return ToResourceStateDto(resources);
    }

    public async Task<IReadOnlyList<ResourceTransactionDto>?> GetResourceTransactionsAsync(Guid playerId, int limit, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var transactions = await repository.GetResourceTransactionsAsync(playerId, limit, cancellationToken);
        return transactions.Select(ToResourceTransactionDto).ToArray();
    }

    public async Task<DailyOrderDto?> GetDailyOrderAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        var state = await repository.EnsureDailyOrderStateAsync(
            playerId,
            ToUtcDate(now),
            DailyOrderInitialProgress,
            now,
            cancellationToken);
        return ToDailyOrderDto(state, now);
    }

    public async Task<DailyOrderClaimResponse?> ClaimDailyOrderAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        var orderDate = ToUtcDate(now);
        await repository.EnsureDailyOrderStateAsync(
            playerId,
            orderDate,
            DailyOrderInitialProgress,
            now,
            cancellationToken);
        var claimed = await repository.ClaimDailyOrderAsync(
            playerId,
            orderDate,
            DailyOrderTarget,
            now,
            cancellationToken);
        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        if (claimed)
        {
            resources.Coin += DailyOrderRewardCoin;
            resources.ResearchPoint += DailyOrderRewardResearchPoint;
            resources.UpdatedAt = now;
            await AddResourceTransactionAsync(
                playerId,
                "daily_order_claim",
                orderDate.ToString(),
                null,
                DailyOrderRewardCoin,
                0,
                0,
                0,
                DailyOrderRewardResearchPoint,
                resources,
                cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
        }

        var state = await repository.EnsureDailyOrderStateAsync(
            playerId,
            orderDate,
            DailyOrderInitialProgress,
            now,
            cancellationToken);
        var order = ToDailyOrderDto(state, now);
        if (claimed && !order.Claimed)
        {
            order = order with { Claimed = true, Claimable = false, UpdatedAt = now.ToUnixTimeMilliseconds() };
        }
        return new DailyOrderClaimResponse(
            claimed,
            order,
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            claimed ? null : order.Claimed ? "already_claimed" : "order_not_complete");
    }

    public ProductionPreviewResponse PreviewProduction(ProductionPreviewRequest request)
    {
        return PreviewProduction(request, ProductionModifiers.None);
    }

    public async Task<ProductionPreviewResponse> PreviewProductionAsync(Guid? playerId, ProductionPreviewRequest request, CancellationToken cancellationToken)
    {
        if (playerId is null || await repository.FindPlayerByIdAsync(playerId.Value, cancellationToken) is null)
        {
            return PreviewProduction(request);
        }

        var modifiers = request.IncludesClientModifiers
            ? ProductionModifiers.None
            : await GetProductionModifiersAsync(playerId.Value, cancellationToken);
        return PreviewProduction(request, modifiers);
    }

    public async Task<ProductionPreviewResponse?> PreviewServerProductionAsync(Guid playerId, CancellationToken cancellationToken)
    {
        var player = await repository.FindPlayerByIdAsync(playerId, cancellationToken);
        if (player is null)
        {
            return null;
        }

        await EnsureDefaultCatStateAsync(playerId, cancellationToken);
        await EnsureDefaultBuildingStatesAsync(playerId, cancellationToken);

        var cats = (await repository.GetCatStatesAsync(playerId, cancellationToken))
            .Where(cat => cat.IsUnlocked)
            .ToArray();
        var buildings = await repository.GetBuildingStatesAsync(playerId, cancellationToken);
        var researchProductionPercent = await GetResearchBonusAsync(playerId, "coin_production_mult", cancellationToken);
        var researchProductionAdd = await GetResearchBonusAsync(playerId, "coin_production_add", cancellationToken);
        var beanReduceResearch = await GetResearchBonusAsync(playerId, "bean_reduce", cancellationToken);

        var productionBonus = PercentToMultiplier(GetBuildingEffectValue(buildings, "base_production"));
        var priceBonus = PercentToMultiplier(GetBuildingEffectValue(buildings, "coffee_price"));
        var orderBonus = PercentToMultiplier(GetBuildingEffectValue(buildings, "order_coin"));
        var globalBonus = PercentToMultiplier(GetBuildingEffectValue(buildings, "salary_reduce"));
        var beanReduceBuilding = Math.Max(0, -GetBuildingEffectValue(buildings, "ferment_efficiency"));
        var friendBoostMultiplier = PercentToMultiplier(GetActiveFriendBoostPercent(player, DateTimeOffset.UtcNow));
        var coinMultiplier = productionBonus * priceBonus * orderBonus * globalBonus * friendBoostMultiplier;
        var beanMultiplier = Math.Max(0.1, 1 - (beanReduceBuilding + beanReduceResearch) / 100.0);

        var buildingPreviews = new List<ProductionBuildingPreviewDto>();
        foreach (var building in buildings.OrderBy(item => balance.BuildingDefinitions.TryGetValue(item.BuildingKey, out var definition) ? definition.Floor : item.BuildingKey))
        {
            var assigned = cats
                .Where(cat => string.Equals(NormalizeExistingBuildingId(cat.AssignedBuildingKey), building.BuildingKey, StringComparison.Ordinal))
                .Where(cat => balance.CatDefinitions.ContainsKey(cat.CatKey))
                .ToArray();
            var assignedDefinitions = assigned.Select(cat => balance.CatDefinitions[cat.CatKey]).ToArray();
            var grossBase = assigned.Sum(cat => CalculateServerCatProduction(cat, assignedDefinitions, researchProductionPercent, researchProductionAdd));
            var wagePerMinute = assigned.Sum(CalculateServerCatWageCost);
            var beanBase = assigned.Sum(CalculateServerCatBeanCost);
            var gross = Math.Max(0, grossBase * coinMultiplier);
            var wage = Math.Max(0, wagePerMinute / 60.0);
            var bean = Math.Max(0, beanBase * beanMultiplier);
            buildingPreviews.Add(new ProductionBuildingPreviewDto(
                building.BuildingKey,
                gross,
                wage,
                Math.Max(0, gross - wage),
                bean));
        }

        return new ProductionPreviewResponse(
            buildingPreviews.Sum(item => item.GrossCoinPerSecond),
            buildingPreviews.Sum(item => item.WageCostPerSecond),
            buildingPreviews.Sum(item => item.NetCoinPerSecond),
            buildingPreviews.Sum(item => item.BeanCostPerSecond),
            buildingPreviews);
    }

    private static ProductionPreviewResponse PreviewProduction(ProductionPreviewRequest request, ProductionModifiers modifiers)
    {
        var grossMultiplier = Math.Max(0, 1 + modifiers.GrossCoinPercent / 100.0);
        var wageMultiplier = Math.Clamp(1 + modifiers.WageCostPercent / 100.0, 0.1, 3);
        var beanMultiplier = Math.Clamp(1 - modifiers.BeanCostReducePercent / 100.0, 0.1, 1);
        var gross = NonNegative(request.GrossCoinPerSecond) * grossMultiplier + Math.Max(0, modifiers.GrossCoinAdd);
        var wage = NonNegative(request.WageCostPerSecond) * wageMultiplier;
        var bean = NonNegative(request.BeanCostPerSecond) * beanMultiplier;
        var buildings = (request.Buildings ?? [])
            .Select(building =>
            {
                var buildingGross = NonNegative(building.GrossCoinPerSecond) * grossMultiplier;
                var buildingWage = NonNegative(building.WageCostPerSecond) * wageMultiplier;
                return new ProductionBuildingPreviewDto(
                    string.IsNullOrWhiteSpace(building.BuildingId) ? "unknown" : building.BuildingId.Trim(),
                    buildingGross,
                    buildingWage,
                    Math.Max(0, buildingGross - buildingWage),
                    NonNegative(building.BeanCostPerSecond) * beanMultiplier);
            })
            .ToArray();

        return new ProductionPreviewResponse(
            gross,
            wage,
            Math.Max(0, gross - wage),
            bean,
            buildings);
    }

    private static double PercentToMultiplier(double percent)
    {
        return Math.Max(0, 1 + percent / 100.0);
    }

    public async Task<LaunchResponse> LaunchAsync(Guid playerId, LaunchRequest request, CancellationToken cancellationToken)
    {
        var gate = LaunchSettlementGates.GetOrAdd(playerId, static _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync(cancellationToken);
        try
        {
            return await LaunchCoreAsync(playerId, request, cancellationToken);
        }
        finally
        {
            gate.Release();
        }
    }

    private async Task<LaunchResponse> LaunchCoreAsync(Guid playerId, LaunchRequest request, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return CreateRejectedLaunch(request, "player_not_found");
        }

        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        var now = DateTimeOffset.UtcNow;
        var orderDate = ToUtcDate(now);
        var dailyState = await repository.EnsureDailyOrderStateAsync(
            playerId,
            orderDate,
            DailyOrderInitialProgress,
            now,
            cancellationToken);
        var dailyOrder = ToDailyOrderDto(dailyState, now);
        var clientRequestId = NormalizeClientRequestId(request.ClientRequestId);
        var existing = await repository.GetLaunchRecordAsync(playerId, clientRequestId, cancellationToken);
        if (existing is not null)
        {
            return ToLaunchResponse(existing, resources, dailyOrder);
        }

        var requestedSeconds = Math.Clamp(request.LaunchSeconds, 0, 600);
        if (requestedSeconds <= 0)
        {
            return CreateRejectedLaunch(request, "invalid_launch_seconds", resources, dailyOrder: dailyOrder);
        }

        var preview = await PreviewServerProductionAsync(playerId, cancellationToken)
            ?? PreviewProduction(request.Production, ProductionModifiers.None);
        if (preview.NetCoinPerSecond <= 0)
        {
            return CreateRejectedLaunch(request, "no_net_production", resources, requestedSeconds, preview, dailyOrder);
        }

        var availableBean = NonNegative(resources.Bean);
        var maxSecondsByBean = preview.BeanCostPerSecond > 0
            ? availableBean / preview.BeanCostPerSecond
            : requestedSeconds;
        var productiveSeconds = Math.Max(0, Math.Min(requestedSeconds, maxSecondsByBean));
        if (productiveSeconds <= 0)
        {
            return CreateRejectedLaunch(request, "bean_not_enough", resources, requestedSeconds, preview, dailyOrder);
        }

        var coinGained = (int)Math.Floor(preview.NetCoinPerSecond * productiveSeconds);
        var beanSpent = (int)Math.Ceiling(preview.BeanCostPerSecond * productiveSeconds);
        if (coinGained <= 0 && beanSpent <= 0)
        {
            return CreateRejectedLaunch(request, "settlement_empty", resources, requestedSeconds, preview, dailyOrder);
        }

        var advancedDailyState = await repository.TryAdvanceDailyLaunchAsync(
            playerId,
            orderDate,
            DailyOrderInitialProgress,
            DailyOrderTarget,
            DailyLaunchLimit,
            now,
            cancellationToken);
        if (advancedDailyState is null)
        {
            dailyState = await repository.EnsureDailyOrderStateAsync(
                playerId,
                orderDate,
                DailyOrderInitialProgress,
                now,
                cancellationToken);
            return CreateRejectedLaunch(
                request,
                "daily_launch_limit_reached",
                resources,
                requestedSeconds,
                preview,
                ToDailyOrderDto(dailyState, now));
        }

        resources.Coin = Math.Max(0, resources.Coin + coinGained);
        resources.Bean = Math.Max(0, resources.Bean - beanSpent);
        resources.UpdatedAt = now;
        await AddResourceTransactionAsync(
            playerId,
            "launch",
            clientRequestId,
            clientRequestId,
            coinGained,
            -beanSpent,
            0,
            0,
            0,
            resources,
            cancellationToken);
        var record = new PlayerLaunchRecord
        {
            PlayerId = playerId,
            ClientRequestId = clientRequestId,
            LaunchKey = CreateLaunchId(clientRequestId),
            RequestedSeconds = requestedSeconds,
            ProductiveSeconds = productiveSeconds,
            CoinGained = coinGained,
            BeanSpent = beanSpent,
            NetCoinPerSecond = preview.NetCoinPerSecond,
            WageCostPerSecond = preview.WageCostPerSecond,
            BeanCostPerSecond = preview.BeanCostPerSecond,
            CreatedAt = now,
        };
        await repository.AddLaunchRecordAsync(record, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return ToLaunchResponse(record, resources, ToDailyOrderDto(advancedDailyState, now));
    }

    public async Task<SaveSyncResponse> SyncSaveAsync(Guid playerId, SaveSyncRequest request, CancellationToken cancellationToken)
    {
        var player = await repository.FindPlayerByIdAsync(playerId, cancellationToken);
        if (player is null)
        {
            return new SaveSyncResponse(false, null, "player_not_found");
        }

        var saveJson = request.Save.ToJsonString(new JsonSerializerOptions { WriteIndented = false });
        await repository.SaveSnapshotAsync(new PlayerSaveSnapshot
        {
            PlayerId = playerId,
            ClientVersion = request.ClientVersion,
            LocalUpdatedAt = request.LocalUpdatedAt,
            SaveJson = saveJson,
            SyncedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);
        player.UpdatedAt = DateTimeOffset.UtcNow;
        await repository.SaveChangesAsync(cancellationToken);

        return new SaveSyncResponse(true, request.Save);
    }

    public async Task<JsonObject?> GetSaveAsync(Guid playerId, CancellationToken cancellationToken)
    {
        var snapshot = await repository.GetLatestSnapshotAsync(playerId, cancellationToken);
        return snapshot is null ? null : JsonNode.Parse(snapshot.SaveJson)?.AsObject();
    }

    public async Task<IReadOnlyList<MailDto>> GetMailAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return [];
        }

        await EnsureDefaultMailAsync(playerId, cancellationToken);
        var mails = await repository.GetMailsAsync(playerId, cancellationToken);
        return mails
            .OrderByDescending(mail => mail.CreatedAt)
            .Select(ToMailDto)
            .ToArray();
    }

    public async Task<ClaimMailResponse?> ClaimMailAsync(Guid playerId, string mailId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        await EnsureDefaultMailAsync(playerId, cancellationToken);
        var mail = await repository.GetMailAsync(playerId, mailId, cancellationToken);
        if (mail is null || mail.IsClaimed)
        {
            return null;
        }

        mail.IsClaimed = true;
        mail.ClaimedAt = DateTimeOffset.UtcNow;
        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        resources.Coin = Math.Max(0, resources.Coin + mail.RewardCoin);
        resources.CatFood = Math.Max(0, resources.CatFood + mail.RewardCatFood);
        resources.Diamond = Math.Max(0, resources.Diamond + mail.RewardDiamond);
        resources.UpdatedAt = DateTimeOffset.UtcNow;
        await AddResourceTransactionAsync(
            playerId,
            "mail_claim",
            mail.MailKey,
            null,
            mail.RewardCoin,
            0,
            mail.RewardCatFood,
            mail.RewardDiamond,
            0,
            resources,
            cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return new ClaimMailResponse(
            mail.MailKey,
            true,
            mail.RewardCoin,
            mail.RewardCatFood,
            mail.RewardDiamond,
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint);
    }

    public async Task<ShopPurchaseResponse?> PurchaseShopItemAsync(Guid playerId, ShopPurchaseRequest request, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        if (!ShopItems.TryGetValue(request.ShopItemId, out var item))
        {
            return null;
        }

        var today = ToUtcDate(DateTimeOffset.UtcNow);
        var history = await repository.GetShopPurchaseHistoryAsync(playerId, item.ShopItemId, today, cancellationToken);
        var purchasedToday = history?.Count ?? 0;
        var remainingBeforePurchase = item.LimitDaily > 0 ? Math.Max(0, item.LimitDaily - purchasedToday) : 99;
        var count = Math.Clamp(request.Count, 1, item.LimitDaily > 0 ? item.LimitDaily : 99);
        if (remainingBeforePurchase < count)
        {
            return null;
        }

        var pricePaid = item.PriceAmount * count;
        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        if (!CanSpendResource(resources, item.PriceType, pricePaid))
        {
            return null;
        }

        SpendResource(resources, item.PriceType, pricePaid);
        resources.UpdatedAt = DateTimeOffset.UtcNow;
        await AddResourceTransactionAsync(
            playerId,
            "shop_purchase",
            item.ShopItemId,
            null,
            item.PriceType == "coin" ? -pricePaid : 0,
            item.PriceType == "bean" ? -pricePaid : 0,
            item.PriceType == "catFood" ? -pricePaid : 0,
            item.PriceType == "diamond" ? -pricePaid : 0,
            item.PriceType == "researchPoint" ? -pricePaid : 0,
            resources,
            cancellationToken);
        if (history is null)
        {
            history = new PlayerShopPurchaseHistory
            {
                PlayerId = playerId,
                ShopItemId = item.ShopItemId,
                PurchaseDate = today,
                Count = count,
                UpdatedAt = DateTimeOffset.UtcNow,
            };
            await repository.AddShopPurchaseHistoryAsync(history, cancellationToken);
        }
        else
        {
            history.Count += count;
            history.UpdatedAt = DateTimeOffset.UtcNow;
        }
        await repository.SaveChangesAsync(cancellationToken);

        return new ShopPurchaseResponse(
            item.ShopItemId,
            item.ItemId,
            count,
            item.LimitDaily > 0 ? Math.Max(0, item.LimitDaily - history.Count) : 99,
            item.PriceType,
            pricePaid,
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            resources.UpdatedAt.ToUnixTimeMilliseconds());
    }

    public async Task<IReadOnlyList<ShopStateDto>?> GetShopStateAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var today = ToUtcDate(DateTimeOffset.UtcNow);
        var states = new List<ShopStateDto>();
        foreach (var item in ShopItems.Values.OrderBy(item => item.ShopItemId))
        {
            var history = await repository.GetShopPurchaseHistoryAsync(playerId, item.ShopItemId, today, cancellationToken);
            var purchasedToday = Math.Max(0, history?.Count ?? 0);
            var remainingDaily = item.LimitDaily > 0 ? Math.Max(0, item.LimitDaily - purchasedToday) : 99;
            states.Add(new ShopStateDto(
                item.ShopItemId,
                item.ItemId,
                item.PriceType,
                item.PriceAmount,
                item.LimitDaily,
                purchasedToday,
                remainingDaily,
                history?.UpdatedAt.ToUnixTimeMilliseconds() ?? 0));
        }

        return states;
    }

    public async Task<CatUpgradeResponse?> UpgradeCatAsync(Guid playerId, CatUpgradeRequest request, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var catId = string.IsNullOrWhiteSpace(request.CatId) ? "" : request.CatId.Trim();
        if (!balance.CatDefinitions.ContainsKey(catId))
        {
            return null;
        }

        var cat = await EnsureCatStateAsync(playerId, catId, cancellationToken);
        if (!cat.IsUnlocked || cat.Level >= 30)
        {
            return null;
        }

        var cost = await CalculateCatUpgradeCostAsync(playerId, cat.Level, cancellationToken);
        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        if (!CanSpendResource(resources, "coin", cost))
        {
            return null;
        }

        var previousLevel = cat.Level;
        SpendResource(resources, "coin", cost);
        resources.UpdatedAt = DateTimeOffset.UtcNow;
        cat.Level += 1;
        cat.UpdatedAt = DateTimeOffset.UtcNow;
        await AddResourceTransactionAsync(
            playerId,
            "cat_upgrade",
            cat.CatKey,
            null,
            -cost,
            0,
            0,
            0,
            0,
            resources,
            cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return new CatUpgradeResponse(
            cat.CatKey,
            cat.Level,
            previousLevel,
            cost,
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            cat.UpdatedAt.ToUnixTimeMilliseconds());
    }

    public async Task<CatFeedResponse?> FeedCatAsync(Guid playerId, CatFeedRequest request, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var catId = string.IsNullOrWhiteSpace(request.CatId) ? "" : request.CatId.Trim();
        if (!balance.CatDefinitions.ContainsKey(catId))
        {
            return null;
        }

        var cat = await EnsureCatStateAsync(playerId, catId, cancellationToken);
        if (!cat.IsUnlocked || cat.Weight >= MaxCatWeight)
        {
            return null;
        }

        var cost = CalculateCatFeedCost(cat);
        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        if (!CanSpendResource(resources, "catFood", cost))
        {
            return null;
        }

        var previousWeight = cat.Weight;
        SpendResource(resources, "catFood", cost);
        resources.UpdatedAt = DateTimeOffset.UtcNow;
        cat.Weight = Math.Min(MaxCatWeight, cat.Weight + 1);
        cat.UpdatedAt = DateTimeOffset.UtcNow;
        await AddResourceTransactionAsync(
            playerId,
            "cat_feed",
            cat.CatKey,
            null,
            0,
            0,
            -cost,
            0,
            0,
            resources,
            cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return new CatFeedResponse(
            cat.CatKey,
            cat.Weight,
            previousWeight,
            cost,
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            cat.UpdatedAt.ToUnixTimeMilliseconds());
    }

    public async Task<CatUnlockResponse?> UnlockCatAsync(Guid playerId, CatUnlockRequest request, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var catId = string.IsNullOrWhiteSpace(request.CatId) ? "" : request.CatId.Trim();
        if (!balance.CatDefinitions.ContainsKey(catId))
        {
            return null;
        }

        var cat = await EnsureCatStateAsync(playerId, catId, cancellationToken);
        if (cat.IsUnlocked)
        {
            return null;
        }

        var cost = CalculateCatUnlockCost(cat.CatKey);
        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        if (!CanSpendResource(resources, "coin", cost))
        {
            return null;
        }

        SpendResource(resources, "coin", cost);
        resources.UpdatedAt = DateTimeOffset.UtcNow;
        cat.IsUnlocked = true;
        cat.Level = Math.Max(1, cat.Level);
        cat.Weight = GetCatBaseWeight(cat.CatKey);
        cat.UpdatedAt = DateTimeOffset.UtcNow;
        await AddResourceTransactionAsync(
            playerId,
            "cat_unlock",
            cat.CatKey,
            null,
            -cost,
            0,
            0,
            0,
            0,
            resources,
            cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return new CatUnlockResponse(
            cat.CatKey,
            cat.IsUnlocked,
            cat.Level,
            cat.Weight,
            cost,
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            cat.UpdatedAt.ToUnixTimeMilliseconds());
    }

    public async Task<EquipmentUpgradeResponse?> UpgradeEquipmentAsync(Guid playerId, string catId, string itemId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        catId = string.IsNullOrWhiteSpace(catId) ? "" : catId.Trim();
        itemId = string.IsNullOrWhiteSpace(itemId) ? "" : itemId.Trim();
        if (!balance.CatDefinitions.ContainsKey(catId) || !balance.EquipmentDefinitions.TryGetValue(itemId, out var definition))
        {
            return null;
        }

        var cat = await EnsureCatStateAsync(playerId, catId, cancellationToken);
        if (!cat.IsUnlocked)
        {
            return null;
        }

        var equipment = ReadStringMap(cat.EquipmentJson);
        var levels = ReadIntMap(cat.EquipmentLevelsJson);
        if (!equipment.Values.Contains(itemId))
        {
            return null;
        }

        var previousLevel = Math.Clamp(levels.GetValueOrDefault(itemId, 1), 1, definition.MaxLevel);
        if (previousLevel >= definition.MaxLevel)
        {
            return null;
        }

        var cost = CalculateEquipmentUpgradeCost(definition, previousLevel);
        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        if (!CanSpendResource(resources, "coin", cost))
        {
            return null;
        }

        SpendResource(resources, "coin", cost);
        resources.UpdatedAt = DateTimeOffset.UtcNow;
        levels[itemId] = previousLevel + 1;
        cat.EquipmentLevelsJson = JsonSerializer.Serialize(levels);
        cat.UpdatedAt = DateTimeOffset.UtcNow;
        await AddResourceTransactionAsync(
            playerId,
            "equipment_upgrade",
            itemId,
            null,
            -cost,
            0,
            0,
            0,
            0,
            resources,
            cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return new EquipmentUpgradeResponse(
            cat.CatKey,
            definition.Slot,
            itemId,
            previousLevel + 1,
            previousLevel,
            definition.MaxLevel,
            cost,
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            cat.UpdatedAt.ToUnixTimeMilliseconds());
    }

    public async Task<IReadOnlyList<CatStateDto>> GetCatsAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return [];
        }

        var cats = new List<CatStateDto>();
        foreach (var catId in balance.CatDefinitions.Keys)
        {
            var cat = await EnsureCatStateAsync(playerId, catId, cancellationToken);
            cats.Add(ToCatStateDto(cat));
        }
        return cats;
    }

    public async Task<CatSkinEquipResponse?> EquipCatSkinAsync(
        Guid playerId,
        string catId,
        string skinId,
        CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        catId = string.IsNullOrWhiteSpace(catId) ? "" : catId.Trim();
        skinId = string.IsNullOrWhiteSpace(skinId) ? "" : skinId.Trim().ToLowerInvariant();
        if (!balance.CatDefinitions.ContainsKey(catId) || !CatSkinIds.Contains(skinId))
        {
            return null;
        }

        var cat = await EnsureCatStateAsync(playerId, catId, cancellationToken);
        var ownedSkinIds = EnsureCatSkinDefaults(cat);
        if (!cat.IsUnlocked || !ownedSkinIds.Contains(skinId, StringComparer.Ordinal))
        {
            return null;
        }

        cat.EquippedSkinKey = skinId;
        cat.UpdatedAt = DateTimeOffset.UtcNow;
        await repository.SaveChangesAsync(cancellationToken);
        return new CatSkinEquipResponse(
            cat.CatKey,
            cat.EquippedSkinKey,
            ownedSkinIds,
            cat.UpdatedAt.ToUnixTimeMilliseconds());
    }

    public async Task<IReadOnlyList<CatSkinCatalogItemDto>?> GetCatSkinCatalogAsync(
        Guid playerId,
        string catId,
        CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null
            || !balance.CatDefinitions.ContainsKey(catId))
        {
            return null;
        }

        var cat = await EnsureCatStateAsync(playerId, catId, cancellationToken);
        var ownedSkinIds = EnsureCatSkinDefaults(cat);
        return CatSkinCatalog
            .Select(item => new CatSkinCatalogItemDto(
                item.SkinId,
                item.Name,
                item.Description,
                item.PriceType,
                item.PriceAmount,
                ownedSkinIds.Contains(item.SkinId, StringComparer.Ordinal),
                catId == DefaultCatId && item.Purchasable))
            .ToArray();
    }

    public async Task<CatSkinUnlockResponse?> UnlockCatSkinAsync(
        Guid playerId,
        string catId,
        string skinId,
        CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        catId = string.IsNullOrWhiteSpace(catId) ? "" : catId.Trim();
        skinId = string.IsNullOrWhiteSpace(skinId) ? "" : skinId.Trim().ToLowerInvariant();
        var definition = CatSkinCatalog.FirstOrDefault(item =>
            string.Equals(item.SkinId, skinId, StringComparison.Ordinal));
        if (catId != DefaultCatId || definition is null || !definition.Purchasable)
        {
            return null;
        }

        var gate = CatSkinUnlockGates.GetOrAdd(playerId, static _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync(cancellationToken);
        try
        {
            var cat = await EnsureCatStateAsync(playerId, catId, cancellationToken);
            var ownedSkinIds = EnsureCatSkinDefaults(cat).ToList();
            if (!cat.IsUnlocked || ownedSkinIds.Contains(skinId, StringComparer.Ordinal))
            {
                return null;
            }

            var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
            if (!CanSpendResource(resources, definition.PriceType, definition.PriceAmount))
            {
                return null;
            }

            var now = DateTimeOffset.UtcNow;
            SpendResource(resources, definition.PriceType, definition.PriceAmount);
            resources.UpdatedAt = now;
            ownedSkinIds.Add(skinId);
            cat.OwnedSkinsJson = JsonSerializer.Serialize(ownedSkinIds);
            cat.EquippedSkinKey = skinId;
            cat.UpdatedAt = now;
            await AddResourceTransactionAsync(
                playerId,
                "cat_skin_unlock",
                skinId,
                catId,
                definition.PriceType == "coin" ? -definition.PriceAmount : 0,
                definition.PriceType == "bean" ? -definition.PriceAmount : 0,
                definition.PriceType == "catFood" ? -definition.PriceAmount : 0,
                definition.PriceType == "diamond" ? -definition.PriceAmount : 0,
                definition.PriceType == "researchPoint" ? -definition.PriceAmount : 0,
                resources,
                cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return new CatSkinUnlockResponse(
                cat.CatKey,
                skinId,
                cat.EquippedSkinKey,
                ownedSkinIds,
                definition.PriceType,
                definition.PriceAmount,
                resources.Coin,
                resources.Bean,
                resources.CatFood,
                resources.Diamond,
                resources.ResearchPoint,
                now.ToUnixTimeMilliseconds());
        }
        finally
        {
            gate.Release();
        }
    }

    public async Task<CatAssignmentResponse?> AssignCatAsync(Guid playerId, string catId, CatAssignmentRequest request, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        catId = string.IsNullOrWhiteSpace(catId) ? "" : catId.Trim();
        if (!balance.CatDefinitions.ContainsKey(catId))
        {
            return null;
        }

        var cat = await EnsureCatStateAsync(playerId, catId, cancellationToken);
        if (!cat.IsUnlocked)
        {
            return null;
        }

        if (!TryNormalizeAssignedBuildingId(request.BuildingId, out var buildingId))
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(buildingId))
        {
            var assignedCats = await repository.GetCatStatesAsync(playerId, cancellationToken);
            var assignedCount = assignedCats.Count(item =>
                item.IsUnlocked
                && item.CatKey != cat.CatKey
                && string.Equals(NormalizeExistingBuildingId(item.AssignedBuildingKey), buildingId, StringComparison.Ordinal));
            var buildingState = await EnsureBuildingStateAsync(playerId, buildingId, cancellationToken);
            if (assignedCount >= GetBuildingScheduleCapacity(buildingId, buildingState.Level))
            {
                return null;
            }
        }

        cat.AssignedBuildingKey = buildingId;
        cat.UpdatedAt = DateTimeOffset.UtcNow;
        await repository.SaveChangesAsync(cancellationToken);

        return new CatAssignmentResponse(
            cat.CatKey,
            cat.AssignedBuildingKey,
            cat.UpdatedAt.ToUnixTimeMilliseconds());
    }

    public async Task<IReadOnlyList<BuildingStateDto>> GetBuildingsAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return [];
        }

        await EnsureDefaultBuildingStatesAsync(playerId, cancellationToken);
        var states = await repository.GetBuildingStatesAsync(playerId, cancellationToken);
        return states
            .Where(state => balance.BuildingDefinitions.ContainsKey(state.BuildingKey))
            .Select(ToBuildingStateDto)
            .ToArray();
    }

    public async Task<BuildingUpgradeResponse?> UpgradeBuildingAsync(Guid playerId, string buildingId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        if (!TryNormalizeAssignedBuildingId(buildingId, out var normalizedBuildingId) || string.IsNullOrWhiteSpace(normalizedBuildingId))
        {
            return null;
        }

        var definition = balance.BuildingDefinitions[normalizedBuildingId];
        var state = await EnsureBuildingStateAsync(playerId, normalizedBuildingId, cancellationToken);
        if (state.Level >= definition.MaxLevel)
        {
            return null;
        }

        var cost = CalculateBuildingUpgradeCost(definition, state.Level);
        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        if (!CanSpendResource(resources, "coin", cost))
        {
            return null;
        }

        var previousLevel = state.Level;
        SpendResource(resources, "coin", cost);
        resources.UpdatedAt = DateTimeOffset.UtcNow;
        state.Level = Math.Min(definition.MaxLevel, state.Level + 1);
        state.UpdatedAt = DateTimeOffset.UtcNow;
        await AddResourceTransactionAsync(
            playerId,
            "building_upgrade",
            state.BuildingKey,
            null,
            -cost,
            0,
            0,
            0,
            0,
            resources,
            cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return new BuildingUpgradeResponse(
            state.BuildingKey,
            state.Level,
            previousLevel,
            definition.MaxLevel,
            cost,
            CalculateBuildingEffectValue(definition, state.Level),
            state.Level >= definition.MaxLevel ? 0 : CalculateBuildingUpgradeCost(definition, state.Level),
            GetBuildingScheduleCapacity(state.BuildingKey, state.Level),
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            state.UpdatedAt.ToUnixTimeMilliseconds());
    }

    public async Task<IReadOnlyList<ResearchStateDto>> GetResearchAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return [];
        }

        var research = new List<ResearchStateDto>();
        foreach (var researchId in balance.ResearchDefinitions.Keys)
        {
            var state = await EnsureResearchStateAsync(playerId, researchId, cancellationToken);
            research.Add(ToResearchStateDto(state));
        }
        return research;
    }

    public async Task<ResearchUnlockResponse?> UnlockResearchAsync(Guid playerId, ResearchUnlockRequest request, CancellationToken cancellationToken)
    {
        var gate = ResearchUnlockGates.GetOrAdd(playerId, _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync(cancellationToken);
        try
        {
            return await UnlockResearchCoreAsync(playerId, request, cancellationToken);
        }
        finally
        {
            gate.Release();
        }
    }

    private async Task<ResearchUnlockResponse?> UnlockResearchCoreAsync(
        Guid playerId,
        ResearchUnlockRequest request,
        CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var researchId = string.IsNullOrWhiteSpace(request.ResearchId) ? "" : request.ResearchId.Trim();
        if (!balance.ResearchDefinitions.TryGetValue(researchId, out var definition))
        {
            return null;
        }

        var state = await EnsureResearchStateAsync(playerId, researchId, cancellationToken);
        if (state.Level >= definition.MaxLevel)
        {
            return null;
        }

        foreach (var parentResearchId in definition.GetParentResearchIds())
        {
            if (!await IsResearchUnlockedAsync(playerId, parentResearchId, cancellationToken))
            {
                return null;
            }
        }

        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        var nextCost = definition.GetNextCost(state.Level);
        if (!CanSpendResource(resources, "researchPoint", nextCost))
        {
            return null;
        }

        var previousLevel = state.Level;
        SpendResource(resources, "researchPoint", nextCost);
        resources.UpdatedAt = DateTimeOffset.UtcNow;
        state.Level += 1;
        state.IsUnlocked = true;
        state.UpdatedAt = DateTimeOffset.UtcNow;
        await AddResourceTransactionAsync(
            playerId,
            previousLevel == 0 ? "research_unlock" : "research_upgrade",
            state.ResearchKey,
            null,
            0,
            0,
            0,
            0,
            -nextCost,
            resources,
            cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return new ResearchUnlockResponse(
            state.ResearchKey,
            state.IsUnlocked,
            previousLevel,
            state.Level,
            definition.MaxLevel,
            nextCost,
            definition.GetEffectValue(state.Level),
            definition.GetEffectValue(Math.Min(state.Level + 1, definition.MaxLevel)),
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            state.UpdatedAt.ToUnixTimeMilliseconds());
    }

    public async Task<IReadOnlyList<FriendDto>> GetFriendsAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return [];
        }

        await EnsureDefaultFriendsAsync(playerId, cancellationToken);
        await RefreshRealFriendSnapshotsAsync(playerId, cancellationToken);
        var friends = await repository.GetFriendsAsync(playerId, cancellationToken);
        var orderedFriends = friends
            .OrderByDescending(friend => friend.IncomePerSecond)
            .ToArray();
        var result = new List<FriendDto>(orderedFriends.Length);
        foreach (var friend in orderedFriends)
        {
            result.Add(await ToFriendDtoAsync(friend, cancellationToken));
        }
        return result;
    }

    public async Task<FriendDto?> GetFriendAsync(Guid playerId, string friendId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        await EnsureDefaultFriendsAsync(playerId, cancellationToken);
        var friend = await repository.GetFriendAsync(playerId, friendId, cancellationToken);
        if (friend is null)
        {
            return null;
        }

        if (TryGetRealFriendPlayerId(friend.FriendKey, out var friendPlayerId))
        {
            var friendPlayer = await repository.FindPlayerByIdAsync(friendPlayerId, cancellationToken);
            if (friendPlayer is not null)
            {
                await RefreshFriendSnapshotFromPlayerAsync(friend, friendPlayer, cancellationToken);
                await repository.SaveChangesAsync(cancellationToken);
            }
        }

        return await ToFriendDtoAsync(friend, cancellationToken);
    }

    public async Task<IReadOnlyList<DecorStateDto>?> GetDecorationsAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        await EnsureDefaultDecorStatesAsync(playerId, cancellationToken);
        var decorations = await repository.GetDecorStatesAsync(playerId, cancellationToken);
        return decorations.Select(ToDecorStateDto).ToArray();
    }

    public async Task<IReadOnlyList<DecorCatalogItemDto>?> GetDecorCatalogAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        await EnsureDefaultDecorStatesAsync(playerId, cancellationToken);
        var ownedIds = (await repository.GetDecorStatesAsync(playerId, cancellationToken))
            .Select(decor => decor.DecorKey)
            .ToHashSet(StringComparer.Ordinal);
        return DecorCatalog
            .Select(item => new DecorCatalogItemDto(
                item.DecorId,
                item.Name,
                item.Description,
                item.DefaultBuildingId,
                item.Score,
                item.PriceType,
                item.PriceAmount,
                ownedIds.Contains(item.DecorId)))
            .ToArray();
    }

    public async Task<DecorPurchaseResponse?> PurchaseDecorationAsync(
        Guid playerId,
        string decorId,
        CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var definition = DecorCatalog.FirstOrDefault(item => string.Equals(item.DecorId, decorId, StringComparison.Ordinal));
        if (definition is null || await repository.GetDecorStateAsync(playerId, definition.DecorId, cancellationToken) is not null)
        {
            return null;
        }

        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        if (!CanSpendResource(resources, definition.PriceType, definition.PriceAmount))
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        var decor = new PlayerDecorState
        {
            PlayerId = playerId,
            DecorKey = definition.DecorId,
            BuildingKey = definition.DefaultBuildingId,
            Name = definition.Name,
            Score = definition.Score,
            IsPlaced = false,
            UpdatedAt = now,
        };
        if (!await repository.AddDecorIfMissingAsync(decor, cancellationToken))
        {
            return null;
        }

        SpendResource(resources, definition.PriceType, definition.PriceAmount);
        resources.UpdatedAt = now;
        await AddResourceTransactionAsync(
            playerId,
            "decor_purchase",
            definition.DecorId,
            definition.DefaultBuildingId,
            definition.PriceType == "coin" ? -definition.PriceAmount : 0,
            definition.PriceType == "bean" ? -definition.PriceAmount : 0,
            definition.PriceType == "catFood" ? -definition.PriceAmount : 0,
            definition.PriceType == "diamond" ? -definition.PriceAmount : 0,
            definition.PriceType == "researchPoint" ? -definition.PriceAmount : 0,
            resources,
            cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return new DecorPurchaseResponse(
            ToDecorStateDto(decor),
            definition.PriceType,
            definition.PriceAmount,
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            now.ToUnixTimeMilliseconds());
    }

    public async Task<DecorCollectionDto?> GetDecorCollectionAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        await EnsureDefaultDecorStatesAsync(playerId, cancellationToken);
        var decorations = await repository.GetDecorStatesAsync(playerId, cancellationToken);
        var state = await repository.GetDecorCollectionStateAsync(playerId, cancellationToken);
        return ToDecorCollectionDto(decorations, state?.ClaimedTierMask ?? 0, DateTimeOffset.UtcNow);
    }

    public async Task<DecorCollectionClaimResponse?> ClaimDecorCollectionTierAsync(
        Guid playerId,
        string tierId,
        CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var tier = DecorCollectionTiers.FirstOrDefault(item => string.Equals(item.TierId, tierId, StringComparison.Ordinal));
        if (tier is null)
        {
            return null;
        }

        await EnsureDefaultDecorStatesAsync(playerId, cancellationToken);
        var decorations = await repository.GetDecorStatesAsync(playerId, cancellationToken);
        var ownedCount = decorations.Count(item => item.DecorKey.StartsWith("decor_shop_", StringComparison.Ordinal));
        if (ownedCount < tier.TargetCount)
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        if (!await repository.ClaimDecorCollectionTierAsync(playerId, tier.TierBit, now, cancellationToken))
        {
            return null;
        }

        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        switch (tier.RewardType)
        {
            case "coin":
                resources.Coin += tier.RewardAmount;
                break;
            case "diamond":
                resources.Diamond += tier.RewardAmount;
                break;
            case "researchPoint":
                resources.ResearchPoint += tier.RewardAmount;
                break;
            default:
                return null;
        }
        resources.UpdatedAt = now;
        await AddResourceTransactionAsync(
            playerId,
            "decor_collection_claim",
            tier.TierId,
            null,
            tier.RewardType == "coin" ? tier.RewardAmount : 0,
            0,
            0,
            tier.RewardType == "diamond" ? tier.RewardAmount : 0,
            tier.RewardType == "researchPoint" ? tier.RewardAmount : 0,
            resources,
            cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        var state = await repository.GetDecorCollectionStateAsync(playerId, cancellationToken);
        var collection = ToDecorCollectionDto(decorations, state?.ClaimedTierMask ?? tier.TierBit, now);
        return new DecorCollectionClaimResponse(
            collection,
            tier.RewardType,
            tier.RewardAmount,
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            now.ToUnixTimeMilliseconds());
    }

    public async Task<DecorStateDto?> UpdateDecorPlacementAsync(
        Guid playerId,
        string decorId,
        DecorPlacementRequest request,
        CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null
            || !balance.BuildingDefinitions.ContainsKey(request.BuildingId))
        {
            return null;
        }

        await EnsureDefaultDecorStatesAsync(playerId, cancellationToken);
        var decor = await repository.GetDecorStateAsync(playerId, decorId, cancellationToken);
        if (decor is null)
        {
            return null;
        }

        decor.BuildingKey = request.BuildingId;
        decor.IsPlaced = request.IsPlaced;
        decor.UpdatedAt = DateTimeOffset.UtcNow;
        await repository.SaveChangesAsync(cancellationToken);
        return ToDecorStateDto(decor);
    }

    public async Task<FriendDto?> AddFriendAsync(Guid playerId, AddFriendRequest request, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var friendPlayerId = await ResolveFriendPlayerIdAsync(request, cancellationToken);
        if (friendPlayerId is null || friendPlayerId == playerId)
        {
            return null;
        }

        var friendPlayer = await repository.FindPlayerByIdAsync(friendPlayerId.Value, cancellationToken);
        if (friendPlayer is null)
        {
            return null;
        }

        await EnsureDefaultFriendsAsync(playerId, cancellationToken);
        var friendKey = CreateRealFriendKey(friendPlayer.Id);
        var existing = await repository.GetFriendAsync(playerId, friendKey, cancellationToken);
        if (existing is not null)
        {
            await RefreshFriendSnapshotFromPlayerAsync(existing, friendPlayer, cancellationToken);
            await EnsureFriendRelationAsync(playerId, friendPlayer.Id, existing.FriendKey, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            return await ToFriendDtoAsync(existing, cancellationToken);
        }

        var friend = await EnsureRealFriendSnapshotAsync(playerId, friendPlayer, cancellationToken);
        await EnsureFriendRelationAsync(playerId, friendPlayer.Id, friend.FriendKey, cancellationToken);
        await AddSocialActivityAsync(playerId, "friend_add", friend, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return await ToFriendDtoAsync(friend, cancellationToken);
    }

    public async Task<FriendRequestDto?> CreateFriendRequestAsync(Guid playerId, CreateFriendRequestRequest request, CancellationToken cancellationToken)
    {
        var requester = await repository.FindPlayerByIdAsync(playerId, cancellationToken);
        if (requester is null)
        {
            return null;
        }

        var targetPlayerId = await ResolveFriendPlayerIdAsync(new AddFriendRequest(request.FriendPlayerId, request.InviteCode), cancellationToken);
        if (targetPlayerId is null || targetPlayerId == playerId)
        {
            return null;
        }

        var target = await repository.FindPlayerByIdAsync(targetPlayerId.Value, cancellationToken);
        if (target is null || await repository.GetFriendRelationAsync(playerId, target.Id, cancellationToken) is not null)
        {
            return null;
        }

        var existing = await repository.GetFriendRequestBetweenAsync(playerId, target.Id, "pending", cancellationToken);
        if (existing is not null)
        {
            return await ToFriendRequestDtoAsync(existing, "sent", cancellationToken);
        }

        var inverse = await repository.GetFriendRequestBetweenAsync(target.Id, playerId, "pending", cancellationToken);
        if (inverse is not null)
        {
            return await AcceptFriendRequestAsync(playerId, inverse.Id, cancellationToken);
        }

        var now = DateTimeOffset.UtcNow;
        var friendRequest = new PlayerFriendRequest
        {
            RequesterPlayerId = playerId,
            TargetPlayerId = target.Id,
            Status = "pending",
            CreatedAt = now,
            UpdatedAt = now,
        };
        await repository.AddFriendRequestAsync(friendRequest, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return await ToFriendRequestDtoAsync(friendRequest, "sent", cancellationToken);
    }

    public async Task<IReadOnlyList<FriendRequestDto>?> GetFriendRequestsAsync(Guid playerId, string? box, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var normalizedBox = string.Equals(box, "sent", StringComparison.OrdinalIgnoreCase) ? "sent" : "received";
        var requests = await repository.GetFriendRequestsAsync(playerId, normalizedBox, cancellationToken);
        var result = new List<FriendRequestDto>();
        foreach (var request in requests)
        {
            result.Add(await ToFriendRequestDtoAsync(request, normalizedBox, cancellationToken));
        }
        return result;
    }

    public async Task<FriendRequestDto?> AcceptFriendRequestAsync(Guid playerId, Guid requestId, CancellationToken cancellationToken)
    {
        var request = await repository.GetFriendRequestAsync(requestId, cancellationToken);
        if (request is null || request.TargetPlayerId != playerId || request.Status != "pending")
        {
            return null;
        }

        var requester = await repository.FindPlayerByIdAsync(request.RequesterPlayerId, cancellationToken);
        var target = await repository.FindPlayerByIdAsync(request.TargetPlayerId, cancellationToken);
        if (requester is null || target is null)
        {
            return null;
        }

        await EnsureDefaultFriendsAsync(requester.Id, cancellationToken);
        await EnsureDefaultFriendsAsync(target.Id, cancellationToken);
        var requesterFriend = await EnsureRealFriendSnapshotAsync(requester.Id, target, cancellationToken);
        var targetFriend = await EnsureRealFriendSnapshotAsync(target.Id, requester, cancellationToken);
        await EnsureFriendRelationAsync(requester.Id, target.Id, requesterFriend.FriendKey, cancellationToken);
        await EnsureFriendRelationAsync(target.Id, requester.Id, targetFriend.FriendKey, cancellationToken);
        await AddSocialActivityAsync(requester.Id, "friend_accept", requesterFriend, cancellationToken);
        await AddSocialActivityAsync(target.Id, "friend_accept", targetFriend, cancellationToken);

        request.Status = "accepted";
        request.UpdatedAt = DateTimeOffset.UtcNow;
        await repository.SaveChangesAsync(cancellationToken);
        return await ToFriendRequestDtoAsync(request, "received", cancellationToken);
    }

    public async Task<FriendRequestDto?> RejectFriendRequestAsync(Guid playerId, Guid requestId, CancellationToken cancellationToken)
    {
        var request = await repository.GetFriendRequestAsync(requestId, cancellationToken);
        if (request is null || request.TargetPlayerId != playerId || request.Status != "pending")
        {
            return null;
        }

        request.Status = "rejected";
        request.UpdatedAt = DateTimeOffset.UtcNow;
        await repository.SaveChangesAsync(cancellationToken);
        return await ToFriendRequestDtoAsync(request, "received", cancellationToken);
    }

    public async Task<PlayerSocialProfileDto?> GetSocialProfileAsync(Guid playerId, CancellationToken cancellationToken)
    {
        var player = await repository.FindPlayerByIdAsync(playerId, cancellationToken);
        if (player is null)
        {
            return null;
        }

        var preview = await PreviewServerProductionAsync(player.Id, cancellationToken);
        var invite = await EnsureInviteCodeAsync(player.Id, cancellationToken);
        return ToPlayerSocialProfileDto(player, preview, invite.Code, true, false);
    }

    public async Task<FriendSearchResultDto?> SearchFriendAsync(Guid playerId, string? query, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var friendPlayerId = await ResolveFriendQueryAsync(query, cancellationToken);
        if (friendPlayerId is null)
        {
            return null;
        }

        var player = await repository.FindPlayerByIdAsync(friendPlayerId.Value, cancellationToken);
        if (player is null)
        {
            return null;
        }

        var friendKey = CreateRealFriendKey(player.Id);
        var existing = await repository.GetFriendAsync(playerId, friendKey, cancellationToken);
        var relation = await repository.GetFriendRelationAsync(playerId, player.Id, cancellationToken);
        var preview = await PreviewServerProductionAsync(player.Id, cancellationToken);
        var invite = await EnsureInviteCodeAsync(player.Id, cancellationToken);
        return ToFriendSearchResultDto(player, preview, invite.Code, player.Id == playerId, existing is not null || relation is not null);
    }

    public async Task<FriendActionResponse?> VisitFriendAsync(Guid playerId, string friendId, CancellationToken cancellationToken)
    {
        await EnsureDefaultFriendsAsync(playerId, cancellationToken);
        var friend = await repository.GetFriendAsync(playerId, friendId, cancellationToken);
        if (friend is null)
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        var rewarded = !IsSameUtcDate(friend.LastVisitedAt, now);
        var rewardCoin = rewarded ? CalculateFriendVisitCoinReward(friend) : 0;
        if (rewarded)
        {
            resources.Coin += rewardCoin;
            resources.UpdatedAt = now;
            await AddResourceTransactionAsync(playerId, "friend_visit", friend.FriendKey, null, rewardCoin, 0, 0, 0, 0, resources, cancellationToken);
            await AddSocialActivityAsync(playerId, "friend_visit", friend, cancellationToken);
        }
        friend.LastVisitedAt = now;
        await repository.SaveChangesAsync(cancellationToken);
        if (rewarded)
        {
            await PublishFriendEventAsync(playerId, friend, "friend_visit", rewardCoin, now, cancellationToken);
        }
        return await ToFriendActionResponseAsync(friend, rewarded, rewardCoin, 0, resources, now, rewarded ? null : "daily_visit_claimed", cancellationToken);
    }

    public async Task<FriendActionResponse?> SendFriendGiftAsync(Guid playerId, string friendId, CancellationToken cancellationToken)
    {
        await EnsureDefaultFriendsAsync(playerId, cancellationToken);
        var friend = await repository.GetFriendAsync(playerId, friendId, cancellationToken);
        if (friend is null)
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        var rewarded = !IsSameUtcDate(friend.LastGiftAt, now);
        var rewardCatFood = rewarded ? FriendGiftCatFoodReward : 0;
        if (rewarded)
        {
            resources.CatFood += rewardCatFood;
            resources.UpdatedAt = now;
            await AddResourceTransactionAsync(playerId, "friend_gift", friend.FriendKey, null, 0, 0, rewardCatFood, 0, 0, resources, cancellationToken);
            await AddSocialActivityAsync(playerId, "friend_gift", friend, cancellationToken);
        }
        friend.LastGiftAt = now;
        await repository.SaveChangesAsync(cancellationToken);
        if (rewarded)
        {
            await PublishFriendEventAsync(playerId, friend, "friend_gift", rewardCatFood, now, cancellationToken);
        }
        return await ToFriendActionResponseAsync(friend, rewarded, 0, rewardCatFood, resources, now, rewarded ? null : "daily_gift_claimed", cancellationToken);
    }

    public async Task<FriendBoostStateDto?> GetFriendBoostAsync(Guid playerId, CancellationToken cancellationToken)
    {
        var player = await repository.FindPlayerByIdAsync(playerId, cancellationToken);
        return player is null ? null : ToFriendBoostStateDto(player, DateTimeOffset.UtcNow);
    }

    public async Task<FriendBoostHistoryDto?> GetFriendBoostHistoryAsync(Guid playerId, CancellationToken cancellationToken)
    {
        var player = await repository.FindPlayerByIdAsync(playerId, cancellationToken);
        if (player is null)
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        var contributions = await repository.GetFriendBoostContributionsAsync(playerId, 12, cancellationToken);
        return new FriendBoostHistoryDto(
            GetActiveFriendBoostPercent(player, now),
            MaxFriendBoostPercent,
            contributions.Count(contribution => contribution.ExpiresAt > now),
            contributions.Select(contribution => new FriendBoostContributionDto(
                contribution.Id.ToString("N"),
                contribution.SourcePlayerId.ToString("N"),
                contribution.SourceName,
                contribution.BoostPercent,
                contribution.CreatedAt.ToUnixTimeMilliseconds(),
                contribution.ExpiresAt.ToUnixTimeMilliseconds(),
                contribution.ExpiresAt > now)).ToArray(),
            now.ToUnixTimeMilliseconds());
    }

    public async Task<FriendCoopGoalDto?> GetFriendCoopGoalAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }
        var now = DateTimeOffset.UtcNow;
        var state = await EnsureCoopGoalStateAsync(playerId, now, cancellationToken);
        return ToFriendCoopGoalDto(state, now);
    }

    public async Task<FriendCoopClaimResponse?> ClaimFriendCoopGoalAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        var goalDate = ToUtcDate(now);
        var claimed = await repository.ClaimCoopGoalAsync(playerId, goalDate, FriendCoopGoalTarget, now, cancellationToken);
        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        if (claimed)
        {
            resources.Diamond += FriendCoopGoalRewardDiamond;
            resources.UpdatedAt = now;
            await AddResourceTransactionAsync(
                playerId,
                "friend_coop_goal",
                goalDate.ToString(),
                null,
                0,
                0,
                0,
                FriendCoopGoalRewardDiamond,
                0,
                resources,
                cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
        }

        var state = await repository.GetCoopGoalStateAsync(playerId, cancellationToken)
            ?? await EnsureCoopGoalStateAsync(playerId, now, cancellationToken);
        var goal = claimed
            ? ToFriendCoopGoalDto(state, now) with { Claimed = true, Claimable = false }
            : ToFriendCoopGoalDto(state, now);
        return new FriendCoopClaimResponse(
            claimed,
            claimed ? FriendCoopGoalRewardDiamond : 0,
            goal,
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            claimed ? null : goal.Claimed ? "already_claimed" : "goal_not_complete");
    }

    public async Task<FriendCoopTierClaimResponse?> ClaimFriendCoopTierAsync(
        Guid playerId,
        string tierId,
        CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var tier = FriendCoopTiers.FirstOrDefault(item => string.Equals(item.TierId, tierId, StringComparison.Ordinal));
        if (tier is null)
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        var goalDate = ToUtcDate(now);
        var claimed = await repository.ClaimCoopGoalTierAsync(
            playerId,
            goalDate,
            tier.Target,
            tier.TierBit,
            tier.Target == FriendCoopGoalTarget,
            now,
            cancellationToken);
        var resources = await EnsureResourceStateAsync(playerId, cancellationToken);
        if (claimed)
        {
            switch (tier.RewardType)
            {
                case "coin":
                    resources.Coin += tier.RewardAmount;
                    break;
                case "diamond":
                    resources.Diamond += tier.RewardAmount;
                    break;
                case "researchPoint":
                    resources.ResearchPoint += tier.RewardAmount;
                    break;
            }
            resources.UpdatedAt = now;
            await AddResourceTransactionAsync(
                playerId,
                "friend_coop_tier",
                $"{goalDate}:{tier.TierId}",
                null,
                tier.RewardType == "coin" ? tier.RewardAmount : 0,
                0,
                0,
                tier.RewardType == "diamond" ? tier.RewardAmount : 0,
                tier.RewardType == "researchPoint" ? tier.RewardAmount : 0,
                resources,
                cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
        }

        var state = await repository.GetCoopGoalStateAsync(playerId, cancellationToken)
            ?? await EnsureCoopGoalStateAsync(playerId, now, cancellationToken);
        var goal = ToFriendCoopGoalDto(state, now);
        var tierState = goal.Tiers.First(item => item.TierId == tier.TierId);
        return new FriendCoopTierClaimResponse(
            claimed,
            tier.TierId,
            tier.RewardType,
            claimed ? tier.RewardAmount : 0,
            goal,
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            claimed ? null : tierState.Claimed ? "already_claimed" : "tier_not_complete");
    }

    public async Task<FriendHelpResponse?> HelpFriendAsync(Guid playerId, string friendId, CancellationToken cancellationToken)
    {
        await EnsureDefaultFriendsAsync(playerId, cancellationToken);
        var friend = await repository.GetFriendAsync(playerId, friendId, cancellationToken);
        if (friend is null)
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        if (!TryGetRealFriendPlayerId(friend.FriendKey, out var targetPlayerId))
        {
            return new FriendHelpResponse(
                await ToFriendDtoAsync(friend, cancellationToken),
                false,
                new FriendBoostStateDto(false, 0, null, "", now.ToUnixTimeMilliseconds()),
                "real_friend_required");
        }

        var target = await repository.FindPlayerByIdAsync(targetPlayerId, cancellationToken);
        var actor = await repository.FindPlayerByIdAsync(playerId, cancellationToken);
        if (target is null || actor is null)
        {
            return null;
        }

        if (IsSameUtcDate(friend.LastHelpAt, now))
        {
            return new FriendHelpResponse(
                await ToFriendDtoAsync(friend, cancellationToken),
                false,
                ToFriendBoostStateDto(target, now),
                "daily_help_claimed");
        }

        var currentBoost = GetActiveFriendBoostPercent(target, now);
        target.FriendBoostPercent = Math.Min(MaxFriendBoostPercent, currentBoost + FriendHelpBoostPercent);
        var boostEndsAt = now.Add(FriendHelpDuration);
        target.FriendBoostUntil = boostEndsAt;
        target.FriendBoostedBy = actor.CompanyName;
        friend.LastHelpAt = now;
        await repository.ExtendActiveFriendBoostContributionsAsync(targetPlayerId, now, boostEndsAt, cancellationToken);
        await repository.AddFriendBoostContributionAsync(new PlayerFriendBoostContribution
        {
            PlayerId = targetPlayerId,
            SourcePlayerId = playerId,
            SourceName = actor.CompanyName,
            BoostPercent = FriendHelpBoostPercent,
            CreatedAt = now,
            ExpiresAt = boostEndsAt,
        }, cancellationToken);
        await AddSocialActivityAsync(playerId, "friend_help", friend, cancellationToken);
        var coopGoal = await repository.IncrementCoopGoalProgressAsync(
            targetPlayerId,
            ToUtcDate(now),
            FriendCoopGoalTarget,
            now,
            cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        await PublishFriendEventAsync(
            playerId,
            friend,
            "friend_help",
            FriendHelpBoostPercent,
            now,
            cancellationToken,
            target.FriendBoostPercent,
            target.FriendBoostUntil,
            coopGoal.Progress,
            FriendCoopGoalTarget,
            coopGoal.Progress >= FriendCoopGoalTarget && !coopGoal.IsClaimed);
        return new FriendHelpResponse(
            await ToFriendDtoAsync(friend, cancellationToken),
            true,
            ToFriendBoostStateDto(target, now));
    }

    private async Task PublishFriendEventAsync(
        Guid actorPlayerId,
        FriendSnapshot friend,
        string eventType,
        int rewardValue,
        DateTimeOffset createdAt,
        CancellationToken cancellationToken,
        int boostPercent = 0,
        DateTimeOffset? boostEndsAt = null,
        int coopProgress = 0,
        int coopTarget = 0,
        bool coopClaimable = false)
    {
        if (!TryGetRealFriendPlayerId(friend.FriendKey, out var targetPlayerId))
        {
            return;
        }
        var actor = await repository.FindPlayerByIdAsync(actorPlayerId, cancellationToken);
        if (actor is null)
        {
            return;
        }
        await repository.AddSocialActivityAsync(new PlayerSocialActivity
        {
            PlayerId = targetPlayerId,
            ActivityType = eventType switch
            {
                "friend_gift" => "friend_gift_received",
                "friend_help" => "friend_help_received",
                _ => "friend_visited_by",
            },
            FriendKey = CreateRealFriendKey(actor.Id),
            FriendName = actor.CompanyName,
            CreatedAt = createdAt,
        }, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        socialEvents.Publish(targetPlayerId, new SocialRealtimeEventDto(
            Guid.NewGuid().ToString("N"),
            eventType,
            actor.Id.ToString("N"),
            actor.CompanyName,
            rewardValue,
            createdAt.ToUnixTimeMilliseconds(),
            boostPercent,
            boostEndsAt?.ToUnixTimeMilliseconds(),
            coopProgress,
            coopTarget,
            coopClaimable));
    }

    public async Task<IReadOnlyList<FriendActivityDto>?> GetFriendActivitiesAsync(Guid playerId, int limit, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var activities = await repository.GetSocialActivitiesAsync(playerId, limit, cancellationToken);
        return activities.Select(ToFriendActivityDto).ToArray();
    }

    public async Task<LeaderboardDto?> GetLeaderboardAsync(Guid playerId, string? boardId, CancellationToken cancellationToken)
    {
        var player = await repository.FindPlayerByIdAsync(playerId, cancellationToken);
        if (player is null)
        {
            return null;
        }

        var normalizedBoardId = NormalizeLeaderboardBoardId(boardId);
        await EnsureDefaultFriendsAsync(playerId, cancellationToken);
        await RefreshRealFriendSnapshotsAsync(playerId, cancellationToken);
        var friends = await repository.GetFriendsAsync(playerId, cancellationToken);
        var selfPreview = await PreviewServerProductionAsync(playerId, cancellationToken);
        var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var entries = new List<LeaderboardEntryDto>
        {
            new(
                player.Id.ToString("N"),
                player.CompanyName,
                player.Level,
                0,
                (int)Math.Floor(Math.Max(0, selfPreview?.NetCoinPerSecond ?? 0)),
                true,
                player.UpdatedAt.ToUnixTimeMilliseconds()),
        };

        entries.AddRange(friends.Select(friend => new LeaderboardEntryDto(
            friend.FriendKey,
            friend.Name,
            friend.Level,
            0,
            Math.Max(0, friend.IncomePerSecond),
            false,
            (friend.LastVisitedAt ?? friend.LastGiftAt ?? DateTimeOffset.UtcNow).ToUnixTimeMilliseconds())));

        var ranked = entries
            .OrderByDescending(entry => entry.Score)
            .ThenByDescending(entry => entry.Level)
            .ThenBy(entry => entry.CompanyName, StringComparer.Ordinal)
            .Select((entry, index) => entry with { Rank = index + 1 })
            .Take(20)
            .ToArray();
        return new LeaderboardDto(
            normalizedBoardId,
            ranked,
            ranked.FirstOrDefault(entry => entry.IsSelf),
            now);
    }

    public async Task<SettingsDto?> GetSettingsAsync(Guid playerId, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var settings = await EnsureSettingsAsync(playerId, cancellationToken);
        return ToSettingsDto(settings);
    }

    public async Task<SettingsDto?> UpdateSettingsAsync(Guid playerId, SettingsDto request, CancellationToken cancellationToken)
    {
        if (await repository.FindPlayerByIdAsync(playerId, cancellationToken) is null)
        {
            return null;
        }

        var settings = await EnsureSettingsAsync(playerId, cancellationToken);
        settings.SettingsJson = JsonSerializer.Serialize(request.Settings);
        settings.UpdatedAt = DateTimeOffset.UtcNow;
        await repository.SaveChangesAsync(cancellationToken);
        return ToSettingsDto(settings);
    }

    private static string NormalizeDeviceId(string deviceId)
    {
        return string.IsNullOrWhiteSpace(deviceId) ? "unknown-device" : deviceId.Trim();
    }

    private static double NonNegative(double value)
    {
        return double.IsFinite(value) ? Math.Max(0, value) : 0;
    }

    private static LaunchResponse CreateRejectedLaunch(
        LaunchRequest request,
        string reason,
        PlayerResourceState? resources = null,
        int? requestedSeconds = null,
        ProductionPreviewResponse? preview = null,
        DailyOrderDto? dailyOrder = null)
    {
        return new LaunchResponse(
            CreateLaunchId(request.ClientRequestId),
            false,
            requestedSeconds ?? Math.Clamp(request.LaunchSeconds, 0, 600),
            0,
            0,
            0,
            preview?.NetCoinPerSecond ?? 0,
            preview?.WageCostPerSecond ?? 0,
            preview?.BeanCostPerSecond ?? 0,
            resources?.Coin ?? 0,
            resources?.Bean ?? 0,
            resources?.CatFood ?? 0,
            resources?.Diamond ?? 0,
            resources?.ResearchPoint ?? 0,
            DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            reason,
            dailyOrder);
    }

    private static string CreateLaunchId(string? clientRequestId)
    {
        var suffix = string.IsNullOrWhiteSpace(clientRequestId)
            ? Guid.NewGuid().ToString("N")[..12]
            : clientRequestId.Trim();
        return $"launch_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{suffix}";
    }

    private static string NormalizeClientRequestId(string? clientRequestId)
    {
        return string.IsNullOrWhiteSpace(clientRequestId)
            ? Guid.NewGuid().ToString("N")
            : clientRequestId.Trim();
    }

    private static LaunchResponse ToLaunchResponse(
        PlayerLaunchRecord record,
        PlayerResourceState resources,
        DailyOrderDto? dailyOrder = null)
    {
        return new LaunchResponse(
            record.LaunchKey,
            true,
            record.RequestedSeconds,
            record.ProductiveSeconds,
            record.CoinGained,
            record.BeanSpent,
            record.NetCoinPerSecond,
            record.WageCostPerSecond,
            record.BeanCostPerSecond,
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            record.CreatedAt.ToUnixTimeMilliseconds(),
            DailyOrder: dailyOrder);
    }

    private static ResourceStateDto ToResourceStateDto(PlayerResourceState resources)
    {
        return new ResourceStateDto(
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            resources.UpdatedAt.ToUnixTimeMilliseconds());
    }

    private static ResourceTransactionDto ToResourceTransactionDto(PlayerResourceTransaction transaction)
    {
        return new ResourceTransactionDto(
            transaction.Id.ToString("N"),
            transaction.SourceType,
            transaction.SourceKey,
            transaction.ClientRequestId,
            transaction.CoinDelta,
            transaction.BeanDelta,
            transaction.CatFoodDelta,
            transaction.DiamondDelta,
            transaction.ResearchPointDelta,
            transaction.CoinBalance,
            transaction.BeanBalance,
            transaction.CatFoodBalance,
            transaction.DiamondBalance,
            transaction.ResearchPointBalance,
            transaction.CreatedAt.ToUnixTimeMilliseconds());
    }

    private static DailyOrderDto ToDailyOrderDto(PlayerDailyOrderState state, DateTimeOffset now)
    {
        var progress = Math.Clamp(state.Progress, 0, DailyOrderTarget);
        return new DailyOrderDto(
            state.OrderDate,
            progress,
            DailyOrderTarget,
            progress >= DailyOrderTarget && !state.IsClaimed,
            state.IsClaimed,
            DailyOrderRewardCoin,
            DailyOrderRewardResearchPoint,
            Math.Clamp(state.LaunchCount, 0, DailyLaunchLimit),
            DailyLaunchLimit,
            Math.Max(0, DailyLaunchLimit - state.LaunchCount),
            state.UpdatedAt.ToUnixTimeMilliseconds(),
            now.ToUnixTimeMilliseconds());
    }

    private async Task AddResourceTransactionAsync(
        Guid playerId,
        string sourceType,
        string sourceKey,
        string? clientRequestId,
        double coinDelta,
        double beanDelta,
        double catFoodDelta,
        double diamondDelta,
        double researchPointDelta,
        PlayerResourceState resources,
        CancellationToken cancellationToken)
    {
        await repository.AddResourceTransactionAsync(new PlayerResourceTransaction
        {
            PlayerId = playerId,
            SourceType = sourceType,
            SourceKey = sourceKey,
            ClientRequestId = clientRequestId,
            CoinDelta = coinDelta,
            BeanDelta = beanDelta,
            CatFoodDelta = catFoodDelta,
            DiamondDelta = diamondDelta,
            ResearchPointDelta = researchPointDelta,
            CoinBalance = resources.Coin,
            BeanBalance = resources.Bean,
            CatFoodBalance = resources.CatFood,
            DiamondBalance = resources.Diamond,
            ResearchPointBalance = resources.ResearchPoint,
            CreatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);
    }

    private static bool CanSpendResource(PlayerResourceState resources, string priceType, double amount)
    {
        return priceType switch
        {
            "coin" => resources.Coin >= amount,
            "bean" => resources.Bean >= amount,
            "catFood" => resources.CatFood >= amount,
            "diamond" => resources.Diamond >= amount,
            "researchPoint" => resources.ResearchPoint >= amount,
            _ => false,
        };
    }

    private static void SpendResource(PlayerResourceState resources, string priceType, double amount)
    {
        switch (priceType)
        {
            case "coin":
                resources.Coin = Math.Max(0, resources.Coin - amount);
                break;
            case "bean":
                resources.Bean = Math.Max(0, resources.Bean - amount);
                break;
            case "catFood":
                resources.CatFood = Math.Max(0, resources.CatFood - amount);
                break;
            case "diamond":
                resources.Diamond = Math.Max(0, resources.Diamond - amount);
                break;
            case "researchPoint":
                resources.ResearchPoint = Math.Max(0, resources.ResearchPoint - amount);
                break;
        }
    }

    private static int ToUtcDate(DateTimeOffset value)
    {
        return value.UtcDateTime.Year * 10000 + value.UtcDateTime.Month * 100 + value.UtcDateTime.Day;
    }

    private async Task<int> CalculateCatUpgradeCostAsync(Guid playerId, int level, CancellationToken cancellationToken)
    {
        var baseCost = (int)Math.Floor(100 * Math.Pow(Math.Max(1, level), 1.5));
        var discount = await GetResearchBonusAsync(playerId, "upgrade_cost_reduce", cancellationToken);
        var multiplier = Math.Clamp(1 - discount / 100.0, 0.1, 1);
        return Math.Max(1, (int)Math.Floor(baseCost * multiplier));
    }

    private int CalculateCatFeedCost(PlayerCatState cat)
    {
        const int baseCost = 10;
        var reducePercent = Math.Clamp(GetEquipmentEffectTotal(cat, "catFoodCost"), -90, 200);
        return Math.Max(1, (int)Math.Floor(baseCost * (1 + reducePercent / 100.0)));
    }

    private static int CalculateEquipmentUpgradeCost(EquipmentDefinition equipment, int currentLevel)
    {
        return Math.Max(1, equipment.UpgradeCost * Math.Max(1, currentLevel));
    }

    private bool EnsureCatEquipmentDefaults(PlayerCatState cat)
    {
        var changed = false;
        var equipment = ReadStringMap(cat.EquipmentJson);
        foreach (var pair in balance.DefaultEquipment)
        {
            if (!equipment.ContainsKey(pair.Key))
            {
                equipment[pair.Key] = pair.Value;
                changed = true;
            }
        }

        var levels = ReadIntMap(cat.EquipmentLevelsJson);
        foreach (var itemId in equipment.Values)
        {
            if (!levels.ContainsKey(itemId))
            {
                levels[itemId] = 1;
                changed = true;
            }
        }

        if (changed)
        {
            cat.EquipmentJson = JsonSerializer.Serialize(equipment);
            cat.EquipmentLevelsJson = JsonSerializer.Serialize(levels);
        }
        return changed;
    }

    private Dictionary<string, string> GetDefaultEquipment()
    {
        return new Dictionary<string, string>(balance.DefaultEquipment);
    }

    private Dictionary<string, int> GetDefaultEquipmentLevels()
    {
        return balance.DefaultEquipment.Values.ToDictionary(itemId => itemId, _ => 1);
    }

    private static IReadOnlyList<string> GetDefaultCatSkins(string catId)
    {
        return catId == DefaultCatId ? ["default", "apron"] : ["default"];
    }

    private static IReadOnlyList<string> EnsureCatSkinDefaults(PlayerCatState cat)
    {
        var owned = string.IsNullOrWhiteSpace(cat.OwnedSkinsJson)
            ? []
            : JsonSerializer.Deserialize<List<string>>(cat.OwnedSkinsJson) ?? [];
        var normalized = owned
            .Select(item => item.Trim().ToLowerInvariant())
            .Where(CatSkinIds.Contains)
            .Distinct(StringComparer.Ordinal)
            .ToList();
        foreach (var skinId in GetDefaultCatSkins(cat.CatKey))
        {
            if (!normalized.Contains(skinId, StringComparer.Ordinal))
            {
                normalized.Add(skinId);
            }
        }

        if (!normalized.Contains(cat.EquippedSkinKey, StringComparer.Ordinal))
        {
            cat.EquippedSkinKey = "default";
        }
        cat.OwnedSkinsJson = JsonSerializer.Serialize(normalized);
        return normalized;
    }

    private int GetEquipmentEffectTotal(PlayerCatState cat, string effectType)
    {
        EnsureCatEquipmentDefaults(cat);
        var levels = ReadIntMap(cat.EquipmentLevelsJson);
        var equipment = ReadStringMap(cat.EquipmentJson);
        var total = 0;
        foreach (var itemId in equipment.Values)
        {
            if (!balance.EquipmentDefinitions.TryGetValue(itemId, out var definition))
            {
                continue;
            }

            var level = Math.Clamp(levels.GetValueOrDefault(itemId, 1), 1, definition.MaxLevel);
            foreach (var effect in definition.Effects)
            {
                if (string.Equals(effect.Type, effectType, StringComparison.OrdinalIgnoreCase))
                {
                    total += effect.BaseValue + effect.PerLevel * Math.Max(0, level - 1);
                }
            }
        }
        return total;
    }

    private static Dictionary<string, string> ReadStringMap(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        return JsonSerializer.Deserialize<Dictionary<string, string>>(json) ?? [];
    }

    private static Dictionary<string, int> ReadIntMap(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        return JsonSerializer.Deserialize<Dictionary<string, int>>(json) ?? [];
    }

    private int CalculateCatUnlockCost(string catId)
    {
        var rarity = balance.CatDefinitions.TryGetValue(catId, out var definition) ? definition.Rarity : "B";
        return rarity switch
        {
            "SS" => 500_000,
            "S" => 180_000,
            "A" => 45_000,
            _ => 12_000,
        };
    }

    private int GetCatBaseWeight(string catId)
    {
        return balance.CatDefinitions.TryGetValue(catId, out var definition) ? definition.BaseWeight : 20;
    }

    private string NormalizeExistingBuildingId(string? buildingId)
    {
        if (string.IsNullOrWhiteSpace(buildingId))
        {
            return "";
        }

        var value = buildingId.Trim();
        return balance.BuildingDefinitions.ContainsKey(value) ? value : DefaultBuildingId;
    }

    private bool TryNormalizeAssignedBuildingId(string? buildingId, out string normalized)
    {
        if (string.IsNullOrWhiteSpace(buildingId))
        {
            normalized = "";
            return true;
        }

        normalized = buildingId.Trim();
        return balance.BuildingDefinitions.ContainsKey(normalized);
    }

    private int GetBuildingScheduleCapacity(string buildingId)
    {
        var level = balance.BuildingDefinitions.TryGetValue(buildingId, out var definition)
            ? definition.Level
            : 0;
        return GetBuildingScheduleCapacity(buildingId, level);
    }

    private int GetBuildingScheduleCapacity(string buildingId, int level)
    {
        if (!balance.BuildingDefinitions.TryGetValue(buildingId, out var definition))
        {
            return 0;
        }

        return Math.Min(5, 2 + Math.Max(0, Math.Min(definition.MaxLevel, level)) / 15);
    }

    private static int CalculateBuildingEffectValue(BuildingDefinition definition, int level)
    {
        return definition.BaseValue + definition.ValuePerLevel * Math.Clamp(level, 1, definition.MaxLevel);
    }

    private static int CalculateBuildingUpgradeCost(BuildingDefinition definition, int level)
    {
        return (int)Math.Floor(definition.CostBase * Math.Pow(1.18, Math.Max(0, level - 1)));
    }

    private async Task<PlayerResourceState> EnsureResourceStateAsync(Guid playerId, CancellationToken cancellationToken)
    {
        var resources = await repository.GetResourceStateAsync(playerId, cancellationToken);
        if (resources is not null)
        {
            return resources;
        }

        resources = new PlayerResourceState
        {
            PlayerId = playerId,
            Coin = InitialCoin,
            Bean = InitialBean,
            CatFood = InitialCatFood,
            Diamond = InitialDiamond,
            ResearchPoint = InitialResearchPoint,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        await repository.SetResourceStateAsync(resources, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return resources;
    }

    private async Task<PlayerCatState> EnsureCatStateAsync(Guid playerId, string catId, CancellationToken cancellationToken)
    {
        var cat = await repository.GetCatStateAsync(playerId, catId, cancellationToken);
        if (cat is not null)
        {
            var ownedSkinsBefore = cat.OwnedSkinsJson;
            var equippedSkinBefore = cat.EquippedSkinKey;
            EnsureCatSkinDefaults(cat);
            var skinChanged = ownedSkinsBefore != cat.OwnedSkinsJson
                || equippedSkinBefore != cat.EquippedSkinKey;
            if (EnsureCatEquipmentDefaults(cat) || skinChanged)
            {
                cat.UpdatedAt = DateTimeOffset.UtcNow;
                await repository.SaveChangesAsync(cancellationToken);
            }
            return cat;
        }

        cat = new PlayerCatState
        {
            PlayerId = playerId,
            CatKey = catId,
            Level = 1,
            Weight = GetCatBaseWeight(catId),
            IsUnlocked = catId == DefaultCatId,
            AssignedBuildingKey = catId == DefaultCatId ? DefaultBuildingId : "",
            EquipmentJson = JsonSerializer.Serialize(GetDefaultEquipment()),
            EquipmentLevelsJson = JsonSerializer.Serialize(GetDefaultEquipmentLevels()),
            OwnedSkinsJson = JsonSerializer.Serialize(GetDefaultCatSkins(catId)),
            EquippedSkinKey = "default",
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        await repository.AddCatStateAsync(cat, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return cat;
    }

    private async Task EnsureDefaultCatStateAsync(Guid playerId, CancellationToken cancellationToken)
    {
        await EnsureCatStateAsync(playerId, DefaultCatId, cancellationToken);
    }

    private async Task<PlayerBuildingState> EnsureBuildingStateAsync(Guid playerId, string buildingId, CancellationToken cancellationToken)
    {
        var state = await repository.GetBuildingStateAsync(playerId, buildingId, cancellationToken);
        if (state is not null)
        {
            return state;
        }

        var definition = balance.BuildingDefinitions[buildingId];
        state = new PlayerBuildingState
        {
            PlayerId = playerId,
            BuildingKey = buildingId,
            Level = Math.Clamp(definition.Level, 1, definition.MaxLevel),
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        await repository.AddBuildingStateAsync(state, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return state;
    }

    private async Task EnsureDefaultBuildingStatesAsync(Guid playerId, CancellationToken cancellationToken)
    {
        foreach (var buildingId in balance.BuildingDefinitions.Keys)
        {
            await EnsureBuildingStateAsync(playerId, buildingId, cancellationToken);
        }
    }

    private async Task EnsureDefaultDecorStatesAsync(Guid playerId, CancellationToken cancellationToken)
    {
        foreach (var definition in DefaultDecorations)
        {
            await repository.AddDecorIfMissingAsync(new PlayerDecorState
            {
                PlayerId = playerId,
                DecorKey = definition.DecorId,
                BuildingKey = definition.BuildingId,
                Name = definition.Name,
                Score = definition.Score,
                IsPlaced = true,
                UpdatedAt = DateTimeOffset.UtcNow,
            }, cancellationToken);
        }
    }

    private async Task<PlayerResearchState> EnsureResearchStateAsync(Guid playerId, string researchId, CancellationToken cancellationToken)
    {
        var research = await repository.GetResearchStateAsync(playerId, researchId, cancellationToken);
        if (research is not null)
        {
            if (research.IsUnlocked && research.Level <= 0)
            {
                research.Level = 1;
                await repository.SaveChangesAsync(cancellationToken);
            }
            else if (!research.IsUnlocked && research.Level > 0)
            {
                research.IsUnlocked = true;
                await repository.SaveChangesAsync(cancellationToken);
            }
            return research;
        }

        research = new PlayerResearchState
        {
            PlayerId = playerId,
            ResearchKey = researchId,
            IsUnlocked = false,
            Level = 0,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        await repository.AddResearchStateAsync(research, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return research;
    }

    private async Task<bool> IsResearchUnlockedAsync(Guid playerId, string researchId, CancellationToken cancellationToken)
    {
        var research = await repository.GetResearchStateAsync(playerId, researchId, cancellationToken);
        return research is not null && (research.Level > 0 || research.IsUnlocked);
    }

    private async Task<int> GetResearchBonusAsync(Guid playerId, string effectType, CancellationToken cancellationToken)
    {
        var unlocked = await repository.GetResearchStatesAsync(playerId, cancellationToken);
        var total = 0;
        foreach (var state in unlocked)
        {
            if ((state.Level > 0 || state.IsUnlocked)
                && balance.ResearchDefinitions.TryGetValue(state.ResearchKey, out var definition)
                && string.Equals(definition.EffectType, effectType, StringComparison.OrdinalIgnoreCase))
            {
                total += definition.GetEffectValue(Math.Max(1, state.Level));
            }
        }
        return total;
    }

    private async Task<ProductionModifiers> GetProductionModifiersAsync(Guid playerId, CancellationToken cancellationToken)
    {
        await EnsureDefaultCatStateAsync(playerId, cancellationToken);
        var player = await repository.FindPlayerByIdAsync(playerId, cancellationToken);
        var productionPercent = await GetResearchBonusAsync(playerId, "coin_production_mult", cancellationToken);
        var productionAdd = await GetResearchBonusAsync(playerId, "coin_production_add", cancellationToken);
        var beanReduce = await GetResearchBonusAsync(playerId, "bean_reduce", cancellationToken);
        var equipmentProductionPercent = await GetPlayerEquipmentEffectTotalAsync(playerId, "materialOutput", cancellationToken);
        var equipmentWagePercent = await GetPlayerEquipmentEffectTotalAsync(playerId, "wageCost", cancellationToken);
        return new ProductionModifiers(
            productionPercent + equipmentProductionPercent + (player is null ? 0 : GetActiveFriendBoostPercent(player, DateTimeOffset.UtcNow)),
            productionAdd,
            Math.Clamp(equipmentWagePercent, -90, 200),
            Math.Clamp(beanReduce, 0, 90));
    }

    private async Task<int> GetPlayerEquipmentEffectTotalAsync(Guid playerId, string effectType, CancellationToken cancellationToken)
    {
        var cats = await repository.GetCatStatesAsync(playerId, cancellationToken);
        return cats
            .Where(cat => cat.IsUnlocked)
            .Sum(cat => GetEquipmentEffectTotal(cat, effectType));
    }

    private int GetBuildingEffectValue(IEnumerable<PlayerBuildingState> buildings, string effectType)
    {
        foreach (var building in buildings)
        {
            if (balance.BuildingDefinitions.TryGetValue(building.BuildingKey, out var definition)
                && string.Equals(definition.EffectType, effectType, StringComparison.OrdinalIgnoreCase))
            {
                return CalculateBuildingEffectValue(definition, building.Level);
            }
        }

        return 0;
    }

    private double CalculateServerCatProduction(
        PlayerCatState cat,
        IReadOnlyCollection<CatDefinition> teammates,
        int researchProductionPercent,
        int researchProductionAdd)
    {
        if (!balance.CatDefinitions.TryGetValue(cat.CatKey, out var definition))
        {
            return 0;
        }

        var baseProduction = CalculateCatProduction(definition.BaseProduction, cat.Level, cat.Weight);
        var equipmentProductionBonus = GetEquipmentEffectTotal(cat, "materialOutput");
        var skillMultiplier = GetCatProductionSkillMultiplier(definition, teammates);
        var moodMultiplier = Math.Max(0, CalculateServerCatMood(cat) / 100.0);
        return ((baseProduction * (1 + (researchProductionPercent + equipmentProductionBonus) / 100.0)) + researchProductionAdd) * skillMultiplier * moodMultiplier;
    }

    private double CalculateServerCatWageCost(PlayerCatState cat)
    {
        if (!balance.CatDefinitions.TryGetValue(cat.CatKey, out var definition))
        {
            return 0;
        }

        var baseWage = definition.BaseSalary * Math.Max(1, cat.Level);
        var reducePercent = Math.Clamp(GetEquipmentEffectTotal(cat, "wageCost"), -90, 200);
        return Math.Max(0, baseWage * (1 + reducePercent / 100.0));
    }

    private double CalculateServerCatBeanCost(PlayerCatState cat)
    {
        return balance.CatDefinitions.TryGetValue(cat.CatKey, out var definition)
            ? definition.BaseBeanCost * GetCatBeanCostSkillMultiplier(definition)
            : 0;
    }

    private static int CalculateCatProduction(int baseProduction, int level, int weight)
    {
        var levelMultiplier = 1 + (Math.Max(1, level) - 1) * 0.1;
        var weightMultiplier = weight >= 80 ? 1.8 : weight >= 40 ? 1.3 : 1.0;
        return (int)Math.Floor(baseProduction * levelMultiplier * weightMultiplier);
    }

    private int CalculateServerCatMood(PlayerCatState cat)
    {
        if (!cat.IsUnlocked)
        {
            return 0;
        }

        var equipmentMood = Math.Max(0, GetEquipmentEffectTotal(cat, "mood"));
        var moodCap = 100 + equipmentMood;
        var baseMood = Math.Max(60, 100 - cat.Weight / 4);
        return Math.Min(moodCap, baseMood + equipmentMood);
    }

    private double GetCatProductionSkillMultiplier(CatDefinition cat, IReadOnlyCollection<CatDefinition> teammates)
    {
        var multiplier = 1.0;
        if (balance.SkillDefinitions.TryGetValue(cat.SkillId, out var ownSkill)
            && string.Equals(ownSkill.Type, "production_boost", StringComparison.OrdinalIgnoreCase))
        {
            multiplier += ownSkill.Value / 100.0;
        }

        foreach (var teammate in teammates)
        {
            if (string.Equals(teammate.CatId, cat.CatId, StringComparison.Ordinal))
            {
                continue;
            }

            if (balance.SkillDefinitions.TryGetValue(teammate.SkillId, out var teamSkill)
                && string.Equals(teamSkill.Type, "team_buff", StringComparison.OrdinalIgnoreCase))
            {
                multiplier += teamSkill.Value / 100.0;
            }
        }

        return multiplier;
    }

    private double GetCatBeanCostSkillMultiplier(CatDefinition cat)
    {
        if (balance.SkillDefinitions.TryGetValue(cat.SkillId, out var skill)
            && string.Equals(skill.Type, "bean_saver", StringComparison.OrdinalIgnoreCase))
        {
            return Math.Max(0.1, 1 - skill.Value / 100.0);
        }

        return 1;
    }

    private async Task EnsureDefaultMailAsync(Guid playerId, CancellationToken cancellationToken)
    {
        var existing = await repository.GetMailsAsync(playerId, cancellationToken);
        if (existing.Count > 0)
        {
            return;
        }

        await repository.AddMailAsync(new PlayerMail
        {
            PlayerId = playerId,
            MailKey = "welcome",
            Title = "开业补给",
            Body = "欢迎回到肥猫咖啡公司。这里准备了一点启动补给。",
            RewardCoin = 2500,
            RewardCatFood = 20,
        }, cancellationToken);
        await repository.AddMailAsync(new PlayerMail
        {
            PlayerId = playerId,
            MailKey = "server",
            Title = "联网公告",
            Body = "好友互动和发射结算会通过邮件发放奖励。",
        }, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureDefaultFriendsAsync(Guid playerId, CancellationToken cancellationToken)
    {
        await repository.AddFriendIfMissingAsync(new FriendSnapshot { PlayerId = playerId, FriendKey = "mocha", Name = "摩卡工坊", Level = 18, IncomePerSecond = 520 }, cancellationToken);
        await repository.AddFriendIfMissingAsync(new FriendSnapshot { PlayerId = playerId, FriendKey = "latte", Name = "拿铁小镇", Level = 14, IncomePerSecond = 360 }, cancellationToken);
        await repository.AddFriendIfMissingAsync(new FriendSnapshot { PlayerId = playerId, FriendKey = "cocoa", Name = "可可研究所", Level = 22, IncomePerSecond = 680 }, cancellationToken);
    }

    private async Task<PlayerSettings> EnsureSettingsAsync(Guid playerId, CancellationToken cancellationToken)
    {
        var settings = await repository.GetSettingsAsync(playerId, cancellationToken);
        if (settings is not null)
        {
            return settings;
        }

        settings = new PlayerSettings
        {
            PlayerId = playerId,
            SettingsJson = JsonSerializer.Serialize(new Dictionary<string, bool>
            {
                ["music"] = true,
                ["sfx"] = true,
                ["push"] = false,
                ["sync"] = false,
            }),
        };
        await repository.SetSettingsAsync(settings, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return settings;
    }

    private async Task RefreshRealFriendSnapshotsAsync(Guid playerId, CancellationToken cancellationToken)
    {
        var friends = await repository.GetFriendsAsync(playerId, cancellationToken);
        var realFriendIds = friends
            .Select(friend => TryGetRealFriendPlayerId(friend.FriendKey, out var friendPlayerId) ? friendPlayerId : Guid.Empty)
            .Where(friendPlayerId => friendPlayerId != Guid.Empty)
            .Distinct()
            .ToArray();
        if (realFriendIds.Length <= 0)
        {
            return;
        }

        var players = await repository.FindPlayersByIdsAsync(realFriendIds, cancellationToken);
        foreach (var friend in friends)
        {
            if (!TryGetRealFriendPlayerId(friend.FriendKey, out var friendPlayerId))
            {
                continue;
            }

            var player = players.FirstOrDefault(item => item.Id == friendPlayerId);
            if (player is not null)
            {
                await RefreshFriendSnapshotFromPlayerAsync(friend, player, cancellationToken);
            }
        }
        await repository.SaveChangesAsync(cancellationToken);
    }

    private async Task RefreshFriendSnapshotFromPlayerAsync(FriendSnapshot friend, PlayerProfile player, CancellationToken cancellationToken)
    {
        var preview = await PreviewServerProductionAsync(player.Id, cancellationToken);
        friend.Name = player.CompanyName;
        friend.Level = player.Level;
        friend.IncomePerSecond = (int)Math.Floor(Math.Max(0, preview?.NetCoinPerSecond ?? 0));
    }

    private async Task<FriendSnapshot> EnsureRealFriendSnapshotAsync(Guid playerId, PlayerProfile friendPlayer, CancellationToken cancellationToken)
    {
        var friendKey = CreateRealFriendKey(friendPlayer.Id);
        var existing = await repository.GetFriendAsync(playerId, friendKey, cancellationToken);
        if (existing is not null)
        {
            await RefreshFriendSnapshotFromPlayerAsync(existing, friendPlayer, cancellationToken);
            return existing;
        }

        var preview = await PreviewServerProductionAsync(friendPlayer.Id, cancellationToken);
        var friend = new FriendSnapshot
        {
            PlayerId = playerId,
            FriendKey = friendKey,
            Name = friendPlayer.CompanyName,
            Level = friendPlayer.Level,
            IncomePerSecond = (int)Math.Floor(Math.Max(0, preview?.NetCoinPerSecond ?? 0)),
        };
        await repository.AddFriendAsync(friend, cancellationToken);
        return friend;
    }

    private async Task<FriendRequestDto> ToFriendRequestDtoAsync(PlayerFriendRequest request, string direction, CancellationToken cancellationToken)
    {
        var otherPlayerId = direction == "sent" ? request.TargetPlayerId : request.RequesterPlayerId;
        var other = await repository.FindPlayerByIdAsync(otherPlayerId, cancellationToken);
        var preview = other is null ? null : await PreviewServerProductionAsync(other.Id, cancellationToken);
        var invite = other is null ? null : await EnsureInviteCodeAsync(other.Id, cancellationToken);
        return new FriendRequestDto(
            request.Id.ToString("N"),
            direction,
            request.Status,
            other?.Id.ToString("N") ?? otherPlayerId.ToString("N"),
            other?.CompanyName ?? "Unknown Player",
            other?.Level ?? 1,
            (int)Math.Floor(Math.Max(0, preview?.NetCoinPerSecond ?? 0)),
            invite?.Code ?? "",
            request.CreatedAt.ToUnixTimeMilliseconds(),
            request.UpdatedAt.ToUnixTimeMilliseconds());
    }

    private async Task AddSocialActivityAsync(Guid playerId, string activityType, FriendSnapshot friend, CancellationToken cancellationToken)
    {
        await repository.AddSocialActivityAsync(new PlayerSocialActivity
        {
            PlayerId = playerId,
            ActivityType = activityType,
            FriendKey = friend.FriendKey,
            FriendName = friend.Name,
            CreatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);
    }

    private static MailDto ToMailDto(PlayerMail mail)
    {
        return new MailDto(
            mail.MailKey,
            mail.Title,
            mail.Body,
            mail.RewardCoin,
            mail.RewardCatFood,
            mail.RewardDiamond,
            mail.IsClaimed,
            mail.CreatedAt.ToUnixTimeMilliseconds());
    }

    private async Task<FriendDto> ToFriendDtoAsync(FriendSnapshot friend, CancellationToken cancellationToken)
    {
        return new FriendDto(
            friend.FriendKey,
            friend.Name,
            friend.Level,
            friend.IncomePerSecond,
            friend.LastVisitedAt?.ToUnixTimeMilliseconds(),
            friend.LastGiftAt?.ToUnixTimeMilliseconds(),
            friend.LastHelpAt?.ToUnixTimeMilliseconds(),
            await BuildFriendProfileAsync(friend, cancellationToken),
            await BuildFriendRoomsAsync(friend, cancellationToken));
    }

    private static int GetActiveFriendBoostPercent(PlayerProfile player, DateTimeOffset now)
    {
        return player.FriendBoostUntil > now
            ? Math.Clamp(player.FriendBoostPercent, 0, MaxFriendBoostPercent)
            : 0;
    }

    private static FriendBoostStateDto ToFriendBoostStateDto(PlayerProfile player, DateTimeOffset now)
    {
        var percent = GetActiveFriendBoostPercent(player, now);
        return new FriendBoostStateDto(
            percent > 0,
            percent,
            percent > 0 ? player.FriendBoostUntil?.ToUnixTimeMilliseconds() : null,
            percent > 0 ? player.FriendBoostedBy : "",
            now.ToUnixTimeMilliseconds());
    }

    private async Task<PlayerCoopGoalState> EnsureCoopGoalStateAsync(
        Guid playerId,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var goalDate = ToUtcDate(now);
        var state = await repository.GetCoopGoalStateAsync(playerId, cancellationToken);
        if (state is null)
        {
            state = new PlayerCoopGoalState
            {
                PlayerId = playerId,
                GoalDate = goalDate,
                UpdatedAt = now,
            };
            await repository.AddCoopGoalStateAsync(state, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
        }
        else if (state.GoalDate != goalDate)
        {
            state.GoalDate = goalDate;
            state.Progress = 0;
            state.IsClaimed = false;
            state.ClaimedTierMask = 0;
            state.UpdatedAt = now;
            await repository.SaveChangesAsync(cancellationToken);
        }
        return state;
    }

    private static FriendCoopGoalDto ToFriendCoopGoalDto(PlayerCoopGoalState state, DateTimeOffset now)
    {
        var progress = Math.Clamp(state.Progress, 0, FriendCoopGoalTarget);
        var claimedTierMask = state.ClaimedTierMask | (state.IsClaimed ? 1 << 2 : 0);
        var tiers = FriendCoopTiers
            .Select(tier => new FriendCoopTierDto(
                tier.TierId,
                tier.Target,
                tier.RewardType,
                tier.RewardAmount,
                progress >= tier.Target && (claimedTierMask & tier.TierBit) == 0,
                (claimedTierMask & tier.TierBit) != 0))
            .ToArray();
        var finalTier = tiers[^1];
        return new FriendCoopGoalDto(
            state.GoalDate,
            progress,
            FriendCoopGoalTarget,
            finalTier.Claimable,
            finalTier.Claimed,
            FriendCoopGoalRewardDiamond,
            state.UpdatedAt.ToUnixTimeMilliseconds(),
            now.ToUnixTimeMilliseconds(),
            tiers);
    }

    private async Task<FriendProfileDto> BuildFriendProfileAsync(FriendSnapshot friend, CancellationToken cancellationToken)
    {
        if (!TryGetRealFriendPlayerId(friend.FriendKey, out var realPlayerId))
        {
            return new FriendProfileDto(
                false,
                null,
                null,
                null,
                "system",
                Math.Clamp(friend.Level / 6, 1, 5),
                Math.Max(6, friend.Level * 2));
        }

        var player = await repository.FindPlayerByIdAsync(realPlayerId, cancellationToken);
        if (player is null)
        {
            return new FriendProfileDto(true, realPlayerId.ToString("N"), null, null, "offline", 0, 0);
        }

        var invite = await EnsureInviteCodeAsync(realPlayerId, cancellationToken);
        var catStates = await repository.GetCatStatesAsync(realPlayerId, cancellationToken);
        var buildingStates = await repository.GetBuildingStatesAsync(realPlayerId, cancellationToken);
        return new FriendProfileDto(
            true,
            realPlayerId.ToString("N"),
            invite.Code,
            player.UpdatedAt.ToUnixTimeMilliseconds(),
            GetPresenceStatus(player.UpdatedAt),
            catStates.Count(cat => cat.IsUnlocked),
            buildingStates.Sum(building => Math.Max(0, building.Level)));
    }

    private static string GetPresenceStatus(DateTimeOffset lastActiveAt)
    {
        var age = DateTimeOffset.UtcNow - lastActiveAt;
        if (age <= TimeSpan.FromMinutes(2))
        {
            return "online";
        }
        return age <= TimeSpan.FromMinutes(30) ? "recent" : "offline";
    }

    private static DecorStateDto ToDecorStateDto(PlayerDecorState decor)
    {
        return new DecorStateDto(
            decor.DecorKey,
            decor.BuildingKey,
            decor.Name,
            decor.Score,
            decor.IsPlaced,
            decor.UpdatedAt.ToUnixTimeMilliseconds());
    }

    private static DecorCollectionDto ToDecorCollectionDto(
        IReadOnlyCollection<PlayerDecorState> decorations,
        int claimedTierMask,
        DateTimeOffset now)
    {
        var premiumDecorations = decorations
            .Where(item => item.DecorKey.StartsWith("decor_shop_", StringComparison.Ordinal))
            .ToArray();
        var ownedCount = premiumDecorations.Length;
        return new DecorCollectionDto(
            ownedCount,
            DecorCatalog.Length,
            premiumDecorations.Sum(item => item.Score),
            DecorCollectionTiers
                .Select(tier => new DecorCollectionTierDto(
                    tier.TierId,
                    tier.TargetCount,
                    tier.RewardType,
                    tier.RewardAmount,
                    (claimedTierMask & tier.TierBit) != 0,
                    ownedCount >= tier.TargetCount && (claimedTierMask & tier.TierBit) == 0))
                .ToArray(),
            now.ToUnixTimeMilliseconds());
    }

    private async Task<IReadOnlyList<FriendRoomDto>> BuildFriendRoomsAsync(FriendSnapshot friend, CancellationToken cancellationToken)
    {
        var realPlayerId = TryGetRealFriendPlayerId(friend.FriendKey, out var parsedRealPlayerId)
            ? parsedRealPlayerId
            : Guid.Empty;
        IReadOnlyList<PlayerCatState> catStates = realPlayerId == Guid.Empty
            ? []
            : await repository.GetCatStatesAsync(realPlayerId, cancellationToken);
        IReadOnlyList<PlayerBuildingState> buildingStates = realPlayerId == Guid.Empty
            ? []
            : await repository.GetBuildingStatesAsync(realPlayerId, cancellationToken);
        IReadOnlyList<PlayerDecorState> decorStates = [];
        if (realPlayerId != Guid.Empty)
        {
            decorStates = await repository.GetDecorStatesAsync(realPlayerId, cancellationToken);
            if (decorStates.Count < DefaultDecorations.Length)
            {
                await EnsureDefaultDecorStatesAsync(realPlayerId, cancellationToken);
                decorStates = await repository.GetDecorStatesAsync(realPlayerId, cancellationToken);
            }
        }
        var orderedDefinitions = balance.BuildingDefinitions.Values
            .OrderByDescending(definition => GetFriendRoomSort(definition.Floor))
            .ToArray();
        var totalWeight = orderedDefinitions.Sum(definition => Math.Max(1, Math.Abs(definition.BaseValue) + definition.Level * 3));
        var remaining = Math.Max(0, friend.IncomePerSecond);
        var rooms = new List<FriendRoomDto>(orderedDefinitions.Length);

        for (var index = 0; index < orderedDefinitions.Length; index++)
        {
            var definition = orderedDefinitions[index];
            var buildingLevel = buildingStates.FirstOrDefault(state => string.Equals(state.BuildingKey, definition.BuildingId, StringComparison.Ordinal))?.Level
                ?? Math.Max(1, Math.Min(definition.MaxLevel, friend.Level / 3 + definition.Level / 2));
            var assignedCats = catStates
                .Where(cat => cat.IsUnlocked && string.Equals(NormalizeExistingBuildingId(cat.AssignedBuildingKey), definition.BuildingId, StringComparison.Ordinal))
                .OrderByDescending(cat => cat.Level)
                .ToArray();
            var estimatedCatCount = realPlayerId == Guid.Empty && definition.Floor is not "B1"
                ? Math.Clamp(friend.Level / 9, 1, 3)
                : 0;
            var assignedCatCount = assignedCats.Length > 0 ? assignedCats.Length : estimatedCatCount;
            var featuredCatName = assignedCats.Length > 0
                ? GetFriendCatName(assignedCats[0].CatKey)
                : (assignedCatCount > 0 ? "巡逻肥猫" : "待派驻");
            var decorations = realPlayerId == Guid.Empty
                ? DefaultDecorations
                    .Where(decor => string.Equals(decor.BuildingId, definition.BuildingId, StringComparison.Ordinal))
                    .Select(decor => new FriendDecorDto(decor.DecorId, decor.Name, decor.Score, true))
                    .ToArray()
                : decorStates
                    .Where(decor => decor.IsPlaced && string.Equals(decor.BuildingKey, definition.BuildingId, StringComparison.Ordinal))
                    .Select(decor => new FriendDecorDto(decor.DecorKey, decor.Name, decor.Score, decor.IsPlaced))
                    .ToArray();
            var decorScore = decorations.Sum(decor => Math.Max(0, decor.Score));
            var production = index == orderedDefinitions.Length - 1
                ? remaining
                : (int)Math.Floor(friend.IncomePerSecond * (Math.Max(1, Math.Abs(definition.BaseValue) + definition.Level * 3) / (double)Math.Max(1, totalWeight)));
            production = Math.Max(0, production);
            remaining = Math.Max(0, remaining - production);
            rooms.Add(new FriendRoomDto(
                definition.BuildingId,
                definition.Floor,
                GetFriendRoomName(definition.BuildingId),
                buildingLevel,
                production,
                assignedCatCount,
                featuredCatName,
                decorScore,
                decorations));
        }

        return rooms;
    }

    private static int GetFriendRoomSort(string floor)
    {
        if (string.Equals(floor, "B1", StringComparison.OrdinalIgnoreCase))
        {
            return 0;
        }

        return int.TryParse(floor.TrimEnd('F', 'f'), out var value) ? value : 0;
    }

    private static string GetFriendRoomName(string buildingId)
    {
        return buildingId switch
        {
            "building_office_5f" => "管理室",
            "building_roast_4f" => "烘焙车间",
            "building_ferment_3f" => "发酵车间",
            "building_material_2f" => "原料车间",
            "building_cafe_1f" => "咖啡厅",
            "building_storage_b1" => "原料仓库",
            _ => "好友房间",
        };
    }

    private static string GetFriendCatName(string catId)
    {
        return catId switch
        {
            "c_001" => "大橘",
            "c_002" => "黑糖",
            "c_003" => "雪团",
            "c_004" => "三花",
            "c_005" => "礼帽",
            _ => "好友猫咪",
        };
    }

    private async Task<FriendActionResponse> ToFriendActionResponseAsync(
        FriendSnapshot friend,
        bool rewarded,
        int rewardCoin,
        int rewardCatFood,
        PlayerResourceState resources,
        DateTimeOffset serverTime,
        string? limitedReason,
        CancellationToken cancellationToken)
    {
        return new FriendActionResponse(
            await ToFriendDtoAsync(friend, cancellationToken),
            rewarded,
            rewardCoin,
            rewardCatFood,
            resources.Coin,
            resources.Bean,
            resources.CatFood,
            resources.Diamond,
            resources.ResearchPoint,
            serverTime.ToUnixTimeMilliseconds(),
            limitedReason);
    }

    private static FriendActivityDto ToFriendActivityDto(PlayerSocialActivity activity)
    {
        return new FriendActivityDto(
            activity.Id.ToString("N"),
            activity.ActivityType,
            activity.FriendKey,
            activity.FriendName,
            activity.CreatedAt.ToUnixTimeMilliseconds());
    }

    private static PlayerSocialProfileDto ToPlayerSocialProfileDto(
        PlayerProfile player,
        ProductionPreviewResponse? preview,
        string inviteCode,
        bool isSelf,
        bool isFriend)
    {
        return new PlayerSocialProfileDto(
            player.Id.ToString("N"),
            player.CompanyName,
            player.Level,
            (int)Math.Floor(Math.Max(0, preview?.NetCoinPerSecond ?? 0)),
            inviteCode,
            isSelf,
            isFriend);
    }

    private static FriendSearchResultDto ToFriendSearchResultDto(
        PlayerProfile player,
        ProductionPreviewResponse? preview,
        string inviteCode,
        bool isSelf,
        bool isFriend)
    {
        return new FriendSearchResultDto(
            player.Id.ToString("N"),
            player.CompanyName,
            player.Level,
            (int)Math.Floor(Math.Max(0, preview?.NetCoinPerSecond ?? 0)),
            inviteCode,
            isSelf,
            isFriend);
    }

    private static string NormalizeLeaderboardBoardId(string? boardId)
    {
        return string.Equals(boardId?.Trim(), "income", StringComparison.OrdinalIgnoreCase)
            ? "income"
            : "income";
    }

    private static bool TryParsePlayerId(string? value, out Guid playerId)
    {
        if (Guid.TryParse(value, out playerId))
        {
            return true;
        }

        return Guid.TryParseExact(value?.Trim(), "N", out playerId);
    }

    private async Task<Guid?> ResolveFriendPlayerIdAsync(AddFriendRequest request, CancellationToken cancellationToken)
    {
        return await ResolveFriendQueryAsync(request.InviteCode, cancellationToken)
            ?? await ResolveFriendQueryAsync(request.FriendPlayerId, cancellationToken);
    }

    private async Task<Guid?> ResolveFriendQueryAsync(string? value, CancellationToken cancellationToken)
    {
        if (TryParsePlayerId(value, out var playerId))
        {
            return playerId;
        }

        if (TryParseLegacyInviteCode(value, out playerId))
        {
            return playerId;
        }

        var normalized = NormalizeInviteCode(value);
        if (normalized.Length <= 0)
        {
            return null;
        }

        var invite = await repository.GetInviteCodeByCodeAsync(normalized, cancellationToken);
        return invite?.PlayerId;
    }

    private async Task<PlayerInviteCode> EnsureInviteCodeAsync(Guid playerId, CancellationToken cancellationToken)
    {
        var existing = await repository.GetInviteCodeByPlayerIdAsync(playerId, cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        foreach (var candidate in CreateInviteCodeCandidates(playerId))
        {
            var used = await repository.GetInviteCodeByCodeAsync(candidate, cancellationToken);
            if (used is not null && used.PlayerId != playerId)
            {
                continue;
            }

            var invite = new PlayerInviteCode
            {
                PlayerId = playerId,
                Code = candidate,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
            };
            await repository.AddInviteCodeAsync(invite, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            return invite;
        }

        throw new InvalidOperationException("Unable to allocate invite code.");
    }

    private async Task EnsureFriendRelationAsync(Guid playerId, Guid friendPlayerId, string friendKey, CancellationToken cancellationToken)
    {
        if (await repository.GetFriendRelationAsync(playerId, friendPlayerId, cancellationToken) is not null)
        {
            return;
        }

        await repository.AddFriendRelationAsync(new PlayerFriendRelation
        {
            PlayerId = playerId,
            FriendPlayerId = friendPlayerId,
            FriendKey = friendKey,
            Status = "accepted",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);
    }

    private static IEnumerable<string> CreateInviteCodeCandidates(Guid playerId)
    {
        var normalized = playerId.ToString("N").ToUpperInvariant();
        yield return $"FC{normalized[..8]}";
        yield return $"FC{normalized[..10]}";
        yield return $"FC{normalized[..12]}";
        yield return $"FC{normalized[..16]}";
        yield return $"FC{normalized[..18]}";
    }

    private static bool TryParseLegacyInviteCode(string? value, out Guid playerId)
    {
        playerId = Guid.Empty;
        var normalized = NormalizeInviteCode(value);
        if (normalized.Length != 34 || !normalized.StartsWith("FC", StringComparison.Ordinal))
        {
            return false;
        }

        return Guid.TryParseExact(normalized[2..].ToLowerInvariant(), "N", out playerId);
    }

    private static string NormalizeInviteCode(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? ""
            : value.Trim().Replace("-", "", StringComparison.Ordinal).Replace(" ", "", StringComparison.Ordinal).ToUpperInvariant();
    }

    private static string CreateRealFriendKey(Guid playerId)
    {
        return $"player:{playerId:N}";
    }

    private static bool TryGetRealFriendPlayerId(string friendKey, out Guid playerId)
    {
        playerId = Guid.Empty;
        return friendKey.StartsWith("player:", StringComparison.Ordinal)
            && Guid.TryParseExact(friendKey["player:".Length..], "N", out playerId);
    }

    private static bool IsSameUtcDate(DateTimeOffset? left, DateTimeOffset right)
    {
        return left?.UtcDateTime.Date == right.UtcDateTime.Date;
    }

    private static int CalculateFriendVisitCoinReward(FriendSnapshot friend)
    {
        return Math.Clamp(friend.IncomePerSecond, 100, 1_500);
    }

    private static SettingsDto ToSettingsDto(PlayerSettings settings)
    {
        var values = JsonSerializer.Deserialize<Dictionary<string, bool>>(settings.SettingsJson) ?? [];
        return new SettingsDto(values);
    }

    private CatStateDto ToCatStateDto(PlayerCatState cat)
    {
        EnsureCatEquipmentDefaults(cat);
        var ownedSkinIds = EnsureCatSkinDefaults(cat);
        var definition = balance.CatDefinitions.TryGetValue(cat.CatKey, out var configured)
            ? configured
            : new CatDefinition(cat.CatKey, "B", "producer", 0, 0, 0, cat.Weight, "");
        return new CatStateDto(
            cat.CatKey,
            cat.IsUnlocked,
            cat.Level,
            cat.Weight,
            NormalizeExistingBuildingId(cat.AssignedBuildingKey),
            ReadStringMap(cat.EquipmentJson),
            ReadIntMap(cat.EquipmentLevelsJson),
            ownedSkinIds,
            cat.EquippedSkinKey,
            cat.UpdatedAt.ToUnixTimeMilliseconds(),
            definition.Rarity,
            definition.Role,
            definition.BaseProduction,
            definition.BaseBeanCost,
            definition.BaseSalary,
            definition.BaseWeight,
            definition.SkillId);
    }

    private BuildingStateDto ToBuildingStateDto(PlayerBuildingState building)
    {
        var definition = balance.BuildingDefinitions[building.BuildingKey];
        return new BuildingStateDto(
            building.BuildingKey,
            building.Level,
            definition.MaxLevel,
            CalculateBuildingEffectValue(definition, building.Level),
            building.Level >= definition.MaxLevel ? 0 : CalculateBuildingUpgradeCost(definition, building.Level),
            GetBuildingScheduleCapacity(building.BuildingKey, building.Level),
            building.UpdatedAt.ToUnixTimeMilliseconds());
    }

    private ResearchStateDto ToResearchStateDto(PlayerResearchState research)
    {
        var definition = balance.ResearchDefinitions.TryGetValue(research.ResearchKey, out var configured)
            ? configured
            : new ResearchDefinition(research.ResearchKey, 0, "", 0, null);
        return new ResearchStateDto(
            research.ResearchKey,
            research.Level > 0 || research.IsUnlocked,
            research.Level,
            definition.MaxLevel,
            research.UpdatedAt.ToUnixTimeMilliseconds(),
            definition.Cost,
            definition.GetNextCost(research.Level),
            definition.CostGrowth,
            definition.EffectType,
            definition.EffectValue,
            definition.EffectStep,
            definition.GetEffectValue(research.Level),
            definition.GetEffectValue(Math.Min(research.Level + 1, definition.MaxLevel)),
            definition.ParentResearchId,
            definition.GetParentResearchIds());
    }

    private const string DefaultCatId = "c_001";
    private const string DefaultBuildingId = "building_cafe_1f";
    private const int MaxCatWeight = 100;
    private const int FriendGiftCatFoodReward = 12;
    private const int FriendHelpBoostPercent = 10;
    private const int MaxFriendBoostPercent = 30;
    private const int FriendCoopGoalTarget = 3;
    private const int FriendCoopGoalRewardDiamond = 30;
    private const int DailyOrderInitialProgress = 56;
    private const int DailyOrderTarget = 60;
    private const int DailyOrderRewardCoin = 1_000;
    private const int DailyOrderRewardResearchPoint = 10;
    private const int DailyLaunchLimit = 5;
    private static readonly TimeSpan FriendHelpDuration = TimeSpan.FromMinutes(30);
    private sealed record ShopItemDefinition(string ShopItemId, string ItemId, string PriceType, int PriceAmount, int LimitDaily);
    private sealed record DecorCatalogDefinition(
        string DecorId,
        string Name,
        string Description,
        string DefaultBuildingId,
        int Score,
        string PriceType,
        int PriceAmount);

    private sealed record CatSkinCatalogDefinition(
        string SkinId,
        string Name,
        string Description,
        string PriceType,
        int PriceAmount,
        bool Purchasable);
    private sealed record DecorCollectionTierDefinition(
        string TierId,
        int TargetCount,
        string RewardType,
        int RewardAmount,
        int TierBit);
    private sealed record FriendCoopTierDefinition(
        string TierId,
        int Target,
        string RewardType,
        int RewardAmount,
        int TierBit);
    private sealed record ProductionModifiers(
        int GrossCoinPercent,
        int GrossCoinAdd,
        int WageCostPercent,
        int BeanCostReducePercent)
    {
        public static ProductionModifiers None { get; } = new(0, 0, 0, 0);
    }
}
