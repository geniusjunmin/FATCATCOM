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
    fail("Factory presentation contract check failed.", { label, pattern });
  }
}

function assertNotContains(label, source, pattern) {
  if (source.includes(pattern)) {
    fail("Factory presentation contract check failed.", { label, forbidden: pattern });
  }
}

const presentation = read("FATCATUI/assets/scripts/ui/FactoryPresentation.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const quickVerify = read("tools/quick-verify.ps1");

for (const name of [
  "MAIN_FACTORY_FLOORS",
  "BUILDING_SCENE_BY_ID",
  "BUILDING_DISPLAY_NAME_BY_ID",
  "renderFactoryProps",
  "renderFactoryRoomDecor",
  "renderFactoryWallDetails",
  "renderFactoryWorkerCats",
  "getFloorBonusIconClass",
]) {
  assertContains(`${name} exported`, presentation, name);
}

for (const buildingId of [
  "building_office_5f",
  "building_roast_4f",
  "building_ferment_3f",
  "building_material_2f",
  "building_cafe_1f",
  "building_storage_b1",
]) {
  assertContains(`factory config includes ${buildingId}`, presentation, buildingId);
}

assertContains("BottomNavUI imports factory presentation", bottomNav, "from \"./FactoryPresentation\"");
assertContains("BottomNavUI uses factory floors", bottomNav, "MAIN_FACTORY_FLOORS.map");
assertContains("BottomNavUI uses building scene helper", bottomNav, "getBuildingScene(selected.id)");
assertContains("BottomNavUI props delegate", bottomNav, "return renderFactoryPropsMarkup(scene);");
assertContains("BottomNavUI room decor delegate", bottomNav, "return renderFactoryRoomDecorMarkup(scene);");
assertContains("BottomNavUI wall details delegate", bottomNav, "return renderFactoryWallDetailsMarkup(scene);");
assertContains("BottomNavUI worker cats delegate", bottomNav, "return renderFactoryWorkerCatsMarkup(scene);");
assertContains("BottomNavUI bonus icon delegate", bottomNav, "return getFactoryFloorBonusIconClass(scene);");
assertContains("BottomNavUI building name delegate", bottomNav, "return getFactoryBuildingDisplayName(id);");
assertNotContains("BottomNavUI no local factory floor array", bottomNav, "const floors = [");
assertNotContains("BottomNavUI no local scene map", bottomNav, "const sceneMap:");
assertNotContains("BottomNavUI no local building display map", bottomNav, "building_storage_b1: \"");
assertContains("quick verify includes contract", quickVerify, "check-factory-presentation-contract.js");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "shared factory floor presentation config",
    "shared factory room decoration helpers",
    "BottomNavUI factory presentation delegation",
    "quick verify registration",
  ],
}, null, 2));
