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
import { FriendBoostManager } from "../manager/FriendBoostManager";
import { FriendCoopManager } from "../manager/FriendCoopManager";
import { DailyOrderManager } from "../manager/DailyOrderManager";
import { FactoryAppearanceManager } from "../manager/FactoryAppearanceManager";
import { CatSkinCatalogItemDto, DecorCatalogItemDto, DecorCollectionDto, DecorCollectionTierDto, DecorStateDto, FriendActivityDto, FriendDto, FriendProfileDto, FriendRequestDto, FriendRoomDto, FriendSearchResultDto, LeaderboardDto, SocialRealtimeEventDto } from "../net/ApiTypes";
import { CatModel, WeightStage } from "../model/CatModel";
import { TaskType } from "../model/TaskModel";
import { GeneratedBackgroundAssets } from "./UiAssetRegistry";
import {
    getBuildingRoomAsset,
    getCatFullArtAsset,
    getCatSkinAsset,
    getDomAssetDataUri,
    getEquipIconAsset,
    getFactoryAppearanceAsset,
    getFactoryPropDataUri,
    getFeatureIconAsset,
    getGeneratedIconAsset,
    getInventoryPreviewAsset,
    getResearchNodeAsset,
    getRecruitBadgeAsset,
    getShopProductAsset,
    getSkillIconAsset,
} from "./DomAssetResolver";
import { formatClockTime, formatDisplayNumber, formatExactInteger, formatFriendReportRelativeTime, formatRateValue } from "./Formatters";
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
    FACTORY_APPEARANCES,
    INVENTORY_ALL_SLOTS,
    INVENTORY_PREVIEW_CARDS,
    INVENTORY_TABS,
    RESEARCH_NODE_PRESENTATIONS,
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
    type CatSkinId,
    type CatTabId,
} from "./CatPresentation";
import { getDomCatStyles } from "./CatOverlayPresentation";
import {
    DOM_HUD_STYLES,
    HUD_RESOURCE_ITEMS,
    escapeHudText,
    getHudExperiencePercent,
    type HudResourceKind,
} from "./HudPresentation";
import { DOM_NAV_STYLES, DOM_NAV_TARGET_STYLES } from "./NavPresentation";
import { DOM_PANEL_STYLES } from "./PanelPresentation";
import {
    renderFriendFactoryDetailCard,
    renderFriendSnapshotCard as renderFriendSnapshotCardMarkup,
    renderFriendVisitSceneCard,
    type FriendFactoryRoomView,
} from "./FriendFactoryCards";
import {
    renderFriendActivityCard,
    renderFriendLeaderboardCard,
    renderFriendListCards,
    renderFriendRequestCard,
    renderFriendSearchCard,
} from "./FriendSocialCards";
import {
    formatFriendCoopRewardLabel,
    renderFriendBoostHistoryCard,
    renderFriendCoopGoalCard,
    renderFriendProfileMeta,
    type FriendProfileMetaView,
} from "./FriendCooperationCards";
import { renderFriendVisitReportCard } from "./FriendVisitReportCard";
import { renderSettingsAccountCard } from "./SettingsAccountCard";
import { renderServerStatusCard } from "./SettingsStatusCard";

const { ccclass, property } = _decorator;

type FriendPanelRow = {
    id: string;
    name: string;
    level: number;
    income: number;
    status: string;
    profile?: FriendProfileDto;
    rooms?: FriendRoomDto[];
    lastHelpAt?: number;
};

type InventoryDetailView = {
    key: string;
    name: string;
    count: number;
    description: string;
    source: string;
    art: string;
    kind: string;
    rarity: string;
    status: string;
    usableItemId?: string;
};

