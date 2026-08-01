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
    fail("Friend activity contract check failed.", { label, pattern });
  }
}

const domain = read("FATCATServer/FatCat.Domain/PlayerSocialActivity.cs");
const dbContext = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const repository = read("FATCATServer/FatCat.Application/IFatCatRepository.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const socialCards = read("FATCATUI/assets/scripts/ui/FriendSocialCards.ts");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");

assertContains("domain entity", domain, "PlayerSocialActivity");
assertContains("db set", dbContext, "SocialActivities");
assertContains("sqlite table", dbContext, "CREATE TABLE IF NOT EXISTS \"SocialActivities\"");
assertContains("server dto", contracts, "FriendActivityDto");
assertContains("repository add", repository, "AddSocialActivityAsync");
assertContains("repository list", repository, "GetSocialActivitiesAsync");
assertContains("service query", service, "GetFriendActivitiesAsync");
assertContains("service write add", service, "\"friend_add\"");
assertContains("service write visit", service, "\"friend_visit\"");
assertContains("service write gift", service, "\"friend_gift\"");
assertContains("api route", program, "MapGet(\"/api/friends/activity\"");
assertContains("client dto", apiTypes, "FriendActivityDto");
assertContains("client api", apiClient, "getFriendActivities");
assertContains("sync fetch", syncManager, "fetchServerFriendActivities");
assertContains("panel cache", bottomNav, "_friendActivities: FriendActivityDto[]");
assertContains("panel activity adapter", bottomNav, "renderFriendActivityPreview");
assertContains("panel activity delegation", bottomNav, "renderFriendActivityCard({");
assertContains("panel activity renderer", socialCards, "export function renderFriendActivityCard");
assertContains("panel activity row", socialCards, 'class="activity-row"');
assertContains("api coverage", apiTests, "FriendActivity_ReturnsRecentSocialActionsContract");
assertContains("service coverage", serviceTests, "FriendActions_WriteRecentSocialActivities");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "server social activity entity/schema",
    "friend activity route/DTO/service/repository",
    "client API/types/sync/panel render",
    "service and API coverage",
  ],
}, null, 2));
