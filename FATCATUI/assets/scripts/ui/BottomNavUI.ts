import { _decorator, Component, Button, Label, Node, Color, Sprite, SpriteFrame, UITransform, find, resources } from "cc";
import { EventBus, GameEvents } from "../core/EventBus";
import { ConfigManager } from "../manager/ConfigManager";
import { ResourceManager } from "../manager/ResourceManager";
import { SaveManager } from "../manager/SaveManager";
import { CatView } from "./panels/CatView";
import { CatManager } from "../manager/CatManager";
import { BuildingManager } from "../manager/BuildingManager";
import { InventoryManager } from "../manager/InventoryManager";
import { ProductionManager } from "../manager/ProductionManager";
import { ResearchManager } from "../manager/ResearchManager";
import { ShopManager } from "../manager/ShopManager";
import { TaskManager } from "../manager/TaskManager";
import { NetworkManager } from "../manager/NetworkManager";
import { SyncManager } from "../manager/SyncManager";
import { FriendActivityDto, FriendDto, FriendRequestDto, FriendRoomDto, FriendSearchResultDto, LeaderboardDto } from "../net/ApiTypes";
import { CatModel, WeightStage } from "../model/CatModel";
import { TaskType } from "../model/TaskModel";
import { GeneratedBackgroundAssets } from "./UiAssetRegistry";
import {
    getCatFullArtAsset,
    getDomAssetDataUri,
    getEquipIconAsset,
    getFactoryPropDataUri,
    getFeatureIconAsset,
    getGeneratedIconAsset,
    getSkillIconAsset,
} from "./DomAssetResolver";
import { formatClockTime, formatDisplayNumber, formatFriendReportRelativeTime, formatRateValue } from "./Formatters";
import {
    MAIN_DOM_NAV_ITEMS,
    MAIN_NAV_FEATURE_ICON_BY_PANEL,
    MAIN_PANEL_BINDINGS,
    MAIN_PANEL_SELECTED_NAMES,
    ORDERED_MAIN_PANELS,
    type MainPanelId,
} from "./MainPanelConfig";
import {
    getCatBubble as getCatBubbleText,
    getCatRoleLabel as getCatRoleLabelText,
    getCatStory as getCatStoryText,
    getCatTabTitle as getCatTabTitleText,
    getFriendActivityLabel as getFriendActivityLabelText,
    getInventoryTabDesc as getInventoryTabDescription,
    getInventoryTabLabel as getInventoryTabLabelText,
    getItemDisplayName as getItemDisplayNameText,
    getItemIconClass as getItemIconClassName,
    getNetworkModeLabel as getNetworkModeLabelText,
    getResearchEffectLabel as getResearchEffectLabelText,
    getResearchIconClass as getResearchIconClassName,
    getResourceIconClass as getResourceIconClassName,
    getShopIcon as getShopIconClassName,
    getShopTabLabel as getShopTabLabelText,
    getSkillDesc as getSkillDescription,
    getSkillName as getSkillDisplayName,
    getSyncModeLabel as getSyncModeLabelText,
    getTaskTypeLabel as getTaskTypeLabelText,
    getWeightStageLabel as getWeightStageLabelText,
    renderStars as renderRarityStars,
} from "./UiPresentation";
import {
    getBuildingDisplayName as getFactoryBuildingDisplayName,
    getBuildingScene,
    getFloorBonusIconClass as getFactoryFloorBonusIconClass,
    MAIN_FACTORY_FLOORS,
    renderFactoryProps as renderFactoryPropsMarkup,
    renderFactoryRoomDecor as renderFactoryRoomDecorMarkup,
    renderFactoryWallDetails as renderFactoryWallDetailsMarkup,
    renderFactoryWorkerCats as renderFactoryWorkerCatsMarkup,
} from "./FactoryPresentation";
import { getDomFactoryStyles } from "./FactoryOverlayPresentation";
import {
    getDefaultSettingValue as getDefaultFeatureSettingValue,
    INVENTORY_PREVIEW_CARDS,
    INVENTORY_TABS,
    RESEARCH_NODE_POSITIONS,
    RESEARCH_PLACEHOLDER_LABELS,
    RESEARCH_PLACEHOLDER_POSITIONS,
    SETTINGS_PANEL_ITEMS,
    SHOP_PREVIEW_CATALOGS,
    SHOP_TABS,
    TASK_PROGRESS_MILESTONES,
    type InventoryTabId,
    type ShopTabId,
} from "./FeaturePanelPresentation";
import {
    CAT_DEFAULT_EQUIPMENT,
    CAT_EQUIPMENT_EFFECT_LINES,
    CAT_EQUIPMENT_SLOTS,
    CAT_LOCKED_EQUIPMENT_SLOT,
    CAT_SIDE_TABS,
    CAT_SKIN_THEMES,
    type CatEquipmentSlotName,
    type CatTabId,
} from "./CatPresentation";
import {
    DOM_HUD_STYLES,
    HUD_COMPANY_NAME,
    HUD_EXP_PERCENT,
    HUD_EXP_TEXT,
    HUD_PLAYER_LEVEL,
    HUD_RESOURCE_ITEMS,
    type HudResourceKind,
} from "./HudPresentation";
import { DOM_NAV_STYLES } from "./NavPresentation";
import { DOM_PANEL_STYLES } from "./PanelPresentation";

const { ccclass, property } = _decorator;

type FriendPanelRow = {
    id: string;
    name: string;
    level: number;
    income: number;
    status: string;
    rooms?: FriendRoomDto[];
};

export const MainPanelEvents = {
    NAV_CHANGED: "main-nav:changed",
} as const;


@ccclass("BottomNavUI")
export class BottomNavUI extends Component {
    @property([Node])
    public navButtons: Node[] = [];

    @property(Node)
    public catView: Node | null = null;
    
    @property(Node)
    public shopPanel: Node | null = null;
    
    @property(Node)
    public inventoryPanel: Node | null = null;

    @property(Node)
    public researchPanel: Node | null = null;

    @property(Node)
    public taskPanel: Node | null = null;

    @property(Node)
    public factoryView: Node | null = null;

    @property(Node)
    public buildingDetailPanel: Node | null = null;

    @property([Node])
    public factoryActionButtons: Node[] = [];

    @property
    public currentPanel: MainPanelId = "factory";

    private _boundNavButtons = new Set<Node>();
    private _domHotspots: HTMLElement[] = [];
    private _domLayoutFrame = 0;
    private _catOverlay: Node | null = null;
    private _domCatOverlay: HTMLElement | null = null;
    private _domPanelOverlay: HTMLElement | null = null;
    private _domHudOverlay: HTMLElement | null = null;
    private _domFactoryOverlay: HTMLElement | null = null;
    private _domNavOverlay: HTMLElement | null = null;
    private _topBarNode: Node | null = null;
    private _bottomAreaNode: Node | null = null;
    private _domPanelMessage = "";
    private _hudText = "";
    private _factoryMessage = "";
    private _factoryNoticeKind: "achievement" | "mail" | "friend" | "settings" | "" = "";
    private _selectedDomCatId = "";
    private _domCatTab: CatTabId = "info";
    private _domCatMessage = "";
    private _selectedEquipSlot: CatEquipmentSlotName = "项圈";
    private _selectedDomBuildingId = "building_cafe_1f";
    private _domShopTab: ShopTabId = "resource";
    private _domInventoryTab: InventoryTabId = "all";
    private _selectedResearchId = "res_basic_prod";
    private _serverFriends: FriendDto[] = [];
    private _friendActivities: FriendActivityDto[] = [];
    private _receivedFriendRequests: FriendRequestDto[] = [];
    private _sentFriendRequests: FriendRequestDto[] = [];
    private _friendSearchQuery = "";
    private _friendSearchPreview: FriendSearchResultDto | null = null;
    private _friendSearchMessage = "";
    private _serverLeaderboard: LeaderboardDto | null = null;
    private _selectedFriendSnapshotId = "";
    private _friendVisitSceneId = "";
    private _friendVisitReport: { friendId: string; kind: "visit" | "gift"; rewardText: string; statusText: string; updatedAt: number } | null = null;
    private _friendRefreshInFlight = false;
    private _friendActivityRefreshInFlight = false;
    private _friendRequestRefreshInFlight = false;
    private _friendRequestBadgeFetchedAt = 0;
    private _leaderboardRefreshInFlight = false;
    private _waitingForAppReady = false;
    private _launchInProgress = false;

    public selectFactory(): void {
        this.select("factory");
    }

    public selectCats(): void {
        this.select("cats");
    }

    public selectBuildings(): void {
        this.select("buildings");
    }

    public selectShop(): void {
        this.select("shop");
    }

    public selectInventory(): void {
        this.select("inventory");
    }

    public selectResearch(): void {
        this.select("research");
    }

    public selectTasks(): void {
        this.select("tasks");
    }

    protected start(): void {
        if (!SaveManager.isInitialized()) {
            this.waitForAppReady();
            return;
        }
        this.startReadyUi();
    }

    private waitForAppReady(): void {
        if (this._waitingForAppReady) return;
        this._waitingForAppReady = true;
        EventBus.on(GameEvents.APP_READY, this.onAppReady);
    }

    private onAppReady = (): void => {
        EventBus.off(GameEvents.APP_READY, this.onAppReady);
        this._waitingForAppReady = false;
        if (this.node?.isValid) {
            this.startReadyUi();
        }
    };

    private startReadyUi(): void {
        this.ensureReferences();
        this.prepareCatViewForRendering();
        this.bindNavButtons();
        this.bindDomHotspots();
        this.updateButtons();
        // Initialize state
        this.select(this.currentPanel);

        // Ensure navigation is on top of everything
        this.node.parent?.setSiblingIndex(999);
    }

    private prepareCatViewForRendering(): void {
        if (!this.catView) return;
        this.catView.active = true;
        this.catView.setPosition(20000, 0);
        if (this.node.parent) {
            this.node.parent.active = true;
        }
    }

    protected update(): void {
        if (!SaveManager.isInitialized()) {
            this.waitForAppReady();
            return;
        }
        this.node.setSiblingIndex(999);
        this.node.parent?.setSiblingIndex(999);
        this.layoutDomHotspots();
        this.layoutDomFactoryOverlay();
        this.layoutDomCatOverlay();
        this.layoutDomPanelOverlay();
        this.hideCocosTopBar();
        this.renderDomHudOverlay();
        this.renderDomNavOverlay();
    }

    protected onDestroy(): void {
        if (this._waitingForAppReady) {
            EventBus.off(GameEvents.APP_READY, this.onAppReady);
            this._waitingForAppReady = false;
        }
        for (const hotspot of this._domHotspots) {
            hotspot.remove();
        }
        this._domHotspots = [];
        this._domCatOverlay?.remove();
        this._domCatOverlay = null;
        this._domPanelOverlay?.remove();
        this._domPanelOverlay = null;
        this._domHudOverlay?.remove();
        this._domHudOverlay = null;
        this._domFactoryOverlay?.remove();
        this._domFactoryOverlay = null;
        this._domNavOverlay?.remove();
        this._domNavOverlay = null;
        if (this._domLayoutFrame && typeof cancelAnimationFrame !== "undefined") {
            cancelAnimationFrame(this._domLayoutFrame);
        }
    }

    private ensureReferences(): void {
        if (!this.factoryView) this.factoryView = find("FatCatMainGreyboxRoot/FactoryView");
        if (!this.catView) this.catView = find("FatCatMainGreyboxRoot/CatView");
        if (!this.buildingDetailPanel) this.buildingDetailPanel = find("FatCatMainGreyboxRoot/BuildingDetailPanel");
        if (!this._topBarNode) this._topBarNode = find("FatCatMainGreyboxRoot/TopBar");
        if (!this._bottomAreaNode) this._bottomAreaNode = find("FatCatMainGreyboxRoot/BottomArea");
        this.hideCocosTopBar();
        
        if (!this.shopPanel) this.shopPanel = find("FatCatMainGreyboxRoot/ShopPanel");
        if (!this.inventoryPanel) this.inventoryPanel = find("FatCatMainGreyboxRoot/InventoryPanel");
        if (!this.researchPanel) this.researchPanel = find("FatCatMainGreyboxRoot/ResearchPanel");
        if (!this.taskPanel) this.taskPanel = find("FatCatMainGreyboxRoot/TaskPanel");

        if (this.factoryActionButtons.length === 0) {
            const launchButton = find("FatCatMainGreyboxRoot/BottomArea/LaunchButton");
            const debugAddCoin = find("FatCatMainGreyboxRoot/BottomArea/DebugAddCoin");
            const debugSpendCoin = find("FatCatMainGreyboxRoot/BottomArea/DebugSpendCoin");
            this.factoryActionButtons = [launchButton, debugAddCoin, debugSpendCoin].filter((node): node is Node => !!node);
        }
    }

    private bindNavButtons(): void {
        for (let index = 0; index < this.navButtons.length; index++) {
            const node = this.navButtons[index];
            if (this._boundNavButtons.has(node)) continue;
            const lowerName = node.name.toLowerCase();
            const binding = MAIN_PANEL_BINDINGS.find(item => item.names.some(name => lowerName.includes(name.toLowerCase())));
            const panel = binding?.panel ?? ORDERED_MAIN_PANELS[index];
            if (!panel) continue;
            node.on(Node.EventType.TOUCH_END, () => this.select(panel), this);
            if (node.getComponent(Button)) {
                node.on(Button.EventType.CLICK, () => this.select(panel), this);
            }
            this._boundNavButtons.add(node);
        }
    }

    private bindDomHotspots(): void {
        if (typeof document === "undefined" || this._domHotspots.length > 0) {
            return;
        }

        const hotspots: Array<{ name: string; cx: number; cy: number; w: number; h: number; action: () => void }> = [
            { name: "tasks", cx: 0.055, cy: 0.20, w: 0.08, h: 0.08, action: () => this.select("tasks") },
            { name: "achievements", cx: 0.945, cy: 0.205, w: 0.08, h: 0.075, action: () => this.select("achievements") },
            { name: "mail", cx: 0.945, cy: 0.285, w: 0.08, h: 0.075, action: () => this.select("mail") },
            { name: "friends", cx: 0.945, cy: 0.365, w: 0.08, h: 0.075, action: () => this.select("friends") },
            { name: "settings", cx: 0.945, cy: 0.445, w: 0.08, h: 0.075, action: () => this.select("settings") },
            { name: "order", cx: 0.12, cy: 0.845, w: 0.16, h: 0.08, action: () => this.select("tasks") },
            { name: "claim chest", cx: 0.265, cy: 0.845, w: 0.12, h: 0.08, action: () => this.claimQuickReward() },
            { name: "launch", cx: 0.5, cy: 0.845, w: 0.26, h: 0.09, action: () => this.handleLaunch() },
            { name: "gift", cx: 0.80, cy: 0.845, w: 0.25, h: 0.08, action: () => this.select("shop") },
            { name: "factory", cx: 0.105, cy: 0.947, w: 0.135, h: 0.082, action: () => this.select("factory") },
            { name: "cats", cx: 0.257, cy: 0.947, w: 0.135, h: 0.082, action: () => this.select("cats") },
            { name: "buildings", cx: 0.407, cy: 0.947, w: 0.135, h: 0.082, action: () => this.select("buildings") },
            { name: "shop", cx: 0.555, cy: 0.947, w: 0.135, h: 0.082, action: () => this.select("shop") },
            { name: "inventory", cx: 0.704, cy: 0.947, w: 0.135, h: 0.082, action: () => this.select("inventory") },
            { name: "research", cx: 0.852, cy: 0.947, w: 0.135, h: 0.082, action: () => this.select("research") },
        ];

        for (const config of hotspots) {
            const hotspot = document.createElement("button");
            hotspot.type = "button";
            hotspot.title = config.name;
            hotspot.dataset.cx = String(config.cx);
            hotspot.dataset.cy = String(config.cy);
            hotspot.dataset.w = String(config.w);
            hotspot.dataset.h = String(config.h);
            Object.assign(hotspot.style, {
                position: "fixed",
                zIndex: "2147483050",
                padding: "0",
                margin: "0",
                border: "0",
                opacity: "0",
                background: "transparent",
                pointerEvents: "auto",
                cursor: "pointer",
                touchAction: "manipulation",
            });
            hotspot.addEventListener("pointerdown", (event) => {
                event.preventDefault();
                event.stopPropagation();
                config.action();
            });
            document.body.appendChild(hotspot);
            this._domHotspots.push(hotspot);
        }

        this.layoutDomHotspots();
    }

    private layoutDomHotspots(): void {
        if (typeof document === "undefined" || this._domHotspots.length === 0) return;

        const canvas = document.querySelector("canvas");
        if (!canvas) return;

        const rect = this.getVisibleCanvasRect(canvas.getBoundingClientRect());
        for (const hotspot of this._domHotspots) {
            const name = hotspot.title;
            const isMainNav = name === "factory" || name === "cats" || name === "buildings" || name === "shop" || name === "inventory" || name === "research";
            const isFactoryOnly = name === "tasks" || name === "achievements" || name === "mail" || name === "friends" || name === "settings" || name === "order" || name === "claim chest" || name === "launch" || name === "gift";
            const shouldShow = this.currentPanel === "cats"
                ? false
                : this.currentPanel === "factory"
                    ? true
                    : isMainNav && !isFactoryOnly;
            hotspot.style.display = shouldShow ? "block" : "none";
            if (!shouldShow) continue;

            const cx = Number(hotspot.dataset.cx);
            const cy = Number(hotspot.dataset.cy);
            const w = Number(hotspot.dataset.w);
            const h = Number(hotspot.dataset.h);
            const adjusted = this.getResponsiveHotspotRect(name, cx, cy, w, h, rect.width, rect.height);
            hotspot.style.left = `${rect.left + rect.width * (adjusted.cx - adjusted.w * 0.5)}px`;
            hotspot.style.top = `${rect.top + rect.height * (adjusted.cy - adjusted.h * 0.5)}px`;
            hotspot.style.width = `${rect.width * adjusted.w}px`;
            hotspot.style.height = `${rect.height * adjusted.h}px`;
        }
    }

    private getVisibleCanvasRect(rect: DOMRect): { left: number; top: number; width: number; height: number } {
        if (typeof window === "undefined") {
            return rect;
        }

        const left = Math.max(0, rect.left);
        const top = Math.max(0, rect.top);
        const right = Math.min(window.innerWidth, rect.left + rect.width);
        const bottom = Math.min(window.innerHeight, rect.top + rect.height);
        const width = Math.max(1, right - left);
        const height = Math.max(1, bottom - top);
        if (width < rect.width * 0.35 || height < rect.height * 0.35) {
            return rect;
        }
        return { left, top, width, height };
    }

    private getResponsiveHotspotRect(name: string, cx: number, cy: number, w: number, h: number, width: number, height: number): { cx: number; cy: number; w: number; h: number } {
        const aspect = width / Math.max(1, height);
        const compact = width < 520 || aspect < 0.58;
        if (!compact) return { cx, cy, w, h };

        const bottomNavNames = new Set(["factory", "cats", "buildings", "shop", "inventory", "research"]);
        if (bottomNavNames.has(name)) {
            return { cx, cy: 0.955, w: Math.min(0.145, w * 1.08), h: Math.min(0.072, h * 1.08) };
        }
        if (name === "launch") return { cx, cy: 0.873, w: Math.min(0.30, w * 1.12), h: Math.min(0.085, h) };
        if (name === "order") return { cx: 0.105, cy: 0.873, w: Math.min(0.18, w * 1.08), h: Math.min(0.082, h * 1.08) };
        if (name === "claim chest") return { cx, cy: 0.873, w, h: Math.min(0.082, h * 1.08) };
        if (name === "gift") return { cx: 0.805, cy: 0.873, w: Math.min(0.27, w * 1.04), h: Math.min(0.082, h * 1.08) };
        if (name === "tasks") return { cx: 0.052, cy: 0.205, w: Math.min(0.09, w * 1.1), h };
        if (name === "achievements" || name === "mail" || name === "friends" || name === "settings") {
            return { cx: 0.948, cy, w: Math.min(0.09, w * 1.1), h };
        }
        return { cx, cy, w, h };
    }

    private async handleLaunch(): Promise<void> {
        if (this._launchInProgress) {
            this._factoryMessage = "发射结算中，请稍候";
            this.renderDomFactoryOverlay();
            return;
        }
        this._launchInProgress = true;
        this._factoryNoticeKind = "";
        this._factoryMessage = NetworkManager.canUseServer ? "正在请求服务端结算预览..." : "";
        if (this._factoryMessage) {
            this.renderDomFactoryOverlay();
        }

        try {
            const serverLaunch = NetworkManager.canUseServer ? await SyncManager.launch(10) : null;
            if (serverLaunch?.accepted && serverLaunch.coinGained > 0) {
                ResourceManager.applyServerSnapshot({
                    coin: serverLaunch.coinBalance,
                    bean: serverLaunch.beanBalance,
                    catFood: serverLaunch.catFoodBalance,
                    diamond: serverLaunch.diamondBalance,
                    researchPoint: serverLaunch.researchPointBalance,
                }, "server_launch");
                this._factoryMessage = `服务端发射完成：+${this.formatNumber(serverLaunch.coinGained)} 金币，-${this.formatNumber(serverLaunch.beanSpent)} 咖啡豆，净收益 ${this.formatRate(serverLaunch.netCoinPerSecond)}/秒`;
            } else if (serverLaunch && !serverLaunch.accepted) {
                this._factoryMessage = `服务端发射被拒绝：${serverLaunch.rejectedReason ?? "launch_rejected"}`;
            } else {
                const payload = ProductionManager.settle(10, "manual_launch");
                if (payload.coinGained > 0) {
                    const serverText = NetworkManager.canUseServer ? "，服务端发射失败，已按本地结算" : "";
                    this._factoryMessage = `发射完成：+${this.formatNumber(payload.coinGained)} 金币，-${this.formatNumber(payload.beanSpent)} 咖啡豆${serverText}`;
                } else {
                    this._factoryMessage = "咖啡豆不足，生产暂停";
                }
            }
        } finally {
            this._launchInProgress = false;
        }
        this.renderDomHudOverlay(true);
        this.renderDomFactoryOverlay();
    }

    private showFactoryNotice(message: string, kind: "achievement" | "mail" | "friend" | "settings" | "" = ""): void {
        this._factoryMessage = message;
        this._factoryNoticeKind = kind;
        this.renderDomFactoryOverlay();
    }

    private claimQuickReward(): void {
        this._factoryNoticeKind = "";
        const claimable = TaskManager.getActiveTasks().find(({ config, data }) => (
            data.currentValue >= config.goalValue && !data.isClaimed
        ));

        if (claimable) {
            const ok = TaskManager.claimReward(claimable.config.id);
            this._factoryMessage = ok ? `领取成功：${claimable.config.name}` : "暂时没有可领取奖励";
        } else {
            ResourceManager.add({ coin: 1000, researchPoint: 10 }, "quick_chest_reward");
            this._factoryMessage = "宝箱奖励：+1000 金币，+10 研究点";
        }

        this.renderDomHudOverlay(true);
        this.renderDomFactoryOverlay();
    }

    private hideCocosTopBar(): void {
        if (this._topBarNode) {
            this._topBarNode.active = false;
        }
        if (this._bottomAreaNode) {
            this._bottomAreaNode.active = false;
        }
    }

    public select(panelId: MainPanelId): void {
        this.ensureReferences();
        if (this.currentPanel !== panelId) {
            this._domPanelMessage = "";
        }
        this.currentPanel = panelId;
        EventBus.emit(MainPanelEvents.NAV_CHANGED, panelId);
        
        // Direct UI toggle
        if (this.factoryView) this.factoryView.active = (panelId === "factory");
        if (this.catView) {
            this.catView.active = true;
            this.catView.setPosition(panelId === "cats" ? 0 : 20000, 0);
        }
        this.setCatOverlayVisible(panelId === "cats");
        this.setDomCatOverlayVisible(panelId === "cats");
        this.setDomFactoryOverlayVisible(panelId === "factory");
        this.setDomPanelOverlay(panelId);
        if (this.shopPanel) this.shopPanel.active = (panelId === "shop");
        if (this.inventoryPanel) this.inventoryPanel.active = (panelId === "inventory");
        if (this.researchPanel) this.researchPanel.active = (panelId === "research");
        if (this.taskPanel) this.taskPanel.active = (panelId === "tasks");
        this.syncPanelLayer(panelId);

        // Close any detail panels when switching main tabs
        if (this.buildingDetailPanel) this.buildingDetailPanel.active = false;
        // CatDetailPanel is usually a child of CatView, so it hides with it.
        for (const button of this.factoryActionButtons) {
            button.active = panelId === "factory";
        }
        for (const button of this.navButtons) {
            if (button?.isValid) button.active = panelId !== "cats";
        }

        console.info("[BottomNavUI] Selected panel", panelId);
        this.renderDomHudOverlay(true);
        this.renderDomNavOverlay(true);
        this.layoutDomHotspots();
        this.updateButtons();
    }

    private syncPanelLayer(panelId: MainPanelId): void {
        const root = this.node.parent?.parent;
        if (!root) return;

        if (panelId === "cats" && this.catView) {
            this.catView.active = true;
            this.catView.setPosition(0, 0);
            this.catView.setSiblingIndex(root.children.length - 1);
            this.catView.getComponent(CatView)?.showView();
            this.setCatOverlayVisible(true);
            this.setDomCatOverlayVisible(true);
            this.setDomFactoryOverlayVisible(false);
            this.setDomPanelOverlay(panelId);
            return;
        }

        if (panelId === "factory" && this.factoryView) {
            this.setCatOverlayVisible(false);
            this.setDomCatOverlayVisible(false);
            this.setDomFactoryOverlayVisible(true);
            this.setDomPanelOverlay(panelId);
            if (this.node.parent) {
                this.node.parent.active = true;
            }
            this.factoryView.setSiblingIndex(Math.max(0, root.children.length - 2));
        }
    }

    private setDomPanelOverlay(panelId: MainPanelId): void {
        if (typeof document === "undefined") return;
        const visible = panelId === "buildings" || panelId === "shop" || panelId === "inventory" || panelId === "research" || panelId === "tasks" || panelId === "achievements" || panelId === "mail" || panelId === "friends" || panelId === "settings";
        const overlay = this.ensureDomPanelOverlay();
        if (!overlay) return;

        overlay.style.display = visible ? "block" : "none";
        if (visible) {
            this.renderDomPanel(panelId);
            if (panelId === "friends") {
                void this.refreshServerFriendsForPanel();
                void this.refreshFriendRequestsForPanel();
                void this.refreshFriendActivitiesForPanel();
                void this.refreshServerLeaderboardForPanel();
            }
            this.layoutDomPanelOverlay();
        }
    }

    private setDomFactoryOverlayVisible(visible: boolean): void {
        if (typeof document === "undefined") return;
        const overlay = this.ensureDomFactoryOverlay();
        if (!overlay) return;

        overlay.style.display = visible ? "block" : "none";
        if (visible) {
            this.renderDomFactoryOverlay();
            this.layoutDomFactoryOverlay();
        }
    }

    private ensureDomFactoryOverlay(): HTMLElement | null {
        if (typeof document === "undefined") return null;
        if (this._domFactoryOverlay) return this._domFactoryOverlay;

        const overlay = document.createElement("div");
        overlay.id = "fatcat-dom-factory";
        overlay.style.display = "none";
        const style = document.createElement("style");
        style.textContent = getDomFactoryStyles(this.getDomAssetDataUri(GeneratedBackgroundAssets.factoryCutaway));
        document.head.appendChild(style);
        overlay.addEventListener("pointerdown", this.onDomFactoryPointerDown);
        document.body.appendChild(overlay);
        this._domFactoryOverlay = overlay;
        return overlay;
    }

    private onDomFactoryPointerDown = (event: PointerEvent): void => {
        const target = event.target as HTMLElement | null;
        const button = target?.closest("[data-action]") as HTMLElement | null;
        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        const action = button.dataset.action || "";
        if (action === "tasks") {
            this.select("tasks");
        } else if (action === "achievement") {
            this.select("achievements");
        } else if (action === "mail") {
            this.select("mail");
        } else if (action === "friend") {
            this.select("friends");
        } else if (action === "settings") {
            this.select("settings");
        } else if (action === "order") {
            this.select("tasks");
        } else if (action === "claim") {
            this.claimQuickReward();
        } else if (action === "launch") {
            this.handleLaunch();
            this.renderDomFactoryOverlay();
        } else if (action === "gift") {
            this.select("shop");
        }

        this.renderDomHudOverlay(true);
        this.renderDomNavOverlay(true);
        this.layoutDomHotspots();
    };

    private renderDomFactoryOverlay(): void {
        const overlay = this.ensureDomFactoryOverlay();
        if (!overlay) return;
        const snapshot = ProductionManager.calculateSnapshot();
        void this.refreshFriendRequestBadgeForFactory();
        const pendingFriendRequests = this.getPendingFriendRequestCount();
        const floors = MAIN_FACTORY_FLOORS.map(floor => ({
            ...floor,
            lv: BuildingManager.getLevel(floor.buildingId),
        }));
        overlay.innerHTML = `
            <div class="art-bg"></div><div class="sky"></div><div class="town"></div><div class="factory-illustration"></div><div class="roof-crates"></div><div class="roof-deck"></div>
            <div class="sign">肥猫咖啡<span class="paw-mark"></span></div><div class="sign-posts"></div><div class="chimney"></div><div class="roof-cat"><div class="cat-sprite"><i class="cat-face"></i></div></div><div class="flag">爪</div>
            <div class="side-pipe left"></div><div class="side-pipe right"></div><div class="ladder"></div><div class="elevator-panel"><i class="elevator-paw"></i><i class="elevator-floor-indicator"></i><div class="elevator-car"></div></div>
            <div class="building">
                ${floors.map((floor, index) => `
                    <div class="floor floor-scene-${floor.scene}">
                        <div class="floor-glow"></div><div class="room-lights"></div><div class="wall-details">${this.renderFactoryWallDetails(floor.scene)}</div><div class="room-decor decor-${floor.scene}">${this.renderFactoryRoomDecor(floor.scene)}</div><div class="room-foreground ${floor.scene}"></div>
                        <div class="props">${this.renderFactoryProps(floor.scene)}</div><div class="prop-asset prop-${floor.scene}" style="background-image:url('${this.getFactoryPropDataUri(floor.scene)}')"></div>
                        <div class="pipe"></div>
                        <div class="cat cat-${floor.scene} ${index % 3 === 0 ? "a" : index % 3 === 1 ? "b" : "c"}"><div class="cat-sprite"><i class="cat-face"></i></div></div>
                        <div class="worker-cats ${floor.scene}">${this.renderFactoryWorkerCats(floor.scene)}</div>
                        <div class="floor-card"><div class="floor-no">${floor.no}</div><div class="floor-name">${floor.name}<span>Lv.${floor.lv}</span></div><div class="floor-medal">${floor.lv}</div></div>
                        <div class="cat-dots"><span class="cat-dot"></span><span class="cat-dot gray"></span><span class="cat-dot black"></span></div>
                        <div class="bonus"><i class="bonus-icon ${this.getFloorBonusIconClass(floor.scene)}"></i><strong>${this.getFloorOutputText(floor.scene)}</strong><span>${floor.bonus}</span><b>${floor.value}</b></div>
                    </div>`).join("")}
            </div>
            <div class="left-tools"><button class="side-btn alert" data-action="tasks"><i class="ico-task asset" style="background-image:url('${this.getFeatureIconAsset("task")}')"></i>任务</button></div>
            <div class="right-tools"><button class="side-btn alert" data-action="achievement"><i class="ico-trophy asset" style="background-image:url('${this.getFeatureIconAsset("achievement")}')"></i>成就</button><button class="side-btn alert" data-action="mail"><i class="ico-mail asset" style="background-image:url('${this.getFeatureIconAsset("mail")}')"></i>邮件</button><button class="side-btn" data-action="friend"><i class="ico-friend asset" style="background-image:url('${this.getFeatureIconAsset("friend")}')"></i>好友</button><button class="side-btn" data-action="settings"><i class="ico-gear asset" style="background-image:url('${this.getFeatureIconAsset("settings")}')"></i>设置</button></div>
            <div class="bottom-widgets">
                <button class="order" data-action="order"><span class="order-icon"></span><span class="order-text">今日订单<b>56/60</b></span><span class="bar"><i></i></span></button>
                <button class="chest" data-action="claim"><span class="chest-art" style="background-image:url('${this.getFeatureIconAsset("rewardChest")}')"></span>可领取</button>
                <button class="launch" data-action="launch"><span class="rocket-shape asset" style="background-image:url('${this.getFeatureIconAsset("launch")}')"></span>发射猫咪</button>
                <button class="gift" data-action="gift"><span class="gift-cat asset" style="background-image:url('${this.getCatFullArtAsset("c_005")}')"></span><span><b>超级猫粮礼包</b><br><em>03:25:15</em></span></button>
            </div>
            <div class="launch-count">今日剩余次数：5/5</div>
            ${this._factoryMessage ? `<div class="factory-msg">${this._factoryMessage}</div>` : ""}
            ${this.renderFactoryNoticeCard()}
            ${!snapshot.canProduce ? `<div class="factory-msg" style="top:13%;left:31%;width:38%">咖啡豆不足，生产暂停</div>` : ""}
        `;
        overlay.querySelectorAll<HTMLElement>(".side-btn.alert").forEach(button => {
            if (!button.dataset.badge) button.dataset.badge = "!";
        });
        const friendButton = overlay.querySelector<HTMLElement>('.side-btn[data-action="friend"]');
        if (friendButton && pendingFriendRequests > 0) {
            friendButton.classList.add("alert");
            friendButton.dataset.badge = String(Math.min(99, pendingFriendRequests));
        }
    }

