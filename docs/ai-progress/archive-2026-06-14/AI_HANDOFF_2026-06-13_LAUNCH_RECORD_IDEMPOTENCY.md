# 2026-06-13 发射记录落库与幂等交接

本轮目标：让 `/api/launch` 不再只是即时计算，而是写入服务端发射记录，并支持 `clientRequestId` 幂等。

主要改动：
- `FATCATServer/FatCat.Domain/PlayerLaunchRecord.cs`
  - 新增发射记录实体。
- `FATCATServer/FatCat.Application/IFatCatRepository.cs`
  - 新增 `GetLaunchRecordAsync()`、`AddLaunchRecordAsync()`。
- `FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs`
  - 实现发射记录查询与新增。
- `FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs`
  - 新增 `DbSet<PlayerLaunchRecord> LaunchRecords`。
  - 配置唯一索引：`PlayerId + ClientRequestId`。
  - 配置时间索引：`PlayerId + CreatedAt`。
  - 新增 `EnsureLaunchRecordSchemaAsync()`，用于给已有 SQLite dev DB 自动补建表和索引。
- `FATCATServer/FatCat.Api/Program.cs`
  - 启动时 `EnsureCreatedAsync()` 后调用 `EnsureLaunchRecordSchemaAsync()`，修复旧库缺表导致 `/api/launch` 500。
- `FATCATServer/FatCat.Application/FatCatGameService.cs`
  - `LaunchAsync()` 先查 `playerId + clientRequestId` 已有记录。
  - 若存在，直接返回旧记录转换的 `LaunchResponse`。
  - 若不存在，按当前规则计算、写入 `PlayerLaunchRecord`、保存后返回。
- `FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs`
  - 新增服务层幂等测试，确认同 request 只写一条 `LaunchRecords`。
- `FATCATServer/FatCat.Tests/FatCatApiTests.cs`
  - 新增 API 层幂等测试。
- `tools/check-server-api.ps1`
  - 新增重复 `/api/launch` smoke，确认 `launchRepeat=true`。

验证结果：
- `dotnet test FATCATServer/FATCATServer.sln`：13 个测试通过。
- 真实 HTTP smoke 通过，返回：
```json
{
  "launchCoin": 2127,
  "launchBean": 40,
  "launchRepeat": true
}
```
- `node tools/check-launch-production-preview-online.js` 通过，UI 文案：
```text
服务端发射完成：+2.14K 金币，-40 咖啡豆，净收益 213/秒
```
- 设置页在线/离线预览、建筑净收益、点击回归、主界面/猫咪页四尺寸截图回归均通过。

注意：
- 当前只落 `LaunchRecords`，还没有服务端玩家资源余额表。
- 客户端仍会按服务端返回结果修改本地资源，本地资源还不是服务端权威余额。
- `EnsureLaunchRecordSchemaAsync()` 是当前无 migrations 阶段的 dev schema 补丁；后续若引入 EF migrations，应迁移到正式 migration。

下一轮建议：
- 新增 `PlayerResourceState` 或类似表，包含 `Coin`、`Bean`、`CatFood`、`Diamond`、`UpdatedAt`。
- 登录或首次 launch 时初始化服务端资源。
- `/api/launch` 在同一事务中写 `LaunchRecords` 并更新 `PlayerResourceState`。
- 客户端收到 launch response 后可同步服务端资源余额，而不是只应用增量。
