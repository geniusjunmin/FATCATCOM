import { GameConfig } from "../core/GameConfig";
import { ApiEnvelope, AuthGuestRequest, AuthGuestResponse, BootstrapDto, BuildingStateDto, BuildingUpgradeResponse, CatAssignmentResponse, CatFeedResponse, CatStateDto, CatUnlockResponse, CatUpgradeResponse, ClaimMailResponse, EquipmentUpgradeResponse, FriendDto, LaunchRequest, LaunchResponse, MailDto, ProductionPreviewRequest, ProductionPreviewResponse, ResearchStateDto, ResearchUnlockResponse, ResourceStateDto, SaveSyncRequest, SaveSyncResponse, SettingsDto, ShopPurchaseRequest, ShopPurchaseResponse, ShopStateDto } from "./ApiTypes";

export class ApiClient {
    private static _baseUrl: string = GameConfig.apiBaseUrl;
    private static _token = "";

    public static configure(options: { baseUrl?: string; token?: string } = {}): void {
        if (options.baseUrl !== undefined) {
            this._baseUrl = options.baseUrl.replace(/\/+$/, "");
        }
        if (options.token !== undefined) {
            this._token = options.token;
        }
    }

    public static get baseUrl(): string {
        return this._baseUrl;
    }

    public static get hasToken(): boolean {
        return this._token.length > 0;
    }

    public static authGuest(request: AuthGuestRequest): Promise<ApiEnvelope<AuthGuestResponse>> {
        return this.post("/api/auth/guest", request);
    }

    public static getBootstrap(): Promise<ApiEnvelope<BootstrapDto>> {
        return this.get("/api/config/bootstrap");
    }

    public static syncSave(playerId: string, request: SaveSyncRequest): Promise<ApiEnvelope<SaveSyncResponse>> {
        return this.post(`/api/save/sync?playerId=${encodeURIComponent(playerId)}`, request);
    }

    public static getSave(playerId: string): Promise<ApiEnvelope<unknown>> {
        return this.get(`/api/save?playerId=${encodeURIComponent(playerId)}`);
    }

    public static getResources(playerId: string): Promise<ApiEnvelope<ResourceStateDto>> {
        return this.get(`/api/resources?playerId=${encodeURIComponent(playerId)}`);
    }

    public static getMail(playerId: string): Promise<ApiEnvelope<MailDto[]>> {
        return this.get(`/api/mail?playerId=${encodeURIComponent(playerId)}`);
    }

    public static claimMail(playerId: string, mailId: string): Promise<ApiEnvelope<ClaimMailResponse>> {
        return this.post(`/api/mail/${encodeURIComponent(mailId)}/claim?playerId=${encodeURIComponent(playerId)}`, {});
    }

    public static purchaseShopItem(playerId: string, request: ShopPurchaseRequest): Promise<ApiEnvelope<ShopPurchaseResponse>> {
        return this.post(`/api/shop/purchase?playerId=${encodeURIComponent(playerId)}`, request);
    }

    public static getShopState(playerId: string): Promise<ApiEnvelope<ShopStateDto[]>> {
        return this.get(`/api/shop/state?playerId=${encodeURIComponent(playerId)}`);
    }

    public static upgradeCat(playerId: string, catId: string): Promise<ApiEnvelope<CatUpgradeResponse>> {
        return this.post(`/api/cats/${encodeURIComponent(catId)}/upgrade?playerId=${encodeURIComponent(playerId)}`, {});
    }

    public static feedCat(playerId: string, catId: string): Promise<ApiEnvelope<CatFeedResponse>> {
        return this.post(`/api/cats/${encodeURIComponent(catId)}/feed?playerId=${encodeURIComponent(playerId)}`, {});
    }

    public static unlockCat(playerId: string, catId: string): Promise<ApiEnvelope<CatUnlockResponse>> {
        return this.post(`/api/cats/${encodeURIComponent(catId)}/unlock?playerId=${encodeURIComponent(playerId)}`, {});
    }

    public static getCats(playerId: string): Promise<ApiEnvelope<CatStateDto[]>> {
        return this.get(`/api/cats?playerId=${encodeURIComponent(playerId)}`);
    }

    public static upgradeEquipment(playerId: string, catId: string, itemId: string): Promise<ApiEnvelope<EquipmentUpgradeResponse>> {
        return this.post(`/api/cats/${encodeURIComponent(catId)}/equipment/${encodeURIComponent(itemId)}/upgrade?playerId=${encodeURIComponent(playerId)}`, {});
    }

