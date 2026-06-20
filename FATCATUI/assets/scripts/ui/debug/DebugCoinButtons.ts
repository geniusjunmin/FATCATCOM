import { _decorator, Component, Node } from 'cc';
import { ResourceManager } from '../../manager/ResourceManager';

const { ccclass, property } = _decorator;

@ccclass('DebugCoinButtons')
export class DebugCoinButtons extends Component {
    @property(Node)
    public addCoinBtn: Node | null = null;

    @property(Node)
    public spendCoinBtn: Node | null = null;

    protected start() {
        if (this.addCoinBtn) {
            this.addCoinBtn.on(Node.EventType.TOUCH_END, this.onAddCoin, this);
        }
        if (this.spendCoinBtn) {
            this.spendCoinBtn.on(Node.EventType.TOUCH_END, this.onSpendCoin, this);
        }
    }

    private onAddCoin() {
        ResourceManager.add({ coin: 1000 }, "debug:add");
    }

    private onSpendCoin() {
        ResourceManager.spend({ coin: 500 }, "debug:spend");
    }
}
