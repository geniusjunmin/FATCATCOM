import { CatModel, CatConfig, CatRole, Rarity } from "../model/CatModel";
import { CatSaveData } from "../model/SaveData";
import { SaveManager } from "./SaveManager";
import { ConfigManager } from "./ConfigManager";
import { ResourceManager } from "./ResourceManager";
import { EventBus, GameEvents } from "../core/EventBus";
import { ResearchManager } from "./ResearchManager";
import { ResearchEffectType } from "../model/ResearchModel";
import { SkillManager } from "./SkillManager";
import { EquipmentConfig, EquipmentEffect } from "../model/ItemModel";
import { InventoryManager } from "./InventoryManager";
import { CatStateDto } from "../net/ApiTypes";

export class CatManager {
    public static readonly DEFAULT_BUILDING_ID = "building_cafe_1f";
    private static readonly KNOWN_SKIN_IDS = ["default", "apron", "manager", "festival"];
    private static _serverCatalogOverrides: Record<string, Partial<CatConfig>> = {};

    /**
     * Get all cat configs
     */
    public static getAllConfigs(): CatConfig[] {
        return ConfigManager.cats.map(config => this.applyServerCatalogOverride(config));
    }

    /**
     * Get a specific cat config by ID
     */
    public static getConfig(id: string): CatConfig | undefined {
        const config = ConfigManager.cats.find(c => c.id === id);
        return config ? this.applyServerCatalogOverride(config) : undefined;
    }

    /**
     * Get cat save data by ID
     */
    public static getCatData(id: string): CatSaveData {
        const data = SaveManager.data.cats[id];
        if (data) {
            return data;
        }
        
        // If not found, return default locked state
        const config = this.getConfig(id);
        return {
            id: id,
            level: 1,
            weight: config ? config.baseWeight : 20,
            isUnlocked: false,
            assignedBuildingId: this.DEFAULT_BUILDING_ID,
            equipment: {},
            equipmentLevels: {},
            ownedSkinIds: id === "c_001" ? ["default", "apron"] : ["default"],
            equippedSkinId: "default",
        };
    }

    /**
     * Unlock a cat
     */
    public static unlockCat(id: string): boolean {
        const config = this.getConfig(id);
        if (!config) {
            return false;
        }

        const existing = SaveManager.data.cats[id];
        if (existing?.isUnlocked) {
            return false;
        }

        const cost = CatModel.calculateUnlockCost(config.rarity);
        if (!ResourceManager.spend({ coin: cost }, `cat_unlock_${id}`)) {
            return false;
        }

        let success = false;
        SaveManager.update(data => {
            if (!data.cats[id]) {
                data.cats[id] = {
                    id: id,
                    level: 1,
                    weight: config.baseWeight,
                    isUnlocked: true,
                    assignedBuildingId: this.DEFAULT_BUILDING_ID,
                    equipment: this.getDefaultEquipment(),
                    equipmentLevels: {},
                    ownedSkinIds: id === "c_001" ? ["default", "apron"] : ["default"],
                    equippedSkinId: "default",
                };
                success = true;
            } else if (!data.cats[id].isUnlocked) {
                data.cats[id].isUnlocked = true;
                data.cats[id].assignedBuildingId = data.cats[id].assignedBuildingId ?? this.DEFAULT_BUILDING_ID;
                data.cats[id].equipment = data.cats[id].equipment ?? this.getDefaultEquipment();
                data.cats[id].equipmentLevels = data.cats[id].equipmentLevels ?? {};
                data.cats[id].ownedSkinIds = data.cats[id].ownedSkinIds ?? (id === "c_001" ? ["default", "apron"] : ["default"]);
                data.cats[id].equippedSkinId = data.cats[id].equippedSkinId ?? "default";
                success = true;
            }
        });
        
        if (success) {
            EventBus.emit(GameEvents.SAVE_UPDATED, SaveManager.snapshot());
        }
        return success;
    }

