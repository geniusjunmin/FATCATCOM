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

const repositoryContract = read("FATCATServer/FatCat.Application/IFatCatRepository.cs");
const repository = read("FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const panelStyles = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const onlineUi = read("tools/check-decor-shop-online-ui.js");

requireText("atomic insert result contract", repositoryContract, "Task<bool> AddDecorIfMissingAsync");
requireText("SQLite duplicate guard", repository, "return inserted > 0");
requireText("catalog DTO", contracts, "DecorCatalogItemDto");
requireText("purchase DTO", contracts, "DecorPurchaseResponse");
requireText("six-item catalog", service, "decor_shop_storage_cart");
requireText("permanent purchase transaction", service, "\"decor_purchase\"");
requireText("duplicate purchase guard", service, "GetDecorStateAsync(playerId, definition.DecorId");
requireText("catalog endpoint", program, "MapGet(\"/api/decor/catalog\"");
requireText("purchase endpoint", program, "MapPost(\"/api/decor/{decorId}/purchase\"");
requireText("client catalog type", apiTypes, "DecorCatalogItemDto");
requireText("client purchase API", apiClient, "purchaseDecoration");
requireText("resource snapshot", syncManager, "`server_decor_${decorId}`");
requireText("dynamic decor rows", bottomNav, "renderDecorCatalogRow");
requireText("purchase interaction", bottomNav, "data-action=\"buyDecor\"");
requireText("owned presentation", panelStyles, ".decor-catalog-row.owned");
requireText("service coverage", serviceTests, "PurchaseDecorationAsync_AddsPermanentOwnedDecorAndDeductsOnce");
requireText("API coverage", apiTests, "DecorShop_ExposesCatalogAndPermanentPurchaseContract");
requireText("online purchase coverage", onlineUi, "decor_shop_neon_paw");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "authoritative permanent decor catalog",
        "atomic duplicate ownership guard",
        "resource transaction and snapshot",
        "catalog and purchase HTTP contracts",
        "dynamic shop and building inventory integration",
        "service, API, and browser coverage",
    ],
}, null, 2));
