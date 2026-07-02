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
            const interaction = {};
            if (panel === "buildings") {
                const buildingScenes = [];
                const buildingIds = [];
                const backgrounds = [];
                const chipCount = await page.locator("#fatcat-dom-panel-overlay .building-chip").count();
                for (let index = 0; index < chipCount; index += 1) {
                    await page.locator("#fatcat-dom-panel-overlay .building-chip").nth(index).click();
                    await page.waitForTimeout(120);
                    const selected = await page.evaluate(() => {
                        const hero = document.querySelector("#fatcat-dom-panel-overlay .building-detail-hero");
                        return {
                            scene: hero?.getAttribute("data-building-scene") || "",
                            id: hero?.getAttribute("data-building-id") || "",
                            background: hero ? getComputedStyle(hero).backgroundImage : "",
                            activeChips: document.querySelectorAll("#fatcat-dom-panel-overlay .building-chip.active").length,
                        };
                    });
                    buildingScenes.push(selected.scene);
                    buildingIds.push(selected.id);
                    backgrounds.push(selected.background);
                    if (selected.activeChips !== 1) interaction.buildingSingleSelection = false;
                }
                interaction.buildingSingleSelection = interaction.buildingSingleSelection !== false;
                interaction.buildingSceneSwitches = new Set(buildingScenes).size;
                interaction.buildingIdSwitches = new Set(buildingIds).size;
                interaction.buildingRoomArtSwitches = new Set(backgrounds).size;
                interaction.buildingEmbeddedSwitches = backgrounds
                    .filter(value => value.includes('url("data:image/jpeg;base64,')).length;
            } else if (panel === "inventory") {
                const tabStates = {};
                for (const tab of ["resource", "shard", "other", "all"]) {
                    await page.click(`#fatcat-dom-panel-overlay [data-action="inventoryTab"][data-tab="${tab}"]`);
                    await page.waitForTimeout(100);
                    tabStates[tab] = await page.evaluate(() => ({
                        cards: document.querySelectorAll("#fatcat-dom-panel-overlay .bag-card").length,
                        key: document.querySelector("#fatcat-dom-panel-overlay .bag-detail-target")?.getAttribute("data-selected-key") || "",
                    }));
                }
                const initialKey = await page.locator("#fatcat-dom-panel-overlay .bag-detail-target").getAttribute("data-selected-key");
                await page.click('#fatcat-dom-panel-overlay [data-id="preview:order-refresh"]');
                await page.waitForTimeout(120);
                const previewState = await page.evaluate(() => ({
                    key: document.querySelector("#fatcat-dom-panel-overlay .bag-detail-target")?.getAttribute("data-selected-key") || "",
                    title: document.querySelector("#fatcat-dom-panel-overlay .bag-detail-head b")?.textContent?.trim() || "",
                    selectedCount: document.querySelectorAll("#fatcat-dom-panel-overlay .bag-card.selected").length,
                }));
                await page.click('#fatcat-dom-panel-overlay [data-id="item:item_cat_food_pack"]');
                await page.waitForTimeout(120);
                const usableActionVisible = await isVisible(page, "#fatcat-dom-panel-overlay .bag-detail-action");
                await page.click('#fatcat-dom-panel-overlay [data-id="preview:order-refresh"]');
                await page.waitForTimeout(120);
                interaction.inventoryDetailSwitch = initialKey === "resource:bean"
                    && previewState.key === "preview:order-refresh"
                    && previewState.title === "订单券"
                    && previewState.selectedCount === 1;
                interaction.inventoryUseAction = usableActionVisible;
                interaction.inventoryTabStates = tabStates;
                interaction.inventoryTabs = tabStates.resource.cards >= 6
                    && tabStates.resource.key === "resource:bean"
                    && tabStates.shard.cards >= 4
                    && (tabStates.shard.key === "item:item_shard_orange" || tabStates.shard.key === "preview:shard-orange")
                    && tabStates.other.cards >= 9
                    && tabStates.other.key === "preview:speed-5"
                    && tabStates.all.cards === 20
                    && tabStates.all.key === "resource:bean";
            } else if (panel === "research") {
                const effects = ["coin_production_mult", "bean_reduce", "upgrade_cost_reduce"];
                const backgrounds = [];
                const titles = [];
                for (const effect of effects) {
                    await page.click(`#fatcat-dom-panel-overlay .node[data-research-art="${effect}"]`);
                    await page.waitForTimeout(120);
                    const selected = await page.evaluate(() => ({
                        title: document.querySelector("#fatcat-dom-panel-overlay .research-hero b")?.textContent?.trim() || "",
                        background: getComputedStyle(document.querySelector("#fatcat-dom-panel-overlay .research-medal-art")).backgroundImage,
                    }));
                    titles.push(selected.title);
                    backgrounds.push(selected.background);
                }
                await page.click('#fatcat-dom-panel-overlay .node[data-research-art="coin_production_mult"]');
                await page.waitForTimeout(120);
                interaction.researchEffectSwitches = new Set(backgrounds).size;
                interaction.researchTitles = new Set(titles).size;
                interaction.researchEmbeddedSwitches = backgrounds.filter(value => value.startsWith('url("data:image/png;base64,')).length;
            }
            const file = path.join(outDir, `${panel}-${width}x${height}.png`);
            await page.screenshot({ path: file, fullPage: false });
            const state = await page.evaluate(() => ({
                title: document.querySelector("#fatcat-dom-panel-overlay h2")?.textContent?.trim() || "",
                domCanvasHidden: document.querySelector("canvas")?.style.opacity === "0",
                shellCount: document.querySelectorAll("#fatcat-dom-panel-overlay .panel-shell").length,
                buildingChips: document.querySelectorAll("#fatcat-dom-panel-overlay .building-chip").length,
                buildingHero: !!document.querySelector("#fatcat-dom-panel-overlay .building-detail-hero"),
                buildingHeroScene: document.querySelector("#fatcat-dom-panel-overlay .building-detail-hero")?.getAttribute("data-building-scene") || "",
                embeddedBuildingRoomArt: (() => {
                    const hero = document.querySelector("#fatcat-dom-panel-overlay .building-detail-hero");
                    return !!hero && getComputedStyle(hero).backgroundImage.includes('url("data:image/jpeg;base64,');
                })(),
                buildingActiveChips: document.querySelectorAll("#fatcat-dom-panel-overlay .building-chip.active").length,
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
                researchLines: document.querySelectorAll("#fatcat-dom-panel-overlay .tree-line").length,
                researchArtKinds: new Set(Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay [data-research-art]"))
                    .map(element => element.getAttribute("data-research-art"))).size,
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
                interaction,
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
        if (entry.panel === "buildings") return entry.state.buildingChips !== 6
            || !entry.state.buildingHero
            || !entry.state.buildingHeroScene
            || !entry.state.embeddedBuildingRoomArt
            || entry.state.buildingActiveChips !== 1
            || !entry.state.buildingDecorManager
            || !entry.interaction.buildingSingleSelection
            || entry.interaction.buildingSceneSwitches !== 6
            || entry.interaction.buildingIdSwitches !== 6
            || entry.interaction.buildingRoomArtSwitches !== 6
            || entry.interaction.buildingEmbeddedSwitches !== 6;
        if (entry.panel === "shop") return entry.state.shopRows < 6
            || entry.state.shopProductArt < 6
            || entry.state.embeddedShopProductArt < 6
            || !entry.state.shopRowsClearNav;
        if (entry.panel === "inventory") return entry.state.bagCards !== 20
            || entry.state.inventoryArtKinds < 7
            || entry.state.embeddedInventoryArt < 8
            || !entry.state.bagDetailVisible
            || !entry.state.bagDetailClearNav
            || !entry.interaction.inventoryTabs
            || !entry.interaction.inventoryDetailSwitch
            || !entry.interaction.inventoryUseAction;
        if (entry.panel === "research") return !entry.state.researchSideBySide
            || entry.state.researchNodeArt < 4
            || entry.state.researchLines < 11
            || entry.state.researchArtKinds < 3
            || entry.state.embeddedResearchArt < 5
            || !entry.state.researchHeroArt
            || !entry.state.researchDetailClearNav
            || !entry.state.researchActionVisible
            || entry.interaction.researchEffectSwitches !== 3
            || entry.interaction.researchTitles !== 3
            || entry.interaction.researchEmbeddedSwitches !== 3;
        return false;
    });
    if (failed) process.exit(1);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
