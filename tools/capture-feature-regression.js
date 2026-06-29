const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outDir = path.resolve("docs/verification/screenshots/2026-06-29-feature-regression");
const sizes = [
    [430, 932],
    [360, 800],
    [768, 1024],
];
const panels = ["buildings", "shop", "inventory", "research"];

async function isVisible(page, selector) {
    return page.evaluate((value) => {
        const element = document.querySelector(value);
        if (!element) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    }, selector);
}

(async () => {
    fs.mkdirSync(outDir, { recursive: true });
    const browser = await chromium.launch({ executablePath: edgePath });
    const results = [];

    for (const [width, height] of sizes) {
        const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
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

        await page.goto(`http://localhost:7456/?featurereg=${width}x${height}`, {
            waitUntil: "load",
            timeout: 15000,
        });
        await page.waitForTimeout(3500);

        for (const panel of panels) {
            await page.click(`#fatcat-dom-nav [data-panel="${panel}"]`);
            await page.waitForTimeout(450);
            const file = path.join(outDir, `${panel}-${width}x${height}.png`);
            await page.screenshot({ path: file, fullPage: false });
            const state = await page.evaluate(() => ({
                title: document.querySelector("#fatcat-dom-panel-overlay h2")?.textContent?.trim() || "",
                shellCount: document.querySelectorAll("#fatcat-dom-panel-overlay .panel-shell").length,
                buildingChips: document.querySelectorAll("#fatcat-dom-panel-overlay .building-chip").length,
                buildingHero: !!document.querySelector("#fatcat-dom-panel-overlay .building-detail-hero"),
                shopRows: document.querySelectorAll("#fatcat-dom-panel-overlay .shop-row").length,
                bagCards: document.querySelectorAll("#fatcat-dom-panel-overlay .bag-card").length,
                bagDetailVisible: (() => {
                    const detail = document.querySelector("#fatcat-dom-panel-overlay .bag-detail-target");
                    if (!detail) return false;
                    const rect = detail.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight;
                })(),
                researchSideBySide: (() => {
                    const tree = document.querySelector("#fatcat-dom-panel-overlay .tree");
                    const detail = document.querySelector("#fatcat-dom-panel-overlay .research-detail");
                    if (!tree || !detail) return false;
                    const treeRect = tree.getBoundingClientRect();
                    const detailRect = detail.getBoundingClientRect();
                    return detailRect.left >= treeRect.right - 2 && Math.abs(detailRect.top - treeRect.top) < 4;
                })(),
            }));
            results.push({
                panel,
                size: `${width}x${height}`,
                file,
                visible: await isVisible(page, "#fatcat-dom-panel-overlay .panel-shell"),
                state,
            });
        }

        results.push({
            panel: "runtime",
            size: `${width}x${height}`,
            messages,
            failedRequests,
        });
        await page.close();
    }

    await browser.close();
    console.log(JSON.stringify(results, null, 2));
    const failed = results.some((entry) => {
        if (entry.panel === "runtime") {
            return entry.messages.length > 0 || entry.failedRequests.length > 0;
        }
        if (!entry.visible || entry.state.shellCount !== 1 || !entry.state.title) return true;
        if (entry.panel === "buildings") return entry.state.buildingChips !== 6 || !entry.state.buildingHero;
        if (entry.panel === "shop") return entry.state.shopRows < 6;
        if (entry.panel === "inventory") return entry.state.bagCards !== 20 || !entry.state.bagDetailVisible;
        if (entry.panel === "research") return !entry.state.researchSideBySide;
        return false;
    });
    if (failed) process.exit(1);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
