# 肥猫咖啡公司 子 Task 进度表

更新时间：2026-06-08

状态说明：

- `[ ]` 未开始
- `[~]` 进行中
- `[x]` 已完成
- `[!]` 阻塞或需要用户/外部状态

每次完成任意 task 后必须更新：

- 本文件对应 task 状态和完成记录。
- `01_DETAILED_PLAN.md` 中相关章节的状态描述。
- 如有实现代码，更新 `AI_WORK_LOG.md`。

## A. 项目计划与进度体系

- [x] A001 通读项目结构、旧计划、交接文档和当前核心代码。
  - 完成时间：2026-06-08。
  - 备注：已确认 Cocos 客户端、DOM UI、配置/存档/业务管理器现状。
- [x] A002 书写大方向推进计划书。
  - 文件：`docs/ai-progress/00_PROJECT_DIRECTION.md`
- [x] A003 书写详细推进计划书。
  - 文件：`docs/ai-progress/01_DETAILED_PLAN.md`
- [x] A004 建立子 task 进度表。
  - 文件：`docs/ai-progress/02_TASKS.md`
- [x] A005 建立每次开发后的更新规则。
  - 文件：`docs/ai-progress/03_UPDATE_RULES.md`
- [x] A006 更新旧 `AI_HANDOFF.md`，让后续 AI 优先读取 `docs/ai-progress`。
  - 完成时间：2026-06-08。

## B. UI 参考图对齐

- [~] B001 主工厂页继续向 `主页面.png` 靠拢。
  - 已有：HUD、资源条、工厂剖面、左右按钮、底部按钮、底部导航、移动端适配。
  - 下一步：细化楼层室内素材、左侧电梯、右侧收益牌、底部订单/礼包。
  - 2026-06-09：已新增每层 CSS 室内装饰层，补充灯光、管线、黑板、货架、麻袋、窗格、仪表等细节，主楼层不再依赖 Cocos 预览不可访问的静态图片 URL。
- [x] B002 生成或接入主工厂楼层细节素材。
  - 输出目录建议：`FATCATUI/assets/resources/textures/generated/factory/`
  - 验收：每层至少有独立机器/道具/猫咪视觉元素。
  - 完成时间：2026-06-08。
  - 备注：已生成并接入 `prop_roaster.png`、`prop_silos.png`、`prop_storage.png`，主工厂每层现在有项目内 PNG 道具叠加层。
  - 2026-06-09：由于 Cocos 预览不按 `assets/resources/...` 静态路径暴露图片，主工厂页已改为 CSS 室内装饰兜底，截图回归不再产生 404。
- [~] B003 猫咪按钮打开全屏猫咪总览页，对齐 `所有猫咪页面.png`。
  - 2026-06-08：已将猫咪按钮入口继续固定为全屏 DOM 猫咪总览，标题改为猫咪图鉴，并补顶部概览数据条。
  - 2026-06-08：中央角色区已接入 5 张单猫大立绘，焦点信息卡和装备栏已接入项目 PNG 图标。
  - 下一步：继续提升背景、纸张面板、角色立绘比例，让整体更接近参考图。
- [x] B004 猫咪总览页左侧页签：信息、升级、技能、装备、皮肤。
  - 完成时间：2026-06-08。
  - 备注：左侧页签已在全屏猫咪总览页可切换，默认标题修正为信息。
- [x] B005 猫咪总览页中央大猫展示、对白、左右切换。
  - 2026-06-08：已补中央猫咪索引、对白气泡、上一只/下一只按钮和轮换逻辑。
  - 完成时间：2026-06-08。
  - 备注：本轮加大中央展示区，补充稀有度/职业/岗位信息条；后续大猫立绘生成归入 B007/E003。
- [x] B006 猫咪总览页底部猫咪横向列表和招募按钮。
  - 完成时间：2026-06-08。
  - 备注：底部队伍列表、状态、稀有度、招募按钮已可用，并新增队伍标签。
- [x] B007 生成第一批统一风格猫咪大立绘。
  - 输出目录建议：`FATCATUI/assets/resources/textures/generated/cats/`
  - 完成时间：2026-06-08。
  - 备注：已使用 Codex 图片生成五只肥猫统一风格参考图 `cat_lineup_reference_20260608.png`，并接入猫咪图鉴故事图区域；后续可继续切分为单只透明立绘。
- [~] B008 猫咪详情弹窗对齐 `猫咪详情页面.png`。
  - 已有：详情弹层、标题、关闭、属性、技能、装备、故事、升级/喂养。
  - 2026-06-08：猫咪总览页已补独立技能图标、装备图标和单猫大立绘，为后续详情弹窗复用素材打底。
  - 下一步：重做比例、纸张质感、装备卡、职业标签、星级。
- [~] B009 建筑页对齐 `其他页面.png` 建筑详情。
  - 已有：楼层 mini 工厂、经营数据卡、经营动线、排班/升级。
  - 下一步：升级条件、建筑大图、当前/下级效果更清晰。
- [~] B010 商店页对齐 `其他页面.png` 商店。
  - 已有：分类、商品列表、限购、状态、购买。
  - 下一步：商品图标、货架/礼包视觉、价格按钮。
- [~] B011 背包页对齐 `其他页面.png` 背包。
  - 已有：分类、容量摘要、物品格、资源卡、使用按钮。
  - 下一步：选中详情、碎片合成、装备跳转。
- [~] B012 研究页对齐 `其他页面.png` 研究。
  - 已有：科技树、实验室横幅、节点详情、研究按钮。
  - 下一步：分类过滤、节点连线细化、当前/下级效果。
- [~] B013 任务/成就/邮件/好友/设置页面补齐。
  - 2026-06-08：右侧成就、邮件、好友、设置入口已从临时提示升级为真实 DOM 面板。
  - 已有：成就进度墙、邮件领取、本轮会话防重复领取、本地好友列表、设置状态页、移动端紧凑布局。
  - 2026-06-08：新增 `featureState` 存档底座，邮件领取、设置开关、好友访问/赠礼已可写入 localStorage。
  - 下一步：继续接入服务器数据、邮件已领取状态持久化、好友工厂访问和设置实际开关。
- [~] B014 全局按钮、面板、资源条、图标统一视觉规范。
  - 2026-06-09：顶部 HUD 资源条已增强胶囊质感、高光、分隔和加号按钮层次；仍需继续统一其他页面按钮细节。
- [~] B015 手机分辨率适配回归：390x844、414x896、430x932、360x800、768x1024。
  - 2026-06-08：已用 390x844 复查主界面、设置页、猫咪页；修复窄屏 HUD 资源条拥挤、设置页底部按钮贴底栏、服务器“离线”文案误导。
  - 2026-06-09：已补跑 414x896、430x932、360x800、768x1024 主界面截图回归；4 个资源条、6 层楼、6 个室内装饰层、发射/猫咪/设置入口均存在，且无 console error、无 failed request。

## C. 客户端架构整理

- [ ] C001 拆分 `BottomNavUI.ts` 中 HUD 渲染逻辑。
- [ ] C002 拆分 `BottomNavUI.ts` 中主工厂渲染逻辑。
- [ ] C003 拆分 `BottomNavUI.ts` 中面板渲染逻辑。
- [ ] C004 拆分 `BottomNavUI.ts` 中猫咪详情/总览渲染逻辑。
- [ ] C005 建立 DOM 样式注册器，避免所有 CSS 堆在一个方法里。
- [x] C006 建立素材注册表，替代无限扩张的 `GeneratedUiAssets.ts`。
  - 完成时间：2026-06-08。
  - 文件：`FATCATUI/assets/scripts/ui/UiAssetRegistry.ts`
  - 备注：已为猫咪、工厂、物品、功能图标建立项目资源路径注册表，新增素材不再继续塞入 `GeneratedUiAssets.ts`。
- [x] C007 为底部导航和关键按钮建立可重复点击验证脚本。
  - 完成时间：2026-06-08。
  - 文件：`tools/verify-ui-clicks.browser.js`
  - 备注：脚本覆盖猫咪入口、猫咪图鉴标题、左侧页签、中央左右切换和核心 DOM 状态读取。
- [ ] C008 梳理 UI 事件和业务事件，补充 `GameEvents`。

