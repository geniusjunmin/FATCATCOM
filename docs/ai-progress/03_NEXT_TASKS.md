# Next Tasks

Updated: 2026-06-28

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
| UI Fidelity | P0 | Move visible screens closer to the target UI images. | Continue final main/cat proportion tuning and add richer illustration assets where CSS is still flat. |
| Regression Gates | P0 | Prevent old click/layout/economy bugs from returning. | Use `tools/quick-verify.ps1` plus targeted Playwright/API scripts. |
| Multiplayer Base | P1 | Prepare the game for connected multi-user play. | Refine friend-request visuals and build deeper multiplayer interaction loops. |
| Code Health | P1 | Reduce frontend maintenance risk. | Split `BottomNavUI.ts` after the next stable UI checkpoint. |

## P0 Now

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
- `tools/quick-verify.ps1` runs focused client TS, generated balance, drift, effect coverage, client catalog metadata, shop-state contract, friend-sync contract, real-friend contract, friend-activity contract, friend-reward contract, friend-invite contract, friend-request contract, leaderboard contract, and server tests together.
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
- Research snapshots now include cost, effect type, effect value, and parent research id.
- `CatManager`, `ResearchManager`, and the Cocos `ResearchPanel` now consume server catalog metadata through manager-level config overlays.
- Service/API tests now cover multi-step research chains: blocked second-tier unlocks, successful parent-first unlocks, repeated unlock rejection, full snapshot state, and transaction deltas.
- Keep offline local play compatible with the same local cat data shape.

### 4. Persistent Online Action Regressions

- `/api/shop/state` is now implemented and consumed after login/save sync. Keep it green with `node tools\check-shop-state-contract.js`.
- `/api/friends` is now consumed by the DOM friend panel, and visit/gift actions route through the server in online mode. Keep it green with `node tools\check-friend-sync-contract.js`.
- `/api/friends/add` creates a real-player friend snapshot from another player's id. Keep it green with `node tools\check-real-friend-contract.js` and `node tools\check-real-friend-online.js`.
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
- Next move: compare the remaining generic panels against the target visual language, then improve the cat story/equipment illustration depth without changing the now-aligned screen geometry.
- Done in latest cat-page batch: active side-tab pointer, larger center cat stage, speech bubble tail, right-side mood/feed icons, info-card edit badge, raised active roster card, and command-strip layering fix.
- Done in latest cat density batch: slimmer stats/weight rows, compact skill/equipment side-by-side layout, folded compact equipment detail rows, shorter story card, and clickable equipment upgrade above roster.
- Done in latest cat texture batch: darker workshop depth, paper-grain cards, brighter portrait stage, larger center cat art, stronger story photo, thicker equipment cards, and raised roster cards.
- Next move: compare against the target cat page for generated art depth and final proportion polish.

### 4. UI Asset Boost

- If a missing illustration blocks fidelity, generate a local bitmap asset and save it under the Cocos asset tree.
- Record generated asset path, prompt intent, and integration point in `04_HANDOFF.md`.
- Verify the asset renders in the browser before considering the task done.
- Strong candidates: final small equipment/role icons and richer active/locked roster thumbnails.

## P2 Engineering Cleanup

### 1. Split `BottomNavUI.ts`

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
