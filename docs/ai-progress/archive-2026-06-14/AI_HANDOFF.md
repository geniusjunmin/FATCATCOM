# 肥猫咖啡公司 AI 交接索引

# 2026-06-09 主界面截图回归与工厂/HUD 推进交接

- 最新完成/推进：B001、B002、B014、B015、H003、H005，共 6 个 task 点。
- 新增 `tools/capture-main-regression.js`，依赖本机 Edge 与 `playwright-core`，用于主界面四档截图回归。
- 截图已输出到 `docs/verification/screenshots/2026-06-09-main-regression/`：414x896、430x932、360x800、768x1024 四档均成功。
- `FATCATUI/assets/scripts/ui/BottomNavUI.ts` 已新增主工厂每层 CSS 室内装饰层，并打磨顶部 HUD 胶囊资源条。
- 主工厂页已移除对 Cocos 预览不可访问的 `assets/resources/...` 静态图片 URL 的直接依赖；截图回归无 console error/failed request。
- 下一步优先：继续把左侧电梯/右侧收益牌/底部订单礼包做得更接近目标 UI，然后再推进邮件、好友、设置页面改用服务端真实数据。

# 2026-06-08 当前画面审查与窄屏修复交接

- 最新完成/推进：B014、B015、G004、G009、H003、H005，共 6 个 task 点。
- 已用 390x844 视口复查主界面、设置页、猫咪页；当前无浏览器控制台 error/warn。
- `FATCATUI/assets/scripts/ui/BottomNavUI.ts` 已修复窄屏 HUD 资源条拥挤、设置面板账号按钮贴底栏、服务器初始状态文案误导。
- 设置页通过 `?api=http://localhost:5144` 后点击“连接服务器”可显示“服务器 在线 / 同步 已连接”。
- 下一步优先继续做 414x896、430x932、360x800、768x1024 的完整截图回归，再推进邮件/好友/设置真实服务端数据源替换。

# 2026-06-08 Cocos 预览跨域联调交接

- 最新完成/推进：F014、G004、G005、G009、H004、H005，共 6 个 task 点。
- `FATCATServer/FatCat.Api/Program.cs` 已新增 CORS 策略，默认允许 Cocos 预览页 `http://localhost:7456` 和 `http://127.0.0.1:7456` 调用 API。
- `FATCATServer/FatCat.Api/appsettings.json` 已新增 `Cors:AllowedOrigins`，如果 Cocos 预览端口变化，优先改这里。
- `FATCATServer/FatCat.Tests/FatCatApiTests.cs` 已新增 CORS 集成测试；当前服务端测试共 6 个，全绿。
- 新增 `tools/check-server-api.ps1`，启动 `FatCat.Api` 后可执行 `.\tools\check-server-api.ps1 -ApiBaseUrl "http://localhost:5144" -Origin "http://localhost:7456"` 做本地冒烟。
- 当前本地 API 已重新启动，`http://localhost:5144` 可用；下一步优先在 Cocos 预览设置页做真实按钮级联调，然后把邮件/好友/设置页面数据源切到服务端返回值。

# 2026-06-08 本地 API 联调入口与设置页同步状态交接

- 最新完成/推进：G004、G005、G009、H003、H004、H005，共 6 个 task 点。
- `NetworkManager.ts` 已支持通过 `?api=http://localhost:5144` 或 localStorage `fatcat_api_base_url` 覆盖 API 地址。
- `BottomNavUI.ts` 设置页已展示服务器状态、同步状态、待同步数量、playerId、最近错误。
- 设置页已新增“连接服务器”“同步存档”“推送设置”按钮，对应 `SyncManager.tryGuestLogin()`、`syncSave()`、`pushServerSettings()`。
- 本地 `FatCat.Api` 已启动并通过真实 HTTP 冒烟：`/health`、`/api/auth/guest`、`/api/mail`、`/api/mail/welcome/claim`、`/api/friends`、`/api/settings`。
- 下一步优先：用 Cocos 预览打开 `http://localhost:7456/?api=http://localhost:5144`，在设置页点击连接/同步/推送，做端到端联调。

# 2026-06-08 客户端对齐服务端 Mail/Friend/Settings 交接

- 最新完成/推进：G004、G005、G007、G009、H003、H004，共 6 个 task 点。
- `FATCATUI/assets/scripts/net/ApiClient.ts` 已按服务端要求给 save/mail/friend/settings 请求携带 `playerId` query。
- `ApiClient.ts` 新增 `getSave`、`visitFriend`、`sendFriendGift`、`getSettings`，并调整 `syncSave/getMail/claimMail/getFriends/updateSettings` 签名。
- `NetworkManager.ts` 新增服务端 `playerId` 状态；`SyncManager.ts` 登录成功后保存 `playerId`。
- `SyncManager.ts` 新增 `fetchServerMail`、`claimServerMail`、`fetchServerFriends`、`visitServerFriend`、`sendServerFriendGift`、`fetchServerSettings`、`pushServerSettings`。
- 默认 `GameConfig.apiBaseUrl` 仍为空，当前 Cocos 预览保持离线；后续可指向本地 API 做联调。
- 已运行客户端联网层 TS 过滤、`.\tools\check-client-ts.ps1`、`node --check tools\verify-ui-clicks.browser.js`、`dotnet test FATCATServer/FATCATServer.sln --no-build`。
- 下一步优先：启动本地 FatCat.Api，设置客户端 `apiBaseUrl` 或运行时配置，做 Cocos 预览和服务端实联调。

# 2026-06-08 服务端 Mail/Friend/Settings API 交接

- 最新完成/推进：F005、F010、F011、F014、G007、H004，共 7 个 task 点。
- `FatCat.Domain` 新增 `PlayerMail`、`FriendSnapshot`、`PlayerSettings`。
- `FatCat.Application` 新增 Mail/Friend/Settings DTO 和服务方法；邮件领取服务端防重复。
- `FatCat.Infrastructure` 新增邮件、好友、设置表和仓储方法。
- `FatCat.Api` 新增 `/api/mail`、`/api/mail/{mailId}/claim`、`/api/friends`、`/api/friends/{friendId}/visit`、`/api/friends/{friendId}/gift`、`/api/settings`。
- `FatCat.Tests` 新增服务层测试和 API 集成测试；集成测试使用内存 SQLite。
- 已运行 `dotnet build FATCATServer/FATCATServer.sln` 通过，`dotnet test FATCATServer/FATCATServer.sln --no-build` 通过，5 个测试成功。
- 下一步优先：客户端 `ApiClient` 对齐 visit/gift/settings GET 接口，然后启动本地 API 与 Cocos 预览联调。

