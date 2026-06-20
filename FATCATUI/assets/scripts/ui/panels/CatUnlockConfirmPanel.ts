import { _decorator, Component, Event, Label, Node } from "cc";
import { CatManager } from "../../manager/CatManager";
import { CatConfig, CatModel } from "../../model/CatModel";
import { formatCompactNumber } from "../Formatters";

const { ccclass, property } = _decorator;

@ccclass("CatUnlockConfirmPanel")
export class CatUnlockConfirmPanel extends Component {
    @property(Label)
    public titleLabel: Label | null = null;

    @property(Label)
    public descriptionLabel: Label | null = null;

    @property(Label)
    public costLabel: Label | null = null;

    @property(Node)
    public confirmBtn: Node | null = null;

    @property(Node)
    public cancelBtn: Node | null = null;

    private _catId: string | null = null;

    protected onLoad(): void {
        this.confirmBtn?.on(Node.EventType.TOUCH_END, this.onConfirm, this);
        this.cancelBtn?.on(Node.EventType.TOUCH_END, this.hide, this);
        this.node.active = false;
    }

    protected onDestroy(): void {
        this.confirmBtn?.off(Node.EventType.TOUCH_END, this.onConfirm, this);
        this.cancelBtn?.off(Node.EventType.TOUCH_END, this.hide, this);
    }

    public show(config: CatConfig): void {
        this._catId = config.id;
        this.node.active = true;
        this.setLabel(this.titleLabel, `解锁 ${config.name}`);
        this.setLabel(this.descriptionLabel, `${config.rarity}级 ${config.breed}\n${config.personality}，基础产量 ${config.baseProduction}/秒`);
        this.setLabel(this.costLabel, `${formatCompactNumber(CatModel.calculateUnlockCost(config.rarity))} 金币`);
    }

    public hide(): void {
        this.node.active = false;
    }

    private onConfirm(): void {
        if (!this._catId) {
            return;
        }
        if (CatManager.unlockCat(this._catId)) {
            this.node.dispatchEvent(new Event("cat-updated", true));
            this.hide();
        }
    }

    private setLabel(label: Label | null, value: string): void {
        if (label) {
            label.string = value;
        }
    }
}
