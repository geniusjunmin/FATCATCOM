const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const serverBalancePath = path.join(root, "FATCATServer", "FatCat.Api", "balance.json");
const configRoot = path.join(root, "FATCATUI", "assets", "resources", "configs");
const checkOnly = process.argv.includes("--check");

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(configRoot, fileName), "utf8"));
}

function keyed(items, keySelector, valueSelector) {
  return Object.fromEntries(items.map((item) => [keySelector(item), valueSelector(item)]));
}

function buildBalance() {
  const research = readJson("research.json");
  const equipment = readJson("equipment.json");
  const buildings = readJson("buildings.json");
  const cats = readJson("cats.json");
  const skills = readJson("skills.json");

  return {
    researchDefinitions: keyed(research, (item) => item.id, (item) => ({
      researchId: item.id,
      cost: item.cost,
      effectType: item.effectType,
      effectValue: item.effectValue,
      parentResearchId: item.parentResearchId ?? null,
      parentResearchIds: item.parentResearchIds ?? (item.parentResearchId ? [item.parentResearchId] : []),
    })),
    equipmentDefinitions: keyed(equipment, (item) => item.id, (item) => ({
      itemId: item.id,
      slot: item.kind,
      maxLevel: item.levelMax,
      upgradeCost: item.upgradeCost,
      effects: (item.effects ?? []).map((effect) => ({
        type: effect.type,
        baseValue: effect.baseValue,
        perLevel: effect.perLevel ?? 0,
      })),
    })),
    defaultEquipment: Object.fromEntries(
      equipment
        .filter((item) => item.isDefault)
        .map((item) => [item.kind, item.id])
    ),
    buildingDefinitions: keyed(buildings, (item) => item.id, (item) => ({
      buildingId: item.id,
      floor: item.floor,
      level: item.level,
      maxLevel: item.maxLevel,
      effectType: item.effectType,
      baseValue: item.baseValue,
      valuePerLevel: item.valuePerLevel,
      costBase: item.costBase,
    })),
    catDefinitions: keyed(cats, (item) => item.id, (item) => ({
      catId: item.id,
      rarity: item.rarity,
      role: item.role,
      baseProduction: item.baseProduction,
      baseBeanCost: item.baseBeanCost,
      baseSalary: item.baseSalary,
      baseWeight: item.baseWeight,
      skillId: item.skillId,
    })),
    skillDefinitions: keyed(skills, (item) => item.id, (item) => ({
      skillId: item.id,
      type: item.type,
      value: item.value,
    })),
  };
}

const generated = `${JSON.stringify(buildBalance(), null, 2)}\n`;
const current = fs.existsSync(serverBalancePath) ? fs.readFileSync(serverBalancePath, "utf8") : "";

if (checkOnly) {
  const ok = current === generated;
  console.log(JSON.stringify({ ok, path: serverBalancePath }, null, 2));
  process.exit(ok ? 0 : 1);
}

fs.writeFileSync(serverBalancePath, generated, "utf8");
console.log(JSON.stringify({ ok: true, path: serverBalancePath }, null, 2));
