import { FriendBoostStateDto } from "../net/ApiTypes";

export class FriendBoostManager {
    private static state: FriendBoostStateDto = {
        active: false,
        boostPercent: 0,
        boostEndsAt: null,
        boostedByName: "",
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

    public static getProductionMultiplier(): number {
        const current = this.getState();
        return current.active ? 1 + current.boostPercent / 100 : 1;
    }
}
