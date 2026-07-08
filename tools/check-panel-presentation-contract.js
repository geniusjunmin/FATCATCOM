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
    fail("Panel presentation contract check failed.", { label, pattern });
  }
}

function assertNotContains(label, source, pattern) {
  if (source.includes(pattern)) {
    fail("Panel presentation contract check failed.", { label, forbidden: pattern });
  }
}

const presentation = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("DOM panel styles exported", presentation, "DOM_PANEL_STYLES");
for (const selector of [
  "#fatcat-dom-panel-overlay",
  ".panel-shell",
  ".building-shell",
  ".shop-shell",
  ".inventory-shell",
  ".research-shell",
  ".friends-shell",
  ".settings-shell",
  ".utility-shell h2:before",
  ".utility-shell .feature-card:before",
  ".utility-shell .feature-mini span:before",
  ".toggle-pill:before",
  ".compact .panel-shell",
  ".compact .utility-shell h2",
  ".compact .settings-shell .toggle-pill:before",
]) {
  assertContains(`panel styles include ${selector}`, presentation, selector);
}

for (const forbidden of [
  "#fatcat-dom-hud",
  "#fatcat-dom-nav",
  "#fatcat-dom-factory",
  "#fatcat-dom-cat-overlay",
]) {
  assertNotContains(`panel styles exclude ${forbidden}`, presentation, forbidden);
}

assertContains("BottomNavUI imports panel presentation", bottomNav, "from \"./PanelPresentation\"");
assertContains("BottomNavUI applies panel styles", bottomNav, "style.textContent = DOM_PANEL_STYLES;");
assertNotContains("BottomNavUI no inline panel CSS", bottomNav, "#fatcat-dom-panel-overlay { position: fixed;");
assertContains("BottomNavUI retains panel event handling", bottomNav, "onDomPanelPointerDown");
assertContains("BottomNavUI retains panel rendering", bottomNav, "private renderDomPanel");
assertContains("quick verify includes contract", quickVerify, "check-panel-presentation-contract.js");
assertContains("utility regression guards title pins", read("tools/capture-utility-regression.js"), "utilityTitlePins");
assertContains("utility regression guards hero icon frame", read("tools/capture-utility-regression.js"), "utilityHeroIconFramed");
assertContains("utility regression guards feature card pins", read("tools/capture-utility-regression.js"), "utilityCardPins");
assertContains("utility regression guards mini medallions", read("tools/capture-utility-regression.js"), "utilityMiniMedallions");
assertContains("utility regression guards setting toggles", read("tools/capture-utility-regression.js"), "settingsToggleKnobs");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "DOM panel style export",
    "panel style ownership boundaries",
    "utility panel target material hooks",
    "BottomNavUI panel style delegation",
    "panel behavior retention",
    "quick verify registration",
  ],
}, null, 2));
