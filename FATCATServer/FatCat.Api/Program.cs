using FatCat.Application;
using FatCat.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
const string CorsPolicyName = "FatCatCors";

builder.Services.AddOpenApi();
builder.Services.AddSingleton(_ =>
    BalanceConfig.LoadFromFile(Path.Combine(builder.Environment.ContentRootPath, "balance.json")));
builder.Services.AddCors(options =>
{
    var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? ["http://localhost:7456", "http://127.0.0.1:7456"];

    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddScoped<FatCatGameService>();
builder.Services.AddSingleton<SocialEventBroker>();
builder.Services.AddSingleton<PlayerTokenService>();
builder.Services.AddFatCatInfrastructure(builder.Configuration);

var app = builder.Build();
app.UseCors(CorsPolicyName);
app.UseMiddleware<PlayerAuthenticationMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<FatCatDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
    await dbContext.EnsureRuntimeSchemaAsync();
}

app.MapGet("/health", () => Results.Ok(ApiEnvelope<object>.Success(new
{
    service = "FatCat.Api",
    status = "ok",
})));

app.MapPost("/api/auth/guest", async (
    AuthGuestRequest request,
    FatCatGameService service,
    PlayerTokenService tokenService,
    CancellationToken cancellationToken) =>
{
    var result = await service.AuthGuestAsync(request, cancellationToken);
    return Results.Ok(ApiEnvelope<AuthGuestResponse>.Success(
        result with { Token = tokenService.Issue(result.PlayerId) }));
});

app.MapGet("/api/config/version", () => Results.Ok(ApiEnvelope<object>.Success(new
{
    configVersion = "fatcat-config-2026-06-13",
    minClientVersion = 1,
})));

app.MapGet("/api/server/status", (IHostEnvironment environment) => Results.Ok(ApiEnvelope<object>.Success(new
{
    service = "FatCat.Api",
    status = "ok",
    environment = environment.EnvironmentName,
    apiVersion = "fatcat-api-2026-07-08",
    configVersion = "fatcat-config-2026-06-13",
    minClientVersion = 1,
    serverTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
    requiresPlayerToken = true,
    realtime = new
    {
        socialEvents = true,
        transport = "server-sent-events",
    },
    multiplayerFeatures = new[]
    {
        "signed-guest-auth",
        "presence",
        "real-friends",
        "friend-requests",
        "visits",
        "gifts",
        "cooperative-boosts",
        "cooperative-goals",
        "leaderboard",
        "social-events",
    },
})));

app.MapGet("/api/config/bootstrap", (FatCatGameService service) =>
{
    return Results.Ok(ApiEnvelope<BootstrapDto>.Success(service.GetBootstrap()));
});

app.MapGet("/api/player/me", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var player = await service.GetPlayerAsync(playerId, cancellationToken);
    return player is null
        ? Results.NotFound(ApiEnvelope<PlayerDto>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<PlayerDto>.Success(player));
});

app.MapPost("/api/social/presence", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.TouchPresenceAsync(playerId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<PlayerPresenceDto>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<PlayerPresenceDto>.Success(result));
});

app.MapGet("/api/social/boost", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetFriendBoostAsync(playerId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<FriendBoostStateDto>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<FriendBoostStateDto>.Success(result));
});

app.MapGet("/api/social/boost/history", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetFriendBoostHistoryAsync(playerId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<FriendBoostHistoryDto>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<FriendBoostHistoryDto>.Success(result));
});

app.MapGet("/api/social/coop-goal", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetFriendCoopGoalAsync(playerId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<FriendCoopGoalDto>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<FriendCoopGoalDto>.Success(result));
});

app.MapPost("/api/social/coop-goal/claim", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.ClaimFriendCoopGoalAsync(playerId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<FriendCoopClaimResponse>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<FriendCoopClaimResponse>.Success(result));
});

app.MapPost("/api/social/coop-goal/{tierId}/claim", async (
    Guid playerId,
    string tierId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.ClaimFriendCoopTierAsync(playerId, tierId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<FriendCoopTierClaimResponse>.Fail("player_or_tier_not_found"))
        : Results.Ok(ApiEnvelope<FriendCoopTierClaimResponse>.Success(result));
});

