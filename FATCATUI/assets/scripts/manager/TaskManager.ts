import { TaskConfig, TaskGoalType, TaskType } from "../model/TaskModel";
import { ConfigManager } from "./ConfigManager";
import { SaveManager } from "./SaveManager";
import { ResourceManager } from "./ResourceManager";
import { InventoryManager } from "./InventoryManager";
import { EventBus, GameEvents } from "../core/EventBus";

export class TaskManager {
    private static _updating = false;

    /**
     * Initialize task listeners
     */
    public static init(): void {
        EventBus.on(GameEvents.SAVE_UPDATED, () => TaskManager.onSaveUpdated());
    }

    private static onSaveUpdated(): void {
        // Prevent infinite recursion: SAVE_UPDATED -> syncProgress -> SaveManager.update -> SAVE_UPDATED
        if (this._updating) return;
        this._updating = true;
        try {
            this.checkStateGoals();
        } finally {
            this._updating = false;
        }
    }

    private static checkStateGoals(): void {
        const data = SaveManager.data;

        // Check total coins earned (use current coin count as approximation)
        const totalCoins = data.resources?.coin ?? 0;
        this.syncProgress(TaskGoalType.TOTAL_COIN, totalCoins);

        // Check "Unlock Cat" count
        const unlockedCats = Object.values(data.cats).filter(c => c.isUnlocked).length;
        this.syncProgress(TaskGoalType.UNLOCK_CAT, unlockedCats);

        // Check "Upgrade Building" total levels
        const totalBuildingLevels = Object.values(data.buildings).reduce((sum, b) => sum + b.level, 0);
        this.syncProgress(TaskGoalType.UPGRADE_BUILDING, totalBuildingLevels);

        // Check "Research" count
        const unlockedResearch = Object.values(data.research).filter(r => r.isUnlocked).length;
        this.syncProgress(TaskGoalType.TOTAL_RESEARCH, unlockedResearch);
    }

    /**
     * Sync progress for state-based goals (sets absolute value, not incremental)
     */
    public static syncProgress(goalType: TaskGoalType, totalValue: number): void {
        const activeTasks = ConfigManager.tasks.filter(t => t.goalType === goalType);
        let changed = false;
        
        for (const config of activeTasks) {
            const task = SaveManager.data.tasks[config.id];
            if (!task) {
                SaveManager.data.tasks[config.id] = { id: config.id, currentValue: totalValue, isClaimed: false };
                changed = true;
            } else if (!task.isClaimed && task.currentValue !== totalValue) {
                task.currentValue = totalValue;
                changed = true;
            }
        }

        // Only persist if something actually changed — avoid emitting SAVE_UPDATED again
        if (changed) {
            SaveManager.data.updatedAt = Date.now();
            // Directly persist without going through SaveManager.update to avoid recursive emit
            SaveManager.persist();
        }
    }

    /**
     * Claim task rewards
     */
    public static claimReward(taskId: string): boolean {
        const config = ConfigManager.tasks.find(t => t.id === taskId);
        const task = SaveManager.data.tasks[taskId];
        if (!config || !task || task.isClaimed || task.currentValue < config.goalValue) {
            return false;
        }

        SaveManager.update(data => {
            data.tasks[taskId].isClaimed = true;
        });

        // Give rewards
        if (config.rewards.coin) ResourceManager.add({ coin: config.rewards.coin }, `task_reward_${taskId}`);
        if (config.rewards.diamond) ResourceManager.add({ diamond: config.rewards.diamond }, `task_reward_${taskId}`);
        if (config.rewards.researchPoint) ResourceManager.add({ researchPoint: config.rewards.researchPoint }, `task_reward_${taskId}`);
        
        if (config.rewards.items) {
            for (const item of config.rewards.items) {
                InventoryManager.addItem(item.itemId, item.count);
            }
        }

        console.info(`[TaskManager] Claimed reward for task: ${config.name}`);
        return true;
    }

    /**
     * Get all active (unclaimed or in-progress) tasks
     */
    public static getActiveTasks(): { config: TaskConfig, data: any }[] {
        return ConfigManager.tasks
            .map(config => ({
                config,
                data: SaveManager.data.tasks[config.id] || { id: config.id, currentValue: 0, isClaimed: false }
            }))
            .filter(item => !item.data.isClaimed);
    }
}
