# Repository Guidelines

## Project Structure & Module Organization

This repository contains a Cocos Creator client and a .NET server.

- `FATCATUI/`: Cocos Creator 3.8.8 project. Client TypeScript lives in `FATCATUI/assets/scripts/`; UI-heavy work is currently concentrated in `FATCATUI/assets/scripts/ui/BottomNavUI.ts`.
- `FATCATUI/assets/resources/`: gameplay configs and generated in-game textures.
- `FATCATServer/`: C# .NET solution with `FatCat.Api`, `FatCat.Application`, `FatCat.Domain`, `FatCat.Infrastructure`, and `FatCat.Tests`.
- `tools/`: verification, smoke-test, asset generation, and balance-sync scripts.
- `docs/ai-progress/`: current status, task planning, and handoff notes. Read these before large changes.
- Root PNG files are target UI references and should remain the visual source of truth.

## Build, Test, and Development Commands

- `dotnet test FATCATServer/FATCATServer.sln --no-restore`: run server tests.
- `powershell -ExecutionPolicy Bypass -File ./tools/check-client-ts.ps1`: run focused client TypeScript checks.
- `powershell -ExecutionPolicy Bypass -File ./tools/quick-verify.ps1`: run the baseline no-browser verification suite.
- `node tools/capture-main-regression.js`: capture main UI regression screenshots.
- `node tools/capture-cat-regression.js`: capture cat page regression screenshots.
- `node tools/verify-ui-clicks-playwright.js`: verify key UI click paths.
- `node tools/generate-server-balance.js --check`: ensure server balance data matches client configs.

## Coding Style & Naming Conventions

Use existing local patterns first. TypeScript uses Cocos-style classes and PascalCase component names; methods and variables use camelCase. C# follows standard .NET naming: PascalCase public types/members and camelCase locals. Keep edits scoped; avoid broad refactors in `BottomNavUI.ts` unless the task requires it.

## Testing Guidelines

For server changes, add or update `FatCat.Tests` coverage and run `dotnet test`. For client UI changes, run `check-client-ts.ps1` and the relevant Playwright/regression script. When editing gameplay configs, also run `generate-server-balance.js --check`, `check-balance-config-drift.js`, and `check-balance-effect-coverage.js`.

## Commit & Pull Request Guidelines

Use short, imperative commit messages, e.g. `Document GitHub repository handoff` or `Polish cat page layout`. PRs should include a concise summary, changed areas, verification commands run, screenshots for UI work, and any known risks or follow-up tasks.

## Agent-Specific Instructions

Do not commit generated caches, local databases, `node_modules`, Cocos `library/temp/build`, or `.git.embedded-backup` directories. Update `docs/ai-progress/02_CURRENT_STATUS.md` and `04_HANDOFF.md` after meaningful milestones so the next agent can resume safely.
