const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outDir = path.resolve("docs/verification/screenshots/2026-06-09-main-regression");
const sizes = [
    [414, 896],
    [430, 932],
    [360, 800],
    [768, 1024],
];

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

        await page.goto(`http://localhost:7456/?api=http://localhost:5144&pwreg=${width}x${height}`, {
            waitUntil: "load",
            timeout: 15000,
        });
        await page.waitForFunction(() => {
            return document.querySelectorAll("#fatcat-dom-hud .res").length >= 4
                && document.querySelectorAll("#fatcat-dom-factory .floor").length >= 6;
        }, { timeout: 12000 });
        await page.waitForTimeout(500);

        const file = path.join(outDir, `main-${width}x${height}-edge.png`);
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
            const player = rect("#fatcat-dom-hud .player");
            const firstResource = rect("#fatcat-dom-hud .res");
            const chest = document.querySelector("#fatcat-dom-factory .chest");
            const launch = document.querySelector("#fatcat-dom-factory .launch");
            const gift = document.querySelector("#fatcat-dom-factory .gift");
            const canvas = rect("canvas");
            const floor = rect("#fatcat-dom-factory .floor");
            const floorCard = rect("#fatcat-dom-factory .floor-card");
            const bonus = rect("#fatcat-dom-factory .bonus");
            const building = rect("#fatcat-dom-factory .building");
            const bottomWidgets = rect("#fatcat-dom-factory .bottom-widgets");
            const navBar = rect("#fatcat-dom-nav .nav-bar");
            const diamondValue = document.querySelector("#fatcat-dom-hud .res.diamond .value")?.textContent?.trim() ?? "";
            const ratio = (part, whole) => part && whole
                ? Math.round(part / whole * 10000) / 10000
                : null;

            return {
                resourceCount: document.querySelectorAll("#fatcat-dom-hud .res").length,
                floorCount: document.querySelectorAll("#fatcat-dom-factory .floor").length,
                roomDecorCount: document.querySelectorAll("#fatcat-dom-factory .room-decor").length,
                hasLaunch: document.body.innerText.includes("发射猫咪"),
                hasCats: document.body.innerText.includes("猫咪"),
                hasSettings: document.body.innerText.includes("设置"),
                player,
                firstResource,
                hudGap: player && firstResource ? Math.round((firstResource.left - player.right) * 10) / 10 : null,
                chest: rect("#fatcat-dom-factory .chest"),
                launch: rect("#fatcat-dom-factory .launch"),
                diamondValue,
                buildingHeightRatio: ratio(building?.height, canvas?.height),
                buildingBottomRatio: building && canvas
                    ? Math.round((building.bottom - canvas.top) / canvas.height * 10000) / 10000
                    : null,
                floorCardHeightRatio: ratio(floorCard?.height, floor?.height),
                bonusHeightRatio: ratio(bonus?.height, floor?.height),
                operationHeightRatio: ratio(bottomWidgets?.height, canvas?.height),
                navHeightRatio: ratio(navBar?.height, canvas?.height),
                chestTextFits: chest
                    ? chest.scrollWidth <= chest.clientWidth + 1 && chest.scrollHeight <= chest.clientHeight + 1
                    : false,
                launchTextFits: launch
                    ? launch.scrollWidth <= launch.clientWidth + 1 && launch.scrollHeight <= launch.clientHeight + 1
                    : false,
                giftTextFits: gift
                    ? gift.scrollWidth <= gift.clientWidth + 1 && gift.scrollHeight <= gift.clientHeight + 1
                    : false,
            };
        });

        results.push({ size: `${width}x${height}`, file, messages, failedRequests, state });
        await page.close();
    }

    await browser.close();
    console.log(JSON.stringify(results, null, 2));
    if (results.some(entry =>
        entry.messages.length
        || entry.failedRequests.length
        || entry.state.resourceCount < 4
        || entry.state.floorCount < 6
        || !entry.state.hasLaunch
        || !entry.state.hasCats
        || !entry.state.hasSettings
        || entry.state.hudGap === null
        || entry.state.hudGap < 0
        || entry.state.diamondValue !== "2580"
        || entry.state.buildingHeightRatio === null
        || entry.state.buildingHeightRatio < 0.68
        || entry.state.buildingBottomRatio === null
        || entry.state.buildingBottomRatio > 0.865
        || entry.state.floorCardHeightRatio === null
        || entry.state.floorCardHeightRatio > 0.5
        || entry.state.bonusHeightRatio === null
        || entry.state.bonusHeightRatio > 0.56
        || entry.state.operationHeightRatio === null
        || entry.state.operationHeightRatio > 0.075
        || entry.state.navHeightRatio === null
        || entry.state.navHeightRatio > 0.065
        || !entry.state.chestTextFits
        || !entry.state.launchTextFits
        || !entry.state.giftTextFits
    )) {
        process.exit(1);
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
