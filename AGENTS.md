# Repository Guidelines

## Project Structure & Module Organization

This repository contains a Cocos Creator client and an ASP.NET Core server.

- `FATCATUI/`: Cocos Creator 3.8.8 client project. TypeScript source lives in `FATCATUI/assets/scripts/`; current UI-heavy work is centered in `FATCATUI/assets/scripts/ui/BottomNavUI.ts`.
- `FATCATUI/assets/resources/`: gameplay configs, generated textures, and client resources.
- `FATCATServer/`: .NET solution with `FatCat.Api`, `FatCat.Application`, `FatCat.Domain`, `FatCat.Infrastructure`, and `FatCat.Tests`.
- `tools/`: verification, screenshot regression, smoke-test, asset generation, and balance-sync scripts.
- `docs/ai-progress/`: current status, task plans, and handoff notes. Read these before large changes.
- Root PNG files (`主页面.png` and `所有猫咪页面.png`) are the visual source of truth for UI work.

## Build, Test, and Development Commands

- `dotnet test FATCATServer/FATCATServer.sln --no-restore`: run server tests.
- `powershell -ExecutionPolicy Bypass -File ./tools/check-client-ts.ps1`: run focused client TypeScript diagnostics.
- `powershell -ExecutionPolicy Bypass -File ./tools/quick-verify.ps1`: run the baseline no-browser verification suite.
- `node tools/capture-main-regression.js`: capture main screen regression screenshots.
- `node tools/capture-cat-regression.js`: capture cat page regression screenshots.
- `node tools/capture-cat-lineup.js`: cycle all five cats at 430x932 and verify their embedded hero art.
- `node tools/verify-ui-clicks-playwright.js`: verify important UI click paths.
- `node tools/generate-server-balance.js --check`: check client/server balance data drift.

## Coding Style & Naming Conventions

Follow existing local patterns before introducing abstractions. Use four-space indentation unless the surrounding file differs. TypeScript uses PascalCase component classes and camelCase methods or variables. C# follows standard .NET conventions: PascalCase public types and members, camelCase locals. Keep edits scoped, especially in large UI files, and avoid unrelated formatting churn.

## Architecture Overview

Keep presentation and Cocos lifecycle code in the client. Put multiplayer rules and authoritative state in the server, with application use cases separated from domain models and infrastructure adapters. Shared balance data must remain synchronized through the repository's generation scripts.

## Testing Guidelines

For server changes, add or update tests in `FatCat.Tests` and run `dotnet test`. For client UI changes, run `check-client-ts.ps1` plus the relevant screenshot or Playwright script. When editing gameplay configs, also run balance drift checks. Name tests after the behavior being protected, not the implementation detail.

## Commit & Pull Request Guidelines

Use short, imperative commit messages, such as `Polish cat page layout` or `Document GitHub handoff`. Pull requests should include a concise summary, changed areas, verification commands run, screenshots for UI work, known risks, and follow-up tasks.

## Agent-Specific Instructions

Do not commit generated caches, local databases, `node_modules`, Cocos `library/temp/build`, or `.git.embedded-backup` directories. After meaningful milestones, update `docs/ai-progress/02_CURRENT_STATUS.md` and `docs/ai-progress/04_HANDOFF.md` so the next agent can resume safely.
