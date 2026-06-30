# Handoff

Updated: 2026-06-30

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

## Latest UI Note

- Latest feature-panel batch aligns the building, shop, inventory, and research overlays with `其他页面.png`. The building panel now uses six floor selector chips, a generated factory-cutaway room hero, target-like level effects, conditions, and the existing upgrade action. Shop uses four category tabs plus six purchase rows. Inventory uses a 20-card grid and a selected-detail card. Research preserves a dark left tree and cream right detail panel at 360px, 430px, and 768px widths.
- New gate: `node tools\capture-feature-regression.js`. It writes screenshots to `docs/verification/screenshots/2026-06-29-feature-regression/` and fails if the expected feature-panel structure, inventory detail, research split, or clean runtime state regresses.
- Latest utility-panel batch gives task, achievement, mail, friend, and settings panels a shared `utility-shell` treatment. Important fix: the task board must keep its own local `font-size`; without that, the overlay design-height font makes the task board render as a huge clipped shape on 360/430 widths.
- New gate: `node tools\capture-utility-regression.js`. It writes screenshots to `docs/verification/screenshots/2026-06-30-utility-regression/`, clicks the real main-screen hotspots, closes each panel between captures, and asserts panel shell classes plus clean runtime state.
- Latest friend-panel multiplayer UI pass: the friend panel now keeps its stats in a compact three-column row on 360px, moves friend cards before request/leaderboard/activity modules, and renders friend cards with avatar/rank, income progress, visit/gift state chips, and visit/gift buttons. `capture-utility-regression.js` asserts friend cards, income bars, action buttons, search, requests, leaderboard, and activity modules.
- Latest friend-snapshot pass: the friend panel has a selected-friend factory snapshot with reward preview, last visit/gift state, and 3F/2F/1F production slices. `capture-utility-regression.js` now also asserts `.snapshot-floor` rows, so update that script if the snapshot is replaced by a dedicated visit scene.
- Latest friend-visit report pass: clicking visit creates `.friend-visit-report` above the snapshot with reward state, friend income, three floor chips, close/revisit/gift actions, and compact 360px-safe styling. `capture-utility-regression.js` intentionally clicks the first friend visit button before screenshots and asserts report stats/floors/actions.
- Latest friend-room contract pass: `FriendDto` includes `rooms` (`buildingId`, `floor`, `name`, `level`, `productionPerSecond`) derived from building balance definitions and friend income. `BottomNavUI.ts` uses those rooms for snapshot/report floor chips when online and falls back to estimates offline. `check-friend-sync-contract.js` now guards the DTO/type/UI path.
- Latest friend factory-detail pass: `BottomNavUI.ts` renders `.friend-factory-detail` from the selected/visited friend, showing room source/count, total income, primary floor, room total, and room rows. `capture-utility-regression.js` asserts `.factory-detail-stats` and `.factory-room-row`; keep those selectors updated if this moves into a dedicated visit scene.
- Latest friend staffing/decor pass: `FriendRoomDto` also includes `assignedCatCount`, `featuredCatName`, and `decorScore`. Real-player friends derive this from `CatStates`/`BuildingStates`; seeded friends use estimates. `capture-utility-regression.js` now asserts the room-row meta contains both `猫` and `装饰`.
- Latest friend visit-scene pass: `BottomNavUI.ts` now tracks `_friendVisitSceneId`. `visitFriend`, `sendFriendGift`, and the factory-detail `openFriendVisitScene` action open `.friend-visit-scene` ahead of the compact visit report. The scene reuses `getFriendRoomRows()` and `GeneratedBackgroundAssets.factoryCutaway` for a dark target-like friend factory view with floor rows, total income, room-yield total, primary floor, staffed room count, decor score, and visit/gift/back actions. `capture-utility-regression.js` asserts `.friend-scene-floor`, `.friend-scene-side`, and `.friend-scene-actions` across 430x932, 360x800, and 768x1024.
- Latest friend visit-scene visual pass: room rows now include `.room-thumb` local factory prop art selected by building id/floor/name, `.room-cats` assigned-cat mini portraits from the generated cat lineup, a `.friend-scene-mascot` visitor-cat card, and `.friend-scene-reward` chips for visit reward/last visit/gift state. Compact CSS was retuned so the scene action buttons remain visible at 360x800. `capture-utility-regression.js` now asserts these selectors in addition to the previous scene structure.
- Latest friend visit-scene guard pass: `tools/check-friend-visit-scene-contract.js` now protects the visit-scene state/actions, render order before the compact report, shared room-row data path, room thumbnails, assigned-cat mini portraits, visitor mascot, reward strip, compact CSS guards, utility-regression selectors, and this handoff note. It is part of `tools/quick-verify.ps1`.
- Latest code-health pass: DOM asset lookup helpers now live in `FATCATUI/assets/scripts/ui/DomAssetResolver.ts`. `BottomNavUI.ts` still exposes the same private wrapper methods, but no longer imports `DomAssetDataUris`, `FactoryPropDataUris`, or the generated item/cat/skill registries directly. `tools/check-dom-asset-resolver-contract.js` guards this split and runs in `tools/quick-verify.ps1`.
- Latest formatter cleanup pass: shared DOM display-number, production-rate, clock, and friend-report relative-time helpers now live in `FATCATUI/assets/scripts/ui/Formatters.ts`. `BottomNavUI.ts` keeps thin private wrapper methods for existing render code, and `tools/check-dom-formatters-contract.js` guards this split in `tools/quick-verify.ps1`.
- Latest main-panel config pass: `FATCATUI/assets/scripts/ui/MainPanelConfig.ts` now owns `MainPanelId`, Cocos nav aliases, DOM bottom-nav item labels/icon classes, selected-name aliases, and main-nav feature icon mapping. `BottomNavUI.ts` delegates those configuration reads while keeping the runtime badge and asset lookup behavior local. `tools/check-main-panel-config-contract.js` guards the split in `tools/quick-verify.ps1`.
- Latest UI presentation pass: `FATCATUI/assets/scripts/ui/UiPresentation.ts` now owns static label/icon-class helpers for friends, network/sync, tasks, shop, inventory, research, cat tabs, cat roles, weight stages, skill names/descriptions, speech bubbles, story text, and rarity stars. `BottomNavUI.ts` keeps wrapper methods so render call sites stay stable, and `tools/check-ui-presentation-contract.js` guards the split in `tools/quick-verify.ps1`.
- Latest factory presentation pass: `FATCATUI/assets/scripts/ui/FactoryPresentation.ts` now owns main factory floor definitions, building scene/display-name maps, static room props, room decor, wall details, worker-cat snippets, and floor bonus icon classes. `BottomNavUI.ts` still calculates live building levels and floor output text, then delegates static presentation. `tools/check-factory-presentation-contract.js` guards the split in `tools/quick-verify.ps1`.
- Latest feature-panel presentation pass: `FATCATUI/assets/scripts/ui/FeaturePanelPresentation.ts` now owns settings rows, default enabled toggles, task milestones, shop tabs/catalog previews, inventory tabs/preview cards, and research-tree node/placeholder positions. `BottomNavUI.ts` keeps live values/actions local, and `tools/check-feature-panel-presentation-contract.js` guards the split in `tools/quick-verify.ps1`.
- Latest cat presentation pass: `FATCATUI/assets/scripts/ui/CatPresentation.ts` now owns cat side tabs, skin wardrobe themes, equipment slot definitions, locked-slot presentation, default equipment fallback, and equipment-effect labels. `BottomNavUI.ts` keeps runtime cat data, equipment inventory, and actions local; `tools/check-cat-presentation-contract.js` guards the split in `tools/quick-verify.ps1`.
- Latest HUD presentation pass: `FATCATUI/assets/scripts/ui/HudPresentation.ts` now owns the top-HUD CSS, company/level/exp constants, and four resource item definitions. `BottomNavUI.ts` still calculates live resource values, production snapshot cache keys, and overlay layout; `tools/check-hud-presentation-contract.js` guards the split in `tools/quick-verify.ps1`.
- Latest nav presentation pass: `FATCATUI/assets/scripts/ui/NavPresentation.ts` now owns the bottom DOM nav CSS. `BottomNavUI.ts` still renders `MAIN_DOM_NAV_ITEMS`, badge counts, and click handling locally; `tools/check-nav-presentation-contract.js` guards the split in `tools/quick-verify.ps1`.
- Latest panel presentation pass: `FATCATUI/assets/scripts/ui/PanelPresentation.ts` now owns the shared feature, utility, and social overlay CSS. `BottomNavUI.ts` retains DOM creation, live rendering, and button actions; `tools/check-panel-presentation-contract.js` guards the split. `check-friend-visit-scene-contract.js` now reads compact scene CSS from this module, and `quick-verify.ps1` explicitly throws on non-zero native exit codes.
- Latest main-HUD micro pass in `BottomNavUI.ts` lightens the company badge toward the target wood/paper card, enlarges avatar/level treatment, repositions the experience readout, and nudges compact resource spacing. Verified at 360x800, 414x896, 430x932, and 768x1024 with `capture-main-regression.js`.
- Main factory now uses `FATCATUI/assets/resources/textures/generated/factory_cutaway_bg_640.jpg` as the visible source of truth for roof and room art. Duplicate CSS floors, props, cats, pipes, and center KPI cards are intentionally hidden; keep the live left floor cards and combined right production/bonus cards.
- The main building now spans roughly 16%-84% of the game viewport, and the compact bottom widgets use `19fr 11fr 35fr 34fr` proportions. The launch label is single-line at 360/414/430 widths.
- Verified after this main-screen pass: `check-client-ts.ps1`, all four `capture-main-regression.js` sizes, Cocos asset refresh, and the full `verify-ui-clicks-playwright.js` flow.
- Generated cat hero: `FATCATUI/assets/resources/textures/generated/cats/cat_hero_orange_v2.png`. It was generated with the built-in image tool from the target cat-page reference, using a flat magenta key, then locally keyed to alpha. Prompt intent: one full-body, front-facing, very chubby orange-and-white cafe cat, green scarf, green paw mug, warm painterly mobile-game rendering, no UI or background.
- Matching built-in-tool lineup assets: `cat_hero_black_v2.png` (black launcher, red scarf, rocket badge, red coffee pot), `cat_hero_white_v2.png` (white ragdoll saver, blue scarf, ingredient jar), `cat_hero_calico_v2.png` (calico producer, plum scarf, green dripper), and `cat_hero_tuxedo_v2.png` (tuxedo support, teal scarf, star badge, ledger). All live beside the orange hero under `textures/generated/cats/`.
- The calico source used a flat cyan key because its plum scarf conflicted with the default magenta key; the other lineup sources used magenta. Only final alpha PNGs and Cocos metadata are committed.
- `UiAssetRegistry.ts` maps `c_001` to the new hero, and `tools/generate-dom-asset-data-uris.ps1` embeds it for the DOM preview bridge. Regenerate `DomAssetDataUris.ts` after replacing or adding any DOM-consumed art.
- Compact cat layout now uses target-aligned hero columns, outside chevron switching, visual weight-stage cats, a clickable three-column story card, no floating action strip, and width-scaled lower-section heights. Below 390px, the information view remains complete while the equipment tab switches to a full-width detail mode with the backpack and upgrade button visible.
- Verified after this cat-art pass: `check-client-ts.ps1`, all four `capture-cat-regression.js` sizes, Cocos refresh for the asset/script folders, and the complete `verify-ui-clicks-playwright.js` path.
- `node tools/capture-cat-lineup.js` is the visual/asset gate for all five heroes. Latest run captured all five names with embedded PNG art and no browser errors or failed requests.
- `applyResponsiveClasses()` now adds `tablet` when the visible canvas width is at least 600px. Use `.tablet` for 768x1024 portrait-canvas rules; `.wide` remains aspect-ratio based and does not trigger for this preview.
- The tablet cat layout uses a 280px hero, expanded stats/weight/lower panels, compact right status cards, a restored three-column story card, and a 10.4%-high bottom roster. Do not revert to the old wide-only rules, which left the roster over the equipment panel.
- Latest cat lower-section integration keeps the information tab visually close to `所有猫咪页面.png`: skill current/next levels and actions are explicit, four equipment cards use larger local art and green replace controls, the story photo layers the selected cat over the workshop, and compact roster cards prioritize rarity, art, level, stars, and work state.
- `capture-cat-regression.js` now writes `cat-<size>-edge.png` and `cat-equip-<size>-edge.png` for all four supported viewports. It checks the equipment backpack and upgrade action in addition to the existing portrait/tab/card checks.
- Latest skin-wardrobe pass: `capture-cat-regression.js` also writes `cat-skin-<size>-edge.png` and asserts `.skin-wardrobe`, four `.skin-card-target` cards, and one selected skin. The skin tab in `BottomNavUI.ts` now renders an active preview plus selected/activity/locked skin cards instead of a single explanatory card.
- Latest story-card pass: `capture-cat-regression.js` now also asserts `.cat-story`, `.story-photo`, the story-wall button, and three `.story-tags`. The cat story area keeps the same compact/tablet geometry but now uses paper-strip copy, contextual tags, a pinned selected-cat work-photo sticker, and a chapter-style story-wall action.
- Latest equipment-card pass: `capture-cat-regression.js` now asserts equipped-slot rarity badges, slot tags, bonus pills, and backpack rarity/bonus pills. `BottomNavUI.ts` renders both equipped cards and backpack cards as target-like item cards with clearer level/state and locked-slot treatment.
- Latest skin-theme pass: `capture-cat-regression.js` now asserts four skin style badges, twelve color swatches, and three non-default themed cards. `BottomNavUI.ts` renders cafe/apron/manager/festival wardrobe themes with CSS outfit overlays and per-theme color variables, without changing the verified cat-page geometry.
- Latest full gate: four-size main screenshots, four-size cat information/equipment screenshots, five-cat lineup capture, 18-step UI click regression, focused TypeScript diagnostics, all config/social contract checks, and 63/63 server tests passed.
- Cat page fullscreen polish is in progress: it now lays out against the visible viewport, adds a small top bleed to cover the underlying main HUD, and renders its own top HUD.
- Latest compact cat-page pass widened the info column, restored the single-line cat name badge below the HUD, trimmed portrait height for lower-panel space, and reduced compact resource-pill text/buttons so `M`/`K` suffixes remain visible.
- The DOM UI uses the overlay root font-size as a design-height unit. For new normal-sized UI text inside that system, set a local percentage font-size on the container first, then use `em` or fixed pixel accents inside it.
- Verified after the latest cat-page pass: `check-client-ts.ps1`, `capture-cat-regression.js`, and `verify-ui-clicks-playwright.js`.

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
node tools\capture-feature-regression.js
node tools\capture-utility-regression.js
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
node tools\check-dom-asset-resolver-contract.js
node tools\check-dom-formatters-contract.js
node tools\check-main-panel-config-contract.js
node tools\check-ui-presentation-contract.js
node tools\check-factory-presentation-contract.js
node tools\check-feature-panel-presentation-contract.js
node tools\check-cat-presentation-contract.js
node tools\check-hud-presentation-contract.js
node tools\check-nav-presentation-contract.js
node tools\check-panel-presentation-contract.js
node tools\check-shop-state-contract.js
node tools\check-friend-sync-contract.js
node tools\check-friend-visit-scene-contract.js
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
- `tools/check-dom-asset-resolver-contract.js`
- `tools/check-dom-formatters-contract.js`
- `tools/check-main-panel-config-contract.js`
- `tools/check-ui-presentation-contract.js`
- `tools/check-factory-presentation-contract.js`
- `tools/check-shop-state-contract.js`
- `tools/check-friend-sync-contract.js`
- `tools/check-friend-visit-scene-contract.js`
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
- `FATCATUI/assets/scripts/ui/DomAssetResolver.ts`
- `FATCATUI/assets/scripts/ui/Formatters.ts`
- `FATCATUI/assets/scripts/ui/MainPanelConfig.ts`
- `FATCATUI/assets/scripts/ui/UiPresentation.ts`
- `FATCATUI/assets/scripts/ui/FactoryPresentation.ts`
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
- The next social-server step should build deeper multiplayer loops such as richer friend factory visit snapshots, profile cards, and interaction reward detail; the friend panel now has enough first-screen structure to host those flows.
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
- `tools/quick-verify.ps1` is the no-browser baseline gate: focused client TS, generated server balance check, config drift check, effect coverage check, client catalog metadata consumption check, DOM asset/formatter/config/presentation contract checks including panel CSS ownership, shop/friend/leaderboard contract checks, and server tests. It now propagates failed native command exit codes.
- Online scripts now use `tools/start-api-process.js` to prefer the already-built API DLL over `dotnet run`, which avoids NuGet restore failures in restricted-network sessions.
- `tools/check-settings-production-preview-online.js` now clears local save before running and records failed response bodies, which helps diagnose stale dev database issues.
- `tools/check-launch-production-preview-online.js` waits long enough after clicking launch to capture both `/api/production/server-preview` and `/api/launch` on slower preview builds.
- The cat roster has explicit z-index above the content grid. Keep it clickable when changing cat page layout.
- Offline fallback still matters; do not make no-server mode unplayable.

