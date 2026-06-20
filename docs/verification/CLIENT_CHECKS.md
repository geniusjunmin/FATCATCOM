# 客户端检查命令

更新时间：2026-06-08

## TypeScript 相关文件过滤检查

在项目根目录 `D:/Desktop/FATCATCOM` 执行：

```powershell
.\tools\check-client-ts.ps1
```

该脚本运行 Cocos 项目的 TypeScript 检查，并只输出当前 UI 高频修改文件相关错误：

- `BottomNavUI`
- `GeneratedUiAssets`
- `CatDetailPanel`

说明：当前全量 `tsc` 可能包含 Cocos 引擎或扩展侧既有类型噪音；每轮 UI 修改先看过滤结果，若过滤为空，表示本轮核心 UI 文件未新增相关 TypeScript 错误。

## Cocos 资源刷新

修改 `BottomNavUI.ts` 后刷新 asset-db：

```javascript
return await Editor.Message.request('asset-db','refresh-asset','db://assets/scripts/ui/BottomNavUI.ts');
```

修改生成素材目录后刷新：

```javascript
return await Editor.Message.request('asset-db','refresh-asset','db://assets/resources/textures/generated');
```

## 浏览器人工/自动检查重点

- 打开 `http://localhost:7456/`。
- 点击底部“猫咪”按钮，应出现全屏猫咪图鉴。
- 点击左侧页签：信息、升级、技能、装备、皮肤，应切换内容标题。
- 点击中央左右箭头，应切换猫咪名称、索引、职业信息。
- 点击底部猫咪卡片，应切换当前展示猫咪。
- 切换到 390x844、414x896、430x932、360x800、768x1024 检查是否有明显遮挡。

## 本地服务端 API 检查

启动 `FatCat.Api` 后，在项目根目录执行：

```powershell
.\tools\check-server-api.ps1 -ApiBaseUrl "http://localhost:5144" -Origin "http://localhost:7456"
```

脚本会检查 health、CORS、游客登录、邮件、好友和设置接口。成功时应返回 `playerId`、邮件数量、好友数量和 `music/push/sfx/sync` 设置键。

## 主界面截图回归

在项目根目录执行：

```powershell
node tools/capture-main-regression.js
```

脚本使用本机 Edge 截取 414x896、430x932、360x800、768x1024 四档主界面截图，输出到：

```text
docs/verification/screenshots/2026-06-09-main-regression/
```

成功时每档应包含 4 个资源条、6 层楼、6 个室内装饰层，并且 `failedRequests` 与 console error 为空。
