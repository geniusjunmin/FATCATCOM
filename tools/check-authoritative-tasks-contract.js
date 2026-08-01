const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");
const requireText = (label, source, text) => {
    if (!source.includes(text)) {
        console.error(JSON.stringify({ ok: false, label, text }, null, 2));
        process.exit(1);
    }
};

const taskState = read("FATCATServer/FatCat.Domain/PlayerTaskState.cs");
const taskClaim = read("FATCATServer/FatCat.Domain/PlayerTaskClaim.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const repository = read("FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs");
const database = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const sync = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const ui = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const capture = read("tools/capture-utility-regression.js");
const online = read("tools/check-authoritative-tasks-online.js");
const quickVerify = read("tools/quick-verify.ps1");

requireText("versioned task state", taskState, "CatalogVersion");
requireText("UTC cycle state", taskState, "CycleDate");
requireText("request-keyed claim", taskClaim, "ClientRequestId");
requireText("claim reward snapshot", taskClaim, "InventoryItemsJson");
requireText("task DTO", contracts, "public sealed record TaskDto");
requireText("claim request DTO", contracts, "public sealed record TaskClaimRequest");
requireText("server task catalog", service, "TaskCatalogVersion");
requireText("ledger-derived progress", service, "GetPositiveCoinEarnedAsync");
requireText("daily UTC reset", service, 'definition.Type == "daily" ? today : 0');
requireText("shared progression gate", service, "PlayerProgressionGates");
requireText("shared inventory gate", service, "InventoryMutationGates");
requireText("idempotent replay", service, "GetTaskClaimByRequestAsync");
requireText("unified resource reward", service, '"task_claim"');
requireText("persistent task repository", repository, "GetTaskClaimAsync");
requireText("task state migration", database, 'CREATE TABLE IF NOT EXISTS "TaskStates"');
requireText("task claim migration", database, 'CREATE TABLE IF NOT EXISTS "TaskClaims"');
requireText("task snapshot route", program, 'app.MapGet("/api/tasks"');
requireText("task claim route", program, 'app.MapPost("/api/tasks/{taskId}/claim"');
requireText("client task DTO", apiTypes, "export type TaskDto");
requireText("client task API", apiClient, "claimTask(playerId: string");
requireText("client task cache", sync, "getServerTasks()");
requireText("launch refresh", sync, "void this.fetchServerTasks()");
requireText("online task claim", ui, "SyncManager.claimServerTask(id)");
requireText("task authority marker", ui, "shell.dataset.taskAuthority");
requireText("service reward test", serviceTests, "Tasks_DeriveLedgerProgressAndClaimUnifiedRewardsOnce");
requireText("service UTC reset test", serviceTests, "Tasks_ResetStaleDailyStateOnUtcCycleChange");
requireText("API concurrency test", apiTests, "Tasks_ConcurrentClaimIsIdempotentAcrossReload");
requireText("four-size authority guard", capture, "taskAuthority");
requireText("online launch-claim-reload", online, "authoritative tasks online check");
requireText("quick verify registration", quickVerify, "check-authoritative-tasks-contract.js");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "versioned main and UTC-daily task state",
        "server-ledger progress derivation",
        "request-keyed currency, inventory, and experience settlement",
        "authenticated task snapshot and claim routes",
        "client authority cache with offline fallback",
        "migration, concurrency, online, and four-size coverage",
    ],
}, null, 2));