## D. 玩法闭环

- [~] D001 资源与生产。
  - 已有：生产快照、结算、咖啡豆不足暂停。
  - 下一步：订单金币、资源上限、生产公式文档。
- [~] D002 猫咪基础养成。
  - 已有：解锁、升级、喂养、体重、生产、排班。
  - 2026-06-08：技能、装备、皮肤信息卡已加入图标化展示，装备栏具备独立图标资产。
  - 下一步：星级、技能升级、装备、皮肤、心情、故事。
- [~] D003 建筑经营。
  - 已有：建筑等级、效果、升级、排班容量。
  - 下一步：楼层解锁、升级条件、建筑外观。
- [~] D004 商店和背包。
  - 已有：商品购买、每日限购计数、入背包、资源包使用。
  - 下一步：每日按日期重置、碎片合成、装备物品。
- [~] D005 研究系统。
  - 已有：前置、研究点消耗、全局加成。
  - 下一步：分类、升级型节点、多级研究。
- [~] D006 任务/成就完整奖励闭环。
  - 2026-06-08：成就页已复用任务进度，邮件页已提供本地领取奖励动作。
  - 2026-06-08：邮件领取状态已持久化到 `featureState.claimedMails`，重复领取会失败。
  - 下一步：把成就领取、邮件领取、任务奖励改造成统一的服务端可校验奖励管线。
- [ ] D007 离线收益面板和结算。
- [ ] D008 发射猫咪单机 MVP。
- [ ] D009 假好友工厂目标和结算。
- [ ] D010 每日发射次数和恢复。

## E. 素材生成与接入

- [x] E001 创建生成素材目录结构。
  - `FATCATUI/assets/resources/textures/generated/factory/`
  - `FATCATUI/assets/resources/textures/generated/cats/`
  - `FATCATUI/assets/resources/textures/generated/ui/`
  - `FATCATUI/assets/resources/textures/generated/items/`
  - `FATCATUI/assets/resources/textures/generated/backgrounds/`
  - 完成时间：2026-06-08。
  - 备注：已为每个目录添加 `.gitkeep` 占位文件，并刷新 Cocos asset-db。
- [x] E002 生成主工厂楼层补充素材。
  - 完成时间：2026-06-08。
  - 输出：`prop_roaster.png`、`prop_silos.png`、`prop_storage.png`
  - 接入：`BottomNavUI.ts` 主工厂楼层道具叠加层。
- [x] E003 生成猫咪大立绘第一批。
  - 完成时间：2026-06-08。
  - 输出：`cat_lineup_reference_20260608.png`
  - 接入：猫咪图鉴故事照片区域，作为后续单猫立绘切分的统一风格基准。
- [x] E004 生成商店/背包物品图标第一批。
  - 完成时间：2026-06-08。
  - 输出：`icon_coffee_bean.png`、`icon_cat_food.png`、`icon_coin_pack.png`、`icon_diamond.png`
  - 接入：商店商品卡、背包物品卡、背包资源卡。
- [x] E005 生成邮件、好友、成就、设置图标。
  - 完成时间：2026-06-08。
  - 输出：`icon_mail.png`、`icon_friend.png`、`icon_achievement.png`、`icon_settings.png`
  - 接入：主工厂右侧功能提示卡。
- [x] E006 建立素材生成记录表。
  - 完成时间：2026-06-08。
  - 文件：`docs/ai-progress/04_ASSET_LOG.md`
  - 备注：已记录固定目录、素材记录模板和当前内嵌素材盘点。
- [x] E007 把稳定素材从 Data URI 转为资源路径加载。
  - 2026-06-08：已新增 `UiAssetRegistry.ts` 并让本轮生成的猫咪、工厂、商店/背包、功能图标走项目资源路径。
  - 2026-06-08：主工厂背景、猫咪详情背景、猫咪总览头像也已改为项目资源路径加载，`BottomNavUI.ts` 不再依赖 `GeneratedUiAssets.ts`。
- [x] E008 生成并接入单猫大立绘第一批。
  - 完成时间：2026-06-08。
  - 输出：`cat_full_orange.png`、`cat_full_black.png`、`cat_full_white.png`、`cat_full_calico.png`、`cat_full_tuxedo.png`
  - 接入：猫咪总览中央角色展示区。
- [x] E009 生成并接入装备图标第一批。
  - 完成时间：2026-06-08。
  - 输出：`equip_collar.png`、`equip_cup.png`、`equip_cushion.png`、`equip_locked.png`
  - 接入：猫咪总览装备栏和装备焦点信息卡。
- [x] E010 生成并接入技能图标第一批。
  - 完成时间：2026-06-08。
  - 输出：`skill_producer.png`、`skill_launcher.png`、`skill_saver.png`、`skill_support.png`
  - 接入：猫咪总览信息/技能焦点卡。

## F. 服务端 .NET Core

- [x] F001 创建 `FATCATServer` 解决方案。
  - 完成时间：2026-06-08。
  - 文件：`FATCATServer/FATCATServer.sln`
- [x] F002 创建 `FatCat.Api` ASP.NET Core Web API。
  - 完成时间：2026-06-08。
  - 文件：`FATCATServer/FatCat.Api/FatCat.Api.csproj`
- [x] F003 创建 Domain/Application/Infrastructure/Test 分层项目。
  - 完成时间：2026-06-08。
  - 文件：`FatCat.Domain`、`FatCat.Application`、`FatCat.Infrastructure`、`FatCat.Tests`
- [x] F004 接入 EF Core + SQLite。
  - 完成时间：2026-06-08。
  - 备注：`FatCat.Infrastructure` 已接入 `Microsoft.EntityFrameworkCore.Sqlite` 9.0.15，API 默认连接 `Data Source=fatcat-dev.db`。
- [~] F005 设计并实现玩家、资源、猫咪、建筑、背包、研究、任务数据表。
  - 2026-06-08：已实现 `PlayerProfile` 与 `PlayerSaveSnapshot` 表；其余玩法表待后续拆分。
- [~] F006 实现游客登录和 JWT。
  - 2026-06-08：已实现 `/api/auth/guest` 和开发期 dev token；正式 JWT 待接入认证中间件。
- [x] F007 实现 `/api/player/me`。
  - 完成时间：2026-06-08。
- [x] F008 实现 `/api/config/version` 和 `/api/config/bootstrap`。
  - 完成时间：2026-06-08。
- [x] F009 实现 `/api/save` 和 `/api/save/sync`。
  - 完成时间：2026-06-08。
- [~] F010 实现服务端权威购买/奖励接口。
  - 2026-06-08：已实现邮件奖励领取 `/api/mail/{mailId}/claim`，服务端防重复领取；购买和任务奖励待接入。
- [~] F011 实现好友列表和好友工厂快照。
  - 2026-06-08：已实现好友列表 `/api/friends`、访问 `/api/friends/{friendId}/visit`、赠礼 `/api/friends/{friendId}/gift`；好友工厂完整快照待补。
- [ ] F012 实现弹射互动结算。
- [ ] F013 接入 SignalR 在线事件。
- [~] F014 添加最小单元测试和 API 测试。
  - 2026-06-08：已新增 `FatCatGameServiceTests`，覆盖游客设备重复登录复用玩家；API 集成测试待补。
  - 2026-06-08：已新增 API 集成测试 `FatCatApiTests`，覆盖 bootstrap 和游客登录后邮件列表。
  - 2026-06-08：已新增 CORS 集成测试，验证 Cocos 预览 Origin `http://localhost:7456` 可访问 API。

## G. 客户端联网改造

- [x] G001 新增 `NetworkManager`。
  - 完成时间：2026-06-08。
  - 文件：`FATCATUI/assets/scripts/manager/NetworkManager.ts`
  - 备注：已建立离线优先网络状态、server mode、token 配置和 guest device id。
- [x] G002 新增 `ApiClient`。
  - 完成时间：2026-06-08。
  - 文件：`FATCATUI/assets/scripts/net/ApiClient.ts`、`FATCATUI/assets/scripts/net/ApiTypes.ts`
  - 备注：已预留 auth/bootstrap/save/mail/friends/settings HTTP 外壳和 DTO。
