import { EventBus, GameEvents } from "../core/EventBus";
import { DailyOrderSaveData } from "../model/SaveData";
import { DailyOrderDto } from "../net/ApiTypes";
import { SaveManager } from "./SaveManager";

export type DailyOrderState = DailyOrderSaveData & {
    claimable: boolean;
    serverTime: number;
};

export class DailyOrderManager {
    private static serverTime = 0;

    public static getState(): DailyOrderState {
        const state = this.ensureCurrentState();
        return {
            ...state,
            claimable: state.progress >= state.target && !state.claimed,
            serverTime: this.serverTime,
        };
    }

    public static apply(dto: DailyOrderDto): DailyOrderState {
        const target = Math.max(1, Math.floor(dto.target || 60));
        const next: DailyOrderSaveData = {
            orderDate: dto.orderDate,
            progress: Math.max(0, Math.min(target, Math.floor(dto.progress || 0))),
            target,
            claimed: dto.claimed,
            rewardCoin: Math.max(0, Math.floor(dto.rewardCoin || 0)),
            rewardResearchPoint: Math.max(0, Math.floor(dto.rewardResearchPoint || 0)),
            updatedAt: dto.updatedAt,
        };
        SaveManager.data.featureState.dailyOrder = next;
        SaveManager.persist();
        this.serverTime = dto.serverTime;
        const state = this.getState();
        EventBus.emit(GameEvents.DAILY_ORDER_CHANGED, state);
        return state;
    }

    public static advanceOffline(amount = 1): DailyOrderState {
        const current = this.ensureCurrentState();
        current.progress = Math.min(current.target, current.progress + Math.max(0, Math.floor(amount)));
        current.updatedAt = Date.now();
        SaveManager.persist();
        const state = this.getState();
        EventBus.emit(GameEvents.DAILY_ORDER_CHANGED, state);
        return state;
    }

    public static claimOffline(): DailyOrderState | null {
        const current = this.ensureCurrentState();
        if (current.progress < current.target || current.claimed) {
            return null;
        }
        current.claimed = true;
        current.updatedAt = Date.now();
        SaveManager.persist();
        const state = this.getState();
        EventBus.emit(GameEvents.DAILY_ORDER_CHANGED, state);
        return state;
    }

    private static ensureCurrentState(): DailyOrderSaveData {
        const today = this.toUtcDate(new Date());
        if (!SaveManager.isInitialized()) {
            return this.createInitialState(today);
        }
        const existing = SaveManager.data.featureState.dailyOrder;
        if (existing?.orderDate === today) {
            return existing;
        }
        const next = this.createInitialState(today);
        SaveManager.data.featureState.dailyOrder = next;
        SaveManager.persist();
        return next;
    }

    private static createInitialState(orderDate: number): DailyOrderSaveData {
        return {
            orderDate,
            progress: 56,
            target: 60,
            claimed: false,
            rewardCoin: 1000,
            rewardResearchPoint: 10,
            updatedAt: Date.now(),
        };
    }

    private static toUtcDate(value: Date): number {
        return value.getUTCFullYear() * 10000 + (value.getUTCMonth() + 1) * 100 + value.getUTCDate();
    }
}
