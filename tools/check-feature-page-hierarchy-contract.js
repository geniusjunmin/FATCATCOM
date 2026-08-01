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
const styles = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const regression = read("tools/capture-feature-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

for (const page of ["buildings", "shop", "inventory", "research"]) {
    requireText(`${page} feature-page marker`, bottomNav, `data-feature-page=\"${page}\"`);
}

for (const zone of [
    "title",
    "toolbar",
    "floor-selector",
    "hero",
    "description",
    "decor",
    "effects",
    "conditions",
    "upgrade",
    "roster",
    "categories",
    "detail",
    "catalog",
    "grid",
    "currency",
    "tree",
]) {
    requireText(`${zone} feature-zone marker`, bottomNav, `data-feature-zone=\"${zone}\"`);
}

requireText("overlay panel id state", bottomNav, "overlay.dataset.panelId = panelId");
requireText("building panel mode state", bottomNav, "overlay.dataset.panelMode");
requireText("building back arrow", bottomNav, '? "←" : "×"');
requireText("feature title visually compact", styles, ".feature-detail-shell > .feature-page-title");
requireText("feature title clipping", styles, "clip-path:inset(50%)");
requireText("shop close hidden", styles, 'data-panel-id="shop"');
requireText("inventory close hidden", styles, 'data-panel-id="inventory"');
requireText("research close hidden", styles, 'data-panel-id="research"');
requireText("building detail back style", styles, 'data-panel-mode="detail"');
requireText("feature page runtime marker", regression, "featurePage");
requireText("feature zone runtime marker", regression, "featureZones");
requireText("feature compact title guard", regression, "featureTitleCompact");
requireText("feature top gap guard", regression, "featureFirstZoneGap");
requireText("feature close guard", regression, "featureCloseVisible");
requireText("quick verify registration", quickVerify, "check-feature-page-hierarchy-contract.js");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "four target feature-page markers",
        "page-specific semantic zones",
        "compact accessible title hierarchy",
        "building-only visible back control",
        "four-size geometry regression coverage",
    ],
}, null, 2));
