const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const configRoot = path.join(root, "FATCATUI", "assets", "resources", "configs");

const supportedResearchEffects = new Set([
  "bean_reduce",
  "coin_production_add",
  "coin_production_mult",
  "upgrade_cost_reduce",
]);

const supportedEquipmentEffects = new Set([
  "catFoodCost",
  "materialOutput",
  "mood",
  "wageCost",
]);

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(configRoot, fileName), "utf8"));
}

function fail(message, details) {
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

const research = readJson("research.json");
const equipment = readJson("equipment.json");

const researchEffects = [...new Set(research.map((item) => item.effectType).filter(Boolean))].sort();
const equipmentEffects = [
  ...new Set(equipment.flatMap((item) => (item.effects ?? []).map((effect) => effect.type)).filter(Boolean)),
].sort();

const unsupportedResearch = researchEffects.filter((type) => !supportedResearchEffects.has(type));
const unsupportedEquipment = equipmentEffects.filter((type) => !supportedEquipmentEffects.has(type));

if (unsupportedResearch.length > 0 || unsupportedEquipment.length > 0) {
  fail("Client config contains effect types not covered by the server economy model.", {
    unsupportedResearch,
    unsupportedEquipment,
    supportedResearch: [...supportedResearchEffects].sort(),
    supportedEquipment: [...supportedEquipmentEffects].sort(),
  });
}

console.log(JSON.stringify({
  ok: true,
  researchEffects,
  equipmentEffects,
}, null, 2));
