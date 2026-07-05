export type CatTabId = "info" | "upgrade" | "skill" | "equip" | "skin";
export type CatEquipmentSlotName = "项圈" | "杯子" | "坐垫";
export type CatSkinId = "default" | "apron" | "manager" | "festival";

export interface CatSideTabItem {
    id: CatTabId;
    label: string;
}

export interface CatSkinTheme {
    id: CatSkinId;
    artKey: CatSkinId;
    name: string;
    desc: string;
    state: string;
    style: string;
    className: string;
    colorA: string;
    colorB: string;
    swatches: string[];
}

export interface CatEquipmentSlot {
    slot: CatEquipmentSlotName;
    kind: string;
}

export interface CatEquipmentFallback {
    id: string;
    slot: CatEquipmentSlotName;
    kind: string;
    name: string;
    rarity: string;
    bonus: string;
    levelMax: number;
    upgradeCost: number;
    source: string;
    effects: Array<{ label: string; baseValue: number; perLevel?: number; unit?: string }>;
}

export interface CatEquipmentEffectLine {
    type: "materialOutput" | "mood" | "catFoodCost" | "wageCost";
    label: string;
}

export const CAT_SIDE_TABS: CatSideTabItem[] = [
    { id: "info", label: "信息" },
    { id: "upgrade", label: "升级" },
    { id: "skill", label: "技能" },
    { id: "equip", label: "装备" },
    { id: "skin", label: "皮肤" },
];

export const CAT_SKIN_THEMES: CatSkinTheme[] = [
    { id: "default", artKey: "default", name: "默认工作服", desc: "原料产量稳定", state: "可使用", style: "咖啡绿", className: "cafe", colorA: "#567648", colorB: "#2f4b32", swatches: ["#567648", "#e8c178", "#5b3924"] },
    { id: "apron", artKey: "apron", name: "烘焙围裙", desc: "咖啡价值 +2%", state: "可使用", style: "烘焙师", className: "apron", colorA: "#c46b34", colorB: "#fff0d0", swatches: ["#c46b34", "#fff0d0", "#8a5631"] },
    { id: "manager", artKey: "manager", name: "店长披肩", desc: "金币加成 +1%", state: "待开放", style: "店长装", className: "manager", colorA: "#2f6f69", colorB: "#173d44", swatches: ["#2f6f69", "#d9b06a", "#173d44"] },
    { id: "festival", artKey: "festival", name: "节日礼服", desc: "心情上限 +3", state: "待开放", style: "节日", className: "festival", colorA: "#7b4bc0", colorB: "#cf6a9a", swatches: ["#7b4bc0", "#cf6a9a", "#fff2a0"] },
];

export const CAT_EQUIPMENT_SLOTS: CatEquipmentSlot[] = [
    { slot: "项圈", kind: "collar" },
    { slot: "杯子", kind: "cup" },
    { slot: "坐垫", kind: "cushion" },
];

export const CAT_LOCKED_EQUIPMENT_SLOT = {
    slot: "饰品",
    kind: "lock",
    name: "饰品槽",
    unlockText: "30级解锁",
    bonus: "等待开放",
    actionLabel: "锁定",
};

export const CAT_DEFAULT_EQUIPMENT: CatEquipmentFallback = {
    id: "equip_collar_green",
    slot: "项圈",
    kind: "collar",
    name: "猫咪项圈",
    rarity: "B",
    bonus: "原料 +15%",
    levelMax: 5,
    upgradeCost: 80,
    source: "新手任务",
    effects: [{ label: "原料产量", baseValue: 15, perLevel: 1, unit: "%" }],
};

export const CAT_EQUIPMENT_EFFECT_LINES: CatEquipmentEffectLine[] = [
    { type: "materialOutput", label: "原料产量" },
    { type: "mood", label: "心情上限" },
    { type: "catFoodCost", label: "猫粮消耗" },
    { type: "wageCost", label: "工资消耗" },
];
