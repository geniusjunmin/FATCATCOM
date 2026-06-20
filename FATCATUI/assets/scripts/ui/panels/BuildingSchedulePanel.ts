import { _decorator, Button, Color, Component, Event, Label, Node, Sprite, UITransform, Vec3 } from "cc";
import { BuildingManager } from "../../manager/BuildingManager";
import { CatManager } from "../../manager/CatManager";
import { formatCompactNumber } from "../Formatters";

const { ccclass, property } = _decorator;

@ccclass("BuildingSchedulePanel")
export class BuildingSchedulePanel extends Component {
    @property(Label)
    public titleLabel: Label | null = null;

    @property(Node)
    public contentRoot: Node | null = null;

    @property(Label)
    public statusLabel: Label | null = null;

    @property(Label)
    public pageLabel: Label | null = null;

    @property(Node)
    public prevBtn: Node | null = null;

    @property(Node)
    public nextBtn: Node | null = null;

    @property(Node)
    public closeBtn: Node | null = null;

    @property
    public pageSize = 4;

    private _buildingId: string | null = null;
    private _pageIndex = 0;

    protected onLoad(): void {
        this.closeBtn?.on(Node.EventType.TOUCH_END, this.hide, this);
        this.prevBtn?.on(Node.EventType.TOUCH_END, this.onPrevPage, this);
        this.nextBtn?.on(Node.EventType.TOUCH_END, this.onNextPage, this);
        this.node.active = false;
    }

    protected onDestroy(): void {
        this.closeBtn?.off(Node.EventType.TOUCH_END, this.hide, this);
        this.prevBtn?.off(Node.EventType.TOUCH_END, this.onPrevPage, this);
        this.nextBtn?.off(Node.EventType.TOUCH_END, this.onNextPage, this);
    }

    public show(buildingId: string): void {
        this._buildingId = buildingId;
        this._pageIndex = 0;
        this.node.active = true;
        this.refresh();
    }

    public hide(): void {
        this.node.active = false;
    }

    private refresh(): void {
        if (!this._buildingId || !this.contentRoot) {
            return;
        }

        const building = BuildingManager.getById(this._buildingId);
        this.setLabel(this.titleLabel, building ? `${building.floor} ${building.name} 排班` : "楼层排班");
        this.setLabel(
            this.statusLabel,
            building ? `岗位 ${building.assignedCatCount}/${building.scheduleCapacity}` : ""
        );
        this.contentRoot.removeAllChildren();

        const unlockedCats = CatManager.getAllConfigs().filter(config => CatManager.getCatData(config.id).isUnlocked);
        const totalPages = Math.max(1, Math.ceil(unlockedCats.length / this.pageSize));
        this._pageIndex = Math.min(this._pageIndex, totalPages - 1);
        this.setLabel(this.pageLabel, `${this._pageIndex + 1}/${totalPages}`);
        this.setPagerActive(totalPages > 1);

        const start = this._pageIndex * this.pageSize;
        const pageCats = unlockedCats.slice(start, start + this.pageSize);
        for (let index = 0; index < pageCats.length; index++) {
            this.createCatRow(pageCats[index].id, pageCats[index].name, index);
        }

        if (unlockedCats.length === 0) {
            this.createText(this.contentRoot, "Empty", "暂无已解锁猫咪", 0, 0, 560, 56, 28, new Color(122, 86, 58, 255));
        }
    }

