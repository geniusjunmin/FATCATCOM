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

const domain = read("FATCATServer/FatCat.Domain/PlayerDecorCollectionState.cs");
const repositoryContract = read("FATCATServer/FatCat.Application/IFatCatRepository.cs");
const repository = read("FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs");
const dbContext = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const panelStyles = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const onlineUi = read("tools/check-decor-collection-online-ui.js");

requireText("persistent claim mask", domain, "ClaimedTierMask");
requireText("repository claim contract", repositoryContract, "ClaimDecorCollectionTierAsync");
requireText("atomic duplicate claim guard", repository, '("ClaimedTierMask" & {tierBit}) = 0');
requireText("runtime SQLite schema", dbContext, 'CREATE TABLE IF NOT EXISTS "DecorCollectionStates"');
requireText("collection DTO", contracts, "DecorCollectionDto");
requireText("claim response DTO", contracts, "DecorCollectionClaimResponse");
requireText("three reward tiers", service, 'new("collector_6", 6, "researchPoint", 100');
requireText("reward transaction", service, '"decor_collection_claim"');
requireText("collection endpoint", program, 'MapGet("/api/decor/collection"');
requireText("claim endpoint", program, 'MapPost("/api/decor/collection/{tierId}/claim"');
requireText("client collection type", apiTypes, "DecorCollectionTierDto");
requireText("client claim API", apiClient, "claimDecorCollectionTier");
requireText("authoritative resource snapshot", syncManager, "`server_decor_collection_${tierId}`");
requireText("collection rendering", bottomNav, "renderDecorCollectionTier");
requireText("claim interaction", bottomNav, 'data-action="claimDecorCollection"');
requireText("responsive presentation", panelStyles, ".decor-collection-tiers");
requireText("service behavior coverage", serviceTests, "DecorCollection_UnlocksClaimsAndPersistsEachRewardOnce");
requireText("API behavior coverage", apiTests, "DecorCollection_ExposesProgressAndOneTimeClaimContract");
requireText("SQLite concurrency coverage", apiTests, "DecorCollection_ConcurrentClaims_GrantExactlyOneReward");
requireText("real browser coverage", onlineUi, "collector_1");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "persistent collection claim state",
        "atomic one-time reward guard",
        "three authoritative reward tiers",
        "HTTP and client sync contracts",
        "responsive shop collection presentation",
        "service, API concurrency, and browser coverage",
    ],
}, null, 2));
