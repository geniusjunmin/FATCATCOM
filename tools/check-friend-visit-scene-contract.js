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
assertContains("friend factory sign", bottomNav, "friend-scene-sign");
assertContains("room prop thumbnails", bottomNav, "room-thumb");
assertContains("room scene resolver", bottomNav, "getFriendRoomScene");
assertContains("assigned cat mini portraits", bottomNav, "renderFriendRoomCats");
assertContains("visitor cat card", bottomNav, "friend-scene-mascot");
assertContains("reward status strip", bottomNav, "friend-scene-reward");
assertContains("visit report timeline data", bottomNav, "timeline:");
assertContains("visit report timeline render", bottomNav, "visit-report-timeline");
assertContains("panel presentation import", bottomNav, "from \"./PanelPresentation\"");
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
    "server/offline room reuse",
    "room thumbnail and assigned-cat visuals",
    "visitor mascot and reward strip",
    "visit report timeline feedback",
    "compact 360px scene guards",
    "utility screenshot assertions",
    "progress documentation handoff",
  ],
}, null, 2));
