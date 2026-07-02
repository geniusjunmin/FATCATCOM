import { _decorator, Color, Component, Label, Node, ProgressBar, UITransform } from "cc";
import { EventBus, GameEvents } from "../core/EventBus";
import { ResourceChangedPayload, ResourceManager } from "../manager/ResourceManager";
import { SaveManager } from "../manager/SaveManager";
import { GameSaveData } from "../model/SaveData";
import { formatCompactNumber, formatExactInteger } from "./Formatters";

const { ccclass, property } = _decorator;

@ccclass("TopBarUI")
export class TopBarUI extends Component {
    @property(Label)
    public companyNameLabel: Label | null = null;

    @property(Label)
    public levelLabel: Label | null = null;

    @property(Label)
    public expLabel: Label | null = null;

    @property(ProgressBar)
    public expProgress: ProgressBar | null = null;

    @property(Label)
    public coinLabel: Label | null = null;

    @property(Label)
    public beanLabel: Label | null = null;

    @property(Label)
    public catFoodLabel: Label | null = null;

    @property(Label)
    public diamondLabel: Label | null = null;

    protected onEnable(): void {
        this.applyLayout();
        EventBus.on<GameSaveData>(GameEvents.APP_READY, this.onAppReady);
        EventBus.on<ResourceChangedPayload>(GameEvents.RESOURCES_CHANGED, this.onResourcesChanged);
        this.tryRefresh();
    }

    protected onDisable(): void {
        EventBus.off<GameSaveData>(GameEvents.APP_READY, this.onAppReady);
        EventBus.off<ResourceChangedPayload>(GameEvents.RESOURCES_CHANGED, this.onResourcesChanged);
    }

    private onAppReady = (): void => {
        this.tryRefresh();
    };

    private onResourcesChanged = (): void => {
        this.refreshResources();
    };

    private applyLayout(): void {
        const playerCard = this.node.getChildByName("PlayerCard");
        if (playerCard) {
            playerCard.setPosition(-370, 842);
            this.setSize(playerCard, 300, 108);
            this.setSize(playerCard.getChildByName("PlayerCard_Background"), 300, 108);
            const labels = playerCard.getComponentsInChildren(Label);
            if (labels[0]) {
                labels[0].fontSize = 30;
                labels[0].lineHeight = 36;
                labels[0].color = new Color(255, 235, 200);
            }
            if (labels[1]) {
                labels[1].fontSize = 24;
                labels[1].lineHeight = 30;
                labels[1].color = new Color(255, 215, 60);
            }
        }

        const resourceNames = ["Resource_coin", "Resource_bean", "Resource_catFood", "Resource_diamond"];
        const resourceX = [-95, 105, 305, 505];

        resourceNames.forEach((name, index) => {
            const node = this.node.getChildByName(name);
            if (!node) return;
            node.setPosition(resourceX[index], 842);
            this.setSize(node, 168, 72);
            this.setSize(node.getChildByName(`${name}_Background`), 168, 72);

            const title = node.children.find(child => child.name.endsWith("_Label") && child.position.y > 0);
            const value = node.children.find(child => child.name.endsWith("_Label") && child.position.y <= 0);
            if (title) {
                title.setPosition(-40, 20);
                const label = title.getComponent(Label);
                if (label) {
                    label.fontSize = 22;
                    label.lineHeight = 28;
                    label.color = new Color(255, 230, 190);
                }
            }
            if (value) {
                value.setPosition(10, -8);
                const label = value.getComponent(Label);
                if (label) {
                    label.fontSize = 32;
                    label.lineHeight = 38;
                    label.color = Color.WHITE;
                }
            }

            const addButton = node.children.find(child => child.name.startsWith("Add_"));
            if (addButton) {
                addButton.setPosition(72, 0);
                this.setSize(addButton, 48, 48);
                this.setSize(addButton.children[0], 48, 48);
            }
        });
    }

    private setSize(node: Node | null | undefined, width: number, height: number): void {
        const transform = node?.getComponent(UITransform);
        if (transform) {
            transform.setContentSize(width, height);
        }
    }

    private tryRefresh(): void {
        try {
            this.refreshPlayer(SaveManager.snapshot());
            this.refreshResources();
        } catch (error) {
            console.info("[TopBarUI] Waiting for GameApp initialization.");
        }
    }

    private refreshPlayer(save: GameSaveData): void {
        const player = save.player;
        this.setLabel(this.companyNameLabel, player.companyName);
        this.setLabel(this.levelLabel, player.level.toString());
        this.setLabel(this.expLabel, `${player.exp}/${player.expToNext}`);
        if (this.expProgress) {
            this.expProgress.progress = player.expToNext > 0 ? player.exp / player.expToNext : 0;
        }
    }

    private refreshResources(): void {
        const resources = ResourceManager.getAll();
        this.setLabel(this.coinLabel, formatCompactNumber(resources.coin));
        this.setLabel(this.beanLabel, formatCompactNumber(resources.bean));
        this.setLabel(this.catFoodLabel, formatCompactNumber(resources.catFood));
        this.setLabel(this.diamondLabel, formatExactInteger(resources.diamond));
    }

    private setLabel(label: Label | null, value: string): void {
        if (label) {
            label.string = value;
        }
    }
}
