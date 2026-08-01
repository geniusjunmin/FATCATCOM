import { ItemConfig, ItemType, InventoryItem } from "../model/ItemModel";
import { ConfigManager } from "./ConfigManager";
import { SaveManager } from "./SaveManager";
import { ResourceManager } from "./ResourceManager";
import { EventBus, GameEvents } from "../core/EventBus";
import { InventoryItemDto } from "../net/ApiTypes";

export class InventoryManager {
    private static _serverAuthority = false;

    /**
     * Add items to inventory
     */
    public static addItem(itemId: string, count: number): void {
        SaveManager.update(data => {
            if (!data.inventory[itemId]) {
                data.inventory[itemId] = { itemId, count: 0 };
            }
            data.inventory[itemId].count += count;
        });
        EventBus.emit(GameEvents.INVENTORY_CHANGED, { itemId, count: this.getItemCount(itemId), authority: "offline" });
        console.info(`[InventoryManager] Added ${count} of ${itemId}`);
    }

    /**
     * Get all owned items
     */
    public static getOwnedItems(): InventoryItem[] {
        return Object.values(SaveManager.data.inventory).filter(item => item.count > 0);
    }

    public static getItemCount(itemId: string): number {
        return SaveManager.data.inventory[itemId]?.count ?? 0;
    }

    public static hasItem(itemId: string, count: number = 1): boolean {
        return this.getItemCount(itemId) >= count;
    }

    /**
     * Use an item
     */
    public static useItem(itemId: string, count: number = 1): boolean {
        const owned = SaveManager.data.inventory[itemId];
        if (!owned || owned.count < count) {
            return false;
        }

        const config = ConfigManager.items.find(i => i.id === itemId);
        if (!config) return false;

        let used = false;
        switch (config.type) {
            case ItemType.RESOURCE:
                if (config.resourceType && config.resourceAmount) {
                    ResourceManager.add({ [config.resourceType]: config.resourceAmount * count }, `use_item_${itemId}`);
                    used = true;
                }
                break;
            case ItemType.CONSUMABLE:
                // Handle logic like speed-up, mood boost etc.
                used = true; 
                break;
            default:
                // Other items might not be "usable" directly
                break;
        }

        if (used) {
            SaveManager.update(data => {
                data.inventory[itemId].count -= count;
            });
            EventBus.emit(GameEvents.INVENTORY_CHANGED, { itemId, count: this.getItemCount(itemId), authority: "offline" });
            console.info(`[InventoryManager] Used ${count} of ${itemId}`);
        }

        return used;
    }

    public static applyServerSnapshot(items: InventoryItemDto[]): void {
        if (!items.length) return;
        SaveManager.update(data => {
            for (const item of items) {
                data.inventory[item.itemId] = {
                    itemId: item.itemId,
                    count: Math.max(0, Math.floor(item.quantity)),
                };
            }
        });
        this._serverAuthority = true;
        EventBus.emit(GameEvents.INVENTORY_CHANGED, { items, authority: "server" });
    }

    public static applyServerItem(item: InventoryItemDto): void {
        this.applyServerSnapshot([item]);
    }

    public static applyServerQuantity(itemId: string, quantity: number): void {
        SaveManager.update(data => {
            data.inventory[itemId] = {
                itemId,
                count: Math.max(0, Math.floor(quantity)),
            };
        });
        this._serverAuthority = true;
        EventBus.emit(GameEvents.INVENTORY_CHANGED, { itemId, count: this.getItemCount(itemId), authority: "server" });
    }

    public static get hasServerAuthority(): boolean {
        return this._serverAuthority;
    }
}
