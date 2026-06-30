const { startApiProcess } = require("./start-api-process");

const apiUrl = "http://localhost:5144";

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForApi() {
    for (let index = 0; index < 60; index += 1) {
        try {
            const response = await fetch(`${apiUrl}/health`);
            if (response.ok) return;
        } catch {}
        await wait(500);
    }
    throw new Error("API did not become ready.");
}

async function post(path, body) {
    const response = await fetch(`${apiUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const json = await response.json();
    return { response, json };
}

async function get(path) {
    const response = await fetch(`${apiUrl}${path}`);
    const json = await response.json();
    return { response, json };
}

(async () => {
    const api = startApiProcess(apiUrl);

    try {
        await waitForApi();
        const suffix = Date.now();
        const playerAuth = await post("/api/auth/guest", {
            deviceId: `real-friend-online-a-${suffix}`,
            companyName: "Alpha Cafe",
        });
        const targetAuth = await post("/api/auth/guest", {
            deviceId: `real-friend-online-b-${suffix}`,
            companyName: "Beta Beans",
        });
        const requestAuth = await post("/api/auth/guest", {
            deviceId: `real-friend-online-c-${suffix}`,
            companyName: "Gamma Milk",
        });
        const receiverAuth = await post("/api/auth/guest", {
            deviceId: `real-friend-online-d-${suffix}`,
            companyName: "Delta Roasters",
        });

        const playerId = playerAuth.json.data.playerId;
        const targetId = targetAuth.json.data.playerId;
        const requesterId = requestAuth.json.data.playerId;
        const receiverId = receiverAuth.json.data.playerId;
        const targetKey = `player:${targetId.replace(/-/g, "")}`;
        const requesterKey = `player:${requesterId.replace(/-/g, "")}`;
        const receiverKey = `player:${receiverId.replace(/-/g, "")}`;

        const targetProfile = await get(`/api/social/profile?playerId=${encodeURIComponent(targetId)}`);
        const receiverProfile = await get(`/api/social/profile?playerId=${encodeURIComponent(receiverId)}`);
        const inviteCode = targetProfile.json.data?.inviteCode;
        const receiverInviteCode = receiverProfile.json.data?.inviteCode;
        const searched = await get(`/api/friends/search?playerId=${encodeURIComponent(playerId)}&query=${encodeURIComponent(inviteCode)}`);
        const added = await post(`/api/friends/add?playerId=${encodeURIComponent(playerId)}`, {
            friendPlayerId: "",
            inviteCode,
        });
        const duplicate = await post(`/api/friends/add?playerId=${encodeURIComponent(playerId)}`, {
            friendPlayerId: targetId,
        });
        const presence = await post(`/api/social/presence?playerId=${encodeURIComponent(targetId)}`, {});
        const refreshed = await get(`/api/friends/${encodeURIComponent(targetKey)}?playerId=${encodeURIComponent(playerId)}`);
        const missingFriend = await get(`/api/friends/missing-friend?playerId=${encodeURIComponent(playerId)}`);
        const searchedAfter = await get(`/api/friends/search?playerId=${encodeURIComponent(playerId)}&query=${encodeURIComponent(inviteCode)}`);
        const visit = await post(`/api/friends/${encodeURIComponent(targetKey)}/visit?playerId=${encodeURIComponent(playerId)}`, {});
        const repeatVisit = await post(`/api/friends/${encodeURIComponent(targetKey)}/visit?playerId=${encodeURIComponent(playerId)}`, {});
        const gift = await post(`/api/friends/${encodeURIComponent(targetKey)}/gift?playerId=${encodeURIComponent(playerId)}`, {});
        const repeatGift = await post(`/api/friends/${encodeURIComponent(targetKey)}/gift?playerId=${encodeURIComponent(playerId)}`, {});
        const invalidSelf = await post(`/api/friends/add?playerId=${encodeURIComponent(playerId)}`, {
            friendPlayerId: playerId,
        });
        const friendRequest = await post(`/api/friends/requests?playerId=${encodeURIComponent(requesterId)}`, {
            friendPlayerId: "",
            inviteCode: receiverInviteCode,
        });
        const receivedRequests = await get(`/api/friends/requests?playerId=${encodeURIComponent(receiverId)}&box=received`);
        const sentRequests = await get(`/api/friends/requests?playerId=${encodeURIComponent(requesterId)}&box=sent`);
        const requestId = friendRequest.json.data?.id;
        const acceptedRequest = await post(`/api/friends/requests/${encodeURIComponent(requestId)}/accept?playerId=${encodeURIComponent(receiverId)}`, {});
        const requesterFriends = await get(`/api/friends?playerId=${encodeURIComponent(requesterId)}`);
        const receiverFriends = await get(`/api/friends?playerId=${encodeURIComponent(receiverId)}`);
        const friends = await get(`/api/friends?playerId=${encodeURIComponent(playerId)}`);
        const activities = await get(`/api/friends/activity?playerId=${encodeURIComponent(playerId)}&limit=10`);
        const leaderboard = await get(`/api/leaderboard?playerId=${encodeURIComponent(playerId)}&boardId=income`);

        const friendRows = friends.json.data ?? [];
        const requesterFriendRows = requesterFriends.json.data ?? [];
        const receiverFriendRows = receiverFriends.json.data ?? [];
        const receivedRows = receivedRequests.json.data ?? [];
        const sentRows = sentRequests.json.data ?? [];
        const activityRows = activities.json.data ?? [];
        const leaderboardRows = leaderboard.json.data?.entries ?? [];
        const ok = playerAuth.response.ok
            && targetAuth.response.ok
            && requestAuth.response.ok
            && receiverAuth.response.ok
            && targetProfile.response.ok
            && receiverProfile.response.ok
            && searched.response.ok
            && added.response.ok
            && duplicate.response.ok
            && presence.response.ok
            && refreshed.response.ok
            && missingFriend.response.status === 404
            && searchedAfter.response.ok
            && visit.response.ok
            && repeatVisit.response.ok
            && gift.response.ok
            && repeatGift.response.ok
            && invalidSelf.response.status === 400
            && friendRequest.response.ok
            && receivedRequests.response.ok
            && sentRequests.response.ok
            && acceptedRequest.response.ok
            && requesterFriends.response.ok
            && receiverFriends.response.ok
            && friends.response.ok
            && activities.response.ok
            && leaderboard.response.ok
            && added.json.data?.id === targetKey
            && added.json.data?.name === "Beta Beans"
            && added.json.data?.incomePerSecond > 0
            && added.json.data?.profile?.isRealPlayer === true
            && added.json.data?.profile?.playerId === targetId.replace(/-/g, "")
            && added.json.data?.profile?.inviteCode?.startsWith("FC")
            && added.json.data?.profile?.lastActiveAt > 0
            && added.json.data?.profile?.unlockedCatCount > 0
            && added.json.data?.profile?.totalBuildingLevel > 0
            && presence.json.data?.status === "online"
            && presence.json.data?.lastActiveAt > 0
            && refreshed.json.data?.id === targetKey
            && refreshed.json.data?.profile?.isRealPlayer === true
            && refreshed.json.data?.profile?.presenceStatus === "online"
            && inviteCode?.startsWith("FC")
            && receiverInviteCode?.startsWith("FC")
            && searched.json.data?.inviteCode === inviteCode
            && searched.json.data?.isFriend === false
            && searchedAfter.json.data?.isFriend === true
            && visit.json.data?.rewarded === true
            && visit.json.data?.rewardCoin > 0
            && repeatVisit.json.data?.rewarded === false
            && repeatVisit.json.data?.limitedReason === "daily_visit_claimed"
            && gift.json.data?.rewarded === true
            && gift.json.data?.rewardCatFood === 12
            && repeatGift.json.data?.rewarded === false
            && repeatGift.json.data?.limitedReason === "daily_gift_claimed"
            && friendRows.length === 4
            && activityRows.length === 3
            && activityRows[0]?.activityType === "friend_gift"
            && activityRows[1]?.activityType === "friend_visit"
            && activityRows[2]?.activityType === "friend_add"
            && friendRows.some((friend) => friend.id === targetKey)
            && friendRequest.json.data?.status === "pending"
            && friendRequest.json.data?.direction === "sent"
            && receivedRows.some((request) => request.id === requestId && request.direction === "received")
            && sentRows.some((request) => request.id === requestId && request.direction === "sent")
            && acceptedRequest.json.data?.status === "accepted"
            && requesterFriendRows.some((friend) => friend.id === receiverKey)
            && receiverFriendRows.some((friend) => friend.id === requesterKey)
            && leaderboardRows.some((entry) => entry.playerId === targetKey);

        console.log(JSON.stringify({
            ok,
            inviteCode,
            receiverInviteCode,
            searched: searched.json.data,
            added: added.json.data,
            realFriendProfile: added.json.data?.profile,
            presence: presence.json.data,
            refreshedFriend: refreshed.json.data,
            missingFriendStatus: missingFriend.response.status,
            duplicate: duplicate.json.data,
            friendRequestStatus: friendRequest.json.data?.status,
            friendRequestAccepted: acceptedRequest.json.data?.status,
            requestBidirectional: requesterFriendRows.some((friend) => friend.id === receiverKey)
                && receiverFriendRows.some((friend) => friend.id === requesterKey),
            visitReward: visit.json.data?.rewardCoin,
            repeatVisitReason: repeatVisit.json.data?.limitedReason,
            giftReward: gift.json.data?.rewardCatFood,
            repeatGiftReason: repeatGift.json.data?.limitedReason,
            invalidSelfStatus: invalidSelf.response.status,
            friendCount: friendRows.length,
            activityTypes: activityRows.map((activity) => activity.activityType),
            hasRealFriendInLeaderboard: leaderboardRows.some((entry) => entry.playerId === targetKey),
        }, null, 2));
        if (!ok) process.exit(1);
    } finally {
        api.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
