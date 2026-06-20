const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&equipmentonline=${Date.now()}`;
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

(async () => {
    const api = startApiProcess(apiUrl);

    try {
        await waitForApi();
        const browser = await chromium.launch({ executablePath: edgePath });
        const page = await browser.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 1 });
        const messages = [];
        const failedRequests = [];
        const authRequests = [];
        const equipmentRequests = [];

        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", (response) => {
            if (response.url().includes("/api/auth/guest")) {
                authRequests.push({ status: response.status(), url: response.url() });
            }
            if (response.url().includes("/api/cats/") && response.url().includes("/equipment/")) {
                equipmentRequests.push({ status: response.status(), url: response.url() });
            }
            if (response.status() >= 400) {
                failedRequests.push({ status: response.status(), url: response.url() });
            }
        });

        await page.goto(url, { waitUntil: "load", timeout: 20000 });
        await page.evaluate((key) => localStorage.removeItem(key), saveKey);
        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForTimeout(2500);
        await page.click('#fatcat-dom-nav [data-panel="cats"]');
        await page.waitForTimeout(600);
        await page.click('#fatcat-dom-cat-overlay [data-action="tab"][data-tab="equip"]');
        await page.waitForTimeout(400);

        const before = await page.evaluate((key) => {
            const save = JSON.parse(localStorage.getItem(key) || "{}");
            return {
                coin: save.resources?.coin,
                level: save.cats?.c_001?.equipmentLevels?.equip_collar_green || 1,
            };
        }, saveKey);

        await page.click('#fatcat-dom-cat-overlay [data-action="upgradeEquip"]');
        await page.waitForTimeout(2500);

        const after = await page.evaluate((key) => {
            const save = JSON.parse(localStorage.getItem(key) || "{}");
            return {
                coin: save.resources?.coin,
                level: save.cats?.c_001?.equipmentLevels?.equip_collar_green || 1,
                text: document.querySelector("#fatcat-dom-cat-overlay")?.textContent || "",
            };
        }, saveKey);

        await browser.close();

        const ok = authRequests.some((item) => item.status === 200)
            && equipmentRequests.some((item) => item.status === 200 && item.url.includes("/api/cats/c_001/equipment/equip_collar_green/upgrade"))
            && before.level === 1
            && after.coin < before.coin
            && after.level === 2
            && after.text.includes("Equipment synced")
            && failedRequests.length === 0
            && messages.length === 0;

        const result = { ok, before, after, authRequests, equipmentRequests, failedRequests, messages };
        console.log(JSON.stringify(result, null, 2));
        if (!ok) process.exit(1);
    } finally {
        api.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
