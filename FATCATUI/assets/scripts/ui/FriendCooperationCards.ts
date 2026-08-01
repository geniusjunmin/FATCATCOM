export type FriendCoopTierCardView = {
    tierId: string;
    target: number;
    rewardText: string;
    claimable: boolean;
    claimed: boolean;
};

export type FriendCoopGoalCardView = {
    progress: number;
    target: number;
    tiers: FriendCoopTierCardView[];
};

export type FriendBoostHistoryCardView = {
    activeBoostPercent: number;
    maxBoostPercent: number;
    activeContributionCount: number;
    entries: Array<{
        sourceName: string;
        timeText: string;
        stateText: string;
        boostPercent: number;
        active: boolean;
    }>;
};

export type FriendPresenceStatus = "online" | "recent" | "offline" | "system";

export type FriendProfileMetaView = {
    isRealPlayer: boolean;
    presenceStatus: FriendPresenceStatus;
    presenceText: string;
    details: string[];
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

export function formatFriendCoopRewardLabel(
    rewardType: string,
    rewardAmount: number,
    formatNumber: (value: number) => string,
): string {
    const label = rewardType === "diamond" ? "钻石" : rewardType === "researchPoint" ? "研究点" : "金币";
    return `${label} +${formatNumber(rewardAmount)}`;
}

export function renderFriendCoopGoalCard(view: FriendCoopGoalCardView): string {
    const progress = Math.max(0, Math.floor(view.progress));
    const target = Math.max(1, Math.floor(view.target));
    const percent = clampPercent(progress / target * 100);
    const claimedCount = view.tiers.filter(tier => tier.claimed).length;
    const claimableCount = view.tiers.filter(tier => tier.claimable).length;
    const state = claimableCount > 0
        ? `${claimableCount} 档可领取`
        : claimedCount === view.tiers.length
            ? "今日全部完成"
            : `还需 ${Math.max(0, target - progress)} 次助力`;
    const tiers = view.tiers.map(tier => {
        const tierId = escapeAttribute(tier.tierId);
        const action = tier.claimed
            ? `<button disabled>已领取</button>`
            : tier.claimable
                ? `<button class="ready" data-action="${tier.tierId === "assist_3" ? "claimFriendCoopGoal" : "claimFriendCoopTier"}" data-id="${tierId}">领取</button>`
                : `<button disabled>${progress}/${Math.max(1, Math.floor(tier.target))}</button>`;
        const stateClass = tier.claimed ? "claimed" : tier.claimable ? "claimable" : "locked";
        return `<div class="coop-tier ${stateClass}" data-coop-tier="${tierId}"><span>${Math.max(1, Math.floor(tier.target))} 次助力</span><b>${escapeHtml(tier.rewardText)}</b>${action}</div>`;
    }).join("");

    return `<section class="friend-coop-card ${claimableCount > 0 ? "ready" : ""}" data-cooperation-card="daily-goal"><div class="coop-icon">协</div><div class="coop-copy"><b>每日好友协作</b><em>真实好友助力逐档解锁，进度每日重置。</em><div class="coop-meter"><i style="width:${percent}%"></i></div><span>${progress}/${target} · ${state}</span></div><div class="coop-tiers">${tiers}</div></section>`;
}

export function renderFriendBoostHistoryCard(view: FriendBoostHistoryCardView): string {
    const rows = view.entries.slice(0, 6).map(entry => {
        const sourceName = escapeHtml(entry.sourceName || "好友");
        const sourceInitial = escapeHtml((entry.sourceName || "友").slice(0, 1));
        return `<div class="boost-history-row ${entry.active ? "active" : "expired"}"><span class="boost-source-avatar">${sourceInitial}</span><div><b>${sourceName}</b><em>${escapeHtml(entry.timeText)} · ${escapeHtml(entry.stateText)}</em></div><strong>+${Math.max(0, Math.floor(entry.boostPercent))}%</strong></div>`;
    }).join("");
    const content = rows || `<div class="boost-history-empty">尚无好友助力记录，邀请真实好友为工厂接力。</div>`;

    return `<section class="friend-boost-history" data-cooperation-card="boost-history"><div class="boost-history-head"><div><b>助力接力记录</b><span>每次 +10%，当前最多叠加 ${Math.max(1, Math.floor(view.maxBoostPercent))}%</span></div><strong>${Math.max(0, Math.floor(view.activeBoostPercent))}%<small>${Math.max(0, Math.floor(view.activeContributionCount))} 人生效</small></strong></div><div class="boost-history-list">${content}</div></section>`;
}

export function renderFriendProfileMeta(view: FriendProfileMetaView): string {
    const kind = view.isRealPlayer ? "real" : "system";
    const typeText = view.isRealPlayer ? "真人好友" : "系统好友";
    const details = view.details.map(detail => `<span>${escapeHtml(detail)}</span>`).join("");
    return `<div class="friend-profile-meta ${kind}-player" data-profile-kind="${kind}"><span>${typeText}</span><span class="presence-state ${view.presenceStatus}">${escapeHtml(view.presenceText)}</span>${details}</div>`;
}
