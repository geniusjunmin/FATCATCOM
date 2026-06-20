# AI Handoff - Shop Daily Limit

## Current State

Shop purchases now have server-authoritative daily limit enforcement. The server records per-player, per-shop-item, per-UTC-day purchase counts and rejects purchases over the limit before deducting resources or writing transaction rows.

## Key Files

- `FATCATServer/FatCat.Domain/PlayerShopPurchaseHistory.cs`
- `FATCATServer/FatCat.Application/Contracts.cs`
- `FATCATServer/FatCat.Application/FatCatGameService.cs`
- `FATCATServer/FatCat.Application/IFatCatRepository.cs`
- `FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs`
- `FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs`
- `FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs`
- `FATCATServer/FatCat.Tests/FatCatApiTests.cs`
- `FATCATUI/assets/scripts/net/ApiTypes.ts`
- `tools/check-server-api.ps1`

## Implementation Notes

- Daily reset uses UTC date encoded as `yyyyMMdd`.
- `ShopPurchaseResponse.remainingDaily` is now available to the client.
- The current shop UI still renders local remaining counts. Server-side enforcement is active, but a future `GET /api/shop/state` would let UI display authoritative remaining counts.
- On over-limit purchase, the API returns `400 shop_purchase_failed`, does not deduct resources, and does not add a resource transaction.

## Verification

- Backend tests: 21/21 passing.
- Client TS check passing.
- API smoke validates normal purchase, remaining daily count, and over-limit rejection.
- Online settings/launch checks passing.
- Main/cat screenshot regressions pass across 414x896, 430x932, 360x800, and 768x1024.

## Next Recommended Work

Move cat upgrades to server-side resource transactions next. That continues the same resource-authoritative pattern and affects a visible core gameplay loop.
