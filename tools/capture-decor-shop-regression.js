const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const outDir = path.resolve("docs/verification/screenshots/2026-07-01-decor-shop");
const saveKey = "fatcat_company_save_v1";
const sizes = [
    [414, 896],
    [430, 932],
    [360, 800],
    [768, 1024],
];

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

(async () => {
    fs.mkdirSync(outDir, { recursive: true });
    const api = startApiProcess(apiUrl, { captureOutput: true });
    const apiLogs = [];
    api.stdout?.on("data", (chunk) => apiLogs.push(chunk.toString()));
    api.stderr?.on("data", (chunk) => apiLogs.push(chunk.toString()));
    let browser;
    const results = [];
    try {
        await waitForApi();
        browser = await chromium.launch({ executablePath: edgePath });
        for (const [width, height] of sizes) {
            const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
            const messages = [];
            const failedRequests = [];
            page.on("console", (message) => {
                if (message.type() === "error" || message.type() === "warning") {
                    messages.push({ type: message.type(), text: message.text() });
                }
            });
            page.on("response", (response) => {
                if (response.status() >= 400) {
                    failedRequests.push({ status: response.status(), url: response.url() });
                }
            });

            const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&decorfit=${width}x${height}-${Date.now()}`;
            await page.goto(url, { waitUntil: "load", timeout: 15000 });
            await page.evaluate((key) => localStorage.removeItem(key), saveKey);
            await page.reload({ waitUntil: "load", timeout: 15000 });
            await page.waitForTimeout(3000);
            await page.click('button[title="settings"]');
            await page.waitForTimeout(300);
            await page.click('#fatcat-dom-panel-overlay [data-action="connectServer"]');
            await page.waitForTimeout(1800);
            await page.click("#fatcat-dom-panel-overlay .panel-close");
            await page.click('#fatcat-dom-nav [data-panel="shop"]');
            await page.waitForTimeout(500);
            await page.click('#fatcat-dom-panel-overlay [data-action="shopTab"][data-tab="deco"]');
            await page.waitForTimeout(800);

            const state = await page.evaluate(() => {
                const overlay = document.querySelector("#fatcat-dom-panel-overlay");
                const shell = overlay?.querySelector(".shop-shell");
                const tabs = Array.from(overlay?.querySelectorAll(".tabs .tab") || []);
                const rows = Array.from(overlay?.querySelectorAll(".decor-catalog-row") || []);
                const summary = overlay?.querySelector(".decor-shop-summary");
                const collection = overlay?.querySelector(".decor-collection");
                const collectionTiers = Array.from(overlay?.querySelectorAll(".decor-collection-tier") || []);
                const viewport = { width: window.innerWidth, height: window.innerHeight };
                const contained = (element) => {
                    const rect = element.getBoundingClientRect();
                    return rect.left >= -1 && rect.right <= viewport.width + 1;
                };
                const textFits = (element) => element.scrollWidth <= element.clientWidth + 2;
                return {
                    rows: rows.length,
                    tabs: tabs.length,
                    summaryVisible: !!summary && summary.getBoundingClientRect().height > 0,
                    collectionVisible: !!collection && collection.getBoundingClientRect().height > 0,
                    collectionTiers: collectionTiers.length,
                    collectionContained: !!collection && contained(collection),
                    collectionTextFits: collectionTiers.every(textFits),
                    shellContained: !!shell && contained(shell),
                    rowsContained: rows.every(contained),
                    tabTextFits: tabs.every(textFits),
                    buyButtons: rows.filter((row) => !!row.querySelector('[data-action="buyDecor"]')).length,
                    firstRowHeight: rows[0]?.getBoundingClientRect().height || 0,
                    overlayHeight: overlay?.getBoundingClientRect().height || 0,
                };
            });
            const file = path.join(outDir, `decor-shop-${width}x${height}.png`);
            await page.screenshot({ path: file, fullPage: false });
            results.push({ size: `${width}x${height}`, file, state, messages, failedRequests });
            await page.close();
        }

        const apiErrors = apiLogs.filter((line) => line.includes("fail:") || line.includes("Exception")).slice(-8);
        const ok = results.every((result) =>
            result.state.rows === 6
            && result.state.tabs === 4
            && result.state.summaryVisible
            && result.state.collectionVisible
            && result.state.collectionTiers === 3
            && result.state.collectionContained
            && result.state.collectionTextFits
            && result.state.shellContained
            && result.state.rowsContained
            && result.state.tabTextFits
            && result.state.buyButtons === 6
            && result.state.firstRowHeight >= 70
            && result.messages.length === 0
            && result.failedRequests.length === 0)
            && apiErrors.length === 0;
        console.log(JSON.stringify({ ok, results, apiErrors }, null, 2));
        if (!ok) process.exitCode = 1;
    } finally {
        if (browser) await browser.close();
        api.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
