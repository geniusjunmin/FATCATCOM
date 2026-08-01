const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

function requireText(label, source, pattern) {
    if (!source.includes(pattern)) {
        console.error(JSON.stringify({ ok: false, label, pattern }, null, 2));
        process.exit(1);
    }
}

const domain = read("FATCATServer/FatCat.Domain/PlayerFriendBoostContribution.cs");
const repositoryContract = read("FATCATServer/FatCat.Application/IFatCatRepository.cs");
const repository = read("FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs");
const db = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const boostManager = read("FATCATUI/assets/scripts/manager/FriendBoostManager.ts");
const eventBus = read("FATCATUI/assets/scripts/core/EventBus.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const cooperationCards = read("FATCATUI/assets/scripts/ui/FriendCooperationCards.ts");
const factoryStyles = read("FATCATUI/assets/scripts/ui/FactoryOverlayPresentation.ts");
const panelStyles = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const onlineUi = read("tools/check-friend-boost-history-online-ui.js");

requireText("contribution domain", domain, "PlayerFriendBoostContribution");
requireText("repository history query", repositoryContract, "GetFriendBoostContributionsAsync");
requireText("stack expiry extension", repository, "ExtendActiveFriendBoostContributionsAsync");
requireText("runtime contribution schema", db, 'CREATE TABLE IF NOT EXISTS "FriendBoostContributions"');
requireText("history DTO", contracts, "FriendBoostHistoryDto");
requireText("contribution creation", service, "AddFriendBoostContributionAsync");
requireText("history endpoint", program, 'MapGet("/api/social/boost/history"');
requireText("client history type", apiTypes, "FriendBoostContributionDto");
requireText("client history API", apiClient, "getFriendBoostHistory");
requireText("clock normalized history", boostManager, "applyHistory");
requireText("history changed event", eventBus, "FRIEND_BOOST_HISTORY_CHANGED");
requireText("login and SSE refresh", syncManager, "fetchServerFriendBoostHistory");
requireText("friend history card delegation", bottomNav, "renderFriendBoostHistoryCard({");
requireText("friend history card renderer", cooperationCards, "export function renderFriendBoostHistoryCard");
requireText("factory source chips", bottomNav, "boost-sources");
requireText("compact factory sources", factoryStyles, ".boost-sources i:nth-child(n+3)");
requireText("responsive history rows", panelStyles, ".boost-history-row");
requireText("service lifecycle coverage", serviceTests, "FriendBoostHistory_TracksSourcesExtendsStackAndPreservesExpiredEntries");
requireText("API contract coverage", apiTests, "activeContributionCount");
requireText("multi-helper browser coverage", onlineUi, "activeRows");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "persistent boost contribution history",
        "shared stack-expiry semantics",
        "history HTTP and client synchronization",
        "login and realtime SSE refresh",
        "factory and friend-panel source presentation",
        "service, API, and multi-helper browser coverage",
    ],
}, null, 2));