- [x] G003 新增 `SyncManager`。
  - 完成时间：2026-06-08。
  - 文件：`FATCATUI/assets/scripts/manager/SyncManager.ts`
  - 备注：已建立离线优先同步快照、featureState DTO 映射、保存同步方法和状态事件。
- [~] G004 客户端支持游客登录。
  - 2026-06-08：`SyncManager.tryGuestLogin()` 已预留 `/api/auth/guest` 调用，默认 `apiBaseUrl` 为空时保持离线。
  - 2026-06-08：`NetworkManager` 已保存服务端 `playerId`，登录后后续接口可携带玩家身份。
  - 2026-06-08：设置页已新增“连接服务器”按钮，联调可通过 `?api=http://localhost:5144` 指定 API 地址。
  - 2026-06-08：服务端已允许 Cocos 预览 Origin 跨域访问，本地预览页可直接调用 `http://localhost:5144`。
- [~] G005 本地存档上传/下载同步。
  - 2026-06-08：`SyncManager.syncSave()` 已预留 `/api/save/sync` 调用，默认离线不提交。
  - 2026-06-08：`ApiClient.syncSave()` 已按服务端要求携带 `playerId` query。
  - 2026-06-08：设置页已新增“同步存档”按钮和同步状态展示。
- [ ] G006 资源、商店、任务奖励切换为服务端确认。
- [~] G007 好友页面接入服务端。
  - 2026-06-08：客户端已新增 `featureState.friendVisits` 和 `featureState.friendGifts`，好友页按钮会写入本地时间戳，后续可替换为 `/api/friends` 调用。
  - 2026-06-08：服务端已实现 `/api/friends`、`/api/friends/{friendId}/visit`、`/api/friends/{friendId}/gift`。
  - 2026-06-08：客户端 `ApiClient` 和 `SyncManager` 已新增好友列表、访问、赠礼服务端调用方法。
- [ ] G008 发射猫咪接入服务端结算。
- [~] G009 离线模式和同步失败重试提示。
  - 2026-06-08：设置页新增 `sync` 开关并写入 `featureState.settings`，作为后续同步状态 UI 基础。
  - 2026-06-08：客户端 `SyncManager` 已新增 server settings 获取/推送方法，失败会回写同步失败状态。
  - 2026-06-08：设置页已展示服务器状态、同步状态、待同步变更数、playerId 和最近错误。

## H. 验证任务

- [x] H001 建立固定浏览器验证流程。
  - 完成时间：2026-06-08。
  - 文件：`docs/verification/CLIENT_CHECKS.md`
  - 备注：已记录猫咪入口、页签、左右切换、底部卡片和目标分辨率检查流程。
- [x] H002 建立 UI 截图对比目录。
  - 完成时间：2026-06-08。
  - 文件：`docs/verification/screenshots/`
  - 备注：已新增截图目录、占位文件和命名规范。
- [x] H003 建立客户端 TypeScript 检查命令记录。
  - 完成时间：2026-06-08。
  - 文件：`docs/verification/CLIENT_CHECKS.md`、`tools/check-client-ts.ps1`
  - 验证：运行 `.\tools\check-client-ts.ps1`，未发现 `BottomNavUI`、`GeneratedUiAssets`、`CatDetailPanel` 相关 TypeScript 诊断。
  - 2026-06-09：新增 `tools/capture-main-regression.js`，可用本机 Edge 对主界面目标分辨率截图回归。
- [x] H004 服务端建立 `dotnet build/test` 验证。
  - 完成时间：2026-06-08。
  - 验证：`dotnet build FATCATServer/FATCATServer.sln` 通过；`dotnet test FATCATServer/FATCATServer.sln --no-build` 通过。
- [~] H005 每个阶段完成后写阶段验收记录。
  - 2026-06-08：本轮已记录右侧功能面板阶段验收，验证 `check-client-ts`、浏览器脚本语法检查、预览端口和 Cocos asset-db 刷新。
  - 2026-06-08：本轮已记录右侧功能状态持久化阶段验收，验证 SaveData、SaveManager、BottomNavUI 无相关 TypeScript 诊断。
  - 2026-06-08：本轮已记录 Cocos 预览跨域联调阶段验收，验证服务端 build/test、真实 HTTP 冒烟、客户端 TS 检查和浏览器脚本语法检查。
  - 2026-06-08：本轮已记录 390x844 画面审查验收，验证主界面、设置页连接服务器、猫咪页均无控制台错误。
  - 2026-06-09：本轮已记录 414x896、430x932、360x800、768x1024 主界面截图回归；截图保存在 `docs/verification/screenshots/2026-06-09-main-regression/`。

## 素材生成记录

当前未在本任务中新生成素材。

历史已知：

- `FATCATUI/assets/scripts/ui/GeneratedUiAssets.ts` 已包含 Data URI 内嵌视觉素材。

后续每次生成素材按此模板追加：

```text
### YYYY-MM-DD 素材名

- Task：Exxx
- 用途：
- Prompt 摘要：
- 输出文件：
- 接入位置：
- 验证结果：
```

## 本次更新记录

### 2026-06-08 右侧功能面板本地 MVP
- 完成/推进 B013、D006、H005，并补齐右侧入口跳转、成就页、邮件页、好友页、设置页、响应式面板共 6 个 task 点。
- `BottomNavUI.ts` 新增 `achievements`、`mail`、`friends`、`settings` 四个主面板 ID，右侧按钮不再只弹提示。
- 成就页展示长期任务进度、可领取数量、猫咪收集与钻石库存。
- 邮件页提供系统邮件、每日补给、服务器同步预告，并支持本地领取奖励反馈；本轮会话内已防重复领取。
- 好友页提供好友工厂快照、访问和赠礼按钮，为后续服务端好友接口预留交互形态。
- 设置页展示账号、本地存档、服务器模式、音效等状态，作为后续联网设置页基础。
- 验证：`.\tools\check-client-ts.ps1` 通过；`node --check tools\verify-ui-clicks.browser.js` 通过；`http://localhost:7456/` 返回 200；已刷新 Cocos asset-db。

### 2026-06-08 右侧功能状态持久化
- 完成/推进 B013、D006、G007、G009、H005，并补齐 featureState 存档、邮件持久化领取、设置持久化开关、好友访问记录、好友赠礼记录、旧存档兼容共 6 个 task 点。
- `SaveData.ts` 新增 `FeatureSaveData`，包含 `claimedMails`、`settings`、`friendGifts`、`friendVisits`。
- `SaveManager.ts` 会为旧存档自动补齐 `featureState` 默认值，不提升 `SAVE_VERSION`，避免已有本地存档失效。
- `BottomNavUI.ts` 邮件领取会写入 `featureState.claimedMails`；设置开关会写入 `featureState.settings`；好友访问/赠礼会写入时间戳。
- 好友页现在能展示“已访问/已送礼”的本地状态；设置页现在根据存档显示开关状态。
- 验证：`.\tools\check-client-ts.ps1` 通过；`npx tsc ... | Select-String "SaveData|SaveManager|BottomNavUI"` 无诊断输出；`node --check tools\verify-ui-clicks.browser.js` 通过；已刷新 Cocos asset-db。

### 2026-06-08 客户端联网骨架
- 完成 G001、G002、G003，并推进 G004、G005、G007、G009，共 7 个 task 点。
- 新增 `ApiTypes.ts`，定义 Auth、SaveSync、Mail、Friend、Settings、Bootstrap DTO。
- 新增 `ApiClient.ts`，预留 `/api/auth/guest`、`/api/config/bootstrap`、`/api/save/sync`、`/api/mail`、`/api/friends`、`/api/settings`。
- 新增 `NetworkManager.ts`，管理离线优先网络状态、server mode、token 和 guest device id。
- 新增 `SyncManager.ts`，管理同步快照、guest login、save sync、featureState DTO 映射和同步事件。
- `GameApp.ts` 启动时初始化 `NetworkManager` 与 `SyncManager`；`GameConfig.ts` 新增 `apiBaseUrl`，默认空字符串，当前游戏保持离线。
- `EventBus.ts` 新增 `NETWORK_STATUS_CHANGED` 和 `SYNC_STATUS_CHANGED`。
- 验证：`.\tools\check-client-ts.ps1` 通过；`npx tsc ... | Select-String "ApiClient|ApiTypes|NetworkManager|SyncManager|GameApp|EventBus|GameConfig"` 无诊断输出；`node --check tools\verify-ui-clicks.browser.js` 通过；已刷新 Cocos asset-db。

