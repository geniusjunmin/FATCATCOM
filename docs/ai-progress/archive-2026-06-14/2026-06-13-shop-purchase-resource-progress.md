# 2026-06-13 Shop Purchase Resource Progress

## 本轮目标

把商店购买迁移到服务端资源事务：购买时由服务端按商品白名单校验价格并扣除权威资源，客户端成功后只负责本地背包发货和购买次数记录。

## 已完成 Task

1. 新增 `ShopPurchaseRequest` 与 `ShopPurchaseResponse`。
2. 服务端应用层增加商店商品白名单：`shop_cat_food_1`、`shop_coin_pack_1`、`shop_shard_orange_1`。
3. 新增 `PurchaseShopItemAsync()`，按服务端价格扣 `coin/diamond/catFood` 等资源并返回最新余额。
4. 新增 `POST /api/shop/purchase?playerId=...`。
5. 新增服务层/API 测试：购买猫粮包扣 500 金币，资源余额变为 12,449,500。
6. 前端新增 `ShopPurchaseRequest/Response` 类型与 `ApiClient.purchaseShopItem()`。
7. `SyncManager.purchaseServerShopItem()` 成功后应用服务端资源快照。
8. `ShopManager.fulfillServerPurchase()` 负责服务端已扣款后的本地发货和购买次数记录。
9. `BottomNavUI` 商店购买改为联机服务端优先，离线本地购买兜底。
10. 更新 `tools/check-server-api.ps1`：依次校验商店扣款、邮件领奖、发射结算后的连续余额。

## 验证结果

- `dotnet test FATCATServer/FATCATServer.sln`：通过，18/18。
- `.\tools\check-client-ts.ps1`：通过。
- `.\tools\check-server-api.ps1 -ApiBaseUrl http://localhost:5144 -Origin http://localhost:7456`：通过，`shopCoinBalance=12449500`。
- 临时 Playwright 商店购买检查：购买后面板显示“购买成功，物品已放入背包。”，无 4xx/5xx。
- `node tools\verify-ui-clicks-playwright.js`：通过。
- `node tools\check-settings-production-preview-online.js`：通过。
- `node tools\check-launch-production-preview-online.js`：通过。
- `node tools\capture-main-regression.js`：通过，四尺寸主界面截图完成。
- `node tools\capture-cat-regression.js`：通过，四尺寸猫咪页截图完成。
- `node tools\check-production-wage-net-effect.js`：通过。

## 注意事项

- 联机脚本都会尝试启动 `http://localhost:5144`，不要并行跑多个联机脚本，容易端口冲突误报。
- 商店服务端目前只负责扣款与返回余额；服务端背包/购买次数表还没有建立，本地仍负责发货和购买次数展示。

## 下一步建议

1. 增加资源流水表 `ResourceTransaction`，记录来源、delta、余额、clientRequestId。
2. 给商店购买增加服务端购买记录/每日限购状态。
3. 把猫咪升级迁移到服务端资源事务。
4. 把建筑升级迁移到服务端资源事务。
5. 邮件面板继续改为真正拉取服务端邮件列表。
