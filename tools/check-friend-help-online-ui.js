const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&friendhelp=${Date.now()}`;
const saveKey = "fatcat_company_save_v1";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    const response = await fetch(`${apiUrl}${path}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    return { response, json: await response.json() };
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
        const actor = await request("/api/auth/guest", "POST", {
            deviceId: `help-actor-${suffix}`,
            companyName: "Helper Roastery",
        });
        const actorId = actor.json.data?.playerId;
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
                    targetId = (await response.json()).data?.playerId || targetId;
                } catch {}
            }
            if (response.status() >= 400) {
                failedRequests.push({ status: response.status(), url: response.url() });
            }
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
        const added = await request(`/api/friends/add?playerId=${encodeURIComponent(actorId)}`, "POST", {
            friendPlayerId: targetId,
        });
        const before = await request(`/api/production/server-preview?playerId=${encodeURIComponent(targetId)}`);
        const helped = await request(
            `/api/friends/${encodeURIComponent(targetKey)}/help?playerId=${encodeURIComponent(actorId)}`,
            "POST",
            {},
        );
        await page.waitForTimeout(900);
        const after = await request(`/api/production/server-preview?playerId=${encodeURIComponent(targetId)}`);
        const boost = await request(`/api/social/boost?playerId=${encodeURIComponent(targetId)}`);
        const repeated = await request(
            `/api/friends/${encodeURIComponent(targetKey)}/help?playerId=${encodeURIComponent(actorId)}`,
            "POST",
            {},
        );
        const activities = await request(`/api/friends/activity?playerId=${encodeURIComponent(targetId)}&limit=5`);
        const boostBanner = await page.evaluate(() => {
            const banner = document.querySelector("#fatcat-dom-factory .friend-boost-banner");
            const notice = document.querySelector("#fatcat-dom-factory .notice-card");
            const rect = banner?.getBoundingClientRect();
            return {
                visible: !!banner,
                text: banner?.textContent || "",
                notice: notice?.textContent || "",
                contained: !!rect && rect.left >= 0 && rect.top >= 0
                    && rect.right <= window.innerWidth && rect.bottom <= window.innerHeight,
            };
        });
        const productionRatio = after.json.data.grossCoinPerSecond / before.json.data.grossCoinPerSecond;
        const activityTypes = (activities.json.data ?? []).map((item) => item.activityType);
        const ok = actor.response.ok
            && added.response.ok
            && helped.response.ok
            && helped.json.data?.applied === true
            && repeated.json.data?.applied === false
            && repeated.json.data?.limitedReason === "daily_help_claimed"
            && boost.response.ok
            && boost.json.data?.active === true
            && boost.json.data?.boostPercent === 10
            && productionRatio > 1.099 && productionRatio < 1.101
            && boostBanner.visible
            && boostBanner.contained
            && boostBanner.text.includes("+10%")
            && boostBanner.text.includes("Helper Roastery")
            && boostBanner.notice.includes("Helper Roastery")
            && activityTypes[0] === "friend_help_received"
            && messages.length === 0
            && failedRequests.length === 0
            && apiLogs.every((line) => !line.includes("fail:") && !line.includes("Exception"));
        console.log(JSON.stringify({
            ok,
            actorId,
            targetId,
            productionRatio,
            boost: boost.json.data,
            repeated: repeated.json.data,
            boostBanner,
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