### 2026-06-08 服务端首批工程与 API
- 完成 F001、F002、F003、F004、F007、F008、F009、H004，并推进 F005、F006、F014，共 11 个 task 点。
- 新增 `FATCATServer` solution，包含 `FatCat.Api`、`FatCat.Application`、`FatCat.Domain`、`FatCat.Infrastructure`、`FatCat.Tests`。
- `FatCat.Domain` 已新增 `PlayerProfile`、`PlayerSaveSnapshot`。
- `FatCat.Application` 已新增 API envelope、Auth/Config/Save contracts、repository interface、`FatCatGameService`。
- `FatCat.Infrastructure` 已接入 EF Core SQLite，新增 `FatCatDbContext`、`EfFatCatRepository`、DI 扩展。
- `FatCat.Api` 已实现 `/health`、`/api/auth/guest`、`/api/player/me`、`/api/config/version`、`/api/config/bootstrap`、`/api/save`、`/api/save/sync`。
- `FatCat.Tests` 已新增游客登录复用玩家的单元测试。
- 验证：`dotnet build FATCATServer/FATCATServer.sln` 通过；`dotnet test FATCATServer/FATCATServer.sln --no-build` 通过，1 个测试成功。

### 2026-06-08 服务端 Mail/Friend/Settings API
- 完成/推进 F005、F010、F011、F014、G007、H004，并补齐 Mail 表/API、Friend 表/API、Settings 表/API、服务层测试、API 集成测试、HTTP 调试请求、SQLite 集成测试配置共 7 个 task 点。
- `FatCat.Domain` 新增 `PlayerMail`、`FriendSnapshot`、`PlayerSettings`。
- `FatCat.Application` 新增 `MailDto`、`FriendDto`、`SettingsDto`、`ClaimMailResponse`，并扩展 `FatCatGameService`。
- `FatCat.Infrastructure` 新增邮件、好友、设置 DbSet 与仓储方法。
- `FatCat.Api` 新增 `/api/mail`、`/api/mail/{mailId}/claim`、`/api/friends`、`/api/friends/{friendId}/visit`、`/api/friends/{friendId}/gift`、`/api/settings`。
- `FatCat.Tests` 新增邮件防重复领取、好友访问/赠礼、设置读写、bootstrap 和游客登录邮件列表集成测试。
- 验证：`dotnet build FATCATServer/FATCATServer.sln` 通过；`dotnet test FATCATServer/FATCATServer.sln --no-build` 通过，5 个测试成功。

### 2026-06-08 客户端对齐服务端 Mail/Friend/Settings
- 完成/推进 G004、G005、G007、G009、H003、H004，并补齐 playerId 状态、save sync query、mail 获取/领取、friend 获取/访问/赠礼、settings 获取/推送、Cocos asset-db 刷新共 6 个 task 点。
- `ApiTypes.ts` 新增 `ClaimMailResponse`，并对齐服务端 `MailDto` 奖励字段。
- `ApiClient.ts` 所有 save/mail/friend/settings 方法已携带 `playerId` query，新增 friend visit/gift、settings get/update。
- `NetworkManager.ts` 新增服务端 `playerId` 保存和广播。
- `SyncManager.ts` 登录后保存 `playerId`，新增 `fetchServerMail`、`claimServerMail`、`fetchServerFriends`、`visitServerFriend`、`sendServerFriendGift`、`fetchServerSettings`、`pushServerSettings`。
- 验证：客户端 TS 联网层过滤无诊断输出；`.\tools\check-client-ts.ps1` 通过；`node --check tools\verify-ui-clicks.browser.js` 通过；`dotnet test FATCATServer/FATCATServer.sln --no-build` 通过，5 个测试成功；已刷新 Cocos asset-db。

### 2026-06-08 本地 API 联调入口与设置页同步状态
- 完成/推进 G004、G005、G009、H003、H004、H005，共 6 个 task 点。
- `NetworkManager.ts` 支持通过 URL 参数 `?api=http://localhost:5144` 或 localStorage `fatcat_api_base_url` 覆盖 API 地址。
- `BottomNavUI.ts` 设置页已展示服务器状态、同步状态、待同步数量、playerId、最近错误。
- 设置页新增“连接服务器”“同步存档”“推送设置”按钮，对应 `SyncManager.tryGuestLogin()`、`syncSave()`、`pushServerSettings()`。
- 本地 `FatCat.Api` 已启动并完成真实 HTTP 冒烟：`/health`、`/api/auth/guest`、`/api/mail`、`/api/mail/welcome/claim`、`/api/friends`、`/api/settings` 均可用。
- 验证：客户端 TS 过滤无诊断输出；`.\tools\check-client-ts.ps1` 通过；`node --check tools\verify-ui-clicks.browser.js` 通过；服务端冒烟返回 playerId、2 封邮件、3 个好友、4 个设置键；已刷新 Cocos asset-db。

### 2026-06-08 Cocos 预览跨域联调
- 完成/推进 F014、G004、G005、G009、H004、H005，共 6 个 task 点。
- `FatCat.Api` 新增 `FatCatCors` 策略，默认允许 `http://localhost:7456` 和 `http://127.0.0.1:7456`。
- `appsettings.json` 新增 `Cors:AllowedOrigins`，后续可以按预览端口扩展白名单。
- `FatCatApiTests` 新增 CORS 集成测试，验证 bootstrap 响应包含 `Access-Control-Allow-Origin`。
- 新增 `tools/check-server-api.ps1`，一键检查 health、CORS、guest auth、mail、friends、settings 本地 API 链路。
- 验证：`dotnet build FATCATServer/FATCATServer.sln` 通过；`dotnet test FATCATServer/FATCATServer.sln --no-build` 通过，6 个测试成功；`.\tools\check-server-api.ps1` 返回 2 封邮件、3 个好友、`music/push/sfx/sync` 设置键；`.\tools\check-client-ts.ps1` 通过；`node --check tools/verify-ui-clicks.browser.js` 通过。

### 2026-06-08 当前画面审查与窄屏修复
- 完成/推进 B014、B015、G004、G009、H003、H005，共 6 个 task 点。
- 使用浏览器 390x844 复查 `http://localhost:7456/?api=http://localhost:5144` 主界面、设置页和猫咪页，控制台无 error/warn。
- 设置页点击“连接服务器”后可显示“服务器 在线 / 同步 已连接”，确认今天 CORS/API 联调已落实到实际界面。
- 修复 `BottomNavUI.ts`：窄屏 HUD 资源条进一步压缩，设置面板增加底部安全留白，服务器初始状态从“离线”改为更准确的“待连接”。
- 验证：`.\tools\check-client-ts.ps1` 通过；`node --check tools/verify-ui-clicks.browser.js` 通过；已刷新 Cocos asset-db；390x844 复拍主界面、设置页、猫咪页无控制台错误。

### 2026-06-09 主界面截图回归与工厂/HUD 推进
- 完成/推进 B001、B002、B014、B015、H003、H005，共 6 个 task 点。
- 新增 `tools/capture-main-regression.js`，使用本机 Edge 截取 414x896、430x932、360x800、768x1024 主界面截图。
- 截图输出：`docs/verification/screenshots/2026-06-09-main-regression/main-414x896-edge.png`、`main-430x932-edge.png`、`main-360x800-edge.png`、`main-768x1024-edge.png`。
- `BottomNavUI.ts` 主工厂楼层新增 CSS 室内装饰层：灯光、黑板、货架、麻袋、窗格、桌台、管线、仪表和蒸汽。
- 顶部 HUD 资源条增强胶囊高光、分隔线、加号按钮压印和窄屏数值稳定性。
- 修复主工厂 DOM 对 `assets/resources/...` 静态图片路径的依赖，截图回归已无 404/failed request。
- 验证：`.\tools\check-client-ts.ps1` 通过；`node --check tools/verify-ui-clicks.browser.js` 通过；`node --check tools/capture-main-regression.js` 通过；`node tools/capture-main-regression.js` 四档截图均成功，关键 DOM 均存在且无 console error。

