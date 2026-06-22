# Handoff

Updated: 2026-06-22

## 90-Second Boot

| Phase | Action |
| --- | --- |
| Orient | Read `00_README.md`, then skim the top of `02_CURRENT_STATUS.md` and `03_NEXT_TASKS.md`. |
| Choose | Pick one lane: UI fidelity, server authority, regression hardening, or cleanup. |
| Execute | Complete a batch of concrete subtasks, usually five or more. |
| Verify | Run the smallest relevant script first, then wider gates when behavior changed. |
| Record | Update status, next tasks, and handoff before ending the round. |

## Hot Start

| Need | Do This |
| --- | --- |
| Fast confidence check | Run `powershell -ExecutionPolicy Bypass -File .\tools\quick-verify.ps1`. |
| Visual work | Compare against root UI references, then run click/screenshot regressions. |
| Server/economy work | Run `dotnet test`, `check-server-api.ps1`, balance generation, drift, and effect coverage checks. |
| Frontend script edit | Refresh Cocos asset-db before trusting preview behavior. |
| Online script work | Avoid concurrent users of `http://localhost:5144`. |

## Read Order

1. `docs/ai-progress/01_PROJECT_OVERVIEW.md`
2. `docs/ai-progress/02_CURRENT_STATUS.md`
3. `docs/ai-progress/03_NEXT_TASKS.md`
4. `docs/ai-progress/04_HANDOFF.md`
5. If needed, inspect `docs/ai-progress/archive-2026-06-14/`

## Common Verification Commands

```powershell
dotnet test FATCATServer\FATCATServer.sln
powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1
powershell -ExecutionPolicy Bypass -File .\tools\quick-verify.ps1
```

Temporary API plus smoke:

```powershell
$api = Start-Process -FilePath dotnet -ArgumentList @('FatCat.Api.dll','--urls','http://localhost:5144') -WorkingDirectory 'D:\Desktop\FATCATCOM\FATCATServer\FatCat.Api\bin\Debug\net9.0' -PassThru -WindowStyle Hidden
try {
  powershell -ExecutionPolicy Bypass -File .\tools\check-server-api.ps1 -ApiBaseUrl 'http://localhost:5144' -Origin 'http://localhost:7456'
} finally {
  if ($api -and -not $api.HasExited) { Stop-Process -Id $api.Id -Force }
}
```

UI regression:

```powershell
node tools\verify-ui-clicks-playwright.js
node tools\capture-main-regression.js
node tools\capture-cat-regression.js
node tools\check-settings-production-preview-online.js
node tools\check-production-wage-net-effect.js
node tools\check-equipment-mood-effect.js
node tools\check-launch-production-preview-online.js
node tools\check-cat-upgrade-online.js
node tools\check-cat-feed-online.js
node tools\check-cat-unlock-online.js
node tools\check-cat-snapshot-online.js
node tools\check-research-unlock-online.js
node tools\check-equipment-upgrade-online.js
node tools\check-building-upgrade-online.js
node tools\generate-server-balance.js --check
node tools\check-balance-config-drift.js
node tools\check-balance-effect-coverage.js
node tools\check-client-catalog-metadata-consumption.js
node tools\check-shop-state-contract.js
node tools\check-friend-sync-contract.js
node tools\check-real-friend-contract.js
node tools\check-friend-activity-contract.js
node tools\check-friend-reward-contract.js
node tools\check-friend-invite-contract.js
node tools\check-friend-request-contract.js
node tools\check-real-friend-online.js
node tools\check-leaderboard-contract.js
```

Do not run multiple online scripts that spawn `http://localhost:5144` at the same time.

## Cocos Asset Refresh

After frontend script edits, run this through Cocos MCP in editor context:

```js
await Editor.Message.request('asset-db', 'refresh-asset', 'db://assets/scripts/...');
```

Common paths:

- `db://assets/scripts/ui/BottomNavUI.ts`
- `db://assets/scripts/manager/SyncManager.ts`
- `db://assets/scripts/manager/CatManager.ts`
- `db://assets/scripts/manager/ResearchManager.ts`
- `db://assets/scripts/net/ApiClient.ts`
- `db://assets/scripts/net/ApiTypes.ts`

