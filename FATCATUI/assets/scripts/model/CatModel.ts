export type Rarity = "B" | "A" | "S" | "SS";
export type CatRole = "producer" | "saver" | "launcher" | "support";

export interface CatConfig {
    id: string;
    name: string;
    rarity: Rarity;
    role: CatRole;
    breed: string;
    personality: string;
    baseProduction: number;
    baseBeanCost: number;
    baseSalary: number;
    baseWeight: number;
    skillId: string;
    portrait: string;
    fullArt: string;
}

export enum WeightStage {
    NORMAL = "NORMAL",
    FAT = "FAT",
    SUPER_FAT = "SUPER_FAT"
}

export class CatModel {
    /**
     * Determine weight stage based on weight value
     * 0-39: Normal
     * 40-79: Fat
     * 80+: Super Fat
     */
    public static getWeightStage(weight: number): WeightStage {
        if (weight >= 80) return WeightStage.SUPER_FAT;
        if (weight >= 40) return WeightStage.FAT;
        return WeightStage.NORMAL;
    }

    /**
     * Get the production multiplier based on weight stage
     */
    public static getWeightProductionMultiplier(weight: number): number {
        const stage = this.getWeightStage(weight);
        if (stage === WeightStage.SUPER_FAT) return 1.80;
        if (stage === WeightStage.FAT) return 1.30;
        return 1.00;
    }

    /**
     * Calculate actual production based on level and weight
     */
    public static calculateProduction(baseProduction: number, level: number, weight: number): number {
        // Simplified level multiplier: 1 + (level - 1) * 0.1
        const levelMultiplier = 1 + (level - 1) * 0.1;
        const weightMultiplier = this.getWeightProductionMultiplier(weight);
        return Math.floor(baseProduction * levelMultiplier * weightMultiplier);
    }

    /**
     * Calculate upgrade cost based on level
     */
    public static calculateUpgradeCost(level: number): number {
        // Cost formula: baseCost * level^1.5
        const baseCost = 100;
        return Math.floor(baseCost * Math.pow(level, 1.5));
    }

    public static calculateUnlockCost(rarity: Rarity): number {
        if (rarity === "SS") return 500000;
        if (rarity === "S") return 180000;
        if (rarity === "A") return 45000;
        return 12000;
    }
}
