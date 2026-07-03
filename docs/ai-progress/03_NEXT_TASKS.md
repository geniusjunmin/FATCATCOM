# Next Tasks

Updated: 2026-07-03

## Round Contract

Each normal continuation round should finish a visible, verifiable batch. Aim for at least five clear subtasks before stopping:

| Step | Requirement |
| --- | --- |
| 1 | Pick one lane from `P0 Now` or `P1 Visual Push`. |
| 2 | Implement concrete code/content changes, not only analysis. |
| 3 | Run the matching verification gate. |
| 4 | Refresh Cocos asset-db after frontend TypeScript edits. |
| 5 | Update `02_CURRENT_STATUS.md`, this file, and `04_HANDOFF.md`. |

## Priority Radar

| Lane | Priority | Objective | Next Move |
| --- | --- | --- | --- |
| Server Economy | P0 | Keep authoritative production and resource mutation reliable. | Keep config checks green; shop-state, friend sync, real-friend add, friend rewards, short invite/search, friend requests, relation table, and leaderboard contracts are done. |
| UI Fidelity | P0 | Move visible screens closer to the target UI images. | Main HUD/factory materials and feature panels are aligned; next make the six live floor cards direct building-detail entry points. |
| Regression Gates | P0 | Prevent old click/layout/economy bugs from returning. | Use `tools/quick-verify.ps1` plus targeted Playwright/API scripts. |
| Multiplayer Base | P1 | Prepare the game for connected multi-user play. | Profiles, presence, owner decor acquisition/placement/collection, visits/gifts, persisted incoming/boost history, tiered cooperation, SSE events, requests, activity, and leaderboard are wired. |
| Code Health | P1 | Reduce frontend maintenance risk. | Shared presentation plus panel/factory/cat overlay CSS extractions are done; continue by extracting cohesive render responsibilities from `BottomNavUI.ts` while retaining action ownership. |

## P0 Now

### 0. Next Main-Floor Interaction Batch

- Turn each of the six `.floor-card` elements into a clear touch target without nesting controls or obscuring room art.
- Route a selected floor directly to the existing building-detail panel and preselect the matching authoritative building id.
- Preserve bottom-nav building entry behavior, online/offline upgrade boundaries, and current floor-card dimensions.
- Add selected/pressed/focus-visible feedback that matches the parchment/wood material instead of introducing a new visual language.
- Extend click regression to visit all six floor cards and verify the matching building id, title, level, and room art.
- Re-run all four main and feature sizes plus the complete navigation and verification gates.

### Completed: Main HUD And Factory Material Pass

- Company paper/wood framing, four recessed resource wells, bronze plus controls, floor parchment frames, dark production cards, green run lights, and carved side buttons now match `主页面.png` more closely.
- The generated cutaway remains unobscured and receives only a warm contrast treatment.
- Four-size regression guards exact resource markers/art, five side tools, material hooks, touch dimensions, and unchanged factory/operation/navigation proportions.

### Completed: Research Node Art And Level Rings

- Seven id-specific 384px alpha symbols are mapped through `GeneratedResearchArtAssets.nodes` and `getResearchNodeAsset()`.
- Tree rings consume real `level/maxLevel`; `data-research-maxed` supports max treatment and locked detail remains selectable.
- Four-size regression requires seven art ids/rings and online regression proves `0% -> 10%` at `Lv.1`.
- Preserve this mapping, the `1-2-3-1` geometry, multi-parent rules, and online/offline authority boundary.

### 1. Shared Config And Economy Coverage

