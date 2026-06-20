# 2026-06-13 Task Ledger - Cat Upgrade Resource

## Completed Tasks

1. Server domain: added `PlayerCatState` with player, cat key, level, unlock state, and update timestamp.
2. Server infrastructure: added `CatStates` DbSet, table creation, unique index, and FK mapping.
3. Server repository: added cat-state read/create methods.
4. Server game service: added known cat validation, default cat creation on auth, cat upgrade cost calculation, server coin spending, level update, and transaction write.
5. Server API: added `POST /api/cats/{catId}/upgrade`.
6. Server tests: added service-level and API-level cat upgrade coverage.
7. Client contracts: added `CatUpgradeResponse`.
8. Client API: added `ApiClient.upgradeCat`.
9. Client sync: added `SyncManager.upgradeServerCat`, including automatic guest login when needed.
10. Client cat state: added `CatManager.applyServerUpgrade`.
11. Client UI: changed DOM cat upgrade action to server-first, local fallback.
12. Smoke tests: updated `tools/check-server-api.ps1` for cat upgrade and adjusted downstream resource expectations.
13. Cocos editor: refreshed changed frontend scripts through asset-db.
14. Regression: reran backend, TS, API smoke, UI clicks, online settings/launch checks, main screenshots, cat screenshots, and inline server-cat-upgrade browser check.

## Next Candidate Tasks

1. Add server-side research state so online upgrade cost can honor `UPGRADE_COST_REDUCE`.
2. Add server cat-state fetch/snapshot endpoint so login can reconcile all local cat levels from server.
3. Move cat feeding to server-authoritative cat food spending and transaction ledger.
4. Move cat unlock/recruit to server-authoritative coin spending and roster state.
5. Update the legacy Cocos `CatDetailPanel` buttons to use the same server-first path or retire it if DOM cat panel is the intended UI.
6. Add a persistent Playwright script for `cat upgrade online` instead of keeping the current inline one as ad hoc verification.
7. Add server transaction filters by `sourceType` for easier audit/debug panels.
