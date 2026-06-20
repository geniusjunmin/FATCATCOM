# 2026-06-13 Shop Daily Limit Progress

## 本轮目标

把商店购买的每日限购从客户端本地状态推进到服务端权威状态，避免联网后通过客户端绕过限购。

## 已完成 Task

1. 新增领域实体 `PlayerShopPurchaseHistory`。
2. `FatCatDbContext` 增加 `ShopPurchaseHistories` DbSet、唯一索引和玩家外键。
3. `EnsureRuntimeSchemaAsync()` 增加 SQLite 运行期补表 SQL，兼容已有开发库。
4. 仓储接口和 EF 实现增加购买历史读取与新增方法。
5. `PurchaseShopItemAsync()` 接入 UTC 日期维度的每日购买次数校验。
6. 成功购买后服务端累加当天购买次数；超过限购时返回失败且不扣资源、不写流水。
7. `ShopPurchaseResponse` 新增 `RemainingDaily`，前端类型同步新增 `remainingDaily`。
8. 新增后端测试：购买后剩余次数为 4，买满 5 次后第 6 次失败。
9. 更新 `tools/check-server-api.ps1`：验证 `remainingDaily=4`，并用独立玩家验证买满后继续购买返回 400。
10. 运行后端、TS、API smoke、联机设置/发射、点击、建筑收益和四尺寸截图回归。

## 验证结果

- `dotnet test FATCATServer/FATCATServer.sln`：通过，21/21。
- `.\tools\check-client-ts.ps1`：通过。
- `.\tools\check-server-api.ps1 -ApiBaseUrl http://localhost:5144 -Origin http://localhost:7456`：通过，`shopRemainingDaily=4`、`shopLimitRemainingDaily=0`。
- `node tools\verify-ui-clicks-playwright.js`：通过。
- `node tools\check-settings-production-preview-online.js`：通过。
- `node tools\check-launch-production-preview-online.js`：通过。
- `node tools\check-production-wage-net-effect.js`：通过。
- `node tools\capture-main-regression.js`：通过，414x896、430x932、360x800、768x1024 主界面截图完成。
- `node tools\capture-cat-regression.js`：通过，四尺寸猫咪页截图完成。

## 注意事项

- 每日限购日期使用 UTC `yyyyMMdd` 整数。
- 客户端当前仍用本地 `shopPurchaseHistory` 渲染剩余次数；服务端已经权威拦截超限，下一步可以把服务端剩余次数返回/展示到商店 UI。
- 联机脚本不要并行跑，都会争用 `http://localhost:5144`。

## 下一步建议

1. 把猫咪升级迁移到服务端资源事务并写入流水。
2. 把建筑升级迁移到服务端资源事务并写入流水。
3. 增加服务端商店状态查询接口，让 UI 展示服务端剩余限购。
4. 在设置/调试面板显示最近资源流水。
5. 继续对照目标 UI 图精修 HUD 和工厂楼层细节。
