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
    fail("HUD presentation contract check failed.", { label, pattern });
  }
}

function assertNotContains(label, source, pattern) {
  if (source.includes(pattern)) {
    fail("HUD presentation contract check failed.", { label, forbidden: pattern });
  }
}

const presentation = read("FATCATUI/assets/scripts/ui/HudPresentation.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const quickVerify = read("tools/quick-verify.ps1");

for (const name of [
  "HUD_COMPANY_NAME",
  "HUD_PLAYER_LEVEL",
  "HUD_EXP_TEXT",
  "HUD_EXP_PERCENT",
  "HUD_RESOURCE_ITEMS",
  "DOM_HUD_STYLES",
  "HudResourceKind",
]) {
  assertContains(`${name} exported`, presentation, name);
}

for (const label of ["金币", "咖啡豆", "猫粮", "钻石", "#fatcat-dom-hud", "compact.tall"]) {
  assertContains(`HUD presentation includes ${label}`, presentation, label);
}
for (const token of [
  "repeating-linear-gradient(92deg",
  "linear-gradient(#5a493b",
  "drop-shadow(0 3px 0",
  "linear-gradient(#f5aa33",
]) {
  assertContains(`HUD target material includes ${token}`, presentation, token);
}

assertContains("BottomNavUI imports HUD presentation", bottomNav, "from \"./HudPresentation\"");
assertContains("BottomNavUI applies HUD styles", bottomNav, "style.textContent = DOM_HUD_STYLES;");
assertContains("BottomNavUI uses company constant", bottomNav, "${HUD_COMPANY_NAME}");
assertContains("BottomNavUI uses resource config", bottomNav, "HUD_RESOURCE_ITEMS.map");
assertContains("BottomNavUI uses typed HUD resource kind", bottomNav, "kind: HudResourceKind");
assertContains("BottomNavUI exposes resource kind marker", bottomNav, 'data-resource-kind="${kind}"');
assertNotContains("BottomNavUI no inline HUD CSS", bottomNav, "#fatcat-dom-hud { position: fixed;");
assertNotContains("BottomNavUI no hard-coded HUD company", bottomNav, "<div class=\"company\">肥猫咖啡公司</div>");
assertNotContains("BottomNavUI no hard-coded HUD resource row", bottomNav, "this.renderHudResource(\"coin\", \"金币\"");
assertContains("quick verify includes contract", quickVerify, "check-hud-presentation-contract.js");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "HUD style and static config exports",
    "BottomNavUI HUD presentation delegation",
    "quick verify registration",
  ],
}, null, 2));
