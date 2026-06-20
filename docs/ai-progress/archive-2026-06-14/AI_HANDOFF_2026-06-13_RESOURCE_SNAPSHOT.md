# AI Handoff - Resource Snapshot

## Current State

The resource authority path now has two layers:

1. `/api/launch` updates authoritative server balances.
2. `/api/resources` returns the current authoritative server balances, and the client applies them after login/sync.

Guest auth now ensures `PlayerResourceState` exists before returning. This prevents the race where login-triggered `/api/resources` and an immediate launch both attempted to create the first resource row.

## Key Files

- `FATCATServer/FatCat.Application/Contracts.cs`
- `FATCATServer/FatCat.Application/FatCatGameService.cs`
- `FATCATServer/FatCat.Api/Program.cs`
- `FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs`
- `FATCATServer/FatCat.Tests/FatCatApiTests.cs`
- `FATCATUI/assets/scripts/net/ApiTypes.ts`
- `FATCATUI/assets/scripts/net/ApiClient.ts`
- `FATCATUI/assets/scripts/manager/SyncManager.ts`
- `FATCATUI/assets/scripts/ui/BottomNavUI.ts`
- `tools/check-server-api.ps1`

## Verification

- Backend tests: 14/14 passing.
- Client TS check passing.
- API smoke passing with `/api/resources` initial and post-launch checks.
- Online settings preview passing.
- Online launch passing with no failed `/api/resources` requests.
- Click regression and screenshot regression passing.

## Next Recommended Work

Start migrating more resource-changing gameplay operations to the server:

1. Mail reward claiming.
2. Shop purchases.
3. Cat upgrades or building upgrades.
4. Resource transaction ledger.
5. More HUD/factory visual polish toward the reference UI.
