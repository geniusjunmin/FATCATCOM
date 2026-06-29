# Current Status

Updated: 2026-06-29

## Control Panel

| Item | Current Truth |
| --- | --- |
| Project Mode | UI fidelity push plus server-authoritative economy hardening. |
| Best Next Move | Continue visual fidelity with final main/cat proportion tuning and richer generated/Cocos-managed art depth; social next move is richer friend-request visuals and deeper multiplayer interaction polish. |
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
| Biggest Gap | Visual fidelity | Main factory and cat page are closer to target, but icon consistency, generated illustration depth, and final target-proportion tuning still need work. |
| Biggest Risk | Frontend size | `BottomNavUI.ts` remains too large and should be split after another stable UI checkpoint. |

## Client UI

- Main screen has portrait factory layout, top HUD, right-side feature buttons, bottom navigation, launch button, order card, and gift card.
- Main factory now uses generated `factory_cutaway_bg_640.jpg` as the primary room/roof artwork instead of dimming it under duplicate CSS rooms. Floor backgrounds, duplicate machines/cats/pipes, and the extra center KPI cards are hidden; the generated rooms remain crisp while responsive DOM cards preserve interaction and live values.
- Main floor information now matches the target hierarchy more closely: narrow left floor/level cards, one combined right-side production/bonus card per floor, a taller six-floor building span, and a lower compact bottom action strip with a single-line launch label.
- Narrow-screen main factory fit improved: 360px floor names stay on one line, compact floor cards have tuned width/typography, and compact HUD resource cells use tighter icon/value/plus spacing.
- Cat page is a full-screen DOM overlay with its own target-like top HUD, info, upgrade, skill, equipment, skin, bottom roster, equipment bag, and story entry.
- Latest cat-page visual pass: overlay now uses the visible viewport instead of the overflowing 640px design canvas, applies a small top bleed to cover the underlying main HUD, uses stable HUD sizing that no longer stretches resource pills, and keeps the page readable at 360x800, 414x896, 430x932, and 768x1024.
- Latest compact cat-page tuning: the mobile info card is wider, the cat name badge is single-line and no longer sits under the HUD, the center portrait was trimmed to preserve lower content, and compact resource pills now keep suffixes such as `M`/`K` visible.
- Latest cat hero/art pass replaces `c_001`'s flat egg-shaped portrait with generated transparent `cat_hero_orange_v2.png`: a dimensional chubby orange cafe cat with green scarf and paw mug. The workshop art now carries the upper-page background, while the compact HUD, hero columns, mood/feed cards, production strip, stats, visual weight stages, story wall, and roster follow the target layout more closely.
- The complete five-cat lineup now has matching generated full art: black launcher with red scarf/rocket badge, white ragdoll saver with blue scarf/jar, calico producer with plum scarf/dripper, and tuxedo support with teal scarf/star badge/ledger. All five use the same proportions and rendering language as the orange hero.
- Latest shared-asset polish replaces CSS placeholder art in both top HUDs with the generated player portrait and resource icons. Cat stats use real bean/food/coin icons, weight stages reuse the selected cat art at three scales, and roster cards use the five full hero illustrations instead of the legacy three-thumb bridge.
- Main-screen polish now uses the tuxedo cat illustration in the super-food gift card and adds a dedicated <=390px layout for readable side tools, order progress, gift text, and launch controls.
- Latest navigation-proportion pass reduces the main bottom nav from roughly 10% to 7.2-7.4% of the visible canvas, moves the operation cards and factory base down with it, and synchronizes all invisible click hotspots to the new positions. The factory now occupies more of the first viewport and matches the target composition more closely.
- Final geometry refinement reduces the nav again to 6.2-6.4%, adds a 1% bottom safety inset, narrows each floor bonus card from 20.5% to 18.5%, and keeps its hotspot center aligned. The resulting factory/action/nav proportions follow `主页面.png` more closely without clipping labels.
- Main right-side achievement/mail/friend/settings buttons now use generated local feature art. The bottom cat entry uses the orange hero illustration while factory/building/shop/inventory/research retain their clearer target-like semantic silhouettes.
- Latest HUD interior pass enlarges generated resource icons and orange plus buttons inside the already aligned main/cat pills. Main company-card width and level-medal position now follow the reference more closely; cat compact/tablet pills reserve explicit space for the larger controls.
- A <=390px main-HUD fallback slightly reduces those internal controls and value font so long values such as `12.45M` retain their suffix at 360x800. The 414/430 layouts keep the larger target-like treatment.
- Latest action-entry pass changes the 430px bottom operation tracks to `18/10/39/32`, giving the central launch action more target-like weight while reducing the oversized order/gift tracks. The launch rocket, title, and gift cat art are larger; <=390px keeps its dedicated column ratios.
- Latest target-coordinate pass increases the main action strip and navigation height, moves the factory base upward to keep all six floors clear, and synchronizes the fallback hotspots. On the cat page, compact hero columns now follow `24 / flexible / 25`, the mood/feed rail is wider, and the production bar spans 76% of the content from the info card toward the status rail; tablet uses the same visual relationship at 78%.
- Latest cat lower-section pass rebuilds the information tab around the target hierarchy: a current/next-level skill card with preserved detail and upgrade actions, four tall equipment cards with larger local art and replace controls, a workshop-backed pinned story photo, and cleaner rarity/level/work-state roster cards.
- Equipment rendering now has separate overview and detail modes. The information tab hides the dense backpack while the equipment tab preserves inventory and upgrade controls; at 360px the detail view becomes a full-width single column and temporarily folds the skill/story columns instead of hiding equipment functionality.
- Cat responsive heights now scale between 360 and 430 widths instead of reusing 430px fixed heights. The 360x800 story and roster no longer overlap, and the 768x1024 tablet allocates spare height to the hero, stats, weight, equipment, and story rather than leaving a large empty band.
- `tools/capture-cat-regression.js` now captures both information and equipment views at all four supported sizes and fails if the equipment backpack or upgrade action is not visible.
- Generated achievement/mail/friend/settings art now uses a cropped, larger presentation in the main side tools. Cat info/upgrade/skill/equipment/skin tabs dynamically use the selected cat, coin, role skill, collar, and cushion assets instead of CSS-only symbols.
- A new eight-icon project-native pack now replaces the remaining main-screen CSS placeholders: task clipboard, reward chest, launch rocket, factory, buildings, shop, inventory, and research. Final transparent PNGs live under `FATCATUI/assets/resources/textures/generated/ui/`, are registered in `UiAssetRegistry.ts`, and are embedded through `DomAssetDataUris.ts`.
- The generated 2x4 source was chroma-key processed into 384x384 frames. Independent alpha-bounds QC confirmed every final icon retains at least 42px transparent margin on every side; 430px uses stronger crop/scale while <=390px reduces nav icon width to preserve labels.
- Cat skill/focus art and equipment icons are larger in compact, wide, and tablet layouts; equipment names have a dedicated single-line label so the target-like item cards stay readable.
- Cat horizontal geometry now follows the reference's two-zone rule: hero/stats/weight remain to the right of a wider 9.4% side tab rail, while skill/equipment, story, and roster expand back to near-full width. Compact and tablet layouts both apply this rule, including a full-width tablet roster.
- The unused `GeneratedCatThumbAssets` registry and three legacy thumb entries were removed from the DOM Data URI generator, reducing duplicated embedded art while preserving the physical source files.
- `tools/capture-cat-lineup.js` cycles `c_001` through `c_005` at 430x932, captures each state, and verifies every portrait is backed by an embedded PNG without failed requests or console errors.
- At widths below 390px, the secondary equipment-bag row folds away so the story card and roster remain visible in the 360x800 first viewport.
- The 768x1024 cat page now uses a dedicated `tablet` responsive class triggered by visible canvas width >= 600px. It no longer depends on the landscape-oriented `wide` aspect check, so its HUD, 250px hero, compact status cards, stats, equipment, restored story card, and bottom roster all fit without overlap.
- Cat detail composition now has stronger target-UI cues: active side-tab pointer, larger center cat stage, speech bubble tail, right-side mood/feed icons, info-card edit badge, paper/card texture, darker workshop depth, raised roster active card, and command-strip layering that no longer blocks equipment clicks.
- Cat lower content density is improved: stats/weight rows are slimmer, skill and equipment cards sit side by side in compact mode, compact equipment details fold away, equipment/story cards have stronger paper and photo treatment, and the equipment upgrade button remains clickable above the roster.
- Building, shop, inventory, and research panels now follow `其他页面.png` more closely: building has a floor selector, illustrated room hero, level-effect table, conditions, and upgrade action; shop has four target-like category tabs and six list rows; inventory has a four-by-five item grid and selected-detail card; research preserves the dark tree plus cream detail side-by-side layout even at 360px.
- `tools/capture-feature-regression.js` captures those four feature panels at 430x932, 360x800, and 768x1024, and asserts panel visibility, expected row/card counts, building hero presence, inventory detail visibility, research side-by-side layout, and no browser errors or failed requests.
- Building, shop, inventory, research, task, achievement, mail, friend, and settings panels are clickable.
- Screenshot regression exists for 414x896, 430x932, 360x800, and 768x1024 on the main screen and cat page.
- Remaining visual gap: icon consistency, generated art depth where CSS still looks flat, final main/cat target proportions, and larger Cocos-managed illustration assets.

