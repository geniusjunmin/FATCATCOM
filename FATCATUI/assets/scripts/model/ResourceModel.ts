export type ResourceKey = "coin" | "bean" | "catFood" | "diamond" | "researchPoint";

export type ResourceMap = Record<ResourceKey, number>;

export const RESOURCE_KEYS: ResourceKey[] = [
    "coin",
    "bean",
    "catFood",
    "diamond",
    "researchPoint",
];

export function createEmptyResources(): ResourceMap {
    return {
        coin: 0,
        bean: 0,
        catFood: 0,
        diamond: 0,
        researchPoint: 0,
    };
}

export function cloneResources(resources: Partial<ResourceMap> = {}): ResourceMap {
    const next = createEmptyResources();
    for (const key of RESOURCE_KEYS) {
        const value = resources[key];
        next[key] = typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
    }
    return next;
}
