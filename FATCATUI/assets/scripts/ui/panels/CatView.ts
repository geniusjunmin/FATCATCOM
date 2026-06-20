import { _decorator, Color, Component, Graphics, instantiate, Label, Layout, Node, resources, Sprite, SpriteFrame, UITransform } from 'cc';
import { CatManager } from "../../manager/CatManager";
import { CatCardItem } from "../components/CatCardItem";
import { CatDetailPanel } from "./CatDetailPanel";
import { EventBus, GameEvents } from "../../core/EventBus";

const { ccclass, property } = _decorator;

@ccclass('CatView')
export class CatView extends Component {
    @property(Node)
    public listContent: Node | null = null;

    @property(Node)
    public cardTemplate: Node | null = null;

    @property(CatDetailPanel)
    public detailPanel: CatDetailPanel | null = null;

    @property(Node)
    public closeBtn: Node | null = null;

    private _selectedCatId: string | null = null;
    private _cardItems: Map<string, CatCardItem> = new Map();
    private _refreshViewBound = this.refreshView.bind(this);
    private _bottomArea: Node | null = null;

    protected onLoad() {
        if (this.cardTemplate) {
            this.cardTemplate.active = false;
        }
        if (this.closeBtn) {
            this.closeBtn.on(Node.EventType.TOUCH_END, this.onClose, this);
        }

        this.node.on('cat-updated', this.onCatUpdated, this);
        EventBus.on(GameEvents.SAVE_UPDATED, this._refreshViewBound);
    }

    protected onDestroy() {
        EventBus.off(GameEvents.SAVE_UPDATED, this._refreshViewBound);
        this.node.off('cat-updated', this.onCatUpdated, this);
    }

    protected onEnable() {
        this.showView();
    }

    public showView(): void {
        this.syncLayers(this.node, this.node.parent?.layer ?? this.node.layer);
        this.syncSceneLayer();
        this.buildList();

        if (!this._selectedCatId) {
            const configs = CatManager.getAllConfigs();
            if (configs.length > 0) {
                this._selectedCatId = configs[0].id;
            }
        }
        this.refreshView();
    }

    private syncLayers(node: Node, layer: number): void {
        node.layer = layer;
        for (const child of node.children) {
            this.syncLayers(child, layer);
        }
    }

    protected onDisable() {
        if (this._bottomArea) {
            this._bottomArea.active = true;
        }
    }

    private syncSceneLayer() {
        const root = this.node.parent;
        if (!root) return;

        const topBar = root.getChildByName("TopBar");
        const bottomArea = root.getChildByName("BottomArea");
        if (topBar) topBar.active = true;
        this._bottomArea = bottomArea || null;
        if (bottomArea) bottomArea.active = false;

        this.node.setSiblingIndex(root.children.length - 1);
        this.applyLayout();
    }

    private applyLayout(): void {
        this.sizeNode(this.node.getChildByName("Background"), 1080, 1700, new Color(58, 40, 28, 245));
        this.placeNode(this.node.getChildByName("Background"), 0, -40);

        const sidebar = this.node.getChildByName("Sidebar");
        this.sizeNode(sidebar, 108, 780, new Color(72, 55, 39, 255));
        this.placeNode(sidebar, -470, 200);
        const tabY = [310, 130, -50, -230, -410];
        const tabLabels = ["信息", "升级", "技能", "装备", "皮肤"];
        sidebar?.children.forEach((tab, index) => {
            this.placeNode(tab, 0, tabY[index] ?? 0);
            this.sizeNode(tab, 96, 126, index === 0 ? new Color(235, 165, 48) : new Color(95, 72, 48));
            const label = tab.getComponentInChildren(Label);
            if (label) {
                label.string = tabLabels[index] || label.string;
                label.fontSize = 30;
                label.lineHeight = 36;
                label.color = Color.WHITE;
            }
        });

        const detailArea = this.node.getChildByName("DetailArea");
        this.placeNode(detailArea, 70, 80);
        this.sizeNode(detailArea, 860, 1180, new Color(0, 0, 0, 0));

        const portrait = detailArea?.getChildByName("Portrait");
        this.placeNode(portrait, 20, 405);
        this.sizeNode(portrait, 360, 360, new Color(245, 214, 170, 255));

        const infoSection = detailArea?.getChildByName("InfoSection");
        this.placeNode(infoSection, -260, 390);
        this.sizeNode(infoSection, 270, 250, new Color(250, 232, 198, 255));
        this.layoutInfoSection(infoSection);

        this.placeNode(detailArea?.getChildByName("UpgradeBtn"), -255, -360);
        this.sizeNode(detailArea?.getChildByName("UpgradeBtn"), 260, 72, new Color(105, 165, 58, 255));
        this.placeNode(detailArea?.getChildByName("FeedBtn"), 330, 260);
        this.sizeNode(detailArea?.getChildByName("FeedBtn"), 220, 112, new Color(248, 221, 171, 255));

        const listArea = this.node.getChildByName("ListArea");
        this.placeNode(listArea, -45, -730);
        this.sizeNode(listArea, 850, 150, new Color(73, 54, 40, 255));
        const layout = listArea?.getComponent(Layout);
        if (layout) {
            layout.resizeMode = Layout.ResizeMode.NONE;
            layout.type = Layout.Type.HORIZONTAL;
            layout.paddingTop = 18;
            layout.paddingBottom = 18;
            layout.paddingLeft = 18;
            layout.paddingRight = 18;
            layout.spacingX = 18;
            layout.spacingY = 0;
        }
        this.layoutCard(listArea?.getChildByName("CardTemplate"));

        const backBtn = this.node.getChildByName("BackBtn");
        this.placeNode(backBtn, -470, 660);
        this.sizeNode(backBtn, 92, 92, new Color(104, 80, 56));

        this.ensureDetailLayout(detailArea);
    }

