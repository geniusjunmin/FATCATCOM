# 2026-06-13 服务端权威发射结算 MVP

本轮完成/推进 task：F008、F009、F011、G001、G004、G005、G008、D008、H003、H004、H005，共 11 个 task 点。

- F008/F011：新增 `POST /api/launch?playerId=...`，服务端根据生产快照、发射秒数和可用咖啡豆返回权威结算结果。
- F009：新增 `LaunchRequest`、`LaunchResponse` DTO。请求包含 `clientRequestId`、`launchSeconds`、`availableBean`、`production`；响应包含 `launchId`、`accepted`、`coinGained`、`beanSpent`、`productiveSeconds`、`netCoinPerSecond`、`serverTime`。
- F011：`FatCatGameService.LaunchAsync()` 会校验玩家、限制最大发射秒数、复用 `PreviewProduction()` 的净收益公式，并按可用咖啡豆限制有效生产秒数。
- G001/G004/G005：客户端新增 `ApiClient.launch()`、`LaunchRequest/LaunchResponse` 类型和 `SyncManager.launch()`。联网发射会自动游客登录，并提交当前生产快照。
- D008/G008：主界面发射按钮从“服务端预览 + 本地结算 fallback”推进为“服务端结算优先”。服务端成功时直接按返回的金币和咖啡豆修改资源；断网或服务端失败时仍保留本地结算。
- H003/H004：服务端单元/API 测试新增 launch 覆盖；`tools/check-server-api.ps1` 增加 `/api/launch` smoke，期望 `coinGained=2127`、`beanSpent=40`。
- H005：已刷新 Cocos asset-db：`ApiTypes.ts`、`ApiClient.ts`、`SyncManager.ts`、`BottomNavUI.ts`。

验证通过：
- `dotnet test FATCATServer/FATCATServer.sln`
- `.\tools\check-client-ts.ps1`
- `.\tools\check-server-api.ps1 -ApiBaseUrl http://localhost:5144 -Origin http://localhost:7456`
- `node tools/check-launch-production-preview-online.js`
- `node tools/check-settings-production-preview-online.js`
- `node tools/check-settings-production-preview-button.js`
- `node tools/check-production-wage-net-effect.js`
- `node tools/verify-ui-clicks-playwright.js`
- `node tools/capture-main-regression.js`
- `node tools/capture-cat-regression.js`

下一步：
- 将 `/api/launch` 从“无落库权威计算”升级为“服务端资源落库/每日次数落库”。
- 增加 `LaunchRecord` 或等价审计表，记录 `playerId`、`clientRequestId`、`coinGained`、`beanSpent`、`productiveSeconds`、`createdAt`。
- 客户端后续需要处理服务端拒绝原因，如 `bean_not_enough`、`daily_launch_limit`、`player_not_found`。
