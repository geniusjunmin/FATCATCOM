const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const serverBalancePath = path.join(root, "FATCATServer", "FatCat.Api", "balance.json");
const clientBuildingsPath = path.join(root, "FATCATUI", "assets", "resources", "configs", "buildings.json");
const clientEquipmentPath = path.join(root, "FATCATUI", "assets", "resources", "configs", "equipment.json");
const clientResearchPath = path.join(root, "FATCATUI", "assets", "resources", "configs", "research.json");
const clientCatsPath = path.join(root, "FATCATUI", "assets", "resources", "configs", "cats.json");
const clientSkillsPath = path.join(root, "FATCATUI", "assets", "resources", "configs", "skills.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fail(message, details = undefined) {
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

function assertEqual(label, actual, expected, failures) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push({ label, actual, expected });
  }
}

const server = readJson(serverBalancePath);
const clientBuildings = readJson(clientBuildingsPath);
const clientEquipment = readJson(clientEquipmentPath);
const clientResearch = readJson(clientResearchPath);
const clientCats = readJson(clientCatsPath);
const clientSkills = readJson(clientSkillsPath);
const failures = [];

const serverResearch = server.researchDefinitions ?? {};
for (const research of clientResearch) {
  const serverItem = serverResearch[research.id];
  if (!serverItem) {
    failures.push({ label: `research.${research.id}`, actual: "missing", expected: "present" });
    continue;
  }

  assertEqual(`research.${research.id}.researchId`, serverItem.researchId, research.id, failures);
  assertEqual(`research.${research.id}.cost`, serverItem.cost, research.cost, failures);
  assertEqual(`research.${research.id}.maxLevel`, serverItem.maxLevel, research.maxLevel, failures);
  assertEqual(`research.${research.id}.costGrowth`, serverItem.costGrowth, research.costGrowth, failures);
  assertEqual(`research.${research.id}.effectType`, serverItem.effectType, research.effectType, failures);
  assertEqual(`research.${research.id}.effectValue`, serverItem.effectValue, research.effectValue, failures);
  assertEqual(`research.${research.id}.effectStep`, serverItem.effectStep, research.effectStep, failures);
  assertEqual(`research.${research.id}.parentResearchId`, serverItem.parentResearchId ?? null, research.parentResearchId ?? null, failures);
  const clientParents = research.parentResearchIds ?? (research.parentResearchId ? [research.parentResearchId] : []);
  assertEqual(
    `research.${research.id}.parentResearchIds`,
    JSON.stringify(serverItem.parentResearchIds ?? []),
    JSON.stringify(clientParents),
    failures,
  );
}

for (const id of Object.keys(serverResearch)) {
  if (!clientResearch.some((item) => item.id === id)) {
    failures.push({ label: `research.${id}`, actual: "server-only", expected: "client entry" });
  }
}

const serverEquipment = server.equipmentDefinitions ?? {};
for (const equipment of clientEquipment) {
  const serverItem = serverEquipment[equipment.id];
  if (!serverItem) {
    failures.push({ label: `equipment.${equipment.id}`, actual: "missing", expected: "present" });
    continue;
  }

  assertEqual(`equipment.${equipment.id}.itemId`, serverItem.itemId, equipment.id, failures);
  assertEqual(`equipment.${equipment.id}.slot`, serverItem.slot, equipment.kind, failures);
  assertEqual(`equipment.${equipment.id}.maxLevel`, serverItem.maxLevel, equipment.levelMax, failures);
  assertEqual(`equipment.${equipment.id}.upgradeCost`, serverItem.upgradeCost, equipment.upgradeCost, failures);

  const clientEffects = (equipment.effects ?? []).map((effect) => ({
    type: effect.type,
    baseValue: effect.baseValue,
    perLevel: effect.perLevel ?? 0,
  }));
  const serverEffects = (serverItem.effects ?? []).map((effect) => ({
    type: effect.type,
    baseValue: effect.baseValue,
    perLevel: effect.perLevel ?? 0,
  }));
  assertEqual(`equipment.${equipment.id}.effects`, serverEffects, clientEffects, failures);
}

for (const id of Object.keys(serverEquipment)) {
  if (!clientEquipment.some((item) => item.id === id)) {
    failures.push({ label: `equipment.${id}`, actual: "server-only", expected: "client entry" });
  }
}

