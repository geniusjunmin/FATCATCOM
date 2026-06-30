import { DomAssetDataUris } from "./DomAssetDataUris";
import { FactoryPropDataUris } from "./FactoryPropDataUris";
import { GeneratedCatFullArtAssets, GeneratedFeatureIconAssets, GeneratedItemIconAssets, GeneratedSkillIconAssets } from "./UiAssetRegistry";

export function getDomAssetDataUri(assetPath: string): string {
    return DomAssetDataUris[assetPath] ?? assetPath;
}

export function getFeatureIconAsset(kind: string): string {
    return getDomAssetDataUri(GeneratedFeatureIconAssets[kind] ?? GeneratedFeatureIconAssets.settings);
}

export function getFactoryPropDataUri(scene: string): string {
    return FactoryPropDataUris[scene] ?? FactoryPropDataUris.storage;
}

export function getGeneratedIconAsset(iconClass: string): string {
    const aliases: Record<string, string> = {
        cat: "shard",
        deco: "gift",
        equip: "equipCollar",
    };
    const key = aliases[iconClass] ?? iconClass;
    return getDomAssetDataUri(GeneratedItemIconAssets[key] ?? GeneratedItemIconAssets.gift);
}

export function getCatFullArtAsset(catId: string, portrait?: string): string {
    if (GeneratedCatFullArtAssets[catId]) return getDomAssetDataUri(GeneratedCatFullArtAssets[catId]);
    if (portrait?.includes("black")) return getDomAssetDataUri(GeneratedCatFullArtAssets.black);
    if (portrait?.includes("white")) return getDomAssetDataUri(GeneratedCatFullArtAssets.white);
    return getDomAssetDataUri(GeneratedCatFullArtAssets.orange);
}

export function getEquipIconAsset(kind: string): string {
    if (kind === "collar") return getDomAssetDataUri(GeneratedItemIconAssets.equipCollar);
    if (kind === "cup") return getDomAssetDataUri(GeneratedItemIconAssets.equipCup);
    if (kind === "cushion") return getDomAssetDataUri(GeneratedItemIconAssets.equipCushion);
    return getDomAssetDataUri(GeneratedItemIconAssets.equipLocked);
}

export function getSkillIconAsset(role: string): string {
    return getDomAssetDataUri(GeneratedSkillIconAssets[role] ?? GeneratedSkillIconAssets.support);
}
