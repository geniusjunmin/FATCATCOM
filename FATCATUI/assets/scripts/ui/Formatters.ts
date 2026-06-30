export function formatCompactNumber(value: number): string {
    const absValue = Math.abs(value);
    if (absValue >= 100000000) {
        return `${trimNumber(value / 100000000)}B`;
    }
    if (absValue >= 1000000) {
        return `${trimNumber(value / 1000000)}M`;
    }
    if (absValue >= 1000) {
        return `${trimNumber(value / 1000)}K`;
    }
    return Math.floor(value).toString();
}

export function formatSignedPercent(value: number): string {
    const sign = value > 0 ? "+" : "";
    return `${sign}${trimNumber(value)}%`;
}

export function formatDisplayNumber(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2).replace(/\.00$/, "")}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2).replace(/\.00$/, "")}K`;
    return `${Math.floor(value)}`;
}

export function formatRateValue(value: number): string {
    if (value >= 10) return formatDisplayNumber(value);
    if (value >= 1) return value.toFixed(1).replace(/\.0$/, "");
    if (value > 0) return value.toFixed(2).replace(/0$/, "");
    return "0";
}

export function formatClockTime(timestamp: number): string {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatFriendReportRelativeTime(timestamp: number, now = Date.now()): string {
    if (!timestamp) return "刚刚";
    const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
    if (seconds < 60) return "刚刚";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分钟前`;
    return formatClockTime(timestamp);
}

function trimNumber(value: number): string {
    return value.toFixed(2).replace(/\.?0+$/, "");
}
