import { _decorator, Component, Node, Prefab, instantiate, Vec3, Color, find, Canvas } from 'cc';
import { FloatingText } from "../ui/effects/FloatingText";

const { ccclass, property } = _decorator;

@ccclass('EffectManager')
export class EffectManager extends Component {
    private static _instance: EffectManager | null = null;

    @property(Prefab)
    public floatingTextPrefab: Prefab | null = null;

    @property(Node)
    public effectLayer: Node | null = null;

    protected onLoad() {
        EffectManager._instance = this;
        if (!this.effectLayer) {
            this.effectLayer = find("Canvas");
        }
    }

    public static showFloatingText(text: string, worldPos: Vec3, color: Color = Color.WHITE) {
        if (!this._instance || !this._instance.floatingTextPrefab || !this._instance.effectLayer) return;

        const node = instantiate(this._instance.floatingTextPrefab);
        node.setParent(this._instance.effectLayer);
        
        const comp = node.getComponent(FloatingText);
        if (comp) {
            comp.show(text, worldPos, color);
        }
    }
}