# 2026-06-08 服务端首批工程与 API 交接

- 最新完成：F001、F002、F003、F004、F007、F008、F009、H004；推进 F005、F006、F014，共 11 个 task 点。
- 新增 `FATCATServer/FATCATServer.sln`，包含 `FatCat.Api`、`FatCat.Application`、`FatCat.Domain`、`FatCat.Infrastructure`、`FatCat.Tests`。
- `FatCat.Infrastructure` 已接入 EF Core SQLite 9.0.15，开发连接串 `Data Source=fatcat-dev.db`。
- `FatCat.Api` 已实现 `/health`、`/api/auth/guest`、`/api/player/me`、`/api/config/version`、`/api/config/bootstrap`、`/api/save`、`/api/save/sync`。
- 游客登录当前返回开发期 dev token；正式 JWT 待接入。
- 已运行 `dotnet build FATCATServer/FATCATServer.sln` 通过，`dotnet test FATCATServer/FATCATServer.sln --no-build` 通过。
- 下一步优先：补 API 集成测试，新增 Mail/Friend/Settings 服务端表和接口，然后让客户端 `GameConfig.apiBaseUrl` 指向本地 API 联调。

# 2026-06-08 客户端联网骨架交接

- 最新完成：G001、G002、G003；推进 G004、G005、G007、G009，共 7 个 task 点。
- 新增 `FATCATUI/assets/scripts/net/ApiTypes.ts` 和 `ApiClient.ts`，预留 Auth、Bootstrap、SaveSync、Mail、Friend、Settings API。
- 新增 `FATCATUI/assets/scripts/manager/NetworkManager.ts` 和 `SyncManager.ts`，默认离线优先，不会在 `apiBaseUrl` 为空时请求服务器。
- `FATCATUI/assets/scripts/core/GameApp.ts` 已在启动时初始化网络/同步管理器。
- `FATCATUI/assets/scripts/core/GameConfig.ts` 新增 `apiBaseUrl: ""`，后续接 .NET server 时修改这里或改为运行时配置。
- `FATCATUI/assets/scripts/core/EventBus.ts` 新增 `NETWORK_STATUS_CHANGED`、`SYNC_STATUS_CHANGED`。
- 已运行 `.\tools\check-client-ts.ps1`、针对新联网文件的 TS 诊断过滤、`node --check tools\verify-ui-clicks.browser.js`。
- 下一步优先：创建 `FATCATServer` .NET Core 解决方案，先实现 `/api/auth/guest`、`/api/config/bootstrap`、`/api/save/sync`。

# 2026-06-08 右侧功能状态持久化交接

- 最新完成/推进：B013、D006、G007、G009、H005，共 6 个 task 点。
- `FATCATUI/assets/scripts/model/SaveData.ts` 新增 `FeatureSaveData`，包含邮件、设置、好友访问、好友赠礼状态。
- `FATCATUI/assets/scripts/manager/SaveManager.ts` 会兼容旧存档并自动补齐 `featureState`，未提升 `SAVE_VERSION`。
- `FATCATUI/assets/scripts/ui/BottomNavUI.ts` 邮件领取、设置开关、好友访问/赠礼现在都会写入本地存档。
- 已运行 `.\tools\check-client-ts.ps1`、针对 `SaveData|SaveManager|BottomNavUI` 的 TS 诊断过滤、`node --check tools\verify-ui-clicks.browser.js`。
- 已刷新 Cocos asset-db：`SaveData.ts`、`SaveManager.ts`、`BottomNavUI.ts`。
- 下一步优先：把 `featureState` 对齐未来 .NET server 的 Mail/Friend/Settings DTO 与 API。

# 2026-06-08 右侧功能面板交接

- 最新完成/推进：B013、D006、H005，共 6 个 task 点。
- `FATCATUI/assets/scripts/ui/BottomNavUI.ts` 已新增 `achievements`、`mail`、`friends`、`settings` 四个主面板 ID。
- 主工厂右侧 `成就`、`邮件`、`好友`、`设置` 按钮现在会打开真实 DOM 面板，不再只是临时提示。
- 成就页已复用任务进度；邮件页有本地领取奖励并做了本轮会话防重复领取；好友页有访问/赠礼按钮；设置页有账号/存档/服务器状态卡。
- 已运行 `.\tools\check-client-ts.ps1`、`node --check tools\verify-ui-clicks.browser.js`，并确认 `http://localhost:7456/` 返回 200。
- 已刷新 Cocos asset-db：`db://assets/scripts/ui/BottomNavUI.ts`。
- 下一步优先：继续把成就领取、邮件领取、好友访问做成可持久化状态，并向后续 .NET server API 结构靠拢。

# 2026-06-08 猫咪总览资产接入交接

- 最新完成：E008、E009、E010；同时推进 B003、B008、D002，共 6 个 task。
- `tools/generate-ui-assets.ps1` 已能生成单猫大立绘、装备图标、技能图标。
- `FATCATUI/assets/scripts/ui/UiAssetRegistry.ts` 已新增 `GeneratedCatFullArtAssets`、`GeneratedSkillIconAssets`，并扩展装备图标路径。
- `FATCATUI/assets/scripts/ui/BottomNavUI.ts` 猫咪总览中央角色展示区已用单猫大立绘；装备栏和焦点卡已用 PNG 图标。
- 已运行 `.\tools\check-client-ts.ps1` 通过；已刷新 Cocos asset-db。
- 下一步建议继续推进 B003/B008：纸张质感、左侧按钮图标、底部猫咪卡比例，以及单猫更精细手绘立绘。

