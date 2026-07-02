const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const relativeAssets = [
  "shop/shop_bean_sack_v1.png",
  "shop/shop_cat_food_pouch_v1.png",
  "shop/shop_coin_pouch_v1.png",
  "shop/shop_diamond_chest_v1.png",
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message, details = undefined) {
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

function assertContains(label, source, pattern) {
  if (!source.includes(pattern)) fail("Shop product art contract failed.", { label, pattern });
}

for (const relativeAsset of relativeAssets) {
  const assetPath = path.join(root, "FATCATUI/assets/resources/textures/generated", relativeAsset);
  if (!fs.existsSync(assetPath)) fail("Shop product art is missing.", { assetPath });
  const png = fs.readFileSync(assetPath);
  if (png.length < 100000) fail("Shop product art is unexpectedly small.", { assetPath, bytes: png.length });
  if (png.toString("ascii", 1, 4) !== "PNG") fail("Shop product art is not a PNG.", { assetPath });
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width !== 384 || height !== 384) fail("Shop product art has the wrong dimensions.", { assetPath, width, height });
}

const registry = read("FATCATUI/assets/scripts/ui/UiAssetRegistry.ts");
const resolver = read("FATCATUI/assets/scripts/ui/DomAssetResolver.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const panelStyles = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const generator = read("tools/generate-dom-asset-data-uris.ps1");
const capture = read("tools/capture-feature-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("shop registry", registry, "GeneratedShopProductAssets");
assertContains("shop resolver", resolver, "getShopProductAsset");
assertContains("shop renderer", bottomNav, "getShopProductAsset(productKind)");
assertContains("web hides native shop panel", bottomNav, "this.shopPanel.active = !useDomPanels");
assertContains("shop product selector", panelStyles, ".shop-icon.product-art");
assertContains("narrow shop row fit", panelStyles, "min-height:78px");
assertContains("414 feature viewport", capture, "[414, 896]");
assertContains("embedded art screenshot guard", capture, "embeddedShopProductArt");
assertContains("shop nav clearance guard", capture, "shopRowsClearNav");
assertContains("quick verify registration", quickVerify, "check-shop-product-art.js");
for (const relativeAsset of relativeAssets) {
  assertContains(`DOM generator includes ${relativeAsset}`, generator, `"${relativeAsset}"`);
}

console.log(JSON.stringify({
  ok: true,
  assets: relativeAssets,
  checked: [
    "four 384px generated product illustrations",
    "registry and DOM resolver wiring",
    "shop renderer and dedicated product styles",
    "four-size embedded-art screenshot coverage",
  ],
}, null, 2));
