# AI Handoff - 2026-06-13 Cat Upgrade Resource

## Current State

The cat upgrade flow is now server-authoritative in the production DOM cat panel when an API base URL is configured. A fresh user can click the cat button and upgrade without first opening settings: the client logs in as guest, calls `/api/cats/c_001/upgrade`, applies server balances to the HUD, and updates the local cat level from the server response.

## Important Files

- `FATCATServer/FatCat.Domain/PlayerCatState.cs`
- `FATCATServer/FatCat.Application/FatCatGameService.cs`
- `FATCATServer/FatCat.Application/Contracts.cs`
- `FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs`
- `FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs`
- `FATCATServer/FatCat.Api/Program.cs`
- `FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs`
- `FATCATServer/FatCat.Tests/FatCatApiTests.cs`
- `FATCATUI/assets/scripts/net/ApiTypes.ts`
- `FATCATUI/assets/scripts/net/ApiClient.ts`
- `FATCATUI/assets/scripts/manager/SyncManager.ts`
- `FATCATUI/assets/scripts/manager/CatManager.ts`
- `FATCATUI/assets/scripts/ui/BottomNavUI.ts`
- `tools/check-server-api.ps1`

## Verified Commands

- `dotnet test FATCATServer\FATCATServer.sln`
- `.\tools\check-client-ts.ps1`
- `.\tools\check-server-api.ps1 -ApiBaseUrl http://localhost:5144 -Origin http://localhost:7456`
- `node tools\verify-ui-clicks-playwright.js`
- `node tools\check-settings-production-preview-online.js`
- `node tools\check-production-wage-net-effect.js`
- `node tools\capture-main-regression.js`
- `node tools\capture-cat-regression.js`
- `node tools\check-launch-production-preview-online.js`

## Cautions

- Do not run multiple scripts that spawn `http://localhost:5144` in parallel.
- After frontend script edits, refresh Cocos assets with `Editor.Message.request('asset-db', 'refresh-asset', 'db://assets/scripts/...')`.
- The server upgrade cost does not yet include research discounts. This is known and should be handled with server research state later.
- The legacy Cocos `CatDetailPanel` still uses local-only upgrade; the DOM cat overlay is the verified production path.

## Suggested Next Step

Continue the server-authoritative resource migration with cat feeding or cat unlock/recruit. Both should mirror the pattern now used by shop purchase, mail claim, launch settlement, and cat upgrade: validate on server, mutate `PlayerResourceState`, record `PlayerResourceTransaction`, return updated balances, and apply the snapshot on the frontend.
