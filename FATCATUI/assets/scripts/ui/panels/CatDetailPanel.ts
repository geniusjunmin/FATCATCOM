import { _decorator, Button, Color, Component, Event, find, Label, Node, resources, Sprite, SpriteFrame } from "cc";
import { CatSaveData } from "../../model/SaveData";
import { CatConfig, CatModel } from "../../model/CatModel";
import { CatManager } from "../../manager/CatManager";
import { BuildingManager } from "../../manager/BuildingManager";
import { formatCompactNumber } from "../Formatters";
import { CatUnlockConfirmPanel } from "./CatUnlockConfirmPanel";
import { SkillManager } from "../../manager/SkillManager";

const { ccclass, property } = _decorator;

@ccclass("CatDetailPanel")
export class CatDetailPanel extends Component {
    @property(Label)
    public nameLabel: Label | null = null;

    @property(Label)
    public levelLabel: Label | null = null;

    @property(Label)
    public rarityLabel: Label | null = null;

    @property(Label)
    public attributesLabel: Label | null = null;

    @property(Label)
    public weightLabel: Label | null = null;

    @property(Label)
    public upgradeCostLabel: Label | null = null;

    @property(Label)
    public actionLabel: Label | null = null;

    @property(Label)
    public skillLabel: Label | null = null;

    @property(Button)
    public upgradeBtn: Button | null = null;

    @property(Button)
    public feedBtn: Button | null = null;

    @property(Sprite)
    public portraitSprite: Sprite | null = null;

    @property(CatUnlockConfirmPanel)
    public unlockConfirmPanel: CatUnlockConfirmPanel | null = null;

    @property(Node)
    public infoContent: Node | null = null;

    @property(Node)
    public skillContent: Node | null = null;

    @property(Node)
    public upgradeContent: Node | null = null;

    private _currentConfig: CatConfig | null = null;
    private _currentCatId: string | null = null;
    private _currentTab = "info";
    private _tabsBound = false;

    protected start(): void {
        this.ensureReferences();
        if (this.upgradeBtn) {
            this.upgradeBtn.node.off(Node.EventType.TOUCH_END, this.onUpgradeClick, this);
            this.upgradeBtn.node.on(Node.EventType.TOUCH_END, this.onUpgradeClick, this);
        }
        if (this.feedBtn) {
            this.feedBtn.node.off(Node.EventType.TOUCH_END, this.onFeedClick, this);
            this.feedBtn.node.on(Node.EventType.TOUCH_END, this.onFeedClick, this);
        }

        this.bindTabs();
        this.showTab("info");
    }

    private bindTabs(): void {
        if (this._tabsBound) return;
        const sidebar = find("FatCatMainGreyboxRoot/CatView/Sidebar");
        if (!sidebar) return;

        const tabMap: Record<string, string> = {
            "Tab_信息": "info",
            "Tab_升级": "upgrade",
            "Tab_技能": "skill",
            "Tab_装备": "equip",
            "Tab_皮肤": "skin",
        };

        for (const child of sidebar.children) {
            const tabId = tabMap[child.name];
            if (!tabId) continue;
            child.off(Node.EventType.TOUCH_END);
            child.on(Node.EventType.TOUCH_END, () => this.showTab(tabId), this);
        }
        this._tabsBound = true;
    }

    public showTab(tabId: string): void {
        this._currentTab = tabId;

        if (this.infoContent) this.infoContent.active = tabId === "info";
        if (this.skillContent) this.skillContent.active = tabId === "skill";
        if (this.upgradeContent) this.upgradeContent.active = tabId === "upgrade";

        if (!this.infoContent) {
            if (this.attributesLabel) this.attributesLabel.node.active = tabId === "info";
            if (this.skillLabel) this.skillLabel.node.active = tabId === "skill";
            if (this.upgradeCostLabel) this.upgradeCostLabel.node.active = tabId === "upgrade" || tabId === "info";
        }

        this.updateTabColors();
    }

    private updateTabColors(): void {
        const sidebar = find("FatCatMainGreyboxRoot/CatView/Sidebar");
        if (!sidebar) return;

        const nameByTab: Record<string, string> = {
            info: "信息",
            upgrade: "升级",
            skill: "技能",
            equip: "装备",
            skin: "皮肤",
        };
        const currentName = nameByTab[this._currentTab] ?? this._currentTab;

        for (const child of sidebar.children) {
            const label = child.getComponentInChildren(Label);
            if (label) {
                label.color = child.name.includes(currentName) ? new Color(255, 132, 32) : new Color(255, 255, 255);
            }
        }
    }

