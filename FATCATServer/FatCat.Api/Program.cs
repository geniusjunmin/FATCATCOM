using FatCat.Application;
using FatCat.Infrastructure;
using Microsoft.EntityFrameworkCore;

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
builder.Services.AddFatCatInfrastructure(builder.Configuration);

var app = builder.Build();
app.UseCors(CorsPolicyName);

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
    CancellationToken cancellationToken) =>
{
    var result = await service.AuthGuestAsync(request, cancellationToken);
    return Results.Ok(ApiEnvelope<AuthGuestResponse>.Success(result));
});

app.MapGet("/api/config/version", () => Results.Ok(ApiEnvelope<object>.Success(new
{
    configVersion = "fatcat-config-2026-06-13",
    minClientVersion = 1,
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