- Research, equipment, building, cat economy, and skill definitions load from `FATCATServer/FatCat.Api/balance.json` through `FatCat.Application/BalanceConfig.cs`.
- `tools/generate-server-balance.js` generates server `balance.json` from client config JSON.
- `tools/check-balance-config-drift.js` verifies server/client config alignment.
- `tools/check-balance-effect-coverage.js` verifies every client research/equipment effect type is explicitly covered by the server economy model.
- `tools/check-shop-state-contract.js` verifies `/api/shop/state` and client shop-state consumption.
- `tools/check-friend-sync-contract.js` verifies client friend-panel consumption of `/api/friends` plus online visit/gift routing.
- `tools/check-real-friend-contract.js` verifies `/api/friends/add`, real-player friend snapshots, client add-friend API/sync, friend-panel action, and coverage.
- `tools/check-friend-activity-contract.js` verifies `/api/friends/activity`, server activity writes for add/visit/gift, client activity fetch/rendering, and coverage.
- `tools/check-friend-reward-contract.js` verifies visit/gift reward response shape, daily reward limits, client resource snapshot application, UI messages, and coverage.
- `tools/check-friend-invite-contract.js` verifies `/api/social/profile`, `/api/friends/search`, persisted short invite codes, relation rows, invite-code add compatibility, client API/sync helpers, friend-panel search confirmation, and coverage.
- `tools/check-friend-request-contract.js` verifies `/api/friends/requests`, bidirectional accept behavior, client API/sync helpers, friend-panel request UI hooks, inline invite search UI, factory friend-entry badge hooks, mail notification surfacing, and coverage.
- `tools/check-leaderboard-contract.js` verifies `/api/leaderboard`, client leaderboard API/types/sync fetch, friend-panel rendering, and service/API coverage.
- `tools/quick-verify.ps1` runs focused client TS, generated balance, drift, effect coverage, client catalog metadata, DOM asset resolver/formatter/config/presentation contracts, panel presentation contract, shop/social/leaderboard contracts, and server tests together. Native command failures now stop the suite.
- Next move: consider loading a true single config source directly at build/runtime, or wire `tools/quick-verify.ps1` into CI once CI exists.

### 2. Server-Side Production Model

- Server production now consumes persisted cat assignment, building levels, equipment, research, skills, and cat mood.
- `/api/production/server-preview` is the online preview path.
- `/api/launch` recalculates production internally and ignores submitted production numbers for settlement.
- Cat mood affects client/server production through `mood / 100`.
- Next move: expand remaining future bean/equipment effects only when new config types require them.

### 3. Catalog Snapshot Metadata

- `/api/cats` now returns the full configured cat catalog with locked defaults and saved player state overlaid.
- `/api/research` now returns the full configured research catalog with locked defaults and saved player state overlaid.
- Cat snapshots now include rarity, role, base production, base bean cost, base salary, base weight, and skill id.
- Research snapshots now include cost, effect type/value, legacy parent id, and the complete parent-id list.
- `CatManager`, `ResearchManager`, and the Cocos `ResearchPanel` now consume server catalog metadata through manager-level config overlays.
- Service/API tests now cover multi-step research chains: blocked second-tier unlocks, successful parent-first unlocks, repeated unlock rejection, full snapshot state, and transaction deltas.
- Keep offline local play compatible with the same local cat data shape.

### 4. Persistent Online Action Regressions

