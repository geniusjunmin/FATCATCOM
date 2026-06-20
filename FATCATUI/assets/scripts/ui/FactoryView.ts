import { _decorator, Color, Component, instantiate, Label, Node, Prefab, resources, Sprite, SpriteFrame, UITransform } from "cc";
import { EventBus, GameEvents } from "../core/EventBus";
import { BuildingManager } from "../manager/BuildingManager";
import { ProductionManager, ProductionTickPayload } from "../manager/ProductionManager";
import { BuildingViewData } from "../model/BuildingModel";
import { GameSaveData } from "../model/SaveData";
import { BuildingFloorEvents, BuildingFloorItem } from "./components/BuildingFloorItem";
import { BuildingDetailPanel } from "./panels/BuildingDetailPanel";

const { ccclass, property } = _decorator;

@ccclass("FactoryView")
export class FactoryView extends Component {
    @property(Node)
    public contentRoot: Node | null = null;

    @property(Prefab)
    public floorPrefab: Prefab | null = null;

    @property([BuildingFloorItem])
    public staticFloorItems: BuildingFloorItem[] = [];

    @property(BuildingDetailPanel)
    public buildingDetailPanel: BuildingDetailPanel | null = null;

    protected onEnable(): void {
        this.applyHomeLayout();
        EventBus.on<GameSaveData>(GameEvents.APP_READY, this.onAppReady);
        EventBus.on<GameSaveData>(GameEvents.SAVE_UPDATED, this.onSaveUpdated);
        EventBus.on<ProductionTickPayload>(GameEvents.PRODUCTION_TICK, this.onProductionTick);
        EventBus.on<ProductionTickPayload>(GameEvents.PRODUCTION_PAUSED, this.onProductionTick);
        EventBus.on<BuildingViewData>(BuildingFloorEvents.SELECTED, this.onBuildingSelected);
        this.tryRefresh();
    }

    protected onDisable(): void {
        EventBus.off<GameSaveData>(GameEvents.APP_READY, this.onAppReady);
        EventBus.off<GameSaveData>(GameEvents.SAVE_UPDATED, this.onSaveUpdated);
        EventBus.off<ProductionTickPayload>(GameEvents.PRODUCTION_TICK, this.onProductionTick);
        EventBus.off<ProductionTickPayload>(GameEvents.PRODUCTION_PAUSED, this.onProductionTick);
        EventBus.off<BuildingViewData>(BuildingFloorEvents.SELECTED, this.onBuildingSelected);
    }

    public refresh(): void {
        this.applyHomeLayout();
        const buildings = BuildingManager.getAll();
        const snapshot = ProductionManager.calculateSnapshot();
        for (const building of buildings) {
            building.productionPerSecond = snapshot.buildingCoinPerSecond[building.id] ?? 0;
        }
        if (this.floorPrefab && this.contentRoot) {
            this.contentRoot.removeAllChildren();
            for (const building of buildings) {
                const node = instantiate(this.floorPrefab);
                node.setParent(this.contentRoot);
                const item = node.getComponent(BuildingFloorItem);
                if (item) {
                    item.setData(building);
                }
            }
            return;
        }

        for (let index = 0; index < this.staticFloorItems.length; index++) {
            const item = this.staticFloorItems[index];
            const building = buildings[buildings.length - 1 - index];
            if (item && building) {
                item.setData(building);
                item.node.active = true;
            } else if (item) {
                item.node.active = false;
            }
        }
        this.applyHomeLayout();
    }

