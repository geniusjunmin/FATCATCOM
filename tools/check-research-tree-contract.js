const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function fail(message, details) {
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

function requireText(label, source, text) {
  if (!source.includes(text)) {
    fail("Research tree contract check failed.", { label, expected: text });
  }
}

const research = readJson("FATCATUI/assets/resources/configs/research.json");
const serverBalance = readJson("FATCATServer/FatCat.Api/balance.json");
const manager = read("FATCATUI/assets/scripts/manager/ResearchManager.ts");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const nativePanel = read("FATCATUI/assets/scripts/ui/panels/ResearchPanel.ts");
const presentation = read("FATCATUI/assets/scripts/ui/FeaturePanelPresentation.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const balanceConfig = read("FATCATServer/FatCat.Application/BalanceConfig.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const researchState = read("FATCATServer/FatCat.Domain/PlayerResearchState.cs");
const dbContext = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const apiSmoke = read("tools/check-server-api.ps1");
const researchOnline = read("tools/check-research-unlock-online.js");
const quickVerify = read("tools/quick-verify.ps1");

const expectedIds = [
  "res_basic_prod",
  "res_bean_save",
  "res_cheap_upgrade",
  "res_extract_2",
  "res_roast_2",
  "res_ferment_2",
  "res_espresso",
];
const actualIds = research.map((item) => item.id);
if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
  fail("Research catalog order or membership changed.", { expectedIds, actualIds });
}

const totalCost = research.reduce((sum, item) => sum + item.cost, 0);
if (totalCost !== 1925) {
  fail("Research tree total cost changed unexpectedly.", { expected: 1925, actual: totalCost });
}
if (research.some((item) => item.maxLevel !== 10 || item.costGrowth !== 1.35 || item.effectStep !== 1)) {
  fail("Research level progression values drifted.", {
    expected: { maxLevel: 10, costGrowth: 1.35, effectStep: 1 },
  });
}

const finalResearch = research.find((item) => item.id === "res_espresso");
const expectedFinalParents = ["res_extract_2", "res_roast_2", "res_ferment_2"];
if (!finalResearch || JSON.stringify(finalResearch.parentResearchIds) !== JSON.stringify(expectedFinalParents)) {
  fail("Final research must require all three third-tier branches.", {
    expected: expectedFinalParents,
    actual: finalResearch?.parentResearchIds,
  });
}

for (const item of research) {
  const serverItem = serverBalance.researchDefinitions?.[item.id];
  if (!serverItem) fail("Server balance is missing research.", { researchId: item.id });
  const expectedParents = item.parentResearchIds ?? (item.parentResearchId ? [item.parentResearchId] : []);
  if (JSON.stringify(serverItem.parentResearchIds ?? []) !== JSON.stringify(expectedParents)) {
    fail("Server research prerequisites drifted.", {
      researchId: item.id,
      expectedParents,
      actualParents: serverItem.parentResearchIds,
    });
  }
  requireText(`presentation ${item.id}`, presentation, `${item.id}:`);
}

requireText("client config supports multiple prerequisites", manager, "getParentResearchIds(config)");
requireText("client checks every prerequisite", manager, ".some(parentId => !this.isUnlocked(parentId))");
requireText("client computes next-level cost", manager, "getNextCost(config");
requireText("client computes level-scaled effect", manager, "getNextEffectValue(config");
requireText("client API carries prerequisite list", apiTypes, "parentResearchIds?: string[]");
requireText("client API carries research level", apiTypes, "previousLevel: number");
requireText("native panel uses server unlock", nativePanel, "SyncManager.unlockServerResearch(config.id)");
requireText("native panel preserves offline fallback", nativePanel, "ResearchManager.unlock(config.id)");
requireText("server definition carries prerequisite list", balanceConfig, "IReadOnlyList<string>? ParentResearchIds");
requireText("server definition computes level cost", balanceConfig, "GetNextCost(int currentLevel)");
requireText("server definition computes level effect", balanceConfig, "GetEffectValue(int level)");
requireText("domain persists research level", researchState, "public int Level");
requireText("SQLite adds research level", dbContext, 'ALTER TABLE "ResearchStates" ADD COLUMN "Level"');
requireText("SQLite migrates binary unlock", dbContext, 'WHERE "IsUnlocked" = 1 AND "Level" = 0');
requireText("server validates every prerequisite", balanceConfig, "foreach (var parentResearchId in pair.Value.GetParentResearchIds())");
requireText("server unlock checks every prerequisite", service, "foreach (var parentResearchId in definition.GetParentResearchIds())");
requireText("server serializes player research unlocks", service, "ResearchUnlockGates.GetOrAdd(playerId");
requireText("server API returns prerequisite list", contracts, "IReadOnlyList<string> ParentResearchIds");
requireText("DOM tree only renders real configs", bottomNav, "configs.map(config => this.renderResearchNode(config.id))");
requireText("DOM renders authoritative level", bottomNav, 'data-research-level="${level}"');
requireText("DOM renders research level progress", bottomNav, "--research-level-progress");
requireText("DOM renders research max state", bottomNav, 'data-research-maxed="${maxed}"');
if (bottomNav.includes("renderResearchPlaceholderNodes")) {
  fail("Presentation-only research placeholders must not return.");
}
requireText("service deep-chain coverage", serviceTests, "UnlockResearchAsync_RequiresEveryBranchBeforeFinalResearch");
requireText("service level progression coverage", serviceTests, "UpgradeResearchAsync_UsesGrowingCostAndScaledEconomyEffect");
requireText("service max level coverage", serviceTests, "UpgradeResearchAsync_StopsAtConfiguredMaxLevel");
requireText("SQLite migration coverage", serviceTests, "EnsureRuntimeSchemaAsync_MigratesUnlockedResearchToLevelOne");
requireText("API deep-chain coverage", apiTests, "ResearchUnlock_RequiresAllFinalBranchesThroughApi");
requireText("API concurrent unlock coverage", apiTests, "ResearchUnlock_ConcurrentRequestsChargeExactlyOnce");
requireText("API smoke expects seven research rows", apiSmoke, "$researchRows.Count -ne 7");
requireText("API smoke checks final prerequisites", apiSmoke, "Research snapshot final-node prerequisites mismatch.");
requireText("online upgrade checks level ring", researchOnline, 'after.levelProgress === "10%"');
requireText("online upgrade checks node art", researchOnline, 'after.art === "res_basic_prod"');
requireText("quick verify registration", quickVerify, "check-research-tree-contract.js");

console.log(JSON.stringify({
  ok: true,
  researchCount: research.length,
  totalCost,
  finalParents: expectedFinalParents,
  checked: [
    "client/server seven-node catalog",
    "multi-parent prerequisite metadata and enforcement",
    "persisted level migration and shared progression formulas",
    "authoritative DOM/native level rendering",
    "service and API deep-chain/level coverage",
  ],
}, null, 2));