If Cocos MCP is available, prefer refreshing the exact changed folder or script path instead of relying only on browser reload.

## Key Files

Server:

- `FATCATServer/FatCat.Application/FatCatGameService.cs`
- `FATCATServer/FatCat.Application/BalanceConfig.cs`
- `FATCATServer/FatCat.Application/Contracts.cs`
- `FATCATServer/FatCat.Domain/PlayerBuildingState.cs`
- `FATCATServer/FatCat.Domain/PlayerFriendRequest.cs`
- `FATCATServer/FatCat.Domain/PlayerSocialActivity.cs`
- `FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs`
- `FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs`
- `FATCATServer/FatCat.Api/Program.cs`
- `FATCATServer/FatCat.Api/balance.json`
- `FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs`
- `FATCATServer/FatCat.Tests/FatCatApiTests.cs`
- `tools/start-api-process.js`
- `tools/generate-server-balance.js`
- `tools/check-balance-effect-coverage.js`
- `tools/check-client-catalog-metadata-consumption.js`
- `tools/check-shop-state-contract.js`
- `tools/check-friend-sync-contract.js`
- `tools/check-real-friend-contract.js`
- `tools/check-friend-activity-contract.js`
- `tools/check-friend-reward-contract.js`
- `tools/check-friend-invite-contract.js`
- `tools/check-friend-request-contract.js`
- `tools/check-real-friend-online.js`
- `tools/check-leaderboard-contract.js`
- `tools/quick-verify.ps1`

Client:

- `FATCATUI/assets/scripts/ui/BottomNavUI.ts`
- `FATCATUI/assets/scripts/manager/SyncManager.ts`
- `FATCATUI/assets/scripts/manager/NetworkManager.ts`
- `FATCATUI/assets/scripts/manager/CatManager.ts`
- `FATCATUI/assets/scripts/manager/ResearchManager.ts`
- `FATCATUI/assets/scripts/manager/ResourceManager.ts`
- `FATCATUI/assets/scripts/manager/ShopManager.ts`
- `FATCATUI/assets/scripts/net/ApiClient.ts`
- `FATCATUI/assets/scripts/net/ApiTypes.ts`

## Caveats

