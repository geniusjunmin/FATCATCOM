import { _decorator, Component, Node, Label, instantiate, Button } from 'cc';
import { InventoryManager } from "../../manager/InventoryManager";
import { ConfigManager } from "../../manager/ConfigManager";

const { ccclass, property } = _decorator;

@ccclass('InventoryPanel')
export class InventoryPanel extends Component {
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

        const items = InventoryManager.getOwnedItems();
        for (const item of items) {
            this.createInventoryItem(item);
        }
    }

    private createInventoryItem(item: {itemId: string, count: number}) {
        const itemConfig = ConfigManager.items.find(i => i.id === item.itemId);
        if (!itemConfig) return;

        const node = instantiate(this.itemTemplate!);
        node.active = true;
        node.setParent(this.listContent!);

        const nameLbl = node.getChildByName("Name")?.getComponent(Label);
        if (nameLbl) nameLbl.string = `${itemConfig.name} x${item.count}`;

        const useBtn = node.getComponent(Button);
        if (useBtn) {
            useBtn.node.on(Node.EventType.TOUCH_END, () => {
                if (InventoryManager.useItem(item.itemId)) {
                    this.refresh();
                }
            });
        }
    }

    private onClose() {
        this.node.active = false;
    }
}
