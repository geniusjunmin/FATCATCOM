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
    fail("Friend request contract check failed.", { label, pattern });
  }
}

const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const requestDomain = read("FATCATServer/FatCat.Domain/PlayerFriendRequest.cs");
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

assertContains("request domain", requestDomain, "PlayerFriendRequest");
assertContains("request DTO", contracts, "FriendRequestDto");
assertContains("create request DTO", contracts, "CreateFriendRequestRequest");
assertContains("repository get request", repository, "GetFriendRequestAsync");
assertContains("repository list requests", repository, "GetFriendRequestsAsync");
assertContains("db request set", dbContext, "FriendRequests");
assertContains("ef request list", efRepository, "GetFriendRequestsAsync");
assertContains("service create", service, "CreateFriendRequestAsync");
assertContains("service accept", service, "AcceptFriendRequestAsync");
assertContains("service reject", service, "RejectFriendRequestAsync");
assertContains("bidirectional relation", service, "EnsureFriendRelationAsync(target.Id, requester.Id");
assertContains("route create", program, "MapPost(\"/api/friends/requests\"");
assertContains("route list", program, "MapGet(\"/api/friends/requests\"");
assertContains("route accept", program, "accept\"");
assertContains("route reject", program, "reject\"");
assertContains("client request type", apiTypes, "FriendRequestDto");
assertContains("client request api", apiClient, "createFriendRequest");
assertContains("client accept api", apiClient, "acceptFriendRequest");
assertContains("sync request create", syncManager, "createServerFriendRequest");
assertContains("sync request list", syncManager, "fetchServerFriendRequests");
assertContains("sync request accept", syncManager, "acceptServerFriendRequest");
assertContains("friend panel request refresh", bottomNav, "refreshFriendRequestsForPanel");
assertContains("friend panel request card", bottomNav, "renderFriendRequestPreview");
assertContains("friend panel send action", bottomNav, "sendFriendRequest");
assertContains("friend panel accept action", bottomNav, "acceptFriendRequest");
assertContains("friend panel reject action", bottomNav, "rejectFriendRequest");
assertContains("service coverage accept", serviceTests, "FriendRequests_CanBeAcceptedIntoBidirectionalRelations");
assertContains("service coverage reject", serviceTests, "FriendRequests_CanBeRejected");
assertContains("api coverage", apiTests, "FriendRequests_AcceptIntoBidirectionalFriendContract");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "friend request domain/db/repository",
    "create/list/accept/reject API routes",
    "bidirectional relation and snapshot acceptance",
    "client API and sync methods",
    "friend panel request inbox/outbox UI hooks",
    "service and API coverage",
  ],
}, null, 2));