    private renderFactoryNoticeCard(): string {
        if (!this._factoryNoticeKind) return "";
        const pendingFriendRequests = this.getPendingFriendRequestCount();
        const sentFriendRequests = this._sentFriendRequests.filter(request => request.status === "pending").length;
        const data = {
            achievement: {
                title: "成就",
                icon: "achievement",
                rows: [["今日目标", "2/5"], ["可领取", `${this.getClaimableTaskCount()}`], ["总进度", "28%"]],
            },
            mail: {
                title: "邮件",
                icon: "mail",
                rows: [["系统公告", "已读"], ["奖励邮件", "0"], ["好友消息", "0"]],
            },
            friend: {
                title: "好友",
                icon: "friend",
                rows: [["咖啡互助", "未开放"], ["拜访次数", "0/5"], ["礼物", "待接入"]],
            },
            settings: {
                title: "设置",
                icon: "settings",
                rows: [["音乐", "开"], ["音效", "开"], ["画质", "推荐"]],
            },
        }[this._factoryNoticeKind];
        if (this._factoryNoticeKind === "friend") {
            data.title = "好友";
            data.rows = [["待处理申请", `${pendingFriendRequests}`], ["已发送申请", `${sentFriendRequests}`], ["好友互动", "访问/送礼"]];
        }
        return `<div class="notice-card"><div class="notice-head"><i class="notice-icon asset ${data.icon}" style="background-image:url('${this.getFeatureIconAsset(data.icon)}')"></i><div><b>${data.title}</b><br>${this._factoryMessage}</div></div>${data.rows.map(row => `<div class="notice-row"><span>${row[0]}</span><span>${row[1]}</span></div>`).join("")}</div>`;
    }

    private getFeatureIconAsset(kind: string): string {
        return getFeatureIconAsset(kind);
    }

    private getFactoryPropDataUri(scene: string): string {
        return getFactoryPropDataUri(scene);
    }

    private getDomAssetDataUri(assetPath: string): string {
        return getDomAssetDataUri(assetPath);
    }

    private renderFactoryProps(scene: string): string {
        return renderFactoryPropsMarkup(scene);
    }

    private renderFactoryRoomDecor(scene: string): string {
        return renderFactoryRoomDecorMarkup(scene);
    }

    private renderFactoryWallDetails(scene: string): string {
        return renderFactoryWallDetailsMarkup(scene);
    }

    private renderFactoryWorkerCats(scene: string): string {
        return renderFactoryWorkerCatsMarkup(scene);
    }

    private getFloorOutputText(scene: string): string {
        const snapshot = ProductionManager.calculateSnapshot();
        if (scene === "storage") return this.formatNumber(ResourceManager.get("bean"));
        if (scene === "tank") return `${this.formatNumber(Math.max(1, snapshot.beanCostPerSecond))}/秒`;
        if (scene === "office") return `+${Math.max(5, Math.floor(snapshot.coinPerSecond / 1000))}%`;
        if (scene === "cafe") return `${this.formatNumber(Math.max(1, snapshot.coinPerSecond))}/秒`;
        if (scene === "mill") return `${this.formatNumber(Math.max(1, snapshot.coinPerSecond * 0.25))}/秒`;
        return `${this.formatNumber(Math.max(1, snapshot.coinPerSecond * 0.12))}/秒`;
    }

    private getFloorBonusIconClass(scene: string): string {
        return getFactoryFloorBonusIconClass(scene);
    }

    private layoutDomFactoryOverlay(): void {
        if (typeof document === "undefined" || !this._domFactoryOverlay) return;
        const canvas = document.querySelector("canvas");
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        this.applyResponsiveOverlayBounds(this._domFactoryOverlay, rect);
    }

    private applyResponsiveOverlayBounds(element: HTMLElement, sourceRect: DOMRect, inset = { left: 0, top: 0, width: 1, height: 1 }): void {
        const rect = this.getVisibleCanvasRect(sourceRect);
        const width = rect.width * inset.width;
        const height = rect.height * inset.height;
        element.style.left = `${rect.left + rect.width * inset.left}px`;
        element.style.top = `${rect.top + rect.height * inset.top}px`;
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        element.style.fontSize = `${this.getResponsiveFontBase(width, height)}px`;
        this.applyResponsiveClasses(element, width, height);
    }

    private getResponsiveFontBase(width: number, height: number): number {
        const designHeightFromWidth = width * (16 / 9);
        return Math.max(480, Math.min(height, designHeightFromWidth));
    }

    private applyResponsiveClasses(element: HTMLElement, width: number, height: number): void {
        const aspect = width / Math.max(1, height);
        element.classList.toggle("compact", width < 520 || aspect < 0.58);
        element.classList.toggle("tall", aspect < 0.56);
        element.classList.toggle("tablet", width >= 600);
        element.classList.toggle("wide", aspect > 0.68);
    }

    private ensureDomPanelOverlay(): HTMLElement | null {
        if (typeof document === "undefined") return null;
        if (this._domPanelOverlay) return this._domPanelOverlay;

        const overlay = document.createElement("div");
        overlay.id = "fatcat-dom-panel-overlay";
        overlay.style.display = "none";
        const style = document.createElement("style");
        style.textContent = DOM_PANEL_STYLES;
        document.head.appendChild(style);
        overlay.addEventListener("pointerdown", this.onDomPanelPointerDown);
        document.body.appendChild(overlay);
        this._domPanelOverlay = overlay;
        return overlay;
    }

    private onDomPanelPointerDown = async (event: PointerEvent): Promise<void> => {
        const target = event.target as HTMLElement | null;
        const button = target?.closest("button[data-action]") as HTMLButtonElement | null;
        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        const action = button.dataset.action;
        const id = button.dataset.id || "";
        let success = false;
        let actionMessageOverride = "";
        if (action === "panelClose") {
            this.select("factory");
            return;
        }
        if (action === "buy") {
            const serverPurchase = NetworkManager.canUseServer && NetworkManager.playerId
                ? await SyncManager.purchaseServerShopItem(id, 1)
                : null;
            success = serverPurchase ? ShopManager.fulfillServerPurchase(id, serverPurchase.count, serverPurchase.remainingDaily) : ShopManager.buyItem(id);
        } else if (action === "use") {
            success = InventoryManager.useItem(id);
        } else if (action === "research") {
            const serverResearch = NetworkManager.canUseServer
                ? await SyncManager.unlockServerResearch(id)
                : null;
            if (serverResearch) {
                this._domPanelMessage = `Research synced: ${serverResearch.researchId}, -${this.formatNumber(serverResearch.researchPointSpent)} research.`;
                success = true;
            } else {
                success = NetworkManager.canUseServer ? false : ResearchManager.unlock(id);
            }
        } else if (action === "upgradeBuilding") {
            const serverUpgrade = NetworkManager.canUseServer
                ? await SyncManager.upgradeServerBuilding(id)
                : null;
            if (serverUpgrade) {
                this._domPanelMessage = `建筑同步升级：${serverUpgrade.buildingId} Lv.${serverUpgrade.previousLevel} -> Lv.${serverUpgrade.level}，-${this.formatNumber(serverUpgrade.coinSpent)} 金币。`;
                success = true;
            } else {
                success = NetworkManager.canUseServer ? false : BuildingManager.upgrade(id);
            }
        } else if (action === "claimTask") {
            success = TaskManager.claimReward(id);
        } else if (action === "claimMail") {
            const serverClaim = NetworkManager.canUseServer && NetworkManager.playerId
                ? await SyncManager.claimServerMail(id)
                : null;
            success = !!serverClaim || !this.isLocalMailClaimed(id);
            if (success) {
                SaveManager.update(data => {
                    data.featureState.claimedMails[id] = true;
                });
                if (!serverClaim) {
                    ResourceManager.add({ coin: 2500, catFood: 20 }, `mail_claim_${id || "local"}`);
                }
            }
        } else if (action === "openFriendRequests") {
            this.select("friends");
            return;
        } else if (action === "openFriendVisitScene") {
            this._selectedFriendSnapshotId = id;
            this._friendVisitSceneId = id;
            success = true;
        } else if (action === "closeFriendVisitScene") {
            this._friendVisitSceneId = "";
            success = true;
        } else if (action === "closeFriendVisitReport") {
            this._friendVisitReport = null;
            success = true;
        } else if (action === "visitFriend") {
            this._selectedFriendSnapshotId = id;
            this._friendVisitSceneId = id;
            const serverFriend = NetworkManager.canUseServer
                ? await SyncManager.visitServerFriend(id)
                : null;
            if (serverFriend) {
                this.applyServerFriendSnapshot(serverFriend.friend);
                this._friendVisitReport = {
                    friendId: id,
                    kind: "visit",
                    rewardText: serverFriend.rewarded ? `+${this.formatNumber(serverFriend.rewardCoin)} 金币` : "今日已领取",
                    statusText: serverFriend.rewarded ? "访问奖励已到账" : "今日访问奖励已领取",
                    updatedAt: Date.now(),
                };
                this._domPanelMessage = serverFriend.rewarded
                    ? `Friend visit reward: +${this.formatNumber(serverFriend.rewardCoin)} coin.`
                    : "Friend visit synced: daily reward already claimed.";
                void this.refreshFriendActivitiesForPanel();
                success = true;
            } else if (!NetworkManager.canUseServer) {
                SaveManager.update(data => {
                    data.featureState.friendVisits[id] = Date.now();
                });
                this._friendVisitReport = {
                    friendId: id,
                    kind: "visit",
                    rewardText: "+62 金币",
                    statusText: "本地访问预览已记录",
                    updatedAt: Date.now(),
                };
                success = true;
            }
        } else if (action === "sendFriendGift") {
            this._selectedFriendSnapshotId = id;
            this._friendVisitSceneId = id;
            const serverFriend = NetworkManager.canUseServer
                ? await SyncManager.sendServerFriendGift(id)
                : null;
            if (serverFriend) {
                this.applyServerFriendSnapshot(serverFriend.friend);
                this._friendVisitReport = {
                    friendId: id,
                    kind: "gift",
                    rewardText: serverFriend.rewarded ? `+${this.formatNumber(serverFriend.rewardCatFood)} 猫粮` : "今日已送礼",
                    statusText: serverFriend.rewarded ? "礼物回赠已到账" : "今日礼物奖励已领取",
                    updatedAt: Date.now(),
                };
                this._domPanelMessage = serverFriend.rewarded
                    ? `Friend gift reward: +${this.formatNumber(serverFriend.rewardCatFood)} cat food.`
                    : "Friend gift synced: daily reward already claimed.";
                void this.refreshFriendActivitiesForPanel();
                success = true;
            } else if (!NetworkManager.canUseServer) {
                SaveManager.update(data => {
                    data.featureState.friendGifts[id] = Date.now();
                });
                this._friendVisitReport = {
                    friendId: id,
                    kind: "gift",
                    rewardText: "+12 猫粮",
                    statusText: "本地送礼预览已记录",
                    updatedAt: Date.now(),
                };
                success = true;
            }
        } else if (action === "addFriend") {
            const friendPlayerId = typeof window !== "undefined"
                ? window.prompt("输入对方玩家 ID")
                : "";
            const preview = friendPlayerId
                ? await SyncManager.searchServerFriend(friendPlayerId.trim())
                : null;
            const confirmed = preview && !preview.isSelf && !preview.isFriend
                ? (typeof window === "undefined" || window.confirm(`Add ${preview.companyName} Lv.${preview.level} (${this.formatNumber(preview.incomePerSecond)}/sec)?`))
                : false;
            const serverFriend = confirmed && friendPlayerId
                ? await SyncManager.addServerFriend(friendPlayerId.trim())
                : null;
            if (serverFriend) {
                this.applyServerFriendSnapshot(serverFriend);
                this._domPanelMessage = `Friend added: ${serverFriend.name}.`;
                void this.refreshFriendActivitiesForPanel();
                void this.refreshServerLeaderboardForPanel();
                success = true;
            } else {
                this._domPanelMessage = this.getFriendSearchFailureMessage(preview);
            }
        } else if (action === "sendFriendRequest") {
            const friendPlayerId = typeof window !== "undefined"
                ? window.prompt("输入好友邀请码或玩家ID")
                : "";
            const preview = friendPlayerId
                ? await SyncManager.searchServerFriend(friendPlayerId.trim())
                : null;
            const confirmed = preview && !preview.isSelf && !preview.isFriend
                ? (typeof window === "undefined" || window.confirm(`向 ${preview.companyName} Lv.${preview.level} 发送好友申请？`))
                : false;
            const request = confirmed && friendPlayerId
                ? await SyncManager.createServerFriendRequest(friendPlayerId.trim())
                : null;
            if (request) {
                this._domPanelMessage = request.status === "accepted"
                    ? `${request.companyName} 已成为好友。`
                    : `好友申请已发送给 ${request.companyName}。`;
                await this.refreshFriendRequestsForPanel();
                void this.refreshServerFriendsForPanel();
                void this.refreshFriendActivitiesForPanel();
                void this.refreshServerLeaderboardForPanel();
                success = true;
            } else {
                this._domPanelMessage = this.getFriendSearchFailureMessage(preview);
            }
        } else if (action === "searchFriendInline") {
            const input = this._domPanelOverlay?.querySelector<HTMLInputElement>('[data-field="friendSearch"]');
            const query = (input?.value ?? "").trim();
            this._friendSearchQuery = query;
            this._friendSearchPreview = query ? await SyncManager.searchServerFriend(query) : null;
            this._friendSearchMessage = this._friendSearchPreview
                ? `${this._friendSearchPreview.companyName} Lv.${this._friendSearchPreview.level} · ${this.formatNumber(this._friendSearchPreview.incomePerSecond)}/秒`
                : (query ? "未找到玩家，请检查邀请码或玩家ID。" : "请输入邀请码或玩家ID。");
            actionMessageOverride = this._friendSearchMessage;
            success = !!this._friendSearchPreview;
        } else if (action === "sendFriendRequestInline") {
            const input = this._domPanelOverlay?.querySelector<HTMLInputElement>('[data-field="friendSearch"]');
            const query = (this._friendSearchQuery || input?.value || "").trim();
            const request = query ? await SyncManager.createServerFriendRequest(query) : null;
            if (request) {
                this._friendSearchPreview = null;
                this._friendSearchMessage = request.status === "accepted"
                    ? `${request.companyName} 已成为好友。`
                    : `好友申请已发送给 ${request.companyName}。`;
                actionMessageOverride = this._friendSearchMessage;
                await this.refreshFriendRequestsForPanel();
                void this.refreshServerFriendsForPanel();
                void this.refreshFriendActivitiesForPanel();
                void this.refreshServerLeaderboardForPanel();
                success = true;
            } else {
                this._friendSearchMessage = "发送好友申请失败，请先搜索一个可添加玩家。";
                actionMessageOverride = this._friendSearchMessage;
            }
        } else if (action === "acceptFriendRequest") {
            const request = await SyncManager.acceptServerFriendRequest(id);
            if (request) {
                this._domPanelMessage = `已接受 ${request.companyName} 的好友申请。`;
                await this.refreshFriendRequestsForPanel();
                void this.refreshServerFriendsForPanel();
                void this.refreshFriendActivitiesForPanel();
                void this.refreshServerLeaderboardForPanel();
                success = true;
            } else {
                this._domPanelMessage = "接受好友申请失败，请稍后重试。";
            }
        } else if (action === "rejectFriendRequest") {
            const request = await SyncManager.rejectServerFriendRequest(id);
            if (request) {
                this._domPanelMessage = `已拒绝 ${request.companyName} 的好友申请。`;
                await this.refreshFriendRequestsForPanel();
                success = true;
            } else {
                this._domPanelMessage = "拒绝好友申请失败，请稍后重试。";
            }
        } else if (action === "toggleSetting") {
            SaveManager.update(data => {
                const current = data.featureState.settings[id] ?? this.getDefaultSettingValue(id);
                data.featureState.settings[id] = !current;
            });
            success = true;
        } else if (action === "connectServer") {
            success = await SyncManager.tryGuestLogin();
        } else if (action === "syncSave") {
            success = await SyncManager.syncSave();
        } else if (action === "pushSettings") {
            success = !!await SyncManager.pushServerSettings(this.ensureFeatureState().settings);
        } else if (action === "previewProduction") {
            const preview = await SyncManager.previewProduction();
            success = !!preview;
            if (preview) {
                this._domPanelMessage = `服务端结算预览：净收益 ${this.formatRate(preview.netCoinPerSecond)} 金币/秒，工资 ${this.formatRate(preview.wageCostPerSecond)} 金币/秒。`;
            }
        } else if (action === "selectBuilding") {
            this._selectedDomBuildingId = id;
            success = true;
        } else if (action === "assignCat") {
            const buildingId = button.dataset.building || this._selectedDomBuildingId;
            const building = BuildingManager.getById(buildingId);
            const alreadyHere = CatManager.getAssignedBuildingId(id) === buildingId;
            const hasRoom = alreadyHere || !building || building.assignedCatCount < building.scheduleCapacity;
            if (hasRoom && NetworkManager.canUseServer) {
                success = !!await SyncManager.assignServerCat(id, buildingId);
                if (!success) {
                    actionMessageOverride = "派遣失败：服务器拒绝排班，可能楼层已满或猫咪未解锁。";
                }
            } else {
                success = hasRoom && CatManager.assignCatToBuilding(id, buildingId);
                if (!success && !hasRoom) {
                    actionMessageOverride = "派遣失败：当前楼层岗位已满。";
                }
            }
        } else if (action === "unassignCat") {
            if (NetworkManager.canUseServer) {
                success = !!await SyncManager.assignServerCat(id, "");
                if (!success) {
                    actionMessageOverride = "撤下失败：服务器拒绝排班变更，请确认猫咪已招募。";
                }
            } else {
                success = CatManager.unassignCat(id);
            }
        } else if (action === "shopTab") {
            const tab = button.dataset.tab as "resource" | "item" | "cat" | "deco" | undefined;
            if (tab) {
                this._domShopTab = tab;
                success = true;
            }
        } else if (action === "inventoryTab") {
            const tab = button.dataset.tab as "all" | "resource" | "shard" | "other" | undefined;
            if (tab) {
                this._domInventoryTab = tab;
                success = true;
            }
        } else if (action === "selectResearch") {
            this._selectedResearchId = id;
            success = !!ResearchManager.getAllConfigs().find(item => item.id === id);
        }

        if (action !== "previewProduction" || !success) {
            this._domPanelMessage = actionMessageOverride || this.getDomActionMessage(action ?? "", success);
        }
        console.info(`[BottomNavUI] ${action} ${id}: ${success ? "success" : "failed"}`);
        this.renderDomPanel(this.currentPanel);
    };

    private renderDomPanel(panelId: MainPanelId): void {
        const overlay = this.ensureDomPanelOverlay();
        if (!overlay) return;

        const content: Partial<Record<MainPanelId, string>> = {
            buildings: this.renderBuildingPanel(),
            shop: this.renderShopPanel(),
            inventory: this.renderInventoryPanel(),
            research: this.renderResearchPanel(),
            tasks: this.renderTaskPanel(),
            achievements: this.renderAchievementPanel(),
            mail: this.renderMailPanel(),
            friends: this.renderFriendPanel(),
            settings: this.renderSettingsPanel(),
        };
        const body = content[panelId] ?? "";
        overlay.innerHTML = `${body ? `<button class="panel-close" data-action="panelClose">×</button>` : ""}${body}${this.renderDomMessage()}`;
    }

    private renderDomMessage(): string {
        return this._domPanelMessage ? `<div class="message">${this._domPanelMessage}</div>` : `<div class="message"></div>`;
    }

    private getDomActionMessage(action: string, success: boolean): string {
        if (success) {
            if (action === "buy") return "购买成功，物品已放入背包。";
            if (action === "use") return "使用成功，资源已到账。";
            if (action === "research") return this._domPanelMessage || "研究完成，效果已生效。";
            if (action === "upgradeBuilding") return this._domPanelMessage || "升级成功，建筑等级已提升。";
            if (action === "claimTask") return "任务奖励已领取。";
            if (action === "claimMail") return "邮件奖励已领取：+2500 金币，+20 猫粮。";
            if (action === "visitFriend") return "已打开好友工厂快照，联网后会显示真实工厂。";
            if (action === "sendFriendGift") return "已为好友预留一份猫粮礼物，联网后会同步。";
            if (action === "openFriendVisitScene") return "好友访问场景已展开。";
            if (action === "closeFriendVisitScene") return "好友访问场景已收起。";
            if (action === "closeFriendVisitReport") return "好友访问报告已收起。";
            if (action === "toggleSetting") return "设置已在本地预览中切换，后续会写入账号配置。";
            if (action === "connectServer") return "游客账号已连接服务器。";
            if (action === "syncSave") return "本地存档已同步到服务器。";
            if (action === "pushSettings") return "设置已推送到服务器。";
            if (action === "previewProduction") return "服务端结算预览已完成。";
            if (action === "selectBuilding") return "楼层详情已切换。";
            if (action === "assignCat") return "猫咪已派遣到当前楼层。";
            if (action === "unassignCat") return "猫咪已撤下，等待重新排班。";
            if (action === "shopTab") return "商店分类已切换。";
            if (action === "inventoryTab") return "背包分类已切换。";
            if (action === "selectResearch") return "研究详情已切换。";
        }
        if (action === "buy") return "购买失败：余额不足或今日限购已用完。";
        if (action === "use") return "使用失败：物品数量不足。";
        if (action === "research") return "研究失败：研究点不足或前置未解锁。";
        if (action === "upgradeBuilding") return "升级失败：金币不足或已达最高等级。";
        if (action === "claimTask") return "任务未完成或奖励已领取。";
        if (action === "claimMail") return "邮件奖励领取失败。";
        if (action === "connectServer") return "连接服务器失败：请检查 apiBaseUrl 或本地服务端。";
        if (action === "syncSave") return "同步失败：尚未连接服务器或服务端拒绝。";
        if (action === "pushSettings") return "设置推送失败：尚未连接服务器。";
        if (action === "previewProduction") return "结算预览失败：请先连接服务器。";
        if (action === "assignCat") return "派遣失败：猫咪未招募或楼层容量不足。";
        if (action === "unassignCat") return "撤下失败：猫咪未招募。";
        if (action === "selectResearch") return "研究节点不存在。";
        return "操作未完成。";
    }

    private renderAchievementPanel(): string {
        const tasks = TaskManager.getActiveTasks();
        const achievements = tasks.filter(({ config }) => config.type === TaskType.ACHIEVEMENT);
        const unlockedCats = CatManager.getAllConfigs().filter(config => CatManager.getCatData(config.id).isUnlocked).length;
        const totalCats = CatManager.getAllConfigs().length;
        const totalTasks = tasks.length;
        const claimable = tasks.filter(({ config, data }) => data.currentValue >= config.goalValue && !data.isClaimed).length;
        const rows = achievements.length > 0
            ? achievements.map(({ config, data }) => this.renderFeatureProgressCard(
                "achievement",
                config.name,
                config.description,
                data.currentValue,
                config.goalValue,
                this.formatTaskReward(config.rewards),
                data.currentValue >= config.goalValue && !data.isClaimed ? `<button class="tag" data-action="claimTask" data-id="${config.id}">领取</button>` : `<span class="tag ${data.isClaimed ? "" : "warn"}">${data.isClaimed ? "已领取" : "进行中"}</span>`
            )).join("")
            : `<div class="feature-card">成就墙正在扩建，后续会加入更多长期目标。</div>`;
        return `<div class="panel-shell utility-shell achievement-shell"><h2>成就墙</h2><div class="feature-hero"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset("achievement")}')"></span><div><b>肥猫咖啡荣誉室</b><br>记录长期目标、收集进度和可领取奖励。</div><span class="feature-badge">可领取<br>${claimable}</span></div><div class="feature-mini"><span>猫咪收集<b>${unlockedCats}/${totalCats}</b></span><span>任务总数<b>${totalTasks}</b></span><span>钻石库存<b>${this.formatNumber(ResourceManager.get("diamond"))}</b></span></div><div class="feature-list">${rows}</div></div>`;
    }

    private renderMailPanel(): string {
        const pendingFriendRequests = this.getPendingFriendRequestCount();
        const sentFriendRequests = this._sentFriendRequests.filter(request => request.status === "pending").length;
        const mailRows = [
            { id: "welcome", title: "开业补给", desc: "欢迎回到肥猫咖啡公司，这里准备了一点启动补给。", state: "可领取", ready: true },
            { id: "daily", title: "每日工厂报告", desc: `当前金币 ${this.formatNumber(ResourceManager.get("coin"))}，咖啡豆 ${this.formatNumber(ResourceManager.get("bean"))}。`, state: "已读", ready: false },
            { id: "server", title: "联网公告", desc: "好友互动、发射结算和服务端奖励都会集中在这里。", state: "公告", ready: false },
        ];
        const unreadNew = mailRows.filter(mail => mail.ready && !this.isLocalMailClaimed(mail.id)).length + pendingFriendRequests;
        const requestCard = pendingFriendRequests > 0
            ? `<div class="feature-card with-icon ready"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset("friend")}')"></span><div><b>好友申请</b><br>${pendingFriendRequests} 个玩家等待处理，${sentFriendRequests} 个申请已发送。<br><span class="focus-tag">社交通知</span></div><div><button class="tag" data-action="openFriendRequests">查看</button></div></div>`
            : "";
        const rowsNew = mailRows.map(mail => {
            const claimed = this.isLocalMailClaimed(mail.id);
            const action = mail.ready && !claimed
                ? `<button class="tag" data-action="claimMail" data-id="${mail.id}">领取</button>`
                : `<span class="tag warn">${claimed ? "已领取" : "保留"}</span>`;
            return `<div class="feature-card with-icon ${mail.ready && !claimed ? "ready" : ""}"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset("mail")}')"></span><div><b>${mail.title}</b><br>${mail.desc}<br><span class="focus-tag">${mail.state}</span></div><div>${action}</div></div>`;
        }).join("");
        return `<div class="panel-shell utility-shell mail-shell"><h2>邮件</h2><div class="feature-hero"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset("mail")}')"></span><div><b>公司邮箱</b><br>奖励、系统公告和好友互动都会集中在这里。</div><span class="feature-badge ${pendingFriendRequests > 0 ? "alert" : ""}">未读<br>${unreadNew}</span></div><div class="feature-list">${requestCard}${rowsNew}</div></div>`;
    }

    private renderFriendPanel(): string {
        const friends = this.getFriendPanelRows();
        const pendingRequests = this._receivedFriendRequests.filter(request => request.status === "pending").length;
        const sentPending = this._sentFriendRequests.filter(request => request.status === "pending").length;
        const sourceLabelNew = this._serverFriends.length > 0 ? "服务端快照" : "本地预览";
        const networkNew = NetworkManager.getStatus();
        const playerIdNew = networkNew.playerId ? networkNew.playerId.replace(/-/g, "") : "未连接";
        const playerHintNew = playerIdNew === "未连接" ? playerIdNew : `${playerIdNew.slice(0, 8)}...${playerIdNew.slice(-6)}`;
        const friendToolsNew = `<div class="friend-tools"><span>我的ID：${playerHintNew}</span><button class="tag" data-action="sendFriendRequest">发送申请</button><button class="tag warn" data-action="addFriend">直接添加</button></div>`;
        const maxIncome = Math.max(1, ...friends.map(friend => friend.income));
        if (!friends.some(friend => friend.id === this._selectedFriendSnapshotId)) {
            this._selectedFriendSnapshotId = friends[0]?.id ?? "";
        }
        const rowsNew = friends.map((friend, index) => {
            const lastVisit = this.getFeatureTimestamp("friendVisits", friend.id);
            const lastGift = this.getFeatureTimestamp("friendGifts", friend.id);
            const width = Math.max(8, Math.min(100, Math.floor(friend.income / maxIncome * 100)));
            return `<div class="feature-card friend-card"><span class="friend-avatar"><i class="friend-rank">#${index + 1}</i></span><div class="friend-copy"><b>${friend.name}</b><em>公司 Lv.${friend.level} · 工厂收益 ${this.formatNumber(friend.income)}/秒</em><div class="friend-income"><i style="width:${width}%"></i></div><div class="friend-states"><span>${friend.status}</span><span>${lastVisit ? `访问 ${lastVisit}` : "待访问"}</span><span>${lastGift ? `送礼 ${lastGift}` : "可送礼"}</span></div></div><div class="friend-actions"><button class="tag" data-action="visitFriend" data-id="${friend.id}">访问工厂</button><button class="tag warn" data-action="sendFriendGift" data-id="${friend.id}">${lastGift ? "再次送礼" : "赠送猫粮"}</button></div></div>`;
        }).join("");
        return `<div class="panel-shell utility-shell friends-shell"><h2>好友</h2><div class="feature-hero"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset("friend")}')"></span><div><b>好友工厂</b><br>${sourceLabelNew}：访问、送礼和好友申请会同步到 .NET 服务端。</div><span class="feature-badge ${pendingRequests > 0 ? "alert" : ""}">申请<br>${pendingRequests}</span></div>${friendToolsNew}${this.renderFriendSearchCard()}<div class="feature-mini"><span>好友<b>${friends.length}</b></span><span>待处理<b>${pendingRequests}</b></span><span>已发送<b>${sentPending}</b></span></div>${this.renderFriendVisitScene(friends)}${this.renderFriendVisitReport(friends)}${this.renderFriendFactoryDetail(friends)}${this.renderFriendSnapshotCard(friends, maxIncome)}<div class="feature-list">${rowsNew}</div>${this.renderFriendRequestPreview()}${this.renderLeaderboardPreview()}${this.renderFriendActivityPreview()}</div>`;
    }

