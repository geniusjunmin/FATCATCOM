import { FriendCoopGoalDto } from "../net/ApiTypes";

export class FriendCoopManager {
    private static state: FriendCoopGoalDto = {
        goalDate: 0,
        progress: 0,
        target: 3,
        claimable: false,
        claimed: false,
        rewardDiamond: 30,
        updatedAt: 0,
        serverTime: 0,
    };

    public static apply(state: FriendCoopGoalDto): void {
        if (state.goalDate === this.state.goalDate && state.updatedAt < this.state.updatedAt) {
            return;
        }
        const target = Math.max(1, Math.floor(state.target || 3));
        const progress = Math.max(0, Math.min(target, Math.floor(state.progress || 0)));
        this.state = {
            ...state,
            target,
            progress,
            claimable: progress >= target && !state.claimed,
        };
    }

    public static applyRealtimeProgress(progress: number, target: number, claimable: boolean, updatedAt: number): void {
        this.apply({
            ...this.state,
            progress,
            target,
            claimable,
            claimed: false,
            updatedAt,
            serverTime: updatedAt,
        });
    }

    public static getState(): FriendCoopGoalDto {
        return { ...this.state };
    }
}