    /**
     * Upgrade a cat by 1 level
     */
    public static upgradeCat(id: string): boolean {
        const cat = this.getCatData(id);
        if (!cat.isUnlocked) return false;

        const baseCost = CatModel.calculateUpgradeCost(cat.level);
        const costReducePercent = ResearchManager.getBonus(ResearchEffectType.UPGRADE_COST_REDUCE);
        const cost = Math.floor(baseCost * (1 - costReducePercent / 100));

        if (!ResourceManager.spend({ coin: cost }, `cat_upgrade_${id}`)) {
            return false;
        }
        
        SaveManager.update(data => {
            if (data.cats[id]) {
                data.cats[id].level += 1;
            }
        });
        
        return true;
    }

    public static applyServerUpgrade(id: string, level: number): boolean {
        const config = this.getConfig(id);
        const cat = this.getCatData(id);
        if (!config || !cat.isUnlocked || level < 1) {
            return false;
        }

        SaveManager.update(data => {
            if (!data.cats[id]) {
                data.cats[id] = {
                    ...cat,
                    id,
                    weight: cat.weight || config.baseWeight,
                    equipment: cat.equipment ?? this.getDefaultEquipment(),
                    equipmentLevels: cat.equipmentLevels ?? {},
                };
            }
            data.cats[id].level = Math.min(30, Math.max(1, Math.floor(level)));
            data.cats[id].isUnlocked = true;
            data.cats[id].assignedBuildingId = data.cats[id].assignedBuildingId ?? this.DEFAULT_BUILDING_ID;
            data.cats[id].equipment = data.cats[id].equipment ?? this.getDefaultEquipment();
            data.cats[id].equipmentLevels = data.cats[id].equipmentLevels ?? {};
        });
        return true;
    }

    /**
     * Feed a cat to increase its weight
     */
    public static feedCat(id: string): boolean {
        const cat = this.getCatData(id);
        if (!cat.isUnlocked) return false;
        if (cat.weight >= 100) return false; // Max weight

        const feedCost = this.getFeedCost(id);

        if (!ResourceManager.spend({ catFood: feedCost }, `cat_feed_${id}`)) {
            return false;
        }

        SaveManager.update(data => {
            if (data.cats[id]) {
                data.cats[id].weight = Math.min(100, data.cats[id].weight + 1);
            }
        });

        return true;
    }

    public static applyServerFeed(id: string, weight: number): boolean {
        const config = this.getConfig(id);
        const cat = this.getCatData(id);
        if (!config || !cat.isUnlocked || weight < 1) {
            return false;
        }

        SaveManager.update(data => {
            if (!data.cats[id]) {
                data.cats[id] = {
                    ...cat,
                    id,
                    level: cat.level || 1,
                    equipment: cat.equipment ?? this.getDefaultEquipment(),
                    equipmentLevels: cat.equipmentLevels ?? {},
                };
            }
            data.cats[id].weight = Math.min(100, Math.max(1, Math.floor(weight)));
            data.cats[id].isUnlocked = true;
            data.cats[id].assignedBuildingId = data.cats[id].assignedBuildingId ?? this.DEFAULT_BUILDING_ID;
            data.cats[id].equipment = data.cats[id].equipment ?? this.getDefaultEquipment();
            data.cats[id].equipmentLevels = data.cats[id].equipmentLevels ?? {};
        });
        return true;
    }

    public static applyServerUnlock(id: string, level: number, weight: number): boolean {
        const config = this.getConfig(id);
        if (!config || level < 1 || weight < 1) {
            return false;
        }

        SaveManager.update(data => {
            const current = data.cats[id] ?? this.getCatData(id);
            data.cats[id] = {
                ...current,
                id,
                level: Math.min(30, Math.max(1, Math.floor(level))),
                weight: Math.min(100, Math.max(1, Math.floor(weight))),
                isUnlocked: true,
                assignedBuildingId: current.assignedBuildingId ?? this.DEFAULT_BUILDING_ID,
                equipment: current.equipment ?? this.getDefaultEquipment(),
                equipmentLevels: current.equipmentLevels ?? {},
            };
        });
        return true;
    }

