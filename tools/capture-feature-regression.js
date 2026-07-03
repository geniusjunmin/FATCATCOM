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
            } else if (panel === "shop") {
                const tabStates = {};
                for (const tab of ["resource", "item", "cat", "deco"]) {
                    await page.click(`#fatcat-dom-panel-overlay [data-action="shopTab"][data-tab="${tab}"]`);
                    await page.waitForTimeout(180);
                    const firstProduct = page.locator('#fatcat-dom-panel-overlay [data-action="selectShopProduct"]').first();
                    if (await firstProduct.count()) {
                        await firstProduct.click();
                        await page.waitForTimeout(100);
                    }
                    tabStates[tab] = await page.evaluate(() => {
                        const shell = document.querySelector("#fatcat-dom-panel-overlay .shop-shell");
                        const detail = document.querySelector("#fatcat-dom-panel-overlay .shop-detail-target");
                        const art = document.querySelector("#fatcat-dom-panel-overlay .shop-detail-art");
                        return {
                            category: shell?.getAttribute("data-shop-category") || "",
                            rows: document.querySelectorAll("#fatcat-dom-panel-overlay .shop-row").length,
                            key: detail?.getAttribute("data-selected-key") || "",
                            selectedRows: document.querySelectorAll("#fatcat-dom-panel-overlay .shop-row.selected").length,
                            activeTabs: document.querySelectorAll("#fatcat-dom-panel-overlay .shop-tabs .tab.active").length,
                            embeddedDetailArt: !!art && getComputedStyle(art).backgroundImage.startsWith('url("data:image/'),
                        };
                    });
                }
                await page.click('#fatcat-dom-panel-overlay [data-action="shopTab"][data-tab="resource"]');
                await page.waitForTimeout(120);
                const beforeKey = await page.locator("#fatcat-dom-panel-overlay .shop-detail-target").getAttribute("data-selected-key");
                await page.locator('#fatcat-dom-panel-overlay [data-action="selectShopProduct"]').nth(1).click();
                await page.waitForTimeout(100);
                const afterState = await page.evaluate(() => ({
                    key: document.querySelector("#fatcat-dom-panel-overlay .shop-detail-target")?.getAttribute("data-selected-key") || "",
                    selectedRows: document.querySelectorAll("#fatcat-dom-panel-overlay .shop-row.selected").length,
                    realPurchaseActions: document.querySelectorAll("#fatcat-dom-panel-overlay .shop-detail-action [data-action='buy']").length,
                }));
                interaction.shopTabStates = tabStates;
                interaction.shopTabs = Object.entries(tabStates).every(([tab, state]) => state.category === tab
                    && state.rows >= 4
                    && !!state.key
                    && state.selectedRows === 1
                    && state.activeTabs === 1
                    && state.embeddedDetailArt);
                interaction.shopDetailSwitch = !!beforeKey
                    && afterState.key !== beforeKey
                    && afterState.selectedRows === 1;
                interaction.shopRealPurchaseAction = afterState.realPurchaseActions === 1;
            } else if (panel === "inventory") {
                const tabStates = {};
                for (const tab of ["resource", "item", "shard", "other", "all"]) {
                    await page.click(`#fatcat-dom-panel-overlay [data-action="inventoryTab"][data-tab="${tab}"]`);
                    await page.waitForTimeout(100);
                    tabStates[tab] = await page.evaluate(() => ({
                        cards: document.querySelectorAll("#fatcat-dom-panel-overlay .bag-card").length,
                        key: document.querySelector("#fatcat-dom-panel-overlay .bag-detail-target")?.getAttribute("data-selected-key") || "",
                        activeTabs: document.querySelectorAll("#fatcat-dom-panel-overlay .inventory-shell > .tabs .tab.active").length,
                        kind: document.querySelector("#fatcat-dom-panel-overlay .bag-detail-target")?.getAttribute("data-detail-kind") || "",
                    }));
                }
                await page.click('#fatcat-dom-panel-overlay [data-action="inventoryTab"][data-tab="all"]');
                await page.waitForTimeout(100);
                const allSlotOrder = await page.evaluate(() => Array.from(
                    document.querySelectorAll("#fatcat-dom-panel-overlay [data-inventory-slot]"),
                ).sort((left, right) => Number(left.getAttribute("data-inventory-slot")) - Number(right.getAttribute("data-inventory-slot")))
                    .map(element => element.getAttribute("data-id") || ""));
                const expectedAllOrder = [
                    "resource:bean",
                    "item:item_cat_food_pack",
                    "preview:cat-food-large",
                    "preview:coffee-cup",
                    "resource:coin",
                    "resource:diamond",
                    "preview:speed-5",
                    "preview:speed-30",
                    "preview:super-food",
                    "preview:factory-voucher",
                    "preview:guard-hour",
                    "preview:order-refresh",
                    "preview:shard-orange",
                    "preview:shard-black",
                    "preview:shard-white",
                    "preview:shard-calico",
                    "preview:decor-coin",
                    "preview:research-stone",
                    "preview:accelerator",
                    "preview:dried-fish",
                ];
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
                interaction.inventoryAllOrder = allSlotOrder.length === expectedAllOrder.length
                    && allSlotOrder.every((key, index) => key === expectedAllOrder[index]
                        || (index === 1 && key === "preview:cat-food-small"));
                interaction.inventoryTabStates = tabStates;
                interaction.inventoryTabs = tabStates.resource.cards === 4
                    && tabStates.resource.key === "resource:bean"
                    && tabStates.resource.activeTabs === 1
                    && tabStates.resource.kind === "公司资源"
                    && tabStates.item.cards >= 10
                    && tabStates.item.key.startsWith("item:")
                    && tabStates.item.activeTabs === 1
                    && tabStates.shard.cards >= 4
                    && (tabStates.shard.key === "item:item_shard_orange" || tabStates.shard.key === "preview:shard-orange")
                    && tabStates.shard.activeTabs === 1
                    && tabStates.other.cards >= 8
                    && tabStates.other.key === "preview:decor-coin"
                    && tabStates.other.activeTabs === 1
                    && tabStates.all.cards === 20
                    && tabStates.all.key === "resource:bean"
                    && tabStates.all.activeTabs === 1;
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
                    const viewport = document.querySelector("#fatcat-dom-panel-overlay .shop-catalog-viewport");
                    const nav = document.querySelector("#fatcat-dom-nav .nav-bar");
                    if (!viewport || !nav) return false;
                    return viewport.getBoundingClientRect().bottom <= nav.getBoundingClientRect().top - 2;
                })(),
                shopDetailVisible: (() => {
                    const detail = document.querySelector("#fatcat-dom-panel-overlay .shop-detail-target");
                    if (!detail) return false;
                    const rect = detail.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight;
                })(),
                shopDetailClearNav: (() => {
                    const detail = document.querySelector("#fatcat-dom-panel-overlay .shop-detail-target");
                    const nav = document.querySelector("#fatcat-dom-nav .nav-bar");
                    if (!detail || !nav) return false;
                    return detail.getBoundingClientRect().bottom <= nav.getBoundingClientRect().top - 2;
                })(),
                shopSelectedRows: document.querySelectorAll("#fatcat-dom-panel-overlay .shop-row.selected").length,
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
                researchNodes: document.querySelectorAll("#fatcat-dom-panel-overlay .tree .node").length,
                researchPlaceholders: document.querySelectorAll("#fatcat-dom-panel-overlay [data-research-placeholder]").length,
                researchPlaceholderActions: document.querySelectorAll("#fatcat-dom-panel-overlay [data-research-placeholder][data-action]").length,
                researchDisplayNames: Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay button.node .node-copy b"))
                    .map(element => element.textContent?.trim() || ""),
                researchTierCounts: [1, 2, 3, 4].map(tier =>
                    document.querySelectorAll(`#fatcat-dom-panel-overlay [data-research-tier="${tier}"]`).length),
                researchLayout: document.querySelector("#fatcat-dom-panel-overlay .tree")?.getAttribute("data-research-layout") || "",
                researchNodesInsideTree: (() => {
                    const tree = document.querySelector("#fatcat-dom-panel-overlay .tree");
                    if (!tree) return false;
                    const treeRect = tree.getBoundingClientRect();
                    return Array.from(tree.querySelectorAll(".node")).every(node => {
                        const rect = node.getBoundingClientRect();
                        return rect.left >= treeRect.left - 1
                            && rect.right <= treeRect.right + 1
                            && rect.top >= treeRect.top - 1
                            && rect.bottom <= treeRect.bottom + 1;
                    });
                })(),
                researchNodeOverlaps: (() => {
                    const nodes = Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .tree .node"));
                    let overlaps = 0;
                    for (let leftIndex = 0; leftIndex < nodes.length; leftIndex += 1) {
                        const left = nodes[leftIndex].getBoundingClientRect();
                        for (let rightIndex = leftIndex + 1; rightIndex < nodes.length; rightIndex += 1) {
                            const right = nodes[rightIndex].getBoundingClientRect();
                            const overlapWidth = Math.min(left.right, right.right) - Math.max(left.left, right.left);
                            const overlapHeight = Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top);
                            if (overlapWidth > 1 && overlapHeight > 1) overlaps += 1;
                        }
                    }
                    return overlaps;
                })(),
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
            || !entry.state.shopRowsClearNav
            || !entry.state.shopDetailVisible
            || !entry.state.shopDetailClearNav
            || entry.state.shopSelectedRows !== 1
            || !entry.interaction.shopTabs
            || !entry.interaction.shopDetailSwitch
            || !entry.interaction.shopRealPurchaseAction;
        if (entry.panel === "inventory") return entry.state.bagCards !== 20
            || entry.state.inventoryArtKinds < 7
            || entry.state.embeddedInventoryArt < 8
            || !entry.state.bagDetailVisible
            || !entry.state.bagDetailClearNav
            || !entry.interaction.inventoryTabs
            || !entry.interaction.inventoryAllOrder
            || !entry.interaction.inventoryDetailSwitch
            || !entry.interaction.inventoryUseAction;
        if (entry.panel === "research") return !entry.state.researchSideBySide
            || entry.state.researchNodes !== 7
            || entry.state.researchNodeArt !== 7
            || entry.state.researchPlaceholders !== 4
            || entry.state.researchPlaceholderActions !== 0
            || entry.state.researchDisplayNames.join(",") !== "咖啡萃取 I,咖啡烘焙 I,发酵技术 I"
            || entry.state.researchTierCounts.join(",") !== "1,2,3,1"
            || entry.state.researchLayout !== "1-2-3-1"
            || !entry.state.researchNodesInsideTree
            || entry.state.researchNodeOverlaps !== 0
            || entry.state.researchLines !== 12
            || entry.state.researchArtKinds < 4
            || entry.state.embeddedResearchArt < 8
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
