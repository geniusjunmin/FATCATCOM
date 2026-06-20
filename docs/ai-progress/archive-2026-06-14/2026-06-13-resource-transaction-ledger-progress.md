# 2026-06-13 Resource Transaction Ledger Progress

## 本轮目标

为服务端权威资源系统补资源流水表，记录每次资源变化的来源、delta、变化后余额和时间，作为多人联网、防作弊、审计和每日限购的基础。

## 已完成 Task

1. 新增领域实体 `PlayerResourceTransaction`。
2. `FatCatDbContext` 增加 `ResourceTransactions` DbSet、索引、关系映射。
3. `EnsureRuntimeSchemaAsync()` 增加 SQLite 运行期补表 SQL，兼容已有开发库。
4. 仓储接口和 EF 实现增加 `AddResourceTransactionAsync()` 与 `GetResourceTransactionsAsync()`。
5. 新增 `ResourceTransactionDto`。
6. 新增 `GET /api/resources/transactions?playerId=...&limit=...`。
7. 发射结算写入 `launch` 流水，记录 `coinDelta` 和 `beanDelta`。
8. 邮件领奖写入 `mail_claim` 流水，记录金币、猫粮、钻石增量。
9. 商店购买写入 `shop_purchase` 流水，记录扣款资源增量。
10. 更新 `tools/check-server-api.ps1`，校验 shop -> mail -> launch 三条流水顺序和 delta。

## 验证结果

- `dotnet test FATCATServer/FATCATServer.sln`：通过，19/19。
- `.\tools\check-client-ts.ps1`：通过。
- `.\tools\check-server-api.ps1 -ApiBaseUrl http://localhost:5144 -Origin http://localhost:7456`：通过，`transactionCount=3`、`latestTransaction=launch`。
- `node tools\verify-ui-clicks-playwright.js`：通过。
- `node tools\check-settings-production-preview-online.js`：通过。
- `node tools\check-launch-production-preview-online.js`：通过。
- `node tools\capture-main-regression.js`：通过，四尺寸主界面截图完成。
- `node tools\capture-cat-regression.js`：通过，四尺寸猫咪页截图完成。
- `node tools\check-production-wage-net-effect.js`：通过。

## 注意事项

- SQLite 不支持直接按 `DateTimeOffset` 在 SQL 里排序，仓储中先取玩家流水再在内存按 `CreatedAt` 排序。
- 联机 Playwright 脚本会启动同一个 `http://localhost:5144`，不要并行跑多个联机脚本，避免端口冲突误报。

## 下一步建议

1. 增加服务端商店购买历史和每日限购检查。
2. 将猫咪升级迁移到服务端资源事务并写入流水。
3. 将建筑升级迁移到服务端资源事务并写入流水。
4. 在设置页或调试面板增加最近资源流水展示，方便调试。
5. 继续 UI 对照目标图推进主楼层室内丰富度和 HUD 精细度。
