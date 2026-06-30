using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FatCat.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace FatCat.Tests;

public sealed class FatCatApiTests
{
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
        Assert.True(profile.GetProperty("unlockedCatCount").GetInt32() > 0);
        Assert.True(profile.GetProperty("totalBuildingLevel").GetInt32() > 0);
        Assert.Equal(HttpStatusCode.OK, friends.StatusCode);
        Assert.Equal(4, friendData.GetArrayLength());
        Assert.Contains(friendData.EnumerateArray(), friend => friend.GetProperty("id").GetString() == $"player:{targetId:N}");
        Assert.Equal(HttpStatusCode.OK, leaderboard.StatusCode);
        Assert.Contains(leaderboardEntries.EnumerateArray(), entry => entry.GetProperty("playerId").GetString() == $"player:{targetId:N}");
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
        Assert.Equal(224.357364, data.GetProperty("grossCoinPerSecond").GetDouble(), 5);
        Assert.Equal(0.016667, data.GetProperty("wageCostPerSecond").GetDouble(), 5);
        Assert.Equal(4, data.GetProperty("beanCostPerSecond").GetDouble(), 5);
        Assert.Equal(data.GetProperty("netCoinPerSecond").GetDouble(), cafe.GetProperty("netCoinPerSecond").GetDouble(), 5);
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
        Assert.Equal(100, data.GetProperty("researchPointSpent").GetInt32());
        Assert.Equal(100, data.GetProperty("researchPointBalance").GetDouble());
        Assert.Equal(HttpStatusCode.OK, snapshot.StatusCode);
        Assert.Equal(3, snapshotData.GetArrayLength());
        var basic = snapshotData.EnumerateArray().Single(item => item.GetProperty("researchId").GetString() == "res_basic_prod");
        var bean = snapshotData.EnumerateArray().Single(item => item.GetProperty("researchId").GetString() == "res_bean_save");
        Assert.True(basic.GetProperty("isUnlocked").GetBoolean());
        Assert.Equal(100, basic.GetProperty("cost").GetInt32());
        Assert.Equal("coin_production_mult", basic.GetProperty("effectType").GetString());
        Assert.Equal(10, basic.GetProperty("effectValue").GetInt32());
        Assert.False(bean.GetProperty("isUnlocked").GetBoolean());
        Assert.Equal(150, bean.GetProperty("cost").GetInt32());
        Assert.Equal("bean_reduce", bean.GetProperty("effectType").GetString());
        Assert.Equal(5, bean.GetProperty("effectValue").GetInt32());
        Assert.Equal("res_basic_prod", bean.GetProperty("parentResearchId").GetString());
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
        Assert.Equal(3, snapshotData.GetArrayLength());
        Assert.All(snapshotData.EnumerateArray(), item => Assert.True(item.GetProperty("isUnlocked").GetBoolean()));
        Assert.Equal(3, transactionData.GetArrayLength());
        Assert.Equal("res_cheap_upgrade", transactionData[0].GetProperty("sourceKey").GetString());
        Assert.Equal(-200, transactionData[0].GetProperty("researchPointDelta").GetDouble());
        Assert.Equal("res_bean_save", transactionData[1].GetProperty("sourceKey").GetString());
        Assert.Equal(-150, transactionData[1].GetProperty("researchPointDelta").GetDouble());
        Assert.Equal("res_basic_prod", transactionData[2].GetProperty("sourceKey").GetString());
        Assert.Equal(-100, transactionData[2].GetProperty("researchPointDelta").GetDouble());
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
        Assert.Equal(2243, data.GetProperty("coinGained").GetInt32());
        Assert.Equal(40, data.GetProperty("beanSpent").GetInt32());
        Assert.Equal(224.340697, data.GetProperty("netCoinPerSecond").GetDouble(), 5);
        Assert.Equal(12452243, data.GetProperty("coinBalance").GetDouble());
        Assert.Equal(8200, data.GetProperty("beanBalance").GetDouble());

        var resources = await client.GetAsync($"/api/resources?playerId={playerId}");
        var resourceData = JsonDocument.Parse(await resources.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        Assert.Equal(HttpStatusCode.OK, resources.StatusCode);
        Assert.Equal(12452243, resourceData.GetProperty("coin").GetDouble());
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
        Assert.Equal(2243, data.GetProperty("coinGained").GetInt32());
        Assert.Equal(40, data.GetProperty("beanSpent").GetInt32());
        Assert.Equal(224.340697, data.GetProperty("netCoinPerSecond").GetDouble(), 5);
        Assert.Equal(12452243, data.GetProperty("coinBalance").GetDouble());
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
}
