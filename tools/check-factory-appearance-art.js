const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const relativeAssets = [
  "factory_appearances/appearance_classic_v1.jpg",
  "factory_appearances/appearance_steam_v1.jpg",
  "factory_appearances/appearance_future_v1.jpg",
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message, details = undefined) {
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

function assertContains(label, source, pattern) {
  if (!source.includes(pattern)) fail("Factory appearance contract failed.", { label, pattern });
}

function readJpegDimensions(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += length + 2;
  }
  return {};
}

for (const relativeAsset of relativeAssets) {
  const assetPath = path.join(root, "FATCATUI/assets/resources/textures/generated", relativeAsset);
  if (!fs.existsSync(assetPath)) fail("Factory appearance art is missing.", { assetPath });
  const jpeg = fs.readFileSync(assetPath);
  if (jpeg.length < 100000) fail("Factory appearance art is unexpectedly small.", { assetPath, bytes: jpeg.length });
  if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) fail("Factory appearance art is not a JPEG.", { assetPath });
  const { width, height } = readJpegDimensions(jpeg);
  if (width !== 768 || height !== 432) {
    fail("Factory appearance art has the wrong dimensions.", { assetPath, width, height });
  }
}

const registry = read("FATCATUI/assets/scripts/ui/UiAssetRegistry.ts");
const resolver = read("FATCATUI/assets/scripts/ui/DomAssetResolver.ts");
const presentation = read("FATCATUI/assets/scripts/ui/FeaturePanelPresentation.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const styles = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const saveData = read("FATCATUI/assets/scripts/model/SaveData.ts");
const generator = read("tools/generate-dom-asset-data-uris.ps1");
const capture = read("tools/capture-factory-appearance-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("appearance registry", registry, "GeneratedFactoryAppearanceAssets");
assertContains("appearance resolver", resolver, "getFactoryAppearanceAsset");
assertContains("four appearance configs", presentation, "FACTORY_APPEARANCES");
assertContains("saved appearance id", saveData, "factoryAppearanceId?: string");
assertContains("appearance subview state", bottomNav, '_buildingPanelMode: "detail" | "appearance"');
assertContains("appearance renderer", bottomNav, "renderFactoryAppearancePanel()");
assertContains("open action", bottomNav, 'data-action="openFactoryAppearance"');
assertContains("close action", bottomNav, 'data-action="closeFactoryAppearance"');
assertContains("select action", bottomNav, 'data-action="selectFactoryAppearance"');
assertContains("apply action", bottomNav, 'data-action="applyFactoryAppearance"');
assertContains("stage style", styles, ".factory-appearance-stage");
assertContains("card style", styles, ".factory-appearance-card");
assertContains("compact style", styles, ".compact .factory-appearance-stage");
assertContains("four-size capture", capture, "[360, 800]");
assertContains("appearance switch guard", capture, "uniqueAppearances !== 4");
assertContains("return guard", capture, "!result.returnedToBuilding");
assertContains("quick verify registration", quickVerify, "check-factory-appearance-art.js");
for (const relativeAsset of relativeAssets) {
  assertContains(`registry includes ${relativeAsset}`, registry, relativeAsset);
  assertContains(`DOM generator includes ${relativeAsset}`, generator, `"${relativeAsset}"`);
}

console.log(JSON.stringify({
  ok: true,
  assets: relativeAssets,
  checked: [
    "three 768x432 generated factory themes",
    "four-theme config, selection, persistence, and action wiring",
    "responsive appearance stage, cards, bonuses, and return flow",
  ],
}, null, 2));