const clientDefaults = {};
for (const equipment of clientEquipment) {
  if (equipment.isDefault) {
    clientDefaults[equipment.kind] = equipment.id;
  }
}
assertEqual("defaultEquipment", server.defaultEquipment ?? {}, clientDefaults, failures);

const serverBuildings = server.buildingDefinitions ?? {};
for (const building of clientBuildings) {
  const serverItem = serverBuildings[building.id];
  if (!serverItem) {
    failures.push({ label: `building.${building.id}`, actual: "missing", expected: "present" });
    continue;
  }

  assertEqual(`building.${building.id}.buildingId`, serverItem.buildingId, building.id, failures);
  assertEqual(`building.${building.id}.floor`, serverItem.floor, building.floor, failures);
  assertEqual(`building.${building.id}.level`, serverItem.level, building.level, failures);
  assertEqual(`building.${building.id}.maxLevel`, serverItem.maxLevel, building.maxLevel, failures);
  assertEqual(`building.${building.id}.effectType`, serverItem.effectType, building.effectType, failures);
  assertEqual(`building.${building.id}.baseValue`, serverItem.baseValue, building.baseValue, failures);
  assertEqual(`building.${building.id}.valuePerLevel`, serverItem.valuePerLevel, building.valuePerLevel, failures);
  assertEqual(`building.${building.id}.costBase`, serverItem.costBase, building.costBase, failures);
}

for (const id of Object.keys(serverBuildings)) {
  if (!clientBuildings.some((item) => item.id === id)) {
    failures.push({ label: `building.${id}`, actual: "server-only", expected: "client entry" });
  }
}

const serverCats = server.catDefinitions ?? {};
for (const cat of clientCats) {
  const serverItem = serverCats[cat.id];
  if (!serverItem) {
    failures.push({ label: `cat.${cat.id}`, actual: "missing", expected: "present" });
    continue;
  }

  assertEqual(`cat.${cat.id}.catId`, serverItem.catId, cat.id, failures);
  assertEqual(`cat.${cat.id}.rarity`, serverItem.rarity, cat.rarity, failures);
  assertEqual(`cat.${cat.id}.role`, serverItem.role, cat.role, failures);
  assertEqual(`cat.${cat.id}.baseProduction`, serverItem.baseProduction, cat.baseProduction, failures);
  assertEqual(`cat.${cat.id}.baseBeanCost`, serverItem.baseBeanCost, cat.baseBeanCost, failures);
  assertEqual(`cat.${cat.id}.baseSalary`, serverItem.baseSalary, cat.baseSalary, failures);
  assertEqual(`cat.${cat.id}.baseWeight`, serverItem.baseWeight, cat.baseWeight, failures);
  assertEqual(`cat.${cat.id}.skillId`, serverItem.skillId, cat.skillId, failures);
}

for (const id of Object.keys(serverCats)) {
  if (!clientCats.some((item) => item.id === id)) {
    failures.push({ label: `cat.${id}`, actual: "server-only", expected: "client entry" });
  }
}

const serverSkills = server.skillDefinitions ?? {};
for (const skill of clientSkills) {
  const serverItem = serverSkills[skill.id];
  if (!serverItem) {
    failures.push({ label: `skill.${skill.id}`, actual: "missing", expected: "present" });
    continue;
  }

  assertEqual(`skill.${skill.id}.skillId`, serverItem.skillId, skill.id, failures);
  assertEqual(`skill.${skill.id}.type`, serverItem.type, skill.type, failures);
  assertEqual(`skill.${skill.id}.value`, serverItem.value, skill.value, failures);
}

for (const id of Object.keys(serverSkills)) {
  if (!clientSkills.some((item) => item.id === id)) {
    failures.push({ label: `skill.${id}`, actual: "server-only", expected: "client entry" });
  }
}

if (failures.length > 0) {
  fail("Balance config drift detected.", failures);
}

console.log(JSON.stringify({
  ok: true,
  buildingCount: clientBuildings.length,
  catCount: clientCats.length,
  skillCount: clientSkills.length,
  researchCount: clientResearch.length,
  equipmentCount: clientEquipment.length,
  defaults: clientDefaults,
}, null, 2));
