const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const assertContains = (label, source, pattern) => {
    if (!source.includes(pattern)) {
        console.error(JSON.stringify({ ok: false, label, pattern }, null, 2));
        process.exit(1);
    }
};

const domain = read("FATCATServer/FatCat.Domain/PlayerFactoryAppearanceState.cs");
const db = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const api = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const manager = read("FATCATUI/assets/scripts/manager/FactoryAppearanceManager.ts");
const sync = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const ui = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("owned appearance persistence", domain, "OwnedAppearanceIdsJson");
assertContains("equipped appearance persistence", domain, "EquippedAppearanceKey");
assertContains("runtime SQLite table", db, 'CREATE TABLE IF NOT EXISTS "FactoryAppearanceStates"');
assertContains("state contract", contracts, "FactoryAppearanceStateDto");
assertContains("level gate", service, "player.Level < definition.RequiredFactoryLevel");
assertContains("per-player gate", service, "FactoryAppearanceGates.GetOrAdd");
assertContains("catalog endpoint", api, '/api/factory/appearances"');
assertContains("unlock endpoint", api, '/api/factory/appearances/{appearanceId}/unlock');
assertContains("equip endpoint", api, '/api/factory/appearances/{appearanceId}/equip');
assertContains("client DTO", apiTypes, "FactoryAppearanceStateDto");
assertContains("client API", apiClient, "getFactoryAppearanceState");
assertContains("client cache", manager, "applyServerState");
assertContains("sync fetch", sync, "fetchServerFactoryAppearanceState");
assertContains("sync unlock", sync, "unlockServerFactoryAppearance");
assertContains("online UI authority", ui, "FactoryAppearanceManager.getServerState()");
assertContains("unlock UI action", ui, 'data-action="unlockFactoryAppearance"');
assertContains("service behavior coverage", serviceTests, "FactoryAppearanceAsync_EnforcesLevelAndPersistsOwnershipAndEquip");
assertContains("API behavior coverage", apiTests, "FactoryAppearanceEndpoints_EnforceLevelAndPersistEquippedTheme");
assertContains("quick verify registration", quickVerify, "check-factory-appearance-sync-contract.js");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "player-level ownership and equip persistence",
        "runtime SQLite schema and application contracts",
        "level-gated unlock and serialized mutations",
        "HTTP, client API, sync cache, and UI authority",
        "service, API, migration, and quick verification coverage",
    ],
}, null, 2));
