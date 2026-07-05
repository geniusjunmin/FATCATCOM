const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&catskinonline=${Date.now()}`;
const saveKey = "fatcat_company_save_v1";

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

async function openWardrobe(page) {
    await page.click('#fatcat-dom-nav [data-panel="cats"]');
    await page.waitForTimeout(600);
    await page.click('#fatcat-dom-cat-overlay [data-action="tab"][data-tab="skin"]');
    await page.waitForTimeout(350);
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
        const skinRequests = [];

        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text() });
            }
        });
        page.on("response", (response) => {
            if (response.url().includes("/api/cats/") && response.url().includes("/skins/")) {
                skinRequests.push({ status: response.status(), url: response.url() });
            }
            if (response.status() >= 400) {
                failedRequests.push({ status: response.status(), url: response.url() });
            }
        });

        await page.goto(url, { waitUntil: "load", timeout: 20000 });
        await page.evaluate((key) => localStorage.removeItem(key), saveKey);
        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForTimeout(2500);
        await openWardrobe(page);

        const initial = await page.evaluate((key) => {
            const save = JSON.parse(localStorage.getItem(key) || "{}");
            return {
                owned: save.cats?.c_001?.ownedSkinIds ?? [],
                equipped: save.cats?.c_001?.equippedSkinId ?? "",
                ownedMarkers: Array.from(document.querySelectorAll(".skin-card-target"))
                    .filter((element) => element.getAttribute("data-skin-owned") === "true")
                    .map((element) => element.getAttribute("data-skin-id")),
            };
        }, saveKey);

        await page.click('.skin-card-target[data-skin-id="apron"]');
        await page.click('.skin-preview-action');
        await page.waitForTimeout(900);
        const applied = await page.evaluate((key) => {
            const save = JSON.parse(localStorage.getItem(key) || "{}");
            return {
                equipped: save.cats?.c_001?.equippedSkinId ?? "",
                hero: document.querySelector(".portrait-cat")?.getAttribute("data-equipped-skin") ?? "",
                selected: document.querySelector(".skin-card-target.selected")?.getAttribute("data-skin-id") ?? "",
            };
        }, saveKey);

        await page.reload({ waitUntil: "load", timeout: 20000 });
        await page.waitForTimeout(2500);
        await openWardrobe(page);
        const persistedAfterReload = await page.evaluate((key) => {
            const save = JSON.parse(localStorage.getItem(key) || "{}");
            return {
                equipped: save.cats?.c_001?.equippedSkinId ?? "",
                hero: document.querySelector(".portrait-cat")?.getAttribute("data-equipped-skin") ?? "",
                equippedCard: document.querySelector(".skin-card-target.equipped")?.getAttribute("data-skin-id") ?? "",
            };
        }, saveKey);

        const requestsBeforeLockedPreview = skinRequests.length;
        await page.click('.skin-card-target[data-skin-id="manager"]');
        const locked = await page.evaluate((key) => {
            const save = JSON.parse(localStorage.getItem(key) || "{}");
            const action = document.querySelector(".skin-preview-action");
            return {
                actionDisabled: action?.hasAttribute("disabled") ?? false,
                selected: document.querySelector(".skin-card-target.selected")?.getAttribute("data-skin-id") ?? "",
                managerOwned: document.querySelector('.skin-card-target[data-skin-id="manager"]')?.getAttribute("data-skin-owned"),
                equipped: save.cats?.c_001?.equippedSkinId ?? "",
            };
        }, saveKey);
        await page.waitForTimeout(300);

        const ok = initial.owned.join(",") === "default,apron"
            && initial.equipped === "default"
            && initial.ownedMarkers.join(",") === "default,apron"
            && applied.equipped === "apron"
            && applied.hero === "apron"
            && applied.selected === "apron"
            && persistedAfterReload.equipped === "apron"
            && persistedAfterReload.hero === "apron"
            && persistedAfterReload.equippedCard === "apron"
            && locked.actionDisabled
            && locked.selected === "manager"
            && locked.managerOwned === "false"
            && locked.equipped === "apron"
            && skinRequests.length === requestsBeforeLockedPreview
            && skinRequests.some((item) => item.status === 200 && item.url.includes("/cats/c_001/skins/apron/equip"))
            && failedRequests.length === 0
            && messages.length === 0;

        console.log(JSON.stringify({
            ok,
            initial,
            applied,
            persistedAfterReload,
            locked,
            skinRequests,
            failedRequests,
            messages,
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
