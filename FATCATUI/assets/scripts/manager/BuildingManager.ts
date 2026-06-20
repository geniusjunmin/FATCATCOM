import { BuildingConfig, BuildingViewData } from "../model/BuildingModel";
import { BuildingSaveData } from "../model/SaveData";
import { ConfigManager } from "./ConfigManager";
import { CatManager } from "./CatManager";
import { ResourceManager } from "./ResourceManager";
import { SaveManager } from "./SaveManager";
import { BuildingStateDto } from "../net/ApiTypes";

export class BuildingManager {
    public static getAll(): BuildingViewData[] {
        return ConfigManager.buildings.map((config) => this.toViewData(config));
    }

    public static getById(id: string): BuildingViewData | null {
        const configs = ConfigManager.buildings;
        for (const config of configs) {
            if (config.id === id) {
                return this.toViewData(config);
            }
        }
        return null;
    }

    public static getLevel(id: string): number {
        const config = this.getConfig(id);
        if (!config) {
            return 1;
        }
        const saved = SaveManager.data.buildings[id];
        return saved ? saved.level : config.level;
    }

    public static getEffectValue(effectType: string): number {
        let total = 0;
        for (const config of ConfigManager.buildings) {
            if (config.effectType === effectType) {
                total += this.calculateEffectValue(config, this.getLevel(config.id));
            }
        }
        return total;
    }

    public static getNextEffectValue(id: string): number {
        const config = this.getConfig(id);
        if (!config) {
            return 0;
        }
        const nextLevel = Math.min(config.maxLevel, this.getLevel(id) + 1);
        return this.calculateEffectValue(config, nextLevel);
    }

    public static upgrade(id: string): boolean {
        const config = this.getConfig(id);
        if (!config) {
            return false;
        }

        const level = this.getLevel(id);
        if (level >= config.maxLevel) {
            return false;
        }

        const cost = this.calculateUpgradeCost(config, level);
        if (!ResourceManager.spend({ coin: cost }, `building_upgrade_${id}`)) {
            return false;
        }

        SaveManager.update((data) => {
            const current = data.buildings[id] ?? this.createSaveData(config);
            current.level = Math.min(config.maxLevel, current.level + 1);
            data.buildings[id] = current;
        });
        return true;
    }

    public static applyServerSnapshot(buildings: BuildingStateDto[]): number {
        let applied = 0;
        SaveManager.update((data) => {
            for (const building of buildings) {
                const config = this.getConfig(building.buildingId);
                if (!config) continue;
                data.buildings[building.buildingId] = {
                    id: building.buildingId,
                    level: Math.min(config.maxLevel, Math.max(1, Math.floor(building.level))),
                };
                applied += 1;
            }
        });
        return applied;
    }

    public static applyServerUpgrade(buildingId: string, level: number): boolean {
        const config = this.getConfig(buildingId);
        if (!config) {
            return false;
        }

        SaveManager.update((data) => {
            data.buildings[buildingId] = {
                id: buildingId,
                level: Math.min(config.maxLevel, Math.max(1, Math.floor(level))),
            };
        });
        return true;
    }

    public static getScheduleCapacity(id: string): number {
        const level = this.getLevel(id);
        return Math.min(5, 2 + Math.floor(level / 15));
    }

    private static getConfig(id: string): BuildingConfig | null {
        for (const config of ConfigManager.buildings) {
            if (config.id === id) {
                return config;
            }
        }
        return null;
    }

    private static toViewData(config: BuildingConfig): BuildingViewData {
        const level = this.getLevel(config.id);
        const assignedCats = CatManager.getAssignedCats(config.id);
        return {
            id: config.id,
            floor: config.floor,
            name: config.name,
            level,
            maxLevel: config.maxLevel,
            effectLabel: config.effectLabel,
            effectValue: this.calculateEffectValue(config, level),
            upgradeCost: this.calculateUpgradeCost(config, level),
            productionPerSecond: 0,
            assignedCatCount: assignedCats.length,
            assignedCatNames: assignedCats.map(cat => cat.name),
            scheduleCapacity: this.getScheduleCapacity(config.id),
            description: config.description,
        };
    }

    private static createSaveData(config: BuildingConfig): BuildingSaveData {
        return {
            id: config.id,
            level: config.level,
        };
    }

    private static calculateEffectValue(config: BuildingConfig, level: number): number {
        return config.baseValue + config.valuePerLevel * level;
    }

    private static calculateUpgradeCost(config: BuildingConfig, level: number): number {
        return Math.floor(config.costBase * Math.pow(1.18, Math.max(0, level - 1)));
    }
}
