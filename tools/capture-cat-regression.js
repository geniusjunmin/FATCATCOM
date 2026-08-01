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
                domCanvasHidden: document.querySelector("canvas")?.style.opacity === "0",
                sideTabs: document.querySelectorAll("#fatcat-dom-cat-overlay .side-tab").length,
                statCards: document.querySelectorAll("#fatcat-dom-cat-overlay .cat-stats > div").length,
                rosterCards: document.querySelectorAll("#fatcat-dom-cat-overlay .cat-list button").length,
                hasPortrait: !!document.querySelector("#fatcat-dom-cat-overlay .portrait-cat.img"),
                catTalkPin: (() => {
                    const element = document.querySelector("#fatcat-dom-cat-overlay .cat-talk");
                    return !!element && getComputedStyle(element, "::before").content !== "none";
                })(),
                catPowerBeanMedal: (() => {
                    const element = document.querySelector("#fatcat-dom-cat-overlay .cat-power");
                    return !!element && getComputedStyle(element, "::before").content !== "none";
                })(),
                catStatTopGlints: Array.from(document.querySelectorAll("#fatcat-dom-cat-overlay .cat-stats > div"))
                    .filter(element => getComputedStyle(element, "::before").content !== "none").length,
                catPanelMarkers: Array.from(document.querySelectorAll("#fatcat-dom-cat-overlay [data-cat-panel]"))
                    .map(element => element.getAttribute("data-cat-panel")),
                catIdentitySeal: (() => {
                    const element = document.querySelector("#fatcat-dom-cat-overlay .cat-card.info strong");
                    return !!element && getComputedStyle(element, "::before").content !== "none";
                })(),
                catStatusRail: (() => {
                    const element = document.querySelector("#fatcat-dom-cat-overlay .cat-status-rail");
                    return !!element && getComputedStyle(element, "::before").content !== "none";
                })(),
                catStatBottomAccents: Array.from(document.querySelectorAll("#fatcat-dom-cat-overlay .cat-stats > div"))
                    .filter(element => getComputedStyle(element, "::after").content !== "none").length,
                catStatLabels: document.querySelectorAll("#fatcat-dom-cat-overlay .cat-stats .stat-label").length,
                catStatValues: document.querySelectorAll("#fatcat-dom-cat-overlay .cat-stats .stat-value").length,
                catLowerTitleBadges: Array.from(document.querySelectorAll("#fatcat-dom-cat-overlay .cat-grid > div > b"))
                    .filter(element => getComputedStyle(element, "::before").content !== "none").length,
                catRosterActiveCrest: (() => {
                    const element = document.querySelector("#fatcat-dom-cat-overlay .cat-list button.active");
                    return !!element && getComputedStyle(element, "::after").content !== "none";
                })(),
                catWeightBadge: (() => {
                    const element = document.querySelector("#fatcat-dom-cat-overlay .cat-weight > b");
                    return !!element && getComputedStyle(element, "::before").content !== "none";
                })(),
                storyCornerPin: (() => {
                    const element = document.querySelector("#fatcat-dom-cat-overlay .story-copy");
                    return !!element && getComputedStyle(element, "::after").content !== "none";
                })(),
                hasEquipCards: document.querySelectorAll("#fatcat-dom-cat-overlay .equip-row .equip-slot").length,
                equipRarityBadges: document.querySelectorAll("#fatcat-dom-cat-overlay .equip-row .equip-rarity").length,
                equipSlotTags: document.querySelectorAll("#fatcat-dom-cat-overlay .equip-row .equip-slot-tag").length,
                equipBonusPills: document.querySelectorAll("#fatcat-dom-cat-overlay .equip-row .equip-bonus-pill").length,
                embeddedEquipIconArt: Array.from(document.querySelectorAll("#fatcat-dom-cat-overlay .equip-row .equip-icon"))
                    .filter(element => getComputedStyle(element).backgroundImage.startsWith('url("data:image/png;base64,')).length,
                hasStoryPhoto: !!document.querySelector("#fatcat-dom-cat-overlay .story-photo"),
                diamondValue,
                storyTags: document.querySelectorAll("#fatcat-dom-cat-overlay .story-tags span").length,
                recruitBadgeKey: document.querySelector("#fatcat-dom-cat-overlay .recruit-art")?.getAttribute("data-art-key") ?? "",
                recruitBadgeEmbedded: (() => {
                    const element = document.querySelector("#fatcat-dom-cat-overlay .recruit-art");
                    return !!element && getComputedStyle(element).backgroundImage.startsWith('url("data:image/png;base64,');
                })(),
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
            embeddedPackIconArt: await page.locator("#fatcat-dom-cat-overlay .equip-pack .equip-icon").evaluateAll((elements) =>
                elements.filter(element => getComputedStyle(element).backgroundImage.startsWith('url("data:image/png;base64,')).length
            ),
        };

        await page.click('#fatcat-dom-cat-overlay [data-action="tab"][data-tab="skin"]');
        await page.waitForTimeout(350);
        await page.click('#fatcat-dom-cat-overlay .skin-card-target[data-skin-id="apron"]');
        await page.click('#fatcat-dom-cat-overlay .skin-preview-action[data-action="applyCatSkin"]');
        await page.waitForTimeout(250);
        const skinFile = path.join(outDir, `cat-skin-${width}x${height}-edge.png`);
        await page.screenshot({ path: skinFile, fullPage: false });
        const skinState = await page.evaluate(() => ({
            wardrobeVisible: !!document.querySelector("#fatcat-dom-cat-overlay .skin-wardrobe"),
            skinCards: document.querySelectorAll("#fatcat-dom-cat-overlay .skin-card-target").length,
            selectedCards: document.querySelectorAll("#fatcat-dom-cat-overlay .skin-card-target.selected").length,
            equippedCards: document.querySelectorAll("#fatcat-dom-cat-overlay .skin-card-target.equipped").length,
            selectedSkinId: document.querySelector("#fatcat-dom-cat-overlay .skin-card-target.selected")?.getAttribute("data-skin-id") ?? "",
            previewSkinArt: document.querySelector("#fatcat-dom-cat-overlay .skin-preview-art")?.getAttribute("data-skin-art") ?? "",
            skinArtKeys: Array.from(document.querySelectorAll("#fatcat-dom-cat-overlay .skin-card-target"))
                .map(element => element.getAttribute("data-skin-art")),
            embeddedSkinArt: Array.from(document.querySelectorAll("#fatcat-dom-cat-overlay .skin-card-target i"))
                .filter(element => getComputedStyle(element).backgroundImage.startsWith('url("data:image/png;base64,')).length,
            applyDisabled: document.querySelector("#fatcat-dom-cat-overlay .skin-preview-action")?.hasAttribute("disabled") ?? false,
            skinMode: document.querySelector("#fatcat-dom-cat-overlay .cat-grid")?.classList.contains("skin-mode") ?? false,
            equippedHeroSkin: document.querySelector("#fatcat-dom-cat-overlay .portrait-cat")?.getAttribute("data-equipped-skin") ?? "",
            heroMatchesSkinPreview: (() => {
                const hero = document.querySelector("#fatcat-dom-cat-overlay .portrait-cat");
                const preview = document.querySelector("#fatcat-dom-cat-overlay .skin-preview-art");
                return !!hero && !!preview && getComputedStyle(hero).backgroundImage === getComputedStyle(preview).backgroundImage;
            })(),
            wardrobeWidthRatio: (() => {
                const wardrobe = document.querySelector("#fatcat-dom-cat-overlay .skin-wardrobe")?.getBoundingClientRect();
                const grid = document.querySelector("#fatcat-dom-cat-overlay .cat-grid")?.getBoundingClientRect();
                return wardrobe && grid ? Math.round(wardrobe.width / grid.width * 1000) / 1000 : 0;
            })(),
            styleBadges: document.querySelectorAll("#fatcat-dom-cat-overlay .skin-style-badge").length,
            swatches: document.querySelectorAll("#fatcat-dom-cat-overlay .skin-swatches s").length,
            themedCards: document.querySelectorAll("#fatcat-dom-cat-overlay .skin-card-target.apron, #fatcat-dom-cat-overlay .skin-card-target.manager, #fatcat-dom-cat-overlay .skin-card-target.festival").length,
        }));
        skinState.wardrobeVisible = await isVisible(page, "#fatcat-dom-cat-overlay .skin-wardrobe");
        await page.click('#fatcat-dom-cat-overlay .skin-card-target[data-skin-id="manager"]');
        const lockedSkinState = await page.evaluate(() => ({
            selectedSkinId: document.querySelector("#fatcat-dom-cat-overlay .skin-card-target.selected")?.getAttribute("data-skin-id") ?? "",
            previewSkinArt: document.querySelector("#fatcat-dom-cat-overlay .skin-preview-art")?.getAttribute("data-skin-art") ?? "",
            applyDisabled: document.querySelector("#fatcat-dom-cat-overlay .skin-preview-action")?.hasAttribute("disabled") ?? false,
            action: document.querySelector("#fatcat-dom-cat-overlay .skin-preview-action")?.getAttribute("data-action") ?? "",
            priceAmount: document.querySelector("#fatcat-dom-cat-overlay .skin-preview-action")?.getAttribute("data-price-amount") ?? "",
            managerOwned: document.querySelector('#fatcat-dom-cat-overlay .skin-card-target[data-skin-id="manager"]')?.getAttribute("data-skin-owned") ?? "",
            equippedSkinId: document.querySelector("#fatcat-dom-cat-overlay .skin-card-target.equipped")?.getAttribute("data-skin-id") ?? "",
        }));

        results.push({ size: `${width}x${height}`, file, equipFile, skinFile, messages, failedRequests, state, equipState, skinState, lockedSkinState });
        await page.close();
    }

    await browser.close();
    console.log(JSON.stringify(results, null, 2));
    if (results.some((entry) =>
        entry.messages.length
        || entry.failedRequests.length
        || !entry.state.overlayVisible
        || !entry.state.domCanvasHidden
        || !entry.state.hasPortrait
        || !entry.state.catTalkPin
        || !entry.state.catPowerBeanMedal
        || entry.state.catStatTopGlints < 5
        || entry.state.catPanelMarkers.join(",") !== "identity,stage,status,power,stats,weight,roster"
        || !entry.state.catIdentitySeal
        || !entry.state.catStatusRail
        || entry.state.catStatBottomAccents < 5
        || entry.state.catStatLabels !== 5
        || entry.state.catStatValues !== 5
        || entry.state.catLowerTitleBadges < 2
        || !entry.state.catRosterActiveCrest
        || !entry.state.catWeightBadge
        || !entry.state.storyCornerPin
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
        || entry.state.embeddedEquipIconArt < 4
        || entry.state.recruitBadgeKey !== "recruit-badge-v1"
        || !entry.state.recruitBadgeEmbedded
        || !entry.equipState.bagVisible
        || !entry.equipState.upgradeVisible
        || entry.equipState.packRarityBadges < 2
        || entry.equipState.packBonusPills < 2
        || entry.equipState.embeddedPackIconArt < 2
        || !entry.skinState.wardrobeVisible
        || entry.skinState.skinCards < 4
        || entry.skinState.selectedCards < 1
        || entry.skinState.equippedCards !== 1
        || entry.skinState.selectedSkinId !== "apron"
        || entry.skinState.previewSkinArt !== "apron"
        || entry.skinState.skinArtKeys.join(",") !== "default,apron,manager,festival"
        || entry.skinState.embeddedSkinArt !== 4
        || !entry.skinState.applyDisabled
        || !entry.skinState.skinMode
        || entry.skinState.equippedHeroSkin !== "apron"
        || !entry.skinState.heroMatchesSkinPreview
        || entry.skinState.wardrobeWidthRatio < 0.95
        || entry.skinState.styleBadges < 4
        || entry.skinState.swatches < 12
        || entry.skinState.themedCards < 3
        || entry.lockedSkinState.selectedSkinId !== "manager"
        || entry.lockedSkinState.previewSkinArt !== "manager"
        || entry.lockedSkinState.applyDisabled
        || entry.lockedSkinState.action !== "unlockCatSkin"
        || entry.lockedSkinState.priceAmount !== "75000"
        || entry.lockedSkinState.managerOwned !== "false"
        || entry.lockedSkinState.equippedSkinId !== "apron"
    )) {
        process.exit(1);
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
