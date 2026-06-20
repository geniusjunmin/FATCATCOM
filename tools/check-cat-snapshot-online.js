const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&catsnapshot=${Date.now()}`;
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

async function clickFirstVisible(page, selectors) {
    for (const selector of selectors) {
        const locator = page.locator(selector).first();
        if (await locator.count()) {
            await locator.click({ timeout: 5000 });
            return selector;
        }
    }
    throw new Error(`No visible selector matched: ${selectors.join(", ")}`);
}

(async () => {
    const api = startApiProcess(apiUrl);

    try {
        await waitForApi();
        const browser = await chromium.launch({ executablePath: edgePath });
        const page = await browser.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 1 });
        const messages = [];
        const failedRequests = [];
        const catSnapshotRequests = [];
        const unlockRequests = [];

        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", (response) => {
            if (response.url().includes("/api/cats?")) {
                catSnapshotRequests.push({ status: response.status(), url: response.url() });
            }
            if (response.url().includes("/api/cats/") && response.url().includes("/unlock")) {
                unlockRequests.push({ status: response.status(), url: response.url() });
            }
            if (response.status() >= 400) {
                failedRequests.push({ status: response.status(), url: response.url() });
            }
        });

        await page.goto(url, { waitUntil: "load", timeout: 20000 });
        await page.evaluate((key) => localStorage.removeItem(key), saveKey);
        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForTimeout(2500);

        await page.click('#fatcat-dom-nav [data-panel="cats"]');
        await page.waitForTimeout(600);
        await page.click('#fatcat-dom-cat-overlay [data-action="selectCat"][data-id="c_005"]');
        await page.waitForTimeout(300);
        await page.click('#fatcat-dom-cat-overlay [data-action="unlockCat"][data-id="c_005"]');
        await page.waitForTimeout(2500);

        const afterUnlock = await page.evaluate(() => {
            const overlay = document.querySelector("#fatcat-dom-cat-overlay");
            return {
                hasLevel: (overlay?.textContent || "").includes("Lv.1/30"),
                message: document.querySelector("#fatcat-dom-cat-overlay .cat-msg")?.textContent || "",
            };
        });

        await page.evaluate((key) => {
            const raw = localStorage.getItem(key);
            if (!raw) throw new Error("Save was not found after unlock.");
            const save = JSON.parse(raw);
            save.cats = save.cats || {};
            save.cats.c_005 = {
                ...(save.cats.c_005 || {}),
                id: "c_005",
                level: 1,
                weight: 22,
                isUnlocked: false,
            };
            if (save.cats.c_001) {
                save.cats.c_001.level = 1;
                save.cats.c_001.weight = 20;
            }
            localStorage.setItem(key, JSON.stringify(save));
        }, saveKey);

        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForTimeout(2500);
        await clickFirstVisible(page, [
            'button[title="settings"]',
            '.fatcat-hotspot[data-panel="settings"]',
            '#fatcat-dom-factory [data-action="settings"]',
        ]);
        await page.waitForTimeout(600);
        await page.click('#fatcat-dom-panel-overlay [data-action="connectServer"]');
        await page.waitForTimeout(2500);
        await page.click('#fatcat-dom-nav [data-panel="cats"]');
        await page.waitForTimeout(600);
        await page.click('#fatcat-dom-cat-overlay [data-action="selectCat"][data-id="c_005"]');
        await page.waitForTimeout(500);

        const afterSnapshot = await page.evaluate(() => {
            const save = JSON.parse(localStorage.getItem("fatcat_company_save_v1") || "{}");
            const cat = save.cats?.c_005 || {};
            const overlayText = document.querySelector("#fatcat-dom-cat-overlay")?.textContent || "";
            return {
                localUnlocked: !!cat.isUnlocked,
                localLevel: cat.level,
                localWeight: cat.weight,
                hasLevel: overlayText.includes("Lv.1/30"),
                hasRecruitSyncedState: overlayText.includes("Lv.1/30") && !overlayText.includes("c_005 joined"),
            };
        });

        await browser.close();

        const ok = unlockRequests.some((item) => item.status === 200)
            && catSnapshotRequests.some((item) => item.status === 200)
            && afterUnlock.hasLevel
            && afterUnlock.message.includes("Recruit synced")
            && afterSnapshot.localUnlocked
            && afterSnapshot.localLevel === 1
            && afterSnapshot.localWeight === 22
            && afterSnapshot.hasLevel
            && afterSnapshot.hasRecruitSyncedState
            && failedRequests.length === 0
            && messages.length === 0;

        const result = { ok, afterUnlock, afterSnapshot, unlockRequests, catSnapshotRequests, failedRequests, messages };
        console.log(JSON.stringify(result, null, 2));
        if (!ok) process.exit(1);
    } finally {
        api.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