app.MapGet("/api/social/events", async (
    Guid playerId,
    HttpContext context,
    FatCatGameService service,
    SocialEventBroker eventBroker,
    CancellationToken cancellationToken) =>
{
    if (await service.GetPlayerAsync(playerId, cancellationToken) is null)
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    context.Response.Headers.ContentType = "text/event-stream";
    context.Response.Headers.CacheControl = "no-cache";
    context.Response.Headers.Connection = "keep-alive";
    await context.Response.WriteAsync(": connected\n\n", cancellationToken);
    await context.Response.Body.FlushAsync(cancellationToken);

    using var subscription = eventBroker.Subscribe(playerId);
    try
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            var waitForEvent = subscription.Reader.WaitToReadAsync(cancellationToken).AsTask();
            var keepAlive = Task.Delay(TimeSpan.FromSeconds(15), cancellationToken);
            var completed = await Task.WhenAny(waitForEvent, keepAlive);
            if (completed == keepAlive)
            {
                await context.Response.WriteAsync(": keepalive\n\n", cancellationToken);
                await context.Response.Body.FlushAsync(cancellationToken);
                continue;
            }
            if (!await waitForEvent)
            {
                break;
            }
            while (subscription.Reader.TryRead(out var socialEvent))
            {
                await context.Response.WriteAsync($"data: {JsonSerializer.Serialize(socialEvent, JsonSerializerOptions.Web)}\n\n", cancellationToken);
                await context.Response.Body.FlushAsync(cancellationToken);
            }
        }
    }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
    {
    }
});

app.MapGet("/api/resources", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var resources = await service.GetResourcesAsync(playerId, cancellationToken);
    return resources is null
        ? Results.NotFound(ApiEnvelope<ResourceStateDto>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<ResourceStateDto>.Success(resources));
});

app.MapGet("/api/resources/transactions", async (
    Guid playerId,
    int? limit,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var transactions = await service.GetResourceTransactionsAsync(playerId, limit ?? 20, cancellationToken);
    return transactions is null
        ? Results.NotFound(ApiEnvelope<IReadOnlyList<ResourceTransactionDto>>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<IReadOnlyList<ResourceTransactionDto>>.Success(transactions));
});

app.MapGet("/api/daily-order", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var order = await service.GetDailyOrderAsync(playerId, cancellationToken);
    return order is null
        ? Results.NotFound(ApiEnvelope<DailyOrderDto>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<DailyOrderDto>.Success(order));
});

app.MapPost("/api/daily-order/claim", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.ClaimDailyOrderAsync(playerId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<DailyOrderClaimResponse>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<DailyOrderClaimResponse>.Success(result));
});

app.MapGet("/api/achievements", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var achievements = await service.GetAchievementsAsync(playerId, cancellationToken);
    return achievements is null
        ? Results.NotFound(ApiEnvelope<IReadOnlyList<AchievementDto>>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<IReadOnlyList<AchievementDto>>.Success(achievements));
});

app.MapPost("/api/achievements/{achievementId}/claim", async (
    Guid playerId,
    string achievementId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.ClaimAchievementAsync(playerId, achievementId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<AchievementClaimResponse>.Fail("achievement_not_found"))
        : Results.Ok(ApiEnvelope<AchievementClaimResponse>.Success(result));
});

app.MapGet("/api/save", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var save = await service.GetSaveAsync(playerId, cancellationToken);
    return save is null
        ? Results.NotFound(ApiEnvelope<object>.Fail("save_not_found"))
        : Results.Ok(ApiEnvelope<object>.Success(save));
});

app.MapPost("/api/save/sync", async (
    Guid playerId,
    SaveSyncRequest request,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.SyncSaveAsync(playerId, request, cancellationToken);
    return result.Accepted
        ? Results.Ok(ApiEnvelope<SaveSyncResponse>.Success(result))
        : Results.BadRequest(ApiEnvelope<SaveSyncResponse>.Fail(result.ConflictReason ?? "save_sync_failed"));
});

app.MapPost("/api/production/preview", async (
    Guid? playerId,
    ProductionPreviewRequest request,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.PreviewProductionAsync(playerId, request, cancellationToken);
    return Results.Ok(ApiEnvelope<ProductionPreviewResponse>.Success(result));
});

app.MapGet("/api/production/server-preview", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.PreviewServerProductionAsync(playerId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<ProductionPreviewResponse>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<ProductionPreviewResponse>.Success(result));
});

