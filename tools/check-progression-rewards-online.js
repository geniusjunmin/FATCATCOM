const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5150";
const gameUrl = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&progressionrewards=${Date.now()}`;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

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
        let authorization = "";
        let playerId = "";
        page.on("console", message => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", response => {
            if (response.status() >= 400) failedRequests.push({ status: response.status(), url: response.url() });
            if (response.url().includes("/api/player/me")) {
                authorization = response.request().headers().authorization || authorization;
                playerId = new URL(response.url()).searchParams.get("playerId") || playerId;
            }
        });

        await page.goto(gameUrl, { waitUntil: "load", timeout: 20000 });
        await page.evaluate(() => localStorage.removeItem("fatcat_company_save_v1"));
        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForSelector('#fatcat-dom-hud .player[data-player-authority="server"]', { timeout: 15000 });
        await page.waitForFunction(() => !!document.querySelector('#fatcat-dom-factory [data-action="achievement"]'), null, { timeout: 15000 });
        for (let index = 0; index < 40 && (!authorization || !playerId); index += 1) await wait(250);
        if (!authorization || !playerId) throw new Error("Player authentication context was not captured.");

        const initialAchievement = await fetch(`${apiUrl}/api/achievements?playerId=${playerId}`, {
            headers: { Authorization: authorization },
        }).then(response => response.json());
        for (const catId of ["c_002", "c_003", "c_004", "c_005"]) {
            const response = await fetch(`${apiUrl}/api/cats/${catId}/unlock?playerId=${playerId}`, {
                method: "POST",
                headers: { Authorization: authorization, "Content-Type": "application/json" },
                body: "{}",
            });
            if (!response.ok) throw new Error(`Failed to unlock ${catId}: ${response.status} ${await response.text()}`);
        }

        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForSelector('#fatcat-dom-hud .player[data-player-authority="server"]', { timeout: 15000 });
        await page.click('button[title="achievements"]');
        await page.waitForSelector('.achievement-shell[data-achievement-authority="server"] [data-action="claimTask"]', { timeout: 15000 });
        const before = await page.evaluate(() => ({
            level: document.querySelector("#fatcat-dom-hud .player")?.getAttribute("data-player-level") ?? "",
            exp: document.querySelector("#fatcat-dom-hud .player")?.getAttribute("data-player-exp") ?? "",
            authority: document.querySelector(".achievement-shell")?.getAttribute("data-achievement-authority") ?? "",
            claimable: document.querySelector(".achievement-shell")?.getAttribute("data-achievement-claimable") ?? "",
        }));

        await page.click('.achievement-shell [data-action="claimTask"]');
        await page.waitForSelector('#fatcat-dom-hud .player[data-player-level="29"][data-player-exp="160"]', { timeout: 15000 });
        await page.waitForFunction(() => document.querySelector("#fatcat-dom-panel-overlay .message")?.textContent?.includes("经验 +800"), null, { timeout: 15000 });
        const after = await page.evaluate(() => ({
            level: document.querySelector("#fatcat-dom-hud .player")?.getAttribute("data-player-level") ?? "",
            exp: document.querySelector("#fatcat-dom-hud .player")?.getAttribute("data-player-exp") ?? "",
            expText: document.querySelector("#fatcat-dom-hud .exp-text")?.textContent?.trim() ?? "",
            authority: document.querySelector(".achievement-shell")?.getAttribute("data-achievement-authority") ?? "",
            claimable: document.querySelector(".achievement-shell")?.getAttribute("data-achievement-claimable") ?? "",
            message: document.querySelector("#fatcat-dom-panel-overlay .message")?.textContent?.trim() ?? "",
        }));
        const transactions = await fetch(`${apiUrl}/api/resources/transactions?playerId=${playerId}&limit=20`, {
            headers: { Authorization: authorization },
        }).then(response => response.json());
        const achievementTransactions = (transactions.data || []).filter(transaction => transaction.sourceType === "achievement_claim");

        const ok = initialAchievement.data?.[0]?.progress === 1
            && before.level === "28"
            && before.exp === "2560"
            && before.authority === "server"
            && before.claimable === "1"
            && after.level === "29"
            && after.exp === "160"
            && after.expText === "160/3300"
            && after.authority === "server"
            && after.claimable === "0"
            && after.message.includes("经验 +800")
            && after.message.includes("Lv.29")
            && achievementTransactions.length === 1
            && achievementTransactions[0].experienceDelta === 800
            && achievementTransactions[0].playerProgression?.level === 29
            && failedRequests.length === 0
            && messages.length === 0;
        console.log(JSON.stringify({ ok, playerId, before, after, achievementTransactions, failedRequests, messages }, null, 2));
        if (!ok) process.exitCode = 1;
    } finally {
        if (browser) await browser.close();
        api.kill();
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
