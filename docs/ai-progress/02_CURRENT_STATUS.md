# Current Status

Updated: 2026-06-20

## Control Panel

| Item | Current Truth |
| --- | --- |
| Project Mode | UI fidelity push plus server-authoritative economy hardening. |
| Best Next Move | Continue visual fidelity with generated/Cocos-managed art depth or HUD precision; social next move is invite/search UX beyond the dev player-id prompt. |
| Safe Baseline | `tools/quick-verify.ps1` is green at the latest recorded checkpoint. |
| Must Preserve | Offline fallback, online resource authority, Cocos asset refresh after frontend edits, four-size mobile layout discipline. |
| Watch Closely | `BottomNavUI.ts` size, z-index on cat roster, HUD overflow on narrow screens, API port conflicts. |

## Snapshot Dashboard

| Track | State | Signal |
| --- | --- | --- |
| Client UI | Playable and clickable | Main screen, cat page, feature panels, bottom nav, and four-size screenshot regressions exist. |
| Server Authority | Advanced | Cats, equipment, buildings, research, shop state, friends, launch, production preview, resources, and transactions are server-backed. |
| Economy Model | Covered | Production uses assignment, building level, equipment, research, skills, and mood. |
| Config Safety | Guarded | Server balance is generated from client config and checked for drift plus effect coverage. |
| Verification | Green | `tools/quick-verify.ps1` and targeted online/UI scripts are the current gates. |
| Biggest Gap | Visual fidelity | Main factory and cat page are closer to target, but HUD precision, paper texture, icon consistency, and deeper generated art still need work. |
| Biggest Risk | Frontend size | `BottomNavUI.ts` remains too large and should be split after another stable UI checkpoint. |

## Client UI

- Main screen has portrait factory layout, top HUD, right-side feature buttons, bottom navigation, launch button, order card, and gift card.
- Main factory DOM layer now includes extra building depth, brick/grid shading, room foreground props, floor level medals, and HUD highlight/icon-plaque polish.
- Narrow-screen main factory fit improved: 360px floor names stay on one line, compact floor cards have tuned width/typography, and compact HUD resource cells use tighter icon/value/plus spacing.
- Cat page is a full-screen DOM overlay with info, upgrade, skill, equipment, skin, bottom roster, equipment bag, and story entry.
- Cat detail composition now has stronger target-UI cues: active side-tab pointer, larger center cat stage, speech bubble tail, right-side mood/feed icons, info-card edit badge, raised roster active card, and command-strip layering that no longer blocks equipment clicks.
- Cat lower content density is improved: stats/weight rows are slimmer, skill and equipment cards sit side by side in compact mode, compact equipment details fold away, and the equipment upgrade button remains clickable above the roster.
- Building, shop, inventory, research, task, achievement, mail, friend, and settings panels are clickable.
- Screenshot regression exists for 414x896, 430x932, 360x800, and 768x1024 on the main screen and cat page.
- Remaining visual gap: more polished HUD proportions, paper/card texture, icon consistency, generated art depth where CSS looks flat, and final cat-page target alignment.

## Client Networking