    private ensureDetailLayout(detailArea: Node | null | undefined): void {
        if (!detailArea) return;

        this.panel(detailArea, "SpeechBubble", 260, 540, 260, 90, new Color(255, 238, 205), "老板，来杯咖啡\n提提神吧~", 24);
        this.panel(detailArea, "MoodPanel", 355, 400, 170, 90, new Color(48, 37, 29), "心情\n😊 100%", 26, Color.WHITE);
        this.panel(detailArea, "PowerPanel", -45, 145, 370, 78, new Color(70, 48, 30), "☕ 生产力：168/秒", 34, Color.WHITE);
        this.panel(detailArea, "StatPanel", 95, -5, 800, 160, new Color(255, 240, 212), "咖啡豆消耗        原料产量        工资        体重        品种\n92/秒             168/秒          240/分钟    胖乎乎      橘猫", 25);
        this.panel(detailArea, "WeightPanel", 95, -205, 800, 200, new Color(255, 240, 212), "体重阶段\n正常        胖猫        巨胖                 体重值 68/100\n再喂32点可进化为巨胖阶段", 27);
        this.panel(detailArea, "SkillPanel", -195, -455, 390, 230, new Color(255, 240, 212), "技能\n大橘暴击  Lv.2\n生产咖啡时有15%概率\n产出双倍原料\n\n升级  💎 200", 27);
        this.panel(detailArea, "EquipPanel", 245, -455, 500, 230, new Color(255, 240, 212), "装备\n猫咪项圈 Lv.5     幸运杯子 Lv.3     舒适坐垫 Lv.2\n原料产量 +15%     原料产量 +10%     心情上限 +10%\n更换              更换              更换", 24);
        this.panel(detailArea, "StoryPanel", 95, -625, 800, 128, new Color(255, 240, 212), "猫咪故事\n大橘原本是一只流浪猫，因为吃被咖啡师收养。\n它最大的梦想就是吃遍全世界的猫粮，顺便生产更多的咖啡！", 24);
        this.panel(detailArea, "RecruitButton", 500, -730, 180, 132, new Color(236, 172, 52), "招募猫咪", 30);
    }

    private placeNode(node: Node | null | undefined, x: number, y: number): void {
        if (!node) return;
        node.setPosition(x, y);
    }

    private sizeNode(node: Node | null | undefined, width: number, height: number, color?: Color): void {
        if (!node) return;
        const transform = node.getComponent(UITransform);
        if (transform) {
            transform.setContentSize(width, height);
        }
        if (color) {
            this.drawPanel(node, width, height, color);
            const sprite = node.getComponent(Sprite);
            if (sprite) {
                sprite.color = color;
                if (!sprite.spriteFrame && color.a > 0) {
                    resources.load("textures/white_bg/spriteFrame", SpriteFrame, (error, frame) => {
                        if (!error && sprite && sprite.isValid) {
                            sprite.spriteFrame = frame;
                        }
                    });
                }
            }
        }
    }

