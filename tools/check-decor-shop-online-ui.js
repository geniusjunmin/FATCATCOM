const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&decorshop=${Date.now()}`;
const saveKey = "fatcat_company_save_v1";

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    const api = startApiProcess(apiUrl, { captureOutput: true });
    const apiLogs = [];
    api.stdout?.on("data", (chunk) => apiLogs.push(chunk.toString()));
    api.stderr?.on("data", (chunk) => apiLogs.push(chunk.toString()));
    let browser;
    try {
        await waitForApi();
        browser = await chromium.launch({ executablePath: edgePath });
        const page = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
        const messages = [];
        const failedRequests = [];
        const purchaseResponses = [];
        let connectedPlayerId = "";
        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", async (response) => {
            if (response.url().includes("/api/decor/catalog?playerId=")) {
                connectedPlayerId = new URL(response.url()).searchParams.get("playerId") || "";
            }
            if (response.url().includes("/api/decor/decor_shop_neon_paw/purchase")) {
                purchaseResponses.push({ status: response.status(), body: await response.json().catch(() => null) });
            }
            if (response.status() >= 400) {
                failedRequests.push({ status: response.status(), url: response.url() });
            }
        });

        await page.goto(url, { waitUntil: "load", timeout: 15000 });
        await page.evaluate((key) => localStorage.removeItem(key), saveKey);
        await page.reload({ waitUntil: "load", timeout: 15000 });
        await page.waitForTimeout(3500);
        await page.click('button[title="settings"]');
        await page.waitForTimeout(400);
        await page.click('#fatcat-dom-panel-overlay [data-action="connectServer"]');
        await page.waitForTimeout(2200);
        await page.click("#fatcat-dom-panel-overlay .panel-close");
        await page.click('#fatcat-dom-nav [data-panel="shop"]');
        await page.waitForTimeout(700);
        await page.click('#fatcat-dom-panel-overlay [data-action="shopTab"][data-tab="deco"]');
        await page.waitForTimeout(900);

        const before = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .decor-catalog-row"));
            const target = document.querySelector('#fatcat-dom-panel-overlay [data-action="buyDecor"][data-id="decor_shop_neon_paw"]');
            return {
                rows: rows.length,
                owned: rows.filter((row) => row.classList.contains("owned")).length,
                targetVisible: !!target,
                summary: document.querySelector("#fatcat-dom-panel-overlay .decor-shop-summary")?.textContent || "",
                contained: rows.every((row) => {
                    const rect = row.getBoundingClientRect();
                    return rect.left >= 0 && rect.right <= window.innerWidth + 1;
                }),
            };
        });
        await page.click('#fatcat-dom-panel-overlay [data-action="buyDecor"][data-id="decor_shop_neon_paw"]');
        await page.waitForTimeout(900);
        const purchased = await page.evaluate(() => {
            const row = Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .decor-catalog-row"))
                .find((item) => item.textContent?.includes("霓虹猫爪灯"));
            return {
                owned: !!row?.classList.contains("owned"),
                ownedButton: row?.querySelector("button")?.textContent?.trim() || "",
                message: document.querySelector("#fatcat-dom-panel-overlay .message")?.textContent || "",
            };
        });

        await page.click("#fatcat-dom-panel-overlay .panel-close");
        await page.click('#fatcat-dom-nav [data-panel="buildings"]');
        await page.waitForTimeout(900);
        const stored = await page.evaluate(() => {
            const button = document.querySelector('#fatcat-dom-panel-overlay [data-action="toggleDecorPlacement"][data-id="decor_shop_neon_paw"]');
            return {
                visible: !!button,
                stored: !!button?.closest(".building-decor-item")?.classList.contains("stored"),
                itemCount: document.querySelectorAll("#fatcat-dom-panel-overlay .building-decor-item").length,
            };
        });
        await page.click('#fatcat-dom-panel-overlay [data-action="toggleDecorPlacement"][data-id="decor_shop_neon_paw"]');
        await page.waitForTimeout(700);
        const placed = await page.evaluate(async (playerId) => {
            const button = document.querySelector('#fatcat-dom-panel-overlay [data-action="toggleDecorPlacement"][data-id="decor_shop_neon_paw"]');
            const response = await fetch(`http://localhost:5144/api/decor?playerId=${encodeURIComponent(playerId)}`);
            const payload = await response.json();
            const state = payload.data?.find((item) => item.decorId === "decor_shop_neon_paw");
            return {
                uiPlaced: !!button?.closest(".building-decor-item")?.classList.contains("placed"),
                serverPlaced: state?.isPlaced === true,
                serverBuilding: state?.buildingId || "",
            };
        }, connectedPlayerId);

        const purchase = purchaseResponses[0]?.body?.data;
        const ok = before.rows === 6
            && before.owned === 0
            && before.targetVisible
            && before.summary.includes("永久收藏")
            && before.contained
            && purchased.owned
            && purchased.ownedButton === "已拥有"
            && purchased.message.includes("装饰仓库")
            && purchaseResponses.length === 1
            && purchaseResponses[0].status === 200
            && purchase?.pricePaid === 28000
            && purchase?.coinBalance === 12422000
            && stored.visible
            && stored.stored
            && stored.itemCount === 3
            && placed.uiPlaced
            && placed.serverPlaced
            && placed.serverBuilding === "building_cafe_1f"
            && connectedPlayerId.length > 0
            && messages.length === 0
            && failedRequests.length === 0
            && apiLogs.every((line) => !line.includes("fail:") && !line.includes("Exception"));
        console.log(JSON.stringify({
            ok,
            before,
            purchased,
            purchase: purchase ? {
                decorId: purchase.decor?.decorId,
                pricePaid: purchase.pricePaid,
                coinBalance: purchase.coinBalance,
            } : null,
            stored,
            placed,
            messages,
            failedRequests,
            apiErrors: apiLogs.filter((line) => line.includes("fail:") || line.includes("Exception")).slice(-6),
        }, null, 2));
        if (!ok) process.exitCode = 1;
    } finally {
        if (browser) await browser.close();
        api.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
