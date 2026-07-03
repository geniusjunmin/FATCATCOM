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
    fail("Feature panel presentation contract check failed.", { label, pattern });
  }
}

function assertNotContains(label, source, pattern) {
  if (source.includes(pattern)) {
    fail("Feature panel presentation contract check failed.", { label, forbidden: pattern });
  }
}

const presentation = read("FATCATUI/assets/scripts/ui/FeaturePanelPresentation.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const quickVerify = read("tools/quick-verify.ps1");

for (const name of [
  "SETTINGS_PANEL_ITEMS",
  "DEFAULT_ENABLED_SETTING_IDS",
  "getDefaultSettingValue",
  "TASK_PROGRESS_MILESTONES",
  "SHOP_TABS",
  "SHOP_PREVIEW_CATALOGS",
  "INVENTORY_TABS",
  "INVENTORY_PREVIEW_CARDS",
  "INVENTORY_ALL_SLOTS",
  "RESEARCH_NODE_POSITIONS",
  "RESEARCH_PLACEHOLDER_LABELS",
  "RESEARCH_PLACEHOLDER_POSITIONS",
]) {
  assertContains(`${name} exported`, presentation, name);
}

for (const label of [
  "资源商店",
  "道具商店",
  "猫咪商店",
  "装饰商店",
  "全部",
  "资源",
  "道具",
  "碎片",
  "其他",
  "咖啡萃取 II",
]) {
  assertContains(`feature config includes ${label}`, presentation, label);
}

assertContains("BottomNavUI imports feature panel presentation", bottomNav, "from \"./FeaturePanelPresentation\"");
assertContains("BottomNavUI uses settings config", bottomNav, "SETTINGS_PANEL_ITEMS.map");
assertContains("BottomNavUI uses default setting helper", bottomNav, "return getDefaultFeatureSettingValue(id);");
assertContains("BottomNavUI uses task milestones", bottomNav, "TASK_PROGRESS_MILESTONES.map");
assertContains("BottomNavUI uses shop tabs", bottomNav, "SHOP_TABS.map");
assertContains("BottomNavUI uses shop preview catalogs", bottomNav, "SHOP_PREVIEW_CATALOGS[category]");
assertContains("BottomNavUI uses inventory tabs", bottomNav, "INVENTORY_TABS.map");
assertContains("BottomNavUI uses inventory previews", bottomNav, "renderInventoryPreviewCards");
assertContains("BottomNavUI uses curated inventory slots", bottomNav, "renderInventoryAllSlots");
assertContains("BottomNavUI uses research node positions", bottomNav, "RESEARCH_NODE_POSITIONS[index]");
assertContains("BottomNavUI uses research placeholder labels", bottomNav, "RESEARCH_PLACEHOLDER_LABELS.map");
assertContains("BottomNavUI uses research placeholder positions", bottomNav, "RESEARCH_PLACEHOLDER_POSITIONS[offset]");
assertNotContains("BottomNavUI no local shop tabs", bottomNav, "const tabs: Array<{ id: \"resource\" | \"item\" | \"cat\" | \"deco\"; label: string }>");
assertNotContains("BottomNavUI no local inventory tabs", bottomNav, "const tabs: Array<{ id: \"all\" | \"resource\" | \"shard\" | \"other\"; label: string }>");
assertNotContains("BottomNavUI no local shop preview catalog", bottomNav, "const catalogs: Record<string, Array<[string, string, string, string, string]>>");
assertNotContains("BottomNavUI no local inventory preview cards", bottomNav, "const previews: Array<[string, string, number]>");
assertNotContains("BottomNavUI no local task milestones", bottomNav, "const activeMilestones = [20, 40, 60, 80, 100]");
assertContains("quick verify includes contract", quickVerify, "check-feature-panel-presentation-contract.js");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "feature panel presentation config exports",
    "BottomNavUI feature panel presentation delegation",
    "quick verify registration",
  ],
}, null, 2));