type ShopProductDetailView = {
    key: string;
    category: ShopTabId;
    name: string;
    description: string;
    source: string;
    art: string;
    artKind: string;
    priceLabel: string;
    limitLabel: string;
    realShopId?: string;
    decorId?: string;
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
    private _latestSocialEvent: SocialRealtimeEventDto | null = null;
    private _selectedDomCatId = "";
    private _domCatTab: CatTabId = "info";
    private _selectedDomCatSkinId: CatSkinId = "default";
    private _domCatMessage = "";
    private _selectedEquipSlot: CatEquipmentSlotName = "项圈";
    private _selectedDomBuildingId = "building_cafe_1f";
    private _buildingPanelMode: "detail" | "appearance" = "detail";
    private _selectedFactoryAppearanceId = "simple";
    private _domShopTab: ShopTabId = "resource";
    private _selectedShopProductKey = "shop:shop_cat_food_1";
    private _domInventoryTab: InventoryTabId = "all";
    private _selectedInventoryKey = "resource:bean";
    private _selectedResearchId = "res_basic_prod";
    private _serverFriends: FriendDto[] = [];
    private _serverDecorations: DecorStateDto[] = [];
    private _serverDecorCatalog: DecorCatalogItemDto[] = [];
    private _serverDecorCollection: DecorCollectionDto | null = null;
    private _decorRefreshInFlight = false;
    private _decorCatalogRefreshInFlight = false;
    private _friendActivities: FriendActivityDto[] = [];
    private _receivedFriendRequests: FriendRequestDto[] = [];
    private _sentFriendRequests: FriendRequestDto[] = [];
    private _friendSearchQuery = "";
    private _friendSearchPreview: FriendSearchResultDto | null = null;
    private _friendSearchMessage = "";
    private _serverLeaderboard: LeaderboardDto | null = null;
    private _selectedFriendSnapshotId = "";
    private _friendVisitSceneId = "";
    private _friendVisitReport: { friendId: string; kind: "visit" | "gift" | "help"; rewardText: string; statusText: string; updatedAt: number; timeline: string[] } | null = null;
    private _friendRefreshInFlight = false;
    private _friendProfileRefreshInFlight = false;
    private _friendActivityRefreshInFlight = false;
    private _friendRequestRefreshInFlight = false;
    private _friendRequestBadgeFetchedAt = 0;
    private _presenceHeartbeatAt = 0;
    private _presenceHeartbeatInFlight = false;
    private _friendAutoRefreshAt = 0;
    private _leaderboardRefreshInFlight = false;
    private _waitingForAppReady = false;
    private _launchInProgress = false;
    private _cocosCanvasOpacity = "";

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
        this.hideCocosCanvasForDomUi();
        this.prepareCatViewForRendering();
        this.bindNavButtons();
        this.bindDomHotspots();
        this.updateButtons();
        // Initialize state
        this.select(this.currentPanel);
        EventBus.off(GameEvents.SOCIAL_REALTIME_EVENT, this.onSocialRealtimeEvent);
        EventBus.on<SocialRealtimeEventDto>(GameEvents.SOCIAL_REALTIME_EVENT, this.onSocialRealtimeEvent);
        EventBus.off(GameEvents.FRIEND_BOOST_HISTORY_CHANGED, this.onFriendBoostHistoryChanged);
        EventBus.on(GameEvents.FRIEND_BOOST_HISTORY_CHANGED, this.onFriendBoostHistoryChanged);
        EventBus.off(GameEvents.DAILY_ORDER_CHANGED, this.onDailyOrderChanged);
        EventBus.on(GameEvents.DAILY_ORDER_CHANGED, this.onDailyOrderChanged);
        EventBus.off(GameEvents.PLAYER_PROGRESSION_CHANGED, this.onPlayerProgressionChanged);
        EventBus.on(GameEvents.PLAYER_PROGRESSION_CHANGED, this.onPlayerProgressionChanged);
        EventBus.off(GameEvents.ACHIEVEMENTS_CHANGED, this.onAchievementsChanged);
        EventBus.on(GameEvents.ACHIEVEMENTS_CHANGED, this.onAchievementsChanged);

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
        this.hideCocosCanvasForDomUi();
        this.hideCocosTopBar();
        this.renderDomHudOverlay();
        this.renderDomNavOverlay();
        this.tickSocialPresence();
    }

    protected onDestroy(): void {
        EventBus.off(GameEvents.SOCIAL_REALTIME_EVENT, this.onSocialRealtimeEvent);
        EventBus.off(GameEvents.FRIEND_BOOST_HISTORY_CHANGED, this.onFriendBoostHistoryChanged);
        EventBus.off(GameEvents.DAILY_ORDER_CHANGED, this.onDailyOrderChanged);
        EventBus.off(GameEvents.PLAYER_PROGRESSION_CHANGED, this.onPlayerProgressionChanged);
        EventBus.off(GameEvents.ACHIEVEMENTS_CHANGED, this.onAchievementsChanged);
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
        if (typeof document !== "undefined") {
            const canvas = document.querySelector<HTMLCanvasElement>("canvas");
            if (canvas) canvas.style.opacity = this._cocosCanvasOpacity;
        }
        if (this._domLayoutFrame && typeof cancelAnimationFrame !== "undefined") {
            cancelAnimationFrame(this._domLayoutFrame);
        }
    }

    private onSocialRealtimeEvent = (socialEvent: SocialRealtimeEventDto): void => {
        this._latestSocialEvent = socialEvent;
        const message = socialEvent.eventType === "friend_help"
            ? `${socialEvent.actorCompanyName} 为工厂助力，生产效率 +${socialEvent.boostPercent}%`
            : socialEvent.eventType === "friend_gift"
                ? `${socialEvent.actorCompanyName} 给你送来一份猫粮礼物`
                : `${socialEvent.actorCompanyName} 正在访问你的咖啡工厂`;
        this.showFactoryNotice(message, "friend");
        if (this.currentPanel === "friends") {
            void this.refreshFriendActivitiesForPanel();
        }
    };

    private onFriendBoostHistoryChanged = (): void => {
        if (this.currentPanel === "factory") {
            this.renderDomFactoryOverlay();
        } else if (this.currentPanel === "friends") {
            this.renderDomPanel("friends");
        }
    };

    private onDailyOrderChanged = (): void => {
        if (this.currentPanel === "factory") {
            this.renderDomFactoryOverlay();
        }
    };

    private onPlayerProgressionChanged = (): void => {
        this.renderDomHudOverlay(true);
        if (this._buildingPanelMode === "appearance" && this.currentPanel === "buildings") {
            this.renderDomPanel("buildings");
        }
    };

    private onAchievementsChanged = (): void => {
        if (this.currentPanel === "achievements") {
            this.renderDomPanel("achievements");
        }
    };

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
        const dailyOrder = DailyOrderManager.getState();
        if (dailyOrder.launchesRemaining <= 0) {
            this._factoryMessage = "次数已用完 · 明日再来";
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
                const appearanceSource = serverLaunch.modifierSources?.find(source => source.sourceType === "factory_appearance");
                const progression = serverLaunch.playerProgression;
                const levelText = progression ? ` · Lv.${progression.level}` : "";
                const rewardText = serverLaunch.levelUpReward
                    ? ` · 升级奖励 ${this.formatNumber(serverLaunch.levelUpReward.coin)} 金币 / ${serverLaunch.levelUpReward.diamond} 钻石`
                    : "";
                this._factoryMessage = `服务端发射完成：+${this.formatNumber(serverLaunch.coinGained)} 金币，-${this.formatNumber(serverLaunch.beanSpent)} 咖啡豆，净收益 ${this.formatRate(serverLaunch.netCoinPerSecond)}/秒${appearanceSource ? ` · ${appearanceSource.name}` : ""}${serverLaunch.experienceGained > 0 ? ` · 经验 +${serverLaunch.experienceGained}` : ""}${levelText}${rewardText}`;
            } else if (serverLaunch && !serverLaunch.accepted) {
                this._factoryMessage = serverLaunch.rejectedReason === "daily_launch_limit_reached"
                    ? "次数已用完 · 明日再来"
                    : `服务端发射被拒绝：${serverLaunch.rejectedReason ?? "launch_rejected"}`;
            } else if (NetworkManager.canUseServer) {
                this._factoryMessage = "服务端发射失败，请检查连接后重试";
            } else {
                const payload = ProductionManager.settle(10, "manual_launch");
                if (payload.coinGained > 0) {
                    DailyOrderManager.advanceOffline();
                    this._factoryMessage = `发射完成：+${this.formatNumber(payload.coinGained)} 金币，-${this.formatNumber(payload.beanSpent)} 咖啡豆`;
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

    private async claimQuickReward(): Promise<void> {
        this._factoryNoticeKind = "";
        const state = DailyOrderManager.getState();
        if (state.claimed) {
            this._factoryMessage = "今日订单宝箱已经领取";
        } else if (!state.claimable) {
            this._factoryMessage = `再完成 ${Math.max(0, state.target - state.progress)} 单即可领取宝箱`;
        } else if (NetworkManager.canUseServer) {
            this._factoryMessage = "正在向服务端领取订单宝箱...";
            this.renderDomFactoryOverlay();
            const result = await SyncManager.claimServerDailyOrder();
            if (result?.claimed) {
                const levelReward = result.levelUpReward;
                this._factoryMessage = `订单宝箱：+${result.order.rewardCoin} 金币，+${result.order.rewardResearchPoint} 研究点，经验 +${result.experienceGained}${levelReward ? ` · 升至 Lv.${levelReward.toLevel}，额外 ${this.formatNumber(levelReward.coin)} 金币 / ${levelReward.diamond} 钻石` : ""}`;
            } else if (result?.limitedReason === "already_claimed") {
                this._factoryMessage = "今日订单宝箱已经领取";
            } else if (result?.limitedReason === "order_not_complete") {
                this._factoryMessage = "服务端订单尚未达标";
            } else {
                this._factoryMessage = "订单宝箱领取失败，请稍后重试";
            }
        } else {
            const claimed = DailyOrderManager.claimOffline();
            if (claimed) {
                ResourceManager.add({
                    coin: claimed.rewardCoin,
                    researchPoint: claimed.rewardResearchPoint,
                }, "daily_order_claim_offline");
                this._factoryMessage = `订单宝箱：+${claimed.rewardCoin} 金币，+${claimed.rewardResearchPoint} 研究点`;
            } else {
                this._factoryMessage = "暂时没有可领取奖励";
            }
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
        const useDomPanels = typeof document !== "undefined";
        if (this.shopPanel) this.shopPanel.active = !useDomPanels && panelId === "shop";
        if (this.inventoryPanel) this.inventoryPanel.active = !useDomPanels && panelId === "inventory";
        if (this.researchPanel) this.researchPanel.active = !useDomPanels && panelId === "research";
        if (this.taskPanel) this.taskPanel.active = !useDomPanels && panelId === "tasks";
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
                this._friendAutoRefreshAt = Date.now() + 30000;
                void this.refreshServerFriendsForPanel();
                void this.refreshFriendRequestsForPanel();
                void this.refreshFriendActivitiesForPanel();
                void this.refreshServerLeaderboardForPanel();
            }
            if (panelId === "buildings") {
                void this.refreshServerDecorationsForPanel();
            }
            if (panelId === "shop") {
                void this.refreshServerDecorCatalogForPanel();
            }
            if (panelId === "settings") {
                void this.refreshServerStatusForPanel();
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
        overlay.addEventListener("keydown", this.onDomFactoryKeyDown);
        document.body.appendChild(overlay);
        this._domFactoryOverlay = overlay;
        return overlay;
    }

    private hideCocosCanvasForDomUi(): void {
        if (typeof document === "undefined") return;
        const canvas = document.querySelector<HTMLCanvasElement>("canvas");
        if (!canvas) return;
        if (!canvas.dataset.fatcatDomHidden) {
            this._cocosCanvasOpacity = canvas.style.opacity;
            canvas.dataset.fatcatDomHidden = "true";
        }
        canvas.style.opacity = "0";
    }

    private onDomFactoryPointerDown = (event: PointerEvent): void => {
        const target = event.target as HTMLElement | null;
        const button = target?.closest("[data-action]") as HTMLElement | null;
        if (!button) return;

        event.preventDefault();
        event.stopPropagation();
        this.handleDomFactoryAction(button);
    };

    private onDomFactoryKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const target = event.target as HTMLElement | null;
        const button = target?.closest("[data-action]") as HTMLElement | null;
        if (!button) return;

        event.preventDefault();
        event.stopPropagation();
        this.handleDomFactoryAction(button);
    };

    private handleDomFactoryAction(button: HTMLElement): void {
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
            void this.claimQuickReward();
        } else if (action === "launch") {
            this.handleLaunch();
            this.renderDomFactoryOverlay();
        } else if (action === "gift") {
            this.select("shop");
        } else if (action === "openBuildingFloor") {
            const buildingId = button.dataset.id || "";
            if (BuildingManager.getById(buildingId)) {
                this._selectedDomBuildingId = buildingId;
                this._buildingPanelMode = "detail";
                this.select("buildings");
            }
        }

        this.renderDomHudOverlay(true);
        this.renderDomNavOverlay(true);
        this.layoutDomHotspots();
    }

    private renderDomFactoryOverlay(): void {
        const overlay = this.ensureDomFactoryOverlay();
        if (!overlay) return;
        const snapshot = ProductionManager.calculateSnapshot();
        const friendBoost = FriendBoostManager.getState();
        const friendBoostHistory = FriendBoostManager.getHistory();
        const activeBoostSources = friendBoostHistory.entries
            .filter(entry => entry.active && entry.sourceName !== friendBoost.boostedByName)
            .slice(0, 3);
        const coopGoal = FriendCoopManager.getState();
        const dailyOrder = DailyOrderManager.getState();
        const dailyOrderPercent = Math.round(dailyOrder.progress / Math.max(1, dailyOrder.target) * 100);
        const dailyOrderStatus = dailyOrder.claimed
            ? "已领取"
            : dailyOrder.claimable
                ? "可领取"
                : `差${dailyOrder.target - dailyOrder.progress}单`;
        void this.refreshFriendRequestBadgeForFactory();
        const pendingFriendRequests = this.getPendingFriendRequestCount();
        const floors = MAIN_FACTORY_FLOORS.map(floor => ({
            ...floor,
            lv: BuildingManager.getLevel(floor.buildingId),
        }));
        overlay.innerHTML = `
            <div class="art-bg"></div><div class="sky"></div><div class="town"></div><div class="factory-illustration"></div><div class="roof-crates"></div><div class="roof-deck"></div>
            <div class="sign" data-main-zone="roof">肥猫咖啡<span class="paw-mark"></span></div><div class="sign-posts"></div><div class="chimney"></div><div class="roof-cat"><div class="cat-sprite"><i class="cat-face"></i></div></div><div class="flag">爪</div>
            <div class="side-pipe left"></div><div class="side-pipe right"></div><div class="ladder"></div><div class="elevator-panel"><i class="elevator-paw"></i><i class="elevator-floor-indicator"></i><div class="elevator-car"></div></div>
            <div class="building" data-main-zone="floors">
                ${floors.map((floor, index) => `
                    <div class="floor floor-scene-${floor.scene}">
                        <div class="floor-glow"></div><div class="room-lights"></div><div class="wall-details">${this.renderFactoryWallDetails(floor.scene)}</div><div class="room-decor decor-${floor.scene}">${this.renderFactoryRoomDecor(floor.scene)}</div><div class="room-foreground ${floor.scene}"></div>
                        <div class="props">${this.renderFactoryProps(floor.scene)}</div><div class="prop-asset prop-${floor.scene}" style="background-image:url('${this.getFactoryPropDataUri(floor.scene)}')"></div>
                        <div class="pipe"></div>
                        <div class="cat cat-${floor.scene} ${index % 3 === 0 ? "a" : index % 3 === 1 ? "b" : "c"}"><div class="cat-sprite"><i class="cat-face"></i></div></div>
                        <div class="worker-cats ${floor.scene}">${this.renderFactoryWorkerCats(floor.scene)}</div>
                        <button type="button" class="floor-card" data-action="openBuildingFloor" data-id="${floor.buildingId}" data-scene="${floor.scene}" data-floor-index="${index}" aria-label="打开${floor.no} ${floor.name}建筑详情"><div class="floor-no">${floor.no}</div><div class="floor-name">${floor.name}<span>Lv.${floor.lv}</span></div><div class="floor-medal">${floor.lv}</div></button>
                        <div class="cat-dots"><span class="cat-dot"></span><span class="cat-dot gray"></span><span class="cat-dot black"></span></div>
                        <div class="bonus" data-bonus-scene="${floor.scene}"><i class="bonus-icon ${this.getFloorBonusIconClass(floor.scene)}"></i><strong class="bonus-rate">${this.getFloorOutputText(floor.scene)}</strong><span class="bonus-label">${floor.bonus}</span><b class="bonus-value">${floor.value}</b></div>
                    </div>`).join("")}
            </div>
            <div class="left-tools" data-main-zone="left-tools"><button class="side-btn alert" data-action="tasks"><i class="ico-task asset" data-art-key="task-board" style="background-image:url('${this.getFeatureIconAsset("task")}')"></i>任务</button></div>
            <div class="right-tools" data-main-zone="right-tools"><button class="side-btn alert" data-action="achievement"><i class="ico-trophy asset" data-art-key="achievement-trophy-v2" style="background-image:url('${this.getFeatureIconAsset("achievement")}')"></i>成就</button><button class="side-btn alert" data-action="mail"><i class="ico-mail asset" data-art-key="mail-envelope-v2" style="background-image:url('${this.getFeatureIconAsset("mail")}')"></i>邮件</button><button class="side-btn" data-action="friend"><i class="ico-friend asset" data-art-key="friend-cat-v2" style="background-image:url('${this.getFeatureIconAsset("friend")}')"></i>好友</button><button class="side-btn" data-action="settings"><i class="ico-gear asset" data-art-key="settings-gear-v2" style="background-image:url('${this.getFeatureIconAsset("settings")}')"></i>设置</button></div>
            <div class="bottom-widgets" data-main-zone="operations">
                <button class="order" data-operation="order" data-action="order" data-daily-progress="${dailyOrder.progress}" data-daily-target="${dailyOrder.target}"><span class="order-icon"></span><span class="order-text">今日订单<b>${dailyOrder.progress}/${dailyOrder.target}</b></span><span class="bar"><i style="width:${dailyOrderPercent}%"></i></span></button>
                <button class="chest ${dailyOrder.claimable ? "ready" : ""} ${dailyOrder.claimed ? "claimed" : ""}" data-operation="chest" data-action="claim" data-daily-claimable="${dailyOrder.claimable}" data-daily-claimed="${dailyOrder.claimed}" ${dailyOrder.claimable ? "" : "disabled"}><span class="chest-art" style="background-image:url('${this.getFeatureIconAsset("rewardChest")}')"></span>${dailyOrderStatus}</button>
                <button class="launch ${dailyOrder.launchesRemaining <= 0 ? "exhausted" : ""}" data-operation="launch" data-action="launch" data-launches-used="${dailyOrder.launchesUsed}" data-launch-limit="${dailyOrder.launchLimit}" data-launches-remaining="${dailyOrder.launchesRemaining}" ${dailyOrder.launchesRemaining <= 0 ? "disabled" : ""}><span class="rocket-shape asset" style="background-image:url('${this.getFeatureIconAsset("launch")}')"></span>发射猫咪</button>
                <button class="gift" data-operation="gift" data-action="gift"><span class="gift-cat asset" style="background-image:url('${this.getCatFullArtAsset("c_005")}')"></span><span><b>超级猫粮礼包</b><br><em>03:25:15</em></span></button>
            </div>
            <div class="launch-count" data-launches-remaining="${dailyOrder.launchesRemaining}" data-launch-limit="${dailyOrder.launchLimit}">今日剩余次数：${dailyOrder.launchesRemaining}/${dailyOrder.launchLimit}</div>
            ${friendBoost.active ? `<div class="friend-boost-banner"><b>好友助力 +${friendBoost.boostPercent}%</b><span class="boost-latest">${friendBoost.boostedByName} · ${Math.max(1, Math.ceil(((friendBoost.boostEndsAt ?? Date.now()) - Date.now()) / 60000))}分钟</span>${activeBoostSources.length > 0 ? `<span class="boost-sources">${activeBoostSources.map(source => `<i>${source.sourceName} +${source.boostPercent}%</i>`).join("")}</span>` : ""}<em class="${coopGoal.claimable ? "ready" : ""}">协作 ${coopGoal.progress}/${coopGoal.target}</em></div>` : ""}
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
            data.rows = this._latestSocialEvent
                ? [
                    ["互动玩家", this._latestSocialEvent.actorCompanyName],
                    ["互动类型", this._latestSocialEvent.eventType === "friend_help" ? `生产助力 +${this._latestSocialEvent.boostPercent}%` : this._latestSocialEvent.eventType === "friend_gift" ? "送来礼物" : "访问工厂"],
                    [this._latestSocialEvent.eventType === "friend_help" ? "合作目标" : "发生时间", this._latestSocialEvent.eventType === "friend_help" ? `${this._latestSocialEvent.coopProgress}/${this._latestSocialEvent.coopTarget}${this._latestSocialEvent.coopClaimable ? " 可领取" : ""}` : this.formatFriendReportTime(this._latestSocialEvent.createdAt)],
                ]
                : [["待处理申请", `${pendingFriendRequests}`], ["已发送申请", `${sentFriendRequests}`], ["好友互动", "访问/送礼"]];
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
            if (success) this._selectedShopProductKey = `shop:${id}`;
        } else if (action === "buyDecor") {
            const purchase = await SyncManager.purchaseServerDecoration(id);
            if (purchase) {
                this.applyServerDecorState(purchase.decor);
                const catalogItem = this._serverDecorCatalog.find(item => item.decorId === id);
                if (catalogItem) catalogItem.owned = true;
                this._selectedShopProductKey = `decor:${id}`;
                this._serverDecorCollection = await SyncManager.fetchServerDecorCollection();
                success = true;
                actionMessageOverride = `${purchase.decor.name} 已收入装饰仓库，可前往建筑页面摆放。`;
            } else {
                actionMessageOverride = "购买失败：余额不足、商品已拥有或服务器未连接。";
            }
        } else if (action === "claimDecorCollection") {
            const claim = await SyncManager.claimServerDecorCollectionTier(id);
            if (claim) {
                this._serverDecorCollection = claim.collection;
                success = true;
                actionMessageOverride = `收藏奖励已领取：${this.getDecorCollectionRewardLabel(claim.rewardType, claim.rewardAmount)}。`;
            } else {
                actionMessageOverride = "领取失败：收藏数量不足、奖励已领取或服务器未连接。";
            }
        } else if (action === "use") {
            success = InventoryManager.useItem(id);
        } else if (action === "research") {
            const serverResearch = NetworkManager.canUseServer
                ? await SyncManager.unlockServerResearch(id)
                : null;
            if (serverResearch) {
                this._domPanelMessage = `研究同步完成：Lv.${serverResearch.previousLevel} → Lv.${serverResearch.level}，消耗 ${this.formatNumber(serverResearch.researchPointSpent)} 研究点。`;
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
        } else if (action === "toggleDecorPlacement") {
            const buildingId = button.dataset.building || this._selectedDomBuildingId;
            const current = this._serverDecorations.find(decor => decor.decorId === id);
            const updated = current
                ? await SyncManager.updateServerDecorPlacement(id, buildingId, !current.isPlaced)
                : null;
            if (updated) {
                this.applyServerDecorState(updated);
                success = true;
                actionMessageOverride = updated.isPlaced
                    ? `${updated.name} 已摆放到当前楼层。`
                    : `${updated.name} 已收回装饰仓库。`;
            } else {
                actionMessageOverride = NetworkManager.canUseServer
                    ? "装饰状态更新失败，请稍后重试。"
                    : "请先连接服务器再管理楼层装饰。";
            }
        } else if (action === "claimTask") {
            if (this.currentPanel === "achievements" && NetworkManager.canUseServer) {
                const result = await SyncManager.claimServerAchievement(id);
                success = !!result?.claimed;
                if (result?.claimed) {
                    const levelReward = result.levelUpReward;
                    actionMessageOverride = `成就奖励已领取：经验 +${result.experienceGained}，研究点 +${result.achievement.rewardResearchPoint}${levelReward ? `，升至 Lv.${levelReward.toLevel}，额外获得 ${this.formatNumber(levelReward.coin)} 金币、${levelReward.diamond} 钻石` : ""}`;
                } else if (result?.limitedReason === "already_claimed") {
                    actionMessageOverride = "该成就奖励已经领取。";
                } else if (result?.limitedReason === "achievement_not_complete") {
                    actionMessageOverride = "成就目标尚未完成。";
                } else {
                    actionMessageOverride = "成就领取失败，请稍后重试。";
                }
            } else {
                success = TaskManager.claimReward(id);
            }
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
        } else if (action === "refreshFriendProfile") {
            const friend = await this.refreshServerFriendProfile(id);
            success = !!friend;
            actionMessageOverride = friend
                ? `${friend.name} 的实时资料已同步。`
                : "好友资料同步失败，请检查网络连接。";
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
                    timeline: [
                        serverFriend.rewarded ? `金币 +${this.formatNumber(serverFriend.rewardCoin)}` : "今日访问奖励已领取",
                        `好友收益 ${this.formatNumber(serverFriend.friend.incomePerSecond)}/秒`,
                        `访问记录 ${serverFriend.friend.lastVisitedAt ? this.formatFriendReportTime(serverFriend.friend.lastVisitedAt) : "刚刚"}`,
                    ],
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
                    timeline: [
                        "本地预览 +62 金币",
                        "联网后可领取真实访问奖励",
                        "访问场景已打开",
                    ],
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
                    timeline: [
                        serverFriend.rewarded ? `猫粮 +${this.formatNumber(serverFriend.rewardCatFood)}` : "今日礼物奖励已领取",
                        `礼物目标 ${serverFriend.friend.name}`,
                        `送礼记录 ${serverFriend.friend.lastGiftAt ? this.formatFriendReportTime(serverFriend.friend.lastGiftAt) : "刚刚"}`,
                    ],
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
                    timeline: [
                        "本地预览 +12 猫粮",
                        "联网后可同步真实礼物",
                        "礼物状态已写入本地",
                    ],
                };
                success = true;
            }
        } else if (action === "helpFriend") {
            this._selectedFriendSnapshotId = id;
            this._friendVisitSceneId = id;
            const response = NetworkManager.canUseServer
                ? await SyncManager.helpServerFriend(id)
                : null;
            if (response) {
                this.applyServerFriendSnapshot(response.friend);
                this._friendVisitReport = {
                    friendId: id,
                    kind: "help",
                    rewardText: response.applied ? `生产 +${response.boost.boostPercent}%` : "今日已助力",
                    statusText: response.applied
                        ? `助力生效 30 分钟`
                        : response.limitedReason === "real_friend_required" ? "仅真实玩家好友可助力" : "今日助力次数已使用",
                    updatedAt: Date.now(),
                    timeline: [
                        response.applied ? `生产效率 +${response.boost.boostPercent}%` : "助力未重复生效",
                        response.applied ? `持续到 ${this.formatFriendReportTime(response.boost.boostEndsAt ?? Date.now())}` : response.limitedReason === "real_friend_required" ? "需要真实玩家好友" : "今日已助力过该好友",
                        `协作进度 ${FriendCoopManager.getState().progress}/${FriendCoopManager.getState().target}`,
                    ],
                };
                this._domPanelMessage = response.applied
                    ? `好友助力成功：对方生产效率 +${response.boost.boostPercent}%。`
                    : "好友助力未生效：今日已助力或目标不是玩家好友。";
                void this.refreshFriendActivitiesForPanel();
                success = true;
            } else {
                this._domPanelMessage = NetworkManager.canUseServer
                    ? "好友助力失败，请检查网络连接。"
                    : "好友助力需要连接服务器。";
            }
        } else if (action === "claimFriendCoopGoal") {
            const response = await SyncManager.claimServerFriendCoopGoal();
            success = response?.claimed === true;
            actionMessageOverride = success
                ? `协作奖励已领取：+${response?.rewardDiamond ?? 0} 钻石。`
                : response?.limitedReason === "already_claimed" ? "今日协作奖励已经领取。" : "再获得好友助力即可领取奖励。";
        } else if (action === "claimFriendCoopTier") {
            const response = await SyncManager.claimServerFriendCoopTier(id);
            success = response?.claimed === true;
            actionMessageOverride = success
                ? `协作档位奖励已领取：${formatFriendCoopRewardLabel(response?.rewardType ?? "", response?.rewardAmount ?? 0, value => this.formatNumber(value))}。`
                : response?.limitedReason === "already_claimed" ? "这个协作档位今天已经领取。" : "当前助力次数尚未达到该档位。";
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
        } else if (action === "refreshServerStatus") {
            const status = await SyncManager.fetchServerStatus();
            success = !!status;
            if (status) {
                this._domPanelMessage = `服务器状态已刷新：${status.apiVersion} / ${status.configVersion}`;
            }
        } else if (action === "syncSave") {
            success = await SyncManager.syncSave();
        } else if (action === "pushSettings") {
            success = !!await SyncManager.pushServerSettings(this.ensureFeatureState().settings);
        } else if (action === "previewProduction") {
            const preview = await SyncManager.previewProduction();
            success = !!preview;
            if (preview) {
                const appearanceSource = preview.modifierSources?.find(source => source.sourceType === "factory_appearance");
                this._domPanelMessage = `服务端结算预览：净收益 ${this.formatRate(preview.netCoinPerSecond)} 金币/秒，工资 ${this.formatRate(preview.wageCostPerSecond)} 金币/秒${appearanceSource ? `；${appearanceSource.name}收益 +${appearanceSource.grossCoinPercent}%` : ""}。`;
            }
        } else if (action === "selectBuilding") {
            this._selectedDomBuildingId = id;
            success = true;
        } else if (action === "openFactoryAppearance") {
            this._buildingPanelMode = "appearance";
            if (NetworkManager.canUseServer && !FactoryAppearanceManager.getServerState()) {
                await SyncManager.fetchServerFactoryAppearanceState();
            }
            this._selectedFactoryAppearanceId = this.getActiveFactoryAppearanceId();
            success = true;
        } else if (action === "closeFactoryAppearance") {
            this._buildingPanelMode = "detail";
            success = true;
        } else if (action === "selectFactoryAppearance") {
            const appearance = FACTORY_APPEARANCES.find(item => item.id === id);
            if (appearance) {
                this._selectedFactoryAppearanceId = appearance.id;
                success = true;
            }
        } else if (action === "applyFactoryAppearance") {
            const appearance = FACTORY_APPEARANCES.find(item => item.id === id);
            const serverState = FactoryAppearanceManager.getServerState();
            if (appearance && NetworkManager.canUseServer && serverState) {
                success = !!await SyncManager.equipServerFactoryAppearance(appearance.id);
                if (success) {
                    this._selectedFactoryAppearanceId = appearance.id;
                } else {
                    actionMessageOverride = `${appearance.name}启用失败，请检查联网状态与所有权。`;
                }
            } else if (appearance?.unlocked) {
                SaveManager.update(data => {
                    data.featureState.factoryAppearanceId = appearance.id;
                });
                this._selectedFactoryAppearanceId = appearance.id;
                success = true;
            } else {
                actionMessageOverride = appearance ? `${appearance.name}尚未解锁。` : "工厂外观不存在。";
            }
        } else if (action === "unlockFactoryAppearance") {
            const appearance = FACTORY_APPEARANCES.find(item => item.id === id);
            if (appearance && NetworkManager.canUseServer) {
                success = !!await SyncManager.unlockServerFactoryAppearance(appearance.id);
                if (success) {
                    this._selectedFactoryAppearanceId = appearance.id;
                } else {
                    actionMessageOverride = `${appearance.name}尚未达到解锁条件。`;
                }
            } else {
                actionMessageOverride = "连接服务器后可验证等级并解锁外观。";
            }
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
                this._selectedShopProductKey = this.getDefaultShopProductSelection(tab);
                success = true;
                if (tab === "deco") void this.refreshServerDecorCatalogForPanel();
            }
        } else if (action === "selectShopProduct") {
            const detail = this.getShopProductDetail(id);
            if (detail && detail.category === this._domShopTab) {
                this._selectedShopProductKey = id;
                success = true;
            }
        } else if (action === "inventoryTab") {
            const tab = button.dataset.tab as InventoryTabId | undefined;
            if (tab) {
                this._domInventoryTab = tab;
                this._selectedInventoryKey = this.getDefaultInventorySelection(tab);
                success = true;
            }
        } else if (action === "selectInventory") {
            this._selectedInventoryKey = id;
            success = !!this.getInventoryDetail(id);
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
        overlay.dataset.panelId = panelId;
        overlay.dataset.panelMode = panelId === "buildings" ? this._buildingPanelMode : "";

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
        const closeText = panelId === "buildings" && this._buildingPanelMode === "detail" ? "←" : "×";
        const closeLabel = closeText === "←" ? "返回工厂" : "关闭";
        overlay.innerHTML = `${body ? `<button class="panel-close" data-action="panelClose" aria-label="${closeLabel}">${closeText}</button>` : ""}${body}${this.renderDomMessage()}`;
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
            if (action === "refreshFriendProfile") return "好友实时资料已同步。";
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
            if (action === "openFactoryAppearance") return "工厂外观预览已打开。";
            if (action === "closeFactoryAppearance") return "已返回建筑详情。";
            if (action === "selectFactoryAppearance") return "工厂外观预览已切换。";
            if (action === "applyFactoryAppearance") return "工厂外观已启用。";
            if (action === "assignCat") return "猫咪已派遣到当前楼层。";
            if (action === "unassignCat") return "猫咪已撤下，等待重新排班。";
            if (action === "shopTab") return "商店分类已切换。";
            if (action === "selectShopProduct") return "商品详情已切换。";
            if (action === "inventoryTab") return "背包分类已切换。";
            if (action === "selectInventory") return "背包物品详情已切换。";
            if (action === "selectResearch") return "研究详情已切换。";
        }
        if (action === "buy") return "购买失败：余额不足或今日限购已用完。";
        if (action === "use") return "使用失败：物品数量不足。";
        if (action === "research") return "研究失败：研究点不足或前置未解锁。";
        if (action === "upgradeBuilding") return "升级失败：金币不足或已达最高等级。";
        if (action === "claimTask") return "任务未完成或奖励已领取。";
        if (action === "claimMail") return "邮件奖励领取失败。";
        if (action === "refreshFriendProfile") return "好友资料同步失败：请检查服务器连接。";
        if (action === "connectServer") return "连接服务器失败：请检查 apiBaseUrl 或本地服务端。";
        if (action === "syncSave") return "同步失败：尚未连接服务器或服务端拒绝。";
        if (action === "pushSettings") return "设置推送失败：尚未连接服务器。";
        if (action === "previewProduction") return "结算预览失败：请先连接服务器。";
        if (action === "assignCat") return "派遣失败：猫咪未招募或楼层容量不足。";
        if (action === "unassignCat") return "撤下失败：猫咪未招募。";
        if (action === "selectInventory") return "背包物品不存在。";
        if (action === "selectFactoryAppearance") return "工厂外观不存在。";
        if (action === "applyFactoryAppearance") return "工厂外观尚未解锁。";
        if (action === "selectShopProduct") return "商品不存在或不属于当前分类。";
        if (action === "selectResearch") return "研究节点不存在。";
        return "操作未完成。";
    }

    private renderAchievementPanel(): string {
        const serverAchievements = SyncManager.getServerAchievements();
        const usesServerAuthority = serverAchievements.length > 0;
        const localAchievements = TaskManager.getActiveTasks().filter(({ config }) => config.type === TaskType.ACHIEVEMENT);
        const unlockedCats = usesServerAuthority
            ? serverAchievements.find(achievement => achievement.goalType === "unlock_cat")?.progress ?? 0
            : CatManager.getAllConfigs().filter(config => CatManager.getCatData(config.id).isUnlocked).length;
        const totalCats = CatManager.getAllConfigs().length;
        const totalTasks = usesServerAuthority ? serverAchievements.length : localAchievements.length;
        const claimable = usesServerAuthority
            ? serverAchievements.filter(achievement => achievement.claimable).length
            : localAchievements.filter(({ config, data }) => data.currentValue >= config.goalValue && !data.isClaimed).length;
        const rows = usesServerAuthority
            ? serverAchievements.map(achievement => this.renderFeatureProgressCard(
                "achievement",
                achievement.name,
                achievement.description,
                achievement.progress,
                achievement.target,
                `经验 ${achievement.rewardExperience} · 研究点 ${achievement.rewardResearchPoint}${achievement.rewardCoin > 0 ? ` · 金币 ${this.formatNumber(achievement.rewardCoin)}` : ""}${achievement.rewardDiamond > 0 ? ` · 钻石 ${achievement.rewardDiamond}` : ""}`,
                achievement.claimable
                    ? `<button class="tag" data-action="claimTask" data-id="${achievement.id}">领取</button>`
                    : `<span class="tag ${achievement.claimed ? "" : "warn"}">${achievement.claimed ? "已领取" : "进行中"}</span>`
            )).join("")
            : localAchievements.length > 0
                ? localAchievements.map(({ config, data }) => this.renderFeatureProgressCard(
                "achievement",
                config.name,
                config.description,
                data.currentValue,
                config.goalValue,
                this.formatTaskReward(config.rewards),
                data.currentValue >= config.goalValue && !data.isClaimed ? `<button class="tag" data-action="claimTask" data-id="${config.id}">领取</button>` : `<span class="tag ${data.isClaimed ? "" : "warn"}">${data.isClaimed ? "已领取" : "进行中"}</span>`
                )).join("")
                : `<div class="feature-card">成就墙正在扩建，后续会加入更多长期目标。</div>`;
        return `<div class="panel-shell utility-shell achievement-shell" data-achievement-authority="${usesServerAuthority ? "server" : "offline"}" data-achievement-count="${totalTasks}" data-achievement-claimable="${claimable}"><h2>成就墙</h2><div class="feature-hero"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset("achievement")}')"></span><div><b>肥猫咖啡荣誉室</b><br>记录长期目标、收集进度和可领取奖励。</div><span class="feature-badge">可领取<br>${claimable}</span></div><div class="feature-mini"><span>猫咪收集<b>${unlockedCats}/${totalCats}</b></span><span>成就总数<b>${totalTasks}</b></span><span>钻石库存<b>${this.formatNumber(ResourceManager.get("diamond"))}</b></span></div><div class="feature-list">${rows}</div></div>`;
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
        const coopGoal = FriendCoopManager.getState();
        const boostHistory = FriendBoostManager.getHistory();
        const sourceLabelNew = this._serverFriends.length > 0 ? "服务端快照" : "本地预览";
        const networkNew = NetworkManager.getStatus();
        const playerIdNew = networkNew.playerId ? networkNew.playerId.replace(/-/g, "") : "未连接";
        const playerHintNew = playerIdNew === "未连接" ? playerIdNew : `${playerIdNew.slice(0, 8)}...${playerIdNew.slice(-6)}`;
        const friendToolsNew = `<div class="friend-tools"><span>我的ID：${playerHintNew}</span><button class="tag" data-action="sendFriendRequest">发送申请</button><button class="tag warn" data-action="addFriend">直接添加</button></div>`;
        const maxIncome = Math.max(1, ...friends.map(friend => friend.income));
        const coopGoalCard = renderFriendCoopGoalCard({
            progress: coopGoal.progress,
            target: coopGoal.target,
            tiers: coopGoal.tiers.map(tier => ({
                tierId: tier.tierId,
                target: tier.target,
                rewardText: formatFriendCoopRewardLabel(tier.rewardType, tier.rewardAmount, value => this.formatNumber(value)),
                claimable: tier.claimable,
                claimed: tier.claimed,
            })),
        });
        const boostHistoryCard = renderFriendBoostHistoryCard({
            activeBoostPercent: boostHistory.activeBoostPercent,
            maxBoostPercent: boostHistory.maxBoostPercent,
            activeContributionCount: boostHistory.activeContributionCount,
            entries: boostHistory.entries.map(entry => {
                const minutes = Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / 60000));
                return {
                    sourceName: entry.sourceName,
                    timeText: this.formatFriendReportTime(entry.createdAt),
                    stateText: entry.active ? `剩余 ${minutes} 分钟` : "已结束",
                    boostPercent: entry.boostPercent,
                    active: entry.active,
                };
            }),
        });
        if (!friends.some(friend => friend.id === this._selectedFriendSnapshotId)) {
            this._selectedFriendSnapshotId = friends[0]?.id ?? "";
        }
        const friendList = renderFriendListCards(friends.map((friend, index) => {
            const lastVisit = this.getFeatureTimestamp("friendVisits", friend.id);
            const lastGift = this.getFeatureTimestamp("friendGifts", friend.id);
            const lastHelp = friend.lastHelpAt ? this.formatFriendReportTime(friend.lastHelpAt) : "";
            const width = Math.max(8, Math.min(100, Math.floor(friend.income / maxIncome * 100)));
            return {
                id: friend.id,
                rank: index + 1,
                name: friend.name,
                level: friend.level,
                incomeText: `${this.formatNumber(friend.income)}/秒`,
                profileMarkup: renderFriendProfileMeta(this.getFriendProfileMetaView(friend)),
                incomePercent: width,
                statusText: friend.status,
                visitText: lastVisit ? `访问 ${lastVisit}` : "待访问",
                giftText: lastGift ? `送礼 ${lastGift}` : "可送礼",
                helpText: lastHelp ? `助力 ${lastHelp}` : friend.profile?.isRealPlayer ? "可助力" : "玩家好友限定",
                giftActionText: lastGift ? "再次送礼" : "赠送猫粮",
                helpActionText: lastHelp ? "今日已助力" : "生产助力",
                canHelp: !!friend.profile?.isRealPlayer,
            };
        }));
        return `<div class="panel-shell utility-shell friends-shell"><h2>好友</h2><div class="feature-hero"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset("friend")}')"></span><div><b>好友工厂</b><br>${sourceLabelNew}：访问、送礼和好友申请会同步到 .NET 服务端。</div><span class="feature-badge ${pendingRequests > 0 ? "alert" : ""}">申请<br>${pendingRequests}</span></div>${friendToolsNew}${this.renderFriendSearchCard()}<div class="feature-mini"><span>好友<b>${friends.length}</b></span><span>待处理<b>${pendingRequests}</b></span><span>已发送<b>${sentPending}</b></span></div>${coopGoalCard}${boostHistoryCard}${this.renderFriendVisitScene(friends)}${this.renderFriendVisitReport(friends)}${this.renderFriendFactoryDetail(friends)}${this.renderFriendSnapshotCard(friends, maxIncome)}${friendList}${this.renderFriendRequestPreview()}${this.renderLeaderboardPreview()}${this.renderFriendActivityPreview()}</div>`;
    }

    private renderFriendSnapshotCard(friends: FriendPanelRow[], maxIncome: number): string {
        const selected = friends.find(friend => friend.id === this._selectedFriendSnapshotId) ?? friends[0];
        if (!selected) return "";
        const lastVisit = this.getFeatureTimestamp("friendVisits", selected.id) || "未访问";
        const lastGift = this.getFeatureTimestamp("friendGifts", selected.id) || "未送礼";
        const width = Math.max(8, Math.min(100, Math.floor(selected.income / Math.max(1, maxIncome) * 100)));
        const rewardPreview = Math.max(50, Math.floor(selected.income * 0.12));
        return renderFriendSnapshotCardMarkup({
            friendId: selected.id,
            friendName: selected.name,
            friendLevel: selected.level,
            friendIncomeText: `${this.formatNumber(selected.income)}/秒`,
            friendStatus: selected.status,
            profileMarkup: renderFriendProfileMeta(this.getFriendProfileMetaView(selected)),
            canHelp: !!selected.profile?.isRealPlayer,
            incomePercent: width,
            rewardText: `+${this.formatNumber(rewardPreview)}金币`,
            lastVisitText: lastVisit,
            lastGiftText: lastGift,
            rooms: this.getFriendFactoryRoomViews(selected),
        });
    }

    private renderFriendVisitReport(friends: FriendPanelRow[]): string {
        const report = this._friendVisitReport;
        if (!report) return "";
        const friend = friends.find(item => item.id === report.friendId);
        if (!friend) return "";
        const friendIncomeText = `${this.formatNumber(friend.income)}/秒`;
        return renderFriendVisitReportCard({
            friendId: friend.id,
            friendName: friend.name,
            kind: report.kind,
            rewardText: report.rewardText,
            statusText: report.statusText,
            updatedTimeText: this.formatFriendReportTime(report.updatedAt),
            friendIncomeText,
            canHelp: !!friend.profile?.isRealPlayer,
            timeline: report.timeline,
            floors: this.getFriendRoomRows(friend).slice(0, 3).map(room => ({
                floor: room.floor,
                productionText: `${this.formatNumber(room.production)}/秒`,
            })),
        });
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
        return renderFriendFactoryDetailCard({
            friendId: friend.id,
            friendName: friend.name,
            friendLevel: friend.level,
            friendIncomeText: `${this.formatNumber(friend.income)}/秒`,
            friendStatus: friend.status,
            profileMarkup: renderFriendProfileMeta(this.getFriendProfileMetaView(friend)),
            canHelp: !!friend.profile?.isRealPlayer,
            sourceText: source,
            topFloorText: topRoom?.floor ?? "--",
            staffedRoomsText: `${staffedRooms}/${rooms.length}`,
            decorTotalText: this.formatNumber(decorTotal),
            rooms: this.getFriendFactoryRoomViews(friend),
        });
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
        return renderFriendVisitSceneCard({
            friendId: friend.id,
            friendName: friend.name,
            friendLevel: friend.level,
            friendIncomeText: `${this.formatNumber(friend.income)}/秒`,
            friendStatus: friend.status,
            profileMarkup: renderFriendProfileMeta(this.getFriendProfileMetaView(friend)),
            canHelp: !!friend.profile?.isRealPlayer,
            backdropArt: this.getDomAssetDataUri(GeneratedBackgroundAssets.friendFactoryVisit),
            mascotArt: this.getCatFullArtAsset("c_001"),
            roomTotalText: `${this.formatNumber(roomTotal)}/秒`,
            topFloorText: topRoom?.floor ?? "--",
            staffedRoomsText: `${staffedRooms}/${rooms.length}`,
            decorTotalText: this.formatNumber(decorTotal),
            rewardText: `+${this.formatNumber(rewardPreview)} 金币`,
            lastVisitText: lastVisit,
            lastGiftText: lastGift,
            rooms: this.getFriendFactoryRoomViews(friend, true),
        });
    }

    private getFriendProfileMetaView(friend: FriendPanelRow): FriendProfileMetaView {
        const profile = friend.profile;
        if (!profile) {
            return {
                isRealPlayer: false,
                presenceStatus: "system",
                presenceText: "常驻",
                details: ["本地数据"],
            };
        }
        const presenceStatus = profile.isRealPlayer
            ? this.getFriendPresenceStatus(profile)
            : "system";
        const presenceLabels = {
            online: "在线",
            recent: "最近活跃",
            offline: "离线",
            system: "系统好友",
        };
        const invite = profile.inviteCode || "无邀请码";
        return {
            isRealPlayer: profile.isRealPlayer,
            presenceStatus,
            presenceText: presenceLabels[presenceStatus],
            details: [`猫 ${profile.unlockedCatCount}`, `建筑 Lv.${profile.totalBuildingLevel}`, invite],
        };
    }

    private getFriendPresenceStatus(profile: FriendProfileDto): "online" | "recent" | "offline" | "system" {
        if (!profile.isRealPlayer) return "system";
        if (profile.presenceStatus) return profile.presenceStatus;
        if (!profile.lastActiveAt) return "offline";
        const age = Date.now() - profile.lastActiveAt;
        if (age <= 120000) return "online";
        return age <= 1800000 ? "recent" : "offline";
    }

    private getFriendFactoryRoomViews(friend: FriendPanelRow, includeArt = false): FriendFactoryRoomView[] {
        return this.getFriendRoomRows(friend).map((room, roomIndex) => {
            const catCount = Math.max(1, Math.min(3, room.assignedCatCount || 1));
            return {
                floor: room.floor,
                name: room.name,
                level: room.level,
                productionText: `${this.formatNumber(room.production)}/秒`,
                assignedCatCount: room.assignedCatCount,
                featuredCatName: room.featuredCatName,
                decorScore: room.decorScore,
                decorations: room.decorations.map(decor => ({ name: decor.name, score: decor.score })),
                roomArt: includeArt ? this.getFactoryPropDataUri(room.scene) : undefined,
                catArt: includeArt
                    ? Array.from({ length: catCount }, (_, catIndex) => {
                        const catId = `c_00${((catIndex + roomIndex) % 5) + 1}`;
                        return this.getCatFullArtAsset(catId);
                    })
                    : undefined,
            };
        });
    }

    private getFriendRoomRows(friend: FriendPanelRow): Array<{ floor: string; name: string; level: number; production: number; assignedCatCount: number; featuredCatName: string; decorScore: number; decorations: Array<{ decorId: string; name: string; score: number; isPlaced: boolean }>; scene: string }> {
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
                    decorations: (room.decorations ?? []).filter(decor => decor.isPlaced).map(decor => ({
                        decorId: decor.decorId,
                        name: decor.name,
                        score: Math.max(0, Math.floor(decor.score)),
                        isPlaced: decor.isPlaced,
                    })),
                    scene: this.getFriendRoomScene(room.buildingId, room.floor, room.name),
                }))
            : [];
        if (rooms.length > 0) return rooms;
        return [
            { floor: "3F", name: "发酵车间", level: Math.max(1, Math.floor(friend.level / 3)), production: Math.max(1, Math.floor(friend.income * 0.34)), assignedCatCount: 2, featuredCatName: "巡逻肥猫", decorScore: 62, decorations: [{ decorId: "decor_ferment_gauge", name: "发酵温度计", score: 34, isPlaced: true }, { decorId: "decor_ferment_plate", name: "管道铭牌", score: 28, isPlaced: true }], scene: "tank" },
            { floor: "2F", name: "原料车间", level: Math.max(1, Math.floor(friend.level / 3)), production: Math.max(1, Math.floor(friend.income * 0.28)), assignedCatCount: 1, featuredCatName: "搬豆肥猫", decorScore: 70, decorations: [{ decorId: "decor_material_mill", name: "黄铜磨豆机", score: 40, isPlaced: true }, { decorId: "decor_material_crates", name: "原料木箱", score: 30, isPlaced: true }], scene: "mill" },
            { floor: "1F", name: "咖啡厅", level: Math.max(1, Math.floor(friend.level / 3)), production: Math.max(1, Math.floor(friend.income * 0.22)), assignedCatCount: 3, featuredCatName: "招待肥猫", decorScore: 76, decorations: [{ decorId: "decor_cafe_sign", name: "猫爪招牌", score: 42, isPlaced: true }, { decorId: "decor_cafe_cup", name: "幸运咖啡杯", score: 34, isPlaced: true }], scene: "cafe" },
        ];
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
        return renderFriendSearchCard({
            query: this._friendSearchQuery,
            message: this._friendSearchMessage,
            preview: preview ? {
                companyName: preview.companyName,
                detailText: `Lv.${preview.level} · ${this.formatNumber(preview.incomePerSecond)}/秒 · ${preview.inviteCode}`,
                isSelf: preview.isSelf,
                isFriend: preview.isFriend,
            } : null,
        });
    }

    private renderFriendRequestPreview(): string {
        const received = this._receivedFriendRequests.filter(request => request.status === "pending").slice(0, 4);
        const sent = this._sentFriendRequests.filter(request => request.status === "pending").slice(0, 3);
        return renderFriendRequestCard({
            received: received.map(request => ({
                id: request.id,
                companyName: request.companyName,
                detailText: `Lv.${request.level} · ${this.formatNumber(request.incomePerSecond)}/秒`,
            })),
            sent: sent.map(request => ({ companyName: request.companyName })),
        });
    }

    private getFriendPanelRows(): FriendPanelRow[] {
        if (this._serverFriends.length > 0) {
            return this._serverFriends.map(friend => ({
                id: friend.id,
                name: friend.name,
                level: friend.level,
                income: friend.incomePerSecond,
                status: "在线数据",
                profile: friend.profile,
                rooms: friend.rooms,
                lastHelpAt: friend.lastHelpAt,
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

    private async refreshServerDecorationsForPanel(): Promise<void> {
        if (!NetworkManager.canUseServer || this._decorRefreshInFlight) return;
        this._decorRefreshInFlight = true;
        try {
            const decorations = await SyncManager.fetchServerDecorations();
            if (decorations.length <= 0 || this.currentPanel !== "buildings") return;
            this._serverDecorations = decorations;
            this.renderDomPanel("buildings");
        } finally {
            this._decorRefreshInFlight = false;
        }
    }

    private async refreshServerDecorCatalogForPanel(): Promise<void> {
        if (!NetworkManager.canUseServer || this._decorCatalogRefreshInFlight) return;
        this._decorCatalogRefreshInFlight = true;
        try {
            const [catalog, collection] = await Promise.all([
                SyncManager.fetchServerDecorCatalog(),
                SyncManager.fetchServerDecorCollection(),
            ]);
            if (catalog.length <= 0 || this.currentPanel !== "shop") return;
            this._serverDecorCatalog = catalog;
            this._serverDecorCollection = collection;
            if (this._domShopTab === "deco" && !catalog.some(item => `decor:${item.decorId}` === this._selectedShopProductKey)) {
                this._selectedShopProductKey = `decor:${catalog[0].decorId}`;
            }
            this.renderDomPanel("shop");
        } finally {
            this._decorCatalogRefreshInFlight = false;
        }
    }

    private applyServerDecorState(decor: DecorStateDto): void {
        const index = this._serverDecorations.findIndex(item => item.decorId === decor.decorId);
        if (index >= 0) {
            this._serverDecorations[index] = decor;
        } else {
            this._serverDecorations.push(decor);
        }
    }

    private tickSocialPresence(): void {
        if (!NetworkManager.canUseServer || !NetworkManager.playerId) return;
        const now = Date.now();
        if (!this._presenceHeartbeatInFlight && now >= this._presenceHeartbeatAt) {
            this._presenceHeartbeatAt = now + 45000;
            this._presenceHeartbeatInFlight = true;
            void SyncManager.touchServerPresence().finally(() => {
                this._presenceHeartbeatInFlight = false;
            });
        }
        if (this.currentPanel === "friends" && now >= this._friendAutoRefreshAt) {
            this._friendAutoRefreshAt = now + 30000;
            void this.refreshServerFriendsForPanel();
        }
    }

    private async refreshServerFriendProfile(friendId: string): Promise<FriendDto | null> {
        if (!NetworkManager.canUseServer || this._friendProfileRefreshInFlight || !friendId) return null;
        this._friendProfileRefreshInFlight = true;
        try {
            const friend = await SyncManager.fetchServerFriend(friendId);
            if (!friend) return null;
            this.applyServerFriendSnapshot(friend, false);
            return friend;
        } finally {
            this._friendProfileRefreshInFlight = false;
        }
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

    private async refreshServerStatusForPanel(): Promise<void> {
        const status = await SyncManager.fetchServerStatus();
        if (!status || this.currentPanel !== "settings") return;
        this.renderDomPanel("settings");
    }

    private renderLeaderboardPreview(): string {
        const leaderboard = this._serverLeaderboard;
        const entries = leaderboard?.entries?.slice(0, 5) ?? [];
        const selfRank = leaderboard?.self?.rank ? `#${leaderboard.self.rank}` : "未上榜";
        return renderFriendLeaderboardCard({
            selfRankText: selfRank,
            entries: entries.map(entry => ({
                rank: entry.rank,
                companyName: entry.companyName,
                scoreText: `${this.formatNumber(entry.score)}/秒`,
                isSelf: entry.isSelf,
            })),
        });
    }

    private renderFriendActivityPreview(): string {
        return renderFriendActivityCard({
            total: this._friendActivities.length,
            entries: this._friendActivities.slice(0, 6).map(activity => ({
                label: this.getFriendActivityLabel(activity.activityType),
                friendName: activity.friendName,
                timeText: this.formatActivityTime(activity.createdAt),
            })),
        });
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
        const serverStatus = SyncManager.getServerStatus();
        const serverLabel = this.getNetworkModeLabel(network.serverMode);
        const syncLabel = this.getSyncModeLabel(sync.mode);
        const settings = SETTINGS_PANEL_ITEMS.map(item => ({ ...item, on: this.getSettingValue(item.id) }));
        const rows = settings.map(item => `<div class="feature-card setting-row"><div><b>${item.name}</b><br>${item.desc}</div><button class="toggle-pill ${item.on ? "" : "off"}" data-action="toggleSetting" data-id="${item.id}">${item.on ? "开启" : "关闭"}</button></div>`).join("");
        const accountCard = renderSettingsAccountCard({
            apiBase,
            playerId,
            networkMode: serverLabel,
            syncMode: syncLabel,
            pendingChanges: sync.pendingFeatureChanges,
            lastError: sync.lastError || network.lastError || "",
            connected: NetworkManager.canUseServer,
        });
        return `<div class="panel-shell utility-shell settings-shell"><h2>设置</h2><div class="feature-hero"><span class="feature-icon" style="background-image:url('${this.getFeatureIconAsset("settings")}')"></span><div><b>公司设置</b><br>当前支持本地离线和 .NET Core 服务端联调。URL 可用 ?api=http://localhost:5144 临时指定。</div><span class="feature-badge">存档<br>${created}</span></div><div class="feature-mini"><span>服务器<b>${serverLabel}</b></span><span>同步<b>${syncLabel}</b></span><span>待同步<b>${sync.pendingFeatureChanges}</b></span></div><div class="feature-list">${renderServerStatusCard(serverStatus.status, serverStatus.checkedAt)}${accountCard}${rows}</div></div>`;
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
        if (this._buildingPanelMode === "appearance") {
            return this.renderFactoryAppearancePanel();
        }
        const buildings = BuildingManager.getAll().slice().reverse();
        if (!BuildingManager.getById(this._selectedDomBuildingId)) {
            this._selectedDomBuildingId = buildings[buildings.length - 1]?.id ?? "building_cafe_1f";
        }
        const selected = BuildingManager.getById(this._selectedDomBuildingId) ?? buildings[0];
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
        const conditions = `<div class="building-conditions" data-feature-zone="conditions"><b>升级条件</b><div><span>${this.renderCssIcon("deco")}工厂等级达到${levelRequirement}级</span><strong class="${28 >= levelRequirement ? "ok" : "bad"}">${Math.min(28, levelRequirement)}/${levelRequirement}</strong></div><div><span>${this.renderCssIcon("coin")}消耗金币</span><strong class="${ownedCoin >= selected.upgradeCost ? "ok" : "bad"}">${this.formatNumber(ownedCoin)}/${this.formatNumber(selected.upgradeCost)}</strong></div><div><span>${this.renderCssIcon("bean")}咖啡豆储备</span><strong class="ok">${this.formatNumber(ResourceManager.get("bean"))}/2.5K</strong></div></div>`;
        return `<div class="panel-shell building-shell feature-detail-shell" data-feature-page="buildings"><h2 class="feature-page-title" data-feature-zone="title">建筑详情</h2><div class="building-panel-tools" data-feature-zone="toolbar"><span>楼层管理</span><button data-action="openFactoryAppearance">工厂外观</button></div><div class="building-selector" data-feature-zone="floor-selector">${selector}</div><div class="building-detail-hero" data-feature-zone="hero" data-building-id="${selected.id}" data-building-scene="${scene}" style="background-image:linear-gradient(rgba(34,22,15,.04),rgba(34,22,15,.14)),url('${getBuildingRoomAsset(scene)}')"><span class="building-floor-tag">${selected.floor}<small>Lv.${selected.level}</small></span><div class="building-hero-copy"><b>${selected.name}</b><span>Lv.${selected.level}</span><em>生产建筑</em></div></div><div class="building-description" data-feature-zone="description">${selected.description}</div>${this.renderBuildingDecorManager(selected.id)}<div class="building-target-effects" data-feature-zone="effects"><div class="building-target-title"><b>等级效果</b><span>Lv.${selected.level}</span><em>➜</em><span>Lv.${Math.min(selected.maxLevel, selected.level + 1)}</span></div>${effectRows}</div>${conditions}<div class="building-main-upgrade" data-feature-zone="upgrade">${this.renderBuildingUpgradeButton(selected.id)}</div><div class="building-roster" data-feature-zone="roster"><b>值班猫咪 ${selected.assignedCatCount}/${selected.scheduleCapacity}</b>${this.renderAssignedCatRows(selected.id)}${this.renderAvailableCatRows(selected.id)}</div></div>`;
    }

    private getActiveFactoryAppearanceId(): string {
        const serverState = FactoryAppearanceManager.getServerState();
        if (NetworkManager.canUseServer && serverState) {
            return FACTORY_APPEARANCES.some(item => item.id === serverState.equippedAppearanceId)
                ? serverState.equippedAppearanceId
                : "simple";
        }
        const savedId = SaveManager.data.featureState.factoryAppearanceId ?? "simple";
        return FACTORY_APPEARANCES.some(item => item.id === savedId && item.unlocked) ? savedId : "simple";
    }

    private renderFactoryAppearancePanel(): string {
        const activeId = this.getActiveFactoryAppearanceId();
        const serverState = FactoryAppearanceManager.getServerState();
        const useServerState = NetworkManager.canUseServer && !!serverState;
        const selected = FACTORY_APPEARANCES.find(item => item.id === this._selectedFactoryAppearanceId) ?? FACTORY_APPEARANCES[0];
        this._selectedFactoryAppearanceId = selected.id;
        const cards = FACTORY_APPEARANCES.map(item => {
            const catalogItem = serverState?.catalog.find(entry => entry.appearanceId === item.id);
            const owned = useServerState ? !!catalogItem?.owned : item.unlocked;
            const canUnlock = useServerState && !!catalogItem?.canUnlock;
            const state = item.id === activeId ? "active" : owned ? "available" : "locked";
            const selectedClass = item.id === selected.id ? "selected" : "";
            const statusLabel = item.id === activeId ? "使用中" : owned ? "已拥有" : canUnlock ? "可解锁" : item.unlockLabel;
            return `<button class="factory-appearance-card ${state} ${canUnlock ? "unlockable" : ""} ${selectedClass}" data-action="selectFactoryAppearance" data-id="${item.id}" data-appearance-id="${item.id}" data-appearance-state="${state}" aria-pressed="${item.id === selected.id}"><span class="factory-appearance-thumb" style="background-image:url('${getFactoryAppearanceAsset(item.id)}')"></span><b>${item.name}</b><small>${statusLabel}</small></button>`;
        }).join("");
        const selectedCatalogItem = serverState?.catalog.find(entry => entry.appearanceId === selected.id);
        const bonuses = useServerState && selectedCatalogItem?.bonuses?.length
            ? selectedCatalogItem.bonuses.map(bonus => `<span data-bonus-key="${bonus.key}" data-production-effective="${bonus.productionEffective}"><i>${this.renderCssIcon(bonus.icon)}</i><small>${bonus.label}</small><b>${bonus.valuePercent > 0 ? "+" : ""}${bonus.valuePercent}%</b></span>`).join("")
            : selected.bonuses.map(bonus => `<span><i>${this.renderCssIcon(bonus.icon)}</i><small>${bonus.label}</small><b>${bonus.value}</b></span>`).join("");
        const selectedOwned = useServerState ? !!selectedCatalogItem?.owned : selected.unlocked;
        const selectedCanUnlock = useServerState && !!selectedCatalogItem?.canUnlock;
        const action = selected.id === activeId
            ? `<button class="factory-appearance-apply active" disabled>使用中</button>`
            : selectedOwned
                ? `<button class="factory-appearance-apply" data-action="applyFactoryAppearance" data-id="${selected.id}">启用外观</button>`
                : selectedCanUnlock
                    ? `<button class="factory-appearance-apply" data-action="unlockFactoryAppearance" data-id="${selected.id}">解锁并启用</button>`
                : `<button class="factory-appearance-apply locked" disabled>${selected.unlockLabel}</button>`;
        const selectedStatus = selected.id === activeId ? "当前使用" : selectedOwned ? "可使用" : selectedCanUnlock ? "已满足解锁条件" : selected.unlockLabel;
        return `<div class="panel-shell building-shell factory-appearance-shell" data-appearance-page="factory"><h2 class="factory-appearance-title" data-appearance-zone="title">工厂外观</h2><div class="factory-appearance-stage" data-appearance-zone="preview" data-selected-appearance="${selected.id}" data-active-appearance="${activeId}" role="img" aria-label="${selected.name}：${selected.description}" style="background-image:linear-gradient(rgba(25,22,18,.02),rgba(25,22,18,.1)),url('${getFactoryAppearanceAsset(selected.id)}')"><div class="factory-appearance-toolbar" data-appearance-zone="return"><button data-action="closeFactoryAppearance" aria-label="返回建筑详情">←</button></div></div><div class="factory-appearance-cards" data-appearance-zone="themes">${cards}</div><section class="factory-appearance-bonuses" data-appearance-zone="bonuses"><div><b>外观属性加成</b><small>${selected.name} · ${selectedStatus}</small></div><div class="factory-appearance-bonus-grid">${bonuses}</div>${action}</section></div>`;
    }

    private renderBuildingDecorManager(buildingId: string): string {
        const decorations = this._serverDecorations.filter(decor => decor.buildingId === buildingId);
        if (decorations.length <= 0) {
            return `<div class="building-decor-manager offline" data-feature-zone="decor"><div class="building-decor-head"><b>楼层装饰</b><span>联网管理</span></div><p>连接服务器后可摆放、撤下楼层装饰，并同步给来访好友。</p></div>`;
        }
        const placedScore = decorations
            .filter(decor => decor.isPlaced)
            .reduce((sum, decor) => sum + decor.score, 0);
        const rows = decorations.map(decor => `
            <div class="building-decor-item ${decor.isPlaced ? "placed" : "stored"}">
                <span class="decor-glyph">${decor.isPlaced ? "◆" : "◇"}</span>
                <div><b>${decor.name}</b><small>装饰评分 +${decor.score}</small></div>
                <button class="tag ${decor.isPlaced ? "warn" : ""}" data-action="toggleDecorPlacement" data-id="${decor.decorId}" data-building="${buildingId}">${decor.isPlaced ? "撤下" : "摆放"}</button>
            </div>`).join("");
        return `<div class="building-decor-manager" data-feature-zone="decor"><div class="building-decor-head"><b>楼层装饰</b><span>已摆放 ${decorations.filter(decor => decor.isPlaced).length}/${decorations.length} · 评分 ${placedScore}</span></div><div class="building-decor-list">${rows}</div></div>`;
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
        let detail = this.getShopProductDetail(this._selectedShopProductKey);
        if (!detail || detail.category !== this._domShopTab) {
            this._selectedShopProductKey = this.getDefaultShopProductSelection(this._domShopTab);
            detail = this.getShopProductDetail(this._selectedShopProductKey);
        }
        const tabs = `<div class="tabs shop-tabs" data-feature-zone="categories">${SHOP_TABS.map(tab => `<button class="tab ${this._domShopTab === tab.id ? "active" : ""}" data-action="shopTab" data-tab="${tab.id}">${tab.label}</button>`).join("")}</div>`;
        const detailMarkup = detail ? this.renderShopProductDetail(detail) : "";
        if (this._domShopTab === "deco") {
            const rows = this._serverDecorCatalog.length > 0
                ? this._serverDecorCatalog.map(item => this.renderDecorCatalogRow(item)).join("")
                : this.renderShopPreviewRows("deco", 4);
            return `<div class="panel-shell shop-shell feature-detail-shell" data-feature-page="shop" data-shop-category="${this._domShopTab}"><h2 class="feature-page-title" data-feature-zone="title">商店详情</h2>${tabs}${detailMarkup}<div class="decor-shop-summary"><b>工厂装饰馆</b><span>${NetworkManager.canUseServer ? "永久收藏 · 购买后进入对应楼层仓库" : "连接服务器后可购买永久装饰"}</span></div>${this.renderDecorCollection()}<div class="shop-catalog-viewport" data-feature-zone="catalog"><div class="list shop-list decor-catalog-list">${rows}</div></div></div>`;
        }
        const items = ShopManager.getShopItems(this._domShopTab);
        const rows = items.length > 0
            ? items.map(item => this.renderShopRow(item.id)).join("") + this.renderShopPreviewRows(this._domShopTab, Math.max(0, 6 - items.length))
            : this.renderShopPreviewRows(this._domShopTab, 4);
        return `<div class="panel-shell shop-shell feature-detail-shell" data-feature-page="shop" data-shop-category="${this._domShopTab}"><h2 class="feature-page-title" data-feature-zone="title">商店详情</h2>${tabs}${detailMarkup}<div class="shop-catalog-viewport" data-feature-zone="catalog"><div class="list shop-list">${rows}</div></div></div>`;
    }

    private renderDecorCatalogRow(item: DecorCatalogItemDto): string {
        const building = BuildingManager.getById(item.defaultBuildingId);
        const floor = building?.floor ?? "工厂";
        const sceneArt = this.getFactoryPropDataUri(getBuildingScene(item.defaultBuildingId));
        const cost = item.priceType === "diamond"
            ? { diamond: item.priceAmount }
            : { coin: item.priceAmount };
        const canAfford = ResourceManager.canSpend(cost);
        const stateClass = item.owned ? "owned" : canAfford ? "" : "locked";
        const key = `decor:${item.decorId}`;
        const selected = this._selectedShopProductKey === key ? "selected" : "";
        return `<div class="item shop-row decor-catalog-row ${stateClass} ${selected}" data-shop-key="${key}"><button class="shop-product-select" data-action="selectShopProduct" data-id="${key}"><span class="shop-icon decor-glyph" style="background-image:url('${sceneArt}')"></span><span class="shop-row-copy"><b>${item.name}</b><span>${item.description}</span><span class="decor-meta"><i>${floor}仓库</i><strong>装饰评分 +${item.score}</strong></span></span></button><div class="buy-zone">${this.renderDecorPurchaseButton(item)}</div></div>`;
    }

    private renderDecorPurchaseButton(item: DecorCatalogItemDto): string {
        const currencyName = item.priceType === "diamond" ? "钻石" : "金币";
        const icon = item.priceType === "diamond" ? "diamond" : "coin";
        const cost = item.priceType === "diamond"
            ? { diamond: item.priceAmount }
            : { coin: item.priceAmount };
        const canAfford = ResourceManager.canSpend(cost);
        if (item.owned) return `<button class="tag owned" disabled>已拥有</button>`;
        return `<button class="tag ${canAfford ? "" : "warn"}" data-action="buyDecor" data-id="${item.decorId}" ${canAfford ? "" : "disabled"}><span class="price">${this.renderCssIcon(icon)}${this.formatNumber(item.priceAmount)} ${currencyName}</span></button>`;
    }

    private renderDecorCollection(): string {
        const collection = this._serverDecorCollection;
        if (!collection) {
            return `<section class="decor-collection pending"><div><b>精品收藏册</b><span>连接服务器同步收藏里程碑</span></div></section>`;
        }

        const progress = collection.totalCount > 0
            ? Math.min(100, Math.round(collection.ownedCount / collection.totalCount * 100))
            : 0;
        const tiers = collection.tiers.map(tier => this.renderDecorCollectionTier(tier)).join("");
        return `<section class="decor-collection"><div class="decor-collection-head"><div><b>精品收藏册</b><span>已收藏 ${collection.ownedCount}/${collection.totalCount} · 总评分 ${collection.ownedScore}</span></div><strong>${progress}%</strong></div><div class="decor-collection-progress"><i style="width:${progress}%"></i></div><div class="decor-collection-tiers">${tiers}</div></section>`;
    }

    private renderDecorCollectionTier(tier: DecorCollectionTierDto): string {
        const stateClass = tier.claimed ? "claimed" : tier.claimable ? "claimable" : "locked";
        const stateText = tier.claimed ? "已领取" : tier.claimable ? "领取" : `${this._serverDecorCollection?.ownedCount ?? 0}/${tier.targetCount}`;
        const button = tier.claimable
            ? `<button data-action="claimDecorCollection" data-id="${tier.tierId}">${stateText}</button>`
            : `<button disabled>${stateText}</button>`;
        return `<div class="decor-collection-tier ${stateClass}"><span>收藏 ${tier.targetCount} 件</span><b>${this.getDecorCollectionRewardLabel(tier.rewardType, tier.rewardAmount)}</b>${button}</div>`;
    }

    private getDecorCollectionRewardLabel(rewardType: string, rewardAmount: number): string {
        const label = rewardType === "diamond" ? "钻石" : rewardType === "researchPoint" ? "研究点" : "金币";
        return `${label} +${this.formatNumber(rewardAmount)}`;
    }

    private renderShopPreviewRows(category: string, count: number): string {
        return (SHOP_PREVIEW_CATALOGS[category] ?? SHOP_PREVIEW_CATALOGS.resource).slice(0, count).map(([name, desc, icon, price, currency], index) => {
            const key = `preview:${category}:${index}`;
            const art = this.getShopPreviewArt(category, index, icon);
            const productKind = this.getShopPreviewArtKind(category, index, icon);
            const sizeClass = category === "resource" && icon === "food"
                ? (index === 1 ? "product-small" : "product-large")
                : "";
            const selected = this._selectedShopProductKey === key ? "selected" : "";
            return `<div class="item shop-row preview ${selected}" data-shop-key="${key}"><button class="shop-product-select" data-action="selectShopProduct" data-id="${key}"><span class="shop-icon product-art product-${productKind} ${sizeClass}" data-shop-art="${productKind}" style="background-image:url('${art}')"></span><span class="shop-row-copy"><b>${name}</b><span>${desc}</span><span class="limit">每日限购：3/3</span></span></button><div class="buy-zone"><span class="tag preview-price">${price} ${currency}</span></div></div>`;
        }).join("");
    }

    private getDefaultShopProductSelection(category: ShopTabId): string {
        if (category === "deco") {
            return this._serverDecorCatalog[0] ? `decor:${this._serverDecorCatalog[0].decorId}` : "preview:deco:0";
        }
        const realItem = ShopManager.getShopItems(category)[0];
        return realItem ? `shop:${realItem.id}` : `preview:${category}:0`;
    }

    private getShopProductDetail(key: string): ShopProductDetailView | null {
        if (key.startsWith("shop:")) {
            const shopId = key.slice("shop:".length);
            const shop = ConfigManager.shops.find(item => item.id === shopId);
            if (!shop) return null;
            const item = ConfigManager.items.find(entry => entry.id === shop.itemId);
            const icon = this.getItemIconClass(shop.itemId);
            const artKind = shop.itemId === "item_cat_food_pack"
                ? "food"
                : shop.itemId === "item_coin_pack_small"
                    ? "coin"
                    : icon;
            const currencyName = shop.priceType === "coin" ? "金币" : shop.priceType === "diamond" ? "钻石" : "猫粮";
            const remaining = ShopManager.getRemainingLimit(shop.id);
            return {
                key,
                category: shop.category as ShopTabId,
                name: item?.name ?? shop.itemId,
                description: item?.description ?? "商品配置缺失",
                source: "正式商品 · 购买后立即进入背包",
                art: getShopProductAsset(artKind),
                artKind,
                priceLabel: `${this.formatNumber(shop.priceAmount)} ${currencyName}`,
                limitLabel: remaining >= 999 ? "不限购" : `今日剩余 ${remaining}/${shop.limitDaily}`,
                realShopId: shop.id,
            };
        }
        if (key.startsWith("decor:")) {
            const decorId = key.slice("decor:".length);
            const item = this._serverDecorCatalog.find(entry => entry.decorId === decorId);
            if (!item) return null;
            const building = BuildingManager.getById(item.defaultBuildingId);
            return {
                key,
                category: "deco",
                name: item.name,
                description: item.description,
                source: `${building?.floor ?? "工厂"}仓库 · 装饰评分 +${item.score}`,
                art: this.getFactoryPropDataUri(getBuildingScene(item.defaultBuildingId)),
                artKind: "deco",
                priceLabel: `${this.formatNumber(item.priceAmount)} ${item.priceType === "diamond" ? "钻石" : "金币"}`,
                limitLabel: item.owned ? "永久收藏 · 已拥有" : "永久收藏 · 仅需购买一次",
                decorId: item.decorId,
            };
        }
        if (!key.startsWith("preview:")) return null;
        const [, categoryValue, indexValue] = key.split(":");
        const category = categoryValue as ShopTabId;
        const index = Number(indexValue);
        const row = SHOP_PREVIEW_CATALOGS[category]?.[index];
        if (!row || !SHOP_TABS.some(tab => tab.id === category)) return null;
        const [name, description, icon, price, currency] = row;
        return {
            key,
            category,
            name,
            description,
            source: category === "cat" ? "猫咪招募 · 活动轮换" : category === "deco" ? "装饰收藏 · 联网后开放" : "玩法预览 · 后续版本开放",
            art: this.getShopPreviewArt(category, index, icon),
            artKind: this.getShopPreviewArtKind(category, index, icon),
            priceLabel: `${price} ${currency}`,
            limitLabel: "每日剩余 3/3",
        };
    }

    private renderShopProductDetail(detail: ShopProductDetailView): string {
        let action = `<button class="tag preview-price" disabled>预览商品</button>`;
        if (detail.realShopId) {
            const shop = ConfigManager.shops.find(item => item.id === detail.realShopId);
            if (shop) action = this.renderShopButton(shop.id, shop.priceType, shop.priceAmount);
        } else if (detail.decorId) {
            const decor = this._serverDecorCatalog.find(item => item.decorId === detail.decorId);
            if (decor) action = this.renderDecorPurchaseButton(decor);
        }
        return `<section class="shop-detail-target" data-feature-zone="detail" data-selected-key="${detail.key}" data-shop-category="${detail.category}"><span class="shop-detail-art product-${detail.artKind}" data-shop-art="${detail.artKind}" style="background-image:url('${detail.art}')"></span><span class="shop-detail-copy"><small>${this.getShopTabLabel()}</small><b>${detail.name}</b><span>${detail.description}</span><em>${detail.source}</em></span><span class="shop-detail-meta"><b>${detail.priceLabel}</b><small>${detail.limitLabel}</small><span class="shop-detail-action">${action}</span></span></section>`;
    }

    private getShopPreviewArt(category: string, index: number, icon: string): string {
        if (category === "resource") {
            return getShopProductAsset(["bean", "food", "food", "diamond"][index] ?? icon);
        }
        if (category === "item") {
            return getInventoryPreviewAsset(["speedTicket", "speedTicket", "orderVoucher", "guardCharm"][index] ?? icon);
        }
        if (category === "cat") {
            return getCatFullArtAsset(["c_001", "c_002", "c_003", "c_004"][index] ?? "c_001");
        }
        return this.getFactoryPropDataUri(["cafe", "office", "roast", "storage"][index] ?? "storage");
    }

    private getShopPreviewArtKind(category: string, index: number, icon: string): string {
        if (category === "resource") return ["bean", "food", "food", "diamond"][index] ?? icon;
        if (category === "item") return ["speed", "speed", "voucher", "guard"][index] ?? "item";
        return category === "cat" ? "cat" : "deco";
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
        const productKind = shop.itemId === "item_cat_food_pack"
            ? "food"
            : shop.itemId === "item_coin_pack_small"
                ? "coin"
                : icon;
        const remaining = ShopManager.getRemainingLimit(id);
        const cost = { [shop.priceType]: shop.priceAmount } as { coin?: number; diamond?: number; catFood?: number };
        const stateClass = remaining <= 0 ? "soldout" : ResourceManager.canSpend(cost) ? "" : "locked";
        const key = `shop:${id}`;
        const selected = this._selectedShopProductKey === key ? "selected" : "";
        return `<div class="item shop-row ${stateClass} ${selected}" data-shop-key="${key}"><button class="shop-product-select" data-action="selectShopProduct" data-id="${key}"><span class="shop-icon product-art product-${productKind}" data-shop-art="${productKind}" style="background-image:url('${getShopProductAsset(productKind)}')"></span><span class="shop-row-copy"><b>${title}</b><span>${desc}</span><span class="limit">每日限购：${remaining >= 999 ? "不限" : remaining}</span></span></button><div class="buy-zone">${this.renderShopButton(id, shop.priceType, shop.priceAmount)}</div></div>`;
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
        const detail = this.getInventoryDetail(this._selectedInventoryKey)
            ?? this.getInventoryDetail(this.getDefaultInventorySelection(this._domInventoryTab));
        if (detail) this._selectedInventoryKey = detail.key;
        const grid = this._domInventoryTab === "all"
            ? this.renderInventoryAllSlots()
            : `${this.renderInventoryItems()}${this.renderInventoryPreviewCards(INVENTORY_PREVIEW_CARDS.length)}`;
        return `<div class="panel-shell inventory-shell feature-detail-shell" data-feature-page="inventory"><h2 class="feature-page-title" data-feature-zone="title">背包详情</h2><div class="tabs" data-feature-zone="categories">${INVENTORY_TABS.map(tab => `<button class="tab ${this._domInventoryTab === tab.id ? "active" : ""}" data-action="inventoryTab" data-tab="${tab.id}">${tab.label}</button>`).join("")}</div><div class="list bag-grid" data-feature-zone="grid">${grid}</div>${detail ? this.renderInventoryDetail(detail) : ""}</div>`;
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
            if (INVENTORY_PREVIEW_CARDS.some(card => card.category === this._domInventoryTab)) {
                return resourceCards;
            }
            return resourceCards || `<div class="item bag-card empty"><div class="bag-icon asset" style="background-image:url('${this.getGeneratedIconAsset("gift")}')">${this.renderCssIcon("gift")}</div><b>暂无物品</b><br>该分类还没有可展示内容</div>`;
        }
        const itemCards = filteredItems.map(item => this.renderOwnedInventoryCard(item)).join("");
        return `${resourceCards}${itemCards}`;
    }

    private renderOwnedInventoryCard(item: { itemId: string; count: number }, slotIndex?: number): string {
        const usable = item.itemId === "item_cat_food_pack" || item.itemId === "item_coin_pack_small";
        const action = `<span class="tag ${usable ? "" : "warn"}">${usable ? "可用" : "材料"}</span>`;
        const icon = this.getItemIconClass(item.itemId);
        const key = `item:${item.itemId}`;
        const displayName = ConfigManager.items.find(config => config.id === item.itemId)?.name
            ?? CatManager.getEquipmentConfig(item.itemId)?.name
            ?? this.getItemDisplayName(item.itemId);
        const artKind = item.itemId === "item_shard_orange"
            ? "catOrange"
            : item.itemId === "item_cat_food_pack"
                ? "catFoodSmall"
                : "";
        const art = artKind ? getInventoryPreviewAsset(artKind) : this.getGeneratedIconAsset(icon);
        const artMarker = artKind ? ` data-inventory-art="${artKind}"` : "";
        const slot = slotIndex === undefined ? "" : ` data-inventory-slot="${slotIndex}"`;
        return `<button class="item bag-card ${usable ? "usable" : ""} ${this._selectedInventoryKey === key ? "selected" : ""}" data-action="selectInventory" data-id="${key}"${slot}${artMarker} aria-pressed="${this._selectedInventoryKey === key}"><div class="bag-icon asset dedicated-art" style="background-image:url('${art}')">${this.renderCssIcon(icon)}</div><b>${displayName}</b>${action}<span class="bag-count">x${item.count}</span></button>`;
    }

    private renderResourceBagCard(resource: string, label: string, amount: number, slotIndex?: number): string {
        const icon = this.getResourceIconClass(resource);
        const key = `resource:${resource}`;
        const slot = slotIndex === undefined ? "" : ` data-inventory-slot="${slotIndex}"`;
        return `<button class="item bag-card resource ${this._selectedInventoryKey === key ? "selected" : ""}" data-action="selectInventory" data-id="${key}"${slot} aria-pressed="${this._selectedInventoryKey === key}"><div class="bag-icon asset" style="background-image:url('${this.getGeneratedIconAsset(icon)}')">${this.renderCssIcon(icon)}</div><b>${label}</b><span class="bag-count">${this.formatNumber(amount)}</span></button>`;
    }

    private renderInventoryPreviewCards(count: number): string {
        if (count <= 0) return "";
        return INVENTORY_PREVIEW_CARDS
            .filter(card => card.category === this._domInventoryTab)
            .slice(0, count)
            .map(card => this.renderInventoryPreviewCard(card))
            .join("");
    }

    private renderInventoryPreviewCard(card: typeof INVENTORY_PREVIEW_CARDS[number], slotIndex?: number): string {
        const key = `preview:${card.id}`;
        const selected = this._selectedInventoryKey === key;
        const slot = slotIndex === undefined ? "" : ` data-inventory-slot="${slotIndex}"`;
        return `<button class="item bag-card preview ${selected ? "selected" : ""}" data-action="selectInventory" data-id="${key}"${slot} data-inventory-art="${card.art}" aria-pressed="${selected}"><div class="bag-icon asset dedicated-art" style="background-image:url('${getInventoryPreviewAsset(card.art)}')"></div><b>${card.name}</b><span class="bag-count">${this.formatNumber(card.count)}</span></button>`;
    }

    private renderInventoryAllSlots(): string {
        const resourceLabels: Record<string, string> = {
            bean: "咖啡豆",
            catFood: "猫粮",
            diamond: "钻石",
            coin: "金币",
        };
        const owned = InventoryManager.getOwnedItems();
        return INVENTORY_ALL_SLOTS.map((slot, slotIndex) => {
            let key = slot.key;
            if (key.startsWith("item:")) {
                const itemId = key.slice("item:".length);
                const item = owned.find(entry => entry.itemId === itemId);
                if (item) return this.renderOwnedInventoryCard(item, slotIndex);
                key = slot.fallbackKey ?? "";
            }
            if (key.startsWith("resource:")) {
                const resource = key.slice("resource:".length);
                return this.renderResourceBagCard(resource, resourceLabels[resource] ?? resource, ResourceManager.get(resource as "bean" | "catFood" | "diamond" | "coin"), slotIndex);
            }
            if (key.startsWith("preview:")) {
                const card = INVENTORY_PREVIEW_CARDS.find(item => item.id === key.slice("preview:".length));
                return card ? this.renderInventoryPreviewCard(card, slotIndex) : "";
            }
            return "";
        }).join("");
    }

    private getDefaultInventorySelection(tab: InventoryTabId): string {
        if (tab === "item") {
            const firstOwnedItem = InventoryManager.getOwnedItems()
                .find(item => this.inventoryItemMatchesTab(item.itemId, tab));
            return firstOwnedItem ? `item:${firstOwnedItem.itemId}` : "preview:speed-5";
        }
        if (tab === "shard") {
            return InventoryManager.getItemCount("item_shard_orange") > 0
                ? "item:item_shard_orange"
                : "preview:shard-orange";
        }
        if (tab === "other") return "preview:decor-coin";
        return "resource:bean";
    }

    private getInventoryDetail(key: string): InventoryDetailView | null {
        if (key.startsWith("resource:")) {
            const resource = key.slice("resource:".length);
            const details: Record<string, { name: string; description: string; source: string }> = {
                bean: { name: "咖啡豆", description: "工厂生产咖啡的基础原料，会被猫咪和车间持续消耗。", source: "原料仓库、订单奖励" },
                catFood: { name: "猫粮", description: "用于喂养猫咪、提升体重并维持良好心情。", source: "商店购买、好友赠礼" },
                diamond: { name: "钻石", description: "稀有货币，可购买高级道具和猫咪资源。", source: "成就、活动、协作奖励" },
                coin: { name: "金币", description: "公司通用货币，用于升级建筑、猫咪和装备。", source: "工厂生产、订单结算" },
            };
            const detail = details[resource];
            if (!detail) return null;
            return {
                key,
                name: detail.name,
                count: ResourceManager.get(resource as "bean" | "catFood" | "diamond" | "coin"),
                description: detail.description,
                source: detail.source,
                art: this.getGeneratedIconAsset(this.getResourceIconClass(resource)),
                kind: "公司资源",
                rarity: "常用",
                status: "资产栏同步",
            };
        }
        if (key.startsWith("item:")) {
            const itemId = key.slice("item:".length);
            const config = ConfigManager.items.find(item => item.id === itemId);
            const equipment = CatManager.getEquipmentConfig(itemId);
            if (!config && !equipment) return null;
            const icon = this.getItemIconClass(itemId);
            const usable = itemId === "item_cat_food_pack" || itemId === "item_coin_pack_small";
            return {
                key,
                name: config?.name ?? equipment?.name ?? this.getItemDisplayName(itemId),
                count: InventoryManager.getItemCount(itemId),
                description: config?.description ?? equipment?.description ?? "公司背包中保存的特殊物品。",
                source: equipment?.source ?? (config?.type === "shard" ? "猫咪招募、故事关卡" : "商店购买、订单奖励"),
                art: itemId === "item_shard_orange"
                    ? getInventoryPreviewAsset("catOrange")
                    : this.getGeneratedIconAsset(icon),
                kind: config?.type === "shard" ? "猫咪碎片" : equipment ? "装备材料" : "可使用道具",
                rarity: `${config?.rarity ?? equipment?.rarity ?? "B"}级`,
                status: usable ? "可立即使用" : config?.type === "shard" ? "招募与升星材料" : "背包材料",
                usableItemId: usable ? itemId : undefined,
            };
        }
        if (key.startsWith("preview:")) {
            const id = key.slice("preview:".length);
            const card = INVENTORY_PREVIEW_CARDS.find(item => item.id === id);
            if (!card) return null;
            return {
                key,
                name: card.name,
                count: card.count,
                description: card.description,
                source: card.source,
                art: getInventoryPreviewAsset(card.art),
                kind: card.kind,
                rarity: `${card.rarity}级`,
                status: card.category === "item" ? "功能预览" : card.category === "shard" ? "招募与升星材料" : "特殊收藏材料",
            };
        }
        return null;
    }

    private renderInventoryDetail(detail: InventoryDetailView): string {
        const action = detail.usableItemId
            ? `<button class="tag bag-detail-action" data-action="use" data-id="${detail.usableItemId}" ${detail.count > 0 ? "" : "disabled"}>使用</button>`
            : "";
        return `<div class="bag-detail-target" data-feature-zone="detail" data-selected-key="${detail.key}" data-detail-kind="${detail.kind}"><span class="bag-detail-icon asset" style="background-image:url('${detail.art}')"></span><div class="bag-detail-copy"><div class="bag-detail-head"><div><b>${detail.name}</b><span class="bag-detail-badges"><em>${detail.rarity}</em><em>${detail.kind}</em></span></div><span><strong>拥有：${this.formatNumber(detail.count)}</strong>${action}</span></div><p>${detail.description}</p><div class="bag-detail-meta"><span>主要获取：<b>${detail.source}</b></span><em>${detail.status}</em></div></div></div>`;
    }

    private getItemIconClass(itemId: string): string {
        return getItemIconClassName(itemId);
    }

    private inventoryItemMatchesTab(itemId: string, tab: InventoryTabId = this._domInventoryTab): boolean {
        if (tab === "all") return true;
        const config = ConfigManager.items.find(item => item.id === itemId);
        if (!config) return tab === "other";
        if (tab === "resource") return false;
        if (tab === "item") return config.type === "resource" || config.type === "consumable";
        if (tab === "shard") return config.type === "shard";
        return config.type !== "resource" && config.type !== "consumable" && config.type !== "shard";
    }

    private renderResearchPanel(): string {
        const configs = ResearchManager.getAllConfigs();
        if (configs.length === 0) {
            return `<div class="panel-shell research-shell feature-detail-shell" data-feature-page="research"><h2 class="feature-page-title" data-feature-zone="title">研究详情</h2><div class="item">研究配置为空</div></div>`;
        }
        if (!configs.find(item => item.id === this._selectedResearchId)) {
            this._selectedResearchId = configs[0].id;
        }
        const selected = configs.find(item => item.id === this._selectedResearchId) ?? configs[0];
        return `<div class="panel-shell research-shell feature-detail-shell" data-feature-page="research" data-research-node-count="${configs.length}"><h2 class="feature-page-title" data-feature-zone="title">研究详情</h2><div class="tabs" data-feature-zone="categories"><button class="tab active">生产研究</button><button class="tab">经营研究</button><button class="tab">猫咪研究</button><button class="tab">特殊研究</button></div><div class="research-point-strip" data-feature-zone="currency"><span>咖啡实验室</span><b>研究点 ${this.formatNumber(ResourceManager.get("researchPoint"))}</b></div><div class="list research-view"><div class="tree" data-feature-zone="tree" data-research-layout="1-2-3-1">${this.renderResearchLines(configs)}${configs.map(config => this.renderResearchNode(config.id)).join("")}</div><div class="research-detail" data-feature-zone="detail">${this.renderResearchDetail(selected.id)}</div></div></div>`;
    }

    private renderResearchLines(configs: ReturnType<typeof ResearchManager.getAllConfigs>): string {
        if (configs.length <= 1) return "";
        const lines = [
            { left: 50, top: 16, width: 0, height: 6 },
            { left: 23, top: 22, width: 54, height: 0 },
            { left: 23, top: 22, width: 0, height: 6 },
            { left: 77, top: 22, width: 0, height: 6 },
            { left: 23, top: 40, width: 0, height: 7 },
            { left: 77, top: 40, width: 0, height: 7 },
            { left: 16, top: 47, width: 68, height: 0 },
            { left: 16, top: 47, width: 0, height: 7 },
            { left: 50, top: 47, width: 0, height: 7 },
            { left: 84, top: 47, width: 0, height: 7 },
            { left: 16, top: 66, width: 68, height: 0 },
            { left: 50, top: 66, width: 0, height: 13 },
        ];
        return lines.map((line, index) => line.height > 0
            ? `<div class="tree-line v" data-tree-line="${index}" style="left:${line.left}%;top:${line.top}%;height:${line.height}%"></div>`
            : `<div class="tree-line" data-tree-line="${index}" style="left:${line.left}%;top:${line.top}%;width:${line.width}%"></div>`
        ).join("");
    }

    private renderResearchNode(id: string): string {
        const config = ResearchManager.getAllConfigs().find(item => item.id === id);
        if (!config) return "";
        const presentation = RESEARCH_NODE_PRESENTATIONS[id];
        const pos = presentation?.position ?? { left: 35, top: 79 };
        const level = ResearchManager.getLevel(id);
        const done = level > 0;
        const maxed = level >= config.maxLevel;
        const canUnlock = ResearchManager.canUnlock(id);
        const selected = id === this._selectedResearchId;
        const cls = `${done ? "done" : ""} ${!done && !canUnlock ? "locked" : ""} ${selected ? "selected" : ""}`;
        const state = maxed ? "已满级" : canUnlock ? `${ResearchManager.getNextCost(config, level)}点` : "未解锁";
        const tier = presentation?.tier ?? 4;
        const displayName = presentation?.displayName ?? config.name;
        const levelProgress = Math.round((level / Math.max(1, config.maxLevel)) * 100);
        return `<button class="node ${cls}" style="left:${pos.left}%;top:${pos.top}%;--research-level-progress:${levelProgress}%" data-action="selectResearch" data-id="${id}" data-research-level="${level}" data-research-max-level="${config.maxLevel}" data-research-maxed="${maxed}" data-research-tier="${tier}" data-research-art="${id}"><span class="research-node-medal"><span class="node-icon asset" style="background-image:url('${getResearchNodeAsset(id, config.effectType)}')"></span></span><span class="node-copy"><b>${displayName}</b><small>Lv.${level}/${config.maxLevel}</small><em>${state}</em></span></button>`;
    }

    private renderResearchDetail(id: string): string {
        const config = ResearchManager.getAllConfigs().find(item => item.id === id);
        if (!config) return `<div class="item">研究节点不存在</div>`;
        const level = ResearchManager.getLevel(id);
        const maxed = level >= config.maxLevel;
        const status = maxed ? "已满级" : ResearchManager.canUnlock(id) ? (level > 0 ? "可升级" : "可研究") : "前置未完成";
        const parentIds = ResearchManager.getParentResearchIds(config);
        const parent = parentIds.length > 0
            ? parentIds.map(parentId => {
                const parentConfig = ResearchManager.getAllConfigs().find(item => item.id === parentId);
                return RESEARCH_NODE_PRESENTATIONS[parentId]?.displayName ?? parentConfig?.name ?? parentId;
            }).join("、")
            : "无";
        const currentEffectValue = ResearchManager.getEffectValue(config, level);
        const nextEffectValue = ResearchManager.getNextEffectValue(config, level);
        const effectLabel = this.getResearchEffectLabel(config.effectType);
        const currentEffectText = `${effectLabel} ${currentEffectValue > 0 ? "+" : ""}${currentEffectValue}%`;
        const nextEffectText = maxed ? "已达最高等级" : `${effectLabel} ${nextEffectValue > 0 ? "+" : ""}${nextEffectValue}%`;
        const nextCost = ResearchManager.getNextCost(config, level);
        const owned = ResourceManager.get("researchPoint");
        const progress = maxed ? 100 : Math.min(100, Math.floor((owned / Math.max(1, nextCost)) * 100));
        const nextHint = maxed ? "研究已全部完成" : progress >= 100 ? "资源已备齐" : "继续收集研究点";
        const currentEffect = level > 0 ? currentEffectText : "未生效";
        const presentation = RESEARCH_NODE_PRESENTATIONS[id];
        const displayName = presentation?.displayName ?? config.name;
        return `<div class="item research-hero" data-research-art="${id}" data-research-detail-level="${level}"><div class="shop-icon asset research-medal-art" style="background-image:url('${getResearchNodeAsset(id, config.effectType)}')"></div><div><b>${displayName}</b><small class="research-level">Lv.${level}/${config.maxLevel}</small><p>${config.description}</p><span class="research-state">${status}</span></div></div><div class="item research-effect-card"><b>研究效果</b><div class="research-effect-stack"><span><small>当前效果</small><strong>${currentEffect}</strong></span><i>›</i><span class="next"><small>下级效果</small><strong>${nextEffectText}</strong></span></div><div class="research-preview"><span>节点状态<br><b>${status}</b></span><span>研究反馈<br><b>${nextHint}</b></span></div></div><div class="item research-condition-card"><b>研究条件</b><div class="research-parent">前置研究 <strong>${parent}</strong></div><div class="research-cost"><span>研究点 <b>${maxed ? "MAX" : `${this.formatNumber(owned)}/${nextCost}`}</b></span><div class="research-cost-line"><i style="width:${progress}%"></i></div></div>${this.renderResearchButton(config.id)}</div>`;
    }

    private getResearchIconClass(effectType: string): string {
        return getResearchIconClassName(effectType);
    }

    private getResearchEffectLabel(type: string): string {
        return getResearchEffectLabelText(type);
    }

    private renderResearchButton(id: string): string {
        const config = ResearchManager.getConfig(id);
        if (!config) return `<span class="tag warn">研究不存在</span>`;
        const level = ResearchManager.getLevel(id);
        if (level >= config.maxLevel) return `<span class="tag">已满级</span>`;
        if (!ResearchManager.canUnlock(id)) {
            return `<span class="tag warn">前置未满</span>`;
        }
        const cost = ResearchManager.getNextCost(config, level);
        if (!ResourceManager.canSpend({ researchPoint: cost })) {
            return `<button class="tag warn" disabled>研究点不足</button>`;
        }
        return `<button class="tag" data-action="research" data-id="${id}">${this.renderCssIcon("equip")} ${level > 0 ? "升级" : "研究"} ${cost}</button>`;
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
        const serverPlayer = SyncManager.getServerPlayer();
        const player = serverPlayer ?? SaveManager.data.player;
        const playerLevelCap = serverPlayer?.levelCap ?? 60;
        const hasServerPlayerAuthority = !!serverPlayer
            || (NetworkManager.getStatus().serverMode === "ready" && !!NetworkManager.playerId);
        const expPercent = getHudExperiencePercent(player.exp, player.expToNext, player.level, playerLevelCap);
        const nextText = [
            player.companyName,
            player.level,
            player.exp,
            player.expToNext,
            playerLevelCap,
            hasServerPlayerAuthority ? "server" : "offline",
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
                <div class="player" data-main-zone="identity" data-player-authority="${hasServerPlayerAuthority ? "server" : "offline"}" data-player-level="${player.level}" data-player-exp="${player.exp}" data-player-exp-to-next="${player.expToNext}" data-player-level-cap="${playerLevelCap}">
                        <div class="avatar asset" style="background-image:url('${this.getCatFullArtAsset("c_001")}')"></div><div class="level">${player.level}</div>
                    <div>
                        <div class="company">${escapeHudText(player.companyName)}</div>
                        <div class="exp"><span style="width:${expPercent}%"></span></div>
                        <div class="exp-text">${player.level >= playerLevelCap ? "MAX" : `${player.exp}/${player.expToNext}`}</div>
                    </div>
                </div>
                <div class="resources" data-main-zone="resources">
                    ${HUD_RESOURCE_ITEMS.map(item => this.renderHudResource(
                        item.kind,
                        item.label,
                        item.kind === "diamond"
                            ? formatExactInteger(resources[item.resourceKey])
                            : this.formatNumber(resources[item.resourceKey]),
                    )).join("")}
                </div>
            </div>`;
        this.layoutDomHudOverlay();
    }

    private renderHudResource(kind: HudResourceKind, label: string, value: string): string {
        return `<div class="res ${kind}" data-resource-kind="${kind}" aria-label="${label} ${value}"><div class="icon asset" style="background-image:url('${this.getGeneratedIconAsset(kind)}')" aria-hidden="true"></div><div class="res-name">${label}</div><div class="value">${value}</div><div class="plus">+</div></div>`;
    }

    private ensureDomNavOverlay(): HTMLElement | null {
        if (typeof document === "undefined") return null;
        if (this._domNavOverlay) return this._domNavOverlay;

        const overlay = document.createElement("div");
        overlay.id = "fatcat-dom-nav";
        const style = document.createElement("style");
        style.textContent = DOM_NAV_STYLES + DOM_NAV_TARGET_STYLES;
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
        overlay.innerHTML = `<div class="nav-bar" data-main-zone="navigation">${MAIN_DOM_NAV_ITEMS.map((item) => `
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
        style.textContent = getDomCatStyles(this.getDomAssetDataUri(GeneratedBackgroundAssets.catDetailWorkshop));
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
            if (this._domCatTab === "skin") {
                this._selectedDomCatSkinId = CatManager.getEquippedSkinId(this._selectedDomCatId) as CatSkinId;
            }
            this._domCatMessage = "";
        } else if (action === "selectCat") {
            this._selectedDomCatId = id;
            this._selectedDomCatSkinId = CatManager.getEquippedSkinId(id) as CatSkinId;
            this._domCatMessage = "";
        } else if (action === "prevCat" || action === "nextCat") {
            const configs = CatManager.getAllConfigs();
            const index = Math.max(0, configs.findIndex(item => item.id === this._selectedDomCatId));
            const offset = action === "nextCat" ? 1 : -1;
            const next = configs[(index + offset + configs.length) % configs.length];
            if (next) {
                this._selectedDomCatId = next.id;
                this._selectedDomCatSkinId = CatManager.getEquippedSkinId(next.id) as CatSkinId;
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
        } else if (action === "selectCatSkin") {
            this._domCatTab = "skin";
            const skinId = (button.dataset.skinId as CatSkinId) || "default";
            const theme = CAT_SKIN_THEMES.find(item => item.id === skinId) ?? CAT_SKIN_THEMES[0];
            this._selectedDomCatSkinId = theme.id;
            this._domCatMessage = !CatManager.getOwnedSkinIds(id).includes(theme.id)
                ? `${theme.name}尚未解锁，可先预览服装效果。`
                : `正在预览${theme.name}。`;
        } else if (action === "applyCatSkin") {
            this._domCatTab = "skin";
            const theme = CAT_SKIN_THEMES.find(item => item.id === this._selectedDomCatSkinId) ?? CAT_SKIN_THEMES[0];
            if (!CatManager.getOwnedSkinIds(id).includes(theme.id)) {
                this._domCatMessage = `${theme.name}尚未解锁。`;
            } else {
                const serverSkin = NetworkManager.canUseServer
                    ? await SyncManager.equipServerCatSkin(id, theme.id)
                    : null;
                const applied = serverSkin
                    ? CatManager.getEquippedSkinId(id) === theme.id
                    : !NetworkManager.canUseServer && CatManager.equipSkin(id, theme.id);
                this._domCatMessage = applied
                    ? `已启用${theme.name}。`
                    : "皮肤启用失败，请检查网络或拥有状态。";
            }
        } else if (action === "unlockCatSkin") {
            this._domCatTab = "skin";
            const skinId = (button.dataset.skinId as CatSkinId) || this._selectedDomCatSkinId;
            const theme = CAT_SKIN_THEMES.find(item => item.id === skinId) ?? CAT_SKIN_THEMES[0];
            const catalogItem = CatManager.getSkinCatalogItem(id, skinId);
            if (!catalogItem?.purchasable) {
                this._domCatMessage = `${theme.name}当前无法获取。`;
            } else if (!this.canAffordCatSkin(catalogItem)) {
                this._domCatMessage = `${this.getCatSkinPriceLabel(catalogItem)}不足，暂时无法解锁。`;
            } else {
                const unlockedSkin = NetworkManager.canUseServer
                    ? await SyncManager.unlockServerCatSkin(id, skinId)
                    : null;
                this._domCatMessage = unlockedSkin
                    ? `已解锁并启用${theme.name}，消耗${this.getCatSkinPriceLabel(catalogItem)}。`
                    : "皮肤购买需要连接服务器，或服务器拒绝了本次购买。";
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
        const equippedSkinId = CatManager.getEquippedSkinId(config.id) as CatSkinId;
        const selectedCatArt = config.id === "c_001"
            ? this.getCatSkinAsset(equippedSkinId)
            : this.getCatFullArtAsset(config.id, config.portrait);
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
                    <div class="res gem"><i class="asset" style="background-image:url('${this.getGeneratedIconAsset("diamond")}')"></i>${formatExactInteger(ResourceManager.get("diamond"))}<b class="plus">+</b></div>
                </div>
                <div class="cat-modal-title">猫咪图鉴</div>
                <button class="close-x" data-action="back">×</button>
                <div class="cat-side">
                    <button class="back" data-action="back" aria-label="返回">←</button>
                    ${CAT_SIDE_TABS.map(tab => this.renderCatSideTab(tab.id, tab.label)).join("")}
                </div>
                <div class="cat-overview-head">
                    <div><b>${unlockedCount}/${configs.length}</b><span>已招募猫咪</span></div>
                    <div><b>${this.formatNumber(totalProduction)}/秒</b><span>队伍总产能</span></div>
                    <div><b>${assignedName}</b><span>当前岗位</span></div>
                    <div><b>${config.rarity}</b><span>${roleLabel} ${config.breed}</span></div>
                </div>
                <div class="cat-hero">
                    <div class="cat-card info" data-cat-panel="identity"><strong>${config.name}</strong><div class="cat-info-badges"><span class="rank">${config.rarity}</span><span class="type">${roleLabel}</span></div><div class="cat-info-level">${unlocked ? `Lv.${data.level}/30` : "未招募"}</div><div class="cat-info-stars">${stars}</div></div>
                    <div class="cat-portrait" data-cat-panel="stage"><div class="cat-index">${selectedIndex + 1}/${configs.length}</div><button class="cat-switch prev" data-action="prevCat">‹</button><button class="cat-switch next" data-action="nextCat">›</button><div class="portrait-cat img" data-equipped-skin="${config.id === "c_001" ? equippedSkinId : "default"}" style="background-image:url('${selectedCatArt}')"></div><div class="portrait-name">${config.name}</div><span class="cat-talk">${this.getCatBubble(config.personality, unlocked)}</span><div class="cat-profile-row"><em>${config.rarity}级</em><em>${roleLabel}</em><em>${assignedName}</em></div></div>
                    <div class="cat-status-rail" data-cat-panel="status">
                        <div class="cat-card mood"><span class="cat-status-label">心情</span><strong class="cat-status-value">${mood}%</strong></div>
                        <div class="cat-card feed"><span class="cat-status-label">喂猫粮</span><strong class="cat-status-value">${feedCost}</strong><button data-action="feedCat" data-id="${config.id}" ${canFeed ? "" : "disabled"}>喂食</button></div>
                    </div>
                </div>
                <div class="cat-power" data-cat-panel="power">生产力：${this.formatNumber(production)}/秒</div>
                <div class="cat-stats" data-cat-panel="stats"><div data-cat-stat="bean"><i class="stat-icon asset" style="background-image:url('${this.getGeneratedIconAsset("bean")}')"></i><span class="stat-label">咖啡豆消耗</span><b class="stat-value">${this.formatNumber(config.baseBeanCost)}/秒</b></div><div data-cat-stat="production"><i class="stat-icon asset" style="background-image:url('${this.getGeneratedIconAsset("food")}')"></i><span class="stat-label">原料产量</span><b class="stat-value">${this.formatNumber(production)}/秒</b></div><div data-cat-stat="wage"><i class="stat-icon asset" style="background-image:url('${this.getGeneratedIconAsset("coin")}')"></i><span class="stat-label">工资</span><b class="stat-value">${this.formatNumber(wageCost)}/分钟</b></div><div data-cat-stat="weight"><i class="stat-icon weight"></i><span class="stat-label">体重</span><b class="stat-value">${weightLabel}</b></div><div data-cat-stat="breed"><i class="stat-icon paw"></i><span class="stat-label">品种</span><b class="stat-value">${config.breed}</b></div></div>
                <div class="cat-weight" data-cat-panel="weight"><b>体重阶段</b><div class="weight-row"><span class="stage-art normal ${weightStage === WeightStage.NORMAL ? "selected" : ""}" style="--stage-art:url('${selectedCatArt}')"><b>正常</b></span><span class="stage-art fat ${weightStage === WeightStage.FAT ? "selected" : ""}" style="--stage-art:url('${selectedCatArt}')"><b>胖猫</b></span><span class="stage-art super ${weightStage === WeightStage.SUPER_FAT ? "selected" : ""}" style="--stage-art:url('${selectedCatArt}')"><b>巨胖</b></span><div class="bar"><i style="width:${Math.min(100, data.weight)}%"></i></div><em>${data.weight}/100</em></div></div>
                <div class="cat-grid cat-tab-${this._domCatTab} ${this._domCatTab === "skin" ? "skin-mode" : ""}" data-cat-tab="${this._domCatTab}">
                    <div class="focus-panel" data-cat-subpanel="focus"><b>${this.getCatTabTitle()}</b>${this.renderCatFocusContent(config.id, unlocked, upgradeCost, unlockCost, canUpgrade)}</div>
                    <div class="equipment-panel" data-cat-subpanel="equipment"><b>装备</b>${this.renderCatEquipPanel(config.id)}</div>
                </div>
                <div class="cat-story"><div class="story-copy"><b>猫咪故事</b><p>${this.getCatStory(config.name, config.personality, config.breed, assignedName)}</p><div class="story-tags"><span>${roleLabel}</span><span>${assignedName}</span><span>${weightLabel}</span></div></div><div class="story-photo" style="--story-cat:url('${selectedCatArt}')"></div><button class="story-button" data-action="storyWall" data-id="${config.id}"><span class="story-book">▰</span>故事墙</button></div>
                <div class="cat-actions"><button class="dismiss" data-action="dismissCat" data-id="${config.id}">解雇</button><button class="change" data-action="changeCat" data-id="${config.id}">更换</button><button class="level" data-action="upgradeCat" data-id="${config.id}" ${canUpgrade ? "" : "disabled"}>升级1级 ${this.formatNumber(upgradeCost)}</button></div>
                <div class="cat-roster-label">猫咪队伍</div>
                <div class="cat-list" data-cat-panel="roster">${configs.map(item => this.renderCatListButton(item.id)).join("")}<button class="recruit" data-action="unlockCat" data-id="${config.id}"><span class="recruit-art" data-art-key="recruit-badge-v1" style="background-image:url('${this.getRecruitBadgeAsset()}')"></span><b>招募猫咪</b><small>${this.formatNumber(unlockCost)} 金币</small></button></div>
                <div class="cat-msg ${this._domCatMessage ? "" : "empty"}">${this._domCatMessage}</div>
            </div>`;
    }

    private renderCatSideTab(tab: CatTabId, label: string): string {
        return `<button class="side-tab tab-${tab} ${this._domCatTab === tab ? "active" : ""}" data-action="tab" data-tab="${tab}" aria-current="${this._domCatTab === tab ? "page" : "false"}"><i class="asset" style="background-image:url('${this.getCatSideTabIcon(tab)}')"></i>${label}</button>`;
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
            const nextLevel = Math.min(30, data.level + 1);
            const currentProduction = CatModel.calculateProduction(config.baseProduction, data.level, data.weight);
            const nextProduction = CatModel.calculateProduction(config.baseProduction, nextLevel, data.weight);
            const currentWage = Math.round(CatManager.getWageCost(catId));
            const nextWage = Math.round(currentWage / Math.max(1, data.level) * nextLevel);
            return `<div class="cat-upgrade-target" data-cat-tab-zone="upgrade"><span class="cat-upgrade-medal" style="background-image:url('${this.getGeneratedIconAsset("coin")}')"></span><div class="cat-upgrade-summary"><small>猫咪等级</small><strong>Lv.${data.level}<em>/30</em></strong><div class="mini-progress"><i style="width:${Math.min(100, Math.floor(data.level / 30 * 100))}%"></i></div><p>升级后基础能力与技能成长同步提升。</p></div><div class="cat-upgrade-effects"><span><small>基础产量</small><b>${currentProduction} → ${nextProduction}/秒</b></span><span><small>每日工资</small><b>${currentWage} → ${nextWage}</b></span><span><small>下次技能成长</small><b>Lv.${Math.min(30, (Math.floor(data.level / 10) + 1) * 10)}</b></span></div><div class="cat-upgrade-actions"><button class="mini-action" data-action="skillDetails" data-id="${catId}">成长预览</button><button class="mini-action green" data-action="upgradeCat" data-id="${catId}" ${canUpgrade ? "" : "disabled"}>升级 <em>${this.formatNumber(upgradeCost)}</em></button></div></div>`;
        }
        if (this._domCatTab === "skill") {
            const skillLevel = Math.max(1, Math.floor(data.level / 10) + 1);
            const nextSkillLevel = Math.min(3, skillLevel + 1);
            return `<div class="cat-skill-target" data-cat-tab-zone="skill"><span class="cat-skill-medal" style="background-image:url('${skillIcon}')"></span><div class="cat-skill-summary"><small>${this.getCatRoleLabel(config.role)} · 自动触发</small><strong>${this.getSkillName(config.skillId)} <em>Lv.${skillLevel}</em></strong><p>${this.getSkillDesc(config.role)}</p></div><div class="cat-skill-next"><span><small>当前技能</small><b>Lv.${skillLevel}</b></span><i>→</i><span><small>下一阶段</small><b>Lv.${nextSkillLevel}</b></span><em>猫咪达到 Lv.${Math.min(30, skillLevel * 10)} 后强化</em></div><div class="cat-skill-actions"><button class="mini-action" data-action="skillDetails" data-id="${catId}">技能详情</button><button class="mini-action green" data-action="upgradeCat" data-id="${catId}" ${canUpgrade ? "" : "disabled"}>提升等级</button></div></div>`;
        }
        if (this._domCatTab === "equip") {
            return `<div class="focus-card"><span class="focus-icon" style="background-image:url('${this.getEquipIconAsset("collar")}')"></span><div><strong>当前装备加成</strong><br>${this.renderEquipmentEffectSummary(catId)}<br><span class="focus-tag">项圈</span><span class="focus-tag">杯子</span><span class="focus-tag">坐垫</span><div class="focus-actions"><button class="mini-action green" data-action="equipItem" data-slot="项圈" data-id="${catId}">更换项圈</button><button class="mini-action" data-action="equipItem" data-slot="杯子" data-id="${catId}">装备背包</button></div></div></div>`;
        }
        if (this._domCatTab === "skin") {
            const selectedTheme = CAT_SKIN_THEMES.find(item => item.id === this._selectedDomCatSkinId) ?? CAT_SKIN_THEMES[0];
            const equippedSkinId = CatManager.getEquippedSkinId(catId) as CatSkinId;
            const equippedTheme = CAT_SKIN_THEMES.find(item => item.id === equippedSkinId) ?? CAT_SKIN_THEMES[0];
            const ownedSkinIds = CatManager.getOwnedSkinIds(catId);
            const skinCatalog = CatManager.getSkinCatalog(catId);
            const previewArt = this.getCatSkinAsset(selectedTheme.artKey);
            const cards = CAT_SKIN_THEMES.map(item => {
                const selected = item.id === selectedTheme.id ? "selected" : "";
                const equipped = item.id === equippedTheme.id ? "equipped" : "";
                const locked = !ownedSkinIds.includes(item.id);
                const catalogItem = skinCatalog.find(entry => entry.skinId === item.id);
                const state = item.id === equippedTheme.id
                    ? "已启用"
                    : locked && catalogItem?.purchasable
                        ? this.getCatSkinPriceLabel(catalogItem)
                        : locked ? "待开放" : item.state;
                return `<button class="skin-card-target has-art ${item.className} ${selected} ${equipped} ${locked ? "locked" : ""}" data-action="selectCatSkin" data-skin-id="${item.id}" data-skin-art="${item.artKey}" data-skin-owned="${locked ? "false" : "true"}" data-skin-price="${catalogItem?.priceAmount ?? 0}" style="--skin-a:${item.colorA};--skin-b:${item.colorB}"><i style="background-image:url('${this.getCatSkinAsset(item.artKey)}')"></i><div><b>${item.name}</b><span>${item.desc}</span><strong class="skin-style-badge">${item.style}</strong><div class="skin-swatches">${item.swatches.map(color => `<s style="--swatch:${color}"></s>`).join("")}</div><em>${state}</em></div></button>`;
            }).join("");
            const locked = !ownedSkinIds.includes(selectedTheme.id);
            const selectedCatalogItem = skinCatalog.find(item => item.skinId === selectedTheme.id);
            const purchasable = locked && !!selectedCatalogItem?.purchasable;
            const canPurchase = purchasable && this.canAffordCatSkin(selectedCatalogItem);
            const actionLabel = selectedTheme.id === equippedTheme.id
                ? "当前启用"
                : purchasable ? `${this.getCatSkinPriceLabel(selectedCatalogItem)} 解锁`
                    : locked ? "尚未开放" : "启用皮肤";
            const action = purchasable ? "unlockCatSkin" : "applyCatSkin";
            const disabled = selectedTheme.id === equippedTheme.id || (locked && !canPurchase);
            return `<div class="skin-wardrobe" data-cat-tab-zone="skin"><div class="skin-preview-card"><span class="skin-preview-art" data-skin-art="${selectedTheme.artKey}" style="background-image:url('${previewArt}')"></span><strong>${selectedTheme.name}</strong><small>当前启用：${equippedTheme.name}</small><button class="skin-preview-action" data-action="${action}" data-skin-id="${selectedTheme.id}" data-price-type="${selectedCatalogItem?.priceType ?? ""}" data-price-amount="${selectedCatalogItem?.priceAmount ?? 0}" ${disabled ? "disabled" : ""}>${actionLabel}</button></div><div class="skin-list-target">${cards}</div></div>`;
        }
        const skillLevel = Math.max(1, Math.floor(data.level / 10) + 1);
        const nextSkillLevel = Math.min(3, skillLevel + 1);
        return `<div class="focus-card target-skill" data-cat-tab-zone="info"><span class="focus-icon" style="background-image:url('${skillIcon}')"></span><div class="focus-current"><strong>${this.getSkillName(config.skillId)}</strong><b>Lv.${skillLevel}</b><p>${this.getSkillDesc(config.role)}</p></div><div class="focus-next"><span>下一等级</span><b>Lv.${nextSkillLevel}</b><small>技能效果进一步提升</small></div><div class="target-skill-actions"><button class="mini-action skill-details" data-action="skillDetails" data-id="${catId}">详情</button><button class="mini-action green skill-upgrade" data-action="upgradeCat" data-id="${catId}" ${canUpgrade ? "" : "disabled"}>升级 <em>${this.formatNumber(upgradeCost)}</em></button></div></div>`;
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
        return `<div class="equip-layout ${detailClass}" data-cat-tab-zone="equip"><div class="equip-row">${row}<button class="equip-slot locked"><span class="equip-rarity">?</span><span class="equip-slot-tag">${CAT_LOCKED_EQUIPMENT_SLOT.slot}</span><i class="equip-icon asset" style="background-image:url('${this.getEquipIconAsset(CAT_LOCKED_EQUIPMENT_SLOT.kind)}')"></i><span class="equip-name">${CAT_LOCKED_EQUIPMENT_SLOT.name}</span><em>${CAT_LOCKED_EQUIPMENT_SLOT.unlockText}</em><span class="equip-bonus-pill">${CAT_LOCKED_EQUIPMENT_SLOT.bonus}</span><span class="equip-cta">${CAT_LOCKED_EQUIPMENT_SLOT.actionLabel}</span></button></div><div class="equip-bag"><strong>装备背包</strong><div>${backpack}</div><div class="equip-upgrade-info"><span>当前等级<b>Lv.${upgradeState.level}/${upgradeState.maxLevel}</b></span><span>下级预览<b>${nextText}</b></span><span>升级消耗<b>${upgradeState.cost} 金币</b></span></div><div class="equip-effect-info"><span>当前加成<b>${upgradeState.currentEffect}</b></span><span>下级加成<b>${upgradeState.nextEffect}</b></span></div><button class="equip-upgrade ${upgradeDisabled ? "disabled" : ""}" data-action="upgradeEquip" data-slot="${this._selectedEquipSlot}" data-id="${catId}" ${upgradeDisabled ? "disabled" : ""}>${upgradeLabel}</button></div></div>`;
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

    private getCatSkinAsset(skinId: CatSkinId): string {
        return getCatSkinAsset(skinId);
    }

    private canAffordCatSkin(item: CatSkinCatalogItemDto): boolean {
        if (item.priceType === "coin") return ResourceManager.canSpend({ coin: item.priceAmount });
        if (item.priceType === "diamond") return ResourceManager.canSpend({ diamond: item.priceAmount });
        return false;
    }

    private getCatSkinPriceLabel(item: CatSkinCatalogItemDto): string {
        const unit = item.priceType === "diamond" ? "钻石" : item.priceType === "coin" ? "金币" : "";
        return `${this.formatNumber(item.priceAmount)}${unit}`;
    }

    private getEquipIconAsset(kind: string): string {
        return getEquipIconAsset(kind);
    }

    private getRecruitBadgeAsset(): string {
        return getRecruitBadgeAsset();
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
