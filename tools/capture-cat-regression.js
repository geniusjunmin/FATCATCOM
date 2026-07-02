const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outDir = path.resolve("docs/verification/screenshots/2026-06-10-cat-regression");
const sizes = [
    [414, 896],
    [430, 932],
    [360, 800],
    [768, 1024],
];

async function isVisible(page, selector) {
    return page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    }, selector);
}

(async () => {
    fs.mkdirSync(outDir, { recursive: true });
    const browser = await chromium.launch({ executablePath: edgePath });
    const results = [];

    for (const [width, height] of sizes) {
        const page = await browser.newPage({
            viewport: { width, height },
            deviceScaleFactor: 1,
        });
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

        await page.goto(`http://localhost:7456/?catreg=${width}x${height}`, {
            waitUntil: "load",
            timeout: 15000,
        });
        await page.waitForTimeout(3500);
        await page.click('#fatcat-dom-nav [data-panel="cats"]');
        await page.waitForTimeout(900);

        const file = path.join(outDir, `cat-${width}x${height}-edge.png`);
        await page.screenshot({ path: file, fullPage: false });

        const state = await page.evaluate(() => {
            const rect = (selector) => {
                const element = document.querySelector(selector);
                if (!element) return null;
                const bounds = element.getBoundingClientRect();
                return {
                    left: Math.round(bounds.left * 10) / 10,
                    right: Math.round(bounds.right * 10) / 10,
                    top: Math.round(bounds.top * 10) / 10,
                    bottom: Math.round(bounds.bottom * 10) / 10,
                    width: Math.round(bounds.width * 10) / 10,
                    height: Math.round(bounds.height * 10) / 10,
                };
            };
            const overlay = rect("#fatcat-dom-cat-overlay");
            const sideRail = rect("#fatcat-dom-cat-overlay .cat-side");
            const hero = rect("#fatcat-dom-cat-overlay .cat-hero");
            const roster = rect("#fatcat-dom-cat-overlay .cat-list");
            const diamondResource = document.querySelector("#fatcat-dom-cat-overlay .cat-page-hud .res.gem");
            const diamondValue = Array.from(diamondResource?.childNodes ?? [])
                .find(node => node.nodeType === 3)
                ?.textContent
                ?.trim() ?? "";

            return {
                overlayVisible: !!document.querySelector("#fatcat-dom-cat-overlay"),
                sideTabs: document.querySelectorAll("#fatcat-dom-cat-overlay .side-tab").length,
                statCards: document.querySelectorAll("#fatcat-dom-cat-overlay .cat-stats > div").length,
                rosterCards: document.querySelectorAll("#fatcat-dom-cat-overlay .cat-list button").length,
                hasPortrait: !!document.querySelector("#fatcat-dom-cat-overlay .portrait-cat.img"),
                hasEquipCards: document.querySelectorAll("#fatcat-dom-cat-overlay .equip-row .equip-slot").length,
                equipRarityBadges: document.querySelectorAll("#fatcat-dom-cat-overlay .equip-row .equip-rarity").length,
                equipSlotTags: document.querySelectorAll("#fatcat-dom-cat-overlay .equip-row .equip-slot-tag").length,
                equipBonusPills: document.querySelectorAll("#fatcat-dom-cat-overlay .equip-row .equip-bonus-pill").length,
                hasStoryPhoto: !!document.querySelector("#fatcat-dom-cat-overlay .story-photo"),
                diamondValue,
                storyTags: document.querySelectorAll("#fatcat-dom-cat-overlay .story-tags span").length,
                backText: document.querySelector("#fatcat-dom-cat-overlay .back")?.textContent?.trim() || "",
                overlay,
                sideRail,
                hero,
                roster,
                sideHeroGap: sideRail && hero ? Math.round((hero.left - sideRail.right) * 10) / 10 : null,
                rosterBottomGap: overlay && roster ? Math.round((overlay.bottom - roster.bottom) * 10) / 10 : null,
                sideRailClearsRoster: !!(sideRail && roster && sideRail.bottom < roster.top),
            };
        });

        state.overlayVisible = await isVisible(page, "#fatcat-dom-cat-overlay");
        state.storyVisible = await isVisible(page, "#fatcat-dom-cat-overlay .cat-story");
        state.storyButtonVisible = await isVisible(page, '#fatcat-dom-cat-overlay .story-button[data-action="storyWall"]');
        await page.click('#fatcat-dom-cat-overlay [data-action="tab"][data-tab="equip"]');
        await page.waitForTimeout(350);
        const equipFile = path.join(outDir, `cat-equip-${width}x${height}-edge.png`);
        await page.screenshot({ path: equipFile, fullPage: false });
        const equipState = {
            bagVisible: await isVisible(page, "#fatcat-dom-cat-overlay .equip-bag"),
            upgradeVisible: await isVisible(page, "#fatcat-dom-cat-overlay .equip-upgrade"),
            packRarityBadges: await page.locator("#fatcat-dom-cat-overlay .equip-pack .equip-rarity").count(),
            packBonusPills: await page.locator("#fatcat-dom-cat-overlay .equip-pack .equip-bonus-pill").count(),
        };

        await page.click('#fatcat-dom-cat-overlay [data-action="tab"][data-tab="skin"]');
        await page.waitForTimeout(350);
        const skinFile = path.join(outDir, `cat-skin-${width}x${height}-edge.png`);
        await page.screenshot({ path: skinFile, fullPage: false });
        const skinState = await page.evaluate(() => ({
            wardrobeVisible: !!document.querySelector("#fatcat-dom-cat-overlay .skin-wardrobe"),
            skinCards: document.querySelectorAll("#fatcat-dom-cat-overlay .skin-card-target").length,
            selectedCards: document.querySelectorAll("#fatcat-dom-cat-overlay .skin-card-target.selected").length,
            styleBadges: document.querySelectorAll("#fatcat-dom-cat-overlay .skin-style-badge").length,
            swatches: document.querySelectorAll("#fatcat-dom-cat-overlay .skin-swatches s").length,
            themedCards: document.querySelectorAll("#fatcat-dom-cat-overlay .skin-card-target.apron, #fatcat-dom-cat-overlay .skin-card-target.manager, #fatcat-dom-cat-overlay .skin-card-target.festival").length,
        }));
        skinState.wardrobeVisible = await isVisible(page, "#fatcat-dom-cat-overlay .skin-wardrobe");

        results.push({ size: `${width}x${height}`, file, equipFile, skinFile, messages, failedRequests, state, equipState, skinState });
        await page.close();
    }

    await browser.close();
    console.log(JSON.stringify(results, null, 2));
    if (results.some((entry) =>
        entry.messages.length
        || entry.failedRequests.length
        || !entry.state.overlayVisible
        || !entry.state.hasPortrait
        || !entry.state.hasStoryPhoto
        || entry.state.diamondValue !== "2580"
        || !entry.state.storyVisible
        || !entry.state.storyButtonVisible
        || entry.state.storyTags < 3
        || entry.state.backText !== "←"
        || entry.state.sideHeroGap === null
        || entry.state.sideHeroGap < 0
        || entry.state.rosterBottomGap === null
        || entry.state.rosterBottomGap < -1
        || !entry.state.sideRailClearsRoster
        || entry.state.equipRarityBadges < 4
        || entry.state.equipSlotTags < 4
        || entry.state.equipBonusPills < 4
        || !entry.equipState.bagVisible
        || !entry.equipState.upgradeVisible
        || entry.equipState.packRarityBadges < 2
        || entry.equipState.packBonusPills < 2
        || !entry.skinState.wardrobeVisible
        || entry.skinState.skinCards < 4
        || entry.skinState.selectedCards < 1
        || entry.skinState.styleBadges < 4
        || entry.skinState.swatches < 12
        || entry.skinState.themedCards < 3
    )) {
        process.exit(1);
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