# 2026-06-08 资源路径迁移与素材接入交接

- 最新进度以 `docs/ai-progress/00_PROJECT_DIRECTION.md`、`docs/ai-progress/01_DETAILED_PLAN.md`、`docs/ai-progress/02_TASKS.md`、`docs/ai-progress/04_ASSET_LOG.md` 为准。
- 本轮完成 B002、B007、C006、E002、E003、E004、E005、E007，共 8 个 task。
- 新增/使用 `FATCATUI/assets/scripts/ui/UiAssetRegistry.ts` 管理生成素材路径。
- `FATCATUI/assets/scripts/ui/BottomNavUI.ts` 已接入主工厂背景、猫咪详情背景、猫咪头像、猫咪参考图、楼层补充素材、商店/背包图标、功能入口图标。
- `BottomNavUI.ts` 当前不再导入 `GeneratedUiAssets.ts`；该旧文件可暂时保留，后续确认无其它引用后再清理。
- 已运行 `.\tools\check-client-ts.ps1`，未发现 `BottomNavUI`、`GeneratedUiAssets`、`CatDetailPanel` 相关 TypeScript 诊断。
- 下一步优先继续把猫咪页面的单只大立绘、装备图标、技能图标做成独立图片资源，并继续向 `所有猫咪页面.png` 对齐。

后续 AI 开工前先读：

1. `docs/ai-progress/00_PROJECT_DIRECTION.md`
2. `docs/ai-progress/01_DETAILED_PLAN.md`
3. `docs/ai-progress/02_TASKS.md`
4. `docs/ai-progress/03_UPDATE_RULES.md`
5. `docs/ai-progress/04_ASSET_LOG.md`
6. `AI_WORK_LOG.md`
7. `AI_DEVELOPMENT_PLAN.md`
8. `计划.txt`

当前状态：

- 已完成项目盘点和详细开发计划。
- 2026-06-08 已新增 `docs/ai-progress/` 作为后续 AI 开发的权威计划与任务进度目录。
- 后续每次完成 task 后必须更新 `docs/ai-progress/02_TASKS.md`，必要时同步 `01_DETAILED_PLAN.md` 和 `AI_WORK_LOG.md`。
- 2026-06-08 已新增 `docs/ai-progress/04_ASSET_LOG.md`、`docs/verification/`、`tools/check-client-ts.ps1`、`tools/verify-ui-clicks.browser.js`，后续素材和验证记录优先走这些入口。
- 已完成 M1 基础框架代码。
- 已完成 M2 第一批主工厂灰盒脚本。
- 已新增 Cocos Creator 项目扩展 `fatcat-tools`，可从菜单自动搭建当前场景灰盒。
- 尚未创建正式 `Main.scene`，也尚未在 Cocos Creator 里挂载运行验证。
- 当前 Cocos 工程目录：`D:\Desktop\FATCATCOM\FATCATUI`
- Cocos Creator 版本：3.8.8
- 目标设计基准：竖屏 1080 x 1920

目标 UI 参考图：

- `D:\Desktop\FATCATCOM\主页面.png`
- `D:\Desktop\FATCATCOM\所有猫咪页面.png`
- `D:\Desktop\FATCATCOM\猫咪详情页面.png`
- `D:\Desktop\FATCATCOM\其他页面.png`

重要结论：

- 目标游戏是《肥猫咖啡公司》，类型是竖屏放置经营 + 猫咪收集 + 建筑升级 + 商店背包 + 科技研究 + 弹射互动。
- 现有 `FATCATUI` 是 UI 示例工程，可以复用部分按钮、字体、图标、商店/背包脚本思路，但正式游戏应新建模块化架构，不要把逻辑堆进现有示例脚本。
- 当前优先级：继续让 UI 向四张目标图靠拢；缺少素材时使用 Codex 图片生成能力生成本地素材；UI 阶段完成后启动 C# .NET Core 服务端。
- `BottomNavUI.ts` 已是过渡性大文件，后续需要边推进 UI 边拆分架构。
- 每次完成任务必须追加更新 `AI_WORK_LOG.md`。

已新增的 M1 文件：

- `FATCATUI/assets/scripts/model/ResourceModel.ts`
- `FATCATUI/assets/scripts/model/SaveData.ts`
- `FATCATUI/assets/resources/configs/initialSave.json`
- `FATCATUI/assets/scripts/core/GameConfig.ts`
- `FATCATUI/assets/scripts/core/EventBus.ts`
- `FATCATUI/assets/scripts/core/GameApp.ts`
- `FATCATUI/assets/scripts/manager/ConfigManager.ts`
- `FATCATUI/assets/scripts/manager/SaveManager.ts`
- `FATCATUI/assets/scripts/manager/ResourceManager.ts`
- `FATCATUI/assets/scripts/ui/debug/ResourceDebugPanel.ts`

已新增的 M2 灰盒文件：

- `FATCATUI/assets/scripts/model/BuildingModel.ts`
- `FATCATUI/assets/resources/configs/buildings.json`
- `FATCATUI/assets/scripts/manager/BuildingManager.ts`
- `FATCATUI/assets/scripts/ui/Formatters.ts`
- `FATCATUI/assets/scripts/ui/TopBarUI.ts`
- `FATCATUI/assets/scripts/ui/BottomNavUI.ts`
- `FATCATUI/assets/scripts/ui/FactoryView.ts`
- `FATCATUI/assets/scripts/ui/components/BuildingFloorItem.ts`
- `FATCATUI/assets/scripts/ui/debug/MainGreyboxBootstrap.ts`

已新增的编辑器扩展：

- `FATCATUI/extensions/fatcat-tools/package.json`
- `FATCATUI/extensions/fatcat-tools/dist/main.js`
- `FATCATUI/extensions/fatcat-tools/dist/scene.js`

扩展用途：

- 菜单 `肥猫工具 -> 搭建当前场景灰盒` 会操作当前打开场景。
- 它会创建/复用 `FatCatMainGreyboxRoot`，并添加 `Canvas`、`GameApp`、`MainGreyboxBootstrap`。
- 菜单 `肥猫工具 -> 打印使用说明` 会在 Cocos 控制台输出步骤。

