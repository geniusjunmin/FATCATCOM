import { ShopItemConfig } from "../model/ItemModel";
import { ConfigManager } from "./ConfigManager";
import { SaveManager } from "./SaveManager";
import { ResourceManager } from "./ResourceManager";
import { InventoryManager } from "./InventoryManager";
import { ShopStateDto } from "../net/ApiTypes";

export class ShopManager {
    /**
     * Get all shop items in a category
     */
    public static getShopItems(category: string): ShopItemConfig[] {
        return ConfigManager.shops.filter(s => s.category === category);
    }

    /**
     * Get remaining daily limit for a shop item
     */
    public static getRemainingLimit(shopItemId: string): number {
        const config = ConfigManager.shops.find(s => s.id === shopItemId);
        if (!config) return 0;
        if (config.limitDaily <= 0) return 999; // Unlimited

        const history = SaveManager.data.shopPurchaseHistory[shopItemId] || 0;
        return Math.max(0, config.limitDaily - history);
    }

    /**
     * Buy an item
     */
    public static buyItem(shopItemId: string, count: number = 1): boolean {
        const config = ConfigManager.shops.find(s => s.id === shopItemId);
        if (!config) return false;

        const limit = this.getRemainingLimit(shopItemId);
        if (limit < count) return false;

        const totalPrice = config.priceAmount * count;
        const price = { [config.priceType]: totalPrice };

        if (!ResourceManager.spend(price, `buy_shop_item_${shopItemId}`)) {
            return false;
        }

        // Add to inventory or directly to resources
        const itemConfig = ConfigManager.items.find(i => i.id === config.itemId);
        if (itemConfig) {
            InventoryManager.addItem(config.itemId, count);
        }

        // Update purchase history
        SaveManager.update(data => {
            data.shopPurchaseHistory[shopItemId] = (data.shopPurchaseHistory[shopItemId] || 0) + count;
        });

        console.info(`[ShopManager] Bought ${count} of ${shopItemId}`);
        return true;
    }

    public static fulfillServerPurchase(shopItemId: string, count: number = 1, remainingDaily?: number): boolean {
        const config = ConfigManager.shops.find(s => s.id === shopItemId);
        if (!config) return false;

        if (remainingDaily === undefined) {
            const limit = this.getRemainingLimit(shopItemId);
            if (limit < count) return false;
        }

        const itemConfig = ConfigManager.items.find(i => i.id === config.itemId);
        if (itemConfig) {
            InventoryManager.addItem(config.itemId, count);
        }

        SaveManager.update(data => {
            if (remainingDaily !== undefined && config.limitDaily > 0) {
                data.shopPurchaseHistory[shopItemId] = Math.max(0, config.limitDaily - remainingDaily);
            } else {
                data.shopPurchaseHistory[shopItemId] = (data.shopPurchaseHistory[shopItemId] || 0) + count;
            }
        });

        console.info(`[ShopManager] Fulfilled server purchase ${count} of ${shopItemId}`);
        return true;
    }

    public static applyServerSnapshot(states: ShopStateDto[]): void {
        if (!states.length) return;
        SaveManager.update(data => {
            for (const state of states) {
                const config = ConfigManager.shops.find(s => s.id === state.shopItemId);
                if (!config || config.limitDaily <= 0) continue;
                data.shopPurchaseHistory[state.shopItemId] = Math.max(0, Math.min(config.limitDaily, state.purchasedToday));
            }
        });
    }
}
