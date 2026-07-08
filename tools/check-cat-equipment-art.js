const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const relativeAssets = [
    "items/equip_collar_v2.png",
    "items/equip_cup_v2.png",
    "items/equip_cushion_v2.png",
    "items/recruit_badge_v1.png",
];

function fail(message, details = undefined) {
    console.error(JSON.stringify({ ok: false, message, details }, null, 2));
    process.exit(1);
}

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertContains(label, source, pattern) {
    if (!source.includes(pattern)) fail("Cat equipment art contract failed.", { label, pattern });
}

for (const relativeAsset of relativeAssets) {
    const assetPath = path.join(root, "FATCATUI/assets/resources/textures/generated", relativeAsset);
    const metaPath = `${assetPath}.meta`;
    if (!fs.existsSync(assetPath)) fail("Cat equipment art is missing.", { assetPath });
    if (!fs.existsSync(metaPath)) fail("Cat equipment art meta is missing.", { metaPath });
    const png = fs.readFileSync(assetPath);
    if (png.length < 100000) fail("Cat equipment art is unexpectedly small.", { assetPath, bytes: png.length });
    if (png.toString("ascii", 1, 4) !== "PNG") fail("Cat equipment art is not a PNG.", { assetPath });
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    const colorType = png[25];
    if (width !== 384 || height !== 384 || colorType !== 6) {
        fail("Cat equipment art must be 384px RGBA.", { assetPath, width, height, colorType });
    }
}

const registry = read("FATCATUI/assets/scripts/ui/UiAssetRegistry.ts");
const resolver = read("FATCATUI/assets/scripts/ui/DomAssetResolver.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const generator = read("tools/generate-dom-asset-data-uris.ps1");
const dataUris = read("FATCATUI/assets/scripts/ui/DomAssetDataUris.ts");
const capture = read("tools/capture-cat-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("collar registry", registry, "equip_collar_v2.png");
assertContains("cup registry", registry, "equip_cup_v2.png");
assertContains("cushion registry", registry, "equip_cushion_v2.png");
assertContains("recruit registry", registry, "recruit_badge_v1.png");
assertContains("equipment resolver", resolver, "getEquipIconAsset");
assertContains("recruit resolver", resolver, "getRecruitBadgeAsset");
assertContains("recruit button asset key", bottomNav, 'data-art-key="recruit-badge-v1"');
assertContains("recruit button action preserved", bottomNav, 'data-action="unlockCat"');
assertContains("embedded equipment guard", capture, "embeddedEquipIconArt");
assertContains("embedded recruit guard", capture, "recruitBadgeKey");
assertContains("quick verify registration", quickVerify, "check-cat-equipment-art.js");
for (const relativeAsset of relativeAssets) {
    assertContains(`DOM generator ${relativeAsset}`, generator, `"${relativeAsset}"`);
    assertContains(`DOM data URI ${relativeAsset}`, dataUris, `assets/resources/textures/generated/${relativeAsset}`);
}

console.log(JSON.stringify({
    ok: true,
    assets: relativeAssets,
    checked: [
        "four 384px transparent target-style item illustrations",
        "registry, resolver, and DOM data-uri wiring",
        "cat equipment and recruit button rendering path",
        "four-size cat screenshot regression hooks",
    ],
}, null, 2));
