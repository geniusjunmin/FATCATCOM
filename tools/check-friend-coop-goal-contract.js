const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

function requireText(label, source, pattern) {
    if (!source.includes(pattern)) {
        console.error(JSON.stringify({ ok: false, label, pattern }, null, 2));
        process.exit(1);
    }
}

const domain = read("FATCATServer/FatCat.Domain/PlayerCoopGoalState.cs");
const db = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const repository = read("FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const coopManager = read("FATCATUI/assets/scripts/manager/FriendCoopManager.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const onlineUi = read("tools/check-friend-coop-goal-online-ui.js");

requireText("goal domain state", domain, "PlayerCoopGoalState");
requireText("runtime goal schema", db, "CREATE TABLE IF NOT EXISTS \"CoopGoalStates\"");
requireText("atomic SQLite progress", repository, "ON CONFLICT (\"PlayerId\") DO UPDATE");
requireText("atomic reward claim", repository, "ExecuteUpdateAsync");
requireText("goal DTO", contracts, "FriendCoopGoalDto");
requireText("claim DTO", contracts, "FriendCoopClaimResponse");
requireText("goal increment on help", service, "IncrementCoopGoalProgressAsync");
requireText("goal reward transaction", service, "\"friend_coop_goal\"");
requireText("goal target", service, "FriendCoopGoalTarget = 3");
requireText("goal reward", service, "FriendCoopGoalRewardDiamond = 30");
requireText("goal route", program, "MapGet(\"/api/social/coop-goal\"");
requireText("claim route", program, "MapPost(\"/api/social/coop-goal/claim\"");
requireText("client goal API", apiClient, "getFriendCoopGoal");
requireText("client claim API", apiClient, "claimFriendCoopGoal");
requireText("client goal manager", coopManager, "applyRealtimeProgress");
requireText("stale snapshot guard", coopManager, "state.updatedAt < this.state.updatedAt");
requireText("login goal restore", syncManager, "fetchServerFriendCoopGoal");
requireText("claim resource snapshot", syncManager, "\"server_friend_coop_goal\"");
requireText("goal card", bottomNav, "renderFriendCoopGoalCard");
requireText("claim button", bottomNav, "data-action=\"claimFriendCoopGoal\"");
requireText("factory goal progress", bottomNav, "coopGoal.progress");
requireText("service coverage", serviceTests, "FriendCoopGoal_AccumulatesUniqueHelpersAndClaimsOnce");
requireText("API coverage", apiTests, "FriendCoopGoal_ClaimsDiamondRewardContract");
requireText("three-helper online coverage", onlineUi, "helperResults");
requireText("online UI claim", onlineUi, "claimFriendCoopGoal");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "persistent daily cooperative goal",
        "atomic multi-helper progress and idempotent claim",
        "diamond reward transaction",
        "goal/claim HTTP contracts",
        "login and SSE client synchronization",
        "friend goal card and factory progress UI",
        "service/API/three-player browser coverage",
    ],
}, null, 2));
