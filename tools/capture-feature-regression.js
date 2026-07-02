const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outDir = path.resolve("docs/verification/screenshots/2026-06-29-feature-regression");
const sizes = [
    [430, 932],
    [414, 896],
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
                domCanvasHidden: document.querySelector("canvas")?.style.opacity === "0",
                shellCount: document.querySelectorAll("#fatcat-dom-panel-overlay .panel-shell").length,
                buildingChips: document.querySelectorAll("#fatcat-dom-panel-overlay .building-chip").length,
                buildingHero: !!document.querySelector("#fatcat-dom-panel-overlay .building-detail-hero"),
                buildingDecorManager: !!document.querySelector("#fatcat-dom-panel-overlay .building-decor-manager"),
                shopRows: document.querySelectorAll("#fatcat-dom-panel-overlay .shop-row").length,
                shopProductArt: document.querySelectorAll("#fatcat-dom-panel-overlay .shop-icon.product-art").length,
                embeddedShopProductArt: Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .shop-icon.product-art"))
                    .filter(element => getComputedStyle(element).backgroundImage.startsWith('url("data:image/png;base64,')).length,
                shopRowsClearNav: (() => {
                    const rows = Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .shop-row"));
                    const nav = document.querySelector("#fatcat-dom-nav .nav-bar");
                    if (rows.length === 0 || !nav) return false;
                    return rows[rows.length - 1].getBoundingClientRect().bottom <= nav.getBoundingClientRect().top - 2;
                })(),
                bagCards: document.querySelectorAll("#fatcat-dom-panel-overlay .bag-card").length,
                inventoryArtKinds: new Set(Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay [data-inventory-art]"))
                    .map(element => element.getAttribute("data-inventory-art"))).size,
                embeddedInventoryArt: Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .bag-icon.dedicated-art"))
                    .filter(element => getComputedStyle(element).backgroundImage.startsWith('url("data:image/png;base64,')).length,
                bagDetailVisible: (() => {
                    const detail = document.querySelector("#fatcat-dom-panel-overlay .bag-detail-target");
                    if (!detail) return false;
                    const rect = detail.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight;
                })(),
                bagDetailClearNav: (() => {
                    const detail = document.querySelector("#fatcat-dom-panel-overlay .bag-detail-target");
                    const nav = document.querySelector("#fatcat-dom-nav .nav-bar");
                    if (!detail || !nav) return false;
                    return detail.getBoundingClientRect().bottom <= nav.getBoundingClientRect().top - 2;
                })(),
                researchNodeArt: document.querySelectorAll("#fatcat-dom-panel-overlay .node-icon.asset").length,
                embeddedResearchArt: Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .node-icon.asset, #fatcat-dom-panel-overlay .research-medal-art"))
                    .filter(element => getComputedStyle(element).backgroundImage.startsWith('url("data:image/png;base64,')).length,
                researchHeroArt: !!document.querySelector("#fatcat-dom-panel-overlay .research-medal-art"),
                researchDetailClearNav: (() => {
                    const detail = document.querySelector("#fatcat-dom-panel-overlay .research-detail");
                    const nav = document.querySelector("#fatcat-dom-nav .nav-bar");
                    if (!detail || !nav) return false;
                    return detail.getBoundingClientRect().bottom <= nav.getBoundingClientRect().top - 2;
                })(),
                researchActionVisible: (() => {
                    const action = document.querySelector("#fatcat-dom-panel-overlay .research-detail .tag:last-child");
                    const nav = document.querySelector("#fatcat-dom-nav .nav-bar");
                    if (!action || !nav) return false;
                    const rect = action.getBoundingClientRect();
                    return rect.height > 0 && rect.bottom <= nav.getBoundingClientRect().top - 2;
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
        if (!entry.visible || entry.state.shellCount !== 1 || !entry.state.title || !entry.state.domCanvasHidden) return true;
        if (entry.panel === "buildings") return entry.state.buildingChips !== 6 || !entry.state.buildingHero || !entry.state.buildingDecorManager;
        if (entry.panel === "shop") return entry.state.shopRows < 6
            || entry.state.shopProductArt < 6
            || entry.state.embeddedShopProductArt < 6
            || !entry.state.shopRowsClearNav;
        if (entry.panel === "inventory") return entry.state.bagCards !== 20
            || entry.state.inventoryArtKinds < 7
            || entry.state.embeddedInventoryArt < 8
            || !entry.state.bagDetailVisible
            || !entry.state.bagDetailClearNav;
        if (entry.panel === "research") return !entry.state.researchSideBySide
            || entry.state.researchNodeArt < 4
            || entry.state.embeddedResearchArt < 5
            || !entry.state.researchHeroArt
            || !entry.state.researchDetailClearNav
            || !entry.state.researchActionVisible;
        return false;
    });
    if (failed) process.exit(1);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
