const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outDir = path.resolve("docs/verification/screenshots/2026-06-29-utility-regression");
const sizes = [
    [430, 932],
    [360, 800],
    [768, 1024],
];
const panels = [
    ["tasks", "tasks", "task-shell"],
    ["achievements", "achievements", "achievement-shell"],
    ["mail", "mail", "mail-shell"],
    ["friends", "friends", "friends-shell"],
    ["settings", "settings", "settings-shell"],
];

async function isVisible(page, selector) {
    return page.evaluate((value) => {
        const element = document.querySelector(value);
        if (!element) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    }, selector);
}

(async () => {
    fs.mkdirSync(outDir, { recursive: true });
    const browser = await chromium.launch({ executablePath: edgePath });
    const results = [];

    for (const [width, height] of sizes) {
        const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
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

        await page.goto(`http://localhost:7456/?utilityreg=${width}x${height}`, {
            waitUntil: "load",
            timeout: 15000,
        });
        await page.waitForTimeout(3500);

        for (const [panel, hotspotTitle, shellClass] of panels) {
            await page.click(`button[title="${hotspotTitle}"]`);
            await page.waitForTimeout(500);
            if (panel === "friends") {
                await page.click("#fatcat-dom-panel-overlay .friend-actions .tag");
                await page.waitForTimeout(400);
            }
            const file = path.join(outDir, `${panel}-${width}x${height}.png`);
            await page.screenshot({ path: file, fullPage: false });
            const state = await page.evaluate((expectedShell) => {
                const shell = document.querySelector("#fatcat-dom-panel-overlay .panel-shell");
                return {
                    title: document.querySelector("#fatcat-dom-panel-overlay h2")?.textContent?.trim() || "",
                    shellCount: document.querySelectorAll("#fatcat-dom-panel-overlay .panel-shell").length,
                    hasExpectedShell: !!shell?.classList.contains(expectedShell),
                    hasUtilityShell: !!shell?.classList.contains("utility-shell"),
                    heroCount: document.querySelectorAll("#fatcat-dom-panel-overlay .feature-hero").length,
                    miniCount: document.querySelectorAll("#fatcat-dom-panel-overlay .feature-mini span").length,
                    cardCount: document.querySelectorAll("#fatcat-dom-panel-overlay .feature-card").length,
                    taskBoard: !!document.querySelector("#fatcat-dom-panel-overlay .task-board"),
                    taskRows: document.querySelectorAll("#fatcat-dom-panel-overlay .task-row").length,
                    friendCards: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-card").length,
                    friendIncomeBars: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-income i").length,
                    friendActionButtons: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-actions .tag").length,
                    friendRequestCard: !!document.querySelector("#fatcat-dom-panel-overlay .friend-request-card"),
                    friendLeaderboardCard: !!document.querySelector("#fatcat-dom-panel-overlay .leaderboard-card"),
                    friendActivityCard: !!document.querySelector("#fatcat-dom-panel-overlay .friend-activity-card"),
                    friendSearchCard: !!document.querySelector("#fatcat-dom-panel-overlay .friend-search-card"),
                    friendSnapshotCard: !!document.querySelector("#fatcat-dom-panel-overlay .friend-snapshot-card"),
                    friendSnapshotStats: document.querySelectorAll("#fatcat-dom-panel-overlay .snapshot-stats span").length,
                    friendSnapshotActions: document.querySelectorAll("#fatcat-dom-panel-overlay .snapshot-action .tag").length,
                    friendSnapshotFloors: document.querySelectorAll("#fatcat-dom-panel-overlay .snapshot-floor").length,
                    friendVisitReport: !!document.querySelector("#fatcat-dom-panel-overlay .friend-visit-report"),
                    friendVisitReportStats: document.querySelectorAll("#fatcat-dom-panel-overlay .visit-report-grid span").length,
                    friendVisitReportFloors: document.querySelectorAll("#fatcat-dom-panel-overlay .visit-report-floors span").length,
                    friendVisitReportActions: document.querySelectorAll("#fatcat-dom-panel-overlay .visit-report-actions .tag").length,
                    friendFactoryDetail: !!document.querySelector("#fatcat-dom-panel-overlay .friend-factory-detail"),
                    friendFactoryDetailStats: document.querySelectorAll("#fatcat-dom-panel-overlay .factory-detail-stats span").length,
                    friendFactoryRoomRows: document.querySelectorAll("#fatcat-dom-panel-overlay .factory-room-row").length,
                    visibleHeight: shell ? Math.round(shell.getBoundingClientRect().height) : 0,
                };
            }, shellClass);
            results.push({
                panel,
                size: `${width}x${height}`,
                file,
                visible: await isVisible(page, "#fatcat-dom-panel-overlay .panel-shell"),
                state,
            });
            await page.click("#fatcat-dom-panel-overlay .panel-close");
            await page.waitForTimeout(200);
        }

        results.push({
            panel: "runtime",
            size: `${width}x${height}`,
            messages,
            failedRequests,
        });
        await page.close();
    }

    await browser.close();
    console.log(JSON.stringify(results, null, 2));
    const failed = results.some((entry) => {
        if (entry.panel === "runtime") {
            return entry.messages.length > 0 || entry.failedRequests.length > 0;
        }
        if (!entry.visible || entry.state.shellCount !== 1 || !entry.state.title || !entry.state.hasExpectedShell || !entry.state.hasUtilityShell) return true;
        if (entry.panel === "tasks") return !entry.state.taskBoard || entry.state.taskRows < 1;
        if (entry.panel === "friends") return entry.state.heroCount !== 1 || entry.state.friendCards < 3 || entry.state.friendIncomeBars < 3 || entry.state.friendActionButtons < 6 || !entry.state.friendSnapshotCard || entry.state.friendSnapshotStats < 3 || entry.state.friendSnapshotActions < 2 || entry.state.friendSnapshotFloors < 3 || !entry.state.friendVisitReport || entry.state.friendVisitReportStats < 2 || entry.state.friendVisitReportFloors < 3 || entry.state.friendVisitReportActions < 2 || !entry.state.friendFactoryDetail || entry.state.friendFactoryDetailStats < 3 || entry.state.friendFactoryRoomRows < 3 || !entry.state.friendRequestCard || !entry.state.friendLeaderboardCard || !entry.state.friendActivityCard || !entry.state.friendSearchCard;
        if (entry.panel === "settings") return entry.state.heroCount !== 1 || entry.state.miniCount < 3 || entry.state.cardCount < 4;
        return entry.state.heroCount !== 1 || entry.state.cardCount < 1;
    });
    if (failed) process.exit(1);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
