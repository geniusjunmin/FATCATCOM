const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&previewonline=${Date.now()}`;
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
        const previewRequests = [];

        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", async (response) => {
            if (response.url().includes("/api/production/server-preview")) {
                previewRequests.push({ status: response.status(), url: response.url() });
            }
            if (response.status() >= 400) {
                let body = "";
                try {
                    body = (await response.text()).slice(0, 600);
                } catch {}
                failedRequests.push({ status: response.status(), url: response.url(), body });
            }
        });

        await page.goto(url, { waitUntil: "load", timeout: 15000 });
        await page.evaluate((key) => localStorage.removeItem(key), saveKey);
        await page.reload({ waitUntil: "load", timeout: 15000 });
        await page.waitForTimeout(3500);
        await page.click('button[title="settings"]');
        await page.waitForTimeout(700);
        await page.click('#fatcat-dom-panel-overlay [data-action="connectServer"]');
        await page.waitForTimeout(1000);
        await page.click('#fatcat-dom-panel-overlay [data-action="previewProduction"]');
        await page.waitForTimeout(1000);

        const state = await page.evaluate(() => {
            const text = document.querySelector("#fatcat-dom-panel-overlay")?.innerText || "";
            return {
                text,
                connected: text.includes("\u670d\u52a1\u7aef\u7ed3\u7b97\u9884\u89c8"),
                hasNet: text.includes("\u51c0\u6536\u76ca"),
                hasWage: text.includes("\u5de5\u8d44"),
            };
        });

        await browser.close();

        const ok = state.connected
            && state.hasNet
            && state.hasWage
            && previewRequests.some((item) => item.status === 200)
            && messages.length === 0
            && failedRequests.length === 0;
        const result = { ok, state, previewRequests, messages, failedRequests };
        console.log(JSON.stringify(result, null, 2));
        if (!ok) process.exit(1);
    } finally {
        api.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
