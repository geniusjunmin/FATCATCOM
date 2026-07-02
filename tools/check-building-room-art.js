const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const scenes = ["office", "roast", "tank", "mill", "cafe", "storage"];
const relativeAssets = scenes.map(scene => `building_rooms/room_${scene}_v1.jpg`);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message, details = undefined) {
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

function assertContains(label, source, pattern) {
  if (!source.includes(pattern)) fail("Building room art contract failed.", { label, pattern });
}

function readJpegDimensions(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += length + 2;
  }
  return {};
}

for (const relativeAsset of relativeAssets) {
  const assetPath = path.join(root, "FATCATUI/assets/resources/textures/generated", relativeAsset);
  if (!fs.existsSync(assetPath)) fail("Building room art is missing.", { assetPath });
  const jpeg = fs.readFileSync(assetPath);
  if (jpeg.length < 70000) fail("Building room art is unexpectedly small.", { assetPath, bytes: jpeg.length });
  if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) fail("Building room art is not a JPEG.", { assetPath });
  const { width, height } = readJpegDimensions(jpeg);
  if (width !== 768 || height !== 432) {
    fail("Building room art has the wrong dimensions.", { assetPath, width, height });
  }
}

const registry = read("FATCATUI/assets/scripts/ui/UiAssetRegistry.ts");
const resolver = read("FATCATUI/assets/scripts/ui/DomAssetResolver.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const panelStyles = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const generator = read("tools/generate-dom-asset-data-uris.ps1");
const capture = read("tools/capture-feature-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("building room registry", registry, "GeneratedBuildingRoomAssets");
assertContains("building room resolver", resolver, "getBuildingRoomAsset");
assertContains("building room renderer", bottomNav, "getBuildingRoomAsset(scene)");
assertContains("building scene marker", bottomNav, 'data-building-scene="${scene}"');
assertContains("building room aspect ratio", panelStyles, "aspect-ratio:16 / 9");
assertContains("building interaction guard", capture, "buildingSceneSwitches");
assertContains("embedded room guard", capture, "buildingEmbeddedSwitches");
assertContains("quick verify registration", quickVerify, "check-building-room-art.js");
for (const relativeAsset of relativeAssets) {
  assertContains(`registry includes ${relativeAsset}`, registry, relativeAsset);
  assertContains(`DOM generator includes ${relativeAsset}`, generator, `"${relativeAsset}"`);
}

console.log(JSON.stringify({
  ok: true,
  assets: relativeAssets,
  checked: [
    "six 768x432 floor-specific room illustrations",
    "registry, resolver, renderer, and data URI wiring",
    "four-size six-floor interaction regression guards",
  ],
}, null, 2));
