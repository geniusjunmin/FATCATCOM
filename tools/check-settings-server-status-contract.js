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

const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const panelPresentation = read("FATCATUI/assets/scripts/ui/PanelPresentation.ts");
const utilityRegression = read("tools/capture-utility-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("SyncManager imports status DTO", syncManager, "ServerStatusDto");
assertContains("SyncManager caches status", syncManager, "_serverStatus");
assertContains("SyncManager exposes status getter", syncManager, "getServerStatus()");
assertContains("SyncManager fetches public status", syncManager, "ApiClient.fetchServerStatus()");
assertContains("SyncManager records checked time", syncManager, "_serverStatusCheckedAt");

assertContains("settings panel imports status DTO", bottomNav, "ServerStatusDto");
assertContains("settings panel auto refreshes status", bottomNav, "refreshServerStatusForPanel");
assertContains("settings action refreshes status", bottomNav, 'action === "refreshServerStatus"');
assertContains("settings panel reads cached status", bottomNav, "SyncManager.getServerStatus()");
assertContains("settings panel renders status card", bottomNav, "renderServerStatusCard");
assertContains("settings card exposes status marker", bottomNav, "data-server-status");
assertContains("settings card exposes api version marker", bottomNav, "data-api-version");
assertContains("settings card exposes config version marker", bottomNav, "data-config-version");
assertContains("settings card renders realtime transport", bottomNav, "status.realtime.socialEvents");
assertContains("settings card renders multiplayer chips", bottomNav, "server-status-features");

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
    "settings status card markup and data markers",
    "responsive status-card CSS",
    "utility regression coverage",
    "quick verify registration",
  ],
}, null, 2));