- `NetworkManager`, `ApiClient`, and `SyncManager` exist.
- Runtime API override works with a URL like `http://localhost:7456/?api=http%3A%2F%2Flocalhost%3A5144`.
- The client still supports offline local play when no API is configured.
- In online mode, several important actions call the server first and then apply returned resource balances to the HUD.
- `CatManager` and `ResearchManager` now overlay server catalog metadata from `/api/cats` and `/api/research` onto local configs, so production, unlock cost, skill, research cost, effect, and prerequisite reads can reflect server definitions while offline mode keeps using local JSON.
- `SyncManager` now fetches `/api/shop/state` after login/save sync, and `ShopManager.applyServerSnapshot()` applies authoritative daily shop purchase counts into local save data.
- Online shop purchases pass server `remainingDaily` into `ShopManager.fulfillServerPurchase()`, so the UI no longer double-increments local purchase history after a server-approved buy.
- `SyncManager` now fetches `/api/friends` after login/save sync. The DOM friend panel renders server `FriendDto` snapshots when online and keeps local preview friends only as offline fallback.
- DOM friend visit/gift buttons call `/api/friends/{friendId}/visit` and `/api/friends/{friendId}/gift` in online mode, then apply returned server timestamps to local feature state.
- DOM friend panel now has an add-friend action. In online mode it prompts for another player's id and calls `/api/friends/add`, then inserts the returned real-player friend snapshot.
- `SyncManager` fetches `/api/friends/activity`; the DOM friend panel shows recent add, visit, and gift activity from the server.
- Friend visit/gift actions now return `FriendActionResponse`, apply server resource balances to the client, and enforce one reward per friend per UTC day.
- `SyncManager` also fetches `/api/leaderboard` after login/save sync. The DOM friend panel now displays a server-backed income leaderboard with the current player highlighted when online.

## Server

Implemented server capabilities:

