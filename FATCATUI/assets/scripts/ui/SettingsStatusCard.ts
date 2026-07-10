import { ServerStatusDto } from "../net/ApiTypes";

const SERVER_STATUS_FEATURE_LABELS: Record<string, string> = {
    "signed-guest-auth": "签名登录",
    "presence": "在线状态",
    "real-friends": "真实好友",
    "friend-requests": "好友申请",
    "visits": "拜访",
    "gifts": "赠礼",
    "cooperative-boosts": "协作加成",
    "cooperative-goals": "协作目标",
    "leaderboard": "排行榜",
    "social-events": "实时事件",
};

export function renderServerStatusCard(status: ServerStatusDto | null, checkedAt: number): string {
    const checkedLabel = checkedAt > 0 ? new Date(checkedAt).toLocaleTimeString() : "未检查";
    if (!status) {
        return `<div class="feature-card server-status-card offline" data-server-status="missing"><div><b>服务器状态</b><br>尚未读取公开状态端点。点击刷新可检查版本、实时通道和多人能力。</div><button class="tag" data-action="refreshServerStatus">刷新状态</button></div>`;
    }

    const chips = status.multiplayerFeatures
        .slice(0, 10)
        .map(feature => `<span>${SERVER_STATUS_FEATURE_LABELS[feature] ?? feature}</span>`)
        .join("");
    const realtimeLabel = status.realtime.socialEvents ? status.realtime.transport : "closed";
    return `<div class="feature-card server-status-card ready" data-server-status="${status.status}" data-api-version="${status.apiVersion}" data-config-version="${status.configVersion}"><div class="server-status-head"><b>服务器状态</b><em>${status.status}</em></div><div class="server-status-grid"><span>API<b>${status.apiVersion}</b></span><span>配置<b>${status.configVersion}</b></span><span>最低客户端<b>v${status.minClientVersion}</b></span><span>实时通道<b>${realtimeLabel}</b></span></div><div class="server-status-features">${chips}</div><small>令牌：${status.requiresPlayerToken ? "需要" : "不需要"} · 环境：${status.environment} · ${checkedLabel}</small><button class="tag" data-action="refreshServerStatus">刷新状态</button></div>`;
}
