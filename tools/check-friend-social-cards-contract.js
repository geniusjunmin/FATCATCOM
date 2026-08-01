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
  if (!source.includes(pattern)) fail("Friend social cards contract check failed.", { label, pattern });
}

function assertNotContains(label, source, pattern) {
  if (source.includes(pattern)) fail("Friend social cards contract check failed.", { label, forbidden: pattern });
}

const socialCards = read("FATCATUI/assets/scripts/ui/FriendSocialCards.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const presentation = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const regression = read("tools/capture-utility-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

for (const renderer of [
  "renderFriendListCards",
  "renderFriendSearchCard",
  "renderFriendRequestCard",
  "renderFriendLeaderboardCard",
  "renderFriendActivityCard",
]) {
  assertContains(`${renderer} exported`, socialCards, `export function ${renderer}`);
  assertContains(`${renderer} delegated`, bottomNav, `${renderer}(`);
}

for (const marker of [
  'data-social-card="friend-list"',
  'data-social-card="friend-search"',
  'data-social-card="friend-requests"',
  'data-social-card="friend-leaderboard"',
  'data-social-card="friend-activity"',
]) {
  assertContains("social section marker", socialCards, marker);
}

for (const action of [
  "visitFriend",
  "sendFriendGift",
  "helpFriend",
  "searchFriendInline",
  "sendFriendRequestInline",
  "acceptFriendRequest",
  "rejectFriendRequest",
]) {
  assertContains(`${action} action preserved`, socialCards, `data-action="${action}"`);
}

assertContains("server text escaped", socialCards, "escapeHtml");
assertContains("attribute text escaped", socialCards, "escapeAttribute");
assertContains("shared social heading style", presentation, ".social-card-head");
assertContains("runtime five-card marker", regression, "friendSocialCards");
assertContains("runtime containment marker", regression, "friendSocialCardsContained");
assertContains("quick verify registration", quickVerify, "check-friend-social-cards-contract.js");
assertNotContains("friend list markup removed from main controller", bottomNav, '<div class="feature-card friend-card">');
assertNotContains("search input markup removed from main controller", bottomNav, '<input data-field="friendSearch"');
assertNotContains("request row markup removed from main controller", bottomNav, '<div class="request-row incoming">');
assertNotContains("leaderboard row markup removed from main controller", bottomNav, '<div class="leaderboard-row');
assertNotContains("activity row markup removed from main controller", bottomNav, '<div class="activity-row">');

console.log(JSON.stringify({
  ok: true,
  checked: [
    "five extracted friend social renderers",
    "friend action and section markers",
    "escaped server-provided text",
    "BottomNavUI delegation boundary",
    "presentation and four-size runtime coverage",
  ],
}, null, 2));