下一步任务建议：

```text
开始 M2 主工厂 UI 灰盒：
1. 在 Cocos Creator 打开工程，让新增脚本和 JSON 自动生成 .meta。
2. 在 `扩展 -> 扩展管理器 -> 项目` 中启用 `fatcat-tools`。
3. 新建独立 `Main.scene`，保存到 `assets/scene/Main.scene`，不破坏原 `home.scene`。
4. 点击 `肥猫工具 -> 搭建当前场景灰盒`。
5. 运行预览，确认 initialSave.json 能加载，localStorage 能保存。
6. 点击灰盒里的 +1000金币 和 -500金币，确认顶栏资源刷新。
7. 后续再把灰盒替换成正式 TopBarUI、BottomNavUI、FactoryView prefab。
8. 更新 AI_WORK_LOG.md。
```

开发注意事项：

- 不要一次性写完整游戏，按 M1-M9 逐步推进。
- 不要破坏原示例场景，前期可以新增 `Main.scene` 或独立脚本验证。
- 所有数值尽量走 JSON 配置。
- 本地存档用 `sys.localStorage`，存档里必须有版本号。
- UI 外观要持续对照四张目标图。
- 缺少猫咪、工厂、图标素材时，可以使用 imagegen 或游戏素材相关 skills 生成，并把 prompt 和输出路径记入日志。
- 当前全局 TypeScript 是 6.0.3，直接检查会和 Cocos 3.8.8 引擎声明文件冲突。当前可用检查命令：`tsc.cmd --noEmit --ignoreDeprecations 6.0 --skipLibCheck`。
# 2026-06-09 主界面侧边/收益/底部控件推进交接

- 最新完成/推进：B001、B002、B014、B015、H003、H005，共 6 个 task 点。
- 主要改动在 `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：左侧管线和电梯猫咪窗细节增强；右侧楼层收益牌新增类型图标；底部订单、宝箱、发射、礼包控件重新调整间距，已解决被底部导航遮挡的问题。
- 已刷新 Cocos asset-db：`db://assets/scripts/ui/BottomNavUI.ts`。
- 已跑验证：`.\tools\check-client-ts.ps1`、`node --check tools/verify-ui-clicks.browser.js`、`node --check tools/capture-main-regression.js`、`node tools/capture-main-regression.js`。
- 四尺寸截图位置：`docs/verification/screenshots/2026-06-09-main-regression/main-414x896-edge.png`、`main-430x932-edge.png`、`main-360x800-edge.png`、`main-768x1024-edge.png`；本轮结果无 console error、无 failed request。
- 下一步优先继续主界面：补楼层室内猫咪动作、机器差异、灯光层次和顶部 HUD 图标精度，再考虑把 CSS 占位逐步替换为生成图片素材。
# 2026-06-10 主界面室内丰富度与 HUD 图标精修交接

- 最新完成/推进：B001、B002、B014、B015、H003、H005，共 6 个 task 点。
- 主要改动在 `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：主工厂楼层新增吊灯、便签、咖啡豆轨道、传送带、植物、时钟；不同楼层按场景组合展示；猫咪增加颜色/大小/尾巴差异。
- HUD 继续精修：头像、金币、咖啡豆、猫粮、钻石、加号按钮增加高光和内阴影，钻石改成更清晰的紫色切面宝石。
- 已刷新 Cocos asset-db：`db://assets/scripts/ui/BottomNavUI.ts`。
- 已跑验证：`.\tools\check-client-ts.ps1`、`node --check tools/verify-ui-clicks.browser.js`、`node --check tools/capture-main-regression.js`、`node tools/capture-main-regression.js`。
- 四尺寸截图继续输出到 `docs/verification/screenshots/2026-06-09-main-regression/`；414x896、430x932、360x800、768x1024 均无 console error、无 failed request。
- 下一步优先：继续用生成图片素材替换 CSS 占位机器/猫咪，或推进猫咪总览、建筑、商店页面向目标 UI 对齐。

# 2026-06-10 主界面机器层与响应式交接

- 最新完成/推进：B001、B002、B014、B015、D002、H003、H005，共 7 个 task 点。
- 主要文件：`FATCATUI/assets/scripts/ui/BottomNavUI.ts`、`FATCATUI/assets/scripts/ui/UiAssetRegistry.ts`、`tools/generate-ui-assets.ps1`。
- 已生成素材：`prop_office.png`、`prop_mill.png`、`prop_cafe.png`，位于 `FATCATUI/assets/resources/textures/generated/factory/`；同时重新生成了原有 roaster/silos/storage。
- 重要注意：不要在 DOM overlay 里直接写 `background-image:url('assets/resources/...')` 加载 Cocos resources 目录文件。四尺寸回归已验证这种方式会产生 404。当前主界面使用 CSS 场景化机器贴片作为稳定 fallback。
- 若下轮继续接入真实 PNG，请优先做 Cocos 原生 SpriteFrame 加载或统一资源代理，再跑 `node tools/capture-main-regression.js`，确保 failedRequests 仍为空。
- 最新验证：`.\tools\check-client-ts.ps1` 通过；两个 browser JS `node --check` 通过；Cocos asset-db 已刷新；414x896、430x932、360x800、768x1024 截图回归最终无 console error、无 failed request。
- 下一步建议：继续主界面时做 Cocos 原生资源加载层和猫咪动作；或者转向猫咪/建筑/商店页面，继续按目标 UI 图片推进。

# 2026-06-10 工厂 PNG Data URI 接入交接

