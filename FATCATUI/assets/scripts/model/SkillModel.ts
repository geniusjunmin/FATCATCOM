export enum SkillType {
    PRODUCTION_BOOST = "production_boost", // Multiplier to own production
    BEAN_SAVER = "bean_saver",             // Reduce bean cost for self
    TEAM_BUFF = "team_buff",               // Buff all cats in the same building
    COIN_REWARD = "coin_reward"            // Random coin burst
}

export interface SkillConfig {
    id: string;
    name: string;
    description: string;
    type: SkillType;
    value: number; // e.g., 20 for 20%
    icon?: string;
}
