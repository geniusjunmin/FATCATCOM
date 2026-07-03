export enum ResearchEffectType {
    COIN_PRODUCTION_ADD = "coin_production_add",       // +X coin/s
    COIN_PRODUCTION_MULTIPLY = "coin_production_mult", // +X% coin/s
    UPGRADE_COST_REDUCE = "upgrade_cost_reduce",       // -X% cost
    BEAN_CONSUMPTION_REDUCE = "bean_reduce",           // -X% bean usage
    OFFLINE_REWARD_BONUS = "offline_bonus"             // +X% offline
}

export interface ResearchConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    cost: number; // in researchPoint
    maxLevel: number;
    costGrowth: number;
    effectType: ResearchEffectType;
    effectValue: number;
    effectStep: number;
    parentResearchId?: string; // For tree structure
    parentResearchIds?: string[]; // Multi-branch prerequisites
}

export interface ResearchSaveData {
    id: string;
    isUnlocked: boolean;
    level?: number;
}