- 最新完成/推进：B001、B002、B014、B015、D002、D004、H003、H005，共 8 个 task 点。
- 新增文件：`tools/generate-factory-prop-data-uris.ps1`、`FATCATUI/assets/scripts/ui/FactoryPropDataUris.ts`。
- 修改文件：`tools/generate-ui-assets.ps1`、`FATCATUI/assets/scripts/ui/BottomNavUI.ts`，并更新进度/素材日志。
- 当前策略：DOM overlay 不直接请求 `assets/resources/...`；工厂楼层机器 PNG 通过 `FactoryPropDataUris.ts` 的 Data URI 显示，CSS 贴片作为叠加和兜底。
- 运行素材生成时使用 `.\tools\generate-ui-assets.ps1`，它会同时刷新 PNG 和 Data URI 注册表。
- 最新验证：`.\tools\check-client-ts.ps1`、`node --check tools/verify-ui-clicks.browser.js`、`node --check tools/capture-main-regression.js` 通过；`node tools/capture-main-regression.js` 覆盖 414x896、430x932、360x800、768x1024，均无 console error、无 failed request。
- 后续注意：长期仍应迁移到 Cocos 原生 SpriteFrame/prefab 资源管线；在迁移前不要把 DOM 图片退回 `assets/resources/...` 直链。
# 2026-06-10 DOM 图片资源修复交接

- 最新完成/推进：B001、B002、B003、B014、B015、D004、H003、H005，共 8 个 task 点。
- 重要结论：DOM overlay 里不要直接请求 `assets/resources/...`，Cocos preview 会 404。当前主界面工厂 PNG 走 `FactoryPropDataUris.ts`，猫咪页/商店/背包/功能入口图片走 `DomAssetDataUris.ts`。
- 新增文件：`tools/generate-dom-asset-data-uris.ps1`、`FATCATUI/assets/scripts/ui/DomAssetDataUris.ts`、`tools/verify-ui-clicks-playwright.js`。
- 修改文件：`tools/generate-ui-assets.ps1`、`FATCATUI/assets/scripts/ui/BottomNavUI.ts`，以及 `docs/ai-progress/*`、`AI_WORK_LOG.md`。
- 已刷新 Cocos asset-db：`DomAssetDataUris.ts`、`FactoryPropDataUris.ts`、`BottomNavUI.ts`。
- 最新验证命令：`.\tools\check-client-ts.ps1`；`node tools/verify-ui-clicks-playwright.js`；`node tools/capture-main-regression.js`。三者均通过。
- 下一轮建议：继续猫咪详情页目标 UI 对齐，优先做左侧标签/中心猫咪/属性卡/装备技能卡/底部猫咪队列的精致度和移动端适配；也可以继续主界面楼层灯光、道具和猫咪动作。
# 2026-06-10 猫咪详情页视觉推进交接

- 最新完成/推进：B003、B008、B014、B015、H003、H005，共 6 个 task 点。
- 主要修改：`FATCATUI/assets/scripts/ui/BottomNavUI.ts` 猫咪详情页视觉层级增强，包括侧栏、角色舞台、状态卡、属性卡、技能/装备卡和队列按钮反馈。
- 新增验证脚本：`tools/capture-cat-regression.js`，截图输出到 `docs/verification/screenshots/2026-06-10-cat-regression/`。
- 重要修复：猫咪页默认提示条已隐藏，避免在 414x896、360x800 等小屏尺寸遮挡内容；交互后仍会显示反馈消息。
- 已刷新 Cocos asset-db：`db://assets/scripts/ui/BottomNavUI.ts`。
- 最新验证：`check-client-ts`、`verify-ui-clicks-playwright.js`、`capture-cat-regression.js`、`capture-main-regression.js` 全部通过，无 console error、无 failed request。
- 下一轮建议：优先清理猫咪页部分历史乱码文案，然后继续底部猫咪队列、技能/装备卡交互和目标 UI 细节对齐。
# 2026-06-10 猫咪页文案与底部队列交接

- 最新完成/推进：B003、B014、B015、H003、H005、H006，共 6 个 task 点。
- 新增验证脚本：`tools/check-cat-text-regression.js`，检查猫咪页关键中文文案和常见乱码片段。
- 主要修改：`FATCATUI/assets/scripts/ui/BottomNavUI.ts`，猫咪页弹层更接近全屏详情页；猫咪页打开时隐藏 Cocos 原生底部导航；底部猫咪队列加高并遮住后方内容。
- 已刷新 Cocos asset-db：`db://assets/scripts/ui/BottomNavUI.ts`。
- 最新验证命令全部通过：`.\tools\check-client-ts.ps1`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-cat-regression.js`、`node tools/capture-main-regression.js`。
- 下一轮建议：继续优化猫咪队列卡片细节、技能/装备卡交互和其他页面的乱码文案检查。
# 2026-06-12 猫咪页交互深化交接

- 最新完成/推进：B003、B008、B014、B015、H003、H005，共 6 个 task 点。
- 主要修改：`FATCATUI/assets/scripts/ui/BottomNavUI.ts`，新增猫咪页技能详情、装备选择、故事/照片入口的本地反馈；增强底部队列稀有度和职业状态表现。
- 验证脚本更新：`tools/verify-ui-clicks-playwright.js` 新增 `cat-skill-details`、`cat-equip-action`、`cat-story-action`。
- 重要修复：414x896 小屏下装备按钮曾被底部操作条遮挡，已通过内容层级修复并由点击回归覆盖。
- 已刷新 Cocos asset-db：`db://assets/scripts/ui/BottomNavUI.ts`。
- 最新验证全部通过：`.\tools\check-client-ts.ps1`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-cat-regression.js`、`node tools/capture-main-regression.js`。
- 下一轮建议：继续把装备区做成真正的替换/升级列表，或转向建筑页/商店页目标 UI 对齐。
# 2026-06-12 猫咪页装备背包面板交接

- 最新完成/推进：B003、B008、B014、B015、H003、H005，共 6 个 task 点。
- 主要修改：`FATCATUI/assets/scripts/ui/BottomNavUI.ts`，装备区新增装备槽位、选中态、装备背包候选卡、可替换状态和锁定饰品槽。
- 事件处理更新：猫咪页 DOM 事件现在识别任意 `[data-action]` 元素，不再仅限 button，因此装备槽位卡也能点击。
- 验证脚本更新：`tools/capture-cat-regression.js` 的装备卡计数已改为 `.equip-slot`。
- 已刷新 Cocos asset-db：`db://assets/scripts/ui/BottomNavUI.ts`。
- 最新验证全部通过：`.\tools\check-client-ts.ps1`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-cat-regression.js`、`node tools/capture-main-regression.js`。
- 下一轮建议：把装备背包接入真实 inventory/save 数据，或开始推进建筑页/商店页 UI。
# 2026-06-12 猫咪装备存档管线交接

- 最新完成/推进：B003、B008、G001、G003、H003、H005，共 6 个 task 点。
- 主要修改：
  - `FATCATUI/assets/scripts/model/SaveData.ts`：`CatSaveData` 新增 `equipment`。
  - `FATCATUI/assets/scripts/manager/SaveManager.ts`：旧存档和初始存档补齐装备字段兼容。
  - `FATCATUI/assets/scripts/manager/CatManager.ts`：新增默认装备、`getEquipment()`、`equipItem()`。
  - `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：装备区读取并保存真实猫咪装备槽位。
