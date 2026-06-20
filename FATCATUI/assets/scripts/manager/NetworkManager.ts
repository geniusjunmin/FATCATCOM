import { sys } from "cc";
import { GameConfig } from "../core/GameConfig";
import { EventBus, GameEvents } from "../core/EventBus";
import { SaveManager } from "./SaveManager";
import { ApiClient } from "../net/ApiClient";

export type NetworkStatus = {
    online: boolean;
    serverMode: "offline" | "ready" | "unconfigured" | "error";
    playerId: string;
    lastError: string;
    lastCheckedAt: number;
};

export class NetworkManager {
    private static _status: NetworkStatus = {
        online: false,
        serverMode: "unconfigured",
        playerId: "",
        lastError: "",
        lastCheckedAt: 0,
    };

    public static initialize(): NetworkStatus {
        ApiClient.configure({ baseUrl: this.resolveApiBaseUrl() });
        this._status.online = !!sys.isBrowser && typeof navigator !== "undefined" ? navigator.onLine : true;
        this._status.serverMode = ApiClient.baseUrl ? "offline" : "unconfigured";
        this._status.lastCheckedAt = Date.now();
        this.emitStatus();
        return this.getStatus();
    }

    public static getStatus(): NetworkStatus {
        return { ...this._status };
    }

    public static get canUseServer(): boolean {
        return !!ApiClient.baseUrl && this._status.online;
    }

    public static setToken(token: string): void {
        ApiClient.configure({ token });
    }

    public static setPlayerId(playerId: string): void {
        this._status.playerId = playerId;
        this.emitStatus();
    }

    public static get playerId(): string {
        return this._status.playerId;
    }

    public static markReady(): void {
        this._status.serverMode = "ready";
        this._status.lastError = "";
        this._status.lastCheckedAt = Date.now();
        this.emitStatus();
    }

    public static markError(error: string): void {
        this._status.serverMode = ApiClient.baseUrl ? "error" : "unconfigured";
        this._status.lastError = error;
        this._status.lastCheckedAt = Date.now();
        this.emitStatus();
    }

    public static createGuestDeviceId(): string {
        if (!SaveManager.isInitialized()) {
            return "fatcat_guest_uninitialized";
        }
        const save = SaveManager.data;
        return `fatcat_${save.createdAt}_${save.player.companyName}`;
    }

    private static emitStatus(): void {
        EventBus.emit(GameEvents.NETWORK_STATUS_CHANGED, this.getStatus());
    }

    private static resolveApiBaseUrl(): string {
        if (typeof window === "undefined") {
            return GameConfig.apiBaseUrl;
        }
        const params = new URLSearchParams(window.location.search);
        const queryValue = params.get("api");
        if (queryValue !== null) {
            const normalized = queryValue.trim();
            sys.localStorage.setItem("fatcat_api_base_url", normalized);
            return normalized;
        }
        const stored = sys.localStorage.getItem("fatcat_api_base_url");
        return stored || GameConfig.apiBaseUrl;
    }
}
