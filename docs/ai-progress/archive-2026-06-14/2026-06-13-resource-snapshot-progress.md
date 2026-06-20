# 2026-06-13 Resource Snapshot Progress

## 本轮目标

在上一轮发射结算已经维护服务端资源余额的基础上，继续补齐“客户端主动拉取服务端权威资源快照”的链路，并修复登录后立即发射时可能出现的资源初始化竞态。

## 已完成 Task

1. 新增 `ResourceStateDto`，用于统一返回金币、咖啡豆、猫粮、钻石、研究点和更新时间。
2. 新增 `GET /api/resources?playerId=...`，玩家存在时会返回或创建服务端资源快照。
3. 登录接口 `AuthGuestAsync` 现在会确保玩家资源状态已存在，避免登录后资源查询与发射同时首次创建资源而冲突。
4. 扩展 `ApiClient.getResources()` 与前端 `ResourceStateDto` 类型。
5. `SyncManager.tryGuestLogin()` 登录成功后会后台拉取服务端资源，并用 `ResourceManager.applyServerSnapshot()` 应用到本地。
6. `SyncManager.syncSave()` 成功后会再次拉取服务端资源，避免同步存档后本地资源偏离服务端状态。
7. 设置页小屏布局压缩：compact 下状态条保持三列、卡片高度降低，修复 414x896 中“结算预览”按钮被挤到视口下方的问题。
8. 更新 `tools/check-server-api.ps1`，验证初始资源、发射后资源、幂等发射后的资源一致性。
9. 补充 C# 测试：登录后资源状态存在、资源接口返回初始余额、发射后资源接口返回最新余额。
10. 刷新 Cocos asset-db：`ApiTypes.ts`、`ApiClient.ts`、`SyncManager.ts`、`BottomNavUI.ts`。

## 验证结果

- `dotnet test FATCATServer/FATCATServer.sln`：通过，14/14。
- `.\tools\check-client-ts.ps1`：通过。
- `.\tools\check-server-api.ps1 -ApiBaseUrl http://localhost:5144 -Origin http://localhost:7456`：通过，资源接口与发射结算一致。
- `node tools\check-settings-production-preview-online.js`：通过，设置页连接后可点击结算预览。
- `node tools\check-launch-production-preview-online.js`：通过，无 `/api/resources` 500。
- `node tools\verify-ui-clicks-playwright.js`：通过。
- `node tools\check-production-wage-net-effect.js`：通过。
- `node tools\check-settings-production-preview-button.js`：通过。
- `node tools\capture-main-regression.js`：通过，四尺寸主界面截图完成。
- `node tools\capture-cat-regression.js`：通过，四尺寸猫咪页截图完成。

## 注意事项

- 不要并行运行多个会启动 `http://localhost:5144` 的联机脚本，否则会互相抢端口导致误报。
- 旧的 `docs/ai-progress/02_TASKS.md` 有编码污染，本轮继续使用新的 dated progress/task ledger 文件记录进度。

## 下一步建议

1. 邮件领奖改为服务端资源事务，并让 `ClaimMailResponse` 返回资源余额。
2. 商店购买改为服务端资源事务。
3. 猫咪升级或建筑升级选择一个入口继续迁移到服务端。
4. 增加资源流水表，记录每次来源、消耗、余额变化和请求 ID。
5. 继续对照目标 UI 精修 HUD 和主楼层室内细节。
