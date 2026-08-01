const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");

function fail(message, details = undefined) {
    console.error(JSON.stringify({ ok: false, message, details }, null, 2));
    process.exit(1);
}

function assertContains(label, source, pattern) {
    if (!source.includes(pattern)) fail("Friend cooperation cards contract check failed.", { label, pattern });
}

function assertNotContains(label, source, pattern) {
    if (source.includes(pattern)) fail("Friend cooperation cards contract check failed.", { label, forbidden: pattern });
}

const cards = read("FATCATUI/assets/scripts/ui/FriendCooperationCards.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const regression = read("tools/capture-utility-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

for (const renderer of [
    "renderFriendCoopGoalCard",
    "renderFriendBoostHistoryCard",
    "renderFriendProfileMeta",
    "formatFriendCoopRewardLabel",
]) {
    assertContains(`${renderer} exported`, cards, `export function ${renderer}`);
    assertContains(`${renderer} delegated`, bottomNav, `${renderer}(`);
}

for (const marker of [
    'data-cooperation-card="daily-goal"',
    'data-cooperation-card="boost-history"',
    'data-coop-tier=',
    'data-profile-kind=',
]) {
    assertContains("stable cooperation/profile marker", cards, marker);
}

for (const action of ["claimFriendCoopGoal", "claimFriendCoopTier"]) {
    assertContains(`${action} action preserved`, cards, action);
}
assertContains("claim action attribute preserved", cards, "data-action=");

assertContains("dynamic text escaped", cards, "escapeHtml");
assertContains("dynamic attributes escaped", cards, "escapeAttribute");
assertContains("goal view-model adapter", bottomNav, "coopGoal.tiers.map");
assertContains("history view-model adapter", bottomNav, "boostHistory.entries.map");
assertContains("profile view-model adapter", bottomNav, "getFriendProfileMetaView");
assertContains("runtime cooperation marker", regression, "friendCooperationCards");
assertContains("runtime profile marker", regression, "friendProfileMarkers");
assertContains("quick verify registration", quickVerify, "check-friend-cooperation-cards-contract.js");
assertNotContains("goal renderer removed from controller", bottomNav, "private renderFriendCoopGoalCard");
assertNotContains("history renderer removed from controller", bottomNav, "private renderFriendBoostHistoryCard");
assertNotContains("profile renderer removed from controller", bottomNav, "private renderFriendProfileMeta");
assertNotContains("goal markup removed from controller", bottomNav, '<div class="coop-tier');
assertNotContains("history markup removed from controller", bottomNav, '<div class="boost-history-row');
assertNotContains("profile markup removed from controller", bottomNav, '<div class="friend-profile-meta');

console.log(JSON.stringify({
    ok: true,
    checked: [
        "three extracted cooperation/profile renderers",
        "cooperation actions and stable markers",
        "escaped server-provided text",
        "BottomNavUI view-model boundary",
        "four-size runtime coverage",
    ],
}, null, 2));