- 验证脚本更新：`tools/verify-ui-clicks-playwright.js` 新增 `cat-equip-save`。
- 已刷新 Cocos asset-db：`SaveData.ts`、`SaveManager.ts`、`CatManager.ts`、`BottomNavUI.ts`。
- 最新验证全部通过：`.\tools\check-client-ts.ps1`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-cat-regression.js`、`node tools/capture-main-regression.js`。
- 下一轮建议：把内置装备定义迁移到 JSON 配置，或让装备背包读取真实 `InventoryManager` 数量。
# 2026-06-12 装备配置 JSON 化交接

- 最新完成/推进：B003、B008、D002、G001、H003、H005，共 6 个 task 点。
- 新增配置：`FATCATUI/assets/resources/configs/equipment.json`，并已生成 `.meta`。
- 主要修改：
  - `ItemModel.ts`：新增 `EquipmentConfig`。
  - `ConfigManager.ts`：加载 `configs/equipment` 并提供 `equipment` getter。
  - `CatManager.ts`：默认装备、装备候选和装备定义改为配置驱动。
  - `BottomNavUI.ts`：装备 UI 改为通过 CatManager 读取配置。
  - `tools/check-client-ts.ps1`：扩大类型检查过滤范围。
- 已刷新 Cocos asset-db：`equipment.json`、`ItemModel.ts`、`ConfigManager.ts`、`CatManager.ts`、`BottomNavUI.ts`。
- 最新验证全部通过：装备 JSON parse、`.\tools\check-client-ts.ps1`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-cat-regression.js`、`node tools/capture-main-regression.js`。
- 下一轮建议：让装备背包按 `InventoryManager` 持有数量显示，或为装备配置增加升级消耗/来源字段。

# 2026-06-12 装备背包库存联动交接

- 最新完成/推进：B003、B008、G001、G003、H003、H005，共 6 个 task 点。
- 主要修改：
  - `FATCATUI/assets/scripts/manager/InventoryManager.ts`：新增 `getItemCount()`、`hasItem()`。
  - `FATCATUI/assets/resources/configs/initialSave.json`：补齐 6 个装备项的初始库存。
  - `FATCATUI/assets/scripts/manager/CatManager.ts`：`equipItem()` 新增库存持有校验。
  - `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：装备背包显示 `已装备`、`持有 xN`、`未持有`，未持有项禁用。
  - `tools/check-cat-text-regression.js`：更新装备背包文案守卫。
- 已刷新 Cocos asset-db：`initialSave.json`、`InventoryManager.ts`、`CatManager.ts`、`BottomNavUI.ts`。
- 最新验证全部通过：`initialSave.json` parse、`.\tools\check-client-ts.ps1`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-cat-regression.js`、`node tools/capture-main-regression.js`。
- 截图回归输出仍在：
  - `docs/verification/screenshots/2026-06-10-cat-regression/`
  - `docs/verification/screenshots/2026-06-09-main-regression/`
- 下一轮建议：给装备配置增加 `levelMax/upgradeCost/source`，做装备升级和来源提示；或者转向建筑页/商店页继续对齐目标 UI。

# 2026-06-12 装备升级预览与来源字段交接

- 最新完成/推进：B003、B008、D002、G001、H003、H005，共 6 个 task 点。
- 主要修改：
  - `FATCATUI/assets/resources/configs/equipment.json`：6 个装备新增 `levelMax`、`upgradeCost`、`source`。
  - `FATCATUI/assets/scripts/model/ItemModel.ts`：`EquipmentConfig` 类型同步扩展。
  - `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：装备槽显示稀有度和等级上限，背包候选显示来源，新增 `升级预览` 按钮。
  - `tools/verify-ui-clicks-playwright.js`：新增 `cat-equip-upgrade-preview`。
  - `tools/check-cat-text-regression.js`：新增 `升级预览`、`新手任务` 文案守卫。
- 已刷新 Cocos asset-db：`equipment.json`、`ItemModel.ts`、`BottomNavUI.ts`。
- 最新验证全部通过：装备 JSON parse、`.\tools\check-client-ts.ps1`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-cat-regression.js`、`node tools/capture-main-regression.js`。
- 额外小屏装备页截图：`docs/verification/screenshots/2026-06-10-cat-regression/cat-equip-414x896-edge.png`。
- 下一轮建议：实现正式装备等级存档和金币/材料扣除，或把建筑页/商店页继续向目标 UI 推进。

# 2026-06-12 装备正式升级与等级存档交接

- 最新完成/推进：B003、B008、G001、G003、H003、H005，共 6 个 task 点。
- 主要修改：
  - `FATCATUI/assets/scripts/model/SaveData.ts`：`CatSaveData` 新增 `equipmentLevels`。
  - `FATCATUI/assets/scripts/manager/SaveManager.ts`：旧存档和初始存档补齐装备等级表。
  - `FATCATUI/assets/scripts/manager/CatManager.ts`：新增 `getEquipmentLevel()`、`upgradeEquipment()`；装备成功时初始化等级。
  - `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：装备槽显示真实等级，升级按钮正式扣金币并写存档。
  - `tools/verify-ui-clicks-playwright.js`：升级点击步骤更新为 `cat-equip-upgrade`。
  - `tools/check-cat-text-regression.js`：文案守卫更新为 `升级装备`。
- 当前规则：装备默认 Lv.1；升级消耗 `upgradeCost * 当前等级` 金币；达到 `levelMax` 后提示满级。
- 已刷新 Cocos asset-db：`SaveData.ts`、`SaveManager.ts`、`CatManager.ts`、`BottomNavUI.ts`。
- 最新验证全部通过：装备 JSON parse、`.\tools\check-client-ts.ps1`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-cat-regression.js`、`node tools/capture-main-regression.js`。
- 下一轮建议：增加升级材料消耗、当前/下级属性对比和满级/金币不足按钮状态；或开始把装备字段加入未来服务端 DTO。

