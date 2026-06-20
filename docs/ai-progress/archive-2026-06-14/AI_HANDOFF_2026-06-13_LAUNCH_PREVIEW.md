# 2026-06-13 发射按钮接入服务端结算预览交接

本轮目标：把上一轮完成的 `/api/production/preview` 和 `SyncManager.previewProduction()` 从设置页调试按钮推进到主玩法入口“发射猫咪”。

已完成：
- `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：`handleLaunch()` 改为异步流程，联网时先请求服务端 production preview，再执行本地 10 秒发射结算。
- 发射成功且服务端预览成功时，主界面反馈会显示 `服务端净收益 .../秒`。
- 服务端不可用或预览失败时不阻断单机流程，仍按本地 `ProductionManager.settle(10, "manual_launch")` 完成发射。
- 增加 `_launchInProgress` 防重复点击状态，并在请求中/重复点击时给玩家明确反馈。
- 新增 `tools/check-launch-production-preview-online.js`：临时启动 `FatCat.Api`，打开 `http://localhost:7456/?api=http://localhost:5144&launchpreview=1`，点击真实透明热区 `button[title="launch"]`，校验反馈包含“发射完成”和“服务端净收益”。
- 新增 `docs/ai-progress/2026-06-13-launch-preview-progress.md`，作为本轮 task/计划进度记录。

已验证：
- `.\tools\check-client-ts.ps1`
- `dotnet test FATCATServer/FATCATServer.sln`
- `node tools/check-production-wage-net-effect.js`
- `node tools/check-settings-production-preview-button.js`
- `node tools/check-settings-production-preview-online.js`
- `node tools/check-launch-production-preview-online.js`
- `node tools/verify-ui-clicks-playwright.js`
- `node tools/capture-main-regression.js`
- `node tools/capture-cat-regression.js`

最新在线发射回归结果：
```text
发射完成：+2.14K 金币，-40 咖啡豆，服务端净收益 213/秒
```

Cocos asset-db 已刷新：
- `db://assets/scripts/ui/BottomNavUI.ts`

下一步建议：
- 新增真正的服务端权威发射接口，例如 `POST /api/launch`。
- 请求字段可复用 production preview 快照，再补 `playerId`、`launchSeconds`、`clientRequestId`。
- 响应应返回资源增减、每日次数、服务端时间、结算记录 ID。
- 客户端发射按钮优先调用 `/api/launch`；失败时是否允许本地 fallback 需要按最终联网策略决定。