    private renderFriendSnapshotCard(friends: FriendPanelRow[], maxIncome: number): string {
        const selected = friends.find(friend => friend.id === this._selectedFriendSnapshotId) ?? friends[0];
        if (!selected) return "";
        const lastVisit = this.getFeatureTimestamp("friendVisits", selected.id) || "未访问";
        const lastGift = this.getFeatureTimestamp("friendGifts", selected.id) || "未送礼";
        const width = Math.max(8, Math.min(100, Math.floor(selected.income / Math.max(1, maxIncome) * 100)));
        const rewardPreview = Math.max(50, Math.floor(selected.income * 0.12));
        const floors = this.getFriendRoomRows(selected).slice(0, 3)
            .map(room => `<div class="snapshot-floor"><i>${room.floor}</i><b>${room.name}</b><em>${this.formatNumber(room.production)}/秒</em></div>`)
            .join("");
        return `<div class="friend-snapshot-card"><div class="snapshot-head"><span class="friend-avatar"><i class="friend-rank">工厂</i></span><div class="snapshot-copy"><b>${selected.name} 工厂快照</b><em>Lv.${selected.level} · 收益 ${this.formatNumber(selected.income)}/秒 · ${selected.status}</em><div class="snapshot-meter"><i style="width:${width}%"></i></div></div><div class="snapshot-action"><button class="tag" data-action="visitFriend" data-id="${selected.id}">访问</button><button class="tag warn" data-action="sendFriendGift" data-id="${selected.id}">送礼</button></div></div><div class="snapshot-stats"><span>访问奖励<b>+${this.formatNumber(rewardPreview)}金币</b></span><span>最近访问<b>${lastVisit}</b></span><span>礼物状态<b>${lastGift}</b></span></div><div class="snapshot-floors">${floors}</div></div>`;
    }

    private renderFriendVisitReport(friends: FriendPanelRow[]): string {
        const report = this._friendVisitReport;
        if (!report) return "";
        const friend = friends.find(item => item.id === report.friendId);
        if (!friend) return "";
        const actionLabel = report.kind === "gift" ? "送礼报告" : "访问报告";
        const floorRows = this.getFriendRoomRows(friend).slice(0, 3)
            .map(room => `<span>${room.floor}<em>${this.formatNumber(room.production)}/秒</em></span>`)
            .join("");
        return `<div class="friend-visit-report"><div class="visit-report-head"><span class="visit-report-badge">${report.kind === "gift" ? "礼" : "访"}</span><div class="visit-report-copy"><b>${friend.name} ${actionLabel}</b><em>${report.statusText} · ${this.formatFriendReportTime(report.updatedAt)}</em></div><button class="visit-report-close" data-action="closeFriendVisitReport">×</button></div><div class="visit-report-grid"><span>互动奖励<b>${report.rewardText}</b></span><span>好友收益<b>${this.formatNumber(friend.income)}/秒</b></span></div><div class="visit-report-floors">${floorRows}</div><div class="visit-report-actions"><button class="tag" data-action="visitFriend" data-id="${friend.id}">再次访问</button><button class="tag warn" data-action="sendFriendGift" data-id="${friend.id}">赠送猫粮</button></div></div>`;
    }

    private renderFriendFactoryDetail(friends: FriendPanelRow[]): string {
        const selectedId = this._friendVisitReport?.friendId || this._selectedFriendSnapshotId;
        const friend = friends.find(item => item.id === selectedId) ?? friends[0];
        if (!friend) return "";
        const rooms = this.getFriendRoomRows(friend);
        const topRoom = rooms[0];
        const source = friend.rooms?.length ? "服务端房间" : "本地估算";
        const staffedRooms = rooms.filter(room => room.assignedCatCount > 0).length;
        const decorTotal = rooms.reduce((sum, room) => sum + room.decorScore, 0);
        const roomRows = rooms.slice(0, 6)
            .map(room => `<div class="factory-room-row"><i>${room.floor}</i><b>${room.name}<small>Lv.${room.level} · ${room.featuredCatName} · 猫 ${room.assignedCatCount} · 装饰 ${room.decorScore}</small></b><em>${this.formatNumber(room.production)}/秒</em></div>`)
            .join("");
        return `<div class="friend-factory-detail"><div class="factory-detail-head"><div><b>${friend.name} 工厂详情</b><em>${source} · ${rooms.length} 个楼层</em></div><button class="tag" data-action="openFriendVisitScene" data-id="${friend.id}">进入访问</button></div><div class="factory-detail-stats"><span>主力楼层<b>${topRoom?.floor ?? "--"}</b></span><span>派驻房间<b>${staffedRooms}/${rooms.length}</b></span><span>装饰评分<b>${this.formatNumber(decorTotal)}</b></span></div><div class="factory-room-list">${roomRows}</div></div>`;
    }

    private renderFriendVisitScene(friends: FriendPanelRow[]): string {
        const selectedId = this._friendVisitSceneId || this._friendVisitReport?.friendId;
        if (!selectedId) return "";
        const friend = friends.find(item => item.id === selectedId);
        if (!friend) return "";
        const rooms = this.getFriendRoomRows(friend);
        const topRoom = rooms[0];
        const staffedRooms = rooms.filter(room => room.assignedCatCount > 0).length;
        const decorTotal = rooms.reduce((sum, room) => sum + room.decorScore, 0);
        const roomTotal = rooms.reduce((sum, room) => sum + room.production, 0);
        const lastVisit = this.getFeatureTimestamp("friendVisits", friend.id) || "未访问";
        const lastGift = this.getFeatureTimestamp("friendGifts", friend.id) || "未送礼";
        const rewardPreview = Math.max(50, Math.floor(friend.income * 0.12));
        const floorRows = rooms.slice(0, 6)
            .map((room, index) => `<div class="friend-scene-floor"><i>${room.floor}</i><span class="room-thumb asset" style="background-image:url('${this.getFactoryPropDataUri(room.scene)}')"></span><b>${room.name}<small>Lv.${room.level} · ${room.featuredCatName} · 猫 ${room.assignedCatCount}</small><span class="room-cats">${this.renderFriendRoomCats(room.assignedCatCount, index)}</span></b><em>${this.formatNumber(room.production)}/秒</em></div>`)
            .join("");
        return `<div class="friend-visit-scene" style="--friend-factory-art:url('${this.getDomAssetDataUri(GeneratedBackgroundAssets.factoryCutaway)}')"><div class="friend-scene-head"><span class="friend-avatar"><i class="friend-rank">VISIT</i></span><div><b>${friend.name} 访问中</b><em>公司 Lv.${friend.level} · ${friend.status} · ${rooms.length} 个楼层</em></div><button class="friend-scene-close" data-action="closeFriendVisitScene">×</button></div><div class="friend-scene-stage"><div class="friend-scene-building">${floorRows}</div><div class="friend-scene-side"><div class="friend-scene-mascot"><i style="background-image:url('${this.getCatFullArtAsset("c_001")}')"></i><b>访客猫</b><small>正在巡楼</small></div><span>总收益<b>${this.formatNumber(friend.income)}/秒</b></span><span>房间合计<b>${this.formatNumber(roomTotal)}/秒</b></span><span>主力楼层<b>${topRoom?.floor ?? "--"}</b></span><span>值班房间<b>${staffedRooms}/${rooms.length}</b></span><span>装饰评分<b>${this.formatNumber(decorTotal)}</b></span></div></div><div class="friend-scene-reward"><span>访问奖励<b>+${this.formatNumber(rewardPreview)} 金币</b></span><span>上次访问<b>${lastVisit}</b></span><span>礼物状态<b>${lastGift}</b></span></div><div class="friend-scene-actions"><button class="tag" data-action="visitFriend" data-id="${friend.id}">刷新访问</button><button class="tag warn" data-action="sendFriendGift" data-id="${friend.id}">赠送猫粮</button><button class="tag" data-action="closeFriendVisitScene">返回列表</button></div></div>`;
    }

    private getFriendRoomRows(friend: FriendPanelRow): Array<{ floor: string; name: string; level: number; production: number; assignedCatCount: number; featuredCatName: string; decorScore: number; scene: string }> {
        const rooms = friend.rooms?.length
            ? friend.rooms
                .slice()
                .sort((left, right) => this.getFriendFloorSort(right.floor) - this.getFriendFloorSort(left.floor))
                .map(room => ({
                    floor: room.floor,
                    name: room.name,
                    level: room.level,
                    production: Math.max(0, Math.floor(room.productionPerSecond)),
                    assignedCatCount: Math.max(0, Math.floor(room.assignedCatCount ?? 0)),
                    featuredCatName: room.featuredCatName || "待派驻",
                    decorScore: Math.max(0, Math.floor(room.decorScore ?? 0)),
                    scene: this.getFriendRoomScene(room.buildingId, room.floor, room.name),
                }))
            : [];
        if (rooms.length > 0) return rooms;
        return [
            { floor: "3F", name: "发酵车间", level: Math.max(1, Math.floor(friend.level / 3)), production: Math.max(1, Math.floor(friend.income * 0.34)), assignedCatCount: 2, featuredCatName: "巡逻肥猫", decorScore: Math.max(12, friend.level * 3), scene: "tank" },
            { floor: "2F", name: "原料车间", level: Math.max(1, Math.floor(friend.level / 3)), production: Math.max(1, Math.floor(friend.income * 0.28)), assignedCatCount: 1, featuredCatName: "搬豆肥猫", decorScore: Math.max(10, friend.level * 2), scene: "mill" },
            { floor: "1F", name: "咖啡厅", level: Math.max(1, Math.floor(friend.level / 3)), production: Math.max(1, Math.floor(friend.income * 0.22)), assignedCatCount: 3, featuredCatName: "招待肥猫", decorScore: Math.max(14, friend.level * 3), scene: "cafe" },
        ];
    }

    private renderFriendRoomCats(count: number, offset: number): string {
        const total = Math.max(1, Math.min(3, count || 1));
        return Array.from({ length: total }, (_, index) => {
            const catId = `c_00${((index + offset) % 5) + 1}`;
            return `<span style="background-image:url('${this.getCatFullArtAsset(catId)}')"></span>`;
        }).join("");
    }

    private getFriendRoomScene(buildingId: string | undefined, floor: string, name: string): string {
        const value = `${buildingId ?? ""} ${floor} ${name}`.toLowerCase();
        if (value.includes("b1") || value.includes("仓库") || value.includes("storage")) return "storage";
        if (value.includes("5f") || value.includes("管理") || value.includes("office")) return "office";
        if (value.includes("4f") || value.includes("烘焙") || value.includes("roast")) return "roast";
        if (value.includes("3f") || value.includes("发酵") || value.includes("tank")) return "tank";
        if (value.includes("2f") || value.includes("原料") || value.includes("mill")) return "mill";
        return "cafe";
    }

