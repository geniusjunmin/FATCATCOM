import { _decorator, Component, Label, UIOpacity } from "cc";
import { EventBus, GameEvents } from "../core/EventBus";
import { ResourceNotEnoughPayload } from "../manager/ResourceManager";
import { ProductionTickPayload } from "../manager/ProductionManager";

const { ccclass, property } = _decorator;

@ccclass("RewardToast")
export class RewardToast extends Component {
    @property(Label)
    public messageLabel: Label | null = null;

    @property
    public visibleSeconds = 2;

    private _opacity: UIOpacity | null = null;

    protected onLoad(): void {
        this._opacity = this.getComponent(UIOpacity) ?? this.addComponent(UIOpacity);
        this.hide();
    }

    protected onEnable(): void {
        EventBus.on<ResourceNotEnoughPayload>(GameEvents.RESOURCE_NOT_ENOUGH, this.onResourceNotEnough);
        EventBus.on<ProductionTickPayload>(GameEvents.PRODUCTION_PAUSED, this.onProductionPaused);
    }

    protected onDisable(): void {
        EventBus.off<ResourceNotEnoughPayload>(GameEvents.RESOURCE_NOT_ENOUGH, this.onResourceNotEnough);
        EventBus.off<ProductionTickPayload>(GameEvents.PRODUCTION_PAUSED, this.onProductionPaused);
    }

    public show(message: string): void {
        if (this.messageLabel) {
            this.messageLabel.string = message;
        }
        this.node.active = true;
        if (!this._opacity) {
            this._opacity = this.getComponent(UIOpacity) ?? this.addComponent(UIOpacity);
        }
        this._opacity.opacity = 255;
        this.unschedule(this.hide);
        this.scheduleOnce(this.hide, this.visibleSeconds);
    }

    private onResourceNotEnough = (payload: ResourceNotEnoughPayload): void => {
        this.show(`${this.getResourceName(payload.key)}不足`);
    };

    private onProductionPaused = (): void => {
        this.show("咖啡豆不足，生产暂停");
    };

    private hide = (): void => {
        if (!this._opacity) {
            this._opacity = this.getComponent(UIOpacity) ?? this.addComponent(UIOpacity);
        }
        this._opacity.opacity = 0;
    };

    private getResourceName(key: string): string {
        if (key === "coin") return "金币";
        if (key === "bean") return "咖啡豆";
        if (key === "catFood") return "猫粮";
        if (key === "diamond") return "钻石";
        if (key === "researchPoint") return "研究点";
        return "资源";
    }
}
