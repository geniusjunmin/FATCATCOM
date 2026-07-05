import { sys } from "cc";
import { GameConfig } from "../core/GameConfig";
import { EventBus, GameEvents } from "../core/EventBus";
import { cloneResources } from "../model/ResourceModel";
import { GameSaveData, InitialSaveConfig, SAVE_VERSION } from "../model/SaveData";

export class SaveManager {
    private static _data: GameSaveData | null = null;
    private static _lastOfflineSeconds = 0;

    public static initialize(initialConfig: InitialSaveConfig): GameSaveData {
        const existing = this.readFromStorage();
        const now = Date.now();
        this._lastOfflineSeconds = existing ? Math.max(0, Math.floor((now - existing.lastOnlineAt) / 1000)) : 0;
        this._data = existing ?? this.createInitialSave(initialConfig);
        this._data.lastOnlineAt = now;
        this.persist();
        EventBus.emit(GameEvents.SAVE_LOADED, this.snapshot());
        return this.snapshot();
    }

    public static get data(): GameSaveData {
        if (!this._data) {
            throw new Error("SaveManager is not initialized.");
        }
        return this._data;
    }

    public static isInitialized(): boolean {
        return !!this._data;
    }

    public static snapshot(): GameSaveData {
        return JSON.parse(JSON.stringify(this.data)) as GameSaveData;
    }

    public static update(mutator: (data: GameSaveData) => void): GameSaveData {
        mutator(this.data);
        this.data.updatedAt = Date.now();
        this.data.lastOnlineAt = this.data.updatedAt;
        this.persist();
        EventBus.emit(GameEvents.SAVE_UPDATED, this.snapshot());
        return this.snapshot();
    }

    public static consumeOfflineSeconds(maxSeconds = 28800): number {
        const seconds = Math.min(maxSeconds, this._lastOfflineSeconds);
        this._lastOfflineSeconds = 0;
        return seconds;
    }

    public static reset(initialConfig: InitialSaveConfig): GameSaveData {
        this._data = this.createInitialSave(initialConfig);
        this._lastOfflineSeconds = 0;
        this.persist();
        EventBus.emit(GameEvents.SAVE_LOADED, this.snapshot());
        return this.snapshot();
    }

    private static readFromStorage(): GameSaveData | null {
        const raw = sys.localStorage.getItem(GameConfig.saveKey);
        if (!raw) {
            return null;
        }
        try {
            const parsed = JSON.parse(raw) as GameSaveData;
            if (parsed.version !== SAVE_VERSION || !parsed.resources || !parsed.player) {
                return null;
            }
            parsed.resources = cloneResources(parsed.resources);
            if (!parsed.cats) parsed.cats = {};
            if (!parsed.buildings) parsed.buildings = {};
            if (!parsed.inventory) parsed.inventory = {};
            if (!parsed.shopPurchaseHistory) parsed.shopPurchaseHistory = {};
            if (!parsed.research) parsed.research = {};
            if (!parsed.tasks) parsed.tasks = {};
            if (!parsed.featureState) parsed.featureState = this.createInitialFeatureState();
            parsed.featureState.claimedMails = parsed.featureState.claimedMails ?? {};
            parsed.featureState.settings = parsed.featureState.settings ?? {};
            parsed.featureState.friendGifts = parsed.featureState.friendGifts ?? {};
            parsed.featureState.friendVisits = parsed.featureState.friendVisits ?? {};
            parsed.featureState.dailyOrder = parsed.featureState.dailyOrder ?? this.createInitialDailyOrder();
            parsed.featureState.dailyOrder.launchesUsed = parsed.featureState.dailyOrder.launchesUsed ?? 0;
            parsed.featureState.dailyOrder.launchLimit = parsed.featureState.dailyOrder.launchLimit ?? 5;
            
            for (const catId of Object.keys(parsed.cats)) {
                const cat = parsed.cats[catId];
                if (cat.isUnlocked && !cat.assignedBuildingId) {
                    cat.assignedBuildingId = "building_cafe_1f";
                }
                cat.equipment = cat.equipment ?? {};
                cat.equipmentLevels = cat.equipmentLevels ?? {};
                cat.ownedSkinIds = cat.ownedSkinIds ?? (catId === "c_001" ? ["default", "apron"] : ["default"]);
                cat.equippedSkinId = cat.ownedSkinIds.includes(cat.equippedSkinId ?? "") ? cat.equippedSkinId : "default";
            }
            return parsed;
        } catch (error) {
            console.warn("[SaveManager] Failed to parse save data. A new save will be created.", error);
            return null;
        }
    }

    private static createInitialSave(initialConfig: InitialSaveConfig): GameSaveData {
        const now = Date.now();
        const save: GameSaveData = {
            version: SAVE_VERSION,
            createdAt: now,
            updatedAt: now,
            lastOnlineAt: now,
            player: {
                ...initialConfig.player,
            },
            resources: cloneResources(initialConfig.resources),
            cats: initialConfig.cats ? JSON.parse(JSON.stringify(initialConfig.cats)) : {},
            buildings: initialConfig.buildings ? JSON.parse(JSON.stringify(initialConfig.buildings)) : {},
            inventory: initialConfig.inventory ? JSON.parse(JSON.stringify(initialConfig.inventory)) : {},
            shopPurchaseHistory: {},
            research: initialConfig.research ? JSON.parse(JSON.stringify(initialConfig.research)) : {},
            tasks: initialConfig.tasks ? JSON.parse(JSON.stringify(initialConfig.tasks)) : {},
            featureState: initialConfig.featureState ? JSON.parse(JSON.stringify(initialConfig.featureState)) : this.createInitialFeatureState(),
        };
        for (const cat of Object.values(save.cats)) {
            cat.equipment = cat.equipment ?? {};
            cat.equipmentLevels = cat.equipmentLevels ?? {};
            cat.ownedSkinIds = cat.ownedSkinIds ?? (cat.id === "c_001" ? ["default", "apron"] : ["default"]);
            cat.equippedSkinId = cat.ownedSkinIds.includes(cat.equippedSkinId ?? "") ? cat.equippedSkinId : "default";
        }
        return save;
    }

    private static createInitialFeatureState() {
        return {
            claimedMails: {},
            settings: {
                music: true,
                sfx: true,
                push: false,
                sync: false,
            },
            friendGifts: {},
            friendVisits: {},
            dailyOrder: this.createInitialDailyOrder(),
        };
    }

    private static createInitialDailyOrder() {
        const now = new Date();
        return {
            orderDate: now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate(),
            progress: 56,
            target: 60,
            claimed: false,
            rewardCoin: 1000,
            rewardResearchPoint: 10,
            launchesUsed: 0,
            launchLimit: 5,
            updatedAt: Date.now(),
        };
    }

    public static persist(): void {
        sys.localStorage.setItem(GameConfig.saveKey, JSON.stringify(this.data));
    }
}