## Visual Continuation Notes

- Target UI references live in the project root and should remain the visual source of truth.
- Latest main factory passes in `FATCATUI/assets/scripts/ui/BottomNavUI.ts` now use `FATCATUI/assets/resources/textures/generated/factory_cutaway_bg_640.jpg` as a DOM illustration base layer, and added building depth shading, brick/grid overlay, larger room foreground machines/props, floor level medals, wall-detail paper/jar layers, denser room lights, larger worker-cat staging, thicker KPI/bonus cards, raised player badge, larger resource icon plaques, centered HUD values, deeper plus buttons, thicker side feature buttons, thicker bottom operation cards, larger launch button/rocket, richer bottom nav buttons, and a more target-like roof layer with crates, weathered sign, chimney, paw flag, and fat roof cat.
- Verification after the latest main factory richness/HUD/side-buttons/bottom-controls/roof/room-foreground/illustration-base passes: `tools/check-client-ts.ps1`, Cocos refresh for `db://assets/scripts`, `node tools/capture-main-regression.js`, and `node tools/verify-ui-clicks-playwright.js` passed.
- Main factory now has a generated cutaway illustration base, but still needs target polish through a cleaner layered-art architecture if the team wants more fidelity than semi-transparent CSS floors can provide. Avoid regenerating another full factory background until this asset is exhausted; the better next step is Cocos-managed room plates or stronger cat-page hero/story art.
- Top HUD, side feature buttons, and bottom controls are no longer the immediate blocker; future work there should be final micro-alignment after asset integration.
- Latest cat-page passes in `BottomNavUI.ts` added active side-tab pointer, larger center cat stage, speech bubble tail, right-side mood/feed icons, info-card edit badge, darker workshop depth, paper-grain cards, brighter portrait stage, thicker equipment/story cards, and raised active roster cards.
- The 2026-06-28 shared-asset pass moved main/cat HUD avatars and resource icons, cat stat icons, cat weight stages, the roster, and the main gift-card cat onto generated PNG art. `UiAssetRegistry.ts` and `generate-dom-asset-data-uris.ps1` no longer register the obsolete three legacy thumbnails.
- The same pass added <=390px main-screen rules for side-tool labels and bottom operations. Four-size main/cat regressions, five-cat lineup captures, all UI click steps, browser open/close checks, and `quick-verify.ps1` are green; server tests are 63/63.
- The subsequent navigation/equipment pass shortened the main nav to 7.2-7.4% of the canvas, moved the action cards and factory base down, updated nav/action hotspots, connected generated feature art to the right-side tools, enlarged cat focus/equipment art, and added nonwrapping equipment labels. Four-size main/cat captures, click regression, TypeScript checks, and `quick-verify.ps1` remain green.
- The final geometry pass refined main nav height to 6.2-6.4% with a 1% bottom safety inset, narrowed floor bonus cards, and established the cat page's target two-zone layout: upper content avoids the 9.4% side rail, while skill/equipment/story/roster use near-full width. Preserve this relationship on compact and tablet breakpoints.
- The HUD interior pass enlarges generated resource icons/plus controls without changing pill widths. Preserve the <=390px main-HUD fallback: it is required for values such as `12.45M` to keep their suffix at 360x800 while 414/430 retain the stronger target-like icon scale.
- The action-entry pass rebalances 430px bottom tracks to `18/10/39/32`, enlarges the rocket/gift cat, and uses cropped generated icons for main side tools plus dynamic selected-cat/function art for cat side tabs. Preserve the separate <=390px bottom grid and the cat-tab click attributes.
- The target-coordinate pass was measured against the 430x932 rendering and `所有猫咪页面.png`: compact hero columns are `24% / 1fr / 25%` with a `.25%` gap, the right mood/feed rail is 25%, and `.cat-power` is 76% wide with a 3% left inset. Tablet uses a 78% production bar with a 2% inset. Preserve this cross-column production-bar relationship.
- Main bottom controls now use an 8% action band above a 6.8-7.1% navigation band; the building bottom and fallback hotspot centers were moved with them. The <=390px operation tracks are `19/10/39/30` so the gift remains readable without shrinking the launch command.
- Generated UI pack paths: `generated/ui/icon_task_clipboard.png`, `icon_reward_chest.png`, `icon_launch_rocket.png`, `nav_factory.png`, `nav_buildings.png`, `nav_shop.png`, `nav_inventory.png`, and `nav_research.png`. Prompt intent: match `主页面.png` with warm hand-painted cafe-factory props, thick brown outlines, cream highlights, brass accents, and readable mobile silhouettes. Integration points are the factory task/chest/launch controls and `getMainNavIconAsset()`.
- The source was generated as a solid-magenta 2x4 prop pack, processed to eight 384x384 transparent frames, and independently checked for alpha margins (minimum 42px on all sides). Keep the final PNGs and Cocos `.meta` files committed; regenerate `DomAssetDataUris.ts` after changing them.
- Cat command-strip z-index must stay below interactive content such as equipment buttons; a too-high z-index blocked `data-action="equipItem"` in `verify-ui-clicks-playwright.js`.
- Latest cat density/texture passes slimmed stats/weight rows, made compact skill/equipment cards side by side, folded compact equipment detail rows, shortened the story card, added paper/photo treatment, and kept equipment upgrade clickable above the roster.
- Verification after the latest cat passes: `tools/check-client-ts.ps1`, Cocos refresh for `db://assets/scripts`, `node tools/capture-cat-regression.js`, and `node tools/verify-ui-clicks-playwright.js` passed.
- Cat page still needs richer generated/Cocos-managed art and final target-proportion polish while preserving verified online actions and roster clickability.
- Cat skin tab, story card, and equipment cards now have target-like structure and four-size screenshot coverage. Only generate true bitmap skin thumbnails if a later visual review shows the CSS themed wardrobe is no longer enough; avoid geometry churn.
- For missing art, use generated local bitmap assets only when needed; save them in the Cocos asset tree, integrate them, verify render, and document the path here.
