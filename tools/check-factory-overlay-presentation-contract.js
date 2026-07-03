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
    fail("Factory overlay presentation contract check failed.", { label, pattern });
  }
}

function assertNotContains(label, source, pattern) {
  if (source.includes(pattern)) {
    fail("Factory overlay presentation contract check failed.", { label, forbidden: pattern });
  }
}

const presentation = read("FATCATUI/assets/scripts/ui/FactoryOverlayPresentation.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("factory style builder exported", presentation, "export function getDomFactoryStyles");
assertContains("factory asset argument declared", presentation, "factoryCutawayDataUri: string");
assertContains("factory asset argument interpolated", presentation, "${factoryCutawayDataUri}");
for (const selector of [
  "#fatcat-dom-factory",
  ".factory-illustration",
  ".building",
  ".floor-card",
  ".bonus",
  ".bottom-widgets",
  ".side-btn",
  "@media (max-width:390px)",
]) {
  assertContains(`factory styles include ${selector}`, presentation, selector);
}
for (const token of [
  "contrast(1.075)",
  "repeating-linear-gradient(92deg",
  ".floor-card:after",
  ".bonus:after",
  "background:#83ad48",
]) {
  assertContains(`factory target material includes ${token}`, presentation, token);
}

for (const forbidden of [
  "#fatcat-dom-hud",
  "#fatcat-dom-nav",
  "#fatcat-dom-panel-overlay",
  "#fatcat-dom-cat-overlay",
]) {
  assertNotContains(`factory styles exclude ${forbidden}`, presentation, forbidden);
}

assertContains("BottomNavUI imports factory overlay presentation", bottomNav, "from \"./FactoryOverlayPresentation\"");
assertContains(
  "BottomNavUI supplies generated factory asset",
  bottomNav,
  "getDomFactoryStyles(this.getDomAssetDataUri(GeneratedBackgroundAssets.factoryCutaway))",
);
assertNotContains("BottomNavUI no inline factory CSS", bottomNav, "#fatcat-dom-factory { position: fixed;");
assertContains("BottomNavUI retains factory pointer actions", bottomNav, "private onDomFactoryPointerDown");
assertContains("BottomNavUI retains factory rendering", bottomNav, "private renderDomFactoryOverlay");
assertContains("quick verify includes contract", quickVerify, "check-factory-overlay-presentation-contract.js");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "factory style builder and asset parameter",
    "factory style ownership boundaries",
    "BottomNavUI factory style delegation",
    "factory behavior retention",
    "quick verify registration",
  ],
}, null, 2));
