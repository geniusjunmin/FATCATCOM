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
    fail("Friend sync contract check failed.", { label, pattern });
  }
}

const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");

assertContains("client get friends api", apiClient, "getFriends");
assertContains("client visit friend api", apiClient, "visitFriend");
assertContains("client gift friend api", apiClient, "sendFriendGift");
assertContains("server friend room DTO", contracts, "FriendRoomDto");
assertContains("server friend room mapping", service, "BuildFriendRooms");
assertContains("server friend room staffing", service, "assignedCatCount");
assertContains("server friend room decor", service, "decorScore");
assertContains("client friend room type", apiTypes, "FriendRoomDto");
assertContains("client friend room staffing type", apiTypes, "assignedCatCount");
assertContains("client friend room decor type", apiTypes, "decorScore");
assertContains("friend panel server room consumption", bottomNav, "friend.rooms");
assertContains("friend panel room staffing render", bottomNav, "featuredCatName");
assertContains("friend panel room decor render", bottomNav, "decorScore");
assertContains("login fetch friends", syncManager, "void this.fetchServerFriends()");
assertContains("save sync fetch friends", syncManager, "await this.fetchServerFriends()");
assertContains("friend auto login", syncManager, "visitServerFriend(friendId: string)");
assertContains("friend panel server cache", bottomNav, "_serverFriends: FriendDto[]");
assertContains("friend panel refresh", bottomNav, "refreshServerFriendsForPanel");
assertContains("friend panel server render", bottomNav, "this._serverFriends.map(friend =>");
assertContains("friend visit server action", bottomNav, "SyncManager.visitServerFriend(id)");
assertContains("friend gift server action", bottomNav, "SyncManager.sendServerFriendGift(id)");
assertContains("api test coverage", apiTests, "FriendVisitAndGift_UpdateServerSnapshotContract");
assertContains("api room coverage", apiTests, "GetProperty(\"rooms\")");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "friend HTTP API methods",
    "friend room summary/staffing DTO and client type",
    "SyncManager friend fetch on login/save",
    "DOM friend panel server snapshot rendering",
    "DOM friend panel server room rendering",
    "online visit/gift action routing",
    "API friend visit/gift test coverage",
  ],
}, null, 2));