- `/api/shop/state` is now implemented and consumed after login/save sync. Keep it green with `node tools\check-shop-state-contract.js`.
- `/api/friends` is now consumed by the DOM friend panel, and visit/gift actions route through the server in online mode. Keep it green with `node tools\check-friend-sync-contract.js`.
- `/api/friends/add` creates a real-player friend snapshot from another player's id. Keep it green with `node tools\check-real-friend-contract.js` and `node tools\check-real-friend-online.js`.
- `/api/friends/{friendId}` refreshes one selected real-player snapshot without triggering visit rewards; the visit scene exposes this as `同步资料`. The same real-friend contract, online, service/API, and utility-layout gates cover it.
- `/api/social/presence` updates player activity, friend profiles expose `online`/`recent`/`offline`, returning login refreshes presence, and the client globally deduplicates heartbeat requests. Keep `check-friend-presence-contract.js`, `check-friend-presence-online-ui.js`, and `check-real-friend-online.js` green.
- Seeded friend creation uses atomic SQLite insert-if-missing semantics. Preserve this when changing friend initialization because friends and leaderboard requests run concurrently after login.
- `PlayerDecorState` persists twelve default decorations, grouped by building and guarded by atomic insert-if-missing. `FriendRoomDto.decorations` exposes only placed items and derives `decorScore` from their scores. Keep `check-friend-decor-contract.js`, `check-real-friend-online.js`, and utility screenshots green.
- `/api/decor` lists owner inventory and `/api/decor/{decorId}/placement` moves or toggles placement after validating the target building. The building detail panel consumes both routes. Keep `check-decor-placement-online-ui.js` and feature screenshots green.
- `/api/decor/catalog` lists six permanent premium decorations and `/api/decor/{decorId}/purchase` atomically creates ownership before deducting resources. The dynamic shop tab feeds purchased items into the matching building warehouse. Keep `check-decor-shop-contract.js`, `check-decor-shop-online-ui.js`, and `capture-decor-shop-regression.js` green.
- `/api/decor/collection` derives premium ownership progress and `/api/decor/collection/{tierId}/claim` grants the 1/3/6-item milestone rewards exactly once. Keep `check-decor-collection-contract.js`, `check-decor-collection-online-ui.js`, and the collection assertions in `capture-decor-shop-regression.js` green.
- `/api/social/events` streams visit/gift events through a singleton fan-out broker. `SyncManager` owns the `EventSource`, the factory shows incoming notices, and incoming interactions are persisted for replay. Keep `check-social-realtime-contract.js` and `check-social-realtime-online-ui.js` green.
- `/api/friends/{friendId}/help` gives real friends one daily production assist. Boost state lives on the target player, lasts 30 minutes, stacks from 10% to 30%, and is restored through `/api/social/boost`. Keep `check-friend-help-contract.js` and `check-friend-help-online-ui.js` green.
- `/api/social/boost/history` returns persistent contribution sources while preserving the existing shared 30-minute stack expiry. Login and SSE refresh the factory source chips and friend history card. Keep `check-friend-boost-history-contract.js`, `check-friend-boost-history-online-ui.js`, and utility screenshots green.
- `/api/social/coop-goal` tracks a daily three-assist target; `/claim` awards 30 diamonds once. Progress increments atomically, travels with help SSE events, and is rendered in the factory boost strip plus friend goal card. Keep `check-friend-coop-goal-contract.js` and `check-friend-coop-goal-online-ui.js` green.
- `/api/social/coop-goal/{tierId}/claim` adds atomic 1/2/3-assist rewards while preserving the old final `/claim` endpoint and legacy `IsClaimed` saves. The client card exposes all three milestones and applies authoritative coin, research, and diamond snapshots.
- `/api/friends/activity` records and returns add/visit/gift activity for the DOM friend panel. Keep it green with `node tools\check-friend-activity-contract.js`.
- `/api/friends/{friendId}/visit` and `/api/friends/{friendId}/gift` now return reward metadata and authoritative balances with once-per-UTC-day reward limits. Keep it green with `node tools\check-friend-reward-contract.js`.
- `/api/social/profile` and `/api/friends/search` now provide persisted short invite-code search before add, and `/api/friends/add` accepts invite codes as well as legacy player ids while writing `PlayerFriendRelation`. Keep it green with `node tools\check-friend-invite-contract.js`.
- `/api/friends/requests` now creates/lists/accepts/rejects friend requests; accepting writes bidirectional relations and snapshots, the friend panel has inline invite search plus send/request/inbox/outbox hooks, the factory friend entry shows a pending-request badge, and the mail panel surfaces friend requests as a notification card. Keep it green with `node tools\check-friend-request-contract.js` and `node tools\check-real-friend-online.js`.
- `/api/leaderboard` now returns a server-backed income leaderboard consumed by the DOM friend panel. Keep it green with `node tools\check-leaderboard-contract.js`.

Keep these scripts in the regular set when touching related flows:

- `node tools\check-cat-upgrade-online.js`
- `node tools\check-cat-feed-online.js`
- `node tools\check-cat-unlock-online.js`
- `node tools\check-cat-snapshot-online.js`
- `node tools\check-research-unlock-online.js`
- `node tools\check-equipment-upgrade-online.js`
- `node tools\check-building-upgrade-online.js`
- `node tools\check-settings-production-preview-online.js`
- `node tools\check-launch-production-preview-online.js`

## P1 Visual Push

### 0. Feature Panels From `其他页面.png`

- Done in latest shop-art batch: four built-in-generated 384px transparent props now represent cat food, coffee beans, coins, and diamonds. Resource-shop rows map real and preview items to those props, use small/large food-package variants, and keep all six rows above navigation at 360x800.
- `tools/check-shop-product-art.js` guards PNG dimensions, file size, registry/resolver/generator wiring, dedicated CSS, four-size embedded rendering, and navigation clearance. `capture-feature-regression.js` now includes 414x896.
- Done in latest DOM-mode cleanup: Web preview hides the native Cocos canvas while DOM overlays are active, removing leaked native text around compact panels; native builds still activate Cocos feature panels. `check-dom-canvas-mode-contract.js` plus main/cat/feature/utility screenshots guard this boundary.
- Building, shop, inventory, and research panels have been moved from generic flat cards toward the root `其他页面.png` reference.
- Done in latest feature-panel batch: building gets six floor chips, a generated factory-room hero, level-effect comparison rows, upgrade conditions, and the existing upgrade action; shop gets four tabs and six target-like rows; inventory gets a four-column by five-row grid with a bottom selected-detail card; research keeps a dark tree and cream detail panel side by side at compact widths.
- Done in latest feature-panel code-health batch: static settings rows, task milestones, shop tabs/catalog previews, inventory tabs/preview cards, and research tree positions now live in `FeaturePanelPresentation.ts`, guarded by `tools/check-feature-panel-presentation-contract.js`.
- `tools/capture-feature-regression.js` now covers these four panels at 430x932, 360x800, and 768x1024 with structural assertions and runtime error checks.
- Next move: keep shop geometry stable, then create a compact dedicated inventory prop set and ornate research-node symbols without changing the verified four-column/split layouts.

