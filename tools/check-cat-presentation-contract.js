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
    fail("Cat presentation contract check failed.", { label, pattern });
  }
}

function assertNotContains(label, source, pattern) {
  if (source.includes(pattern)) {
    fail("Cat presentation contract check failed.", { label, forbidden: pattern });
  }
}

const presentation = read("FATCATUI/assets/scripts/ui/CatPresentation.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const quickVerify = read("tools/quick-verify.ps1");

for (const name of [
  "CAT_SIDE_TABS",
  "CAT_SKIN_THEMES",
  "CAT_EQUIPMENT_SLOTS",
  "CAT_LOCKED_EQUIPMENT_SLOT",
  "CAT_DEFAULT_EQUIPMENT",
  "CAT_EQUIPMENT_EFFECT_LINES",
  "CatTabId",
  "CatEquipmentSlotName",
]) {
  assertContains(`${name} exported`, presentation, name);
}

for (const label of [
  "信息",
  "升级",
  "技能",
  "装备",
  "皮肤",
  "默认工作服",
  "烘焙围裙",
  "店长披肩",
  "节日礼服",
  "饰品槽",
]) {
  assertContains(`cat config includes ${label}`, presentation, label);
}

assertContains("BottomNavUI imports cat presentation", bottomNav, "from \"./CatPresentation\"");
assertContains("BottomNavUI uses side tab config", bottomNav, "CAT_SIDE_TABS.map");
assertContains("BottomNavUI uses skin themes", bottomNav, "CAT_SKIN_THEMES.map");
assertContains("BottomNavUI uses equipment effect lines", bottomNav, "CAT_EQUIPMENT_EFFECT_LINES");
assertContains("BottomNavUI uses equipment slots", bottomNav, "CAT_EQUIPMENT_SLOTS.map");
assertContains("BottomNavUI uses locked equipment slot", bottomNav, "CAT_LOCKED_EQUIPMENT_SLOT");
assertContains("BottomNavUI uses default equipment fallback", bottomNav, "?? CAT_DEFAULT_EQUIPMENT");
assertNotContains("BottomNavUI no local cat side tabs", bottomNav, "renderCatSideTab(\"info\", \"信息\")");
assertNotContains("BottomNavUI no local skin array", bottomNav, "const skins = [");
assertNotContains("BottomNavUI no local equipment slots", bottomNav, "const slots = [");
assertNotContains("BottomNavUI no local fallback object", bottomNav, "id: \"equip_collar_green\", slot: \"项圈\"");
assertContains("quick verify includes contract", quickVerify, "check-cat-presentation-contract.js");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "cat page static presentation config exports",
    "BottomNavUI cat presentation delegation",
    "quick verify registration",
  ],
}, null, 2));
