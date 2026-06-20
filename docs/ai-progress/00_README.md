# FatCat AI Progress Command Deck

Updated: 2026-06-17

> Start here. This folder is the live control deck for AI development rounds: vision, current truth, next moves, verification gates, and handoff warnings.

## Mission Pulse

| Channel | Signal | Meaning |
| --- | --- | --- |
| Visual Target | ACTIVE | Push every screen toward the reference UI images in the project root: warm, rich, tactile, cat-filled, mobile-first. |
| Server Authority | STRONG | Cats, equipment, buildings, research, launch, production preview, resources, and ledgers are server-backed. |
| Regression Shield | ONLINE | `tools/quick-verify.ps1` is the no-browser gate; Playwright/API scripts cover UI and online actions. |
| Multiplayer Runway | READYING | Core economy authority is in place; social, ranking, gifts, and live interaction are next server lanes. |
| Main Hazard | WATCH | `BottomNavUI.ts` is still oversized. Improve UI carefully, then split after a stable checkpoint. |

## Read Order

| Step | File | Use It For |
| --- | --- | --- |
| 1 | `01_PROJECT_OVERVIEW.md` | North star, product pillars, architecture, and roadmap. |
| 2 | `02_CURRENT_STATUS.md` | Implemented systems, latest verification, and risk map. |
| 3 | `03_NEXT_TASKS.md` | Current execution queue and round completion rules. |
| 4 | `04_HANDOFF.md` | Commands, caveats, key files, and exact continuation notes. |
| 5 | `05_ARCHIVE_INDEX.md` | Historical map only; do not start there unless tracing old work. |

## Operator Loop

1. Read the status and task queue.
2. Complete a meaningful batch, usually at least five clear subtasks.
3. Run the smallest relevant verification gate, then the wider gate when risk warrants it.
4. Refresh Cocos asset-db after frontend TypeScript edits.
5. Update `02_CURRENT_STATUS.md`, `03_NEXT_TASKS.md`, and `04_HANDOFF.md` before handing off.

## Fast Launch

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\quick-verify.ps1
```

Use the browser/API regression list in `04_HANDOFF.md` when touching visible UI, click flows, online actions, production, launch, or resource mutation.

## Non-Negotiables

- Keep the UI moving toward the supplied target images, not a new visual language.
- Preserve offline play while online paths become server-authoritative.
- Never delete archive files; they live in `docs/ai-progress/archive-2026-06-14/`.
- Do not run multiple scripts that spawn `http://localhost:5144` at the same time.
