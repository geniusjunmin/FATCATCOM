# FatCat Project Overview

Updated: 2026-06-17

## North Star

FatCat Coffee Company is a portrait mobile online management game: a warm, detailed, cat-staffed coffee factory where production, cat growth, equipment, buildings, research, launch gameplay, and social systems all feed one replayable loop.

The visual target is the reference UI image set in the project root. The game should keep moving toward those images: richer floor interiors, polished resource HUDs, expressive cat panels, tactile cards, readable mobile layouts, and generated local image assets whenever the UI needs missing art.

## Experience Pillars

| Pillar | Direction |
| --- | --- |
| Factory Fantasy | A stacked coffee building full of rooms, cats, machines, pipes, lights, shelves, sacks, gauges, and visible production stats. |
| Cat Collection | Recruit, feed, upgrade, equip, assign, skin, and specialize cats with server-backed state. |
| Economy Depth | Buildings, research, equipment effects, wages, beans, launch rewards, resource transactions, and balance drift checks. |
| Online Backbone | C# / ASP.NET Core owns meaningful mutations and prepares the project for multiplayer interaction. |
| Mobile Polish | Layout must survive 360x800, 414x896, 430x932, and 768x1024 without broken HUDs, blocked buttons, or unreadable cards. |

## Screen Targets

| Screen | Desired Feel | Current Direction |
| --- | --- | --- |
| Main Factory | Rich vertical building, readable floor stats, prominent launch action, polished HUD. | Keep adding floor-specific interiors, cats, prop density, better icon framing, and responsive spacing. |
| Cat Detail | Full-screen character showcase with left tabs, center cat, right mood/feed controls, bottom roster. | Preserve clickability while moving closer to the target reference composition. |
| Building/Shop/Inventory/Research | Tactile mobile panels with clear affordances and server-aware actions. | Polish after main and cat screens reach a stable visual checkpoint. |
| Social Future | Friends, gifts, rankings, visits, and multiplayer-facing activity. | Server foundations exist; expand after core economy and UI are steadier. |

## Architecture Map

| Path | Role |
| --- | --- |
| `FATCATUI/` | Cocos Creator 3.8.8 + TypeScript client. |
| `FATCATServer/` | ASP.NET Core server with EF Core and SQLite/InMemory test coverage. |
| `tools/` | Playwright checks, API smoke checks, config checks, screenshot regression scripts. |
| `docs/verification/screenshots/` | Visual regression output. |
| `docs/ai-progress/` | Current progress, plans, and handoff notes for AI continuation. |

## Current Battle Lines

| Front | Status |
| --- | --- |
| UI Alignment | Main and cat screens exist, but need denser art, stronger tactile styling, and closer reference matching. |
| Server Authority | Launch, cats, equipment, research, buildings, production preview, and balance config are server-aware. |
| Config Safety | Client config generates/checks server `balance.json`; drift and effect coverage checks are in place. |
| Regression Safety | Core no-browser gate is `tools/quick-verify.ps1`; browser/API scripts cover UI and online flows. |
| Cleanup | `BottomNavUI.ts` is the largest frontend maintenance risk and should be split after the next stable UI milestone. |

## Roadmap

1. UI alignment: push main factory, cat page, building page, shop, inventory, and research toward the reference UI.
2. Gameplay loop: make cat growth, equipment, research, shop, mail, and launch gameplay coherent and satisfying.
3. Server authority: continue moving all meaningful resource mutations to server-confirmed actions.
4. Online play: expand friends, gifts, rankings, async interactions, live config, and eventually realtime events.
5. Engineering cleanup: split the large UI file, normalize asset handling, and grow stable regression gates.

## Best Next Direction

Keep advancing in two synchronized lanes:

- Visual lane: main factory richness, HUD finish, cat detail panel composition, paper/card texture, icons, and responsive layout.
- Server lane: multiplayer/social contracts, authoritative snapshots, resource mutation safety, and config coverage.