    private createCatRow(catId: string, catName: string, index: number): void {
        if (!this.contentRoot || !this._buildingId) {
            return;
        }

        const row = new Node(`CatRow_${catId}`);
        row.setParent(this.contentRoot);
        row.layer = this.contentRoot.layer;
        row.setPosition(new Vec3(0, 140 - index * 92, 0));
        this.setSize(row, 620, 78);
        row.addComponent(Sprite).color = new Color(255, 250, 238, 255);

        const assignedBuildingId = CatManager.getAssignedBuildingId(catId);
        const isAssignedHere = assignedBuildingId === this._buildingId;
        const production = CatManager.getCatProduction(catId);
        const assignedBuilding = assignedBuildingId ? BuildingManager.getById(assignedBuildingId) : null;
        const currentBuilding = BuildingManager.getById(this._buildingId);
        const isFull = !!currentBuilding && currentBuilding.assignedCatCount >= currentBuilding.scheduleCapacity;
        const canAssign = !isAssignedHere && !isFull;
        const locationText = assignedBuilding ? `${assignedBuilding.floor} ${assignedBuilding.name}` : "未排班";

        this.createText(row, "Name", catName, -230, 16, 160, 34, 26, new Color(76, 48, 34, 255));
        this.createText(row, "Stats", `${formatCompactNumber(production)}/秒`, -230, -18, 160, 28, 20, new Color(128, 88, 54, 255));
        this.createText(row, "Location", isAssignedHere ? "当前楼层" : locationText, 20, 0, 260, 44, 22, new Color(106, 76, 52, 255));

        const button = new Node("AssignButton");
        button.setParent(row);
        button.layer = row.layer;
        button.setPosition(new Vec3(isAssignedHere ? 185 : 230, 0, 0));
        this.setSize(button, isAssignedHere ? 108 : 130, 52);
        button.addComponent(Sprite).color = canAssign ? new Color(99, 174, 122, 255) : new Color(190, 190, 178, 255);
        const buttonComp = button.addComponent(Button);
        buttonComp.interactable = canAssign;
        this.createText(button, "Label", this.getAssignButtonText(isAssignedHere, isFull), 0, 0, isAssignedHere ? 88 : 110, 42, 22, new Color(255, 255, 255, 255));

        button.on(Node.EventType.TOUCH_END, () => {
            if (!this._buildingId || !canAssign) {
                return;
            }
            if (CatManager.assignCatToBuilding(catId, this._buildingId)) {
                this.node.dispatchEvent(new Event("schedule-updated", true));
                this.refresh();
            }
        });

        if (isAssignedHere) {
            const unassignButton = new Node("UnassignButton");
            unassignButton.setParent(row);
            unassignButton.layer = row.layer;
            unassignButton.setPosition(new Vec3(290, 0, 0));
            this.setSize(unassignButton, 84, 52);
            unassignButton.addComponent(Sprite).color = new Color(194, 107, 82, 255);
            unassignButton.addComponent(Button);
            this.createText(unassignButton, "Label", "撤下", 0, 0, 72, 42, 20, new Color(255, 255, 255, 255));
            unassignButton.on(Node.EventType.TOUCH_END, () => {
                if (CatManager.unassignCat(catId)) {
                    this.node.dispatchEvent(new Event("schedule-updated", true));
                    this.refresh();
                }
            });
        }
    }

    private getAssignButtonText(isAssignedHere: boolean, isFull: boolean): string {
        if (isAssignedHere) {
            return "已派驻";
        }
        if (isFull) {
            return "已满";
        }
        return "派驻";
    }

    private onPrevPage(): void {
        if (this._pageIndex <= 0) {
            return;
        }
        this._pageIndex -= 1;
        this.refresh();
    }

    private onNextPage(): void {
        const unlockedCount = CatManager.getAllConfigs().filter(config => CatManager.getCatData(config.id).isUnlocked).length;
        const totalPages = Math.max(1, Math.ceil(unlockedCount / this.pageSize));
        if (this._pageIndex >= totalPages - 1) {
            return;
        }
        this._pageIndex += 1;
        this.refresh();
    }

    private setPagerActive(active: boolean): void {
        if (this.prevBtn) {
            this.prevBtn.active = active;
        }
        if (this.nextBtn) {
            this.nextBtn.active = active;
        }
        if (this.pageLabel) {
            this.pageLabel.node.active = active;
        }
    }

    private createText(
        parent: Node,
        name: string,
        text: string,
        x: number,
        y: number,
        width: number,
        height: number,
        fontSize: number,
        color: Color
    ): Label {
        const node = new Node(name);
        node.setParent(parent);
        node.layer = parent.layer;
        node.setPosition(new Vec3(x, y, 0));
        this.setSize(node, width, height);
        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = Math.round(fontSize * 1.2);
        label.color = color;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        return label;
    }

    private setSize(node: Node, width: number, height: number): void {
        const transform = node.getComponent(UITransform) ?? node.addComponent(UITransform);
        transform.setContentSize(width, height);
    }

    private setLabel(label: Label | null, value: string): void {
        if (label) {
            label.string = value;
        }
    }
}
