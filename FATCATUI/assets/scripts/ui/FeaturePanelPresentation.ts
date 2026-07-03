export type ShopTabId = "resource" | "item" | "cat" | "deco";
export type InventoryTabId = "all" | "resource" | "item" | "shard" | "other";

export interface FeatureToggleItem {
    id: string;
    name: string;
    desc: string;
}

export interface FeaturePosition {
    left: number;
    top: number;
}

export interface ResearchPlaceholderNode {
    id: string;
    name: string;
    tier: number;
    position: FeaturePosition;
    effectType?: string;
    requirement: string;
}

export interface ResearchNodePresentation {
    displayName: string;
    tier: number;
    level: string;
}

export interface InventoryPreviewCard {
    id: string;
    name: string;
    art: string;
    count: number;
    category: Exclude<InventoryTabId, "all" | "resource">;
    rarity: "B" | "A" | "S";
    kind: string;
    description: string;
    source: string;
}

export interface InventoryAllSlot {
    key: string;
    fallbackKey?: string;
}

export interface FactoryAppearancePreview {
    id: string;
    name: string;
    description: string;
    unlockLabel: string;
    unlocked: boolean;
    bonuses: Array<{ icon: string; label: string; value: string }>;
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

export const FACTORY_APPEARANCES: FactoryAppearancePreview[] = [
    {
        id: "simple",
        name: "简版工厂",
        description: "熟悉的六层咖啡工坊，温暖、可靠，适合稳定经营。",
        unlockLabel: "默认拥有",
        unlocked: true,
        bonuses: [
            { icon: "coin", label: "全局收益", value: "+5%" },
            { icon: "deco", label: "生产速度", value: "+5%" },
            { icon: "cat", label: "猫咪工资", value: "-5%" },
            { icon: "gift", label: "仓库容量", value: "+10%" },
        ],
    },
    {
        id: "classic",
        name: "经典工厂",
        description: "木雕、砖墙与黄铜共同构成的咖啡公会式工厂。",
        unlockLabel: "工厂 30 级解锁",
        unlocked: false,
        bonuses: [
            { icon: "coin", label: "订单金币", value: "+8%" },
            { icon: "cat", label: "顾客心情", value: "+5%" },
            { icon: "bean", label: "咖啡产量", value: "+8%" },
            { icon: "gift", label: "仓库容量", value: "+12%" },
        ],
    },
    {
        id: "steam",
        name: "蒸汽工厂",
        description: "铜制锅炉与机械传动持续运转的高压烘焙工坊。",
        unlockLabel: "工厂 45 级解锁",
        unlocked: false,
        bonuses: [
            { icon: "deco", label: "生产速度", value: "+12%" },
            { icon: "bean", label: "豆耗降低", value: "-6%" },
            { icon: "coin", label: "订单金币", value: "+10%" },
            { icon: "gift", label: "仓库容量", value: "+15%" },
        ],
    },
    {
        id: "future",
        name: "未来工厂",
        description: "以洁净能源、生态温室和智能设备驱动的咖啡实验室。",
        unlockLabel: "工厂 60 级解锁",
        unlocked: false,
        bonuses: [
            { icon: "deco", label: "生产速度", value: "+15%" },
            { icon: "diamond", label: "研究效率", value: "+10%" },
            { icon: "coin", label: "全局收益", value: "+12%" },
            { icon: "gift", label: "仓库容量", value: "+20%" },
        ],
    },
];

export const INVENTORY_TABS: Array<{ id: InventoryTabId; label: string }> = [
    { id: "all", label: "全部" },
    { id: "resource", label: "资源" },
    { id: "item", label: "道具" },
    { id: "shard", label: "碎片" },
    { id: "other", label: "其他" },
];

export const INVENTORY_PREVIEW_CARDS: InventoryPreviewCard[] = [
    { id: "cat-food-small", name: "猫粮小包", art: "catFoodSmall", count: 200, category: "item", rarity: "B", kind: "资源道具", description: "打开后获得一份猫粮补给。", source: "资源商店、每日任务" },
    { id: "cat-food-large", name: "猫粮大袋", art: "catFoodLarge", count: 1000, category: "item", rarity: "A", kind: "资源道具", description: "装满优质猫粮的大型补给袋。", source: "资源商店、活动奖励" },
    { id: "coffee-cup", name: "成品咖啡", art: "equipCup", count: 1260, category: "other", rarity: "B", kind: "订单材料", description: "已完成萃取、等待订单装箱的咖啡。", source: "咖啡厅、订单生产" },
    { id: "speed-5", name: "加速5分", art: "speedTicket", count: 12, category: "item", rarity: "B", kind: "生产道具", description: "使用后让当前工厂生产加速 5 分钟。", source: "每日订单、活动任务" },
    { id: "speed-30", name: "加速30分", art: "speedTicket", count: 8, category: "item", rarity: "A", kind: "生产道具", description: "高效生产券，可让全厂加速 30 分钟。", source: "成就奖励、限时商店" },
    { id: "super-food", name: "超级猫粮", art: "superFood", count: 25, category: "item", rarity: "S", kind: "猫咪道具", description: "高能营养罐，可大幅提升猫咪心情。", source: "高级任务、限时活动" },
    { id: "factory-voucher", name: "工厂通兑券", art: "factoryVoucher", count: 6, category: "item", rarity: "A", kind: "经营道具", description: "用于兑换工厂生产与装饰奖励。", source: "工厂里程碑、协作目标" },
    { id: "order-refresh", name: "订单券", art: "orderVoucher", count: 7, category: "item", rarity: "B", kind: "经营道具", description: "立即刷新一批咖啡订单。", source: "订单里程碑、好友赠礼" },
    { id: "guard-hour", name: "保护罩", art: "guardCharm", count: 5, category: "item", rarity: "A", kind: "防护道具", description: "保护一小时离线收益不受损失。", source: "活动任务、道具商店" },
    { id: "shard-orange", name: "大橘碎片", art: "catOrange", count: 32, category: "shard", rarity: "A", kind: "猫咪碎片", description: "集齐后可招募或升星大橘。", source: "猫咪招募、故事关卡" },
    { id: "shard-black", name: "黑猫碎片", art: "catBlack", count: 18, category: "shard", rarity: "A", kind: "猫咪碎片", description: "集齐后可招募或升星黑猫。", source: "猫咪招募、好友协作" },
    { id: "shard-white", name: "布丁碎片", art: "catWhite", count: 22, category: "shard", rarity: "A", kind: "猫咪碎片", description: "集齐后可招募或升星布丁。", source: "猫咪招募、每日订单" },
    { id: "shard-calico", name: "灰皮碎片", art: "catCalico", count: 15, category: "shard", rarity: "A", kind: "猫咪碎片", description: "集齐后可招募或升星灰皮。", source: "猫咪招募、活动任务" },
    { id: "decor-coin", name: "装饰币", art: "coin", count: 80, category: "other", rarity: "B", kind: "装饰货币", description: "用于兑换工厂外观和楼层摆件。", source: "装饰收藏、访问好友" },
    { id: "research-stone", name: "研究石", art: "diamond", count: 120, category: "other", rarity: "A", kind: "研究材料", description: "实验室研究使用的稀有材料。", source: "研究任务、协作奖励" },
    { id: "accelerator", name: "加速器", art: "accelerator", count: 43, category: "other", rarity: "A", kind: "机械材料", description: "用于强化生产设备的精密计时装置。", source: "建筑升级、研究任务" },
    { id: "lucky-cup", name: "幸运杯", art: "equipCup", count: 43, category: "other", rarity: "A", kind: "装备材料", description: "猫咪装备材料，可强化幸运杯。", source: "装备商店、咖啡订单" },
    { id: "dried-fish", name: "小鱼干", art: "driedFish", count: 67, category: "other", rarity: "B", kind: "猫咪零食", description: "猫咪喜爱的零食，可恢复少量心情。", source: "每日签到、好友赠礼" },
    { id: "comfort-cushion", name: "舒适垫", art: "equipCushion", count: 9, category: "other", rarity: "B", kind: "装备材料", description: "猫咪装备材料，可强化舒适坐垫。", source: "装备商店、成就奖励" },
];

export const INVENTORY_ALL_SLOTS: InventoryAllSlot[] = [
    { key: "resource:bean" },
    { key: "item:item_cat_food_pack", fallbackKey: "preview:cat-food-small" },
    { key: "preview:cat-food-large" },
    { key: "preview:coffee-cup" },
    { key: "resource:coin" },
    { key: "resource:diamond" },
    { key: "preview:speed-5" },
    { key: "preview:speed-30" },
    { key: "preview:super-food" },
    { key: "preview:factory-voucher" },
    { key: "preview:guard-hour" },
    { key: "preview:order-refresh" },
    { key: "preview:shard-orange" },
    { key: "preview:shard-black" },
    { key: "preview:shard-white" },
    { key: "preview:shard-calico" },
    { key: "preview:decor-coin" },
    { key: "preview:research-stone" },
    { key: "preview:accelerator" },
    { key: "preview:dried-fish" },
];

export const RESEARCH_NODE_POSITIONS: FeaturePosition[] = [
    { left: 35, top: 4 },
    { left: 8, top: 28 },
    { left: 62, top: 28 },
];

export const RESEARCH_NODE_PRESENTATIONS: Record<string, ResearchNodePresentation> = {
    res_basic_prod: { displayName: "咖啡萃取 I", tier: 1, level: "Lv.5/10" },
    res_bean_save: { displayName: "咖啡烘焙 I", tier: 2, level: "Lv.3/10" },
    res_cheap_upgrade: { displayName: "发酵技术 I", tier: 2, level: "Lv.3/10" },
};

export const RESEARCH_PLACEHOLDER_NODES: ResearchPlaceholderNode[] = [
    {
        id: "res_extract_2",
        name: "咖啡萃取 II",
        tier: 3,
        position: { left: 1, top: 54 },
        effectType: "coin_production_mult",
        requirement: "完成基础研究",
    },
    {
        id: "res_roast_2",
        name: "烘焙技术 II",
        tier: 3,
        position: { left: 35, top: 54 },
        effectType: "bean_reduce",
        requirement: "完成烘焙技术",
    },
    {
        id: "res_ferment_2",
        name: "发酵技术 II",
        tier: 3,
        position: { left: 69, top: 54 },
        effectType: "upgrade_cost_reduce",
        requirement: "完成成本优化",
    },
    {
        id: "res_espresso",
        name: "浓缩咖啡",
        tier: 4,
        position: { left: 35, top: 79 },
        requirement: "完成第三层研究",
    },
];
