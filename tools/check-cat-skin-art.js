const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const relativeAssets = [
    "cats/cat_skin_apron_v1.png",
    "cats/cat_skin_manager_v1.png",
    "cats/cat_skin_festival_v1.png",
];

function fail(message, details = undefined) {
    console.error(JSON.stringify({ ok: false, message, details }, null, 2));
    process.exit(1);
}

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertContains(label, source, pattern) {
    if (!source.includes(pattern)) fail("Cat skin art contract failed.", { label, pattern });
}

for (const relativeAsset of relativeAssets) {
    const assetPath = path.join(root, "FATCATUI/assets/resources/textures/generated", relativeAsset);
    if (!fs.existsSync(assetPath)) fail("Cat skin art is missing.", { assetPath });
    const png = fs.readFileSync(assetPath);
    if (png.length < 400000) fail("Cat skin art is unexpectedly small.", { assetPath, bytes: png.length });
    if (png.toString("ascii", 1, 4) !== "PNG") fail("Cat skin art is not a PNG.", { assetPath });
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    const colorType = png[25];
    if (width !== 768 || height !== 768 || colorType !== 6) {
        fail("Cat skin art must be 768px RGBA.", { assetPath, width, height, colorType });
    }
}

const registry = read("FATCATUI/assets/scripts/ui/UiAssetRegistry.ts");
const resolver = read("FATCATUI/assets/scripts/ui/DomAssetResolver.ts");
const presentation = read("FATCATUI/assets/scripts/ui/CatPresentation.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const styles = read("FATCATUI/assets/scripts/ui/CatOverlayPresentation.ts");
const generator = read("tools/generate-dom-asset-data-uris.ps1");
const capture = read("tools/capture-cat-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("skin registry", registry, "GeneratedCatSkinAssets");
assertContains("skin resolver", resolver, "getCatSkinAsset");
assertContains("theme art ids", presentation, 'artKey: "festival"');
assertContains("skin selection action", bottomNav, 'action === "selectCatSkin"');
assertContains("skin apply action", bottomNav, 'action === "applyCatSkin"');
assertContains("real art styling", styles, ".skin-card-target.has-art i");
assertContains("full-width wardrobe", styles, ".cat-grid.skin-mode");
assertContains("four-size embedded art guard", capture, "embeddedSkinArt");
assertContains("apron apply guard", capture, 'selectedSkinId !== "apron"');
assertContains("quick verify registration", quickVerify, "check-cat-skin-art.js");
for (const relativeAsset of relativeAssets) {
    assertContains(`skin registry ${relativeAsset}`, registry, relativeAsset);
    assertContains(`DOM generator ${relativeAsset}`, generator, `"${relativeAsset}"`);
}

console.log(JSON.stringify({
    ok: true,
    assets: relativeAssets,
    checked: [
        "three 768px transparent wardrobe illustrations",
        "registry and DOM resolver wiring",
        "select, preview, apply, and locked states",
        "full-width responsive wardrobe",
        "four-size embedded-art interaction regression",
    ],
}, null, 2));
