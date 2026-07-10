const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function requireText(label, source, pattern) {
    if (!source.includes(pattern)) {
        console.error(JSON.stringify({ ok: false, label, pattern }, null, 2));
        process.exit(1);
    }
}

const domain = read("FATCATServer/FatCat.Domain/PlayerDecorState.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const repository = read("FATCATServer/FatCat.Application/IFatCatRepository.cs");
const efRepository = read("FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs");
const dbContext = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const friendFactoryCards = read("FATCATUI/assets/scripts/ui/FriendFactoryCards.ts");
const panelStyles = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const onlineCheck = read("tools/check-real-friend-online.js");
const utilityRegression = read("tools/capture-utility-regression.js");
const featureRegression = read("tools/capture-feature-regression.js");
const onlineUiCheck = read("tools/check-decor-placement-online-ui.js");

requireText("decor domain state", domain, "PlayerDecorState");
requireText("decor placement state", domain, "IsPlaced");
requireText("friend decor DTO", contracts, "FriendDecorDto");
requireText("owner decor DTO", contracts, "DecorStateDto");
requireText("decor placement request", contracts, "DecorPlacementRequest");
requireText("friend room decorations", contracts, "IReadOnlyList<FriendDecorDto> Decorations");
requireText("decor repository contract", repository, "GetDecorStatesAsync");
requireText("atomic decor seed contract", repository, "AddDecorIfMissingAsync");
requireText("atomic SQLite decor insert", efRepository, "INSERT OR IGNORE INTO \"DecorStates\"");
requireText("runtime decor table", dbContext, "CREATE TABLE IF NOT EXISTS \"DecorStates\"");
requireText("runtime decor unique index", dbContext, "IX_DecorStates_PlayerId_DecorKey");
requireText("default decor definitions", service, "DefaultDecorations");
requireText("default decor persistence", service, "EnsureDefaultDecorStatesAsync");
requireText("decor score from inventory", service, "decorations.Sum");
requireText("decor list service", service, "GetDecorationsAsync");
requireText("decor placement service", service, "UpdateDecorPlacementAsync");
requireText("decor list route", program, "MapGet(\"/api/decor\"");
requireText("decor placement route", program, "MapPost(\"/api/decor/{decorId}/placement\"");
requireText("client friend decor type", apiTypes, "FriendDecorDto");
requireText("client owner decor type", apiTypes, "DecorStateDto");
requireText("client decor API", apiClient, "updateDecorPlacement");
requireText("client decor sync", syncManager, "updateServerDecorPlacement");
requireText("client decoration mapping", bottomNav, "room.decorations ?? []");
requireText("client decoration view mapping", bottomNav, "decorations: room.decorations.map");
requireText("client decoration tags", friendFactoryCards, "function renderDecorTags");
requireText("building decor manager", bottomNav, "renderBuildingDecorManager");
requireText("building decor action", bottomNav, "toggleDecorPlacement");
requireText("decoration tag styles", panelStyles, ".room-decor-tags");
requireText("building decor styles", panelStyles, ".building-decor-manager");
requireText("service decor coverage", serviceTests, "dbContext.DecorStates.Count");
requireText("placed-state snapshot coverage", serviceTests, "hiddenDecor.IsPlaced = false");
requireText("API decor coverage", apiTests, "roomDecorations");
requireText("online decor coverage", onlineCheck, "realFriendDecorations");
requireText("responsive decor coverage", utilityRegression, "friendDecorItems");
requireText("building responsive decor coverage", featureRegression, "buildingDecorManager");
requireText("online decor UI action coverage", onlineUiCheck, "placementRequests");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "persistent player decoration domain/schema/repository",
        "atomic default decoration inventory",
        "friend room decoration DTO and score derivation",
        "client room decoration tags",
        "owner decor placement API and building manager UI",
        "service/API/online/responsive regression coverage",
    ],
}, null, 2));
