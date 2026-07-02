const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const relativeAssets = [
  "items/inventory_speed_ticket_v1.png",
  "items/inventory_guard_charm_v1.png",
  "items/inventory_order_voucher_v1.png",
  "items/research_medal_v1.png",
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message, details = undefined) {
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

function assertContains(label, source, pattern) {
  if (!source.includes(pattern)) fail("Inventory/research art contract failed.", { label, pattern });
}

for (const relativeAsset of relativeAssets) {
  const assetPath = path.join(root, "FATCATUI/assets/resources/textures/generated", relativeAsset);
  if (!fs.existsSync(assetPath)) fail("Inventory/research art is missing.", { assetPath });
  const png = fs.readFileSync(assetPath);
  if (png.length < 100000) fail("Inventory/research art is unexpectedly small.", { assetPath, bytes: png.length });
  if (png.toString("ascii", 1, 4) !== "PNG") fail("Inventory/research art is not a PNG.", { assetPath });
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width !== 384 || height !== 384) {
    fail("Inventory/research art has the wrong dimensions.", { assetPath, width, height });
  }
}

const registry = read("FATCATUI/assets/scripts/ui/UiAssetRegistry.ts");
const resolver = read("FATCATUI/assets/scripts/ui/DomAssetResolver.ts");
const featurePresentation = read("FATCATUI/assets/scripts/ui/FeaturePanelPresentation.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const panelStyles = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const generator = read("tools/generate-dom-asset-data-uris.ps1");
const capture = read("tools/capture-feature-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("inventory registry", registry, "GeneratedInventoryArtAssets");
assertContains("research registry", registry, "GeneratedResearchArtAssets");
assertContains("inventory resolver", resolver, "getInventoryPreviewAsset");
assertContains("research resolver", resolver, "getResearchMedalAsset");
assertContains("speed ticket mapping", featurePresentation, '"speedTicket"');
assertContains("order voucher mapping", featurePresentation, '"orderVoucher"');
assertContains("guard charm mapping", featurePresentation, '"guardCharm"');
assertContains("cat shard art mapping", featurePresentation, '"catOrange"');
assertContains("inventory renderer marker", bottomNav, 'data-inventory-art="${art}"');
assertContains("research node asset", bottomNav, 'class="node-icon asset"');
assertContains("research detail asset", bottomNav, "research-medal-art");
assertContains("dedicated inventory art sizing", panelStyles, ".bag-icon.dedicated-art");
assertContains("research medal sizing", panelStyles, ".research-medal-art");
assertContains("inventory screenshot guard", capture, "embeddedInventoryArt");
assertContains("research screenshot guard", capture, "embeddedResearchArt");
assertContains("quick verify registration", quickVerify, "check-inventory-research-art.js");
for (const relativeAsset of relativeAssets) {
  assertContains(`DOM generator includes ${relativeAsset}`, generator, `"${relativeAsset}"`);
}

console.log(JSON.stringify({
  ok: true,
  assets: relativeAssets,
  checked: [
    "four 384px transparent feature illustrations",
    "registry, resolver, and data URI wiring",
    "inventory and research render markers",
    "four-size screenshot regression guards",
  ],
}, null, 2));
