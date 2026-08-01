const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const assertContains = (label, source, pattern) => {
    if (!source.includes(pattern)) {
        console.error(JSON.stringify({ ok: false, label, pattern }, null, 2));
        process.exit(1);
    }
};

const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const launchRecord = read("FATCATServer/FatCat.Domain/PlayerLaunchRecord.cs");
const db = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const manager = read("FATCATUI/assets/scripts/manager/FactoryAppearanceManager.ts");
const ui = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const online = read("tools/check-factory-appearance-online-ui.js");
const productionOnline = read("tools/check-factory-appearance-production-online.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("server bonus DTO", contracts, "FactoryAppearanceBonusDto");
assertContains("modifier source DTO", contracts, "ProductionModifierSourceDto");
assertContains("preview source contract", contracts, "IReadOnlyList<ProductionModifierSourceDto>? ModifierSources");
assertContains("launch appearance contract", contracts, "EquippedFactoryAppearanceId");
assertContains("launch appearance persistence", launchRecord, "EquippedFactoryAppearanceKey");
assertContains("launch source persistence", launchRecord, "ModifierSourcesJson");
assertContains("runtime appearance migration", db, 'ALTER TABLE "LaunchRecords" ADD COLUMN "EquippedFactoryAppearanceKey"');
assertContains("runtime source migration", db, 'ALTER TABLE "LaunchRecords" ADD COLUMN "ModifierSourcesJson"');
assertContains("equipped appearance lookup", service, "GetEquippedFactoryAppearanceDefinitionAsync");
assertContains("authoritative coin multiplier", service, "appearanceCoinMultiplier");
assertContains("authoritative wage multiplier", service, "appearanceWageMultiplier");
assertContains("authoritative bean reduction", service, "appearance.BeanCostReducePercent");
assertContains("launch modifier snapshot", service, "ModifierSourcesJson = JsonSerializer.Serialize");
assertContains("client bonus DTO", apiTypes, "FactoryAppearanceBonusDto");
assertContains("client modifier DTO", apiTypes, "ProductionModifierSourceDto");
assertContains("deep bonus snapshot", manager, "bonuses: item.bonuses.map");
assertContains("server bonus rendering", ui, 'data-production-effective=');
assertContains("launch source feedback", ui, "serverLaunch.modifierSources");
assertContains("service settlement coverage", serviceTests, "FactoryAppearanceBonus_AffectsPreviewAndPersistsLaunchModifierSnapshot");
assertContains("API future source coverage", apiTests, "futureSource");
assertContains("online effective bonus coverage", online, "effectiveBonuses");
assertContains("online launch source coverage", productionOnline, "简版工厂");
assertContains("quick verify registration", quickVerify, "check-factory-appearance-production-contract.js");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "server-owned appearance bonus catalog",
        "authoritative gross, wage, and bean production modifiers",
        "preview modifier-source evidence",
        "idempotent launch appearance/source snapshots",
        "client bonus rendering and settlement feedback",
        "service, API, migration, online, and quick verification coverage",
    ],
}, null, 2));
