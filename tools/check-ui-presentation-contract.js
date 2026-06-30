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
    fail("UI presentation contract check failed.", { label, pattern });
  }
}

function assertNotContains(label, source, pattern) {
  if (source.includes(pattern)) {
    fail("UI presentation contract check failed.", { label, forbidden: pattern });
  }
}

const presentation = read("FATCATUI/assets/scripts/ui/UiPresentation.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const quickVerify = read("tools/quick-verify.ps1");

const exportedNames = [
  "getFriendActivityLabel",
  "getNetworkModeLabel",
  "getSyncModeLabel",
  "getTaskTypeLabel",
  "getItemDisplayName",
  "getShopTabLabel",
  "getShopIcon",
  "getResourceIconClass",
  "getInventoryTabLabel",
  "getInventoryTabDesc",
  "getItemIconClass",
  "getResearchIconClass",
  "getResearchEffectLabel",
  "getCatTabTitle",
  "getWeightStageLabel",
  "getCatRoleLabel",
  "renderStars",
  "getSkillName",
  "getSkillDesc",
  "getCatBubble",
  "getCatStory",
];

for (const name of exportedNames) {
  assertContains(`${name} exported`, presentation, `export function ${name}`);
}

assertContains("BottomNavUI imports presentation", bottomNav, "from \"./UiPresentation\"");
assertContains("friend activity delegates", bottomNav, "return getFriendActivityLabelText(type);");
assertContains("network label delegates", bottomNav, "return getNetworkModeLabelText(mode);");
assertContains("sync label delegates", bottomNav, "return getSyncModeLabelText(mode);");
assertContains("task label delegates", bottomNav, "return getTaskTypeLabelText(type);");
assertContains("shop tab delegates", bottomNav, "return getShopTabLabelText(this._domShopTab);");
assertContains("inventory desc delegates", bottomNav, "return getInventoryTabDescription(this._domInventoryTab);");
assertContains("research label delegates", bottomNav, "return getResearchEffectLabelText(type);");
assertContains("cat story delegates", bottomNav, "return getCatStoryText(name, personality, breed, assignedName);");
assertContains("stars delegate", bottomNav, "return renderRarityStars(rarity);");
assertNotContains("BottomNavUI no skill-name map", bottomNav, "s_001:");
assertNotContains("BottomNavUI no item display map", bottomNav, "item_cat_food_pack:");
assertNotContains("BottomNavUI no local rarity star counter", bottomNav, "const count = rarity ===");
assertNotContains("BottomNavUI no direct cat story template", bottomNav, "${personality}");
assertContains("quick verify includes contract", quickVerify, "check-ui-presentation-contract.js");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "shared UI presentation text/icon helpers",
    "BottomNavUI presentation delegation",
    "removed local item/skill/star/story tables",
    "quick verify registration",
  ],
}, null, 2));
