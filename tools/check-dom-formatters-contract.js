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
    fail("DOM formatter contract check failed.", { label, pattern });
  }
}

function assertNotContains(label, source, pattern) {
  if (source.includes(pattern)) {
    fail("DOM formatter contract check failed.", { label, forbidden: pattern });
  }
}

const formatters = read("FATCATUI/assets/scripts/ui/Formatters.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");

assertContains("display number formatter", formatters, "formatDisplayNumber");
assertContains("rate formatter", formatters, "formatRateValue");
assertContains("clock formatter", formatters, "formatClockTime");
assertContains("friend relative formatter", formatters, "formatFriendReportRelativeTime");
assertContains("compact number still exported", formatters, "formatCompactNumber");
assertContains("signed percent still exported", formatters, "formatSignedPercent");

assertContains("bottom nav imports formatters", bottomNav, "from \"./Formatters\"");
assertContains("bottom nav number wrapper", bottomNav, "return formatDisplayNumber(value);");
assertContains("bottom nav rate wrapper", bottomNav, "return formatRateValue(value);");
assertContains("bottom nav activity wrapper", bottomNav, "return formatClockTime(timestamp);");
assertContains("bottom nav friend time wrapper", bottomNav, "return formatFriendReportRelativeTime(timestamp);");
assertNotContains("bottom nav no direct million formatter", bottomNav, "value / 1000000");
assertNotContains("bottom nav no direct time locale formatter", bottomNav, "toLocaleTimeString([], { hour:");
assertNotContains("bottom nav no direct friend seconds math", bottomNav, "Date.now() - timestamp");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "shared DOM number/rate/time formatters",
    "BottomNavUI formatter delegation",
    "legacy compact/signed formatter exports preserved",
    "removed direct formatter implementation from BottomNavUI",
  ],
}, null, 2));
