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
    fail("Nav presentation contract check failed.", { label, pattern });
  }
}

function assertNotContains(label, source, pattern) {
  if (source.includes(pattern)) {
    fail("Nav presentation contract check failed.", { label, forbidden: pattern });
  }
}

const presentation = read("FATCATUI/assets/scripts/ui/NavPresentation.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("DOM nav styles exported", presentation, "DOM_NAV_STYLES");
assertContains("target nav proportions exported", presentation, "DOM_NAV_TARGET_STYLES");
assertContains("target nav height", presentation, "height:5.8%");
assertContains("compact target nav height", presentation, "height:6.1%");
for (const selector of [
  "#fatcat-dom-nav",
  ".nav-bar",
  ".nav-item.active",
  ".nav-icon.asset.ico-cats",
  "@media (max-width:390px)",
]) {
  assertContains(`nav styles include ${selector}`, presentation, selector);
}

assertNotContains("Nav styles do not include HUD CSS", presentation, "#fatcat-dom-hud");
assertNotContains("Nav styles do not include factory CSS", presentation, "#fatcat-dom-factory");
assertContains("BottomNavUI imports nav presentation", bottomNav, "from \"./NavPresentation\"");
assertContains("BottomNavUI applies layered nav styles", bottomNav, "style.textContent = DOM_NAV_STYLES + DOM_NAV_TARGET_STYLES;");
assertNotContains("BottomNavUI no inline nav CSS", bottomNav, "#fatcat-dom-nav { position: fixed;");
assertContains("BottomNavUI still renders shared nav items", bottomNav, "MAIN_DOM_NAV_ITEMS.map");
assertContains("quick verify includes contract", quickVerify, "check-nav-presentation-contract.js");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "DOM nav style export",
    "target nav proportion override",
    "BottomNavUI nav style delegation",
    "quick verify registration",
  ],
}, null, 2));
