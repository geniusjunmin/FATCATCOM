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
  "getHudExperiencePercent",
  "escapeHudText",
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
assertContains("BottomNavUI reads authoritative player cache", bottomNav, "SyncManager.getServerPlayer()");
assertContains("BottomNavUI recognizes authenticated player authority", bottomNav, 'NetworkManager.getStatus().serverMode === "ready"');
assertContains("BottomNavUI falls back to local player save", bottomNav, "serverPlayer ?? SaveManager.data.player");
assertContains("BottomNavUI exposes player authority", bottomNav, 'data-player-authority=');
assertContains("BottomNavUI exposes player level", bottomNav, 'data-player-level=');
assertContains("BottomNavUI exposes player experience", bottomNav, 'data-player-exp=');
assertContains("BottomNavUI escapes company text", bottomNav, "escapeHudText(player.companyName)");
assertContains("BottomNavUI uses resource config", bottomNav, "HUD_RESOURCE_ITEMS.map");
assertContains("BottomNavUI uses typed HUD resource kind", bottomNav, "kind: HudResourceKind");
assertContains("BottomNavUI exposes resource kind marker", bottomNav, 'data-resource-kind="${kind}"');
assertContains("BottomNavUI marks main identity zone", bottomNav, 'data-main-zone="identity"');
assertContains("BottomNavUI marks main resource zone", bottomNav, 'data-main-zone="resources"');
assertContains("HUD styles target identity zone", presentation, '.player[data-main-zone="identity"]');
assertContains("HUD styles target resource zone", presentation, '.resources[data-main-zone="resources"]');
assertNotContains("BottomNavUI no inline HUD CSS", bottomNav, "#fatcat-dom-hud { position: fixed;");
assertNotContains("BottomNavUI no hard-coded HUD company", bottomNav, "<div class=\"company\">肥猫咖啡公司</div>");
assertNotContains("BottomNavUI no hard-coded HUD resource row", bottomNav, "this.renderHudResource(\"coin\", \"金币\"");
assertContains("quick verify includes contract", quickVerify, "check-hud-presentation-contract.js");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "HUD style and static config exports",
    "authoritative player progression rendering",
    "BottomNavUI HUD presentation delegation",
    "quick verify registration",
  ],
}, null, 2));
