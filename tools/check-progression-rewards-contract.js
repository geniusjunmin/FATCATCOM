const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");
const assertContains = (label, source, pattern) => {
    if (!source.includes(pattern)) {
        console.error(JSON.stringify({ ok: false, label, pattern }, null, 2));
        process.exit(1);
    }
};

const rules = read("FATCATServer/FatCat.Domain/PlayerProgressionRules.cs");
const profile = read("FATCATServer/FatCat.Domain/PlayerProfile.cs");
const achievementClaim = read("FATCATServer/FatCat.Domain/PlayerAchievementClaim.cs");
const transaction = read("FATCATServer/FatCat.Domain/PlayerResourceTransaction.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const repository = read("FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs");
const db = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const sync = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const eventBus = read("FATCATUI/assets/scripts/core/EventBus.ts");
const ui = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const domainTests = read("FATCATServer/FatCat.Tests/PlayerProgressionRulesTests.cs");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const online = read("tools/check-progression-rewards-online.js");
const capture = read("tools/capture-utility-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("fixed level reward rule", rules, "GetLevelUpReward");
assertContains("level reward resource constants", rules, "LevelRewardDiamond = 5");
assertContains("reward cursor", profile, "RewardedThroughLevel");
assertContains("achievement persistence", achievementClaim, "AchievementKey");
assertContains("experience ledger", transaction, "ExperienceDelta");
assertContains("level snapshot ledger", transaction, "PlayerLevelAfter");
assertContains("level reward DTO", contracts, "LevelUpRewardDto");
assertContains("achievement DTO", contracts, "AchievementDto");
assertContains("daily order experience", service, "DailyOrderRewardExperience = 400");
assertContains("achievement experience", service, "task_ach_1");
assertContains("shared progression gate", service, "PlayerProgressionGates");
assertContains("automatic level rewards", service, "ApplyExperienceSettlement");
assertContains("atomic achievement insert", repository, "ON CONFLICT (\"PlayerId\", \"AchievementKey\") DO NOTHING");
assertContains("reward cursor migration", db, "RewardedThroughLevel");
assertContains("achievement table migration", db, "CREATE TABLE IF NOT EXISTS \"AchievementClaims\"");
assertContains("transaction progression migration", db, 'ALTER TABLE "ResourceTransactions" ADD COLUMN "ExperienceDelta"');
assertContains("achievement list route", program, 'app.MapGet("/api/achievements"');
assertContains("achievement claim route", program, 'app.MapPost("/api/achievements/{achievementId}/claim"');
assertContains("client achievement DTO", apiTypes, "export type AchievementDto");
assertContains("client level reward DTO", apiTypes, "export type LevelUpRewardDto");
assertContains("client achievement API", apiClient, "claimAchievement(playerId: string, achievementId: string)");
assertContains("achievement cache", sync, "getServerAchievements()");
assertContains("achievement progression apply", sync, "applyProgressionResponse(response.data.playerProgression)");
assertContains("achievement refresh event", eventBus, "ACHIEVEMENTS_CHANGED");
assertContains("server achievement authority", ui, 'data-achievement-authority=');
assertContains("level-up feedback", ui, "levelUpReward");
assertContains("domain reward tests", domainTests, "GetLevelUpReward_WhenMultipleLevelsCrossed");
assertContains("service achievement tests", serviceTests, "Achievement_RequiresGoalAndClaimsExperienceAndLevelRewardOnce");
assertContains("API concurrency tests", apiTests, "Achievement_ConcurrentClaimsGrantExperienceAndLevelRewardExactlyOnce");
assertContains("online achievement authority", online, 'data-achievement-authority="server"');
assertContains("online level reward result", online, 'data-player-level="29"');
assertContains("four-size achievement authority", capture, "achievementAuthority");
assertContains("four-size achievement containment", capture, "achievementCardsContained");
assertContains("quick verify registration", quickVerify, "check-progression-rewards-contract.js");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "server-owned order and achievement experience",
        "automatic one-time level reward cursor",
        "experience and progression resource ledger snapshots",
        "persistent atomic achievement claims",
        "client achievement authority and level-up feedback",
        "domain, service, migration, API, and concurrency coverage",
    ],
}, null, 2));
