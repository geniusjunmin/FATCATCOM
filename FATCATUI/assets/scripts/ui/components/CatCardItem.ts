import { _decorator, Component, Node, Label, Sprite, Color, UIOpacity, resources, SpriteFrame } from 'cc';
import { CatConfig } from "../../model/CatModel";
import { CatSaveData } from "../../model/SaveData";

const { ccclass, property } = _decorator;

@ccclass('CatCardItem')
export class CatCardItem extends Component {
    @property(Label)
    public nameLabel: Label | null = null;

    @property(Label)
    public levelLabel: Label | null = null;

    @property(Label)
    public roleLabel: Label | null = null;

    @property(Sprite)
    public bgSprite: Sprite | null = null;

    @property(Sprite)
    public portraitSprite: Sprite | null = null;

    @property(Node)
    public lockOverlay: Node | null = null;

    private _catId: string | null = null;
    private _clickCallback: ((id: string) => void) | null = null;
    private _hasListener = false;

    public init(config: CatConfig, data: CatSaveData, isSelected: boolean, clickCallback: (id: string) => void) {
        this._catId = config.id;
        this._clickCallback = clickCallback;

        if (this.portraitSprite && config.portrait) {
            resources.load(config.portrait + "/spriteFrame", SpriteFrame, (err, sf) => {
                if (!err && this.portraitSprite) {
                    this.portraitSprite.spriteFrame = sf;
                }
            });
        }

        if (this.nameLabel) {
            this.nameLabel.string = config.name;
            this.nameLabel.node.active = data.isUnlocked;
        }
        
        if (this.levelLabel) {
            this.levelLabel.string = `Lv.${data.level}`;
            this.levelLabel.node.active = data.isUnlocked;
        }
        
        if (this.roleLabel) {
            this.roleLabel.string = config.rarity;
        }

        if (this.bgSprite) {
            const baseColor = isSelected ? new Color(255, 200, 100) : new Color(255, 255, 255);
            // If locked, make it darker/grey
            if (!data.isUnlocked) {
                this.bgSprite.color = new Color(150, 150, 150);
            } else {
                this.bgSprite.color = baseColor;
            }
        }

        if (this.lockOverlay) {
            this.lockOverlay.active = !data.isUnlocked;
        } else {
            // Fallback: use opacity if no overlay node
            let opacity = this.node.getComponent(UIOpacity);
            if (!opacity) opacity = this.node.addComponent(UIOpacity);
            opacity.opacity = data.isUnlocked ? 255 : 180;
        }

        if (!this._hasListener) {
            this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
            this._hasListener = true;
        }
    }

    private onClick() {
        if (this._catId && this._clickCallback) {
            this._clickCallback(this._catId);
        }
    }
}
