export type MainPanelId = "factory" | "cats" | "buildings" | "shop" | "inventory" | "research" | "tasks" | "achievements" | "mail" | "friends" | "settings";

export type MainNavItem = {
    id: MainPanelId;
    label: string;
    iconClass: string;
};

export const ORDERED_MAIN_PANELS: MainPanelId[] = ["factory", "cats", "buildings", "shop", "inventory", "research"];

export const MAIN_PANEL_BINDINGS: Array<{ names: string[]; panel: MainPanelId }> = [
    { names: ["factory", "工厂"], panel: "factory" },
    { names: ["cats", "cat", "猫咪"], panel: "cats" },
    { names: ["buildings", "building", "建筑"], panel: "buildings" },
    { names: ["shop", "商店"], panel: "shop" },
    { names: ["inventory", "背包"], panel: "inventory" },
    { names: ["research", "研究"], panel: "research" },
    { names: ["tasks", "任务"], panel: "tasks" },
];

export const MAIN_PANEL_SELECTED_NAMES: Record<MainPanelId, string[]> = {
    factory: ["factory", "工厂"],
    cats: ["cats", "cat", "猫咪"],
    buildings: ["buildings", "building", "建筑"],
    shop: ["shop", "商店"],
    inventory: ["inventory", "背包"],
    research: ["research", "研究"],
    tasks: ["tasks", "任务"],
    achievements: ["achievements", "achievement", "成就"],
    mail: ["mail", "邮件"],
    friends: ["friends", "friend", "好友"],
    settings: ["settings", "setting", "设置"],
};

export const MAIN_DOM_NAV_ITEMS: MainNavItem[] = [
    { id: "factory", label: "工厂", iconClass: "ico-factory" },
    { id: "cats", label: "猫咪", iconClass: "ico-cats" },
    { id: "buildings", label: "建筑", iconClass: "ico-building" },
    { id: "shop", label: "商店", iconClass: "ico-shop" },
    { id: "inventory", label: "背包", iconClass: "ico-inventory" },
    { id: "research", label: "研究", iconClass: "ico-research" },
];

export const MAIN_NAV_FEATURE_ICON_BY_PANEL: Partial<Record<MainPanelId, string>> = {
    factory: "factory",
    buildings: "buildings",
    shop: "shop",
    inventory: "inventory",
    research: "research",
};