### 0a. Utility Panels

- Done in latest utility-panel batch: task, achievement, mail, friend, and settings panels now use a shared `utility-shell` visual language with target-like paper texture, hero cards, darker metric/status cards, stronger list containers, and fixed task-board typography.
- `tools/capture-utility-regression.js` now covers those five panels at 360x800, 414x896, 430x932, and 768x1024. It opens panels through the real main-screen hotspots, closes between captures, writes to `docs/verification/screenshots/2026-07-01-utility-regression/`, and checks panel shell classes plus runtime errors.
- Done in latest friend-panel batch: compact friend stats stay three-column, friend cards appear before request/leaderboard/activity modules, and each friend card has avatar/rank, income bar, visit/gift chips, and action buttons. Utility regression asserts these friend-specific structures.
- Done in latest friend-snapshot batch: the selected friend snapshot now exposes reward preview, last interaction state, and three compact factory-floor production slices. Utility regression asserts the snapshot stats/actions/floors at 430x932, 360x800, and 768x1024.
- Done in latest visit-report batch: the friend regression now clicks visit before capture, and the panel renders a dark visit report with reward state, two stat cells, three floor yield chips, close/revisit/gift actions, and a 360px-checked first-screen layout.
- Done in latest room-summary batch: `FriendDto.rooms` now exposes server-derived friend factory floor summaries, and the friend snapshot/report consume those rooms online while preserving offline estimates. `tools/check-friend-sync-contract.js` guards the DTO/type/UI path.
- Done in latest factory-detail batch: the friend panel now renders a richer factory-detail card from `FriendDto.rooms`, with source/room count, total income, primary floor, room-yield total, and room rows; utility regression asserts detail stats and rows.
- Done in latest staffing/decor batch: `FriendRoomDto` now includes assigned cat count, featured cat name, and decor score; real-player friends derive these from persisted cat/building state, and the friend factory detail rows render the meta.
- Done in latest visit-scene batch: clicking visit or the factory-detail entry opens a dedicated `.friend-visit-scene` ahead of the smaller report, reusing server/offline room summaries for floor rows plus total income, room yield, primary floor, staffed rooms, decor score, and visit/gift/back actions. `tools/capture-utility-regression.js` now asserts the scene floors, stats, and actions at 430x932, 360x800, and 768x1024.
- Done in latest visit-scene visual batch: the scene now maps rooms to local factory prop thumbnails, renders 1-3 assigned-cat mini portraits per room, adds a visitor-cat card, and exposes a compact reward/status strip that stays visible at 360x800. Utility regression now asserts thumbs, cat portraits, mascot, and reward chips.
- Done in latest visit-scene guard batch: `tools/check-friend-visit-scene-contract.js` now guards the visit-scene state/actions, render order, room reuse, visual selectors, compact guards, utility-regression assertions, and handoff notes; `tools/quick-verify.ps1` runs it after the friend sync contract.
- Done in latest friend-backdrop batch: built-in image generation produced a dedicated original six-floor friend coffee workshop matching the root main-screen reference's painterly wood/brick/brass language. The source PNG and 640px runtime JPEG are Cocos-managed, registered through `GeneratedBackgroundAssets.friendFactoryVisit`, embedded for DOM preview, and guarded by `tools/check-friend-factory-art.js`.
- `tools/capture-friend-visit-regression.js` captures the complete visit component at all four supported sizes, requiring a nontrivial screenshot, embedded JPEG backdrop, workshop sign, contained floors, and all five contained actions.
- Done in latest real-profile batch: `FriendDto.profile` identifies real/system friends and exposes player id, invite code, last-active time, unlocked cats, and total building level. Friend cards, snapshots, and visit scenes render profile chips; utility regression requires five profile groups and at least fifteen chips in offline preview.
- Done in latest targeted-refresh batch: `GET /api/friends/{friendId}` refreshes one friend snapshot on demand, `ApiClient`/`SyncManager` expose the path, and the visit scene separates `同步资料` from reward-bearing `领取访问`. The four-action row remains visible at 360x800.
- Done in latest presence batch: server heartbeat and three-state presence are live, the client sends one globally deduplicated heartbeat every 45 seconds, and an open friend panel refreshes every 30 seconds. Status badges remain visible at 430x932, 360x800, and 768x1024.
- Done in latest decor-inventory batch: six real friend rooms now expose two persistent placed decorations each, factory/visit rows render item names and scores, and hiding one persisted item removes it from the snapshot and lowers the room score.
- Done in latest owner-placement batch: building details show floor decor, placed count and score, with server-backed withdraw/place actions. Moving decor between floors is covered at service level and invalid building ids are rejected.
- Done in latest realtime batch: rewarded visit/gift actions publish to the target player, update the 360px factory notice card, and write incoming activity history. The stream closes cleanly on client destruction.
- Done in latest cooperative-help batch: real-player friends can send a daily 10% production boost, the server applies it to production and launch settlement, the target receives it live, and the factory shows source plus remaining minutes.
- Done in latest boost-history batch: each helper contribution is persisted, active stacks share the latest expiry, expired records remain visible, login/SSE refresh source state, and responsive factory/friend UI names all contributors. A three-player 360px browser regression covers the full path.
- Done in latest cooperative-goal batch: three distinct daily assists complete a server-persisted goal, the target claims 30 diamonds exactly once, and the responsive friend card/factory strip update through SSE.
- Done in latest cooperative-tier batch: 1/2/3 assists independently unlock coin, research, and diamond rewards; SQLite migrates a claim mask, old final claims remain valid, and a three-player 360px browser flow claims every tier and rejects repeats.
- Done in latest decor-shop batch: six permanent decorations now have authoritative catalog/ownership/price state, one-time purchase, resource transactions, live shop rows, local floor artwork, building-warehouse handoff, a real purchase/place browser test, and four-size screenshots.
- Done in latest decor-collection batch: the shop has a three-tier collection book, total score/progress, authoritative one-time rewards, atomic concurrent-claim protection, live resource snapshots, a real purchase/claim browser test, and four-size layout coverage.
- Done in latest main-proportion batch: exact `2580` diamond formatting is shared by the main DOM HUD, cat HUD, and Cocos top bar; the factory now reaches 86% of the canvas; compact operation/nav bands are about 7.2%/6.1%; floor and bonus cards are thinner; and the 360px gift countdown is no longer crowded by duplicate decoration.
- `capture-main-regression.js` now fails on diamond abbreviation, factory/action/nav geometry drift, oversized floor cards, or overflowing chest/launch/gift text. `capture-cat-regression.js` also requires the unabridged diamond value at all four sizes.
- Next move: keep this geometry stable and use the dedicated-art pipeline for the most visibly flat building/shop/inventory hero surface before making more global spacing changes.

