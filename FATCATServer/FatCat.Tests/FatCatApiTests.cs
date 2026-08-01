using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FatCat.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace FatCat.Tests;

public sealed class FatCatApiTests
{
    [Fact]
    public async Task PlayerAuthentication_RejectsMissingInvalidAndCrossPlayerAccess()
    {
        await using var factory = new FatCatApiFactory(enforceAuthentication: true);
        var publicClient = factory.CreateClient();
        var firstAuthResponse = await publicClient.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-auth-owner-a",
            companyName = "Owner A",
        });
        var secondAuthResponse = await publicClient.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-auth-owner-b",
            companyName = "Owner B",
        });
        var firstAuth = JsonDocument.Parse(await firstAuthResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var secondAuth = JsonDocument.Parse(await secondAuthResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var firstPlayerId = firstAuth.GetProperty("playerId").GetGuid();
        var secondPlayerId = secondAuth.GetProperty("playerId").GetGuid();
        var firstToken = firstAuth.GetProperty("token").GetString();
        var secondToken = secondAuth.GetProperty("token").GetString();
        Assert.NotNull(firstToken);
        Assert.NotNull(secondToken);
        Assert.Equal(4, firstToken!.Split('.').Length);

        var missing = await publicClient.GetAsync($"/api/resources?playerId={firstPlayerId}");
        using var invalidClient = factory.CreateClient();
        invalidClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", $"{firstToken}tampered");
        var invalid = await invalidClient.GetAsync($"/api/resources?playerId={firstPlayerId}");
        using var firstClient = factory.CreateClient();
        firstClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", firstToken);
        var ownResources = await firstClient.GetAsync($"/api/resources?playerId={firstPlayerId}");

        var privatePaths = new[]
        {
            "/api/resources",
            "/api/cats",
            "/api/buildings",
            "/api/research",
            "/api/mail",
            "/api/save",
            "/api/daily-order",
            "/api/factory/appearances",
        };
        foreach (var path in privatePaths)
        {
            var response = await firstClient.GetAsync($"{path}?playerId={secondPlayerId}");
            var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement;
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            Assert.Equal("player_token_mismatch", body.GetProperty("error").GetString());
        }

        var crossUpgrade = await firstClient.PostAsJsonAsync(
            $"/api/cats/c_001/upgrade?playerId={secondPlayerId}",
            new { });
        using var secondClient = factory.CreateClient();
        secondClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", secondToken);
        var secondResourcesResponse = await secondClient.GetAsync($"/api/resources?playerId={secondPlayerId}");
        var secondResources = JsonDocument.Parse(await secondResourcesResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var publicBootstrap = await publicClient.GetAsync("/api/config/bootstrap");
        var publicPreview = await publicClient.PostAsJsonAsync("/api/production/preview", new
        {
            grossCoinPerSecond = 10,
            wageCostPerSecond = 1,
            beanCostPerSecond = 1,
        });

        Assert.Equal(HttpStatusCode.Unauthorized, missing.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, invalid.StatusCode);
        Assert.Equal(HttpStatusCode.OK, ownResources.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, crossUpgrade.StatusCode);
        Assert.Equal(12_450_000, secondResources.GetProperty("coin").GetDouble());
        Assert.Equal(HttpStatusCode.OK, publicBootstrap.StatusCode);
        Assert.Equal(HttpStatusCode.OK, publicPreview.StatusCode);
    }

    [Fact]
    public async Task PlayerAuthentication_AllowsSignedTokenForEventStreamQuery()
    {
        await using var factory = new FatCatApiFactory(enforceAuthentication: true);
        var client = factory.CreateClient();
        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-auth-sse-owner",
            companyName = "SSE Owner",
        });
        var auth = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var playerId = auth.GetProperty("playerId").GetGuid();
        var token = auth.GetProperty("token").GetString();
        Assert.NotNull(token);

        using var cancellation = new CancellationTokenSource(TimeSpan.FromSeconds(3));
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"/api/social/events?playerId={playerId}&access_token={Uri.EscapeDataString(token!)}");
        using var response = await client.SendAsync(
            request,
            HttpCompletionOption.ResponseHeadersRead,
            cancellation.Token);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/event-stream", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Bootstrap_ReturnsServerFeatures()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/config/bootstrap");
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("save-sync", body);
        Assert.Contains("production-preview", body);
        Assert.Contains("server-production-preview", body);
    }

    [Fact]
    public async Task ServerStatus_ReturnsPublicMultiplayerReadiness()
    {
        await using var factory = new FatCatApiFactory(enforceAuthentication: true);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/server/status");
        var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement;
        var data = body.GetProperty("data");
        var features = data.GetProperty("multiplayerFeatures").EnumerateArray()
            .Select(item => item.GetString())
            .ToArray();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(body.GetProperty("ok").GetBoolean());
        Assert.Equal("FatCat.Api", data.GetProperty("service").GetString());
        Assert.Equal("ok", data.GetProperty("status").GetString());
        Assert.Equal("fatcat-api-2026-07-08", data.GetProperty("apiVersion").GetString());
        Assert.Equal("fatcat-config-2026-06-13", data.GetProperty("configVersion").GetString());
        Assert.Equal(1, data.GetProperty("minClientVersion").GetInt32());
        Assert.True(data.GetProperty("requiresPlayerToken").GetBoolean());
        Assert.True(data.GetProperty("serverTime").GetInt64() > 0);
        Assert.True(data.GetProperty("realtime").GetProperty("socialEvents").GetBoolean());
        Assert.Equal("server-sent-events", data.GetProperty("realtime").GetProperty("transport").GetString());
        Assert.Contains("signed-guest-auth", features);
        Assert.Contains("real-friends", features);
        Assert.Contains("friend-requests", features);
        Assert.Contains("cooperative-goals", features);
        Assert.Contains("leaderboard", features);
        Assert.Contains("social-events", features);
    }

    [Fact]
    public async Task Cors_AllowsCocosPreviewOrigin()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/config/bootstrap");
        request.Headers.Add("Origin", "http://localhost:7456");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.TryGetValues("Access-Control-Allow-Origin", out var origins));
        Assert.Contains("http://localhost:7456", origins);
    }

    [Fact]
    public async Task GuestAuth_ThenMailList_Works()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var mailResponse = await client.GetAsync($"/api/mail?playerId={playerId}");
        var mailBody = await mailResponse.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, authResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, mailResponse.StatusCode);
        Assert.Contains("welcome", mailBody);
    }

    [Fact]
    public async Task FriendVisitAndGift_UpdateServerSnapshotContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-friend-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var friendsResponse = await client.GetAsync($"/api/friends?playerId={playerId}");
        var friends = JsonDocument.Parse(await friendsResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var visitResponse = await client.PostAsJsonAsync($"/api/friends/mocha/visit?playerId={playerId}", new {});
        var visit = JsonDocument.Parse(await visitResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var giftResponse = await client.PostAsJsonAsync($"/api/friends/mocha/gift?playerId={playerId}", new {});
        var gift = JsonDocument.Parse(await giftResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, friendsResponse.StatusCode);
        Assert.Equal(3, friends.GetArrayLength());
        Assert.Equal("cocoa", friends[0].GetProperty("id").GetString());
        Assert.True(friends[0].GetProperty("rooms").GetArrayLength() >= 3);
        Assert.Equal("5F", friends[0].GetProperty("rooms")[0].GetProperty("floor").GetString());
        Assert.True(friends[0].GetProperty("rooms")[0].GetProperty("productionPerSecond").GetInt32() >= 0);
        Assert.True(friends[0].GetProperty("rooms")[0].GetProperty("assignedCatCount").GetInt32() >= 0);
        Assert.False(string.IsNullOrWhiteSpace(friends[0].GetProperty("rooms")[0].GetProperty("featuredCatName").GetString()));
        Assert.True(friends[0].GetProperty("rooms")[0].GetProperty("decorScore").GetInt32() >= 0);
        var roomDecorations = friends[0].GetProperty("rooms")[0].GetProperty("decorations");
        Assert.Equal(2, roomDecorations.GetArrayLength());
        Assert.All(roomDecorations.EnumerateArray(), decor =>
        {
            Assert.False(string.IsNullOrWhiteSpace(decor.GetProperty("decorId").GetString()));
            Assert.False(string.IsNullOrWhiteSpace(decor.GetProperty("name").GetString()));
            Assert.True(decor.GetProperty("score").GetInt32() > 0);
            Assert.True(decor.GetProperty("isPlaced").GetBoolean());
        });
        Assert.Equal(HttpStatusCode.OK, visitResponse.StatusCode);
        Assert.Equal("mocha", visit.GetProperty("friend").GetProperty("id").GetString());
        Assert.True(visit.GetProperty("friend").GetProperty("rooms").GetArrayLength() >= 3);
        Assert.True(visit.GetProperty("friend").GetProperty("lastVisitedAt").GetInt64() > 0);
        Assert.True(visit.GetProperty("rewarded").GetBoolean());
        Assert.Equal(520, visit.GetProperty("rewardCoin").GetInt32());
        Assert.Equal(12450520, visit.GetProperty("coinBalance").GetDouble());
        Assert.Equal(HttpStatusCode.OK, giftResponse.StatusCode);
        Assert.Equal("mocha", gift.GetProperty("friend").GetProperty("id").GetString());
        Assert.True(gift.GetProperty("friend").GetProperty("lastGiftAt").GetInt64() > 0);
        Assert.True(gift.GetProperty("rewarded").GetBoolean());
        Assert.Equal(12, gift.GetProperty("rewardCatFood").GetInt32());
        Assert.Equal(3522, gift.GetProperty("catFoodBalance").GetDouble());
    }

    [Fact]
    public async Task Leaderboard_ReturnsIncomeRankingContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-leaderboard-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var response = await client.GetAsync($"/api/leaderboard?playerId={playerId}&boardId=income");
        var data = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var entries = data.GetProperty("entries");
        var self = data.GetProperty("self");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("income", data.GetProperty("boardId").GetString());
        Assert.Equal(4, entries.GetArrayLength());
        Assert.Equal("cocoa", entries[0].GetProperty("playerId").GetString());
        Assert.Equal(1, entries[0].GetProperty("rank").GetInt32());
        Assert.Equal(680, entries[0].GetProperty("score").GetInt32());
        Assert.Contains(entries.EnumerateArray(), entry => entry.GetProperty("isSelf").GetBoolean());
        Assert.True(self.GetProperty("score").GetInt32() > 0);
        Assert.True(data.GetProperty("serverTime").GetInt64() > 0);
    }

    [Fact]
    public async Task AddFriend_CreatesRealPlayerFriendContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-real-friend-a",
            companyName = "Alpha Cafe",
        });
        var targetResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-real-friend-b",
            companyName = "Beta Beans",
        });
        var playerId = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        var targetId = JsonDocument.Parse(await targetResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var add = await client.PostAsJsonAsync($"/api/friends/add?playerId={playerId}", new
        {
            friendPlayerId = targetId.ToString("N"),
        });
        var addData = JsonDocument.Parse(await add.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var friendKey = $"player:{targetId:N}";
        var presence = await client.PostAsJsonAsync($"/api/social/presence?playerId={targetId}", new {});
        var presenceData = JsonDocument.Parse(await presence.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var missingPresence = await client.PostAsJsonAsync($"/api/social/presence?playerId={Guid.NewGuid()}", new {});
        var refreshed = await client.GetAsync($"/api/friends/{Uri.EscapeDataString(friendKey)}?playerId={playerId}");
        var refreshedData = JsonDocument.Parse(await refreshed.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var missing = await client.GetAsync($"/api/friends/missing-friend?playerId={playerId}");
        var friends = await client.GetAsync($"/api/friends?playerId={playerId}");
        var friendData = JsonDocument.Parse(await friends.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var leaderboard = await client.GetAsync($"/api/leaderboard?playerId={playerId}&boardId=income");
        var leaderboardEntries = JsonDocument.Parse(await leaderboard.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("entries");

        Assert.Equal(HttpStatusCode.OK, add.StatusCode);
        Assert.Equal($"player:{targetId:N}", addData.GetProperty("id").GetString());
        Assert.Equal("Beta Beans", addData.GetProperty("name").GetString());
        Assert.True(addData.GetProperty("incomePerSecond").GetInt32() > 0);
        var profile = addData.GetProperty("profile");
        Assert.True(profile.GetProperty("isRealPlayer").GetBoolean());
        Assert.Equal(targetId.ToString("N"), profile.GetProperty("playerId").GetString());
        Assert.StartsWith("FC", profile.GetProperty("inviteCode").GetString());
        Assert.True(profile.GetProperty("lastActiveAt").GetInt64() > 0);
        Assert.Equal("online", profile.GetProperty("presenceStatus").GetString());
        Assert.True(profile.GetProperty("unlockedCatCount").GetInt32() > 0);
        Assert.True(profile.GetProperty("totalBuildingLevel").GetInt32() > 0);
        Assert.All(addData.GetProperty("rooms").EnumerateArray(), room =>
        {
            Assert.Equal(2, room.GetProperty("decorations").GetArrayLength());
            Assert.Equal(
                room.GetProperty("decorScore").GetInt32(),
                room.GetProperty("decorations").EnumerateArray().Sum(decor => decor.GetProperty("score").GetInt32()));
        });
        Assert.Equal(HttpStatusCode.OK, presence.StatusCode);
        Assert.Equal("online", presenceData.GetProperty("status").GetString());
        Assert.True(presenceData.GetProperty("lastActiveAt").GetInt64() > 0);
        Assert.Equal(HttpStatusCode.NotFound, missingPresence.StatusCode);
        Assert.Equal(HttpStatusCode.OK, refreshed.StatusCode);
        Assert.Equal(friendKey, refreshedData.GetProperty("id").GetString());
        Assert.Equal("Beta Beans", refreshedData.GetProperty("name").GetString());
        Assert.True(refreshedData.GetProperty("profile").GetProperty("isRealPlayer").GetBoolean());
        Assert.Equal("online", refreshedData.GetProperty("profile").GetProperty("presenceStatus").GetString());
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
        Assert.Equal(HttpStatusCode.OK, friends.StatusCode);
        Assert.Equal(4, friendData.GetArrayLength());
        Assert.Contains(friendData.EnumerateArray(), friend => friend.GetProperty("id").GetString() == $"player:{targetId:N}");
        Assert.Equal(HttpStatusCode.OK, leaderboard.StatusCode);
        Assert.Contains(leaderboardEntries.EnumerateArray(), entry => entry.GetProperty("playerId").GetString() == $"player:{targetId:N}");
    }

    [Fact]
    public async Task DecorPlacement_UpdatesServerDecorContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var auth = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-decor-owner",
            companyName = "Decor Cafe",
        });
        var playerId = JsonDocument.Parse(await auth.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var list = await client.GetAsync($"/api/decor?playerId={playerId}");
        var decorations = JsonDocument.Parse(await list.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var remove = await client.PostAsJsonAsync($"/api/decor/decor_cafe_sign/placement?playerId={playerId}", new
        {
            buildingId = "building_cafe_1f",
            isPlaced = false,
        });
        var removed = JsonDocument.Parse(await remove.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var invalid = await client.PostAsJsonAsync($"/api/decor/decor_cafe_sign/placement?playerId={playerId}", new
        {
            buildingId = "missing-building",
            isPlaced = true,
        });

        Assert.Equal(HttpStatusCode.OK, list.StatusCode);
        Assert.Equal(12, decorations.GetArrayLength());
        Assert.Equal(HttpStatusCode.OK, remove.StatusCode);
        Assert.Equal("decor_cafe_sign", removed.GetProperty("decorId").GetString());
        Assert.False(removed.GetProperty("isPlaced").GetBoolean());
        Assert.True(removed.GetProperty("updatedAt").GetInt64() > 0);
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
    }

    [Fact]
    public async Task DecorShop_ExposesCatalogAndPermanentPurchaseContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var auth = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-decor-shop-owner",
            companyName = "Decor Shop",
        });
        var playerId = JsonDocument.Parse(await auth.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var catalogResponse = await client.GetAsync($"/api/decor/catalog?playerId={playerId}");
        var catalog = JsonDocument.Parse(await catalogResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var purchaseResponse = await client.PostAsJsonAsync($"/api/decor/decor_shop_office_trophy/purchase?playerId={playerId}", new { });
        var purchase = JsonDocument.Parse(await purchaseResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var duplicate = await client.PostAsJsonAsync($"/api/decor/decor_shop_office_trophy/purchase?playerId={playerId}", new { });
        var inventoryResponse = await client.GetAsync($"/api/decor?playerId={playerId}");
        var inventory = JsonDocument.Parse(await inventoryResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, catalogResponse.StatusCode);
        Assert.Equal(6, catalog.GetArrayLength());
        Assert.All(catalog.EnumerateArray(), item => Assert.False(item.GetProperty("owned").GetBoolean()));
        Assert.Equal(HttpStatusCode.OK, purchaseResponse.StatusCode);
        Assert.Equal("decor_shop_office_trophy", purchase.GetProperty("decor").GetProperty("decorId").GetString());
        Assert.Equal("diamond", purchase.GetProperty("priceType").GetString());
        Assert.Equal(60, purchase.GetProperty("pricePaid").GetInt32());
        Assert.Equal(2520, purchase.GetProperty("diamondBalance").GetDouble());
        Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);
        Assert.Equal(13, inventory.GetArrayLength());
        Assert.Contains(inventory.EnumerateArray(), item =>
            item.GetProperty("decorId").GetString() == "decor_shop_office_trophy"
            && !item.GetProperty("isPlaced").GetBoolean());
    }

    [Fact]
    public async Task DecorCollection_ExposesProgressAndOneTimeClaimContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var auth = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-decor-collection-owner",
            companyName = "Collection Cafe",
        });
        var playerId = JsonDocument.Parse(await auth.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var initialResponse = await client.GetAsync($"/api/decor/collection?playerId={playerId}");
        var initial = JsonDocument.Parse(await initialResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var locked = await client.PostAsJsonAsync($"/api/decor/collection/collector_1/claim?playerId={playerId}", new { });
        await client.PostAsJsonAsync($"/api/decor/decor_shop_neon_paw/purchase?playerId={playerId}", new { });
        var claimResponse = await client.PostAsJsonAsync($"/api/decor/collection/collector_1/claim?playerId={playerId}", new { });
        var claim = JsonDocument.Parse(await claimResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var duplicate = await client.PostAsJsonAsync($"/api/decor/collection/collector_1/claim?playerId={playerId}", new { });

        Assert.Equal(HttpStatusCode.OK, initialResponse.StatusCode);
        Assert.Equal(0, initial.GetProperty("ownedCount").GetInt32());
        Assert.Equal(6, initial.GetProperty("totalCount").GetInt32());
        Assert.Equal(3, initial.GetProperty("tiers").GetArrayLength());
        Assert.Equal(HttpStatusCode.BadRequest, locked.StatusCode);
        Assert.Equal(HttpStatusCode.OK, claimResponse.StatusCode);
        Assert.Equal("coin", claim.GetProperty("rewardType").GetString());
        Assert.Equal(10_000, claim.GetProperty("rewardAmount").GetInt32());
        Assert.Equal(12_432_000, claim.GetProperty("coinBalance").GetDouble());
        Assert.Equal(1, claim.GetProperty("collection").GetProperty("ownedCount").GetInt32());
        Assert.True(claim.GetProperty("collection").GetProperty("tiers")[0].GetProperty("claimed").GetBoolean());
        Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);
    }

    [Fact]
    public async Task DecorCollection_ConcurrentClaims_GrantExactlyOneReward()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var auth = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-decor-collection-race",
            companyName = "Concurrent Collector",
        });
        var playerId = JsonDocument.Parse(await auth.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        await client.PostAsJsonAsync($"/api/decor/decor_shop_neon_paw/purchase?playerId={playerId}", new { });

        var claims = await Task.WhenAll(
            client.PostAsJsonAsync($"/api/decor/collection/collector_1/claim?playerId={playerId}", new { }),
            client.PostAsJsonAsync($"/api/decor/collection/collector_1/claim?playerId={playerId}", new { }));
        var resourcesResponse = await client.GetAsync($"/api/resources?playerId={playerId}");
        var resources = JsonDocument.Parse(await resourcesResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Single(claims, response => response.StatusCode == HttpStatusCode.OK);
        Assert.Single(claims, response => response.StatusCode == HttpStatusCode.BadRequest);
        Assert.Equal(12_432_000, resources.GetProperty("coin").GetDouble());
    }

    [Fact]
    public async Task SocialProfileAndFriendSearch_ReturnInviteCodeContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-invite-friend-a",
            companyName = "Alpha Cafe",
        });
        var targetResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-invite-friend-b",
            companyName = "Beta Beans",
        });
        var playerId = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        var targetId = JsonDocument.Parse(await targetResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var profile = await client.GetAsync($"/api/social/profile?playerId={targetId}");
        var profileData = JsonDocument.Parse(await profile.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var inviteCode = profileData.GetProperty("inviteCode").GetString();
        var search = await client.GetAsync($"/api/friends/search?playerId={playerId}&query={inviteCode}");
        var searchData = JsonDocument.Parse(await search.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var add = await client.PostAsJsonAsync($"/api/friends/add?playerId={playerId}", new
        {
            friendPlayerId = "",
            inviteCode,
        });
        var addData = JsonDocument.Parse(await add.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var searchAfter = await client.GetAsync($"/api/friends/search?playerId={playerId}&query={inviteCode}");
        var searchAfterData = JsonDocument.Parse(await searchAfter.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, profile.StatusCode);
        Assert.Equal(targetId.ToString("N"), profileData.GetProperty("playerId").GetString());
        Assert.StartsWith("FC", inviteCode);
        Assert.InRange(inviteCode!.Length, 10, 20);
        Assert.Equal(HttpStatusCode.OK, search.StatusCode);
        Assert.Equal("Beta Beans", searchData.GetProperty("companyName").GetString());
        Assert.False(searchData.GetProperty("isFriend").GetBoolean());
        Assert.Equal(HttpStatusCode.OK, add.StatusCode);
        Assert.Equal($"player:{targetId:N}", addData.GetProperty("id").GetString());
        Assert.Equal(HttpStatusCode.OK, searchAfter.StatusCode);
        Assert.True(searchAfterData.GetProperty("isFriend").GetBoolean());
    }

    [Fact]
    public async Task FriendRequests_AcceptIntoBidirectionalFriendContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-request-friend-a",
            companyName = "Alpha Cafe",
        });
        var targetResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-request-friend-b",
            companyName = "Beta Beans",
        });
        var playerId = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        var targetId = JsonDocument.Parse(await targetResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        var targetProfile = await client.GetAsync($"/api/social/profile?playerId={targetId}");
        var inviteCode = JsonDocument.Parse(await targetProfile.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("inviteCode").GetString();

        var request = await client.PostAsJsonAsync($"/api/friends/requests?playerId={playerId}", new
        {
            friendPlayerId = "",
            inviteCode,
        });
        var requestData = JsonDocument.Parse(await request.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var received = await client.GetAsync($"/api/friends/requests?playerId={targetId}&box=received");
        var receivedData = JsonDocument.Parse(await received.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var accept = await client.PostAsJsonAsync($"/api/friends/requests/{requestData.GetProperty("id").GetString()}/accept?playerId={targetId}", new {});
        var acceptData = JsonDocument.Parse(await accept.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var playerFriends = await client.GetAsync($"/api/friends?playerId={playerId}");
        var targetFriends = await client.GetAsync($"/api/friends?playerId={targetId}");
        var playerFriendData = JsonDocument.Parse(await playerFriends.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var targetFriendData = JsonDocument.Parse(await targetFriends.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, request.StatusCode);
        Assert.Equal("pending", requestData.GetProperty("status").GetString());
        Assert.Equal("sent", requestData.GetProperty("direction").GetString());
        Assert.Equal(HttpStatusCode.OK, received.StatusCode);
        Assert.Single(receivedData.EnumerateArray());
        Assert.Equal("received", receivedData[0].GetProperty("direction").GetString());
        Assert.Equal(HttpStatusCode.OK, accept.StatusCode);
        Assert.Equal("accepted", acceptData.GetProperty("status").GetString());
        Assert.Contains(playerFriendData.EnumerateArray(), friend => friend.GetProperty("id").GetString() == $"player:{targetId:N}");
        Assert.Contains(targetFriendData.EnumerateArray(), friend => friend.GetProperty("id").GetString() == $"player:{playerId:N}");
    }

    [Fact]
    public async Task FriendActivity_ReturnsRecentSocialActionsContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-friend-activity-a",
            companyName = "Alpha Cafe",
        });
        var targetResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-friend-activity-b",
            companyName = "Beta Beans",
        });
        var playerId = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        var targetId = JsonDocument.Parse(await targetResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        var targetKey = $"player:{targetId:N}";

        await client.PostAsJsonAsync($"/api/friends/add?playerId={playerId}", new
        {
            friendPlayerId = targetId.ToString("N"),
        });
        await client.PostAsJsonAsync($"/api/friends/{targetKey}/visit?playerId={playerId}", new {});
        await client.PostAsJsonAsync($"/api/friends/{targetKey}/gift?playerId={playerId}", new {});

        var response = await client.GetAsync($"/api/friends/activity?playerId={playerId}&limit=10");
        var activities = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(3, activities.GetArrayLength());
        Assert.Equal("friend_gift", activities[0].GetProperty("activityType").GetString());
        Assert.Equal("friend_visit", activities[1].GetProperty("activityType").GetString());
        Assert.Equal("friend_add", activities[2].GetProperty("activityType").GetString());
        Assert.All(activities.EnumerateArray(), activity =>
        {
            Assert.Equal(targetKey, activity.GetProperty("friendId").GetString());
            Assert.Equal("Beta Beans", activity.GetProperty("friendName").GetString());
            Assert.True(activity.GetProperty("createdAt").GetInt64() > 0);
        });
    }

    [Fact]
    public async Task FriendHelp_AppliesAndRestoresBoostContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var actorAuth = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-help-actor",
            companyName = "Helper Roastery",
        });
        var targetAuth = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-help-target",
            companyName = "Boosted Cafe",
        });
        var actorId = JsonDocument.Parse(await actorAuth.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        var targetId = JsonDocument.Parse(await targetAuth.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        var targetKey = $"player:{targetId:N}";
        await client.PostAsJsonAsync($"/api/friends/add?playerId={actorId}", new
        {
            friendPlayerId = targetId.ToString("N"),
        });

        var helpResponse = await client.PostAsJsonAsync(
            $"/api/friends/{Uri.EscapeDataString(targetKey)}/help?playerId={actorId}",
            new {});
        var helpData = JsonDocument.Parse(await helpResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var repeatedResponse = await client.PostAsJsonAsync(
            $"/api/friends/{Uri.EscapeDataString(targetKey)}/help?playerId={actorId}",
            new {});
        var repeatedData = JsonDocument.Parse(await repeatedResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var boostResponse = await client.GetAsync($"/api/social/boost?playerId={targetId}");
        var boostData = JsonDocument.Parse(await boostResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var historyResponse = await client.GetAsync($"/api/social/boost/history?playerId={targetId}");
        var historyData = JsonDocument.Parse(await historyResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, helpResponse.StatusCode);
        Assert.True(helpData.GetProperty("applied").GetBoolean());
        Assert.Equal(10, helpData.GetProperty("boost").GetProperty("boostPercent").GetInt32());
        Assert.True(helpData.GetProperty("boost").GetProperty("boostEndsAt").GetInt64() > 0);
        Assert.True(helpData.GetProperty("friend").GetProperty("lastHelpAt").GetInt64() > 0);
        Assert.False(repeatedData.GetProperty("applied").GetBoolean());
        Assert.Equal("daily_help_claimed", repeatedData.GetProperty("limitedReason").GetString());
        Assert.Equal(HttpStatusCode.OK, boostResponse.StatusCode);
        Assert.True(boostData.GetProperty("active").GetBoolean());
        Assert.Equal("Helper Roastery", boostData.GetProperty("boostedByName").GetString());
        Assert.Equal(HttpStatusCode.OK, historyResponse.StatusCode);
        Assert.Equal(10, historyData.GetProperty("activeBoostPercent").GetInt32());
        Assert.Equal(1, historyData.GetProperty("activeContributionCount").GetInt32());
        var contribution = Assert.Single(historyData.GetProperty("entries").EnumerateArray());
        Assert.Equal("Helper Roastery", contribution.GetProperty("sourceName").GetString());
        Assert.Equal(10, contribution.GetProperty("boostPercent").GetInt32());
        Assert.True(contribution.GetProperty("active").GetBoolean());
    }

    [Fact]
    public async Task FriendCoopGoal_ClaimsDiamondRewardContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var targetAuth = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-coop-target",
            companyName = "Coop Cafe",
        });
        var targetId = JsonDocument.Parse(await targetAuth.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        var targetKey = $"player:{targetId:N}";
        for (var index = 0; index < 3; index++)
        {
            var helperAuth = await client.PostAsJsonAsync("/api/auth/guest", new
            {
                deviceId = $"api-coop-helper-{index}",
                companyName = $"Helper {index}",
            });
            var helperId = JsonDocument.Parse(await helperAuth.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
            await client.PostAsJsonAsync($"/api/friends/add?playerId={helperId}", new
            {
                friendPlayerId = targetId.ToString("N"),
            });
            await client.PostAsJsonAsync(
                $"/api/friends/{Uri.EscapeDataString(targetKey)}/help?playerId={helperId}",
                new {});
        }

        var goalResponse = await client.GetAsync($"/api/social/coop-goal?playerId={targetId}");
        var goal = JsonDocument.Parse(await goalResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var claimResponse = await client.PostAsJsonAsync($"/api/social/coop-goal/claim?playerId={targetId}", new {});
        var claim = JsonDocument.Parse(await claimResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var repeatedResponse = await client.PostAsJsonAsync($"/api/social/coop-goal/claim?playerId={targetId}", new {});
        var repeated = JsonDocument.Parse(await repeatedResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, goalResponse.StatusCode);
        Assert.Equal(3, goal.GetProperty("progress").GetInt32());
        Assert.True(goal.GetProperty("claimable").GetBoolean());
        Assert.Equal(HttpStatusCode.OK, claimResponse.StatusCode);
        Assert.True(claim.GetProperty("claimed").GetBoolean());
        Assert.Equal(30, claim.GetProperty("rewardDiamond").GetInt32());
        Assert.Equal(2610, claim.GetProperty("diamondBalance").GetDouble());
        Assert.False(repeated.GetProperty("claimed").GetBoolean());
        Assert.Equal("already_claimed", repeated.GetProperty("limitedReason").GetString());
    }

    [Fact]
    public async Task FriendCoopTiers_ExposeAndAtomicallyClaimMilestones()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var targetAuth = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-coop-tier-target",
            companyName = "Tier API Cafe",
        });
        var targetId = JsonDocument.Parse(await targetAuth.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        var targetKey = $"player:{targetId:N}";
        for (var index = 0; index < 3; index++)
        {
            var helperAuth = await client.PostAsJsonAsync("/api/auth/guest", new
            {
                deviceId = $"api-coop-tier-helper-{index}",
                companyName = $"Tier Helper {index}",
            });
            var helperId = JsonDocument.Parse(await helperAuth.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
            await client.PostAsJsonAsync($"/api/friends/add?playerId={helperId}", new { friendPlayerId = targetId.ToString("N") });
            await client.PostAsJsonAsync($"/api/friends/{Uri.EscapeDataString(targetKey)}/help?playerId={helperId}", new { });
        }

        var goalResponse = await client.GetAsync($"/api/social/coop-goal?playerId={targetId}");
        var goal = JsonDocument.Parse(await goalResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var concurrent = await Task.WhenAll(
            client.PostAsJsonAsync($"/api/social/coop-goal/assist_1/claim?playerId={targetId}", new { }),
            client.PostAsJsonAsync($"/api/social/coop-goal/assist_1/claim?playerId={targetId}", new { }));
        var firstClaims = await Task.WhenAll(concurrent.Select(async response =>
            JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("claimed").GetBoolean()));
        var secondResponse = await client.PostAsJsonAsync($"/api/social/coop-goal/assist_2/claim?playerId={targetId}", new { });
        var second = JsonDocument.Parse(await secondResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var thirdResponse = await client.PostAsJsonAsync($"/api/social/coop-goal/assist_3/claim?playerId={targetId}", new { });
        var third = JsonDocument.Parse(await thirdResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, goalResponse.StatusCode);
        Assert.Equal(3, goal.GetProperty("tiers").GetArrayLength());
        Assert.All(goal.GetProperty("tiers").EnumerateArray(), tier => Assert.True(tier.GetProperty("claimable").GetBoolean()));
        Assert.Single(firstClaims, claimed => claimed);
        Assert.Single(firstClaims, claimed => !claimed);
        Assert.Equal("researchPoint", second.GetProperty("rewardType").GetString());
        Assert.Equal(20, second.GetProperty("rewardAmount").GetInt32());
        Assert.Equal("diamond", third.GetProperty("rewardType").GetString());
        Assert.Equal(30, third.GetProperty("rewardAmount").GetInt32());
        Assert.All(third.GetProperty("goal").GetProperty("tiers").EnumerateArray(), tier => Assert.True(tier.GetProperty("claimed").GetBoolean()));
        Assert.Equal(12_455_000, third.GetProperty("coinBalance").GetDouble());
        Assert.Equal(220, third.GetProperty("researchPointBalance").GetDouble());
        Assert.Equal(2610, third.GetProperty("diamondBalance").GetDouble());
    }

    [Fact]
    public async Task SocialEventStream_PushesFriendVisitContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var actorAuth = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-stream-actor",
            companyName = "Actor Roastery",
        });
        var targetAuth = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-stream-target",
            companyName = "Target Cafe",
        });
        var actorId = JsonDocument.Parse(await actorAuth.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        var targetId = JsonDocument.Parse(await targetAuth.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        var targetKey = $"player:{targetId:N}";
        await client.PostAsJsonAsync($"/api/friends/add?playerId={actorId}", new
        {
            friendPlayerId = targetId.ToString("N"),
        });

        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        using var streamResponse = await client.SendAsync(
            new HttpRequestMessage(HttpMethod.Get, $"/api/social/events?playerId={targetId}"),
            HttpCompletionOption.ResponseHeadersRead,
            timeout.Token);
        await client.PostAsJsonAsync($"/api/friends/{Uri.EscapeDataString(targetKey)}/visit?playerId={actorId}", new {});
        await using var stream = await streamResponse.Content.ReadAsStreamAsync(timeout.Token);
        using var reader = new StreamReader(stream);
        string? dataLine = null;
        while (!timeout.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(timeout.Token);
            if (line?.StartsWith("data: ", StringComparison.Ordinal) == true)
            {
                dataLine = line[6..];
                break;
            }
        }

        Assert.Equal(HttpStatusCode.OK, streamResponse.StatusCode);
        Assert.Equal("text/event-stream", streamResponse.Content.Headers.ContentType?.MediaType);
        Assert.NotNull(dataLine);
        var socialEvent = JsonDocument.Parse(dataLine).RootElement;
        Assert.Equal("friend_visit", socialEvent.GetProperty("eventType").GetString());
        Assert.Equal(actorId.ToString("N"), socialEvent.GetProperty("actorPlayerId").GetString());
        Assert.Equal("Actor Roastery", socialEvent.GetProperty("actorCompanyName").GetString());
        Assert.True(socialEvent.GetProperty("rewardValue").GetInt32() > 0);
    }

    [Fact]
    public async Task ClaimMail_UpdatesAuthoritativeResources()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-mail-claim-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        await client.GetAsync($"/api/mail?playerId={playerId}");

        var claim = await client.PostAsJsonAsync($"/api/mail/welcome/claim?playerId={playerId}", new {});
        var claimData = JsonDocument.Parse(await claim.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var resources = await client.GetAsync($"/api/resources?playerId={playerId}");
        var resourceData = JsonDocument.Parse(await resources.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var repeat = await client.PostAsJsonAsync($"/api/mail/welcome/claim?playerId={playerId}", new {});

        Assert.Equal(HttpStatusCode.OK, claim.StatusCode);
        Assert.Equal(2500, claimData.GetProperty("rewardCoin").GetInt32());
        Assert.Equal(20, claimData.GetProperty("rewardCatFood").GetInt32());
        Assert.Equal(12452500, claimData.GetProperty("coinBalance").GetDouble());
        Assert.Equal(3530, claimData.GetProperty("catFoodBalance").GetDouble());
        Assert.Equal(HttpStatusCode.OK, resources.StatusCode);
        Assert.Equal(12452500, resourceData.GetProperty("coin").GetDouble());
        Assert.Equal(3530, resourceData.GetProperty("catFood").GetDouble());
        Assert.Equal(HttpStatusCode.BadRequest, repeat.StatusCode);
    }

    [Fact]
    public async Task ClaimMail_CreatesDefaultMailBeforeClaimWhenNeeded()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-mail-direct-claim-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var claim = await client.PostAsJsonAsync($"/api/mail/welcome/claim?playerId={playerId}", new {});
        var claimData = JsonDocument.Parse(await claim.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, claim.StatusCode);
        Assert.True(claimData.GetProperty("claimed").GetBoolean());
        Assert.Equal(12452500, claimData.GetProperty("coinBalance").GetDouble());
    }

    [Fact]
    public async Task ShopPurchase_DeductsAuthoritativeResourceContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-shop-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var purchase = await client.PostAsJsonAsync($"/api/shop/purchase?playerId={playerId}", new
        {
            shopItemId = "shop_cat_food_1",
            count = 1,
        });
        var purchaseData = JsonDocument.Parse(await purchase.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var resources = await client.GetAsync($"/api/resources?playerId={playerId}");
        var resourceData = JsonDocument.Parse(await resources.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, purchase.StatusCode);
        Assert.Equal("item_cat_food_pack", purchaseData.GetProperty("itemId").GetString());
        Assert.Equal("coin", purchaseData.GetProperty("priceType").GetString());
        Assert.Equal(500, purchaseData.GetProperty("pricePaid").GetInt32());
        Assert.Equal(4, purchaseData.GetProperty("remainingDaily").GetInt32());
        Assert.Equal(12449500, purchaseData.GetProperty("coinBalance").GetDouble());
        Assert.Equal(HttpStatusCode.OK, resources.StatusCode);
        Assert.Equal(12449500, resourceData.GetProperty("coin").GetDouble());
    }

    [Fact]
    public async Task ShopPurchase_RejectsAfterDailyLimit()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-shop-limit-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var first = await client.PostAsJsonAsync($"/api/shop/purchase?playerId={playerId}", new
        {
            shopItemId = "shop_cat_food_1",
            count = 5,
        });
        var firstData = JsonDocument.Parse(await first.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var second = await client.PostAsJsonAsync($"/api/shop/purchase?playerId={playerId}", new
        {
            shopItemId = "shop_cat_food_1",
            count = 1,
        });

        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Equal(0, firstData.GetProperty("remainingDaily").GetInt32());
        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
    }

    [Fact]
    public async Task ShopState_ReturnsAuthoritativeDailyLimits()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-shop-state-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        await client.PostAsJsonAsync($"/api/shop/purchase?playerId={playerId}", new
        {
            shopItemId = "shop_cat_food_1",
            count = 2,
        });

        var response = await client.GetAsync($"/api/shop/state?playerId={playerId}");
        var data = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var catFood = data.EnumerateArray().Single(item => item.GetProperty("shopItemId").GetString() == "shop_cat_food_1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("item_cat_food_pack", catFood.GetProperty("itemId").GetString());
        Assert.Equal(5, catFood.GetProperty("limitDaily").GetInt32());
        Assert.Equal(2, catFood.GetProperty("purchasedToday").GetInt32());
        Assert.Equal(3, catFood.GetProperty("remainingDaily").GetInt32());
    }

    [Fact]
    public async Task ResourceTransactions_ReturnsRecentResourceChanges()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-resource-transaction-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        await client.PostAsJsonAsync($"/api/shop/purchase?playerId={playerId}", new
        {
            shopItemId = "shop_cat_food_1",
            count = 1,
        });
        await client.PostAsJsonAsync($"/api/mail/welcome/claim?playerId={playerId}", new {});

        var response = await client.GetAsync($"/api/resources/transactions?playerId={playerId}&limit=10");
        var data = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, data.GetArrayLength());
        Assert.Equal("mail_claim", data[0].GetProperty("sourceType").GetString());
        Assert.Equal("shop_purchase", data[1].GetProperty("sourceType").GetString());
        Assert.Equal(-500, data[1].GetProperty("coinDelta").GetDouble());
    }

    [Fact]
    public async Task CatUpgrade_DeductsCoinAndReturnsLevelContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-cat-upgrade-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var response = await client.PostAsJsonAsync($"/api/cats/c_001/upgrade?playerId={playerId}", new {});
        var data = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var transactions = await client.GetAsync($"/api/resources/transactions?playerId={playerId}&limit=5");
        var transactionData = JsonDocument.Parse(await transactions.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("c_001", data.GetProperty("catId").GetString());
        Assert.Equal(1, data.GetProperty("previousLevel").GetInt32());
        Assert.Equal(2, data.GetProperty("level").GetInt32());
        Assert.Equal(100, data.GetProperty("coinSpent").GetInt32());
        Assert.Equal(12449900, data.GetProperty("coinBalance").GetDouble());
        Assert.Equal("cat_upgrade", transactionData[0].GetProperty("sourceType").GetString());
        Assert.Equal(-100, transactionData[0].GetProperty("coinDelta").GetDouble());
    }

    [Fact]
    public async Task CatFeed_DeductsCatFoodAndReturnsWeightContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-cat-feed-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var response = await client.PostAsJsonAsync($"/api/cats/c_001/feed?playerId={playerId}", new {});
        var data = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var transactions = await client.GetAsync($"/api/resources/transactions?playerId={playerId}&limit=5");
        var transactionData = JsonDocument.Parse(await transactions.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("c_001", data.GetProperty("catId").GetString());
        Assert.Equal(20, data.GetProperty("previousWeight").GetInt32());
        Assert.Equal(21, data.GetProperty("weight").GetInt32());
        Assert.Equal(9, data.GetProperty("catFoodSpent").GetInt32());
        Assert.Equal(3501, data.GetProperty("catFoodBalance").GetDouble());
        Assert.Equal("cat_feed", transactionData[0].GetProperty("sourceType").GetString());
        Assert.Equal(-9, transactionData[0].GetProperty("catFoodDelta").GetDouble());
    }

    [Fact]
    public async Task CatUnlock_DeductsCoinAndReturnsCatStateContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-cat-unlock-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var response = await client.PostAsJsonAsync($"/api/cats/c_005/unlock?playerId={playerId}", new {});
        var data = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var transactions = await client.GetAsync($"/api/resources/transactions?playerId={playerId}&limit=5");
        var transactionData = JsonDocument.Parse(await transactions.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("c_005", data.GetProperty("catId").GetString());
        Assert.True(data.GetProperty("isUnlocked").GetBoolean());
        Assert.Equal(1, data.GetProperty("level").GetInt32());
        Assert.Equal(22, data.GetProperty("weight").GetInt32());
        Assert.Equal(12000, data.GetProperty("coinSpent").GetInt32());
        Assert.Equal(12438000, data.GetProperty("coinBalance").GetDouble());
        Assert.Equal("cat_unlock", transactionData[0].GetProperty("sourceType").GetString());
        Assert.Equal(-12000, transactionData[0].GetProperty("coinDelta").GetDouble());
    }

    [Fact]
    public async Task Cats_ReturnsFullCatalogWithAuthoritativeStateSnapshot()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-cat-snapshot-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        await client.PostAsJsonAsync($"/api/cats/c_001/upgrade?playerId={playerId}", new {});
        await client.PostAsJsonAsync($"/api/cats/c_001/feed?playerId={playerId}", new {});
        await client.PostAsJsonAsync($"/api/cats/c_005/unlock?playerId={playerId}", new {});

        var response = await client.GetAsync($"/api/cats?playerId={playerId}");
        var data = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(5, data.GetArrayLength());
        var orange = data.EnumerateArray().Single(item => item.GetProperty("catId").GetString() == "c_001");
        var black = data.EnumerateArray().Single(item => item.GetProperty("catId").GetString() == "c_002");
        var tuxedo = data.EnumerateArray().Single(item => item.GetProperty("catId").GetString() == "c_005");
        Assert.True(orange.GetProperty("isUnlocked").GetBoolean());
        Assert.Equal(2, orange.GetProperty("level").GetInt32());
        Assert.Equal(21, orange.GetProperty("weight").GetInt32());
        Assert.Equal("building_cafe_1f", orange.GetProperty("assignedBuildingId").GetString());
        Assert.Equal("equip_cup_lucky", orange.GetProperty("equipment").GetProperty("cup").GetString());
        Assert.Equal(1, orange.GetProperty("equipmentLevels").GetProperty("equip_cup_lucky").GetInt32());
        Assert.Equal("B", orange.GetProperty("rarity").GetString());
        Assert.Equal("producer", orange.GetProperty("role").GetString());
        Assert.Equal(10, orange.GetProperty("baseProduction").GetInt32());
        Assert.Equal(5, orange.GetProperty("baseBeanCost").GetInt32());
        Assert.Equal(1, orange.GetProperty("baseSalary").GetInt32());
        Assert.Equal(20, orange.GetProperty("baseWeight").GetInt32());
        Assert.Equal("s_001", orange.GetProperty("skillId").GetString());
        Assert.False(black.GetProperty("isUnlocked").GetBoolean());
        Assert.Equal(15, black.GetProperty("weight").GetInt32());
        Assert.Equal("A", black.GetProperty("rarity").GetString());
        Assert.Equal("launcher", black.GetProperty("role").GetString());
        Assert.True(tuxedo.GetProperty("isUnlocked").GetBoolean());
        Assert.Equal(1, tuxedo.GetProperty("level").GetInt32());
        Assert.Equal(22, tuxedo.GetProperty("weight").GetInt32());
    }

    [Fact]
    public async Task CatAssignment_UpdatesAuthoritativeScheduleContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-cat-assignment-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var response = await client.PostAsJsonAsync($"/api/cats/c_001/assignment?playerId={playerId}", new
        {
            buildingId = "building_material_2f",
        });
        var data = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var cats = await client.GetAsync($"/api/cats?playerId={playerId}");
        var catData = JsonDocument.Parse(await cats.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("c_001", data.GetProperty("catId").GetString());
        Assert.Equal("building_material_2f", data.GetProperty("assignedBuildingId").GetString());
        Assert.Equal(HttpStatusCode.OK, cats.StatusCode);
        var assignedCat = catData.EnumerateArray().Single(item => item.GetProperty("catId").GetString() == "c_001");
        Assert.Equal("building_material_2f", assignedCat.GetProperty("assignedBuildingId").GetString());
    }

    [Fact]
    public async Task CatSkinEquip_PersistsOwnedSkinAndRejectsLockedSkin()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-cat-skin-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var initialResponse = await client.GetAsync($"/api/cats?playerId={playerId}");
        var initialData = JsonDocument.Parse(await initialResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var initialOrange = initialData.EnumerateArray().Single(item => item.GetProperty("catId").GetString() == "c_001");
        var equipResponse = await client.PostAsJsonAsync($"/api/cats/c_001/skins/apron/equip?playerId={playerId}", new {});
        var equipData = JsonDocument.Parse(await equipResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var lockedResponse = await client.PostAsJsonAsync($"/api/cats/c_001/skins/manager/equip?playerId={playerId}", new {});
        var refreshedResponse = await client.GetAsync($"/api/cats?playerId={playerId}");
        var refreshedData = JsonDocument.Parse(await refreshedResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var refreshedOrange = refreshedData.EnumerateArray().Single(item => item.GetProperty("catId").GetString() == "c_001");

        Assert.Equal(HttpStatusCode.OK, initialResponse.StatusCode);
        Assert.Equal("default", initialOrange.GetProperty("equippedSkinId").GetString());
        Assert.Equal(["default", "apron"], initialOrange.GetProperty("ownedSkinIds").EnumerateArray().Select(item => item.GetString()));
        Assert.Equal(HttpStatusCode.OK, equipResponse.StatusCode);
        Assert.Equal("apron", equipData.GetProperty("equippedSkinId").GetString());
        Assert.Equal(HttpStatusCode.BadRequest, lockedResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, refreshedResponse.StatusCode);
        Assert.Equal("apron", refreshedOrange.GetProperty("equippedSkinId").GetString());
    }

    [Fact]
    public async Task CatSkinUnlock_IsAtomicAndUpdatesCatalogBalanceAndSnapshot()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-cat-skin-unlock-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var catalogResponse = await client.GetAsync($"/api/cats/c_001/skins/catalog?playerId={playerId}");
        var catalog = JsonDocument.Parse(await catalogResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var managerCatalog = catalog.EnumerateArray().Single(item => item.GetProperty("skinId").GetString() == "manager");
        var purchases = await Task.WhenAll(
            client.PostAsJsonAsync($"/api/cats/c_001/skins/manager/unlock?playerId={playerId}", new {}),
            client.PostAsJsonAsync($"/api/cats/c_001/skins/manager/unlock?playerId={playerId}", new {}));
        var success = Assert.Single(purchases, response => response.StatusCode == HttpStatusCode.OK);
        Assert.Single(purchases, response => response.StatusCode == HttpStatusCode.BadRequest);
        var purchase = JsonDocument.Parse(await success.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var resourcesResponse = await client.GetAsync($"/api/resources?playerId={playerId}");
        var resources = JsonDocument.Parse(await resourcesResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var catsResponse = await client.GetAsync($"/api/cats?playerId={playerId}");
        var cats = JsonDocument.Parse(await catsResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var orange = cats.EnumerateArray().Single(item => item.GetProperty("catId").GetString() == "c_001");
        var transactionsResponse = await client.GetAsync($"/api/resources/transactions?playerId={playerId}&limit=10");
        var transactions = JsonDocument.Parse(await transactionsResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, catalogResponse.StatusCode);
        Assert.False(managerCatalog.GetProperty("owned").GetBoolean());
        Assert.True(managerCatalog.GetProperty("purchasable").GetBoolean());
        Assert.Equal(75_000, managerCatalog.GetProperty("priceAmount").GetInt32());
        Assert.Equal("manager", purchase.GetProperty("equippedSkinId").GetString());
        Assert.Equal(75_000, purchase.GetProperty("pricePaid").GetInt32());
        Assert.Equal(12_375_000, resources.GetProperty("coin").GetDouble());
        Assert.Equal("manager", orange.GetProperty("equippedSkinId").GetString());
        var skinTransactions = transactions.EnumerateArray()
            .Where(item => item.GetProperty("sourceType").GetString() == "cat_skin_unlock")
            .ToArray();
        Assert.Single(skinTransactions);
        Assert.Equal(-75_000, skinTransactions[0].GetProperty("coinDelta").GetDouble());
    }

    [Fact]
    public async Task FactoryAppearanceEndpoints_EnforceLevelAndPersistEquippedTheme()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-factory-appearance-device",
            companyName = "FatCat",
        });
        var playerId = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync())
            .RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var initialResponses = await Task.WhenAll(
            client.GetAsync($"/api/factory/appearances?playerId={playerId}"),
            client.GetAsync($"/api/factory/appearances?playerId={playerId}"));
        Assert.All(initialResponses, response => Assert.Equal(HttpStatusCode.OK, response.StatusCode));
        var initialResponse = initialResponses[0];
        var initial = JsonDocument.Parse(await initialResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var lockedResponse = await client.PostAsJsonAsync($"/api/factory/appearances/classic/unlock?playerId={playerId}", new { });
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<FatCatDbContext>();
            var player = await db.Players.FindAsync(playerId);
            Assert.NotNull(player);
            player!.Level = 60;
            await db.SaveChangesAsync();
        }
        var unlockResponse = await client.PostAsJsonAsync($"/api/factory/appearances/future/unlock?playerId={playerId}", new { });
        var unlocked = JsonDocument.Parse(await unlockResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var futurePreviewResponse = await client.GetAsync($"/api/production/server-preview?playerId={playerId}");
        var futurePreview = JsonDocument.Parse(await futurePreviewResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var equipResponse = await client.PostAsJsonAsync($"/api/factory/appearances/simple/equip?playerId={playerId}", new { });
        var refreshedResponse = await client.GetAsync($"/api/factory/appearances?playerId={playerId}");
        var refreshed = JsonDocument.Parse(await refreshedResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, initialResponse.StatusCode);
        Assert.Equal("simple", initial.GetProperty("equippedAppearanceId").GetString());
        Assert.Equal(["simple"], initial.GetProperty("ownedAppearanceIds").EnumerateArray().Select(item => item.GetString()));
        var simpleCatalog = initial.GetProperty("catalog").EnumerateArray()
            .Single(item => item.GetProperty("appearanceId").GetString() == "simple");
        Assert.Equal(4, simpleCatalog.GetProperty("bonuses").GetArrayLength());
        Assert.Equal(3, simpleCatalog.GetProperty("bonuses").EnumerateArray().Count(item => item.GetProperty("productionEffective").GetBoolean()));
        Assert.Equal(HttpStatusCode.BadRequest, lockedResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, unlockResponse.StatusCode);
        Assert.Equal("future", unlocked.GetProperty("equippedAppearanceId").GetString());
        Assert.Contains(unlocked.GetProperty("ownedAppearanceIds").EnumerateArray(), item => item.GetString() == "future");
        Assert.Equal(HttpStatusCode.OK, futurePreviewResponse.StatusCode);
        var futureSource = Assert.Single(futurePreview.GetProperty("modifierSources").EnumerateArray());
        Assert.Equal("future", futureSource.GetProperty("sourceId").GetString());
        Assert.Equal(27, futureSource.GetProperty("grossCoinPercent").GetInt32());
        Assert.Equal(HttpStatusCode.OK, equipResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, refreshedResponse.StatusCode);
        Assert.Equal("simple", refreshed.GetProperty("equippedAppearanceId").GetString());
        Assert.Contains(refreshed.GetProperty("ownedAppearanceIds").EnumerateArray(), item => item.GetString() == "future");
    }

    [Fact]
    public async Task BuildingUpgrade_DeductsCoinAndReturnsLevelContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-building-upgrade-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var buildings = await client.GetAsync($"/api/buildings?playerId={playerId}");
        var buildingData = JsonDocument.Parse(await buildings.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var response = await client.PostAsJsonAsync($"/api/buildings/building_cafe_1f/upgrade?playerId={playerId}", new {});
        var data = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var refreshed = await client.GetAsync($"/api/buildings?playerId={playerId}");
        var refreshedData = JsonDocument.Parse(await refreshed.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, buildings.StatusCode);
        Assert.Equal(6, buildingData.GetArrayLength());
        var cafe = buildingData.EnumerateArray().Single(item => item.GetProperty("buildingId").GetString() == "building_cafe_1f");
        Assert.Equal(6, cafe.GetProperty("level").GetInt32());
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("building_cafe_1f", data.GetProperty("buildingId").GetString());
        Assert.Equal(6, data.GetProperty("previousLevel").GetInt32());
        Assert.Equal(7, data.GetProperty("level").GetInt32());
        Assert.Equal(59481, data.GetProperty("coinSpent").GetInt32());
        Assert.Equal(12390519, data.GetProperty("coinBalance").GetDouble());
        Assert.Equal(HttpStatusCode.OK, refreshed.StatusCode);
        var refreshedCafe = refreshedData.EnumerateArray().Single(item => item.GetProperty("buildingId").GetString() == "building_cafe_1f");
        Assert.Equal(7, refreshedCafe.GetProperty("level").GetInt32());
    }

    [Fact]
    public async Task ServerProductionPreview_ReturnsAuthoritativeBreakdownContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-server-production-preview-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var response = await client.GetAsync($"/api/production/server-preview?playerId={playerId}");
        var data = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var cafe = data.GetProperty("buildings")
            .EnumerateArray()
            .Single(item => item.GetProperty("buildingId").GetString() == "building_cafe_1f");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(246.7931004, data.GetProperty("grossCoinPerSecond").GetDouble(), 5);
        Assert.Equal(0.0158333, data.GetProperty("wageCostPerSecond").GetDouble(), 5);
        Assert.Equal(4, data.GetProperty("beanCostPerSecond").GetDouble(), 5);
        Assert.Equal(data.GetProperty("netCoinPerSecond").GetDouble(), cafe.GetProperty("netCoinPerSecond").GetDouble(), 5);
        var appearanceSource = Assert.Single(data.GetProperty("modifierSources").EnumerateArray());
        Assert.Equal("factory_appearance", appearanceSource.GetProperty("sourceType").GetString());
        Assert.Equal("simple", appearanceSource.GetProperty("sourceId").GetString());
        Assert.Equal(10, appearanceSource.GetProperty("grossCoinPercent").GetInt32());
    }

    [Fact]
    public async Task EquipmentUpgrade_DeductsCoinAndReturnsLevelContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-equipment-upgrade-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var response = await client.PostAsJsonAsync($"/api/cats/c_001/equipment/equip_cup_lucky/upgrade?playerId={playerId}", new {});
        var data = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var cats = await client.GetAsync($"/api/cats?playerId={playerId}");
        var catData = JsonDocument.Parse(await cats.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var transactions = await client.GetAsync($"/api/resources/transactions?playerId={playerId}&limit=5");
        var transactionData = JsonDocument.Parse(await transactions.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("c_001", data.GetProperty("catId").GetString());
        Assert.Equal("equip_cup_lucky", data.GetProperty("itemId").GetString());
        Assert.Equal(1, data.GetProperty("previousLevel").GetInt32());
        Assert.Equal(2, data.GetProperty("level").GetInt32());
        Assert.Equal(90, data.GetProperty("coinSpent").GetInt32());
        Assert.Equal(12449910, data.GetProperty("coinBalance").GetDouble());
        Assert.Equal(HttpStatusCode.OK, cats.StatusCode);
        var cat = catData.EnumerateArray().Single(item => item.GetProperty("catId").GetString() == "c_001");
        Assert.Equal(2, cat.GetProperty("equipmentLevels").GetProperty("equip_cup_lucky").GetInt32());
        Assert.Equal("equipment_upgrade", transactionData[0].GetProperty("sourceType").GetString());
        Assert.Equal(-90, transactionData[0].GetProperty("coinDelta").GetDouble());
    }

    [Fact]
    public async Task ResearchUnlock_DeductsResearchPointAndReturnsStateContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-research-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var response = await client.PostAsJsonAsync($"/api/research/res_basic_prod/unlock?playerId={playerId}", new {});
        var data = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var snapshot = await client.GetAsync($"/api/research?playerId={playerId}");
        var snapshotData = JsonDocument.Parse(await snapshot.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var transactions = await client.GetAsync($"/api/resources/transactions?playerId={playerId}&limit=5");
        var transactionData = JsonDocument.Parse(await transactions.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("res_basic_prod", data.GetProperty("researchId").GetString());
        Assert.True(data.GetProperty("isUnlocked").GetBoolean());
        Assert.Equal(0, data.GetProperty("previousLevel").GetInt32());
        Assert.Equal(1, data.GetProperty("level").GetInt32());
        Assert.Equal(10, data.GetProperty("maxLevel").GetInt32());
        Assert.Equal(10, data.GetProperty("currentEffectValue").GetInt32());
        Assert.Equal(11, data.GetProperty("nextEffectValue").GetInt32());
        Assert.Equal(100, data.GetProperty("researchPointSpent").GetInt32());
        Assert.Equal(100, data.GetProperty("researchPointBalance").GetDouble());
        Assert.Equal(HttpStatusCode.OK, snapshot.StatusCode);
        Assert.Equal(7, snapshotData.GetArrayLength());
        var basic = snapshotData.EnumerateArray().Single(item => item.GetProperty("researchId").GetString() == "res_basic_prod");
        var bean = snapshotData.EnumerateArray().Single(item => item.GetProperty("researchId").GetString() == "res_bean_save");
        Assert.True(basic.GetProperty("isUnlocked").GetBoolean());
        Assert.Equal(1, basic.GetProperty("level").GetInt32());
        Assert.Equal(10, basic.GetProperty("maxLevel").GetInt32());
        Assert.Equal(100, basic.GetProperty("cost").GetInt32());
        Assert.Equal(135, basic.GetProperty("nextCost").GetInt32());
        Assert.Equal(1.35, basic.GetProperty("costGrowth").GetDouble(), 2);
        Assert.Equal("coin_production_mult", basic.GetProperty("effectType").GetString());
        Assert.Equal(10, basic.GetProperty("effectValue").GetInt32());
        Assert.Equal(1, basic.GetProperty("effectStep").GetInt32());
        Assert.Equal(10, basic.GetProperty("currentEffectValue").GetInt32());
        Assert.Equal(11, basic.GetProperty("nextEffectValue").GetInt32());
        Assert.False(bean.GetProperty("isUnlocked").GetBoolean());
        Assert.Equal(150, bean.GetProperty("cost").GetInt32());
        Assert.Equal("bean_reduce", bean.GetProperty("effectType").GetString());
        Assert.Equal(5, bean.GetProperty("effectValue").GetInt32());
        Assert.Equal("res_basic_prod", bean.GetProperty("parentResearchId").GetString());
        var final = snapshotData.EnumerateArray().Single(item => item.GetProperty("researchId").GetString() == "res_espresso");
        Assert.Equal(3, final.GetProperty("parentResearchIds").GetArrayLength());
        Assert.Equal("research_unlock", transactionData[0].GetProperty("sourceType").GetString());
        Assert.Equal(-100, transactionData[0].GetProperty("researchPointDelta").GetDouble());
    }

    [Fact]
    public async Task ResearchUnlock_EnforcesParentChainAndRecordsOnlySuccessfulUnlocks()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-research-chain-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<FatCatDbContext>();
            var resources = await db.ResourceStates.FindAsync([playerId], CancellationToken.None);
            Assert.NotNull(resources);
            resources!.ResearchPoint = 500;
            await db.SaveChangesAsync();
        }

        var blockedBean = await client.PostAsJsonAsync($"/api/research/res_bean_save/unlock?playerId={playerId}", new {});
        var basic = await client.PostAsJsonAsync($"/api/research/res_basic_prod/unlock?playerId={playerId}", new {});
        var bean = await client.PostAsJsonAsync($"/api/research/res_bean_save/unlock?playerId={playerId}", new {});
        var cheap = await client.PostAsJsonAsync($"/api/research/res_cheap_upgrade/unlock?playerId={playerId}", new {});
        var repeatBean = await client.PostAsJsonAsync($"/api/research/res_bean_save/unlock?playerId={playerId}", new {});
        var basicData = JsonDocument.Parse(await basic.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var beanData = JsonDocument.Parse(await bean.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var cheapData = JsonDocument.Parse(await cheap.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var snapshot = await client.GetAsync($"/api/research?playerId={playerId}");
        var snapshotData = JsonDocument.Parse(await snapshot.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var transactions = await client.GetAsync($"/api/resources/transactions?playerId={playerId}&limit=10");
        var transactionData = JsonDocument.Parse(await transactions.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.BadRequest, blockedBean.StatusCode);
        Assert.Equal(HttpStatusCode.OK, basic.StatusCode);
        Assert.Equal(HttpStatusCode.OK, bean.StatusCode);
        Assert.Equal(HttpStatusCode.OK, cheap.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, repeatBean.StatusCode);
        Assert.Equal(400, basicData.GetProperty("researchPointBalance").GetDouble());
        Assert.Equal(250, beanData.GetProperty("researchPointBalance").GetDouble());
        Assert.Equal(50, cheapData.GetProperty("researchPointBalance").GetDouble());
        Assert.Equal(7, snapshotData.GetArrayLength());
        Assert.Equal(3, snapshotData.EnumerateArray().Count(item => item.GetProperty("isUnlocked").GetBoolean()));
        Assert.Equal(3, transactionData.GetArrayLength());
        Assert.Equal("res_cheap_upgrade", transactionData[0].GetProperty("sourceKey").GetString());
        Assert.Equal(-200, transactionData[0].GetProperty("researchPointDelta").GetDouble());
        Assert.Equal("res_bean_save", transactionData[1].GetProperty("sourceKey").GetString());
        Assert.Equal(-150, transactionData[1].GetProperty("researchPointDelta").GetDouble());
        Assert.Equal("res_basic_prod", transactionData[2].GetProperty("sourceKey").GetString());
        Assert.Equal(-100, transactionData[2].GetProperty("researchPointDelta").GetDouble());
    }

    [Fact]
    public async Task ResearchUnlock_RequiresAllFinalBranchesThroughApi()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-research-final-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<FatCatDbContext>();
            var resources = await db.ResourceStates.FindAsync([playerId], CancellationToken.None);
            Assert.NotNull(resources);
            resources!.ResearchPoint = 2500;
            await db.SaveChangesAsync();
        }

        foreach (var researchId in new[]
        {
            "res_basic_prod",
            "res_bean_save",
            "res_cheap_upgrade",
            "res_extract_2",
            "res_roast_2",
        })
        {
            var response = await client.PostAsJsonAsync($"/api/research/{researchId}/unlock?playerId={playerId}", new {});
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        var blockedFinal = await client.PostAsJsonAsync($"/api/research/res_espresso/unlock?playerId={playerId}", new {});
        var ferment = await client.PostAsJsonAsync($"/api/research/res_ferment_2/unlock?playerId={playerId}", new {});
        var final = await client.PostAsJsonAsync($"/api/research/res_espresso/unlock?playerId={playerId}", new {});
        var finalData = JsonDocument.Parse(await final.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var snapshot = await client.GetAsync($"/api/research?playerId={playerId}");
        var snapshotData = JsonDocument.Parse(await snapshot.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var transactions = await client.GetAsync($"/api/resources/transactions?playerId={playerId}&limit=10");
        var transactionData = JsonDocument.Parse(await transactions.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.BadRequest, blockedFinal.StatusCode);
        Assert.Equal(HttpStatusCode.OK, ferment.StatusCode);
        Assert.Equal(HttpStatusCode.OK, final.StatusCode);
        Assert.Equal(500, finalData.GetProperty("researchPointSpent").GetInt32());
        Assert.Equal(575, finalData.GetProperty("researchPointBalance").GetDouble());
        Assert.Equal(7, snapshotData.GetArrayLength());
        Assert.All(snapshotData.EnumerateArray(), item => Assert.True(item.GetProperty("isUnlocked").GetBoolean()));
        var finalState = snapshotData.EnumerateArray().Single(item => item.GetProperty("researchId").GetString() == "res_espresso");
        Assert.Equal(
            new[] { "res_extract_2", "res_roast_2", "res_ferment_2" },
            finalState.GetProperty("parentResearchIds").EnumerateArray().Select(item => item.GetString()).ToArray());
        Assert.Equal(7, transactionData.GetArrayLength());
        Assert.Equal("res_espresso", transactionData[0].GetProperty("sourceKey").GetString());
        Assert.Equal(-500, transactionData[0].GetProperty("researchPointDelta").GetDouble());
    }

    [Fact]
    public async Task ResearchUnlock_ConcurrentRequestsChargeExactlyOnce()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-research-concurrent-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var requests = await Task.WhenAll(
            client.PostAsJsonAsync($"/api/research/res_basic_prod/unlock?playerId={playerId}", new {}),
            client.PostAsJsonAsync($"/api/research/res_basic_prod/unlock?playerId={playerId}", new {}));
        var resources = await client.GetAsync($"/api/resources?playerId={playerId}");
        var resourceData = JsonDocument.Parse(await resources.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var transactions = await client.GetAsync($"/api/resources/transactions?playerId={playerId}&limit=10");
        var transactionData = JsonDocument.Parse(await transactions.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Single(requests, response => response.StatusCode == HttpStatusCode.OK);
        Assert.Single(requests, response => response.StatusCode == HttpStatusCode.BadRequest);
        Assert.Equal(100, resourceData.GetProperty("researchPoint").GetDouble());
        var researchTransactions = transactionData.EnumerateArray()
            .Where(item => item.GetProperty("sourceType").GetString() == "research_unlock")
            .ToArray();
        var transaction = Assert.Single(researchTransactions);
        Assert.Equal("res_basic_prod", transaction.GetProperty("sourceKey").GetString());
        Assert.Equal(-100, transaction.GetProperty("researchPointDelta").GetDouble());
    }

    [Fact]
    public async Task ProductionPreview_ReturnsNetIncomeContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/production/preview", new
        {
            grossCoinPerSecond = 213,
            wageCostPerSecond = 0.25,
            beanCostPerSecond = 4,
            buildings = new[]
            {
                new
                {
                    buildingId = "building_cafe_1f",
                    grossCoinPerSecond = 213,
                    wageCostPerSecond = 0.25,
                    netCoinPerSecond = 0,
                    beanCostPerSecond = 4,
                },
            },
        });
        var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var data = body.RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(212.75, data.GetProperty("netCoinPerSecond").GetDouble());
        Assert.Equal(212.75, data.GetProperty("buildings")[0].GetProperty("netCoinPerSecond").GetDouble());
    }

    [Fact]
    public async Task Resources_ReturnsInitialAuthoritativeBalances()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-resources-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var response = await client.GetAsync($"/api/resources?playerId={playerId}");
        var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var data = body.RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(12450000, data.GetProperty("coin").GetDouble());
        Assert.Equal(8240, data.GetProperty("bean").GetDouble());
        Assert.Equal(3510, data.GetProperty("catFood").GetDouble());
        Assert.Equal(2580, data.GetProperty("diamond").GetDouble());
        Assert.Equal(200, data.GetProperty("researchPoint").GetDouble());
    }

    [Fact]
    public async Task Launch_ReturnsAuthoritativeSettlementContract()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-launch-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var response = await client.PostAsJsonAsync($"/api/launch?playerId={playerId}", new
        {
            clientRequestId = "api-test",
            launchSeconds = 10,
            availableBean = 3200,
            production = new
            {
                grossCoinPerSecond = 213,
                wageCostPerSecond = 0.25,
                beanCostPerSecond = 4,
            },
        });
        var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var data = body.RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(data.GetProperty("accepted").GetBoolean());
        Assert.Equal(2467, data.GetProperty("coinGained").GetInt32());
        Assert.Equal(40, data.GetProperty("beanSpent").GetInt32());
        Assert.Equal(246.777267, data.GetProperty("netCoinPerSecond").GetDouble(), 5);
        Assert.Equal(12452467, data.GetProperty("coinBalance").GetDouble());
        Assert.Equal(8200, data.GetProperty("beanBalance").GetDouble());
        Assert.Equal("simple", data.GetProperty("equippedFactoryAppearanceId").GetString());
        Assert.Equal("simple", Assert.Single(data.GetProperty("modifierSources").EnumerateArray()).GetProperty("sourceId").GetString());

        var resources = await client.GetAsync($"/api/resources?playerId={playerId}");
        var resourceData = JsonDocument.Parse(await resources.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        Assert.Equal(HttpStatusCode.OK, resources.StatusCode);
        Assert.Equal(12452467, resourceData.GetProperty("coin").GetDouble());
        Assert.Equal(8200, resourceData.GetProperty("bean").GetDouble());
    }

    [Fact]
    public async Task Launch_IgnoresTamperedProductionSnapshot()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-launch-tamper-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var response = await client.PostAsJsonAsync($"/api/launch?playerId={playerId}", new
        {
            clientRequestId = "api-tamper-test",
            launchSeconds = 10,
            availableBean = 999999,
            production = new
            {
                grossCoinPerSecond = 999999,
                wageCostPerSecond = 0,
                beanCostPerSecond = 0,
            },
        });
        var data = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(data.GetProperty("accepted").GetBoolean());
        Assert.Equal(2467, data.GetProperty("coinGained").GetInt32());
        Assert.Equal(40, data.GetProperty("beanSpent").GetInt32());
        Assert.Equal(246.777267, data.GetProperty("netCoinPerSecond").GetDouble(), 5);
        Assert.Equal(12452467, data.GetProperty("coinBalance").GetDouble());
    }

    [Fact]
    public async Task Launch_ReusesExistingSettlementForSameClientRequestId()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-launch-idempotent-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        var request = new
        {
            clientRequestId = "same-api-request",
            launchSeconds = 10,
            availableBean = 3200,
            production = new
            {
                grossCoinPerSecond = 213,
                wageCostPerSecond = 0.25,
                beanCostPerSecond = 4,
            },
        };

        var first = await client.PostAsJsonAsync($"/api/launch?playerId={playerId}", request);
        var second = await client.PostAsJsonAsync($"/api/launch?playerId={playerId}", request with
        {
            launchSeconds = 600,
            availableBean = 999999,
        });
        var firstData = JsonDocument.Parse(await first.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var secondData = JsonDocument.Parse(await second.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        Assert.Equal(firstData.GetProperty("launchId").GetString(), secondData.GetProperty("launchId").GetString());
        Assert.Equal(firstData.GetProperty("coinGained").GetInt32(), secondData.GetProperty("coinGained").GetInt32());
        Assert.Equal(firstData.GetProperty("beanSpent").GetInt32(), secondData.GetProperty("beanSpent").GetInt32());
        Assert.Equal(firstData.GetProperty("coinBalance").GetDouble(), secondData.GetProperty("coinBalance").GetDouble());
        Assert.Equal(firstData.GetProperty("beanBalance").GetDouble(), secondData.GetProperty("beanBalance").GetDouble());
    }

    [Fact]
    public async Task DailyOrder_AdvancesFromLaunchAndClaimsOnce()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-daily-order-device",
            companyName = "FatCat",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();

        var initialResponse = await client.GetAsync($"/api/daily-order?playerId={playerId}");
        var initial = JsonDocument.Parse(await initialResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        Assert.Equal(56, initial.GetProperty("progress").GetInt32());
        Assert.False(initial.GetProperty("claimable").GetBoolean());

        for (var index = 1; index <= 4; index++)
        {
            var launchResponse = await client.PostAsJsonAsync($"/api/launch?playerId={playerId}", new
            {
                clientRequestId = $"api-daily-order-{index}",
                launchSeconds = 1,
                availableBean = 8240,
                production = new
                {
                    grossCoinPerSecond = 213,
                    wageCostPerSecond = 0.25,
                    beanCostPerSecond = 4,
                },
            });
            Assert.Equal(HttpStatusCode.OK, launchResponse.StatusCode);
        }

        var readyResponse = await client.GetAsync($"/api/daily-order?playerId={playerId}");
        var ready = JsonDocument.Parse(await readyResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        Assert.Equal(60, ready.GetProperty("progress").GetInt32());
        Assert.True(ready.GetProperty("claimable").GetBoolean());

        var firstClaim = await client.PostAsJsonAsync($"/api/daily-order/claim?playerId={playerId}", new { });
        var secondClaim = await client.PostAsJsonAsync($"/api/daily-order/claim?playerId={playerId}", new { });
        var first = JsonDocument.Parse(await firstClaim.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var second = JsonDocument.Parse(await secondClaim.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.Equal(HttpStatusCode.OK, firstClaim.StatusCode);
        Assert.True(first.GetProperty("claimed").GetBoolean());
        Assert.True(first.GetProperty("order").GetProperty("claimed").GetBoolean());
        Assert.False(second.GetProperty("claimed").GetBoolean());
        Assert.Equal("already_claimed", second.GetProperty("limitedReason").GetString());
        Assert.Equal(first.GetProperty("coinBalance").GetDouble(), second.GetProperty("coinBalance").GetDouble());
        Assert.Equal(first.GetProperty("researchPointBalance").GetDouble(), second.GetProperty("researchPointBalance").GetDouble());
    }

    [Fact]
    public async Task DailyOrder_ConcurrentClaimsGrantExactlyOneReward()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-daily-order-race-device",
            companyName = "Daily Race Cafe",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        await client.GetAsync($"/api/daily-order?playerId={playerId}");

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<FatCatDbContext>();
            var state = await db.DailyOrderStates.FindAsync([playerId], CancellationToken.None);
            Assert.NotNull(state);
            state!.Progress = 60;
            await db.SaveChangesAsync();
        }

        var responses = await Task.WhenAll(
            client.PostAsJsonAsync($"/api/daily-order/claim?playerId={playerId}", new { }),
            client.PostAsJsonAsync($"/api/daily-order/claim?playerId={playerId}", new { }));
        var results = await Task.WhenAll(responses.Select(async response =>
            JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data")));
        var resourcesResponse = await client.GetAsync($"/api/resources?playerId={playerId}");
        var resources = JsonDocument.Parse(await resourcesResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var transactionsResponse = await client.GetAsync($"/api/resources/transactions?playerId={playerId}&limit=10");
        var transactions = JsonDocument.Parse(await transactionsResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");

        Assert.All(responses, response => Assert.Equal(HttpStatusCode.OK, response.StatusCode));
        Assert.Single(results, result => result.GetProperty("claimed").GetBoolean());
        Assert.Single(results, result => !result.GetProperty("claimed").GetBoolean());
        Assert.Equal(12451000, resources.GetProperty("coin").GetDouble());
        Assert.Equal(210, resources.GetProperty("researchPoint").GetDouble());
        Assert.Single(transactions.EnumerateArray(), transaction =>
            transaction.GetProperty("sourceType").GetString() == "daily_order_claim");
    }

    [Fact]
    public async Task Launch_ConcurrentRequestsRespectDailyQuota()
    {
        await using var factory = new FatCatApiFactory();
        var client = factory.CreateClient();
        var authResponse = await client.PostAsJsonAsync("/api/auth/guest", new
        {
            deviceId = "api-daily-launch-race-device",
            companyName = "Launch Race Cafe",
        });
        var authBody = JsonDocument.Parse(await authResponse.Content.ReadAsStringAsync());
        var playerId = authBody.RootElement.GetProperty("data").GetProperty("playerId").GetGuid();
        var requests = Enumerable.Range(1, 6).Select(index => new
        {
            clientRequestId = $"api-launch-race-{index}",
            launchSeconds = 1,
            availableBean = 8240,
            production = new
            {
                grossCoinPerSecond = 213,
                wageCostPerSecond = 0.25,
                beanCostPerSecond = 4,
            },
        }).ToArray();

        var responses = await Task.WhenAll(requests.Select(request =>
            client.PostAsJsonAsync($"/api/launch?playerId={playerId}", request)));
        var accepted = responses
            .Select((response, index) => new { response, index })
            .Where(item => item.response.StatusCode == HttpStatusCode.OK)
            .ToArray();
        var rejected = Assert.Single(responses, response => response.StatusCode == HttpStatusCode.BadRequest);
        var rejectedData = JsonDocument.Parse(await rejected.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var orderResponse = await client.GetAsync($"/api/daily-order?playerId={playerId}");
        var order = JsonDocument.Parse(await orderResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var transactionsResponse = await client.GetAsync($"/api/resources/transactions?playerId={playerId}&limit=10");
        var transactions = JsonDocument.Parse(await transactionsResponse.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        var replay = await client.PostAsJsonAsync(
            $"/api/launch?playerId={playerId}",
            requests[accepted[0].index]);

        Assert.Equal(5, accepted.Length);
        Assert.Equal("daily_launch_limit_reached", rejectedData.GetProperty("rejectedReason").GetString());
        Assert.Equal(0, rejectedData.GetProperty("dailyOrder").GetProperty("launchesRemaining").GetInt32());
        Assert.Equal(5, order.GetProperty("launchesUsed").GetInt32());
        Assert.Equal(5, order.GetProperty("launchLimit").GetInt32());
        Assert.Equal(0, order.GetProperty("launchesRemaining").GetInt32());
        Assert.Equal(HttpStatusCode.OK, replay.StatusCode);
        Assert.Equal(5, transactions.EnumerateArray().Count(transaction =>
            transaction.GetProperty("sourceType").GetString() == "launch"));
    }
}
