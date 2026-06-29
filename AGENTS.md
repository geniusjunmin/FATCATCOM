# Repository Guidelines

## Project Structure & Module Organization

This repository contains a Cocos Creator client and an ASP.NET Core server.

- `FATCATUI/`: Cocos Creator 3.8.8 client. TypeScript source is under `assets/scripts/`; current UI work is concentrated in `assets/scripts/ui/BottomNavUI.ts`.
- `FATCATUI/assets/resources/`: gameplay configuration, generated textures, and runtime resources.
- `FATCATServer/`: .NET solution containing API, Application, Domain, Infrastructure, and `FatCat.Tests` projects.
- `tools/`: client diagnostics, Playwright smoke tests, screenshot regression, asset generation, and balance-sync scripts.
- `docs/ai-progress/`: current status, task plans, and handoff notes. Read these before substantial changes.
- Root reference images such as `主页面.png`, `所有猫咪页面.png`, `猫咪详情页面.png`, and `其他页面.png` are the visual source of truth.

## Build, Test, and Development Commands

- `dotnet test FATCATServer/FATCATServer.sln --no-restore`: run all server tests.
- `powershell -ExecutionPolicy Bypass -File ./tools/check-client-ts.ps1`: run focused TypeScript diagnostics.
- `powershell -ExecutionPolicy Bypass -File ./tools/quick-verify.ps1`: run the baseline verification suite.
- `node tools/capture-main-regression.js`: capture main-screen reference sizes.
- `node tools/capture-cat-regression.js`: capture cat-page reference sizes.
- `node tools/capture-feature-regression.js`: capture building, shop, inventory, and research panels.
- `node tools/verify-ui-clicks-playwright.js`: exercise critical UI navigation.
- `node tools/generate-server-balance.js --check`: detect client/server balance drift.

## Coding Style & Naming Conventions

Follow nearby code and use four-space indentation unless a file establishes another style. Use PascalCase for TypeScript components and C# public types or members; use camelCase for methods, variables, and locals. Prefer existing Cocos helpers and .NET project boundaries over new abstractions. Keep large UI-file edits focused and avoid unrelated formatting changes.

## Testing Guidelines

Add server tests to `FatCat.Tests`, naming them after observable behavior. Client UI changes require TypeScript diagnostics plus the relevant screenshot and Playwright checks. Run the balance drift check whenever gameplay configuration changes. Inspect screenshots at all supported viewport sizes rather than relying only on script exit codes.

## Commit & Pull Request Guidelines

Use short imperative commits, for example `Polish cat page layout`. Pull requests should summarize changed areas, verification commands, known risks, and follow-up work. Include before/after screenshots for visual changes and link relevant issues when available.

## Agent-Specific Instructions

Never commit `node_modules`, local databases, generated Cocos `library`, `temp`, or `build` directories, or `.git.embedded-backup`. After meaningful milestones, update `docs/ai-progress/02_CURRENT_STATUS.md` and `docs/ai-progress/04_HANDOFF.md`.
