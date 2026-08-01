const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outDir = path.resolve("docs/verification/screenshots/2026-07-01-utility-regression");
const sizes = [
    [430, 932],
    [414, 896],
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
                    domCanvasHidden: document.querySelector("canvas")?.style.opacity === "0",
                    shellCount: document.querySelectorAll("#fatcat-dom-panel-overlay .panel-shell").length,
                    hasExpectedShell: !!shell?.classList.contains(expectedShell),
                    hasUtilityShell: !!shell?.classList.contains("utility-shell"),
                    heroCount: document.querySelectorAll("#fatcat-dom-panel-overlay .feature-hero").length,
                    miniCount: document.querySelectorAll("#fatcat-dom-panel-overlay .feature-mini span").length,
                    cardCount: document.querySelectorAll("#fatcat-dom-panel-overlay .feature-card").length,
                    achievementAuthority: document.querySelector("#fatcat-dom-panel-overlay .achievement-shell")?.getAttribute("data-achievement-authority") ?? "",
                    achievementCount: Number(document.querySelector("#fatcat-dom-panel-overlay .achievement-shell")?.getAttribute("data-achievement-count") ?? -1),
                    achievementClaimable: Number(document.querySelector("#fatcat-dom-panel-overlay .achievement-shell")?.getAttribute("data-achievement-claimable") ?? -1),
                    achievementCardsContained: Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .achievement-shell .feature-card")).every(node => {
                        const rect = node.getBoundingClientRect();
                        const shellRect = document.querySelector("#fatcat-dom-panel-overlay .achievement-shell")?.getBoundingClientRect();
                        return !!shellRect && rect.left >= shellRect.left - 1 && rect.right <= shellRect.right + 1;
                    }),
                    utilityTitlePins: (() => {
                        const title = document.querySelector("#fatcat-dom-panel-overlay .utility-shell h2");
                        return !!title && getComputedStyle(title, "::before").content !== "none" && getComputedStyle(title, "::after").content !== "none";
                    })(),
                    utilityHeroIconFramed: (() => {
                        const icon = document.querySelector("#fatcat-dom-panel-overlay .utility-shell .feature-hero .feature-icon");
                        return !!icon && getComputedStyle(icon).borderStyle !== "none" && getComputedStyle(icon).boxShadow !== "none";
                    })(),
                    utilityCardPins: Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .utility-shell .feature-card"))
                        .filter(node => getComputedStyle(node, "::before").content !== "none").length,
                    utilityMiniMedallions: Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .utility-shell .feature-mini span"))
                        .filter(node => getComputedStyle(node, "::before").content !== "none").length,
                    settingsToggleKnobs: Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .settings-shell .toggle-pill"))
                        .filter(node => getComputedStyle(node, "::before").content !== "none").length,
                    taskBoard: !!document.querySelector("#fatcat-dom-panel-overlay .task-board"),
                    taskRows: document.querySelectorAll("#fatcat-dom-panel-overlay .task-row").length,
                    taskAuthority: document.querySelector("#fatcat-dom-panel-overlay .task-shell")?.getAttribute("data-task-authority") ?? "",
                    taskCount: Number(document.querySelector("#fatcat-dom-panel-overlay .task-shell")?.getAttribute("data-task-count") ?? -1),
                    taskClaimable: Number(document.querySelector("#fatcat-dom-panel-overlay .task-shell")?.getAttribute("data-task-claimable") ?? -1),
                    taskProgressOverflow: Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .task-row")).some(node =>
                        Number(node.getAttribute("data-task-progress")) > Number(node.getAttribute("data-task-target"))),
                    friendCards: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-card").length,
                    friendIncomeBars: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-income i").length,
                    friendActionButtons: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-actions .tag").length,
                    friendHelpButtons: document.querySelectorAll('#fatcat-dom-panel-overlay [data-action="helpFriend"]').length,
                    friendCoopCard: !!document.querySelector("#fatcat-dom-panel-overlay .friend-coop-card"),
                    friendCoopHeight: document.querySelector("#fatcat-dom-panel-overlay .friend-coop-card")?.getBoundingClientRect().height ?? 0,
                    friendCoopTiers: document.querySelectorAll("#fatcat-dom-panel-overlay .coop-tier").length,
                    friendCooperationCards: document.querySelectorAll("#fatcat-dom-panel-overlay [data-cooperation-card]").length,
                    friendBoostHistory: !!document.querySelector("#fatcat-dom-panel-overlay .friend-boost-history"),
                    friendBoostHistoryContained: (() => {
                        const card = document.querySelector("#fatcat-dom-panel-overlay .friend-boost-history");
                        const rect = card?.getBoundingClientRect();
                        return !!rect && rect.left >= -1 && rect.right <= window.innerWidth + 1;
                    })(),
                    friendProfileGroups: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-profile-meta").length,
                    friendProfileMarkers: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-profile-meta[data-profile-kind]").length,
                    friendProfileChips: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-profile-meta span").length,
                    realFriendProfiles: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-profile-meta.real-player").length,
                    systemFriendProfiles: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-profile-meta.system-player").length,
                    friendPresenceStates: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-profile-meta .presence-state").length,
                    friendRequestCard: !!document.querySelector("#fatcat-dom-panel-overlay .friend-request-card"),
                    friendLeaderboardCard: !!document.querySelector("#fatcat-dom-panel-overlay .leaderboard-card"),
                    friendActivityCard: !!document.querySelector("#fatcat-dom-panel-overlay .friend-activity-card"),
                    friendSearchCard: !!document.querySelector("#fatcat-dom-panel-overlay .friend-search-card"),
                    friendSocialCards: document.querySelectorAll("#fatcat-dom-panel-overlay [data-social-card]").length,
                    friendSocialCardsContained: Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay [data-social-card]")).every(node => {
                        const rect = node.getBoundingClientRect();
                        const shell = document.querySelector("#fatcat-dom-panel-overlay .friends-shell")?.getBoundingClientRect();
                        return !!shell && rect.left >= shell.left - 1 && rect.right <= shell.right + 1;
                    }),
                    friendSearchInputs: document.querySelectorAll('#fatcat-dom-panel-overlay [data-social-card="friend-search"] input[data-field="friendSearch"]').length,
                    friendSearchActions: document.querySelectorAll('#fatcat-dom-panel-overlay [data-social-card="friend-search"] [data-action]').length,
                    friendSnapshotCard: !!document.querySelector("#fatcat-dom-panel-overlay .friend-snapshot-card"),
                    friendSnapshotStats: document.querySelectorAll("#fatcat-dom-panel-overlay .snapshot-stats span").length,
                    friendSnapshotActions: document.querySelectorAll("#fatcat-dom-panel-overlay .snapshot-action .tag").length,
                    friendSnapshotFloors: document.querySelectorAll("#fatcat-dom-panel-overlay .snapshot-floor").length,
                    friendVisitReport: !!document.querySelector("#fatcat-dom-panel-overlay .friend-visit-report"),
                    friendVisitReportStats: document.querySelectorAll("#fatcat-dom-panel-overlay .visit-report-grid span").length,
                    friendVisitReportTimeline: document.querySelectorAll("#fatcat-dom-panel-overlay .visit-report-timeline span").length,
                    friendVisitReportTimelineBadges: document.querySelectorAll("#fatcat-dom-panel-overlay .visit-report-timeline i").length,
                    friendVisitReportFloors: document.querySelectorAll("#fatcat-dom-panel-overlay .visit-report-floors span").length,
                    friendVisitReportActions: document.querySelectorAll("#fatcat-dom-panel-overlay .visit-report-actions .tag").length,
                    friendVisitScene: !!document.querySelector("#fatcat-dom-panel-overlay .friend-visit-scene"),
                    friendVisitSceneSignRoof: (() => {
                        const sign = document.querySelector("#fatcat-dom-panel-overlay .friend-scene-sign");
                        return !!sign && getComputedStyle(sign, "::before").content !== "none";
                    })(),
                    friendVisitSceneFloors: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-scene-floor").length,
                    friendVisitSceneStats: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-scene-side span").length,
                    friendVisitSceneActions: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-scene-actions .tag").length,
                    friendVisitScenePrimaryAction: (() => {
                        const action = document.querySelector("#fatcat-dom-panel-overlay .friend-scene-actions .tag:nth-child(2)");
                        return !!action && getComputedStyle(action).backgroundImage.includes("linear-gradient");
                    })(),
                    friendVisitSceneThumbs: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-scene-floor .room-thumb").length,
                    friendVisitSceneFloorMeters: Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .friend-scene-floor b"))
                        .filter(node => getComputedStyle(node, "::after").content !== "none").length,
                    friendVisitSceneCats: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-scene-floor .room-cats span").length,
                    friendVisitSceneMascot: !!document.querySelector("#fatcat-dom-panel-overlay .friend-scene-mascot i"),
                    friendVisitSceneRewards: document.querySelectorAll("#fatcat-dom-panel-overlay .friend-scene-reward span").length,
                    friendVisitSceneBackdrop: (() => {
                        const scene = document.querySelector("#fatcat-dom-panel-overlay .friend-visit-scene");
                        return scene ? getComputedStyle(scene).getPropertyValue("--friend-factory-art") : "";
                    })(),
                    friendVisitSceneSign: !!document.querySelector("#fatcat-dom-panel-overlay .friend-scene-sign"),
                    friendFactoryDetail: !!document.querySelector("#fatcat-dom-panel-overlay .friend-factory-detail"),
                    friendFactoryDetailStats: document.querySelectorAll("#fatcat-dom-panel-overlay .factory-detail-stats span").length,
                    friendFactoryRoomRows: document.querySelectorAll("#fatcat-dom-panel-overlay .factory-room-row").length,
                    friendFactoryRoomMeta: Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .factory-room-row small")).some((node) => (node.textContent || "").includes("猫") && (node.textContent || "").includes("装饰")),
                    friendDecorGroups: document.querySelectorAll("#fatcat-dom-panel-overlay .room-decor-tags").length,
                    friendDecorItems: document.querySelectorAll("#fatcat-dom-panel-overlay .room-decor-tags s").length,
                    settingsServerStatusCard: !!document.querySelector("#fatcat-dom-panel-overlay .server-status-card"),
                    settingsServerStatusGrid: document.querySelectorAll("#fatcat-dom-panel-overlay .server-status-grid span").length,
                    settingsServerStatusFeatures: document.querySelectorAll("#fatcat-dom-panel-overlay .server-status-features span").length,
                    settingsServerStatusRefresh: !!document.querySelector('#fatcat-dom-panel-overlay [data-action="refreshServerStatus"]'),
                    settingsServerStatusContained: (() => {
                        const card = document.querySelector("#fatcat-dom-panel-overlay .server-status-card");
                        const rect = card?.getBoundingClientRect();
                        return !!rect && rect.left >= -1 && rect.right <= window.innerWidth + 1;
                    })(),
                    settingsAccountCard: !!document.querySelector("#fatcat-dom-panel-overlay .settings-account-card"),
                    settingsAccountState: document.querySelector("#fatcat-dom-panel-overlay .settings-account-card")?.getAttribute("data-account-state") ?? "",
                    settingsAccountGrid: document.querySelectorAll("#fatcat-dom-panel-overlay .settings-account-grid span").length,
                    settingsAccountActions: document.querySelectorAll("#fatcat-dom-panel-overlay .settings-account-actions .tag").length,
                    settingsAccountTextVisible: (() => {
                        const title = document.querySelector("#fatcat-dom-panel-overlay .settings-account-head b");
                        const value = document.querySelector("#fatcat-dom-panel-overlay .settings-account-grid b");
                        return !!title && !!value && (title.textContent || "").trim().length > 0 && parseFloat(getComputedStyle(title).fontSize) >= 10 && parseFloat(getComputedStyle(value).fontSize) >= 9;
                    })(),
                    settingsAccountButtonTextVisible: Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .settings-account-actions .tag"))
                        .every(button => (button.textContent || "").trim().length > 0 && parseFloat(getComputedStyle(button).fontSize) >= 8),
                    settingsAccountContained: (() => {
                        const card = document.querySelector("#fatcat-dom-panel-overlay .settings-account-card");
                        const rect = card?.getBoundingClientRect();
                        return !!rect && rect.left >= -1 && rect.right <= window.innerWidth + 1;
                    })(),
                    settingsAccountActionsContained: (() => {
                        const card = document.querySelector("#fatcat-dom-panel-overlay .settings-account-card");
                        const cardRect = card?.getBoundingClientRect();
                        const actions = Array.from(document.querySelectorAll("#fatcat-dom-panel-overlay .settings-account-actions .tag"));
                        return !!cardRect && actions.length === 5 && actions.every(action => {
                            const rect = action.getBoundingClientRect();
                            return rect.left >= cardRect.left - 1 && rect.right <= cardRect.right + 1 && rect.top >= cardRect.top - 1 && rect.bottom <= cardRect.bottom + 1;
                        });
                    })(),
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
        if (!entry.visible || !entry.state.domCanvasHidden || entry.state.shellCount !== 1 || !entry.state.title || !entry.state.hasExpectedShell || !entry.state.hasUtilityShell) return true;
        if (entry.panel === "tasks") return !entry.state.utilityTitlePins || !entry.state.taskBoard || entry.state.taskRows < 1 || !["offline", "server"].includes(entry.state.taskAuthority) || entry.state.taskCount < 1 || entry.state.taskClaimable < 0 || entry.state.taskProgressOverflow;
        const lacksUtilityMaterial = !entry.state.utilityTitlePins || !entry.state.utilityHeroIconFramed || (entry.state.cardCount > 0 && entry.state.utilityCardPins < entry.state.cardCount) || (entry.state.miniCount > 0 && entry.state.utilityMiniMedallions < entry.state.miniCount);
        if (entry.panel === "achievements") return lacksUtilityMaterial || !["offline", "server"].includes(entry.state.achievementAuthority) || entry.state.achievementCount < 1 || entry.state.achievementClaimable < 0 || !entry.state.achievementCardsContained;
        if (entry.panel === "friends") return lacksUtilityMaterial || entry.state.heroCount !== 1 || entry.state.friendCards < 3 || entry.state.friendIncomeBars < 3 || entry.state.friendActionButtons < 9 || entry.state.friendHelpButtons < 6 || !entry.state.friendCoopCard || entry.state.friendCoopHeight < 95 || entry.state.friendCoopHeight > 165 || entry.state.friendCoopTiers !== 3 || entry.state.friendCooperationCards !== 2 || !entry.state.friendBoostHistory || !entry.state.friendBoostHistoryContained || entry.state.friendProfileGroups < 5 || entry.state.friendProfileMarkers !== entry.state.friendProfileGroups || entry.state.friendProfileChips < 15 || entry.state.realFriendProfiles + entry.state.systemFriendProfiles < 5 || entry.state.friendPresenceStates < 5 || !entry.state.friendSnapshotCard || entry.state.friendSnapshotStats < 3 || entry.state.friendSnapshotActions < 3 || entry.state.friendSnapshotFloors < 3 || !entry.state.friendVisitReport || entry.state.friendVisitReportStats < 2 || entry.state.friendVisitReportTimeline < 3 || entry.state.friendVisitReportTimelineBadges < 3 || entry.state.friendVisitReportFloors < 3 || entry.state.friendVisitReportActions < 3 || !entry.state.friendVisitScene || !entry.state.friendVisitSceneSignRoof || entry.state.friendVisitSceneFloors < 3 || entry.state.friendVisitSceneStats < 5 || entry.state.friendVisitSceneActions < 5 || !entry.state.friendVisitScenePrimaryAction || entry.state.friendVisitSceneThumbs < 3 || entry.state.friendVisitSceneFloorMeters < 3 || entry.state.friendVisitSceneCats < 3 || !entry.state.friendVisitSceneMascot || entry.state.friendVisitSceneRewards < 3 || !entry.state.friendVisitSceneSign || !entry.state.friendVisitSceneBackdrop.includes("data:image/jpeg") || !entry.state.friendFactoryDetail || entry.state.friendFactoryDetailStats < 3 || entry.state.friendFactoryRoomRows < 3 || !entry.state.friendFactoryRoomMeta || entry.state.friendDecorGroups < 6 || entry.state.friendDecorItems < 12 || !entry.state.friendRequestCard || !entry.state.friendLeaderboardCard || !entry.state.friendActivityCard || !entry.state.friendSearchCard || entry.state.friendSocialCards !== 5 || !entry.state.friendSocialCardsContained || entry.state.friendSearchInputs !== 1 || entry.state.friendSearchActions < 2;
        if (entry.panel === "settings") return lacksUtilityMaterial || entry.state.heroCount !== 1 || entry.state.miniCount < 3 || entry.state.cardCount < 5 || entry.state.settingsToggleKnobs < 3 || !entry.state.settingsServerStatusCard || !entry.state.settingsServerStatusRefresh || !entry.state.settingsServerStatusContained || !entry.state.settingsAccountCard || entry.state.settingsAccountGrid !== 4 || entry.state.settingsAccountActions !== 5 || !entry.state.settingsAccountTextVisible || !entry.state.settingsAccountButtonTextVisible || !entry.state.settingsAccountContained || !entry.state.settingsAccountActionsContained;
        return lacksUtilityMaterial || entry.state.heroCount !== 1 || entry.state.cardCount < 1;
    });
    if (failed) process.exit(1);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
