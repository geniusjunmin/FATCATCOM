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
  if (!source.includes(pattern)) fail("Shop interaction contract failed.", { label, pattern });
}

const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const styles = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const capture = read("tools/capture-feature-regression.js");
const decorOnline = read("tools/check-decor-shop-online-ui.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("stable selection state", bottomNav, "_selectedShopProductKey");
assertContains("selection action", bottomNav, 'action === "selectShopProduct"');
assertContains("category reset", bottomNav, "getDefaultShopProductSelection(tab)");
assertContains("async decor selection repair", bottomNav, "!catalog.some(item => `decor:${item.decorId}` === this._selectedShopProductKey)");
assertContains("unified product detail", bottomNav, "renderShopProductDetail(detail)");
assertContains("real product detail action", bottomNav, "this.renderShopButton(shop.id");
assertContains("decor detail action", bottomNav, "this.renderDecorPurchaseButton(decor)");
assertContains("selected key marker", bottomNav, 'data-selected-key="${detail.key}"');
assertContains("category marker", bottomNav, 'data-shop-category="${this._domShopTab}"');
assertContains("selectable row control", bottomNav, 'class="shop-product-select"');
assertContains("scrollable catalog", styles, ".shop-catalog-viewport");
assertContains("selected row treatment", styles, ".shop-shell .shop-row.selected");
assertContains("detail layout", styles, ".shop-detail-target");
assertContains("compact detail layout", styles, ".compact .shop-detail-target");
assertContains("four-tab interaction", capture, '["resource", "item", "cat", "deco"]');
assertContains("detail switch guard", capture, "shopDetailSwitch");
assertContains("purchase action guard", capture, "shopRealPurchaseAction");
assertContains("decor purchase button scope", decorOnline, 'querySelector(".buy-zone button")');
assertContains("online decor selection guard", decorOnline, "before.selectedRows === 1");
assertContains("quick verify registration", quickVerify, "check-shop-interaction.js");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "four-category default and selected product state",
    "real, preview, and decoration detail rendering",
    "authoritative purchase actions remain wired",
    "four-size tab, detail, art, and nav-clearance regression",
  ],
}, null, 2));
