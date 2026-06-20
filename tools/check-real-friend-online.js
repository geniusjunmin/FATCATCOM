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

        const playerId = playerAuth.json.data.playerId;
        const targetId = targetAuth.json.data.playerId;
        const targetKey = `player:${targetId.replace(/-/g, "")}`;

        const added = await post(`/api/friends/add?playerId=${encodeURIComponent(playerId)}`, {
            friendPlayerId: targetId.replace(/-/g, ""),
        });
        const duplicate = await post(`/api/friends/add?playerId=${encodeURIComponent(playerId)}`, {
            friendPlayerId: targetId,
        });
        const visit = await post(`/api/friends/${encodeURIComponent(targetKey)}/visit?playerId=${encodeURIComponent(playerId)}`, {});
        const gift = await post(`/api/friends/${encodeURIComponent(targetKey)}/gift?playerId=${encodeURIComponent(playerId)}`, {});
        const invalidSelf = await post(`/api/friends/add?playerId=${encodeURIComponent(playerId)}`, {
            friendPlayerId: playerId,
        });
        const friends = await get(`/api/friends?playerId=${encodeURIComponent(playerId)}`);
        const activities = await get(`/api/friends/activity?playerId=${encodeURIComponent(playerId)}&limit=10`);
        const leaderboard = await get(`/api/leaderboard?playerId=${encodeURIComponent(playerId)}&boardId=income`);

        const friendRows = friends.json.data ?? [];
        const activityRows = activities.json.data ?? [];
        const leaderboardRows = leaderboard.json.data?.entries ?? [];
        const ok = playerAuth.response.ok
            && targetAuth.response.ok
            && added.response.ok
            && duplicate.response.ok
            && visit.response.ok
            && gift.response.ok
            && invalidSelf.response.status === 400
            && friends.response.ok
            && activities.response.ok
            && leaderboard.response.ok
            && added.json.data?.id === targetKey
            && added.json.data?.name === "Beta Beans"
            && added.json.data?.incomePerSecond > 0
            && friendRows.length === 4
            && activityRows.length === 3
            && activityRows[0]?.activityType === "friend_gift"
            && activityRows[1]?.activityType === "friend_visit"
            && activityRows[2]?.activityType === "friend_add"
            && friendRows.some((friend) => friend.id === targetKey)
            && leaderboardRows.some((entry) => entry.playerId === targetKey);

        console.log(JSON.stringify({
            ok,
            added: added.json.data,
            duplicate: duplicate.json.data,
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