    public static applyServerSnapshot(cats: CatStateDto[]): number {
        let applied = 0;
        SaveManager.update(data => {
            for (const serverCat of cats) {
                this.applyServerCatalogMetadata(serverCat);
                const config = this.getConfig(serverCat.catId);
                if (!config) continue;
                const current = data.cats[serverCat.catId] ?? this.getCatData(serverCat.catId);
                data.cats[serverCat.catId] = {
                    ...current,
                    id: serverCat.catId,
                    level: Math.min(30, Math.max(1, Math.floor(serverCat.level))),
                    weight: Math.min(100, Math.max(1, Math.floor(serverCat.weight))),
                    isUnlocked: !!serverCat.isUnlocked,
                    assignedBuildingId: serverCat.assignedBuildingId ?? current.assignedBuildingId ?? this.DEFAULT_BUILDING_ID,
                    equipment: current.equipment ?? this.getDefaultEquipment(),
                    equipmentLevels: {
                        ...(current.equipmentLevels ?? {}),
                        ...(serverCat.equipmentLevels ?? {}),
                    },
                    ownedSkinIds: this.normalizeSkinIds(serverCat.ownedSkinIds, serverCat.catId),
                    equippedSkinId: this.normalizeEquippedSkin(
                        serverCat.equippedSkinId,
                        this.normalizeSkinIds(serverCat.ownedSkinIds, serverCat.catId),
                    ),
                };
                applied += 1;
            }
        });
        return applied;
    }

    public static getOwnedSkinIds(catId: string): string[] {
        return this.normalizeSkinIds(this.getCatData(catId).ownedSkinIds, catId);
    }

    public static getEquippedSkinId(catId: string): string {
        const ownedSkinIds = this.getOwnedSkinIds(catId);
        return this.normalizeEquippedSkin(this.getCatData(catId).equippedSkinId, ownedSkinIds);
    }

    public static equipSkin(catId: string, skinId: string): boolean {
        const cat = this.getCatData(catId);
        const ownedSkinIds = this.getOwnedSkinIds(catId);
        if (!cat.isUnlocked || !ownedSkinIds.includes(skinId)) {
            return false;
        }
        SaveManager.update(data => {
            const current = data.cats[catId] ?? cat;
            data.cats[catId] = {
                ...current,
                ownedSkinIds,
                equippedSkinId: skinId,
            };
        });
        return true;
    }

    public static applyServerSkin(catId: string, equippedSkinId: string, ownedSkinIds: string[]): boolean {
        const config = this.getConfig(catId);
        const cat = this.getCatData(catId);
        const normalizedOwned = this.normalizeSkinIds(ownedSkinIds, catId);
        if (!config || !cat.isUnlocked || !normalizedOwned.includes(equippedSkinId)) {
            return false;
        }
        SaveManager.update(data => {
            data.cats[catId] = {
                ...(data.cats[catId] ?? cat),
                ownedSkinIds: normalizedOwned,
                equippedSkinId,
            };
        });
        return true;
    }

    private static normalizeSkinIds(skinIds: string[] | undefined, catId: string): string[] {
        const defaults = catId === "c_001" ? ["default", "apron"] : ["default"];
        return [...new Set([...(skinIds ?? []), ...defaults])]
            .filter(skinId => this.KNOWN_SKIN_IDS.includes(skinId));
    }

    private static normalizeEquippedSkin(skinId: string | undefined, ownedSkinIds: string[]): string {
        return skinId && ownedSkinIds.includes(skinId) ? skinId : "default";
    }

    private static applyServerCatalogMetadata(serverCat: CatStateDto): void {
        const override: Partial<CatConfig> = {};
        if (this.isKnownRarity(serverCat.rarity)) override.rarity = serverCat.rarity;
        if (this.isKnownRole(serverCat.role)) override.role = serverCat.role;
        if (Number.isFinite(serverCat.baseProduction)) override.baseProduction = Math.max(0, Math.floor(serverCat.baseProduction ?? 0));
        if (Number.isFinite(serverCat.baseBeanCost)) override.baseBeanCost = Math.max(0, Math.floor(serverCat.baseBeanCost ?? 0));
        if (Number.isFinite(serverCat.baseSalary)) override.baseSalary = Math.max(0, Math.floor(serverCat.baseSalary ?? 0));
        if (Number.isFinite(serverCat.baseWeight)) override.baseWeight = Math.max(1, Math.min(100, Math.floor(serverCat.baseWeight ?? 20)));
        if (serverCat.skillId) override.skillId = serverCat.skillId;
        if (Object.keys(override).length > 0) {
            this._serverCatalogOverrides[serverCat.catId] = {
                ...(this._serverCatalogOverrides[serverCat.catId] ?? {}),
                ...override,
            };
        }
    }

