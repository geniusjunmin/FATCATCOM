export type ShopTabId = "resource" | "item" | "cat" | "deco";
export type InventoryTabId = "all" | "resource" | "shard" | "other";

export interface FeatureToggleItem {
    id: string;
    name: string;
    desc: string;
}

export interface FeaturePosition {
    left: number;
    top: number;
}

export interface InventoryPreviewCard {
    id: string;
    name: string;
    art: string;
    count: number;
    category: Exclude<InventoryTabId, "all" | "resource">;
    description: string;
    source: string;
}

export const SETTINGS_PANEL_ITEMS: FeatureToggleItem[] = [
    { id: "music", name: "音乐", desc: "咖啡工厂背景音乐。" },
    { id: "sfx", name: "音效", desc: "按钮、生产和奖励音效。" },
    { id: "push", name: "通知", desc: "邮件、好友和宝箱提示。" },
    { id: "sync", name: "同步预览", desc: "为后续服务器同步展示状态。" },
];

export const DEFAULT_ENABLED_SETTING_IDS = ["music", "sfx"];

export function getDefaultSettingValue(id: string): boolean {
    return DEFAULT_ENABLED_SETTING_IDS.includes(id);
}

export const TASK_PROGRESS_MILESTONES = [20, 40, 60, 80, 100];

export const SHOP_TABS: Array<{ id: ShopTabId; label: string }> = [
    { id: "resource", label: "资源商店" },
    { id: "item", label: "道具商店" },
    { id: "cat", label: "猫咪商店" },
    { id: "deco", label: "装饰商店" },
];

export const SHOP_PREVIEW_CATALOGS: Record<string, Array<[string, string, string, string, string]>> = {
    resource: [
        ["精品咖啡豆", "咖啡豆 +5000", "bean", "450", "金币"],
        ["猫粮小包", "猫粮 +200", "food", "80", "钻石"],
        ["猫粮大袋", "猫粮 +1000", "food", "300", "钻石"],
        ["钻石礼包", "钻石 +300", "diamond", "30", "天"],
    ],
    item: [
        ["加速券", "生产加速 5分钟", "gift", "120", "金币"],
        ["高级加速券", "生产加速 30分钟", "gift", "60", "钻石"],
        ["订单刷新券", "立即刷新订单", "shard", "80", "钻石"],
        ["保护罩", "收益保护 1小时", "equip", "100", "钻石"],
    ],
    cat: [
        ["大橘碎片", "猫咪碎片 x10", "shard", "180", "钻石"],
        ["黑猫碎片", "猫咪碎片 x10", "cat", "180", "钻石"],
        ["雪球碎片", "猫咪碎片 x10", "cat", "180", "钻石"],
        ["招募券", "进行一次猫咪招募", "gift", "300", "钻石"],
    ],
    deco: [
        ["咖啡招牌", "工厂外观装饰", "deco", "800", "金币"],
        ["绿植套装", "楼层外观装饰", "deco", "1200", "金币"],
        ["复古时钟", "工厂外观装饰", "deco", "90", "钻石"],
        ["猫爪旗帜", "屋顶外观装饰", "deco", "120", "钻石"],
    ],
};

export const INVENTORY_TABS: Array<{ id: InventoryTabId; label: string }> = [
    { id: "all", label: "全部" },
    { id: "resource", label: "资源" },
    { id: "shard", label: "碎片" },
    { id: "other", label: "其他" },
];

export const INVENTORY_PREVIEW_CARDS: InventoryPreviewCard[] = [
    { id: "speed-5", name: "加速5分", art: "speedTicket", count: 12, category: "other", description: "使用后让当前工厂生产加速 5 分钟。", source: "每日订单、活动任务" },
    { id: "speed-30", name: "加速30分", art: "speedTicket", count: 8, category: "other", description: "高效生产券，可让全厂加速 30 分钟。", source: "成就奖励、限时商店" },
    { id: "order-refresh", name: "订单券", art: "orderVoucher", count: 7, category: "other", description: "立即刷新一批咖啡订单。", source: "订单里程碑、好友赠礼" },
    { id: "guard-hour", name: "保护罩", art: "guardCharm", count: 5, category: "other", description: "保护一小时离线收益不受损失。", source: "活动任务、道具商店" },
    { id: "shard-orange", name: "大橘碎片", art: "catOrange", count: 32, category: "shard", description: "集齐后可招募或升星大橘。", source: "猫咪招募、故事关卡" },
    { id: "shard-black", name: "黑猫碎片", art: "catBlack", count: 18, category: "shard", description: "集齐后可招募或升星黑猫。", source: "猫咪招募、好友协作" },
    { id: "shard-white", name: "布丁碎片", art: "catWhite", count: 22, category: "shard", description: "集齐后可招募或升星布丁。", source: "猫咪招募、每日订单" },
    { id: "shard-calico", name: "灰皮碎片", art: "catCalico", count: 15, category: "shard", description: "集齐后可招募或升星灰皮。", source: "猫咪招募、活动任务" },
    { id: "decor-coin", name: "装饰币", art: "coin", count: 80, category: "other", description: "用于兑换工厂外观和楼层摆件。", source: "装饰收藏、访问好友" },
    { id: "research-stone", name: "研究石", art: "diamond", count: 120, category: "other", description: "实验室研究使用的稀有材料。", source: "研究任务、协作奖励" },
    { id: "lucky-cup", name: "幸运杯", art: "equipCup", count: 43, category: "other", description: "猫咪装备材料，可强化幸运杯。", source: "装备商店、咖啡订单" },
    { id: "dried-fish", name: "小鱼干", art: "food", count: 67, category: "other", description: "猫咪喜爱的零食，可恢复少量心情。", source: "每日签到、好友赠礼" },
    { id: "comfort-cushion", name: "舒适垫", art: "equipCushion", count: 9, category: "other", description: "猫咪装备材料，可强化舒适坐垫。", source: "装备商店、成就奖励" },
];

export const RESEARCH_NODE_POSITIONS: FeaturePosition[] = [
    { left: 35, top: 6 },
    { left: 13, top: 32 },
    { left: 58, top: 32 },
    { left: 13, top: 58 },
    { left: 58, top: 58 },
    { left: 35, top: 80 },
];

export const RESEARCH_PLACEHOLDER_LABELS = ["咖啡萃取 II", "烘焙技术 II", "浓缩咖啡"];

export const RESEARCH_PLACEHOLDER_POSITIONS: FeaturePosition[] = [
    { left: 13, top: 58 },
    { left: 58, top: 58 },
    { left: 35, top: 80 },
];
