const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&boosthistory=${Date.now()}`;
const saveKey = "fatcat_company_save_v1";
const factoryScreenshotPath = path.resolve("docs/verification/screenshots/2026-07-01-boost-history/boost-factory-360x800.png");
const screenshotPath = path.resolve("docs/verification/screenshots/2026-07-01-boost-history/boost-history-360x800.png");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForApi() {
    for (let index = 0; index < 60; index += 1) {
        try {
            if ((await fetch(`${apiUrl}/health`)).ok) return;
        } catch {}
        await wait(500);
    }
    throw new Error("API did not become ready.");
}

async function request(path, method = "GET", body = undefined) {
    const response = await fetch(`${apiUrl}${path}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    return { response, json: await response.json() };
}

(async () => {
    const api = startApiProcess(apiUrl, { captureOutput: true });
    const apiLogs = [];
    api.stdout?.on("data", (chunk) => apiLogs.push(chunk.toString()));
    api.stderr?.on("data", (chunk) => apiLogs.push(chunk.toString()));
    let browser;
    try {
        await waitForApi();
        const suffix = Date.now();
        const helperNames = ["Maple Beans", "Sunny Roast", "Moon Cafe"];
        const helpers = [];
        for (let index = 0; index < helperNames.length; index += 1) {
            helpers.push(await request("/api/auth/guest", "POST", {
                deviceId: `boost-history-helper-${index}-${suffix}`,
                companyName: helperNames[index],
            }));
        }

        browser = await chromium.launch({ executablePath: edgePath });
        const page = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 1 });
        const messages = [];
        const failedRequests = [];
        let targetId = "";
        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", async (response) => {
            if (response.url().includes("/api/auth/guest") && response.ok()) {
                try {
                    targetId = (await response.json()).data?.playerId || targetId;
                } catch {}
            }
            if (response.status() >= 400) {
                failedRequests.push({ status: response.status(), url: response.url() });
            }
        });

        await page.goto(url, { waitUntil: "load", timeout: 15000 });
        await page.evaluate((key) => localStorage.removeItem(key), saveKey);
        await page.reload({ waitUntil: "load", timeout: 15000 });
        await page.waitForTimeout(3000);
        await page.click('button[title="settings"]');
        await page.click('#fatcat-dom-panel-overlay [data-action="connectServer"]');
        for (let index = 0; index < 30 && !targetId; index += 1) await page.waitForTimeout(150);
        if (!targetId) throw new Error("Target browser login did not complete.");
        await page.waitForTimeout(700);
        await page.click("#fatcat-dom-panel-overlay .panel-close");

        const targetKey = `player:${targetId.replace(/-/g, "")}`;
        for (let index = 0; index < helpers.length; index += 1) {
            const helperId = helpers[index].json.data?.playerId;
            await request(`/api/friends/add?playerId=${encodeURIComponent(helperId)}`, "POST", {
                friendPlayerId: targetId,
            });
            await request(
                `/api/friends/${encodeURIComponent(targetKey)}/help?playerId=${encodeURIComponent(helperId)}`,
                "POST",
                {},
            );
            await page.waitForTimeout(450);
        }
        await page.waitForTimeout(1000);

        const factory = await page.evaluate(() => {
            const banner = document.querySelector("#fatcat-dom-factory .friend-boost-banner");
            const rect = banner?.getBoundingClientRect();
            return {
                text: banner?.textContent || "",
                sourceChips: banner?.querySelectorAll(".boost-sources i").length || 0,
                contained: !!rect && rect.left >= 0 && rect.right <= window.innerWidth
                    && rect.top >= 0 && rect.bottom <= window.innerHeight,
            };
        });
        fs.mkdirSync(path.dirname(factoryScreenshotPath), { recursive: true });
        await page.screenshot({ path: factoryScreenshotPath, fullPage: false });
        await page.click('button[title="friends"]');
        await page.waitForTimeout(900);
        const panel = await page.evaluate(() => {
            const card = document.querySelector("#fatcat-dom-panel-overlay .friend-boost-history");
            const rect = card?.getBoundingClientRect();
            const rows = Array.from(card?.querySelectorAll(".boost-history-row") || []);
            return {
                visible: !!card,
                text: card?.textContent || "",
                activeRows: rows.filter((row) => row.classList.contains("active")).length,
                names: rows.map((row) => row.querySelector("b")?.textContent || ""),
                contained: !!rect && rect.left >= 0 && rect.right <= window.innerWidth,
            };
        });
        fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
        await page.screenshot({ path: screenshotPath, fullPage: false });
        const history = await request(`/api/social/boost/history?playerId=${encodeURIComponent(targetId)}`);
        const historyData = history.json.data;
        const apiErrors = apiLogs.filter((line) => line.includes("fail:") || line.includes("Exception")).slice(-8);
        const ok = helpers.every((helper) => helper.response.ok)
            && history.response.ok
            && historyData?.activeBoostPercent === 30
            && historyData?.activeContributionCount === 3
            && historyData?.entries?.length === 3
            && factory.text.includes("+30%")
            && helperNames.every((name) => factory.text.includes(name))
            && factory.sourceChips === 2
            && factory.contained
            && panel.visible
            && panel.activeRows === 3
            && helperNames.every((name) => panel.names.includes(name))
            && panel.text.includes("3 人生效")
            && panel.contained
            && messages.length === 0
            && failedRequests.length === 0
            && apiErrors.length === 0;
        console.log(JSON.stringify({
            ok,
            targetId,
            factory,
            panel,
            history: historyData,
            factoryScreenshotPath,
            screenshotPath,
            messages,
            failedRequests,
            apiErrors,
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
