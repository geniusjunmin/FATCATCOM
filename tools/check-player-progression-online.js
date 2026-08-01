const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5149";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&playerprogression=${Date.now()}`;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForApi() {
    for (let index = 0; index < 60; index += 1) {
        try {
            const response = await fetch(`${apiUrl}/health`);
            if (response.ok) return;
        } catch {}
        await wait(500);
    }
    throw new Error("API did not become ready.");
}

(async () => {
    const api = startApiProcess(apiUrl);
    let browser;
    try {
        await waitForApi();
        browser = await chromium.launch({ executablePath: edgePath });
        const page = await browser.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 1 });
        const messages = [];
        const failedRequests = [];
        const progressionRequests = [];
        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", async (response) => {
            if (response.url().includes("/api/player/me")
                || response.url().includes("/api/launch")
                || response.url().includes("/api/factory/appearances"))
            {
                const entry = { status: response.status(), method: response.request().method(), url: response.url() };
                progressionRequests.push(entry);
                if (response.url().includes("/api/player/me")) {
                    try {
                        entry.body = await response.json();
                    } catch {}
                }
            }
            if (response.status() >= 400) failedRequests.push({ status: response.status(), url: response.url() });
        });

        await page.goto(url, { waitUntil: "load", timeout: 20000 });
        await page.evaluate(() => localStorage.removeItem("fatcat_company_save_v1"));
        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForSelector('#fatcat-dom-hud .player[data-player-authority]', { timeout: 15000 });
        await page.waitForTimeout(4000);
        const loginState = await page.evaluate(() => {
            const player = document.querySelector("#fatcat-dom-hud .player");
            return {
                authority: player?.getAttribute("data-player-authority") ?? "",
                level: player?.getAttribute("data-player-level") ?? "",
                exp: player?.getAttribute("data-player-exp") ?? "",
                expToNext: player?.getAttribute("data-player-exp-to-next") ?? "",
                text: document.querySelector("#fatcat-dom-hud .exp-text")?.textContent?.trim() ?? "",
            };
        });
        if (loginState.authority !== "server" || loginState.level !== "28" || loginState.exp !== "2560") {
            throw new Error(`Unexpected login progression: ${JSON.stringify({ loginState, progressionRequests, failedRequests, messages })}`);
        }
        const before = await page.evaluate(() => {
            const player = document.querySelector("#fatcat-dom-hud .player");
            return {
                level: player?.getAttribute("data-player-level") ?? "",
                exp: player?.getAttribute("data-player-exp") ?? "",
                expToNext: player?.getAttribute("data-player-exp-to-next") ?? "",
                text: document.querySelector("#fatcat-dom-hud .exp-text")?.textContent?.trim() ?? "",
            };
        });

        await page.click('button[title="launch"]');
        await page.waitForSelector('#fatcat-dom-hud .player[data-player-exp="2810"]', { timeout: 15000 });
        await page.waitForFunction(() => document.querySelector("#fatcat-dom-factory .factory-msg")?.textContent?.includes("经验 +250"), null, { timeout: 15000 });
        const after = await page.evaluate(() => {
            const player = document.querySelector("#fatcat-dom-hud .player");
            return {
                level: player?.getAttribute("data-player-level") ?? "",
                exp: player?.getAttribute("data-player-exp") ?? "",
                expToNext: player?.getAttribute("data-player-exp-to-next") ?? "",
                levelCap: player?.getAttribute("data-player-level-cap") ?? "",
                authority: player?.getAttribute("data-player-authority") ?? "",
                text: document.querySelector("#fatcat-dom-hud .exp-text")?.textContent?.trim() ?? "",
                message: document.querySelector("#fatcat-dom-factory .factory-msg")?.textContent?.trim() ?? "",
            };
        });

        const ok = before.level === "28"
            && before.exp === "2560"
            && before.expToNext === "3200"
            && before.text === "2560/3200"
            && after.level === "28"
            && after.exp === "2810"
            && after.expToNext === "3200"
            && after.levelCap === "60"
            && after.authority === "server"
            && after.text === "2810/3200"
            && after.message.includes("经验 +250")
            && progressionRequests.some(item => item.status === 200 && item.url.includes("/api/player/me"))
            && progressionRequests.some(item => item.status === 200 && item.method === "POST" && item.url.includes("/api/launch"))
            && failedRequests.length === 0
            && messages.length === 0;
        console.log(JSON.stringify({ ok, before, after, progressionRequests, failedRequests, messages }, null, 2));
        if (!ok) process.exitCode = 1;
    } finally {
        if (browser) await browser.close();
        api.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
