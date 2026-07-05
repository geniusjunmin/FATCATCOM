const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertContains(label, source, pattern) {
    if (!source.includes(pattern)) {
        console.error(JSON.stringify({ ok: false, label, pattern }, null, 2));
        process.exit(1);
    }
}

const domain = read("FATCATServer/FatCat.Domain/PlayerCatState.cs");
const db = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const api = read("FATCATServer/FatCat.Api/Program.cs");
const saveData = read("FATCATUI/assets/scripts/model/SaveData.ts");
const saveManager = read("FATCATUI/assets/scripts/manager/SaveManager.ts");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const catManager = read("FATCATUI/assets/scripts/manager/CatManager.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const online = read("tools/check-cat-skin-online-ui.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("domain owned skins", domain, "OwnedSkinsJson");
assertContains("domain equipped skin", domain, "EquippedSkinKey");
assertContains("runtime owned-skin migration", db, 'ALTER TABLE "CatStates" ADD COLUMN "OwnedSkinsJson"');
assertContains("runtime equipped-skin migration", db, 'ALTER TABLE "CatStates" ADD COLUMN "EquippedSkinKey"');
assertContains("snapshot owned skins", contracts, "IReadOnlyList<string> OwnedSkinIds");
assertContains("equip response", contracts, "CatSkinEquipResponse");
assertContains("authoritative equip service", service, "EquipCatSkinAsync");
assertContains("locked ownership guard", service, "!ownedSkinIds.Contains(skinId");
assertContains("equip route", api, '/api/cats/{catId}/skins/{skinId}/equip');
assertContains("save owned skins", saveData, "ownedSkinIds?: string[]");
assertContains("old-save migration", saveManager, "cat.ownedSkinIds = cat.ownedSkinIds");
assertContains("client response type", apiTypes, "CatSkinEquipResponse");
assertContains("client API", apiClient, "equipCatSkin");
assertContains("client apply", catManager, "applyServerSkin");
assertContains("offline equip", catManager, "equipSkin(catId");
assertContains("sync action", syncManager, "equipServerCatSkin");
assertContains("online UI route", bottomNav, "SyncManager.equipServerCatSkin");
assertContains("ownership marker", bottomNav, "data-skin-owned");
assertContains("service coverage", serviceTests, "EquipCatSkinAsync_PersistsOwnedSkinAndRejectsLockedSkin");
assertContains("migration coverage", serviceTests, 'SELECT "OwnedSkinsJson", "EquippedSkinKey"');
assertContains("API coverage", apiTests, "CatSkinEquip_PersistsOwnedSkinAndRejectsLockedSkin");
assertContains("reload persistence browser coverage", online, "persistedAfterReload");
assertContains("quick verify registration", quickVerify, "check-cat-skin-sync-contract.js");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "persistent cat skin columns and old-SQLite migration",
        "authoritative owned/equipped snapshot and equip route",
        "client save migration, API, sync, and offline fallback",
        "wardrobe ownership markers and online action routing",
        "service, API, migration, and reload browser coverage",
    ],
}, null, 2));
