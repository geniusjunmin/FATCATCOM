# 2026-06-13 发射按钮接入服务端结算预览

本轮完成/推进 task：D008、G004、G005、G008、B014、B015、H003、H004、H005，共 9 个 task 点。

- G004/G005：发射按钮现在会在已配置 API 且浏览器在线时先调用 `SyncManager.previewProduction()`，复用当前生产快照提交 `/api/production/preview`。
- D008/G008：`handleLaunch()` 从纯本地同步结算推进为“服务端预览 + 本地结算 fallback”流程；服务端成功时发射反馈显示 `服务端净收益 .../秒`，失败时不阻断单机发射。
- B014：发射过程增加“正在请求服务端结算预览...”与“发射结算中，请稍候”状态，避免玩家重复点击时没有反馈。
- H003：新增 `tools/check-launch-production-preview-online.js`，会临时启动 `FatCat.Api`、打开 Cocos 预览页、点击真实透明热区 `button[title="launch"]`，并断言发射反馈包含服务端净收益。
- H004/H005：补跑客户端类型检查、服务端测试、建筑净收益守卫、设置页离线/在线预览、发射在线预览、点击回归，以及主界面/猫咪页 414x896、430x932、360x800、768x1024 截图回归；均通过且无 console error/failed request。

下一步：把服务端 preview 从“发射前展示/校验”升级为真正的 `/api/launch` 权威结算接口，返回资源增减、每日次数和可审计的结算记录。