### 2026-06-08 素材生成与资源路径接入

- 完成 B002、B007、C006、E002、E003、E004、E005、E007，共 8 个 task。
- 使用 Codex 图片生成猫咪统一风格参考图，并保存到项目资源目录。
- 使用本地脚本生成工厂道具、商品/背包图标、功能图标，共 11 个 PNG。
- 新增 `UiAssetRegistry.ts`，让本轮生成素材通过资源路径接入 UI。
- 主工厂背景、猫咪详情背景、猫咪总览头像已从 Data URI 迁移到项目资源路径。
- 验证：`tools/check-client-ts.ps1` 通过；已刷新 Cocos asset-db。

### 2026-06-08 猫咪页单猫大立绘与装备/技能图标推进

- 完成 E008、E009、E010，并推进 B003、B008、D002，共 6 个 task。
- 扩展 `tools/generate-ui-assets.ps1`，生成 5 张单猫大立绘、4 个装备图标、4 个技能图标。
- 扩展 `UiAssetRegistry.ts`，新增 `GeneratedCatFullArtAssets`、`GeneratedSkillIconAssets` 和装备图标路径。
- 猫咪总览中央角色区已使用单猫大立绘；装备栏已使用 PNG 装备图标；信息/技能/升级/装备/皮肤焦点卡已加入图标化展示。
- 验证：`tools/check-client-ts.ps1` 通过；已刷新 Cocos asset-db。

### 2026-06-08 猫咪页与验证基础设施推进

- 完成 B005、C007、E001、E006、H001、H002、H003，共 7 个 task。
- 猫咪总览中央展示区补充更大的猫咪展示、对白、左右切换、稀有度/职业/岗位信息条。
- 新增生成素材目录、素材记录表、截图目录、客户端检查命令和浏览器点击验证脚本。
- 验证：`tools/check-client-ts.ps1` 通过；已刷新 Cocos asset-db。

### 2026-06-08 计划体系建立

- 完成 A001-A005。
- 新增当前文件作为后续 AI 开发的任务状态源。
# 2026-06-09 主界面侧边/收益/底部控件推进记录

- 完成/推进 task：B001、B014、B015、H003、H005，并继续推进 B002，共 6 个 task 点。
- B001：主工厂页继续向 `主页面.png` 靠拢，补强左侧管线/电梯猫咪窗、右侧楼层收益牌图标化、底部订单/宝箱/发射/礼包区域。
- B014：统一主界面局部按钮和信息牌质感，收益牌新增楼层类型图标，底部礼包和订单控件更接近目标 UI 的卡片结构。
- B015：针对 414x896、430x932、360x800、768x1024 重新跑截图回归，并修复底部功能区被导航条遮挡的问题。
- H003/H005：`check-client-ts`、两个浏览器脚本语法检查、Cocos asset-db 刷新、四尺寸截图回归均已执行；截图仍输出到 `docs/verification/screenshots/2026-06-09-main-regression/`。
- 下一步：继续提高楼层室内丰富度，重点补猫咪动作、灯光层次、楼层机器差异和顶部 HUD 图标精致度。
# 2026-06-10 主界面室内丰富度与 HUD 图标精修记录

- 完成/推进 task：B001、B002、B014、B015、H003、H005，共 6 个 task 点。
- B001/B002：主工厂楼层新增吊灯、便签、咖啡豆轨道、传送带、植物、时钟等 CSS 室内元素，并让不同楼层使用不同组合。
- B001：楼层猫咪增加大小、颜色和尾巴差异，室内画面比上一轮更接近目标 UI 的“每层都有生活/生产细节”。
- B014：顶部 HUD 头像、金币、咖啡豆、猫粮、钻石和加号按钮增加高光、内阴影和切面细节，钻石显示更接近目标稿的紫色宝石。
- B015/H003/H005：重新跑 414x896、430x932、360x800、768x1024 截图回归，均无 console error、无 failed request；关键 DOM 节点计数正常。
- 下一步：继续将 CSS 占位机器/猫咪逐步替换成生成图片素材，或推进猫咪页面/建筑页面的目标 UI 对齐。

# 2026-06-10 主界面机器层与响应式修复记录

- 完成/推进 task：B001、B002、B014、B015、D002、H003、H005，共 7 个 task 点。
- B001/B002：扩展 `tools/generate-ui-assets.ps1`，新增 office、mill、cafe 三类工厂局部机器/家具 PNG 生成能力，并补齐 `prop_office.png`、`prop_mill.png`、`prop_cafe.png`。
- D002：更新 `UiAssetRegistry.ts` 的工厂素材映射，为后续 Cocos 原生资源加载保留正确路径；本轮验证发现 DOM 直链 `assets/resources/...` 在 Cocos preview 中会 404，已撤回直接 background-image 接入。
- B001/B014：在 `BottomNavUI.ts` 中改用无网络请求的 CSS 场景化机器贴片，按 office/roast/tank/mill/cafe/storage 展示不同道具，并调整 KPI、猫点、机器层级，减少互相遮挡。
- B015：新增宽屏与窄屏响应式修正，768x1024 下主楼整体下移并收窄 HUD；360x800 下礼包卡、机器层、底部控件进一步防挤压。
- H003/H005：执行 `check-client-ts`、浏览器脚本语法检查、Cocos asset-db 刷新和四尺寸截图回归；最终 414x896、430x932、360x800、768x1024 均无 console error、无 failed request。
- 下一步：继续将 CSS 机器与猫动作逐步替换为 Cocos 可加载的 Sprite/资源管线，或转向猫咪/建筑/商店页面继续按目标 UI 对齐。

# 2026-06-10 工厂 PNG Data URI 接入记录

- 完成/推进 task：B001、B002、B014、B015、D002、D004、H003、H005，共 8 个 task 点。
- B001/B002：主界面楼层现在重新显示真实生成 PNG 机器层，不再只依赖 CSS 占位；CSS 机器贴片保留为叠加细节和兜底。
- D002/D004：新增 `FactoryPropDataUris.ts`，由 `tools/generate-factory-prop-data-uris.ps1` 自动从工厂 PNG 生成小型 Data URI 注册表，规避 Cocos preview 对 `assets/resources/...` DOM 直链的 404。
- D004：`tools/generate-ui-assets.ps1` 已串联调用 Data URI 注册脚本，后续重新生成素材时会同步更新 DOM 可用注册表。
- B014：调整工厂 PNG 素材底部黑色基座为柔和椭圆投影，避免楼层里出现过重黑条。
- B015/H003/H005：重新跑 414x896、430x932、360x800、768x1024 截图回归，均无 console error、无 failed request；额外检查 `BottomNavUI|FactoryPropDataUris|UiAssetRegistry` 相关 TypeScript 诊断无输出。
- 下一步：继续将猫动作、楼层局部光效和页面切换动效向目标 UI 推进；长期仍建议把 Data URI 桥接层迁移为 Cocos SpriteFrame 资源管线。
# 2026-06-10 DOM 图片资源 Data URI 桥接与点击回归

- 本轮完成/推进 task：B001、B002、B003、B014、B015、D004、H003、H005，共 8 个 task 点。
- D004：新增 `tools/generate-dom-asset-data-uris.ps1`，把猫咪页、商店、背包、功能入口所需的小型生成图统一转换为 `DomAssetDataUris.ts`，避免 DOM 直接请求 `assets/resources/...`。
- D004：`tools/generate-ui-assets.ps1` 已串联生成 `FactoryPropDataUris.ts` 与 `DomAssetDataUris.ts`，后续重跑素材脚本会同步刷新 DOM 可用资源表。
- B003/B014：`BottomNavUI.ts` 的猫咪详情页背景、猫咪立绘、缩略图、装备图标、技能图标、商店/背包图标、右侧功能按钮图标全部改走 Data URI 映射。
- B003：猫咪故事照片从超大的 `cat_lineup_reference_20260608.png` 改为当前猫咪立绘，减少 DOM 内嵌体积并消除预览 404。
- H003：新增并执行 `tools/verify-ui-clicks-playwright.js`，真实点击覆盖猫咪按钮、猫咪页侧栏、左右切猫、关闭、底部建筑/商店/背包/研究/工厂导航。
- H005：刷新 Cocos asset-db 后，点击回归结果为 `ok=true`，所有点击步骤成功，`messages=[]`，`failedRequests=[]`。
- B015：再次执行 414x896、430x932、360x800、768x1024 主界面截图回归，四个尺寸均无 console error、无 failed request，关键 DOM 节点存在。
- 下一步：继续向目标 UI 推进时，优先补猫咪页的面板细节、按钮质感和移动端滚动体验；如果继续做主界面，则增加楼层内猫咪动作和更接近目标图的灯光/道具层。
# 2026-06-10 猫咪详情页视觉推进与截图回归

