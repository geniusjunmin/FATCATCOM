import { GameConfig } from "../core/GameConfig";
import { EventBus, GameEvents } from "../core/EventBus";
import { ApiClient } from "../net/ApiClient";
import { BuildingStateDto, BuildingUpgradeResponse, CatAssignmentResponse, CatFeedResponse, CatSkinCatalogItemDto, CatSkinEquipResponse, CatSkinUnlockResponse, CatStateDto, CatUnlockResponse, CatUpgradeResponse, ClaimMailResponse, DailyOrderClaimResponse, DailyOrderDto, DecorCatalogItemDto, DecorCollectionClaimResponse, DecorCollectionDto, DecorPurchaseResponse, DecorStateDto, EquipmentUpgradeResponse, FriendActionResponse, FriendActivityDto, FriendBoostHistoryDto, FriendBoostStateDto, FriendCoopClaimResponse, FriendCoopGoalDto, FriendCoopTierClaimResponse, FriendDto, FriendHelpResponse, FriendRequestDto, FriendSearchResultDto, LaunchResponse, LeaderboardDto, MailDto, PlayerPresenceDto, PlayerSocialProfileDto, ProductionPreviewRequest, ProductionPreviewResponse, ResearchStateDto, ResearchUnlockResponse, ResourceStateDto, SettingsDto, ShopPurchaseResponse, ShopStateDto, SocialRealtimeEventDto } from "../net/ApiTypes";
import { FeatureSaveData, GameSaveData } from "../model/SaveData";
import { SaveManager } from "./SaveManager";
import { NetworkManager } from "./NetworkManager";
import { BuildingManager } from "./BuildingManager";
import { ProductionManager } from "./ProductionManager";
import { FriendBoostManager } from "./FriendBoostManager";
import { FriendCoopManager } from "./FriendCoopManager";
import { ResourceManager } from "./ResourceManager";
import { CatManager } from "./CatManager";
import { ResearchManager } from "./ResearchManager";
import { ShopManager } from "./ShopManager";
import { DailyOrderManager } from "./DailyOrderManager";

export type SyncSnapshot = {
    mode: "offline" | "ready" | "syncing" | "failed";
    lastSyncAt: number;
    lastError: string;
    pendingFeatureChanges: number;
};

export class SyncManager {
    private static _snapshot: SyncSnapshot = {
        mode: "offline",
        lastSyncAt: 0,
        lastError: "",
        pendingFeatureChanges: 0,
    };
    private static _presenceTouchInFlight: Promise<PlayerPresenceDto | null> | null = null;
    private static _lastPresence: PlayerPresenceDto | null = null;
    private static _lastPresenceAt = 0;
    private static _lastPresencePlayerId = "";
    private static _socialEventSource: EventSource | null = null;
    private static _socialEventPlayerId = "";

    public static initialize(): SyncSnapshot {
        this.refreshPendingFeatureChanges();
        EventBus.on<GameSaveData>(GameEvents.SAVE_UPDATED, this.onSaveUpdated);
        return this.getSnapshot();
    }

    public static destroy(): void {
        EventBus.off<GameSaveData>(GameEvents.SAVE_UPDATED, this.onSaveUpdated);
        this.stopSocialEventStream();
    }

    public static getSnapshot(): SyncSnapshot {
        return { ...this._snapshot };
    }

    public static getFeatureStateDto(): FeatureSaveData {
        const featureState = SaveManager.isInitialized() ? SaveManager.data.featureState : undefined;
        return {
            claimedMails: { ...(featureState?.claimedMails ?? {}) },
            settings: { ...(featureState?.settings ?? {}) },
            friendGifts: { ...(featureState?.friendGifts ?? {}) },
            friendVisits: { ...(featureState?.friendVisits ?? {}) },
        };
    }