    private static applyServerCatalogOverride(config: CatConfig): CatConfig {
        const override = this._serverCatalogOverrides[config.id];
        return override ? { ...config, ...override } : config;
    }

    private static isKnownRarity(value: string | undefined): value is Rarity {
        return value === "B" || value === "A" || value === "S" || value === "SS";
    }

    private static isKnownRole(value: string | undefined): value is CatRole {
        return value === "producer" || value === "saver" || value === "launcher" || value === "support";
    }

    public static applyServerEquipmentUpgrade(catId: string, itemId: string, level: number): boolean {
        const cat = this.getCatData(catId);
        const equipment = this.getEquipmentConfig(itemId);
        if (!cat.isUnlocked || !this.getConfig(catId) || !equipment || level < 1) {
            return false;
        }

        SaveManager.update(data => {
            if (!data.cats[catId]) {
                data.cats[catId] = cat;
            }
            data.cats[catId].equipment = data.cats[catId].equipment ?? this.getDefaultEquipment();
            data.cats[catId].equipmentLevels = data.cats[catId].equipmentLevels ?? {};
            data.cats[catId].equipmentLevels[itemId] = Math.max(1, Math.floor(level));
        });
        return true;
    }

    public static getFeedCost(id: string): number {
        const baseCost = 10;
        const reducePercent = Math.max(-90, Math.min(200, this.getEquipmentEffectTotal(id, "catFoodCost")));
        return Math.max(1, Math.floor(baseCost * (1 + reducePercent / 100)));
    }

    public static getMoodCap(id: string): number {
        return 100 + Math.max(0, this.getEquipmentEffectTotal(id, "mood"));
    }

    public static getMood(id: string): number {
        const cat = this.getCatData(id);
        if (!cat.isUnlocked) return 0;
        const baseMood = Math.max(60, 100 - Math.floor(cat.weight / 4));
        return Math.min(this.getMoodCap(id), baseMood + Math.max(0, this.getEquipmentEffectTotal(id, "mood")));
    }

    public static getWageCost(id: string): number {
        const cat = this.getCatData(id);
        if (!cat.isUnlocked) return 0;

        const config = this.getConfig(id);
        if (!config) return 0;

        const baseWage = config.baseSalary * Math.max(1, cat.level);
        const reducePercent = Math.max(-90, Math.min(200, this.getEquipmentEffectTotal(id, "wageCost")));
        return Math.max(0, baseWage * (1 + reducePercent / 100));
    }

    /**
     * Calculate current production of a specific cat
     */
    public static getCatProduction(id: string): number {
        const cat = this.getCatData(id);
        if (!cat.isUnlocked) return 0;
        
        const config = this.getConfig(id);
        if (!config) return 0;

        const baseProd = CatModel.calculateProduction(config.baseProduction, cat.level, cat.weight);
        const bonusPercent = ResearchManager.getBonus(ResearchEffectType.COIN_PRODUCTION_MULTIPLY);
        const bonusAdd = ResearchManager.getBonus(ResearchEffectType.COIN_PRODUCTION_ADD);
        
        const buildingId = this.getAssignedBuildingId(id);
        const teammates = buildingId ? this.getAssignedCats(buildingId) : [];
        const skillMultiplier = SkillManager.getProductionMultiplier(config, teammates);
        const equipmentProductionBonus = this.getEquipmentEffectTotal(id, "materialOutput");
        const moodMultiplier = Math.max(0, this.getMood(id) / 100);
        
        return ((baseProd * (1 + (bonusPercent + equipmentProductionBonus) / 100)) + bonusAdd) * skillMultiplier * moodMultiplier;
    }

