import { _decorator, Component, Node, Label, Vec3, tween, Color, UIOpacity } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('FloatingText')
export class FloatingText extends Component {
    public show(text: string, worldPos: Vec3, color: Color = Color.WHITE) {
        const label = this.getComponent(Label);
        if (label) {
            label.string = text;
            label.color = color;
        }

        const opacity = this.getComponent(UIOpacity) || this.node.addComponent(UIOpacity);
        opacity.opacity = 255;

        this.node.setWorldPosition(worldPos);
        
        const targetPos = new Vec3(worldPos.x, worldPos.y + 150, worldPos.z);

        tween(this.node)
            .to(1, { worldPosition: targetPos }, { easing: 'sineOut' })
            .start();

        tween(opacity)
            .to(0.5, { opacity: 255 })
            .to(0.5, { opacity: 0 })
            .call(() => {
                this.node.destroy();
            })
            .start();
    }
}