app.MapPost("/api/launch", async (
    Guid playerId,
    LaunchRequest request,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.LaunchAsync(playerId, request, cancellationToken);
    return result.Accepted
        ? Results.Ok(ApiEnvelope<LaunchResponse>.Success(result))
        : Results.BadRequest(ApiEnvelope<LaunchResponse>.Fail(result.RejectedReason ?? "launch_rejected", result));
});

app.MapGet("/api/mail", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetMailAsync(playerId, cancellationToken);
    return result.Count == 0
        ? Results.NotFound(ApiEnvelope<IReadOnlyList<MailDto>>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<IReadOnlyList<MailDto>>.Success(result));
});

app.MapPost("/api/mail/{mailId}/claim", async (
    Guid playerId,
    string mailId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.ClaimMailAsync(playerId, mailId, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<ClaimMailResponse>.Fail("mail_not_found_or_claimed"))
        : Results.Ok(ApiEnvelope<ClaimMailResponse>.Success(result));
});

app.MapPost("/api/shop/purchase", async (
    Guid playerId,
    ShopPurchaseRequest request,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.PurchaseShopItemAsync(playerId, request, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<ShopPurchaseResponse>.Fail("shop_purchase_failed"))
        : Results.Ok(ApiEnvelope<ShopPurchaseResponse>.Success(result));
});

app.MapGet("/api/shop/state", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetShopStateAsync(playerId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<IReadOnlyList<ShopStateDto>>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<IReadOnlyList<ShopStateDto>>.Success(result));
});

app.MapPost("/api/cats/{catId}/upgrade", async (
    Guid playerId,
    string catId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.UpgradeCatAsync(playerId, new CatUpgradeRequest(catId), cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<CatUpgradeResponse>.Fail("cat_upgrade_failed"))
        : Results.Ok(ApiEnvelope<CatUpgradeResponse>.Success(result));
});

app.MapPost("/api/cats/{catId}/feed", async (
    Guid playerId,
    string catId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.FeedCatAsync(playerId, new CatFeedRequest(catId), cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<CatFeedResponse>.Fail("cat_feed_failed"))
        : Results.Ok(ApiEnvelope<CatFeedResponse>.Success(result));
});

app.MapPost("/api/cats/{catId}/unlock", async (
    Guid playerId,
    string catId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.UnlockCatAsync(playerId, new CatUnlockRequest(catId), cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<CatUnlockResponse>.Fail("cat_unlock_failed"))
        : Results.Ok(ApiEnvelope<CatUnlockResponse>.Success(result));
});

app.MapPost("/api/cats/{catId}/equipment/{itemId}/upgrade", async (
    Guid playerId,
    string catId,
    string itemId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.UpgradeEquipmentAsync(playerId, catId, itemId, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<EquipmentUpgradeResponse>.Fail("equipment_upgrade_failed"))
        : Results.Ok(ApiEnvelope<EquipmentUpgradeResponse>.Success(result));
});

app.MapPost("/api/cats/{catId}/skins/{skinId}/equip", async (
    Guid playerId,
    string catId,
    string skinId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.EquipCatSkinAsync(playerId, catId, skinId, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<CatSkinEquipResponse>.Fail("cat_skin_equip_failed"))
        : Results.Ok(ApiEnvelope<CatSkinEquipResponse>.Success(result));
});

app.MapGet("/api/cats/{catId}/skins/catalog", async (
    Guid playerId,
    string catId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetCatSkinCatalogAsync(playerId, catId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<IReadOnlyList<CatSkinCatalogItemDto>>.Fail("cat_skin_catalog_not_found"))
        : Results.Ok(ApiEnvelope<IReadOnlyList<CatSkinCatalogItemDto>>.Success(result));
});

app.MapPost("/api/cats/{catId}/skins/{skinId}/unlock", async (
    Guid playerId,
    string catId,
    string skinId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.UnlockCatSkinAsync(playerId, catId, skinId, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<CatSkinUnlockResponse>.Fail("cat_skin_unlock_failed"))
        : Results.Ok(ApiEnvelope<CatSkinUnlockResponse>.Success(result));
});

app.MapGet("/api/factory/appearances", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetFactoryAppearanceStateAsync(playerId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<FactoryAppearanceStateDto>.Fail("factory_appearance_state_not_found"))
        : Results.Ok(ApiEnvelope<FactoryAppearanceStateDto>.Success(result));
});