- 本轮完成/推进 task：B003、B008、B014、B015、H003、H005，共 6 个 task 点。
- B003：猫咪详情页继续向 `所有猫咪页面.png` 对齐，增强左侧标签栏底板、激活态高光、按钮按压反馈和整体皮革质感。
- B008/B014：中心猫咪展示区新增舞台阴影、角色层级和卡片高光；心情/喂食卡改为深色状态牌，更接近目标 UI 右侧状态卡。
- B014：属性卡、体重阶段、技能/装备焦点卡增加内层纸卡、标题胶囊、图标卡底和装备卡投影，减少平铺感。
- B015：修复猫咪页默认提示条遮挡内容的问题；默认不再显示底部 toast，仅在交互反馈时显示，避免小屏压住信息卡和操作按钮。
- H003：新增 `tools/capture-cat-regression.js`，自动打开猫咪页并覆盖 414x896、430x932、360x800、768x1024 四个尺寸截图。
- H005：验证通过：`check-client-ts`、`verify-ui-clicks-playwright.js`、`capture-cat-regression.js`、`capture-main-regression.js` 均通过，点击无失败、资源无 404、四尺寸截图无 console error。
- 下一步：继续猫咪详情页的文字编码/文案清理、底部队列更接近目标图的稀有度卡片、以及装备/技能区域的可交互详情。
# 2026-06-10 猫咪页文案回归与底部队列修正

- 本轮完成/推进 task：B003、B014、B015、H003、H005、H006，共 6 个 task 点。
- B003/H006：新增 `tools/check-cat-text-regression.js`，打开猫咪页后检查关键中文文案存在，并扫描常见乱码片段，防止历史编码问题回归。
- B003：确认猫咪页核心文案已正常显示，包括猫咪图鉴、信息/升级/技能/装备/皮肤、生产力、体重阶段、猫咪故事、猫咪队伍。
- B015：猫咪页弹层高度/顶部比例微调，保留顶部 HUD，同时更接近目标 UI 的全屏详情页形态。
- B015：猫咪页打开时隐藏 Cocos 原生底部导航按钮，避免目标详情页底部露出主界面导航。
- B014/B015：底部猫咪队列加高并上移操作按钮，遮住后方内容，避免装备文字透出；414x896 截图已确认底部更干净。
- H005：验证通过：`check-cat-text-regression.js`、`verify-ui-clicks-playwright.js`、`capture-cat-regression.js`、`capture-main-regression.js` 均通过，无 console error、无 failed request。
- 下一步：继续优化底部猫咪队列的卡牌细节和技能/装备卡交互；也可以开始清理其他页面的历史乱码文案。
# 2026-06-12 猫咪页技能/装备交互与队列卡片推进

- 本轮完成/推进 task：B003、B008、B014、B015、H003、H005，共 6 个 task 点。
- B003/B008：猫咪页焦点卡新增可点击入口，包括“技能详情”“成长预览”“更换项圈”“装备背包”“查看照片”“皮肤加成”，先做本地反馈，为后续正式技能/装备系统预留交互形态。
- B014：技能/装备焦点卡新增 `focus-actions`、`mini-action` 样式，按钮更接近目标 UI 的圆角胶囊操作区。
- B014：底部猫咪队列卡片增强稀有度表现和职业圆点，S/SS 与 A 级卡片有不同色彩提示，工作状态更清晰。
- B015：修复新增装备按钮在 414x896 小屏被底部操作条遮挡的问题；通过提高猫咪页内容层级保证按钮可点击。
- H003：扩展 `tools/verify-ui-clicks-playwright.js`，新增 `cat-skill-details`、`cat-equip-action`、`cat-story-action` 三个真实点击步骤。
- H005：验证通过：`check-client-ts`、`check-cat-text-regression.js`、`verify-ui-clicks-playwright.js`、`capture-cat-regression.js`、`capture-main-regression.js` 均通过，无 console error、无 failed request。
- 下一步：继续把装备区做成真正的替换/升级列表，或开始推进建筑页/商店页与目标 UI 对齐。
# 2026-06-12 猫咪页装备背包面板推进

- 本轮完成/推进 task：B003、B008、B014、B015、H003、H005，共 6 个 task 点。
- B003/B008：猫咪页装备区从静态装备卡推进为“装备槽位 + 装备背包候选”面板，项圈/杯子/坐垫可点击选择并给出本地反馈。
- B014：新增装备槽位选中态、装备背包候选卡、可替换状态、锁定饰品槽，视觉更接近目标 UI 的装备卡片区。
- B015：装备面板增加紧凑屏适配；宽屏隐藏背包候选区，手机屏保留紧凑卡片，避免与底部猫咪队列严重冲突。
- H003：`capture-cat-regression.js` 的装备卡计数从旧 `.equip-row span` 更新为 `.equip-slot`，匹配新的按钮结构。
- H005：验证通过：`check-client-ts`、`check-cat-text-regression.js`、`verify-ui-clicks-playwright.js`、`capture-cat-regression.js`、`capture-main-regression.js` 均通过，无 console error、无 failed request。
- 下一步：给装备背包接入真实 inventory/save 数据，或继续推进建筑页/商店页目标 UI。
# 2026-06-12 猫咪装备存档管线推进

- 本轮完成/推进 task：B003、B008、G001、G003、H003、H005，共 6 个 task 点。
- G001：`CatSaveData` 新增 `equipment?: Record<string,string>` 字段，允许每只猫保存装备槽位。
- G003：`SaveManager` 对旧存档和初始存档补齐 `equipment` 兼容逻辑，不提升 `SAVE_VERSION`，避免已有本地存档失效。
- B008/G003：`CatManager` 新增默认装备、`getEquipment()` 和 `equipItem()`，装备选择现在会写入猫咪存档。
- B003/B008：猫咪页装备区读取真实装备 ID 渲染当前装备名、等级和加成；装备背包候选点击后会装备到当前槽位并显示反馈。
- H003：`verify-ui-clicks-playwright.js` 新增 `cat-equip-save` 步骤，验证装备候选点击后出现“已装备到”反馈。
- H005：验证通过：`check-client-ts`、`check-cat-text-regression.js`、`verify-ui-clicks-playwright.js`、`capture-cat-regression.js`、`capture-main-regression.js` 均通过，无 console error、无 failed request。
- 下一步：将内置装备定义迁移为 JSON 配置，或者让装备背包读取真实 `InventoryManager` 数量。
# 2026-06-12 装备配置 JSON 化

- 本轮完成/推进 task：B003、B008、D002、G001、H003、H005，共 6 个 task 点。
- D002/G001：新增 `FATCATUI/assets/resources/configs/equipment.json`，将项圈、杯子、坐垫装备定义从 UI 硬编码迁移到配置文件。
- G001：`ItemModel.ts` 新增 `EquipmentConfig`，包含 `id/slot/kind/name/rarity/bonus/description/isDefault`。
- G001：`ConfigManager.ts` 新增加载 `configs/equipment`，并提供 `ConfigManager.equipment` 访问入口。
- B008/G001：`CatManager.ts` 改为从配置读取默认装备、槽位候选和装备定义；`equipItem()` 会校验装备 ID 是否存在且槽位匹配。
- B003：`BottomNavUI.ts` 删除本地装备定义，装备面板改读 `CatManager.getEquipmentBySlot()` 和 `getEquipmentConfig()`。
- H003：`tools/check-client-ts.ps1` 扩展检查范围，覆盖 `CatManager/SaveManager/ConfigManager/SaveData/ItemModel`，避免数据管线类型错误被过滤掉。
- H005：验证通过：装备 JSON 语法、`check-client-ts`、猫咪页文案/点击/截图回归、主界面截图回归均通过。
- 下一步：让装备背包按 `InventoryManager` 持有数量显示；或者为装备 JSON 增加等级/强化消耗字段。

