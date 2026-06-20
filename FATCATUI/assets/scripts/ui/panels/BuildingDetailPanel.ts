import { _decorator, Button, Component, Event, Label, Node } from "cc";
import { EventBus, GameEvents } from "../../core/EventBus";
import { BuildingManager } from "../../manager/BuildingManager";
import { BuildingViewData } from "../../model/BuildingModel";
import { formatCompactNumber, formatSignedPercent } from "../Formatters";
import { BuildingSchedulePanel } from "./BuildingSchedulePanel";

const { ccclass, property } = _decorator;

@ccclass("BuildingDetailPanel")
export class BuildingDetailPanel extends Component {
    @property(Label)
    public titleLabel: Label | null = null;

    @property(Label)
    public levelLabel: Label | null = null;

    @property(Label)
    public effectLabel: Label | null = null;

    @property(Label)
    public nextEffectLabel: Label | null = null;

    @property(Label)
    public costLabel: Label | null = null;

    @property(Label)
    public descriptionLabel: Label | null = null;

    @property(Button)
    public upgradeBtn: Button | null = null;

    @property(Button)
    public scheduleBtn: Button | null = null;

    @property(BuildingSchedulePanel)
    public schedulePanel: BuildingSchedulePanel | null = null;

    @property(Node)
    public closeBtn: Node | null = null;

    private _buildingId: string | null = null;

    protected onLoad(): void {
        this.upgradeBtn?.node.on(Node.EventType.TOUCH_END, this.onUpgradeClick, this);
        this.scheduleBtn?.node.on(Node.EventType.TOUCH_END, this.onScheduleClick, this);
        this.closeBtn?.on(Node.EventType.TOUCH_END, this.onCloseClick, this);
    }

    protected onEnable(): void {
        EventBus.on(GameEvents.SAVE_UPDATED, this.onSaveUpdated);
    }

    protected onDisable(): void {
        EventBus.off(GameEvents.SAVE_UPDATED, this.onSaveUpdated);
    }

    protected onDestroy(): void {
        this.upgradeBtn?.node.off(Node.EventType.TOUCH_END, this.onUpgradeClick, this);
        this.scheduleBtn?.node.off(Node.EventType.TOUCH_END, this.onScheduleClick, this);
        this.closeBtn?.off(Node.EventType.TOUCH_END, this.onCloseClick, this);
    }

    public show(data: BuildingViewData): void {
        this.node.active = true;
        this.refresh(data);
    }

    public refresh(data: BuildingViewData): void {
        this._buildingId = data.id;
        this.setLabel(this.titleLabel, `${data.floor} ${data.name}`);
        this.setLabel(this.levelLabel, `Lv.${data.level}/${data.maxLevel}`);
        this.setLabel(this.effectLabel, `${data.effectLabel}: ${formatSignedPercent(data.effectValue)}`);
        this.setLabel(this.nextEffectLabel, this.getNextEffectText(data));
        this.setLabel(this.costLabel, data.level >= data.maxLevel ? "已满级" : `${formatCompactNumber(data.upgradeCost)} 金币`);
        this.setLabel(this.descriptionLabel, `${data.description}\n排班猫咪(${data.assignedCatCount}/${data.scheduleCapacity}): ${this.getAssignedCatText(data)}`);
        if (this.upgradeBtn) {
            this.upgradeBtn.interactable = data.level < data.maxLevel;
        }
    }

    private onUpgradeClick(): void {
        if (!this._buildingId) {
            return;
        }
        if (BuildingManager.upgrade(this._buildingId)) {
            const data = BuildingManager.getById(this._buildingId);
            if (data) {
                this.refresh(data);
            }
            this.node.dispatchEvent(new Event("building-updated", true));
        }
    }

    private onScheduleClick(): void {
        if (this._buildingId) {
            this.schedulePanel?.show(this._buildingId);
        }
    }

    private onCloseClick(): void {
        this.node.active = false;
    }

    private onSaveUpdated = (): void => {
        if (!this._buildingId) {
            return;
        }
        const data = BuildingManager.getById(this._buildingId);
        if (data) {
            this.refresh(data);
        }
    };

    private getNextEffectText(data: BuildingViewData): string {
        if (data.level >= data.maxLevel) {
            return "下级效果: 已满级";
        }
        const next = BuildingManager.getNextEffectValue(data.id);
        return `下级效果: ${formatSignedPercent(next)}`;
    }

    private getAssignedCatText(data: BuildingViewData): string {
        if (data.assignedCatNames.length === 0) {
            return "暂无";
        }
        return data.assignedCatNames.join("、");
    }

    private setLabel(label: Label | null, value: string): void {
        if (label) {
            label.string = value;
        }
    }
}
