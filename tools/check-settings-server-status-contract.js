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
    fail("Settings server-status contract check failed.", { label, pattern });
  }
}

function assertNotContains(label, source, pattern) {
  if (source.includes(pattern)) {
    fail("Settings server-status contract check failed.", { label, pattern });
  }
}

const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const settingsStatusCard = read("FATCATUI/assets/scripts/ui/SettingsStatusCard.ts");
const panelPresentation = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const utilityRegression = read("tools/capture-utility-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("SyncManager imports status DTO", syncManager, "ServerStatusDto");
assertContains("SyncManager caches status", syncManager, "_serverStatus");
assertContains("SyncManager exposes status getter", syncManager, "getServerStatus()");
assertContains("SyncManager fetches public status", syncManager, "ApiClient.fetchServerStatus()");
assertContains("SyncManager records checked time", syncManager, "_serverStatusCheckedAt");

assertContains("settings panel auto refreshes status", bottomNav, "refreshServerStatusForPanel");
assertContains("settings action refreshes status", bottomNav, 'action === "refreshServerStatus"');
assertContains("settings panel reads cached status", bottomNav, "SyncManager.getServerStatus()");
assertContains("settings panel renders status card", bottomNav, "renderServerStatusCard");
assertContains("settings panel imports extracted status card", bottomNav, "./SettingsStatusCard");
assertNotContains("settings card renderer stays extracted", bottomNav, "private renderServerStatusCard");

assertContains("settings status card imports status DTO", settingsStatusCard, "ServerStatusDto");
assertContains("settings status card exports renderer", settingsStatusCard, "export function renderServerStatusCard");
assertContains("settings card exposes status marker", settingsStatusCard, "data-server-status");
assertContains("settings card exposes api version marker", settingsStatusCard, "data-api-version");
assertContains("settings card exposes config version marker", settingsStatusCard, "data-config-version");
assertContains("settings card renders realtime transport", settingsStatusCard, "status.realtime.socialEvents");
assertContains("settings card renders multiplayer chips", settingsStatusCard, "server-status-features");
assertContains("settings card renders refresh action", settingsStatusCard, 'data-action="refreshServerStatus"');

assertContains("panel CSS styles status card", panelPresentation, ".server-status-card");
assertContains("panel CSS styles status grid", panelPresentation, ".server-status-grid");
assertContains("panel CSS styles status features", panelPresentation, ".server-status-features");
assertContains("compact CSS protects status grid", panelPresentation, ".compact .settings-shell .server-status-grid");

assertContains("utility regression captures status card", utilityRegression, "settingsServerStatusCard");
assertContains("utility regression captures status refresh", utilityRegression, "settingsServerStatusRefresh");
assertContains("utility regression captures containment", utilityRegression, "settingsServerStatusContained");
assertContains("quick verify includes settings status contract", quickVerify, "check-settings-server-status-contract.js");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "SyncManager server-status cache and fetch",
    "settings panel automatic/manual refresh",
    "extracted settings status-card renderer",
    "settings status card markup and data markers",
    "responsive status-card CSS",
    "utility regression coverage",
    "quick verify registration",
  ],
}, null, 2));