    private getFriendFloorSort(floor: string): number {
        if (floor.toUpperCase() === "B1") return 0;
        const parsed = Number.parseInt(floor.replace(/F/i, ""), 10);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    private renderFriendSearchCard(): string {
        const preview = this._friendSearchPreview;
        const query = this.escapeAttribute(this._friendSearchQuery);
        const result = preview
            ? `<div class="friend-search-result"><div><b>${preview.companyName}</b><em>Lv.${preview.level} · ${this.formatNumber(preview.incomePerSecond)}/秒 · ${preview.inviteCode}</em></div><button class="tag" data-action="sendFriendRequestInline" ${preview.isSelf || preview.isFriend ? "disabled" : ""}>${preview.isFriend ? "已是好友" : preview.isSelf ? "自己" : "发送申请"}</button></div>`
            : (this._friendSearchMessage ? `<div class="friend-search-result"><div><b>${this._friendSearchMessage}</b><em>输入 FC 开头邀请码或玩家ID。</em></div></div>` : "");
        return `<div class="friend-search-card"><div class="friend-search-row"><input data-field="friendSearch" value="${query}" placeholder="输入邀请码或玩家ID"><button class="tag" data-action="searchFriendInline">搜索</button><button class="tag warn" data-action="sendFriendRequest">旧版输入</button></div>${result}</div>`;
    }

    private renderFriendRequestPreview(): string {
        const received = this._receivedFriendRequests.filter(request => request.status === "pending").slice(0, 4);
        const sent = this._sentFriendRequests.filter(request => request.status === "pending").slice(0, 3);
        const receivedRows = received.map(request => `<div class="request-row incoming"><span>申请</span><b>${request.companyName}</b><em>Lv.${request.level} · ${this.formatNumber(request.incomePerSecond)}/秒</em><button class="tag" data-action="acceptFriendRequest" data-id="${request.id}">接受</button><button class="tag warn" data-action="rejectFriendRequest" data-id="${request.id}">拒绝</button></div>`).join("");
        const sentRows = sent.map(request => `<div class="request-row sent"><span>已发</span><b>${request.companyName}</b><em>等待回应</em></div>`).join("");
        const empty = receivedRows || sentRows ? "" : `<div class="activity-empty">暂无好友申请。可通过邀请码向玩家发送申请。</div>`;
        return `<div class="friend-request-card"><div class="leaderboard-head"><b>好友申请</b><span>${received.length} 待处理</span></div>${receivedRows}${sentRows}${empty}</div>`;
    }

    private getFriendPanelRows(): FriendPanelRow[] {
        if (this._serverFriends.length > 0) {
            return this._serverFriends.map(friend => ({
                id: friend.id,
                name: friend.name,
                level: friend.level,
                income: friend.incomePerSecond,
                status: "在线数据",
                rooms: friend.rooms,
            }));
        }
        return [
            { id: "mocha", name: "摩卡工坊", level: 18, income: 520, status: "本地预览" },
            { id: "latte", name: "拿铁小镇", level: 14, income: 360, status: "本地预览" },
            { id: "cocoa", name: "可可研究所", level: 22, income: 680, status: "本地预览" },
        ];
    }

    private async refreshServerFriendsForPanel(): Promise<void> {
        if (!NetworkManager.canUseServer || this._friendRefreshInFlight) return;
        this._friendRefreshInFlight = true;
        const friends = await SyncManager.fetchServerFriends();
        this._friendRefreshInFlight = false;
        if (friends.length <= 0 || this.currentPanel !== "friends") return;
        this._serverFriends = friends;
        for (const friend of friends) {
            this.applyServerFriendSnapshot(friend, false);
        }
        this.renderDomPanel("friends");
    }

    private async refreshServerLeaderboardForPanel(): Promise<void> {
        if (!NetworkManager.canUseServer || this._leaderboardRefreshInFlight) return;
        this._leaderboardRefreshInFlight = true;
        const leaderboard = await SyncManager.fetchServerLeaderboard("income");
        this._leaderboardRefreshInFlight = false;
        if (!leaderboard || this.currentPanel !== "friends") return;
        this._serverLeaderboard = leaderboard;
        this.renderDomPanel("friends");
    }

    private async refreshFriendRequestsForPanel(): Promise<void> {
        if (!NetworkManager.canUseServer || this._friendRequestRefreshInFlight) return;
        this._friendRequestRefreshInFlight = true;
        try {
            const [received, sent] = await Promise.all([
                SyncManager.fetchServerFriendRequests("received"),
                SyncManager.fetchServerFriendRequests("sent"),
            ]);
            if (this.currentPanel !== "friends") return;
            this._receivedFriendRequests = received;
            this._sentFriendRequests = sent;
            this.renderDomPanel("friends");
        } finally {
            this._friendRequestRefreshInFlight = false;
        }
    }

    private async refreshFriendRequestBadgeForFactory(): Promise<void> {
        if (!NetworkManager.canUseServer || this._friendRequestRefreshInFlight) return;
        const now = Date.now();
        if (now - this._friendRequestBadgeFetchedAt < 30000) return;
        this._friendRequestBadgeFetchedAt = now;
        this._friendRequestRefreshInFlight = true;
        try {
            const received = await SyncManager.fetchServerFriendRequests("received");
            this._receivedFriendRequests = received;
            if (this.currentPanel === "factory") {
                this.renderDomFactoryOverlay();
            }
        } finally {
            this._friendRequestRefreshInFlight = false;
        }
    }

    private getPendingFriendRequestCount(): number {
        return this._receivedFriendRequests.filter(request => request.status === "pending").length;
    }

    private async refreshFriendActivitiesForPanel(): Promise<void> {
        if (!NetworkManager.canUseServer || this._friendActivityRefreshInFlight) return;
        this._friendActivityRefreshInFlight = true;
        const activities = await SyncManager.fetchServerFriendActivities(6);
        this._friendActivityRefreshInFlight = false;
        if (this.currentPanel !== "friends") return;
        this._friendActivities = activities;
        this.renderDomPanel("friends");
    }

    private renderLeaderboardPreview(): string {
        const leaderboard = this._serverLeaderboard;
        const entries = leaderboard?.entries?.slice(0, 5) ?? [];
        if (entries.length <= 0) {
            return `<div class="leaderboard-card"><div><b>收益排行榜</b><br>联网后显示好友与自己的咖啡收益名次。</div><span class="tag warn">等待同步</span></div>`;
        }
        const selfRank = leaderboard?.self?.rank ? `#${leaderboard.self.rank}` : "未上榜";
        const rows = entries.map(entry => `<div class="leaderboard-row ${entry.isSelf ? "self" : ""}"><span>#${entry.rank}</span><b>${entry.companyName}</b><em>${this.formatNumber(entry.score)}/秒</em></div>`).join("");
        return `<div class="leaderboard-card"><div class="leaderboard-head"><b>收益排行榜</b><span>我的名次 ${selfRank}</span></div>${rows}</div>`;
    }

    private renderFriendActivityPreview(): string {
        if (this._friendActivities.length <= 0) {
            return `<div class="friend-activity-card"><div class="leaderboard-head"><b>好友动态</b><span>暂无记录</span></div><div class="activity-empty">访问、送礼或添加好友后会同步到这里。</div></div>`;
        }
        const rows = this._friendActivities.slice(0, 6).map(activity => `<div class="activity-row"><span>${this.getFriendActivityLabel(activity.activityType)}</span><b>${activity.friendName}</b><em>${this.formatActivityTime(activity.createdAt)}</em></div>`).join("");
        return `<div class="friend-activity-card"><div class="leaderboard-head"><b>好友动态</b><span>${this._friendActivities.length}条</span></div>${rows}</div>`;
    }

    private getFriendActivityLabel(type: string): string {
        return getFriendActivityLabelText(type);
    }

    private getFriendSearchFailureMessage(preview: FriendSearchResultDto | null): string {
        if (!NetworkManager.canUseServer) return "Connect server before adding friends.";
        if (!preview) return "Friend search failed. Check invite code or player id.";
        if (preview.isSelf) return "You cannot add yourself.";
        if (preview.isFriend) return `${preview.companyName} is already your friend.`;
        return "Friend add cancelled.";
    }

    private escapeAttribute(value: string): string {
        return value
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    private formatActivityTime(timestamp: number): string {
        return formatClockTime(timestamp);
    }

    private formatFriendReportTime(timestamp: number): string {
        return formatFriendReportRelativeTime(timestamp);
    }

    private applyServerFriendSnapshot(friend: FriendDto, rerender = true): void {
        const index = this._serverFriends.findIndex(item => item.id === friend.id);
        if (index >= 0) {
            this._serverFriends[index] = friend;
        } else {
            this._serverFriends.push(friend);
        }
        SaveManager.update(data => {
            if (friend.lastVisitedAt) {
                data.featureState.friendVisits[friend.id] = friend.lastVisitedAt;
            }
            if (friend.lastGiftAt) {
                data.featureState.friendGifts[friend.id] = friend.lastGiftAt;
            }
        });
        if (rerender && this.currentPanel === "friends") {
            this.renderDomPanel("friends");
        }
    }

    private renderSettingsPanel(): string {
        const save = SaveManager.snapshot();
        const created = save ? new Date(save.createdAt).toLocaleDateString() : "本地";
        const network = NetworkManager.getStatus();
        const sync = SyncManager.getSnapshot();
        const apiBase = this.getApiBaseLabel();
        const playerId = network.playerId ? `${network.playerId.slice(0, 8)}...` : "未连接";
        const serverLabel = this.getNetworkModeLabel(network.serverMode);
        const syncLabel = this.getSyncModeLabel(sync.mode);
        const settings = SETTINGS_PANEL_ITEMS.map(item => ({ ...item, on: this.getSettingValue(item.id) }));
        const rows = settings.map(item => `<div class="feature-card setting-row"><div><b>${item.name}</b><br>${item.desc}</div><button class="toggle-pill ${item.on ? "" : "off"}" data-action="toggleSetting" data-id="${item.id}">${item.on ? "开启" : "关闭"}</button></div>`).join("");
        return `<div class="panel-shell utility-shell settings-shell"><h2>设置</h2><div class="feature-hero"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset("settings")}')"></span><div><b>公司设置</b><br>当前支持本地离线和 .NET Core 服务端联调。URL 可用 ?api=http://localhost:5144 临时指定。</div><span class="feature-badge">存档<br>${created}</span></div><div class="feature-mini"><span>服务器<b>${serverLabel}</b></span><span>同步<b>${syncLabel}</b></span><span>待同步<b>${sync.pendingFeatureChanges}</b></span></div><div class="feature-list">${rows}<div class="feature-card"><b>账号状态</b><br>API：${apiBase}<br>玩家：${playerId}<br>最近错误：${sync.lastError || network.lastError || "无"}<br><button class="tag" data-action="connectServer">连接服务器</button> <button class="tag" data-action="syncSave">同步存档</button> <button class="tag warn" data-action="pushSettings">推送设置</button> <button class="tag" data-action="previewProduction">结算预览</button></div></div></div>`;
    }

    private renderFeatureProgressCard(icon: string, title: string, desc: string, current: number, goal: number, reward: string, action: string): string {
        const progress = Math.min(100, Math.floor((current / Math.max(1, goal)) * 100));
        return `<div class="feature-card with-icon ${current >= goal ? "ready" : ""}"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset(icon)}')"></span><div><b>${title}</b><br>${desc}<div class="progress-line"><i style="width:${progress}%"></i></div><span class="task-meta">进度 ${this.formatNumber(current)}/${this.formatNumber(goal)}</span><div class="task-reward">${reward}</div></div><div>${action}</div></div>`;
    }

    private isLocalMailClaimed(id: string): boolean {
        return !!this.ensureFeatureState().claimedMails[id];
    }

    private getSettingValue(id: string): boolean {
        const settings = this.ensureFeatureState().settings;
        if (settings[id] === undefined) {
            settings[id] = this.getDefaultSettingValue(id);
        }
        return !!settings[id];
    }

    private getDefaultSettingValue(id: string): boolean {
        return getDefaultFeatureSettingValue(id);
    }

    private getFeatureTimestamp(bucket: "friendGifts" | "friendVisits", id: string): string {
        const timestamp = this.ensureFeatureState()[bucket][id];
        return formatClockTime(timestamp);
    }

    private getApiBaseLabel(): string {
        const status = NetworkManager.getStatus();
        if (status.serverMode === "unconfigured") return "未配置";
        return "已配置";
    }

    private getNetworkModeLabel(mode: "offline" | "ready" | "unconfigured" | "error"): string {
        return getNetworkModeLabelText(mode);
    }

    private getSyncModeLabel(mode: "offline" | "ready" | "syncing" | "failed"): string {
        return getSyncModeLabelText(mode);
    }

    private ensureFeatureState() {
        if (!SaveManager.isInitialized()) {
            return {
                claimedMails: {},
                settings: {},
                friendGifts: {},
                friendVisits: {},
            };
        }
        const data = SaveManager.data;
        if (!data.featureState) {
            SaveManager.update(save => {
                save.featureState = {
                    claimedMails: {},
                    settings: {
                        music: true,
                        sfx: true,
                        push: false,
                        sync: false,
                    },
                    friendGifts: {},
                    friendVisits: {},
                };
            });
        }
        data.featureState.claimedMails = data.featureState.claimedMails ?? {};
        data.featureState.settings = data.featureState.settings ?? {};
        data.featureState.friendGifts = data.featureState.friendGifts ?? {};
        data.featureState.friendVisits = data.featureState.friendVisits ?? {};
        return data.featureState;
    }

    private renderBuildingPanel(): string {
        const buildings = BuildingManager.getAll().slice().reverse();
        if (!BuildingManager.getById(this._selectedDomBuildingId)) {
            this._selectedDomBuildingId = buildings[buildings.length - 1]?.id ?? "building_cafe_1f";
        }
        const selected = BuildingManager.getById(this._selectedDomBuildingId) ?? buildings[0];
        const scenePosition: Record<string, number> = {
            office: 12,
            roast: 30,
            tank: 47,
            mill: 63,
            cafe: 78,
            storage: 92,
        };
        const scene = getBuildingScene(selected.id);
        const nextEffect = BuildingManager.getNextEffectValue(selected.id);
        const nextCapacity = Math.min(12, selected.scheduleCapacity + 1);
        const levelRequirement = Math.min(30, Math.max(8, selected.level * 3 + 6));
        const ownedCoin = ResourceManager.get("coin");
        const selector = buildings.map(building => `<button class="building-chip ${building.id === selected.id ? "active" : ""}" data-action="selectBuilding" data-id="${building.id}"><b>${building.floor}</b><span>${building.name}</span><small>Lv.${building.level}</small></button>`).join("");
        const effectRows = [
            [selected.effectLabel, `${selected.effectValue}%`, `${nextEffect}%`],
            ["生产效率", `${100 + selected.level * 5}%`, `${105 + selected.level * 5}%`],
            ["容量上限", `${selected.scheduleCapacity}`, `${nextCapacity}`],
        ].map(row => `<div class="building-target-row"><span>${row[0]}</span><b>${row[1]}</b><em>➜</em><strong>${row[2]}</strong></div>`).join("");
        const conditions = `<div class="building-conditions"><b>升级条件</b><div><span>${this.renderCssIcon("deco")}工厂等级达到${levelRequirement}级</span><strong class="${28 >= levelRequirement ? "ok" : "bad"}">${Math.min(28, levelRequirement)}/${levelRequirement}</strong></div><div><span>${this.renderCssIcon("coin")}消耗金币</span><strong class="${ownedCoin >= selected.upgradeCost ? "ok" : "bad"}">${this.formatNumber(ownedCoin)}/${this.formatNumber(selected.upgradeCost)}</strong></div><div><span>${this.renderCssIcon("bean")}咖啡豆储备</span><strong class="ok">${this.formatNumber(ResourceManager.get("bean"))}/2.5K</strong></div></div>`;
        return `<div class="panel-shell building-shell"><h2>建筑详情</h2><div class="building-selector">${selector}</div><div class="building-detail-hero" style="background-image:linear-gradient(rgba(34,22,15,.12),rgba(34,22,15,.28)),url('${this.getDomAssetDataUri(GeneratedBackgroundAssets.factoryCutaway)}');background-position:center ${scenePosition[scene]}%"><span class="building-floor-tag">${selected.floor}<small>Lv.${selected.level}</small></span><span class="building-scene-prop" style="background-image:url('${this.getFactoryPropDataUri(scene)}')"></span><div class="building-hero-copy"><b>${selected.name}</b><span>Lv.${selected.level}</span><em>生产建筑</em></div></div><div class="building-description">${selected.description}</div><div class="building-target-effects"><div class="building-target-title"><b>等级效果</b><span>Lv.${selected.level}</span><em>➜</em><span>Lv.${Math.min(selected.maxLevel, selected.level + 1)}</span></div>${effectRows}</div>${conditions}<div class="building-main-upgrade">${this.renderBuildingUpgradeButton(selected.id)}</div><div class="building-roster"><b>值班猫咪 ${selected.assignedCatCount}/${selected.scheduleCapacity}</b>${this.renderAssignedCatRows(selected.id)}${this.renderAvailableCatRows(selected.id)}</div></div>`;
    }

    private renderMiniFloor(id: string): string {
        const building = BuildingManager.getById(id);
        if (!building) return "";
        const active = id === this._selectedDomBuildingId ? "active" : "";
        const snapshot = ProductionManager.calculateSnapshot();
        const production = snapshot.buildingCoinPerSecond[id] ?? 0;
        const levelPercent = Math.min(100, Math.floor((building.level / Math.max(1, building.maxLevel)) * 100));
        return `<button class="mini-floor ${active}" data-action="selectBuilding" data-id="${id}"><span>${building.floor}</span><b>${building.name}<br>Lv.${building.level}</b><em>${this.formatRate(production)}/秒</em><span class="floor-level-line"><i style="width:${levelPercent}%"></i></span></button>`;
    }

    private renderSelectedBuilding(id: string): string {
        const building = BuildingManager.getById(id);
        if (!building) {
            return `<div class="item">楼层配置缺失</div>`;
        }
        const nextEffect = BuildingManager.getNextEffectValue(id);
        const assigned = CatManager.getAssignedCats(id);
        const levelPercent = Math.min(100, Math.floor((building.level / Math.max(1, building.maxLevel)) * 100));
        return `<div class="summary with-icons"><div><span class="summary-icon">${this.renderCssIcon("deco")}</span><span>${building.floor}<br><b>${building.name}</b></span></div><div><span class="summary-icon">${this.renderCssIcon("cat")}</span><span>排班<br><b>${assigned.length}/${building.scheduleCapacity}</b></span></div><div><span class="summary-icon">${this.renderCssIcon(building.level < building.maxLevel ? "coin" : "equip")}</span><span>可升级<br><b>${building.level < building.maxLevel ? "是" : "满级"}</b></span></div></div><div class="item"><b>${building.name} Lv.${building.level}/${building.maxLevel}</b><div class="mini-progress"><i style="width:${levelPercent}%"></i></div>${building.description}<div class="building-upgrade-preview"><b>${building.effectLabel}</b><div class="building-effect-row"><span>当前<br><b>${building.effectValue}%</b></span><em>→</em><span>下级<br><b>${nextEffect}%</b></span></div>${this.renderBuildingUpgradeButton(id)}</div></div><div class="schedule-list">${this.renderAssignedCatRows(id)}${this.renderAvailableCatRows(id)}</div>`;
    }

    private renderBuildingUpgradeButton(id: string): string {
        const building = BuildingManager.getById(id);
        if (!building) return `<span class="tag warn">不可用</span>`;
        if (building.level >= building.maxLevel) return `<button class="tag warn" disabled>满级</button>`;
        const canUpgrade = ResourceManager.canSpend({ coin: building.upgradeCost });
        return canUpgrade
            ? `<button class="tag" data-action="upgradeBuilding" data-id="${id}">${this.formatNumber(building.upgradeCost)} 金币升级</button>`
            : `<button class="tag warn" disabled>${this.formatNumber(building.upgradeCost)} 金币</button>`;
    }

    private renderAssignedCatRows(buildingId: string): string {
        const assigned = CatManager.getAssignedCats(buildingId);
        if (assigned.length === 0) {
            return `<div class="schedule-row locked"><div>当前楼层暂无猫咪值班<br>从下方空闲列表派遣一只猫咪</div><div><span class="tag warn">空位</span></div></div>`;
        }
        return assigned.map(config => {
            const data = CatManager.getCatData(config.id);
            const production = Math.floor(CatManager.getCatProduction(config.id));
            return `<div class="schedule-row has-cat"><span class="mini-cat-avatar"></span><div><b>${config.rarity} ${config.name}</b> Lv.${data.level}<br>${this.getCatRoleLabel(config.role)} · ${this.formatNumber(production)}/秒</div><div><button class="tag warn" data-action="unassignCat" data-id="${config.id}">撤下</button></div></div>`;
        }).join("");
    }

    private renderAvailableCatRows(buildingId: string): string {
        const building = BuildingManager.getById(buildingId);
        const hasRoom = !building || building.assignedCatCount < building.scheduleCapacity;
        const available = CatManager.getAllConfigs().filter(config => {
            const data = CatManager.getCatData(config.id);
            return data.isUnlocked && CatManager.getAssignedBuildingId(config.id) !== buildingId;
        });
        if (available.length === 0) {
            return `<div class="schedule-row locked"><div>没有可派遣的空闲猫咪<br>可前往猫咪页招募更多成员</div><div><span class="tag warn">无空闲</span></div></div>`;
        }
        return available.map(config => {
            const data = CatManager.getCatData(config.id);
            const production = Math.floor(CatManager.getCatProduction(config.id));
            return `<div class="schedule-row has-cat ${hasRoom ? "" : "locked"}"><span class="mini-cat-avatar"></span><div><b>${config.rarity} ${config.name}</b> Lv.${data.level}<br>${this.getCatRoleLabel(config.role)} · ${this.formatNumber(production)}/秒</div><div>${hasRoom ? `<button class="tag" data-action="assignCat" data-id="${config.id}" data-building="${buildingId}">派遣</button>` : `<span class="tag warn">满员</span>`}</div></div>`;
        }).join("");
    }

    private renderTaskPanel(): string {
        const tasks = TaskManager.getActiveTasks();
        const claimableCount = this.getClaimableTaskCount();
        const activeScore = Math.min(100, 40 + claimableCount * 20 + Math.floor(ResourceManager.get("coin") / 10000) * 5);
        const orderProgress = 56;
        const orderGoal = 60;
        const rows = tasks.length > 0
            ? tasks.map(({ config, data }) => this.renderTaskRow(
                config.id,
                config.name,
                config.description,
                config.type,
                data.currentValue,
                config.goalValue,
                this.formatTaskReward(config.rewards),
                data.currentValue >= config.goalValue && !data.isClaimed,
            )).join("")
            : `<div class="item">当前任务已完成<br><span class="tag">等待刷新</span></div>`;

        return `<div class="panel-shell utility-shell task-shell"><h2>任务详情</h2><div class="task-board"><span class="task-board-icon"></span><div>今日订单<br><b>${orderProgress}/${orderGoal}</b><div class="progress-line"><i style="width:${Math.floor((orderProgress / orderGoal) * 100)}%"></i></div></div><span class="task-stamp">活跃 ${activeScore}</span></div><div class="task-daily"><div class="task-daily-card">${this.renderCssIcon("task")}<span>订单完成<br><b>${orderProgress}/${orderGoal}</b></span></div><div class="task-daily-card">${this.renderCssIcon("gift")}<span>可领取奖励<br><b>${claimableCount}</b></span></div><div class="task-daily-card">${this.renderCssIcon("coin")}<span>活跃度<br><b>${activeScore}</b></span></div></div><div class="task-reward-strip">${TASK_PROGRESS_MILESTONES.map(value => `<span class="${activeScore >= value ? "ready" : ""}">${value}</span>`).join("")}</div><div class="list shop-list">${rows}</div><div class="wide">点击左侧任务板或底部今日订单会打开这里；主界面宝箱会优先领取已完成任务，没有可领任务时发放一份小额宝箱奖励。</div></div>`;
    }

    private renderTaskRow(id: string, name: string, description: string, type: string, currentValue: number, goalValue: number, rewardText: string, claimable: boolean): string {
        const safeGoal = Math.max(1, goalValue);
        const progress = Math.min(100, Math.floor((currentValue / safeGoal) * 100));
        const action = claimable
            ? `<button class="tag" data-action="claimTask" data-id="${id}">领取</button>`
            : `<span class="tag warn">进行中</span>`;
        return `<div class="item task-row with-icon"><div class="task-icon">${this.renderCssIcon("task")}</div><div><b>${name}</b><div class="task-meta">${this.getTaskTypeLabel(type)} · ${description}</div><div class="progress-line"><i style="width:${progress}%"></i></div><div class="task-meta">进度 ${this.formatNumber(currentValue)}/${this.formatNumber(goalValue)}</div><div class="task-reward">${rewardText}</div></div><div>${action}</div></div>`;
    }

    private getTaskTypeLabel(type: string): string {
        return getTaskTypeLabelText(type);
    }

    private formatTaskReward(rewards: { coin?: number; diamond?: number; researchPoint?: number; items?: { itemId: string; count: number }[] }): string {
        const parts: string[] = [];
        if (rewards.coin) parts.push(`${this.formatNumber(rewards.coin)} 金币`);
        if (rewards.diamond) parts.push(`${this.formatNumber(rewards.diamond)} 钻石`);
        if (rewards.researchPoint) parts.push(`${this.formatNumber(rewards.researchPoint)} 研究点`);
        if (rewards.items) {
            for (const item of rewards.items) {
                parts.push(`${this.getItemDisplayName(item.itemId)} x${item.count}`);
            }
        }
        return parts.length > 0 ? `奖励：${parts.join("、")}` : "奖励：待定";
    }

    private getItemDisplayName(itemId: string): string {
        return getItemDisplayNameText(itemId);
    }

    private renderShopButton(id: string, priceType: "coin" | "diamond" | "catFood", priceAmount: number): string {
        const remaining = ShopManager.getRemainingLimit(id);
        const priceName = priceType === "coin" ? "金币" : priceType === "diamond" ? "钻石" : "猫粮";
        const cost = { [priceType]: priceAmount } as { coin?: number; diamond?: number; catFood?: number };
        const price = `<span class="price">${this.renderCssIcon(this.getResourceIconClass(priceType))}${this.formatNumber(priceAmount)} ${priceName}</span>`;
        if (remaining <= 0) {
            return `<button class="tag warn" disabled>已售罄</button>`;
        }
        if (!ResourceManager.canSpend(cost)) {
            return `<button class="tag warn" disabled>${priceName}不足</button>`;
        }
        return `<button class="tag" data-action="buy" data-id="${id}">${price}</button>`;
    }

    private renderShopPanel(): string {
        const items = ShopManager.getShopItems(this._domShopTab);
        const rows = items.length > 0
            ? items.map(item => this.renderShopRow(item.id)).join("") + this.renderShopPreviewRows(this._domShopTab, Math.max(0, 6 - items.length))
            : this.renderEmptyShopRows(this._domShopTab);
        return `<div class="panel-shell shop-shell"><h2>商店详情</h2><div class="tabs">${SHOP_TABS.map(tab => `<button class="tab ${this._domShopTab === tab.id ? "active" : ""}" data-action="shopTab" data-tab="${tab.id}">${tab.label}</button>`).join("")}</div><div class="list shop-list">${rows}</div></div>`;
    }

    private renderShopPreviewRows(category: string, count: number): string {
        return (SHOP_PREVIEW_CATALOGS[category] ?? SHOP_PREVIEW_CATALOGS.resource).slice(0, count).map(([name, desc, icon, price, currency]) => `<div class="item shop-row preview"><div class="shop-icon asset" style="background-image:url('${this.getGeneratedIconAsset(icon)}')"></div><div><b>${name}</b><br>${desc}<div class="limit">每日限购：3/3</div></div><div class="buy-zone"><span class="tag preview-price">${price} ${currency}</span></div></div>`).join("");
    }

    private getShopTabLabel(): string {
        return getShopTabLabelText(this._domShopTab);
    }

    private renderShopRow(id: string): string {
        const shop = ConfigManager.shops.find(item => item.id === id);
        if (!shop) return "";
        const item = ConfigManager.items.find(entry => entry.id === shop.itemId);
        const title = item?.name ?? shop.itemId;
        const desc = item?.description ?? "商品配置缺失";
        const icon = this.getItemIconClass(shop.itemId);
        const remaining = ShopManager.getRemainingLimit(id);
        const cost = { [shop.priceType]: shop.priceAmount } as { coin?: number; diamond?: number; catFood?: number };
        const stateClass = remaining <= 0 ? "soldout" : ResourceManager.canSpend(cost) ? "" : "locked";
        return `<div class="item shop-row ${stateClass}"><div class="shop-icon asset" style="background-image:url('${this.getGeneratedIconAsset(icon)}')">${this.renderCssIcon(icon)}</div><div><b>${title}</b><br>${desc}<div class="limit">每日限购：${remaining >= 999 ? "不限" : remaining}</div></div><div class="buy-zone">${this.renderShopButton(id, shop.priceType, shop.priceAmount)}</div></div>`;
    }

    private renderEmptyShopRows(category: string): string {
        const label = category === "cat" ? "猫咪" : category === "deco" ? "装饰" : "道具";
        return `<div class="item shop-row locked"><div class="shop-icon asset" style="background-image:url('${this.getGeneratedIconAsset("gift")}')">${this.renderCssIcon("gift")}</div><div><b>${label}货架整理中</b><br>该分类商品会跟随玩法进度开放。<div class="limit">请先体验已有商品和主线任务</div></div><div><span class="tag warn">开发中</span></div></div>`;
    }

    private getShopIcon(type: string): string {
        return getShopIconClassName(type);
    }

    private renderCssIcon(iconClass: string): string {
        return `<span class="css-icon ${iconClass}"></span>`;
    }

    private getGeneratedIconAsset(iconClass: string): string {
        return getGeneratedIconAsset(iconClass);
    }

    private getResourceIconClass(resource: string): string {
        return getResourceIconClassName(resource);
    }

    private renderBuildingItem(id: string, fallbackName: string): string {
        const building = BuildingManager.getById(id);
        if (!building) {
            return `<div class="item"><b>${fallbackName}</b><br>配置缺失<br><span class="tag warn">不可用</span></div>`;
        }
        const canUpgrade = building.level < building.maxLevel && ResourceManager.canSpend({ coin: building.upgradeCost });
        const action = building.level >= building.maxLevel
            ? `<button class="tag warn" disabled>满级</button>`
            : canUpgrade
                ? `<button class="tag" data-action="upgradeBuilding" data-id="${id}">${this.formatNumber(building.upgradeCost)} 金币</button>`
                : `<button class="tag warn" disabled>${this.formatNumber(building.upgradeCost)} 金币</button>`;
        return `<div class="item"><b>${fallbackName}</b><br>Lv.${building.level}/${building.maxLevel}<br>${building.effectLabel} ${building.effectValue}%<br>${action}</div>`;
    }

    private getUpgradeableBuildingCount(): number {
        return BuildingManager.getAll().filter((building) => (
            building.level < building.maxLevel && ResourceManager.canSpend({ coin: building.upgradeCost })
        )).length;
    }

    private getClaimableTaskCount(): number {
        return TaskManager.getActiveTasks().filter(({ config, data }) => (
            data.currentValue >= config.goalValue && !data.isClaimed
        )).length;
    }

    private getRecruitableCatCount(): number {
        return CatManager.getAllConfigs().filter((config) => {
            const data = CatManager.getCatData(config.id);
            const cost = CatModel.calculateUnlockCost(config.rarity);
            return !data.isUnlocked && ResourceManager.canSpend({ coin: cost });
        }).length;
    }

    private renderInventoryPanel(): string {
        const ownedCount = InventoryManager.getOwnedItems().reduce((sum, item) => sum + item.count, 0);
        const ownedTypes = InventoryManager.getOwnedItems().filter(item => this.inventoryItemMatchesTab(item.itemId)).length;
        const resourceTypes = this._domInventoryTab === "all" || this._domInventoryTab === "resource" ? 4 : 0;
        const previewCount = this._domInventoryTab === "all" ? Math.max(0, 20 - resourceTypes - ownedTypes) : 0;
        return `<div class="panel-shell inventory-shell"><h2>背包详情</h2><div class="tabs">${INVENTORY_TABS.map(tab => `<button class="tab ${this._domInventoryTab === tab.id ? "active" : ""}" data-action="inventoryTab" data-tab="${tab.id}">${tab.label}</button>`).join("")}</div><div class="list bag-grid">${this.renderInventoryItems()}${this.renderInventoryPreviewCards(previewCount)}</div><div class="bag-detail-target"><span class="bag-detail-icon asset" style="background-image:url('${this.getGeneratedIconAsset("bean")}')"></span><div><b>${this.getInventoryTabLabel()}</b><strong>拥有：${ownedCount}</strong><p>${this.getInventoryTabDesc()}</p><small>主要获取途径：商店购买、订单奖励、好友赠礼</small></div></div></div>`;
    }

    private getInventoryTabLabel(): string {
        return getInventoryTabLabelText(this._domInventoryTab);
    }

    private getInventoryTabDesc(): string {
        return getInventoryTabDescription(this._domInventoryTab);
    }

    private renderInventoryItems(): string {
        const items = InventoryManager.getOwnedItems();
        const includeResources = this._domInventoryTab === "all" || this._domInventoryTab === "resource";
        const resourceCards = includeResources
            ? this.renderResourceBagCard("bean", "咖啡豆", ResourceManager.get("bean"))
                + this.renderResourceBagCard("catFood", "猫粮", ResourceManager.get("catFood"))
                + this.renderResourceBagCard("diamond", "钻石", ResourceManager.get("diamond"))
                + this.renderResourceBagCard("coin", "金币", ResourceManager.get("coin"))
            : "";
        const filteredItems = items.filter(item => this.inventoryItemMatchesTab(item.itemId));
        if (filteredItems.length === 0) {
            return resourceCards || `<div class="item bag-card empty"><div class="bag-icon asset" style="background-image:url('${this.getGeneratedIconAsset("gift")}')">${this.renderCssIcon("gift")}</div><b>暂无物品</b><br>该分类还没有可展示内容</div>`;
        }
        const itemCards = filteredItems.map(item => {
            const usable = item.itemId === "item_cat_food_pack" || item.itemId === "item_coin_pack_small";
            const action = usable
                ? `<button class="tag" data-action="use" data-id="${item.itemId}">使用</button>`
                : `<span class="tag warn">材料</span>`;
            const icon = this.getItemIconClass(item.itemId);
            const displayName = ConfigManager.items.find(config => config.id === item.itemId)?.name
                ?? CatManager.getEquipmentConfig(item.itemId)?.name
                ?? this.getItemDisplayName(item.itemId);
            return `<div class="item bag-card ${usable ? "usable" : ""}"><div class="bag-icon asset" style="background-image:url('${this.getGeneratedIconAsset(icon)}')">${this.renderCssIcon(icon)}</div><b>${displayName}</b>${action}<span class="bag-count">x${item.count}</span></div>`;
        }).join("");
        return `${resourceCards}${itemCards}`;
    }

    private renderResourceBagCard(resource: string, label: string, amount: number): string {
        const icon = this.getResourceIconClass(resource);
        return `<div class="item bag-card resource ${resource === "bean" ? "selected" : ""}"><div class="bag-icon asset" style="background-image:url('${this.getGeneratedIconAsset(icon)}')">${this.renderCssIcon(icon)}</div><b>${label}</b><span class="bag-count">${this.formatNumber(amount)}</span></div>`;
    }

    private renderInventoryPreviewCards(count: number): string {
        if (this._domInventoryTab !== "all" || count <= 0) return "";
        return INVENTORY_PREVIEW_CARDS.slice(0, count).map(([name, icon, itemCount]) => `<div class="item bag-card preview"><div class="bag-icon asset" style="background-image:url('${this.getGeneratedIconAsset(icon)}')"></div><b>${name}</b><span class="bag-count">${itemCount}</span></div>`).join("");
    }

    private getItemIconClass(itemId: string): string {
        return getItemIconClassName(itemId);
    }

    private inventoryItemMatchesTab(itemId: string): boolean {
        if (this._domInventoryTab === "all") return true;
        const config = ConfigManager.items.find(item => item.id === itemId);
        if (!config) return this._domInventoryTab === "other";
        if (this._domInventoryTab === "resource") return config.type === "resource";
        if (this._domInventoryTab === "shard") return config.type === "shard";
        return config.type !== "resource" && config.type !== "shard";
    }

    private renderResearchPanel(): string {
        const configs = ResearchManager.getAllConfigs();
        if (configs.length === 0) {
            return `<div class="panel-shell research-shell"><h2>研究详情</h2><div class="item">研究配置为空</div></div>`;
        }
        if (!configs.find(item => item.id === this._selectedResearchId)) {
            this._selectedResearchId = configs[0].id;
        }
        const selected = configs.find(item => item.id === this._selectedResearchId) ?? configs[0];
        return `<div class="panel-shell research-shell"><h2>研究详情</h2><div class="tabs"><button class="tab active">生产研究</button><button class="tab">经营研究</button><button class="tab">猫咪研究</button><button class="tab">特殊研究</button></div><div class="research-point-strip"><span>咖啡实验室</span><b>研究点 ${this.formatNumber(ResourceManager.get("researchPoint"))}</b></div><div class="list research-view"><div class="tree">${this.renderResearchLines(configs)}${configs.map((config, index) => this.renderResearchNode(config.id, index)).join("")}${this.renderResearchPlaceholderNodes(configs.length)}</div><div class="research-detail">${this.renderResearchDetail(selected.id)}</div></div></div>`;
    }

    private renderResearchLines(configs: ReturnType<typeof ResearchManager.getAllConfigs>): string {
        if (configs.length <= 1) return "";
        return configs.slice(1).map((_, index) => {
            const left = index % 2 === 0 ? 35 : 58;
            const top = 24 + index * 19;
            return `<div class="tree-line" style="left:${left}%;top:${top}%;width:24%"></div>`;
        }).join("");
    }

    private renderResearchNode(id: string, index: number): string {
        const config = ResearchManager.getAllConfigs().find(item => item.id === id);
        if (!config) return "";
        const pos = RESEARCH_NODE_POSITIONS[index] ?? RESEARCH_NODE_POSITIONS[RESEARCH_NODE_POSITIONS.length - 1];
        const done = ResearchManager.isUnlocked(id);
        const canUnlock = ResearchManager.canUnlock(id);
        const selected = id === this._selectedResearchId;
        const cls = `${done ? "done" : ""} ${!done && !canUnlock ? "locked" : ""} ${selected ? "selected" : ""}`;
        const state = done ? "已完成" : canUnlock ? `${config.cost}点` : "未解锁";
        return `<button class="node ${cls}" style="left:${pos.left}%;top:${pos.top}%" data-action="selectResearch" data-id="${id}"><span class="node-icon"></span><span>${config.name}<br>${state}</span></button>`;
    }

    private renderResearchPlaceholderNodes(startIndex: number): string {
        return RESEARCH_PLACEHOLDER_LABELS.map((label, offset) => {
            const pos = RESEARCH_PLACEHOLDER_POSITIONS[offset];
            const index = startIndex + offset;
            if (index < 3) return "";
            return `<div class="node locked" style="left:${pos.left}%;top:${pos.top}%"><span class="node-icon"></span><span>${label}<br>未开放</span></div>`;
        }).join("");
    }

    private renderResearchDetail(id: string): string {
        const config = ResearchManager.getAllConfigs().find(item => item.id === id);
        if (!config) return `<div class="item">研究节点不存在</div>`;
        const status = ResearchManager.isUnlocked(id) ? "已解锁" : ResearchManager.canUnlock(id) ? "可研究" : "前置未完成";
        const parent = config.parentResearchId ? ResearchManager.getAllConfigs().find(item => item.id === config.parentResearchId)?.name ?? config.parentResearchId : "无";
        const effectText = `${this.getResearchEffectLabel(config.effectType)} ${config.effectValue > 0 ? "+" : ""}${config.effectValue}%`;
        const owned = ResourceManager.get("researchPoint");
        const progress = Math.min(100, Math.floor((owned / Math.max(1, config.cost)) * 100));
        const nextHint = ResearchManager.isUnlocked(id) ? "已加入全局加成" : progress >= 100 ? "资源已备齐" : "继续收集研究点";
        return `<div class="item research-hero"><div class="shop-icon">${this.renderCssIcon(this.getResearchIconClass(config.effectType))}</div><div><b>${config.name}</b><br>${config.description}<br><span class="research-state">${status}</span></div></div><div class="item"><b>当前效果</b><br><span class="effect-pill">${this.renderCssIcon(this.getResearchIconClass(config.effectType))}${effectText}</span><div class="research-preview"><span>节点状态<br>${status}</span><span>解锁反馈<br>${nextHint}</span></div></div><div class="item"><b>研究条件</b><br>前置：${parent}<div class="research-cost">研究点：${this.formatNumber(owned)}/${config.cost}<div class="research-cost-line"><i style="width:${progress}%"></i></div></div>${this.renderResearchButton(config.id, config.cost)}</div>`;
    }

    private getResearchIconClass(effectType: string): string {
        return getResearchIconClassName(effectType);
    }

    private getResearchEffectLabel(type: string): string {
        return getResearchEffectLabelText(type);
    }

    private renderResearchButton(id: string, cost: number): string {
        if (ResearchManager.isUnlocked(id)) {
            return `<span class="tag">已解锁</span>`;
        }
        if (!ResearchManager.canUnlock(id)) {
            return `<span class="tag warn">前置未满</span>`;
        }
        if (!ResourceManager.canSpend({ researchPoint: cost })) {
            return `<button class="tag warn" disabled>研究点不足</button>`;
        }
        return `<button class="tag" data-action="research" data-id="${id}">${this.renderCssIcon("equip")} ${cost} 研究点</button>`;
    }

    private ensureDomHudOverlay(): HTMLElement | null {
        if (typeof document === "undefined") return null;
        if (this._domHudOverlay) return this._domHudOverlay;

        const overlay = document.createElement("div");
        overlay.id = "fatcat-dom-hud";
        const style = document.createElement("style");
        style.textContent = DOM_HUD_STYLES;
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        this._domHudOverlay = overlay;
        return overlay;
    }

    private renderDomHudOverlay(force = false): void {
        const overlay = this.ensureDomHudOverlay();
        if (!overlay) return;
        const canvas = document.querySelector("canvas");
        if (!canvas) return;

        const resources = ResourceManager.getAll();
        const snapshot = ProductionManager.calculateSnapshot();
        const nextText = [
            resources.coin,
            resources.bean,
            resources.catFood,
            resources.diamond,
            snapshot.coinPerSecond,
            snapshot.grossCoinPerSecond,
            snapshot.wageCostPerSecond,
            snapshot.beanCostPerSecond,
            this._factoryMessage,
            this.currentPanel,
        ].join("|");
        if (!force && nextText === this._hudText) {
            this.layoutDomHudOverlay();
            return;
        }
        this._hudText = nextText;
        overlay.innerHTML = `
            <div class="hud-inner">
                <div class="player">
                        <div class="avatar asset" style="background-image:url('${this.getCatFullArtAsset("c_001")}')"></div><div class="level">${HUD_PLAYER_LEVEL}</div>
                    <div>
                        <div class="company">${HUD_COMPANY_NAME}</div>
                        <div class="exp"><span style="width:${HUD_EXP_PERCENT}%"></span></div>
                        <div class="exp-text">${HUD_EXP_TEXT}</div>
                    </div>
                </div>
                <div class="resources">
                    ${HUD_RESOURCE_ITEMS.map(item => this.renderHudResource(item.kind, item.label, this.formatNumber(resources[item.resourceKey]))).join("")}
                </div>
                ${this._factoryMessage && this.currentPanel === "factory" ? `<div class="factory-msg">${this._factoryMessage}</div>` : ""}
            </div>`;
        this.layoutDomHudOverlay();
    }

    private renderHudResource(kind: HudResourceKind, label: string, value: string): string {
        return `<div class="res ${kind}" aria-label="${label} ${value}"><div class="icon asset" style="background-image:url('${this.getGeneratedIconAsset(kind)}')" aria-hidden="true"></div><div class="res-name">${label}</div><div class="value">${value}</div><div class="plus">+</div></div>`;
    }

    private ensureDomNavOverlay(): HTMLElement | null {
        if (typeof document === "undefined") return null;
        if (this._domNavOverlay) return this._domNavOverlay;

        const overlay = document.createElement("div");
        overlay.id = "fatcat-dom-nav";
        const style = document.createElement("style");
        style.textContent = DOM_NAV_STYLES;
        document.head.appendChild(style);
        overlay.addEventListener("pointerdown", this.onDomNavPointerDown);
        document.body.appendChild(overlay);
        this._domNavOverlay = overlay;
        return overlay;
    }

    private onDomNavPointerDown = (event: PointerEvent): void => {
        const target = event.target as HTMLElement | null;
        const button = target?.closest("button[data-panel]") as HTMLButtonElement | null;
        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        const panel = button.dataset.panel as MainPanelId | undefined;
        if (panel) {
            this.select(panel);
        }
    };

    private renderDomNavOverlay(force = false): void {
        const overlay = this.ensureDomNavOverlay();
        if (!overlay) return;

        const canvas = document.querySelector("canvas");
        if (!canvas) return;
        if (this.currentPanel === "cats") {
            overlay.style.display = "none";
            overlay.dataset.current = "cats-hidden";
            return;
        }
        overlay.style.display = "block";

        const recruitableCats = this.getRecruitableCatCount();
        const upgradeableBuildings = this.getUpgradeableBuildingCount();
        const shopHints = ShopManager.getRemainingLimit("shop_cat_food_1") > 0 ? 1 : 0;
        const next = `${this.currentPanel}|${recruitableCats}|${upgradeableBuildings}|${shopHints}`;
        if (!force && overlay.dataset.current === next) {
            this.layoutDomNavOverlay();
            return;
        }
        overlay.dataset.current = next;
        const badges: Partial<Record<MainPanelId, string>> = {
            cats: recruitableCats > 0 ? String(recruitableCats) : undefined,
            buildings: upgradeableBuildings > 0 ? String(upgradeableBuildings) : undefined,
            shop: shopHints > 0 ? "!" : undefined,
        };
        overlay.innerHTML = `<div class="nav-bar">${MAIN_DOM_NAV_ITEMS.map((item) => `
            <button type="button" class="nav-item ${this.currentPanel === item.id ? "active" : ""}" data-panel="${item.id}">
                ${badges[item.id] ? `<div class="badge">${badges[item.id]}</div>` : ""}
                <div class="nav-icon asset ${item.iconClass}" style="background-image:url('${this.getMainNavIconAsset(item.id)}')"></div>
                <div class="nav-label">${item.label}</div>
            </button>`).join("")}</div>`;
        this.layoutDomNavOverlay();
    }

    private getMainNavIconAsset(panel: MainPanelId): string {
        if (panel === "cats") return this.getCatFullArtAsset("c_001");
        return this.getFeatureIconAsset(MAIN_NAV_FEATURE_ICON_BY_PANEL[panel] ?? "research");
    }

    private layoutDomNavOverlay(): void {
        if (typeof document === "undefined" || !this._domNavOverlay) return;
        const canvas = document.querySelector("canvas");
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        this.applyResponsiveOverlayBounds(this._domNavOverlay, rect);
    }

    private layoutDomHudOverlay(): void {
        if (typeof document === "undefined" || !this._domHudOverlay) return;
        const canvas = document.querySelector("canvas");
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        this.applyResponsiveOverlayBounds(this._domHudOverlay, rect);
    }

    private formatNumber(value: number): string {
        return formatDisplayNumber(value);
    }

    private formatRate(value: number): string {
        return formatRateValue(value);
    }

    private layoutDomPanelOverlay(): void {
        if (typeof document === "undefined" || !this._domPanelOverlay) return;
        const canvas = document.querySelector("canvas");
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const aspect = rect.width / Math.max(1, rect.height);
        const compact = rect.width < 520 || aspect < 0.58;
        const widthRatio = compact ? 0.965 : aspect > 0.68 ? 0.84 : 0.92;
        const heightRatio = compact ? 0.825 : aspect > 0.68 ? 0.78 : 0.80;
        this.applyResponsiveOverlayBounds(this._domPanelOverlay, rect, {
            left: (1 - widthRatio) * 0.5,
            top: compact ? 0.095 : 0.105,
            width: widthRatio,
            height: heightRatio,
        });
    }

    private setCatOverlayVisible(visible: boolean): void {
        const overlay = this.ensureCatOverlay();
        if (!overlay) return;

        overlay.setPosition(visible ? 0 : 20000, 0);
        if (visible && overlay.parent) {
            overlay.setSiblingIndex(overlay.parent.children.length - 1);
        }
    }

    private setDomCatOverlayVisible(visible: boolean): void {
        if (typeof document === "undefined") return;
        const overlay = this.ensureDomCatOverlay();
        if (!overlay) return;
        overlay.style.display = visible ? "block" : "none";
        if (visible) {
            this.renderDomCatOverlay();
        }
        this.layoutDomCatOverlay();
    }

    private ensureDomCatOverlay(): HTMLElement | null {
        if (typeof document === "undefined") return null;
        if (this._domCatOverlay) return this._domCatOverlay;

        const overlay = document.createElement("div");
        overlay.id = "fatcat-dom-cat-overlay";
        const style = document.createElement("style");
        style.textContent = `
            #fatcat-dom-cat-overlay { position: fixed; z-index: 2147483300; display: none; pointer-events: none; color: #fff3d8; font-family: Arial, sans-serif; overflow: visible; }
            #fatcat-dom-cat-overlay:before { content:""; position:absolute; inset:0; background:radial-gradient(circle at 50% 18%, rgba(255,205,122,.1), transparent 34%), rgba(20,13,10,.82); pointer-events:none; }
            #fatcat-dom-cat-overlay .cat-bg { position: absolute; inset: 0; background: linear-gradient(rgba(38,27,20,.08), rgba(38,27,20,.18)), linear-gradient(135deg,#7b5234,#2a1d15); border: 0; box-sizing: border-box; padding: 8.9% 2.7% 16.2% 11.5%; border-radius: 0; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; pointer-events: auto; scrollbar-width: none; box-shadow: inset 0 0 0 3px rgba(255,231,181,.12), inset 0 -30px 56px rgba(28,18,13,.28); }
            #fatcat-dom-cat-overlay .cat-bg::-webkit-scrollbar { width: 0; height: 0; }
            #fatcat-dom-cat-overlay .cat-art-bg { position: absolute; inset: 0; background-color:#3b261b; background-image: radial-gradient(circle at 52% 22%, rgba(255,199,107,.24), transparent 24%), radial-gradient(circle at 80% 17%, rgba(120,184,220,.16), transparent 18%), linear-gradient(rgba(28,18,13,.18),rgba(28,18,13,.52)); background-size: 100% 100%; background-repeat: no-repeat; background-position: center; filter: saturate(1.05) contrast(1.02) brightness(.9); opacity:.82; }
            #fatcat-dom-cat-overlay .cat-art-bg:before { content:""; position:absolute; left:11%; right:4%; top:9%; height:21%; border-radius:18px; background:radial-gradient(circle at 20% 18%, rgba(255,218,128,.22), transparent 12%), radial-gradient(circle at 62% 18%, rgba(255,218,128,.18), transparent 13%), linear-gradient(90deg, transparent 0 24%, rgba(45,30,21,.28) 24% 25%, transparent 25% 50%, rgba(45,30,21,.28) 50% 51%, transparent 51% 76%, rgba(45,30,21,.28) 76% 77%, transparent 77%); box-shadow:inset 0 -10px 18px rgba(24,15,10,.18); }
            #fatcat-dom-cat-overlay .cat-art-bg:after { content:""; position:absolute; right:5%; top:10%; width:16%; height:23%; border-radius:12px; background:linear-gradient(rgba(191,233,255,.48),rgba(127,176,209,.38)); box-shadow:inset 0 0 0 3px rgba(62,40,25,.38); opacity:.45; }
            #fatcat-dom-cat-overlay .cat-bg::before { content: ""; position: absolute; left: 9%; right: 0; top: 0; height: 34%; background: radial-gradient(ellipse at 48% 4%, rgba(255,221,136,.32), transparent 34%), linear-gradient(rgba(255,224,150,.16), rgba(255,202,115,0)); opacity: .82; }
            #fatcat-dom-cat-overlay .cat-bg::after { content: ""; position: absolute; left: 10%; right: 2%; top: 13%; height: 25%; border-radius: 12px; background: radial-gradient(circle at 50% 48%, rgba(237,158,77,.18) 0 10%, transparent 11%); box-shadow: inset 0 -6px 0 rgba(44,29,22,.12); }
            #fatcat-dom-cat-overlay .cat-bg:has(.cat-side)::selection { background: rgba(236,171,73,.35); }
            #fatcat-dom-cat-overlay .cat-bg > * { position: relative; z-index: 1; }
            #fatcat-dom-cat-overlay .cat-page-hud { position:absolute; z-index:6; left:1.6%; right:1.6%; top:.8%; height:7.0%; display:grid; grid-template-columns:26% repeat(4,1fr); gap:1.1%; align-items:stretch; pointer-events:none; font-size:2%; }
            #fatcat-dom-cat-overlay .cat-page-hud .player { position:relative; height:100%; min-height:0; box-sizing:border-box; border-radius:18px; background:linear-gradient(#e9d0a5,#8a6a4b); border:3px solid #5a402b; color:#3d281c; font-size:.96em; line-height:1; font-weight:900; display:grid; grid-template-columns:34% 1fr; align-items:center; padding:4px 10px; box-shadow:0 4px 0 rgba(0,0,0,.3), inset 0 0 0 2px rgba(255,248,220,.36); }
            #fatcat-dom-cat-overlay .cat-page-hud .player span { display:flex; min-width:0; flex-direction:column; justify-content:center; gap:5px; white-space:nowrap; overflow:hidden; }
            #fatcat-dom-cat-overlay .cat-page-hud .avatar { width:min(42px,88%); aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 34% 45%,#3d281d 0 6%,transparent 7%), radial-gradient(circle at 66% 45%,#3d281d 0 6%,transparent 7%), linear-gradient(#f3c27e,#d27c37); box-shadow:0 0 0 3px #7a5131 inset, 0 3px 0 rgba(0,0,0,.2); }
            #fatcat-dom-cat-overlay .cat-page-hud .level { position:absolute; left:2%; bottom:-10%; width:min(30px,24%); aspect-ratio:1; border-radius:50%; background:linear-gradient(#f0b04a,#9c5a1b); color:white; display:flex; align-items:center; justify-content:center; border:3px solid #5c351d; font-size:.88em; }
            #fatcat-dom-cat-overlay .cat-page-hud .exp { height:7px; border-radius:999px; background:#3f2a1c; overflow:hidden; box-shadow:inset 0 0 0 1px rgba(0,0,0,.3); }
            #fatcat-dom-cat-overlay .cat-page-hud .exp i { display:block; width:80%; height:100%; background:linear-gradient(#ffd65c,#d98d1f); }
            #fatcat-dom-cat-overlay .cat-page-hud .res { position:relative; height:100%; min-height:0; box-sizing:border-box; border-radius:999px; background:linear-gradient(rgba(71,50,35,.96),rgba(31,23,18,.96)); border:3px solid #8a6a48; display:flex; align-items:center; justify-content:center; gap:6%; color:#fff5dd; font-size:1.08em; line-height:1; font-weight:900; box-shadow:0 4px 0 rgba(0,0,0,.32), inset 0 0 0 2px rgba(255,232,184,.1); }
            #fatcat-dom-cat-overlay .cat-page-hud .res i { width:min(28px,24%); aspect-ratio:1; flex:0 0 auto; border-radius:50%; background:linear-gradient(#ffd75c,#d58918); box-shadow:inset 0 0 0 3px rgba(98,61,17,.35); }
            #fatcat-dom-cat-overlay .cat-page-hud .bean i { border-radius:52% 48% 50% 50%; background:linear-gradient(135deg,#8a4b24,#4d2816); transform:rotate(24deg); }
            #fatcat-dom-cat-overlay .cat-page-hud .food i { border-radius:0 0 38% 38%; background:linear-gradient(#f4ead7 0 35%,#9f5a22 36%); }
            #fatcat-dom-cat-overlay .cat-page-hud .gem i { border-radius:28%; background:linear-gradient(135deg,#e4b7ff,#7938c9); transform:rotate(45deg); }
            #fatcat-dom-cat-overlay .cat-page-hud .plus { position:absolute; right:-2%; width:min(28px,24%); aspect-ratio:1; border-radius:8px; background:linear-gradient(#ffbd4f,#d46f1f); color:white; display:flex; align-items:center; justify-content:center; border:2px solid #683919; font-size:1.1em; }
            #fatcat-dom-cat-overlay .cat-modal-title { display:none; }
            #fatcat-dom-cat-overlay .close-x { position:absolute; z-index:5; right:1.7%; top:1.1%; width:6.4%; min-width:46px; aspect-ratio:1; border-radius:50%; background:linear-gradient(#f7ce71,#d48626); color:white; border:3px solid #5b351d; font-size:3.4%; font-weight:900; line-height:1; box-shadow:0 4px 0 rgba(0,0,0,.3), inset 0 0 0 2px rgba(255,238,193,.2); }
            #fatcat-dom-cat-overlay .cat-side { position: absolute; left: 1.65%; top: 10.1%; width: 8.4%; display: grid; gap: 1.15%; padding:.8% .55%; border-radius:18px; background:linear-gradient(rgba(82,58,42,.78),rgba(45,32,25,.82)); border:2px solid rgba(238,198,126,.22); box-shadow:0 6px 0 rgba(22,14,10,.24), inset 0 0 0 2px rgba(255,239,201,.06); }
            #fatcat-dom-cat-overlay .cat-side:before { content:""; position:absolute; left:12%; right:12%; top:1%; height:7%; border-radius:999px; background:linear-gradient(90deg, rgba(255,243,205,.28), rgba(255,243,205,0)); pointer-events:none; }
            #fatcat-dom-cat-overlay .cat-overview-head { display:none; grid-template-columns:repeat(4,1fr); gap:1.1%; margin:0 0 1.1%; }
            #fatcat-dom-cat-overlay .cat-overview-head div { min-height:58px; border-radius:14px; background:linear-gradient(rgba(91,65,45,.94),rgba(49,34,25,.94)); border:3px solid rgba(233,188,112,.36); color:#fff5d8; display:flex; align-items:center; justify-content:center; flex-direction:column; font-size:1.75%; font-weight:900; box-shadow:0 4px 0 rgba(0,0,0,.25), inset 0 0 0 2px rgba(255,236,190,.08); }
            #fatcat-dom-cat-overlay .cat-overview-head b { color:#ffffff; font-size:142%; line-height:1; text-shadow:0 2px rgba(0,0,0,.28); }
            #fatcat-dom-cat-overlay .cat-overview-head span { margin-top:4px; color:#f4d6a5; font-size:82%; }
            #fatcat-dom-cat-overlay button { border: 0; font: inherit; cursor: pointer; pointer-events: auto; }
            #fatcat-dom-cat-overlay .back, #fatcat-dom-cat-overlay .side-tab { min-height: 60px; border-radius: 14px; background: linear-gradient(#927657,#50392a); border: 3px solid #3b2b20; color:#fff3d8; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 1.9%; font-weight: 900; box-shadow: 0 4px 0 rgba(0,0,0,.32), inset 0 0 0 2px rgba(255,235,190,.1); transition:transform .12s ease, filter .12s ease; }
            #fatcat-dom-cat-overlay .back:active, #fatcat-dom-cat-overlay .side-tab:active { transform:translateY(2px); filter:brightness(.96); }
            #fatcat-dom-cat-overlay .back { font-size: 6%; }
            #fatcat-dom-cat-overlay .side-tab { flex-direction:column; gap:5%; }
            #fatcat-dom-cat-overlay .side-tab i { position:relative; width:44%; aspect-ratio:1; border-radius:10px; background:#f2ddb7; box-shadow:inset 0 0 0 2px rgba(88,58,32,.2); }
            #fatcat-dom-cat-overlay .side-tab i:before, #fatcat-dom-cat-overlay .side-tab i:after { content:""; position:absolute; }
            #fatcat-dom-cat-overlay .side-tab.active { background: linear-gradient(#ffd47a,#d68b29); color: #fff; box-shadow:0 0 18px rgba(242,168,45,.42), 0 4px 0 rgba(105,59,18,.42), inset 0 0 0 2px rgba(255,249,224,.24); }
            #fatcat-dom-cat-overlay .side-tab.active:after { content:""; position:absolute; right:-9%; top:34%; width:0; height:0; border-top:9px solid transparent; border-bottom:9px solid transparent; border-left:10px solid #d68b29; filter:drop-shadow(2px 1px 0 rgba(57,34,18,.26)); }
            #fatcat-dom-cat-overlay .tab-info i:before { left:21%; top:19%; width:58%; height:58%; border-radius:50%; background:#d9904d; box-shadow:inset 0 0 0 3px #75472a; }
            #fatcat-dom-cat-overlay .tab-info i:after { left:36%; top:39%; width:28%; height:22%; border-radius:50%; background:radial-gradient(circle at 25% 45%,#3d281d 0 18%,transparent 19%), radial-gradient(circle at 75% 45%,#3d281d 0 18%,transparent 19%); }
            #fatcat-dom-cat-overlay .tab-upgrade i:before { left:40%; top:18%; width:20%; height:62%; background:#77a94a; }
            #fatcat-dom-cat-overlay .tab-upgrade i:after { left:26%; top:16%; width:48%; height:34%; clip-path:polygon(50% 0,100% 100%,0 100%); background:#77a94a; }
            #fatcat-dom-cat-overlay .tab-skill i:before { inset:18%; border-radius:50%; background:radial-gradient(circle,#ffe66a 0 18%,#d8871e 19% 55%,transparent 56%); box-shadow:0 0 9px #ffc857; }
            #fatcat-dom-cat-overlay .tab-equip i:before { inset:20%; border-radius:50%; background:radial-gradient(circle at 50% 54%, transparent 0 35%, #617b50 36% 57%, #34442b 58%); box-shadow:inset 0 0 0 4px #8e9d79; }
            #fatcat-dom-cat-overlay .tab-skin i:before { left:22%; right:22%; top:18%; height:58%; border-radius:46% 46% 28% 28%; background:#f0c188; box-shadow:inset 0 0 0 3px #875430; }
            #fatcat-dom-cat-overlay .cat-hero { display: grid; grid-template-columns: 23% 1fr 22%; gap: 2%; align-items: start; margin-top:0; }
            #fatcat-dom-cat-overlay .cat-card, #fatcat-dom-cat-overlay .cat-portrait, #fatcat-dom-cat-overlay .cat-power, #fatcat-dom-cat-overlay .cat-stats, #fatcat-dom-cat-overlay .cat-weight, #fatcat-dom-cat-overlay .cat-grid > div, #fatcat-dom-cat-overlay .cat-list, #fatcat-dom-cat-overlay .cat-story { background: radial-gradient(circle at 18% 14%, rgba(255,255,255,.34), transparent 16%), repeating-linear-gradient(135deg, rgba(120,82,45,.045) 0 2px, transparent 2px 7px), linear-gradient(rgba(255,248,230,.94), rgba(225,192,140,.94)); color: #4a2f1f; border: 3px solid #7b5636; border-radius: 14px; box-shadow: inset 0 0 0 2px rgba(255,250,224,.45), inset 0 -12px 22px rgba(143,91,42,.1), 0 5px 0 rgba(0,0,0,.25); box-sizing: border-box; }
            #fatcat-dom-cat-overlay .cat-card { position:relative; padding: 7%; font-size: 2.4%; line-height: 1.45; overflow:hidden; }
            #fatcat-dom-cat-overlay .cat-card:after { content:""; position:absolute; left:7%; right:7%; top:7%; height:2px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.62),transparent); opacity:.72; }
            #fatcat-dom-cat-overlay .cat-card.info { min-height:168px; background:radial-gradient(circle at 18% 12%, rgba(255,255,255,.42), transparent 18%), repeating-linear-gradient(135deg, rgba(120,82,45,.05) 0 2px, transparent 2px 8px), linear-gradient(#fff7df,#e7c18d); }
            #fatcat-dom-cat-overlay .cat-card.info:before { content:""; position:absolute; right:-12%; top:-18%; width:54%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle,rgba(240,165,28,.22),rgba(240,165,28,0) 68%); }
            #fatcat-dom-cat-overlay .cat-card.info strong { display:inline-flex; align-items:center; max-width:100%; box-sizing:border-box; min-height:34px; padding:0 12%; border-radius:999px; background:rgba(255,252,232,.72); white-space:nowrap; word-break:keep-all; box-shadow:inset 0 0 0 2px rgba(121,82,45,.16), 0 2px 0 rgba(92,56,28,.12); }
            #fatcat-dom-cat-overlay .cat-card.info strong:after { content:""; flex:0 0 auto; width:18px; height:18px; margin-left:8px; border-radius:4px; background:linear-gradient(135deg, transparent 0 42%, #8a623d 43% 57%, transparent 58%), linear-gradient(#f6d28b,#c58b42); box-shadow:inset 0 0 0 2px rgba(112,70,32,.18); }
            #fatcat-dom-cat-overlay .cat-card strong { font-size: 140%; }
            #fatcat-dom-cat-overlay .rank { font-size: 250%; color: #f3a51c; font-weight: 900; }
            #fatcat-dom-cat-overlay .type { background: #68a84a; color: white; padding: 1% 5%; border-radius: 999px; font-weight: 900; }
            #fatcat-dom-cat-overlay .cat-portrait { position: relative; height: 34%; min-height: 342px; display: flex; align-items: center; justify-content: center; flex-direction: column; font-size: 7%; font-weight: 900; background: radial-gradient(circle at 50% 76%, rgba(246,194,123,.66) 0 26%, transparent 27%), linear-gradient(rgba(250,225,184,.32),rgba(230,192,136,.68)); overflow: hidden; }
            #fatcat-dom-cat-overlay .cat-portrait:before { content:""; position:absolute; inset:3%; border-radius:12px; background-image:linear-gradient(rgba(39,25,17,.12),rgba(39,25,17,.32)), url("${this.getDomAssetDataUri(GeneratedBackgroundAssets.catDetailWorkshop)}"); background-size:cover; background-position:center 42%; opacity:.74; filter:saturate(1.08) brightness(1.02); }
            #fatcat-dom-cat-overlay .cat-portrait:after { content:""; position:absolute; left:13%; right:13%; bottom:9%; height:24%; border-radius:50%; background:radial-gradient(ellipse,rgba(77,45,24,.38),rgba(77,45,24,0) 70%); box-shadow:0 -18px 48px rgba(255,198,96,.1); }
            #fatcat-dom-cat-overlay .portrait-cat { position: relative; z-index:2; width: 34%; min-width: 108px; aspect-ratio: .92; margin-top: 1%; filter: drop-shadow(0 7px 0 rgba(72,45,28,.24)); }
            #fatcat-dom-cat-overlay .portrait-cat::before { content: ""; position: absolute; left: 17%; right: 17%; bottom: 2%; height: 64%; border-radius: 48% 48% 38% 38%; background: radial-gradient(circle at 34% 28%, #fff2d5 0 13%, transparent 14%), radial-gradient(circle at 67% 28%, #fff2d5 0 13%, transparent 14%), linear-gradient(#f1a14b,#d17b35); box-shadow: inset -13px -9px 0 rgba(111,62,30,.14); }
            #fatcat-dom-cat-overlay .portrait-cat::after { content: ""; position: absolute; left: 23%; top: 2%; width: 54%; height: 50%; border-radius: 50%; background: radial-gradient(circle at 35% 45%, #3f271b 0 5%, transparent 6%), radial-gradient(circle at 65% 45%, #3f271b 0 5%, transparent 6%), radial-gradient(circle at 50% 59%, #8b4a2a 0 6%, transparent 7%), linear-gradient(#ffd198,#df8c42); box-shadow: -16px -11px 0 -8px #6b4228, 16px -11px 0 -8px #6b4228, inset 10px -4px 0 rgba(255,255,255,.3); }
            #fatcat-dom-cat-overlay .portrait-cat.img { width: 72%; min-width: 232px; background: center/contain no-repeat; aspect-ratio: 1; }
            #fatcat-dom-cat-overlay .portrait-cat.img::before, #fatcat-dom-cat-overlay .portrait-cat.img::after { display: none; }
            #fatcat-dom-cat-overlay .portrait-name { position:relative; z-index:2; margin-top: -1%; font-size: 68%; color: #4a2f1f; text-shadow: 0 2px #fff0cd; }
            #fatcat-dom-cat-overlay .cat-portrait span { position:relative; z-index:2; margin-top: 1%; padding: 1.5% 4%; border-radius: 12px; background: #fff2d5; border:2px solid rgba(117,82,47,.25); font-size: 28%; font-weight: 700; }
            #fatcat-dom-cat-overlay .cat-portrait .cat-talk { position:absolute; z-index:3; right:7%; top:9%; max-width:40%; text-align:left; box-shadow:0 3px 0 rgba(91,59,31,.12); background:linear-gradient(#fff8e8,#f2d5a5); }
            #fatcat-dom-cat-overlay .cat-portrait .cat-talk:after { content:""; position:absolute; left:14%; bottom:-12px; width:0; height:0; border-left:10px solid transparent; border-right:10px solid transparent; border-top:14px solid #fff2d5; filter:drop-shadow(0 2px 0 rgba(91,59,31,.12)); }
            #fatcat-dom-cat-overlay .cat-profile-row { position:absolute; left:9%; right:9%; bottom:4%; display:grid; grid-template-columns:repeat(3,1fr); gap:1.5%; font-size:24%; }
            #fatcat-dom-cat-overlay .cat-profile-row em { padding:2.2% 3%; border-radius:999px; background:rgba(67,43,29,.82); color:#fff0c4; border:2px solid rgba(255,229,166,.22); font-style:normal; text-align:center; text-shadow:none; }
            #fatcat-dom-cat-overlay .cat-index { position:absolute; left:4%; top:5%; padding:1.2% 3.2%; border-radius:999px; background:rgba(66,42,28,.84); color:#ffe2a6; border:2px solid rgba(255,228,168,.26); font-size:24%; font-weight:900; }
            #fatcat-dom-cat-overlay .cat-switch { position:absolute; z-index:3; top:43%; width:8.5%; min-width:42px; aspect-ratio:1; border-radius:50%; background:linear-gradient(#ffe1a0,#d98c2b); color:#72411e; border:3px solid #7c4d2b; font-size:4.6%; font-weight:900; box-shadow:0 4px 0 rgba(82,49,25,.28), inset 0 0 0 2px rgba(255,247,214,.26); }
            #fatcat-dom-cat-overlay .cat-switch.prev { left:3.5%; }
            #fatcat-dom-cat-overlay .cat-switch.next { right:3.5%; }
            #fatcat-dom-cat-overlay .mood, #fatcat-dom-cat-overlay .feed { position:relative; margin-bottom: 6%; text-align: center; background:linear-gradient(#6b4b34,#3c2a20); color:#fff4d8; border-color:#9b744d; padding-top:22%; }
            #fatcat-dom-cat-overlay .mood:before, #fatcat-dom-cat-overlay .feed:before { content:""; position:absolute; left:50%; top:10%; width:25%; aspect-ratio:1; transform:translateX(-50%); border-radius:50%; background:linear-gradient(#ffd86f,#cc8322); box-shadow:inset 0 0 0 3px rgba(92,55,22,.26), 0 2px 0 rgba(0,0,0,.22); }
            #fatcat-dom-cat-overlay .mood:after { content:""; position:absolute; left:42%; top:17%; width:16%; height:9%; border-radius:0 0 999px 999px; border-bottom:3px solid #7b411c; box-shadow:-8px -5px 0 -5px #7b411c, 8px -5px 0 -5px #7b411c; }
            #fatcat-dom-cat-overlay .feed:before { border-radius:18% 18% 42% 42%; background:linear-gradient(#f5e6c8 0 30%,#c8843d 31%); }
            #fatcat-dom-cat-overlay .feed:after { content:""; position:absolute; left:43%; top:18%; width:14%; height:8%; border-radius:999px; background:#7b411c; box-shadow:9px 2px 0 -2px #7b411c, -9px 2px 0 -2px #7b411c; }
            #fatcat-dom-cat-overlay .mood strong, #fatcat-dom-cat-overlay .feed strong { color:#fff; font-size:155%; text-shadow:0 2px rgba(0,0,0,.32); }
            #fatcat-dom-cat-overlay .feed button, #fatcat-dom-cat-overlay .action-btn { margin-top: 6%; padding: 4% 12%; border-radius: 999px; background: linear-gradient(#82b94d,#4f8e32); color:white; font-weight:900; box-shadow:0 3px 0 rgba(39,74,24,.45); }
            #fatcat-dom-cat-overlay .feed button:disabled, #fatcat-dom-cat-overlay .action-btn:disabled { background:#8f8068; box-shadow:none; }
            #fatcat-dom-cat-overlay .cat-power { margin: 1.0% auto 1.0%; width: 42%; padding: .95%; text-align: center; background: linear-gradient(#6a482c,#372419); color: white; font-size: 3.1%; font-weight: 900; border-color:#9b744d; }
            #fatcat-dom-cat-overlay .cat-stats { display: grid; grid-template-columns: repeat(5,1fr); gap: .75%; padding: .95%; margin-top: .85%; font-size: 1.72%; text-align: center; }
            #fatcat-dom-cat-overlay .cat-stats div { min-height:54px; border-right:1px solid rgba(121,84,48,.18); display:flex; align-items:center; justify-content:center; flex-direction:column; gap:3%; border-radius:10px; background:radial-gradient(circle at 50% 0, rgba(255,255,255,.34), transparent 30%), linear-gradient(rgba(255,252,235,.46),rgba(215,177,117,.18)); box-shadow:inset 0 0 0 1px rgba(124,87,50,.1), 0 2px 0 rgba(82,51,27,.08); }
            #fatcat-dom-cat-overlay .cat-stats div:last-child { border-right:0; }
            #fatcat-dom-cat-overlay .cat-stats b { color:#3f281a; font-size:112%; }
            #fatcat-dom-cat-overlay .stat-icon { position:relative; display:block; width:23%; max-width:30px; aspect-ratio:1; margin-bottom:1%; filter:drop-shadow(0 2px 0 rgba(91,54,26,.22)); }
            #fatcat-dom-cat-overlay .stat-icon.bean { border-radius:52% 48% 50% 50%; background:linear-gradient(135deg,#8a4b24,#4d2816); transform:rotate(24deg); }
            #fatcat-dom-cat-overlay .stat-icon.food { border-radius:0 0 36% 36%; background:linear-gradient(#e8f1f8 0 42%,#b78c5a 43%); }
            #fatcat-dom-cat-overlay .stat-icon.coin { border-radius:50%; background:linear-gradient(#ffd75c,#d58918); box-shadow:inset 0 0 0 3px #9d6412; }
            #fatcat-dom-cat-overlay .stat-icon.weight { border-radius:50% 50% 42% 42%; background:linear-gradient(#94b6c5,#4d7a8c); }
            #fatcat-dom-cat-overlay .stat-icon.paw { border-radius:50%; background:radial-gradient(circle at 50% 62%,#6b4a35 0 18%,transparent 19%), radial-gradient(circle at 28% 34%,#6b4a35 0 14%,transparent 15%), radial-gradient(circle at 50% 25%,#6b4a35 0 14%,transparent 15%), radial-gradient(circle at 72% 34%,#6b4a35 0 14%,transparent 15%); }
            #fatcat-dom-cat-overlay .cat-weight { padding: 1.25% 1.55%; margin-top: .85%; font-size: 2.05%; }
            #fatcat-dom-cat-overlay .weight-row { display: grid; grid-template-columns: 15% 15% 15% 1fr 12%; gap: 1.1%; align-items: center; margin-top: 1.0%; }
            #fatcat-dom-cat-overlay .weight-row span { text-align: center; padding: 5% 0; border-radius: 999px; background: rgba(111,84,51,.2); font-weight: 900; box-shadow:inset 0 0 0 2px rgba(104,72,41,.12); }
            #fatcat-dom-cat-overlay .weight-row .selected { background: linear-gradient(#f0b84c,#ce8522); color: white; box-shadow:0 3px 0 rgba(112,63,18,.28); }
            #fatcat-dom-cat-overlay .bar { height: 28%; border-radius: 999px; background: #d8c49c; overflow: hidden; box-shadow:inset 0 0 0 2px rgba(91,64,38,.18); } #fatcat-dom-cat-overlay .bar i { display:block; height:100%; background:linear-gradient(90deg,#75aa42,#f0c34e); }
            #fatcat-dom-cat-overlay .cat-grid { position:relative; z-index:4; display: grid; grid-template-columns: 34% 1fr; gap: 1.2%; margin-top: .9%; }
            #fatcat-dom-cat-overlay .cat-grid > div { padding: 1.55%; font-size: 1.86%; line-height: 1.28; min-height: 126px; position:relative; overflow:hidden; }
            #fatcat-dom-cat-overlay .cat-grid > div:after { content:""; position:absolute; left:5%; right:5%; top:5%; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.66),transparent); pointer-events:none; }
            #fatcat-dom-cat-overlay .cat-grid > div > b { display:inline-flex; align-items:center; min-height:22px; padding:.75% 4.2%; margin-bottom:1.3%; border-radius:999px; background:linear-gradient(#7b573f,#4b3326); color:#ffe4ad; box-shadow:0 2px 0 rgba(70,42,22,.22); }
            #fatcat-dom-cat-overlay .upgrade { display:inline-block; margin-top:4%; padding:3% 12%; border-radius:999px; background:#70a845; color:white; font-weight:900; }
            #fatcat-dom-cat-overlay .focus-tag { display:inline-block; margin:2% 2% 0 0; padding:1.8% 6%; border-radius:999px; background:rgba(91,57,31,.12); color:#6a3e22; font-weight:900; }
            #fatcat-dom-cat-overlay .focus-card { display:grid; grid-template-columns:27% 1fr; gap:4%; align-items:center; padding:1.5%; border-radius:12px; background:rgba(255,248,226,.34); box-shadow:inset 0 0 0 1px rgba(111,78,45,.12); }
            #fatcat-dom-cat-overlay .focus-icon { width:100%; aspect-ratio:1; border-radius:14px; background:center/118% no-repeat; box-shadow:inset 0 0 0 2px rgba(106,72,40,.18), 0 3px 0 rgba(78,47,26,.18); }
            #fatcat-dom-cat-overlay .focus-actions { display:flex; flex-wrap:wrap; gap:2%; margin-top:2.7%; }
            #fatcat-dom-cat-overlay .mini-action { padding:1.9% 7%; border-radius:999px; background:linear-gradient(#f2c66a,#d88b2b); color:#5a351d; font-weight:900; box-shadow:0 3px 0 rgba(111,64,24,.28), inset 0 0 0 2px rgba(255,244,202,.22); }
            #fatcat-dom-cat-overlay .mini-action.green { background:linear-gradient(#8ac05a,#4e8c34); color:#fff; text-shadow:0 1px rgba(53,85,29,.55); }
            #fatcat-dom-cat-overlay .mini-action:disabled { filter:grayscale(.8); opacity:.62; box-shadow:none; }
            #fatcat-dom-cat-overlay .mini-progress { height:12px; margin:4% 0 2%; border-radius:999px; background:#d6bd8d; overflow:hidden; box-shadow:inset 0 0 0 1px rgba(92,62,34,.2); }
            #fatcat-dom-cat-overlay .mini-progress i { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#74a846,#efc251); }
            #fatcat-dom-cat-overlay .skin-wardrobe { display:grid; grid-template-columns:30% 1fr; gap:2%; min-height:106px; }
            #fatcat-dom-cat-overlay .skin-preview-card { position:relative; min-height:104px; padding:4% 5%; border-radius:13px; background:radial-gradient(circle at 50% 0, rgba(255,255,255,.5), transparent 30%), linear-gradient(#fff0c7,#dfad66); box-shadow:inset 0 0 0 2px rgba(112,74,38,.18), 0 4px 0 rgba(78,47,25,.18); overflow:hidden; }
            #fatcat-dom-cat-overlay .skin-preview-art { display:block; width:66%; aspect-ratio:1; margin:0 auto 1%; background:center/contain no-repeat; filter:drop-shadow(0 5px 0 rgba(76,48,28,.2)); }
            #fatcat-dom-cat-overlay .skin-preview-card strong { display:block; color:#513019; font-size:118%; text-align:center; }
            #fatcat-dom-cat-overlay .skin-preview-card small { display:block; color:#7a5638; text-align:center; font-weight:900; }
            #fatcat-dom-cat-overlay .skin-list-target { display:grid; grid-template-columns:repeat(2,1fr); gap:2%; }
            #fatcat-dom-cat-overlay .skin-card-target { position:relative; display:grid; grid-template-columns:30% 1fr; align-items:center; gap:3%; min-height:49px; padding:2.2%; border-radius:12px; background:linear-gradient(#fff6dc,#dfbd83); color:#4a2f1f; border:2px solid rgba(111,78,45,.24); box-shadow:inset 0 0 0 2px rgba(255,250,224,.26), 0 3px 0 rgba(76,45,24,.13); overflow:hidden; }
            #fatcat-dom-cat-overlay .skin-card-target:after { content:""; position:absolute; left:7%; right:7%; top:7%; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.62),transparent); }
            #fatcat-dom-cat-overlay .skin-card-target.selected { background:linear-gradient(#ffe69a,#df9c34); box-shadow:inset 0 0 0 3px rgba(255,250,190,.55), 0 0 12px rgba(237,169,44,.42); }
            #fatcat-dom-cat-overlay .skin-card-target.locked { filter:grayscale(.45); opacity:.76; }
            #fatcat-dom-cat-overlay .skin-card-target i { position:relative; width:100%; aspect-ratio:1; border-radius:10px; background:center/contain no-repeat, linear-gradient(#f8deb1,#b88956); box-shadow:inset 0 0 0 2px rgba(92,60,34,.18); overflow:hidden; }
            #fatcat-dom-cat-overlay .skin-card-target i:before { content:""; position:absolute; left:18%; right:18%; bottom:8%; height:28%; border-radius:42% 42% 18% 18%; background:linear-gradient(135deg,var(--skin-a,#557448),var(--skin-b,#31482f)); box-shadow:inset 0 0 0 2px rgba(255,237,188,.28), 0 2px 0 rgba(65,39,22,.18); opacity:.92; }
            #fatcat-dom-cat-overlay .skin-card-target i:after { content:""; position:absolute; right:8%; top:8%; width:28%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#ffe06c,#d18b1e); box-shadow:inset 0 0 0 2px rgba(92,54,20,.28), 0 2px 0 rgba(65,39,22,.18); }
            #fatcat-dom-cat-overlay .skin-card-target.apron i:before { left:24%; right:24%; bottom:6%; height:34%; border-radius:7px 7px 14px 14px; background:linear-gradient(#fff3d7 0 34%,var(--skin-a,#b75c31) 35%); }
            #fatcat-dom-cat-overlay .skin-card-target.apron i:after { border-radius:0 0 42% 42%; background:linear-gradient(#fff6df 0 42%,#c77a35 43%); }
            #fatcat-dom-cat-overlay .skin-card-target.manager i:before { left:14%; right:14%; bottom:9%; height:30%; border-radius:999px 999px 16px 16px; background:linear-gradient(90deg,var(--skin-a,#2f6f69),var(--skin-b,#173d44)); }
            #fatcat-dom-cat-overlay .skin-card-target.manager i:after { border-radius:5px; transform:rotate(12deg); background:linear-gradient(#d9b06a,#8d5c2d); }
            #fatcat-dom-cat-overlay .skin-card-target.festival i:before { left:12%; right:12%; bottom:8%; height:36%; border-radius:50% 50% 18px 18px; background:radial-gradient(circle at 35% 35%,#fff3b2 0 9%,transparent 10%), linear-gradient(135deg,var(--skin-a,#7b4bc0),var(--skin-b,#cf6a9a)); }
            #fatcat-dom-cat-overlay .skin-card-target.festival i:after { background:radial-gradient(circle,#fff2a0 0 28%,#e35f65 30% 60%,transparent 61%); box-shadow:none; }
            #fatcat-dom-cat-overlay .skin-card-target b { display:block; color:#442915; line-height:1.08; }
            #fatcat-dom-cat-overlay .skin-card-target span { display:block; color:#735034; font-size:82%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            #fatcat-dom-cat-overlay .skin-card-target em { display:inline-flex; width:max-content; margin-top:2%; padding:1.2% 8%; border-radius:999px; background:rgba(76,48,27,.82); color:#fff1c7; font-size:78%; font-style:normal; }
            #fatcat-dom-cat-overlay .skin-card-target.selected em { background:#5d8f38; color:#fff; }
            #fatcat-dom-cat-overlay .skin-style-badge { display:inline-flex; width:max-content; margin:1.5% 0 0; padding:.9% 6%; border-radius:999px; background:linear-gradient(#72513a,#4c3324); color:#ffe5ad; font-size:72%; font-weight:1000; box-shadow:0 2px 0 rgba(62,39,22,.16); }
            #fatcat-dom-cat-overlay .skin-swatches { display:flex; gap:4%; margin-top:2%; }
            #fatcat-dom-cat-overlay .skin-swatches s { width:16%; max-width:16px; aspect-ratio:1; border-radius:50%; background:var(--swatch,#8f6a44); box-shadow:inset 0 0 0 2px rgba(255,240,200,.34), 0 1px 0 rgba(71,45,25,.22); text-decoration:none; }
            #fatcat-dom-cat-overlay .equip-row { display:grid; grid-template-columns: repeat(4,1fr); gap:1.4%; margin-top:2%; text-align:center; }
            #fatcat-dom-cat-overlay .equip-slot { position:relative; min-height: 88px; border-radius:12px; background:radial-gradient(circle at 50% 12%, rgba(255,255,255,.34), transparent 28%), linear-gradient(#f5dfbc,#d4a86f); border:2px solid rgba(111,78,45,.28); display:flex; align-items:center; justify-content:center; flex-direction:column; font-weight:900; color:#4a2f1f; box-shadow:inset 0 0 0 2px rgba(255,250,224,.28), 0 4px 0 rgba(73,44,24,.16); overflow:hidden; }
            #fatcat-dom-cat-overlay .equip-slot:after { content:""; position:absolute; left:11%; right:11%; bottom:7%; height:10%; border-radius:999px; background:rgba(83,54,29,.12); }
            #fatcat-dom-cat-overlay .equip-slot.selected { background:linear-gradient(#fff1bd,#e0a33e); box-shadow:0 0 0 3px rgba(241,173,48,.52) inset, 0 0 12px rgba(241,173,48,.34); }
            #fatcat-dom-cat-overlay .equip-slot small { font-size:76%; color:#725139; }
            #fatcat-dom-cat-overlay .equip-slot em { font-style:normal; color:#6d4728; }
            #fatcat-dom-cat-overlay .equip-name {
                display:block;
                max-width:96%;
                white-space:nowrap;
                font-size:92%;
                line-height:1.05;
            }
            #fatcat-dom-cat-overlay .equip-row .locked { filter: grayscale(1); opacity:.65; }
            #fatcat-dom-cat-overlay .equip-bag { margin-top:1.2%; padding:1.0%; border-radius:12px; background:rgba(255,246,224,.48); box-shadow:inset 0 0 0 1px rgba(112,78,44,.13); }
            #fatcat-dom-cat-overlay .equip-bag strong { display:block; margin-bottom:1%; color:#6a4328; }
            #fatcat-dom-cat-overlay .equip-bag > div { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5%; }
            #fatcat-dom-cat-overlay .equip-pack { min-height:52px; border-radius:10px; background:linear-gradient(#fff4d6,#d9b47b); color:#4a2f1f; display:grid; grid-template-columns:26% 1fr; grid-template-rows:1fr .85fr .75fr .72fr; align-items:center; column-gap:3%; padding:2.4%; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,250,224,.24), 0 2px 0 rgba(75,45,24,.14); }
            #fatcat-dom-cat-overlay .equip-pack .equip-icon { grid-row:1 / 5; width:100%; margin:0; }
            #fatcat-dom-cat-overlay .equip-pack span, #fatcat-dom-cat-overlay .equip-pack em, #fatcat-dom-cat-overlay .equip-pack small { text-align:left; }
            #fatcat-dom-cat-overlay .equip-pack em { font-style:normal; color:#7a583c; font-size:82%; }
            #fatcat-dom-cat-overlay .equip-pack small { color:#8b6647; font-size:72%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            #fatcat-dom-cat-overlay .equip-pack.ready { background:linear-gradient(#e6f4c6,#8fc45a); color:#314b1d; }
            #fatcat-dom-cat-overlay .equip-pack.equipped { box-shadow:inset 0 0 0 3px rgba(255,218,101,.58), 0 2px 0 rgba(75,45,24,.14); }
            #fatcat-dom-cat-overlay .equip-pack.disabled { filter:grayscale(.9); opacity:.58; cursor:not-allowed; }
            #fatcat-dom-cat-overlay .equip-upgrade-info { margin-top:1.4%; display:grid; grid-template-columns:repeat(3,1fr); gap:1%; }
            #fatcat-dom-cat-overlay .equip-upgrade-info span { min-height:30px; border-radius:9px; background:rgba(255,247,221,.72); color:#6e4a2e; display:flex; flex-direction:column; justify-content:center; align-items:center; font-weight:900; font-size:78%; box-shadow:inset 0 0 0 1px rgba(117,80,45,.14); }
            #fatcat-dom-cat-overlay .equip-upgrade-info b { color:#3f2c1f; font-size:110%; }
            #fatcat-dom-cat-overlay .equip-effect-info { margin-top:1%; display:grid; grid-template-columns:1fr 1fr; gap:1%; }
            #fatcat-dom-cat-overlay .equip-effect-info span { min-height:30px; border-radius:9px; background:linear-gradient(#fff7df,#ead09f); color:#704927; display:flex; flex-direction:column; justify-content:center; align-items:center; font-weight:1000; font-size:78%; box-shadow:inset 0 0 0 1px rgba(117,80,45,.15); }
            #fatcat-dom-cat-overlay .equip-effect-info b { max-width:96%; color:#3e2a1a; font-size:108%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            #fatcat-dom-cat-overlay .equip-upgrade { width:100%; margin-top:1.4%; min-height:34px; border:0; border-radius:999px; background:linear-gradient(#f6bf50,#b86f1e); color:#fff8e4; font-weight:1000; box-shadow:inset 0 0 0 2px rgba(255,232,151,.32), 0 3px 0 rgba(83,49,21,.24); text-shadow:0 1px 0 rgba(74,45,20,.36); }
            #fatcat-dom-cat-overlay .equip-upgrade b { color:#fff0a8; }
            #fatcat-dom-cat-overlay .equip-upgrade.disabled { background:linear-gradient(#b7aa96,#806b55); color:#f5ead6; box-shadow:inset 0 0 0 2px rgba(255,255,255,.14); cursor:not-allowed; }
            #fatcat-dom-cat-overlay .equip-icon { position:relative; width:45%; aspect-ratio:1; margin-bottom:6%; border-radius:12px; background:linear-gradient(#fff3d4,#d6af77); box-shadow:inset 0 0 0 2px rgba(101,70,40,.18), 0 2px 0 rgba(81,50,26,.2); }
            #fatcat-dom-cat-overlay .equip-icon.asset { background:center/contain no-repeat; }
            #fatcat-dom-cat-overlay .equip-icon.asset:before, #fatcat-dom-cat-overlay .equip-icon.asset:after { display:none; }
            #fatcat-dom-cat-overlay .equip-icon:before, #fatcat-dom-cat-overlay .equip-icon:after { content:""; position:absolute; }
            #fatcat-dom-cat-overlay .equip-icon.collar:before { inset:22%; border-radius:50%; background:radial-gradient(circle at 50% 52%, transparent 0 38%, #667a53 39% 62%, #34442b 63%); box-shadow:inset 0 0 0 3px #9fab84; }
            #fatcat-dom-cat-overlay .equip-icon.collar:after { left:43%; bottom:14%; width:14%; height:20%; border-radius:999px; background:#c99635; }
            #fatcat-dom-cat-overlay .equip-icon.cup:before { left:22%; top:28%; width:46%; height:44%; border-radius:0 0 12px 12px; background:linear-gradient(#f1f5ec,#4f8b6a); box-shadow:inset 0 0 0 3px #315840; }
            #fatcat-dom-cat-overlay .equip-icon.cup:after { right:16%; top:35%; width:20%; height:25%; border-radius:50%; border:4px solid #315840; border-left:0; }
            #fatcat-dom-cat-overlay .equip-icon.cushion:before { left:18%; right:18%; top:30%; height:42%; border-radius:50%; background:radial-gradient(circle at 50% 40%,#8b7a65 0 18%, transparent 19%), linear-gradient(#9b8a75,#655544); box-shadow:inset 0 0 0 3px #4d4136; }
            #fatcat-dom-cat-overlay .equip-icon.lock:before { left:25%; right:25%; bottom:24%; height:38%; border-radius:8px; background:#8b765c; box-shadow:inset 0 0 0 3px #5c4b38; }
            #fatcat-dom-cat-overlay .equip-icon.lock:after { left:34%; right:34%; top:20%; height:32%; border-radius:999px 999px 0 0; border:5px solid #5c4b38; border-bottom:0; }
            #fatcat-dom-cat-overlay .equip-rarity { position:absolute; z-index:3; left:7%; top:6%; min-width:22%; padding:.8% 2%; border-radius:999px; background:linear-gradient(#ffe266,#d89421); color:#673719; font-weight:1000; font-size:84%; box-shadow:inset 0 0 0 1px rgba(92,55,22,.28), 0 2px 0 rgba(73,43,21,.18); }
            #fatcat-dom-cat-overlay .equip-rarity.s-rarity { background:linear-gradient(#ffe47a,#db9624); color:#603314; }
            #fatcat-dom-cat-overlay .equip-rarity.a-rarity { background:linear-gradient(#e9d6ff,#a974d5); color:#50306f; }
            #fatcat-dom-cat-overlay .equip-slot-tag { position:absolute; z-index:3; right:7%; top:6%; padding:.8% 5%; border-radius:999px; background:rgba(69,43,27,.78); color:#fff0c5; font-size:72%; box-shadow:inset 0 0 0 1px rgba(255,229,172,.2); }
            #fatcat-dom-cat-overlay .equip-bonus-pill { display:inline-flex; align-items:center; justify-content:center; width:86%; min-height:19px; margin-top:4%; border-radius:999px; background:rgba(86,54,31,.12); color:#694223; font-size:70%; font-weight:1000; box-shadow:inset 0 0 0 1px rgba(106,70,38,.12); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            #fatcat-dom-cat-overlay .equip-pack .equip-rarity { left:4%; top:6%; min-width:18%; font-size:72%; }
            #fatcat-dom-cat-overlay .equip-pack .equip-bonus-pill { grid-column:2; width:auto; min-height:18px; margin:0; padding:0 5%; justify-self:start; font-size:68%; }
            #fatcat-dom-cat-overlay .cat-story { margin-top:.8%; padding:1.15%; font-size:1.68%; line-height:1.25; }
            #fatcat-dom-cat-overlay .cat-story { display:grid; grid-template-columns:1fr 17% 17%; gap:1.5%; align-items:center; }
            #fatcat-dom-cat-overlay .story-copy { position:relative; min-height:58px; padding:1.0% 1.2% 1.0% 2.2%; border-radius:11px; background:linear-gradient(90deg,rgba(255,249,231,.54),rgba(231,198,145,.22)); box-shadow:inset 4px 0 0 rgba(126,83,43,.42), inset 0 0 0 1px rgba(126,83,43,.09); }
            #fatcat-dom-cat-overlay .story-copy b { display:inline-flex; align-items:center; padding:.7% 3.2%; border-radius:999px; background:linear-gradient(#7b573f,#4d3323); color:#ffe4ad; box-shadow:0 2px 0 rgba(71,44,24,.18); }
            #fatcat-dom-cat-overlay .story-tags { display:flex; flex-wrap:wrap; gap:1.4%; margin-top:1.4%; }
            #fatcat-dom-cat-overlay .story-tags span { padding:.6% 3.2%; border-radius:999px; background:rgba(111,72,39,.14); color:#724724; font-size:82%; font-weight:900; }
            #fatcat-dom-cat-overlay .story-photo { min-height:76px; border-radius:8px; background:linear-gradient(rgba(70,48,34,.08),rgba(70,48,34,.16)), center/cover no-repeat; box-shadow:0 0 0 6px #fff1d1, 0 0 0 8px rgba(123,86,49,.46), 0 5px 0 rgba(74,45,25,.22), inset 0 -16px 18px rgba(74,45,25,.2); position:relative; transform:rotate(3deg); overflow:visible; }
            #fatcat-dom-cat-overlay .story-photo:before { content:""; position:absolute; z-index:3; left:35%; top:-12%; width:28%; height:18%; border-radius:4px; background:linear-gradient(#ca5d42,#8d3329); box-shadow:0 2px 0 rgba(0,0,0,.22), inset 0 0 0 1px rgba(255,238,194,.22); }
            #fatcat-dom-cat-overlay .story-photo:after { content:"工作照"; position:absolute; left:8%; right:8%; bottom:4%; min-height:18%; border-radius:999px; background:rgba(58,38,27,.72); color:#fff2c8; display:flex; align-items:center; justify-content:center; font-size:76%; font-weight:900; box-shadow:inset 0 0 0 1px rgba(255,232,174,.18); }
            #fatcat-dom-cat-overlay .story-button { position:relative; display:inline-flex; align-items:center; justify-content:center; flex-direction:column; margin-top:3%; padding:2.6% 8%; min-height:70px; border-radius:16px; background:radial-gradient(circle at 50% 10%, rgba(255,255,255,.42), transparent 28%), linear-gradient(#f6cf70,#d8942a); color:#5c351e; font-weight:900; box-shadow:0 4px 0 rgba(115,66,22,.32), inset 0 0 0 3px rgba(255,244,205,.26); }
            #fatcat-dom-cat-overlay .story-button:after { content:"章节 1"; margin-top:4%; padding:2% 12%; border-radius:999px; background:rgba(83,49,24,.16); font-size:72%; color:#74451f; }
            #fatcat-dom-cat-overlay .cat-actions { position:absolute; z-index:3; left:11.5%; right:2.7%; bottom:14.1%; height:4.2%; display:grid; grid-template-columns:1fr 1fr 1.4fr; gap:1.2%; }
            #fatcat-dom-cat-overlay .cat-actions button { border-radius:999px; color:#fff7de; font-size:2.05%; font-weight:900; text-shadow:0 2px rgba(80,43,18,.5); border:3px solid rgba(80,50,26,.42); box-shadow:0 4px 0 rgba(0,0,0,.26), inset 0 0 0 2px rgba(255,240,192,.14); }
            #fatcat-dom-cat-overlay .cat-actions .dismiss { background:linear-gradient(#a77a56,#74482e); }
            #fatcat-dom-cat-overlay .cat-actions .change { background:linear-gradient(#e0ae54,#b86a25); }
            #fatcat-dom-cat-overlay .cat-actions .level { background:linear-gradient(#8fbd55,#4f8c35); }
            #fatcat-dom-cat-overlay .cat-actions button:disabled { filter:grayscale(.75); opacity:.62; box-shadow:none; }
            #fatcat-dom-cat-overlay .cat-roster-label { position:absolute; left:11.8%; bottom:12.65%; padding:.55% 2.2%; border-radius:999px; background:linear-gradient(#7b573f,#493126); color:#ffe5ad; border:2px solid rgba(255,224,166,.24); font-size:1.55%; font-weight:900; box-shadow:0 3px 0 rgba(0,0,0,.22); }
            #fatcat-dom-cat-overlay .cat-list { position:absolute; z-index:8; left:11.5%; right:2.7%; bottom:.35%; height:12.2%; padding: 1.0%; font-size: 1.9%; background: radial-gradient(circle at 50% 0, rgba(255,219,137,.14), transparent 36%), linear-gradient(#624838,#3e2d24); color: #fff3d8; display:grid; grid-template-columns: repeat(6,1fr); gap:1.1%; text-align:center; box-sizing:border-box; border-color:#7d5a3c; box-shadow:0 -3px 0 rgba(255,226,160,.08) inset, 0 5px 0 rgba(0,0,0,.3), inset 0 0 0 2px rgba(255,235,190,.08); }
            #fatcat-dom-cat-overlay .cat-list button { position:relative; min-height:0; border-radius:11px; background:radial-gradient(circle at 50% 10%, rgba(255,255,255,.32), transparent 25%), linear-gradient(#fff1d3,#d8af76); color:#4a2f1f; border:2px solid rgba(104,71,40,.32); display:flex; align-items:center; justify-content:center; flex-direction:column; font-weight:900; gap:2%; overflow:hidden; box-shadow:0 4px 0 rgba(38,24,16,.26), inset 0 0 0 2px rgba(255,250,224,.28); transition:transform .12s ease, filter .12s ease; }
            #fatcat-dom-cat-overlay .cat-list button:active { transform:translateY(2px); filter:brightness(.96); }
            #fatcat-dom-cat-overlay .cat-list button:before { content:""; position:absolute; inset:3px; border-radius:8px; box-shadow:inset 0 0 0 1px rgba(255,250,224,.36); pointer-events:none; }
            #fatcat-dom-cat-overlay .cat-list .rarity-badge { position:absolute; left:6%; top:5%; min-width:22%; border-radius:999px; background:linear-gradient(#ffe36a,#d99522); color:#6a3618; font-size:86%; box-shadow:inset 0 0 0 1px rgba(93,58,28,.25); }
            #fatcat-dom-cat-overlay .cat-list .rarity-badge.s-rarity { background:linear-gradient(#ffe16b,#d68e18); color:#5f3214; }
            #fatcat-dom-cat-overlay .cat-list .rarity-badge.a-rarity { background:linear-gradient(#e8d8ff,#9f6bd5); color:#54316f; }
            #fatcat-dom-cat-overlay .cat-list .cat-status { margin-top:1%; padding:.8% 8%; border-radius:999px; background:#5f8f3a; color:white; font-size:78%; }
            #fatcat-dom-cat-overlay .cat-list .locked .cat-status { background:#8f5f3a; }
            #fatcat-dom-cat-overlay .cat-stars { color:#f0a51c; line-height:1; font-size:78%; text-shadow:0 1px #6e421f; }
            #fatcat-dom-cat-overlay .cat-thumb { width:48%; aspect-ratio:1; border-radius:50%; background: rgba(255,244,220,.9) center/contain no-repeat; box-shadow:0 0 0 3px rgba(111,73,39,.12), inset 0 0 0 2px rgba(112,77,45,.22), 0 2px 0 rgba(76,45,24,.18); }
            #fatcat-dom-cat-overlay .cat-role-dot { position:absolute; right:7%; top:6%; width:13%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#95c965,#4e8d34); box-shadow:inset 0 0 0 2px rgba(255,242,204,.28), 0 2px 0 rgba(64,42,20,.22); }
            #fatcat-dom-cat-overlay .cat-role-dot.launcher { background:linear-gradient(#f0b35c,#c86b2c); }
            #fatcat-dom-cat-overlay .cat-role-dot.saver { background:linear-gradient(#8fc5d8,#4e879d); }
            #fatcat-dom-cat-overlay .cat-role-dot.support { background:linear-gradient(#d7b2f2,#8a5cbe); }
            #fatcat-dom-cat-overlay .cat-list .locked .cat-thumb { filter: grayscale(.85); opacity:.62; }
            #fatcat-dom-cat-overlay .cat-list .locked { filter: grayscale(.75); opacity:.72; }
            #fatcat-dom-cat-overlay .cat-list .active { transform:translateY(-4%); box-shadow:0 0 0 4px #f0a51c inset, 0 0 16px rgba(240,165,28,.45), 0 6px 0 rgba(63,36,17,.26); } #fatcat-dom-cat-overlay .cat-list .recruit { background:linear-gradient(#ffc84c,#ee991d); color:white; text-shadow:0 2px #9c5815; border-color:#ffe2a5; }
            #fatcat-dom-cat-overlay .cat-msg { position:absolute; left: 18%; right: 6%; bottom: 20.4%; min-height:3.1%; border-radius:999px; background:rgba(48,34,24,.9); color:#ffe6b5; display:flex;align-items:center;justify-content:center; font-size:2.0%; font-weight:900; pointer-events:none; box-shadow:0 3px 0 rgba(0,0,0,.22); }
            #fatcat-dom-cat-overlay .cat-msg.empty { display:none; }
            #fatcat-dom-cat-overlay.compact .cat-bg { padding: 16.0% 2.0% 16.8% 13.2%; border-radius:0; }
            #fatcat-dom-cat-overlay.compact .cat-page-hud { left:1%; right:1%; top:.75%; height:7.2%; gap:.7%; grid-template-columns:25% repeat(4,1fr); font-size:1.55%; }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .player { border-radius:14px; padding:2% 3%; }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .res { font-size:.78em; border-width:2px; gap:3%; padding-right:8%; }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .res i { width:min(22px,20%); }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .plus { width:min(22px,20%); font-size:.9em; }
            #fatcat-dom-cat-overlay.compact .cat-modal-title { left:31%; right:31%; min-height:42px; font-size:2.42%; }
            #fatcat-dom-cat-overlay.compact .close-x { width:6.9%; min-width:38px; font-size:3.0%; }
            #fatcat-dom-cat-overlay.compact .cat-side { left: 1.8%; top:10.0%; width: 9.4%; }
            #fatcat-dom-cat-overlay.compact .cat-overview-head div { min-height:48px; font-size:1.48%; }
            #fatcat-dom-cat-overlay.compact .back, #fatcat-dom-cat-overlay.compact .side-tab { min-height: 52px; font-size: 1.65%; border-radius: 12px; }
            #fatcat-dom-cat-overlay.compact .cat-hero { grid-template-columns: 27% 1fr 18%; gap: 1.1%; }
            #fatcat-dom-cat-overlay.compact .cat-card { font-size: 2.08%; padding: 5.5%; }
            #fatcat-dom-cat-overlay.compact .cat-card.info { padding:4.6%; line-height:1.34; }
            #fatcat-dom-cat-overlay.compact .cat-card.info strong { min-height:28px; padding:0 8%; font-size:118%; }
            #fatcat-dom-cat-overlay.compact .cat-card.info strong:after { width:14px; height:14px; margin-left:5px; }
            #fatcat-dom-cat-overlay.compact .cat-card.info .rank { font-size:212%; line-height:1; }
            #fatcat-dom-cat-overlay.compact .cat-card.info .type { display:inline-flex; align-items:center; min-height:18px; padding:0 7%; font-size:88%; }
            #fatcat-dom-cat-overlay.compact .cat-portrait { min-height: 238px; }
            #fatcat-dom-cat-overlay.compact .portrait-cat.img { width:58%; min-width:164px; }
            #fatcat-dom-cat-overlay.compact .cat-portrait .cat-talk { right:5%; top:8%; max-width:42%; font-size:24%; }
            #fatcat-dom-cat-overlay.compact .cat-profile-row { font-size:20%; left:6%; right:6%; }
            #fatcat-dom-cat-overlay.compact .cat-power { width: 48%; font-size: 2.72%; }
            #fatcat-dom-cat-overlay.compact .cat-stats { font-size: 1.72%; padding: 1.25%; }
            #fatcat-dom-cat-overlay.compact .cat-weight { font-size: 2.05%; padding: 1.8%; }
            #fatcat-dom-cat-overlay.compact .cat-grid { grid-template-columns: 36% 1fr; gap: 1.0%; }
            #fatcat-dom-cat-overlay.compact .cat-grid > div { min-height: 106px; font-size: 1.58%; padding: 1.35%; line-height:1.18; }
            #fatcat-dom-cat-overlay.compact .focus-card { grid-template-columns:31% 1fr; gap:2.6%; padding:1.1%; }
            #fatcat-dom-cat-overlay.compact .focus-tag { padding:1.2% 4.2%; margin-top:1.4%; }
            #fatcat-dom-cat-overlay.compact .mini-action { padding:1.4% 5.5%; }
            #fatcat-dom-cat-overlay.compact .skin-wardrobe { grid-template-columns:29% 1fr; gap:1.4%; min-height:90px; }
            #fatcat-dom-cat-overlay.compact .skin-preview-card { min-height:88px; padding:3%; }
            #fatcat-dom-cat-overlay.compact .skin-preview-art { width:60%; margin-bottom:0; }
            #fatcat-dom-cat-overlay.compact .skin-card-target { min-height:40px; padding:1.8%; font-size:88%; border-radius:9px; }
            #fatcat-dom-cat-overlay.compact .skin-card-target span { font-size:74%; }
            #fatcat-dom-cat-overlay.compact .skin-card-target em { font-size:70%; }
            #fatcat-dom-cat-overlay.compact .equip-row { gap:.8%; margin-top:.8%; }
            #fatcat-dom-cat-overlay.compact .equip-slot { min-height: 58px; border-radius:9px; font-size:86%; }
            #fatcat-dom-cat-overlay.compact .equip-slot small { font-size:64%; }
            #fatcat-dom-cat-overlay.compact .equip-icon { width:48%; margin-bottom:1%; }
            #fatcat-dom-cat-overlay.compact .equip-bag { margin-top:.8%; padding:.8%; }
            #fatcat-dom-cat-overlay.compact .equip-pack { min-height:44px; padding:1.8%; font-size:82%; }
            #fatcat-dom-cat-overlay.compact .equip-pack small { font-size:68%; }
            #fatcat-dom-cat-overlay.compact .equip-upgrade-info, #fatcat-dom-cat-overlay.compact .equip-effect-info { display:none; }
            #fatcat-dom-cat-overlay.compact .equip-upgrade { min-height:30px; margin-top:.8%; }
            #fatcat-dom-cat-overlay.compact .cat-story { font-size: 1.62%; grid-template-columns:1fr 18%; }
            #fatcat-dom-cat-overlay.compact .story-photo { min-height:72px; }
            #fatcat-dom-cat-overlay.compact .cat-actions { left:2%; right:2%; bottom:14.25%; height:4.4%; }
            #fatcat-dom-cat-overlay.compact .cat-actions button { font-size:1.68%; }
            #fatcat-dom-cat-overlay.compact .cat-roster-label { left:2%; bottom:12.7%; font-size:1.32%; }
            #fatcat-dom-cat-overlay.compact .cat-list { left: 2%; right: 2%; bottom:.3%; height: 12.35%; font-size: 1.58%; gap: .7%; }
            #fatcat-dom-cat-overlay.tall .cat-bg { padding-bottom: 16.8%; }
            #fatcat-dom-cat-overlay.wide .cat-bg { left: 0; right: 0; padding-top:8.2%; }
            #fatcat-dom-cat-overlay.wide .cat-page-hud { left:2%; right:2%; height:6.4%; font-size:1.55%; }
            #fatcat-dom-cat-overlay.wide .cat-page-hud .res { font-size:.92em; }
            #fatcat-dom-cat-overlay.wide .cat-overview-head div { min-height:42px; font-size:1.25%; }
            #fatcat-dom-cat-overlay.wide .cat-hero { margin-top:.55%; grid-template-columns:22% 1fr 20%; gap:1.4%; }
            #fatcat-dom-cat-overlay.wide .cat-card.info { min-height:142px; padding:4.8%; font-size:2.05%; }
            #fatcat-dom-cat-overlay.wide .cat-portrait { min-height:214px; }
            #fatcat-dom-cat-overlay.wide .portrait-cat.img { min-width:150px; width:52%; }
            #fatcat-dom-cat-overlay.wide .portrait-name { font-size:58%; }
            #fatcat-dom-cat-overlay.wide .cat-profile-row { display:none; }
            #fatcat-dom-cat-overlay.wide .cat-power { margin:.7% auto; padding:.65%; font-size:2.6%; }
            #fatcat-dom-cat-overlay.wide .cat-stats { margin-top:.7%; padding:.9%; font-size:1.55%; }
            #fatcat-dom-cat-overlay.wide .cat-stats div { min-height:48px; gap:3%; }
            #fatcat-dom-cat-overlay.wide .stat-icon { width:20%; max-width:24px; margin-bottom:1%; }
            #fatcat-dom-cat-overlay.wide .cat-weight { padding:1.05%; margin-top:.75%; font-size:1.82%; }
            #fatcat-dom-cat-overlay.wide .weight-row { margin-top:.8%; }
            #fatcat-dom-cat-overlay.wide .cat-grid { grid-template-columns:35% 1fr; gap:1%; margin-top:.75%; }
            #fatcat-dom-cat-overlay.wide .cat-grid > div { min-height:66px; padding:1.15%; font-size:1.48%; line-height:1.18; }
            #fatcat-dom-cat-overlay.wide .equip-row { gap:1%; margin-top:1%; }
            #fatcat-dom-cat-overlay.wide .equip-slot { min-height:46px; }
            #fatcat-dom-cat-overlay.wide .equip-bag { display:none; }
            #fatcat-dom-cat-overlay.wide .equip-icon { width:42%; margin-bottom:1%; }
            #fatcat-dom-cat-overlay.wide .cat-story { display:none; }
            #fatcat-dom-cat-overlay.wide .cat-msg { bottom:16.1%; }
            #fatcat-dom-cat-overlay.wide .cat-roster-label { display:none; }

            #fatcat-dom-cat-overlay .cat-art-bg {
                background-color:#3b261b;
                background-image:linear-gradient(rgba(37,24,16,.12),rgba(37,24,16,.56)),url("${this.getDomAssetDataUri(GeneratedBackgroundAssets.catDetailWorkshop)}");
                background-size:100% auto;
                background-position:center top;
                background-repeat:no-repeat;
                opacity:.62;
                filter:saturate(1.04) contrast(1.03) brightness(.86);
            }
            #fatcat-dom-cat-overlay .portrait-name,
            #fatcat-dom-cat-overlay .cat-profile-row,
            #fatcat-dom-cat-overlay .cat-index,
            #fatcat-dom-cat-overlay .cat-actions,
            #fatcat-dom-cat-overlay .cat-roster-label { display:none; }
            #fatcat-dom-cat-overlay .cat-page-hud .avatar.asset {
                background-color:#e5b269;
                background-position:center 20%;
                background-size:155%;
                background-repeat:no-repeat;
            }
            #fatcat-dom-cat-overlay .cat-page-hud .res i.asset {
                border-radius:0;
                background-position:center;
                background-size:contain;
                background-repeat:no-repeat;
                box-shadow:none;
                transform:none;
                filter:drop-shadow(0 2px 0 rgba(0,0,0,.28));
            }
            #fatcat-dom-cat-overlay .side-tab i.asset {
                width:60%;
                flex:0 0 auto;
                border-radius:0;
                background-color:transparent;
                background-position:center;
                background-size:125%;
                background-repeat:no-repeat;
                box-shadow:none;
                filter:drop-shadow(0 2px 0 rgba(0,0,0,.24));
            }
            #fatcat-dom-cat-overlay .side-tab i.asset:before,
            #fatcat-dom-cat-overlay .side-tab i.asset:after { display:none !important; }
            #fatcat-dom-cat-overlay .tab-info i.asset,
            #fatcat-dom-cat-overlay .tab-skin i.asset {
                background-position:center 28%;
                background-size:155%;
            }
            #fatcat-dom-cat-overlay .stat-icon.asset {
                border-radius:0;
                background-position:center;
                background-size:contain;
                background-repeat:no-repeat;
                box-shadow:none;
                transform:none;
            }
            #fatcat-dom-cat-overlay .cat-thumb.hero-art {
                width:82%;
                margin-top:1%;
                border-radius:0;
                background-color:transparent;
                background-position:center 32%;
                background-size:142%;
                background-repeat:no-repeat;
                box-shadow:none;
            }
            #fatcat-dom-cat-overlay .cat-role-dot.asset {
                width:18%;
                border-radius:6px;
                background-position:center;
                background-size:contain;
                background-repeat:no-repeat;
                box-shadow:0 2px 0 rgba(64,42,20,.22);
            }
            #fatcat-dom-cat-overlay .weight-row span.stage-art {
                position:relative;
                min-height:62px;
                box-sizing:border-box;
                display:flex;
                align-items:flex-end;
                justify-content:center;
                padding:39px 0 5px;
                border-radius:12px;
            }
            #fatcat-dom-cat-overlay .weight-row span.stage-art:before {
                content:"";
                position:absolute !important;
                left:10% !important;
                right:10% !important;
                top:2px !important;
                height:48px !important;
                border-radius:0 !important;
                background-color:transparent !important;
                background-image:var(--stage-art) !important;
                background-position:center bottom !important;
                background-size:contain !important;
                background-repeat:no-repeat !important;
                box-shadow:none !important;
                transform:scale(.82) !important;
                transform-origin:center bottom !important;
                z-index:1;
            }
            #fatcat-dom-cat-overlay .weight-row span.stage-art.fat:before { transform:scale(.98) !important; }
            #fatcat-dom-cat-overlay .weight-row span.stage-art.super:before {
                filter:grayscale(.9) sepia(.12) !important;
                transform:scale(1.12) !important;
            }
            #fatcat-dom-cat-overlay .weight-row span.stage-art:after { display:none !important; }
            #fatcat-dom-cat-overlay .weight-row span.stage-art b { position:relative; z-index:2; }
            #fatcat-dom-cat-overlay.tablet .weight-row span.stage-art {
                min-height:44px;
                padding:27px 0 3px;
            }
            #fatcat-dom-cat-overlay.tablet .weight-row span.stage-art:before {
                top:0 !important;
                height:34px !important;
            }
            #fatcat-dom-cat-overlay.compact .cat-page-hud {
                left:1.2%;
                right:1.2%;
                top:1.0%;
                height:5.25%;
                grid-template-columns:27% repeat(4,1fr);
                gap:.65%;
                font-size:1.58%;
            }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .player {
                grid-template-columns:30% 1fr;
                padding:2px 6px;
                border-radius:13px;
                border-width:2px;
            }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .player span { gap:3px; }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .avatar { width:min(38px,90%); }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .level { width:min(25px,23%); border-width:2px; }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .exp { height:5px; }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .res {
                border-radius:999px 10px 10px 999px;
                font-size:.82em;
                gap:2%;
                padding-right:15%;
            }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .res i { width:min(22px,25%); }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .plus { width:min(22px,24%); border-radius:6px; }
            #fatcat-dom-cat-overlay.compact .cat-hero {
                position:relative;
                grid-template-columns:24% 1fr 25%;
                gap:.25%;
            }
            #fatcat-dom-cat-overlay.compact .cat-side { top:6.55%; }
            #fatcat-dom-cat-overlay.compact .cat-card.info {
                min-height:116px;
                margin-top:15px;
                padding:3.2%;
                font-size:1.9%;
                line-height:1.02;
            }
            #fatcat-dom-cat-overlay.compact .cat-portrait {
                min-height:232px;
                border-radius:12px;
                overflow:visible;
            }
            #fatcat-dom-cat-overlay.compact .cat-portrait:before {
                inset:1.5%;
                opacity:.88;
                background-position:center 36%;
            }
            #fatcat-dom-cat-overlay.compact .portrait-cat.img {
                width:70%;
                min-width:180px;
                margin-top:5%;
                filter:drop-shadow(0 7px 0 rgba(72,45,28,.2));
            }
            #fatcat-dom-cat-overlay.compact .cat-portrait .cat-talk {
                right:3%;
                top:7%;
                max-width:43%;
                font-size:22%;
            }
            #fatcat-dom-cat-overlay.compact .cat-hero > div:last-child {
                position:absolute;
                right:0;
                top:0;
                width:25%;
                box-sizing:border-box;
                padding-top:6.4vh;
            }
            #fatcat-dom-cat-overlay.compact .mood,
            #fatcat-dom-cat-overlay.compact .feed {
                margin-bottom:14px;
                padding:22% 3% 8%;
                font-size:1.7%;
                line-height:1.18;
                border-radius:11px;
            }
            #fatcat-dom-cat-overlay.compact .mood { margin-bottom:30px; }
            #fatcat-dom-cat-overlay.compact .feed button {
                margin-top:5%;
                padding:4% 10%;
            }
            #fatcat-dom-cat-overlay.compact .cat-switch {
                z-index:7;
                top:55%;
                width:32px;
                min-width:32px;
                border:0;
                border-radius:0;
                background:transparent;
                color:#f4ad36;
                font-size:46px;
                line-height:1;
                text-shadow:0 2px 0 #5f3218;
                box-shadow:none;
            }
            #fatcat-dom-cat-overlay.compact .cat-switch.prev { left:-35%; }
            #fatcat-dom-cat-overlay.compact .cat-switch.next { right:-36%; }
            #fatcat-dom-cat-overlay.compact .cat-power {
                position:relative;
                z-index:5;
                width:76%;
                margin:-5.4% 0 .45% 3%;
                padding:.62%;
                font-size:2.45%;
                border-radius:11px;
            }
            #fatcat-dom-cat-overlay.compact .cat-stats {
                margin-top:.35%;
                padding:1.05%;
                font-size:1.62%;
            }
            #fatcat-dom-cat-overlay.compact .cat-stats div { min-height:64px; }
            #fatcat-dom-cat-overlay.compact .cat-weight {
                min-height:105px;
                margin-top:.55%;
                padding:1.45% 1.7%;
            }
            #fatcat-dom-cat-overlay.compact .weight-row {
                grid-template-columns:15% 15% 15% 1fr 12%;
                gap:.8%;
                margin-top:.55%;
            }
            #fatcat-dom-cat-overlay.compact .weight-row span {
                position:relative;
                min-height:72px;
                box-sizing:border-box;
                display:flex;
                align-items:flex-end;
                justify-content:center;
                padding:44px 0 7px;
                border-radius:12px;
                font-size:82%;
            }
            #fatcat-dom-cat-overlay.compact .weight-row span:before {
                content:"";
                position:absolute;
                left:21%;
                right:21%;
                top:7px;
                aspect-ratio:1;
                border-radius:48% 48% 42% 42%;
                background:
                    radial-gradient(circle at 35% 42%,#3d281d 0 5%,transparent 6%),
                    radial-gradient(circle at 65% 42%,#3d281d 0 5%,transparent 6%),
                    linear-gradient(#f3c27e,#d27c37);
                box-shadow:-6px -5px 0 -4px #6b4228,6px -5px 0 -4px #6b4228,inset -6px -5px 0 rgba(116,65,32,.13),0 2px 0 rgba(75,45,24,.18);
                z-index:2;
            }
            #fatcat-dom-cat-overlay.compact .weight-row span:after {
                content:"";
                position:absolute;
                left:27%;
                right:27%;
                top:31px;
                height:28px;
                border-radius:50% 50% 38% 38%;
                background:linear-gradient(#f3c27e,#d27c37);
                box-shadow:inset -5px -4px 0 rgba(116,65,32,.13);
                z-index:1;
            }
            #fatcat-dom-cat-overlay.compact .weight-row span:nth-child(2):before {
                left:14%;
                right:14%;
                top:3px;
            }
            #fatcat-dom-cat-overlay.compact .weight-row span:nth-child(3):before {
                left:7%;
                right:7%;
                top:0;
                background:
                    radial-gradient(circle at 35% 42%,#3d281d 0 5%,transparent 6%),
                    radial-gradient(circle at 65% 42%,#3d281d 0 5%,transparent 6%),
                    linear-gradient(#a99c8e,#6f665e);
            }
            #fatcat-dom-cat-overlay.compact .weight-row span:nth-child(3):after {
                left:17%;
                right:17%;
                background:linear-gradient(#a99c8e,#6f665e);
            }
            #fatcat-dom-cat-overlay.compact .weight-row span b {
                position:relative;
                z-index:3;
                font-size:100%;
                color:inherit;
            }
            #fatcat-dom-cat-overlay.compact .cat-grid { margin-top:.65%; }
            #fatcat-dom-cat-overlay.compact .cat-grid,
            #fatcat-dom-cat-overlay.compact .cat-story {
                margin-left:-12.8%;
                width:112.8%;
                box-sizing:border-box;
            }
            #fatcat-dom-cat-overlay.compact .equip-slot { min-height:52px; }
            #fatcat-dom-cat-overlay.compact .equip-pack { min-height:40px; }
            #fatcat-dom-cat-overlay.compact .equip-upgrade { min-height:27px; }
            #fatcat-dom-cat-overlay.compact .cat-story {
                min-height:88px;
                margin-top:.65%;
                grid-template-columns:1fr 18% 18%;
            }
            #fatcat-dom-cat-overlay.compact .story-photo {
                min-height:78px;
                background-position:center;
                background-size:contain;
                background-repeat:no-repeat;
                background-color:#d2a875;
            }
            #fatcat-dom-cat-overlay.compact .story-copy { min-height:70px; padding:1.3% 1.5% 1.3% 2.8%; }
            #fatcat-dom-cat-overlay.compact .story-tags span { padding:.5% 2.4%; font-size:74%; }
            #fatcat-dom-cat-overlay.compact .story-photo:after { font-size:68%; }
            #fatcat-dom-cat-overlay.compact .story-button {
                margin:0;
                padding:7% 4%;
                min-height:76px;
                border:0;
                font-size:86%;
            }
            #fatcat-dom-cat-overlay.compact .cat-list { height:10.3%; bottom:2.2%; }
            #fatcat-dom-cat-overlay.tablet .cat-bg {
                padding:7.2% 2.4% 13.2% 13.2%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud {
                left:2%;
                right:2%;
                top:.8%;
                height:5.55%;
                grid-template-columns:25% repeat(4,1fr);
                gap:.75%;
                font-size:1.42%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .player {
                grid-template-columns:29% 1fr;
                padding:3px 7px;
                font-size:.84em;
            }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .player span { gap:3px; }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .avatar { width:min(38px,88%); }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .level { width:min(25px,23%); border-width:2px; }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .exp { height:5px; }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .res {
                border-radius:999px 11px 11px 999px;
                border-width:2px;
                font-size:.9em;
                gap:3%;
                padding-right:13%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .res i { width:min(28px,26%); }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .plus { width:min(26px,24%); border-radius:6px; }
            #fatcat-dom-cat-overlay.tablet .cat-side { left:1.8%; top:7.3%; width:9.4%; }
            #fatcat-dom-cat-overlay.tablet .back,
            #fatcat-dom-cat-overlay.tablet .side-tab {
                min-height:52px;
                font-size:1.55%;
                border-radius:11px;
            }
            #fatcat-dom-cat-overlay.tablet .cat-hero {
                grid-template-columns:23% 1fr 19%;
                gap:1.4%;
                align-items:start;
            }
            #fatcat-dom-cat-overlay.tablet .cat-card.info {
                min-height:154px;
                margin-top:6px;
                padding:4%;
                font-size:1.65%;
                line-height:1.12;
            }
            #fatcat-dom-cat-overlay.tablet .cat-card.info strong {
                min-height:28px;
                padding:0 8%;
                font-size:118%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-card.info .rank {
                font-size:190%;
                line-height:1;
            }
            #fatcat-dom-cat-overlay.tablet .cat-card.info .type {
                display:inline-flex;
                align-items:center;
                min-height:20px;
                padding:0 6%;
                font-size:82%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-portrait {
                height:auto;
                min-height:250px;
                overflow:visible;
            }
            #fatcat-dom-cat-overlay.tablet .portrait-cat.img {
                width:66%;
                min-width:180px;
                margin-top:2%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-portrait .cat-talk {
                right:4%;
                top:7%;
                max-width:42%;
                font-size:23%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-hero > div:last-child {
                padding-top:32px;
            }
            #fatcat-dom-cat-overlay.tablet .mood,
            #fatcat-dom-cat-overlay.tablet .feed {
                margin-bottom:5%;
                padding:24% 4% 8%;
                font-size:1.55%;
                line-height:1.18;
                border-radius:11px;
            }
            #fatcat-dom-cat-overlay.tablet .mood:before,
            #fatcat-dom-cat-overlay.tablet .feed:before {
                top:4%;
                width:17%;
            }
            #fatcat-dom-cat-overlay.tablet .mood:after {
                left:46%;
                top:9%;
                width:8%;
                height:6%;
            }
            #fatcat-dom-cat-overlay.tablet .feed:after {
                left:46%;
                top:10%;
                width:8%;
                height:6%;
            }
            #fatcat-dom-cat-overlay.tablet .feed button {
                margin-top:5%;
                padding:4% 10%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-switch {
                z-index:7;
                top:51%;
                width:32px;
                min-width:32px;
                border:0;
                border-radius:0;
                background:transparent;
                color:#f4ad36;
                font-size:46px;
                line-height:1;
                text-shadow:0 2px 0 #5f3218;
                box-shadow:none;
            }
            #fatcat-dom-cat-overlay.tablet .cat-switch.prev { left:-9%; }
            #fatcat-dom-cat-overlay.tablet .cat-switch.next { right:-9%; }
            #fatcat-dom-cat-overlay.tablet .cat-power {
                width:78%;
                margin:.45% 0 .45% 2%;
                padding:.55%;
                font-size:2.35%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-stats {
                margin-top:.45%;
                padding:.72%;
                font-size:1.34%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-stats div { min-height:46px; }
            #fatcat-dom-cat-overlay.tablet .cat-weight {
                min-height:64px;
                margin-top:.45%;
                padding:.8% 1.1%;
                font-size:1.55%;
            }
            #fatcat-dom-cat-overlay.tablet .weight-row { margin-top:.45%; }
            #fatcat-dom-cat-overlay.tablet .cat-grid {
                grid-template-columns:36% 1fr;
                gap:1%;
                margin-top:.5%;
                margin-left:-12.8%;
                width:112.8%;
                box-sizing:border-box;
            }
            #fatcat-dom-cat-overlay.tablet .cat-grid > div {
                min-height:180px;
                padding:1%;
                font-size:1.25%;
                line-height:1.14;
            }
            #fatcat-dom-cat-overlay.tablet .focus-card {
                grid-template-columns:22% 1fr;
                gap:2%;
                padding:1%;
            }
            #fatcat-dom-cat-overlay.tablet .focus-actions { margin-top:1.5%; }
            #fatcat-dom-cat-overlay.tablet .mini-action { padding:1.2% 4%; }
            #fatcat-dom-cat-overlay.tablet .equip-row {
                gap:.8%;
                margin-top:.6%;
                align-items:start;
            }
            #fatcat-dom-cat-overlay.tablet .equip-slot {
                min-height:0;
                height:98px;
                font-size:82%;
            }
            #fatcat-dom-cat-overlay.tablet .equip-icon { width:48%; margin-bottom:1%; }
            #fatcat-dom-cat-overlay.tablet .equip-upgrade { min-height:28px; margin-top:.7%; }
            #fatcat-dom-cat-overlay.tablet .cat-story {
                display:grid;
                min-height:78px;
                margin-top:.5%;
                margin-left:-12.8%;
                width:112.8%;
                box-sizing:border-box;
                padding:.8%;
                grid-template-columns:1fr 16% 16%;
                font-size:1.28%;
            }
            #fatcat-dom-cat-overlay.tablet .story-photo {
                min-height:66px;
                background-position:center;
                background-size:contain;
                background-repeat:no-repeat;
                background-color:#d2a875;
            }
            #fatcat-dom-cat-overlay.tablet .story-copy { min-height:64px; }
            #fatcat-dom-cat-overlay.tablet .story-tags span { font-size:76%; }
            #fatcat-dom-cat-overlay.tablet .story-button {
                margin:0;
                padding:7% 3%;
                min-height:66px;
                border:0;
                font-size:90%;
            }
            #fatcat-dom-cat-overlay .focus-panel,
            #fatcat-dom-cat-overlay .equipment-panel {
                background:
                    radial-gradient(circle at 14% 8%, rgba(255,255,255,.42), transparent 22%),
                    repeating-linear-gradient(0deg, rgba(113,74,38,.035) 0 1px, transparent 1px 5px),
                    linear-gradient(#fff7df,#e8c794);
            }
            #fatcat-dom-cat-overlay .focus-panel > b,
            #fatcat-dom-cat-overlay .equipment-panel > b {
                position:relative;
                z-index:2;
                padding:0;
                margin:0 0 2.2%;
                border-radius:0;
                background:none;
                color:#65401f;
                box-shadow:none;
                font-size:116%;
            }
            #fatcat-dom-cat-overlay .focus-card.target-skill {
                position:relative;
                min-height:0;
                height:calc(100% - 28px);
                box-sizing:border-box;
                grid-template-columns:34% 1fr;
                grid-template-rows:auto 1fr auto;
                gap:3% 4%;
                align-items:start;
                padding:3%;
                background:rgba(255,251,233,.55);
                border:1px solid rgba(117,76,38,.16);
                box-shadow:inset 0 0 0 2px rgba(255,255,255,.22);
            }
            #fatcat-dom-cat-overlay .target-skill .focus-icon {
                grid-row:1 / 3;
                width:100%;
                background-size:142%;
                border:3px solid #a36a22;
                box-shadow:inset 0 0 0 3px rgba(255,224,113,.5),0 3px 0 rgba(79,45,18,.24),0 0 12px rgba(234,166,40,.24);
            }
            #fatcat-dom-cat-overlay .target-skill .focus-current {
                min-width:0;
            }
            #fatcat-dom-cat-overlay .target-skill .focus-current strong {
                display:block;
                color:#4b2d19;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
            }
            #fatcat-dom-cat-overlay .target-skill .focus-current > b {
                display:block;
                margin-top:1%;
                color:#5d3b23;
            }
            #fatcat-dom-cat-overlay .target-skill p {
                margin:3% 0 0;
                color:#6f4a2c;
            }
            #fatcat-dom-cat-overlay .target-skill .focus-next {
                grid-column:1 / 3;
                display:grid;
                grid-template-columns:1fr auto;
                align-items:center;
                padding:3% 2% 1%;
                border-top:1px solid rgba(109,72,39,.16);
                color:#7a4d29;
            }
            #fatcat-dom-cat-overlay .target-skill .focus-next b {
                color:#4a2c1a;
            }
            #fatcat-dom-cat-overlay .target-skill .focus-next small {
                grid-column:1 / 3;
                margin-top:1%;
            }
            #fatcat-dom-cat-overlay .target-skill-actions {
                grid-column:1 / 3;
                display:grid;
                grid-template-columns:30% 1fr;
                gap:4%;
                width:88%;
                justify-self:center;
            }
            #fatcat-dom-cat-overlay .target-skill-actions .mini-action {
                width:100%;
                min-width:0;
                padding:4% 2%;
            }
            #fatcat-dom-cat-overlay .target-skill .skill-details {
                border-radius:10px;
                background:linear-gradient(#f0d391,#bf8a42);
                color:#5b351d;
            }
            #fatcat-dom-cat-overlay .target-skill .skill-upgrade {
                border-radius:10px;
                color:#fff;
                box-shadow:0 3px 0 #385e24,inset 0 0 0 2px rgba(255,245,199,.24);
            }
            #fatcat-dom-cat-overlay .target-skill .skill-upgrade em {
                margin-left:4%;
                color:#fff3a5;
                font-style:normal;
            }
            #fatcat-dom-cat-overlay .equip-layout.overview-mode .equip-bag {
                display:none;
            }
            #fatcat-dom-cat-overlay .equip-layout.overview-mode .equip-row {
                height:calc(100% - 2px);
                margin-top:0;
                align-items:stretch;
            }
            #fatcat-dom-cat-overlay .equip-layout.overview-mode .equip-slot {
                min-height:0;
                height:100%;
                justify-content:flex-start;
                padding:8% 3% 6%;
                box-sizing:border-box;
                background:linear-gradient(#fff4da 0 58%,#e0be89 59%);
            }
            #fatcat-dom-cat-overlay .equip-layout.overview-mode .equip-icon {
                width:76%;
                margin:0 auto 5%;
                background-color:#ead5af;
                background-size:128%;
                border-radius:10px;
            }
            #fatcat-dom-cat-overlay .equip-layout.overview-mode .equip-slot small {
                margin-top:5%;
                min-height:2.2em;
                line-height:1.1;
            }
            #fatcat-dom-cat-overlay .equip-cta {
                position:relative;
                z-index:2;
                display:inline-flex;
                align-items:center;
                justify-content:center;
                width:78%;
                min-height:22px;
                margin-top:auto;
                border-radius:8px;
                background:linear-gradient(#8bbb56,#4e8732);
                color:white;
                font-size:86%;
                box-shadow:0 2px 0 rgba(50,81,29,.38);
            }
            #fatcat-dom-cat-overlay .equip-slot.locked .equip-cta {
                background:linear-gradient(#aa9b86,#776854);
            }
            #fatcat-dom-cat-overlay .equip-layout.detail-mode .equip-cta {
                display:none;
            }
            #fatcat-dom-cat-overlay .story-copy p {
                margin:3% 0 0;
                color:#664329;
            }
            #fatcat-dom-cat-overlay .story-photo {
                background-image:
                    var(--story-cat),
                    linear-gradient(rgba(57,34,22,.08),rgba(57,34,22,.24)),
                    url("${this.getDomAssetDataUri(GeneratedBackgroundAssets.catDetailWorkshop)}");
                background-size:contain,cover,cover;
                background-position:center 58%,center,center;
                background-repeat:no-repeat;
            }
            #fatcat-dom-cat-overlay .story-book {
                display:block;
                margin:0 0 5%;
                color:#7d4c1f;
                transform:rotate(90deg);
            }
            #fatcat-dom-cat-overlay .cat-list .cat-name {
                max-width:88%;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
            }
            #fatcat-dom-cat-overlay .cat-list .cat-level {
                font-style:normal;
                font-weight:900;
            }
            #fatcat-dom-cat-overlay .cat-list .recruit {
                gap:1%;
            }
            #fatcat-dom-cat-overlay .recruit-art {
                width:54%;
                aspect-ratio:1;
                margin-top:-7%;
                background:center/contain no-repeat;
                filter:drop-shadow(0 2px 0 rgba(93,48,13,.24));
            }
            #fatcat-dom-cat-overlay .cat-list .recruit small {
                font-size:76%;
            }
            #fatcat-dom-cat-overlay.compact .cat-grid > div {
                min-height:clamp(166px,46vw,198px);
            }
            #fatcat-dom-cat-overlay.compact .focus-card.target-skill {
                font-size:94%;
            }
            #fatcat-dom-cat-overlay.compact .target-skill .focus-icon {
                border-width:2px;
            }
            #fatcat-dom-cat-overlay.compact .equip-layout.overview-mode {
                height:calc(100% - 28px);
            }
            #fatcat-dom-cat-overlay.compact .equip-layout.overview-mode .equip-slot {
                font-size:82%;
            }
            #fatcat-dom-cat-overlay.compact .equip-layout.overview-mode .equip-icon {
                width:80%;
            }
            #fatcat-dom-cat-overlay.compact .cat-story {
                min-height:92px;
            }
            #fatcat-dom-cat-overlay.compact .cat-list .cat-name,
            #fatcat-dom-cat-overlay.compact .cat-list .cat-role-dot {
                display:none;
            }
            #fatcat-dom-cat-overlay.compact .cat-list .cat-thumb {
                width:72%;
                margin-top:3%;
                border-radius:12px;
                background-color:transparent;
                background-size:185%;
                background-position:center 35%;
                box-shadow:none;
            }
            #fatcat-dom-cat-overlay.compact .cat-list .cat-stars {
                position:absolute;
                left:8%;
                bottom:24%;
                font-size:68%;
            }
            #fatcat-dom-cat-overlay.compact .cat-list .cat-level {
                position:absolute;
                right:8%;
                bottom:22%;
                font-size:76%;
            }
            #fatcat-dom-cat-overlay.compact .cat-list .cat-status {
                position:absolute;
                left:8%;
                right:8%;
                bottom:4%;
                margin:0;
                padding:1.2% 2%;
                font-size:68%;
            }
            #fatcat-dom-cat-overlay.compact .cat-list .rarity-badge {
                z-index:2;
                min-width:25%;
                font-size:88%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-grid > div {
                min-height:205px;
            }
            #fatcat-dom-cat-overlay.tablet .equip-layout.overview-mode {
                height:170px;
            }
            #fatcat-dom-cat-overlay.tablet .cat-list .cat-name {
                display:none;
            }
            #fatcat-dom-cat-overlay.tablet .cat-list .cat-thumb {
                width:62%;
                background-size:138%;
                background-position:center 34%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-portrait { min-height:280px; }
            #fatcat-dom-cat-overlay.tablet .cat-stats div { min-height:56px; }
            #fatcat-dom-cat-overlay.tablet .cat-weight { min-height:90px; }
            #fatcat-dom-cat-overlay.tablet .cat-story { min-height:90px; }
            #fatcat-dom-cat-overlay.tablet .cat-list {
                left:2.4%;
                right:2.4%;
                height:10.4%;
                bottom:.7%;
                font-size:1.42%;
                gap:.75%;
            }
            @media (max-width:390px) {
                #fatcat-dom-cat-overlay.compact .equip-bag { display:none; }
                #fatcat-dom-cat-overlay.compact .cat-grid:has(.equip-layout.detail-mode) {
                    grid-template-columns:1fr;
                }
                #fatcat-dom-cat-overlay.compact .cat-grid:has(.equip-layout.detail-mode) .focus-panel {
                    display:none;
                }
                #fatcat-dom-cat-overlay.compact .cat-grid:has(.equip-layout.detail-mode) .equipment-panel {
                    min-height:250px;
                }
                #fatcat-dom-cat-overlay.compact .equip-layout.detail-mode .equip-bag {
                    display:block;
                }
                #fatcat-dom-cat-overlay.compact .cat-grid:has(.equip-layout.detail-mode) + .cat-story {
                    display:none;
                }
                #fatcat-dom-cat-overlay.compact .cat-portrait {
                    min-height:clamp(194px,54vw,211px);
                }
                #fatcat-dom-cat-overlay.compact .portrait-cat.img {
                    min-width:clamp(150px,42vw,164px);
                }
                #fatcat-dom-cat-overlay.compact .cat-stats div {
                    min-height:clamp(54px,15vw,59px);
                }
                #fatcat-dom-cat-overlay.compact .cat-weight {
                    min-height:clamp(84px,24vw,94px);
                }
                #fatcat-dom-cat-overlay.compact .weight-row span {
                    min-height:clamp(58px,16.5vw,64px);
                    padding-top:clamp(35px,10vw,39px);
                }
                #fatcat-dom-cat-overlay.compact .cat-story {
                    min-height:90px;
                    font-size:1.35%;
                    grid-template-columns:1fr 17% 18%;
                }
                #fatcat-dom-cat-overlay.compact .story-photo { min-height:76px; }
                #fatcat-dom-cat-overlay.compact .cat-list { height:10.6%; bottom:.5%; }
            }
        `;
        document.head.appendChild(style);
        overlay.addEventListener("pointerdown", this.onDomCatPointerDown);
        document.body.appendChild(overlay);
        this._domCatOverlay = overlay;
        this.renderDomCatOverlay();
        return overlay;
    }

    private onDomCatPointerDown = async (event: PointerEvent): Promise<void> => {
        const target = event.target as HTMLElement | null;
        const button = target?.closest("button[data-action]") as HTMLButtonElement | null;
        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        const action = button.dataset.action || "";
        const id = button.dataset.id || this._selectedDomCatId;
        if (action === "back") {
            this.select("factory");
            return;
        }
        if (action === "tab") {
            this._domCatTab = (button.dataset.tab as CatTabId) || "info";
            this._domCatMessage = `已切换到${button.textContent ?? "信息"}页`;
        } else if (action === "selectCat") {
            this._selectedDomCatId = id;
            this._domCatMessage = "";
        } else if (action === "prevCat" || action === "nextCat") {
            const configs = CatManager.getAllConfigs();
            const index = Math.max(0, configs.findIndex(item => item.id === this._selectedDomCatId));
            const offset = action === "nextCat" ? 1 : -1;
            const next = configs[(index + offset + configs.length) % configs.length];
            if (next) {
                this._selectedDomCatId = next.id;
                this._domCatMessage = "";
            }
        } else if (action === "feedCat") {
            const serverFeed = NetworkManager.canUseServer
                ? await SyncManager.feedServerCat(id)
                : null;
            if (serverFeed && CatManager.applyServerFeed(id, serverFeed.weight)) {
                this._domCatMessage = `Feed synced: ${serverFeed.previousWeight} -> ${serverFeed.weight} weight, -${this.formatNumber(serverFeed.catFoodSpent)} cat food.`;
            } else {
                this._domCatMessage = CatManager.feedCat(id) ? "Feed complete. Weight and production updated." : "Feed failed: not enough cat food, cat is locked, or weight is capped.";
            }
        } else if (action === "upgradeCat") {
            const data = CatManager.getCatData(id);
            if (data.level >= 30) {
                this._domCatMessage = "Cat level is already at the current cap.";
            } else {
                const serverUpgrade = NetworkManager.canUseServer
                    ? await SyncManager.upgradeServerCat(id)
                    : null;
                if (serverUpgrade && CatManager.applyServerUpgrade(id, serverUpgrade.level)) {
                    this._domCatMessage = `Upgrade synced: Lv.${serverUpgrade.previousLevel} -> Lv.${serverUpgrade.level}, -${this.formatNumber(serverUpgrade.coinSpent)} coin.`;
                } else {
                    this._domCatMessage = CatManager.upgradeCat(id) ? "Upgrade complete. Production increased." : "Upgrade failed: not enough coin or cat is locked.";
                }
            }
        } else if (action === "dismissCat") {
            this._domCatMessage = "解雇功能将接入猫咪合同系统，当前先保留这只猫咪。";
        } else if (action === "changeCat") {
            this._domCatTab = "equip";
            this._domCatMessage = "已打开装备更换区域。";
        } else if (action === "unlockCat") {
            const serverUnlock = NetworkManager.canUseServer
                ? await SyncManager.unlockServerCat(id)
                : null;
            if (serverUnlock && CatManager.applyServerUnlock(id, serverUnlock.level, serverUnlock.weight)) {
                this._selectedDomCatId = id;
                this._domCatMessage = `Recruit synced: ${id} joined, -${this.formatNumber(serverUnlock.coinSpent)} coin.`;
            } else {
                this._domCatMessage = CatManager.unlockCat(id) ? "Recruit complete. Cat joined the company." : "Recruit failed: not enough coin or cat already joined.";
            }
        } else if (action === "skillDetails") {
            this._domCatTab = "skill";
            this._domCatMessage = "技能详情已展开，后续会接入升级材料和触发记录。";
        } else if (action === "equipItem") {
            this._domCatTab = "equip";
            this._selectedEquipSlot = (button.dataset.slot as CatEquipmentSlotName) || "项圈";
            const itemId = button.dataset.item || "";
            if (itemId) {
                this._domCatMessage = CatManager.equipItem(id, this._selectedEquipSlot, itemId)
                    ? `${this.getEquipDefinition(itemId).name}已装备到${this._selectedEquipSlot}槽位。`
                    : `${this._selectedEquipSlot}装备失败，请先招募猫咪。`;
            } else {
                this._domCatMessage = `${this._selectedEquipSlot}槽位已选中，可从装备背包替换。`;
            }
        } else if (action === "upgradeEquip") {
            this._domCatTab = "equip";
            this._selectedEquipSlot = (button.dataset.slot as CatEquipmentSlotName) || this._selectedEquipSlot;
            const state = CatManager.getEquipmentUpgradeState(id, this._selectedEquipSlot);
            const serverUpgrade = NetworkManager.canUseServer && state.itemId
                ? await SyncManager.upgradeServerEquipment(id, state.itemId)
                : null;
            if (serverUpgrade) {
                this._domCatMessage = `Equipment synced: ${serverUpgrade.itemId} Lv.${serverUpgrade.previousLevel} -> Lv.${serverUpgrade.level}, -${this.formatNumber(serverUpgrade.coinSpent)} coin.`;
            } else if (!NetworkManager.canUseServer) {
                this._domCatMessage = CatManager.upgradeEquipment(id, this._selectedEquipSlot).message;
            } else {
                this._domCatMessage = "Equipment upgrade failed: server rejected the request.";
            }
        } else if (action === "storyWall") {
            this._domCatMessage = "故事墙会收录猫咪传记、照片和公司事件。";
        }

        this.renderDomCatOverlay();
        this.renderDomHudOverlay(true);
        this.renderDomNavOverlay(true);
    };

    private renderDomCatOverlay(): void {
        const overlay = this.ensureDomCatOverlay();
        if (!overlay) return;

        const configs = CatManager.getAllConfigs();
        if (configs.length === 0) {
            overlay.innerHTML = `<div class="cat-bg"><div class="cat-msg">猫咪配置为空</div></div>`;
            return;
        }

        if (!this._selectedDomCatId || !CatManager.getConfig(this._selectedDomCatId)) {
            this._selectedDomCatId = configs.find(config => CatManager.getCatData(config.id).isUnlocked)?.id ?? configs[0].id;
        }

        const config = CatManager.getConfig(this._selectedDomCatId) ?? configs[0];
        const data = CatManager.getCatData(config.id);
        const unlocked = data.isUnlocked;
        const production = Math.floor(CatManager.getCatProduction(config.id));
        const weightStage = CatModel.getWeightStage(data.weight);
        const weightLabel = this.getWeightStageLabel(weightStage);
        const upgradeCost = CatModel.calculateUpgradeCost(data.level);
        const unlockCost = CatModel.calculateUnlockCost(config.rarity);
        const canUpgrade = unlocked && data.level < 30 && ResourceManager.canSpend({ coin: upgradeCost });
        const feedCost = CatManager.getFeedCost(config.id);
        const wageCost = CatManager.getWageCost(config.id);
        const canFeed = unlocked && data.weight < 100 && ResourceManager.canSpend({ catFood: feedCost });
        const assignedName = this.getBuildingDisplayName(CatManager.getAssignedBuildingId(config.id));
        const mood = CatManager.getMood(config.id);
        const roleLabel = this.getCatRoleLabel(config.role);
        const stars = this.renderStars(config.rarity);
        const unlockedCount = configs.filter(item => CatManager.getCatData(item.id).isUnlocked).length;
        const totalProduction = Math.floor(configs.reduce((sum, item) => sum + CatManager.getCatProduction(item.id), 0));
        const selectedIndex = Math.max(0, configs.findIndex(item => item.id === config.id));

        overlay.innerHTML = `
            <div class="cat-bg">
                <div class="cat-art-bg"></div>
                <div class="cat-page-hud">
                    <div class="player"><i class="avatar asset" style="background-image:url('${this.getCatFullArtAsset("c_001")}')"></i><span>肥猫咖啡公司<div class="exp"><i></i></div></span><b class="level">28</b></div>
                    <div class="res coin"><i class="asset" style="background-image:url('${this.getGeneratedIconAsset("coin")}')"></i>${this.formatNumber(ResourceManager.get("coin"))}<b class="plus">+</b></div>
                    <div class="res bean"><i class="asset" style="background-image:url('${this.getGeneratedIconAsset("bean")}')"></i>${this.formatNumber(ResourceManager.get("bean"))}<b class="plus">+</b></div>
                    <div class="res food"><i class="asset" style="background-image:url('${this.getGeneratedIconAsset("food")}')"></i>${this.formatNumber(ResourceManager.get("catFood"))}<b class="plus">+</b></div>
                    <div class="res gem"><i class="asset" style="background-image:url('${this.getGeneratedIconAsset("diamond")}')"></i>${this.formatNumber(ResourceManager.get("diamond"))}<b class="plus">+</b></div>
                </div>
                <div class="cat-modal-title">猫咪图鉴</div>
                <button class="close-x" data-action="back">×</button>
                <div class="cat-side">
                    <button class="back" data-action="back">‹</button>
                    ${CAT_SIDE_TABS.map(tab => this.renderCatSideTab(tab.id, tab.label)).join("")}
                </div>
                <div class="cat-overview-head">
                    <div><b>${unlockedCount}/${configs.length}</b><span>已招募猫咪</span></div>
                    <div><b>${this.formatNumber(totalProduction)}/秒</b><span>队伍总产能</span></div>
                    <div><b>${assignedName}</b><span>当前岗位</span></div>
                    <div><b>${config.rarity}</b><span>${roleLabel} ${config.breed}</span></div>
                </div>
                <div class="cat-hero">
                    <div class="cat-card info"><strong>${config.name}</strong><br><span class="rank">${config.rarity}</span> <span class="type">${roleLabel}</span><br>${unlocked ? `Lv.${data.level}/30` : "未招募"}<br>${stars}</div>
                    <div class="cat-portrait"><div class="cat-index">${selectedIndex + 1}/${configs.length}</div><button class="cat-switch prev" data-action="prevCat">‹</button><button class="cat-switch next" data-action="nextCat">›</button><div class="portrait-cat img" style="background-image:url('${this.getCatFullArtAsset(config.id, config.portrait)}')"></div><div class="portrait-name">${config.name}</div><span class="cat-talk">${this.getCatBubble(config.personality, unlocked)}</span><div class="cat-profile-row"><em>${config.rarity}级</em><em>${roleLabel}</em><em>${assignedName}</em></div></div>
                    <div>
                        <div class="cat-card mood">心情<br><strong>${mood}%</strong></div>
                        <div class="cat-card feed">喂猫粮<br><strong>${feedCost}</strong><br><button data-action="feedCat" data-id="${config.id}" ${canFeed ? "" : "disabled"}>喂食</button></div>
                    </div>
                </div>
                <div class="cat-power">生产力：${this.formatNumber(production)}/秒</div>
                <div class="cat-stats"><div><i class="stat-icon asset" style="background-image:url('${this.getGeneratedIconAsset("bean")}')"></i>咖啡豆消耗<br><b>${this.formatNumber(config.baseBeanCost)}/秒</b></div><div><i class="stat-icon asset" style="background-image:url('${this.getGeneratedIconAsset("food")}')"></i>原料产量<br><b>${this.formatNumber(production)}/秒</b></div><div><i class="stat-icon asset" style="background-image:url('${this.getGeneratedIconAsset("coin")}')"></i>工资<br><b>${this.formatNumber(wageCost)}/分钟</b></div><div><i class="stat-icon weight"></i>体重<br><b>${weightLabel}</b></div><div><i class="stat-icon paw"></i>品种<br><b>${config.breed}</b></div></div>
                <div class="cat-weight"><b>体重阶段</b><div class="weight-row"><span class="stage-art normal ${weightStage === WeightStage.NORMAL ? "selected" : ""}" style="--stage-art:url('${this.getCatFullArtAsset(config.id, config.portrait)}')"><b>正常</b></span><span class="stage-art fat ${weightStage === WeightStage.FAT ? "selected" : ""}" style="--stage-art:url('${this.getCatFullArtAsset(config.id, config.portrait)}')"><b>胖猫</b></span><span class="stage-art super ${weightStage === WeightStage.SUPER_FAT ? "selected" : ""}" style="--stage-art:url('${this.getCatFullArtAsset(config.id, config.portrait)}')"><b>巨胖</b></span><div class="bar"><i style="width:${Math.min(100, data.weight)}%"></i></div><em>${data.weight}/100</em></div></div>
                <div class="cat-grid">
                    <div class="focus-panel"><b>${this.getCatTabTitle()}</b>${this.renderCatFocusContent(config.id, unlocked, upgradeCost, unlockCost, canUpgrade)}</div>
                    <div class="equipment-panel"><b>装备</b>${this.renderCatEquipPanel(config.id)}</div>
                </div>
                <div class="cat-story"><div class="story-copy"><b>猫咪故事</b><p>${this.getCatStory(config.name, config.personality, config.breed, assignedName)}</p><div class="story-tags"><span>${roleLabel}</span><span>${assignedName}</span><span>${weightLabel}</span></div></div><div class="story-photo" style="--story-cat:url('${this.getCatFullArtAsset(config.id, config.portrait)}')"></div><button class="story-button" data-action="storyWall" data-id="${config.id}"><span class="story-book">▰</span>故事墙</button></div>
                <div class="cat-actions"><button class="dismiss" data-action="dismissCat" data-id="${config.id}">解雇</button><button class="change" data-action="changeCat" data-id="${config.id}">更换</button><button class="level" data-action="upgradeCat" data-id="${config.id}" ${canUpgrade ? "" : "disabled"}>升级1级 ${this.formatNumber(upgradeCost)}</button></div>
                <div class="cat-roster-label">猫咪队伍</div>
                <div class="cat-list">${configs.map(item => this.renderCatListButton(item.id)).join("")}<button class="recruit" data-action="unlockCat" data-id="${config.id}"><span class="recruit-art" style="background-image:url('${this.getCatFullArtAsset("c_005")}')"></span><b>招募猫咪</b><small>${this.formatNumber(unlockCost)} 金币</small></button></div>
                <div class="cat-msg ${this._domCatMessage ? "" : "empty"}">${this._domCatMessage}</div>
            </div>`;
    }

    private renderCatSideTab(tab: CatTabId, label: string): string {
        return `<button class="side-tab tab-${tab} ${this._domCatTab === tab ? "active" : ""}" data-action="tab" data-tab="${tab}"><i class="asset" style="background-image:url('${this.getCatSideTabIcon(tab)}')"></i>${label}</button>`;
    }

    private getCatSideTabIcon(tab: CatTabId): string {
        const config = CatManager.getConfig(this._selectedDomCatId);
        if (tab === "info") return this.getCatFullArtAsset(config?.id ?? "c_001", config?.portrait);
        if (tab === "upgrade") return this.getGeneratedIconAsset("coin");
        if (tab === "skill") return this.getSkillIconAsset(config?.role ?? "producer");
        if (tab === "equip") return this.getEquipIconAsset("collar");
        return this.getEquipIconAsset("cushion");
    }

    private renderCatFocusContent(catId: string, unlocked: boolean, upgradeCost: number, unlockCost: number, canUpgrade: boolean): string {
        const config = CatManager.getConfig(catId);
        const data = CatManager.getCatData(catId);
        if (!config) return "猫咪配置缺失";
        const skillIcon = this.getSkillIconAsset(config.role);
        if (!unlocked) {
            return `<div class="focus-card"><span class="focus-icon" style="background-image:url('${skillIcon}')"></span><div><strong>${config.name}还未加入公司</strong><br>招募后可参与生产和楼层排班。<br><button class="action-btn" data-action="unlockCat" data-id="${catId}">${this.formatNumber(unlockCost)} 金币招募</button></div></div>`;
        }
        if (this._domCatTab === "upgrade") {
            return `<div class="focus-card"><span class="focus-icon" style="background-image:url('${this.getGeneratedIconAsset("coin")}')"></span><div><strong>等级 Lv.${data.level}/30</strong><div class="mini-progress"><i style="width:${Math.min(100, Math.floor(data.level / 30 * 100))}%"></i></div>升级会提高基础产量和工资消耗。<br><span class="focus-tag">产量成长</span><span class="focus-tag">工资提升</span><div class="focus-actions"><button class="mini-action green" data-action="upgradeCat" data-id="${catId}" ${canUpgrade ? "" : "disabled"}>${this.formatNumber(upgradeCost)} 金币升级</button><button class="mini-action" data-action="skillDetails" data-id="${catId}">成长预览</button></div></div></div>`;
        }
        if (this._domCatTab === "skill") {
            return `<div class="focus-card"><span class="focus-icon" style="background-image:url('${skillIcon}')"></span><div><strong>${this.getSkillName(config.skillId)} Lv.${Math.max(1, Math.floor(data.level / 10) + 1)}</strong><br>${this.getSkillDesc(config.role)}<br><span class="focus-tag">${this.getCatRoleLabel(config.role)}</span><span class="focus-tag">自动触发</span><div class="focus-actions"><button class="mini-action green" data-action="skillDetails" data-id="${catId}">技能详情</button><button class="mini-action" data-action="upgradeCat" data-id="${catId}" ${canUpgrade ? "" : "disabled"}>提升等级</button></div></div></div>`;
        }
        if (this._domCatTab === "equip") {
            return `<div class="focus-card"><span class="focus-icon" style="background-image:url('${this.getEquipIconAsset("collar")}')"></span><div><strong>当前装备加成</strong><br>${this.renderEquipmentEffectSummary(catId)}<br><span class="focus-tag">项圈</span><span class="focus-tag">杯子</span><span class="focus-tag">坐垫</span><div class="focus-actions"><button class="mini-action green" data-action="equipItem" data-slot="项圈" data-id="${catId}">更换项圈</button><button class="mini-action" data-action="equipItem" data-slot="杯子" data-id="${catId}">装备背包</button></div></div></div>`;
        }
        if (this._domCatTab === "skin") {
            const catArt = this.getCatFullArtAsset(config.id, config.portrait);
            const cards = CAT_SKIN_THEMES.map(item => `<div class="skin-card-target ${item.className}" style="--skin-a:${item.colorA};--skin-b:${item.colorB}"><i style="background-image:url('${catArt}')"></i><div><b>${item.name}</b><span>${item.desc}</span><strong class="skin-style-badge">${item.style}</strong><div class="skin-swatches">${item.swatches.map(color => `<s style="--swatch:${color}"></s>`).join("")}</div><em>${item.state}</em></div></div>`).join("");
            return `<div class="skin-wardrobe"><div class="skin-preview-card"><span class="skin-preview-art" style="background-image:url('${catArt}')"></span><strong>皮肤衣柜</strong><small>当前启用：默认工作服</small></div><div class="skin-list-target">${cards}</div></div>`;
        }
        const skillLevel = Math.max(1, Math.floor(data.level / 10) + 1);
        const nextSkillLevel = Math.min(3, skillLevel + 1);
        return `<div class="focus-card target-skill"><span class="focus-icon" style="background-image:url('${skillIcon}')"></span><div class="focus-current"><strong>${this.getSkillName(config.skillId)}</strong><b>Lv.${skillLevel}</b><p>${this.getSkillDesc(config.role)}</p></div><div class="focus-next"><span>下一等级</span><b>Lv.${nextSkillLevel}</b><small>技能效果进一步提升</small></div><div class="target-skill-actions"><button class="mini-action skill-details" data-action="skillDetails" data-id="${catId}">详情</button><button class="mini-action green skill-upgrade" data-action="upgradeCat" data-id="${catId}" ${canUpgrade ? "" : "disabled"}>升级 <em>${this.formatNumber(upgradeCost)}</em></button></div></div>`;
    }

    private renderEquipmentEffectSummary(catId: string): string {
        const material = CatManager.getEquipmentEffectTotal(catId, "materialOutput");
        const mood = CatManager.getEquipmentEffectTotal(catId, "mood");
        const food = CatManager.getEquipmentEffectTotal(catId, "catFoodCost");
        const wage = CatManager.getEquipmentEffectTotal(catId, "wageCost");
        const values: Record<string, number> = { materialOutput: material, mood, catFoodCost: food, wageCost: wage };
        const rows = CAT_EQUIPMENT_EFFECT_LINES
            .map(item => values[item.type] !== 0 ? `${item.label} ${values[item.type] > 0 ? "+" : ""}${values[item.type]}%` : "")
            .filter(Boolean);
        return rows.length ? rows.slice(0, 2).join("<br>") : "暂无装备加成";
    }

    private renderCatEquipPanel(catId: string): string {
        const equipment = CatManager.getEquipment(catId);
        const row = CAT_EQUIPMENT_SLOTS.map(item => {
            const active = this._selectedEquipSlot === item.slot ? "selected" : "";
            const equipped = this.getEquipDefinition(equipment[item.slot]);
            const equipLevel = CatManager.getEquipmentLevel(catId, equipped.id);
            const maxLevel = equipped.levelMax ?? 5;
            const rarityClass = equipped.rarity === "S" ? "s-rarity" : equipped.rarity === "A" ? "a-rarity" : "";
            return `<button class="equip-slot ${active}" data-action="equipItem" data-slot="${item.slot}" data-id="${catId}"><span class="equip-rarity ${rarityClass}">${equipped.rarity}</span><span class="equip-slot-tag">${item.slot}</span><i class="equip-icon asset" style="background-image:url('${this.getEquipIconAsset(equipped.kind)}')"></i><span class="equip-name">${equipped.name}</span><em>Lv.${equipLevel}/${maxLevel}</em><span class="equip-bonus-pill">${equipped.bonus}</span><span class="equip-cta">更换</span></button>`;
        }).join("");
        const backpack = this.getEquipOptions(this._selectedEquipSlot).map(item => {
            const active = this._selectedEquipSlot === item.slot ? "ready" : "";
            const equipped = equipment[this._selectedEquipSlot] === item.id;
            const count = InventoryManager.getItemCount(item.id);
            const disabled = !equipped && count <= 0;
            const status = equipped ? "已装备" : count > 0 ? `持有 x${count}` : "未持有";
            const rarityClass = item.rarity === "S" ? "s-rarity" : item.rarity === "A" ? "a-rarity" : "";
            return `<button class="equip-pack ${active} ${equipped ? "equipped" : ""} ${disabled ? "disabled" : ""}" data-action="equipItem" data-slot="${this._selectedEquipSlot}" data-item="${item.id}" data-id="${catId}" ${disabled ? "disabled" : ""}><span class="equip-rarity ${rarityClass}">${item.rarity}</span><i class="equip-icon asset" style="background-image:url('${this.getEquipIconAsset(item.kind)}')"></i><span>${item.name}</span><em>${status}</em><span class="equip-bonus-pill">${item.bonus}</span><small>${item.source ?? "来源待定"}</small></button>`;
        }).join("");
        const upgradeState = CatManager.getEquipmentUpgradeState(catId, this._selectedEquipSlot);
        const upgradeLabel = upgradeState.isMax ? "已满级" : upgradeState.canAfford ? "升级装备" : "金币不足";
        const upgradeDisabled = upgradeState.isMax || !upgradeState.canAfford;
        const nextText = upgradeState.isMax ? "已达上限" : `Lv.${upgradeState.nextLevel}/${upgradeState.maxLevel}`;
        const detailClass = this._domCatTab === "equip" ? "detail-mode" : "overview-mode";
        return `<div class="equip-layout ${detailClass}"><div class="equip-row">${row}<button class="equip-slot locked"><span class="equip-rarity">?</span><span class="equip-slot-tag">${CAT_LOCKED_EQUIPMENT_SLOT.slot}</span><i class="equip-icon asset" style="background-image:url('${this.getEquipIconAsset(CAT_LOCKED_EQUIPMENT_SLOT.kind)}')"></i><span class="equip-name">${CAT_LOCKED_EQUIPMENT_SLOT.name}</span><em>${CAT_LOCKED_EQUIPMENT_SLOT.unlockText}</em><span class="equip-bonus-pill">${CAT_LOCKED_EQUIPMENT_SLOT.bonus}</span><span class="equip-cta">${CAT_LOCKED_EQUIPMENT_SLOT.actionLabel}</span></button></div><div class="equip-bag"><strong>装备背包</strong><div>${backpack}</div><div class="equip-upgrade-info"><span>当前等级<b>Lv.${upgradeState.level}/${upgradeState.maxLevel}</b></span><span>下级预览<b>${nextText}</b></span><span>升级消耗<b>${upgradeState.cost} 金币</b></span></div><div class="equip-effect-info"><span>当前加成<b>${upgradeState.currentEffect}</b></span><span>下级加成<b>${upgradeState.nextEffect}</b></span></div><button class="equip-upgrade ${upgradeDisabled ? "disabled" : ""}" data-action="upgradeEquip" data-slot="${this._selectedEquipSlot}" data-id="${catId}" ${upgradeDisabled ? "disabled" : ""}>${upgradeLabel}</button></div></div>`;
    }

    private getEquipDefinition(itemId = ""): { id: string; slot: string; kind: string; name: string; rarity: string; bonus: string; levelMax?: number; upgradeCost?: number; source?: string; effects?: Array<{ label: string; baseValue: number; perLevel?: number; unit?: string }> } {
        const fallback = this.getEquipOptions("项圈")[0] ?? CAT_DEFAULT_EQUIPMENT;
        return CatManager.getEquipmentConfig(itemId) ?? fallback;
    }

    private getEquipOptions(slot: string): Array<{ id: string; slot: string; kind: string; name: string; rarity: string; bonus: string; levelMax?: number; upgradeCost?: number; source?: string; effects?: Array<{ label: string; baseValue: number; perLevel?: number; unit?: string }> }> {
        return CatManager.getEquipmentBySlot(slot);
    }

    private renderCatListButton(id: string): string {
        const config = CatManager.getConfig(id);
        if (!config) return "";
        const data = CatManager.getCatData(id);
        const active = id === this._selectedDomCatId ? "active" : "";
        const locked = data.isUnlocked ? "" : "locked";
        const status = data.isUnlocked ? `Lv.${data.level}` : "未招募";
        const workStatus = data.isUnlocked ? (CatManager.getAssignedBuildingId(id) ? "工作中" : "待命") : "招募";
        const rarityClass = config.rarity === "S" || config.rarity === "SS" ? "s-rarity" : "a-rarity";
        return `<button class="${active} ${locked}" data-action="selectCat" data-id="${id}"><span class="rarity-badge ${rarityClass}">${config.rarity}</span><span class="cat-role-dot asset ${config.role}" style="background-image:url('${this.getSkillIconAsset(config.role)}')"></span><span class="cat-thumb hero-art" style="background-image:url('${this.getCatFullArtAsset(id, config.portrait)}')"></span><span class="cat-name">${config.name}</span><span class="cat-stars">${this.renderStars(config.rarity).slice(0, 3)}</span><em class="cat-level">${status}</em><span class="cat-status">${workStatus}</span></button>`;
    }

    private getCatFullArtAsset(catId: string, portrait?: string): string {
        return getCatFullArtAsset(catId, portrait);
    }

    private getEquipIconAsset(kind: string): string {
        return getEquipIconAsset(kind);
    }

    private getSkillIconAsset(role: string): string {
        return getSkillIconAsset(role);
    }

    private getCatTabTitle(): string {
        return getCatTabTitleText(this._domCatTab);
    }

    private getWeightStageLabel(stage: WeightStage): string {
        return getWeightStageLabelText(stage);
    }

    private getCatRoleLabel(role: string): string {
        return getCatRoleLabelText(role);
    }

    private renderStars(rarity: string): string {
        return renderRarityStars(rarity);
    }

    private getSkillName(skillId: string): string {
        return getSkillDisplayName(skillId);
    }

    private getSkillDesc(role: string): string {
        return getSkillDescription(role);
    }

    private getCatBubble(personality: string, unlocked: boolean): string {
        return getCatBubbleText(personality, unlocked);
    }

    private getCatStory(name: string, personality: string, breed: string, assignedName: string): string {
        return getCatStoryText(name, personality, breed, assignedName);
    }

    private getBuildingDisplayName(id: string): string {
        return getFactoryBuildingDisplayName(id);
    }

    private layoutDomCatOverlay(): void {
        if (typeof document === "undefined" || !this._domCatOverlay) return;
        const canvas = document.querySelector("canvas");
        if (!canvas) return;

        const rect = this.getVisibleCanvasRect(canvas.getBoundingClientRect());
        const topBleed = Math.min(64, Math.max(34, rect.height * 0.055));
        const height = rect.height + topBleed;
        this._domCatOverlay.style.left = `${rect.left}px`;
        this._domCatOverlay.style.top = `${rect.top - topBleed}px`;
        this._domCatOverlay.style.width = `${rect.width}px`;
        this._domCatOverlay.style.height = `${height}px`;
        this._domCatOverlay.style.fontSize = `${this.getResponsiveFontBase(rect.width, height)}px`;
        this.applyResponsiveClasses(this._domCatOverlay, rect.width, height);
    }

    private ensureCatOverlay(): Node | null {
        if (this._catOverlay?.isValid) return this._catOverlay;

        const root = this.node.parent?.parent;
        if (!root) return null;

        const overlay = new Node("RuntimeCatOverlay");
        overlay.layer = root.layer;
        overlay.setParent(root);
        overlay.setPosition(20000, 0);
        overlay.addComponent(UITransform).setContentSize(1080, 1700);

        this.createOverlayBox(overlay, "Background", 0, -40, 980, 1500, new Color(58, 40, 28, 250));
        this.createOverlayBox(overlay, "Title", 0, 640, 620, 90, new Color(92, 68, 48, 255), "猫咪管理", 42, Color.WHITE);
        this.createOverlayBox(overlay, "CatPortrait", 0, 350, 380, 320, new Color(245, 214, 170, 255), "大橘\n咖啡猫", 52, new Color(72, 45, 28));
        this.createOverlayBox(overlay, "InfoCard", -285, 355, 260, 230, new Color(250, 232, 198, 255), "大橘\nS  生产型\nLv.20/30\n★★★★★", 30, new Color(70, 45, 30));
        this.createOverlayBox(overlay, "MoodCard", 340, 410, 180, 100, new Color(48, 37, 29, 255), "心情\n100%", 28, Color.WHITE);
        this.createOverlayBox(overlay, "FeedCard", 330, 230, 220, 120, new Color(248, 221, 171, 255), "喂猫粮\n120", 30, new Color(70, 45, 30));
        this.createOverlayBox(overlay, "PowerCard", 0, 90, 520, 90, new Color(70, 48, 30, 255), "生产力：168/秒", 38, Color.WHITE);
        this.createOverlayBox(overlay, "Stats", 0, -90, 860, 165, new Color(255, 240, 212, 255), "咖啡豆消耗      原料产量      工资      体重      品种\n92/秒           168/秒       240/分钟   胖乎乎    橘猫", 27, new Color(70, 45, 30));
        this.createOverlayBox(overlay, "Weight", 0, -300, 860, 200, new Color(255, 240, 212, 255), "体重阶段\n正常        胖猫        巨胖                 体重值 68/100", 30, new Color(70, 45, 30));
        this.createOverlayBox(overlay, "Skill", -230, -560, 400, 250, new Color(255, 240, 212, 255), "技能\n大橘暴击 Lv.2\n生产咖啡时有概率产出双倍原料\n\n升级  钻石 200", 26, new Color(70, 45, 30));
        this.createOverlayBox(overlay, "Equip", 245, -560, 500, 250, new Color(255, 240, 212, 255), "装备\n猫咪项圈 Lv.5\n幸运杯子 Lv.3\n舒适坐垫 Lv.2", 27, new Color(70, 45, 30));
        this.createOverlayBox(overlay, "CatList", 0, -780, 900, 150, new Color(73, 54, 40, 255), "S 大橘      A 奶牛      A 小白      S 黑猫        招募猫咪", 30, Color.WHITE);

        this._catOverlay = overlay;
        return overlay;
    }

    private createOverlayBox(parent: Node, name: string, x: number, y: number, width: number, height: number, color: Color, text = "", fontSize = 28, fontColor: Color = Color.WHITE): Node {
        const node = new Node(name);
        node.layer = parent.layer;
        node.setParent(parent);
        node.setPosition(x, y);
        node.addComponent(UITransform).setContentSize(width, height);
        const sprite = node.addComponent(Sprite);
        sprite.color = color;
        resources.load("textures/white_bg/spriteFrame", SpriteFrame, (error, frame) => {
            if (!error && sprite.isValid) {
                sprite.spriteFrame = frame;
            }
        });

        if (text) {
            const labelNode = new Node("Label");
            labelNode.layer = parent.layer;
            labelNode.setParent(node);
            labelNode.addComponent(UITransform).setContentSize(width - 36, height - 24);
            const label = labelNode.addComponent(Label);
            label.string = text;
            label.fontSize = fontSize;
            label.lineHeight = fontSize + 8;
            label.color = fontColor;
            label.horizontalAlign = 1;
            label.verticalAlign = 1;
        }
        return node;
    }

    private updateButtons(): void {
        const selectedNames = MAIN_PANEL_SELECTED_NAMES[this.currentPanel];

        for (const node of this.navButtons) {
            const label = node.getComponentInChildren(Label);
            if (label) {
                const lowerName = node.name.toLowerCase();
                const isSelected = selectedNames.some(name => lowerName.includes(name.toLowerCase()));
                label.color = isSelected ? new Color(255, 120, 0) : new Color(255, 255, 255);
                const bg = node.getComponentInChildren(Sprite);
                if (bg) {
                    bg.color = isSelected ? new Color(224, 106, 28) : new Color(74, 58, 52);
                }
            }
        }
    }
}
