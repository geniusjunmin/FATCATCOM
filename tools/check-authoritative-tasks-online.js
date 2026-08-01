const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5152";
const gameUrl = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&taskauthority=${Date.now()}`;
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
        const taskMutations = [];
        let authorization = "";
        let playerId = "";
        page.on("console", message => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", async response => {
            if (response.status() >= 400) failedRequests.push({ status: response.status(), url: response.url() });
            if (response.url().includes("/api/player/me")) {
                authorization = response.request().headers().authorization || authorization;
                playerId = new URL(response.url()).searchParams.get("playerId") || playerId;
            }
            if (response.url().includes("/api/tasks/") && response.url().includes("/claim")) {
                taskMutations.push({ status: response.status(), body: await response.json() });
            }
        });

        await page.goto(gameUrl, { waitUntil: "load", timeout: 20000 });
        await page.evaluate(() => localStorage.removeItem("fatcat_company_save_v1"));
        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForSelector('#fatcat-dom-hud .player[data-player-authority="server"]', { timeout: 15000 });
        for (let index = 0; index < 40 && (!authorization || !playerId); index += 1) await wait(250);
        if (!authorization || !playerId) throw new Error("Player authentication context was not captured.");

        const initial = await fetch(`${apiUrl}/api/tasks?playerId=${playerId}`, {
            headers: { Authorization: authorization },
        }).then(response => response.json());
        let launchBody = null;
        for (let index = 0; index < 5; index += 1) {
            const [launchResponse] = await Promise.all([
                page.waitForResponse(response => response.url().includes("/api/launch") && response.status() === 200, { timeout: 15000 }),
                page.click('button[title="launch"]'),
            ]);
            launchBody = await launchResponse.json();
            if (!launchBody.data?.accepted) throw new Error(`Launch was rejected: ${JSON.stringify(launchBody)}`);
            await wait(200);
        }
        await page.click('button[title="tasks"]');
        await page.waitForSelector('.task-shell[data-task-authority="server"]', { timeout: 15000 });
        await wait(1000);
        const postLaunchTasks = await fetch(`${apiUrl}/api/tasks?playerId=${playerId}`, {
            headers: { Authorization: authorization },
        }).then(response => response.json());
        const postLaunchMain = postLaunchTasks.data?.find(task => task.id === "task_main_1");
        if (!postLaunchMain?.claimable) {
            throw new Error(`Main task did not become claimable: ${JSON.stringify({ launch: launchBody.data, tasks: postLaunchTasks.data })}`);
        }
        await page.waitForSelector('.task-shell [data-action="claimTask"][data-id="task_main_1"]', { timeout: 15000 });
        const beforeClaim = await page.evaluate(() => ({
            authority: document.querySelector(".task-shell")?.getAttribute("data-task-authority") || "",
            count: document.querySelector(".task-shell")?.getAttribute("data-task-count") || "",
            claimable: document.querySelector(".task-shell")?.getAttribute("data-task-claimable") || "",
            level: document.querySelector("#fatcat-dom-hud .player")?.getAttribute("data-player-level") || "",
            exp: document.querySelector("#fatcat-dom-hud .player")?.getAttribute("data-player-exp") || "",
        }));

        await page.click('.task-shell [data-action="claimTask"][data-id="task_main_1"]');
        await page.waitForSelector('.task-shell [data-task-id="task_main_1"][data-task-claimed="true"]', { timeout: 15000 });
        await page.waitForFunction(() => document.querySelector("#fatcat-dom-panel-overlay .message")?.textContent?.includes("任务奖励已领取"), null, { timeout: 15000 });
        const afterClaim = await page.evaluate(() => ({
            authority: document.querySelector(".task-shell")?.getAttribute("data-task-authority") || "",
            claimable: document.querySelector(".task-shell")?.getAttribute("data-task-claimable") || "",
            message: document.querySelector("#fatcat-dom-panel-overlay .message")?.textContent?.trim() || "",
            level: document.querySelector("#fatcat-dom-hud .player")?.getAttribute("data-player-level") || "",
            exp: document.querySelector("#fatcat-dom-hud .player")?.getAttribute("data-player-exp") || "",
        }));

        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForSelector('#fatcat-dom-hud .player[data-player-authority="server"]', { timeout: 15000 });
        await page.click('button[title="tasks"]');
        await page.waitForSelector('.task-shell[data-task-authority="server"] [data-task-id="task_main_1"][data-task-claimed="true"]', { timeout: 15000 });
        const afterReload = await page.evaluate(() => ({
            authority: document.querySelector(".task-shell")?.getAttribute("data-task-authority") || "",
            claimed: document.querySelector('[data-task-id="task_main_1"]')?.getAttribute("data-task-claimed") || "",
        }));
        const finalTasks = await fetch(`${apiUrl}/api/tasks?playerId=${playerId}`, {
            headers: { Authorization: authorization },
        }).then(response => response.json());
        const inventory = await fetch(`${apiUrl}/api/inventory?playerId=${playerId}`, {
            headers: { Authorization: authorization },
        }).then(response => response.json());
        const transactions = await fetch(`${apiUrl}/api/resources/transactions?playerId=${playerId}&limit=50`, {
            headers: { Authorization: authorization },
        }).then(response => response.json());
        const mainTask = finalTasks.data?.find(task => task.id === "task_main_1");
        const coinPack = inventory.data?.find(item => item.itemId === "item_coin_pack_small");
        const taskTransactions = (transactions.data || []).filter(transaction => transaction.sourceType === "task_claim");
        const initialMain = initial.data?.find(task => task.id === "task_main_1");

        const ok = initialMain?.progress === 0
            && beforeClaim.authority === "server"
            && beforeClaim.count === "2"
            && Number(beforeClaim.claimable) >= 1
            && afterClaim.authority === "server"
            && afterClaim.message.includes("任务奖励已领取")
            && afterClaim.message.includes("小袋金币 x1")
            && afterReload.authority === "server"
            && afterReload.claimed === "true"
            && mainTask?.claimed === true
            && mainTask?.claimable === false
            && coinPack?.quantity === 6
            && taskTransactions.length === 1
            && taskTransactions[0].experienceDelta === 250
            && taskMutations.length === 1
            && taskMutations[0].status === 200
            && taskMutations[0].body?.data?.inventoryItems?.[0]?.quantity === 6
            && failedRequests.length === 0
            && messages.length === 0;
        console.log(JSON.stringify({
            check: "authoritative tasks online check",
            ok,
            playerId,
            initialMain,
            beforeClaim,
            afterClaim,
            afterReload,
            mainTask,
            coinPack,
            taskTransactions,
            taskMutations,
            failedRequests,
            messages,
        }, null, 2));
        if (!ok) process.exitCode = 1;
    } finally {
        if (browser) await browser.close();
        api.kill();
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