Latest verified UI commands:

- `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`
- `node .\tools\capture-main-regression.js`
- `node .\tools\capture-cat-regression.js`
- `node .\tools\capture-cat-lineup.js`
- `node .\tools\capture-feature-regression.js`
- `node .\tools\verify-ui-clicks-playwright.js`

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
- DOM friend panel now has add-friend and inline invite/search actions. In online mode it can search an invite code or player id in-panel, preview the target player, then send a friend request or use the legacy direct-add flow.
- `SyncManager` supports `/api/social/profile` and `/api/friends/search`; `/api/friends/add` accepts either legacy player id or persisted short invite code.
- `SyncManager` supports friend request create/list/accept/reject helpers over `/api/friends/requests`; the DOM friend panel now shows received/sent request summaries, pending counts, inline invite search, search preview, send-request action, and accept/reject buttons. The main factory friend entry shows a pending-request red badge, and the mail panel surfaces pending friend requests as a notification card that jumps to the friend panel.
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
- Real-player friend add endpoint: `/api/friends/add`, accepting another player's id or persisted short invite code and storing both a `player:{guid}` friend snapshot and `PlayerFriendRelation` row.
- Bidirectional friend request endpoints: `/api/friends/requests` create/list plus `/accept` and `/reject`, backed by `PlayerFriendRequest`. Accepting an inbound request writes both `PlayerFriendRelation` directions and both real-player `FriendSnapshot` rows.
- Social profile and friend search endpoints: `/api/social/profile` returns the player's persisted short invite code and income snapshot; `/api/friends/search` resolves invite code/player id before add.
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
- `tools/quick-verify.ps1` runs the focused client TypeScript check, generated balance check, drift check, effect coverage check, client catalog metadata consumption check, shop-state, friend-sync, real-friend, friend-activity, friend-reward, friend-invite, friend-request, leaderboard contract checks, and server tests as a no-browser baseline gate.
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
- 2026-06-20 friend-invite contract pass: added `/api/social/profile`, `/api/friends/search`, persisted short `FC...` invite codes, `PlayerFriendRelation`, invite-code add compatibility, client API/sync search helpers, friend-panel search-confirm flow, `tools/check-friend-invite-contract.js`, and service/API coverage.
- 2026-06-21 friend-request contract/UI pass: added `PlayerFriendRequest`, `/api/friends/requests` create/list/accept/reject, bidirectional relation/snapshot creation on accept, client API/sync helpers, friend-panel inbox/outbox UI hooks, inline invite search UI, factory friend-entry red badge, mail-panel friend-request notification surfacing, `tools/check-friend-request-contract.js`, and service/API/online smoke coverage.
- Cocos asset-db refreshed for `db://assets/scripts` after shop-state, friend-sync, leaderboard, real-friend, friend-activity, friend-reward, and friend-invite client TypeScript edits.

