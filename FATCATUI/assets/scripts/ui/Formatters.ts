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

function trimNumber(value: number): string {
    return value.toFixed(2).replace(/\.?0+$/, "");
}
