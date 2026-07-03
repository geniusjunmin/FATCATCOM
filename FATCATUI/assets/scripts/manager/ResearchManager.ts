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
        return !!SaveManager.data.research[id]?.isUnlocked;
    }

    /**
     * Check if a research can be unlocked (prerequisites met)
     */
    public static canUnlock(id: string): boolean {
        const config = this.getConfig(id);
        if (!config) return false;
        if (this.isUnlocked(id)) return false;

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

        if (!ResourceManager.spend({ researchPoint: config.cost }, `unlock_research_${id}`)) {
            return false;
        }

        SaveManager.update(data => {
            data.research[id] = { id, isUnlocked: true };
        });

        console.info(`[ResearchManager] Unlocked research: ${config.name}`);
        return true;
    }

    public static applyServerUnlock(id: string): boolean {
        const config = this.getConfig(id);
        if (!config) return false;

        SaveManager.update(data => {
            data.research[id] = { id, isUnlocked: true };
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

    private static applyServerCatalogMetadata(serverResearch: ResearchStateDto): void {
        const override: Partial<ResearchConfig> = {};
        if (Number.isFinite(serverResearch.cost)) override.cost = Math.max(0, Math.floor(serverResearch.cost ?? 0));
        if (this.isKnownEffectType(serverResearch.effectType)) override.effectType = serverResearch.effectType;
        if (Number.isFinite(serverResearch.effectValue)) override.effectValue = Math.floor(serverResearch.effectValue ?? 0);
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
                total += config.effectValue;
            }
        }
        return total;
    }
}
