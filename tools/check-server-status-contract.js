const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

function requireText(label, source, pattern) {
    if (!source.includes(pattern)) {
        console.error(JSON.stringify({ ok: false, label, pattern }, null, 2));
        process.exit(1);
    }
}

const program = read("FATCATServer/FatCat.Api/Program.cs");
const middleware = read("FATCATServer/FatCat.Api/PlayerAuthenticationMiddleware.cs");
const apiTypes = read("FATCATUI/assets/scripts/net/ApiTypes.ts");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const smoke = read("tools/check-server-api.ps1");
const quickVerify = read("tools/quick-verify.ps1");

requireText("server status route", program, 'MapGet("/api/server/status"');
requireText("server status api version", program, "fatcat-api-2026-07-08");
requireText("server status config version", program, "fatcat-config-2026-06-13");
requireText("server token requirement flag", program, "requiresPlayerToken = true");
requireText("server status realtime", program, "server-sent-events");
for (const feature of [
    "signed-guest-auth",
    "real-friends",
    "friend-requests",
    "cooperative-goals",
    "leaderboard",
    "social-events",
]) {
    requireText(`server status feature ${feature}`, program, feature);
}

requireText("server status public auth exception", middleware, 'request.Path == "/api/server/status"');
requireText("client server status type", apiTypes, "export type ServerStatusDto");
requireText("client server status fetch", apiClient, "fetchServerStatus");
requireText("API test coverage", apiTests, "ServerStatus_ReturnsPublicMultiplayerReadiness");
requireText("smoke status call", smoke, "$ApiBaseUrl/api/server/status");
requireText("smoke feature assertion", smoke, "Server status missing multiplayer feature");
requireText("quick verify registration", quickVerify, "check-server-status-contract.js");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "public server status endpoint",
        "multiplayer capability metadata",
        "authentication public-route exception",
        "client API status helper",
        "API and smoke coverage",
    ],
}, null, 2));
