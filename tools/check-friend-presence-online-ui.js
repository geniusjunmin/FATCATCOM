const { chromium } = require("playwright-core");
const { createAuthenticatedApiClient } = require("./authenticated-api-client");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const previewUrl = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&presenceui=${Date.now()}`;
const saveKey = "fatcat_company_save_v1";
const apiClient = createAuthenticatedApiClient(apiUrl);

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForApi() {
    for (let index = 0; index < 60; index += 1) {
        try {
            const response = await fetch(`${apiUrl}/health`);
            if (response.ok) return;
        } catch {}
        await wait(500);
    }
    throw new Error("API did not become ready.");
}

async function post(path, body) {
    return apiClient.post(path, body);
}

(async () => {
    const api = startApiProcess(apiUrl, { captureOutput: true });
    const apiLogs = [];
    api.stdout?.on("data", (chunk) => apiLogs.push(chunk.toString()));
    api.stderr?.on("data", (chunk) => apiLogs.push(chunk.toString()));
    let browser;
    try {
        await waitForApi();
        const suffix = Date.now();
        const target = await post("/api/auth/guest", {
            deviceId: `presence-ui-target-${suffix}`,
            companyName: "Live Roastery",
        });
        const targetId = target.json.data?.playerId;
        browser = await chromium.launch({ executablePath: edgePath });
        const page = await browser.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 1 });
        const messages = [];
        const failedRequests = [];
        const presenceRequests = [];
        let browserPlayerId = "";

        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", async (response) => {
            if (response.url().includes("/api/social/presence")) {
                presenceRequests.push({ status: response.status(), url: response.url() });
            }
            if (response.url().includes("/api/auth/guest") && response.ok()) {
                try {
                    const body = await response.json();
                    browserPlayerId = body.data?.playerId || browserPlayerId;
                    apiClient.registerAuth(body.data);
                } catch {}
            }
            if (response.status() >= 400) {
                failedRequests.push({ status: response.status(), url: response.url() });
            }
        });

        await page.goto(previewUrl, { waitUntil: "load", timeout: 15000 });
        await page.evaluate((key) => localStorage.removeItem(key), saveKey);
        await page.reload({ waitUntil: "load", timeout: 15000 });
        await page.waitForTimeout(3500);
        await page.click('button[title="settings"]');
        await page.waitForTimeout(400);
        await page.click('#fatcat-dom-panel-overlay [data-action="connectServer"]');

        for (let index = 0; index < 20 && !browserPlayerId; index += 1) {
            await page.waitForTimeout(150);
        }
        if (!browserPlayerId) {
            throw new Error("Browser player id was not captured.");
        }

        await page.waitForTimeout(1800);
        const added = await post(`/api/friends/add?playerId=${encodeURIComponent(browserPlayerId)}`, {
            friendPlayerId: targetId,
        });
        await page.waitForTimeout(300);
        await page.click("#fatcat-dom-panel-overlay .panel-close");
        await page.click('button[title="friends"]');
        await page.waitForTimeout(1200);

        const state = await page.evaluate(() => ({
            onlineBadges: document.querySelectorAll("#fatcat-dom-panel-overlay .presence-state.online").length,
            realProfiles: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-profile-meta.real-player").length,
            text: document.querySelector("#fatcat-dom-panel-overlay .friends-shell")?.textContent || "",
        }));

        const ok = target.response.ok
            && added.response.ok
            && presenceRequests.some((request) => request.status === 200)
            && state.onlineBadges >= 1
            && state.realProfiles >= 1
            && state.text.includes("Live Roastery")
            && state.text.includes("在线")
            && messages.length === 0
            && failedRequests.length === 0;
        console.log(JSON.stringify({
            ok,
            browserPlayerId,
            targetId,
            presenceRequests,
            state: {
                onlineBadges: state.onlineBadges,
                realProfiles: state.realProfiles,
                hasTargetName: state.text.includes("Live Roastery"),
                hasOnlineLabel: state.text.includes("在线"),
            },
            messages,
            failedRequests,
            apiErrors: apiLogs.filter((line) => line.includes("fail:") || line.includes("Exception")).slice(-6),
        }, null, 2));
        if (!ok) process.exitCode = 1;
    } finally {
        if (browser) await browser.close();
        api.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