# 2026-06-12 装备背包接入 Inventory 持有数量

- 本轮完成/推进 task：B003、B008、G001、G003、H003、H005，共 6 个 task 点。
- G001：`InventoryManager.ts` 新增 `getItemCount()` 与 `hasItem()`，供装备、商店、奖励等后续系统统一查询背包数量。
- G003：`initialSave.json` 为 6 个装备配置补齐初始库存，保证新存档打开猫咪页时装备背包有真实可读数量。
- B008/G003：`CatManager.equipItem()` 新增持有数量校验；已装备项允许重复确认，未持有且非当前装备的候选不会写入猫咪存档。
- B003/B014：`BottomNavUI.ts` 装备背包候选现在显示 `已装备`、`持有 xN` 或 `未持有`，未持有卡片置灰并禁用点击。
- H003：`tools/check-cat-text-regression.js` 同步更新新文案守卫，去掉旧的 `可替换` 要求，新增 `持有 x` 检查。
- H005：Cocos asset-db 已刷新 `initialSave.json`、`InventoryManager.ts`、`CatManager.ts`、`BottomNavUI.ts`；验证通过 `check-client-ts`、`check-cat-text-regression.js`、`verify-ui-clicks-playwright.js`、`capture-cat-regression.js`、`capture-main-regression.js`。
- 截图回归：414x896、430x932、360x800、768x1024 的猫咪页与主界面均通过，无 console error、无 failed request。
- 下一步：为装备增加等级/强化消耗/来源字段，并把装备背包从“全量候选”升级为“按库存和来源筛选”的正式列表；也可以继续推进建筑页或商店页目标 UI。

# 2026-06-12 装备升级预览与来源字段

- 本轮完成/推进 task：B003、B008、D002、G001、H003、H005，共 6 个 task 点。
- D002/G001：`equipment.json` 为 6 个装备新增 `levelMax`、`upgradeCost`、`source` 字段，装备配置开始承载成长和来源信息。
- G001：`EquipmentConfig` 类型同步新增 `levelMax?: number`、`upgradeCost?: number`、`source?: string`。
- B003/B014：猫咪页装备槽显示稀有度和 `Lv.当前/上限`；装备背包候选显示来源信息，视觉上更接近目标 UI 的装备详情卡。
- B008：装备区新增 `升级预览` 按钮，本轮先做本地反馈，不直接扣资源，为后续正式强化消耗留接口。
- H003：`verify-ui-clicks-playwright.js` 新增 `cat-equip-upgrade-preview` 点击步骤；`check-cat-text-regression.js` 新增 `升级预览`、`新手任务` 文案守卫。
- H005：已刷新 Cocos asset-db；验证通过装备 JSON parse、`check-client-ts`、文案回归、点击回归、猫咪页四尺寸截图、主界面四尺寸截图。
- 额外截图：新增 `docs/verification/screenshots/2026-06-10-cat-regression/cat-equip-414x896-edge.png`，用于肉眼查看装备标签页小屏布局。
- 下一步：实现正式装备升级消耗与等级存档，或将同一套“来源/库存/升级预览”结构迁移到商店页和背包页。

# 2026-06-12 装备正式升级与等级存档

- 本轮完成/推进 task：B003、B008、G001、G003、H003、H005，共 6 个 task 点。
- G001/G003：`CatSaveData` 新增 `equipmentLevels?: Record<string, number>`；`SaveManager` 对旧存档和初始存档自动补齐装备等级表。
- B008/G003：`CatManager` 新增 `getEquipmentLevel()` 和 `upgradeEquipment()`，装备升级会按当前等级消耗金币并写入猫咪存档。
- B008：`equipItem()` 装备成功时会为新装备初始化等级，避免后续升级读不到等级。
- B003/B014：`BottomNavUI.ts` 装备槽等级从临时公式改为真实存档等级；`升级预览` 按钮升级为 `升级装备`，点击后返回成功、金币不足或等级上限反馈。
- H003：`verify-ui-clicks-playwright.js` 的升级步骤从 `cat-equip-upgrade-preview` 更新为 `cat-equip-upgrade`；文案守卫同步检查 `升级装备`。
- H005：Cocos asset-db 已刷新 `SaveData.ts`、`SaveManager.ts`、`CatManager.ts`、`BottomNavUI.ts`；验证通过 JSON parse、`check-client-ts`、文案回归、点击回归、猫咪页四尺寸截图、主界面四尺寸截图。
- 下一步：把装备升级消耗从纯金币扩展为金币+材料，并在 UI 上展示“当前属性/下级属性”对比；或把装备等级同步到未来 C# 服务端 DTO。

# 2026-06-12 装备升级状态条与按钮状态

- 本轮完成/推进 task：B003、B008、B014、B015、H003、H005，共 6 个 task 点。
- B008：`CatManager` 新增 `getEquipmentUpgradeState()`，统一返回当前等级、上限、下级、消耗、是否满级和是否金币足够。
- B003/B014：猫咪页装备区新增 `当前等级`、`下级预览`、`升级消耗` 三段状态条，升级规则不再只藏在点击反馈里。
- B014：`升级装备` 按钮现在会根据状态显示 `升级装备`、`金币不足` 或 `已满级`，并在不可升级时禁用。
- B015：新增紧凑样式，保证升级状态条在 360x800、414x896 等小屏不挤压装备背包和底部猫咪队列。
- H003：点击回归脚本兼容 disabled 升级按钮，若已经满级或金币不足则检查按钮文案，不再强点禁用按钮。
- H005：验证通过 `check-client-ts`、文案回归、点击回归、猫咪页四尺寸截图、主界面四尺寸截图；均无 console error、无 failed request。
- 下一步：给装备升级接入材料消耗和属性数值解析，或开始推进商店页/背包页展示装备来源与库存。

# 2026-06-12 装备结构化 effects 与加成预览

- 本轮完成/推进 task：B003、B008、D002、G001、H003、H005，共 6 个 task 点。
- D002/G001：`equipment.json` 为 6 个装备新增结构化 `effects`，包含 `type/label/baseValue/perLevel/unit`，后续不再依赖解析 `bonus` 文案。
- G001：`ItemModel.ts` 新增 `EquipmentEffect` 类型，`EquipmentConfig` 新增 `effects?: EquipmentEffect[]`。
- B008：`CatManager.getEquipmentUpgradeState()` 新增 `currentEffect` 和 `nextEffect`，由配置和等级计算当前/下级加成文本。
- B003/B014：猫咪页装备区新增 `当前加成` 与 `下级加成` 对比条，升级收益在点击前即可看到。
- H003：`check-cat-text-regression.js` 新增 `当前加成`、`下级加成` 守卫；点击回归保持覆盖装备升级。
- H005：验证通过 equipment effects 检查、`check-client-ts`、文案回归、点击回归、猫咪页四尺寸截图、主界面四尺寸截图。
- 下一步：把 `effects` 真正接入生产/心情/消耗公式，或继续补商店页/背包页中的装备来源和库存展示。

# 2026-06-12 materialOutput 接入生产公式

- 本轮完成/推进 task：B003、B008、G001、G003、H003、H005，共 6 个 task 点。
- G001/B008：`CatManager` 新增 `getEquipmentEffectTotal(catId, effectType)`，可按猫咪当前装备和等级汇总结构化 effects 数值。
- G003：`getCatProduction()` 已接入 `materialOutput`，装备原料产量加成会真实影响猫咪生产力和楼层总产出。
- B003/B014：猫咪页装备焦点卡的“当前装备加成”从旧硬编码估算改为读取真实装备 effects 汇总。
- H003：新增 `tools/check-equipment-production-effect.js`，清空本地存档后验证默认猫生产力为 13/秒，并确认 UI 显示 `原料产量 +15%`。
- H005：验证通过 `check-client-ts`、新增生产力守卫、文案回归、点击回归、猫咪页四尺寸截图、主界面四尺寸截图。
- 下一步：继续把 `mood`、`catFoodCost`、`wageCost` 接入心情/喂食/成本公式，或先推进商店页与背包页的装备来源联动。

