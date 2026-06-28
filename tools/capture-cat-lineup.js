const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outDir = path.resolve("docs/verification/screenshots/2026-06-28-cat-lineup");
const catIds = ["c_001", "c_002", "c_003", "c_004", "c_005"];

(async () => {
    fs.mkdirSync(outDir, { recursive: true });
    const browser = await chromium.launch({ executablePath: edgePath });
    const page = await browser.newPage({
        viewport: { width: 430, height: 932 },
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

    await page.goto("http://localhost:7456/?catlineup=20260628", {
        waitUntil: "load",
        timeout: 15000,
    });
    await page.waitForTimeout(3500);
    await page.click('#fatcat-dom-nav [data-panel="cats"]');
    await page.waitForTimeout(900);

    const captures = [];
    for (let index = 0; index < catIds.length; index += 1) {
        const state = await page.evaluate(() => {
            const portrait = document.querySelector("#fatcat-dom-cat-overlay .portrait-cat.img");
            const name = document.querySelector("#fatcat-dom-cat-overlay .cat-card.info strong");
            return {
                name: name?.textContent?.trim() || "",
                background: portrait ? getComputedStyle(portrait).backgroundImage : "",
            };
        });
        const file = path.join(outDir, `${catIds[index]}-430x932.png`);
        await page.screenshot({ path: file, fullPage: false });
        captures.push({
            id: catIds[index],
            file,
            name: state.name,
            hasEmbeddedArt: state.background.startsWith('url("data:image/png;base64,'),
        });
        if (index < catIds.length - 1) {
            await page.click('#fatcat-dom-cat-overlay [data-action="nextCat"]');
            await page.waitForTimeout(350);
        }
    }

    await browser.close();
    const result = { captures, messages, failedRequests };
    console.log(JSON.stringify(result, null, 2));
    if (messages.length || failedRequests.length || captures.some((entry) => !entry.name || !entry.hasEmbeddedArt)) {
        process.exit(1);
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
