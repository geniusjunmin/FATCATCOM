export enum TaskType {
    DAILY = "daily",
    MAIN = "main",
    ACHIEVEMENT = "achievement"
}

export enum TaskGoalType {
    TOTAL_COIN = "total_coin",
    UPGRADE_CAT = "upgrade_cat",
    UNLOCK_CAT = "unlock_cat",
    UPGRADE_BUILDING = "upgrade_building",
    USE_ITEM = "use_item",
    TOTAL_RESEARCH = "total_research"
}

export interface TaskConfig {
    id: string;
    name: string;
    description: string;
    type: TaskType;
    goalType: TaskGoalType;
    goalValue: number;
    rewards: {
        coin?: number;
        diamond?: number;
        researchPoint?: number;
        items?: { itemId: string, count: number }[];
    };
    nextTaskId?: string; // For main task chains
}

export interface TaskSaveData {
    id: string;
    currentValue: number;
    isClaimed: boolean;
}
