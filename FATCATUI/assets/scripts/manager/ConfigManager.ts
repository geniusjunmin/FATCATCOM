import { JsonAsset, resources } from "cc";
import { BuildingConfig } from "../model/BuildingModel";
import { InitialSaveConfig } from "../model/SaveData";
import { CatConfig } from "../model/CatModel";
import { EquipmentConfig, ItemConfig, ShopItemConfig } from "../model/ItemModel";
import { ResearchConfig } from "../model/ResearchModel";
import { TaskConfig } from "../model/TaskModel";
import { SkillConfig } from "../model/SkillModel";

export class ConfigManager {
    private static _initialSave: InitialSaveConfig | null = null;
    private static _buildings: BuildingConfig[] = [];
    private static _cats: CatConfig[] = [];
    private static _items: ItemConfig[] = [];
    private static _equipment: EquipmentConfig[] = [];
    private static _shops: ShopItemConfig[] = [];
    private static _research: ResearchConfig[] = [];
    private static _tasks: TaskConfig[] = [];
    private static _skills: SkillConfig[] = [];

    public static async loadAll(): Promise<void> {
        const [initialSave, buildings, cats, items, equipment, shops, research, tasks, skills] = await Promise.all([
            this.loadJson<InitialSaveConfig>("configs/initialSave"),
            this.loadJson<BuildingConfig[]>("configs/buildings"),
            this.loadJson<CatConfig[]>("configs/cats"),
            this.loadJson<ItemConfig[]>("configs/items"),
            this.loadJson<EquipmentConfig[]>("configs/equipment"),
            this.loadJson<ShopItemConfig[]>("configs/shops"),
            this.loadJson<ResearchConfig[]>("configs/research"),
            this.loadJson<TaskConfig[]>("configs/tasks"),
            this.loadJson<SkillConfig[]>("configs/skills"),
        ]);
        this._initialSave = initialSave;
        this._buildings = buildings;
        this._cats = cats;
        this._items = items;
        this._equipment = equipment;
        this._shops = shops;
        this._research = research;
        this._tasks = tasks;
        this._skills = skills;
    }

    public static get initialSave(): InitialSaveConfig {
        if (!this._initialSave) {
            throw new Error("ConfigManager is not ready. Call loadAll() first.");
        }
        return this._initialSave;
    }

    public static get buildings(): BuildingConfig[] {
        return this._buildings;
    }

    public static get cats(): CatConfig[] {
        return this._cats;
    }

    public static get items(): ItemConfig[] {
        return this._items;
    }

    public static get equipment(): EquipmentConfig[] {
        return this._equipment;
    }

    public static get shops(): ShopItemConfig[] {
        return this._shops;
    }

    public static get research(): ResearchConfig[] {
        return this._research;
    }

    public static get tasks(): TaskConfig[] {
        return this._tasks;
    }

    public static get skills(): SkillConfig[] {
        return this._skills;
    }

    private static loadJson<T>(path: string): Promise<T> {
        return new Promise((resolve, reject) => {
            resources.load(path, JsonAsset, (error, asset) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(asset.json as T);
            });
        });
    }
}
