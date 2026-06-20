# 2026-06-13 Mail Claim Resource Progress

## 本轮目标

把邮件领奖从本地奖励推进到服务端资源事务：领取 welcome 邮件时由服务端更新金币、猫粮、钻石余额，并把最新资源余额返回给客户端。

## 已完成 Task

1. 扩展 `ClaimMailResponse`，新增金币、咖啡豆、猫粮、钻石、研究点余额字段。
2. 改造 `ClaimMailAsync`：成功领取后更新 `PlayerResourceState` 的金币、猫粮、钻石，并刷新 `UpdatedAt`。
3. `ClaimMailAsync` 现在会在领取前确保默认邮件存在，修复未先调用 `/api/mail` 就直接领取 welcome 邮件时的 400。
4. 前端 `ClaimMailResponse` 类型同步新增余额字段。
5. `SyncManager.claimServerMail()` 成功后调用 `ResourceManager.applyServerSnapshot()`，用服务端余额刷新本地资源。
6. `BottomNavUI` 邮件领取改为服务端优先；离线或未连接时仍保留本地奖励兜底。
7. 更新 `tools/check-server-api.ps1`，加入邮件领奖奖励值、领奖后余额、领奖后再发射余额的校验。
8. 新增后端测试：邮件只领一次、领奖更新资源、未先拉邮件也能直接领取。
9. 刷新 Cocos asset-db 中的 `ApiTypes.ts`、`SyncManager.ts`、`BottomNavUI.ts`。
10. 运行后端、TS、API smoke、联机发射、联机设置、邮件 UI 领取、点击回归和四尺寸截图回归。

## 验证结果

- `dotnet test FATCATServer/FATCATServer.sln`：通过，16/16。
- `.\tools\check-client-ts.ps1`：通过。
- `.\tools\check-server-api.ps1 -ApiBaseUrl http://localhost:5144 -Origin http://localhost:7456`：通过，邮件领奖后 `mailCoinBalance=12452500`、`mailCatFoodBalance=3530`。
- `node tools\verify-ui-clicks-playwright.js`：通过。
- `node tools\check-settings-production-preview-online.js`：通过。
- `node tools\check-launch-production-preview-online.js`：通过。
- 临时 Playwright 邮件领取检查：通过，领取按钮消失、奖励数字出现、无 4xx/5xx。
- `node tools\capture-main-regression.js`：通过，414x896、430x932、360x800、768x1024 主界面截图完成。
- `node tools\capture-cat-regression.js`：通过，四尺寸猫咪页截图完成。
- `node tools\check-production-wage-net-effect.js`：通过。

## 下一步建议

1. 把商店购买迁移到服务端资源事务。
2. 给服务端资源变更增加 transaction ledger，记录 source、delta、balance、clientRequestId。
3. 把猫咪升级或建筑升级迁移到服务端事务。
4. 邮件面板后续可改为真正拉服务端邮件列表，而不是只使用本地静态邮件外壳。
5. 继续 UI 对照目标图增强顶部 HUD 和主楼层室内道具密度。
