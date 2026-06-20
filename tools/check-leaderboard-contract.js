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
    fail("Leaderboard contract check failed.", { label, pattern });
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

assertContains("server dto entry", contracts, "LeaderboardEntryDto");
assertContains("server dto envelope", contracts, "LeaderboardDto");
assertContains("server feature flag", service, "\"leaderboard\"");
assertContains("service method", service, "GetLeaderboardAsync");
assertContains("api route", program, "MapGet(\"/api/leaderboard\"");
assertContains("client entry type", apiTypes, "LeaderboardEntryDto");
assertContains("client envelope type", apiTypes, "LeaderboardDto");
assertContains("client api method", apiClient, "getLeaderboard");
assertContains("sync manager fetch", syncManager, "fetchServerLeaderboard");
assertContains("friend panel cache", bottomNav, "_serverLeaderboard: LeaderboardDto | null");
assertContains("friend panel render", bottomNav, "renderLeaderboardPreview");
assertContains("friend panel refresh", bottomNav, "refreshServerLeaderboardForPanel");
assertContains("api test", apiTests, "Leaderboard_ReturnsIncomeRankingContract");
assertContains("service test", serviceTests, "GetLeaderboardAsync_ReturnsIncomeRankingWithSelfEntry");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "server leaderboard DTOs and feature flag",
    "HTTP /api/leaderboard route",
    "client API/types/sync manager",
    "friend panel leaderboard rendering",
    "service and API test coverage",
  ],
}, null, 2));
