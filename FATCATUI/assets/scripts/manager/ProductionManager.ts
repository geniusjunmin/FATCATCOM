import { EventBus, GameEvents } from "../core/EventBus";
import { CatManager } from "./CatManager";
import { BuildingManager } from "./BuildingManager";
import { ResourceManager } from "./ResourceManager";
import { ResearchManager } from "./ResearchManager";
import { ResearchEffectType } from "../model/ResearchModel";
import { SaveManager } from "./SaveManager";
import { FriendBoostManager } from "./FriendBoostManager";

export interface ProductionSnapshot {
    coinPerSecond: number;
    grossCoinPerSecond: number;
    wageCostPerSecond: number;
    beanCostPerSecond: number;
    canProduce: boolean;
    buildingCoinPerSecond: Record<string, number>;
    buildingGrossCoinPerSecond: Record<string, number>;
    buildingWageCostPerSecond: Record<string, number>;
    buildingBeanCostPerSecond: Record<string, number>;
}

export interface ProductionTickPayload extends ProductionSnapshot {
    seconds: number;
    coinGained: number;
    beanSpent: number;
}

export class ProductionManager {
    public static calculateSnapshot(): ProductionSnapshot {
        if (!SaveManager.isInitialized()) {
            return {
                coinPerSecond: 0,
                grossCoinPerSecond: 0,
                wageCostPerSecond: 0,
                beanCostPerSecond: 0,
                canProduce: false,
                buildingCoinPerSecond: {},
                buildingGrossCoinPerSecond: {},
                buildingWageCostPerSecond: {},
                buildingBeanCostPerSecond: {},
            };
        }
        const productionBonus = this.percentToMultiplier(BuildingManager.getEffectValue("base_production"));
        const priceBonus = this.percentToMultiplier(BuildingManager.getEffectValue("coffee_price"));
        const orderBonus = this.percentToMultiplier(BuildingManager.getEffectValue("order_coin"));
        const globalBonus = this.percentToMultiplier(BuildingManager.getEffectValue("salary_reduce"));
        const beanReduceBuilding = Math.max(0, -BuildingManager.getEffectValue("ferment_efficiency"));
        const beanReduceResearch = ResearchManager.getBonus(ResearchEffectType.BEAN_CONSUMPTION_REDUCE);
        
        const coinMultiplier = productionBonus * priceBonus * orderBonus * globalBonus * FriendBoostManager.getProductionMultiplier();
        const beanMultiplier = Math.max(0.1, 1 - (beanReduceBuilding + beanReduceResearch) / 100);
        const buildingCoinPerSecond: Record<string, number> = {};
        const buildingGrossCoinPerSecond: Record<string, number> = {};
        const buildingWageCostPerSecond: Record<string, number> = {};
        const buildingBeanCostPerSecond: Record<string, number> = {};
        let grossCoinPerSecond = 0;
        let coinPerSecond = 0;
        let wageCostPerSecond = 0;
        let beanCostPerSecond = 0;

        for (const building of BuildingManager.getAll()) {
            const buildingGrossCoin = Math.max(0, CatManager.getBuildingProduction(building.id) * coinMultiplier);
            const buildingWageCost = Math.max(0, CatManager.getBuildingWageCost(building.id) / 60);
            const buildingCoin = Math.max(0, buildingGrossCoin - buildingWageCost);
            const buildingBeanCost = Math.max(0, CatManager.getBuildingBeanCost(building.id) * beanMultiplier);
            buildingCoinPerSecond[building.id] = buildingCoin;
            buildingGrossCoinPerSecond[building.id] = buildingGrossCoin;
            buildingWageCostPerSecond[building.id] = buildingWageCost;
            buildingBeanCostPerSecond[building.id] = buildingBeanCost;
            grossCoinPerSecond += buildingGrossCoin;
            coinPerSecond += buildingCoin;
            wageCostPerSecond += buildingWageCost;
            beanCostPerSecond += buildingBeanCost;
        }

        return {
            coinPerSecond,
            grossCoinPerSecond,
            wageCostPerSecond,
            beanCostPerSecond,
            canProduce: coinPerSecond > 0 && ResourceManager.get("bean") >= beanCostPerSecond,
            buildingCoinPerSecond,
            buildingGrossCoinPerSecond,
            buildingWageCostPerSecond,
            buildingBeanCostPerSecond,
        };
    }

    public static settle(seconds = 1, reason = "production_tick"): ProductionTickPayload {
        const snapshot = this.calculateSnapshot();
        if (!snapshot.canProduce || seconds <= 0) {
            const pausedPayload = this.createPayload(snapshot, seconds, 0, 0);
            EventBus.emit<ProductionTickPayload>(GameEvents.PRODUCTION_PAUSED, pausedPayload);
            return pausedPayload;
        }

        const beanAvailable = ResourceManager.get("bean");
        const maxSecondsByBean = snapshot.beanCostPerSecond > 0 ? beanAvailable / snapshot.beanCostPerSecond : seconds;
        const productiveSeconds = Math.max(0, Math.min(seconds, maxSecondsByBean));
        const coinGained = Math.floor(snapshot.coinPerSecond * productiveSeconds);
        const beanSpent = Math.ceil(snapshot.beanCostPerSecond * productiveSeconds);

        if (coinGained > 0 || beanSpent > 0) {
            ResourceManager.add({
                coin: coinGained,
                bean: -beanSpent,
            }, reason);
        }

        const payload = this.createPayload(snapshot, productiveSeconds, coinGained, beanSpent);
        EventBus.emit<ProductionTickPayload>(GameEvents.PRODUCTION_TICK, payload);
        return payload;
    }

    public static settleOffline(seconds: number): ProductionTickPayload {
        return this.settle(Math.floor(seconds * 0.5), "production_offline");
    }

    private static percentToMultiplier(percent: number): number {
        return Math.max(0, 1 + percent / 100);
    }

    private static createPayload(
        snapshot: ProductionSnapshot,
        seconds: number,
        coinGained: number,
        beanSpent: number
    ): ProductionTickPayload {
        return {
            ...snapshot,
            seconds,
            coinGained,
            beanSpent,
        };
    }
}
