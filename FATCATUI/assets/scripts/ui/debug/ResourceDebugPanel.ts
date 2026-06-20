import { _decorator, Component, Label } from "cc";
import { EventBus, GameEvents } from "../../core/EventBus";
import { GameSaveData } from "../../model/SaveData";
import { ResourceChangedPayload, ResourceManager, ResourceNotEnoughPayload } from "../../manager/ResourceManager";
import { ResourceMap } from "../../model/ResourceModel";

const { ccclass, property } = _decorator;

@ccclass("ResourceDebugPanel")
export class ResourceDebugPanel extends Component {
    @property(Label)
    public coinLabel: Label | null = null;

    @property(Label)
    public beanLabel: Label | null = null;

    @property(Label)
    public catFoodLabel: Label | null = null;

    @property(Label)
    public diamondLabel: Label | null = null;

    @property(Label)
    public researchPointLabel: Label | null = null;

    protected onEnable(): void {
        EventBus.on<GameSaveData>(GameEvents.APP_READY, this.onAppReady);
        EventBus.on<ResourceChangedPayload>(GameEvents.RESOURCES_CHANGED, this.onResourcesChanged);
        EventBus.on<ResourceNotEnoughPayload>(GameEvents.RESOURCE_NOT_ENOUGH, this.onResourceNotEnough);
        this.tryRefresh();
    }

    protected onDisable(): void {
        EventBus.off<GameSaveData>(GameEvents.APP_READY, this.onAppReady);
        EventBus.off<ResourceChangedPayload>(GameEvents.RESOURCES_CHANGED, this.onResourcesChanged);
        EventBus.off<ResourceNotEnoughPayload>(GameEvents.RESOURCE_NOT_ENOUGH, this.onResourceNotEnough);
    }

    public addTestCoins(): void {
        ResourceManager.add({ coin: 1000 }, "debug:add-coin");
    }

    public addTestBeans(): void {
        ResourceManager.add({ bean: 100 }, "debug:add-bean");
    }

    public spendTestCoins(): void {
        ResourceManager.spend({ coin: 500 }, "debug:spend-coin");
    }

    public resetDebugResources(): void {
        ResourceManager.add({
            coin: -ResourceManager.get("coin") + 12450000,
            bean: -ResourceManager.get("bean") + 8240,
            catFood: -ResourceManager.get("catFood") + 3510,
            diamond: -ResourceManager.get("diamond") + 2580,
            researchPoint: -ResourceManager.get("researchPoint") + 200,
        }, "debug:reset-resources");
    }

    private onResourcesChanged = (payload: ResourceChangedPayload): void => {
        this.refresh(payload.resources);
        console.info("[ResourceDebugPanel] Resources changed", payload);
    };

    private onAppReady = (): void => {
        this.tryRefresh();
    };

    private onResourceNotEnough = (payload: ResourceNotEnoughPayload): void => {
        console.warn("[ResourceDebugPanel] Resource not enough", payload);
    };

    private tryRefresh(): void {
        try {
            this.refresh(ResourceManager.getAll());
        } catch (error) {
            console.info("[ResourceDebugPanel] Waiting for GameApp initialization.");
        }
    }

    private refresh(resources: ResourceMap): void {
        this.setLabel(this.coinLabel, resources.coin);
        this.setLabel(this.beanLabel, resources.bean);
        this.setLabel(this.catFoodLabel, resources.catFood);
        this.setLabel(this.diamondLabel, resources.diamond);
        this.setLabel(this.researchPointLabel, resources.researchPoint);
    }

    private setLabel(label: Label | null, value: number): void {
        if (label) {
            label.string = Math.floor(value).toString();
        }
    }
}