# 2026-06-12 catFoodCost 接入喂食成本

- 本轮完成/推进 task：B003、B008、G001、G003、H003、H005，共 6 个 task 点。
- G001/B008：`CatManager` 新增 `getFeedCost()`，通过 `getEquipmentEffectTotal(catId, "catFoodCost")` 计算真实喂食猫粮成本。
- G003：`feedCat()` 从固定 10 猫粮改为使用 `getFeedCost()` 扣除资源，默认幸运杯 -5% 会让喂食成本降为 9。
- B003/B014：猫咪页喂食卡从固定 `10` 改为显示真实喂食成本，按钮可用状态也按真实成本判断。
- H003：新增 `tools/check-equipment-feed-cost-effect.js`，清空本地存档后验证喂食卡显示 9，并确认装备卡包含 `猫粮 -5%`。
- H005：验证通过 `check-client-ts`、喂食成本守卫、生产力守卫、文案回归、点击回归、猫咪页四尺寸截图、主界面四尺寸截图。
- 下一步：接入 `mood` 到心情上限显示/计算，或将 `wageCost` 接入工资成本与建筑结算。

# 2026-06-12 mood 接入心情显示

- 本轮完成/推进 task：B003、B008、G001、G003、H003、H005，共 6 个 task 点。
- G001/B008：`CatManager` 新增 `getMoodCap()` 和 `getMood()`，通过 `getEquipmentEffectTotal(catId, "mood")` 计算装备后的心情上限与当前心情。
- G003：默认舒适坐垫 `mood +10%` 已真实影响猫咪页心情显示，初始猫心情从 95% 提升为 105%。
- B003/B014：猫咪页心情卡从旧公式改为读取 `CatManager.getMood()`，装备焦点卡继续展示真实心情上限汇总。
- H003：新增 `tools/check-equipment-mood-effect.js`，清空本地存档后验证心情卡显示 105%，并确认装备效果包含 `心情上限 +10%`。
- H005：验证通过 `check-client-ts`、心情守卫、喂食成本守卫、生产力守卫、文案回归、点击回归、猫咪页四尺寸截图、主界面四尺寸截图。
- 下一步：接入 `wageCost` 到工资显示和成本公式，或推进商店页/背包页装备来源联动。

# 2026-06-12 wageCost 接入工资显示

- 本轮完成/推进 task：B003、B008、G001、G003、H003、H005，共 6 个 task 点。
- G001/B008：`CatManager` 新增 `getWageCost()`，通过 `getEquipmentEffectTotal(catId, "wageCost")` 计算装备后的猫咪工资成本。
- G003：猫咪页工资卡从 `baseSalary * level` 改为读取真实 `CatManager.getWageCost()`，午睡坐垫的 `wageCost -5%` 会让 20 级猫工资从 20/分钟降为 19/分钟。
- B003/B014：装备页切换坐垫并装备午睡坐垫后，装备详情会显示 `工资消耗 -5%` 与下级 `-6%`，工资卡同步刷新。
- H003：新增 `tools/check-equipment-wage-cost-effect.js`，通过真实 UI 点击路径升级猫咪、切换坐垫、装备午睡坐垫，并断言工资显示为 19/分钟。
- H005：已刷新 Cocos asset-db；验证通过 `check-client-ts`、工资/心情/喂食/生产四条装备效果守卫、文案回归、点击回归、猫咪页四尺寸截图、主界面四尺寸截图；截图肉眼审查未发现本轮新增遮挡。
- 下一步：把工资成本继续接入建筑/订单净收益结算，或推进商店页/背包页的装备来源入口与购买联动。

# 2026-06-12 wageCost 接入建筑净收益

- 本轮完成/推进 task：B003、B014、B015、G001、G003、H003、H005，共 7 个 task 点。
- G001/G003：`CatManager` 新增 `getBuildingWageCost()`，按楼层汇总已派驻猫咪的真实工资。
- G003：`ProductionManager.calculateSnapshot()` 新增 `grossCoinPerSecond`、`wageCostPerSecond`、`buildingGrossCoinPerSecond`、`buildingWageCostPerSecond`；`coinPerSecond` 现在表示扣工资后的净金币收益，发射/离线结算沿用该净收益。
- B003/B014：建筑管理面板从 3 张运营卡扩展为 4 张，展示 `净金币`、`工资成本`、`咖啡豆消耗`、`值班猫咪`；结算说明补充毛收益、工资、净收益。
- B015：建筑面板 dashboard 桌面四列、小屏两列，414x896 下不会压坏底部导航；楼层小卡显示对应楼层净收益。
- H003：新增 `tools/check-production-wage-net-effect.js`，验证建筑页四卡、工资成本文案和毛/净收益结算文案。
- H005：已刷新 Cocos asset-db；验证通过 `check-client-ts`、建筑净收益守卫、工资/心情/喂食/生产装备效果守卫、文案回归、点击回归、主界面与猫咪页四尺寸截图；新增建筑页截图 `docs/verification/screenshots/2026-06-09-main-regression/building-wage-414x896-edge.png`。
- 下一步：继续把净收益规则同步到未来 C# 服务端 DTO/结算接口，或推进商店/背包装备来源和购买联动。

# 2026-06-13 服务端 production preview 契约

- 本轮完成/推进 task：F008、F009、F011、G001、G004、H003、H004、H005，共 8 个 task 点。
- F008/F011：`FatCat.Api` 新增 `/api/production/preview`，返回毛收益、工资成本、净金币、咖啡豆消耗以及楼层分项。
- F009/G004：`FatCat.Application` 新增 `ProductionPreviewRequest/Response` 和 `ProductionBuildingPreviewDto`，并在 `FatCatGameService.PreviewProduction()` 中统一做非负归一与净收益计算。
- F008：`/api/config/bootstrap` 的 `serverFeatures` 新增 `production-preview`，配置版本更新到 `fatcat-config-2026-06-13`。
- G001：客户端 `ApiTypes.ts` 和 `ApiClient.ts` 已对齐 `ProductionPreviewRequest/Response`，新增 `ApiClient.previewProduction()`，后续可从 Cocos 端直接请求服务端结算预览。
- H003/H004：新增服务端单元/API 测试，验证 `213 - 0.25 = 212.75` 的总净收益与楼层净收益；`tools/check-server-api.ps1` 也已纳入 production preview smoke。
- H005：验证通过 `dotnet test FATCATServer/FATCATServer.sln`、真实 HTTP smoke、`check-client-ts`、建筑净收益守卫、点击回归、主界面四尺寸截图、猫咪页四尺寸截图。
- 下一步：把客户端 `ProductionManager.calculateSnapshot()` 的实际快照提交到 `ApiClient.previewProduction()` 做联调开关，或继续推进商店/背包装备来源购买闭环。

# 2026-06-13 客户端结算预览联调入口

- 本轮完成/推进 task：B014、F011、G001、G004、G005、H003、H004、H005，共 8 个 task 点。
- G004/G005：`SyncManager.previewProduction()` 新增，会读取 `ProductionManager.calculateSnapshot()` 的实际毛收益、工资成本、咖啡豆消耗和楼层分项，并提交给 `ApiClient.previewProduction()`。
- B014：设置页账号状态卡新增 `结算预览` 按钮；离线时提示“请先连接服务器”，在线时展示服务端返回的净收益与工资成本。
- G001：联网预览不要求存档同步成功，只要求配置 API；连接服务器后可独立调用生产预览，便于后续发射结算前校验。
- H003：新增 `tools/check-settings-production-preview-button.js`，覆盖离线按钮存在与失败提示；新增 `tools/check-settings-production-preview-online.js`，临时启动 API 并验证真实 UI 显示“服务端结算预览”。
- H004/H005：已刷新 Cocos asset-db；验证通过 `check-client-ts`、`dotnet test`、真实联网预览、建筑净收益守卫、点击回归、主界面四尺寸截图、猫咪页四尺寸截图。
- 下一步：把 `previewProduction()` 的服务端结果接入发射按钮或离线收益结算前校验，开始从“预览”推进到“服务器权威结算”。
