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

const player = read("FATCATServer/FatCat.Domain/PlayerProfile.cs");
const friend = read("FATCATServer/FatCat.Domain/FriendSnapshot.cs");
const db = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const boostManager = read("FATCATUI/assets/scripts/manager/FriendBoostManager.ts");
const production = read("FATCATUI/assets/scripts/manager/ProductionManager.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const onlineUi = read("tools/check-friend-help-online-ui.js");

requireText("persistent boost percent", player, "FriendBoostPercent");
requireText("persistent boost expiry", player, "FriendBoostUntil");
requireText("daily helper timestamp", friend, "LastHelpAt");
requireText("SQLite boost migration", db, "\"FriendBoostUntil\"");
requireText("boost state contract", contracts, "FriendBoostStateDto");
requireText("help response contract", contracts, "FriendHelpResponse");
requireText("daily help guard", service, "\"daily_help_claimed\"");
requireText("real friend guard", service, "\"real_friend_required\"");
requireText("boost cap", service, "MaxFriendBoostPercent");
requireText("server production multiplier", service, "friendBoostMultiplier");
requireText("boost state route", program, "MapGet(\"/api/social/boost\"");
requireText("help route", program, "MapPost(\"/api/friends/{friendId}/help\"");
requireText("client boost manager", boostManager, "getProductionMultiplier");
requireText("server clock skew normalization", boostManager, "remainingMs");
requireText("local production multiplier", production, "FriendBoostManager.getProductionMultiplier()");
requireText("client boost fetch", apiClient, "getFriendBoost");
requireText("client help action", syncManager, "helpServerFriend");
requireText("realtime boost application", syncManager, "socialEvent.eventType === \"friend_help\"");
requireText("friend help button", bottomNav, "data-action=\"helpFriend\"");
requireText("factory boost banner", bottomNav, "friend-boost-banner");
requireText("service boost coverage", serviceTests, "FriendHelp_AppliesPersistentProductionBoostOncePerDay");
requireText("API boost coverage", apiTests, "FriendHelp_AppliesAndRestoresBoostContract");
requireText("online boost coverage", onlineUi, "boostBanner");
requireText("online production delta", onlineUi, "productionRatio");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "persistent cooperative boost state",
        "daily real-friend help validation",
        "server and local production multipliers",
        "help/boost HTTP contracts",
        "SSE client boost restoration",
        "friend action and factory banner UI",
        "service/API/dual-player browser coverage",
    ],
}, null, 2));
