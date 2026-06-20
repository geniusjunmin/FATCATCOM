import { ResourceMap } from "./ResourceModel";
import { InventoryItem } from "./ItemModel";
import { ResearchSaveData } from "./ResearchModel";
import { TaskSaveData } from "./TaskModel";

export const SAVE_VERSION = 1;

export interface PlayerSaveData {
    companyName: string;
    level: number;
    exp: number;
    expToNext: number;
}

export interface CatSaveData {
    id: string;
    level: number;
    weight: number;
    isUnlocked: boolean;
    assignedBuildingId?: string;
    equipment?: Record<string, string>;
    equipmentLevels?: Record<string, number>;
}

export interface BuildingSaveData {
    id: string;
    level: number;
}

export interface FeatureSaveData {
    claimedMails: Record<string, boolean>;
    settings: Record<string, boolean>;
    friendGifts: Record<string, number>;
    friendVisits: Record<string, number>;
}

export interface GameSaveData {
    version: number;
    createdAt: number;
    updatedAt: number;
    lastOnlineAt: number;
    player: PlayerSaveData;
    resources: ResourceMap;
    cats: Record<string, CatSaveData>;
    buildings: Record<string, BuildingSaveData>;
    inventory: Record<string, InventoryItem>;
    shopPurchaseHistory: Record<string, number>;
    research: Record<string, ResearchSaveData>;
    tasks: Record<string, TaskSaveData>;
    featureState: FeatureSaveData;
}

export interface InitialSaveConfig {
    player: PlayerSaveData;
    resources: Partial<ResourceMap>;
    cats?: Record<string, CatSaveData>;
    buildings?: Record<string, BuildingSaveData>;
    inventory?: Record<string, InventoryItem>;
    research?: Record<string, ResearchSaveData>;
    tasks?: Record<string, TaskSaveData>;
    featureState?: FeatureSaveData;
}