    public static getAssignedBuildingId(id: string): string {
        return this.getCatData(id).assignedBuildingId ?? this.DEFAULT_BUILDING_ID;
    }

    public static assignCatToBuilding(catId: string, buildingId: string): boolean {
        const cat = this.getCatData(catId);
        if (!cat.isUnlocked || !this.getConfig(catId)) {
            return false;
        }

        SaveManager.update(data => {
            if (!data.cats[catId]) {
                data.cats[catId] = cat;
            }
            data.cats[catId].assignedBuildingId = buildingId;
        });
        return true;
    }

    public static applyServerAssignment(catId: string, buildingId: string): boolean {
        const cat = this.getCatData(catId);
        if (!cat.isUnlocked || !this.getConfig(catId)) {
            return false;
        }

        SaveManager.update(data => {
            if (!data.cats[catId]) {
                data.cats[catId] = cat;
            }
            data.cats[catId].assignedBuildingId = buildingId;
        });
        return true;
    }

    public static unassignCat(catId: string): boolean {
        const cat = this.getCatData(catId);
        if (!cat.isUnlocked || !this.getConfig(catId)) {
            return false;
        }

        SaveManager.update(data => {
            if (!data.cats[catId]) {
                data.cats[catId] = cat;
            }
            data.cats[catId].assignedBuildingId = "";
        });
        return true;
    }

    public static getEquipment(catId: string): Record<string, string> {
        const cat = this.getCatData(catId);
        if (!cat.isUnlocked) return {};
        return {
            ...this.getDefaultEquipment(),
            ...(cat.equipment ?? {}),
        };
    }

    public static equipItem(catId: string, slot: string, itemId: string): boolean {
        const cat = this.getCatData(catId);
        const equipment = this.getEquipmentConfig(itemId);
        if (!cat.isUnlocked || !this.getConfig(catId) || !equipment || equipment.slot !== slot) {
            return false;
        }
        const currentEquipment = this.getEquipment(catId);
        if (currentEquipment[slot] !== itemId && !InventoryManager.hasItem(itemId)) {
            return false;
        }

        SaveManager.update(data => {
            if (!data.cats[catId]) {
                data.cats[catId] = cat;
            }
            data.cats[catId].equipment = data.cats[catId].equipment ?? {};
            data.cats[catId].equipmentLevels = data.cats[catId].equipmentLevels ?? {};
            data.cats[catId].equipment[slot] = itemId;
            data.cats[catId].equipmentLevels[itemId] = data.cats[catId].equipmentLevels[itemId] ?? 1;
        });
        return true;
    }

    public static getEquipmentLevel(catId: string, itemId: string): number {
        const cat = this.getCatData(catId);
        if (!cat.isUnlocked || !itemId) return 1;
        return Math.max(1, cat.equipmentLevels?.[itemId] ?? 1);
    }

    public static getEquipmentEffectTotal(catId: string, effectType: EquipmentEffect["type"]): number {
        const cat = this.getCatData(catId);
        if (!cat.isUnlocked) return 0;
        let total = 0;
        const equipment = this.getEquipment(catId);
        for (const itemId of Object.values(equipment)) {
            const config = this.getEquipmentConfig(itemId);
            const level = this.getEquipmentLevel(catId, itemId);
            for (const effect of config?.effects ?? []) {
                if (effect.type === effectType) {
                    total += this.getEquipmentEffectValue(effect, level);
                }
            }
        }
        return total;
    }

    public static getEquipmentUpgradeState(catId: string, slot: string): { itemId: string; name: string; level: number; maxLevel: number; nextLevel: number; cost: number; isMax: boolean; canAfford: boolean; currentEffect: string; nextEffect: string } {
        const itemId = this.getEquipment(catId)[slot] ?? "";
        const equipment = this.getEquipmentConfig(itemId);
        const level = this.getEquipmentLevel(catId, itemId);
        const maxLevel = equipment?.levelMax ?? 5;
        const isMax = level >= maxLevel;
        const cost = Math.max(1, Math.floor((equipment?.upgradeCost ?? 100) * level));
        const nextLevel = Math.min(maxLevel, level + 1);
        return {
            itemId,
            name: equipment?.name ?? "未装备",
            level,
            maxLevel,
            nextLevel,
            cost,
            isMax,
            canAfford: !isMax && ResourceManager.canSpend({ coin: cost }),
            currentEffect: this.formatEquipmentEffect(equipment, level),
            nextEffect: this.formatEquipmentEffect(equipment, nextLevel),
        };
    }