# 2026-06-12 装备升级状态条与按钮状态交接

- 最新完成/推进：B003、B008、B014、B015、H003、H005，共 6 个 task 点。
- 主要修改：
  - `FATCATUI/assets/scripts/manager/CatManager.ts`：新增 `getEquipmentUpgradeState()`。
  - `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：装备区新增当前等级、下级预览、升级消耗状态条；升级按钮支持可升级、金币不足、已满级三种状态。
  - `tools/check-cat-text-regression.js`：新增 `当前等级`、`下级预览`、`升级消耗` 文案守卫。
  - `tools/verify-ui-clicks-playwright.js`：兼容满级/金币不足时 disabled 升级按钮，不再强制点击禁用状态。
- 已刷新 Cocos asset-db：`CatManager.ts`、`BottomNavUI.ts`。
- 最新验证全部通过：`.\tools\check-client-ts.ps1`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-cat-regression.js`、`node tools/capture-main-regression.js`。
- 下一轮建议：为 `equipment.json` 增加结构化 `effects` 或升级材料配置，展示“当前加成 -> 下级加成”；或者推进商店页/背包页对装备来源的联动。

# 2026-06-12 装备结构化 effects 与加成预览交接

- 最新完成/推进：B003、B008、D002、G001、H003、H005，共 6 个 task 点。
- 主要修改：
  - `FATCATUI/assets/resources/configs/equipment.json`：6 个装备新增 `effects`。
  - `FATCATUI/assets/scripts/model/ItemModel.ts`：新增 `EquipmentEffect` 类型。
  - `FATCATUI/assets/scripts/manager/CatManager.ts`：`getEquipmentUpgradeState()` 返回 `currentEffect`、`nextEffect`。
  - `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：装备区新增 `当前加成`、`下级加成` 对比条。
  - `tools/check-cat-text-regression.js`：新增当前/下级加成文案守卫。
- 当前状态：`effects` 只用于装备页展示，尚未接入生产、心情、消耗等真实公式。
- 已刷新 Cocos asset-db：`equipment.json`、`ItemModel.ts`、`CatManager.ts`、`BottomNavUI.ts`。
- 最新验证全部通过：effects 配置检查、`.\tools\check-client-ts.ps1`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-cat-regression.js`、`node tools/capture-main-regression.js`。
- 下一轮建议：把 `materialOutput/mood/catFoodCost/wageCost` 接入实际公式，或推进商店页/背包页对装备来源、库存、购买入口的 UI。

# 2026-06-12 materialOutput 接入生产公式交接

- 最新完成/推进：B003、B008、G001、G003、H003、H005，共 6 个 task 点。
- 主要修改：
  - `FATCATUI/assets/scripts/manager/CatManager.ts`：新增 `getEquipmentEffectTotal()`，并在 `getCatProduction()` 接入 `materialOutput`。
  - `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：装备焦点卡读取真实装备 effects 汇总。
  - `tools/check-equipment-production-effect.js`：新增生产力守卫，验证默认装备加成真实生效。
- 当前验证基准：清空本地存档后默认猫可见生产力应为 `13/秒`，装备焦点卡应包含 `原料产量 +15%`。
- 已刷新 Cocos asset-db：`CatManager.ts`、`BottomNavUI.ts`。
- 最新验证全部通过：`.\tools\check-client-ts.ps1`、`node tools/check-equipment-production-effect.js`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-cat-regression.js`、`node tools/capture-main-regression.js`。
- 下一轮建议：继续接入 `catFoodCost` 到喂食/维护消耗，或接入 `mood` 到心情上限；也可推进商店页/背包页装备来源联动。

# 2026-06-12 catFoodCost 接入喂食成本交接

- 最新完成/推进：B003、B008、G001、G003、H003、H005，共 6 个 task 点。
- 主要修改：
  - `FATCATUI/assets/scripts/manager/CatManager.ts`：新增 `getFeedCost()`，`feedCat()` 改为扣真实喂食成本。
  - `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：猫咪页喂食卡显示真实成本，按钮禁用状态按真实成本判断。
  - `tools/check-equipment-feed-cost-effect.js`：新增喂食成本守卫。
- 当前验证基准：清空本地存档后默认猫喂食卡应显示 `9`，装备卡应包含 `猫粮 -5%`。
- 已刷新 Cocos asset-db：`CatManager.ts`、`BottomNavUI.ts`。
- 最新验证全部通过：`.\tools\check-client-ts.ps1`、`node tools/check-equipment-feed-cost-effect.js`、`node tools/check-equipment-production-effect.js`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-cat-regression.js`、`node tools/capture-main-regression.js`。
- 下一轮建议：接入 `mood` 到心情上限与心情显示，或接入 `wageCost` 到工资成本。

# 2026-06-12 mood 接入心情显示交接

- 最新完成/推进：B003、B008、G001、G003、H003、H005，共 6 个 task 点。
- 主要修改：
  - `FATCATUI/assets/scripts/manager/CatManager.ts`：新增 `getMoodCap()` 和 `getMood()`。
  - `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：猫咪页心情卡读取真实装备心情效果。
  - `tools/check-equipment-mood-effect.js`：新增心情效果守卫。
- 当前验证基准：清空本地存档后默认猫心情卡应显示 `105%`，装备焦点卡应包含 `心情上限 +10%`。
- 已刷新 Cocos asset-db：`CatManager.ts`、`BottomNavUI.ts`。
- 最新验证全部通过：`.\tools\check-client-ts.ps1`、`node tools/check-equipment-mood-effect.js`、`node tools/check-equipment-feed-cost-effect.js`、`node tools/check-equipment-production-effect.js`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-cat-regression.js`、`node tools/capture-main-regression.js`。
- 下一轮建议：接入 `wageCost` 到工资显示和成本公式，或推进商店/背包的装备来源与库存联动。

