# Next Tasks

Updated: 2026-06-20

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
| Server Economy | P0 | Keep authoritative production and resource mutation reliable. | Keep config checks green; shop-state and friend sync are done, next expand ranking contracts. |
| UI Fidelity | P0 | Move visible screens closer to the target UI images. | Add floor richness, HUD polish, and cat-page composition improvements. |
| Regression Gates | P0 | Prevent old click/layout/economy bugs from returning. | Use `tools/quick-verify.ps1` plus targeted Playwright/API scripts. |
| Multiplayer Base | P1 | Prepare the game for connected multi-user play. | Add ranking/leaderboard contracts and move from default fake friends toward real player relations. |
| Code Health | P1 | Reduce frontend maintenance risk. | Split `BottomNavUI.ts` after the next stable UI checkpoint. |

## P0 Now

### 1. Shared Config And Economy Coverage

- Research, equipment, building, cat economy, and skill definitions load from `FATCATServer/FatCat.Api/balance.json` through `FatCat.Application/BalanceConfig.cs`.
- `tools/generate-server-balance.js` generates server `balance.json` from client config JSON.
- `tools/check-balance-config-drift.js` verifies server/client config alignment.
- `tools/check-balance-effect-coverage.js` verifies every client research/equipment effect type is explicitly covered by the server economy model.
- `tools/check-shop-state-contract.js` verifies `/api/shop/state` and client shop-state consumption.
- `tools/check-friend-sync-contract.js` verifies client friend-panel consumption of `/api/friends` plus online visit/gift routing.
- `tools/quick-verify.ps1` runs focused client TS, generated balance, drift, effect coverage, client catalog metadata, shop-state contract, friend-sync contract, and server tests together.
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

- Add more machine silhouettes, cat poses, light layers, pipes, sacks, crates, shelves, gauges, signs, and floor-specific props.
- Keep the vertical factory readable on 360x800 and 768x1024.
- Continue matching the target main screen image instead of inventing a new visual language.
- Prefer small layered CSS/DOM additions first; generate bitmap assets only when code-native decoration no longer sells the target look.
- Done in latest visual batch: building depth overlay, brick/grid shading, per-room foreground prop layer, floor level medals, and HUD icon/highlight polish.
- Done in latest narrow-screen batch: compact floor names stay one line, compact card typography was reduced, card/KPI spacing was retuned, and 360x800 screenshot remained clean.
- Next move: add richer generated or Cocos-managed art only where CSS decoration starts to look flat.

### 2. Top HUD Polish

- Improve icon frames, shadows, resource pill depth, plus-button alignment, and number overflow.
- Recheck diamond, coin, bean, and cat food display on narrow screens.
- Make the company badge feel closer to the target UI.
- Watch the 360x800 case first; if it fits there, the wider phone sizes usually follow.
- Latest pass added player badge highlights, resource icon outer glow, and plus-button shine; next pass should tune exact proportions and narrow-screen text fit.
- Latest narrow-screen pass tightened compact resource grid/icon/value/plus spacing. Next pass should compare against the target HUD and tune final plaque proportions.

### 3. Cat Page Polish

- Move closer to the reference cat page: left tabs, large center cat, right mood/status, bottom equipment and roster cards.
- Keep roster cards clickable; avoid z-index regressions.
- Clean up visible mojibake on cat, equipment, settings, and building panels.
- Preserve the current verified DOM cat path for online upgrade, feed, unlock, assignment, and equipment upgrade.
- Done in latest cat-page batch: active side-tab pointer, larger center cat stage, speech bubble tail, right-side mood/feed icons, info-card edit badge, raised active roster card, and command-strip layering fix.
- Done in latest cat density batch: slimmer stats/weight rows, compact skill/equipment side-by-side layout, folded compact equipment detail rows, shorter story card, and clickable equipment upgrade above roster.
- Next move: compare against the target cat page for richer generated art depth and final card texture/proportion polish.

### 4. UI Asset Boost

- If a missing illustration blocks fidelity, generate a local bitmap asset and save it under the Cocos asset tree.
- Record generated asset path, prompt intent, and integration point in `04_HANDOFF.md`.
- Verify the asset renders in the browser before considering the task done.
- Strong candidates: cat-page paper/card texture, richer workshop background, and small equipment/story photo assets.

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
