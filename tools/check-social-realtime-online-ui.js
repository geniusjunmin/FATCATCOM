const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&socialstream=${Date.now()}`;
const saveKey = "fatcat_company_save_v1";

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
    const response = await fetch(`${apiUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return { response, json: await response.json() };
}

async function get(path) {
    const response = await fetch(`${apiUrl}${path}`);
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
        const actor = await post("/api/auth/guest", {
            deviceId: `stream-actor-${suffix}`,
            companyName: "Actor Roastery",
        });
        const actorId = actor.json.data?.playerId;
        browser = await chromium.launch({ executablePath: edgePath });
        const page = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 1 });
        const messages = [];
        const failedRequests = [];
        const streamResponses = [];
        let targetId = "";

        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", async (response) => {
            if (response.url().includes("/api/social/events")) {
                streamResponses.push({ status: response.status(), url: response.url() });
            }
            if (response.url().includes("/api/auth/guest") && response.ok()) {
                try {
                    const body = await response.json();
                    targetId = body.data?.playerId || targetId;
                } catch {}
            }
            if (response.status() >= 400) {
                failedRequests.push({ status: response.status(), url: response.url() });
            }
        });

        await page.goto(url, { waitUntil: "load", timeout: 15000 });
        await page.evaluate((key) => localStorage.removeItem(key), saveKey);
        await page.reload({ waitUntil: "load", timeout: 15000 });
        await page.waitForTimeout(3500);
        await page.click('button[title="settings"]');
        await page.waitForTimeout(400);
        await page.click('#fatcat-dom-panel-overlay [data-action="connectServer"]');
        for (let index = 0; index < 30 && (!targetId || streamResponses.length === 0); index += 1) {
            await page.waitForTimeout(150);
        }
        if (!targetId || streamResponses.length === 0) {
            throw new Error("Target login or social stream did not become ready.");
        }
        await page.waitForTimeout(1200);
        await page.click("#fatcat-dom-panel-overlay .panel-close");

        const targetKey = `player:${targetId.replace(/-/g, "")}`;
        const added = await post(`/api/friends/add?playerId=${encodeURIComponent(actorId)}`, {
            friendPlayerId: targetId,
        });
        const visit = await post(`/api/friends/${encodeURIComponent(targetKey)}/visit?playerId=${encodeURIComponent(actorId)}`, {});
        await page.waitForTimeout(700);
        const visitNotice = await page.evaluate(() => ({
            visible: !!document.querySelector("#fatcat-dom-factory .notice-card"),
            text: document.querySelector("#fatcat-dom-factory .notice-card")?.textContent || "",
        }));

        const gift = await post(`/api/friends/${encodeURIComponent(targetKey)}/gift?playerId=${encodeURIComponent(actorId)}`, {});
        await page.waitForTimeout(700);
        const giftNotice = await page.evaluate(() => ({
            visible: !!document.querySelector("#fatcat-dom-factory .notice-card"),
            text: document.querySelector("#fatcat-dom-factory .notice-card")?.textContent || "",
            contained: (() => {
                const card = document.querySelector("#fatcat-dom-factory .notice-card");
                if (!card) return false;
                const rect = card.getBoundingClientRect();
                return rect.left >= 0 && rect.top >= 0 && rect.right <= window.innerWidth && rect.bottom <= window.innerHeight;
            })(),
        }));
        const targetActivities = await get(`/api/friends/activity?playerId=${encodeURIComponent(targetId)}&limit=10`);
        const targetActivityTypes = (targetActivities.json.data ?? []).map((item) => item.activityType);

        const ok = actor.response.ok
            && added.response.ok
            && visit.response.ok
            && gift.response.ok
            && targetActivities.response.ok
            && streamResponses.some((item) => item.status === 200)
            && visitNotice.visible
            && visitNotice.text.includes("Actor Roastery")
            && visitNotice.text.includes("访问")
            && giftNotice.visible
            && giftNotice.contained
            && giftNotice.text.includes("Actor Roastery")
            && giftNotice.text.includes("礼物")
            && targetActivityTypes[0] === "friend_gift_received"
            && targetActivityTypes[1] === "friend_visited_by"
            && messages.length === 0
            && failedRequests.length === 0
            && apiLogs.every((line) => !line.includes("fail:") && !line.includes("Exception"));
        console.log(JSON.stringify({
            ok,
            actorId,
            targetId,
            streamResponses,
            visitNotice,
            giftNotice,
            targetActivityTypes,
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
