import { ResearchConfig, ResearchEffectType } from "../model/ResearchModel";
import { ConfigManager } from "./ConfigManager";
import { SaveManager } from "./SaveManager";
import { ResourceManager } from "./ResourceManager";
import { ResearchStateDto } from "../net/ApiTypes";

export class ResearchManager {
    private static _serverCatalogOverrides: Record<string, Partial<ResearchConfig>> = {};

    /**
     * Get all research configs
     */
    public static getAllConfigs(): ResearchConfig[] {
        return ConfigManager.research.map(config => this.applyServerCatalogOverride(config));
    }

    /**
     * Check if a research is unlocked
     */
    public static isUnlocked(id: string): boolean {
        return this.getLevel(id) > 0;
    }

    public static getLevel(id: string): number {
        const state = SaveManager.data.research[id];
        if (!state) return 0;
        return Math.max(0, Math.floor(state.level ?? (state.isUnlocked ? 1 : 0)));
    }

    /**
     * Check if a research can be unlocked (prerequisites met)
     */
    public static canUnlock(id: string): boolean {
        const config = this.getConfig(id);
        if (!config) return false;
        if (this.getLevel(id) >= config.maxLevel) return false;

        if (this.getParentResearchIds(config).some(parentId => !this.isUnlocked(parentId))) {
            return false;
        }

        return true;
    }

    /**
     * Unlock a research
     */
    public static unlock(id: string): boolean {
        const config = this.getConfig(id);
        if (!config || !this.canUnlock(id)) return false;

        const nextCost = this.getNextCost(config, this.getLevel(id));
        if (!ResourceManager.spend({ researchPoint: nextCost }, `unlock_research_${id}`)) {
            return false;
        }

        SaveManager.update(data => {
            const nextLevel = this.getLevel(id) + 1;
            data.research[id] = { id, isUnlocked: true, level: nextLevel };
        });

        console.info(`[ResearchManager] Unlocked research: ${config.name}`);
        return true;
    }

    public static applyServerUnlock(id: string, level = 1): boolean {
        const config = this.getConfig(id);
        if (!config) return false;

        SaveManager.update(data => {
            data.research[id] = { id, isUnlocked: level > 0, level: Math.max(0, Math.floor(level)) };
        });

        return true;
    }

    public static applyServerSnapshot(research: ResearchStateDto[]): number {
        let applied = 0;
        SaveManager.update(data => {
            for (const serverResearch of research) {
                this.applyServerCatalogMetadata(serverResearch);
                const config = this.getConfig(serverResearch.researchId);
                if (!config) continue;
                data.research[serverResearch.researchId] = {
                    id: serverResearch.researchId,
                    isUnlocked: !!serverResearch.isUnlocked,
                    level: Math.max(0, Math.floor(serverResearch.level ?? (serverResearch.isUnlocked ? 1 : 0))),
                };
                applied += 1;
            }
        });
        return applied;
    }

    public static getConfig(id: string): ResearchConfig | undefined {
        const config = ConfigManager.research.find(item => item.id === id);
        return config ? this.applyServerCatalogOverride(config) : undefined;
    }

    public static getParentResearchIds(config: ResearchConfig): string[] {
        return Array.from(new Set([
            ...(config.parentResearchIds ?? []),
            ...(config.parentResearchId ? [config.parentResearchId] : []),
        ].filter(parentId => !!parentId)));
    }

    public static getNextCost(config: ResearchConfig, level = this.getLevel(config.id)): number {
        if (level >= config.maxLevel) return 0;
        return Math.max(1, Math.floor(config.cost * Math.pow(config.costGrowth, Math.max(0, level))));
    }

    public static getEffectValue(config: ResearchConfig, level = this.getLevel(config.id)): number {
        return level <= 0 ? 0 : config.effectValue + (level - 1) * config.effectStep;
    }

    public static getNextEffectValue(config: ResearchConfig, level = this.getLevel(config.id)): number {
        return this.getEffectValue(config, Math.min(config.maxLevel, level + 1));
    }

    private static applyServerCatalogMetadata(serverResearch: ResearchStateDto): void {
        const override: Partial<ResearchConfig> = {};
        if (Number.isFinite(serverResearch.cost)) override.cost = Math.max(0, Math.floor(serverResearch.cost ?? 0));
        if (Number.isFinite(serverResearch.maxLevel)) override.maxLevel = Math.max(1, Math.floor(serverResearch.maxLevel ?? 1));
        if (Number.isFinite(serverResearch.costGrowth)) override.costGrowth = Math.max(1, serverResearch.costGrowth ?? 1);
        if (this.isKnownEffectType(serverResearch.effectType)) override.effectType = serverResearch.effectType;
        if (Number.isFinite(serverResearch.effectValue)) override.effectValue = Math.floor(serverResearch.effectValue ?? 0);
        if (Number.isFinite(serverResearch.effectStep)) override.effectStep = Math.max(0, Math.floor(serverResearch.effectStep ?? 0));
        if (serverResearch.parentResearchId !== undefined) {
            override.parentResearchId = serverResearch.parentResearchId ?? undefined;
        }
        if (serverResearch.parentResearchIds !== undefined) {
            override.parentResearchIds = serverResearch.parentResearchIds.filter(parentId => !!parentId);
        }
        if (Object.keys(override).length > 0) {
            this._serverCatalogOverrides[serverResearch.researchId] = {
                ...(this._serverCatalogOverrides[serverResearch.researchId] ?? {}),
                ...override,
            };
        }
    }

    private static applyServerCatalogOverride(config: ResearchConfig): ResearchConfig {
        const override = this._serverCatalogOverrides[config.id];
        return override ? { ...config, ...override } : config;
    }

    private static isKnownEffectType(value: string | undefined): value is ResearchEffectType {
        return value === ResearchEffectType.COIN_PRODUCTION_ADD
            || value === ResearchEffectType.COIN_PRODUCTION_MULTIPLY
            || value === ResearchEffectType.UPGRADE_COST_REDUCE
            || value === ResearchEffectType.BEAN_CONSUMPTION_REDUCE
            || value === ResearchEffectType.OFFLINE_REWARD_BONUS;
    }

    /**
     * Get total bonus for a specific effect type
     */
    public static getBonus(type: ResearchEffectType): number {
        let total = 0;
        const configs = this.getAllConfigs();
        for (const config of configs) {
            if (config.effectType === type && this.isUnlocked(config.id)) {
                total += this.getEffectValue(config);
            }
        }
        return total;
    }
}