### 1. Main Factory Richness

- Preserve the generated cutaway as the primary room artwork; do not restore the hidden duplicate CSS room/machine/cat layers.
- Keep the vertical factory readable on 360x800 and 768x1024.
- Continue matching the target main screen image instead of inventing a new visual language.
- Prefer generated/Cocos-managed artwork for major visual surfaces and keep DOM/CSS focused on live labels, cards, buttons, and interaction states.
- Done in latest visual batch: generated factory cutaway art is now used as a DOM illustration base, with building depth overlay, brick/grid shading, larger per-room foreground equipment/prop layers, floor level medals, wall-detail paper/jar layers, denser room lights, larger worker-cat staging, richer roof deck/crates/sign/chimney/flag/fat-cat staging, thicker resource pills, larger HUD icon plaques, centered values, stronger plus buttons, thicker side feature buttons, thicker bottom operation cards, larger launch button/rocket, and richer bottom nav buttons.
- Done in latest narrow-screen batch: compact floor names stay one line, compact card typography was reduced, card/KPI spacing was retuned, and 360x800 screenshot remained clean.
- Done in latest cutaway-first batch: the full generated factory is now undimmed and carries the roof plus all six room interiors; duplicate CSS room art and center KPI cards are removed from view, left/right floor cards follow the target hierarchy, the building span is taller, and bottom controls no longer collide with navigation at the four regression sizes.
- Next move: final HUD/company-badge micro-alignment and small floor-card typography tuning only; prioritize cat-page hero/story artwork after that.

### 2. Top HUD Polish

