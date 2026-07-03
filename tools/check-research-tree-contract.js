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
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const apiSmoke = read("tools/check-server-api.ps1");
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
requireText("client API carries prerequisite list", apiTypes, "parentResearchIds?: string[]");
requireText("native panel uses server unlock", nativePanel, "SyncManager.unlockServerResearch(config.id)");
requireText("native panel preserves offline fallback", nativePanel, "ResearchManager.unlock(config.id)");
requireText("server definition carries prerequisite list", balanceConfig, "IReadOnlyList<string>? ParentResearchIds");
requireText("server validates every prerequisite", balanceConfig, "foreach (var parentResearchId in pair.Value.GetParentResearchIds())");
requireText("server unlock checks every prerequisite", service, "foreach (var parentResearchId in definition.GetParentResearchIds())");
requireText("server serializes player research unlocks", service, "ResearchUnlockGates.GetOrAdd(playerId");
requireText("server API returns prerequisite list", contracts, "IReadOnlyList<string> ParentResearchIds");
requireText("DOM tree only renders real configs", bottomNav, "configs.map(config => this.renderResearchNode(config.id))");
if (bottomNav.includes("renderResearchPlaceholderNodes")) {
  fail("Presentation-only research placeholders must not return.");
}
requireText("service deep-chain coverage", serviceTests, "UnlockResearchAsync_RequiresEveryBranchBeforeFinalResearch");
requireText("API deep-chain coverage", apiTests, "ResearchUnlock_RequiresAllFinalBranchesThroughApi");
requireText("API concurrent unlock coverage", apiTests, "ResearchUnlock_ConcurrentRequestsChargeExactlyOnce");
requireText("API smoke expects seven research rows", apiSmoke, "$researchRows.Count -ne 7");
requireText("API smoke checks final prerequisites", apiSmoke, "Research snapshot final-node prerequisites mismatch.");
requireText("quick verify registration", quickVerify, "check-research-tree-contract.js");

console.log(JSON.stringify({
  ok: true,
  researchCount: research.length,
  totalCost,
  finalParents: expectedFinalParents,
  checked: [
    "client/server seven-node catalog",
    "multi-parent prerequisite metadata and enforcement",
    "real-node DOM rendering",
    "service and API deep-chain coverage",
  ],
}, null, 2));
