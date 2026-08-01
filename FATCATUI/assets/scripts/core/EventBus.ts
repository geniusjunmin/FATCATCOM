type EventHandler<T = unknown> = (payload: T) => void;

export class EventBus {
    private static _listeners = new Map<string, Set<EventHandler>>();

    public static on<T>(eventName: string, handler: EventHandler<T>): void {
        let handlers = this._listeners.get(eventName);
        if (!handlers) {
            handlers = new Set<EventHandler>();
            this._listeners.set(eventName, handlers);
        }
        handlers.add(handler as EventHandler);
    }

    public static off<T>(eventName: string, handler: EventHandler<T>): void {
        const handlers = this._listeners.get(eventName);
        if (!handlers) {
            return;
        }
        handlers.delete(handler as EventHandler);
        if (handlers.size === 0) {
            this._listeners.delete(eventName);
        }
    }

    public static emit<T>(eventName: string, payload: T): void {
        const handlers = this._listeners.get(eventName);
        if (!handlers) {
            return;
        }
        for (const handler of Array.from(handlers)) {
            try {
                handler(payload);
            } catch (error) {
                console.error(`[EventBus] Handler failed for ${eventName}.`, error);
            }
        }
    }

    public static clear(): void {
        this._listeners.clear();
    }
}

export const GameEvents = {
    APP_READY: "app:ready",
    SAVE_LOADED: "save:loaded",
    SAVE_UPDATED: "save:updated",
    RESOURCES_CHANGED: "resources:changed",
    RESOURCE_NOT_ENOUGH: "resource:not-enough",
    PRODUCTION_TICK: "production:tick",
    PRODUCTION_PAUSED: "production:paused",
    NETWORK_STATUS_CHANGED: "network:status-changed",
    SYNC_STATUS_CHANGED: "sync:status-changed",
    SOCIAL_REALTIME_EVENT: "social:realtime-event",
    FRIEND_BOOST_HISTORY_CHANGED: "friend:boost-history-changed",
    DAILY_ORDER_CHANGED: "daily-order:changed",
    PLAYER_PROGRESSION_CHANGED: "player-progression:changed",
    ACHIEVEMENTS_CHANGED: "achievements:changed",
} as const;
