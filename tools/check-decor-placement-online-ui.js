const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&decorui=${Date.now()}`;
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
    const api = startApiProcess(apiUrl, { captureOutput: true });
    const apiLogs = [];
    api.stdout?.on("data", (chunk) => apiLogs.push(chunk.toString()));
    api.stderr?.on("data", (chunk) => apiLogs.push(chunk.toString()));
    let browser;
    try {
        await waitForApi();
        browser = await chromium.launch({ executablePath: edgePath });
        const page = await browser.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 1 });
        const messages = [];
        const failedRequests = [];
        const placementRequests = [];
        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", (response) => {
            if (response.url().includes("/api/decor/") && response.url().includes("/placement")) {
                placementRequests.push({ status: response.status(), url: response.url() });
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
        await page.click('#fatcat-dom-nav [data-panel="buildings"]');
        await page.waitForTimeout(900);

        const before = await page.evaluate(() => ({
            manager: !!document.querySelector("#fatcat-dom-panel-overlay .building-decor-manager"),
            items: document.querySelectorAll("#fatcat-dom-panel-overlay .building-decor-item").length,
            placed: document.querySelectorAll("#fatcat-dom-panel-overlay .building-decor-item.placed").length,
            firstId: document.querySelector("#fatcat-dom-panel-overlay .building-decor-item button")?.getAttribute("data-id") || "",
        }));
        if (!before.firstId) throw new Error("No decoration action was rendered.");
        await page.click(`#fatcat-dom-panel-overlay [data-action="toggleDecorPlacement"][data-id="${before.firstId}"]`);
        await page.waitForTimeout(700);
        const removed = await page.evaluate((decorId) => {
            const button = document.querySelector(`#fatcat-dom-panel-overlay [data-action="toggleDecorPlacement"][data-id="${decorId}"]`);
            const item = button?.closest(".building-decor-item");
            return {
                stored: !!item?.classList.contains("stored"),
                buttonText: button?.textContent?.trim() || "",
                message: document.querySelector("#fatcat-dom-panel-overlay .message")?.textContent || "",
            };
        }, before.firstId);
        await page.click(`#fatcat-dom-panel-overlay [data-action="toggleDecorPlacement"][data-id="${before.firstId}"]`);
        await page.waitForTimeout(700);
        const restored = await page.evaluate((decorId) => {
            const button = document.querySelector(`#fatcat-dom-panel-overlay [data-action="toggleDecorPlacement"][data-id="${decorId}"]`);
            return {
                placed: !!button?.closest(".building-decor-item")?.classList.contains("placed"),
                buttonText: button?.textContent?.trim() || "",
            };
        }, before.firstId);

        const ok = before.manager
            && before.items === 2
            && before.placed === 2
            && removed.stored
            && removed.buttonText === "摆放"
            && removed.message.includes("装饰仓库")
            && restored.placed
            && restored.buttonText === "撤下"
            && placementRequests.length === 2
            && placementRequests.every((request) => request.status === 200)
            && messages.length === 0
            && failedRequests.length === 0
            && apiLogs.every((line) => !line.includes("fail:") && !line.includes("Exception"));
        console.log(JSON.stringify({
            ok,
            before,
            removed,
            restored,
            placementRequests,
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
