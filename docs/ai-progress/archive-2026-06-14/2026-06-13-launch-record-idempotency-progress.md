# 2026-06-13 发射记录落库与幂等

本轮完成/推进 task：F006、F008、F009、F011、F014、G008、D008、H003、H004、H005，共 10 个 task 点。

- F006/F011：新增 `PlayerLaunchRecord` 领域实体，用于记录每次服务端发射结算。
- F009：`FatCatDbContext` 新增 `LaunchRecords` 表映射，包含 `PlayerId`、`ClientRequestId`、`LaunchKey`、`CoinGained`、`BeanSpent`、`ProductiveSeconds`、`NetCoinPerSecond`、`CreatedAt` 等字段。
- F011：`FatCatGameService.LaunchAsync()` 现在会先按 `playerId + clientRequestId` 查询已有记录；若存在，直接返回旧结算，避免重复发奖。
- F011：首次发射成功时会写入 `PlayerLaunchRecord` 并保存，再由记录转换为 `LaunchResponse`。
- F014：由于当前开发库使用 `EnsureCreatedAsync()` 且没有 EF migrations，新增 `EnsureLaunchRecordSchemaAsync()`，对已有 `fatcat-dev.db` 自动补建 `LaunchRecords` 表和索引，修复旧库调用 `/api/launch` 的 500。
- H003/H004：服务层和 API 层测试新增幂等覆盖；`tools/check-server-api.ps1` 新增重复 `/api/launch` smoke，期望 `launchRepeat=true`。
- H005：已验证真实 API smoke 返回 `launchCoin=2127`、`launchBean=40`、`launchRepeat=true`。

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
- 新增玩家服务端资源表，开始真正落库金币/咖啡豆余额。
- `/api/launch` 从“记录结算结果”升级为“记录结算结果 + 更新服务端资源余额”。
- 客户端后续可展示 `launchId` 或服务端同步状态，用于排查重复点击/网络重试。
