export type FriendVisitReportKind = "visit" | "gift" | "help";

export type FriendVisitReportView = {
    friendId: string;
    friendName: string;
    kind: FriendVisitReportKind;
    rewardText: string;
    statusText: string;
    updatedTimeText: string;
    friendIncomeText: string;
    canHelp: boolean;
    timeline: string[];
    floors: { floor: string; productionText: string }[];
};

const ACTION_LABELS: Record<FriendVisitReportKind, string> = {
    visit: "访问报告",
    gift: "送礼报告",
    help: "助力报告",
};

const BADGE_LABELS: Record<FriendVisitReportKind, string> = {
    visit: "访",
    gift: "礼",
    help: "助",
};

export function renderFriendVisitReportCard(report: FriendVisitReportView): string {
    const timeline = (report.timeline.length > 0 ? report.timeline : [report.statusText, report.rewardText, report.friendIncomeText])
        .slice(0, 3)
        .map((item, index) => `<span><i>${index + 1}</i><b>${item}</b></span>`)
        .join("");
    const floorRows = report.floors
        .slice(0, 3)
        .map(room => `<span>${room.floor}<em>${room.productionText}</em></span>`)
        .join("");

    return `<div class="friend-visit-report"><div class="visit-report-head"><span class="visit-report-badge">${BADGE_LABELS[report.kind]}</span><div class="visit-report-copy"><b>${report.friendName} ${ACTION_LABELS[report.kind]}</b><em>${report.statusText} · ${report.updatedTimeText}</em></div><button class="visit-report-close" data-action="closeFriendVisitReport">×</button></div><div class="visit-report-grid"><span>互动奖励<b>${report.rewardText}</b></span><span>好友收益<b>${report.friendIncomeText}</b></span></div><div class="visit-report-timeline">${timeline}</div><div class="visit-report-floors">${floorRows}</div><div class="visit-report-actions"><button class="tag" data-action="visitFriend" data-id="${report.friendId}">再次访问</button><button class="tag warn" data-action="sendFriendGift" data-id="${report.friendId}">赠送猫粮</button><button class="tag boost" data-action="helpFriend" data-id="${report.friendId}" ${report.canHelp ? "" : "disabled"}>生产助力</button></div></div>`;
}
