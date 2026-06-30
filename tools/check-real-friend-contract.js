const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message, details = undefined) {
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

function assertContains(label, source, pattern) {
  if (!source.includes(pattern)) {
    fail("Real friend contract check failed.", { label, pattern });
  }
}

const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const repository = read("FATCATServer/FatCat.Application/IFatCatRepository.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const panelPresentation = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");

assertContains("add friend request dto", contracts, "AddFriendRequest");
assertContains("friend profile dto", contracts, "FriendProfileDto");
assertContains("repository player lookup", repository, "FindPlayersByIdsAsync");
assertContains("service add friend", service, "AddFriendAsync");
assertContains("real friend key", service, "player:");
assertContains("real friend refresh", service, "RefreshRealFriendSnapshotsAsync");
assertContains("real friend profile builder", service, "BuildFriendProfileAsync");
assertContains("real friend profile activity", service, "player.UpdatedAt.ToUnixTimeMilliseconds()");
assertContains("api add route", program, "MapPost(\"/api/friends/add\"");
assertContains("client request type", apiTypes, "AddFriendRequest");
assertContains("client friend profile type", apiTypes, "FriendProfileDto");
assertContains("client api add friend", apiClient, "addFriend");
assertContains("sync add friend", syncManager, "addServerFriend");
assertContains("friend panel button", bottomNav, "data-action=\"addFriend\"");
assertContains("friend panel prompt", bottomNav, "输入对方玩家 ID");
assertContains("friend profile metadata renderer", bottomNav, "renderFriendProfileMeta");
assertContains("real friend profile badge", bottomNav, "真人好友");
assertContains("friend profile styles", panelPresentation, ".friend-profile-meta");
assertContains("api coverage", apiTests, "AddFriend_CreatesRealPlayerFriendContract");
assertContains("service coverage", serviceTests, "AddFriendAsync_CreatesRealPlayerFriendSnapshot");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "server real-friend DTO/repository/service/route",
    "real-player profile metadata",
    "client API/types/sync manager",
    "friend panel add/profile rendering",
    "service and API coverage",
  ],
}, null, 2));
