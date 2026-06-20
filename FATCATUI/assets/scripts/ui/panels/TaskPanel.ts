import { _decorator, Component, Node, Label, instantiate, Button, ProgressBar } from 'cc';
import { TaskManager } from "../../manager/TaskManager";
import { TaskConfig } from "../../model/TaskModel";

const { ccclass, property } = _decorator;

@ccclass('TaskPanel')
export class TaskPanel extends Component {
    @property(Node)
    public listContent: Node | null = null;

    @property(Node)
    public itemTemplate: Node | null = null;

    protected onEnable() {
        this.refresh();
    }

    public refresh() {
        if (!this.listContent || !this.itemTemplate) return;

        // Clear list
        this.listContent.children.filter(c => c !== this.itemTemplate).forEach(c => c.destroy());

        const activeTasks = TaskManager.getActiveTasks();
        for (const item of activeTasks) {
            this.createTaskItem(item.config, item.data);
        }
    }

    private createTaskItem(config: TaskConfig, data: any) {
        const node = instantiate(this.itemTemplate!);
        node.active = true;
        node.setParent(this.listContent!);

        const nameLbl = node.getChildByName("Name")?.getComponent(Label);
        if (nameLbl) nameLbl.string = config.name;

        const descLbl = node.getChildByName("Desc")?.getComponent(Label);
        if (descLbl) descLbl.string = config.description;

        const progressLbl = node.getChildByName("ProgressLabel")?.getComponent(Label);
        if (progressLbl) progressLbl.string = `${Math.min(data.currentValue, config.goalValue)} / ${config.goalValue}`;

        const bar = node.getChildByName("ProgressBar")?.getComponent(ProgressBar);
        if (bar) bar.progress = Math.min(1, data.currentValue / config.goalValue);

        const claimBtn = node.getChildByName("ClaimBtn")?.getComponent(Button);
        const canClaim = data.currentValue >= config.goalValue && !data.isClaimed;

        if (claimBtn) {
            claimBtn.interactable = canClaim;
            claimBtn.node.on(Node.EventType.TOUCH_END, () => {
                if (TaskManager.claimReward(config.id)) {
                    this.refresh();
                }
            }, this);
        }
    }
}
