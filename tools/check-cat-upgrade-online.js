const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&catupgradeonline=${Date.now()}`;

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
        const upgradeRequests = [];

        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", (response) => {
            if (response.url().includes("/api/auth/guest")) {
                authRequests.push({ status: response.status(), url: response.url() });
            }
            if (response.url().includes("/api/cats/") && response.url().includes("/upgrade")) {
                upgradeRequests.push({ status: response.status(), url: response.url() });
            }
            if (response.status() >= 400) {
                failedRequests.push({ status: response.status(), url: response.url() });
            }
        });

        await page.goto(url, { waitUntil: "load", timeout: 20000 });
        await page.evaluate(() => localStorage.removeItem("fatcat_company_save_v1"));
        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForTimeout(2500);
        await page.click('#fatcat-dom-nav [data-panel="cats"]');
        await page.waitForTimeout(600);

        const before = await page.evaluate(() => ({
            level: document.querySelector("#fatcat-dom-cat-overlay")?.textContent?.match(/Lv\.\d+\/30/)?.[0] || "",
        }));
        await page.locator('#fatcat-dom-cat-overlay [data-action="upgradeCat"][data-id="c_001"]').first().click();
        await page.waitForTimeout(2500);
        const after = await page.evaluate(() => ({
            level: document.querySelector("#fatcat-dom-cat-overlay")?.textContent?.match(/Lv\.\d+\/30/)?.[0] || "",
            message: document.querySelector("#fatcat-dom-cat-overlay .cat-msg")?.textContent || "",
        }));

        await browser.close();

        const ok = authRequests.some((item) => item.status === 200)
            && upgradeRequests.some((item) => item.status === 200 && item.url.includes("/api/cats/c_001/upgrade"))
            && before.level === "Lv.1/30"
            && after.level === "Lv.2/30"
            && after.message.includes("Upgrade synced")
            && failedRequests.length === 0
            && messages.length === 0;

        const result = { ok, before, after, authRequests, upgradeRequests, failedRequests, messages };
        console.log(JSON.stringify(result, null, 2));
        if (!ok) process.exit(1);
    } finally {
        api.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
