const { chromium } = require("playwright-core");
const { startApiProcess } = require("./start-api-process");
const os = require("os");
const path = require("path");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const apiUrl = "http://localhost:5144";
const url = `http://localhost:7456/?api=${encodeURIComponent(apiUrl)}&dailyorder=${Date.now()}`;

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
    try {
        await waitForApi();
        const browser = await chromium.launch({ executablePath: edgePath });
        const page = await browser.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 1 });
        const messages = [];
        const failedRequests = [];
        const dailyResponses = [];
        const launchResponses = [];
        page.on("console", (message) => {
            if (message.type() === "error" || message.type() === "warning") {
                messages.push({ type: message.type(), text: message.text(), location: message.location() });
            }
        });
        page.on("pageerror", (error) => {
            messages.push({ type: "pageerror", text: error.stack || error.message });
        });
        page.on("response", (response) => {
            if (response.url().includes("/api/daily-order")) {
                dailyResponses.push({ status: response.status(), method: response.request().method(), url: response.url() });
            }
            if (response.url().includes("/api/launch")) {
                launchResponses.push({ status: response.status(), method: response.request().method(), url: response.url() });
            }
            if (response.status() >= 400) {
                failedRequests.push({ status: response.status(), url: response.url() });
            }
        });

        await page.goto(url, { waitUntil: "load", timeout: 15000 });
        await page.waitForFunction(() =>
            document.querySelector("#fatcat-dom-factory .order")?.getAttribute("data-daily-progress") === "56"
                && document.querySelector("#fatcat-dom-factory .launch")?.getAttribute("data-launches-remaining") === "5",
        { timeout: 12000 });

        const progressStates = [56];
        for (let index = 1; index <= 4; index += 1) {
            const expectedProgress = 56 + index;
            await page.click("button[title='launch']");
            await page.waitForFunction((expected) =>
                document.querySelector("#fatcat-dom-factory .order")?.getAttribute("data-daily-progress") === String(expected),
            expectedProgress, { timeout: 10000 });
            progressStates.push(expectedProgress);
        }

        const ready = await page.evaluate(() => {
            const chest = document.querySelector("#fatcat-dom-factory .chest");
            return {
                text: chest?.textContent?.trim() || "",
                enabled: chest instanceof HTMLButtonElement && !chest.disabled,
                claimable: chest?.getAttribute("data-daily-claimable"),
                progress: document.querySelector("#fatcat-dom-factory .order")?.getAttribute("data-daily-progress"),
            };
        });

        await page.click("button[title='claim chest']");
        await page.waitForFunction(() =>
            document.querySelector("#fatcat-dom-factory .chest")?.getAttribute("data-daily-claimed") === "true",
        { timeout: 10000 });
        const claimed = await page.evaluate(() => {
            const chest = document.querySelector("#fatcat-dom-factory .chest");
            return {
                text: chest?.textContent?.trim() || "",
                disabled: chest instanceof HTMLButtonElement && chest.disabled,
                claimable: chest?.getAttribute("data-daily-claimable"),
                claimed: chest?.getAttribute("data-daily-claimed"),
                message: document.querySelector("#fatcat-dom-factory .factory-msg")?.textContent?.trim() || "",
                errorStack: document.querySelector(".error-stack")?.textContent?.trim() || "",
            };
        });

        await page.click("button[title='launch']");
        await page.waitForFunction(() =>
            document.querySelector("#fatcat-dom-factory .launch")?.getAttribute("data-launches-remaining") === "0",
        { timeout: 10000 });
        progressStates.push(60);
        const exhausted = await page.evaluate(() => {
            const launch = document.querySelector("#fatcat-dom-factory .launch");
            const count = document.querySelector("#fatcat-dom-factory .launch-count");
            return {
                launchesUsed: launch?.getAttribute("data-launches-used"),
                launchLimit: launch?.getAttribute("data-launch-limit"),
                launchesRemaining: launch?.getAttribute("data-launches-remaining"),
                disabled: launch instanceof HTMLButtonElement && launch.disabled,
                countText: count?.textContent?.trim() || "",
            };
        });
        const requestCountBeforeBlockedClick = launchResponses.length;
        await page.click("button[title='launch']");
        await page.waitForFunction(() =>
            document.querySelector("#fatcat-dom-factory .factory-msg")?.textContent?.includes("次数已用完"),
        { timeout: 4000 });
        await page.waitForTimeout(250);
        const blockedToast = await page.evaluate(() => {
            const toast = document.querySelector("#fatcat-dom-factory .factory-msg");
            const floorCard = document.querySelector("#fatcat-dom-factory .floor:last-child .floor-card");
            const bonus = document.querySelector("#fatcat-dom-factory .floor:last-child .bonus");
            const toastRect = toast?.getBoundingClientRect();
            const floorRect = floorCard?.getBoundingClientRect();
            const bonusRect = bonus?.getBoundingClientRect();
            return {
                message: toast?.textContent?.trim() || "",
                textFits: toast ? toast.scrollWidth <= toast.clientWidth + 1 : false,
                clearsCards: !!toastRect && !!floorRect && !!bonusRect
                    && toastRect.left >= floorRect.right - 2
                    && toastRect.right <= bonusRect.left + 2,
            };
        });
        const screenshot = path.join(os.tmpdir(), "fatcat-daily-launch-exhausted-414x896.png");
        await page.screenshot({ path: screenshot, fullPage: false });

        await browser.close();
        const ok = progressStates.join(",") === "56,57,58,59,60,60"
            && ready.text === "可领取"
            && ready.enabled
            && ready.claimable === "true"
            && ready.progress === "60"
            && claimed.text === "已领取"
            && claimed.disabled
            && claimed.claimable === "false"
            && claimed.claimed === "true"
            && claimed.message.includes("+1000 金币")
            && claimed.message.includes("+10 研究点")
            && exhausted.launchesUsed === "5"
            && exhausted.launchLimit === "5"
            && exhausted.launchesRemaining === "0"
            && exhausted.disabled
            && exhausted.countText === "今日剩余次数：0/5"
            && blockedToast.message.includes("次数已用完")
            && blockedToast.textFits
            && blockedToast.clearsCards
            && requestCountBeforeBlockedClick === 5
            && launchResponses.length === 5
            && launchResponses.every((item) => item.status === 200)
            && dailyResponses.some((item) => item.method === "GET" && item.status === 200)
            && dailyResponses.some((item) => item.method === "POST" && item.status === 200)
            && messages.length === 0
            && failedRequests.length === 0;
        console.log(JSON.stringify({ ok, progressStates, ready, claimed, exhausted, blockedToast, screenshot, dailyResponses, launchResponses, messages, failedRequests }, null, 2));
        if (!ok) process.exit(1);
    } finally {
        api.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
