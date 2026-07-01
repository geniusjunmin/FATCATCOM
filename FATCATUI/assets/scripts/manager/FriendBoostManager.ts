import { FriendBoostHistoryDto, FriendBoostStateDto } from "../net/ApiTypes";

export class FriendBoostManager {
    private static state: FriendBoostStateDto = {
        active: false,
        boostPercent: 0,
        boostEndsAt: null,
        boostedByName: "",
        serverTime: 0,
    };
    private static history: FriendBoostHistoryDto = {
        activeBoostPercent: 0,
        maxBoostPercent: 30,
        activeContributionCount: 0,
        entries: [],
        serverTime: 0,
    };

    public static apply(state: FriendBoostStateDto): void {
        const receivedAt = Date.now();
        const serverTime = state.serverTime || receivedAt;
        const remainingMs = Math.max(0, (state.boostEndsAt ?? serverTime) - serverTime);
        const localEndsAt = receivedAt + remainingMs;
        this.state = {
            active: state.active && state.boostPercent > 0 && remainingMs > 0,
            boostPercent: Math.max(0, Math.min(30, Math.floor(state.boostPercent))),
            boostEndsAt: remainingMs > 0 ? localEndsAt : null,
            boostedByName: state.boostedByName || "",
            serverTime: receivedAt,
        };
    }

    public static getState(): FriendBoostStateDto {
        if ((this.state.boostEndsAt ?? 0) <= Date.now()) {
            this.state = {
                active: false,
                boostPercent: 0,
                boostEndsAt: null,
                boostedByName: "",
                serverTime: Date.now(),
            };
        }
        return { ...this.state };
    }

    public static applyHistory(history: FriendBoostHistoryDto): void {
        const receivedAt = Date.now();
        const serverTime = history.serverTime || receivedAt;
        this.history = {
            activeBoostPercent: Math.max(0, Math.min(history.maxBoostPercent || 30, history.activeBoostPercent)),
            maxBoostPercent: Math.max(1, history.maxBoostPercent || 30),
            activeContributionCount: Math.max(0, history.activeContributionCount),
            entries: history.entries.map(entry => {
                const ageMs = Math.max(0, serverTime - entry.createdAt);
                const remainingMs = Math.max(0, entry.expiresAt - serverTime);
                return {
                    ...entry,
                    createdAt: receivedAt - ageMs,
                    expiresAt: receivedAt + remainingMs,
                    active: entry.active && remainingMs > 0,
                };
            }),
            serverTime: receivedAt,
        };
    }

    public static getHistory(): FriendBoostHistoryDto {
        const now = Date.now();
        const entries = this.history.entries.map(entry => ({
            ...entry,
            active: entry.expiresAt > now,
        }));
        const activeEntries = entries.filter(entry => entry.active);
        const fallbackBoost = this.getState().boostPercent;
        const contributionBoost = Math.min(
            this.history.maxBoostPercent,
            activeEntries.reduce((total, entry) => total + entry.boostPercent, 0),
        );
        return {
            ...this.history,
            activeBoostPercent: activeEntries.length > 0 ? contributionBoost : fallbackBoost,
            activeContributionCount: activeEntries.length,
            entries,
        };
    }

    public static getProductionMultiplier(): number {
        const current = this.getState();
        return current.active ? 1 + current.boostPercent / 100 : 1;
    }
}
