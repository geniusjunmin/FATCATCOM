# 2026-06-13 Resource State Launch Progress

## 本轮目标

把“发射猫咪”的服务端结算从只返回奖励、只写幂等记录，推进为真正维护玩家资源余额。完成后前端以服务端余额为准刷新本地存档和 HUD，为后续多人联网与服务端权威状态打基础。

## 已完成 Task

1. 新增服务端玩家资源实体 `PlayerResourceState`，覆盖金币、咖啡豆、猫粮、钻石、研究点和更新时间。
2. 接入 EF Core：`ResourceStates` DbSet、一对一玩家关系、SQLite 运行期补表逻辑，并把启动初始化从 `EnsureLaunchRecordSchemaAsync` 升级为 `EnsureRuntimeSchemaAsync`。
3. 扩展仓储接口和实现：支持读取/创建玩家资源状态。
4. 改造 `LaunchAsync`：首次发射会创建初始资源，按服务端咖啡豆余额限制可生产秒数，成功后加金币、扣咖啡豆；重复 `clientRequestId` 返回同一结算且不会二次变更余额。
5. 扩展 `LaunchResponse`：返回 `coinBalance`、`beanBalance`、`catFoodBalance`、`diamondBalance`、`researchPointBalance`。
6. 前端新增 `ResourceManager.applyServerSnapshot()`，发射成功后直接使用服务端余额覆盖本地资源，避免本地加减产生漂移。
7. 更新 smoke 脚本，检查发射后的金币/咖啡豆余额，以及重复请求余额不变。
8. 刷新 Cocos asset-db 中的 `ResourceManager.ts`、`ApiTypes.ts`、`BottomNavUI.ts`。

## 验证结果

- `dotnet test FATCATServer/FATCATServer.sln`：通过，13/13。
- `.\tools\check-client-ts.ps1`：通过，无相关 TypeScript 诊断。
- `.\tools\check-server-api.ps1 -ApiBaseUrl http://localhost:5144 -Origin http://localhost:7456`：通过，返回 `launchCoinBalance=12452127`、`launchBeanBalance=8200`、`launchRepeat=true`。
- `node tools\verify-ui-clicks-playwright.js`：通过，猫咪页 tab、装备、故事、主导航均可点。
- `node tools\check-production-wage-net-effect.js`：通过，建筑页净收益/工资/豆耗展示正常。
- `node tools\capture-main-regression.js`：通过，414x896、430x932、360x800、768x1024 主界面截图完成。
- `node tools\capture-cat-regression.js`：通过，414x896、430x932、360x800、768x1024 猫咪页截图完成。
- `node tools\check-launch-production-preview-online.js`：通过，页面显示“服务端发射完成：+2.14K 金币，-40 咖啡豆，净收益 213/秒”。
- `node tools\check-settings-production-preview-button.js`：通过，离线设置页按钮反馈正常。
- `node tools\check-settings-production-preview-online.js`：通过，设置页联机结算预览正常。

## 下一步建议

1. 增加 `/api/resources` 查询接口，让客户端启动后可以主动拉取服务端权威余额。
2. 在 `syncSave` 中识别本地资源与服务端资源的差异，避免同步存档覆盖服务端权威余额。
3. 将邮件领奖、商店购买、建筑升级、猫咪升级逐步迁移到服务端资源事务。
4. 为资源事务增加历史流水表，便于多人联网后审计、回滚和防作弊。
5. 继续对照目录 UI 图推进主楼层室内丰富度和 HUD 精致度。
