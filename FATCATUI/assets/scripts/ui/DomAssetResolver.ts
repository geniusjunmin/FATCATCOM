import { DomAssetDataUris } from "./DomAssetDataUris";
import { FactoryPropDataUris } from "./FactoryPropDataUris";
import {
    GeneratedBuildingRoomAssets,
    GeneratedCatFullArtAssets,
    GeneratedCatSkinAssets,
    GeneratedFactoryAppearanceAssets,
    GeneratedFeatureIconAssets,
    GeneratedInventoryArtAssets,
    GeneratedItemIconAssets,
    GeneratedResearchArtAssets,
    GeneratedShopProductAssets,
    GeneratedSkillIconAssets,
} from "./UiAssetRegistry";

export function getDomAssetDataUri(assetPath: string): string {
    return DomAssetDataUris[assetPath] ?? assetPath;
}

export function getFeatureIconAsset(kind: string): string {
    return getDomAssetDataUri(GeneratedFeatureIconAssets[kind] ?? GeneratedFeatureIconAssets.settings);
}

export function getFactoryPropDataUri(scene: string): string {
    return FactoryPropDataUris[scene] ?? FactoryPropDataUris.storage;
}

export function getBuildingRoomAsset(scene: string): string {
    return getDomAssetDataUri(GeneratedBuildingRoomAssets[scene] ?? GeneratedBuildingRoomAssets.storage);
}

export function getFactoryAppearanceAsset(appearanceId: string): string {
    return getDomAssetDataUri(GeneratedFactoryAppearanceAssets[appearanceId] ?? GeneratedFactoryAppearanceAssets.simple);
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

export function getShopProductAsset(kind: string): string {
    const asset = GeneratedShopProductAssets[kind];
    return asset ? getDomAssetDataUri(asset) : getGeneratedIconAsset(kind);
}

export function getInventoryPreviewAsset(kind: string): string {
    const generatedAsset = GeneratedInventoryArtAssets[kind];
    if (generatedAsset) return getDomAssetDataUri(generatedAsset);
    if (kind === "catOrange") return getCatFullArtAsset("c_001");
    if (kind === "catBlack") return getCatFullArtAsset("c_002");
    if (kind === "catWhite") return getCatFullArtAsset("c_003");
    if (kind === "catCalico") return getCatFullArtAsset("c_004");
    return getGeneratedIconAsset(kind);
}

export function getResearchMedalAsset(effectType = ""): string {
    if (effectType === "coin_production_mult") {
        return getDomAssetDataUri(GeneratedResearchArtAssets.coinProduction);
    }
    if (effectType === "bean_reduce") {
        return getDomAssetDataUri(GeneratedResearchArtAssets.beanEfficiency);
    }
    if (effectType === "upgrade_cost_reduce") {
        return getDomAssetDataUri(GeneratedResearchArtAssets.upgradeCost);
    }
    return getDomAssetDataUri(GeneratedResearchArtAssets.medal);
}

export function getResearchNodeAsset(researchId: string, effectType = ""): string {
    const nodeAsset = GeneratedResearchArtAssets.nodes[researchId];
    return nodeAsset
        ? getDomAssetDataUri(nodeAsset)
        : getResearchMedalAsset(effectType);
}

export function getCatFullArtAsset(catId: string, portrait?: string): string {
    if (GeneratedCatFullArtAssets[catId]) return getDomAssetDataUri(GeneratedCatFullArtAssets[catId]);
    if (portrait?.includes("black")) return getDomAssetDataUri(GeneratedCatFullArtAssets.black);
    if (portrait?.includes("white")) return getDomAssetDataUri(GeneratedCatFullArtAssets.white);
    return getDomAssetDataUri(GeneratedCatFullArtAssets.orange);
}

export function getCatSkinAsset(skinId: string): string {
    return getDomAssetDataUri(GeneratedCatSkinAssets[skinId] ?? GeneratedCatSkinAssets.default);
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
