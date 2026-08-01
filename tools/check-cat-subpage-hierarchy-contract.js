const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");

function fail(label, pattern) {
    console.error(JSON.stringify({ ok: false, label, pattern }, null, 2));
    process.exit(1);
}

function requireText(label, source, pattern) {
    if (!source.includes(pattern)) fail(label, pattern);
}

const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const styles = read("FATCATUI/assets/scripts/ui/CatOverlayPresentation.ts");
const capture = read("tools/capture-cat-regression.js");
const clicks = read("tools/verify-ui-clicks-playwright.js");
const quickVerify = read("tools/quick-verify.ps1");

requireText("selected tab marker", bottomNav, 'data-cat-tab="${this._domCatTab}"');
requireText("focus subpanel marker", bottomNav, 'data-cat-subpanel="focus"');
requireText("equipment subpanel marker", bottomNav, 'data-cat-subpanel="equipment"');
requireText("active tab accessibility", bottomNav, 'aria-current="${this._domCatTab === tab ? "page" : "false"}"');

for (const zone of ["info", "upgrade", "skill", "equip", "skin"]) {
    requireText(`${zone} tab zone`, bottomNav, `data-cat-tab-zone="${zone}"`);
}

for (const selector of [
    ".cat-grid.cat-tab-upgrade",
    ".cat-grid.cat-tab-skill",
    ".cat-grid.cat-tab-equip",
    ".cat-upgrade-target",
    ".cat-skill-target",
    ".cat-upgrade-effects",
    ".cat-skill-next",
]) {
    requireText(`${selector} styling`, styles, selector);
}

for (const hook of [
    "captureCatTab",
    "cat-upgrade-${width}x${height}-edge.png",
    "cat-skill-${width}x${height}-edge.png",
    "upgradeState.primaryWidthRatio < 0.95",
    "skillState.primaryWidthRatio < 0.95",
    "equipTabState.primaryWidthRatio < 0.95",
    "skinTabState.primaryWidthRatio < 0.95",
    "tabMessageVisible",
    "subpanelTitleGap",
    "contentContained",
]) {
    requireText(`cat regression hook ${hook}`, capture, hook);
}

requireText("quick verify registration", quickVerify, "check-cat-subpage-hierarchy-contract.js");
requireText("tab switches clear redundant toast", bottomNav, 'this._domCatMessage = "";');
requireText("visible equipment interaction path", clicks, '.equipment-panel .equip-row .equip-slot[data-action="equipItem"]:not(.locked)');

console.log(JSON.stringify({
    ok: true,
    checked: [
        "five cat-tab semantic zones",
        "full-width upgrade, skill, equipment, and skin ownership",
        "upgrade and skill target-card structure",
        "five-tab four-size screenshot coverage",
        "active-tab accessibility and geometry guards",
    ],
}, null, 2));
