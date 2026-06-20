import { EventBus, GameEvents } from "../core/EventBus";
import { cloneResources, RESOURCE_KEYS, ResourceKey, ResourceMap } from "../model/ResourceModel";
import { SaveManager } from "./SaveManager";

export interface ResourceChangedPayload {
    resources: ResourceMap;
    delta: Partial<ResourceMap>;
    reason: string;
}

export interface ResourceNotEnoughPayload {
    key: ResourceKey;
    need: number;
    current: number;
    reason: string;
}

export class ResourceManager {
    public static getAll(): ResourceMap {
        if (!SaveManager.isInitialized()) {
            return cloneResources();
        }
        return cloneResources(SaveManager.data.resources);
    }

    public static get(key: ResourceKey): number {
        if (!SaveManager.isInitialized()) {
            return 0;
        }
        return SaveManager.data.resources[key] ?? 0;
    }

    public static canSpend(cost: Partial<ResourceMap>): boolean {
        return RESOURCE_KEYS.every((resourceKey) => {
            const value = cost[resourceKey];
            if (!value) {
                return true;
            }
            return this.get(resourceKey) >= (value ?? 0);
        });
    }

    public static add(delta: Partial<ResourceMap>, reason = "add"): ResourceMap {
        if (!SaveManager.isInitialized()) {
            return cloneResources();
        }
        const normalizedDelta = this.normalizeDelta(delta);
        const save = SaveManager.update((data) => {
            for (const resourceKey of RESOURCE_KEYS) {
                const value = normalizedDelta[resourceKey];
                if (value) {
                    data.resources[resourceKey] = Math.max(0, (data.resources[resourceKey] ?? 0) + value);
                }
            }
        });
        this.emitChanged(normalizedDelta, reason);
        return cloneResources(save.resources);
    }

    public static applyServerSnapshot(snapshot: Partial<ResourceMap>, reason = "server_snapshot"): ResourceMap {
        if (!SaveManager.isInitialized()) {
            return cloneResources();
        }
        const nextValues = this.normalizeSnapshot(snapshot);
        const delta: Partial<ResourceMap> = {};
        const save = SaveManager.update((data) => {
            for (const resourceKey of RESOURCE_KEYS) {
                const value = nextValues[resourceKey];
                if (value === undefined) {
                    continue;
                }
                const current = data.resources[resourceKey] ?? 0;
                data.resources[resourceKey] = value;
                const change = value - current;
                if (change !== 0) {
                    delta[resourceKey] = change;
                }
            }
        });
        this.emitChanged(delta, reason);
        return cloneResources(save.resources);
    }

    public static spend(cost: Partial<ResourceMap>, reason = "spend"): boolean {
        if (!SaveManager.isInitialized()) {
            return false;
        }
        const normalizedCost = this.normalizeDelta(cost);
        for (const resourceKey of RESOURCE_KEYS) {
            const need = normalizedCost[resourceKey] ?? 0;
            if (need <= 0) {
                continue;
            }
            const current = this.get(resourceKey);
            if (current < need) {
                EventBus.emit<ResourceNotEnoughPayload>(GameEvents.RESOURCE_NOT_ENOUGH, {
                    key: resourceKey,
                    need,
                    current,
                    reason,
                });
                return false;
            }
        }

        const negativeDelta: Partial<ResourceMap> = {};
        for (const resourceKey of RESOURCE_KEYS) {
            const value = normalizedCost[resourceKey];
            if (value) {
                negativeDelta[resourceKey] = -value;
            }
        }
        this.add(negativeDelta, reason);
        return true;
    }

    private static normalizeDelta(delta: Partial<ResourceMap>): Partial<ResourceMap> {
        const normalized: Partial<ResourceMap> = {};
        for (const resourceKey of RESOURCE_KEYS) {
            const value = delta[resourceKey];
            const numberValue = Number(value);
            if (Number.isFinite(numberValue) && numberValue !== 0) {
                normalized[resourceKey] = numberValue;
            }
        }
        return normalized;
    }

    private static normalizeSnapshot(snapshot: Partial<ResourceMap>): Partial<ResourceMap> {
        const normalized: Partial<ResourceMap> = {};
        for (const resourceKey of RESOURCE_KEYS) {
            const value = snapshot[resourceKey];
            const numberValue = Number(value);
            if (Number.isFinite(numberValue)) {
                normalized[resourceKey] = Math.max(0, numberValue);
            }
        }
        return normalized;
    }

    private static emitChanged(delta: Partial<ResourceMap>, reason: string): void {
        EventBus.emit<ResourceChangedPayload>(GameEvents.RESOURCES_CHANGED, {
            resources: this.getAll(),
            delta,
            reason,
        });
    }
}