    public static async tryGuestLogin(): Promise<boolean> {
        if (!NetworkManager.canUseServer || !SaveManager.isInitialized()) {
            this.setOffline();
            return false;
        }
        const response = await ApiClient.authGuest({
            deviceId: NetworkManager.createGuestDeviceId(),
            companyName: SaveManager.data.player.companyName,
        });
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "guest_login_failed");
            return false;
        }
        NetworkManager.setToken(response.data.token);
        NetworkManager.setPlayerId(response.data.playerId);
        NetworkManager.markReady();
        this._snapshot.mode = "ready";
        this.emitSyncChanged();
        void this.fetchServerResources();
        void this.fetchServerCats();
        void this.fetchServerCatSkinCatalog();
        void this.fetchServerBuildings();
        void this.fetchServerResearch();
        void this.fetchServerShopState();
        void this.fetchServerFriends();
        void this.fetchServerSocialProfile();
        void this.fetchServerFriendActivities();
        void this.fetchServerLeaderboard();
        void this.touchServerPresence();
        void this.fetchServerFriendBoost();
        void this.fetchServerFriendBoostHistory();
        void this.fetchServerFriendCoopGoal();
        void this.fetchServerDailyOrder();
        this.startSocialEventStream();
        return true;
    }

    public static startSocialEventStream(): void {
        if (typeof EventSource === "undefined" || !NetworkManager.canUseServer || !NetworkManager.playerId) {
            return;
        }
        if (this._socialEventSource && this._socialEventPlayerId === NetworkManager.playerId) {
            return;
        }
        this.stopSocialEventStream();
        this._socialEventPlayerId = NetworkManager.playerId;
        const source = new EventSource(ApiClient.socialEventStreamUrl(NetworkManager.playerId));
        source.onmessage = (event) => {
            try {
                const socialEvent = JSON.parse(event.data) as SocialRealtimeEventDto;
                if (socialEvent.eventType === "friend_help" && socialEvent.boostEndsAt) {
                    FriendBoostManager.apply({
                        active: true,
                        boostPercent: socialEvent.boostPercent,
                        boostEndsAt: socialEvent.boostEndsAt,
                        boostedByName: socialEvent.actorCompanyName,
                        serverTime: socialEvent.createdAt,
                    });
                    void this.fetchServerFriendBoostHistory();
                    if (socialEvent.coopTarget > 0) {
                        FriendCoopManager.applyRealtimeProgress(
                            socialEvent.coopProgress,
                            socialEvent.coopTarget,
                            socialEvent.coopClaimable,
                            socialEvent.createdAt,
                        );
                    }
                }
                EventBus.emit(GameEvents.SOCIAL_REALTIME_EVENT, socialEvent);
            } catch (error) {
                console.warn("[SyncManager] Invalid realtime social event.", error);
            }
        };
        this._socialEventSource = source;
    }

    public static stopSocialEventStream(): void {
        this._socialEventSource?.close();
        this._socialEventSource = null;
        this._socialEventPlayerId = "";
    }

    public static async touchServerPresence(): Promise<PlayerPresenceDto | null> {
        if (this._presenceTouchInFlight) {
            return this._presenceTouchInFlight;
        }
        if (this._lastPresence
            && this._lastPresencePlayerId === NetworkManager.playerId
            && Date.now() - this._lastPresenceAt < 30000) {
            return this._lastPresence;
        }
        this._presenceTouchInFlight = this.performPresenceTouch();
        try {
            return await this._presenceTouchInFlight;
        } finally {
            this._presenceTouchInFlight = null;
        }
    }

    private static async performPresenceTouch(): Promise<PlayerPresenceDto | null> {
        if (!this.canCallServer()) return null;
        const response = await ApiClient.touchPresence(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "presence_touch_failed");
            return null;
        }
        this._lastPresence = response.data;
        this._lastPresenceAt = Date.now();
        this._lastPresencePlayerId = NetworkManager.playerId;
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async syncSave(): Promise<boolean> {
        if (!NetworkManager.canUseServer || !SaveManager.isInitialized()) {
            this.setOffline();
            return false;
        }
        this._snapshot.mode = "syncing";
        this.emitSyncChanged();
        const save = SaveManager.snapshot();
        const response = await ApiClient.syncSave(NetworkManager.playerId, {
            clientVersion: GameConfig.saveVersion,
            localUpdatedAt: save.updatedAt,
            save,
        });
        if (!response.ok || !response.data?.accepted) {
            this.markFailed(response.error ?? response.data?.conflictReason ?? "save_sync_failed");
            return false;
        }
        this._snapshot.mode = "ready";
        this._snapshot.lastError = "";
        this._snapshot.lastSyncAt = Date.now();
        await this.fetchServerResources();
        await this.fetchServerCats();
        await this.fetchServerCatSkinCatalog();
        await this.fetchServerBuildings();
        await this.fetchServerResearch();
        await this.fetchServerShopState();
        await this.fetchServerFriends();
        await this.fetchServerSocialProfile();
        await this.fetchServerFriendActivities();
        await this.fetchServerLeaderboard();
        await this.fetchServerDailyOrder();
        this.refreshPendingFeatureChanges();
        this.emitSyncChanged();
        return true;
    }

    public static async fetchServerResources(): Promise<ResourceStateDto | null> {
        if (!this.canCallServer()) return null;
        const response = await ApiClient.getResources(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "resources_fetch_failed");
            return null;
        }
        ResourceManager.applyServerSnapshot({
            coin: response.data.coin,
            bean: response.data.bean,
            catFood: response.data.catFood,
            diamond: response.data.diamond,
            researchPoint: response.data.researchPoint,
        }, "server_resources");
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerDailyOrder(): Promise<DailyOrderDto | null> {
        if (!this.canCallServer()) return null;
        const response = await ApiClient.getDailyOrder(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "daily_order_fetch_failed");
            return null;
        }
        DailyOrderManager.apply(response.data);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async claimServerDailyOrder(): Promise<DailyOrderClaimResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.claimDailyOrder(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "daily_order_claim_failed");
            return null;
        }
        DailyOrderManager.apply(response.data.order);
        ResourceManager.applyServerSnapshot({
            coin: response.data.coinBalance,
            bean: response.data.beanBalance,
            catFood: response.data.catFoodBalance,
            diamond: response.data.diamondBalance,
            researchPoint: response.data.researchPointBalance,
        }, "server_daily_order_claim");
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerCats(): Promise<CatStateDto[]> {
        if (!this.canCallServer()) return [];
        const response = await ApiClient.getCats(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "cats_fetch_failed");
            return [];
        }
        CatManager.applyServerSnapshot(response.data);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerCatSkinCatalog(catId = "c_001"): Promise<CatSkinCatalogItemDto[]> {
        if (!this.canCallServer()) return [];
        const response = await ApiClient.getCatSkinCatalog(NetworkManager.playerId, catId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "cat_skin_catalog_fetch_failed");
            return [];
        }
        CatManager.applyServerSkinCatalog(response.data);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerBuildings(): Promise<BuildingStateDto[]> {
        if (!this.canCallServer()) return [];
        const response = await ApiClient.getBuildings(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "buildings_fetch_failed");
            return [];
        }
        BuildingManager.applyServerSnapshot(response.data);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerResearch(): Promise<ResearchStateDto[]> {
        if (!this.canCallServer()) return [];
        const response = await ApiClient.getResearch(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "research_fetch_failed");
            return [];
        }
        ResearchManager.applyServerSnapshot(response.data);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerShopState(): Promise<ShopStateDto[]> {
        if (!this.canCallServer()) return [];
        const response = await ApiClient.getShopState(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "shop_state_fetch_failed");
            return [];
        }
        ShopManager.applyServerSnapshot(response.data);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerMail(): Promise<MailDto[]> {
        if (!this.canCallServer()) return [];
        const response = await ApiClient.getMail(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "mail_fetch_failed");
            return [];
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async claimServerMail(mailId: string): Promise<ClaimMailResponse | null> {
        if (!this.canCallServer()) return null;
        const response = await ApiClient.claimMail(NetworkManager.playerId, mailId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "mail_claim_failed");
            return null;
        }
        ResourceManager.applyServerSnapshot({
            coin: response.data.coinBalance,
            bean: response.data.beanBalance,
            catFood: response.data.catFoodBalance,
            diamond: response.data.diamondBalance,
            researchPoint: response.data.researchPointBalance,
        }, `server_mail_${mailId}`);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async purchaseServerShopItem(shopItemId: string, count = 1): Promise<ShopPurchaseResponse | null> {
        if (!this.canCallServer()) return null;
        const response = await ApiClient.purchaseShopItem(NetworkManager.playerId, { shopItemId, count });
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "shop_purchase_failed");
            return null;
        }
        ResourceManager.applyServerSnapshot({
            coin: response.data.coinBalance,
            bean: response.data.beanBalance,
            catFood: response.data.catFoodBalance,
            diamond: response.data.diamondBalance,
            researchPoint: response.data.researchPointBalance,
        }, `server_shop_${shopItemId}`);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async upgradeServerCat(catId: string): Promise<CatUpgradeResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.upgradeCat(NetworkManager.playerId, catId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "cat_upgrade_failed");
            return null;
        }
        ResourceManager.applyServerSnapshot({
            coin: response.data.coinBalance,
            bean: response.data.beanBalance,
            catFood: response.data.catFoodBalance,
            diamond: response.data.diamondBalance,
            researchPoint: response.data.researchPointBalance,
        }, `server_cat_upgrade_${catId}`);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async feedServerCat(catId: string): Promise<CatFeedResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.feedCat(NetworkManager.playerId, catId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "cat_feed_failed");
            return null;
        }
        ResourceManager.applyServerSnapshot({
            coin: response.data.coinBalance,
            bean: response.data.beanBalance,
            catFood: response.data.catFoodBalance,
            diamond: response.data.diamondBalance,
            researchPoint: response.data.researchPointBalance,
        }, `server_cat_feed_${catId}`);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async unlockServerCat(catId: string): Promise<CatUnlockResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.unlockCat(NetworkManager.playerId, catId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "cat_unlock_failed");
            return null;
        }
        ResourceManager.applyServerSnapshot({
            coin: response.data.coinBalance,
            bean: response.data.beanBalance,
            catFood: response.data.catFoodBalance,
            diamond: response.data.diamondBalance,
            researchPoint: response.data.researchPointBalance,
        }, `server_cat_unlock_${catId}`);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async unlockServerResearch(researchId: string): Promise<ResearchUnlockResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.unlockResearch(NetworkManager.playerId, researchId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "research_unlock_failed");
            return null;
        }
        ResourceManager.applyServerSnapshot({
            coin: response.data.coinBalance,
            bean: response.data.beanBalance,
            catFood: response.data.catFoodBalance,
            diamond: response.data.diamondBalance,
            researchPoint: response.data.researchPointBalance,
        }, `server_research_${researchId}`);
        ResearchManager.applyServerUnlock(response.data.researchId, response.data.level);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async upgradeServerEquipment(catId: string, itemId: string): Promise<EquipmentUpgradeResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.upgradeEquipment(NetworkManager.playerId, catId, itemId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "equipment_upgrade_failed");
            return null;
        }
        ResourceManager.applyServerSnapshot({
            coin: response.data.coinBalance,
            bean: response.data.beanBalance,
            catFood: response.data.catFoodBalance,
            diamond: response.data.diamondBalance,
            researchPoint: response.data.researchPointBalance,
        }, `server_equipment_upgrade_${response.data.itemId}`);
        CatManager.applyServerEquipmentUpgrade(response.data.catId, response.data.itemId, response.data.level);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async equipServerCatSkin(catId: string, skinId: string): Promise<CatSkinEquipResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.equipCatSkin(NetworkManager.playerId, catId, skinId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "cat_skin_equip_failed");
            return null;
        }
        CatManager.applyServerSkin(response.data.catId, response.data.equippedSkinId, response.data.ownedSkinIds);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async unlockServerCatSkin(catId: string, skinId: string): Promise<CatSkinUnlockResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.unlockCatSkin(NetworkManager.playerId, catId, skinId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "cat_skin_unlock_failed");
            return null;
        }
        ResourceManager.applyServerSnapshot({
            coin: response.data.coinBalance,
            bean: response.data.beanBalance,
            catFood: response.data.catFoodBalance,
            diamond: response.data.diamondBalance,
            researchPoint: response.data.researchPointBalance,
        }, `server_cat_skin_${skinId}`);
        CatManager.applyServerSkin(response.data.catId, response.data.equippedSkinId, response.data.ownedSkinIds);
        await this.fetchServerCatSkinCatalog(catId);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async assignServerCat(catId: string, buildingId: string): Promise<CatAssignmentResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.assignCat(NetworkManager.playerId, catId, buildingId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "cat_assignment_failed");
            return null;
        }
        CatManager.applyServerAssignment(response.data.catId, response.data.assignedBuildingId);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async upgradeServerBuilding(buildingId: string): Promise<BuildingUpgradeResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.upgradeBuilding(NetworkManager.playerId, buildingId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "building_upgrade_failed");
            return null;
        }
        ResourceManager.applyServerSnapshot({
            coin: response.data.coinBalance,
            bean: response.data.beanBalance,
            catFood: response.data.catFoodBalance,
            diamond: response.data.diamondBalance,
            researchPoint: response.data.researchPointBalance,
        }, `server_building_upgrade_${response.data.buildingId}`);
        BuildingManager.applyServerUpgrade(response.data.buildingId, response.data.level);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerFriends(): Promise<FriendDto[]> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return [];
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return [];
        }
        const response = await ApiClient.getFriends(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friends_fetch_failed");
            return [];
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerDecorations(): Promise<DecorStateDto[]> {
        if (!this.canCallServer()) return [];
        const response = await ApiClient.getDecorations(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "decor_fetch_failed");
            return [];
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerDecorCatalog(): Promise<DecorCatalogItemDto[]> {
        if (!this.canCallServer()) return [];
        const response = await ApiClient.getDecorCatalog(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "decor_catalog_fetch_failed");
            return [];
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async purchaseServerDecoration(decorId: string): Promise<DecorPurchaseResponse | null> {
        if (!this.canCallServer()) return null;
        const response = await ApiClient.purchaseDecoration(NetworkManager.playerId, decorId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "decor_purchase_failed");
            return null;
        }
        ResourceManager.applyServerSnapshot({
            coin: response.data.coinBalance,
            bean: response.data.beanBalance,
            catFood: response.data.catFoodBalance,
            diamond: response.data.diamondBalance,
            researchPoint: response.data.researchPointBalance,
        }, `server_decor_${decorId}`);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerDecorCollection(): Promise<DecorCollectionDto | null> {
        if (!this.canCallServer()) return null;
        const response = await ApiClient.getDecorCollection(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "decor_collection_fetch_failed");
            return null;
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async claimServerDecorCollectionTier(tierId: string): Promise<DecorCollectionClaimResponse | null> {
        if (!this.canCallServer()) return null;
        const response = await ApiClient.claimDecorCollectionTier(NetworkManager.playerId, tierId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "decor_collection_claim_failed");
            return null;
        }
        ResourceManager.applyServerSnapshot({
            coin: response.data.coinBalance,
            bean: response.data.beanBalance,
            catFood: response.data.catFoodBalance,
            diamond: response.data.diamondBalance,
            researchPoint: response.data.researchPointBalance,
        }, `server_decor_collection_${tierId}`);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async updateServerDecorPlacement(
        decorId: string,
        buildingId: string,
        isPlaced: boolean,
    ): Promise<DecorStateDto | null> {
        if (!this.canCallServer()) return null;
        const response = await ApiClient.updateDecorPlacement(
            NetworkManager.playerId,
            decorId,
            { buildingId, isPlaced },
        );
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "decor_placement_failed");
            return null;
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerFriend(friendId: string): Promise<FriendDto | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.getFriend(NetworkManager.playerId, friendId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_fetch_failed");
            return null;
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerSocialProfile(): Promise<PlayerSocialProfileDto | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.getSocialProfile(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "social_profile_fetch_failed");
            return null;
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async searchServerFriend(query: string): Promise<FriendSearchResultDto | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.searchFriend(NetworkManager.playerId, query);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_search_failed");
            return null;
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerFriendActivities(limit = 10): Promise<FriendActivityDto[]> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return [];
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return [];
        }
        const response = await ApiClient.getFriendActivities(NetworkManager.playerId, limit);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_activity_fetch_failed");
            return [];
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerFriendBoost(): Promise<FriendBoostStateDto | null> {
        if (!NetworkManager.canUseServer || !NetworkManager.playerId) {
            return null;
        }
        const response = await ApiClient.getFriendBoost(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_boost_fetch_failed");
            return null;
        }
        FriendBoostManager.apply(response.data);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerFriendBoostHistory(): Promise<FriendBoostHistoryDto | null> {
        if (!NetworkManager.canUseServer || !NetworkManager.playerId) {
            return null;
        }
        const response = await ApiClient.getFriendBoostHistory(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_boost_history_fetch_failed");
            return null;
        }
        FriendBoostManager.applyHistory(response.data);
        EventBus.emit(GameEvents.FRIEND_BOOST_HISTORY_CHANGED, response.data);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerFriendCoopGoal(): Promise<FriendCoopGoalDto | null> {
        if (!NetworkManager.canUseServer || !NetworkManager.playerId) {
            return null;
        }
        const response = await ApiClient.getFriendCoopGoal(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_coop_goal_fetch_failed");
            return null;
        }
        FriendCoopManager.apply(response.data);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async claimServerFriendCoopGoal(): Promise<FriendCoopClaimResponse | null> {
        if (!NetworkManager.canUseServer || !NetworkManager.playerId) {
            this.setOffline();
            return null;
        }
        const response = await ApiClient.claimFriendCoopGoal(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_coop_goal_claim_failed");
            return null;
        }
        FriendCoopManager.apply(response.data.goal);
        ResourceManager.applyServerSnapshot({
            coin: response.data.coinBalance,
            bean: response.data.beanBalance,
            catFood: response.data.catFoodBalance,
            diamond: response.data.diamondBalance,
            researchPoint: response.data.researchPointBalance,
        }, "server_friend_coop_goal");
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async claimServerFriendCoopTier(tierId: string): Promise<FriendCoopTierClaimResponse | null> {
        if (!NetworkManager.canUseServer || !NetworkManager.playerId) {
            this.setOffline();
            return null;
        }
        const response = await ApiClient.claimFriendCoopTier(NetworkManager.playerId, tierId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_coop_tier_claim_failed");
            return null;
        }
        FriendCoopManager.apply(response.data.goal);
        ResourceManager.applyServerSnapshot({
            coin: response.data.coinBalance,
            bean: response.data.beanBalance,
            catFood: response.data.catFoodBalance,
            diamond: response.data.diamondBalance,
            researchPoint: response.data.researchPointBalance,
        }, `server_friend_coop_${tierId}`);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async addServerFriend(friendQuery: string): Promise<FriendDto | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.addFriend(NetworkManager.playerId, { friendPlayerId: friendQuery, inviteCode: friendQuery });
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_add_failed");
            return null;
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async createServerFriendRequest(friendQuery: string): Promise<FriendRequestDto | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.createFriendRequest(NetworkManager.playerId, { friendPlayerId: friendQuery, inviteCode: friendQuery });
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_request_failed");
            return null;
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerFriendRequests(box: "received" | "sent" = "received"): Promise<FriendRequestDto[]> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return [];
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return [];
        }
        const response = await ApiClient.getFriendRequests(NetworkManager.playerId, box);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_requests_fetch_failed");
            return [];
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async acceptServerFriendRequest(requestId: string): Promise<FriendRequestDto | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.acceptFriendRequest(NetworkManager.playerId, requestId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_request_accept_failed");
            return null;
        }
        await this.fetchServerFriends();
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async rejectServerFriendRequest(requestId: string): Promise<FriendRequestDto | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.rejectFriendRequest(NetworkManager.playerId, requestId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_request_reject_failed");
            return null;
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async visitServerFriend(friendId: string): Promise<FriendActionResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.visitFriend(NetworkManager.playerId, friendId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_visit_failed");
            return null;
        }
        this.applyFriendActionResources(response.data, `server_friend_visit_${friendId}`);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async sendServerFriendGift(friendId: string): Promise<FriendActionResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.sendFriendGift(NetworkManager.playerId, friendId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_gift_failed");
            return null;
        }
        this.applyFriendActionResources(response.data, `server_friend_gift_${friendId}`);
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async helpServerFriend(friendId: string): Promise<FriendHelpResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.helpFriend(NetworkManager.playerId, friendId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "friend_help_failed");
            return null;
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerLeaderboard(boardId = "income"): Promise<LeaderboardDto | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.getLeaderboard(NetworkManager.playerId, boardId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "leaderboard_fetch_failed");
            return null;
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async fetchServerSettings(): Promise<SettingsDto | null> {
        if (!this.canCallServer()) return null;
        const response = await ApiClient.getSettings(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "settings_fetch_failed");
            return null;
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async pushServerSettings(settings: FeatureSaveData["settings"]): Promise<SettingsDto | null> {
        if (!this.canCallServer()) return null;
        const response = await ApiClient.updateSettings(NetworkManager.playerId, { settings });
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "settings_update_failed");
            return null;
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async previewProduction(): Promise<ProductionPreviewResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const response = await ApiClient.previewServerProduction(NetworkManager.playerId);
        if (!response.ok || !response.data) {
            this.markFailed(response.error ?? "production_preview_failed");
            return null;
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    public static async launch(seconds = 10): Promise<LaunchResponse | null> {
        if (!NetworkManager.canUseServer) {
            this.setOffline();
            return null;
        }
        if (!NetworkManager.playerId) {
            const loggedIn = await this.tryGuestLogin();
            if (!loggedIn) return null;
        }
        const preview = await this.previewProduction();
        if (!preview) {
            return null;
        }
        const response = await ApiClient.launch(NetworkManager.playerId, {
            clientRequestId: `client_${Date.now()}`,
            launchSeconds: seconds,
            availableBean: ResourceManager.get("bean"),
            production: this.createProductionPreviewRequestFromPreview(preview),
        });
        if (response.data?.dailyOrder) {
            DailyOrderManager.apply(response.data.dailyOrder);
        }
        if (!response.ok || !response.data?.accepted) {
            if (response.data?.rejectedReason) {
                this.markReadyAfterServerCall();
            } else {
                this.markFailed(response.error ?? "launch_failed");
            }
            return response.data ?? null;
        }
        this.markReadyAfterServerCall();
        return response.data;
    }

    private static onSaveUpdated = (): void => {
        this.refreshPendingFeatureChanges();
        this.emitSyncChanged();
    };

    private static refreshPendingFeatureChanges(): void {
        const featureState = this.getFeatureStateDto();
        this._snapshot.pendingFeatureChanges =
            Object.keys(featureState.claimedMails).length
            + Object.keys(featureState.friendGifts).length
            + Object.keys(featureState.friendVisits).length
            + Object.keys(featureState.settings).length;
    }

    private static setOffline(): void {
        this._snapshot.mode = "offline";
        this._snapshot.lastError = "";
        this.refreshPendingFeatureChanges();
        this.emitSyncChanged();
    }

    private static canCallServer(): boolean {
        if (!NetworkManager.canUseServer || !NetworkManager.playerId) {
            this.setOffline();
            return false;
        }
        return true;
    }

    private static createProductionPreviewRequest(): ProductionPreviewRequest {
        const snapshot = ProductionManager.calculateSnapshot();
        return {
            grossCoinPerSecond: snapshot.grossCoinPerSecond,
            wageCostPerSecond: snapshot.wageCostPerSecond,
            beanCostPerSecond: snapshot.beanCostPerSecond,
            includesClientModifiers: true,
            buildings: BuildingManager.getAll().map(building => ({
                buildingId: building.id,
                grossCoinPerSecond: snapshot.buildingGrossCoinPerSecond[building.id] ?? 0,
                wageCostPerSecond: snapshot.buildingWageCostPerSecond[building.id] ?? 0,
                netCoinPerSecond: snapshot.buildingCoinPerSecond[building.id] ?? 0,
                beanCostPerSecond: snapshot.buildingBeanCostPerSecond[building.id] ?? 0,
            })),
        };
    }

    private static applyFriendActionResources(response: FriendActionResponse, source: string): void {
        ResourceManager.applyServerSnapshot({
            coin: response.coinBalance,
            bean: response.beanBalance,
            catFood: response.catFoodBalance,
            diamond: response.diamondBalance,
            researchPoint: response.researchPointBalance,
        }, source);
    }

    private static createProductionPreviewRequestFromPreview(preview: ProductionPreviewResponse): ProductionPreviewRequest {
        return {
            grossCoinPerSecond: preview.grossCoinPerSecond,
            wageCostPerSecond: preview.wageCostPerSecond,
            beanCostPerSecond: preview.beanCostPerSecond,
            includesClientModifiers: true,
            buildings: preview.buildings.map(building => ({
                buildingId: building.buildingId,
                grossCoinPerSecond: building.grossCoinPerSecond,
                wageCostPerSecond: building.wageCostPerSecond,
                netCoinPerSecond: building.netCoinPerSecond,
                beanCostPerSecond: building.beanCostPerSecond,
            })),
        };
    }

    private static markReadyAfterServerCall(): void {
        NetworkManager.markReady();
        this._snapshot.mode = "ready";
        this._snapshot.lastError = "";
        this._snapshot.lastSyncAt = Date.now();
        this.refreshPendingFeatureChanges();
        this.emitSyncChanged();
    }

    private static markFailed(error: string): void {
        NetworkManager.markError(error);
        this._snapshot.mode = "failed";
        this._snapshot.lastError = error;
        this.refreshPendingFeatureChanges();
        this.emitSyncChanged();
    }

    private static emitSyncChanged(): void {
        EventBus.emit(GameEvents.SYNC_STATUS_CHANGED, this.getSnapshot());
    }
}
