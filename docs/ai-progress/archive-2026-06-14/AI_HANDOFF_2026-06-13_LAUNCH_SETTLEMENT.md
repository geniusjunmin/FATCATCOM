# 2026-06-13 服务端权威发射结算 MVP 交接

本轮目标：把上一轮“服务端发射预览”升级为真正的 `/api/launch` 发射结算接口，并让客户端发射按钮优先使用服务端返回的资源增减。

主要改动：
- `FATCATServer/FatCat.Application/Contracts.cs`
  - 新增 `LaunchRequest`、`LaunchResponse`。
- `FATCATServer/FatCat.Application/FatCatGameService.cs`
  - 新增 `LaunchAsync()`。
  - 复用 `PreviewProduction()` 计算净收益。
  - 按 `availableBean / beanCostPerSecond` 限制 `productiveSeconds`。
  - bootstrap feature 新增 `launch-settlement`。
- `FATCATServer/FatCat.Api/Program.cs`
  - 新增 `POST /api/launch?playerId=...`。
- `FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs`
  - 新增服务层发射结算测试和咖啡豆限制测试。
- `FATCATServer/FatCat.Tests/FatCatApiTests.cs`
  - 新增 API 层发射结算合同测试。
- `FATCATUI/assets/scripts/net/ApiTypes.ts`
  - 新增 `LaunchRequest`、`LaunchResponse`。
- `FATCATUI/assets/scripts/net/ApiClient.ts`
  - 新增 `launch(playerId, request)`。
- `FATCATUI/assets/scripts/manager/SyncManager.ts`
  - 新增 `launch(seconds)`。
  - 抽出 `createProductionPreviewRequest()`，预览和发射共用同一份生产快照组装逻辑。
- `FATCATUI/assets/scripts/ui/BottomNavUI.ts`
  - 发射按钮联网时优先调用 `SyncManager.launch(10)`。
  - 服务端 accepted 时按返回的 `coinGained`、`beanSpent` 修改本地资源，并显示“服务端发射完成”。
  - 服务端不可用时保留本地 `ProductionManager.settle(10)` fallback。
- `tools/check-server-api.ps1`
  - smoke 增加 `/api/launch`，校验 `launchCoin=2127`、`launchBean=40`。
- `tools/check-launch-production-preview-online.js`
  - 更新断言为“服务端发射完成”。

验证结果：
- `dotnet test FATCATServer/FATCATServer.sln`：11 个测试通过。
- `.\tools\check-client-ts.ps1`：通过。
- `.\tools\check-server-api.ps1`：通过，返回 `launchCoin=2127`、`launchBean=40`。
- `node tools/check-launch-production-preview-online.js`：通过，UI 文案为 `服务端发射完成：+2.14K 金币，-40 咖啡豆，净收益 213/秒`。
- 设置页在线/离线预览、建筑净收益、点击回归、主界面/猫咪页四尺寸截图回归均通过。

已刷新 Cocos asset-db：
- `db://assets/scripts/net/ApiTypes.ts`
- `db://assets/scripts/net/ApiClient.ts`
- `db://assets/scripts/manager/SyncManager.ts`
- `db://assets/scripts/ui/BottomNavUI.ts`

下一轮建议：
- 建 `LaunchRecord`/审计表和玩家资源表，真正把金币/咖啡豆/每日发射次数落库。
- `/api/launch` 增加幂等处理：同一 `playerId + clientRequestId` 重复请求返回同一结算结果。
- 客户端 UI 增加服务端拒绝原因映射：咖啡豆不足、次数不足、玩家不存在、服务器繁忙。
