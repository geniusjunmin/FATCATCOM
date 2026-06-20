const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const url = "http://localhost:7456/?productionwage=1";

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
    await page.click('#fatcat-dom-nav [data-panel="buildings"]');
    await page.waitForTimeout(800);

    const state = await page.evaluate(() => {
        const current = document.querySelector("#fatcat-dom-nav")?.dataset.current || "";
        const panelText = document.querySelector("#fatcat-dom-panel-overlay .panel-shell")?.innerText || "";
        const cards = Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .building-dashboard .building-stat-card"))
            .map((node) => node.textContent?.trim() || "");
        const settlement = Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .wide"))
            .map((node) => node.textContent || "")
            .find((text) => text.includes("\u6bdb\u6536\u76ca") && text.includes("\u51c0\u6536\u76ca")) || "";
        return { current, panelText, cards, settlement };
    });

    await browser.close();

    const ok = state.current.startsWith("buildings")
        && state.cards.length === 4
        && state.panelText.includes("\u51c0\u91d1\u5e01")
        && state.panelText.includes("\u5de5\u8d44\u6210\u672c")
        && state.settlement.includes("\u6bdb\u6536\u76ca")
        && state.settlement.includes("\u5de5\u8d44")
        && state.settlement.includes("\u51c0\u6536\u76ca")
        && messages.length === 0
        && failedRequests.length === 0;
    const result = { ok, state, messages, failedRequests };
    console.log(JSON.stringify(result, null, 2));
    if (!ok) process.exit(1);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
