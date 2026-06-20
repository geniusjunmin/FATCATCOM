# 2026-06-13 Cat Upgrade Resource Progress

## Goal

Move cat upgrade from local-only coin spending toward the server-authoritative resource transaction flow.

## Completed

- Added `PlayerCatState` in the server domain and mapped it in EF Core with a per-player/per-cat unique index.
- Added repository methods for reading and creating cat state.
- Added `/api/cats/{catId}/upgrade` with server-side validation, coin deduction, cat level update, and resource transaction recording.
- Ensured guest auth creates the default unlocked `c_001` cat state.
- Added `CatUpgradeResponse` contract with updated resource balances for frontend HUD synchronization.
- Added application and API tests for cat upgrade, resource deduction, and transaction ledger entry.
- Added frontend API client and SyncManager support for server cat upgrade.
- Added `CatManager.applyServerUpgrade` so server responses can update local cat level without double-spending local coins.
- Updated the DOM cat panel upgrade button to prefer the server path and fall back to local offline upgrade.
- Fixed the first-click online case: if API is configured but no `playerId` exists yet, cat upgrade now triggers guest login before calling `/api/cats`.
- Updated `tools/check-server-api.ps1` to include cat upgrade before shop/mail/launch checks and to expect the adjusted balances.

## Verification

- `dotnet test FATCATServer\FATCATServer.sln`: 23/23 passed.
- `.\tools\check-client-ts.ps1`: passed after frontend changes.
- `.\tools\check-server-api.ps1 -ApiBaseUrl http://localhost:5144 -Origin http://localhost:7456`: passed.
- `node tools\verify-ui-clicks-playwright.js`: passed.
- `node tools\check-settings-production-preview-online.js`: passed.
- `node tools\check-production-wage-net-effect.js`: passed.
- `node tools\capture-main-regression.js`: passed for 414x896, 430x932, 360x800, 768x1024.
- `node tools\capture-cat-regression.js`: passed for 414x896, 430x932, 360x800, 768x1024.
- `node tools\check-launch-production-preview-online.js`: passed.
- Manual/inline Playwright server upgrade check: passed without pre-clicking settings connect. It observed `/api/auth/guest` followed by `/api/cats/c_001/upgrade`, updated Lv.1/30 to Lv.2/30, and showed `Upgrade synced: Lv.1 -> Lv.2, -100 coin.`

## Notes

- Server cat upgrade currently uses the base local formula `floor(100 * level^1.5)`.
- Local research upgrade-cost discounts are not modeled on the server yet. Future server research state should be added before treating discounted online upgrade costs as final.
- The legacy Cocos `CatDetailPanel` still calls local `CatManager.upgradeCat`; the current production DOM cat panel uses the server-first path.
