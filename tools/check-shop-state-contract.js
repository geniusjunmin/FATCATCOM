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
    fail("Shop state contract check failed.", { label, pattern });
  }
}

const program = read("FATCATServer/FatCat.Api/Program.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const shopManager = read("FATCATUI/assets/scripts/manager/ShopManager.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");

assertContains("server route", program, 'app.MapGet("/api/shop/state"');
assertContains("server dto", contracts, "public sealed record ShopStateDto");
assertContains("service method", service, "GetShopStateAsync");
assertContains("bootstrap feature", service, '"shop-state"');
assertContains("client dto", apiTypes, "export type ShopStateDto");
assertContains("client api", apiClient, "getShopState");
assertContains("manager snapshot", shopManager, "applyServerSnapshot(states: ShopStateDto[])");
assertContains("sync fetch", syncManager, "fetchServerShopState");
assertContains("login fetch", syncManager, "void this.fetchServerShopState()");
assertContains("save sync fetch", syncManager, "await this.fetchServerShopState()");
assertContains("purchase inventory snapshot", bottomNav, "serverPurchase.itemQuantityAfter");
assertContains("online purchase avoids local fulfillment", bottomNav, "NetworkManager.canUseServer ? !!serverPurchase : ShopManager.buyItem(id)");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "server shop state route",
    "server shop state DTO/service",
    "client shop state DTO/API",
    "ShopManager server snapshot consumption",
    "SyncManager login/save shop state refresh",
    "online purchase inventory snapshot application",
  ],
}, null, 2));