- `D:\Desktop\FATCATCOM` is now the root Git repository. Remote `origin` points to `https://github.com/geniusjunmin/FATCATCOM.git`, and `main` tracks `origin/main`.
- The initial GitHub import was pushed on 2026-06-20. Commit `f818a2e` contains the client, server, docs, tools, target UI reference images, and generated in-game assets.
- Historical nested Git metadata was moved non-destructively to `FATCATUI/.git.embedded-backup/` and `FATCATUI/extensions/cocos-mcp-server/.git.embedded-backup/`. These backup directories are ignored by the root repository; do not delete them unless the project owner confirms they are no longer needed.
- Large/generated local files are intentionally ignored: `FATCATCOM.rar`, `old/`, root Playwright capture PNGs, `node_modules/`, Cocos `library/temp/build/local/profiles/native`, .NET `bin/obj`, local `*.db*`, and regression screenshots.
- Do not delete archived logs. Use `archive-2026-06-14/` when historical detail is needed.
- For economic actions, prefer the established pattern: server validates, server spends resources, server records a transaction, server returns balances, frontend applies the returned snapshot.
- `/api/shop/state` returns authoritative shop daily counts. `SyncManager.fetchServerShopState()` applies it through `ShopManager.applyServerSnapshot()` after login/save sync.
- Online DOM shop purchase passes `ShopPurchaseResponse.remainingDaily` into `ShopManager.fulfillServerPurchase()`; preserve this so local history stays aligned with server state.
- `tools/check-shop-state-contract.js` is part of `tools/quick-verify.ps1` and guards the route, DTOs, client API, sync fetch, and remaining-daily purchase path.
- `/api/friends` is consumed by the DOM friend panel. `SyncManager.fetchServerFriends()` runs after login/save sync, and visit/gift buttons call `SyncManager.visitServerFriend()` / `SyncManager.sendServerFriendGift()` in online mode.
- `tools/check-friend-sync-contract.js` is part of `tools/quick-verify.ps1` and guards friend API methods, friend panel server rendering, online action routing, and API coverage.
- `/api/friends/add` creates a real-player friend snapshot from another player's id or persisted short invite code. Real friend keys use `player:{guidN}`. It also writes `PlayerFriendRelation`; duplicate adds return the existing snapshot; self-add and unknown ids fail.
- `/api/social/profile` returns the current player's social profile, persisted short `FC...` invite code, and income snapshot. `/api/friends/search` resolves either invite code or player id before add.
- The DOM friend panel has an `添加好友` action that prompts for an invite code/player id, calls `SyncManager.searchServerFriend()` first, asks for confirmation, then calls `SyncManager.addServerFriend()`.
- `/api/friends/requests` creates and lists friend requests. `/api/friends/requests/{requestId}/accept` accepts pending inbound requests and writes both `PlayerFriendRelation` directions plus both real-player `FriendSnapshot` rows. `/reject` marks an inbound request rejected.
- `SyncManager.createServerFriendRequest()`, `fetchServerFriendRequests()`, `acceptServerFriendRequest()`, and `rejectServerFriendRequest()` exist. The DOM friend panel now has inline invite/player-id search with preview, a send-request action, pending count, received request accept/reject rows, and sent-pending rows; the main factory friend entry fetches pending inbound requests and shows a red badge count; the mail panel surfaces pending friend requests as a notification card that opens the friend panel. Richer target-UI polish and deeper multiplayer loops are still next.
- Real-player friend snapshots refresh name, level, and income from the target player during friend-list and leaderboard reads.
- `/api/friends/activity` returns recent social activity from `PlayerSocialActivity`. Add, visit, and gift actions write `friend_add`, `friend_visit`, and `friend_gift`; the DOM friend panel renders the recent activity block through `SyncManager.fetchServerFriendActivities()`.
- `/api/friends/{friendId}/visit` and `/api/friends/{friendId}/gift` return `FriendActionResponse`. First visit per friend per UTC day grants coin based on friend income, first gift grants 12 cat food, repeat same-day calls return `rewarded=false` with `daily_visit_claimed` or `daily_gift_claimed`.
- `SyncManager.visitServerFriend()` and `SyncManager.sendServerFriendGift()` apply the returned authoritative balances through `ResourceManager.applyServerSnapshot()`, then the DOM friend panel shows reward or already-claimed messaging.
- `tools/check-real-friend-contract.js`, `tools/check-friend-activity-contract.js`, `tools/check-friend-reward-contract.js`, `tools/check-friend-invite-contract.js`, and `tools/check-friend-request-contract.js` are part of `tools/quick-verify.ps1`; `tools/check-real-friend-online.js` starts the built API and verifies short invite-code profile/search/add, duplicate legacy player-id add, visit/gift rewards and daily limits, self-add rejection, friend request accept into bidirectional friends, friend list inclusion, activity stream inclusion, and leaderboard inclusion.
- `/api/leaderboard` returns a server-backed income leaderboard. It currently combines the current player's server-derived net production with seeded friend snapshots, returns ranked entries and the player's own row, and is consumed by the DOM friend panel through `SyncManager.fetchServerLeaderboard()`.
- `tools/check-leaderboard-contract.js` is part of `tools/quick-verify.ps1` and guards leaderboard DTOs, route/service, client API/types/sync fetch, friend-panel rendering, and service/API coverage.
- The next social-server step should refine friend-request visuals and build deeper multiplayer loops such as richer friend visits, profile cards, and interaction rewards.
- Cat upgrade, cat feed, and cat unlock now follow that pattern in the DOM cat overlay.
- Server login and save sync now fetch `/api/cats`; `CatManager.applyServerSnapshot()` applies server cat unlocked state, level, and weight into the local save.
- `/api/cats` now returns the full configured cat catalog with locked defaults and saved player state overlaid. It includes `assignedBuildingId`, equipment, equipment levels, rarity, role, base production, base bean cost, base salary, base weight, and skill id.
- `CatManager.getConfig()` and `CatManager.getAllConfigs()` overlay server cat metadata after `/api/cats`, so production, wage, unlock cost, and skill reads can reflect server definitions.
- DOM building schedule actions use `/api/cats/{catId}/assignment` in online mode. Empty `buildingId` means unassigned. Server rejects unknown building ids and over-capacity assignments.
- `tools/check-cat-snapshot-online.js` verifies this by recruiting `c_005`, corrupting local save, reconnecting, and confirming the server snapshot restores the cat.
- Server login and save sync now also fetch `/api/research`; `ResearchManager.applyServerSnapshot()` applies server unlocked research state.
- `/api/research` now returns the full configured research catalog with locked defaults and saved player state overlaid. It includes cost, effect type, effect value, and parent research id.
- `ResearchManager.getConfig()` and `ResearchManager.getAllConfigs()` overlay server research metadata after `/api/research`; the Cocos `ResearchPanel` uses the manager accessor instead of raw `ConfigManager.research`.
- Service/API tests cover multi-step research chains: second-tier unlocks fail before `res_basic_prod`, succeed after the parent is unlocked, repeated unlocks fail, and only successful unlocks create resource transactions.
- DOM research unlock uses `/api/research/{researchId}/unlock` in online mode. It spends server research points, records `research_unlock`, applies returned balances, and does not silently local-unlock if the server rejects the request.
- `res_cheap_upgrade` is now honored by server cat upgrade cost. Research definitions now load from `FATCATServer/FatCat.Api/balance.json` through `FatCat.Application/BalanceConfig.cs`.
- `res_bean_save` is now honored by server production preview and launch settlement. Preview supports optional `playerId`; `SyncManager.previewProduction()` logs in first and sends it.
- Production requests include `includesClientModifiers`. Server tests can send `false` to apply server-side research production, equipment production, equipment wage, and bean reduction from authoritative state.
- `/api/production/server-preview` returns a production preview derived from persisted server cat assignment, levels, weights, equipment, mood, building levels/effects, research, and skills.
- `SyncManager.previewProduction()` now uses `/api/production/server-preview`. `SyncManager.launch()` calls the same server preview first and sends that server-derived snapshot to `/api/launch`.
- `/api/launch` now recalculates production internally from server state and ignores submitted production numbers. Existing `LaunchRequest.Production` remains for client compatibility.
- `CatManager.getCatProduction()` and `FatCatGameService.CalculateServerCatProduction()` both multiply production by `mood / 100`. Default `c_001` has the soft cushion mood bonus, giving 105% mood and raising the default online net production to about 224/sec.
- `tools/check-research-unlock-online.js` verifies the UI path for unlocking `res_basic_prod`.
- Cat snapshots include equipment and equipment levels. `CatManager.applyServerSnapshot()` merges server equipment levels into local cat data.
- DOM equipment upgrade uses `/api/cats/{catId}/equipment/{itemId}/upgrade` in online mode. It spends server coin, records `equipment_upgrade`, applies returned balances, and applies the returned equipment level.
- `tools/check-equipment-upgrade-online.js` verifies the UI path for upgrading `equip_collar_green`.
- Server building state is persisted in `PlayerBuildingState` / `BuildingStates`. Auth ensures default building rows from `balance.json`.
- `/api/buildings` returns saved building levels and derived effect/upgrade/capacity values. `/api/buildings/{buildingId}/upgrade` spends server coin, records `building_upgrade`, updates the persisted level, and returns resource balances.
- `SyncManager.fetchServerBuildings()` applies `/api/buildings` through `BuildingManager.applyServerSnapshot()`. `SyncManager.upgradeServerBuilding()` backs the DOM building upgrade button in online mode.
- `tools/check-building-upgrade-online.js` verifies opening the building panel, upgrading `building_cafe_1f`, receiving `/api/buildings/building_cafe_1f/upgrade`, and applying Lv.6 -> Lv.7 locally.
- `tools/check-server-api.ps1` now includes building snapshot/upgrade coverage, full cat/research catalog snapshot metadata coverage, and expects 9 resource transactions after the full smoke sequence.
- `FatCatGameService.PreviewServerProductionAsync()` backs `/api/production/server-preview` and `/api/launch` settlement. Cat economy and skill definitions now load from `FATCATServer/FatCat.Api/balance.json`.
- Cat feed cost is now server-derived from default equipment effects. The default lucky cup keeps `c_001` feed cost at 9 cat food.
- Server equipment, default-equipment, building, cat economy, and skill definitions now load from `FATCATServer/FatCat.Api/balance.json` through `FatCat.Application/BalanceConfig.cs`.
- `tools/generate-server-balance.js` generates `FATCATServer/FatCat.Api/balance.json` from client configs. Run it after changing client research/equipment/building/cat/skill config; run with `--check` in verification.
- `tools/check-balance-config-drift.js` compares server `balance.json` to client `FATCATUI/assets/resources/configs/research.json`, `equipment.json`, `buildings.json`, `cats.json`, and `skills.json`. Run it after any research/equipment/building/cat/skill config edit.
- `tools/check-balance-effect-coverage.js` fails if client research/equipment config introduces a new effect type that has not been explicitly added to the server economy coverage list.
- `tools/check-client-catalog-metadata-consumption.js` guards the client-side use of server catalog metadata in `CatManager`, `ResearchManager`, and `ResearchPanel`.
- `tools/quick-verify.ps1` is the no-browser baseline gate: focused client TS, generated server balance check, config drift check, effect coverage check, client catalog metadata consumption check, shop/friend/leaderboard contract checks, and server tests.
- Online scripts now use `tools/start-api-process.js` to prefer the already-built API DLL over `dotnet run`, which avoids NuGet restore failures in restricted-network sessions.
- `tools/check-settings-production-preview-online.js` now clears local save before running and records failed response bodies, which helps diagnose stale dev database issues.
- `tools/check-launch-production-preview-online.js` waits long enough after clicking launch to capture both `/api/production/server-preview` and `/api/launch` on slower preview builds.
- The cat roster has explicit z-index above the content grid. Keep it clickable when changing cat page layout.
- Offline fallback still matters; do not make no-server mode unplayable.