# 2026-06-12 wageCost 接入工资显示交接

- 最新完成/推进：B003、B008、G001、G003、H003、H005，共 6 个 task 点。
- 主要修改：
  - `FATCATUI/assets/scripts/manager/CatManager.ts`：新增 `getWageCost()`。
  - `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：猫咪页工资卡读取真实装备工资成本。
  - `tools/check-equipment-wage-cost-effect.js`：新增工资效果守卫，覆盖升级猫咪、切换坐垫、装备午睡坐垫的真实 UI 点击路径。
- 当前验证基准：清空本地存档后默认猫升到 Lv.20 并装备午睡坐垫，工资卡应显示 `19/分钟`，装备详情应包含 `工资消耗 -5%`。
- 已刷新 Cocos asset-db：`CatManager.ts`、`BottomNavUI.ts`。
- 最新验证全部通过：`.\tools\check-client-ts.ps1`、`node tools/check-equipment-wage-cost-effect.js`、`node tools/check-equipment-mood-effect.js`、`node tools/check-equipment-feed-cost-effect.js`、`node tools/check-equipment-production-effect.js`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-cat-regression.js`、`node tools/capture-main-regression.js`。
- 下一轮建议：把 `getWageCost()` 接到建筑/订单净收益结算，或继续精修主界面顶部 HUD 和楼层室内丰富度以贴近目标 UI。

# 2026-06-12 wageCost 接入建筑净收益交接

- 最新完成/推进：B003、B014、B015、G001、G003、H003、H005，共 7 个 task 点。
- 主要修改：
  - `FATCATUI/assets/scripts/manager/CatManager.ts`：新增 `getBuildingWageCost()`。
  - `FATCATUI/assets/scripts/manager/ProductionManager.ts`：生产快照新增毛收益、工资成本和楼层工资分项；结算使用净金币收益。
  - `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：建筑管理页新增净金币/工资成本/咖啡豆消耗/值班猫咪四卡，小屏两列；楼层小卡改显示净收益。
  - `tools/check-production-wage-net-effect.js`：新增建筑净收益守卫。
- 当前验证基准：建筑页应显示 `净金币`、`工资成本`、`咖啡豆消耗`、`值班猫咪` 四张卡，并在说明中显示 `毛收益`、`工资`、`净收益`。
- 已刷新 Cocos asset-db：`CatManager.ts`、`ProductionManager.ts`、`BottomNavUI.ts`。
- 最新验证全部通过：`.\tools\check-client-ts.ps1`、`node tools/check-production-wage-net-effect.js`、`node tools/check-equipment-wage-cost-effect.js`、`node tools/check-equipment-mood-effect.js`、`node tools/check-equipment-feed-cost-effect.js`、`node tools/check-equipment-production-effect.js`、`node tools/check-cat-text-regression.js`、`node tools/verify-ui-clicks-playwright.js`、`node tools/capture-main-regression.js`、`node tools/capture-cat-regression.js`。
- 下一轮建议：同步生产快照字段到未来 .NET Core 服务端 DTO/结算 API，或继续推进商店/背包的装备来源购买闭环。

# 2026-06-13 服务端 production preview 契约交接

- 最新完成/推进：F008、F009、F011、G001、G004、H003、H004、H005，共 8 个 task 点。
- 主要修改：
  - `FATCATServer/FatCat.Application/Contracts.cs`：新增 production preview 请求/响应 DTO。
  - `FATCATServer/FatCat.Application/FatCatGameService.cs`：新增 `PreviewProduction()`，计算总计与楼层净收益。
  - `FATCATServer/FatCat.Api/Program.cs`：新增 `POST /api/production/preview`，bootstrap feature 增加 `production-preview`。
  - `FATCATUI/assets/scripts/net/ApiTypes.ts`、`ApiClient.ts`：新增对应 TypeScript 类型与 `previewProduction()`。
  - `tools/check-server-api.ps1`：真实 HTTP smoke 新增 production preview 检查。
- 当前验证基准：`POST /api/production/preview` 输入 `grossCoinPerSecond=213`、`wageCostPerSecond=0.25` 时，`netCoinPerSecond` 应为 `212.75`。
- 最新验证全部通过：`dotnet test FATCATServer/FATCATServer.sln`、`.\tools\check-server-api.ps1` 真实 HTTP smoke、`.\tools\check-client-ts.ps1`、建筑净收益守卫、点击回归、主界面四尺寸截图、猫咪页四尺寸截图。
- 下一轮建议：在客户端设置页或发射流程中接入 `ApiClient.previewProduction()` 做联网结算预览，之后再推进服务器权威发射/好友互动。

# 2026-06-13 客户端结算预览联调入口交接

- 最新完成/推进：B014、F011、G001、G004、G005、H003、H004、H005，共 8 个 task 点。
- 主要修改：
  - `FATCATUI/assets/scripts/manager/SyncManager.ts`：新增 `previewProduction()`，组装当前生产快照并请求服务端。
  - `FATCATUI/assets/scripts/ui/BottomNavUI.ts`：设置页新增 `结算预览` 按钮和成功/失败反馈。
  - `tools/check-settings-production-preview-button.js`：覆盖离线按钮存在与失败提示。
  - `tools/check-settings-production-preview-online.js`：临时启动本地 API，验证真实联网 UI 预览。
- 当前验证基准：离线设置页点击 `结算预览` 应提示“请先连接服务器”；联网后应显示 `服务端结算预览：净收益 213 金币/秒，工资 0.02 金币/秒。`
- 最新验证全部通过：`.\tools\check-client-ts.ps1`、`dotnet test FATCATServer/FATCATServer.sln`、离线/在线结算预览脚本、建筑净收益守卫、点击回归、主界面四尺寸截图、猫咪页四尺寸截图。
- 下一轮建议：把服务端 preview 结果接到发射按钮或离线收益结算前校验，逐步过渡到服务器权威结算。