- Improve icon frames, shadows, resource pill depth, plus-button alignment, and number overflow.
- Recheck diamond, coin, bean, and cat food display on narrow screens.
- Make the company badge feel closer to the target UI.
- Watch the 360x800 case first; if it fits there, the wider phone sizes usually follow.
- Latest pass retuned player badge depth, avatar/level medallion, resource pill height, icon plaque scale, centered values, plus-button depth, and compact/wide spacing.
- Done in latest HUD micro pass: company badge now uses a lighter target-like wood/paper face, the avatar and level medallion are larger, the experience bar/text is repositioned, and compact/tall resource offsets are guarded against 360x800 value clipping.
- Done in latest target-fit pass: 414/430 compact-tall HUD uses a narrower company card, larger company label, and a left-shifted resource strip with positive measured spacing. The claim chest gets a wider operation track, smaller art crop, and single-line label while the <=390px layout remains dedicated.
- `capture-main-regression.js` now guards HUD player/resource overlap and claim-card text overflow in addition to structural counts and browser errors.
- Next pass should compare against the target HUD for final micro-alignment after richer art assets are integrated.

### 2a. Bottom Controls Polish

- Bottom operation cards and navigation are now closer to target with thicker cards, stronger active state, highlighted launch button, and richer icon plaques.
- Left/right feature buttons are also closer to target with heavier tool plaques, improved alert badges, and compact-size tuning.
- Keep checking 360x800 because this area is the first place text and button hit areas get tight.
- Next move should be final micro-alignment only after generated/Cocos-managed art assets are integrated.

### 3. Cat Page Polish

