import { SkillConfig, SkillType } from "../model/SkillModel";
import { ConfigManager } from "./ConfigManager";
import { CatConfig } from "../model/CatModel";

export class SkillManager {
    /**
     * Get a skill config by ID
     */
    public static getSkillConfig(id: string): SkillConfig | undefined {
        return ConfigManager.skills.find(s => s.id === id);
    }

    /**
     * Get total production boost for a specific cat (including own and team buffs).
     * Accepts teammates to avoid circular dependency with CatManager.
     */
    public static getProductionMultiplier(catConfig: CatConfig, teammates: CatConfig[] = []): number {
        let multiplier = 1.0;

        // 1. Own skill boost
        if (catConfig.skillId) {
            const skill = this.getSkillConfig(catConfig.skillId);
            if (skill && skill.type === SkillType.PRODUCTION_BOOST) {
                multiplier += skill.value / 100;
            }
        }

        // 2. Team buffs from others in the same building
        for (const teamCat of teammates) {
            if (teamCat.id === catConfig.id) continue;
            if (teamCat.skillId) {
                const skill = this.getSkillConfig(teamCat.skillId);
                if (skill && skill.type === SkillType.TEAM_BUFF) {
                    multiplier += skill.value / 100;
                }
            }
        }

        return multiplier;
    }

    /**
     * Get bean cost reduction for a specific cat
     */
    public static getBeanCostMultiplier(catConfig: CatConfig): number {
        let multiplier = 1.0;
        if (!catConfig.skillId) return multiplier;

        const skill = this.getSkillConfig(catConfig.skillId);
        if (skill && skill.type === SkillType.BEAN_SAVER) {
            multiplier -= skill.value / 100;
        }

        return Math.max(0.1, multiplier);
    }
}