app.MapPost("/api/factory/appearances/{appearanceId}/unlock", async (
    Guid playerId,
    string appearanceId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.UnlockFactoryAppearanceAsync(playerId, appearanceId, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<FactoryAppearanceStateDto>.Fail("factory_appearance_unlock_failed"))
        : Results.Ok(ApiEnvelope<FactoryAppearanceStateDto>.Success(result));
});

app.MapPost("/api/factory/appearances/{appearanceId}/equip", async (
    Guid playerId,
    string appearanceId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.EquipFactoryAppearanceAsync(playerId, appearanceId, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<FactoryAppearanceStateDto>.Fail("factory_appearance_equip_failed"))
        : Results.Ok(ApiEnvelope<FactoryAppearanceStateDto>.Success(result));
});

app.MapPost("/api/cats/{catId}/assignment", async (
    Guid playerId,
    string catId,
    CatAssignmentRequest request,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.AssignCatAsync(playerId, catId, request, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<CatAssignmentResponse>.Fail("cat_assignment_failed"))
        : Results.Ok(ApiEnvelope<CatAssignmentResponse>.Success(result));
});

app.MapGet("/api/cats", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetCatsAsync(playerId, cancellationToken);
    return result.Count == 0
        ? Results.NotFound(ApiEnvelope<IReadOnlyList<CatStateDto>>.Fail("cats_not_found"))
        : Results.Ok(ApiEnvelope<IReadOnlyList<CatStateDto>>.Success(result));
});

app.MapGet("/api/buildings", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetBuildingsAsync(playerId, cancellationToken);
    return result.Count == 0
        ? Results.NotFound(ApiEnvelope<IReadOnlyList<BuildingStateDto>>.Fail("buildings_not_found"))
        : Results.Ok(ApiEnvelope<IReadOnlyList<BuildingStateDto>>.Success(result));
});

app.MapPost("/api/buildings/{buildingId}/upgrade", async (
    Guid playerId,
    string buildingId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.UpgradeBuildingAsync(playerId, buildingId, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<BuildingUpgradeResponse>.Fail("building_upgrade_failed"))
        : Results.Ok(ApiEnvelope<BuildingUpgradeResponse>.Success(result));
});

app.MapGet("/api/research", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetResearchAsync(playerId, cancellationToken);
    return Results.Ok(ApiEnvelope<IReadOnlyList<ResearchStateDto>>.Success(result));
});

app.MapPost("/api/research/{researchId}/unlock", async (
    Guid playerId,
    string researchId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.UnlockResearchAsync(playerId, new ResearchUnlockRequest(researchId), cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<ResearchUnlockResponse>.Fail("research_unlock_failed"))
        : Results.Ok(ApiEnvelope<ResearchUnlockResponse>.Success(result));
});

app.MapGet("/api/friends", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetFriendsAsync(playerId, cancellationToken);
    return result.Count == 0
        ? Results.NotFound(ApiEnvelope<IReadOnlyList<FriendDto>>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<IReadOnlyList<FriendDto>>.Success(result));
});

app.MapGet("/api/decor", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetDecorationsAsync(playerId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<IReadOnlyList<DecorStateDto>>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<IReadOnlyList<DecorStateDto>>.Success(result));
});

app.MapGet("/api/decor/catalog", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetDecorCatalogAsync(playerId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<IReadOnlyList<DecorCatalogItemDto>>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<IReadOnlyList<DecorCatalogItemDto>>.Success(result));
});

app.MapPost("/api/decor/{decorId}/purchase", async (
    Guid playerId,
    string decorId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.PurchaseDecorationAsync(playerId, decorId, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<DecorPurchaseResponse>.Fail("decor_purchase_failed"))
        : Results.Ok(ApiEnvelope<DecorPurchaseResponse>.Success(result));
});

app.MapGet("/api/decor/collection", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetDecorCollectionAsync(playerId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<DecorCollectionDto>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<DecorCollectionDto>.Success(result));
});

app.MapPost("/api/decor/collection/{tierId}/claim", async (
    Guid playerId,
    string tierId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.ClaimDecorCollectionTierAsync(playerId, tierId, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<DecorCollectionClaimResponse>.Fail("decor_collection_claim_failed"))
        : Results.Ok(ApiEnvelope<DecorCollectionClaimResponse>.Success(result));
});

app.MapPost("/api/decor/{decorId}/placement", async (
    Guid playerId,
    string decorId,
    DecorPlacementRequest request,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.UpdateDecorPlacementAsync(playerId, decorId, request, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<DecorStateDto>.Fail("decor_placement_failed"))
        : Results.Ok(ApiEnvelope<DecorStateDto>.Success(result));
});

