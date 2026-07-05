const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

function assertContains(label, source, pattern) {
    if (!source.includes(pattern)) {
        console.error(JSON.stringify({ ok: false, label, pattern }, null, 2));
        process.exit(1);
    }
}

const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const api = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const catManager = read("FATCATUI/assets/scripts/manager/CatManager.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const capture = read("tools/capture-cat-regression.js");
const online = read("tools/check-cat-skin-online-ui.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("catalog DTO", contracts, "CatSkinCatalogItemDto");
assertContains("unlock response DTO", contracts, "CatSkinUnlockResponse");
assertContains("manager coin price", service, 'new("manager"');
assertContains("festival diamond price", service, 'new("festival"');
assertContains("per-player purchase gate", service, "CatSkinUnlockGates");
assertContains("catalog service", service, "GetCatSkinCatalogAsync");
assertContains("unlock service", service, "UnlockCatSkinAsync");
assertContains("resource transaction", service, '"cat_skin_unlock"');
assertContains("catalog route", api, '/api/cats/{catId}/skins/catalog');
assertContains("unlock route", api, '/api/cats/{catId}/skins/{skinId}/unlock');
assertContains("client catalog type", apiTypes, "CatSkinCatalogItemDto");
assertContains("client unlock type", apiTypes, "CatSkinUnlockResponse");
assertContains("client catalog API", apiClient, "getCatSkinCatalog");
assertContains("client unlock API", apiClient, "unlockCatSkin");
assertContains("catalog manager", catManager, "applyServerSkinCatalog");
assertContains("login catalog sync", syncManager, "fetchServerCatSkinCatalog");
assertContains("purchase sync", syncManager, "unlockServerCatSkin");
assertContains("wardrobe purchase action", bottomNav, 'action === "unlockCatSkin"');
assertContains("wardrobe price marker", bottomNav, "data-price-amount");
assertContains("service purchase coverage", serviceTests, "UnlockCatSkinAsync_DeductsResourcesOnceAndReturnsCatalogOwnership");
assertContains("API atomic coverage", apiTests, "CatSkinUnlock_IsAtomicAndUpdatesCatalogBalanceAndSnapshot");
assertContains("four-size price entry coverage", capture, 'action !== "unlockCatSkin"');
assertContains("online purchase persistence", online, "purchasePersistedAfterReload");
assertContains("quick verify registration", quickVerify, "check-cat-skin-acquisition-contract.js");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "authoritative skin catalog and prices",
        "serialized idempotent purchase and resource ledger",
        "catalog/unlock HTTP and client synchronization",
        "wardrobe price, affordability, purchase, and auto-equip states",
        "service, API concurrency, four-size, and online reload coverage",
    ],
}, null, 2));
