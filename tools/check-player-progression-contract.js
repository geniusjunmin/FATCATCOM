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

const rules = read("FATCATServer/FatCat.Domain/PlayerProgressionRules.cs");
const profile = read("FATCATServer/FatCat.Domain/PlayerProfile.cs");
const launchRecord = read("FATCATServer/FatCat.Domain/PlayerLaunchRecord.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const db = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const sync = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const eventBus = read("FATCATUI/assets/scripts/core/EventBus.ts");
const hud = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const topBar = read("FATCATUI/assets/scripts/ui/TopBarUI.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const domainTests = read("FATCATServer/FatCat.Tests/PlayerProgressionRulesTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const online = read("tools/check-player-progression-online.js");
const capture = read("tools/capture-main-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("domain level cap", rules, "public const int LevelCap = 60");
assertContains("domain launch experience rate", rules, "LaunchExperiencePerSecond = 25");
assertContains("domain experience curve", rules, "400 + normalizedLevel * 100");
assertContains("domain normalized carry", rules, "normalizedExperience -= threshold");
assertContains("target-aligned profile default", profile, "PlayerProgressionRules.InitialLevel");
assertContains("launch experience snapshot", launchRecord, "ExperienceGained");
assertContains("launch level snapshot", launchRecord, "PlayerLevelAfter");
assertContains("player progression DTO", contracts, "PlayerProgressionDto");
assertContains("launch progression contract", contracts, "PlayerProgression = null");
assertContains("player endpoint", program, 'app.MapGet("/api/player/me"');
assertContains("runtime player migration", db, 'ALTER TABLE "Players" ADD COLUMN "Exp"');
assertContains("runtime launch progression migration", db, 'ALTER TABLE "LaunchRecords" ADD COLUMN "ExperienceGained"');
assertContains("authoritative launch reward", service, "PlayerProgressionRules.GetLaunchExperience(productiveSeconds)");
assertContains("authoritative level application", service, "ApplyPlayerProgression(player, progression)");
assertContains("idempotent progression response", service, "record.PlayerLevelAfter > 0");
assertContains("bootstrap capability", service, '"player-progression"');
assertContains("client player DTO", apiTypes, "export type PlayerDto");
assertContains("client progression DTO", apiTypes, "export type PlayerProgressionDto");
assertContains("client player API", apiClient, "getPlayer(playerId: string)");
assertContains("login player fetch", sync, "await this.fetchServerPlayer()");
assertContains("launch progression apply", sync, "applyProgressionResponse(response.data.playerProgression)");
assertContains("progression event publication", sync, "GameEvents.PLAYER_PROGRESSION_CHANGED");
assertContains("progression event contract", eventBus, 'PLAYER_PROGRESSION_CHANGED: "player-progression:changed"');
assertContains("level unlock refresh", sync, "void this.fetchServerFactoryAppearanceState()");
assertContains("server HUD authority", hud, "SyncManager.getServerPlayer()");
assertContains("authenticated HUD authority", hud, 'NetworkManager.getStatus().serverMode === "ready"');
assertContains("HUD progression markers", hud, 'data-player-exp-to-next=');
assertContains("HUD progression event refresh", hud, "onPlayerProgressionChanged");
assertContains("launch experience feedback", hud, "serverLaunch.experienceGained");
assertContains("native top bar save refresh", topBar, "GameEvents.SAVE_UPDATED");
assertContains("domain rule coverage", domainTests, "AddExperience_WhenRewardCrossesThreshold_LevelsExactlyOnce");
assertContains("service idempotency coverage", serviceTests, "PersistsAndReplaysProgressionOnce");
assertContains("API progression coverage", apiTests, 'GetProperty("playerProgression")');
assertContains("four-size player marker coverage", capture, "playerExpToNext");
assertContains("online progression coverage", online, 'after.authority === "server"');
assertContains("quick verify registration", quickVerify, "check-player-progression-contract.js");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "deterministic server-owned experience curve",
        "target-aligned player defaults and old-SQLite migration",
        "idempotent launch experience and progression snapshots",
        "player endpoint, client cache, save mirror, and HUD authority",
        "appearance unlock refresh after level changes",
        "domain, service, API, online, and four-size coverage",
    ],
}, null, 2));
