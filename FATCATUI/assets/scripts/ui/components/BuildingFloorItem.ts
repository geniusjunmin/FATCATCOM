import { _decorator, Button, Component, Label, Node } from "cc";
import { EventBus } from "../../core/EventBus";
import { BuildingViewData } from "../../model/BuildingModel";
import { formatCompactNumber, formatSignedPercent } from "../Formatters";

const { ccclass, property } = _decorator;

export const BuildingFloorEvents = {
    SELECTED: "building-floor:selected",
} as const;

@ccclass("BuildingFloorItem")
export class BuildingFloorItem extends Component {
    @property(Label)
    public floorLabel: Label | null = null;

    @property(Label)
    public levelLabel: Label | null = null;

    @property(Label)
    public nameLabel: Label | null = null;

    @property(Label)
    public effectLabel: Label | null = null;

    @property(Label)
    public valueLabel: Label | null = null;

    private _data: BuildingViewData | null = null;

    protected onLoad(): void {
        const button = this.getComponent(Button);
        if (button) {
            this.node.on(Node.EventType.TOUCH_END, this.select, this);
        }
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_END, this.select, this);
    }

    public setData(data: BuildingViewData): void {
        this._data = data;
        this.setLabel(this.floorLabel, data.floor);
        this.setLabel(this.levelLabel, `Lv.${data.level}`);
        this.setLabel(this.nameLabel, data.name);
        this.setLabel(this.effectLabel, data.assignedCatCount > 0 ? `${data.assignedCatCount}只猫咪` : data.effectLabel);
        this.setLabel(
            this.valueLabel,
            data.productionPerSecond > 0 ? `${formatCompactNumber(data.productionPerSecond)}/秒` : formatSignedPercent(data.effectValue)
        );
    }

    public select(): void {
        if (!this._data) {
            return;
        }
        EventBus.emit(BuildingFloorEvents.SELECTED, this._data);
        console.info("[BuildingFloorItem] Selected", this._data.id);
    }

    private setLabel(label: Label | null, value: string): void {
        if (label) {
            label.string = value;
        }
    }
}
