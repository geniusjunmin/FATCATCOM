export type BuildingEffectType =
    | "bean_capacity"
    | "base_production"
    | "ferment_efficiency"
    | "coffee_price"
    | "salary_reduce"
    | "order_coin";

export interface BuildingConfig {
    id: string;
    floor: string;
    name: string;
    level: number;
    maxLevel: number;
    effectType: BuildingEffectType;
    effectLabel: string;
    baseValue: number;
    valuePerLevel: number;
    costBase: number;
    description: string;
}

export interface BuildingRuntimeData {
    id: string;
    level: number;
}

export interface BuildingViewData {
    id: string;
    floor: string;
    name: string;
    level: number;
    maxLevel: number;
    effectLabel: string;
    effectValue: number;
    upgradeCost: number;
    productionPerSecond: number;
    assignedCatCount: number;
    assignedCatNames: string[];
    scheduleCapacity: number;
    description: string;
}
