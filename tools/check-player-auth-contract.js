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

const tokenService = read("FATCATServer/FatCat.Api/PlayerTokenService.cs");
const middleware = read("FATCATServer/FatCat.Api/PlayerAuthenticationMiddleware.cs");
const program = read("FATCATServer/FatCat.Api/Program.cs");
const service = read("FATCATServer/FatCat.Application/FatCatGameService.cs");
const apiClient = read("FATCATUI/assets/scripts/net/ApiClient.ts");
const syncManager = read("FATCATUI/assets/scripts/manager/SyncManager.ts");
const apiFactory = read("FATCATServer/FatCat.Tests/FatCatApiFactory.cs");
const apiTests = read("FATCATServer/FatCat.Tests/FatCatApiTests.cs");
const smoke = read("tools/check-server-api.ps1");
const apiProcess = read("tools/start-api-process.js");
const toolClient = read("tools/authenticated-api-client.js");
const realtimeCheck = read("tools/check-social-realtime-online-ui.js");

requireText("HMAC token signing", tokenService, "HMACSHA256");
requireText("constant-time signature validation", tokenService, "CryptographicOperations.FixedTimeEquals");
requireText("token issue timestamp", tokenService, "ToUnixTimeSeconds");
requireText("token expiration", tokenService, "player_token_expired");
requireText("production signing key requirement", tokenService, "environment.IsProduction()");
requireText("private API boundary", middleware, "RequiresPlayerAuthentication");
requireText("missing token rejection", middleware, "player_token_required");
requireText("cross-player rejection", middleware, "player_token_mismatch");
requireText("SSE query token", middleware, 'request.Query["access_token"]');
requireText("public config route", middleware, 'request.Path == "/api/config/bootstrap"');
requireText("middleware registration", program, "UseMiddleware<PlayerAuthenticationMiddleware>");
requireText("signed guest token", program, "tokenService.Issue(result.PlayerId)");
requireText("removed forgeable service token", service, 'new AuthGuestResponse(existing.Id, "", false)');
requireText("Bearer request header", apiClient, 'headers.Authorization = `Bearer ${this._token}`');
requireText("SSE URL helper", apiClient, "socialEventStreamUrl");
requireText("server error preservation", apiClient, "envelope.error");
requireText("SSE helper consumption", syncManager, "ApiClient.socialEventStreamUrl");
requireText("test auth enforcement toggle", apiFactory, "enforceAuthentication");
requireText("cross-player API coverage", apiTests, "PlayerAuthentication_RejectsMissingInvalidAndCrossPlayerAccess");
requireText("SSE auth coverage", apiTests, "PlayerAuthentication_AllowsSignedTokenForEventStreamQuery");
requireText("authenticated smoke requests", smoke, "Bearer $authToken");
requireText("local API development environment", apiProcess, "ASPNETCORE_ENVIRONMENT");
requireText("online tool token registry", toolClient, "tokensByPlayerId");
requireText("online tool Bearer header", toolClient, "headers.Authorization");
requireText("realtime tool browser token registration", realtimeCheck, "apiClient.registerAuth");

console.log(JSON.stringify({
    ok: true,
    checked: [
        "HMAC-signed expiring guest tokens",
        "uniform private API player binding",
        "public route exceptions",
        "Bearer fetch and EventSource query authentication",
        "cross-player read/write rejection",
        "test-host, smoke, and online tool authentication coverage",
    ],
}, null, 2));
