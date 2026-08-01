export type FriendListCardView = {
    id: string;
    rank: number;
    name: string;
    level: number;
    incomeText: string;
    profileMarkup: string;
    incomePercent: number;
    statusText: string;
    visitText: string;
    giftText: string;
    helpText: string;
    giftActionText: string;
    helpActionText: string;
    canHelp: boolean;
};

export type FriendSearchCardView = {
    query: string;
    message: string;
    preview: {
        companyName: string;
        detailText: string;
        isSelf: boolean;
        isFriend: boolean;
    } | null;
};

export type FriendRequestCardView = {
    received: Array<{ id: string; companyName: string; detailText: string }>;
    sent: Array<{ companyName: string }>;
};

export type FriendLeaderboardCardView = {
    selfRankText: string;
    entries: Array<{ rank: number; companyName: string; scoreText: string; isSelf: boolean }>;
};

export type FriendActivityCardView = {
    total: number;
    entries: Array<{ label: string; friendName: string; timeText: string }>;
};

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string): string {
    return escapeHtml(value);
}

function clampPercent(value: number): number {
    return Math.max(0, Math.min(100, Math.floor(value)));
}

export function renderFriendListCards(friends: FriendListCardView[]): string {
    const rows = friends.map(friend => {
        const id = escapeAttribute(friend.id);
        return `<div class="feature-card friend-card" data-friend-id="${id}"><span class="friend-avatar"><i class="friend-rank">#${Math.max(1, Math.floor(friend.rank))}</i></span><div class="friend-copy"><b>${escapeHtml(friend.name)}</b><em>公司 Lv.${Math.max(1, Math.floor(friend.level))} · 工厂收益 ${escapeHtml(friend.incomeText)}</em>${friend.profileMarkup}<div class="friend-income"><i style="width:${clampPercent(friend.incomePercent)}%"></i></div><div class="friend-states"><span>${escapeHtml(friend.statusText)}</span><span>${escapeHtml(friend.visitText)}</span><span>${escapeHtml(friend.giftText)}</span><span>${escapeHtml(friend.helpText)}</span></div></div><div class="friend-actions"><button class="tag" data-action="visitFriend" data-id="${id}">访问工厂</button><button class="tag warn" data-action="sendFriendGift" data-id="${id}">${escapeHtml(friend.giftActionText)}</button><button class="tag boost" data-action="helpFriend" data-id="${id}" ${friend.canHelp ? "" : "disabled"}>${escapeHtml(friend.helpActionText)}</button></div></div>`;
    }).join("");

    return `<section class="feature-list friend-list" data-social-card="friend-list"><div class="friend-list-head social-card-head"><b>好友名册</b><span>${friends.length} 家工厂</span></div>${rows}</section>`;
}

export function renderFriendSearchCard(view: FriendSearchCardView): string {
    const result = view.preview
        ? `<div class="friend-search-result"><div><b>${escapeHtml(view.preview.companyName)}</b><em>${escapeHtml(view.preview.detailText)}</em></div><button class="tag" data-action="sendFriendRequestInline" ${view.preview.isSelf || view.preview.isFriend ? "disabled" : ""}>${view.preview.isFriend ? "已是好友" : view.preview.isSelf ? "自己" : "发送申请"}</button></div>`
        : view.message
            ? `<div class="friend-search-result"><div><b>${escapeHtml(view.message)}</b><em>输入 FC 开头邀请码或玩家ID。</em></div></div>`
            : "";
    return `<section class="friend-search-card" data-social-card="friend-search"><div class="social-card-head"><b>寻找好友</b><span>邀请码 / 玩家ID</span></div><div class="friend-search-row"><input data-field="friendSearch" value="${escapeAttribute(view.query)}" placeholder="输入邀请码或玩家ID"><button class="tag" data-action="searchFriendInline">搜索</button><button class="tag warn" data-action="sendFriendRequest">旧版输入</button></div>${result}</section>`;
}

export function renderFriendRequestCard(view: FriendRequestCardView): string {
    const receivedRows = view.received.map(request => {
        const id = escapeAttribute(request.id);
        return `<div class="request-row incoming"><span>申请</span><b>${escapeHtml(request.companyName)}</b><em>${escapeHtml(request.detailText)}</em><button class="tag" data-action="acceptFriendRequest" data-id="${id}">接受</button><button class="tag warn" data-action="rejectFriendRequest" data-id="${id}">拒绝</button></div>`;
    }).join("");
    const sentRows = view.sent.map(request => `<div class="request-row sent"><span>已发</span><b>${escapeHtml(request.companyName)}</b><em>等待回应</em></div>`).join("");
    const empty = receivedRows || sentRows ? "" : `<div class="activity-empty">暂无好友申请。可通过邀请码向玩家发送申请。</div>`;
    return `<section class="friend-request-card" data-social-card="friend-requests"><div class="leaderboard-head social-card-head"><b>好友申请</b><span>${view.received.length} 待处理</span></div>${receivedRows}${sentRows}${empty}</section>`;
}

export function renderFriendLeaderboardCard(view: FriendLeaderboardCardView): string {
    if (view.entries.length <= 0) {
        return `<section class="leaderboard-card" data-social-card="friend-leaderboard"><div class="social-card-head"><b>收益排行榜</b><span>好友收益竞赛</span></div><div class="social-card-empty">联网后显示好友与自己的咖啡收益名次。</div><span class="tag warn">等待同步</span></section>`;
    }
    const rows = view.entries.map(entry => `<div class="leaderboard-row ${entry.isSelf ? "self" : ""}"><span>#${Math.max(1, Math.floor(entry.rank))}</span><b>${escapeHtml(entry.companyName)}</b><em>${escapeHtml(entry.scoreText)}</em></div>`).join("");
    return `<section class="leaderboard-card" data-social-card="friend-leaderboard"><div class="leaderboard-head social-card-head"><b>收益排行榜</b><span>我的名次 ${escapeHtml(view.selfRankText)}</span></div>${rows}</section>`;
}

export function renderFriendActivityCard(view: FriendActivityCardView): string {
    if (view.entries.length <= 0) {
        return `<section class="friend-activity-card" data-social-card="friend-activity"><div class="leaderboard-head social-card-head"><b>好友动态</b><span>暂无记录</span></div><div class="activity-empty">访问、送礼或添加好友后会同步到这里。</div></section>`;
    }
    const rows = view.entries.map(activity => `<div class="activity-row"><span>${escapeHtml(activity.label)}</span><b>${escapeHtml(activity.friendName)}</b><em>${escapeHtml(activity.timeText)}</em></div>`).join("");
    return `<section class="friend-activity-card" data-social-card="friend-activity"><div class="leaderboard-head social-card-head"><b>好友动态</b><span>${Math.max(view.total, view.entries.length)}条</span></div>${rows}</section>`;
}
