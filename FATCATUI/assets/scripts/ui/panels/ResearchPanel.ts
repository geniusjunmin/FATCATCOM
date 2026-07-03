import { _decorator, Component, Node, Label, instantiate, Button } from 'cc';
import { ResearchManager } from "../../manager/ResearchManager";
import { SyncManager } from "../../manager/SyncManager";
import { NetworkManager } from "../../manager/NetworkManager";
import { ResearchConfig } from "../../model/ResearchModel";

const { ccclass, property } = _decorator;

@ccclass('ResearchPanel')
export class ResearchPanel extends Component {
    @property(Node)
    public listContent: Node | null = null;

    @property(Node)
    public itemTemplate: Node | null = null;

    @property(Node)
    public closeBtn: Node | null = null;

    protected onLoad() {
        if (this.itemTemplate) this.itemTemplate.active = false;
        if (this.closeBtn) {
            this.closeBtn.on(Node.EventType.TOUCH_END, this.onClose, this);
        }
    }

    protected onEnable() {
        this.refresh();
    }

    public refresh() {
        if (!this.listContent || !this.itemTemplate) return;

        // Clear list
        this.listContent.children.filter(c => c !== this.itemTemplate).forEach(c => c.destroy());

        const configs = ResearchManager.getAllConfigs();
        for (const config of configs) {
            this.createResearchItem(config);
        }
    }

    private createResearchItem(config: ResearchConfig) {
        const node = instantiate(this.itemTemplate!);
        node.active = true;
        node.setParent(this.listContent!);

        const nameLbl = node.getChildByName("Name")?.getComponent(Label);
        if (nameLbl) nameLbl.string = config.name;

        const descLbl = node.getChildByName("Desc")?.getComponent(Label);
        if (descLbl) descLbl.string = config.description;

        const costLbl = node.getChildByName("Cost")?.getComponent(Label);
        const level = ResearchManager.getLevel(config.id);
        const nextCost = ResearchManager.getNextCost(config, level);
        if (costLbl) costLbl.string = level >= config.maxLevel
            ? `Lv.${level}/${config.maxLevel} · MAX`
            : `Lv.${level}/${config.maxLevel} · ${nextCost} 研究点`;

        const isUnlocked = ResearchManager.isUnlocked(config.id);
        const canUnlock = ResearchManager.canUnlock(config.id);

        const btn = node.getComponent(Button);
        const btnLabel = node.getChildByName("BtnLabel")?.getComponent(Label);
        
        if (level >= config.maxLevel) {
            if (btnLabel) btnLabel.string = "已满级";
            if (btn) btn.interactable = false;
        } else if (!canUnlock) {
            if (btnLabel) btnLabel.string = "未满足前提";
            if (btn) btn.interactable = false;
        } else {
            if (btnLabel) btnLabel.string = isUnlocked ? "升级" : "研究";
            if (btn) {
                btn.interactable = true;
                btn.node.on(Node.EventType.TOUCH_END, async () => {
                    const unlocked = NetworkManager.canUseServer
                        ? !!await SyncManager.unlockServerResearch(config.id)
                        : ResearchManager.unlock(config.id);
                    if (unlocked) {
                        this.refresh();
                    }
                });
            }
        }
    }

    private onClose() {
        this.node.active = false;
    }
}
