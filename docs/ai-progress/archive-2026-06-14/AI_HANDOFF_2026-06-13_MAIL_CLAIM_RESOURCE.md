# AI Handoff - Mail Claim Resource

## Current State

Mail claiming now updates authoritative server resources. The welcome mail gives 2500 coin and 20 cat food; the server applies those rewards to `PlayerResourceState` and returns updated balances. The client applies the returned balances with `ResourceManager.applyServerSnapshot()`.

## Key Files

- `FATCATServer/FatCat.Application/Contracts.cs`
- `FATCATServer/FatCat.Application/FatCatGameService.cs`
- `FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs`
- `FATCATServer/FatCat.Tests/FatCatApiTests.cs`
- `FATCATUI/assets/scripts/net/ApiTypes.ts`
- `FATCATUI/assets/scripts/manager/SyncManager.ts`
- `FATCATUI/assets/scripts/ui/BottomNavUI.ts`
- `tools/check-server-api.ps1`

## Important Notes

- `ClaimMailAsync` now calls `EnsureDefaultMailAsync()` before lookup, so direct claim works even if `/api/mail` was not called first.
- The mail panel still renders mostly local/static mail content. The claim operation is server-first when connected, but fetching/rendering actual server mail rows remains future work.
- Do not run multiple scripts that spawn `http://localhost:5144` in parallel; they can conflict and produce false failures.

## Verification

- Backend tests: 16/16 passing.
- Client TS check passing.
- API smoke includes mail claim and post-claim launch balance checks.
- Online launch/settings checks passing.
- Mail UI claim was verified with Playwright: no failed requests, claim button disappears, reward text appears.
- Main/cat screenshot regressions pass across 414x896, 430x932, 360x800, and 768x1024.

## Next Recommended Work

Move shop purchases to server-side resource transactions, then add a resource transaction ledger to support auditability and future anti-cheat/multiplayer work.
