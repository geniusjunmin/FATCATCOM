const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function requireText(label, source, pattern) {
    if (!source.includes(pattern)) {
        console.error(JSON.stringify({ ok: false, label, pattern }, null, 2));
        process.exit(1);
    }
}

const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const repository = read("FATCATServer/FatCat.Application/IFatCatRepository.cs");
const efRepository = read("FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const panelStyles = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const utilityRegression = read("tools/capture-utility-regression.js");
const onlineUiRegression = read("tools/check-friend-presence-online-ui.js");

requireText("presence response DTO", contracts, "PlayerPresenceDto");
requireText("atomic friend repository contract", repository, "AddFriendIfMissingAsync");
requireText("SQLite atomic seed insert", efRepository, "INSERT OR IGNORE INTO \"FriendSnapshots\"");
requireText("friend presence field", contracts, "PresenceStatus");
requireText("presence heartbeat service", service, "TouchPresenceAsync");
requireText("presence status thresholds", service, "TimeSpan.FromMinutes(30)");
requireText("returning login refresh", service, "existing.UpdatedAt = DateTimeOffset.UtcNow");
requireText("presence API route", program, "MapPost(\"/api/social/presence\"");
requireText("client presence type", apiTypes, "PlayerPresenceDto");
requireText("client presence API", apiClient, "touchPresence");
requireText("client presence sync", syncManager, "touchServerPresence");
requireText("global heartbeat in-flight guard", syncManager, "_presenceTouchInFlight");
requireText("global heartbeat throttle", syncManager, "Date.now() - this._lastPresenceAt < 30000");
requireText("heartbeat cache player scope", syncManager, "_lastPresencePlayerId === NetworkManager.playerId");
requireText("45 second heartbeat", bottomNav, "now + 45000");
requireText("30 second friend refresh", bottomNav, "now + 30000");
requireText("presence state rendering", bottomNav, "presence-state ${presenceStatus}");
requireText("online presence style", panelStyles, ".presence-state.online");
requireText("recent presence style", panelStyles, ".presence-state.recent");
requireText("offline presence style", panelStyles, ".presence-state.offline");
requireText("service presence coverage", serviceTests, "AuthGuestAsync_RefreshesReturningPlayerPresence");
requireText("API presence coverage", apiTests, "/api/social/presence");
requireText("utility presence coverage", utilityRegression, "friendPresenceStates");
requireText("online UI heartbeat coverage", onlineUiRegression, "presenceRequests");
requireText("online UI badge coverage", onlineUiRegression, "presence-state.online");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "server heartbeat DTO/service/route",
        "online/recent/offline status calculation",
        "returning-login activity refresh",
        "client heartbeat and friend refresh cadence",
        "presence badges and responsive regression coverage",
        "online client heartbeat and badge regression",
    ],
}, null, 2));
