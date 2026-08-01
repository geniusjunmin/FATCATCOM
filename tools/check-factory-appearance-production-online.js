const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5148";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&appearanceproduction=${Date.now()}`;
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

(async () => {
    const api = startApiProcess(apiUrl);
    let browser;
    try {
        await waitForApi();
        browser = await chromium.launch({ executablePath: edgePath });
        const page = await browser.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 1 });
        const messages = [];
        const failedRequests = [];
        const productionRequests = [];
        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", (response) => {
            if (response.url().includes("/api/production/server-preview") || response.url().includes("/api/launch")) {
                productionRequests.push({ status: response.status(), method: response.request().method(), url: response.url() });
            }
            if (response.status() >= 400) failedRequests.push({ status: response.status(), url: response.url() });
        });

        await page.goto(url, { waitUntil: "load", timeout: 20000 });
        await page.evaluate(() => localStorage.removeItem("fatcat_company_save_v1"));
        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForTimeout(3200);
        await page.click('button[title="launch"]');
        await page.waitForFunction(() => document.querySelector("#fatcat-dom-factory .factory-msg")?.textContent?.includes("服务端发射完成"), null, { timeout: 15000 });
        const result = await page.evaluate(() => ({
            message: document.querySelector("#fatcat-dom-factory .factory-msg")?.textContent?.trim() ?? "",
            launchesUsed: document.querySelector('#fatcat-dom-factory [data-operation="launch"]')?.getAttribute("data-launches-used") ?? "",
            launchesRemaining: document.querySelector('#fatcat-dom-factory [data-operation="launch"]')?.getAttribute("data-launches-remaining") ?? "",
        }));
        const ok = result.message.includes("简版工厂")
            && result.message.includes("净收益")
            && result.launchesUsed === "1"
            && result.launchesRemaining === "4"
            && productionRequests.some(item => item.status === 200 && item.url.includes("/api/production/server-preview"))
            && productionRequests.some(item => item.status === 200 && item.url.includes("/api/launch"))
            && failedRequests.length === 0
            && messages.length === 0;
        console.log(JSON.stringify({ ok, result, productionRequests, failedRequests, messages }, null, 2));
        if (!ok) process.exitCode = 1;
    } finally {
        if (browser) await browser.close();
        api.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
