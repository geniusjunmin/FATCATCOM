# AI Handoff - Resource State Launch

## 当前状态

本轮完成了服务端资源余额权威化的第一步：`/api/launch` 已经会创建并更新玩家资源余额，前端发射成功后会使用服务端返回的余额快照刷新本地存档。

## 关键文件

- `FATCATServer/FatCat.Domain/PlayerResourceState.cs`
- `FATCATServer/FatCat.Application/Contracts.cs`
- `FATCATServer/FatCat.Application/FatCatGameService.cs`
- `FATCATServer/FatCat.Application/IFatCatRepository.cs`
- `FATCATServer/FatCat.Infrastructure/FatCatDbContext.cs`
- `FATCATServer/FatCat.Infrastructure/EfFatCatRepository.cs`
- `FATCATServer/FatCat.Api/Program.cs`
- `FATCATServer/FatCat.Tests/FatCatGameServiceTests.cs`
- `FATCATServer/FatCat.Tests/FatCatApiTests.cs`
- `FATCATUI/assets/scripts/manager/ResourceManager.ts`
- `FATCATUI/assets/scripts/net/ApiTypes.ts`
- `FATCATUI/assets/scripts/ui/BottomNavUI.ts`
- `tools/check-server-api.ps1`

## 实现要点

- 初始服务端资源目前对齐 `initialSave.json`：金币 12,450,000，咖啡豆 8,240，猫粮 3,510，钻石 2,580，研究点 200。
- `LaunchAsync` 使用服务端 `ResourceStates.Bean` 限制可生产秒数，不再信任客户端 `availableBean` 作为权威值。
- 成功发射后服务端保存 `PlayerLaunchRecord` 并更新 `PlayerResourceState`。
- 重复 `clientRequestId` 只返回已有发射记录和当前余额，不再次加金币或扣咖啡豆。
- 前端发射成功后调用 `ResourceManager.applyServerSnapshot()`，直接写入 `coin/bean/catFood/diamond/researchPoint`。
- SQLite 开发库通过 `EnsureRuntimeSchemaAsync()` 自动补 `ResourceStates` 与 `LaunchRecords`，避免 `EnsureCreatedAsync()` 旧库缺表。

## 已验证

- 服务端单元/API 测试：13/13 通过。
- 客户端 TS 检查通过。
- 服务端 smoke 覆盖资源余额和幂等余额，通过。
- Playwright UI 点击、主界面四尺寸截图、猫咪页四尺寸截图均通过。
- 联机发射按钮脚本通过，页面出现服务端发射完成文案。

## 下一轮推荐 Task

1. 新增 `GET /api/resources?playerId=...`，返回服务端资源快照。
2. 客户端登录/连接服务器后拉取 `/api/resources` 并调用 `applyServerSnapshot()`。
3. 邮件领奖改为服务端资源事务，返回奖励后同步余额。
4. 商店购买/猫咪升级/建筑升级选择一个入口继续迁移到服务端事务。
5. UI 继续向目标图推进：主楼层室内装饰密度、顶部 HUD 立体边框、右侧入口按钮高光和底部导航图标精修。