- Guest auth: `/api/auth/guest`.
- Bootstrap config: `/api/config/bootstrap`.
- Save sync: `/api/save/sync`.
- Resource snapshot: `/api/resources`.
- Resource transaction ledger: `/api/resources/transactions`.
- Mail list and claim.
- Friend list, visit, and gift endpoints, with DOM friend-panel consumption.
- Friend visit/gift rewards: first daily visit grants coin based on friend income, first daily gift grants cat food, and repeat same-day claims return `rewarded=false` with a limit reason.
- Real-player friend add endpoint: `/api/friends/add`, using another player's id as the first invite-code shape and storing the relationship as a `player:{guid}` friend snapshot.
- Friend activity endpoint: `/api/friends/activity`, backed by `PlayerSocialActivity` and written by add, visit, and gift actions.
- Income leaderboard endpoint: `/api/leaderboard`, combining current server-derived production with seeded friend snapshots and returning ranked entries plus the player's own row.
- Settings get/update.
- Production preview: `/api/production/preview`.
- Server-derived production preview: `/api/production/server-preview`, derived from persisted cat assignment, cat level/weight/equipment, mood, building levels/effects, research bonuses, and skill effects.
- Launch settlement: `/api/launch`, including idempotent launch records.
- Shop purchase: `/api/shop/purchase`, including daily limits.
- Shop state: `/api/shop/state`, returning authoritative item id, price, daily limit, purchased-today count, and remaining daily count.
- Cat upgrade: `/api/cats/{catId}/upgrade`, including coin spend, level update, and transaction ledger entry.
- Cat feeding: `/api/cats/{catId}/feed`, including cat food spend, weight update, and transaction ledger entry.
- Cat recruit/unlock: `/api/cats/{catId}/unlock`, including coin spend, cat state update, and transaction ledger entry.
- Cat snapshot: `/api/cats`, returning the full configured cat catalog with locked defaults plus authoritative unlocked state, level, weight, assigned building, equipment, equipment levels, updated time, rarity, role, base economy fields, and skill id.
- Cat assignment: `/api/cats/{catId}/assignment`, persisting online building schedule state into `CatStates.AssignedBuildingKey` and validating server-side building ids plus schedule capacity.
- Equipment upgrade: `/api/cats/{catId}/equipment/{itemId}/upgrade`, including equipped-item validation, coin spend, equipment level update, and transaction ledger entry.
- Server cat feeding now calculates cat food cost from server-side default equipment effects; the default lucky cup keeps the visible/actual cost at 9 cat food.
- Research snapshot: `/api/research`, returning the full configured research catalog with locked defaults plus authoritative unlocked state, cost, effect type/value, and prerequisite id.
- Research unlock: `/api/research/{researchId}/unlock`, including prerequisite validation, research point spend, resource transaction ledger entry, and returned resource balances.
- Research chain coverage now verifies second-tier nodes such as `res_bean_save` and `res_cheap_upgrade` cannot be unlocked before `res_basic_prod`, and that successful chained unlocks write only successful resource transactions.
- Building snapshot: `/api/buildings`, returning authoritative saved building levels, effect values, upgrade costs, schedule capacity, and updated time.
- Building upgrade: `/api/buildings/{buildingId}/upgrade`, including coin spend, persistent level update, schedule-capacity recalculation, and transaction ledger entry.
- Auth now ensures default `PlayerBuildingState` rows from the configured building definitions, so upgraded building levels are preserved server-side.
- Server cat upgrade now honors unlocked `res_cheap_upgrade` through the `UPGRADE_COST_REDUCE` style bonus.
- Server production preview and launch settlement now honor unlocked `res_bean_save` by applying the `bean_reduce` bonus to total and per-building bean cost.
- Server production preview and launch settlement support `includesClientModifiers`. Tests can still send `false` to let the server apply research `coin_production_mult`/`coin_production_add`, equipment `materialOutput`, equipment `wageCost`, research `bean_reduce`, and cat mood from server state.
- `FatCatGameService.PreviewServerProductionAsync()` is exposed through `/api/production/server-preview` and covered by service/API tests.
- `/api/launch` now recalculates production internally from persisted server state and ignores submitted production numbers for settlement, while preserving the existing request shape for client compatibility.
- Client and server production now both apply cat mood as `mood / 100`. The default `c_001` soft cushion gives 105% mood, so the default server-derived net production is about 224/sec instead of the older no-mood value.
- Server research, equipment, default-equipment, building, cat economy, and skill definitions are loaded from `FATCATServer/FatCat.Api/balance.json` through `FatCat.Application/BalanceConfig.cs`. `FatCatGameService` receives the config by DI in API mode and falls back to `BalanceConfig.Default` in direct unit tests.
- `tools/generate-server-balance.js` generates `FATCATServer/FatCat.Api/balance.json` from client config JSON and supports `--check` to verify the generated output is already committed.
- `tools/check-balance-config-drift.js` compares server `balance.json` with client `FATCATUI/assets/resources/configs/research.json`, `equipment.json`, `buildings.json`, `cats.json`, and `skills.json` for ids, costs, caps, effects, prerequisites, default equipped items, building levels, cat economy fields, and skill values.
- `tools/check-balance-effect-coverage.js` verifies every research/equipment effect type in client config is listed as covered by the server economy model.
- `tools/check-client-catalog-metadata-consumption.js` verifies client managers and the research panel consume server catalog metadata instead of bypassing it.
- `tools/quick-verify.ps1` runs the focused client TypeScript check, generated balance check, drift check, effect coverage check, client catalog metadata consumption check, shop-state, friend-sync, real-friend, friend-activity, friend-reward, leaderboard contract checks, and server tests as a no-browser baseline gate.
- `tools/start-api-process.js` lets selected online scripts start the already-built API DLL before falling back to `dotnet run --no-restore`, avoiding fragile NuGet restore attempts in restricted-network environments.

Client/server cat sync:

- `SyncManager.tryGuestLogin()` and `SyncManager.syncSave()` now fetch `/api/cats` after server login/sync.
- `CatManager.applyServerSnapshot()` applies server cat level, weight, unlocked state, assigned building, and equipment levels back into the local save.
- The DOM equipment upgrade button calls the server first in online mode and applies returned balances and equipment level.
- The DOM building schedule buttons call `/api/cats/{catId}/assignment` in online mode and apply the returned server assignment locally.
- This reduces drift after online cat upgrade/feed/unlock actions or after a local save gets stale.

Client/server research sync:

