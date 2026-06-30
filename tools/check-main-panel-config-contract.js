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
    fail("Main panel config contract check failed.", { label, pattern });
  }
}

function assertNotContains(label, source, pattern) {
  if (source.includes(pattern)) {
    fail("Main panel config contract check failed.", { label, forbidden: pattern });
  }
}

const config = read("FATCATUI/assets/scripts/ui/MainPanelConfig.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("panel id type", config, "export type MainPanelId");
assertContains("ordered Cocos nav panels", config, "ORDERED_MAIN_PANELS");
assertContains("Cocos button bindings", config, "MAIN_PANEL_BINDINGS");
assertContains("selected name map", config, "MAIN_PANEL_SELECTED_NAMES");
assertContains("DOM nav items", config, "MAIN_DOM_NAV_ITEMS");
assertContains("feature icon mapping", config, "MAIN_NAV_FEATURE_ICON_BY_PANEL");

for (const panel of ["factory", "cats", "buildings", "shop", "inventory", "research"]) {
  assertContains(`dom nav includes ${panel}`, config, `id: "${panel}"`);
}

assertContains("BottomNavUI imports config", bottomNav, "from \"./MainPanelConfig\"");
assertContains("BottomNavUI uses ordered panels", bottomNav, "ORDERED_MAIN_PANELS[index]");
assertContains("BottomNavUI uses shared bindings", bottomNav, "MAIN_PANEL_BINDINGS.find");
assertContains("BottomNavUI uses shared DOM nav items", bottomNav, "MAIN_DOM_NAV_ITEMS.map");
assertContains("BottomNavUI uses shared selected names", bottomNav, "MAIN_PANEL_SELECTED_NAMES[this.currentPanel]");
assertContains("BottomNavUI uses shared icon map", bottomNav, "MAIN_NAV_FEATURE_ICON_BY_PANEL[panel]");
assertNotContains("BottomNavUI no local navItems array", bottomNav, "const navItems:");
assertNotContains("BottomNavUI no local panelNameMap", bottomNav, "const panelNameMap:");
assertNotContains("BottomNavUI no local bindings array", bottomNav, "const bindings:");
assertContains("quick verify includes contract", quickVerify, "check-main-panel-config-contract.js");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "shared main panel id/config module",
    "Cocos nav binding delegation",
    "DOM nav item delegation",
    "main panel selected-name delegation",
    "quick verify registration",
  ],
}, null, 2));