    private applyHomeLayout(): void {
        const tower = this.node.getChildByName("FactoryTower");
        if (!tower) return;

        this.place(tower, 0, 70);
        this.size(tower, 920, 1320);
        this.size(tower.getChildByName("FactoryTower_Background"), 920, 1320, new Color(96, 76, 62, 255));

        const title = tower.getChildByName("FactoryTower_Label")?.getComponent(Label);
        if (title) {
            title.node.setPosition(0, 565);
            title.fontSize = 52;
            title.lineHeight = 60;
            title.color = new Color(255, 229, 175);
        }

        const floorNames = ["Floor_roof", "Floor_office", "Floor_roast", "Floor_ferment", "Floor_cafe", "Floor_storage"];
        const floorY = [430, 230, 30, -170, -370, -570];
        floorNames.forEach((name, index) => {
            const floor = tower.getChildByName(name);
            if (!floor) return;
            this.place(floor, 0, floorY[index]);
            this.size(floor, 860, 168);
            this.size(floor.getChildByName(`${name}_Background`), 860, 168, new Color(205, 178, 134, 255));

            const badge = floor.getChildByName("FloorBadge");
            this.place(badge, -355, 0);
            this.size(badge, 96, 112, new Color(116, 88, 56, 255));
            const badgeLabels = badge?.getComponentsInChildren(Label) ?? [];
            if (badgeLabels[0]) {
                badgeLabels[0].fontSize = 42;
                badgeLabels[0].lineHeight = 48;
                badgeLabels[0].color = Color.WHITE;
            }
            if (badgeLabels[1]) {
                badgeLabels[1].fontSize = 22;
                badgeLabels[1].lineHeight = 28;
                badgeLabels[1].color = Color.WHITE;
            }

            const labels = floor.children.filter(child => child.getComponent(Label));
            const nameLabel = labels[0]?.getComponent(Label);
            const descLabel = labels[1]?.getComponent(Label);
            if (nameLabel) {
                nameLabel.node.setPosition(-205, 32);
                nameLabel.fontSize = 32;
                nameLabel.lineHeight = 38;
                nameLabel.color = new Color(60, 42, 32);
            }
            if (descLabel) {
                descLabel.node.setPosition(-40, -28);
                descLabel.fontSize = 22;
                descLabel.lineHeight = 28;
                descLabel.color = new Color(100, 76, 56);
            }

            const effect = floor.getChildByName("Effect");
            this.place(effect, 310, 0);
            this.size(effect, 210, 118, new Color(74, 60, 45, 255));
            for (const label of effect?.getComponentsInChildren(Label) ?? []) {
                label.fontSize = 30;
                label.lineHeight = 36;
                label.color = Color.WHITE;
            }
        });

        const root = this.node.parent;
        const bottomArea = root?.getChildByName("BottomArea");
        this.layoutBottomArea(bottomArea);
        this.ensureSideActions(root);
        this.layoutBackground(root);
    }

    private layoutBottomArea(bottomArea: Node | null | undefined): void {
        if (!bottomArea) return;

        const launch = bottomArea.getChildByName("LaunchButton");
        this.place(launch, 0, -720);
        this.size(launch, 430, 138, new Color(226, 110, 30, 255));
        this.size(launch?.getChildByName("LaunchButton_Background"), 430, 138, new Color(226, 110, 30, 255));
        const launchLabel = launch?.getComponentInChildren(Label);
        if (launchLabel) {
            launchLabel.string = "发射猫咪";
            launchLabel.fontSize = 46;
            launchLabel.lineHeight = 56;
        }

        const order = bottomArea.getChildByName("DebugAddCoin");
        this.place(order, -410, -720);
        this.size(order, 180, 116, new Color(230, 210, 170, 255));
        this.size(order?.getChildByName("DebugAddCoin_Background"), 180, 116, new Color(230, 210, 170, 255));
        const orderLabel = order?.getComponentInChildren(Label);
        if (orderLabel) {
            orderLabel.string = "今日订单\n56/60";
            orderLabel.fontSize = 28;
            orderLabel.lineHeight = 34;
            orderLabel.color = new Color(76, 44, 28);
        }

        const gift = bottomArea.getChildByName("DebugSpendCoin");
        this.place(gift, 365, -720);
        this.size(gift, 270, 116, new Color(210, 178, 112, 255));
        this.size(gift?.getChildByName("DebugSpendCoin_Background"), 270, 116, new Color(210, 178, 112, 255));
        const giftLabel = gift?.getComponentInChildren(Label);
        if (giftLabel) {
            giftLabel.string = "超级猫粮礼包\n03:25:15";
            giftLabel.fontSize = 26;
            giftLabel.lineHeight = 32;
            giftLabel.color = new Color(70, 42, 28);
        }

        const nav = bottomArea.getChildByName("BottomNav");
        this.place(nav, 0, -900);
        this.size(nav, 1000, 140, new Color(68, 54, 50, 255));
        this.size(nav?.getChildByName("BottomNav_Background"), 1000, 140, new Color(68, 54, 50, 255));
        nav?.setSiblingIndex(999);
        const navButtons = nav?.children.filter(child => child.name.startsWith("Nav_")) ?? [];
        const xs = [-420, -252, -84, 84, 252, 420];
        navButtons.forEach((button, index) => {
            this.place(button, xs[index] ?? 0, 0);
            this.size(button, 142, 108);
            this.size(button.children[0], 142, 108);
            const label = button.getComponentInChildren(Label);
            if (label) {
                label.fontSize = 32;
                label.lineHeight = 38;
            }
        });
    }

