import { WeightStage } from "../model/CatModel";

export function getFriendActivityLabel(type: string): string {
    if (type === "friend_add") return "添加";
    if (type === "friend_visit") return "访问";
    if (type === "friend_gift") return "送礼";
    if (type === "friend_visited_by") return "来访";
    if (type === "friend_gift_received") return "收礼";
    if (type === "friend_help") return "助力";
    if (type === "friend_help_received") return "获助";
    return "互动";
}

export function getNetworkModeLabel(mode: "offline" | "ready" | "unconfigured" | "error"): string {
    if (mode === "ready") return "在线";
    if (mode === "offline") return "待连接";
    if (mode === "error") return "错误";
    return "未配置";
}

export function getSyncModeLabel(mode: "offline" | "ready" | "syncing" | "failed"): string {
    if (mode === "ready") return "已连接";
    if (mode === "syncing") return "同步中";
    if (mode === "failed") return "失败";
    return "离线";
}

export function getTaskTypeLabel(type: string): string {
    if (type === "main") return "主线";
    if (type === "daily") return "每日";
    if (type === "achievement") return "成就";
    return "任务";
}

export function getItemDisplayName(itemId: string): string {
    const nameMap: Record<string, string> = {
        item_cat_food_pack: "猫粮包",
        item_coin_pack_small: "小袋金币",
        item_shard_orange: "大橘碎片",
    };
    return nameMap[itemId] ?? itemId;
}

export function getShopTabLabel(tab: string): string {
    if (tab === "resource") return "资源货架";
    if (tab === "item") return "道具货架";
    if (tab === "cat") return "猫咪招募";
    return "装饰外观";
}

export function getShopIcon(type: string): string {
    if (type === "resource") return "bean";
    if (type === "shard") return "shard";
    if (type === "equipment") return "equip";
    if (type === "cat") return "cat";
    if (type === "deco") return "deco";
    return "gift";
}

export function getResourceIconClass(resource: string): string {
    if (resource === "coin") return "coin";
    if (resource === "bean") return "bean";
    if (resource === "catFood") return "food";
    if (resource === "diamond") return "diamond";
    return "gift";
}

export function getInventoryTabLabel(tab: string): string {
    if (tab === "resource") return "资源道具";
    if (tab === "item") return "功能道具";
    if (tab === "shard") return "猫咪碎片";
    if (tab === "other") return "其他物品";
    return "全部物品";
}

export function getInventoryTabDesc(tab: string): string {
    if (tab === "resource") return "金币、咖啡豆、猫粮和钻石会与顶部资产栏实时同步。";
    if (tab === "item") return "资源包和功能券可直接使用，效果由真实背包数据决定。";
    if (tab === "shard") return "碎片用于后续招募和升星玩法，目前先作为材料保存。";
    if (tab === "other") return "活动、装备和装饰类物品会逐步放到这里。";
    return "背包会同时显示资产概览和已拥有道具，方便核对商店购买结果。";
}

export function getItemIconClass(itemId: string): string {
    if (itemId.includes("cat_food")) return "food";
    if (itemId.includes("coin")) return "coin";
    if (itemId.includes("shard")) return "shard";
    if (itemId.includes("equip")) return "equip";
    return "gift";
}

export function getResearchIconClass(effectType: string): string {
    if (effectType.includes("coin")) return "coin";
    if (effectType.includes("bean")) return "bean";
    if (effectType.includes("food")) return "food";
    if (effectType.includes("cat")) return "cat";
    return "equip";
}

export function getResearchEffectLabel(type: string): string {
    if (type === "coin_production_mult") return "金币产量";
    if (type === "bean_reduce") return "咖啡豆消耗";
    if (type === "upgrade_cost_reduce") return "升级成本";
    if (type === "offline_bonus") return "离线收益";
    return "研究效果";
}

export function getCatTabTitle(tab: string): string {
    if (tab === "upgrade") return "升级";
    if (tab === "skill") return "技能";
    if (tab === "equip") return "装备详情";
    if (tab === "skin") return "皮肤";
    return "信息";
}

export function getWeightStageLabel(stage: WeightStage): string {
    if (stage === WeightStage.SUPER_FAT) return "巨胖";
    if (stage === WeightStage.FAT) return "胖乎乎";
    return "正常";
}

export function getCatRoleLabel(role: string): string {
    if (role === "producer") return "生产型";
    if (role === "saver") return "节省型";
    if (role === "launcher") return "发射型";
    if (role === "support") return "辅助型";
    return "生产型";
}

export function renderStars(rarity: string): string {
    const count = rarity === "SS" ? 5 : rarity === "S" ? 4 : rarity === "A" ? 3 : 2;
    return "★★★★★".slice(0, count) + "☆☆☆☆☆".slice(0, 5 - count);
}

export function getSkillName(skillId: string): string {
    const names: Record<string, string> = {
        s_001: "咖啡灵感",
        s_002: "火箭助推",
        s_003: "节省豆仓",
        s_004: "三花祝福",
        s_005: "巡逻加班",
    };
    return names[skillId] ?? "咖啡专注";
}

export function getSkillDesc(role: string): string {
    if (role === "launcher") return "发射猫咪时提高金币结算，适合放在高收益楼层。";
    if (role === "saver") return "减少咖啡豆消耗，让生产线更稳定。";
    if (role === "support") return "提升同楼层伙伴效率，适合搭配生产型猫咪。";
    return "生产咖啡时有概率产出额外原料。";
}

export function getCatBubble(personality: string, unlocked: boolean): string {
    if (!unlocked) return "还在门外观察这家公司。";
    if (personality.includes("贪吃")) return "老板，来杯咖啡提提神吧~";
    if (personality.includes("调皮")) return "发射按钮看起来很好玩。";
    if (personality.includes("黏人")) return "今天也要一起值班。";
    if (personality.includes("神秘")) return "咖啡香里藏着秘密。";
    return "准备开始工作。";
}

export function getCatStory(name: string, personality: string, breed: string, assignedName: string): string {
    return `${name}是一只${personality}的${breed}，现在常驻${assignedName}。它相信稳定的咖啡香能让公司更快成长，也会在忙碌时提醒大家补充猫粮。`;
}
