export type SettingsAccountCardView = {
    apiBase: string;
    playerId: string;
    networkMode: string;
    syncMode: string;
    pendingChanges: number;
    lastError: string;
    connected: boolean;
};

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function renderSettingsAccountCard(view: SettingsAccountCardView): string {
    const state = view.connected ? "connected" : "offline";
    const stateLabel = view.connected ? "已连接" : "离线模式";
    const errorText = view.lastError || "无";

    return `<section class="feature-card settings-account-card ${state}" data-account-state="${state}"><div class="settings-account-head"><span class="account-connection-dot"></span><div><b>账号与同步</b><em>${escapeHtml(view.networkMode)} · ${escapeHtml(view.syncMode)}</em></div><strong>${stateLabel}</strong></div><div class="settings-account-grid"><span>API 节点<b title="${escapeHtml(view.apiBase)}">${escapeHtml(view.apiBase)}</b></span><span>玩家标识<b>${escapeHtml(view.playerId)}</b></span><span>待同步<b>${Math.max(0, Math.floor(view.pendingChanges))} 项</b></span><span class="account-error">最近错误<b title="${escapeHtml(errorText)}">${escapeHtml(errorText)}</b></span></div><div class="settings-account-actions"><button class="tag primary" data-action="connectServer">连接服务器</button><button class="tag" data-action="syncSave">同步存档</button><button class="tag warn" data-action="pushSettings">推送设置</button><button class="tag" data-action="previewProduction">结算预览</button><button class="tag" data-action="refreshServerStatus">状态诊断</button></div></section>`;
}
