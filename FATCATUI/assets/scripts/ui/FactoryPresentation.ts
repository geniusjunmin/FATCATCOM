export type FactoryScene = "office" | "roast" | "tank" | "mill" | "cafe" | "storage";

export type FactoryFloorConfig = {
    no: string;
    name: string;
    buildingId: string;
    bonus: string;
    value: string;
    scene: FactoryScene;
};

export const MAIN_FACTORY_FLOORS: FactoryFloorConfig[] = [
    { no: "5F", name: "管理室", buildingId: "building_office_5f", bonus: "全局收益", value: "+15%", scene: "office" },
    { no: "4F", name: "烘焙车间", buildingId: "building_roast_4f", bonus: "原料产量", value: "+40%", scene: "roast" },
    { no: "3F", name: "发酵车间", buildingId: "building_ferment_3f", bonus: "咖啡豆消耗", value: "-20%", scene: "tank" },
    { no: "2F", name: "原料车间", buildingId: "building_material_2f", bonus: "咖啡价值", value: "+30%", scene: "mill" },
    { no: "1F", name: "咖啡厅", buildingId: "building_cafe_1f", bonus: "订单金币", value: "+25%", scene: "cafe" },
    { no: "B1", name: "原料仓库", buildingId: "building_storage_b1", bonus: "仓库容量", value: "+20%", scene: "storage" },
];

export const BUILDING_SCENE_BY_ID: Record<string, FactoryScene> = {
    building_office_5f: "office",
    building_roast_4f: "roast",
    building_ferment_3f: "tank",
    building_material_2f: "mill",
    building_cafe_1f: "cafe",
    building_storage_b1: "storage",
};

export const BUILDING_DISPLAY_NAME_BY_ID: Record<string, string> = {
    building_storage_b1: "原料仓库",
    building_cafe_1f: "咖啡厅",
    building_material_2f: "原料车间",
    building_ferment_3f: "发酵车间",
    building_roast_4f: "烘焙车间",
    building_office_5f: "管理室",
};

export function getBuildingScene(buildingId: string): FactoryScene {
    return BUILDING_SCENE_BY_ID[buildingId] ?? "cafe";
}

export function getBuildingDisplayName(buildingId: string): string {
    return BUILDING_DISPLAY_NAME_BY_ID[buildingId] ?? buildingId;
}

export function renderFactoryProps(scene: string): string {
    if (scene === "office") {
        return `<div class="shelf">▦</div><div class="machine">图</div><div class="shelf">▤</div>`;
    }
    if (scene === "roast") {
        return `<div class="bags">COFFEE</div><div class="machine"></div><div class="shelf">杯</div>`;
    }
    if (scene === "tank") {
        return `<div class="machine">◎</div><div class="machine">◎</div><div class="shelf">轮</div>`;
    }
    if (scene === "mill") {
        return `<div class="shelf">▤</div><div class="machine">轮</div><div class="bags">BEANS</div>`;
    }
    if (scene === "cafe") {
        return `<div class="shelf">杯</div><div class="machine">杯</div><div class="shelf">▦</div>`;
    }
    return `<div class="bags">COFFEE<br>BEANS</div><div class="shelf">▤</div><div class="machine">▣</div>`;
}

export function renderFactoryRoomDecor(scene: string): string {
    const shared = `<i class="decor-part decor-shelf"></i><i class="decor-part decor-board"></i><i class="decor-part decor-crates"></i>`;
    if (scene === "office") {
        return `<i class="decor-part decor-lamp"></i><i class="decor-part decor-table"></i><i class="decor-part decor-board"></i><i class="decor-part decor-window"></i><i class="decor-part decor-notes"></i><i class="decor-part decor-plant"></i>`;
    }
    if (scene === "roast") {
        return `<i class="decor-part decor-lamp"></i><i class="decor-part decor-bags">COFFEE</i><i class="decor-part decor-pipe"></i><i class="decor-part decor-gauge"></i><i class="decor-part decor-steam"></i><i class="decor-part decor-conveyor"></i><i class="decor-part decor-beans"></i>`;
    }
    if (scene === "tank") {
        return `<i class="decor-part decor-lamp"></i><i class="decor-part decor-pipe"></i><i class="decor-part decor-gauge"></i><i class="decor-part decor-steam"></i><i class="decor-part decor-crates"></i><i class="decor-part decor-conveyor"></i>`;
    }
    if (scene === "mill") {
        return `<i class="decor-part decor-lamp"></i><i class="decor-part decor-shelf"></i><i class="decor-part decor-bags">BEANS</i><i class="decor-part decor-pipe"></i><i class="decor-part decor-conveyor"></i><i class="decor-part decor-beans"></i>`;
    }
    if (scene === "cafe") {
        return `<i class="decor-part decor-lamp"></i><i class="decor-part decor-table"></i><i class="decor-part decor-window"></i><i class="decor-part decor-shelf"></i><i class="decor-part decor-clock"></i><i class="decor-part decor-plant"></i>`;
    }
    return `<i class="decor-part decor-lamp"></i><i class="decor-part decor-bags">COFFEE<br>BEANS</i>${shared}<i class="decor-part decor-beans"></i>`;
}

export function renderFactoryWallDetails(scene: string): string {
    if (scene === "storage") {
        return `<i class="jar a"></i><i class="jar b"></i><i class="paper c"></i>`;
    }
    if (scene === "office") {
        return `<i class="paper a"></i><i class="paper b"></i><i class="paper c"></i><i class="jar b"></i>`;
    }
    if (scene === "cafe") {
        return `<i class="jar a"></i><i class="paper b"></i><i class="jar b"></i>`;
    }
    return `<i class="paper a"></i><i class="jar a"></i><i class="paper c"></i><i class="jar b"></i>`;
}

export function renderFactoryWorkerCats(scene: string): string {
    if (scene === "storage") {
        return `<i class="mini-cat black a"></i><i class="mini-cat gray b"></i>`;
    }
    if (scene === "office") {
        return `<i class="mini-cat a"></i><i class="mini-cat gray b"></i>`;
    }
    if (scene === "cafe" || scene === "tank") {
        return `<i class="mini-cat a"></i><i class="mini-cat gray b"></i><i class="mini-cat black c"></i>`;
    }
    return `<i class="mini-cat a"></i><i class="mini-cat gray b"></i>`;
}

export function getFloorBonusIconClass(scene: string): string {
    if (scene === "office") return "bonus-office";
    if (scene === "roast") return "bonus-roast";
    if (scene === "tank") return "bonus-tank";
    if (scene === "mill") return "bonus-mill";
    if (scene === "storage") return "bonus-storage";
    return "bonus-cafe";
}
