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
    fail("Client catalog metadata consumption contract failed.", { label, pattern });
  }
}

const catManager = read("FATCATUI/assets/scripts/manager/CatManager.ts");
const researchManager = read("FATCATUI/assets/scripts/manager/ResearchManager.ts");
const researchPanel = read("FATCATUI/assets/scripts/ui/panels/ResearchPanel.ts");

assertContains("cat overrides storage", catManager, "_serverCatalogOverrides");
assertContains("cat getAllConfigs overlay", catManager, "ConfigManager.cats.map(config => this.applyServerCatalogOverride(config))");
assertContains("cat snapshot metadata ingestion", catManager, "this.applyServerCatalogMetadata(serverCat)");
assertContains("cat production metadata field", catManager, "override.baseProduction");
assertContains("cat role metadata field", catManager, "override.role");

assertContains("research overrides storage", researchManager, "_serverCatalogOverrides");
assertContains("research getAllConfigs overlay", researchManager, "ConfigManager.research.map(config => this.applyServerCatalogOverride(config))");
assertContains("research snapshot metadata ingestion", researchManager, "this.applyServerCatalogMetadata(serverResearch)");
assertContains("research cost metadata field", researchManager, "override.cost");
assertContains("research max level metadata field", researchManager, "override.maxLevel");
assertContains("research cost growth metadata field", researchManager, "override.costGrowth");
assertContains("research effect metadata field", researchManager, "override.effectType");
assertContains("research effect step metadata field", researchManager, "override.effectStep");

assertContains("research panel uses manager config", researchPanel, "ResearchManager.getAllConfigs()");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "CatManager server catalog overrides",
    "ResearchManager server catalog overrides",
    "ResearchPanel manager-backed catalog usage",
  ],
}, null, 2));
