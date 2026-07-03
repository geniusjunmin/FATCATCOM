const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");
const { createAuthenticatedApiClient } = require("./authenticated-api-client");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&coopgoal=${Date.now()}`;
const saveKey = "fatcat_company_save_v1";
const screenshotPath = path.resolve("docs/verification/screenshots/2026-07-01-coop-tiers/coop-tiers-claimed-360x800.png");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const apiClient = createAuthenticatedApiClient(apiUrl);

async function waitForApi() {
    for (let index = 0; index < 60; index += 1) {
        try {
            if ((await fetch(`${apiUrl}/health`)).ok) return;
        } catch {}
        await wait(500);
    }
    throw new Error("API did not become ready.");
}

async function request(path, method = "GET", body = undefined) {
    return apiClient.request(path, { method, body });
}

(async () => {
    const api = startApiProcess(apiUrl, { captureOutput: true });
    const apiLogs = [];
    api.stdout?.on("data", (chunk) => apiLogs.push(chunk.toString()));
    api.stderr?.on("data", (chunk) => apiLogs.push(chunk.toString()));
    let browser;
    try {
        await waitForApi();
        browser = await chromium.launch({ executablePath: edgePath });
        const page = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 1 });
        const messages = [];
        const failedRequests = [];
        let targetId = "";
        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", async (response) => {
            if (response.url().includes("/api/auth/guest") && response.ok()) {
                try {
                    const body = await response.json();
                    targetId = body.data?.playerId || targetId;
                    apiClient.registerAuth(body.data);
                } catch {}
            }
            if (response.status() >= 400) failedRequests.push({ status: response.status(), url: response.url() });
        });

        await page.goto(url, { waitUntil: "load", timeout: 15000 });
        await page.evaluate((key) => localStorage.removeItem(key), saveKey);
        await page.reload({ waitUntil: "load", timeout: 15000 });
        await page.waitForTimeout(3000);
        await page.click('button[title="settings"]');
        await page.click('#fatcat-dom-panel-overlay [data-action="connectServer"]');
        for (let index = 0; index < 30 && !targetId; index += 1) await page.waitForTimeout(150);
        if (!targetId) throw new Error("Target browser login did not complete.");
        await page.waitForTimeout(700);
        await page.click("#fatcat-dom-panel-overlay .panel-close");

        const targetKey = `player:${targetId.replace(/-/g, "")}`;
        const helperResults = [];
        for (let index = 0; index < 3; index += 1) {
            const helper = await request("/api/auth/guest", "POST", {
                deviceId: `coop-online-helper-${Date.now()}-${index}`,
                companyName: `Coop Helper ${index + 1}`,
            });
            const helperId = helper.json.data?.playerId;
            const added = await request(`/api/friends/add?playerId=${encodeURIComponent(helperId)}`, "POST", {
                friendPlayerId: targetId,
            });
            const helped = await request(
                `/api/friends/${encodeURIComponent(targetKey)}/help?playerId=${encodeURIComponent(helperId)}`,
                "POST",
                {},
            );
            helperResults.push({ helperOk: helper.response.ok, addedOk: added.response.ok, helped: helped.json.data });
            await page.waitForTimeout(450);
        }

        const factoryState = await page.evaluate(() => {
            const banner = document.querySelector("#fatcat-dom-factory .friend-boost-banner");
            const rect = banner?.getBoundingClientRect();
            return {
                text: banner?.textContent || "",
                contained: !!rect && rect.left >= 0 && rect.top >= 0
                    && rect.right <= window.innerWidth && rect.bottom <= window.innerHeight,
            };
        });
        await page.click('button[title="friends"]');
        await page.waitForTimeout(500);
        const readyCard = await page.evaluate(() => ({
            visible: !!document.querySelector("#fatcat-dom-panel-overlay .friend-coop-card.ready"),
            text: document.querySelector("#fatcat-dom-panel-overlay .friend-coop-card")?.textContent || "",
            hasClaim: !!document.querySelector('#fatcat-dom-panel-overlay [data-action="claimFriendCoopGoal"]'),
            tiers: document.querySelectorAll("#fatcat-dom-panel-overlay .coop-tier").length,
            claimButtons: document.querySelectorAll('#fatcat-dom-panel-overlay .coop-tier button:not([disabled])').length,
        }));
        await page.click('#fatcat-dom-panel-overlay [data-action="claimFriendCoopTier"][data-id="assist_1"]');
        await page.waitForTimeout(350);
        await page.click('#fatcat-dom-panel-overlay [data-action="claimFriendCoopTier"][data-id="assist_2"]');
        await page.waitForTimeout(350);
        await page.click('#fatcat-dom-panel-overlay [data-action="claimFriendCoopGoal"]');
        await page.waitForTimeout(500);
        const claimedCard = await page.evaluate(() => ({
            text: document.querySelector("#fatcat-dom-panel-overlay .friend-coop-card")?.textContent || "",
            hasClaim: !!document.querySelector('#fatcat-dom-panel-overlay [data-action="claimFriendCoopGoal"]'),
            claimedTiers: document.querySelectorAll("#fatcat-dom-panel-overlay .coop-tier.claimed").length,
            claimButtons: document.querySelectorAll('#fatcat-dom-panel-overlay .coop-tier button:not([disabled])').length,
        }));
        fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
        await page.screenshot({ path: screenshotPath, fullPage: false });
        const resources = await request(`/api/resources?playerId=${encodeURIComponent(targetId)}`);
        const repeated = await request(`/api/social/coop-goal/claim?playerId=${encodeURIComponent(targetId)}`, "POST", {});
        const repeatedFirst = await request(`/api/social/coop-goal/assist_1/claim?playerId=${encodeURIComponent(targetId)}`, "POST", {});
        const activities = await request(`/api/friends/activity?playerId=${encodeURIComponent(targetId)}&limit=5`);
        const activityTypes = (activities.json.data ?? []).map((item) => item.activityType);

        const ok = helperResults.length === 3
            && helperResults.every((item) => item.helperOk && item.addedOk && item.helped?.applied)
            && factoryState.contained
            && factoryState.text.includes("协作 3/3")
            && readyCard.visible
            && readyCard.hasClaim
            && readyCard.tiers === 3
            && readyCard.claimButtons === 3
            && readyCard.text.includes("3/3")
            && claimedCard.claimedTiers === 3
            && claimedCard.claimButtons === 0
            && !claimedCard.hasClaim
            && resources.json.data?.coin === 12455000
            && resources.json.data?.researchPoint === 220
            && resources.json.data?.diamond === 2610
            && repeated.json.data?.claimed === false
            && repeated.json.data?.limitedReason === "already_claimed"
            && repeatedFirst.json.data?.claimed === false
            && repeatedFirst.json.data?.limitedReason === "already_claimed"
            && activityTypes.filter((type) => type === "friend_help_received").length === 3
            && messages.length === 0
            && failedRequests.length === 0
            && apiLogs.every((line) => !line.includes("fail:") && !line.includes("Exception"));
        console.log(JSON.stringify({
            ok,
            targetId,
            helperResults,
            factoryState,
            readyCard,
            claimedCard,
            resources: resources.json.data,
            repeated: repeated.json.data,
            repeatedFirst: repeatedFirst.json.data,
            screenshotPath,
            activityTypes,
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