- `dotnet test FATCATServer\FATCATServer.sln --no-restore`: 63/63 passed.
- `powershell -ExecutionPolicy Bypass -File .\tools\quick-verify.ps1`: passed; includes client TS, generated server balance, config drift, effect coverage, client catalog metadata consumption, shop-state contract, friend-sync contract, real-friend contract, friend-activity contract, friend-reward contract, friend-invite contract, friend-request contract, leaderboard contract, and 63 server tests.
- `node tools\check-shop-state-contract.js`: passed; verifies server route/DTO/service, client API/types, sync fetch, manager snapshot consumption, and online purchase `remainingDaily` use.
- `node tools\check-friend-sync-contract.js`: passed; verifies friend API methods, login/save friend refresh, DOM server snapshot rendering, visit/gift routing, and API coverage.
- `node tools\check-real-friend-contract.js`: passed; verifies real-friend add DTO/repository/service/route, client API/types/sync fetch, friend-panel action, and service/API coverage.
- `node tools\check-friend-activity-contract.js`: passed; verifies social activity entity/schema, route/DTO/service/repository, client API/types/sync/panel rendering, and service/API coverage.
- `node tools\check-friend-reward-contract.js`: passed; verifies friend reward DTO/route/service behavior, client API/types, server balance application, UI reward messaging, and service/API coverage.
- `node tools\check-friend-invite-contract.js`: passed; verifies social profile/search routes, invite-code parsing/add compatibility, client API/types/sync helpers, friend-panel search confirmation, and service/API coverage.
- `node tools\check-friend-request-contract.js`: passed; verifies friend request domain/schema/repository, create/list/accept/reject routes, bidirectional accept behavior, client API/sync helpers, friend-panel request UI hooks, inline invite search UI, factory friend-entry badge hooks, mail notification surfacing, and service/API coverage.
- `node tools\check-real-friend-online.js`: passed; starts the built API, creates players, fetches invite codes, searches/adds by invite code, verifies duplicate legacy player-id add, visits/gifts, verifies first-claim rewards plus same-day limit reasons, rejects self-add, verifies friend request accept creates bidirectional friends, and verifies friend list, activity stream, and leaderboard inclusion.
- `node tools\check-leaderboard-contract.js`: passed; verifies leaderboard route/DTO/service, client API/types/sync fetch, friend-panel rendering, and service/API coverage.
- `node tools\verify-ui-clicks-playwright.js`: passed after friend-panel server sync changes.
- `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`: passed.
- `node tools\check-client-catalog-metadata-consumption.js`: passed; verifies `CatManager`, `ResearchManager`, and `ResearchPanel` route through server metadata-aware config access.
- `powershell -ExecutionPolicy Bypass -File .\tools\check-server-api.ps1 -ApiBaseUrl http://localhost:5144 -Origin http://localhost:7456`: passed with the built API DLL, including cat assignment, building snapshot, building upgrade, mood-adjusted `/api/production/server-preview`, and launch tamper resistance.
- Latest API smoke also verifies `/api/cats` returns 5 catalog entries, including locked `c_002` plus cat metadata, and `/api/research` returns 3 catalog entries, including locked `res_bean_save` plus research metadata.
- Cocos asset-db refreshed for `db://assets/scripts` after client manager and API type metadata updates.
- `node tools\verify-ui-clicks-playwright.js`: passed.
- Latest visual push check: `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts/ui`, `node tools\capture-main-regression.js`, and `node tools\verify-ui-clicks-playwright.js` passed after main factory/HUD CSS polish.
- 2026-06-22 main factory richness pass: added floor wall-detail layers, paper/jar props, stronger room light gradients, extra worker-cat silhouettes, denser prop staging, and thicker KPI/bonus cards in `BottomNavUI.ts`. Verified with `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts`, `node tools\capture-main-regression.js`, and `node tools\verify-ui-clicks-playwright.js`.
- 2026-06-22 top HUD polish pass: retuned the player/company badge, avatar ring, level medallion, exp bar, resource pill proportions, icon plaque size, value alignment, plus-button depth, and compact/wide resource spacing in `BottomNavUI.ts`. Verified with `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts`, `node tools\capture-main-regression.js`, and `node tools\verify-ui-clicks-playwright.js`.
- 2026-06-22 bottom controls polish pass: thickened the order/chest/gift cards, enlarged and highlighted the launch button/rocket, added stronger launch-count badge depth, and retuned the bottom nav bar, active state, icon plaques, and badges in `BottomNavUI.ts`. Verified with `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts`, `node tools\capture-main-regression.js`, and `node tools\verify-ui-clicks-playwright.js`.
- 2026-06-22 side feature buttons polish pass: thickened left/right side tool buttons, improved icon plaques, alert badges, highlights, shadows, and compact 360px sizing for task/achievement/mail/friend/settings entries in `BottomNavUI.ts`. Verified with `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts`, `node tools\capture-main-regression.js`, and `node tools\verify-ui-clicks-playwright.js`.
- 2026-06-22 roof/sign polish pass: added a layered roof deck, crate/block silhouettes, thicker weathered wood sign, sign posts, chimney/pipe detail, larger roof cat with cup, paw flag detail, and adjusted wide-layout roof spacing in `BottomNavUI.ts`. Verified with `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts`, `node tools\capture-main-regression.js`, and `node tools\verify-ui-clicks-playwright.js`.
- 2026-06-22 room foreground polish pass: enlarged floor-specific foreground equipment/props for office, roast, tank, mill, cafe, and storage rooms, enlarged worker cats, and added compact sizing guards in `BottomNavUI.ts`. Verified with `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts`, `node tools\capture-main-regression.js`, and `node tools\verify-ui-clicks-playwright.js`.
- 2026-06-22 factory illustration base pass: reused existing generated asset `FATCATUI/assets/resources/textures/generated/factory_cutaway_bg_640.jpg` as a DOM factory illustration base layer, tuned floor transparency, and added compact/wide/tall positioning guards in `BottomNavUI.ts`. Verified with `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts`, `node tools\capture-main-regression.js`, and `node tools\verify-ui-clicks-playwright.js`.
- Latest narrow-screen fit check: `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts/ui`, `node tools\capture-main-regression.js`, and `node tools\verify-ui-clicks-playwright.js` passed after compact floor-card/HUD spacing changes.
- Latest cat-page visual check: `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts/ui`, `node tools\capture-cat-regression.js`, and `node tools\verify-ui-clicks-playwright.js` passed after cat detail composition polish.
- Latest cat-page density check: `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts/ui`, `node tools\capture-cat-regression.js`, and `node tools\verify-ui-clicks-playwright.js` passed after compact skill/equipment/story density changes.
- 2026-06-22 cat-page texture pass: deepened the workshop backdrop, added card paper grain, improved portrait stage lighting/shadow, enlarged the center cat art, thickened roster cards, and polished stat/equipment/story cards in `BottomNavUI.ts`. Verified with `powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1`, Cocos asset refresh for `db://assets/scripts`, `node tools\capture-cat-regression.js`, and `node tools\verify-ui-clicks-playwright.js`.
- `node tools\check-settings-production-preview-online.js`: passed and asserts `/api/production/server-preview`.
- `node tools\check-production-wage-net-effect.js`: passed.
- `node tools\capture-main-regression.js`: passed for all four target sizes.
- `node tools\capture-cat-regression.js`: passed for all four target sizes.
- 2026-06-28 final icon/roster pass: main and cat screenshot regressions passed at 414x896, 430x932, 360x800, and 768x1024; all five lineup captures used embedded PNG art; all 18 UI click steps passed; browser open/close checks had no console errors; `tools/quick-verify.ps1` passed with 63/63 server tests.
- 2026-06-28 navigation/equipment pass: four-size main regression, four-size cat regression, all 18 UI click steps, focused TypeScript diagnostics, and `tools/quick-verify.ps1` passed after the shorter nav, moved action strip/hotspots, generated side icons, larger equipment art, and single-line equipment labels.
- 2026-06-28 final geometry pass: four-size main/cat regressions, five-cat lineup capture, all 18 UI click steps, and `tools/quick-verify.ps1` passed after 6.2-6.4% main navigation, narrower floor bonus cards, wider cat side tabs, reference-aligned upper content, and full-width lower cat sections.
- 2026-06-28 HUD interior pass: four-size main/cat captures, all 18 UI click steps, focused TypeScript diagnostics, and `tools/quick-verify.ps1` passed after larger resource art/plus controls and the 360px long-value fallback; server tests remain 63/63.
- 2026-06-28 action-entry pass: four-size main/cat captures, all cat-tab and navigation click paths, focused TypeScript checks, and `tools/quick-verify.ps1` passed after bottom-track rebalance, larger launch/gift art, larger main side icons, and dynamic generated cat-tab icons.
- 2026-06-28 generated navigation pack: four-size main captures, all 18 UI click steps, generated Data URI refresh, focused TypeScript checks, and `tools/quick-verify.ps1` passed after replacing task/chest/rocket and five bottom-nav placeholders; server tests remain 63/63.
- 2026-06-28 target-coordinate pass: fresh 430x932 browser comparison plus four-size main/cat captures, five-cat lineup capture, all 18 UI click steps, and focused TypeScript diagnostics passed after the taller main operation/navigation bands and the wider compact/tablet cat production/status composition.
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
- Friend request inbox/outbox basics, inline invite search, factory friend-entry red badge, and mail-panel notification surfacing are implemented. Richer target-UI visual treatment and deeper multiplayer interaction loops still need work.
