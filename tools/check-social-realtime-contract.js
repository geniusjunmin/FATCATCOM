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

const broker = read("FATCATServer/FatCat.Application/SocialEventBroker.cs");
const contracts = read("FATCATServer/FatCat.Application/Contracts.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const eventBus = read("FATCATUI/assets/scripts/core/EventBus.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const uiPresentation = read("FATCATUI/assets/scripts/ui/UiPresentation.ts");
const serviceTests = read("FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const onlineUi = read("tools/check-social-realtime-online-ui.js");

requireText("fan-out event broker", broker, "ConcurrentDictionary<Guid, ConcurrentDictionary");
requireText("subscriber channel", broker, "Channel<SocialRealtimeEventDto>");
requireText("realtime event DTO", contracts, "SocialRealtimeEventDto");
requireText("visit event publish", service, "\"friend_visit\"");
requireText("gift event publish", service, "\"friend_gift\"");
requireText("incoming visit history", service, "\"friend_visited_by\"");
requireText("incoming gift history", service, "\"friend_gift_received\"");
requireText("real friend target guard", service, "TryGetRealFriendPlayerId");
requireText("singleton broker registration", program, "AddSingleton<SocialEventBroker>");
requireText("SSE route", program, "MapGet(\"/api/social/events\"");
requireText("SSE content type", program, "\"text/event-stream\"");
requireText("SSE keepalive", program, ": keepalive");
requireText("client event type", apiTypes, "SocialRealtimeEventDto");
requireText("client event bus", eventBus, "SOCIAL_REALTIME_EVENT");
requireText("client EventSource", syncManager, "new EventSource");
requireText("client stream cleanup", syncManager, "stopSocialEventStream");
requireText("factory realtime handler", bottomNav, "onSocialRealtimeEvent");
requireText("factory notice payload", bottomNav, "_latestSocialEvent.actorCompanyName");
requireText("incoming visit label", uiPresentation, "friend_visited_by");
requireText("incoming gift label", uiPresentation, "friend_gift_received");
requireText("service event coverage", serviceTests, "FriendActions_PublishRealtimeEventsToTargetPlayer");
requireText("API stream coverage", apiTests, "SocialEventStream_PushesFriendVisitContract");
requireText("dual-player online coverage", onlineUi, "streamResponses");
requireText("visit notice online coverage", onlineUi, "visitNotice");
requireText("gift notice online coverage", onlineUi, "giftNotice");
requireText("incoming history online coverage", onlineUi, "targetActivityTypes");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "fan-out social event broker",
        "visit/gift target-player publication",
        "SSE route and keepalive",
        "client EventSource lifecycle",
        "factory realtime notification rendering",
        "service/API/dual-player online coverage",
    ],
}, null, 2));
