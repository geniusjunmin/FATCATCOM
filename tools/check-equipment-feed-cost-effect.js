const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const url = "http://localhost:7456/?feedcosteffect=1";

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
    await page.evaluate(() => localStorage.removeItem("fatcat_company_save_v1"));
    await page.reload({ waitUntil: "load", timeout: 15000 });
    await page.waitForTimeout(3500);
    await page.click('#fatcat-dom-nav [data-panel="cats"]');
    await page.waitForTimeout(800);
    await page.click('#fatcat-dom-cat-overlay [data-action="tab"][data-tab="equip"]');
    await page.waitForTimeout(300);

    const state = await page.evaluate(() => {
        const feedCost = document.querySelector("#fatcat-dom-cat-overlay .cat-card.feed strong")?.textContent?.trim() || "";
        const text = document.querySelector("#fatcat-dom-cat-overlay")?.innerText || "";
        return { feedCost, text };
    });

    await browser.close();

    const ok = state.feedCost === "9"
        && state.text.includes("猫粮 -5%")
        && messages.length === 0
        && failedRequests.length === 0;
    const result = { ok, state, messages, failedRequests };
    console.log(JSON.stringify(result, null, 2));
    if (!ok) process.exit(1);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
