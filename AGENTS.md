# Repository Guidelines

## Project Structure & Module Organization

This repository contains a Cocos Creator client and a .NET server.

- `FATCATUI/`: Cocos Creator 3.8.8 project. Client TypeScript is in `FATCATUI/assets/scripts/`; the main UI implementation is currently concentrated in `FATCATUI/assets/scripts/ui/BottomNavUI.ts`.
- `FATCATUI/assets/resources/`: gameplay configs, generated UI textures, and other client resources.
- `FATCATServer/`: .NET solution containing `FatCat.Api`, `FatCat.Application`, `FatCat.Domain`, `FatCat.Infrastructure`, and `FatCat.Tests`.
- `tools/`: verification, screenshot regression, smoke-test, asset, and balance-sync scripts.
- `docs/ai-progress/`: current status, task plans, and handoff notes. Read these before major work.
- Root PNG files such as `主页面.png` and `所有猫咪页面.png` are target UI references.

## Build, Test, and Development Commands

- `dotnet test FATCATServer/FATCATServer.sln --no-restore`: run server tests.
- `powershell -ExecutionPolicy Bypass -File ./tools/check-client-ts.ps1`: run focused TypeScript checks for the Cocos client.
- `powershell -ExecutionPolicy Bypass -File ./tools/quick-verify.ps1`: run the baseline local verification suite.
- `node tools/capture-main-regression.js`: capture main-screen UI regression screenshots.
- `node tools/capture-cat-regression.js`: capture cat-page UI regression screenshots.
- `node tools/verify-ui-clicks-playwright.js`: verify important UI click paths.
- `node tools/generate-server-balance.js --check`: confirm server balance data matches client configs.

## Coding Style & Naming Conventions

Follow existing local patterns first. TypeScript uses Cocos-style classes with PascalCase component names and camelCase methods/variables. C# follows standard .NET naming: PascalCase public types and members, camelCase locals. Keep edits scoped, especially in `BottomNavUI.ts`, and avoid unrelated formatting churn.

## Testing Guidelines

For server changes, add or update tests in `FatCat.Tests` and run `dotnet test`. For client UI changes, run `check-client-ts.ps1` plus the relevant Playwright or screenshot regression script. When editing gameplay configs, also run balance drift/effect coverage checks where applicable.

## Commit & Pull Request Guidelines

Use short, imperative commit messages, for example `Polish cat page layout` or `Add friend request badges`. PRs should include a concise summary, changed areas, verification commands, screenshots for UI work, known risks, and follow-up tasks.

## Agent-Specific Instructions

Do not commit generated caches, local databases, `node_modules`, Cocos `library/temp/build`, or `.git.embedded-backup`. After meaningful milestones, update `docs/ai-progress/02_CURRENT_STATUS.md` and `docs/ai-progress/04_HANDOFF.md` so the next agent can resume safely.