    private drawPanel(node: Node, width: number, height: number, color: Color): void {
        let fillNode = node.getChildByName("__GraphicsFill");
        if (!fillNode) {
            fillNode = new Node("__GraphicsFill");
            fillNode.setParent(node);
            fillNode.addComponent(UITransform);
            fillNode.addComponent(Graphics);
        }
        fillNode.layer = node.layer;
        fillNode.setPosition(0, 0);
        fillNode.setSiblingIndex(0);
        const transform = fillNode.getComponent(UITransform);
        transform?.setContentSize(width, height);

        const graphics = fillNode.getComponent(Graphics);
        if (!graphics) return;
        graphics.clear();
        fillNode.active = color.a > 0;
        if (!fillNode.active) return;

        graphics.fillColor = color;
        graphics.rect(-width * 0.5, -height * 0.5, width, height);
        graphics.fill();
    }

    private panel(parent: Node, name: string, x: number, y: number, width: number, height: number, color: Color, text: string, fontSize: number, fontColor: Color = new Color(70, 45, 30)): Node {
        let node = parent.getChildByName(name);
        if (!node) {
            node = new Node(name);
            node.setParent(parent);
            node.addComponent(UITransform);
            node.addComponent(Sprite);
            const labelNode = new Node("Label");
            labelNode.setParent(node);
            labelNode.addComponent(UITransform);
            labelNode.addComponent(Label);
        }

        this.placeNode(node, x, y);
        this.sizeNode(node, width, height, color);
        const label = node.getComponentInChildren(Label);
        if (label) {
            label.string = text;
            label.fontSize = fontSize;
            label.lineHeight = fontSize + 8;
            label.color = fontColor;
        }
        return node;
    }

    private layoutCard(node: Node | null | undefined): void {
        if (!node) return;
        this.sizeNode(node, 132, 132, new Color(236, 218, 184));
        const name = node.getChildByName("Name");
        const level = node.getChildByName("Level");
        const role = node.getChildByName("Role");

        this.placeNode(name, 0, -26);
        this.placeNode(level, 0, -56);
        this.placeNode(role, -44, 42);

        for (const labelNode of [name, level, role]) {
            const label = labelNode?.getComponent(Label);
            if (label) {
                label.fontSize = labelNode === role ? 34 : 22;
                label.lineHeight = labelNode === role ? 40 : 26;
                label.color = new Color(52, 40, 34);
            }
        }
    }

    private layoutInfoSection(node: Node | null | undefined): void {
        if (!node) return;
        const placements: Record<string, { x: number; y: number; size: number }> = {
            Name: { x: -18, y: 70, size: 34 },
            Rarity: { x: -20, y: 12, size: 72 },
            Level: { x: -20, y: -58, size: 28 },
            Weight: { x: 78, y: -58, size: 22 },
            Attributes: { x: 0, y: -108, size: 24 },
        };

        for (const [name, placement] of Object.entries(placements)) {
            const child = node.getChildByName(name);
            this.placeNode(child, placement.x, placement.y);
            const label = child?.getComponent(Label);
            if (label) {
                label.fontSize = placement.size;
                label.lineHeight = placement.size + 6;
                label.color = new Color(52, 40, 34);
            }
        }
    }

    private buildList() {
        if (!this.listContent || !this.cardTemplate) return;

        const configs = CatManager.getAllConfigs();

        this._cardItems.forEach(item => item.node.destroy());
        this._cardItems.clear();

        for (const config of configs) {
            const node = instantiate(this.cardTemplate);
            node.active = true;
            node.setParent(this.listContent);
            this.layoutCard(node);
            const comp = node.getComponent(CatCardItem);
            if (comp) {
                this._cardItems.set(config.id, comp);
            }
        }
    }

    private refreshView() {
        if (!this.node.activeInHierarchy) return;

        const configs = CatManager.getAllConfigs();
        for (const config of configs) {
            const comp = this._cardItems.get(config.id);
            if (comp) {
                const data = CatManager.getCatData(config.id);
                comp.init(config, data, this._selectedCatId === config.id, this.onCatSelect.bind(this));
            }
        }

        if (this._selectedCatId && this.detailPanel) {
            const config = CatManager.getConfig(this._selectedCatId);
            const data = CatManager.getCatData(this._selectedCatId);
            if (config && data) {
                this.detailPanel.refresh(config, data);
            }
        }
    }

    private onCatSelect(id: string) {
        this._selectedCatId = id;
        this.refreshView();
    }

    private onCatUpdated() {
        this.refreshView();
    }

    private onClose() {
        this.node.active = false;
    }
}
