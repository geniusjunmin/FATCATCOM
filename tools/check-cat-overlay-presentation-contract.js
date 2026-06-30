const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message, details = undefined) {
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

function assertContains(label, source, pattern) {
  if (!source.includes(pattern)) {
    fail("Cat overlay presentation contract check failed.", { label, pattern });
  }
}

function assertNotContains(label, source, pattern) {
  if (source.includes(pattern)) {
    fail("Cat overlay presentation contract check failed.", { label, forbidden: pattern });
  }
}

const presentation = read("FATCATUI/assets/scripts/ui/CatOverlayPresentation.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("cat style builder exported", presentation, "export function getDomCatStyles");
assertContains("cat workshop argument declared", presentation, "catWorkshopDataUri: string");
const workshopUses = presentation.split("${catWorkshopDataUri}").length - 1;
if (workshopUses !== 3) {
  fail("Cat overlay presentation contract check failed.", {
    label: "cat workshop argument usage count",
    expected: 3,
    actual: workshopUses,
  });
}

for (const selector of [
  "#fatcat-dom-cat-overlay",
  ".cat-page-hud",
  ".cat-side",
  ".cat-portrait",
  ".cat-stats",
  ".equip-layout",
  ".skin-wardrobe",
  ".cat-story",
  ".cat-list",
  ".tablet .cat-bg",
  "@media (max-width:390px)",
]) {
  assertContains(`cat styles include ${selector}`, presentation, selector);
}

for (const forbidden of [
  "#fatcat-dom-hud",
  "#fatcat-dom-nav",
  "#fatcat-dom-factory",
  "#fatcat-dom-panel-overlay",
]) {
  assertNotContains(`cat styles exclude ${forbidden}`, presentation, forbidden);
}

assertContains("BottomNavUI imports cat overlay presentation", bottomNav, "from \"./CatOverlayPresentation\"");
assertContains(
  "BottomNavUI supplies generated workshop asset",
  bottomNav,
  "getDomCatStyles(this.getDomAssetDataUri(GeneratedBackgroundAssets.catDetailWorkshop))",
);
assertNotContains("BottomNavUI no inline cat CSS", bottomNav, "#fatcat-dom-cat-overlay { position: fixed;");
assertContains("BottomNavUI retains cat pointer actions", bottomNav, "private onDomCatPointerDown");
assertContains("BottomNavUI retains cat rendering", bottomNav, "private renderDomCatOverlay");
assertContains("quick verify includes contract", quickVerify, "check-cat-overlay-presentation-contract.js");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "cat style builder and workshop parameter",
    "cat responsive style ownership",
    "BottomNavUI cat style delegation",
    "cat behavior retention",
    "quick verify registration",
  ],
}, null, 2));
