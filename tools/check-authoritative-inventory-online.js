const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5151";
const gameUrl = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&inventoryauthority=${Date.now()}`;
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
        const mutations = [];
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
            if (response.url().includes("/api/shop/purchase") || response.url().includes("/api/inventory/item_cat_food_pack/use")) {
                try {
                    mutations.push({ url: response.url(), status: response.status(), body: await response.json() });
                } catch {}
            }
        });

        await page.goto(gameUrl, { waitUntil: "load", timeout: 20000 });
        await page.evaluate(() => localStorage.removeItem("fatcat_company_save_v1"));
        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForSelector('#fatcat-dom-hud .player[data-player-authority="server"]', { timeout: 15000 });
        for (let index = 0; index < 40 && (!authorization || !playerId); index += 1) await wait(250);
        if (!authorization || !playerId) throw new Error("Player authentication context was not captured.");

        await page.click('#fatcat-dom-nav [data-panel="shop"]');
        await page.waitForSelector('#fatcat-dom-panel-overlay [data-action="buy"][data-id="shop_cat_food_1"]', { timeout: 15000 });
        await page.click('#fatcat-dom-panel-overlay [data-action="buy"][data-id="shop_cat_food_1"]');
        await page.waitForFunction(() => document.querySelector("#fatcat-dom-panel-overlay .message")?.textContent?.includes("3"), null, { timeout: 15000 });

        await page.click('#fatcat-dom-nav [data-panel="inventory"]');
        await page.waitForSelector('.inventory-shell[data-inventory-authority="server"]', { timeout: 15000 });
        await page.waitForFunction(() => document.querySelector('[data-id="item:item_cat_food_pack"] .bag-count')?.textContent?.trim() === "x3", null, { timeout: 15000 });
        const afterPurchase = await page.evaluate(() => ({
            authority: document.querySelector(".inventory-shell")?.getAttribute("data-inventory-authority") || "",
            count: document.querySelector('[data-id="item:item_cat_food_pack"] .bag-count')?.textContent?.trim() || "",
        }));

        await page.click('[data-id="item:item_cat_food_pack"]');
        await page.click('.bag-detail-target [data-action="use"][data-id="item_cat_food_pack"]');
        await page.waitForFunction(() => document.querySelector('[data-id="item:item_cat_food_pack"] .bag-count')?.textContent?.trim() === "x2", null, { timeout: 15000 });
        const afterUse = await page.evaluate(() => ({
            authority: document.querySelector(".inventory-shell")?.getAttribute("data-inventory-authority") || "",
            count: document.querySelector('[data-id="item:item_cat_food_pack"] .bag-count')?.textContent?.trim() || "",
            message: document.querySelector("#fatcat-dom-panel-overlay .message")?.textContent?.trim() || "",
        }));

        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForSelector('#fatcat-dom-hud .player[data-player-authority="server"]', { timeout: 15000 });
        await page.click('#fatcat-dom-nav [data-panel="inventory"]');
        await page.waitForSelector('.inventory-shell[data-inventory-authority="server"]', { timeout: 15000 });
        await page.waitForFunction(() => document.querySelector('[data-id="item:item_cat_food_pack"] .bag-count')?.textContent?.trim() === "x2", null, { timeout: 15000 });
        const afterReload = await page.evaluate(() => ({
            authority: document.querySelector(".inventory-shell")?.getAttribute("data-inventory-authority") || "",
            count: document.querySelector('[data-id="item:item_cat_food_pack"] .bag-count')?.textContent?.trim() || "",
        }));
        const inventory = await fetch(`${apiUrl}/api/inventory?playerId=${playerId}`, {
            headers: { Authorization: authorization },
        }).then(response => response.json());
        const resourceTransactions = await fetch(`${apiUrl}/api/resources/transactions?playerId=${playerId}&limit=20`, {
            headers: { Authorization: authorization },
        }).then(response => response.json());
        const inventoryResourceTransactions = (resourceTransactions.data || [])
            .filter(transaction => transaction.sourceType === "shop_purchase" || transaction.sourceType === "inventory_use");
        const serverFood = inventory.data?.find(item => item.itemId === "item_cat_food_pack");
        const purchaseMutation = mutations.find(item => item.url.includes("/api/shop/purchase"));
        const useMutation = mutations.find(item => item.url.includes("/api/inventory/item_cat_food_pack/use"));

        const ok = afterPurchase.authority === "server"
            && afterPurchase.count === "x3"
            && afterUse.authority === "server"
            && afterUse.count === "x2"
            && afterUse.message.includes("100")
            && afterReload.authority === "server"
            && afterReload.count === "x2"
            && serverFood?.quantity === 2
            && purchaseMutation?.body?.data?.itemQuantityAfter === 3
            && purchaseMutation?.body?.data?.replayed === false
            && useMutation?.body?.data?.item?.quantity === 2
            && useMutation?.body?.data?.rewardAmount === 100
            && inventoryResourceTransactions.length === 2
            && failedRequests.length === 0
            && messages.length === 0;
        console.log(JSON.stringify({
            check: "authoritative inventory online check",
            ok,
            playerId,
            afterPurchase,
            afterUse,
            afterReload,
            serverFood,
            mutations,
            inventoryResourceTransactions,
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
