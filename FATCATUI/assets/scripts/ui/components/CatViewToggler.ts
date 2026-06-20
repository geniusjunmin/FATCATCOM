import { _decorator, Button, Component, Node, find } from 'cc';
import { BottomNavUI } from '../BottomNavUI';
import { CatView } from '../panels/CatView';
const { ccclass, property } = _decorator;

@ccclass('CatViewToggler')
export class CatViewToggler extends Component {
    @property(Node)
    public catView: Node | null = null;

    @property(BottomNavUI)
    public bottomNav: BottomNavUI | null = null;

    protected onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this.onToggle, this);
        const button = this.node.getComponent(Button);
        if (button) {
            this.node.on(Button.EventType.CLICK, this.onToggle, this);
        }
    }

    protected onDestroy() {
        this.node.off(Node.EventType.TOUCH_END, this.onToggle, this);
        this.node.off(Button.EventType.CLICK, this.onToggle, this);
    }

    private onToggle() {
        if (!this.bottomNav) {
            this.bottomNav = find("FatCatMainGreyboxRoot/BottomArea/BottomNav")?.getComponent(BottomNavUI) || null;
        }

        if (this.bottomNav) {
            this.bottomNav.selectCats();
            this.bringCatViewToFront();
            return;
        }

        this.bringCatViewToFront();
    }

    private bringCatViewToFront(): void {
        if (!this.catView) {
            this.catView = find("FatCatMainGreyboxRoot/CatView");
        }
        if (this.catView) {
            this.catView.active = true;
            this.catView.setSiblingIndex(this.catView.parent?.children.length ? this.catView.parent.children.length - 1 : 0);
            this.catView.getComponent(CatView)?.showView();
        }
    }
}
