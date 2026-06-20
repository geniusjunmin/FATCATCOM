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
    fail("Friend invite contract check failed.", { label, pattern });
  }
}

const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const inviteDomain = read("FATCATServer/FatCat.Domain/PlayerInviteCode.cs");
const relationDomain = read("FATCATServer/FatCat.Domain/PlayerFriendRelation.cs");
const repository = read("FATCATServer/FatCat.Application/IFatCatRepository.cs");
const dbContext = read("FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs");
const efRepository = read("FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");

assertContains("social profile dto", contracts, "PlayerSocialProfileDto");
assertContains("friend search dto", contracts, "FriendSearchResultDto");
assertContains("add friend invite request", contracts, "string? InviteCode");
assertContains("invite domain", inviteDomain, "PlayerInviteCode");
assertContains("relation domain", relationDomain, "PlayerFriendRelation");
assertContains("repository invite lookup", repository, "GetInviteCodeByCodeAsync");
assertContains("repository relation lookup", repository, "GetFriendRelationAsync");
assertContains("db invite set", dbContext, "InviteCodes");
assertContains("db relation set", dbContext, "FriendRelations");
assertContains("ef invite lookup", efRepository, "GetInviteCodeByCodeAsync");
assertContains("ef relation add", efRepository, "AddFriendRelationAsync");
assertContains("service social profile", service, "GetSocialProfileAsync");
assertContains("service friend search", service, "SearchFriendAsync");
assertContains("invite code creation", service, "CreateInviteCodeCandidates");
assertContains("persistent invite", service, "EnsureInviteCodeAsync");
assertContains("friend relation", service, "EnsureFriendRelationAsync");
assertContains("legacy invite code parsing", service, "TryParseLegacyInviteCode");
assertContains("bootstrap feature", service, "friend-invite");
assertContains("profile route", program, "MapGet(\"/api/social/profile\"");
assertContains("search route", program, "MapGet(\"/api/friends/search\"");
assertContains("client social type", apiTypes, "PlayerSocialProfileDto");
assertContains("client search type", apiTypes, "FriendSearchResultDto");
assertContains("client invite request", apiTypes, "inviteCode?: string");
assertContains("client profile api", apiClient, "getSocialProfile");
assertContains("client search api", apiClient, "searchFriend");
assertContains("sync profile", syncManager, "fetchServerSocialProfile");
assertContains("sync search", syncManager, "searchServerFriend");
assertContains("friend panel search", bottomNav, "searchServerFriend");
assertContains("friend panel confirm", bottomNav, "window.confirm");
assertContains("service coverage", serviceTests, "SocialProfileAndFriendSearch_SupportInviteCodes");
assertContains("api coverage", apiTests, "SocialProfileAndFriendSearch_ReturnInviteCodeContract");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "server social profile and invite search",
    "persistent short invite code and relation tables",
    "invite-code add-friend compatibility",
    "client API/types/sync search integration",
    "friend panel search-confirm flow",
    "service and API coverage",
  ],
}, null, 2));