    public static assignCat(playerId: string, catId: string, buildingId: string): Promise<ApiEnvelope<CatAssignmentResponse>> {
        return this.post(`/api/cats/${encodeURIComponent(catId)}/assignment?playerId=${encodeURIComponent(playerId)}`, { buildingId });
    }

    public static getBuildings(playerId: string): Promise<ApiEnvelope<BuildingStateDto[]>> {
        return this.get(`/api/buildings?playerId=${encodeURIComponent(playerId)}`);
    }

    public static upgradeBuilding(playerId: string, buildingId: string): Promise<ApiEnvelope<BuildingUpgradeResponse>> {
        return this.post(`/api/buildings/${encodeURIComponent(buildingId)}/upgrade?playerId=${encodeURIComponent(playerId)}`, {});
    }

    public static getResearch(playerId: string): Promise<ApiEnvelope<ResearchStateDto[]>> {
        return this.get(`/api/research?playerId=${encodeURIComponent(playerId)}`);
    }

    public static unlockResearch(playerId: string, researchId: string): Promise<ApiEnvelope<ResearchUnlockResponse>> {
        return this.post(`/api/research/${encodeURIComponent(researchId)}/unlock?playerId=${encodeURIComponent(playerId)}`, {});
    }

    public static getFriends(playerId: string): Promise<ApiEnvelope<FriendDto[]>> {
        return this.get(`/api/friends?playerId=${encodeURIComponent(playerId)}`);
    }

    public static visitFriend(playerId: string, friendId: string): Promise<ApiEnvelope<FriendDto>> {
        return this.post(`/api/friends/${encodeURIComponent(friendId)}/visit?playerId=${encodeURIComponent(playerId)}`, {});
    }

    public static sendFriendGift(playerId: string, friendId: string): Promise<ApiEnvelope<FriendDto>> {
        return this.post(`/api/friends/${encodeURIComponent(friendId)}/gift?playerId=${encodeURIComponent(playerId)}`, {});
    }

    public static getSettings(playerId: string): Promise<ApiEnvelope<SettingsDto>> {
        return this.get(`/api/settings?playerId=${encodeURIComponent(playerId)}`);
    }

    public static updateSettings(playerId: string, request: SettingsDto): Promise<ApiEnvelope<SettingsDto>> {
        return this.post(`/api/settings?playerId=${encodeURIComponent(playerId)}`, request);
    }

    public static previewProduction(request: ProductionPreviewRequest, playerId = ""): Promise<ApiEnvelope<ProductionPreviewResponse>> {
        const query = playerId ? `?playerId=${encodeURIComponent(playerId)}` : "";
        return this.post(`/api/production/preview${query}`, request);
    }

    public static previewServerProduction(playerId: string): Promise<ApiEnvelope<ProductionPreviewResponse>> {
        return this.get(`/api/production/server-preview?playerId=${encodeURIComponent(playerId)}`);
    }

    public static launch(playerId: string, request: LaunchRequest): Promise<ApiEnvelope<LaunchResponse>> {
        return this.post(`/api/launch?playerId=${encodeURIComponent(playerId)}`, request);
    }

    private static get<T>(path: string): Promise<ApiEnvelope<T>> {
        return this.request<T>("GET", path);
    }

    private static post<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
        return this.request<T>("POST", path, body);
    }

    private static async request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<ApiEnvelope<T>> {
        if (!this._baseUrl) {
            return { ok: false, error: "api_base_url_missing" };
        }
        if (typeof fetch === "undefined") {
            return { ok: false, error: "fetch_unavailable" };
        }

        try {
            const response = await fetch(`${this._baseUrl}${path}`, {
                method,
                headers: this.createHeaders(body !== undefined),
                body: body === undefined ? undefined : JSON.stringify(body),
            });
            const text = await response.text();
            const parsed = text ? JSON.parse(text) as ApiEnvelope<T> | T : undefined;
            if (!response.ok) {
                return { ok: false, error: `http_${response.status}` };
            }
            if (parsed && typeof parsed === "object" && "ok" in parsed) {
                return parsed as ApiEnvelope<T>;
            }
            return { ok: true, data: parsed as T };
        } catch (error) {
            return { ok: false, error: error instanceof Error ? error.message : "network_error" };
        }
    }

    private static createHeaders(hasBody: boolean): Record<string, string> {
        const headers: Record<string, string> = {};
        if (hasBody) {
            headers["Content-Type"] = "application/json";
        }
        if (this._token) {
            headers.Authorization = `Bearer ${this._token}`;
        }
        return headers;
    }
}
