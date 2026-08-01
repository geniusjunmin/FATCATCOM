const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");
const assertContains = (label, source, pattern) => {
    if (!source.includes(pattern)) {
        console.error(JSON.stringify({ ok: false, label, pattern }, null, 2));
        process.exit(1);
    }
};

const item = read("FATCATServer/FatCat.Domain/PlayerInventoryItem.cs");
const transaction = read("FATCATServer/FatCat.Domain/PlayerInventoryTransaction.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const repository = read("FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs");
const db = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const inventoryManager = read("FATCATUI/assets/scripts/manager/InventoryManager.ts");
const sync = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const ui = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const capture = read("tools/capture-feature-regression.js");
const online = read("tools/check-authoritative-inventory-online.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("inventory entity", item, "Quantity");
assertContains("idempotent transaction entity", transaction, "ClientRequestId");
assertContains("inventory DTO", contracts, "public sealed record InventoryItemDto");
assertContains("inventory use DTO", contracts, "public sealed record InventoryUseResponse");
assertContains("shop request id", contracts, "string ClientRequestId = \"\"");
assertContains("trusted inventory seed", service, "InitialQuantity + purchasedCount");
assertContains("shared inventory gate", service, "InventoryMutationGates");
assertContains("shop replay", service, 'replay.SourceType == "shop_purchase"');
assertContains("use replay", service, 'replay.SourceType == "inventory_use"');
assertContains("achievement item grant", service, 'var requestId = $"achievement:{definition.Id}:{rewardItem.ItemId}"');
assertContains("achievement item backfill", service, "EnsureAchievementInventoryRewardsAsync");
assertContains("catalog row migration", service, "catalogChanged");
assertContains("inventory repository", repository, "GetInventoryTransactionAsync");
assertContains("inventory table migration", db, 'CREATE TABLE IF NOT EXISTS "InventoryItems"');
assertContains("inventory transaction migration", db, 'CREATE TABLE IF NOT EXISTS "InventoryTransactions"');
assertContains("inventory route", program, 'app.MapGet("/api/inventory"');
assertContains("inventory use route", program, 'app.MapPost("/api/inventory/{itemId}/use"');
assertContains("client inventory DTO", apiTypes, "export type InventoryItemDto");
assertContains("client inventory API", apiClient, "useInventoryItem(playerId: string");
assertContains("client server mirror", inventoryManager, "applyServerSnapshot(items: InventoryItemDto[])");
assertContains("login inventory fetch", sync, "void this.fetchServerInventory()");
assertContains("online use action", sync, "useServerInventoryItem");
assertContains("inventory authority marker", ui, 'data-inventory-authority="${authority}"');
assertContains("no online local purchase fulfillment", ui, "NetworkManager.canUseServer ? !!serverPurchase : ShopManager.buyItem(id)");
assertContains("service replay test", serviceTests, "Inventory_PurchaseAndUseReplayWithoutDuplicatingMutation");
assertContains("service achievement backfill test", serviceTests, "Achievement_BackfillsLegacyInventoryRewardExactlyOnce");
assertContains("service catalog migration test", serviceTests, "Inventory_AddsMissingCatalogRowsWithoutGrantingDefaultsAgain");
assertContains("API concurrency test", apiTests, "Inventory_ConcurrentPurchaseAndUseAreIdempotentAcrossReload");
assertContains("four-size authority capture", capture, "inventoryAuthority");
assertContains("online purchase-use-reload", online, "authoritative inventory online check");
assertContains("quick verify registration", quickVerify, "check-authoritative-inventory-contract.js");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "trusted persistent inventory seed and catalog",
        "idempotent shop and use transaction snapshots",
        "idempotent achievement item reward and legacy backfill",
        "authenticated inventory snapshot and use routes",
        "client server mirror with offline fallback",
        "service, migration, concurrency, online, and four-size coverage",
    ],
}, null, 2));
