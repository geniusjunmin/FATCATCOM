const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const generatedRoot = path.join(root, "FATCATUI/assets/resources/textures/generated");
const iconAssets = [
    "ui/icon_achievement_trophy_v2.png",
    "ui/icon_mail_envelope_v2.png",
    "ui/icon_friend_cat_v2.png",
    "ui/icon_settings_gear_v2.png",
];
const factoryAsset = "factory_cutaway_bg_852_v2.jpg";

function fail(message, details = undefined) {
    console.error(JSON.stringify({ ok: false, message, details }, null, 2));
    process.exit(1);
}

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertContains(label, source, pattern) {
    if (!source.includes(pattern)) {
        fail("Main UI art contract failed.", { label, pattern });
    }
}

for (const relativeAsset of iconAssets) {
    const assetPath = path.join(generatedRoot, relativeAsset);
    if (!fs.existsSync(assetPath)) fail("Main UI icon is missing.", { assetPath });
    const png = fs.readFileSync(assetPath);
    if (png.length < 80000) fail("Main UI icon is unexpectedly small.", { assetPath, bytes: png.length });
    if (png.toString("ascii", 1, 4) !== "PNG") fail("Main UI icon is not a PNG.", { assetPath });
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    if (width !== 384 || height !== 384) {
        fail("Main UI icon has the wrong dimensions.", { assetPath, width, height });
    }
    if (!png.includes(Buffer.from("IHDR")) || !png.includes(Buffer.from("IDAT"))) {
        fail("Main UI icon is missing required PNG chunks.", { assetPath });
    }
}

const factoryPath = path.join(generatedRoot, factoryAsset);
if (!fs.existsSync(factoryPath)) fail("High-resolution factory art is missing.", { factoryPath });
const jpeg = fs.readFileSync(factoryPath);
if (jpeg.length < 300000) fail("High-resolution factory art is unexpectedly small.", { bytes: jpeg.length });
if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8 || jpeg[jpeg.length - 2] !== 0xff || jpeg[jpeg.length - 1] !== 0xd9) {
    fail("High-resolution factory art is not a complete JPEG.", { factoryPath });
}

const registry = read("FATCATUI/assets/scripts/ui/UiAssetRegistry.ts");
const generator = read("tools/generate-dom-asset-data-uris.ps1");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const capture = read("tools/capture-main-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("factory registry", registry, factoryAsset);
assertContains("factory DOM generator", generator, `"${factoryAsset}"`);
assertContains("side-art screenshot guard", capture, "sideButtonArtKeys");
assertContains("side-art markup", bottomNav, 'data-art-key="achievement-trophy-v2"');
assertContains("quick verify registration", quickVerify, "check-main-ui-art.js");
for (const relativeAsset of iconAssets) {
    assertContains(`icon registry ${relativeAsset}`, registry, relativeAsset);
    assertContains(`icon generator ${relativeAsset}`, generator, `"${relativeAsset}"`);
}

console.log(JSON.stringify({
    ok: true,
    factoryAsset,
    iconAssets,
    checked: [
        "four 384px generated side-tool illustrations",
        "high-resolution factory JPEG",
        "registry and DOM Data URI wiring",
        "stable side-tool art markers",
        "four-size screenshot contract",
    ],
}, null, 2));
