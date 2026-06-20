import { _decorator, Component, UITransform, view, ResolutionPolicy } from "cc";
import { EventBus, GameEvents } from "./EventBus";
import { ConfigManager } from "../manager/ConfigManager";
import { ProductionManager } from "../manager/ProductionManager";
import { ResourceManager } from "../manager/ResourceManager";
import { SaveManager } from "../manager/SaveManager";
import { NetworkManager } from "../manager/NetworkManager";
import { SyncManager } from "../manager/SyncManager";
import { TaskManager } from "../manager/TaskManager";
import { OfflineRewardPanel } from "../ui/panels/OfflineRewardPanel";

const { ccclass, property } = _decorator;

@ccclass("GameApp")
export class GameApp extends Component {
    @property
    public resetSaveOnStart = false;

    @property(OfflineRewardPanel)
    public offlineRewardPanel: OfflineRewardPanel | null = null;

    private _ready = false;

    public get ready(): boolean {
        return this._ready;
    }

    protected async onLoad(): Promise<void> {
        view.setDesignResolutionSize(1080, 1920, ResolutionPolicy.SHOW_ALL);
        this.syncCanvasRoot();
        await this.bootstrap();
    }

    protected onDestroy(): void {
        this.unschedule(this.onProductionTick);
        SyncManager.destroy();
    }

    public async bootstrap(): Promise<void> {
        if (this._ready) {
            return;
        }

        await ConfigManager.loadAll();
        const save = this.resetSaveOnStart
            ? SaveManager.reset(ConfigManager.initialSave)
            : SaveManager.initialize(ConfigManager.initialSave);

        TaskManager.init();
        NetworkManager.initialize();
        SyncManager.initialize();

        this._ready = true;
        const offlineSeconds = SaveManager.consumeOfflineSeconds();
        const offlineReward = offlineSeconds > 0 ? ProductionManager.settleOffline(offlineSeconds) : null;
        if (offlineSeconds > 0) {
            this.scheduleOnce(() => {
                this.offlineRewardPanel?.show(offlineSeconds, offlineReward!);
            }, 0);
        }
        this.schedule(this.onProductionTick, 1);
        console.info("[GameApp] Ready", {
            player: save.player,
            resources: ResourceManager.getAll(),
        });
        EventBus.emit(GameEvents.APP_READY, save);
    }

    private syncCanvasRoot(): void {
        const transform = this.node.getComponent(UITransform);
        if (transform) {
            transform.setContentSize(1080, 1920);
        }
        this.node.setPosition(540, 960);
    }

    private onProductionTick = (): void => {
        if (this._ready) {
            ProductionManager.settle(1);
        }
    };

}