- Move closer to the reference cat page: left tabs, large center cat, right mood/status, bottom equipment and roster cards.
- Keep roster cards clickable; avoid z-index regressions.
- Clean up visible mojibake on cat, equipment, settings, and building panels.
- Preserve the current verified DOM cat path for online upgrade, feed, unlock, assignment, and equipment upgrade.
- Latest pass: cat page now uses visible viewport bounds with a small top bleed, has its own target-like top HUD, avoids the old modal/title framing, fixes the stretched resource-pill regression, and passes four-size cat screenshots plus click regression.
- Latest compact pass: the info card/name badge now stays readable under the top HUD on 360/430px widths, compact portrait height is tighter, and the top resource pills retain `M`/`K` suffixes.
- Done in latest side-rail pass: compact phones use a wider 9.8% left rail, 55px tab targets, larger generated icons, and an accessible left-arrow back control. Geometry regression now guards rail-to-hero spacing, rail-to-roster clearance, and roster bottom containment at all four supported sizes.
- Done in latest generated-hero batch: `c_001` now uses a transparent, target-style chubby orange cafe cat; compact HUD pills are flatter, the hero uses target-like three-column proportions, switch arrows sit outside the stage, mood/feed placement is corrected, production/stats/weight sections align vertically, weight stages have cat silhouettes, story photo/button form a three-column card, and the non-target floating action strip is hidden.
- Done in latest narrow-screen batch: under 390px the equipment bag folds away, the story card remains visible, and the roster is thinner and anchored at the bottom.
- Done in latest lineup-art batch: `c_002` through `c_005` now have matching transparent painterly full art, are registered through `UiAssetRegistry.ts`, and are embedded by the DOM asset bridge.
- Done in latest lineup regression batch: `tools/capture-cat-lineup.js` switches through all five cats at 430x932, saves one screenshot per cat, and fails on missing embedded art, console errors, or failed requests.
- Done in latest tablet batch: `applyResponsiveClasses()` exposes a visible-width `tablet` class, and the 768x1024 cat page now has a flatter HUD, compact hero/status cards, fixed-height equipment slots, restored story card, nonrepeating story photo, and a roster that no longer covers equipment.
- Done in latest shared-asset batch: main/cat HUDs use generated player/resource art, cat stats use generated item icons, weight stages reuse real selected-cat art, roster cards use all five full hero illustrations, and the obsolete three-thumb Data URI bridge is removed.
- Done in latest narrow-main batch: the gift card uses the tuxedo hero art and <=390px layouts keep side tools, order, gift, and launch controls readable.
- Done in latest proportion batch: the main nav is 7.2-7.4% tall instead of roughly 10%, the factory/action strip extends downward, click hotspots match the visual positions, and generated feature art is used by the right-side tools.
- Done in latest equipment batch: compact/tablet equipment and focus icons are larger, equipment names remain on one line, and the bottom cat nav entry uses the generated orange hero while the other nav entries keep clearer semantic silhouettes.
- Done in latest geometry batch: main nav is now 6.2-6.4% with bottom safety inset, floor bonus cards are narrower, cat side tabs are wider, upper cat content begins at the reference-aligned inset, and lower skill/story/roster sections regain near-full width on compact and tablet screens.
- Done in latest HUD batch: main/cat resource icons and plus controls are larger at 414/430/tablet widths, the main player badge is closer to target width, and <=390px uses a guarded internal grid so `M/K` value suffixes stay visible.
- Done in latest action-entry batch: 430px bottom tracks use `18/10/39/32`, launch and gift art have stronger target weight, main side-tool generated icons are larger, and all five cat side tabs use local generated assets tied to their function/current cat.
- Done in latest generated-icon batch: task, claim chest, launch rocket, factory, buildings, shop, backpack, and research now use project-native transparent PNGs with four-size and alpha-margin QC.
- Done in latest target-coordinate batch: the compact cat hero uses target-aligned left/center/right columns, the production bar spans from the info card toward the status rail, the tablet bar follows the same relationship, and the main action/nav bands plus click hotspots use their taller target proportions.
- Done in latest lower-section batch: skill current/next-level hierarchy, target-height equipment cards, larger cropped item art, workshop-backed story photo, roster rarity/level/status hierarchy, and an illustrated recruit card replace the flatter compact cards.
- Done in latest responsive-detail batch: 360-430 fixed heights now scale with viewport width, the 360 story/roster overlap is removed, tablet vertical space is redistributed into content, and 360 equipment detail uses a full-width mode that keeps backpack and upgrade actions available.
- Done in latest regression batch: `capture-cat-regression.js` captures information, equipment, and skin states at 414x896, 430x932, 360x800, and 768x1024 and asserts backpack, upgrade, wardrobe, and skin-card visibility.
- Done in latest skin-wardrobe batch: the skin tab now has an active wardrobe preview, four skin-state cards, selected/activity/locked states, reused generated cat thumbnails, compact 360px rules, and a screenshot regression for `cat-skin-<size>-edge.png`.
- Done in latest story-card batch: the lower story card now has story tags, paper-strip copy hierarchy, a pinned selected-cat work-photo sticker, chapter-style story-wall button, and regression assertions for story visibility/photo/button/tags.
- Done in latest equipment-card batch: equipped slots and backpack cards now have rarity badges, slot labels, bonus pills, clearer level/state text, locked-slot treatment, and regression assertions for both information and equipment views.
- Done in latest skin-theme batch: wardrobe cards now have distinct cafe/apron/manager/festival themes, CSS outfit overlays, style badges, color swatches, and regression assertions for themed skin cards.
- Done in latest cat presentation code-health batch: cat side tabs, skin wardrobe theme data, equipment slot definitions, locked-slot copy, default equipment fallback, and equipment-effect labels moved to `FATCATUI/assets/scripts/ui/CatPresentation.ts`; `tools/check-cat-presentation-contract.js` guards the split and runs in `tools/quick-verify.ps1`.
- Next move: only generate true bitmap skin/outfit thumbnails if the CSS themed cards are no longer enough; otherwise move to final main/cat micro-alignment or social UI polish.
- Done in latest cat-page batch: active side-tab pointer, larger center cat stage, speech bubble tail, right-side mood/feed icons, info-card edit badge, raised active roster card, and command-strip layering fix.
- Done in latest cat density batch: slimmer stats/weight rows, compact skill/equipment side-by-side layout, folded compact equipment detail rows, shorter story card, and clickable equipment upgrade above roster.
- Done in latest cat texture batch: darker workshop depth, paper-grain cards, brighter portrait stage, larger center cat art, stronger story photo, thicker equipment cards, and raised roster cards.
- Next move: preserve the now-aligned cat geometry, then return for final main/cat micro-alignment or deeper social UI/multiplayer polish.

### 4. UI Asset Boost

- If a missing illustration blocks fidelity, generate a local bitmap asset and save it under the Cocos asset tree.
- Record generated asset path, prompt intent, and integration point in `04_HANDOFF.md`.
- Verify the asset renders in the browser before considering the task done.
- Strong candidates: final small equipment/role icons and richer active/locked roster thumbnails.

## P2 Engineering Cleanup

### 1. Split `BottomNavUI.ts`

