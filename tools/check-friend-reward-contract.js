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
    fail("Friend reward contract check failed.", { label, pattern });
  }
}

const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");

assertContains("server response dto", contracts, "FriendActionResponse");
assertContains("visit reward source", service, "\"friend_visit\"");
assertContains("gift reward source", service, "\"friend_gift\"");
assertContains("daily visit limit", service, "daily_visit_claimed");
assertContains("daily gift limit", service, "daily_gift_claimed");
assertContains("visit envelope type", program, "ApiEnvelope<FriendActionResponse>");
assertContains("client response type", apiTypes, "FriendActionResponse");
assertContains("client visit response", apiClient, "Promise<ApiEnvelope<FriendActionResponse>>");
assertContains("resource apply helper", syncManager, "applyFriendActionResources");
assertContains("resource snapshot apply", syncManager, "ResourceManager.applyServerSnapshot");
assertContains("visit reward message", bottomNav, "Friend visit reward");
assertContains("gift reward message", bottomNav, "Friend gift reward");
assertContains("service coverage", serviceTests, "FriendActions_RewardResourcesOncePerDay");
assertContains("api coverage", apiTests, "rewardCoin");
assertContains("api coverage gift", apiTests, "rewardCatFood");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "friend action response DTO/API",
    "server reward and daily limit behavior",
    "client balance application",
    "friend panel reward messages",
    "service and API coverage",
  ],
}, null, 2));
