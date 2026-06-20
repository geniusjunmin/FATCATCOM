import { _decorator, Component, Node, Label, instantiate, Button } from 'cc';
import { ShopManager } from "../../manager/ShopManager";
import { ConfigManager } from "../../manager/ConfigManager";
import { ShopItemConfig } from "../../model/ItemModel";

const { ccclass, property } = _decorator;

@ccclass('ShopPanel')
export class ShopPanel extends Component {
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

        const items = ConfigManager.shops;
        for (const item of items) {
            this.createShopItem(item);
        }
    }

    private createShopItem(config: ShopItemConfig) {
        const itemConfig = ConfigManager.items.find(i => i.id === config.itemId);
        if (!itemConfig) return;

        const node = instantiate(this.itemTemplate!);
        node.active = true;
        node.setParent(this.listContent!);

        const nameLbl = node.getChildByName("Name")?.getComponent(Label);
        if (nameLbl) nameLbl.string = itemConfig.name;

        const priceLbl = node.getChildByName("Price")?.getComponent(Label);
        if (priceLbl) priceLbl.string = `${config.priceAmount} ${config.priceType}`;

        const limitLbl = node.getChildByName("Limit")?.getComponent(Label);
        if (limitLbl) {
            const remaining = ShopManager.getRemainingLimit(config.id);
            limitLbl.string = `限购: ${remaining}/${config.limitDaily}`;
        }

        const buyBtn = node.getComponent(Button);
        if (buyBtn) {
            buyBtn.node.on(Node.EventType.TOUCH_END, () => {
                if (ShopManager.buyItem(config.id)) {
                    this.refresh();
                }
            });
        }
    }

    private onClose() {
        this.node.active = false;
    }
}