app.MapGet("/api/friends/{friendId}", async (
    Guid playerId,
    string friendId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetFriendAsync(playerId, friendId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<FriendDto>.Fail("friend_not_found"))
        : Results.Ok(ApiEnvelope<FriendDto>.Success(result));
});

app.MapGet("/api/social/profile", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetSocialProfileAsync(playerId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<PlayerSocialProfileDto>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<PlayerSocialProfileDto>.Success(result));
});

app.MapGet("/api/friends/search", async (
    Guid playerId,
    string query,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.SearchFriendAsync(playerId, query, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<FriendSearchResultDto>.Fail("friend_not_found"))
        : Results.Ok(ApiEnvelope<FriendSearchResultDto>.Success(result));
});

app.MapPost("/api/friends/{friendId}/visit", async (
    Guid playerId,
    string friendId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.VisitFriendAsync(playerId, friendId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<FriendActionResponse>.Fail("friend_not_found"))
        : Results.Ok(ApiEnvelope<FriendActionResponse>.Success(result));
});

app.MapPost("/api/friends/{friendId}/gift", async (
    Guid playerId,
    string friendId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.SendFriendGiftAsync(playerId, friendId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<FriendActionResponse>.Fail("friend_not_found"))
        : Results.Ok(ApiEnvelope<FriendActionResponse>.Success(result));
});

app.MapPost("/api/friends/{friendId}/help", async (
    Guid playerId,
    string friendId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.HelpFriendAsync(playerId, friendId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<FriendHelpResponse>.Fail("friend_not_found"))
        : Results.Ok(ApiEnvelope<FriendHelpResponse>.Success(result));
});

app.MapPost("/api/friends/add", async (
    Guid playerId,
    AddFriendRequest request,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.AddFriendAsync(playerId, request, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<FriendDto>.Fail("friend_add_failed"))
        : Results.Ok(ApiEnvelope<FriendDto>.Success(result));
});

app.MapPost("/api/friends/requests", async (
    Guid playerId,
    CreateFriendRequestRequest request,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.CreateFriendRequestAsync(playerId, request, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<FriendRequestDto>.Fail("friend_request_failed"))
        : Results.Ok(ApiEnvelope<FriendRequestDto>.Success(result));
});

app.MapGet("/api/friends/requests", async (
    Guid playerId,
    string? box,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetFriendRequestsAsync(playerId, box, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<IReadOnlyList<FriendRequestDto>>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<IReadOnlyList<FriendRequestDto>>.Success(result));
});

app.MapPost("/api/friends/requests/{requestId:guid}/accept", async (
    Guid playerId,
    Guid requestId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.AcceptFriendRequestAsync(playerId, requestId, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<FriendRequestDto>.Fail("friend_request_accept_failed"))
        : Results.Ok(ApiEnvelope<FriendRequestDto>.Success(result));
});

app.MapPost("/api/friends/requests/{requestId:guid}/reject", async (
    Guid playerId,
    Guid requestId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.RejectFriendRequestAsync(playerId, requestId, cancellationToken);
    return result is null
        ? Results.BadRequest(ApiEnvelope<FriendRequestDto>.Fail("friend_request_reject_failed"))
        : Results.Ok(ApiEnvelope<FriendRequestDto>.Success(result));
});

app.MapGet("/api/friends/activity", async (
    Guid playerId,
    int? limit,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetFriendActivitiesAsync(playerId, limit ?? 10, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<IReadOnlyList<FriendActivityDto>>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<IReadOnlyList<FriendActivityDto>>.Success(result));
});

app.MapGet("/api/leaderboard", async (
    Guid playerId,
    string? boardId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetLeaderboardAsync(playerId, boardId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<LeaderboardDto>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<LeaderboardDto>.Success(result));
});

app.MapGet("/api/settings", async (
    Guid playerId,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetSettingsAsync(playerId, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<SettingsDto>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<SettingsDto>.Success(result));
});

app.MapPost("/api/settings", async (
    Guid playerId,
    SettingsDto request,
    FatCatGameService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.UpdateSettingsAsync(playerId, request, cancellationToken);
    return result is null
        ? Results.NotFound(ApiEnvelope<SettingsDto>.Fail("player_not_found"))
        : Results.Ok(ApiEnvelope<SettingsDto>.Success(result));
});

app.Run();

public partial class Program;
