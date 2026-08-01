const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5146";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&appearanceonline=${Date.now()}`;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

async function openAppearance(page) {
    await page.click('#fatcat-dom-nav [data-panel="buildings"]');
    await page.waitForTimeout(500);
    await page.click('#fatcat-dom-panel-overlay [data-action="openFactoryAppearance"]');
    await page.waitForTimeout(600);
}

(async () => {
    const api = startApiProcess(apiUrl);
    let browser;
    try {
        await waitForApi();
        browser = await chromium.launch({ executablePath: edgePath });
        const page = await browser.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 1 });
        const messages = [];
        const failedRequests = [];
        const appearanceRequests = [];
        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", (response) => {
            if (response.url().includes("/api/factory/appearances")) {
                appearanceRequests.push({ status: response.status(), method: response.request().method(), url: response.url() });
            }
            if (response.status() >= 400) failedRequests.push({ status: response.status(), url: response.url() });
        });

        await page.goto(url, { waitUntil: "load", timeout: 20000 });
        await page.evaluate(() => localStorage.removeItem("fatcat_company_save_v1"));
        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForTimeout(3000);
        await openAppearance(page);
        await page.click('.factory-appearance-card[data-appearance-id="classic"]');
        await page.waitForTimeout(150);
        const initial = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll(".factory-appearance-card"));
            const classic = document.querySelector('.factory-appearance-card[data-appearance-id="classic"]');
            const apply = document.querySelector(".factory-appearance-apply");
            const stage = document.querySelector(".factory-appearance-stage");
            return {
                cardCount: cards.length,
                activeCount: cards.filter(card => card.classList.contains("active")).length,
                lockedCount: cards.filter(card => card.classList.contains("locked")).length,
                active: stage?.getAttribute("data-active-appearance") ?? "",
                selected: stage?.getAttribute("data-selected-appearance") ?? "",
                classicLabel: classic?.querySelector("small")?.textContent?.trim() ?? "",
                applyDisabled: apply?.hasAttribute("disabled") ?? false,
                applyText: apply?.textContent?.trim() ?? "",
                effectiveBonuses: document.querySelectorAll('.factory-appearance-bonus-grid [data-production-effective="true"]').length,
                configuredApi: localStorage.getItem("fatcat_api_base_url") ?? "",
            };
        });

        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForTimeout(3000);
        await openAppearance(page);
        const reloaded = await page.evaluate(() => ({
            active: document.querySelector(".factory-appearance-stage")?.getAttribute("data-active-appearance") ?? "",
            simpleActive: document.querySelector('.factory-appearance-card[data-appearance-id="simple"]')?.classList.contains("active") ?? false,
            effectiveBonuses: document.querySelectorAll('.factory-appearance-bonus-grid [data-production-effective="true"]').length,
        }));

        const ok = initial.cardCount === 4
            && initial.activeCount === 1
            && initial.lockedCount === 3
            && initial.active === "simple"
            && initial.selected === "classic"
            && initial.classicLabel.includes("30")
            && initial.applyDisabled
            && initial.applyText.includes("30")
            && initial.effectiveBonuses === 1
            && reloaded.active === "simple"
            && reloaded.simpleActive
            && reloaded.effectiveBonuses === 3
            && appearanceRequests.filter(item => item.status === 200 && item.method === "GET").length >= 2
            && failedRequests.length === 0
            && messages.length === 0;
        console.log(JSON.stringify({ ok, initial, reloaded, appearanceRequests, failedRequests, messages }, null, 2));
        if (!ok) process.exitCode = 1;
    } finally {
        if (browser) await browser.close();
        api.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