    private ensureSideActions(root: Node | null | undefined): void {
        if (!root) return;
        const specs = [
            { name: "SideTask", text: "任务", x: -500, y: 560 },
            { name: "SideAchieve", text: "成就", x: 500, y: 420 },
            { name: "SideMail", text: "邮件", x: 500, y: 220 },
            { name: "SideFriend", text: "好友", x: 500, y: 20 },
            { name: "SideSetting", text: "设置", x: 500, y: -180 },
        ];

        for (const spec of specs) {
            let node = root.getChildByName(spec.name);
            if (!node) {
                node = new Node(spec.name);
                node.setParent(root);
                node.addComponent(UITransform);
                node.addComponent(Sprite);
                const labelNode = new Node("Label");
                labelNode.setParent(node);
                labelNode.addComponent(UITransform);
                labelNode.addComponent(Label);
            }
            this.place(node, spec.x, spec.y);
            this.size(node, 92, 116, new Color(118, 92, 62, 255));
            const label = node.getComponentInChildren(Label);
            if (label) {
                label.string = spec.text;
                label.fontSize = 28;
                label.lineHeight = 34;
                label.color = Color.WHITE;
            }
        }
    }

    private layoutBackground(root: Node | null | undefined): void {
        const background = root?.getChildByName("SkyCoffeeBackground")?.getChildByName("SkyCoffeeBackground_Background");
        this.size(background, 1080, 1920, new Color(177, 220, 245, 255));
    }

    private place(node: Node | null | undefined, x: number, y: number): void {
        if (node) node.setPosition(x, y);
    }

    private size(node: Node | null | undefined, width: number, height: number, color?: Color): void {
        if (!node) return;
        const transform = node.getComponent(UITransform);
        if (transform) transform.setContentSize(width, height);
        const sprite = node.getComponent(Sprite);
        if (sprite && color) {
            sprite.color = color;
            if (!sprite.spriteFrame) {
                resources.load("textures/white_bg/spriteFrame", SpriteFrame, (error, frame) => {
                    if (!error && sprite && sprite.isValid) {
                        sprite.spriteFrame = frame;
                    }
                });
            }
        }
    }

    private onAppReady = (): void => {
        this.tryRefresh();
    };

    private onSaveUpdated = (): void => {
        this.tryRefresh();
    };

    private onProductionTick = (): void => {
        this.tryRefresh();
    };

    private onBuildingSelected = (data: BuildingViewData): void => {
        if (this.buildingDetailPanel) {
            this.buildingDetailPanel.show(data);
        }
    };

    private tryRefresh(): void {
        try {
            this.refresh();
        } catch (error) {
            console.info("[FactoryView] Waiting for GameApp initialization.");
        }
    }
}
