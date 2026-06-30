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
                chestTextFits: chest
                    ? chest.scrollWidth <= chest.clientWidth + 1 && chest.scrollHeight <= chest.clientHeight + 1
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
        || !entry.state.chestTextFits
    )) {
        process.exit(1);
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
