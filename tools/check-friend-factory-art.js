const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "FATCATUI/assets/resources/textures/generated/backgrounds/friend_factory_visit_bg_v1.png");
const runtimePath = path.join(root, "FATCATUI/assets/resources/textures/generated/backgrounds/friend_factory_visit_bg_640_v1.jpg");
const registry = fs.readFileSync(path.join(root, "FATCATUI/assets/scripts/ui/UiAssetRegistry.ts"), "utf8");
const generator = fs.readFileSync(path.join(root, "tools/generate-dom-asset-data-uris.ps1"), "utf8");

function fail(message, details) {
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

for (const assetPath of [sourcePath, runtimePath]) {
  if (!fs.existsSync(assetPath)) fail("Friend factory art is missing.", { assetPath });
  if (fs.statSync(assetPath).size < 100000) fail("Friend factory art is unexpectedly small.", { assetPath });
}

if (!registry.includes("friendFactoryVisit") || !registry.includes("friend_factory_visit_bg_640_v1.jpg")) {
  fail("Friend factory art is not registered.", {});
}
if (!generator.includes("backgrounds/friend_factory_visit_bg_640_v1.jpg")) {
  fail("Friend factory art is not embedded for the DOM bridge.", {});
}

const jpeg = fs.readFileSync(runtimePath);
if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) fail("Runtime friend factory art is not a JPEG.", {});

console.log(JSON.stringify({
  ok: true,
  assets: [
    path.relative(root, sourcePath),
    path.relative(root, runtimePath),
  ],
}, null, 2));
