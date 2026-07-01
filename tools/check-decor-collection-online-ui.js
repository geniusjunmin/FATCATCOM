const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&decorcollection=${Date.now()}`;
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

(async () => {
    const api = startApiProcess(apiUrl, { captureOutput: true });
    const apiLogs = [];
    api.stdout?.on("data", (chunk) => apiLogs.push(chunk.toString()));
    api.stderr?.on("data", (chunk) => apiLogs.push(chunk.toString()));
    let browser;
    try {
        await waitForApi();
        browser = await chromium.launch({ executablePath: edgePath });
        const page = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
        const messages = [];
        const failedRequests = [];
        let playerId = "";
        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", (response) => {
            if (response.url().includes("/api/decor/collection?playerId=")) {
                playerId = new URL(response.url()).searchParams.get("playerId") || playerId;
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
        await page.waitForTimeout(2200);
        await page.click("#fatcat-dom-panel-overlay .panel-close");
        await page.click('#fatcat-dom-nav [data-panel="shop"]');
        await page.waitForTimeout(700);
        await page.click('#fatcat-dom-panel-overlay [data-action="shopTab"][data-tab="deco"]');
        await page.waitForTimeout(900);

        const initial = await page.evaluate(() => ({
            text: document.querySelector(".decor-collection")?.textContent || "",
            tiers: document.querySelectorAll(".decor-collection-tier").length,
            claimButtons: document.querySelectorAll('[data-action="claimDecorCollection"]').length,
        }));
        await page.click('[data-action="buyDecor"][data-id="decor_shop_neon_paw"]');
        await page.waitForTimeout(900);
        const unlocked = await page.evaluate(() => ({
            text: document.querySelector(".decor-collection")?.textContent || "",
            claimable: document.querySelectorAll(".decor-collection-tier.claimable").length,
            buttonVisible: !!document.querySelector('[data-action="claimDecorCollection"][data-id="collector_1"]'),
        }));
        await page.click('[data-action="claimDecorCollection"][data-id="collector_1"]');
        await page.waitForTimeout(900);
        const claimed = await page.evaluate(() => ({
            text: document.querySelector(".decor-collection")?.textContent || "",
            claimed: document.querySelectorAll(".decor-collection-tier.claimed").length,
            message: document.querySelector("#fatcat-dom-panel-overlay .message")?.textContent || "",
            buttonGone: !document.querySelector('[data-action="claimDecorCollection"][data-id="collector_1"]'),
        }));
        const server = await page.evaluate(async ({ apiBase, id }) => {
            const response = await fetch(`${apiBase}/api/decor/collection?playerId=${encodeURIComponent(id)}`);
            return response.json();
        }, { apiBase: apiUrl, id: playerId });

        const apiErrors = apiLogs.filter((line) => line.includes("fail:") || line.includes("Exception")).slice(-8);
        const ok = initial.text.includes("0/6")
            && initial.tiers === 3
            && initial.claimButtons === 0
            && unlocked.text.includes("1/6")
            && unlocked.claimable === 1
            && unlocked.buttonVisible
            && claimed.text.includes("已领取")
            && claimed.claimed === 1
            && claimed.message.includes("金币 +10K")
            && claimed.buttonGone
            && server?.data?.ownedCount === 1
            && server?.data?.ownedScore === 58
            && server?.data?.tiers?.[0]?.claimed === true
            && playerId.length > 0
            && messages.length === 0
            && failedRequests.length === 0
            && apiErrors.length === 0;
        console.log(JSON.stringify({
            ok,
            initial,
            unlocked,
            claimed,
            server: server?.data,
            messages,
            failedRequests,
            apiErrors,
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
