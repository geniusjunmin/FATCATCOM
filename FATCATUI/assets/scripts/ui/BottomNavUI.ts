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
import { FriendActivityDto, FriendDto, FriendRequestDto, FriendSearchResultDto, LeaderboardDto } from "../net/ApiTypes";
import { CatModel, WeightStage } from "../model/CatModel";
import { TaskType } from "../model/TaskModel";
import { DomAssetDataUris } from "./DomAssetDataUris";
import { FactoryPropDataUris } from "./FactoryPropDataUris";
import { GeneratedBackgroundAssets, GeneratedCatFullArtAssets, GeneratedCatThumbAssets, GeneratedFeatureIconAssets, GeneratedItemIconAssets, GeneratedSkillIconAssets } from "./UiAssetRegistry";

const { ccclass, property } = _decorator;

export type MainPanelId = "factory" | "cats" | "buildings" | "shop" | "inventory" | "research" | "tasks" | "achievements" | "mail" | "friends" | "settings";

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
    private _domCatTab = "info";
    private _domCatMessage = "";
    private _selectedEquipSlot = "项圈";
    private _selectedDomBuildingId = "building_cafe_1f";
    private _domShopTab: "resource" | "item" | "cat" | "deco" = "resource";
    private _domInventoryTab: "all" | "resource" | "shard" | "other" = "all";
    private _selectedResearchId = "res_basic_prod";
    private _serverFriends: FriendDto[] = [];
    private _friendActivities: FriendActivityDto[] = [];
    private _receivedFriendRequests: FriendRequestDto[] = [];
    private _sentFriendRequests: FriendRequestDto[] = [];
    private _friendSearchQuery = "";
    private _friendSearchPreview: FriendSearchResultDto | null = null;
    private _friendSearchMessage = "";
    private _serverLeaderboard: LeaderboardDto | null = null;
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
        const orderedPanels: MainPanelId[] = ["factory", "cats", "buildings", "shop", "inventory", "research"];
        const bindings: Array<{ names: string[]; panel: MainPanelId }> = [
            { names: ["factory", "工厂"], panel: "factory" },
            { names: ["cats", "cat", "猫咪"], panel: "cats" },
            { names: ["buildings", "building", "建筑"], panel: "buildings" },
            { names: ["shop", "商店"], panel: "shop" },
            { names: ["inventory", "背包"], panel: "inventory" },
            { names: ["research", "研究"], panel: "research" },
            { names: ["tasks", "任务"], panel: "tasks" },
        ];

        for (let index = 0; index < this.navButtons.length; index++) {
            const node = this.navButtons[index];
            if (this._boundNavButtons.has(node)) continue;
            const lowerName = node.name.toLowerCase();
            const binding = bindings.find(item => item.names.some(name => lowerName.includes(name.toLowerCase())));
            const panel = binding?.panel ?? orderedPanels[index];
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
            return { cx, cy: 0.948, w: Math.min(0.145, w * 1.08), h: Math.min(0.09, h * 1.08) };
        }
        if (name === "launch") return { cx, cy: 0.846, w: Math.min(0.30, w * 1.12), h: Math.min(0.10, h * 1.08) };
        if (name === "order") return { cx: 0.105, cy, w: Math.min(0.18, w * 1.08), h };
        if (name === "gift") return { cx: 0.805, cy, w: Math.min(0.27, w * 1.04), h };
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
        style.textContent = `
            #fatcat-dom-factory { position: fixed; z-index: 2147482300; pointer-events: none; font-family: Arial, sans-serif; color: #fff4d8; overflow: hidden; }
            #fatcat-dom-factory .art-bg { position: absolute; inset: 0; background: radial-gradient(circle at 18% 9%, rgba(255,255,255,.82) 0 7%, transparent 8%), radial-gradient(circle at 78% 10%, rgba(255,255,255,.62) 0 9%, transparent 10%), linear-gradient(#bfe9ff 0%, #eaf8ff 38%, #88b16d 100%); filter: saturate(1.05) contrast(1.02); }
            #fatcat-dom-factory .sky { position: absolute; inset: 0; background: radial-gradient(circle at 12% 10%, rgba(255,255,255,.88) 0 8%, transparent 9%), radial-gradient(circle at 78% 7%, rgba(255,255,255,.7) 0 10%, transparent 11%), linear-gradient(#bfe9ff 0%, #eaf8ff 42%, #96c57b 100%); }
            #fatcat-dom-factory .town { position: absolute; left: 0; right: 0; bottom: 9%; height: 32%; background: linear-gradient(rgba(255,255,255,0), rgba(68,83,72,.35)), repeating-linear-gradient(135deg, transparent 0 7%, rgba(108,77,55,.25) 7% 9%, transparent 9% 15%); }
            #fatcat-dom-factory .sky, #fatcat-dom-factory .town { opacity: .14; }
            #fatcat-dom-factory .building { position: absolute; left: 8%; right: 8%; top: 11%; bottom: 24%; border: 3px solid rgba(67,50,36,.72); border-radius: 22px 22px 8px 8px; background: rgba(76,55,40,.06); box-shadow: 0 8px 0 rgba(0,0,0,.18), inset 0 0 0 4px rgba(255,255,255,.04); overflow: hidden; }
            #fatcat-dom-factory .building:before { content:""; position:absolute; z-index:5; inset:0; pointer-events:none; background:linear-gradient(90deg, rgba(40,28,22,.22), transparent 9%, transparent 91%, rgba(40,28,22,.22)), repeating-linear-gradient(0deg, transparent 0 16.35%, rgba(255,230,176,.08) 16.35% 16.72%, transparent 16.72% 16.95%), repeating-linear-gradient(90deg, rgba(255,234,190,.05) 0 1px, transparent 1px 9.4%); mix-blend-mode:screen; opacity:.64; }
            #fatcat-dom-factory .building:after { content:""; position:absolute; z-index:6; left:0; right:0; bottom:0; height:6%; pointer-events:none; background:linear-gradient(rgba(48,35,28,0), rgba(30,22,18,.46)); }
            #fatcat-dom-factory .roof-deck { position: absolute; left: 8.5%; right: 8.5%; top: 10%; height: 3.5%; border-radius: 12px 12px 0 0; background: linear-gradient(#8b6d58, #493629); border: 2px solid #3d2c21; box-shadow: 0 4px 0 rgba(0,0,0,.22); }
            #fatcat-dom-factory .side-pipe { position: absolute; top: 17%; bottom: 17%; width: 3.2%; border-radius: 999px; background: linear-gradient(90deg,#202829,#69716f 42%,#2c3332 74%,#141919); border: 2px solid #26302f; box-shadow: inset 0 0 0 2px rgba(255,255,255,.08), 0 3px 0 rgba(0,0,0,.25); overflow:hidden; }
            #fatcat-dom-factory .side-pipe:before { content:""; position:absolute; inset:2% 18%; background:repeating-linear-gradient(0deg, transparent 0 7%, rgba(220,200,164,.22) 7% 8.4%, transparent 8.4% 14%); border-left:1px solid rgba(255,255,255,.1); border-right:1px solid rgba(0,0,0,.22); }
            #fatcat-dom-factory .side-pipe:after { content:""; position:absolute; left:-25%; right:-25%; top:9%; height:4.2%; border-radius:999px; background:linear-gradient(#7e6851,#3d3027); box-shadow:0 13vh 0 #4a3930, 0 26vh 0 #4a3930, 0 39vh 0 #4a3930, 0 52vh 0 #4a3930; opacity:.86; }
            #fatcat-dom-factory .side-pipe.left { left: 5.2%; } #fatcat-dom-factory .side-pipe.right { right: 5.2%; }
            #fatcat-dom-factory .ladder { position: absolute; left: 2.3%; top: 36%; width: 7%; height: 39%; border-radius: 12px; background: linear-gradient(90deg, #554334 0 18%, transparent 18% 82%, #554334 82%); box-shadow: inset 0 0 0 2px rgba(255,230,180,.12); }
            #fatcat-dom-factory .ladder::before { content: ""; position: absolute; inset: 7% 20%; background: repeating-linear-gradient(0deg, transparent 0 8%, #8e775d 8% 11%, transparent 11% 20%); }
            #fatcat-dom-factory .elevator-panel { position:absolute; left:2.5%; top:43%; width:7.2%; height:27%; border-radius:18px; background:linear-gradient(#d6b386,#80624c); border:3px solid #5b4130; box-shadow:0 5px 0 rgba(0,0,0,.32), inset 0 0 0 3px rgba(255,238,196,.18); }
            #fatcat-dom-factory .elevator-panel:before { content:""; position:absolute; left:16%; right:16%; top:7%; height:26%; border-radius:10px; background:linear-gradient(#c9a578,#8a6a51); box-shadow:inset 0 0 0 3px rgba(82,55,35,.24); }
            #fatcat-dom-factory .elevator-panel:after { content:""; position:absolute; left:28%; right:28%; top:15%; height:12%; border-radius:50%; background:radial-gradient(circle at 50% 62%,#6b4a35 0 20%,transparent 21%), radial-gradient(circle at 30% 34%,#6b4a35 0 15%,transparent 16%), radial-gradient(circle at 50% 25%,#6b4a35 0 15%,transparent 16%), radial-gradient(circle at 70% 34%,#6b4a35 0 15%,transparent 16%); }
            #fatcat-dom-factory .elevator-car { position:absolute; left:18%; right:18%; bottom:7%; height:34%; border-radius:12px 12px 8px 8px; background:linear-gradient(#4c3729,#1e1713); border:2px solid #3b2a20; overflow:hidden; box-shadow:inset 0 0 0 2px rgba(255,224,160,.12); }
            #fatcat-dom-factory .elevator-car:before { content:""; position:absolute; left:18%; right:18%; bottom:0; height:68%; border-radius:50% 50% 34% 34%; background:linear-gradient(#f5c482,#c97938); }
            #fatcat-dom-factory .elevator-car:after { content:""; position:absolute; left:27%; top:18%; width:46%; height:36%; border-radius:50%; background:radial-gradient(circle at 35% 45%,#3d281d 0 8%,transparent 9%), radial-gradient(circle at 65% 45%,#3d281d 0 8%,transparent 9%), linear-gradient(#ffd198,#df8c42); box-shadow:-8px -7px 0 -5px #6b4228, 8px -7px 0 -5px #6b4228; }
            #fatcat-dom-factory .elevator-paw { position:absolute; left:22%; right:22%; top:9%; height:18%; border-radius:50%; background:radial-gradient(circle at 50% 62%,#6f4e37 0 19%,transparent 20%), radial-gradient(circle at 30% 34%,#6f4e37 0 14%,transparent 15%), radial-gradient(circle at 50% 24%,#6f4e37 0 14%,transparent 15%), radial-gradient(circle at 70% 34%,#6f4e37 0 14%,transparent 15%); opacity:.94; }
            #fatcat-dom-factory .elevator-floor-indicator { position:absolute; left:18%; right:18%; bottom:44%; height:9%; border-radius:999px; background:linear-gradient(90deg,#8a5a2d,#f0c867,#8a5a2d); box-shadow:0 2px 0 rgba(0,0,0,.25), inset 0 0 0 1px rgba(92,55,27,.34); }
            #fatcat-dom-factory .elevator-floor-indicator:before { content:""; position:absolute; left:16%; top:30%; width:16%; aspect-ratio:1; border-radius:50%; background:#fff0ad; box-shadow:16px 0 0 #6f4625, 32px 0 0 #fff0ad; }
            #fatcat-dom-factory .sign { position: absolute; left: 22%; top: 7.2%; width: 44%; height: 7.4%; border-radius: 14px; background: linear-gradient(#a66a31, #6b3f22); border: 3px solid #3f2b1d; display: flex; align-items: center; justify-content: center; color: #ffe4a7; font-size: 4.75%; font-weight: 900; box-shadow: 0 5px 0 rgba(0,0,0,.25); }
            #fatcat-dom-factory .sign:before, #fatcat-dom-factory .sign:after { content:""; position:absolute; top:18%; width:6%; aspect-ratio:1; border-radius:50%; background:#d8a65a; box-shadow:inset 0 0 0 2px #68401f, 0 2px 0 rgba(0,0,0,.25); }
            #fatcat-dom-factory .sign:before { left:5%; } #fatcat-dom-factory .sign:after { right:5%; }
            #fatcat-dom-factory .sign .paw-mark { position:absolute; right:17%; width:8%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 50% 62%,#f4c765 0 19%,transparent 20%), radial-gradient(circle at 30% 35%,#f4c765 0 13%,transparent 14%), radial-gradient(circle at 50% 25%,#f4c765 0 13%,transparent 14%), radial-gradient(circle at 70% 35%,#f4c765 0 13%,transparent 14%); }
            #fatcat-dom-factory .roof-cat { position: absolute; right: 20%; top: 7.1%; width: 10.5%; height: 7.8%; filter: drop-shadow(0 3px 0 rgba(0,0,0,.3)); }
            #fatcat-dom-factory .flag { position: absolute; right: 10%; top: 6.2%; width: 10.5%; height: 6.4%; background: #547b5a; border-radius: 0 12px 12px 0; box-shadow: inset 0 0 0 2px rgba(255,255,255,.18); display: flex; align-items: center; justify-content: center; font-size: 3.2%; }
            #fatcat-dom-factory .floor { position: relative; height: 16.66%; border-top: 3px solid #3e3027; background: linear-gradient(90deg, #5a463a, #937761 48%, #5a463a); box-sizing: border-box; overflow:hidden; }
            #fatcat-dom-factory .floor:nth-child(odd) { background: linear-gradient(90deg, #514035, #876c55 48%, #554136); }
            #fatcat-dom-factory .floor:before { content:""; position:absolute; left:0; right:0; top:0; height:18%; background:linear-gradient(rgba(255,231,165,.18), rgba(255,231,165,0)); pointer-events:none; }
            #fatcat-dom-factory .floor:after { content:""; position:absolute; left:0; right:0; bottom:0; height:10%; background:linear-gradient(90deg,#30231b,#6a4e3b 45%,#2f231c); box-shadow:0 -2px 0 rgba(255,224,160,.08) inset; pointer-events:none; }
            #fatcat-dom-factory .floor-glow { position:absolute; z-index:0; inset:0; pointer-events:none; background:radial-gradient(ellipse at 54% 18%, rgba(255,206,104,.18), transparent 34%), radial-gradient(ellipse at 72% 70%, rgba(255,157,64,.12), transparent 30%); mix-blend-mode:screen; opacity:.78; }
            #fatcat-dom-factory .floor-scene-tank .floor-glow { background:radial-gradient(ellipse at 58% 26%, rgba(210,234,255,.14), transparent 34%), radial-gradient(ellipse at 77% 72%, rgba(255,203,111,.12), transparent 30%); }
            #fatcat-dom-factory .floor-scene-cafe .floor-glow { background:radial-gradient(ellipse at 44% 18%, rgba(255,221,134,.24), transparent 36%), radial-gradient(ellipse at 72% 68%, rgba(255,170,80,.14), transparent 30%); }
            #fatcat-dom-factory .room-lights { position: absolute; inset: 8% 4%; background-image: radial-gradient(circle at 21% 12%, rgba(255,221,128,.8) 0 2%, transparent 3%), radial-gradient(circle at 58% 13%, rgba(255,221,128,.65) 0 1.8%, transparent 3%), linear-gradient(90deg, transparent 0 31%, rgba(47,35,28,.72) 31% 32%, transparent 32% 64%, rgba(47,35,28,.72) 64% 65%, transparent 65%); border-radius: 6px; opacity: .26; }
            #fatcat-dom-factory .room-lights:before, #fatcat-dom-factory .room-lights:after { content:""; position:absolute; top:7%; width:12%; height:2px; background:#4a3325; box-shadow:0 5px 10px rgba(255,198,88,.45); }
            #fatcat-dom-factory .room-lights:before { left:15%; } #fatcat-dom-factory .room-lights:after { left:52%; }
            #fatcat-dom-factory .room-decor { position:absolute; z-index:0; left:31%; right:23%; top:15%; bottom:13%; opacity:.88; pointer-events:none; }
            #fatcat-dom-factory .decor-part { position:absolute; border-radius:6px; box-shadow:inset 0 0 0 2px rgba(255,229,170,.11), 0 3px 0 rgba(41,27,19,.22); }
            #fatcat-dom-factory .decor-board { left:31%; top:8%; width:24%; height:25%; background:linear-gradient(#425441,#202b21); box-shadow:inset 0 0 0 2px #9a7140, 0 3px 0 rgba(0,0,0,.2); }
            #fatcat-dom-factory .decor-board:after { content:""; position:absolute; left:14%; right:14%; top:26%; height:5%; background:#e1bd6c; box-shadow:0 9px 0 rgba(225,189,108,.78), 18px 19px 0 rgba(225,189,108,.58); }
            #fatcat-dom-factory .decor-shelf { left:2%; bottom:10%; width:28%; height:46%; background:repeating-linear-gradient(0deg,#4b3427 0 18%,#a4774d 18% 24%); }
            #fatcat-dom-factory .decor-crates { right:3%; bottom:8%; width:25%; height:36%; background:linear-gradient(#a77742,#6c472b); }
            #fatcat-dom-factory .decor-crates:before { content:""; position:absolute; inset:18% 12%; border-top:2px solid rgba(71,45,25,.6); border-bottom:2px solid rgba(71,45,25,.6); }
            #fatcat-dom-factory .decor-pipe { right:0; top:12%; width:34%; height:30%; border-top:5px solid #4c4038; border-right:5px solid #4c4038; border-radius:0 16px 0 0; box-shadow:none; }
            #fatcat-dom-factory .decor-gauge { right:18%; top:21%; width:13%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle,#f2dfb8 0 44%,#5a4638 45% 58%,#27211f 59%); }
            #fatcat-dom-factory .decor-bags { left:4%; bottom:7%; width:30%; height:42%; background:linear-gradient(#d2ad71,#87633d); color:#4a2f1f; font-size:1.35%; font-weight:900; display:flex; align-items:center; justify-content:center; text-align:center; }
            #fatcat-dom-factory .decor-bags:before { content:""; position:absolute; left:18%; right:18%; top:-10%; height:22%; border-radius:50%; background:#d2ad71; }
            #fatcat-dom-factory .decor-window { right:5%; top:9%; width:22%; height:31%; background:linear-gradient(#d7efff,#86b9db); box-shadow:inset 0 0 0 3px #614735; }
            #fatcat-dom-factory .decor-window:after { content:""; position:absolute; left:47%; top:0; bottom:0; width:3px; background:#614735; box-shadow:-18px 50% 0 -1px #614735; }
            #fatcat-dom-factory .decor-table { left:15%; bottom:10%; width:42%; height:16%; background:#7a5131; box-shadow:0 12px 0 -7px #4b3020, 0 3px 0 rgba(0,0,0,.26); }
            #fatcat-dom-factory .decor-steam { left:53%; top:10%; width:9%; height:35%; background:radial-gradient(ellipse at 50% 75%, rgba(255,255,255,.42) 0 18%, transparent 19%), radial-gradient(ellipse at 45% 42%, rgba(255,255,255,.32) 0 17%, transparent 18%); box-shadow:none; }
            #fatcat-dom-factory .decor-roast .decor-steam, #fatcat-dom-factory .decor-tank .decor-steam { animation: fatcatSteam 3.4s ease-in-out infinite; }
            #fatcat-dom-factory .decor-lamp { left:47%; top:0; width:12%; height:36%; border-radius:0; background:linear-gradient(90deg, transparent 0 45%, #3a2a21 45% 55%, transparent 55%); box-shadow:none; }
            #fatcat-dom-factory .decor-lamp:before { content:""; position:absolute; left:17%; right:17%; top:30%; height:24%; border-radius:50% 50% 34% 34%; background:linear-gradient(#5b4434,#2c211b); box-shadow:0 10px 18px rgba(255,192,82,.42); }
            #fatcat-dom-factory .decor-lamp:after { content:""; position:absolute; left:-18%; right:-18%; top:49%; height:45%; border-radius:50%; background:radial-gradient(ellipse at 50% 0, rgba(255,207,92,.32), transparent 68%); }
            #fatcat-dom-factory .decor-notes { left:58%; top:34%; width:19%; height:28%; background:linear-gradient(#f1d9a0,#bd8d58); transform:rotate(-3deg); }
            #fatcat-dom-factory .decor-notes:before { content:""; position:absolute; left:-48%; top:13%; width:42%; height:70%; border-radius:4px; background:linear-gradient(#f6e5b9,#c39358); transform:rotate(7deg); box-shadow:26px 8px 0 -8px #e1bd79; }
            #fatcat-dom-factory .decor-beans { left:40%; bottom:7%; width:40%; height:12%; border-radius:999px; background:radial-gradient(circle at 8% 50%,#7a3e1f 0 9%,transparent 10%), radial-gradient(circle at 21% 55%,#935028 0 9%,transparent 10%), radial-gradient(circle at 34% 46%,#6e371c 0 9%,transparent 10%), radial-gradient(circle at 49% 56%,#935028 0 9%,transparent 10%), radial-gradient(circle at 64% 47%,#7a3e1f 0 9%,transparent 10%), radial-gradient(circle at 80% 55%,#935028 0 9%,transparent 10%); box-shadow:none; }
            #fatcat-dom-factory .decor-plant { right:2%; bottom:8%; width:16%; height:34%; background:linear-gradient(#8b5a32,#4e3424); border-radius:0 0 8px 8px; }
            #fatcat-dom-factory .decor-plant:before { content:""; position:absolute; left:-30%; right:-30%; top:-60%; height:80%; background:radial-gradient(ellipse at 30% 80%,#6fa45a 0 22%,transparent 23%), radial-gradient(ellipse at 52% 68%,#4f873e 0 25%,transparent 26%), radial-gradient(ellipse at 73% 80%,#7ab35f 0 20%,transparent 21%); }
            #fatcat-dom-factory .decor-conveyor { left:28%; right:10%; bottom:16%; height:12%; border-radius:999px; background:linear-gradient(#5a4436,#2d241f); box-shadow:inset 0 0 0 2px rgba(255,224,160,.1), 0 3px 0 rgba(0,0,0,.25); }
            #fatcat-dom-factory .decor-conveyor:after { content:""; position:absolute; inset:25% 7%; background:repeating-linear-gradient(90deg,#d08a3b 0 7%, transparent 7% 13%); border-radius:999px; opacity:.78; }
            #fatcat-dom-factory .decor-roast .decor-conveyor:after, #fatcat-dom-factory .decor-mill .decor-conveyor:after { animation: fatcatBelt 2.8s linear infinite; }
            #fatcat-dom-factory .decor-clock { right:6%; top:10%; width:13%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle,#f2dfb8 0 52%,#7c5f45 53% 65%,#2f2723 66%); }
            #fatcat-dom-factory .decor-clock:after { content:""; position:absolute; left:49%; top:24%; width:3%; height:29%; background:#4c3424; transform-origin:50% 90%; transform:rotate(42deg); box-shadow:5px 8px 0 -1px #4c3424; }
            #fatcat-dom-factory .room-foreground { position:absolute; z-index:2; left:30%; right:24%; bottom:7%; height:28%; pointer-events:none; opacity:.82; }
            #fatcat-dom-factory .room-foreground:before, #fatcat-dom-factory .room-foreground:after { content:""; position:absolute; bottom:0; filter:drop-shadow(0 3px 0 rgba(36,22,14,.2)); }
            #fatcat-dom-factory .room-foreground:before { left:3%; width:18%; height:42%; border-radius:6px; background:linear-gradient(#aa7440,#68422a); box-shadow:18px -6px 0 -5px #c18a4f, 42px 1px 0 -8px #785134; }
            #fatcat-dom-factory .room-foreground:after { right:2%; width:24%; height:30%; border-radius:999px 999px 10px 10px; background:radial-gradient(circle at 18% 48%,#7b3d1e 0 8%,transparent 9%), radial-gradient(circle at 38% 44%,#9b5428 0 8%,transparent 9%), radial-gradient(circle at 60% 50%,#75401f 0 8%,transparent 9%), linear-gradient(#6b4a35,#2d241f); }
            #fatcat-dom-factory .room-foreground.office:before { left:7%; width:28%; height:34%; background:linear-gradient(#4d3a2e,#2f241e); box-shadow:30px -8px 0 -10px #25323a, 58px 0 0 -12px #c99b56; }
            #fatcat-dom-factory .room-foreground.office:after { right:8%; width:13%; height:48%; border-radius:50% 50% 8px 8px; background:radial-gradient(ellipse at 50% 12%,#70a855 0 28%,transparent 29%), linear-gradient(#8b5a32,#4e3424); }
            #fatcat-dom-factory .room-foreground.tank:before { width:14%; height:60%; border-radius:50% 50% 8px 8px; background:linear-gradient(#bbb39b,#675c4d); box-shadow:30px 0 0 #91856f, 60px 0 0 #aca089; }
            #fatcat-dom-factory .room-foreground.cafe:after { right:4%; width:18%; height:36%; border-radius:0 0 12px 12px; background:#fff0d1; box-shadow:inset 0 0 0 3px #8e6039, 16px 3px 0 -9px transparent; }
            #fatcat-dom-factory .room-foreground.storage:before { width:30%; height:44%; background:linear-gradient(#d2ad71,#87633d); border-radius:50% 50% 10px 10px; box-shadow:28px 8px 0 -6px #b88c58, 58px 2px 0 -9px #6c4a32; }
            #fatcat-dom-factory .decor-office .decor-crates { display:none; }
            #fatcat-dom-factory .decor-office .decor-table { left:8%; width:42%; bottom:12%; }
            #fatcat-dom-factory .decor-office .decor-board { left:42%; width:28%; }
            #fatcat-dom-factory .decor-office .decor-plant { right:2%; }
            #fatcat-dom-factory .decor-roast .decor-gauge, #fatcat-dom-factory .decor-tank .decor-gauge { display:block; }
            #fatcat-dom-factory .decor-tank .decor-shelf { display:none; }
            #fatcat-dom-factory .decor-tank .decor-pipe { right:6%; width:42%; height:42%; }
            #fatcat-dom-factory .decor-roast .decor-conveyor, #fatcat-dom-factory .decor-tank .decor-conveyor, #fatcat-dom-factory .decor-mill .decor-conveyor { display:block; }
            #fatcat-dom-factory .decor-cafe .decor-window { display:block; }
            #fatcat-dom-factory .decor-cafe .decor-clock { display:block; }
            #fatcat-dom-factory .decor-storage .decor-board { display:none; }
            #fatcat-dom-factory .props { position: absolute; z-index:1; left: 38%; right: 12%; bottom: 10%; height: 52%; border-radius: 8px; background: linear-gradient(90deg, rgba(58,41,30,.42), rgba(255,195,93,.18), rgba(40,29,23,.42)); display: grid; grid-template-columns: 24% 1fr 24%; align-items: end; gap: 2%; padding: 1.5%; box-sizing: border-box; opacity:.82; }
            #fatcat-dom-factory .prop-asset { position:absolute; z-index:1; left:42%; right:16%; bottom:7%; height:58%; background:center bottom / contain no-repeat; filter:drop-shadow(0 4px 0 rgba(34,22,14,.25)); opacity:.96; pointer-events:none; }
            #fatcat-dom-factory .prop-roast, #fatcat-dom-factory .prop-mill { animation: fatcatMachinePulse 3.2s ease-in-out infinite; transform-origin:50% 80%; }
            #fatcat-dom-factory .prop-asset.prop-office { left:36%; right:16%; bottom:8%; height:54%; }
            #fatcat-dom-factory .prop-asset.prop-roast, #fatcat-dom-factory .prop-asset.prop-mill { left:39%; right:14%; bottom:5%; height:62%; }
            #fatcat-dom-factory .prop-asset.prop-tank { left:41%; right:15%; bottom:7%; height:63%; }
            #fatcat-dom-factory .prop-asset.prop-cafe { left:36%; right:14%; bottom:7%; height:56%; }
            #fatcat-dom-factory .prop-asset.prop-storage { left:38%; right:13%; bottom:5%; height:58%; }
            #fatcat-dom-factory .prop-asset:before, #fatcat-dom-factory .prop-asset:after { content:""; position:absolute; filter:drop-shadow(0 3px 0 rgba(43,27,18,.22)); opacity:.72; }
            #fatcat-dom-factory .prop-office:before { left:4%; bottom:8%; width:44%; height:36%; border-radius:8px; background:linear-gradient(#7a5537,#3d2a20); box-shadow:52px -18px 0 -20px #25323a, 92px -8px 0 -16px #c99955; }
            #fatcat-dom-factory .prop-office:after { right:9%; bottom:12%; width:16%; height:38%; border-radius:50% 50% 8px 8px; background:radial-gradient(ellipse at 50% 18%,#70a855 0 28%,transparent 29%), linear-gradient(#8b5a32,#4e3424); }
            #fatcat-dom-factory .prop-roast:before, #fatcat-dom-factory .prop-mill:before { left:13%; bottom:9%; width:46%; height:52%; border-radius:50% 50% 14px 14px; background:radial-gradient(circle at 42% 46%,#e0a14c 0 18%,#684025 19% 27%,transparent 28%), linear-gradient(120deg,#c67833,#5d3928); box-shadow:inset 0 0 0 4px rgba(80,45,26,.45); }
            #fatcat-dom-factory .prop-roast:after, #fatcat-dom-factory .prop-mill:after { right:9%; bottom:10%; width:28%; height:22%; border-radius:999px; background:repeating-radial-gradient(circle at 12% 48%,#8b4b24 0 7%, transparent 8% 18%), linear-gradient(#5a3d2e,#2e241f); }
            #fatcat-dom-factory .prop-tank:before { left:5%; bottom:7%; width:22%; height:64%; border-radius:50% 50% 8px 8px; background:linear-gradient(#c3b89d,#786a56); box-shadow:72px 0 0 #8d806a, 144px 0 0 #aa9c82, inset 0 0 0 4px rgba(55,43,32,.34); }
            #fatcat-dom-factory .prop-tank:after { right:11%; bottom:16%; width:20%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle,#efe2c4 0 42%,#5a4638 43% 58%,#27211f 59%); }
            #fatcat-dom-factory .prop-cafe:before { left:7%; bottom:8%; width:52%; height:34%; border-radius:8px; background:linear-gradient(#9b6841,#5b3928); box-shadow:66px -8px 0 -18px #3d2e25, 116px -2px 0 -26px #f1e0bd; }
            #fatcat-dom-factory .prop-cafe:after { right:10%; bottom:17%; width:22%; height:24%; border-radius:0 0 14px 14px; background:#fff0d1; box-shadow:inset 0 0 0 3px #8e6039, 20px 4px 0 -12px transparent; }
            #fatcat-dom-factory .prop-storage:before { left:5%; bottom:6%; width:36%; height:44%; border-radius:8px; background:repeating-linear-gradient(0deg,#4e3527 0 20%,#8d6847 21% 30%); }
            #fatcat-dom-factory .prop-storage:after { right:4%; bottom:5%; width:52%; height:40%; border-radius:50% 50% 18px 18px; background:radial-gradient(ellipse at 30% 22%,#e0bc80 0 28%,transparent 29%), radial-gradient(ellipse at 72% 18%,#d0aa70 0 28%,transparent 29%), linear-gradient(#d2ad71,#87633d); }
            #fatcat-dom-factory .machine, #fatcat-dom-factory .shelf, #fatcat-dom-factory .bags { min-height: 68%; border-radius: 8px; background: linear-gradient(#8a5c35,#3f2b20); box-shadow: inset 0 0 0 2px rgba(255,225,165,.14), 0 3px 0 rgba(0,0,0,.25); display: flex; align-items: center; justify-content: center; color: #ffd88d; font-size: 3.1%; }
            #fatcat-dom-factory .machine { min-height: 88%; border-radius: 50% 50% 10px 10px; background: radial-gradient(circle at 50% 42%, #d58b3d 0 24%, #553522 26% 34%, #b66b2e 36% 55%, #3b2a21 57%); }
            #fatcat-dom-factory .shelf { align-self: stretch; background: repeating-linear-gradient(0deg,#4e3527 0 18%,#8d6847 18% 24%); }
            #fatcat-dom-factory .bags { background: linear-gradient(#d2ad71,#87633d); color: #4a2f1f; font-size: 2.7%; font-weight: 900; text-align: center; line-height: 1.1; }
            #fatcat-dom-factory .props { display: grid; }
            #fatcat-dom-factory .pipe, #fatcat-dom-factory .cat { display: block; }
            #fatcat-dom-factory .pipe { position: absolute; right: 9%; top: 13%; width: 18%; height: 16%; border-top: 6px solid #48352a; border-right: 6px solid #48352a; border-radius: 0 16px 0 0; opacity: .75; }
            #fatcat-dom-factory .cat { position: absolute; z-index:1; bottom: 10%; width: 7.5%; height: 44%; filter: drop-shadow(0 2px 0 rgba(0,0,0,.22)); }
            #fatcat-dom-factory .cat.a { left: 36%; } #fatcat-dom-factory .cat.b { left: 52%; } #fatcat-dom-factory .cat.c { left: 68%; }
            #fatcat-dom-factory .cat:after { content:""; position:absolute; left:55%; bottom:4%; width:28%; height:38%; border-radius:999px; border-right:5px solid rgba(132,75,37,.8); transform:rotate(22deg); }
            #fatcat-dom-factory .cat:before { content:""; position:absolute; z-index:3; left:43%; bottom:20%; width:34%; height:20%; border-radius:6px; opacity:.95; transform:rotate(-6deg); }
            #fatcat-dom-factory .cat.b { transform:scale(.86) translateY(7%); }
            #fatcat-dom-factory .cat.c { transform:scale(.72) translateY(18%); }
            #fatcat-dom-factory .cat.cat-office:before { width:36%; height:14%; bottom:22%; border-radius:4px; background:linear-gradient(#26333a,#15191c); box-shadow:0 -9px 0 -5px #c79652; }
            #fatcat-dom-factory .cat.cat-roast:before, #fatcat-dom-factory .cat.cat-mill:before { width:46%; height:10%; bottom:14%; left:38%; border-radius:999px; background:#7a4b27; box-shadow:18px 3px 0 -5px #d18a3d; transform:rotate(18deg); }
            #fatcat-dom-factory .cat.cat-tank:before { width:28%; height:30%; bottom:13%; left:48%; border-radius:3px 3px 8px 8px; background:linear-gradient(#dfeef5 0 24%,#c39153 25%); box-shadow:inset 0 0 0 2px rgba(94,58,32,.25); }
            #fatcat-dom-factory .cat.cat-cafe:before { width:30%; height:26%; bottom:18%; left:48%; border-radius:0 0 8px 8px; background:#fff0d1; box-shadow:inset 0 0 0 2px #8e6039, 14px 4px 0 -8px transparent; }
            #fatcat-dom-factory .cat.cat-storage:before { width:40%; height:24%; bottom:13%; left:40%; border-radius:7px; background:linear-gradient(#c39358,#765035); box-shadow:inset 0 0 0 2px rgba(67,40,23,.3); }
            #fatcat-dom-factory .cat.a .cat-sprite { animation: fatcatWorkerBob 3.6s ease-in-out infinite; }
            #fatcat-dom-factory .cat.b .cat-sprite { animation: fatcatWorkerBob 4.2s ease-in-out infinite .35s; }
            #fatcat-dom-factory .cat.c .cat-sprite { animation: fatcatWorkerBob 4.8s ease-in-out infinite .7s; }
            #fatcat-dom-factory .cat.b .cat-sprite::before { background:linear-gradient(#ece5d9,#afa396); }
            #fatcat-dom-factory .cat.b .cat-sprite::after { background:linear-gradient(#f3eee4,#b8aca1); }
            #fatcat-dom-factory .cat.c .cat-sprite::before, #fatcat-dom-factory .cat.c .cat-sprite::after { background:linear-gradient(#4e4843,#171413); }
            #fatcat-dom-factory .cat-sprite { position: relative; width: 100%; height: 100%; }
            #fatcat-dom-factory .cat-sprite::before { content: ""; position: absolute; left: 18%; right: 18%; bottom: 0; height: 70%; border-radius: 48% 48% 38% 38%; background: linear-gradient(#f6d9b0,#d9904d); box-shadow: inset -10px -8px 0 rgba(117,67,34,.18); }
            #fatcat-dom-factory .cat-sprite::after { content: ""; position: absolute; left: 24%; top: 0; width: 52%; height: 52%; border-radius: 50%; background: linear-gradient(#f8dcb5,#e29a58); box-shadow: -12px -9px 0 -8px #5b4030, 12px -9px 0 -8px #5b4030, inset 8px -4px 0 rgba(255,255,255,.28); }
            #fatcat-dom-factory .cat-face { position: absolute; left: 37%; top: 19%; width: 26%; height: 18%; z-index: 1; border-radius: 999px; background: radial-gradient(circle at 24% 38%, #4a2f1f 0 12%, transparent 13%), radial-gradient(circle at 76% 38%, #4a2f1f 0 12%, transparent 13%), radial-gradient(circle at 50% 62%, #8b4a2a 0 10%, transparent 11%); }
            #fatcat-dom-factory .floor-card { position: absolute; z-index:2; left: 2.4%; top: 16%; width: 26.5%; height: 60%; border-radius: 14px; background: linear-gradient(#fff6de, #ddc29a); border: 3px solid #7a6044; color: #4a2f1f; display: grid; grid-template-columns: 36% 1fr; align-items: center; box-sizing: border-box; box-shadow: 0 4px 0 rgba(0,0,0,.28), inset 0 0 0 2px rgba(255,255,255,.38); overflow:hidden; }
            #fatcat-dom-factory .floor-card:before { content:""; position:absolute; left:0; top:0; bottom:0; width:36%; background:linear-gradient(#9a7d58,#6f573e); z-index:0; }
            #fatcat-dom-factory .floor-no, #fatcat-dom-factory .floor-name { position:relative; z-index:1; }
            #fatcat-dom-factory .floor-no { font-size: 4.8%; font-weight: 900; text-align: center; color: #fff7d7; text-shadow: 0 2px #624326; }
            #fatcat-dom-factory .floor-name { font-size: 2.0%; font-weight: 900; line-height: 1.25; padding-right:5%; white-space:nowrap; overflow:hidden; text-overflow:clip; }
            #fatcat-dom-factory .floor-name span { display: block; font-size: 82%; margin-top: 3%; white-space:nowrap; }
            #fatcat-dom-factory .floor-medal { position:absolute; z-index:2; left:2.8%; bottom:7%; width:7.2%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 38% 24%, rgba(255,255,255,.46), transparent 21%), linear-gradient(#f0c56f,#a96a2a); border:2px solid #fff0bc; color:#fff7d7; display:flex; align-items:center; justify-content:center; font-size:1.58%; font-weight:900; text-shadow:0 1px #6b3d1c; box-shadow:0 3px 0 rgba(0,0,0,.28), inset 0 0 0 2px rgba(103,62,26,.22); }
            #fatcat-dom-factory .bonus { position: absolute; z-index:2; right: 2.7%; top: 21%; width: 22%; height: 52%; border-radius: 14px; background: radial-gradient(circle at 50% 0, rgba(255,221,146,.16), transparent 34%), linear-gradient(#3d3b34,#1f211f); border: 3px solid #91764f; display: grid; grid-template-columns:34% 1fr; grid-template-rows:1fr 1fr; align-items:center; column-gap:3%; padding:0 5%; box-sizing:border-box; font-size: 1.75%; font-weight: 900; line-height: 1.2; box-shadow: 0 4px 0 rgba(0,0,0,.3), inset 0 0 0 2px rgba(255,223,151,.1); }
            #fatcat-dom-factory .bonus-icon { position:relative; grid-row:1/3; width:100%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#ffd65c,#c98218); box-shadow:inset 0 0 0 3px #8e5913, 0 2px 0 rgba(0,0,0,.25); justify-self:center; }
            #fatcat-dom-factory .bonus-icon:before, #fatcat-dom-factory .bonus-icon:after { content:""; position:absolute; }
            #fatcat-dom-factory .bonus-office:before { inset:24%; clip-path:polygon(50% 0,100% 100%,0 100%); background:#fff0b0; }
            #fatcat-dom-factory .bonus-roast, #fatcat-dom-factory .bonus-mill { border-radius:52% 48% 50% 50%; background:linear-gradient(135deg,#9d5529,#4e2815); transform:rotate(25deg); }
            #fatcat-dom-factory .bonus-roast:before, #fatcat-dom-factory .bonus-mill:before { left:45%; top:13%; width:7%; height:74%; border-radius:99px; background:rgba(255,221,165,.38); transform:rotate(8deg); }
            #fatcat-dom-factory .bonus-tank:before { left:20%; right:20%; bottom:18%; height:48%; border-radius:0 0 32% 32%; background:linear-gradient(#fff3d4 0 22%,#cde0ec 23% 48%,#b78552 49%); box-shadow:inset 0 0 0 2px rgba(81,48,28,.24); }
            #fatcat-dom-factory .bonus-cafe:before { left:20%; top:32%; width:50%; height:38%; border-radius:0 0 12px 12px; background:#fff4df; box-shadow:inset 0 0 0 3px #9b6b3c; }
            #fatcat-dom-factory .bonus-cafe:after { right:16%; top:39%; width:22%; height:20%; border:3px solid #9b6b3c; border-left:0; border-radius:0 12px 12px 0; }
            #fatcat-dom-factory .bonus-storage:before { inset:24%; border-radius:6px; background:linear-gradient(#d09a53,#765035); box-shadow:0 9px 0 -2px #5a3a27, inset 0 0 0 2px #4d3423; }
            #fatcat-dom-factory .bonus span { color:#f4d49a; align-self:end; white-space:nowrap; }
            #fatcat-dom-factory .bonus b { color:#ffffff; font-size:168%; align-self:start; text-shadow:0 2px #141414; }
            #fatcat-dom-factory .floor-kpi { position:absolute; z-index:3; left:33%; top:19%; width:22.5%; height:26%; border-radius:14px; background:rgba(38,32,28,.88); border:2px solid rgba(229,190,123,.78); display:grid; grid-template-columns:28% 1fr; align-items:center; padding:0 3%; box-sizing:border-box; box-shadow:0 4px 0 rgba(0,0,0,.24), inset 0 0 0 2px rgba(255,236,184,.08); }
            #fatcat-dom-factory .floor-kpi i { position:relative; width:72%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#ffd75c,#d58918); box-shadow:inset 0 0 0 3px #9d6412; justify-self:center; overflow:hidden; }
            #fatcat-dom-factory .floor-kpi i:before, #fatcat-dom-factory .floor-kpi i:after { content:""; position:absolute; }
            #fatcat-dom-factory .floor-kpi.kpi-coin i:after { inset:0; display:flex; align-items:center; justify-content:center; content:"$"; color:#8a5512; font-size:2.0%; font-weight:900; }
            #fatcat-dom-factory .floor-kpi.kpi-bean i { border-radius:52% 48% 50% 50%; background:linear-gradient(135deg,#8a4b24,#4d2816); transform:rotate(24deg); box-shadow:inset -5px -6px 0 rgba(33,17,9,.18); }
            #fatcat-dom-factory .floor-kpi.kpi-food i { border-radius:0 0 38% 38%; background:linear-gradient(#fff0d0 0 18%, #d9e6f4 19% 45%, #b78c5a 46%); }
            #fatcat-dom-factory .floor-kpi.kpi-food i:before { left:15%; right:15%; top:-25%; height:40%; border-radius:50% 50% 20% 20%; background:#b65d2c; }
            #fatcat-dom-factory .floor-kpi.kpi-storage i { border-radius:10px; background:linear-gradient(#c99d5d,#7b5435); box-shadow:inset 0 0 0 3px #4d3423; }
            #fatcat-dom-factory .floor-kpi.kpi-storage i:before { left:18%; right:18%; top:18%; height:14%; background:#f0d09a; box-shadow:0 14px 0 #f0d09a, 0 28px 0 #f0d09a; }
            #fatcat-dom-factory .floor-kpi.kpi-office i { background:linear-gradient(#8fc06c,#437a35); box-shadow:inset 0 0 0 3px #2f5527; }
            #fatcat-dom-factory .floor-kpi.kpi-office i:before { inset:22%; clip-path:polygon(50% 0,100% 100%,0 100%); background:#fff0b0; }
            #fatcat-dom-factory .floor-kpi strong { display:block; color:white; font-size:2.25%; line-height:1.1; }
            #fatcat-dom-factory .floor-kpi span { display:block; color:#f4d49a; font-size:1.45%; font-weight:900; margin-top:2%; }
            #fatcat-dom-factory .cat-dots { position:absolute; z-index:2; left:33%; bottom:8%; width:19%; height:16%; display:flex; gap:7%; align-items:flex-end; }
            #fatcat-dom-factory .cat-dot { position:relative; width:22%; max-width:24px; aspect-ratio:1; border-radius:50%; background:linear-gradient(#f7d4a4,#d88643); box-shadow:0 2px 0 rgba(0,0,0,.25), inset 0 0 0 2px rgba(86,54,31,.18); }
            #fatcat-dom-factory .cat-dot:before { content:""; position:absolute; left:24%; top:31%; width:52%; height:34%; border-radius:50%; background:radial-gradient(circle at 32% 45%,#3b2519 0 10%,transparent 11%), radial-gradient(circle at 68% 45%,#3b2519 0 10%,transparent 11%); box-shadow:-5px -5px 0 -3px #6b4228, 5px -5px 0 -3px #6b4228; }
            #fatcat-dom-factory .cat-dot.gray { background:linear-gradient(#e8e2d7,#a99d91); }
            #fatcat-dom-factory .cat-dot.black { background:linear-gradient(#4d4742,#171413); }
            @keyframes fatcatSteam { 0%,100% { transform:translateY(0); opacity:.45; } 50% { transform:translateY(-8%); opacity:.72; } }
            @keyframes fatcatBelt { from { background-position:0 0; } to { background-position:36px 0; } }
            @keyframes fatcatMachinePulse { 0%,100% { transform:scale(1); filter:drop-shadow(0 4px 0 rgba(34,22,14,.25)); } 50% { transform:scale(1.012); filter:drop-shadow(0 5px 0 rgba(34,22,14,.28)); } }
            @keyframes fatcatWorkerBob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-2.5%); } }
            #fatcat-dom-factory .left-tools, #fatcat-dom-factory .right-tools { position: absolute; width: 8.2%; display: grid; gap: 1.4%; }
            #fatcat-dom-factory .left-tools { left: 1%; top: 14%; } #fatcat-dom-factory .right-tools { right: 1%; top: 18%; }
            #fatcat-dom-factory button { font:inherit; color:inherit; cursor:pointer; pointer-events:auto; touch-action:manipulation; }
            #fatcat-dom-factory .side-btn { position:relative; height: 7.8%; min-height: 66px; border-radius: 15px; background: linear-gradient(#937556, #55402f); border: 3px solid #3d2c21; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 2.05%; font-weight: 900; box-shadow: 0 4px 0 rgba(0,0,0,.34), inset 0 0 0 2px rgba(255,232,185,.1); padding:0; }
            #fatcat-dom-factory .side-btn.alert:after { content:attr(data-badge); position:absolute; right:-6%; top:-6%; min-width:28%; padding:0 5%; aspect-ratio:1; border-radius:50%; background:#e65028; color:white; border:2px solid #ffd9a8; display:flex; align-items:center; justify-content:center; font-size:1.75%; box-shadow:0 2px 0 rgba(0,0,0,.35); box-sizing:border-box; }
            #fatcat-dom-factory .side-btn i { position:relative; font-style: normal; font-size: 0; line-height: 1; width: 45%; aspect-ratio: 1; border-radius: 10px; background: #f3dcb2; color: #5a3c27; display: flex; align-items: center; justify-content: center; margin-bottom: 7%; box-shadow:inset 0 0 0 2px rgba(82,52,29,.2); }
            #fatcat-dom-factory .side-btn i:before, #fatcat-dom-factory .side-btn i:after { content:""; position:absolute; }
            #fatcat-dom-factory .ico-task:before { left:25%; top:22%; width:50%; height:58%; border-radius:4px; background:#8b6034; box-shadow:inset 0 0 0 2px #674521; }
            #fatcat-dom-factory .ico-task:after { left:34%; top:38%; width:32%; height:5%; border-radius:99px; background:#fff0c8; box-shadow:0 10px 0 #fff0c8, 0 20px 0 #fff0c8; }
            #fatcat-dom-factory .ico-trophy:before { left:22%; top:22%; width:56%; height:42%; border-radius:8px 8px 18px 18px; background:#d89a25; box-shadow:inset 0 0 0 3px #8b5c16; }
            #fatcat-dom-factory .ico-trophy:after { left:37%; top:61%; width:26%; height:22%; background:#8b5c16; box-shadow:0 12px 0 5px #8b5c16; }
            #fatcat-dom-factory .ico-mail:before { left:17%; top:28%; width:66%; height:45%; border-radius:5px; background:#fff5df; box-shadow:inset 0 0 0 3px #9a6a3e; }
            #fatcat-dom-factory .ico-mail:after { left:21%; top:31%; width:58%; height:34%; clip-path:polygon(0 0,50% 58%,100% 0,100% 16%,50% 74%,0 16%); background:#d59c5c; }
            #fatcat-dom-factory .ico-friend:before { left:18%; top:23%; width:28%; height:28%; border-radius:50%; background:#f7d4a4; box-shadow:31px 0 0 #f7d4a4; }
            #fatcat-dom-factory .ico-friend:after { left:13%; right:13%; top:52%; height:30%; border-radius:50% 50% 18px 18px; background:#8b6034; }
            #fatcat-dom-factory .ico-gear:before { inset:18%; border-radius:50%; background:repeating-conic-gradient(#8b6034 0 12deg, transparent 12deg 30deg), radial-gradient(circle, transparent 0 29%, #8b6034 30% 58%, transparent 59%); }
            #fatcat-dom-factory .bottom-widgets { position: absolute; left: 3.2%; right: 3.2%; bottom: 16.4%; height: 7.9%; display: grid; grid-template-columns: 17% 10.5% 1fr 29%; gap: 1.8%; align-items: center; }
            #fatcat-dom-factory .order, #fatcat-dom-factory .chest, #fatcat-dom-factory .gift { position:relative; height: 100%; border-radius: 15px; background: linear-gradient(#fff3d8, #d6ad78); border: 3px solid #7a6044; color: #4a2f1f; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 2.12%; font-weight: 900; box-shadow: 0 5px 0 rgba(0,0,0,.28), inset 0 0 0 2px rgba(255,255,255,.32); box-sizing:border-box; padding:0; }
            #fatcat-dom-factory .order { display:grid; grid-template-columns:34% 1fr; grid-template-rows:1fr 20%; padding:3% 7%; gap:0 5%; background:linear-gradient(#fff6df,#d9b17b); text-align:left; }
            #fatcat-dom-factory .order .order-icon { width:28%; aspect-ratio:1; border-radius:8px; background:linear-gradient(#fff4dc,#d9b376); box-shadow:inset 0 0 0 2px #8b6034; position:relative; }
            #fatcat-dom-factory .order .order-icon:before { content:""; position:absolute; left:26%; top:24%; width:48%; height:7%; border-radius:99px; background:#8b6034; box-shadow:0 12px 0 #8b6034, 0 24px 0 #8b6034; }
            #fatcat-dom-factory .order .order-icon { grid-row:1/3; width:100%; align-self:center; }
            #fatcat-dom-factory .order .order-text { align-self:end; line-height:1.04; }
            #fatcat-dom-factory .order b { display:block; font-size: 150%; color:#6e3e20; }
            #fatcat-dom-factory .order .bar { width:100%; height:72%; align-self:center; border-radius:999px; background:#b48954; overflow:hidden; box-shadow:inset 0 0 0 1px rgba(82,53,30,.28); }
            #fatcat-dom-factory .order .bar i { display:block; width:93%; height:100%; border-radius:inherit; background:linear-gradient(90deg,#f0c34e,#ffdf73); }
            #fatcat-dom-factory .chest { font-size: 2.05%; flex-direction: column; padding-top:1%; background:linear-gradient(#ffe29a,#bc7324); color:#fff6dc; text-shadow:0 2px #724117; }
            #fatcat-dom-factory .chest::before { content: ""; width: 54%; aspect-ratio: 1.18; margin-bottom: 4%; border-radius: 8px 8px 12px 12px; background: linear-gradient(#ffd24c 0 28%, #8a4f20 29% 38%, #d18424 39%); box-shadow: inset 0 0 0 3px rgba(90,52,22,.35), 0 3px 0 rgba(0,0,0,.25); }
            #fatcat-dom-factory .chest:after { content:"!"; position:absolute; right:9%; top:8%; width:22%; aspect-ratio:1; border-radius:50%; background:#e84e25; color:white; display:flex; align-items:center; justify-content:center; border:2px solid #ffd6a0; font-size:1.5%; }
            #fatcat-dom-factory .launch { height: 106%; align-self:center; border-radius: 999px; background: radial-gradient(circle at 50% 0, rgba(255,242,197,.7), transparent 34%), linear-gradient(#ffb54b, #df6e19); border: 5px solid #9a5721; color: #fff7d8; text-shadow: 0 3px #8c3b12; font-size: 4.55%; font-weight: 900; display: flex; align-items: center; justify-content: center; box-shadow: 0 7px 0 rgba(95,44,14,.48), inset 0 0 0 3px rgba(255,242,178,.22); }
            #fatcat-dom-factory .rocket-shape { position: relative; width: 16%; aspect-ratio: .72; margin-right: 4%; border-radius: 50% 50% 42% 42%; background: linear-gradient(#fff6df 0 54%, #e54d2e 55%); transform: rotate(35deg); box-shadow: inset 0 0 0 2px rgba(112,57,25,.25), 0 2px 0 rgba(0,0,0,.25); }
            #fatcat-dom-factory .rocket-shape::before { content: ""; position: absolute; left: 32%; top: 18%; width: 36%; aspect-ratio: 1; border-radius: 50%; background: #6fb2d5; box-shadow: inset 0 0 0 2px #4e6d7a; }
            #fatcat-dom-factory .rocket-shape::after { content: ""; position: absolute; left: 22%; bottom: -18%; width: 56%; height: 24%; border-radius: 0 0 50% 50%; background: #ffd15a; }
            #fatcat-dom-factory .gift { font-size: 2.05%; display:grid; grid-template-columns:31% 1fr; gap:4%; align-items:center; padding: 0 4% 0 2.6%; box-sizing: border-box; text-align:left; background:linear-gradient(#f4dfae,#b88748); overflow:hidden; line-height:1.12; }
            #fatcat-dom-factory .gift:after { content:""; position:absolute; right:-5%; bottom:-14%; width:32%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 34% 45%,#3d281d 0 5%,transparent 6%), radial-gradient(circle at 66% 45%,#3d281d 0 5%,transparent 6%), linear-gradient(#f5c482,#c97938); box-shadow:-8px -7px 0 -5px #3d3d3d, 8px -7px 0 -5px #3d3d3d, inset 7px -3px 0 rgba(255,255,255,.2); opacity:.95; }
            #fatcat-dom-factory .gift:before { content:""; position:relative; width:100%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 34% 45%,#3d281d 0 5%,transparent 6%), radial-gradient(circle at 66% 45%,#3d281d 0 5%,transparent 6%), linear-gradient(#b9c2c7,#69777f); box-shadow:-9px -7px 0 -5px #3d3d3d, 9px -7px 0 -5px #3d3d3d, inset 7px -3px 0 rgba(255,255,255,.22), 0 3px 0 rgba(0,0,0,.2); }
            #fatcat-dom-factory .gift-cat { position:relative; width:100%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 34% 45%,#3d281d 0 5%,transparent 6%), radial-gradient(circle at 66% 45%,#3d281d 0 5%,transparent 6%), linear-gradient(#b9c2c7,#69777f); box-shadow:-9px -7px 0 -5px #3d3d3d, 9px -7px 0 -5px #3d3d3d, inset 7px -3px 0 rgba(255,255,255,.22), 0 3px 0 rgba(0,0,0,.2); }
            #fatcat-dom-factory .gift-cat:after { content:""; position:absolute; left:24%; right:24%; bottom:-12%; height:22%; border-radius:999px; background:#6d482b; box-shadow:inset 0 0 0 2px rgba(255,225,168,.18); }
            #fatcat-dom-factory .gift b { color:#5f351d; font-size:110%; }
            #fatcat-dom-factory .gift em { display:inline-block; margin-top:2%; padding:1% 6%; border-radius:999px; background:#5a3924; color:#ffe0a1; font-style:normal; font-size:86%; }
            #fatcat-dom-factory .launch-count { position: absolute; left: 31.5%; right: 31.5%; bottom: 13.25%; height: 2.35%; border-radius: 999px; background: linear-gradient(#7a4d27,#4e2e18); border: 2px solid #b27a36; color: #ffd26f; display: flex; align-items: center; justify-content: center; font-size: 1.78%; font-weight: 900; box-shadow: 0 2px 0 rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,225,150,.14); }
            #fatcat-dom-factory .factory-msg { position: absolute; left: 21%; top: 79%; width: 58%; min-height: 3.8%; border-radius: 999px; background: rgba(52,35,24,.9); color: #ffe6b5; display: flex; align-items: center; justify-content: center; font-size: 2.4%; font-weight: 900; box-shadow: 0 2px 0 rgba(0,0,0,.3); }
            #fatcat-dom-factory .notice-card { position:absolute; right:10.8%; top:18.2%; width:26%; min-height:18%; border-radius:18px; background:linear-gradient(#fff2d3,#d8b17a); border:3px solid #6d4b31; color:#4a2f1f; box-shadow:0 7px 0 rgba(48,29,17,.38), inset 0 0 0 3px rgba(255,250,224,.34); padding:2.2%; box-sizing:border-box; font-size:2.0%; line-height:1.32; }
            #fatcat-dom-factory .notice-card:before { content:""; position:absolute; right:-6%; top:20%; width:0; height:0; border-top:12px solid transparent; border-bottom:12px solid transparent; border-left:18px solid #6d4b31; }
            #fatcat-dom-factory .notice-head { display:grid; grid-template-columns:22% 1fr; gap:4%; align-items:center; margin-bottom:4%; font-weight:900; }
            #fatcat-dom-factory .notice-icon { position:relative; width:100%; aspect-ratio:1; border-radius:14px; background:linear-gradient(#fff8dc,#d8a65a); box-shadow:inset 0 0 0 2px rgba(95,60,30,.2), 0 3px 0 rgba(85,52,26,.22); }
            #fatcat-dom-factory .notice-icon.asset { background:center/cover no-repeat; }
            #fatcat-dom-factory .notice-icon.asset:before, #fatcat-dom-factory .notice-icon.asset:after { display:none; }
            #fatcat-dom-factory .notice-icon:before, #fatcat-dom-factory .notice-icon:after { content:""; position:absolute; }
            #fatcat-dom-factory .notice-icon.achievement:before { left:22%; top:22%; width:56%; height:42%; border-radius:8px 8px 18px 18px; background:#d89a25; box-shadow:inset 0 0 0 3px #8b5c16; }
            #fatcat-dom-factory .notice-icon.mail:before { left:16%; top:28%; width:68%; height:45%; border-radius:5px; background:#fff5df; box-shadow:inset 0 0 0 3px #9a6a3e; }
            #fatcat-dom-factory .notice-icon.mail:after { left:20%; top:31%; width:60%; height:34%; clip-path:polygon(0 0,50% 58%,100% 0,100% 16%,50% 74%,0 16%); background:#d59c5c; }
            #fatcat-dom-factory .notice-icon.friend:before { left:18%; top:23%; width:28%; height:28%; border-radius:50%; background:#f7d4a4; box-shadow:28px 0 0 #f7d4a4; }
            #fatcat-dom-factory .notice-icon.friend:after { left:13%; right:13%; top:52%; height:30%; border-radius:50% 50% 18px 18px; background:#8b6034; }
            #fatcat-dom-factory .notice-icon.settings:before { inset:20%; border-radius:50%; background:repeating-conic-gradient(#8b6034 0 12deg, transparent 12deg 30deg), radial-gradient(circle, transparent 0 29%, #8b6034 30% 58%, transparent 59%); }
            #fatcat-dom-factory .notice-row { display:flex; justify-content:space-between; align-items:center; padding:2.3% 0; border-top:1px solid rgba(107,73,42,.2); font-weight:900; }
            #fatcat-dom-factory .notice-row span:last-child { color:#6c8d35; }
            #fatcat-dom-factory.compact .building { left: 6.2%; right: 6.2%; top: 12.4%; bottom: 24.2%; }
            #fatcat-dom-factory.compact .floor-card { width: 30%; left: 1.6%; grid-template-columns:34% 1fr; border-width:2px; }
            #fatcat-dom-factory.compact .floor-card:before { width:34%; }
            #fatcat-dom-factory.compact .floor-no { font-size:4.25%; }
            #fatcat-dom-factory.compact .floor-name { font-size:1.64%; line-height:1.15; padding-right:3%; }
            #fatcat-dom-factory.compact .floor-name span { font-size:76%; margin-top:2%; }
            #fatcat-dom-factory.compact .floor-medal { width:6.2%; left:2.2%; bottom:8%; font-size:1.28%; border-width:1px; }
            #fatcat-dom-factory.compact .floor-kpi { left: 32.3%; width: 24%; top:18%; }
            #fatcat-dom-factory.compact .props { left: 43%; right: 15%; opacity:.56; }
            #fatcat-dom-factory.compact .prop-asset { left:44%; right:15%; opacity:.88; }
            #fatcat-dom-factory.compact .cat:before { transform:scale(.85) rotate(-6deg); }
            #fatcat-dom-factory.compact .cat-dots { left:32%; bottom:7%; width:18%; }
            #fatcat-dom-factory.compact .bonus { right: 2%; width: 23%; font-size: 2.0%; }
            #fatcat-dom-factory.compact .side-btn { font-size: 1.9%; }
            #fatcat-dom-factory.compact .left-tools, #fatcat-dom-factory.compact .right-tools { width: 8.8%; }
            #fatcat-dom-factory.compact .bottom-widgets { left: 2%; right: 2%; grid-template-columns: 18% 10.5% 1fr 27%; gap: 1.3%; }
            #fatcat-dom-factory.compact .launch { font-size: 4.25%; }
            #fatcat-dom-factory.compact .gift { font-size:1.72%; padding-right:2%; }
            #fatcat-dom-factory.compact .gift:after { width:28%; right:-8%; }
            #fatcat-dom-factory.compact .notice-card { right:10%; width:30%; font-size:1.78%; }
            #fatcat-dom-factory.tall .building { top: 12.6%; bottom: 24.8%; }
            #fatcat-dom-factory.tall .bottom-widgets { bottom: 17.1%; }
            #fatcat-dom-factory.wide .building { left: 13%; right: 13%; top:13.2%; bottom:23.0%; }
            #fatcat-dom-factory.wide .roof-deck { left:13.5%; right:13.5%; top:12.1%; }
            #fatcat-dom-factory.wide .sign { top:9.7%; height:6.7%; }
            #fatcat-dom-factory.wide .roof-cat { top:9.5%; }
            #fatcat-dom-factory.wide .flag { top:8.8%; }
            #fatcat-dom-factory.wide .side-pipe.left { left:10.2%; }
            #fatcat-dom-factory.wide .side-pipe.right { right:10.2%; }
            #fatcat-dom-factory.wide .floor-kpi { left:34%; width:20%; }
            #fatcat-dom-factory.wide .prop-asset { left:43%; right:18%; opacity:.9; }
            #fatcat-dom-factory.wide .floor-glow { opacity:.66; }
            #fatcat-dom-factory.wide .bonus { right:3.1%; width:21%; }
            #fatcat-dom-factory.wide .cat-dots { left:33%; width:17%; bottom:7%; }
            #fatcat-dom-factory.wide .bottom-widgets { left:9%; right:9%; grid-template-columns:16% 10% 1fr 28%; }
            #fatcat-dom-factory.wide .launch-count { left:34%; right:34%; bottom:12.8%; }
            #fatcat-dom-factory.wide .left-tools { left: 5%; }
            #fatcat-dom-factory.wide .right-tools { right: 5%; }
        `;
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
        const floors = [
            { no: "5F", name: "管理室", lv: BuildingManager.getLevel("building_office_5f"), bonus: "全局收益", value: "+15%", scene: "office" },
            { no: "4F", name: "烘焙车间", lv: BuildingManager.getLevel("building_roast_4f"), bonus: "原料产量", value: "+40%", scene: "roast" },
            { no: "3F", name: "发酵车间", lv: BuildingManager.getLevel("building_ferment_3f"), bonus: "咖啡豆消耗", value: "-20%", scene: "tank" },
            { no: "2F", name: "原料车间", lv: BuildingManager.getLevel("building_material_2f"), bonus: "咖啡价值", value: "+30%", scene: "mill" },
            { no: "1F", name: "咖啡厅", lv: BuildingManager.getLevel("building_cafe_1f"), bonus: "订单金币", value: "+25%", scene: "cafe" },
            { no: "B1", name: "原料仓库", lv: BuildingManager.getLevel("building_storage_b1"), bonus: "仓库容量", value: "+20%", scene: "storage" },
        ];
        overlay.innerHTML = `
            <div class="art-bg"></div><div class="sky"></div><div class="town"></div><div class="roof-deck"></div>
            <div class="sign">肥猫咖啡<span class="paw-mark"></span></div><div class="roof-cat"><div class="cat-sprite"><i class="cat-face"></i></div></div><div class="flag">爪</div>
            <div class="side-pipe left"></div><div class="side-pipe right"></div><div class="ladder"></div><div class="elevator-panel"><i class="elevator-paw"></i><i class="elevator-floor-indicator"></i><div class="elevator-car"></div></div>
            <div class="building">
                ${floors.map((floor, index) => `
                    <div class="floor floor-scene-${floor.scene}">
                        <div class="floor-glow"></div><div class="room-lights"></div><div class="room-decor decor-${floor.scene}">${this.renderFactoryRoomDecor(floor.scene)}</div><div class="room-foreground ${floor.scene}"></div>
                        <div class="props">${this.renderFactoryProps(floor.scene)}</div><div class="prop-asset prop-${floor.scene}" style="background-image:url('${this.getFactoryPropDataUri(floor.scene)}')"></div>
                        <div class="pipe"></div>
                        <div class="cat cat-${floor.scene} ${index % 3 === 0 ? "a" : index % 3 === 1 ? "b" : "c"}"><div class="cat-sprite"><i class="cat-face"></i></div></div>
                        <div class="floor-card"><div class="floor-no">${floor.no}</div><div class="floor-name">${floor.name}<span>Lv.${floor.lv}</span></div><div class="floor-medal">${floor.lv}</div></div>
                        <div class="floor-kpi ${this.getFloorKpiIconClass(floor.scene)}"><i></i><div><strong>${this.getFloorOutputText(floor.scene)}</strong><span>${this.getFloorOutputLabel(floor.scene)}</span></div></div>
                        <div class="cat-dots"><span class="cat-dot"></span><span class="cat-dot gray"></span><span class="cat-dot black"></span></div>
                        <div class="bonus"><i class="bonus-icon ${this.getFloorBonusIconClass(floor.scene)}"></i><span>${floor.bonus}</span><b>${floor.value}</b></div>
                    </div>`).join("")}
            </div>
            <div class="left-tools"><button class="side-btn alert" data-action="tasks"><i class="ico-task"></i>任务</button></div>
            <div class="right-tools"><button class="side-btn alert" data-action="achievement"><i class="ico-trophy"></i>成就</button><button class="side-btn alert" data-action="mail"><i class="ico-mail"></i>邮件</button><button class="side-btn" data-action="friend"><i class="ico-friend"></i>好友</button><button class="side-btn" data-action="settings"><i class="ico-gear"></i>设置</button></div>
            <div class="bottom-widgets">
                <button class="order" data-action="order"><span class="order-icon"></span>今日订单<b>56/60</b><span class="bar"><i></i></span></button>
                <button class="chest" data-action="claim">可领取</button>
                <button class="launch" data-action="launch"><span class="rocket-shape"></span>发射猫咪</button>
                <button class="gift" data-action="gift"><span><b>超级猫粮礼包</b><br><em>03:25:15</em></span></button>
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
        return this.getDomAssetDataUri(GeneratedFeatureIconAssets[kind] ?? GeneratedFeatureIconAssets.settings);
    }

    private getFactoryPropDataUri(scene: string): string {
        return FactoryPropDataUris[scene] ?? FactoryPropDataUris.storage;
    }

    private getDomAssetDataUri(assetPath: string): string {
        return DomAssetDataUris[assetPath] ?? assetPath;
    }

    private renderFactoryProps(scene: string): string {
        if (scene === "office") {
            return `<div class="shelf">▦</div><div class="machine">图</div><div class="shelf">▤</div>`;
        }
        if (scene === "roast") {
            return `<div class="bags">COFFEE</div><div class="machine"></div><div class="shelf">杯</div>`;
        }
        if (scene === "tank") {
            return `<div class="machine">◎</div><div class="machine">◎</div><div class="shelf">轮</div>`;
        }
        if (scene === "mill") {
            return `<div class="shelf">▤</div><div class="machine">轮</div><div class="bags">BEANS</div>`;
        }
        if (scene === "cafe") {
            return `<div class="shelf">杯</div><div class="machine">杯</div><div class="shelf">▦</div>`;
        }
        return `<div class="bags">COFFEE<br>BEANS</div><div class="shelf">▤</div><div class="machine">▣</div>`;
    }

    private renderFactoryRoomDecor(scene: string): string {
        const shared = `<i class="decor-part decor-shelf"></i><i class="decor-part decor-board"></i><i class="decor-part decor-crates"></i>`;
        if (scene === "office") {
            return `<i class="decor-part decor-lamp"></i><i class="decor-part decor-table"></i><i class="decor-part decor-board"></i><i class="decor-part decor-window"></i><i class="decor-part decor-notes"></i><i class="decor-part decor-plant"></i>`;
        }
        if (scene === "roast") {
            return `<i class="decor-part decor-lamp"></i><i class="decor-part decor-bags">COFFEE</i><i class="decor-part decor-pipe"></i><i class="decor-part decor-gauge"></i><i class="decor-part decor-steam"></i><i class="decor-part decor-conveyor"></i><i class="decor-part decor-beans"></i>`;
        }
        if (scene === "tank") {
            return `<i class="decor-part decor-lamp"></i><i class="decor-part decor-pipe"></i><i class="decor-part decor-gauge"></i><i class="decor-part decor-steam"></i><i class="decor-part decor-crates"></i><i class="decor-part decor-conveyor"></i>`;
        }
        if (scene === "mill") {
            return `<i class="decor-part decor-lamp"></i><i class="decor-part decor-shelf"></i><i class="decor-part decor-bags">BEANS</i><i class="decor-part decor-pipe"></i><i class="decor-part decor-conveyor"></i><i class="decor-part decor-beans"></i>`;
        }
        if (scene === "cafe") {
            return `<i class="decor-part decor-lamp"></i><i class="decor-part decor-table"></i><i class="decor-part decor-window"></i><i class="decor-part decor-shelf"></i><i class="decor-part decor-clock"></i><i class="decor-part decor-plant"></i>`;
        }
        return `<i class="decor-part decor-lamp"></i><i class="decor-part decor-bags">COFFEE<br>BEANS</i>${shared}<i class="decor-part decor-beans"></i>`;
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

    private getFloorOutputLabel(scene: string): string {
        if (scene === "storage") return "库存容量";
        if (scene === "tank") return "咖啡豆消耗";
        if (scene === "office") return "全局收益";
        if (scene === "cafe") return "订单金币";
        if (scene === "mill") return "咖啡价值";
        return "原料产量";
    }

    private getFloorKpiIconClass(scene: string): string {
        if (scene === "storage") return "kpi-storage";
        if (scene === "tank") return "kpi-bean";
        if (scene === "office") return "kpi-office";
        if (scene === "mill" || scene === "roast") return "kpi-food";
        return "kpi-coin";
    }

    private getFloorBonusIconClass(scene: string): string {
        if (scene === "office") return "bonus-office";
        if (scene === "roast") return "bonus-roast";
        if (scene === "tank") return "bonus-tank";
        if (scene === "mill") return "bonus-mill";
        if (scene === "storage") return "bonus-storage";
        return "bonus-cafe";
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
        element.classList.toggle("wide", aspect > 0.68);
    }

    private ensureDomPanelOverlay(): HTMLElement | null {
        if (typeof document === "undefined") return null;
        if (this._domPanelOverlay) return this._domPanelOverlay;

        const overlay = document.createElement("div");
        overlay.id = "fatcat-dom-panel-overlay";
        overlay.style.display = "none";
        const style = document.createElement("style");
        style.textContent = `
            #fatcat-dom-panel-overlay { position: fixed; z-index: 2147482990; pointer-events: none; font-family: Arial, sans-serif; color: #56351f; }
            #fatcat-dom-panel-overlay .panel-shell { position: absolute; inset: 0; background: radial-gradient(circle at 50% 0, rgba(255,247,222,.55), transparent 34%), linear-gradient(#e6c893, #b08054 54%, #6f4d37); border: 3px solid #5a3826; box-sizing: border-box; padding: 4.1% 3.4%; border-radius: 18px; box-shadow: 0 10px 0 rgba(54,31,18,.65), inset 0 0 0 5px rgba(255,235,185,.35), inset 0 -18px 36px rgba(76,42,23,.28); overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; pointer-events: auto; scrollbar-width: none; }
            #fatcat-dom-panel-overlay .panel-shell::-webkit-scrollbar { width: 0; height: 0; }
            #fatcat-dom-panel-overlay .panel-shell:before { content:""; position:absolute; left:2.4%; right:2.4%; top:1.6%; height:5.2%; border-radius:14px; background:linear-gradient(#7d5737,#503523); box-shadow:inset 0 0 0 2px rgba(255,224,157,.25); pointer-events:none; }
            #fatcat-dom-panel-overlay .panel-close { position:absolute; z-index:3; right:2.7%; top:2.1%; width:7%; min-width:42px; aspect-ratio:1; border-radius:50%; border:3px solid #6b3d1f; background:linear-gradient(#f8cd65,#d66d22); color:#fff8dd; font-size:3.1%; font-weight:900; box-shadow:0 4px 0 rgba(0,0,0,.28), inset 0 0 0 2px rgba(255,237,184,.18); cursor:pointer; pointer-events:auto; }
            #fatcat-dom-panel-overlay h2 { position:relative; z-index:1; margin: 0 0 3.1%; text-align: center; font-size: 4.25%; line-height: 1.1; color:#ffe8b1; text-shadow: 0 3px #482716; }
            #fatcat-dom-panel-overlay .tabs { position:relative; z-index:1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.1%; margin-bottom: 2%; padding:1%; border-radius:14px; background:rgba(75,48,31,.45); box-shadow: inset 0 0 0 2px rgba(255,229,180,.14); }
            #fatcat-dom-panel-overlay .tab { padding: 5.2% 2%; text-align: center; border:0; border-radius: 10px; background: linear-gradient(#836142,#5a3d2b); color: #f8dfb0; font-size: 2.25%; font-weight: 900; pointer-events:auto; cursor:pointer; font-family:inherit; box-shadow: inset 0 2px 0 rgba(255,235,190,.18), 0 3px 0 rgba(40,25,16,.35); }
            #fatcat-dom-panel-overlay .tab.active { background: linear-gradient(#fff0c9,#d8ab66); color: #4a2f1f; box-shadow: inset 0 0 0 2px #fff4c8, 0 3px 0 rgba(96,57,25,.5); }
            #fatcat-dom-panel-overlay .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2%; margin-bottom: 3%; }
            #fatcat-dom-panel-overlay .summary div, #fatcat-dom-panel-overlay .item, #fatcat-dom-panel-overlay .wide { background: linear-gradient(#fff1d3,#e2c08b); color: #4a2f1f; border: 2px solid #7c5736; border-radius: 12px; box-shadow: inset 0 0 0 2px rgba(255,250,220,.4), 0 4px 0 rgba(72,43,25,.28); box-sizing: border-box; }
            #fatcat-dom-panel-overlay .summary div { padding: 6.4%; text-align: center; font-size: 2.55%; line-height: 1.35; }
            #fatcat-dom-panel-overlay .summary.with-icons div { position:relative; display:grid; grid-template-columns:30% 1fr; align-items:center; gap:4%; text-align:left; padding:4.8% 6%; }
            #fatcat-dom-panel-overlay .summary.with-icons .summary-icon { width:100%; max-width:54px; aspect-ratio:1; border-radius:50%; background:linear-gradient(#fff8dc,#d7aa62); display:flex; align-items:center; justify-content:center; box-shadow:inset 0 0 0 2px rgba(106,70,35,.22), 0 3px 0 rgba(86,52,25,.2); }
            #fatcat-dom-panel-overlay .summary.with-icons .css-icon { width:64%; }
            #fatcat-dom-panel-overlay .list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2.2%; }
            #fatcat-dom-panel-overlay .list.shop-list { grid-template-columns: 1fr; gap: 1.7%; }
            #fatcat-dom-panel-overlay .shop-shelf-title { margin: .4% 0 1.3%; padding: 1.1% 2.4%; border-radius: 999px; background: rgba(74,47,31,.78); color:#ffe0a7; font-size:2.2%; font-weight:900; display:flex; align-items:center; justify-content:space-between; box-shadow:inset 0 0 0 2px rgba(255,226,170,.12); }
            #fatcat-dom-panel-overlay .shop-shelf-title span:last-child { color:#ffffff; background:#d85b2a; border-radius:999px; padding:.6% 2.2%; font-size:86%; box-shadow:0 2px 0 rgba(0,0,0,.24); }
            #fatcat-dom-panel-overlay .shop-hero { display:grid; grid-template-columns:1fr 24%; gap:2%; align-items:center; margin-bottom:1.6%; }
            #fatcat-dom-panel-overlay .shop-hero .summary { margin-bottom:0; }
            #fatcat-dom-panel-overlay .shop-mascot { min-height:104px; border-radius:14px; background:linear-gradient(#fff0ca,#cc9a5d); border:2px solid #7c5736; color:#5a361f; display:flex; align-items:center; justify-content:center; flex-direction:column; font-size:2.0%; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,250,224,.34), 0 4px 0 rgba(72,43,25,.22); position:relative; overflow:hidden; }
            #fatcat-dom-panel-overlay .shop-mascot:before { content:""; width:42%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 34% 45%,#3d281d 0 6%,transparent 7%), radial-gradient(circle at 66% 45%,#3d281d 0 6%,transparent 7%), linear-gradient(#f5c482,#c97938); box-shadow:-8px -7px 0 -5px #3d3d3d, 8px -7px 0 -5px #3d3d3d, inset 7px -3px 0 rgba(255,255,255,.2); margin-bottom:5%; }
            #fatcat-dom-panel-overlay .list.bag-grid { grid-template-columns: repeat(4, 1fr); gap: 1.7%; }
            #fatcat-dom-panel-overlay .list.research-view { grid-template-columns: 58% 1fr; gap: 2%; }
            #fatcat-dom-panel-overlay .building-view { display: grid; grid-template-columns: 58% 1fr; gap: 2%; }
            #fatcat-dom-panel-overlay .mini-factory { min-height: 390px; border-radius: 16px; background: linear-gradient(#a9dbf4 0 24%, #80634f 24% 100%); border: 3px solid #5a3826; position: relative; overflow: hidden; box-shadow: inset 0 0 0 4px rgba(255,239,202,.22), 0 5px 0 rgba(54,31,18,.32); }
            #fatcat-dom-panel-overlay .mini-factory:after { content:""; position:absolute; inset:24% 5% 4%; background:repeating-linear-gradient(0deg, rgba(41,29,22,.45) 0 3px, transparent 3px 15.8%); pointer-events:none; }
            #fatcat-dom-panel-overlay .mini-floor { position: relative; z-index:1; width:86%; margin: 0 7%; height: 13.8%; border: 2px solid #463225; border-bottom-width:3px; background: linear-gradient(90deg,#6b5141,#b78d65 48%,#604638); color:#fff0cf; font-size:1.95%; font-weight:900; display:grid; grid-template-columns:18% 1fr 24%; align-items:center; padding:0 3%; box-sizing:border-box; text-align:left; pointer-events:auto; cursor:pointer; }
            #fatcat-dom-panel-overlay .mini-floor.active { background: linear-gradient(90deg,#a8692c,#f0c27b 48%,#8c5529); box-shadow: inset 0 0 0 3px #fff0a8, 0 0 16px rgba(255,196,90,.48); }
            #fatcat-dom-panel-overlay .mini-floor span:first-child { font-size:150%; text-align:center; }
            #fatcat-dom-panel-overlay .mini-floor b { font-size:112%; }
            #fatcat-dom-panel-overlay .mini-floor em { font-style:normal; text-align:right; color:#ffe08d; }
            #fatcat-dom-panel-overlay .floor-level-line { grid-column: 2 / 4; height: 8px; border-radius:999px; background:rgba(53,34,22,.38); overflow:hidden; box-shadow:inset 0 0 0 1px rgba(255,236,180,.12); }
            #fatcat-dom-panel-overlay .floor-level-line i { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#78aa43,#f1c654); }
            #fatcat-dom-panel-overlay .mini-sign { position: absolute; z-index:2; left: 24%; top: 4.5%; width: 50%; height: 9.5%; border-radius: 12px; background: linear-gradient(#9d6631,#6e421f); color: #ffe5ad; display:flex;align-items:center;justify-content:center;font-size:2.35%;font-weight:900; box-shadow:0 4px 0 rgba(56,33,19,.42), inset 0 0 0 2px rgba(255,230,170,.2); }
            #fatcat-dom-panel-overlay .building-dashboard { display:grid; grid-template-columns:repeat(4,1fr); gap:1.3%; margin-bottom:2%; }
            #fatcat-dom-panel-overlay .building-stat-card { min-height:82px; padding:4%; border-radius:12px; background:linear-gradient(#fff0cf,#d3a66b); border:2px solid #7c5736; box-shadow:inset 0 0 0 2px rgba(255,250,224,.36), 0 3px 0 rgba(72,43,25,.22); color:#4a2f1f; font-size:2.2%; font-weight:900; display:grid; grid-template-columns:30% 1fr; gap:4%; align-items:center; }
            #fatcat-dom-panel-overlay .building-stat-card b { font-size:142%; color:#6d421f; }
            #fatcat-dom-panel-overlay .building-stat-card .css-icon { width:80%; justify-self:center; }
            #fatcat-dom-panel-overlay .building-command { margin-top:2%; padding:3%; border-radius:14px; background:linear-gradient(#fff4d8,#d8b177); border:2px solid #7c5736; box-shadow:inset 0 0 0 2px rgba(255,250,224,.38), 0 4px 0 rgba(72,43,25,.25); }
            #fatcat-dom-panel-overlay .building-command-title { display:flex; align-items:center; justify-content:space-between; gap:2%; font-size:2.35%; font-weight:900; margin-bottom:2%; }
            #fatcat-dom-panel-overlay .building-command-title span:last-child { padding:.8% 3%; border-radius:999px; background:#5d3821; color:#ffe2a8; box-shadow:inset 0 0 0 1px rgba(255,225,160,.18); }
            #fatcat-dom-panel-overlay .building-pipeline { display:grid; grid-template-columns:repeat(4,1fr); gap:1.4%; }
            #fatcat-dom-panel-overlay .building-pipeline span { min-height:54px; border-radius:10px; background:linear-gradient(#7a5739,#4b3122); color:#ffe5b0; display:flex; align-items:center; justify-content:center; text-align:center; font-size:1.95%; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,225,160,.12); }
            #fatcat-dom-panel-overlay .skin-row { display:grid; grid-template-columns:repeat(4,1fr); gap:1.5%; margin-top:2%; }
            #fatcat-dom-panel-overlay .skin-card { min-height: 118px; text-align:center; padding:3%; background:linear-gradient(#fff1d3,#e1be86); color:#4a2f1f; border:2px solid #7c5736; border-radius:12px; box-shadow: inset 0 0 0 2px rgba(255,250,220,.35), 0 3px 0 rgba(72,43,25,.24); font-size:2.1%; font-weight:900; }
            #fatcat-dom-panel-overlay .skin-card .thumb { position:relative; height:60%; border-radius:10px; background:linear-gradient(#abe0f5 0 35%,#80604b 36%); margin-bottom:5%; box-shadow: inset 0 0 0 2px rgba(90,60,36,.22); overflow:hidden; }
            #fatcat-dom-panel-overlay .skin-card .thumb:before { content:""; position:absolute; left:18%; right:18%; bottom:12%; height:44%; border-radius:5px; background:linear-gradient(#d7b17c,#76553d); box-shadow:inset 0 0 0 2px #4d3423; }
            #fatcat-dom-panel-overlay .skin-card .thumb:after { content:""; position:absolute; left:24%; right:24%; top:28%; height:18%; transform:rotate(45deg); background:#a96f35; box-shadow:inset 0 0 0 2px #5c371e; }
            #fatcat-dom-panel-overlay .skin-card.steam .thumb { background:linear-gradient(#c7e8f8 0 35%,#6d625b 36%); }
            #fatcat-dom-panel-overlay .skin-card.steam .thumb:before { background:linear-gradient(#8d8f8f,#4b4f50); }
            #fatcat-dom-panel-overlay .skin-card.future .thumb { background:linear-gradient(#b9ecff 0 35%,#475b7c 36%); }
            #fatcat-dom-panel-overlay .skin-card.future .thumb:before { background:linear-gradient(#7bd7ff,#30518c); }
            #fatcat-dom-panel-overlay .skin-card.classic .thumb:before { background:linear-gradient(#d9b27a,#8b5b34); }
            #fatcat-dom-panel-overlay .skin-card .tag { margin-top:2%; }
            #fatcat-dom-panel-overlay .skin-card .tag.warn:before { content:""; display:inline-block; width:10px; height:10px; margin-right:4px; border-radius:2px; background:#5e4939; box-shadow:inset 0 0 0 2px rgba(255,236,190,.16); }
            #fatcat-dom-panel-overlay .shop-row .limit { color:#7a5a3e; font-size:90%; margin-top:1%; display:inline-flex; align-items:center; gap:5px; padding:.7% 2.2%; border-radius:999px; background:rgba(91,57,31,.09); }
            #fatcat-dom-panel-overlay .shop-row:before { content:""; position:absolute; left:1.5%; top:12%; bottom:12%; width:1.2%; border-radius:999px; background:linear-gradient(#f5c15a,#c97820); opacity:.75; }
            #fatcat-dom-panel-overlay .shop-row:after { content:"推荐"; position:absolute; right:2.2%; top:8%; padding:.7% 2.2%; border-radius:999px; background:#d8542c; color:#fff4d8; font-size:78%; font-weight:900; box-shadow:0 2px 0 rgba(0,0,0,.22); }
            #fatcat-dom-panel-overlay .shop-row.soldout:after { content:"售罄"; background:#756352; }
            #fatcat-dom-panel-overlay .shop-row.locked:after { content:"待开放"; background:#756352; }
            #fatcat-dom-panel-overlay .shop-row .buy-zone { text-align:center; }
            #fatcat-dom-panel-overlay .schedule-list { display:grid; gap:1.4%; margin-top:2%; }
            #fatcat-dom-panel-overlay .schedule-row { min-height:66px; display:grid; grid-template-columns:1fr 28%; align-items:center; gap:2%; padding:2.3%; background:linear-gradient(#fff1d3,#e2c08b); color:#4a2f1f; border:2px solid #7c5736; border-radius:12px; box-shadow: inset 0 0 0 2px rgba(255,250,220,.35), 0 3px 0 rgba(72,43,25,.22); font-size:2.15%; }
            #fatcat-dom-panel-overlay .schedule-row.has-cat { grid-template-columns:16% 1fr 28%; }
            #fatcat-dom-panel-overlay .mini-cat-avatar { width:100%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#f6c58a,#d98342); position:relative; box-shadow:inset 0 0 0 2px rgba(88,55,31,.22), 0 2px 0 rgba(72,43,25,.24); overflow:hidden; }
            #fatcat-dom-panel-overlay .mini-cat-avatar:before { content:""; position:absolute; left:22%; top:18%; width:56%; height:46%; border-radius:50%; background:radial-gradient(circle at 34% 45%,#3f271b 0 7%,transparent 8%), radial-gradient(circle at 66% 45%,#3f271b 0 7%,transparent 8%), linear-gradient(#ffd198,#df8c42); box-shadow:-8px -7px 0 -5px #6b4228, 8px -7px 0 -5px #6b4228; }
            #fatcat-dom-panel-overlay .schedule-row.locked { opacity:.68; filter:grayscale(.5); }
            #fatcat-dom-panel-overlay .building-upgrade-preview { margin-top:2%; padding:3%; border-radius:12px; background:rgba(91,57,31,.10); box-shadow:inset 0 0 0 2px rgba(105,72,40,.12); }
            #fatcat-dom-panel-overlay .building-effect-row { display:grid; grid-template-columns:1fr 12% 1fr; gap:2%; align-items:center; text-align:center; margin-top:2%; }
            #fatcat-dom-panel-overlay .building-effect-row span { padding:5% 3%; border-radius:10px; background:linear-gradient(#fff6dc,#d9b982); font-weight:900; box-shadow:inset 0 0 0 2px rgba(112,78,45,.14); }
            #fatcat-dom-panel-overlay .building-effect-row b { color:#7d4b22; font-size:160%; }
            #fatcat-dom-panel-overlay .bag-card.resource { background: linear-gradient(#fff1d2,#dfbf88); }
            #fatcat-dom-panel-overlay .bag-hero { display:grid; grid-template-columns:1fr 26%; gap:2%; align-items:stretch; margin-bottom:1.7%; }
            #fatcat-dom-panel-overlay .bag-hero .summary { margin-bottom:0; }
            #fatcat-dom-panel-overlay .bag-capacity { min-height:104px; border-radius:14px; background:linear-gradient(#76523a,#493124); border:2px solid #7c5736; color:#ffe3ad; display:flex; align-items:center; justify-content:center; flex-direction:column; font-size:2.0%; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,226,170,.12), 0 4px 0 rgba(72,43,25,.25); }
            #fatcat-dom-panel-overlay .bag-capacity b { font-size:150%; color:#fff; }
            #fatcat-dom-panel-overlay .bag-section-title { margin: .2% 0 1.4%; padding: 1.0% 2.4%; border-radius:999px; background:rgba(74,47,31,.78); color:#ffe0a7; font-size:2.15%; font-weight:900; display:flex; align-items:center; justify-content:space-between; box-shadow:inset 0 0 0 2px rgba(255,226,170,.12); }
            #fatcat-dom-panel-overlay .bag-section-title span:last-child { color:#ffffff; background:#5f8f3a; border-radius:999px; padding:.6% 2.2%; font-size:86%; box-shadow:0 2px 0 rgba(0,0,0,.24); }
            #fatcat-dom-panel-overlay .task-row { min-height: 112px; display: grid; grid-template-columns: 1fr 24%; gap: 2%; align-items: center; }
            #fatcat-dom-panel-overlay .task-row.with-icon { grid-template-columns:16% 1fr 24%; }
            #fatcat-dom-panel-overlay .task-icon { width:100%; max-width:84px; aspect-ratio:1; border-radius:14px; background:linear-gradient(#fff1d3,#d8ad70); display:flex; align-items:center; justify-content:center; box-shadow:inset 0 0 0 3px rgba(118,78,43,.2), 0 4px 0 rgba(82,48,27,.25); }
            #fatcat-dom-panel-overlay .task-board { display:grid; grid-template-columns:18% 1fr 22%; gap:2%; align-items:center; margin-bottom:2%; padding:2%; border-radius:16px; background:linear-gradient(#fff0d1,#d8b17d); border:3px solid #7c5736; box-shadow:inset 0 0 0 2px rgba(255,250,224,.35), 0 4px 0 rgba(72,43,25,.22); color:#4a2f1f; }
            #fatcat-dom-panel-overlay .task-board-icon { position:relative; width:82%; aspect-ratio:1; border-radius:14px; background:linear-gradient(#fff4dc,#d9b376); box-shadow:inset 0 0 0 3px #8b6034; justify-self:center; }
            #fatcat-dom-panel-overlay .task-board-icon:before { content:""; position:absolute; left:26%; top:24%; width:48%; height:7%; border-radius:99px; background:#8b6034; box-shadow:0 14px 0 #8b6034, 0 28px 0 #8b6034; }
            #fatcat-dom-panel-overlay .task-board b { font-size:160%; }
            #fatcat-dom-panel-overlay .task-board .progress-line { margin-top:2%; }
            #fatcat-dom-panel-overlay .task-stamp { justify-self:end; padding:6% 10%; border-radius:999px; background:#5d3821; color:#ffe2a8; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,225,160,.12); }
            #fatcat-dom-panel-overlay .task-daily { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5%; margin-bottom:2%; }
            #fatcat-dom-panel-overlay .task-daily-card { min-height:88px; padding:4%; border-radius:12px; background:linear-gradient(#fff1d3,#d6ad70); border:2px solid #7c5736; box-shadow:inset 0 0 0 2px rgba(255,250,224,.36), 0 3px 0 rgba(72,43,25,.22); color:#4a2f1f; font-size:2.15%; font-weight:900; display:grid; grid-template-columns:30% 1fr; gap:4%; align-items:center; }
            #fatcat-dom-panel-overlay .task-daily-card .css-icon { width:80%; justify-self:center; }
            #fatcat-dom-panel-overlay .task-daily-card b { color:#6d421f; font-size:145%; }
            #fatcat-dom-panel-overlay .task-reward-strip { display:flex; gap:1.2%; margin:0 0 2%; overflow:hidden; }
            #fatcat-dom-panel-overlay .task-reward-strip span { flex:1; min-height:42px; border-radius:999px; background:linear-gradient(#775238,#4a3122); color:#ffe0a7; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:2.0%; box-shadow:inset 0 0 0 2px rgba(255,225,160,.12); }
            #fatcat-dom-panel-overlay .task-reward-strip span.ready { background:linear-gradient(#8ab84d,#4f842e); color:#fff8de; }
            #fatcat-dom-panel-overlay .task-meta { color: #7a5a3e; font-size: 90%; margin-top: 1%; }
            #fatcat-dom-panel-overlay .task-reward { color: #5f7f35; font-weight: 900; margin-top: 1%; }
            #fatcat-dom-panel-overlay .feature-hero { display:grid; grid-template-columns:16% 1fr 22%; gap:2%; align-items:center; margin-bottom:2%; padding:2%; border-radius:16px; background:linear-gradient(#fff1d5,#d4a86e); border:3px solid #7c5736; box-shadow:inset 0 0 0 2px rgba(255,250,224,.36), 0 4px 0 rgba(72,43,25,.24); color:#4a2f1f; font-size:2.2%; }
            #fatcat-dom-panel-overlay .feature-icon { width:100%; max-width:88px; aspect-ratio:1; border-radius:16px; background:center/contain no-repeat; justify-self:center; box-shadow:inset 0 0 0 3px rgba(98,65,35,.2), 0 3px 0 rgba(72,43,25,.22); }
            #fatcat-dom-panel-overlay .feature-badge { justify-self:end; padding:6% 9%; border-radius:999px; background:#5d3821; color:#ffe2a8; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,225,160,.12); text-align:center; }
            #fatcat-dom-panel-overlay .feature-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:2%; }
            #fatcat-dom-panel-overlay .feature-list { display:grid; gap:1.35%; }
            #fatcat-dom-panel-overlay .feature-card { min-height:106px; padding:3%; border-radius:14px; background:linear-gradient(#fff1d3,#d9b77e); border:2px solid #7c5736; color:#4a2f1f; box-shadow:inset 0 0 0 2px rgba(255,250,224,.34), 0 3px 0 rgba(72,43,25,.22); font-size:2.15%; line-height:1.36; position:relative; }
            #fatcat-dom-panel-overlay .feature-card.with-icon { display:grid; grid-template-columns:16% 1fr 22%; gap:2%; align-items:center; }
            #fatcat-dom-panel-overlay .feature-card .feature-icon { max-width:72px; }
            #fatcat-dom-panel-overlay .feature-card.ready:after { content:"!"; position:absolute; right:3%; top:8%; width:28px; height:28px; border-radius:50%; background:#d94b2d; color:#fff4d8; display:flex; align-items:center; justify-content:center; font-weight:900; box-shadow:0 2px 0 rgba(0,0,0,.24); }
            #fatcat-dom-panel-overlay .feature-mini { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5%; margin-bottom:2%; }
            #fatcat-dom-panel-overlay .feature-mini span { min-height:66px; border-radius:12px; background:linear-gradient(#76523a,#493124); color:#ffe3ad; display:flex; align-items:center; justify-content:center; flex-direction:column; font-size:2.0%; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,226,170,.12), 0 3px 0 rgba(72,43,25,.25); text-align:center; }
            #fatcat-dom-panel-overlay .feature-mini b { color:#fff; font-size:145%; }
            #fatcat-dom-panel-overlay .leaderboard-card { margin-bottom:2%; padding:2.2%; border-radius:14px; background:linear-gradient(#76523a,#493124); border:2px solid #7c5736; color:#ffe2a8; box-shadow:inset 0 0 0 2px rgba(255,226,170,.12), 0 3px 0 rgba(72,43,25,.24); font-size:2.05%; }
            #fatcat-dom-panel-overlay .leaderboard-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5%; font-weight:900; }
            #fatcat-dom-panel-overlay .leaderboard-head span { color:#fff; }
            #fatcat-dom-panel-overlay .leaderboard-row { min-height:34px; display:grid; grid-template-columns:14% 1fr 28%; gap:2%; align-items:center; border-top:1px solid rgba(255,226,170,.16); }
            #fatcat-dom-panel-overlay .leaderboard-row span { font-weight:900; color:#ffd36d; }
            #fatcat-dom-panel-overlay .leaderboard-row b { color:#fff6d8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .leaderboard-row em { justify-self:end; font-style:normal; font-weight:900; color:#9fdb69; }
            #fatcat-dom-panel-overlay .leaderboard-row.self { background:rgba(133,184,77,.18); border-radius:8px; padding:0 2%; }
            #fatcat-dom-panel-overlay .friend-tools { display:flex; align-items:center; justify-content:space-between; gap:2%; margin:0 0 2%; padding:1.6% 2.2%; border-radius:999px; background:rgba(75,49,32,.88); color:#ffe2a8; font-size:1.95%; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,226,170,.12), 0 2px 0 rgba(72,43,25,.22); }
            #fatcat-dom-panel-overlay .friend-tools span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .friend-tools .tag { margin:0; flex:0 0 auto; }
            #fatcat-dom-panel-overlay .friend-search-card { margin-bottom:2%; padding:2.2%; border-radius:14px; background:linear-gradient(#6e4c34,#3f2a20); border:2px solid #7c5736; color:#ffe2a8; box-shadow:inset 0 0 0 2px rgba(255,226,170,.1), 0 3px 0 rgba(72,43,25,.24); font-size:2.0%; }
            #fatcat-dom-panel-overlay .friend-search-row { display:grid; grid-template-columns:1fr auto auto; gap:1.5%; align-items:center; }
            #fatcat-dom-panel-overlay .friend-search-row input { min-width:0; height:38px; border-radius:999px; border:2px solid rgba(255,226,170,.32); background:#f7e5bf; color:#4a2f1f; padding:0 14px; font:inherit; font-weight:900; outline:none; box-sizing:border-box; }
            #fatcat-dom-panel-overlay .friend-search-result { margin-top:1.5%; display:grid; grid-template-columns:1fr auto; gap:2%; align-items:center; color:#fff4d8; }
            #fatcat-dom-panel-overlay .friend-search-result b { color:#fff; }
            #fatcat-dom-panel-overlay .friend-search-result em { display:block; font-style:normal; color:#f5c978; font-weight:900; }
            #fatcat-dom-panel-overlay .feature-badge.alert { background:linear-gradient(#e55b36,#9a321f); color:#fff6d8; box-shadow:0 0 0 3px rgba(255,220,120,.45), 0 4px 0 rgba(72,43,25,.28); }
            #fatcat-dom-panel-overlay .friend-request-card { margin-bottom:2%; padding:2.2%; border-radius:14px; background:linear-gradient(#fff7dc,#e2bf83); border:2px solid #7c5736; color:#4a2f1f; box-shadow:inset 0 0 0 2px rgba(255,250,224,.42), 0 3px 0 rgba(72,43,25,.22); font-size:2.0%; }
            #fatcat-dom-panel-overlay .request-row { min-height:38px; display:grid; grid-template-columns:14% 1fr 25% auto auto; gap:1.4%; align-items:center; border-top:1px solid rgba(124,87,54,.2); }
            #fatcat-dom-panel-overlay .request-row.sent { grid-template-columns:14% 1fr 32%; }
            #fatcat-dom-panel-overlay .request-row span { color:#fff6d8; background:#9a6734; border-radius:999px; padding:1px 8px; text-align:center; font-weight:900; }
            #fatcat-dom-panel-overlay .request-row b { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .request-row em { font-style:normal; color:#725137; font-weight:900; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .request-row .tag { min-width:52px; margin:0; }
            #fatcat-dom-panel-overlay .friend-activity-card { margin-bottom:2%; padding:2.2%; border-radius:14px; background:linear-gradient(#fff1d3,#d9b77e); border:2px solid #7c5736; color:#4a2f1f; box-shadow:inset 0 0 0 2px rgba(255,250,224,.34), 0 3px 0 rgba(72,43,25,.22); font-size:2.0%; }
            #fatcat-dom-panel-overlay .friend-activity-card .leaderboard-head { color:#5f3922; }
            #fatcat-dom-panel-overlay .friend-activity-card .leaderboard-head span { color:#7d4b22; }
            #fatcat-dom-panel-overlay .activity-row { min-height:34px; display:grid; grid-template-columns:18% 1fr 24%; gap:2%; align-items:center; border-top:1px solid rgba(124,87,54,.2); }
            #fatcat-dom-panel-overlay .activity-row span { color:#fff6d8; background:#7d4b22; border-radius:999px; padding:1px 8px; text-align:center; font-weight:900; }
            #fatcat-dom-panel-overlay .activity-row b { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .activity-row em { justify-self:end; font-style:normal; color:#7a5a3e; font-weight:900; }
            #fatcat-dom-panel-overlay .activity-empty { color:#7a5a3e; font-weight:900; padding-top:1%; }
            #fatcat-dom-panel-overlay .setting-row { display:grid; grid-template-columns:1fr 24%; gap:2%; align-items:center; }
            #fatcat-dom-panel-overlay .settings-shell .feature-card { min-height:84px; padding:2.2%; }
            #fatcat-dom-panel-overlay .settings-shell .setting-row { min-height:64px; }
            #fatcat-dom-panel-overlay .settings-shell .feature-list { gap:.8%; }
            #fatcat-dom-panel-overlay .toggle-pill { justify-self:end; min-width:86px; padding:7% 10%; border-radius:999px; background:linear-gradient(#85b84d,#4f842e); color:white; font-weight:900; text-align:center; box-shadow:0 3px 0 rgba(52,88,29,.35); }
            #fatcat-dom-panel-overlay .toggle-pill.off { background:linear-gradient(#96775b,#5d412f); }
            #fatcat-dom-panel-overlay .progress-line { height: 12px; margin-top: 3%; border-radius: 999px; background: #d4bd91; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(91,64,38,.25); }
            #fatcat-dom-panel-overlay .progress-line i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #79aa43, #f0c34e); }
            #fatcat-dom-panel-overlay .mini-progress { height: 12px; margin: 3% 0; border-radius: 999px; background: #d4bd91; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(91,64,38,.25); }
            #fatcat-dom-panel-overlay .mini-progress i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #79aa43, #f0c34e); }
            #fatcat-dom-panel-overlay .tree-line { position:absolute; height:2px; background:#d8a651; transform-origin:left center; box-shadow:0 0 10px rgba(255,190,75,.45); }
            #fatcat-dom-panel-overlay .tree-line.v { width:2px; height:18%; transform:none; }
            #fatcat-dom-panel-overlay .item { min-height: 120px; padding: 4%; font-size: 2.75%; line-height: 1.45; }
            #fatcat-dom-panel-overlay .shop-row { min-height: 94px; display: grid; grid-template-columns: 18% 1fr 27%; align-items: center; gap: 2%; }
            #fatcat-dom-panel-overlay .shop-row b { font-size:118%; }
            #fatcat-dom-panel-overlay .shop-icon, #fatcat-dom-panel-overlay .bag-icon { aspect-ratio: 1; border-radius: 14px; background: linear-gradient(#fff9e8,#d6ad70); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 3px rgba(118,78,43,.2), 0 4px 0 rgba(82,48,27,.25); position:relative; overflow:hidden; }
            #fatcat-dom-panel-overlay .shop-icon.asset, #fatcat-dom-panel-overlay .bag-icon.asset { background:center/cover no-repeat; }
            #fatcat-dom-panel-overlay .shop-icon.asset .css-icon, #fatcat-dom-panel-overlay .bag-icon.asset .css-icon { display:none; }
            #fatcat-dom-panel-overlay .bag-card { min-height: 126px; text-align: center; padding: 7% 5%; position:relative; }
            #fatcat-dom-panel-overlay .bag-card:after { content:""; position:absolute; right:7%; top:7%; width:18%; aspect-ratio:1; border-radius:50%; background:rgba(255,255,255,.26); box-shadow:0 0 0 1px rgba(113,76,42,.12); }
            #fatcat-dom-panel-overlay .bag-card.usable:after { content:"可用"; width:auto; aspect-ratio:auto; padding:1.2% 5%; border-radius:999px; background:#5f8f3a; color:#fff; font-size:72%; font-weight:900; }
            #fatcat-dom-panel-overlay .bag-card.empty { opacity:.78; filter:grayscale(.35); }
            #fatcat-dom-panel-overlay .bag-card.resource:before { content:""; position:absolute; left:6%; top:6%; width:22%; height:5%; border-radius:999px; background:linear-gradient(90deg,#f5c15a,#78aa43); box-shadow:0 1px 0 rgba(80,48,24,.28); }
            #fatcat-dom-panel-overlay .bag-count { position:absolute; right:7%; bottom:7%; min-width:28%; padding:1.5% 5%; border-radius:999px; background:#5b3923; color:#ffe2a8; font-weight:900; font-size:85%; box-shadow:inset 0 0 0 1px rgba(255,225,160,.16), 0 2px 0 rgba(0,0,0,.22); }
            #fatcat-dom-panel-overlay .css-icon { position:relative; display:block; width:62%; aspect-ratio:1; filter: drop-shadow(0 2px 0 rgba(77,43,21,.28)); }
            #fatcat-dom-panel-overlay .css-icon.coin { border-radius:50%; background:radial-gradient(circle at 35% 28%, #fff7a8 0 12%, transparent 13%), linear-gradient(#ffd75c,#d58918); box-shadow:inset 0 0 0 3px #9d6412; }
            #fatcat-dom-panel-overlay .css-icon.coin:after { content:""; position:absolute; inset:24%; border-radius:50%; border:3px solid rgba(120,72,12,.45); }
            #fatcat-dom-panel-overlay .css-icon.bean { width:54%; height:72%; border-radius:48% 52% 45% 55%; background:linear-gradient(135deg,#8a4b24,#4d2816); transform:rotate(24deg); box-shadow:inset -6px -7px 0 rgba(33,17,9,.2); }
            #fatcat-dom-panel-overlay .css-icon.bean:after { content:""; position:absolute; left:45%; top:9%; width:13%; height:82%; border-radius:99px; background:rgba(255,223,160,.35); transform:rotate(12deg); }
            #fatcat-dom-panel-overlay .css-icon.food { width:72%; height:55%; border-radius:0 0 38% 38%; background:linear-gradient(#fff0d0 0 18%, #d9e6f4 19% 45%, #b78c5a 46%); bottom:-8%; }
            #fatcat-dom-panel-overlay .css-icon.food:before { content:""; position:absolute; left:15%; right:15%; top:-28%; height:42%; border-radius:50% 50% 20% 20%; background:radial-gradient(circle at 25% 70%, #7a351b 0 12%, transparent 13%), radial-gradient(circle at 50% 30%, #9b4d24 0 12%, transparent 13%), radial-gradient(circle at 75% 70%, #6e3119 0 12%, transparent 13%), #b65d2c; }
            #fatcat-dom-panel-overlay .css-icon.diamond { width:72%; clip-path:polygon(50% 0, 95% 34%, 50% 100%, 5% 34%); background:linear-gradient(135deg,#fff3ff 0 12%,#af75ff 42%,#6432b8 100%); }
            #fatcat-dom-panel-overlay .css-icon.gift { border-radius:14%; background:linear-gradient(90deg,transparent 0 42%,#ffd36a 43% 57%,transparent 58%), linear-gradient(#d9432e 0 45%,#b92e23 46%); box-shadow:inset 0 0 0 3px #7e2118; }
            #fatcat-dom-panel-overlay .css-icon.gift:before { content:""; position:absolute; left:8%; right:8%; top:39%; height:14%; background:#ffd36a; }
            #fatcat-dom-panel-overlay .css-icon.shard { width:65%; clip-path:polygon(45% 0, 82% 25%, 68% 100%, 20% 82%, 8% 28%); background:linear-gradient(145deg,#fff0a7,#f09a2a 42%,#9a451b); }
            #fatcat-dom-panel-overlay .css-icon.equip { border-radius:50%; background:radial-gradient(circle at 50% 54%, transparent 0 35%, #617b50 36% 57%, #34442b 58%); box-shadow:inset 0 0 0 4px #8e9d79; }
            #fatcat-dom-panel-overlay .css-icon.cat { border-radius:48% 48% 42% 42%; background:linear-gradient(#f6c58a,#d98342); }
            #fatcat-dom-panel-overlay .css-icon.cat:before { content:""; position:absolute; left:7%; right:7%; top:-10%; height:38%; background:linear-gradient(135deg,#d98342 0 28%,transparent 29%), linear-gradient(225deg,#d98342 0 28%,transparent 29%); }
            #fatcat-dom-panel-overlay .css-icon.cat:after { content:""; position:absolute; left:27%; top:43%; width:10%; height:10%; border-radius:50%; background:#4b2a1d; box-shadow:26px 0 0 #4b2a1d, 13px 16px 0 -2px #7e3a25; }
            #fatcat-dom-panel-overlay .css-icon.deco { border-radius:18%; background:linear-gradient(#8ed0e8 0 46%,#4fa0be 47%); box-shadow:inset 0 0 0 4px #31687b; }
            #fatcat-dom-panel-overlay .css-icon.deco:before { content:""; position:absolute; left:33%; right:33%; top:-19%; height:30%; border-radius:50% 50% 0 0; background:#7a5a35; }
            #fatcat-dom-panel-overlay .css-icon.task { border-radius:18%; background:linear-gradient(#fff6dc,#e1b56f); box-shadow:inset 0 0 0 4px #8b6034; }
            #fatcat-dom-panel-overlay .css-icon.task:before { content:""; position:absolute; left:24%; right:24%; top:-8%; height:22%; border-radius:8px; background:#7e5430; }
            #fatcat-dom-panel-overlay .css-icon.task:after { content:""; position:absolute; left:25%; top:34%; width:50%; height:8%; border-radius:99px; background:#8b6034; box-shadow:0 14px 0 #8b6034, 0 28px 0 #8b6034; }
            #fatcat-dom-panel-overlay .price { display:inline-flex; align-items:center; justify-content:center; gap:6px; white-space:nowrap; }
            #fatcat-dom-panel-overlay .price .css-icon { width:20px; min-width:20px; }
            #fatcat-dom-panel-overlay .research-detail { display:grid; gap:2%; }
            #fatcat-dom-panel-overlay .research-hero { min-height: 146px; display:grid; grid-template-columns:24% 1fr; gap:4%; align-items:center; }
            #fatcat-dom-panel-overlay .research-hero .shop-icon { width:100%; max-width:104px; justify-self:center; }
            #fatcat-dom-panel-overlay .effect-pill { display:inline-flex; align-items:center; gap:8px; margin-top:3%; padding:2% 4%; border-radius:999px; background:rgba(91,57,31,.12); font-weight:900; }
            #fatcat-dom-panel-overlay .effect-pill .css-icon { width:22px; min-width:22px; }
            #fatcat-dom-panel-overlay .research-cost { margin-top:4%; padding:3%; border-radius:12px; background:rgba(91,57,31,.1); box-shadow:inset 0 0 0 2px rgba(95,60,30,.1); }
            #fatcat-dom-panel-overlay .research-cost-line { height:14px; margin-top:2%; border-radius:999px; background:#d4bd91; overflow:hidden; box-shadow:inset 0 0 0 1px rgba(91,64,38,.25); }
            #fatcat-dom-panel-overlay .research-cost-line i { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#6ea545,#f0c34e); }
            #fatcat-dom-panel-overlay .research-state { display:inline-flex; align-items:center; gap:6px; margin-top:2%; padding:1.4% 4%; border-radius:999px; background:#4f3320; color:#ffe0a7; font-weight:900; }
            #fatcat-dom-panel-overlay .research-lab { display:grid; grid-template-columns:16% 1fr 24%; gap:2%; align-items:center; margin-bottom:2%; padding:2%; border-radius:16px; background:linear-gradient(#fff1d5,#d4a86e); border:3px solid #7c5736; box-shadow:inset 0 0 0 2px rgba(255,250,224,.36), 0 4px 0 rgba(72,43,25,.24); color:#4a2f1f; font-size:2.2%; }
            #fatcat-dom-panel-overlay .research-lab-icon { width:100%; max-width:84px; aspect-ratio:1; border-radius:18px; background:linear-gradient(#9bd9e8,#4b8fa2); position:relative; justify-self:center; box-shadow:inset 0 0 0 3px #31687b, 0 3px 0 rgba(72,43,25,.22); }
            #fatcat-dom-panel-overlay .research-lab-icon:before { content:""; position:absolute; left:34%; right:34%; top:12%; height:58%; border-radius:0 0 9px 9px; background:linear-gradient(#fff7d7 0 24%,#73b957 25%); box-shadow:inset 0 0 0 2px rgba(56,76,45,.35); }
            #fatcat-dom-panel-overlay .research-lab b { font-size:155%; }
            #fatcat-dom-panel-overlay .research-lab small { display:block; color:#7a5a3e; font-size:86%; margin-top:1%; }
            #fatcat-dom-panel-overlay .research-badge { justify-self:end; padding:6% 9%; border-radius:999px; background:#5d3821; color:#ffe2a8; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,225,160,.12); text-align:center; }
            #fatcat-dom-panel-overlay .research-preview { display:grid; grid-template-columns:repeat(2,1fr); gap:2%; margin-top:3%; }
            #fatcat-dom-panel-overlay .research-preview span { padding:5% 4%; border-radius:12px; background:linear-gradient(#fff8df,#d9b980); font-weight:900; text-align:center; box-shadow:inset 0 0 0 2px rgba(112,78,45,.14); }
            #fatcat-dom-panel-overlay .tree { min-height: 480px; background: radial-gradient(circle at 50% 30%, rgba(255,197,93,.15), transparent 34%), linear-gradient(#3b2a20,#1f1510); border:3px solid #6f4a2d; border-radius:14px; position: relative; box-shadow: inset 0 0 0 3px rgba(255,224,160,.12), 0 4px 0 rgba(52,31,18,.28); }
            #fatcat-dom-panel-overlay .node { position: absolute; width: 30%; min-height: 12%; border-radius: 14px; background: linear-gradient(#82623b,#3b271b); border: 2px solid #d7a85a; color: #ffe0a0; display: grid; grid-template-columns:30% 1fr; align-items: center; justify-content: center; text-align: left; font-size: 2.0%; font-weight: 900; box-shadow: 0 0 14px rgba(255,180,70,.28), inset 0 0 0 2px rgba(255,235,180,.12); padding:1.6% 2%; box-sizing:border-box; }
            #fatcat-dom-panel-overlay .node-icon { width:82%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#fff0b8,#cc8730); box-shadow:inset 0 0 0 3px #6f441f; position:relative; justify-self:center; }
            #fatcat-dom-panel-overlay .node-icon:before { content:""; position:absolute; inset:24%; border-radius:50%; background:#ffe16b; box-shadow:0 0 10px rgba(255,210,80,.5); }
            #fatcat-dom-panel-overlay .node.done .node-icon { background:linear-gradient(#91c75c,#3f7d2d); }
            #fatcat-dom-panel-overlay .node.locked .node-icon { background:linear-gradient(#9a9186,#514940); }
            #fatcat-dom-panel-overlay button.node { font-family: inherit; cursor: pointer; pointer-events: auto; }
            #fatcat-dom-panel-overlay .node.selected { box-shadow: 0 0 0 3px #ffd071 inset, 0 0 18px rgba(255,190,75,.55); }
            #fatcat-dom-panel-overlay .node.done { background: linear-gradient(#5f8f3a,#2d4e22); border-color:#b8e078; color:#f3ffe0; }
            #fatcat-dom-panel-overlay .node.done:after { content:"✓"; position:absolute; right:5%; top:8%; width:16%; aspect-ratio:1; border-radius:50%; background:#f4d05b; color:#31501f; display:flex; align-items:center; justify-content:center; font-weight:900; }
            #fatcat-dom-panel-overlay .node.locked:after { content:""; position:absolute; right:5%; top:8%; width:15%; aspect-ratio:1; border-radius:4px; background:#6f6253; box-shadow:inset 0 0 0 2px rgba(255,236,190,.16); }
            #fatcat-dom-panel-overlay .node.locked { filter: grayscale(1); opacity: .72; }
            #fatcat-dom-panel-overlay .research-detail { min-height: 480px; }
            #fatcat-dom-panel-overlay .item b { font-size: 120%; }
            #fatcat-dom-panel-overlay .tag { display: inline-block; margin-top: 3%; padding: 1.2% 4%; background: linear-gradient(#86b84c,#4d842d); color: white; border-radius: 999px; font-weight: 800; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), 0 3px 0 rgba(52,88,29,.35); }
            #fatcat-dom-panel-overlay .tag .css-icon { display:inline-block; width:18px; min-width:18px; vertical-align:middle; margin-right:5px; }
            #fatcat-dom-panel-overlay button.tag { border: 0; cursor: pointer; pointer-events: auto; font: inherit; }
            #fatcat-dom-panel-overlay button.tag:disabled { cursor: default; opacity: .72; }
            #fatcat-dom-panel-overlay .warn { background: #8f5f3a; }
            #fatcat-dom-panel-overlay .wide { margin-top: 2.2%; padding: 3%; font-size: 2.8%; line-height: 1.45; }
            #fatcat-dom-panel-overlay .message { margin: 2% auto 0; width: 88%; min-height: 5%; padding: 1.2% 2%; border-radius: 999px; background: rgba(66, 48, 31, .88); color: #ffe7b3; text-align: center; font-size: 2.55%; font-weight: 800; box-shadow: inset 0 0 0 2px rgba(255,222,154,.12); }
            #fatcat-dom-panel-overlay.compact .panel-shell { padding: 4.4% 2.6% 17.5%; }
            #fatcat-dom-panel-overlay.compact .panel-close { width:7.6%; min-width:36px; }
            #fatcat-dom-panel-overlay.compact h2 { font-size: 3.85%; margin-bottom: 2.4%; }
            #fatcat-dom-panel-overlay.compact .tab { font-size: 2.05%; padding: 4.8% 1%; }
            #fatcat-dom-panel-overlay.compact .summary div { font-size: 2.25%; padding: 4.8%; }
            #fatcat-dom-panel-overlay.compact .building-view, #fatcat-dom-panel-overlay.compact .list.research-view { grid-template-columns: 1fr; gap: 2%; }
            #fatcat-dom-panel-overlay.compact .building-dashboard { grid-template-columns:repeat(2,1fr); }
            #fatcat-dom-panel-overlay.compact .building-pipeline { grid-template-columns:repeat(2,1fr); }
            #fatcat-dom-panel-overlay.compact .task-daily { grid-template-columns:1fr; }
            #fatcat-dom-panel-overlay.compact .task-reward-strip span { font-size:2.2%; min-height:36px; }
            #fatcat-dom-panel-overlay.compact .feature-grid, #fatcat-dom-panel-overlay.compact .feature-mini { grid-template-columns:1fr; }
            #fatcat-dom-panel-overlay.compact .settings-shell .feature-mini { grid-template-columns:repeat(3,1fr); }
            #fatcat-dom-panel-overlay.compact .settings-shell .feature-mini span { min-height:48px; font-size:1.75%; }
            #fatcat-dom-panel-overlay.compact .settings-shell .feature-card { min-height:62px; font-size:1.92%; }
            #fatcat-dom-panel-overlay.compact .settings-shell .toggle-pill { min-width:64px; padding:5% 8%; }
            #fatcat-dom-panel-overlay.compact .feature-card.with-icon { grid-template-columns:18% 1fr; }
            #fatcat-dom-panel-overlay.compact .feature-card.with-icon > div:last-child { grid-column:1 / 3; }
            #fatcat-dom-panel-overlay.compact .research-lab { grid-template-columns:18% 1fr; }
            #fatcat-dom-panel-overlay.compact .research-badge { grid-column:1 / 3; justify-self:stretch; padding:2.4% 4%; }
            #fatcat-dom-panel-overlay.compact .mini-factory { min-height: 430px; }
            #fatcat-dom-panel-overlay.compact .schedule-row { font-size: 2.35%; }
            #fatcat-dom-panel-overlay.compact .research-detail { min-height: 360px; }
            #fatcat-dom-panel-overlay.compact .tree { min-height: 430px; }
            #fatcat-dom-panel-overlay.compact .skin-card, #fatcat-dom-panel-overlay.compact .bag-card { min-height: 104px; }
            #fatcat-dom-panel-overlay.compact .shop-row { grid-template-columns: 16% 1fr 25%; min-height: 82px; }
            #fatcat-dom-panel-overlay.compact .shop-hero { grid-template-columns:1fr; }
            #fatcat-dom-panel-overlay.compact .shop-mascot { display:none; }
            #fatcat-dom-panel-overlay.compact .bag-hero { grid-template-columns:1fr; }
            #fatcat-dom-panel-overlay.compact .bag-capacity { display:none; }
            #fatcat-dom-panel-overlay.compact .list.bag-grid { grid-template-columns: repeat(3, 1fr); }
            #fatcat-dom-panel-overlay.tall .panel-shell { padding-top: 4.8%; padding-bottom: 18.5%; }
            #fatcat-dom-panel-overlay.wide .panel-shell { left: 8%; right: 8%; }
        `;
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
        } else if (action === "visitFriend") {
            const serverFriend = NetworkManager.canUseServer
                ? await SyncManager.visitServerFriend(id)
                : null;
            if (serverFriend) {
                this.applyServerFriendSnapshot(serverFriend.friend);
                this._domPanelMessage = serverFriend.rewarded
                    ? `Friend visit reward: +${this.formatNumber(serverFriend.rewardCoin)} coin.`
                    : "Friend visit synced: daily reward already claimed.";
                void this.refreshFriendActivitiesForPanel();
                success = true;
            } else if (!NetworkManager.canUseServer) {
                SaveManager.update(data => {
                    data.featureState.friendVisits[id] = Date.now();
                });
                success = true;
            }
        } else if (action === "sendFriendGift") {
            const serverFriend = NetworkManager.canUseServer
                ? await SyncManager.sendServerFriendGift(id)
                : null;
            if (serverFriend) {
                this.applyServerFriendSnapshot(serverFriend.friend);
                this._domPanelMessage = serverFriend.rewarded
                    ? `Friend gift reward: +${this.formatNumber(serverFriend.rewardCatFood)} cat food.`
                    : "Friend gift synced: daily reward already claimed.";
                void this.refreshFriendActivitiesForPanel();
                success = true;
            } else if (!NetworkManager.canUseServer) {
                SaveManager.update(data => {
                    data.featureState.friendGifts[id] = Date.now();
                });
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
        return `<div class="panel-shell"><h2>成就墙</h2><div class="feature-hero"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset("achievement")}')"></span><div><b>肥猫咖啡荣誉室</b><br>记录长期目标、收集进度和可领取奖励。</div><span class="feature-badge">可领取<br>${claimable}</span></div><div class="feature-mini"><span>猫咪收集<b>${unlockedCats}/${totalCats}</b></span><span>任务总数<b>${totalTasks}</b></span><span>钻石库存<b>${this.formatNumber(ResourceManager.get("diamond"))}</b></span></div><div class="feature-list">${rows}</div></div>`;
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
        return `<div class="panel-shell"><h2>邮件</h2><div class="feature-hero"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset("mail")}')"></span><div><b>公司邮箱</b><br>奖励、系统公告和好友互动都会集中在这里。</div><span class="feature-badge ${pendingFriendRequests > 0 ? "alert" : ""}">未读<br>${unreadNew}</span></div><div class="feature-list">${requestCard}${rowsNew}</div></div>`;
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
        const rowsNew = friends.map(friend => {
            const lastVisit = this.getFeatureTimestamp("friendVisits", friend.id);
            const lastGift = this.getFeatureTimestamp("friendGifts", friend.id);
            return `<div class="feature-card with-icon"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset("friend")}')"></span><div><b>${friend.name}</b><br>公司 Lv.${friend.level} · 工厂收益 ${this.formatNumber(friend.income)}/秒<br><span class="focus-tag">${friend.status}</span><span class="focus-tag">${lastVisit ? `已访问 ${lastVisit}` : "未访问"}</span><span class="focus-tag">${lastGift ? `已送礼 ${lastGift}` : "可送礼"}</span></div><div><button class="tag" data-action="visitFriend" data-id="${friend.id}">访问</button><br><button class="tag warn" data-action="sendFriendGift" data-id="${friend.id}">${lastGift ? "再送" : "送礼"}</button></div></div>`;
        }).join("");
        return `<div class="panel-shell"><h2>好友</h2><div class="feature-hero"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset("friend")}')"></span><div><b>好友工厂</b><br>${sourceLabelNew}：访问、送礼和好友申请会同步到 .NET 服务端。</div><span class="feature-badge ${pendingRequests > 0 ? "alert" : ""}">申请<br>${pendingRequests}</span></div>${friendToolsNew}${this.renderFriendSearchCard()}<div class="feature-mini"><span>好友<b>${friends.length}</b></span><span>待处理<b>${pendingRequests}</b></span><span>已发送<b>${sentPending}</b></span></div>${this.renderFriendRequestPreview()}${this.renderLeaderboardPreview()}${this.renderFriendActivityPreview()}<div class="feature-list">${rowsNew}</div></div>`;
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

    private getFriendPanelRows(): Array<{ id: string; name: string; level: number; income: number; status: string }> {
        if (this._serverFriends.length > 0) {
            return this._serverFriends.map(friend => ({
                id: friend.id,
                name: friend.name,
                level: friend.level,
                income: friend.incomePerSecond,
                status: "在线数据",
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
        if (type === "friend_add") return "添加";
        if (type === "friend_visit") return "访问";
        if (type === "friend_gift") return "送礼";
        return "互动";
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
        if (!timestamp) return "";
        return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
        const settings = [
            { id: "music", name: "音乐", desc: "咖啡工厂背景音乐。", on: this.getSettingValue("music") },
            { id: "sfx", name: "音效", desc: "按钮、生产和奖励音效。", on: this.getSettingValue("sfx") },
            { id: "push", name: "通知", desc: "邮件、好友和宝箱提示。", on: this.getSettingValue("push") },
            { id: "sync", name: "同步预览", desc: "为后续服务器同步展示状态。", on: this.getSettingValue("sync") },
        ];
        const rows = settings.map(item => `<div class="feature-card setting-row"><div><b>${item.name}</b><br>${item.desc}</div><button class="toggle-pill ${item.on ? "" : "off"}" data-action="toggleSetting" data-id="${item.id}">${item.on ? "开启" : "关闭"}</button></div>`).join("");
        return `<div class="panel-shell settings-shell"><h2>设置</h2><div class="feature-hero"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset("settings")}')"></span><div><b>公司设置</b><br>当前支持本地离线和 .NET Core 服务端联调。URL 可用 ?api=http://localhost:5144 临时指定。</div><span class="feature-badge">存档<br>${created}</span></div><div class="feature-mini"><span>服务器<b>${serverLabel}</b></span><span>同步<b>${syncLabel}</b></span><span>待同步<b>${sync.pendingFeatureChanges}</b></span></div><div class="feature-list">${rows}<div class="feature-card"><b>账号状态</b><br>API：${apiBase}<br>玩家：${playerId}<br>最近错误：${sync.lastError || network.lastError || "无"}<br><button class="tag" data-action="connectServer">连接服务器</button> <button class="tag" data-action="syncSave">同步存档</button> <button class="tag warn" data-action="pushSettings">推送设置</button> <button class="tag" data-action="previewProduction">结算预览</button></div></div></div>`;
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
        return id === "music" || id === "sfx";
    }

    private getFeatureTimestamp(bucket: "friendGifts" | "friendVisits", id: string): string {
        const timestamp = this.ensureFeatureState()[bucket][id];
        if (!timestamp) return "";
        return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    private getApiBaseLabel(): string {
        const status = NetworkManager.getStatus();
        if (status.serverMode === "unconfigured") return "未配置";
        return "已配置";
    }

    private getNetworkModeLabel(mode: "offline" | "ready" | "unconfigured" | "error"): string {
        if (mode === "ready") return "在线";
        if (mode === "offline") return "待连接";
        if (mode === "error") return "错误";
        return "未配置";
    }

    private getSyncModeLabel(mode: "offline" | "ready" | "syncing" | "failed"): string {
        if (mode === "ready") return "已连接";
        if (mode === "syncing") return "同步中";
        if (mode === "failed") return "失败";
        return "离线";
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
        const snapshot = ProductionManager.calculateSnapshot();
        const assignedCount = buildings.reduce((sum, building) => sum + building.assignedCatCount, 0);
        const capacityCount = buildings.reduce((sum, building) => sum + building.scheduleCapacity, 0);
        const dashboard = `<div class="building-dashboard"><div class="building-stat-card">${this.renderCssIcon("coin")}<span>净金币<br><b>${this.formatRate(snapshot.coinPerSecond)}/秒</b></span></div><div class="building-stat-card">${this.renderCssIcon("coin")}<span>工资成本<br><b>${this.formatRate(snapshot.wageCostPerSecond)}/秒</b></span></div><div class="building-stat-card">${this.renderCssIcon("bean")}<span>咖啡豆消耗<br><b>${this.formatRate(snapshot.beanCostPerSecond)}/秒</b></span></div><div class="building-stat-card">${this.renderCssIcon("cat")}<span>值班猫咪<br><b>${assignedCount}/${capacityCount}</b></span></div></div>`;
        const skins = `<div class="skin-row"><div class="skin-card classic"><div class="thumb"></div>简陋工厂<br><span class="tag">使用中</span></div><div class="skin-card classic"><div class="thumb"></div>经典工厂<br><span class="tag warn">未解锁</span></div><div class="skin-card steam"><div class="thumb"></div>蒸汽工厂<br><span class="tag warn">未解锁</span></div><div class="skin-card future"><div class="thumb"></div>未来工厂<br><span class="tag warn">未解锁</span></div></div>`;
        const pipeline = `<div class="building-command"><div class="building-command-title"><span>经营动线</span><span>${selected.floor} · ${selected.name}</span></div><div class="building-pipeline"><span>仓库备料</span><span>烘焙生产</span><span>猫咪服务</span><span>订单结算</span></div></div>`;
        const settlement = `<div class="wide">当前工厂结算：毛收益 ${this.formatRate(snapshot.grossCoinPerSecond)} 金币/秒，工资 ${this.formatRate(snapshot.wageCostPerSecond)} 金币/秒，净收益 ${this.formatRate(snapshot.coinPerSecond)} 金币/秒。点击左侧楼层可切换详情，排班会直接影响主楼层产能。</div>`;
        return `<div class="panel-shell"><h2>工厂（建筑）管理</h2>${dashboard}<div class="building-view"><div><div class="mini-factory"><div class="mini-sign">肥猫咖啡</div>${buildings.map(building => this.renderMiniFloor(building.id)).join("")}</div>${skins}</div><div>${this.renderSelectedBuilding(selected.id)}${pipeline}${settlement}</div></div></div>`;
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
        const activeMilestones = [20, 40, 60, 80, 100];
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

        return `<div class="panel-shell"><h2>任务详情</h2><div class="task-board"><span class="task-board-icon"></span><div>今日订单<br><b>${orderProgress}/${orderGoal}</b><div class="progress-line"><i style="width:${Math.floor((orderProgress / orderGoal) * 100)}%"></i></div></div><span class="task-stamp">活跃 ${activeScore}</span></div><div class="task-daily"><div class="task-daily-card">${this.renderCssIcon("task")}<span>订单完成<br><b>${orderProgress}/${orderGoal}</b></span></div><div class="task-daily-card">${this.renderCssIcon("gift")}<span>可领取奖励<br><b>${claimableCount}</b></span></div><div class="task-daily-card">${this.renderCssIcon("coin")}<span>活跃度<br><b>${activeScore}</b></span></div></div><div class="task-reward-strip">${activeMilestones.map(value => `<span class="${activeScore >= value ? "ready" : ""}">${value}</span>`).join("")}</div><div class="list shop-list">${rows}</div><div class="wide">点击左侧任务板或底部今日订单会打开这里；主界面宝箱会优先领取已完成任务，没有可领任务时发放一份小额宝箱奖励。</div></div>`;
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
        if (type === "main") return "主线";
        if (type === "daily") return "每日";
        if (type === "achievement") return "成就";
        return "任务";
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
        const nameMap: Record<string, string> = {
            item_cat_food_pack: "猫粮包",
            item_coin_pack_small: "小袋金币",
            item_shard_orange: "大橘碎片",
        };
        return nameMap[itemId] ?? itemId;
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
        const tabs: Array<{ id: "resource" | "item" | "cat" | "deco"; label: string }> = [
            { id: "resource", label: "资源商店" },
            { id: "item", label: "道具商店" },
            { id: "cat", label: "猫咪商店" },
            { id: "deco", label: "装饰商店" },
        ];
        const items = ShopManager.getShopItems(this._domShopTab);
        const rows = items.length > 0
            ? items.map(item => this.renderShopRow(item.id)).join("")
            : this.renderEmptyShopRows(this._domShopTab);
        return `<div class="panel-shell"><h2>商店详情</h2><div class="tabs">${tabs.map(tab => `<button class="tab ${this._domShopTab === tab.id ? "active" : ""}" data-action="shopTab" data-tab="${tab.id}">${tab.label}</button>`).join("")}</div><div class="shop-hero"><div class="summary with-icons"><div><span class="summary-icon">${this.renderCssIcon("coin")}</span><span>金币<br><b>${this.formatNumber(ResourceManager.get("coin"))}</b></span></div><div><span class="summary-icon">${this.renderCssIcon("diamond")}</span><span>钻石<br><b>${this.formatNumber(ResourceManager.get("diamond"))}</b></span></div><div><span class="summary-icon">${this.renderCssIcon("gift")}</span><span>今日特惠<br><b>${items.length}</b></span></div></div><div class="shop-mascot">补给店员<br><span class="tag">营业中</span></div></div><div class="shop-shelf-title"><span>${this.getShopTabLabel()}</span><span>限时补给</span></div><div class="list shop-list">${rows}</div></div>`;
    }

    private getShopTabLabel(): string {
        if (this._domShopTab === "resource") return "资源货架";
        if (this._domShopTab === "item") return "道具货架";
        if (this._domShopTab === "cat") return "猫咪招募";
        return "装饰外观";
    }

    private renderShopRow(id: string): string {
        const shop = ConfigManager.shops.find(item => item.id === id);
        if (!shop) return "";
        const item = ConfigManager.items.find(entry => entry.id === shop.itemId);
        const title = item?.name ?? shop.itemId;
        const desc = item?.description ?? "商品配置缺失";
        const icon = this.getShopIcon(item?.type ?? shop.category);
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
        if (type === "resource") return "bean";
        if (type === "shard") return "shard";
        if (type === "equipment") return "equip";
        if (type === "cat") return "cat";
        if (type === "deco") return "deco";
        return "gift";
    }

    private renderCssIcon(iconClass: string): string {
        return `<span class="css-icon ${iconClass}"></span>`;
    }

    private getGeneratedIconAsset(iconClass: string): string {
        return this.getDomAssetDataUri(GeneratedItemIconAssets[iconClass] ?? GeneratedItemIconAssets.gift);
    }

    private getResourceIconClass(resource: string): string {
        if (resource === "coin") return "coin";
        if (resource === "bean") return "bean";
        if (resource === "catFood") return "food";
        if (resource === "diamond") return "diamond";
        return "gift";
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
        const tabs: Array<{ id: "all" | "resource" | "shard" | "other"; label: string }> = [
            { id: "all", label: "全部" },
            { id: "resource", label: "资源" },
            { id: "shard", label: "碎片" },
            { id: "other", label: "其他" },
        ];
        const ownedCount = InventoryManager.getOwnedItems().reduce((sum, item) => sum + item.count, 0);
        const capacity = Math.max(24, ownedCount + 20);
        return `<div class="panel-shell"><h2>背包详情</h2><div class="tabs">${tabs.map(tab => `<button class="tab ${this._domInventoryTab === tab.id ? "active" : ""}" data-action="inventoryTab" data-tab="${tab.id}">${tab.label}</button>`).join("")}</div><div class="bag-hero"><div class="summary with-icons"><div><span class="summary-icon">${this.renderCssIcon("gift")}</span><span>道具数量<br><b>${ownedCount}</b></span></div><div><span class="summary-icon">${this.renderCssIcon("food")}</span><span>猫粮<br><b>${this.formatNumber(ResourceManager.get("catFood"))}</b></span></div><div><span class="summary-icon">${this.renderCssIcon("bean")}</span><span>咖啡豆<br><b>${this.formatNumber(ResourceManager.get("bean"))}</b></span></div></div><div class="bag-capacity">容量<b>${ownedCount}/${capacity}</b><span class="tag">自动整理</span></div></div><div class="bag-section-title"><span>${this.getInventoryTabLabel()}</span><span>已整理</span></div><div class="list bag-grid">${this.renderInventoryItems()}</div><div class="wide"><b>${this.getInventoryTabLabel()}</b><br>${this.getInventoryTabDesc()}</div></div>`;
    }

    private getInventoryTabLabel(): string {
        if (this._domInventoryTab === "resource") return "资源道具";
        if (this._domInventoryTab === "shard") return "猫咪碎片";
        if (this._domInventoryTab === "other") return "其他物品";
        return "全部物品";
    }

    private getInventoryTabDesc(): string {
        if (this._domInventoryTab === "resource") return "资源包可直接使用，使用后对应资源会进入顶部资产栏。";
        if (this._domInventoryTab === "shard") return "碎片用于后续招募和升星玩法，目前先作为材料保存。";
        if (this._domInventoryTab === "other") return "活动、装备和装饰类物品会逐步放到这里。";
        return "背包会同时显示资产概览和已拥有道具，方便核对商店购买结果。";
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
        const nameMap: Record<string, string> = {
            item_cat_food_pack: "猫粮包",
            item_coin_pack_small: "小袋金币",
            item_shard_orange: "大橘碎片",
        };

        const itemCards = filteredItems.map(item => {
            const usable = item.itemId === "item_cat_food_pack" || item.itemId === "item_coin_pack_small";
            const action = usable
                ? `<button class="tag" data-action="use" data-id="${item.itemId}">使用</button>`
                : `<span class="tag warn">材料</span>`;
            const icon = this.getItemIconClass(item.itemId);
            return `<div class="item bag-card ${usable ? "usable" : ""}"><div class="bag-icon asset" style="background-image:url('${this.getGeneratedIconAsset(icon)}')">${this.renderCssIcon(icon)}</div><b>${nameMap[item.itemId] ?? item.itemId}</b><br>${action}<span class="bag-count">x${item.count}</span></div>`;
        }).join("");
        return `${resourceCards}${itemCards}`;
    }

    private renderResourceBagCard(resource: string, label: string, amount: number): string {
        const icon = this.getResourceIconClass(resource);
        return `<div class="item bag-card resource"><div class="bag-icon asset" style="background-image:url('${this.getGeneratedIconAsset(icon)}')">${this.renderCssIcon(icon)}</div><b>${label}</b><br><span class="bag-count">${this.formatNumber(amount)}</span></div>`;
    }

    private getItemIconClass(itemId: string): string {
        if (itemId.includes("cat_food")) return "food";
        if (itemId.includes("coin")) return "coin";
        if (itemId.includes("shard")) return "shard";
        if (itemId.includes("equip")) return "equip";
        return "gift";
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
            return `<div class="panel-shell"><h2>研究详情</h2><div class="item">研究配置为空</div></div>`;
        }
        if (!configs.find(item => item.id === this._selectedResearchId)) {
            this._selectedResearchId = configs[0].id;
        }
        const selected = configs.find(item => item.id === this._selectedResearchId) ?? configs[0];
        const unlockedCount = configs.filter(item => ResearchManager.isUnlocked(item.id)).length;
        const unlockableCount = configs.filter(item => ResearchManager.canUnlock(item.id)).length;
        return `<div class="panel-shell"><h2>研究详情</h2><div class="research-lab"><span class="research-lab-icon"></span><div><b>咖啡实验室</b><small>围绕产量、消耗、离线收益和升级成本逐步解锁。</small></div><span class="research-badge">研究点<br>${this.formatNumber(ResourceManager.get("researchPoint"))}</span></div><div class="tabs"><button class="tab active">生产研究</button><button class="tab">经营研究</button><button class="tab">猫咪研究</button><button class="tab">特殊研究</button></div><div class="summary with-icons"><div><span class="summary-icon">${this.renderCssIcon("equip")}</span><span>当前节点<br><b>${selected.name}</b></span></div><div><span class="summary-icon">${this.renderCssIcon("coin")}</span><span>已解锁<br><b>${unlockedCount}/${configs.length}</b></span></div><div><span class="summary-icon">${this.renderCssIcon("gift")}</span><span>可研究<br><b>${unlockableCount}</b></span></div></div><div class="list research-view"><div class="tree">${this.renderResearchLines(configs)}${configs.map((config, index) => this.renderResearchNode(config.id, index)).join("")}${this.renderResearchPlaceholderNodes(configs.length)}</div><div class="research-detail">${this.renderResearchDetail(selected.id)}</div></div></div>`;
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
        const positions = [
            { left: 35, top: 6 },
            { left: 13, top: 32 },
            { left: 58, top: 32 },
            { left: 13, top: 58 },
            { left: 58, top: 58 },
            { left: 35, top: 80 },
        ];
        const pos = positions[index] ?? positions[positions.length - 1];
        const done = ResearchManager.isUnlocked(id);
        const canUnlock = ResearchManager.canUnlock(id);
        const selected = id === this._selectedResearchId;
        const cls = `${done ? "done" : ""} ${!done && !canUnlock ? "locked" : ""} ${selected ? "selected" : ""}`;
        const state = done ? "已完成" : canUnlock ? `${config.cost}点` : "未解锁";
        return `<button class="node ${cls}" style="left:${pos.left}%;top:${pos.top}%" data-action="selectResearch" data-id="${id}"><span class="node-icon"></span><span>${config.name}<br>${state}</span></button>`;
    }

    private renderResearchPlaceholderNodes(startIndex: number): string {
        const labels = ["咖啡萃取 II", "烘焙技术 II", "浓缩咖啡"];
        return labels.map((label, offset) => {
            const positions = [
                { left: 13, top: 58 },
                { left: 58, top: 58 },
                { left: 35, top: 80 },
            ];
            const pos = positions[offset];
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
        if (effectType.includes("coin")) return "coin";
        if (effectType.includes("bean")) return "bean";
        if (effectType.includes("food")) return "food";
        if (effectType.includes("cat")) return "cat";
        return "equip";
    }

    private getResearchEffectLabel(type: string): string {
        if (type === "coin_production_mult") return "金币产量";
        if (type === "bean_reduce") return "咖啡豆消耗";
        if (type === "upgrade_cost_reduce") return "升级成本";
        if (type === "offline_bonus") return "离线收益";
        return "研究效果";
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
        style.textContent = `
            #fatcat-dom-hud { position: fixed; z-index: 2147482500; pointer-events: none; font-family: Arial, sans-serif; color: #fff3d8; }
            #fatcat-dom-hud .hud-inner { position: absolute; inset: 0; }
            #fatcat-dom-hud .player { position: absolute; left: 2.2%; top: 2.4%; width: 25.4%; height: 7.1%; border-radius: 18px; background: radial-gradient(circle at 22% 18%, rgba(255,244,210,.45), transparent 22%), linear-gradient(#a0805f, #5e4933 72%, #372820); border: 3px solid #d1ad70; box-shadow: 0 4px 0 rgba(0,0,0,.36), inset 0 2px 0 rgba(255,249,220,.24), inset 0 0 0 2px rgba(255,242,199,.12); display: grid; grid-template-columns: 25% 1fr; align-items: center; box-sizing: border-box; overflow: visible; }
            #fatcat-dom-hud .player:before { content:""; position:absolute; left:5%; right:5%; top:7%; height:18%; border-radius:999px; background:linear-gradient(90deg, rgba(255,255,255,.34), rgba(255,255,255,.04)); pointer-events:none; }
            #fatcat-dom-hud .player:after { content:""; position:absolute; left:26%; right:8%; bottom:9%; height:13%; border-radius:999px; background:rgba(25,17,11,.28); pointer-events:none; }
            #fatcat-dom-hud .avatar { position: relative; width: 76%; aspect-ratio: 1; margin-left: 10%; border-radius: 50%; background: radial-gradient(circle at 38% 24%, rgba(255,255,255,.46), transparent 20%), linear-gradient(#f6d491,#c98542); color: #fff3d8; display: flex; align-items: end; justify-content: center; padding-bottom: 4%; box-sizing: border-box; font-size: 0; font-weight: 900; box-shadow: inset 0 0 0 3px #6b4326, 0 3px 0 rgba(0,0,0,.32); }
            #fatcat-dom-hud .avatar::before { content:""; position:absolute; left:24%; top:18%; width:52%; height:42%; border-radius:50%; background: radial-gradient(circle at 34% 48%, #3d281d 0 8%, transparent 9%), radial-gradient(circle at 66% 48%, #3d281d 0 8%, transparent 9%), radial-gradient(circle at 50% 66%,#8a4c2a 0 6%,transparent 7%), linear-gradient(#f0a458,#d98943); box-shadow:-8px -8px 0 -5px #5b3824, 8px -8px 0 -5px #5b3824, inset 8px -3px 0 rgba(255,238,205,.24); }
            #fatcat-dom-hud .avatar::after { content:""; position:absolute; left:25%; right:25%; bottom:15%; height:15%; border-radius:50%; background:radial-gradient(ellipse at 50% 0,#fff4d8 0 44%,transparent 45%); opacity:.72; }
            #fatcat-dom-hud .level { position:absolute; left:-6%; bottom:-9%; width:28%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#e7a345,#9d5c1d); border:2px solid #ffe0a7; color:#fff5d2; display:flex; align-items:center; justify-content:center; font-size:2.0%; font-weight:900; text-shadow:0 2px #6f3814; box-shadow:0 3px 0 rgba(0,0,0,.35); }
            #fatcat-dom-hud .company { font-size: 2.05%; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-top:1%; }
            #fatcat-dom-hud .exp { margin-top: 3%; width: 86%; height: 22%; border-radius: 999px; background: rgba(28,20,14,.85); overflow: hidden; box-shadow: inset 0 0 0 1px rgba(255,255,255,.18); }
            #fatcat-dom-hud .exp span { display: block; height: 100%; background: linear-gradient(90deg, #f0a51c, #ffe16b); }
            #fatcat-dom-hud .exp-text { position: absolute; left: 32%; top: 55%; width: 50%; text-align: center; color: #fff3c5; font-size: 1.55%; font-weight: 900; text-shadow:0 1px #3a2517; }
            #fatcat-dom-hud .resources { position: absolute; left: 28.4%; top: 3.15%; right: 1.7%; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1%; }
            #fatcat-dom-hud .res { position:relative; height: 5.15%; min-height: 42px; border-radius: 999px 12px 12px 999px; background: radial-gradient(circle at 8% 20%, rgba(255,240,183,.35), transparent 18%), linear-gradient(#7b6049, #433123 72%, #2f2118); border: 3px solid #b68b55; box-shadow: 0 4px 0 rgba(0,0,0,.34), inset 0 2px 0 rgba(255,246,207,.2), inset 0 0 0 2px rgba(255,229,173,.1); display: grid; grid-template-columns: 24% minmax(0, 1fr) 20%; align-items: center; box-sizing: border-box; overflow: visible; }
            #fatcat-dom-hud .res:before { content:""; position:absolute; left:9%; right:16%; top:10%; height:16%; border-radius:999px; background:linear-gradient(90deg, rgba(255,255,255,.28), rgba(255,255,255,0)); pointer-events:none; }
            #fatcat-dom-hud .res:after { content:""; position:absolute; right:20%; top:18%; bottom:18%; width:1px; background:rgba(255,226,164,.16); box-shadow:-1px 0 rgba(48,31,20,.35); pointer-events:none; }
            #fatcat-dom-hud .icon { position: relative; z-index:1; width: 96%; aspect-ratio: 1; margin-left: -8%; border-radius:50%; background:radial-gradient(circle at 36% 25%, rgba(255,255,255,.58), transparent 19%), linear-gradient(#ffe8a6,#b8792d); border:2px solid #5f3a1c; font-size: inherit; color: transparent; display: block; overflow: hidden; filter: drop-shadow(0 2px 0 rgba(0,0,0,.25)); box-sizing:border-box; box-shadow:0 0 0 3px rgba(255,231,165,.18), inset 0 -4px 0 rgba(80,45,20,.16); }
            #fatcat-dom-hud .icon:after { content:""; position:absolute; inset:9%; border-radius:inherit; pointer-events:none; box-shadow:inset 0 3px 0 rgba(255,255,255,.22), inset 0 -4px 0 rgba(80,45,20,.18); }
            #fatcat-dom-hud .coin .icon::before { content:""; position:absolute; inset:7%; border-radius:50%; background: radial-gradient(circle at 36% 30%, #fff2a4 0 12%, transparent 13%), linear-gradient(#ffd454,#d48a17); box-shadow: inset 0 0 0 3px #9a6216, inset 0 -5px 0 rgba(111,64,12,.16); }
            #fatcat-dom-hud .coin .icon::after { content:"$"; position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#8a5512; font-size:2.0%; font-weight:900; }
            #fatcat-dom-hud .bean .icon::before { content:""; position:absolute; left:18%; top:10%; width:62%; height:78%; border-radius:54% 46% 52% 48%; background: linear-gradient(125deg,#5b321d,#a96737 54%,#4a2818); transform: rotate(30deg); box-shadow: inset 7px 0 0 rgba(255,214,158,.22), inset -4px -7px 0 rgba(28,13,6,.22); }
            #fatcat-dom-hud .bean .icon::after { content:""; position:absolute; left:47%; top:19%; width:7%; height:62%; border-radius:999px; background:rgba(255,221,171,.32); transform:rotate(38deg); }
            #fatcat-dom-hud .food .icon::before { content:""; position:absolute; left:10%; right:10%; bottom:12%; height:46%; border-radius:14px 14px 20px 20px; background: linear-gradient(#f6e9d2,#cf8e4a); box-shadow: inset 0 0 0 2px #7d4f2b, inset 0 -6px 0 rgba(105,58,28,.15); }
            #fatcat-dom-hud .food .icon::after { content:""; position:absolute; left:24%; right:24%; top:14%; height:38%; border-radius:50% 50% 45% 45%; background: radial-gradient(circle at 28% 35%, #7f3d1c 0 16%, transparent 17%), radial-gradient(circle at 70% 38%, #7f3d1c 0 15%, transparent 16%), #b7622d; }
            #fatcat-dom-hud .diamond .icon { background:radial-gradient(circle at 35% 24%, rgba(255,255,255,.72), transparent 18%), linear-gradient(#7c5bc5,#37235e); }
            #fatcat-dom-hud .diamond .icon::before { content:""; position:absolute; left:10%; right:10%; top:16%; height:66%; clip-path: polygon(50% 0, 92% 30%, 50% 100%, 8% 30%); background: linear-gradient(135deg,#f7e8ff 0 16%,#b981ff 17% 42%,#6c48d8 43% 72%,#3f2a9a 73%); box-shadow: inset 0 0 0 3px rgba(255,255,255,.32); }
            #fatcat-dom-hud .diamond .icon::after { content:""; position:absolute; left:31%; top:23%; width:17%; height:24%; clip-path:polygon(0 0,100% 0,42% 100%); background:rgba(255,255,255,.62); }
            #fatcat-dom-hud .value { position:relative; z-index:1; font-size: 2.2%; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: clip; text-shadow:0 2px 0 rgba(0,0,0,.35); padding-left:1%; letter-spacing:0; }
            #fatcat-dom-hud .res-name { position:absolute; left:27%; top:6%; color:#f3d79e; font-size:1.05%; font-weight:900; text-shadow:0 1px #2d1d14; letter-spacing:0; }
            #fatcat-dom-hud .res .value { padding-top:9%; }
            #fatcat-dom-hud .plus { position:relative; z-index:1; width: 70%; aspect-ratio: 1; border-radius: 8px; background: radial-gradient(circle at 38% 20%, rgba(255,236,164,.58), transparent 28%), linear-gradient(#ffbd45,#e48114 70%,#a84d12); color: #fff4d8; display: flex; align-items: center; justify-content: center; font-size: 2.45%; font-weight: 900; box-shadow:0 2px 0 rgba(94,48,12,.42), inset 0 1px 0 rgba(255,235,190,.28), inset 0 -2px 0 rgba(109,50,13,.18); }
            #fatcat-dom-hud .plus:before { content:""; position:absolute; left:17%; right:17%; top:17%; height:18%; border-radius:999px; background:rgba(255,246,202,.42); }
            #fatcat-dom-hud .factory-msg { position: absolute; left: 21%; top: 80%; width: 58%; min-height: 3.8%; border-radius: 999px; background: rgba(52,35,24,.88); color: #ffe6b5; display: flex; align-items: center; justify-content: center; font-size: 2.4%; font-weight: 900; box-shadow: 0 2px 0 rgba(0,0,0,.3); }
            #fatcat-dom-hud.compact .player { width: 26.6%; left: 1.0%; }
            #fatcat-dom-hud.compact .company { font-size: 1.74%; }
            #fatcat-dom-hud.compact .resources { left: 28.8%; right: .8%; gap: .36%; }
            #fatcat-dom-hud.compact .res { grid-template-columns: 21% minmax(0, 1fr) 16%; min-height: 34px; border-width: 2px; }
            #fatcat-dom-hud.compact .icon { width:88%; margin-left:-2%; }
            #fatcat-dom-hud.compact .value { font-size: 1.78%; }
            #fatcat-dom-hud.compact .res-name { font-size: .92%; top:4%; }
            #fatcat-dom-hud.compact .plus { width: 58%; font-size: 2.02%; }
            #fatcat-dom-hud.compact.tall .player { left:.9%; width:28.1%; height:6.25%; border-radius:15px; }
            #fatcat-dom-hud.compact.tall .company { font-size:1.50%; }
            #fatcat-dom-hud.compact.tall .exp { height:18%; margin-top:2.3%; }
            #fatcat-dom-hud.compact.tall .exp-text { font-size:1.25%; top:53%; }
            #fatcat-dom-hud.compact.tall .resources { left:29.6%; right:.7%; top:3.0%; gap:.28%; }
            #fatcat-dom-hud.compact.tall .res { min-height:29px; height:4.0%; grid-template-columns:21% minmax(0,1fr) 15%; border-radius:999px 9px 9px 999px; }
            #fatcat-dom-hud.compact.tall .res-name { display:none; }
            #fatcat-dom-hud.compact.tall .res .value { padding-top:0; font-size:1.45%; padding-left:0; }
            #fatcat-dom-hud.compact.tall .icon { width:78%; margin-left:0; border-width:1px; }
            #fatcat-dom-hud.compact.tall .plus { width:48%; border-radius:6px; font-size:1.58%; }
            #fatcat-dom-hud.wide .player { left: 9%; top:2.0%; width: 20.5%; height:6.7%; border-radius:18px; }
            #fatcat-dom-hud.wide .company { font-size:1.75%; }
            #fatcat-dom-hud.wide .exp-text { font-size:1.28%; }
            #fatcat-dom-hud.wide .resources { left: 31%; right: 9%; top:2.65%; gap:.85%; }
            #fatcat-dom-hud.wide .res { min-height:38px; height:4.5%; grid-template-columns:23% minmax(0,1fr) 18%; }
            #fatcat-dom-hud.wide .value { font-size:1.85%; }
            #fatcat-dom-hud.wide .res-name { font-size:.9%; top:5%; }
            #fatcat-dom-hud.wide .plus { width:62%; font-size:2.05%; }
        `;
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
                    <div class="avatar"></div><div class="level">28</div>
                    <div>
                        <div class="company">肥猫咖啡公司</div>
                        <div class="exp"><span style="width:80%"></span></div>
                        <div class="exp-text">2560/3200</div>
                    </div>
                </div>
                <div class="resources">
                    ${this.renderHudResource("coin", "金币", this.formatNumber(resources.coin))}
                    ${this.renderHudResource("bean", "咖啡豆", this.formatNumber(resources.bean))}
                    ${this.renderHudResource("food", "猫粮", this.formatNumber(resources.catFood))}
                    ${this.renderHudResource("diamond", "钻石", this.formatNumber(resources.diamond))}
                </div>
                ${this._factoryMessage && this.currentPanel === "factory" ? `<div class="factory-msg">${this._factoryMessage}</div>` : ""}
            </div>`;
        this.layoutDomHudOverlay();
    }

    private renderHudResource(kind: string, label: string, value: string): string {
        return `<div class="res ${kind}" aria-label="${label} ${value}"><div class="icon" aria-hidden="true"></div><div class="res-name">${label}</div><div class="value">${value}</div><div class="plus">+</div></div>`;
    }

    private ensureDomNavOverlay(): HTMLElement | null {
        if (typeof document === "undefined") return null;
        if (this._domNavOverlay) return this._domNavOverlay;

        const overlay = document.createElement("div");
        overlay.id = "fatcat-dom-nav";
        const style = document.createElement("style");
        style.textContent = `
            #fatcat-dom-nav { position: fixed; z-index: 2147483100; pointer-events: none; font-family: Arial, sans-serif; color: #fff4d8; }
            #fatcat-dom-nav .nav-bar { position: absolute; left: 3.0%; right: 3.0%; bottom: .75%; height: 9.3%; border-radius: 20px; background: radial-gradient(circle at 50% 0, rgba(255,228,170,.16), transparent 34%), linear-gradient(#654f40, #30241d); border: 3px solid #80634b; box-shadow: 0 -2px 0 rgba(255,255,255,.09) inset, 0 6px 0 rgba(0,0,0,.38); display: grid; grid-template-columns: 1.13fr repeat(5, 1fr); gap: 1.05%; padding: .85%; box-sizing: border-box; }
            #fatcat-dom-nav .nav-item { position: relative; border:0; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4%; color: #f7e3c1; font-family:inherit; font-weight: 900; font-size: 2.18%; text-shadow: 0 2px 0 rgba(0,0,0,.35); background:rgba(255,224,180,.05); box-shadow:inset 0 0 0 1px rgba(255,231,190,.08), 0 2px 0 rgba(0,0,0,.16); cursor:pointer; pointer-events:auto; padding:0; touch-action:manipulation; }
            #fatcat-dom-nav .nav-item.active { background: radial-gradient(circle at 50% 0, rgba(255,239,186,.38), transparent 40%), linear-gradient(#f39a29, #c86418); color: white; box-shadow: inset 0 0 0 3px rgba(255,226,159,.26), 0 4px 0 rgba(0,0,0,.32); }
            #fatcat-dom-nav .nav-item.active:before { content:""; position:absolute; left:12%; right:12%; bottom:-9%; height:12%; border-radius:999px; background:#7a431b; box-shadow:0 2px 0 rgba(0,0,0,.28); }
            #fatcat-dom-nav .nav-icon { position: relative; width: 46%; aspect-ratio: 1; border-radius: 12px; background: linear-gradient(#f7e1b8, #b98848); color: #49311f; display: flex; align-items: center; justify-content: center; font-size: 2.1%; font-weight: 900; box-shadow: inset 0 0 0 2px rgba(93,58,28,.2), 0 2px 0 rgba(39,24,15,.22); overflow: hidden; }
            #fatcat-dom-nav .nav-item.active .nav-icon { background: linear-gradient(#fff6d9, #d8a24f); transform: translateY(-2%); }
            #fatcat-dom-nav .nav-label { max-width:94%; overflow:hidden; white-space:nowrap; text-overflow:clip; line-height:1.05; }
            #fatcat-dom-nav .ico-factory::before { content: ""; position: absolute; left: 24%; right: 24%; bottom: 20%; height: 46%; border-radius: 3px; background: #6f7f83; box-shadow: inset 0 0 0 2px #4b5b5e; }
            #fatcat-dom-nav .ico-factory::after { content: ""; position: absolute; left: 31%; right: 31%; top: 18%; height: 24%; border-radius: 3px 3px 0 0; background: #a6b3b4; box-shadow: 0 -7px 0 -3px #d45b31; }
            #fatcat-dom-nav .ico-cats::before { content: ""; position: absolute; left: 31%; top: 27%; width: 38%; height: 38%; border-radius: 50%; background: #7b543b; box-shadow: -13px 13px 0 -4px #7b543b, 13px 13px 0 -4px #7b543b, -14px -10px 0 -6px #7b543b, 14px -10px 0 -6px #7b543b; }
            #fatcat-dom-nav .ico-building::before { content: ""; position: absolute; left: 20%; right: 20%; bottom: 20%; height: 42%; border-radius: 3px; background: #806047; box-shadow: inset 0 0 0 2px #4f392b; }
            #fatcat-dom-nav .ico-building::after { content: ""; position: absolute; left: 16%; right: 16%; top: 22%; height: 24%; transform: rotate(45deg); background: #c18b49; box-shadow: inset 0 0 0 2px #6f4b2e; }
            #fatcat-dom-nav .ico-shop::before { content: ""; position: absolute; left: 18%; right: 18%; bottom: 20%; height: 38%; border-radius: 3px; background: #8b6547; box-shadow: inset 0 0 0 2px #553a28; }
            #fatcat-dom-nav .ico-shop::after { content: ""; position: absolute; left: 14%; right: 14%; top: 21%; height: 22%; border-radius: 6px; background: repeating-linear-gradient(90deg,#e45d37 0 20%,#fff0ca 20% 40%); box-shadow: 0 2px 0 #6a3c2a; }
            #fatcat-dom-nav .ico-inventory::before { content: ""; position: absolute; left: 24%; right: 24%; bottom: 18%; height: 50%; border-radius: 8px 8px 5px 5px; background: #b07a3d; box-shadow: inset 0 0 0 2px #65401f; }
            #fatcat-dom-nav .ico-inventory::after { content: ""; position: absolute; left: 36%; right: 36%; top: 18%; height: 20%; border-radius: 999px 999px 0 0; border: 4px solid #65401f; border-bottom: 0; }
            #fatcat-dom-nav .ico-research::before { content: ""; position: absolute; left: 37%; right: 37%; top: 19%; height: 24%; border-radius: 3px; background: #d8eee2; box-shadow: inset 0 0 0 2px #5c756b; }
            #fatcat-dom-nav .ico-research::after { content: ""; position: absolute; left: 25%; right: 25%; bottom: 18%; height: 42%; border-radius: 0 0 18px 18px; background: linear-gradient(#d8eee2 0 36%, #58a684 37%); box-shadow: inset 0 0 0 2px #5c756b; }
            #fatcat-dom-nav .badge { position: absolute; top: -2%; right: 14%; width: 21%; aspect-ratio: 1; border-radius: 50%; background: linear-gradient(#ff6a36,#d83c1f); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.65%; border: 2px solid #ffd2a6; box-shadow: 0 2px 0 rgba(0,0,0,.35); z-index:2; }
            #fatcat-dom-nav.compact .nav-bar { left: 1.5%; right: 1.5%; height: 9.8%; gap: .65%; padding: .7%; }
            #fatcat-dom-nav.compact .nav-item { font-size: 1.98%; border-radius: 12px; }
            #fatcat-dom-nav.compact .nav-icon { width: 43%; }
            #fatcat-dom-nav.compact .badge { width: 20%; right: 10%; }
            #fatcat-dom-nav.wide .nav-bar { left: 14%; right: 14%; }
        `;
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
        const navItems: Array<{ id: MainPanelId; label: string; iconClass: string; badge?: string }> = [
            { id: "factory", label: "工厂", iconClass: "ico-factory" },
            { id: "cats", label: "猫咪", iconClass: "ico-cats", badge: recruitableCats > 0 ? String(recruitableCats) : undefined },
            { id: "buildings", label: "建筑", iconClass: "ico-building", badge: upgradeableBuildings > 0 ? String(upgradeableBuildings) : undefined },
            { id: "shop", label: "商店", iconClass: "ico-shop", badge: shopHints > 0 ? "!" : undefined },
            { id: "inventory", label: "背包", iconClass: "ico-inventory" },
            { id: "research", label: "研究", iconClass: "ico-research" },
        ];
        overlay.innerHTML = `<div class="nav-bar">${navItems.map((item) => `
            <button type="button" class="nav-item ${this.currentPanel === item.id ? "active" : ""}" data-panel="${item.id}">
                ${item.badge ? `<div class="badge">${item.badge}</div>` : ""}
                <div class="nav-icon ${item.iconClass}"></div>
                <div class="nav-label">${item.label}</div>
            </button>`).join("")}</div>`;
        this.layoutDomNavOverlay();
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
        if (value >= 1000000) return `${(value / 1000000).toFixed(2).replace(/\.00$/, "")}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(2).replace(/\.00$/, "")}K`;
        return `${Math.floor(value)}`;
    }

    private formatRate(value: number): string {
        if (value >= 10) return this.formatNumber(value);
        if (value >= 1) return value.toFixed(1).replace(/\.0$/, "");
        if (value > 0) return value.toFixed(2).replace(/0$/, "");
        return "0";
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
            #fatcat-dom-cat-overlay { position: fixed; z-index: 2147483300; display: none; pointer-events: none; color: #fff3d8; font-family: Arial, sans-serif; }
            #fatcat-dom-cat-overlay:before { content:""; position:absolute; inset:-9%; background:rgba(27,18,13,.36); pointer-events:none; }
            #fatcat-dom-cat-overlay .cat-bg { position: absolute; inset: 0; background: linear-gradient(rgba(38,27,20,.08), rgba(38,27,20,.18)), linear-gradient(135deg,#7b5234,#2a1d15); border: 4px solid #4e3323; box-sizing: border-box; padding: 5.1% 2.7% 16.2% 11.5%; border-radius: 20px; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; pointer-events: auto; scrollbar-width: none; box-shadow: 0 10px 0 rgba(27,18,12,.35), inset 0 0 0 5px rgba(255,231,181,.13); }
            #fatcat-dom-cat-overlay .cat-bg::-webkit-scrollbar { width: 0; height: 0; }
            #fatcat-dom-cat-overlay .cat-art-bg { position: absolute; inset: 0; background-image: url("${this.getDomAssetDataUri(GeneratedBackgroundAssets.catDetailWorkshop)}"); background-size: cover; background-position: center top; filter: saturate(1.08) contrast(1.03) brightness(1.08); opacity:.96; }
            #fatcat-dom-cat-overlay .cat-bg::before { content: ""; position: absolute; left: 9%; right: 0; top: 0; height: 32%; background: linear-gradient(rgba(255,224,150,.18), rgba(255,202,115,0)); opacity: .75; }
            #fatcat-dom-cat-overlay .cat-bg::after { content: ""; position: absolute; left: 10%; right: 2%; top: 13%; height: 24%; border-radius: 12px; background: radial-gradient(circle at 50% 48%, rgba(237,158,77,.18) 0 10%, transparent 11%); box-shadow: inset 0 -6px 0 rgba(44,29,22,.12); }
            #fatcat-dom-cat-overlay .cat-bg:has(.cat-side)::selection { background: rgba(236,171,73,.35); }
            #fatcat-dom-cat-overlay .cat-bg > * { position: relative; z-index: 1; }
            #fatcat-dom-cat-overlay .cat-modal-title { position:absolute; z-index:4; left:35%; right:35%; top:.85%; min-height:52px; border-radius:0 0 16px 16px; background:linear-gradient(#825537,#4a2f22); border:3px solid #2f2018; color:#ffe7b0; display:flex; align-items:center; justify-content:center; font-size:2.8%; font-weight:900; text-shadow:0 2px #2b1b12; box-shadow:0 4px 0 rgba(0,0,0,.28), inset 0 0 0 2px rgba(255,231,178,.12); }
            #fatcat-dom-cat-overlay .close-x { position:absolute; z-index:5; right:1.7%; top:1.1%; width:6.4%; min-width:46px; aspect-ratio:1; border-radius:50%; background:linear-gradient(#f7ce71,#d48626); color:white; border:3px solid #5b351d; font-size:3.4%; font-weight:900; line-height:1; box-shadow:0 4px 0 rgba(0,0,0,.3), inset 0 0 0 2px rgba(255,238,193,.2); }
            #fatcat-dom-cat-overlay .cat-side { position: absolute; left: 1.65%; top: 5.4%; width: 8.4%; display: grid; gap: 1.15%; padding:.8% .55%; border-radius:18px; background:linear-gradient(rgba(82,58,42,.78),rgba(45,32,25,.82)); border:2px solid rgba(238,198,126,.22); box-shadow:0 6px 0 rgba(22,14,10,.24), inset 0 0 0 2px rgba(255,239,201,.06); }
            #fatcat-dom-cat-overlay .cat-side:before { content:""; position:absolute; left:12%; right:12%; top:1%; height:7%; border-radius:999px; background:linear-gradient(90deg, rgba(255,243,205,.28), rgba(255,243,205,0)); pointer-events:none; }
            #fatcat-dom-cat-overlay .cat-overview-head { display:grid; grid-template-columns:repeat(4,1fr); gap:1.1%; margin:0 0 1.1%; }
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
            #fatcat-dom-cat-overlay .cat-hero { display: grid; grid-template-columns: 23% 1fr 22%; gap: 2%; align-items: start; margin-top:1.8%; }
            #fatcat-dom-cat-overlay .cat-card, #fatcat-dom-cat-overlay .cat-portrait, #fatcat-dom-cat-overlay .cat-power, #fatcat-dom-cat-overlay .cat-stats, #fatcat-dom-cat-overlay .cat-weight, #fatcat-dom-cat-overlay .cat-grid > div, #fatcat-dom-cat-overlay .cat-list, #fatcat-dom-cat-overlay .cat-story { background: linear-gradient(rgba(255,246,224,.92), rgba(226,193,142,.92)); color: #4a2f1f; border: 3px solid #7b5636; border-radius: 14px; box-shadow: inset 0 0 0 2px rgba(255,250,224,.42), 0 4px 0 rgba(0,0,0,.24); box-sizing: border-box; }
            #fatcat-dom-cat-overlay .cat-card { position:relative; padding: 7%; font-size: 2.4%; line-height: 1.45; overflow:hidden; }
            #fatcat-dom-cat-overlay .cat-card:after { content:""; position:absolute; left:7%; right:7%; top:7%; height:2px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.62),transparent); opacity:.72; }
            #fatcat-dom-cat-overlay .cat-card.info { min-height:168px; background:linear-gradient(#fff6df,#e7c18d); }
            #fatcat-dom-cat-overlay .cat-card.info:before { content:""; position:absolute; right:-12%; top:-18%; width:54%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle,rgba(240,165,28,.22),rgba(240,165,28,0) 68%); }
            #fatcat-dom-cat-overlay .cat-card.info strong { display:inline-flex; align-items:center; min-height:34px; padding:0 12%; border-radius:999px; background:rgba(255,252,232,.72); box-shadow:inset 0 0 0 2px rgba(121,82,45,.16), 0 2px 0 rgba(92,56,28,.12); }
            #fatcat-dom-cat-overlay .cat-card.info strong:after { content:""; width:18px; height:18px; margin-left:8px; border-radius:4px; background:linear-gradient(135deg, transparent 0 42%, #8a623d 43% 57%, transparent 58%), linear-gradient(#f6d28b,#c58b42); box-shadow:inset 0 0 0 2px rgba(112,70,32,.18); }
            #fatcat-dom-cat-overlay .cat-card strong { font-size: 140%; }
            #fatcat-dom-cat-overlay .rank { font-size: 250%; color: #f3a51c; font-weight: 900; }
            #fatcat-dom-cat-overlay .type { background: #68a84a; color: white; padding: 1% 5%; border-radius: 999px; font-weight: 900; }
            #fatcat-dom-cat-overlay .cat-portrait { position: relative; height: 30%; min-height: 270px; display: flex; align-items: center; justify-content: center; flex-direction: column; font-size: 7%; font-weight: 900; background: radial-gradient(circle at 50% 76%, rgba(246,194,123,.62) 0 26%, transparent 27%), linear-gradient(rgba(250,225,184,.42),rgba(230,192,136,.86)); overflow: hidden; }
            #fatcat-dom-cat-overlay .cat-portrait:before { content:""; position:absolute; inset:3%; border-radius:12px; background-image:url("${this.getDomAssetDataUri(GeneratedBackgroundAssets.catDetailWorkshop)}"); background-size:cover; background-position:center 42%; opacity:.55; filter:saturate(1.05) brightness(1.08); }
            #fatcat-dom-cat-overlay .cat-portrait:after { content:""; position:absolute; left:15%; right:15%; bottom:12%; height:20%; border-radius:50%; background:radial-gradient(ellipse,rgba(77,45,24,.34),rgba(77,45,24,0) 70%); }
            #fatcat-dom-cat-overlay .portrait-cat { position: relative; z-index:2; width: 34%; min-width: 108px; aspect-ratio: .92; margin-top: 1%; filter: drop-shadow(0 5px 0 rgba(72,45,28,.22)); }
            #fatcat-dom-cat-overlay .portrait-cat::before { content: ""; position: absolute; left: 17%; right: 17%; bottom: 2%; height: 64%; border-radius: 48% 48% 38% 38%; background: radial-gradient(circle at 34% 28%, #fff2d5 0 13%, transparent 14%), radial-gradient(circle at 67% 28%, #fff2d5 0 13%, transparent 14%), linear-gradient(#f1a14b,#d17b35); box-shadow: inset -13px -9px 0 rgba(111,62,30,.14); }
            #fatcat-dom-cat-overlay .portrait-cat::after { content: ""; position: absolute; left: 23%; top: 2%; width: 54%; height: 50%; border-radius: 50%; background: radial-gradient(circle at 35% 45%, #3f271b 0 5%, transparent 6%), radial-gradient(circle at 65% 45%, #3f271b 0 5%, transparent 6%), radial-gradient(circle at 50% 59%, #8b4a2a 0 6%, transparent 7%), linear-gradient(#ffd198,#df8c42); box-shadow: -16px -11px 0 -8px #6b4228, 16px -11px 0 -8px #6b4228, inset 10px -4px 0 rgba(255,255,255,.3); }
            #fatcat-dom-cat-overlay .portrait-cat.img { width: 58%; min-width: 190px; background: center/contain no-repeat; aspect-ratio: 1; }
            #fatcat-dom-cat-overlay .portrait-cat.img::before, #fatcat-dom-cat-overlay .portrait-cat.img::after { display: none; }
            #fatcat-dom-cat-overlay .portrait-name { position:relative; z-index:2; margin-top: -1%; font-size: 68%; color: #4a2f1f; text-shadow: 0 2px #fff0cd; }
            #fatcat-dom-cat-overlay .cat-portrait span { position:relative; z-index:2; margin-top: 1%; padding: 1.5% 4%; border-radius: 12px; background: #fff2d5; border:2px solid rgba(117,82,47,.25); font-size: 28%; font-weight: 700; }
            #fatcat-dom-cat-overlay .cat-portrait .cat-talk { position:absolute; z-index:3; right:7%; top:10%; max-width:40%; text-align:left; box-shadow:0 3px 0 rgba(91,59,31,.12); }
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
            #fatcat-dom-cat-overlay .cat-stats div { min-height:54px; border-right:1px solid rgba(121,84,48,.18); display:flex; align-items:center; justify-content:center; flex-direction:column; gap:3%; border-radius:10px; background:linear-gradient(rgba(255,252,235,.38),rgba(215,177,117,.16)); box-shadow:inset 0 0 0 1px rgba(124,87,50,.08); }
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
            #fatcat-dom-cat-overlay .cat-grid > div { padding: 1.55%; font-size: 1.86%; line-height: 1.28; min-height: 126px; }
            #fatcat-dom-cat-overlay .cat-grid > div > b { display:inline-flex; align-items:center; min-height:22px; padding:.75% 4.2%; margin-bottom:1.3%; border-radius:999px; background:linear-gradient(#7b573f,#4b3326); color:#ffe4ad; box-shadow:0 2px 0 rgba(70,42,22,.22); }
            #fatcat-dom-cat-overlay .upgrade { display:inline-block; margin-top:4%; padding:3% 12%; border-radius:999px; background:#70a845; color:white; font-weight:900; }
            #fatcat-dom-cat-overlay .focus-tag { display:inline-block; margin:2% 2% 0 0; padding:1.8% 6%; border-radius:999px; background:rgba(91,57,31,.12); color:#6a3e22; font-weight:900; }
            #fatcat-dom-cat-overlay .focus-card { display:grid; grid-template-columns:27% 1fr; gap:4%; align-items:center; padding:1.5%; border-radius:12px; background:rgba(255,248,226,.34); box-shadow:inset 0 0 0 1px rgba(111,78,45,.12); }
            #fatcat-dom-cat-overlay .focus-icon { width:100%; aspect-ratio:1; border-radius:14px; background:center/contain no-repeat; box-shadow:inset 0 0 0 2px rgba(106,72,40,.18), 0 3px 0 rgba(78,47,26,.18); }
            #fatcat-dom-cat-overlay .focus-actions { display:flex; flex-wrap:wrap; gap:2%; margin-top:2.7%; }
            #fatcat-dom-cat-overlay .mini-action { padding:1.9% 7%; border-radius:999px; background:linear-gradient(#f2c66a,#d88b2b); color:#5a351d; font-weight:900; box-shadow:0 3px 0 rgba(111,64,24,.28), inset 0 0 0 2px rgba(255,244,202,.22); }
            #fatcat-dom-cat-overlay .mini-action.green { background:linear-gradient(#8ac05a,#4e8c34); color:#fff; text-shadow:0 1px rgba(53,85,29,.55); }
            #fatcat-dom-cat-overlay .mini-action:disabled { filter:grayscale(.8); opacity:.62; box-shadow:none; }
            #fatcat-dom-cat-overlay .mini-progress { height:12px; margin:4% 0 2%; border-radius:999px; background:#d6bd8d; overflow:hidden; box-shadow:inset 0 0 0 1px rgba(92,62,34,.2); }
            #fatcat-dom-cat-overlay .mini-progress i { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#74a846,#efc251); }
            #fatcat-dom-cat-overlay .equip-row { display:grid; grid-template-columns: repeat(4,1fr); gap:1.4%; margin-top:2%; text-align:center; }
            #fatcat-dom-cat-overlay .equip-slot { position:relative; min-height: 86px; border-radius:12px; background:linear-gradient(#f3dcb7,#d5aa72); border:2px solid rgba(111,78,45,.24); display:flex; align-items:center; justify-content:center; flex-direction:column; font-weight:900; color:#4a2f1f; box-shadow:inset 0 0 0 2px rgba(255,250,224,.25), 0 3px 0 rgba(73,44,24,.14); overflow:hidden; }
            #fatcat-dom-cat-overlay .equip-slot:after { content:""; position:absolute; left:11%; right:11%; bottom:7%; height:10%; border-radius:999px; background:rgba(83,54,29,.12); }
            #fatcat-dom-cat-overlay .equip-slot.selected { background:linear-gradient(#fff1bd,#e0a33e); box-shadow:0 0 0 3px rgba(241,173,48,.52) inset, 0 0 12px rgba(241,173,48,.34); }
            #fatcat-dom-cat-overlay .equip-slot small { font-size:76%; color:#725139; }
            #fatcat-dom-cat-overlay .equip-slot em { font-style:normal; color:#6d4728; }
            #fatcat-dom-cat-overlay .equip-row .locked { filter: grayscale(1); opacity:.65; }
            #fatcat-dom-cat-overlay .equip-bag { margin-top:1.2%; padding:1.0%; border-radius:12px; background:rgba(255,246,224,.48); box-shadow:inset 0 0 0 1px rgba(112,78,44,.13); }
            #fatcat-dom-cat-overlay .equip-bag strong { display:block; margin-bottom:1%; color:#6a4328; }
            #fatcat-dom-cat-overlay .equip-bag > div { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5%; }
            #fatcat-dom-cat-overlay .equip-pack { min-height:52px; border-radius:10px; background:linear-gradient(#fff4d6,#d9b47b); color:#4a2f1f; display:grid; grid-template-columns:26% 1fr; grid-template-rows:1fr .9fr .85fr; align-items:center; column-gap:3%; padding:2.4%; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,250,224,.24), 0 2px 0 rgba(75,45,24,.14); }
            #fatcat-dom-cat-overlay .equip-pack .equip-icon { grid-row:1 / 4; width:100%; margin:0; }
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
            #fatcat-dom-cat-overlay .cat-story { margin-top:.8%; padding:1.15%; font-size:1.68%; line-height:1.25; }
            #fatcat-dom-cat-overlay .cat-story { display:grid; grid-template-columns:1fr 17%; gap:1.5%; align-items:center; }
            #fatcat-dom-cat-overlay .story-photo { min-height:72px; border-radius:12px; background:linear-gradient(rgba(70,48,34,.08),rgba(70,48,34,.16)), center/cover no-repeat; box-shadow:inset 0 0 0 3px rgba(126,86,48,.18), 0 3px 0 rgba(74,45,25,.18); position:relative; transform:rotate(3deg); }
            #fatcat-dom-cat-overlay .story-photo:before { content:""; position:absolute; left:35%; top:-10%; width:28%; height:18%; border-radius:4px; background:#b44f37; box-shadow:0 2px 0 rgba(0,0,0,.22); }
            #fatcat-dom-cat-overlay .story-button { display:inline-flex; align-items:center; justify-content:center; margin-top:3%; padding:2.6% 8%; border-radius:999px; background:linear-gradient(#f6cf70,#d8942a); color:#5c351e; font-weight:900; box-shadow:0 3px 0 rgba(115,66,22,.32), inset 0 0 0 2px rgba(255,244,205,.24); }
            #fatcat-dom-cat-overlay .cat-actions { position:absolute; z-index:3; left:11.5%; right:2.7%; bottom:14.1%; height:4.2%; display:grid; grid-template-columns:1fr 1fr 1.4fr; gap:1.2%; }
            #fatcat-dom-cat-overlay .cat-actions button { border-radius:999px; color:#fff7de; font-size:2.05%; font-weight:900; text-shadow:0 2px rgba(80,43,18,.5); border:3px solid rgba(80,50,26,.42); box-shadow:0 4px 0 rgba(0,0,0,.26), inset 0 0 0 2px rgba(255,240,192,.14); }
            #fatcat-dom-cat-overlay .cat-actions .dismiss { background:linear-gradient(#a77a56,#74482e); }
            #fatcat-dom-cat-overlay .cat-actions .change { background:linear-gradient(#e0ae54,#b86a25); }
            #fatcat-dom-cat-overlay .cat-actions .level { background:linear-gradient(#8fbd55,#4f8c35); }
            #fatcat-dom-cat-overlay .cat-actions button:disabled { filter:grayscale(.75); opacity:.62; box-shadow:none; }
            #fatcat-dom-cat-overlay .cat-roster-label { position:absolute; left:11.8%; bottom:12.65%; padding:.55% 2.2%; border-radius:999px; background:linear-gradient(#7b573f,#493126); color:#ffe5ad; border:2px solid rgba(255,224,166,.24); font-size:1.55%; font-weight:900; box-shadow:0 3px 0 rgba(0,0,0,.22); }
            #fatcat-dom-cat-overlay .cat-list { position:absolute; z-index:8; left:11.5%; right:2.7%; bottom:.35%; height:12.0%; padding: 1.0%; font-size: 1.9%; background: linear-gradient(#594133,#3e2d24); color: #fff3d8; display:grid; grid-template-columns: repeat(6,1fr); gap:1.1%; text-align:center; box-sizing:border-box; border-color:#6f4e35; }
            #fatcat-dom-cat-overlay .cat-list button { position:relative; min-height:0; border-radius:10px; background:linear-gradient(#fff0d0,#d9b27a); color:#4a2f1f; border:2px solid rgba(104,71,40,.28); display:flex; align-items:center; justify-content:center; flex-direction:column; font-weight:900; gap:2%; overflow:hidden; box-shadow:0 3px 0 rgba(38,24,16,.24); transition:transform .12s ease, filter .12s ease; }
            #fatcat-dom-cat-overlay .cat-list button:active { transform:translateY(2px); filter:brightness(.96); }
            #fatcat-dom-cat-overlay .cat-list button:before { content:""; position:absolute; inset:3px; border-radius:8px; box-shadow:inset 0 0 0 1px rgba(255,250,224,.36); pointer-events:none; }
            #fatcat-dom-cat-overlay .cat-list .rarity-badge { position:absolute; left:6%; top:5%; min-width:22%; border-radius:999px; background:linear-gradient(#ffe36a,#d99522); color:#6a3618; font-size:86%; box-shadow:inset 0 0 0 1px rgba(93,58,28,.25); }
            #fatcat-dom-cat-overlay .cat-list .rarity-badge.s-rarity { background:linear-gradient(#ffe16b,#d68e18); color:#5f3214; }
            #fatcat-dom-cat-overlay .cat-list .rarity-badge.a-rarity { background:linear-gradient(#e8d8ff,#9f6bd5); color:#54316f; }
            #fatcat-dom-cat-overlay .cat-list .cat-status { margin-top:1%; padding:.8% 8%; border-radius:999px; background:#5f8f3a; color:white; font-size:78%; }
            #fatcat-dom-cat-overlay .cat-list .locked .cat-status { background:#8f5f3a; }
            #fatcat-dom-cat-overlay .cat-stars { color:#f0a51c; line-height:1; font-size:78%; text-shadow:0 1px #6e421f; }
            #fatcat-dom-cat-overlay .cat-thumb { width:45%; aspect-ratio:1; border-radius:50%; background: rgba(255,244,220,.85) center/contain no-repeat; box-shadow: inset 0 0 0 2px rgba(112,77,45,.22), 0 2px 0 rgba(76,45,24,.18); }
            #fatcat-dom-cat-overlay .cat-role-dot { position:absolute; right:7%; top:6%; width:13%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#95c965,#4e8d34); box-shadow:inset 0 0 0 2px rgba(255,242,204,.28), 0 2px 0 rgba(64,42,20,.22); }
            #fatcat-dom-cat-overlay .cat-role-dot.launcher { background:linear-gradient(#f0b35c,#c86b2c); }
            #fatcat-dom-cat-overlay .cat-role-dot.saver { background:linear-gradient(#8fc5d8,#4e879d); }
            #fatcat-dom-cat-overlay .cat-role-dot.support { background:linear-gradient(#d7b2f2,#8a5cbe); }
            #fatcat-dom-cat-overlay .cat-list .locked .cat-thumb { filter: grayscale(.85); opacity:.62; }
            #fatcat-dom-cat-overlay .cat-list .locked { filter: grayscale(.75); opacity:.72; }
            #fatcat-dom-cat-overlay .cat-list .active { transform:translateY(-4%); box-shadow:0 0 0 4px #f0a51c inset, 0 0 16px rgba(240,165,28,.45), 0 6px 0 rgba(63,36,17,.26); } #fatcat-dom-cat-overlay .cat-list .recruit { background:linear-gradient(#ffc84c,#ee991d); color:white; text-shadow:0 2px #9c5815; border-color:#ffe2a5; }
            #fatcat-dom-cat-overlay .cat-msg { position:absolute; left: 18%; right: 6%; bottom: 20.4%; min-height:3.1%; border-radius:999px; background:rgba(48,34,24,.9); color:#ffe6b5; display:flex;align-items:center;justify-content:center; font-size:2.0%; font-weight:900; pointer-events:none; box-shadow:0 3px 0 rgba(0,0,0,.22); }
            #fatcat-dom-cat-overlay .cat-msg.empty { display:none; }
            #fatcat-dom-cat-overlay.compact .cat-bg { padding: 5.0% 2.0% 16.8% 10.7%; border-radius:16px; }
            #fatcat-dom-cat-overlay.compact .cat-modal-title { left:31%; right:31%; min-height:42px; font-size:2.42%; }
            #fatcat-dom-cat-overlay.compact .close-x { width:6.9%; min-width:38px; font-size:3.0%; }
            #fatcat-dom-cat-overlay.compact .cat-side { left: 1.1%; top:5.4%; width: 8.8%; }
            #fatcat-dom-cat-overlay.compact .cat-overview-head div { min-height:48px; font-size:1.48%; }
            #fatcat-dom-cat-overlay.compact .back, #fatcat-dom-cat-overlay.compact .side-tab { min-height: 52px; font-size: 1.65%; border-radius: 12px; }
            #fatcat-dom-cat-overlay.compact .cat-hero { grid-template-columns: 24% 1fr 20%; gap: 1.4%; }
            #fatcat-dom-cat-overlay.compact .cat-card { font-size: 2.08%; padding: 5.5%; }
            #fatcat-dom-cat-overlay.compact .cat-portrait { min-height: 232px; }
            #fatcat-dom-cat-overlay.compact .portrait-cat.img { width:52%; min-width:150px; }
            #fatcat-dom-cat-overlay.compact .cat-portrait .cat-talk { right:5%; top:8%; max-width:42%; font-size:24%; }
            #fatcat-dom-cat-overlay.compact .cat-profile-row { font-size:20%; left:6%; right:6%; }
            #fatcat-dom-cat-overlay.compact .cat-power { width: 48%; font-size: 2.72%; }
            #fatcat-dom-cat-overlay.compact .cat-stats { font-size: 1.72%; padding: 1.25%; }
            #fatcat-dom-cat-overlay.compact .cat-weight { font-size: 2.05%; padding: 1.8%; }
            #fatcat-dom-cat-overlay.compact .cat-grid { grid-template-columns: 38% 1fr; gap: 1.0%; }
            #fatcat-dom-cat-overlay.compact .cat-grid > div { min-height: 106px; font-size: 1.58%; padding: 1.35%; line-height:1.18; }
            #fatcat-dom-cat-overlay.compact .focus-card { grid-template-columns:24% 1fr; gap:2.6%; padding:1.1%; }
            #fatcat-dom-cat-overlay.compact .focus-tag { padding:1.2% 4.2%; margin-top:1.4%; }
            #fatcat-dom-cat-overlay.compact .mini-action { padding:1.4% 5.5%; }
            #fatcat-dom-cat-overlay.compact .equip-row { gap:.8%; margin-top:.8%; }
            #fatcat-dom-cat-overlay.compact .equip-slot { min-height: 58px; border-radius:9px; font-size:86%; }
            #fatcat-dom-cat-overlay.compact .equip-slot small { font-size:64%; }
            #fatcat-dom-cat-overlay.compact .equip-icon { width:34%; margin-bottom:2%; }
            #fatcat-dom-cat-overlay.compact .equip-bag { margin-top:.8%; padding:.8%; }
            #fatcat-dom-cat-overlay.compact .equip-pack { min-height:44px; padding:1.8%; font-size:82%; }
            #fatcat-dom-cat-overlay.compact .equip-pack small { font-size:68%; }
            #fatcat-dom-cat-overlay.compact .equip-upgrade-info, #fatcat-dom-cat-overlay.compact .equip-effect-info { display:none; }
            #fatcat-dom-cat-overlay.compact .equip-upgrade { min-height:30px; margin-top:.8%; }
            #fatcat-dom-cat-overlay.compact .cat-story { font-size: 1.62%; grid-template-columns:1fr 18%; }
            #fatcat-dom-cat-overlay.compact .story-photo { min-height:72px; }
            #fatcat-dom-cat-overlay.compact .cat-actions { left:10.7%; right:2%; bottom:14.25%; height:4.4%; }
            #fatcat-dom-cat-overlay.compact .cat-actions button { font-size:1.68%; }
            #fatcat-dom-cat-overlay.compact .cat-roster-label { left:10.9%; bottom:12.7%; font-size:1.32%; }
            #fatcat-dom-cat-overlay.compact .cat-list { left: 10.7%; right: 2%; bottom:.3%; height: 12.2%; font-size: 1.62%; gap: .75%; }
            #fatcat-dom-cat-overlay.tall .cat-bg { padding-bottom: 16.8%; }
            #fatcat-dom-cat-overlay.wide .cat-bg { left: 2.5%; right: 2.5%; }
            #fatcat-dom-cat-overlay.wide .cat-overview-head div { min-height:42px; font-size:1.25%; }
            #fatcat-dom-cat-overlay.wide .cat-hero { margin-top:.55%; grid-template-columns:22% 1fr 20%; gap:1.4%; }
            #fatcat-dom-cat-overlay.wide .cat-card.info { min-height:142px; padding:4.8%; font-size:2.05%; }
            #fatcat-dom-cat-overlay.wide .cat-portrait { min-height:190px; }
            #fatcat-dom-cat-overlay.wide .portrait-cat.img { min-width:126px; width:44%; }
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
            #fatcat-dom-cat-overlay.wide .equip-icon { width:28%; margin-bottom:2%; }
            #fatcat-dom-cat-overlay.wide .cat-story { display:none; }
            #fatcat-dom-cat-overlay.wide .cat-msg { bottom:16.1%; }
            #fatcat-dom-cat-overlay.wide .cat-roster-label { display:none; }
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
            this._domCatTab = button.dataset.tab || "info";
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
            this._selectedEquipSlot = button.dataset.slot || "项圈";
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
            this._selectedEquipSlot = button.dataset.slot || this._selectedEquipSlot;
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
                <div class="cat-modal-title">猫咪图鉴</div>
                <button class="close-x" data-action="back">×</button>
                <div class="cat-side">
                    <button class="back" data-action="back">‹</button>
                    ${this.renderCatSideTab("info", "信息")}
                    ${this.renderCatSideTab("upgrade", "升级")}
                    ${this.renderCatSideTab("skill", "技能")}
                    ${this.renderCatSideTab("equip", "装备")}
                    ${this.renderCatSideTab("skin", "皮肤")}
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
                <div class="cat-stats"><div><i class="stat-icon bean"></i>咖啡豆消耗<br><b>${this.formatNumber(config.baseBeanCost)}/秒</b></div><div><i class="stat-icon food"></i>原料产量<br><b>${this.formatNumber(production)}/秒</b></div><div><i class="stat-icon coin"></i>工资<br><b>${this.formatNumber(wageCost)}/分钟</b></div><div><i class="stat-icon weight"></i>体重<br><b>${weightLabel}</b></div><div><i class="stat-icon paw"></i>品种<br><b>${config.breed}</b></div></div>
                <div class="cat-weight"><b>体重阶段</b><div class="weight-row"><span class="${weightStage === WeightStage.NORMAL ? "selected" : ""}">正常</span><span class="${weightStage === WeightStage.FAT ? "selected" : ""}">胖猫</span><span class="${weightStage === WeightStage.SUPER_FAT ? "selected" : ""}">巨胖</span><div class="bar"><i style="width:${Math.min(100, data.weight)}%"></i></div><em>${data.weight}/100</em></div></div>
                <div class="cat-grid">
                    <div><b>${this.getCatTabTitle()}</b><br>${this.renderCatFocusContent(config.id, unlocked, upgradeCost, unlockCost, canUpgrade)}</div>
                    <div><b>装备</b>${this.renderCatEquipPanel(config.id)}</div>
                </div>
                <div class="cat-story"><div><b>猫咪故事</b><br>${this.getCatStory(config.name, config.personality, config.breed, assignedName)}<br><span class="story-button">故事墙</span></div><div class="story-photo" style="background-image:url('${this.getCatFullArtAsset(config.id, config.portrait)}')"></div></div>
                <div class="cat-actions"><button class="dismiss" data-action="dismissCat" data-id="${config.id}">解雇</button><button class="change" data-action="changeCat" data-id="${config.id}">更换</button><button class="level" data-action="upgradeCat" data-id="${config.id}" ${canUpgrade ? "" : "disabled"}>升级1级 ${this.formatNumber(upgradeCost)}</button></div>
                <div class="cat-roster-label">猫咪队伍</div>
                <div class="cat-list">${configs.map(item => this.renderCatListButton(item.id)).join("")}<button class="recruit" data-action="unlockCat" data-id="${config.id}">招募猫咪<br>${this.formatNumber(unlockCost)} 金币</button></div>
                <div class="cat-msg ${this._domCatMessage ? "" : "empty"}">${this._domCatMessage}</div>
            </div>`;
    }

    private renderCatSideTab(tab: string, label: string): string {
        return `<button class="side-tab tab-${tab} ${this._domCatTab === tab ? "active" : ""}" data-action="tab" data-tab="${tab}"><i></i>${label}</button>`;
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
            return `<div class="focus-card"><span class="focus-icon" style="background-image:url('${this.getCatFullArtAsset(config.id, config.portrait)}')"></span><div><strong>皮肤衣柜</strong><br>默认工作服已启用。更多皮肤会跟随建筑外观和活动奖励开放。<div class="focus-actions"><button class="mini-action green" data-action="storyWall" data-id="${catId}">查看照片</button><button class="mini-action" data-action="skillDetails" data-id="${catId}">皮肤加成</button></div></div></div>`;
        }
        return `<div class="focus-card"><span class="focus-icon" style="background-image:url('${skillIcon}')"></span><div><strong>${this.getSkillName(config.skillId)}</strong><br>${this.getSkillDesc(config.role)}<br><span class="focus-tag">${this.getCatRoleLabel(config.role)}</span><span class="focus-tag">Lv.${data.level}</span><div class="focus-actions"><button class="mini-action green" data-action="skillDetails" data-id="${catId}">技能详情</button><button class="mini-action" data-action="upgradeCat" data-id="${catId}" ${canUpgrade ? "" : "disabled"}>${this.formatNumber(upgradeCost)} 金币升级</button></div></div></div>`;
    }

    private renderEquipmentEffectSummary(catId: string): string {
        const material = CatManager.getEquipmentEffectTotal(catId, "materialOutput");
        const mood = CatManager.getEquipmentEffectTotal(catId, "mood");
        const food = CatManager.getEquipmentEffectTotal(catId, "catFoodCost");
        const wage = CatManager.getEquipmentEffectTotal(catId, "wageCost");
        const rows = [
            material !== 0 ? `原料产量 ${material > 0 ? "+" : ""}${material}%` : "",
            mood !== 0 ? `心情上限 ${mood > 0 ? "+" : ""}${mood}%` : "",
            food !== 0 ? `猫粮消耗 ${food > 0 ? "+" : ""}${food}%` : "",
            wage !== 0 ? `工资消耗 ${wage > 0 ? "+" : ""}${wage}%` : "",
        ].filter(Boolean);
        return rows.length ? rows.slice(0, 2).join("<br>") : "暂无装备加成";
    }

    private renderCatEquipPanel(catId: string): string {
        const equipment = CatManager.getEquipment(catId);
        const slots = [
            { slot: "项圈", kind: "collar" },
            { slot: "杯子", kind: "cup" },
            { slot: "坐垫", kind: "cushion" },
        ];
        const row = slots.map(item => {
            const active = this._selectedEquipSlot === item.slot ? "selected" : "";
            const equipped = this.getEquipDefinition(equipment[item.slot]);
            const equipLevel = CatManager.getEquipmentLevel(catId, equipped.id);
            const maxLevel = equipped.levelMax ?? 5;
            return `<button class="equip-slot ${active}" data-action="equipItem" data-slot="${item.slot}" data-id="${catId}"><i class="equip-icon asset" style="background-image:url('${this.getEquipIconAsset(equipped.kind)}')"></i>${equipped.name}<br><em>${equipped.rarity} Lv.${equipLevel}/${maxLevel}</em><small>${equipped.bonus}</small></button>`;
        }).join("");
        const backpack = this.getEquipOptions(this._selectedEquipSlot).map(item => {
            const active = this._selectedEquipSlot === item.slot ? "ready" : "";
            const equipped = equipment[this._selectedEquipSlot] === item.id;
            const count = InventoryManager.getItemCount(item.id);
            const disabled = !equipped && count <= 0;
            const status = equipped ? "已装备" : count > 0 ? `持有 x${count}` : "未持有";
            return `<button class="equip-pack ${active} ${equipped ? "equipped" : ""} ${disabled ? "disabled" : ""}" data-action="equipItem" data-slot="${this._selectedEquipSlot}" data-item="${item.id}" data-id="${catId}" ${disabled ? "disabled" : ""}><i class="equip-icon asset" style="background-image:url('${this.getEquipIconAsset(item.kind)}')"></i><span>${item.name}</span><em>${status}</em><small>${item.source ?? "来源待定"}</small></button>`;
        }).join("");
        const upgradeState = CatManager.getEquipmentUpgradeState(catId, this._selectedEquipSlot);
        const upgradeLabel = upgradeState.isMax ? "已满级" : upgradeState.canAfford ? "升级装备" : "金币不足";
        const upgradeDisabled = upgradeState.isMax || !upgradeState.canAfford;
        const nextText = upgradeState.isMax ? "已达上限" : `Lv.${upgradeState.nextLevel}/${upgradeState.maxLevel}`;
        return `<div class="equip-row">${row}<button class="equip-slot locked"><i class="equip-icon asset" style="background-image:url('${this.getEquipIconAsset("lock")}')"></i>饰品槽<br><em>30级解锁</em><small>等待开放</small></button></div><div class="equip-bag"><strong>装备背包</strong><div>${backpack}</div><div class="equip-upgrade-info"><span>当前等级<b>Lv.${upgradeState.level}/${upgradeState.maxLevel}</b></span><span>下级预览<b>${nextText}</b></span><span>升级消耗<b>${upgradeState.cost} 金币</b></span></div><div class="equip-effect-info"><span>当前加成<b>${upgradeState.currentEffect}</b></span><span>下级加成<b>${upgradeState.nextEffect}</b></span></div><button class="equip-upgrade ${upgradeDisabled ? "disabled" : ""}" data-action="upgradeEquip" data-slot="${this._selectedEquipSlot}" data-id="${catId}" ${upgradeDisabled ? "disabled" : ""}>${upgradeLabel}</button></div>`;
    }

    private getEquipDefinition(itemId = ""): { id: string; slot: string; kind: string; name: string; rarity: string; bonus: string; levelMax?: number; upgradeCost?: number; source?: string; effects?: Array<{ label: string; baseValue: number; perLevel?: number; unit?: string }> } {
        const fallback = this.getEquipOptions("项圈")[0] ?? { id: "equip_collar_green", slot: "项圈", kind: "collar", name: "猫咪项圈", rarity: "B", bonus: "原料 +15%", levelMax: 5, upgradeCost: 80, source: "新手任务", effects: [{ label: "原料产量", baseValue: 15, perLevel: 1, unit: "%" }] };
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
        return `<button class="${active} ${locked}" data-action="selectCat" data-id="${id}"><span class="rarity-badge ${rarityClass}">${config.rarity}</span><span class="cat-role-dot ${config.role}"></span><span class="cat-thumb" style="background-image:url('${this.getCatThumbAsset(config.portrait)}')"></span><span>${config.name}</span><span class="cat-stars">${this.renderStars(config.rarity).slice(0, 3)}</span><em>${status}</em><span class="cat-status">${workStatus}</span></button>`;
    }

    private getCatThumbAsset(portrait?: string): string {
        if (portrait?.includes("black")) return this.getDomAssetDataUri(GeneratedCatThumbAssets.black);
        if (portrait?.includes("white")) return this.getDomAssetDataUri(GeneratedCatThumbAssets.white);
        return this.getDomAssetDataUri(GeneratedCatThumbAssets.orange);
    }

    private getCatFullArtAsset(catId: string, portrait?: string): string {
        if (GeneratedCatFullArtAssets[catId]) return this.getDomAssetDataUri(GeneratedCatFullArtAssets[catId]);
        if (portrait?.includes("black")) return this.getDomAssetDataUri(GeneratedCatFullArtAssets.black);
        if (portrait?.includes("white")) return this.getDomAssetDataUri(GeneratedCatFullArtAssets.white);
        return this.getDomAssetDataUri(GeneratedCatFullArtAssets.orange);
    }

    private getEquipIconAsset(kind: string): string {
        if (kind === "collar") return this.getDomAssetDataUri(GeneratedItemIconAssets.equipCollar);
        if (kind === "cup") return this.getDomAssetDataUri(GeneratedItemIconAssets.equipCup);
        if (kind === "cushion") return this.getDomAssetDataUri(GeneratedItemIconAssets.equipCushion);
        return this.getDomAssetDataUri(GeneratedItemIconAssets.equipLocked);
    }

    private getSkillIconAsset(role: string): string {
        return this.getDomAssetDataUri(GeneratedSkillIconAssets[role] ?? GeneratedSkillIconAssets.support);
    }

    private getCatTabTitle(): string {
        if (this._domCatTab === "upgrade") return "升级";
        if (this._domCatTab === "skill") return "技能";
        if (this._domCatTab === "equip") return "装备详情";
        if (this._domCatTab === "skin") return "皮肤";
        return "信息";
    }

    private getWeightStageLabel(stage: WeightStage): string {
        if (stage === WeightStage.SUPER_FAT) return "巨胖";
        if (stage === WeightStage.FAT) return "胖乎乎";
        return "正常";
    }

    private getCatRoleLabel(role: string): string {
        if (role === "producer") return "生产型";
        if (role === "saver") return "节省型";
        if (role === "launcher") return "发射型";
        if (role === "support") return "辅助型";
        return "生产型";
    }

    private renderStars(rarity: string): string {
        const count = rarity === "SS" ? 5 : rarity === "S" ? 4 : rarity === "A" ? 3 : 2;
        return "★★★★★".slice(0, count) + "☆☆☆☆☆".slice(0, 5 - count);
    }

    private getSkillName(skillId: string): string {
        const names: Record<string, string> = {
            s_001: "咖啡灵感",
            s_002: "火箭助推",
            s_003: "节省豆仓",
            s_004: "三花祝福",
            s_005: "巡逻加班",
        };
        return names[skillId] ?? "咖啡专注";
    }

    private getSkillDesc(role: string): string {
        if (role === "launcher") return "发射猫咪时提高金币结算，适合放在高收益楼层。";
        if (role === "saver") return "减少咖啡豆消耗，让生产线更稳定。";
        if (role === "support") return "提升同楼层伙伴效率，适合搭配生产型猫咪。";
        return "生产咖啡时有概率产出额外原料。";
    }

    private getCatBubble(personality: string, unlocked: boolean): string {
        if (!unlocked) return "还在门外观察这家公司。";
        if (personality.includes("贪吃")) return "老板，来杯咖啡提提神吧~";
        if (personality.includes("调皮")) return "发射按钮看起来很好玩。";
        if (personality.includes("黏人")) return "今天也要一起值班。";
        if (personality.includes("神秘")) return "咖啡香里藏着秘密。";
        return "准备开始工作。";
    }

    private getCatStory(name: string, personality: string, breed: string, assignedName: string): string {
        return `${name}是一只${personality}的${breed}，现在常驻${assignedName}。它相信稳定的咖啡香能让公司更快成长，也会在忙碌时提醒大家补充猫粮。`;
    }

    private getBuildingDisplayName(id: string): string {
        const names: Record<string, string> = {
            building_storage_b1: "原料仓库",
            building_cafe_1f: "咖啡厅",
            building_material_2f: "原料车间",
            building_ferment_3f: "发酵车间",
            building_roast_4f: "烘焙车间",
            building_office_5f: "管理室",
        };
        return names[id] ?? "待分配";
    }

    private layoutDomCatOverlay(): void {
        if (typeof document === "undefined" || !this._domCatOverlay) return;
        const canvas = document.querySelector("canvas");
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const aspect = rect.width / Math.max(1, rect.height);
        const compact = rect.width < 520 || aspect < 0.58;
        const widthRatio = compact ? 0.995 : aspect > 0.68 ? 0.90 : 0.985;
        const heightRatio = compact ? 0.965 : aspect > 0.68 ? 0.93 : 0.945;
        this.applyResponsiveOverlayBounds(this._domCatOverlay, rect, {
            left: (1 - widthRatio) * 0.5,
            top: compact ? 0.035 : 0.055,
            width: widthRatio,
            height: heightRatio,
        });
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
        const panelNameMap: Record<MainPanelId, string[]> = {
            factory: ["factory", "工厂"],
            cats: ["cats", "cat", "猫咪"],
            buildings: ["buildings", "building", "建筑"],
            shop: ["shop", "商店"],
            inventory: ["inventory", "背包"],
            research: ["research", "研究"],
            tasks: ["tasks", "任务"],
            achievements: ["achievements", "achievement", "成就"],
            mail: ["mail", "邮件"],
            friends: ["friends", "friend", "好友"],
            settings: ["settings", "setting", "设置"],
        };
        const selectedNames = panelNameMap[this.currentPanel];

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
