const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const url = "http://localhost:7456/?previewbutton=1";

(async () => {
    const browser = await chromium.launch({ executablePath: edgePath });
    const page = await browser.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 1 });
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

    await page.goto(url, { waitUntil: "load", timeout: 15000 });
    await page.waitForTimeout(3500);
    await page.click('#fatcat-dom-nav [data-panel="factory"]');
    await page.waitForTimeout(250);
    await page.click('button[title="settings"]');
    await page.waitForTimeout(600);
    await page.click('#fatcat-dom-panel-overlay [data-action="previewProduction"]');
    await page.waitForTimeout(500);

    const state = await page.evaluate(() => {
        const text = document.querySelector("#fatcat-dom-panel-overlay")?.innerText || "";
        return {
            hasButton: !!document.querySelector('#fatcat-dom-panel-overlay [data-action="previewProduction"]'),
            text,
        };
    });

    await browser.close();

    const ok = state.hasButton
        && state.text.includes("\u7ed3\u7b97\u9884\u89c8")
        && state.text.includes("\u8bf7\u5148\u8fde\u63a5\u670d\u52a1\u5668")
        && messages.length === 0
        && failedRequests.length === 0;
    const result = { ok, state, messages, failedRequests };
    console.log(JSON.stringify(result, null, 2));
    if (!ok) process.exit(1);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
