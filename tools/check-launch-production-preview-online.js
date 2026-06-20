const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&launchpreview=1`;

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
        const launchRequests = [];

        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", (response) => {
            if (response.url().includes("/api/production/server-preview")) {
                previewRequests.push({ status: response.status(), url: response.url() });
            }
            if (response.url().includes("/api/launch")) {
                launchRequests.push({ status: response.status(), url: response.url() });
            }
            if (response.status() >= 400) {
                failedRequests.push({ status: response.status(), url: response.url() });
            }
        });

        await page.goto(url, { waitUntil: "load", timeout: 15000 });
        await page.waitForFunction(() => document.querySelector("button[title='launch']"), { timeout: 12000 });
        await page.waitForTimeout(500);
        await page.click("button[title='launch']");
        await page.waitForTimeout(3500);

        const state = await page.evaluate(() => {
            const text = document.querySelector("#fatcat-dom-factory .factory-msg")?.textContent || "";
            return {
                text,
                launched: text.includes("服务端发射完成"),
                hasServerPreview: text.includes("净收益"),
                hasLocalReward: text.includes("金币"),
            };
        });

        await browser.close();

        const ok = state.launched
            && state.hasServerPreview
            && state.hasLocalReward
            && previewRequests.some((item) => item.status === 200)
            && launchRequests.some((item) => item.status === 200)
            && messages.length === 0
            && failedRequests.length === 0;
        const result = { ok, state, previewRequests, launchRequests, messages, failedRequests };
        console.log(JSON.stringify(result, null, 2));
        if (!ok) process.exit(1);
    } finally {
        api.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
