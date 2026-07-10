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
const settingsAccountCard = read("FATCATUI/assets/scripts/ui/SettingsAccountCard.ts");
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
assertContains("settings panel imports account card", bottomNav, "./SettingsAccountCard");
assertContains("settings panel delegates account card", bottomNav, "renderSettingsAccountCard({");
assertContains("settings panel prioritizes account diagnostics", bottomNav, "renderServerStatusCard(serverStatus.status, serverStatus.checkedAt)}${accountCard}${rows}");
assertNotContains("account card markup stays extracted", bottomNav, "settings-account-card");

assertContains("account card exports renderer", settingsAccountCard, "export function renderSettingsAccountCard");
assertContains("account card exposes state marker", settingsAccountCard, "data-account-state");
assertContains("account card escapes dynamic text", settingsAccountCard, "function escapeHtml");
assertContains("account card connection action", settingsAccountCard, 'data-action="connectServer"');
assertContains("account card sync action", settingsAccountCard, 'data-action="syncSave"');
assertContains("account card settings action", settingsAccountCard, 'data-action="pushSettings"');
assertContains("account card preview action", settingsAccountCard, 'data-action="previewProduction"');
assertContains("account card status action", settingsAccountCard, 'data-action="refreshServerStatus"');

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
assertContains("panel CSS styles account card", panelPresentation, ".settings-account-card");
assertContains("panel CSS styles account grid", panelPresentation, ".settings-account-grid");
assertContains("panel CSS styles account actions", panelPresentation, ".settings-account-actions");
assertContains("compact CSS protects account actions", panelPresentation, ".compact .settings-account-actions");

assertContains("utility regression captures status card", utilityRegression, "settingsServerStatusCard");
assertContains("utility regression captures status refresh", utilityRegression, "settingsServerStatusRefresh");
assertContains("utility regression captures containment", utilityRegression, "settingsServerStatusContained");
assertContains("utility regression captures account card", utilityRegression, "settingsAccountCard");
assertContains("utility regression captures account grid", utilityRegression, "settingsAccountGrid");
assertContains("utility regression captures account actions", utilityRegression, "settingsAccountActions");
assertContains("utility regression guards readable account text", utilityRegression, "settingsAccountTextVisible");
assertContains("utility regression guards readable action text", utilityRegression, "settingsAccountButtonTextVisible");
assertContains("utility regression captures account containment", utilityRegression, "settingsAccountActionsContained");
assertContains("quick verify includes settings status contract", quickVerify, "check-settings-server-status-contract.js");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "SyncManager server-status cache and fetch",
    "settings panel automatic/manual refresh",
    "extracted settings status-card renderer",
    "extracted settings account-card renderer",
    "settings status card markup and data markers",
    "responsive status-card CSS",
    "utility regression coverage",
    "quick verify registration",
  ],
}, null, 2));