    private static formatEquipmentEffect(equipment: EquipmentConfig | undefined, level: number): string {
        const effect = equipment?.effects?.[0];
        if (!effect) {
            return equipment?.bonus ?? "无加成";
        }
        const value = this.getEquipmentEffectValue(effect, level);
        const sign = value > 0 ? "+" : "";
        return `${effect.label} ${sign}${value}${effect.unit ?? ""}`;
    }

    private static getEquipmentEffectValue(effect: EquipmentEffect, level: number): number {
        return effect.baseValue + (effect.perLevel ?? 0) * Math.max(0, level - 1);
    }

    public static upgradeEquipment(catId: string, slot: string): { ok: boolean; message: string } {
        const cat = this.getCatData(catId);
        const itemId = this.getEquipment(catId)[slot];
        const equipment = this.getEquipmentConfig(itemId);
        if (!cat.isUnlocked || !this.getConfig(catId) || !equipment) {
            return { ok: false, message: "装备升级失败：猫咪未解锁或装备不存在。" };
        }

        const state = this.getEquipmentUpgradeState(catId, slot);
        if (state.isMax) {
            return { ok: false, message: `${equipment.name}已达到升级上限 Lv.${state.maxLevel}。` };
        }

        if (!ResourceManager.spend({ coin: state.cost }, `equipment_upgrade_${itemId}`)) {
            return { ok: false, message: `装备升级失败：金币不足，需要 ${state.cost} 金币。` };
        }

        SaveManager.update(data => {
            if (!data.cats[catId]) {
                data.cats[catId] = cat;
            }
            data.cats[catId].equipmentLevels = data.cats[catId].equipmentLevels ?? {};
            data.cats[catId].equipmentLevels[itemId] = state.level + 1;
        });
        return { ok: true, message: `${equipment.name}升级成功：Lv.${state.level + 1}/${state.maxLevel}。` };
    }

    public static getAllEquipment(): EquipmentConfig[] {
        return ConfigManager.equipment;
    }

    public static getEquipmentBySlot(slot: string): EquipmentConfig[] {
        return ConfigManager.equipment.filter(item => item.slot === slot);
    }

    public static getEquipmentConfig(itemId: string): EquipmentConfig | undefined {
        return ConfigManager.equipment.find(item => item.id === itemId);
    }

    public static getDefaultEquipment(): Record<string, string> {
        const defaults: Record<string, string> = {};
        for (const item of ConfigManager.equipment) {
            if (item.isDefault || !defaults[item.slot]) {
                defaults[item.slot] = item.id;
            }
        }
        return defaults;
    }

    public static getAssignedCats(buildingId: string): CatConfig[] {
        return this.getAllConfigs().filter(config => {
            const data = this.getCatData(config.id);
            return data.isUnlocked && data.assignedBuildingId === buildingId;
        });
    }

    public static getBuildingProduction(buildingId: string): number {
        let total = 0;
        for (const config of this.getAssignedCats(buildingId)) {
            total += this.getCatProduction(config.id);
        }
        return total;
    }

    public static getBuildingBeanCost(buildingId: string): number {
        let total = 0;
        for (const config of this.getAssignedCats(buildingId)) {
            const skillMultiplier = SkillManager.getBeanCostMultiplier(config);
            total += config.baseBeanCost * skillMultiplier;
        }
        return total;
    }

    public static getBuildingWageCost(buildingId: string): number {
        let total = 0;
        for (const config of this.getAssignedCats(buildingId)) {
            total += this.getWageCost(config.id);
        }
        return total;
    }
}
