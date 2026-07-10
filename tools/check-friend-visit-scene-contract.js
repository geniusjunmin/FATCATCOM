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
    fail("Friend visit-scene contract check failed.", { label, pattern });
  }
}

const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const friendFactoryCards = read("FATCATUI/assets/scripts/ui/FriendFactoryCards.ts");
const friendVisitReportCard = read("FATCATUI/assets/scripts/ui/FriendVisitReportCard.ts");
const panelPresentation = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const utilityRegression = read("tools/capture-utility-regression.js");
const nextTasks = read("docs/ai-progress/03_NEXT_TASKS.md");
const handoff = read("docs/ai-progress/04_HANDOFF.md");

assertContains("visit scene state", bottomNav, "_friendVisitSceneId");
assertContains("open visit scene action", bottomNav, "openFriendVisitScene");
assertContains("close visit scene action", bottomNav, "closeFriendVisitScene");
assertContains("visit opens scene", bottomNav, "this._friendVisitSceneId = id");
assertContains("scene render method", bottomNav, "renderFriendVisitScene");
assertContains("scene before report", bottomNav, "this.renderFriendVisitScene(friends)}${this.renderFriendVisitReport(friends)");
assertContains("server/offline room reuse", bottomNav, "this.getFriendRoomRows(friend)");
assertContains("dedicated friend factory backdrop", bottomNav, "GeneratedBackgroundAssets.friendFactoryVisit");
assertContains("room scene resolver", bottomNav, "getFriendRoomScene");
assertContains("friend factory cards import", bottomNav, "./FriendFactoryCards");
assertContains("snapshot card delegation", bottomNav, "renderFriendSnapshotCardMarkup({");
assertContains("factory detail delegation", bottomNav, "renderFriendFactoryDetailCard({");
assertContains("visit scene delegation", bottomNav, "renderFriendVisitSceneCard({");
assertContains("shared room view adapter", bottomNav, "getFriendFactoryRoomViews");
assertContains("visit report timeline data", bottomNav, "timeline:");
assertContains("visit report card import", bottomNav, "./FriendVisitReportCard");
assertContains("visit report card delegation", bottomNav, "renderFriendVisitReportCard({");
assertContains("visit report model income", bottomNav, "friendIncomeText");
assertContains("visit report model floors", bottomNav, "productionText");
assertContains("panel presentation import", bottomNav, "from \"./PanelPresentation\"");

assertContains("snapshot renderer export", friendFactoryCards, "export function renderFriendSnapshotCard");
assertContains("factory detail renderer export", friendFactoryCards, "export function renderFriendFactoryDetailCard");
assertContains("visit scene renderer export", friendFactoryCards, "export function renderFriendVisitSceneCard");
assertContains("friend factory sign", friendFactoryCards, "friend-scene-sign");
assertContains("room prop thumbnails", friendFactoryCards, "room-thumb");
assertContains("assigned cat mini portraits", friendFactoryCards, "room-cats");
assertContains("visitor cat card", friendFactoryCards, "friend-scene-mascot");
assertContains("reward status strip", friendFactoryCards, "friend-scene-reward");
assertContains("snapshot visit action", friendFactoryCards, "data-action=\"visitFriend\"");
assertContains("factory scene open action", friendFactoryCards, "data-action=\"openFriendVisitScene\"");
assertContains("scene help disabled guard", friendFactoryCards, "view.canHelp");
assertContains("decor tags renderer", friendFactoryCards, "function renderDecorTags");
assertContains("room cats renderer", friendFactoryCards, "function renderRoomCats");

assertContains("visit report card exports renderer", friendVisitReportCard, "export function renderFriendVisitReportCard");
assertContains("visit report timeline render", friendVisitReportCard, "visit-report-timeline");
assertContains("visit report action close", friendVisitReportCard, "closeFriendVisitReport");
assertContains("visit report action visit", friendVisitReportCard, "visitFriend");
assertContains("visit report action gift", friendVisitReportCard, "sendFriendGift");
assertContains("visit report action help", friendVisitReportCard, "helpFriend");
assertContains("visit report help disabled guard", friendVisitReportCard, "report.canHelp");
assertContains("compact scene guard", panelPresentation, "compact .friend-scene-stage");
assertContains("target roof pseudo style", panelPresentation, "friend-scene-sign:before");
assertContains("compact sign guard", panelPresentation, "compact .friend-scene-sign");
assertContains("floor meter pseudo style", panelPresentation, "friend-scene-floor b:after");
assertContains("primary action style", panelPresentation, "friend-scene-actions .tag:nth-child(2)");
assertContains("report timeline style", panelPresentation, "visit-report-timeline");
assertContains("compact report timeline style", panelPresentation, "compact .visit-report-timeline");
assertContains("compact meter guard", panelPresentation, "compact .friend-scene-floor b:after");
assertContains("compact action visibility", panelPresentation, "compact .friend-scene-actions .tag");

assertContains("utility scene assertion", utilityRegression, "friendVisitScene");
assertContains("utility report timeline assertion", utilityRegression, "friendVisitReportTimeline");
assertContains("utility report timeline badge assertion", utilityRegression, "friendVisitReportTimelineBadges");
assertContains("utility floor assertion", utilityRegression, "friendVisitSceneFloors");
assertContains("utility stat assertion", utilityRegression, "friendVisitSceneStats");
assertContains("utility action assertion", utilityRegression, "friendVisitSceneActions");
assertContains("utility primary action assertion", utilityRegression, "friendVisitScenePrimaryAction");
assertContains("utility thumb assertion", utilityRegression, "friendVisitSceneThumbs");
assertContains("utility meter assertion", utilityRegression, "friendVisitSceneFloorMeters");
assertContains("utility roof assertion", utilityRegression, "friendVisitSceneSignRoof");
assertContains("utility cat assertion", utilityRegression, "friendVisitSceneCats");
assertContains("utility mascot assertion", utilityRegression, "friendVisitSceneMascot");
assertContains("utility rewards assertion", utilityRegression, "friendVisitSceneRewards");
assertContains("utility backdrop assertion", utilityRegression, "friendVisitSceneBackdrop");
assertContains("utility sign assertion", utilityRegression, "friendVisitSceneSign");
assertContains("four-size utility regression", utilityRegression, "[414, 896]");

assertContains("plan records visit scene visuals", nextTasks, "visit-scene visual batch");
assertContains("handoff records visit scene selectors", handoff, ".friend-scene-reward");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "friend visit-scene state/actions",
    "friend visit-scene render order",
    "friend factory card extraction and delegation",
    "server/offline room reuse",
    "room thumbnail and assigned-cat visuals",
    "visitor mascot and reward strip",
    "visit report timeline feedback",
    "compact 360px scene guards",
    "utility screenshot assertions",
    "progress documentation handoff",
  ],
}, null, 2));
