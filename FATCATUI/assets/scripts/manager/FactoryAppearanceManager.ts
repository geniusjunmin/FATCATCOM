import type { FactoryAppearanceCatalogItemDto, FactoryAppearanceStateDto } from "../net/ApiTypes";
import { SaveManager } from "./SaveManager";

export class FactoryAppearanceManager {
    private static _serverState: FactoryAppearanceStateDto | null = null;

    public static applyServerState(state: FactoryAppearanceStateDto): void {
        this._serverState = {
            ...state,
            ownedAppearanceIds: [...state.ownedAppearanceIds],
            catalog: state.catalog.map(item => ({
                ...item,
                bonuses: item.bonuses.map(bonus => ({ ...bonus })),
            })),
        };
        if (SaveManager.isInitialized()) {
            SaveManager.update(data => {
                data.featureState.factoryAppearanceId = state.equippedAppearanceId;
            });
        }
    }

    public static getServerState(): FactoryAppearanceStateDto | null {
        if (!this._serverState) return null;
        return {
            ...this._serverState,
            ownedAppearanceIds: [...this._serverState.ownedAppearanceIds],
            catalog: this._serverState.catalog.map(item => ({
                ...item,
                bonuses: item.bonuses.map(bonus => ({ ...bonus })),
            })),
        };
    }

    public static getCatalogItem(appearanceId: string): FactoryAppearanceCatalogItemDto | undefined {
        const item = this._serverState?.catalog.find(entry => entry.appearanceId === appearanceId);
        return item ? { ...item, bonuses: item.bonuses.map(bonus => ({ ...bonus })) } : undefined;
    }

    public static clearServerState(): void {
        this._serverState = null;
    }
}
