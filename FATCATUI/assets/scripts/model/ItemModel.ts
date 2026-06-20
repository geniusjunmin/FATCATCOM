export enum ItemType {
    RESOURCE = "resource",
    CONSUMABLE = "consumable",
    SHARD = "shard",
    EQUIPMENT = "equipment",
    OTHER = "other"
}

export interface ItemConfig {
    id: string;
    name: string;
    type: ItemType;
    rarity: "B" | "A" | "S" | "SS";
    description: string;
    icon: string;
    
    // For resource items (e.g. coin pack)
    resourceType?: string;
    resourceAmount?: number;
    
    // For shards
    targetCatId?: string;
    shardCountToUnlock?: number;
}

export interface EquipmentConfig {
    id: string;
    slot: string;
    kind: string;
    name: string;
    rarity: "B" | "A" | "S" | "SS";
    bonus: string;
    description: string;
    levelMax?: number;
    upgradeCost?: number;
    source?: string;
    effects?: EquipmentEffect[];
    isDefault?: boolean;
}

export interface EquipmentEffect {
    type: "materialOutput" | "mood" | "catFoodCost" | "beanOutput" | "wageCost";
    label: string;
    baseValue: number;
    perLevel?: number;
    unit?: string;
}

export interface InventoryItem {
    itemId: string;
    count: number;
}

// Shop models
export interface ShopItemConfig {
    id: string;
    itemId: string;
    category: "resource" | "item" | "cat" | "deco";
    priceType: "coin" | "diamond" | "catFood";
    priceAmount: number;
    limitDaily: number;
}
