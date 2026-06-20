# AI Handoff - Resource Transaction Ledger

## Current State

The server now records resource transaction ledger rows for all currently server-authoritative resource changes:

- `shop_purchase`
- `mail_claim`
- `launch`

Each row stores source type/key, optional client request id, resource deltas, balances after the change, and timestamp.

## Key Files

- `FATCATServer/FatCat.Domain/PlayerResourceTransaction.cs`
- `FATCATServer/FatCat.Application/Contracts.cs`
- `FATCATServer/FatCat.Application/FatCatGameService.cs`
- `FATCATServer/FatCat.Application/IFatCatRepository.cs`
- `FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs`
- `FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs`
- `FATCATServer/FatCat.Api/Program.cs`
- `FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs`
- `FATCATServer/FatCat.Tests/FatCatApiTests.cs`
- `tools/check-server-api.ps1`

## Important Notes

- Existing SQLite dev databases are patched by `EnsureRuntimeSchemaAsync()`.
- SQLite cannot order `DateTimeOffset` directly in SQL, so transaction query orders in memory after filtering by player.
- Repeated launch with the same `clientRequestId` returns the existing launch record and does not create another transaction.

## Verification

- Backend tests: 19/19 passing.
- Client TS check passing.
- API smoke validates three transaction rows and latest `launch` row.
- Online settings/launch checks passing.
- Main/cat screenshots pass at 414x896, 430x932, 360x800, and 768x1024.

## Next Recommended Work

Add server shop purchase history and daily limit enforcement next. That builds directly on the transaction ledger and closes the current gap where the client still owns local purchase counts.