    public refresh(config: CatConfig, data: CatSaveData): void {
        this.ensureReferences();
        this._currentConfig = config;
        this._currentCatId = config.id;

        if (this.portraitSprite && config.portrait) {
            resources.load(`${config.portrait}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
                if (!err && this.portraitSprite?.isValid && spriteFrame) {
                    this.portraitSprite.spriteFrame = spriteFrame;
                }
            });
        }

        if (this.nameLabel) this.nameLabel.string = config.name;
        if (this.levelLabel) this.levelLabel.string = data.isUnlocked ? `Lv.${data.level}` : "未解锁";
        if (this.rarityLabel) this.rarityLabel.string = `稀有度: ${config.rarity}`;

        const stage = CatModel.getWeightStage(data.weight);
        const stageText = stage === "SUPER_FAT" ? "巨胖" : stage === "FAT" ? "胖猫" : "正常";
        if (this.weightLabel) {
            this.weightLabel.string = `体重: ${data.weight} (${stageText})`;
        }

        if (this.attributesLabel) {
            const production = CatManager.getCatProduction(config.id);
            const buildingId = CatManager.getAssignedBuildingId(config.id);
            const building = buildingId ? BuildingManager.getById(buildingId) : null;
            const assignedText = data.isUnlocked && building ? `${building.floor} ${building.name}` : "未排班";
            this.attributesLabel.string = `产量: ${Math.floor(production)} / 秒\n消耗: ${config.baseBeanCost} 豆\n工资: ${config.baseSalary}\n派驻: ${assignedText}`;
        }

        if (this.skillLabel && config.skillId) {
            const skill = SkillManager.getSkillConfig(config.skillId);
            this.skillLabel.string = skill ? `【${skill.name}】\n${skill.description}` : "技能: 无";
        }

        if (data.isUnlocked) {
            const cost = CatModel.calculateUpgradeCost(data.level);
            if (this.upgradeCostLabel) this.upgradeCostLabel.string = `${formatCompactNumber(cost)} 金币`;
            if (this.actionLabel) this.actionLabel.string = "升级";
            if (this.upgradeBtn) this.upgradeBtn.interactable = true;
            if (this.feedBtn) this.feedBtn.interactable = data.weight < 100;
        } else {
            const cost = CatModel.calculateUnlockCost(config.rarity);
            if (this.upgradeCostLabel) this.upgradeCostLabel.string = `${formatCompactNumber(cost)} 金币`;
            if (this.actionLabel) this.actionLabel.string = "解锁";
            if (this.upgradeBtn) this.upgradeBtn.interactable = true;
            if (this.feedBtn) this.feedBtn.interactable = false;
        }

        this.showTab(this._currentTab);
    }

    private ensureReferences(): void {
        const infoSection = this.node.getChildByName("InfoSection");
        if (infoSection) {
            if (!this.nameLabel) this.nameLabel = infoSection.getChildByName("Name")?.getComponent(Label) ?? null;
            if (!this.rarityLabel) this.rarityLabel = infoSection.getChildByName("Rarity")?.getComponent(Label) ?? null;
            if (!this.levelLabel) this.levelLabel = infoSection.getChildByName("Level")?.getComponent(Label) ?? null;
            if (!this.weightLabel) this.weightLabel = infoSection.getChildByName("Weight")?.getComponent(Label) ?? null;
            if (!this.attributesLabel) this.attributesLabel = infoSection.getChildByName("Attributes")?.getComponent(Label) ?? null;
            if (!this.skillLabel) this.skillLabel = infoSection.getChildByName("Skill")?.getComponent(Label) ?? this.attributesLabel;
        }

        if (!this.upgradeBtn) this.upgradeBtn = this.node.getChildByName("UpgradeBtn")?.getComponent(Button) ?? null;
        if (!this.feedBtn) this.feedBtn = this.node.getChildByName("FeedBtn")?.getComponent(Button) ?? null;
        if (!this.upgradeCostLabel) this.upgradeCostLabel = this.upgradeBtn?.node.getComponentInChildren(Label) ?? null;
        if (!this.actionLabel) this.actionLabel = this.upgradeBtn?.node.getComponentInChildren(Label) ?? null;
    }

    private onUpgradeClick(): void {
        if (!this._currentCatId) return;

        const data = CatManager.getCatData(this._currentCatId);
        if (!data.isUnlocked) {
            if (this._currentConfig && this.unlockConfirmPanel) {
                this.unlockConfirmPanel.show(this._currentConfig);
            } else if (CatManager.unlockCat(this._currentCatId)) {
                this.node.dispatchEvent(new Event("cat-updated", true));
            }
            return;
        }

        if (CatManager.upgradeCat(this._currentCatId)) {
            this.node.dispatchEvent(new Event("cat-updated", true));
        }
    }

    private onFeedClick(): void {
        if (this._currentCatId && CatManager.feedCat(this._currentCatId)) {
            this.node.dispatchEvent(new Event("cat-updated", true));
        }
    }
}