- `SyncManager.tryGuestLogin()` and `SyncManager.syncSave()` now fetch `/api/research` after server login/sync.
- `ResearchManager.applyServerSnapshot()` applies server unlocked research state into the local save.
- The DOM research panel calls the server first in online mode and applies returned resource balances to the HUD.
- Online production preview now logs in first and calls `/api/production/server-preview`, so the displayed preview comes from persisted server cat/building/equipment/research state.
- Online launch still calls `/api/production/server-preview` for display/preflight, and `/api/launch` independently recalculates production from server state for settlement.

Client/server building sync:

- `SyncManager.tryGuestLogin()` and `SyncManager.syncSave()` now fetch `/api/buildings` after server login/sync.
- `BuildingManager.applyServerSnapshot()` applies server building levels into the local save.
- The DOM building upgrade button calls `/api/buildings/{buildingId}/upgrade` in online mode, applies returned balances, and applies the returned building level.
- Assignment capacity now uses the player's persisted building level on the server, so future building-level capacity changes are enforced online.

## Latest Verification

Latest verified checks:

- 2026-06-20 repository handoff check: root Git repository initialized on `main`, remote `origin` configured as `https://github.com/geniusjunmin/FATCATCOM.git`, initial import `f818a2e` pushed to GitHub. Root `.gitignore` excludes local archives, dependencies, build caches, local databases, and generated regression captures.
- 2026-06-20 shop-state contract pass: added `/api/shop/state`, client `ShopStateDto`/`ApiClient.getShopState()`, `SyncManager.fetchServerShopState()`, `ShopManager.applyServerSnapshot()`, online purchase `remainingDaily` application, `tools/check-shop-state-contract.js`, and `AGENTS.md`.
- 2026-06-20 friend-sync contract pass: DOM friend panel now refreshes `/api/friends`, renders server snapshots, routes visit/gift actions through `SyncManager`, applies returned timestamps locally, adds API coverage, and adds `tools/check-friend-sync-contract.js`.
- 2026-06-20 leaderboard contract pass: added `/api/leaderboard`, server/client leaderboard DTOs, `ApiClient.getLeaderboard()`, `SyncManager.fetchServerLeaderboard()`, friend-panel income leaderboard rendering, `tools/check-leaderboard-contract.js`, and service/API coverage.
- 2026-06-20 real-friend contract pass: added `/api/friends/add`, player-id based real friend snapshots, refresh of real friend income/name/level from target player state, client add-friend API/sync/panel action, `tools/check-real-friend-contract.js`, `tools/check-real-friend-online.js`, and service/API coverage.
- 2026-06-20 friend-activity contract pass: added `PlayerSocialActivity`, `/api/friends/activity`, activity writes for add/visit/gift, client activity fetch/rendering in the friend panel, `tools/check-friend-activity-contract.js`, and service/API coverage.
- 2026-06-20 friend-reward contract pass: visit/gift now return `FriendActionResponse`, reward resources once per friend per UTC day, apply authoritative balances through `ResourceManager.applyServerSnapshot()`, extend online friend smoke coverage, and add `tools/check-friend-reward-contract.js`.
- Cocos asset-db refreshed for `db://assets/scripts` after shop-state, friend-sync, leaderboard, real-friend, friend-activity, and friend-reward client TypeScript edits.

