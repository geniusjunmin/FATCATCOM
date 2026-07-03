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

const domain = read("FATCATServer/FatCat.Domain/PlayerDailyOrderState.cs");
const db = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const repository = read("FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const manager = read("FATCATUI/assets/scripts/manager/DailyOrderManager.ts");
const sync = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const factory = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const onlineUi = read("tools/check-daily-order-online-ui.js");

requireText("daily order domain", domain, "PlayerDailyOrderState");
requireText("runtime daily schema", db, 'CREATE TABLE IF NOT EXISTS "DailyOrderStates"');
requireText("atomic daily launch advance", repository, "TryAdvanceDailyLaunchAsync");
requireText("conditional launch quota", repository, 'AND "LaunchCount" < {launchLimit}');
requireText("atomic daily claim", repository, 'AND "IsClaimed" = 0');
requireText("daily order DTO", contracts, "DailyOrderDto");
requireText("daily claim DTO", contracts, "DailyOrderClaimResponse");
requireText("daily state service", service, "GetDailyOrderAsync");
requireText("daily reward ledger", service, '"daily_order_claim"');
requireText("launch progression", service, "TryAdvanceDailyLaunchAsync");
requireText("serialized launch settlement", service, "LaunchSettlementGates");
requireText("launch quota rejection", service, '"daily_launch_limit_reached"');
requireText("reference initial progress", service, "DailyOrderInitialProgress = 56");
requireText("daily target", service, "DailyOrderTarget = 60");
requireText("daily GET route", program, 'MapGet("/api/daily-order"');
requireText("daily claim route", program, 'MapPost("/api/daily-order/claim"');
requireText("client daily DTO", apiTypes, "DailyOrderClaimResponse");
requireText("client daily API", apiClient, "claimDailyOrder");
requireText("UTC local fallback", manager, "getUTCFullYear");
requireText("offline claim guard", manager, "claimOffline");
requireText("login synchronization", sync, "fetchServerDailyOrder");
requireText("authoritative resource snapshot", sync, '"server_daily_order_claim"');
requireText("factory progress binding", factory, 'data-daily-progress="${dailyOrder.progress}"');
requireText("factory claim state binding", factory, 'data-daily-claimable="${dailyOrder.claimable}"');
requireText("factory launch quota binding", factory, 'data-launches-remaining="${dailyOrder.launchesRemaining}"');
requireText("service progression coverage", serviceTests, "LaunchAsync_AdvancesDailyOrderOnlyForNewSettlement");
requireText("service quota coverage", serviceTests, "LaunchAsync_EnforcesDailyQuotaAndKeepsReplayIdempotent");
requireText("service claim coverage", serviceTests, "DailyOrder_ClaimRewardsResourcesExactlyOnce");
requireText("API coverage", apiTests, "DailyOrder_AdvancesFromLaunchAndClaimsOnce");
requireText("API concurrency coverage", apiTests, "DailyOrder_ConcurrentClaimsGrantExactlyOneReward");
requireText("API launch quota concurrency", apiTests, "Launch_ConcurrentRequestsRespectDailyQuota");
requireText("online four-launch coverage", onlineUi, "expectedProgress");
requireText("online exhausted-state coverage", onlineUi, "launchesRemaining");
requireText("online exhausted toast geometry", onlineUi, "clearsCards");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "UTC daily persisted state",
        "idempotent launch progression",
        "five-launch UTC quota and concurrent rejection",
        "atomic one-time reward claim",
        "resource snapshot and transaction ledger",
        "online and offline client boundaries",
        "factory progress, disabled, ready, and claimed states",
        "service, API, and browser coverage",
    ],
}, null, 2));
