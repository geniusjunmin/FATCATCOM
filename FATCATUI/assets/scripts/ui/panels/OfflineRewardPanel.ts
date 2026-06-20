import { _decorator, Component, Label, Node } from "cc";
import { ProductionTickPayload } from "../../manager/ProductionManager";
import { formatCompactNumber } from "../Formatters";

const { ccclass, property } = _decorator;

@ccclass("OfflineRewardPanel")
export class OfflineRewardPanel extends Component {
    @property(Label)
    public titleLabel: Label | null = null;

    @property(Label)
    public timeLabel: Label | null = null;

    @property(Label)
    public coinLabel: Label | null = null;

    @property(Label)
    public beanLabel: Label | null = null;

    @property(Label)
    public tipLabel: Label | null = null;

    @property(Node)
    public closeBtn: Node | null = null;

    protected onLoad(): void {
        this.closeBtn?.on(Node.EventType.TOUCH_END, this.hide, this);
        this.node.active = false;
    }

    protected onDestroy(): void {
        this.closeBtn?.off(Node.EventType.TOUCH_END, this.hide, this);
    }

    public show(offlineSeconds: number, reward: ProductionTickPayload): void {
        this.node.active = true;
        this.setLabel(this.titleLabel, "离线收益");
        this.setLabel(this.timeLabel, `离线 ${this.formatDuration(offlineSeconds)}`);
        this.setLabel(this.coinLabel, `+${formatCompactNumber(reward.coinGained)} 金币`);
        this.setLabel(this.beanLabel, `-${formatCompactNumber(reward.beanSpent)} 咖啡豆`);
        this.setLabel(this.tipLabel, this.getTip(reward));
    }

    public hide(): void {
        this.node.active = false;
    }

    private getTip(reward: ProductionTickPayload): string {
        if (reward.coinGained <= 0) {
            return "咖啡豆不足，离线期间没有产生收益。";
        }
        if (reward.seconds <= 0) {
            return "离线时间太短，暂未结算收益。";
        }
        return "收益已自动存入账户。";
    }

    private formatDuration(seconds: number): string {
        const totalMinutes = Math.max(1, Math.floor(seconds / 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours > 0 && minutes > 0) {
            return `${hours}小时${minutes}分钟`;
        }
        if (hours > 0) {
            return `${hours}小时`;
        }
        return `${minutes}分钟`;
    }

    private setLabel(label: Label | null, value: string): void {
        if (label) {
            label.string = value;
        }
    }
}