- Done in latest code-health batch: DOM asset lookup helpers moved to `FATCATUI/assets/scripts/ui/DomAssetResolver.ts`, leaving `BottomNavUI.ts` with thin wrappers so existing render code stays stable. `tools/check-dom-asset-resolver-contract.js` guards the extraction and is part of `tools/quick-verify.ps1`.
- Done in latest formatter batch: shared DOM display-number, rate, clock, and friend-report relative-time helpers moved to `FATCATUI/assets/scripts/ui/Formatters.ts`; `BottomNavUI.ts` now delegates through wrapper methods, and `tools/check-dom-formatters-contract.js` is part of `tools/quick-verify.ps1`.
- Done in latest main-panel config batch: `MainPanelId`, Cocos nav button aliases, DOM bottom-nav items, selected-name aliases, and main-nav feature icon mapping moved to `FATCATUI/assets/scripts/ui/MainPanelConfig.ts`; `tools/check-main-panel-config-contract.js` guards the split and runs in `tools/quick-verify.ps1`.
- Done in latest UI presentation batch: static labels, icon class choices, rarity stars, and cat skill/story/bubble presentation helpers moved to `FATCATUI/assets/scripts/ui/UiPresentation.ts`; `tools/check-ui-presentation-contract.js` guards the split and runs in `tools/quick-verify.ps1`.
- Done in latest factory presentation batch: main factory floor definitions, building scene/name maps, room prop/decor/wall/cat snippets, and floor bonus icon classes moved to `FATCATUI/assets/scripts/ui/FactoryPresentation.ts`; `tools/check-factory-presentation-contract.js` guards the split and runs in `tools/quick-verify.ps1`.
- Done in latest factory-overlay batch: the responsive main-factory CSS moved to `FATCATUI/assets/scripts/ui/FactoryOverlayPresentation.ts`, with the generated cutaway Data URI supplied as an explicit argument. The new contract guards style ownership and retained actions; four-size main screenshots, the 18-step click flow, and 63/63 server tests passed.
- Done in latest cat presentation batch: cat side tabs, skin themes, equipment slot definitions, locked-slot presentation, default equipment fallback, and equipment-effect labels moved to `FATCATUI/assets/scripts/ui/CatPresentation.ts`; `tools/check-cat-presentation-contract.js` guards the split and runs in `tools/quick-verify.ps1`.
- Done in latest cat-overlay batch: the full responsive cat-page CSS moved to `FATCATUI/assets/scripts/ui/CatOverlayPresentation.ts`, with the workshop Data URI supplied explicitly. Four-size information/equipment/skin screenshots, the five-cat lineup, 18-step click flow, and 63/63 server tests passed.
- Done in latest HUD presentation batch: top-HUD CSS, company/level/exp constants, and resource item definitions moved to `FATCATUI/assets/scripts/ui/HudPresentation.ts`; `tools/check-hud-presentation-contract.js` guards the split and runs in `tools/quick-verify.ps1`.
- Done in latest nav presentation batch: bottom DOM navigation CSS moved to `FATCATUI/assets/scripts/ui/NavPresentation.ts`; `tools/check-nav-presentation-contract.js` guards the split and runs in `tools/quick-verify.ps1`.
- Done in latest panel presentation batch: the shared feature/utility/social overlay CSS moved to `FATCATUI/assets/scripts/ui/PanelPresentation.ts`; `tools/check-panel-presentation-contract.js` guards style ownership and behavior entry points. Feature and utility screenshots, the 18-step click flow, and 63/63 server tests passed.
- First split HUD, bottom nav, main factory, cat page, and generic panels.
- Keep existing regression scripts green during each slice.
- Cat page and main factory CSS are now large enough that extracting DOM style/render helpers should be considered after the next visual checkpoint.

### 2. Asset Pipeline

- Gradually move Data URI assets into Cocos-managed local resources.
- When using generated assets, record the asset path and integration point.

### 3. Verification Discipline

- Most online scripts use `tools/start-api-process.js`; keep new online scripts on that helper.
- Avoid port conflicts around `http://localhost:5144`.
- Keep separate checks for main UI, cat UI, config/economy, and server API behavior.
- Keep `tools/check-client-catalog-metadata-consumption.js` in `tools/quick-verify.ps1` so manager-level server metadata consumption does not regress.

## Round Completion Standard

- Complete at least five clear subtasks unless the user asks for a focused fix.
- Refresh Cocos asset-db after frontend script edits.
- Run `dotnet test` and relevant smoke checks after server edits.
- Run Playwright click or screenshot regression after UI edits.
- Update `02_CURRENT_STATUS.md`, `03_NEXT_TASKS.md`, and `04_HANDOFF.md`.
