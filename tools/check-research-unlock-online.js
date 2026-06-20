const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&researchonline=${Date.now()}`;
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
        const researchRequests = [];

        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", (response) => {
            if (response.url().includes("/api/auth/guest")) {
                authRequests.push({ status: response.status(), url: response.url() });
            }
            if (response.url().includes("/api/research/")) {
                researchRequests.push({ status: response.status(), url: response.url() });
            }
            if (response.status() >= 400) {
                failedRequests.push({ status: response.status(), url: response.url() });
            }
        });

        await page.goto(url, { waitUntil: "load", timeout: 20000 });
        await page.evaluate((key) => localStorage.removeItem(key), saveKey);
        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForTimeout(2500);
        await page.click('#fatcat-dom-nav [data-panel="research"]');
        await page.waitForTimeout(800);

        const before = await page.evaluate((key) => {
            const save = JSON.parse(localStorage.getItem(key) || "{}");
            return {
                unlocked: !!save.research?.res_basic_prod?.isUnlocked,
                researchPoint: save.resources?.researchPoint,
            };
        }, saveKey);

        await page.click('#fatcat-dom-panel-overlay [data-action="research"][data-id="res_basic_prod"]');
        await page.waitForTimeout(2500);

        const after = await page.evaluate((key) => {
            const save = JSON.parse(localStorage.getItem(key) || "{}");
            return {
                unlocked: !!save.research?.res_basic_prod?.isUnlocked,
                researchPoint: save.resources?.researchPoint,
                message: document.querySelector("#fatcat-dom-panel-overlay .dom-msg")?.textContent || "",
                text: document.querySelector("#fatcat-dom-panel-overlay")?.textContent || "",
            };
        }, saveKey);

        await browser.close();

        const ok = authRequests.some((item) => item.status === 200)
            && researchRequests.some((item) => item.status === 200 && item.url.includes("/api/research/res_basic_prod/unlock"))
            && before.unlocked === false
            && before.researchPoint === 200
            && after.unlocked === true
            && after.researchPoint === 100
            && after.text.includes("Research synced")
            && after.text.includes("100")
            && failedRequests.length === 0
            && messages.length === 0;

        const result = { ok, before, after, authRequests, researchRequests, failedRequests, messages };
        console.log(JSON.stringify(result, null, 2));
        if (!ok) process.exit(1);
    } finally {
        api.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