- `dotnet test FATCATServer\FATCATServer.sln --no-restore`: 58/58 passed.
- `powershell -ExecutionPolicy Bypass -File .\tools\quick-verify.ps1`: passed; includes client TS, generated server balance, config drift, effect coverage, client catalog metadata consumption, shop-state contract, friend-sync contract, real-friend contract, friend-activity contract, friend-reward contract, leaderboard contract, and 58 server tests.
- `node tools\check-shop-state-contract.js`: passed; verifies server route/DTO/service, client API/types, sync fetch, manager snapshot consumption, and online purchase `remainingDaily` use.
- `node tools\check-friend-sync-contract.js`: passed; verifies friend API methods, login/save friend refresh, DOM server snapshot rendering, visit/gift routing, and API coverage.
- `node tools\check-real-friend-contract.js`: passed; verifies real-friend add DTO/repository/service/route, client API/types/sync fetch, friend-panel action, and service/API coverage.
- `node tools\check-friend-activity-contract.js`: passed; verifies social activity entity/schema, route/DTO/service/repository, client API/types/sync/panel rendering, and service/API coverage.
- `node tools\check-friend-reward-contract.js`: passed; verifies friend reward DTO/route/service behavior, client API/types, server balance application, UI reward messaging, and service/API coverage.
- `node tools\check-real-friend-online.js`: passed; starts the built API, creates two players, adds a real friend by player id, visits/gifts, verifies first-claim rewards plus same-day limit reasons, rejects self-add, and verifies friend list, activity stream, and leaderboard inclusion.
- `node tools\check-leaderboard-contract.js`: passed; verifies leaderboard route/DTO/service, client API/types/sync fetch, friend-panel rendering, and service/API coverage.
- `node tools\verify-ui-clicks-playwright.js`: passed after friend-panel server sync changes.
- `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`: passed.
- `node tools\check-client-catalog-metadata-consumption.js`: passed; verifies `CatManager`, `ResearchManager`, and `ResearchPanel` route through server metadata-aware config access.
- `powershell -ExecutionPolicy Bypass -File .\tools\check-server-api.ps1 -ApiBaseUrl http://localhost:5144 -Origin http://localhost:7456`: passed with the built API DLL, including cat assignment, building snapshot, building upgrade, mood-adjusted `/api/production/server-preview`, and launch tamper resistance.
- Latest API smoke also verifies `/api/cats` returns 5 catalog entries, including locked `c_002` plus cat metadata, and `/api/research` returns 3 catalog entries, including locked `res_bean_save` plus research metadata.
- Cocos asset-db refreshed for `db://assets/scripts` after client manager and API type metadata updates.
- `node tools\verify-ui-clicks-playwright.js`: passed.
- Latest visual push check: `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts/ui`, `node tools\capture-main-regression.js`, and `node tools\verify-ui-clicks-playwright.js` passed after main factory/HUD CSS polish.
- Latest narrow-screen fit check: `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts/ui`, `node tools\capture-main-regression.js`, and `node tools\verify-ui-clicks-playwright.js` passed after compact floor-card/HUD spacing changes.
- Latest cat-page visual check: `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts/ui`, `node tools\capture-cat-regression.js`, and `node tools\verify-ui-clicks-playwright.js` passed after cat detail composition polish.
- Latest cat-page density check: `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts/ui`, `node tools\capture-cat-regression.js`, and `node tools\verify-ui-clicks-playwright.js` passed after compact skill/equipment/story density changes.
- `node tools\check-settings-production-preview-online.js`: passed and asserts `/api/production/server-preview`.
- `node tools\check-production-wage-net-effect.js`: passed.
- `node tools\capture-main-regression.js`: passed for all four target sizes.
- `node tools\capture-cat-regression.js`: passed for all four target sizes.
- `node tools\check-launch-production-preview-online.js`: passed and asserts `/api/production/server-preview` before `/api/launch`; online launch showed net production around 224/sec after the 105% mood multiplier.
- `node tools\check-cat-upgrade-online.js`: passed.
- `node tools\check-cat-feed-online.js`: passed.
- `node tools\check-cat-unlock-online.js`: passed.
- `node tools\check-cat-snapshot-online.js`: passed.
- `node tools\check-research-unlock-online.js`: passed.
- `node tools\check-equipment-upgrade-online.js`: passed.
- `node tools\check-building-upgrade-online.js`: passed; covers the real DOM building upgrade path from panel click to `/api/buildings/{buildingId}/upgrade` and local Lv.6 -> Lv.7 application.
- `node tools\generate-server-balance.js --check`: passed; server `balance.json` matches generated output from client configs.
- `node tools\check-balance-config-drift.js`: passed, including building, cat, and skill config drift.
- `node tools\check-balance-effect-coverage.js`: passed; covered research effects are `bean_reduce`, `coin_production_mult`, and `upgrade_cost_reduce`; covered equipment effects are `catFoodCost`, `materialOutput`, `mood`, and `wageCost`.
- `node tools\check-equipment-feed-cost-effect.js`: passed.
- `node tools\check-equipment-mood-effect.js`: passed; verifies default equipment raises `c_001` mood to 105% and that mood-adjusted local production is reflected.
- Post-config JSON check: `dotnet test FATCATServer\FATCATServer.sln`, `.\tools\check-server-api.ps1 -ApiBaseUrl http://localhost:5144 -Origin http://localhost:7456`, `node tools\check-equipment-upgrade-online.js`, and `node tools\check-balance-config-drift.js` passed after loading research/equipment definitions from `balance.json`.
- Extra browser check: without opening settings first, clicking cat upgrade triggers `/api/auth/guest`, then `/api/cats/c_001/upgrade`, changes Lv.1/30 to Lv.2/30, and shows `Upgrade synced: Lv.1 -> Lv.2, -100 coin.`
- Online feed check: without opening settings first, clicking cat feed triggers `/api/auth/guest`, then `/api/cats/c_001/feed`, changes 20/100 to 21/100, and shows `Feed synced: 20 -> 21 weight, -9 cat food.`
- Online unlock check: without opening settings first, selecting locked `c_005` and recruiting triggers `/api/auth/guest`, then `/api/cats/c_005/unlock`, changes the card to Lv.1/30, and shows `Recruit synced: c_005 joined, -12K coin.`
- Online snapshot check: after recruiting `c_005`, intentionally corrupting local save, reconnecting to server triggers `/api/cats` and restores `c_005` to unlocked Lv.1/W22. Server API tests now also cover locked catalog defaults.
- Online research check: opening the research panel and unlocking `res_basic_prod` triggers `/api/auth/guest`, then `/api/research/res_basic_prod/unlock`, changes research points 200 -> 100, and shows `Research synced`.
- Online equipment check: opening cat equipment and upgrading the default collar triggers `/api/auth/guest`, then `/api/cats/c_001/equipment/equip_collar_green/upgrade`, changes the local equipment level 1 -> 2, and shows `Equipment synced`.
- Service-level bean research check: after unlocking `res_bean_save`, server production preview reduces bean cost 4 -> 3.8 and launch spends 38 beans for 10 seconds.
- Service-level base-production check: when `includesClientModifiers` is `false`, server production preview applies unlocked production research plus default equipment production bonus, and applies equipment wage reduction.
- Service/API assignment check: assigning `c_001` to `building_material_2f` persists to `CatStates.AssignedBuildingKey` and returns through `/api/cats`; server rejects unknown buildings and over-capacity assignments.

## Known Risks

- `BottomNavUI.ts` is too large and is the biggest maintenance risk.
- Server `balance.json` is generated from client config by `tools/generate-server-balance.js`, but it is still a checked-in generated copy. Keep `tools/generate-server-balance.js --check` and `tools/check-balance-config-drift.js` in the verification set until the build loads a true single source directly.
- `/api/launch` now ignores submitted production numbers and recalculates from server state. The submitted production payload remains only for compatibility and can be simplified later.
- The next config cleanup is changing the server to load the client config source directly or adding `tools/quick-verify.ps1` to an external CI/job runner.
- Legacy Cocos `CatDetailPanel` still has a local-only upgrade path; the verified production path is the DOM cat page.
- Cat roster z-index was adjusted so locked roster cards remain clickable and no longer get covered by the equipment area.
- Do not run multiple scripts that spawn `http://localhost:5144` in parallel.
- After frontend script edits, refresh Cocos asset-db.
