# AI Handoff - Shop Purchase Resource

## Current State

Shop purchases now use a server-first resource transaction. The server owns item pricing and deducts authoritative balances, then the client applies the returned resource snapshot and performs local inventory fulfillment.

## Key Files

- `FATCATServer/FatCat.Application/Contracts.cs`
- `FATCATServer/FatCat.Application/FatCatGameService.cs`
- `FATCATServer/FatCat.Api/Program.cs`
- `FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs`
- `FATCATServer/FatCat.Tests/FatCatApiTests.cs`
- `FATCATUI/assets/scripts/net/ApiTypes.ts`
- `FATCATUI/assets/scripts/net/ApiClient.ts`
- `FATCATUI/assets/scripts/manager/SyncManager.ts`
- `FATCATUI/assets/scripts/manager/ShopManager.ts`
- `FATCATUI/assets/scripts/ui/BottomNavUI.ts`
- `tools/check-server-api.ps1`

## Implementation Notes

- Server shop whitelist currently mirrors `assets/resources/configs/shops.json`:
  - `shop_cat_food_1`: `item_cat_food_pack`, 500 coin, daily limit 5.
  - `shop_coin_pack_1`: `item_coin_pack_small`, 10 diamond, daily limit 10.
  - `shop_shard_orange_1`: `item_shard_orange`, 2000 coin, daily limit 1.
- Server does not yet persist inventory or shop purchase history. Client still records inventory and local purchase counts after successful server purchase.
- Smoke now validates a chain: initial resources -> shop purchase -> mail claim -> launch -> resource snapshot.

## Verification

- Backend tests: 18/18 passing.
- Client TS check passing.
- API smoke passing.
- Online settings and online launch checks passing.
- Temporary Playwright shop purchase check passed with no failed requests.
- Main and cat screenshot regressions pass across 414x896, 430x932, 360x800, and 768x1024.

## Next Recommended Work

Add `ResourceTransaction` ledger next. It should record `PlayerId`, source/type, related id, deltas, balances after change, client request id where applicable, and timestamp. After that, add server shop purchase history/daily limits.