## Visual Continuation Notes

- Target UI references live in the project root and should remain the visual source of truth.
- Latest main factory passes in `FATCATUI/assets/scripts/ui/BottomNavUI.ts` added building depth shading, brick/grid overlay, room foreground prop layers, floor level medals, wall-detail paper/jar layers, denser room lights, extra worker-cat silhouettes, thicker KPI/bonus cards, raised player badge, larger resource icon plaques, centered HUD values, deeper plus buttons, thicker side feature buttons, thicker bottom operation cards, larger launch button/rocket, richer bottom nav buttons, and a more target-like roof layer with crates, weathered sign, chimney, paw flag, and fat roof cat.
- Verification after the latest main factory richness/HUD/side-buttons/bottom-controls/roof passes: `tools/check-client-ts.ps1`, Cocos refresh for `db://assets/scripts`, `node tools/capture-main-regression.js`, and `node tools/verify-ui-clicks-playwright.js` passed.
- Main factory still needs target polish through richer generated/Cocos-managed art where CSS starts to feel flat, especially full room/background illustration depth.
- Top HUD, side feature buttons, and bottom controls are no longer the immediate blocker; future work there should be final micro-alignment after asset integration.
- Latest cat-page passes in `BottomNavUI.ts` added active side-tab pointer, larger center cat stage, speech bubble tail, right-side mood/feed icons, info-card edit badge, darker workshop depth, paper-grain cards, brighter portrait stage, thicker equipment/story cards, and raised active roster cards.
- Cat command-strip z-index must stay below interactive content such as equipment buttons; a too-high z-index blocked `data-action="equipItem"` in `verify-ui-clicks-playwright.js`.
- Latest cat density/texture passes slimmed stats/weight rows, made compact skill/equipment cards side by side, folded compact equipment detail rows, shortened the story card, added paper/photo treatment, and kept equipment upgrade clickable above the roster.
- Verification after the latest cat passes: `tools/check-client-ts.ps1`, Cocos refresh for `db://assets/scripts`, `node tools/capture-cat-regression.js`, and `node tools/verify-ui-clicks-playwright.js` passed.
- Cat page still needs richer generated/Cocos-managed art and final target-proportion polish while preserving verified online actions and roster clickability.
- For missing art, use generated local bitmap assets only when needed; save them in the Cocos asset tree, integrate them, verify render, and document the path here.
