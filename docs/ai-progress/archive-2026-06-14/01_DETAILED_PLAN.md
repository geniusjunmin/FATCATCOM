# 肥猫咖啡公司 详细推进计划书

更新时间：2026-06-08

## 1. 读取顺序

后续 AI 开发前按顺序读取：

1. `docs/ai-progress/00_PROJECT_DIRECTION.md`
2. `docs/ai-progress/01_DETAILED_PLAN.md`
3. `docs/ai-progress/02_TASKS.md`
4. `docs/ai-progress/03_UPDATE_RULES.md`
5. `docs/ai-progress/04_ASSET_LOG.md`
6. `AI_WORK_LOG.md` 最近部分

## 2. 客户端 UI 推进计划

### 2.1 主工厂页

参考：`主页面.png`

现状：

- 已有 DOM 工厂剖面背景。
- 已有顶部 HUD、资源条、底部导航、左右侧按钮、底部发射猫咪按钮。
- 已做过多轮移动端适配和点击修复。
- 2026-06-08 已生成并接入第一批楼层补充 PNG 素材：烘焙机、储罐、仓储道具。

差距：

- 工厂楼层已有第一批机器/道具叠加层，但仍缺少目标图那种逐层完整室内场景、猫咪动作、灯光和管线细节。
- 左侧电梯/猫咪竖槽还偏简化。
- 右侧按钮和底部礼包/订单/宝箱还需要更像图标卡。
- 资源条需要统一图标、描边、阴影、加号按钮质感。
- 2026-06-09：主工厂已增加每层独立室内装饰层，包含灯光、管线、黑板、货架、麻袋、桌台、窗格和仪表等 CSS 绘制元素；顶部 HUD 资源条已进一步胶囊化打磨。

推进方式：

1. 固化主工厂可见画布适配逻辑，不再让 DOM 元素超出可见 Canvas。
2. 生成/接入主工厂楼层细节素材：楼体背景、每层机器、猫咪小角色、右侧收益牌。
3. 把主工厂 UI 分离成 `FactoryDomRenderer` 或 Cocos 原生 UI prefab。
4. 每轮只改 1-2 个视觉区域，改完用浏览器截图对照目标图。

### 2.2 猫咪总览页

参考：`所有猫咪页面.png`

现状：

- 点击猫咪按钮可打开猫咪相关 DOM 详情界面。
- 有猫咪数据、升级、喂养、排班基础逻辑。
- 2026-06-08 已把猫咪按钮入口继续推进为全屏猫咪图鉴：包含顶部概览数据、左侧页签、中央猫咪展示、左右切换、属性区、故事区和底部猫咪队伍列表。
- 2026-06-08 已完成中央展示区的基础验收：大猫展示、对白、左右切换、稀有度/职业/岗位信息条均已接入。
- 2026-06-08 已生成五只猫统一风格参考图，并接入猫咪图鉴故事照片区域。
- 2026-06-08 已生成并接入 5 张单猫大立绘、4 个装备图标、4 个技能图标；猫咪总览中央角色区、装备栏和焦点信息卡已使用项目 PNG 资源。

差距：

- 目标图是更完整的沉浸式角色页，当前虽已全屏化，但背景层次、纸张质感、卡片比例和角色表现还需要继续打磨。
- 左侧页签、中央大猫、底部猫咪卡组、招募按钮、技能/装备/故事布局已具备雏形，但仍需精修到参考图比例。
- 已有第一批猫咪风格基准图；缺少单只透明大立绘切分和装备图标细化。

推进方式：

1. 将猫咪按钮默认打开全屏猫咪总览页。
2. 左侧页签：信息、升级、技能、装备、皮肤。
3. 中央角色区：大猫立绘、对白气泡、左右切换、心情。
4. 下方信息区：生产力、属性条、体重阶段、技能、装备、故事。
5. 底部猫咪横向列表和招募按钮。
6. 缺少大猫立绘时生成一批统一风格猫咪 PNG。

### 2.6 验证与素材流程

现状：

- 2026-06-08 已建立生成素材目录结构。
- 已建立 `docs/ai-progress/04_ASSET_LOG.md` 素材生成记录表。
- 已建立 `docs/verification/` 验证目录、截图目录、客户端检查命令记录。
- 已新增 `tools/check-client-ts.ps1` 和 `tools/verify-ui-clicks.browser.js`。
- 已新增 `FATCATUI/assets/scripts/ui/UiAssetRegistry.ts`，本轮生成素材通过项目资源路径接入，不再写入 `GeneratedUiAssets.ts`。
- 2026-06-08 已完成第一轮稳定素材迁移：主工厂背景、猫咪详情背景、猫咪头像、猫咪参考图、楼层补充素材、商店/背包图标、功能入口图标均通过项目资源路径接入。
- 2026-06-09 已新增 `tools/capture-main-regression.js`，使用本机 Edge 对 414x896、430x932、360x800、768x1024 做主界面截图回归。

推进方式：

1. 每轮 UI 修改后运行 `.\tools\check-client-ts.ps1`。
2. 修改 Cocos 脚本或生成素材后刷新 asset-db。
3. 能连接浏览器时执行 `tools/verify-ui-clicks.browser.js` 或同等点击流程。
4. UI 有明显视觉变化时把截图保存到 `docs/verification/screenshots/`。
5. 每次生成素材都更新 `docs/ai-progress/04_ASSET_LOG.md`。

### 2.3 猫咪详情弹窗

参考：`猫咪详情页面.png`

现状：

- 已有详情弹窗/面板雏形，包含标题、关闭、属性、技能、装备、故事等元素。

差距：

- 视觉层次、纸张面板、木牌标题、猫咪立绘、装备卡和详情按钮仍需更接近目标图。
- 页签和内容区需要减少拥挤，手机尺寸下仍要清晰。

推进方式：

1. 保留当前交互，重做布局比例。
2. 增加职业标签、稀有度徽章、星级、等级条、心情牌。
3. 装备卡使用生成或已有道具图标。
4. 技能卡与故事墙对齐目标图。

### 2.4 建筑页

参考：`其他页面.png`

现状：

- 已有建筑管理页、楼层 mini 工厂、经营动线、排班和升级。

差距：

- 建筑详情卡和升级条件还不够像目标图。
- 缺少建筑大图、条件勾选、消耗图标、解锁状态。

推进方式：

1. 拆出建筑详情卡。
2. 加入当前/下级效果对比。
3. 加入升级条件列表。
4. 楼层点击后面板与主工厂联动。

### 2.5 商店页

参考：`其他页面.png`

现状：

- 有分类页签、商品列表、购买按钮、限购、资源不足状态。

差距：

- 商品卡还缺少目标图的图标、货架、礼包、价格按钮质感。
- 模拟人民币礼包未形成清晰状态。

推进方式：

1. 生成/接入商品图标。
2. 商品卡改成目标图样式：图标、名字、收益、限购、价格按钮。
3. 商品分类切换加入顶部店员/货架视觉。

### 2.6 背包页

参考：`其他页面.png`

现状：

- 有分类、容量摘要、资源卡、物品格、使用按钮。

差距：

- 物品选中详情区不完整。
- 碎片合成、装备跳转尚未补齐。

推进方式：

1. 加入选中态。
2. 底部详情卡：来源、说明、使用/合成/装备。
3. 加入碎片合成逻辑任务。

### 2.7 研究页

参考：`其他页面.png`

现状：

- 有科技树节点、研究实验室横幅、详情、前置、消耗和按钮。

差距：

- 节点连线、分类、图标和右侧详情还可以更像目标图。
- 当前研究点和节点效果需要更清晰。

推进方式：

1. 美化树节点和连线。
2. 加入不同分类页签实际过滤。
3. 节点详情加入当前/下级效果和条件列表。

### 2.8 任务/成就/邮件/好友/设置

现状：

- 任务页有列表、订单和活跃奖励条。
- 2026-06-08：成就/邮件/好友/设置已从提示入口升级为真实 DOM 面板。
- 成就页已展示长期任务进度、可领取数量、猫咪收集、任务总数和钻石库存。
- 邮件页已有本地模拟邮件与领取反馈，可作为后续 `/api/mail` 接口 UI 壳。
- 好友页已有本地好友工厂快照、访问与赠礼按钮，可作为后续 `/api/friends` 接口 UI 壳。
- 设置页已有账号、存档、服务器模式、音效等状态卡，可继续接入实际开关和同步状态。
- 2026-06-08：客户端新增 `featureState` 存档层，邮件领取、设置开关、好友访问/赠礼已能持久化到 localStorage。

推进方式：

1. 任务页完善今日订单和宝箱领取。
2. 成就页复用任务结构但展示长期目标。
3. 邮件页先做本地模拟邮件。
4. 好友页为后续服务端预留：好友工厂快照、访问、弹射。
5. 设置页提供音效、清档、账号状态、服务器状态。

## 3. 客户端架构整理计划

### 3.1 拆分 `BottomNavUI.ts`

目标：降低 2000+ 行大文件风险。

建议拆分：

```text
assets/scripts/ui/dom/
  DomOverlayRoot.ts
  DomStyleRegistry.ts
  DomHudRenderer.ts
  DomFactoryRenderer.ts
  DomNavRenderer.ts
  DomPanelRenderer.ts
  DomCatRenderer.ts
  DomAssetRegistry.ts
```

短期原则：

- 不一次性大重构。
- 每拆一块，保持行为一致并浏览器验证。
- 先拆纯字符串渲染和 CSS，再拆输入处理。

### 3.2 素材接入

目标：从 Data URI 过渡到可维护本地素材。

步骤：

1. 新建 `assets/resources/textures/generated/` 结构。
2. 生成素材时保存 PNG/WebP。
3. 使用 Cocos asset-db 刷新资源。
4. 建立 `UiAssetRegistry.ts` 或 JSON 配置记录素材用途。
5. DOM UI 可先用 data URI，稳定后转资源加载；当前主 UI 已优先使用 `UiAssetRegistry.ts`。

### 3.3 响应式适配

目标：主流竖屏手机可用。

必须覆盖：

- 390x844
- 414x896
- 430x932
- 360x800
- 768x1024

重点：

- 顶部 HUD 不挤压。
- 底部导航不遮挡。
- 弹窗和全屏面板可滚动。
- 重要按钮不超出可见 Canvas。

## 4. 玩法系统详细计划

### 4.1 资源与生产

已有：

- 金币、咖啡豆、猫粮、钻石、研究点。
- 生产快照和结算。

待补：

- 订单金币、离线收益展示、资源上限。
- 咖啡豆不足时的恢复/购买入口。
- 生产公式文档化和数值表平衡。

### 4.2 猫咪养成

已有：

- 解锁、升级、喂养、体重、生产、排班。

待补：

- 星级。
- 装备。
- 技能升级。
- 皮肤。
- 心情。
- 故事墙。

### 4.3 建筑经营

已有：

- 建筑配置、升级、效果值、排班容量。

待补：

- 升级条件。
- 建筑外观皮肤。
- 楼层解锁。
- 楼层机器/装饰视觉变化。

### 4.4 商店和背包

已有：

- 商品配置、购买、限购、道具入背包、资源包使用。

待补：

- 每日限购按日期重置。
- 商品刷新。
- 模拟充值礼包。
- 碎片合成。
- 装备使用。

### 4.5 研究

已有：

- 前置、研究点消耗、全局加成。

待补：

- 分类筛选。
- 多级研究。
- 可升级研究节点。
- 研究效果统一进生产/升级公式。

### 4.6 发射猫咪玩法

目标：

- 选择猫咪。
- 拖拽蓄力。
- 抛物线预览。
- 碰撞好友工厂。
- 奖励结算。
- 每日次数。

客户端 MVP：

1. 单机假好友目标。
2. 本地结算奖励。
3. 体重影响距离/撞击。

联网版本：

1. 服务端生成好友工厂快照。
2. 客户端上报发射参数。
3. 服务端校验并结算。
4. 双方邮件/事件通知。

## 5. 服务端详细计划

### 5.1 工程结构

建议新增：

```text
FATCATServer/
  FatCat.Api/
  FatCat.Application/
  FatCat.Domain/
  FatCat.Infrastructure/
  FatCat.Tests/
  FatCat.sln
```

现状：

- 2026-06-08：已创建 `FATCATServer/FATCATServer.sln`。
- 2026-06-08：已创建 `FatCat.Api`、`FatCat.Application`、`FatCat.Domain`、`FatCat.Infrastructure`、`FatCat.Tests`。
- 2026-06-08：已接入 EF Core SQLite，默认开发连接串为 `Data Source=fatcat-dev.db`。

### 5.2 首批模块

- Auth：游客登录、Token。
- Player：玩家资料、公司名、等级经验。
- Resources：服务端权威资源。
- Save：存档读取/写入。
- Config：配置版本和下发。
- Friend：好友列表、好友工厂快照。
- Launch：弹射互动结算。
- Mail：奖励邮件。

客户端预接入状态：

- 2026-06-08：客户端已新增 `ApiTypes.ts`、`ApiClient.ts`、`NetworkManager.ts`、`SyncManager.ts`。
- 2026-06-08：`GameApp` 已接入网络/同步初始化，但 `GameConfig.apiBaseUrl` 默认为空，因此当前仍是离线优先模式。
- 2026-06-08：客户端已预留 Auth、Bootstrap、SaveSync、Mail、Friend、Settings DTO 和 API 方法。
- 2026-06-08：客户端网络层已对齐服务端 Mail/Friend/Settings 新接口，所有 save/mail/friend/settings 请求已携带 `playerId` query。
- 2026-06-08：客户端设置页已显示服务器状态、同步状态、待同步变更、playerId 和最近错误；可通过 `?api=http://localhost:5144` 指定本地 API 地址联调。
- 2026-06-08：服务端已允许 Cocos 预览 Origin `http://localhost:7456` / `http://127.0.0.1:7456` 跨域访问，客户端联网联调不再被浏览器 CORS 拦截。

服务端首批现状：

- 2026-06-08：已实现 `/health`、`/api/auth/guest`、`/api/player/me`。
- 2026-06-08：已实现 `/api/config/version`、`/api/config/bootstrap`。
- 2026-06-08：已实现 `/api/save`、`/api/save/sync`，先保存完整客户端 JSON 快照。
- 2026-06-08：已实现 `/api/mail`、`/api/mail/{mailId}/claim`。
- 2026-06-08：已实现 `/api/friends`、`/api/friends/{friendId}/visit`、`/api/friends/{friendId}/gift`。
- 2026-06-08：已实现 `/api/settings`。
- 2026-06-08：已新增 `Cors:AllowedOrigins` 配置、CORS 集成测试和 `tools/check-server-api.ps1` 本地 API 冒烟脚本。
- 2026-06-08：游客登录当前返回开发期 dev token，正式 JWT 待接入认证中间件。

### 5.3 API 草案

```text
POST /api/auth/guest
GET  /api/player/me
GET  /api/config/version
GET  /api/config/bootstrap
GET  /api/save
POST /api/save/sync
GET  /api/friends
GET  /api/friends/{friendId}/factory
POST /api/launch
GET  /api/mail
POST /api/mail/{mailId}/claim
POST /api/settings
POST /api/friends/{friendId}/visit
POST /api/friends/{friendId}/gift
```

### 5.4 数据库初版

起步 SQLite，表：

- Players
- PlayerResources
- PlayerCats
- PlayerBuildings
- PlayerInventory
- PlayerResearch
- PlayerTasks
- Friendships
- Mails
- LaunchLogs

### 5.5 同步策略

第一阶段：

- 客户端仍支持本地模式。
- 登录后上传本地存档，服务端保存并返回权威快照。
- 关键行为改成服务端接口：购买、领取奖励、发射互动。

第二阶段：

- 服务端完全权威资源。
- 客户端只做表现和缓存。
- 断线时只允许无风险本地预览，不允许提交收益。

## 6. 验证与质量门槛

客户端：

```text
npx tsc -p FATCATUI/tsconfig.json --noEmit --ignoreDeprecations 6.0
```

如果全量 tsc 被 Cocos 引擎声明影响，则至少过滤相关文件错误：

```text
npx tsc -p FATCATUI/tsconfig.json --noEmit --ignoreDeprecations 6.0 2>&1 | Select-String -Pattern "BottomNavUI|GeneratedUiAssets|CatDetailPanel"
```

服务端：

```text
dotnet build
dotnet test
```

浏览器验证：

- 打开 `http://localhost:7456/`。
- 点击工厂、猫咪、建筑、商店、背包、研究。
- 至少验证一个手机尺寸。
- 检查 console 错误。
# 2026-06-09 主界面推进补充

- 本轮继续沿 `主页面.png` 推进主工厂首屏：左侧管线/电梯区增加卡箍、指示灯、猫咪窗细节；右侧收益牌改为带楼层类型图标的双行信息卡；底部订单、宝箱、发射、礼包区域上移并修复被底部导航遮挡的问题。
- 已重新跑 414x896、430x932、360x800、768x1024 四档截图回归，均无 console error、无 failed request，关键节点 `resourceCount=4`、`floorCount=6`、`roomDecorCount=6`、`hasLaunch/hasCats/hasSettings=true`。
- 仍需继续：楼层内猫咪动作和机器差异还偏 CSS 占位，顶部 HUD 图标可继续换成更接近目标稿的高精度资源，之后再推进其他页面与服务端真实数据联动。
# 2026-06-10 主界面推进补充

- 本轮继续沿 `主页面.png` 推进首屏细节：楼层室内新增吊灯、便签、咖啡豆轨道、传送带、植物、时钟等 CSS 绘制元素，并按 office/roast/tank/mill/cafe/storage 组合出不同室内层次。
- 顶部 HUD 继续精修：头像增加脸部高光，资源图标增加内阴影与高光，钻石改为更清晰的紫色切面宝石，右侧加号按钮增加亮面层次。
- 已重新跑 414x896、430x932、360x800、768x1024 四档截图回归，均无 console error、无 failed request，关键节点仍为 `resourceCount=4`、`floorCount=6`、`roomDecorCount=6`、`hasLaunch/hasCats/hasSettings=true`。
- 仍需继续：主工厂机器与猫咪动作仍主要是 CSS 占位，后续可使用 Codex 图片生成能力产出单层机器/猫咪素材并接入，进一步贴近目标插画 UI。

# 2026-06-10 主界面机器素材与适配推进补充

- 主界面继续沿 `主页面.png` 推进：楼层室内丰富度从纯背景装饰推进到“场景化机器贴片 + 楼层差异道具”。
- 已生成并登记 office/mill/cafe 三类工厂 PNG 素材，但 Cocos preview 的 DOM 层不能直接请求 `assets/resources/...` 路径，否则会产生 404；短期 UI 先使用 CSS fallback，后续应通过 Cocos `resources.load`/SpriteFrame 或统一资源代理接入。
- 响应式策略更新：手机窄屏优先防止礼包、底部导航、KPI 和机器层拥挤；768x1024 宽屏优先保持 HUD 与楼顶招牌间距，并让主楼向目标稿的居中竖屏构图靠拢。
- 下轮建议：继续推进猫咪页或建筑页目标 UI；若继续主界面，则优先做“Cocos 原生 Sprite 资源加载层”，把已生成工厂 PNG 从 DOM 直链迁移到可验证的引擎资源管线。

# 2026-06-10 工厂素材接入策略补充

- 短期方案：对 DOM overlay 使用 `FactoryPropDataUris.ts` 作为小型 Data URI 桥接层，保证生成 PNG 能在 Cocos preview 中稳定显示且不产生 404。
- 中期方案：当主界面 UI 基本定稿后，把工厂 PNG、猫动作 PNG、商店/背包图标迁移到统一 Cocos `resources.load`/SpriteFrame 或 prefab 管线。
- 约束：不要在 DOM 里直接写 `assets/resources/...`；该路径在 preview 中会失败。若必须用 DOM 图片，优先使用 Data URI 或经过验证的 preview 可访问 URL。
- 下轮 UI 目标：继续增加猫咪动作差异、楼层暖光层次、顶部 HUD 精致度，或转向猫咪详情/建筑/商店页面对齐目标图。
# 2026-06-10 详细计划补充：DOM 资源稳定性与点击验证

- 当前短期策略：凡是 DOM overlay 中使用生成图片，不再直接写 `assets/resources/...` URL；必须经过 Data URI 注册表或后续 Cocos 原生 SpriteFrame 资源管线。
- 主界面工厂道具继续使用 `FactoryPropDataUris.ts`；猫咪页、商店、背包、功能入口图标使用 `DomAssetDataUris.ts`。
- 验证门槛更新：涉及底部导航、猫咪页、商店、背包、研究或右侧入口时，必须运行 `node tools/verify-ui-clicks-playwright.js`，要求所有 click step 成功且 `failedRequests` 为空。
- 分辨率门槛保持：每轮较大 UI 改动后继续跑 `node tools/capture-main-regression.js`，覆盖 414x896、430x932、360x800、768x1024。
- 下一阶段 UI 重点：猫咪详情页要继续贴近目标图，包括左侧标签质感、中心大猫空间、属性卡、装备/技能卡、底部猫咪队列；主界面继续补楼层室内丰富度和 HUD 精致度。
# 2026-06-10 详细计划补充：猫咪页视觉与回归

- 猫咪详情页已经进入专项推进阶段，短期优先级为：左侧标签栏、中心猫咪舞台、属性/体重卡、技能装备卡、底部猫咪队列。
- 新增猫咪页截图回归门槛：执行 `node tools/capture-cat-regression.js`，覆盖 414x896、430x932、360x800、768x1024，并要求 overlay、侧栏、属性卡、立绘、装备卡、队列都存在且无 failed request。
- 每次猫咪页视觉改动后仍需同步执行 `node tools/verify-ui-clicks-playwright.js`，防止视觉层遮挡按钮导致“点击没反应”问题回归。
- 下一轮建议优先清理猫咪页历史乱码文案，再继续做底部猫咪卡片、技能/装备交互和更多目标 UI 细节。
# 2026-06-10 详细计划补充：猫咪页文案与底部区域

- 猫咪页新增文案质量门槛：执行 `node tools/check-cat-text-regression.js`，必须保证关键中文文案存在，且常见乱码片段为空。
- 猫咪详情页形态调整为更接近独立页面/大弹层：顶部 HUD 可见，底部主导航隐藏，底部猫咪队列作为页面自己的固定区域。
- 后续做猫咪页时，优先避免固定底部栏下方透出普通内容；若新增内容较长，应进入滚动区而不是穿到底部队列下。
- 下一步 UI 优先级：底部猫咪卡片稀有度、星级、工作状态细节；技能/装备卡的按钮、替换、升级反馈；其他页面文案乱码检查。
# 2026-06-12 详细计划补充：猫咪页交互深化

- 猫咪页从静态详情展示推进到轻交互阶段：技能、装备、皮肤、故事入口都应至少有点击反馈，后续再接真实数据和背包/材料系统。
- 点击回归门槛更新：`node tools/verify-ui-clicks-playwright.js` 现在必须覆盖技能详情、装备选择、故事入口，防止视觉按钮被底部层遮挡。
- UI 方向：底部猫咪队列继续往目标图卡片化推进，优先强化稀有度、星级、工作状态、锁定态；装备区下一步做可替换列表与升级消耗。
- 后续若新增猫咪交互，必须同步更新 `check-cat-text-regression.js` 或点击脚本，避免“看得到但点不到”的回归。
# 2026-06-12 详细计划补充：装备背包面板

- 猫咪页装备区当前是 UI 外壳阶段：装备槽位、选中态、背包候选卡和锁定槽已完成；下一步可接入 `InventoryManager`、存档字段和正式装备配置。
- 交互约束：装备槽位和背包候选都必须是真正可点击元素，不能只做静态卡片；点击回归需继续覆盖 `cat-equip-action`。
- 布局约束：底部猫咪队列是固定区域，装备列表若继续增长，应做滚动/分页，而不是穿透到底部队列下方。
- 验证约束：`capture-cat-regression.js` 的 `hasEquipCards` 应保持 4，分别对应 3 个装备槽和 1 个锁定槽。
# 2026-06-12 详细计划补充：装备存档管线

- 猫咪装备从 UI 外壳进入存档阶段：每只猫现在可保存 `equipment` 槽位映射，当前先由 `CatManager` 提供默认装备和内置装备定义。
- 短期下一步：把 `getAllEquipOptions()` 里的内置装备定义迁移到 JSON 配置，并让装备背包按 `InventoryManager` 持有数量过滤/显示。
- 存档策略：当前不提升 `SAVE_VERSION`，继续通过兼容补齐字段保护旧存档；若后续引入复杂装备等级/强化材料，再考虑版本迁移。
- 验证门槛：装备相关改动必须跑 `verify-ui-clicks-playwright.js`，并确认 `cat-equip-save` 通过。
# 2026-06-12 详细计划补充：装备配置化

- 装备定义已迁移到 `configs/equipment.json`，后续新增装备时优先改 JSON，不要再写入 `BottomNavUI.ts`。
- 装备管线当前结构：`equipment.json` -> `ConfigManager.equipment` -> `CatManager.getEquipmentBySlot/getEquipmentConfig` -> `BottomNavUI` 渲染/点击保存。
- 下一阶段建议：给 `EquipmentConfig` 增加 `levelMax`、`upgradeCost`、`source` 或 `ownedCount` 相关字段，逐步接入真实背包数量和升级材料。
- 验证要求：装备配置改动后必须跑 JSON parse、`check-client-ts`、`verify-ui-clicks-playwright.js` 和 `capture-cat-regression.js`。

# 2026-06-12 详细计划补充：装备库存联动

- 装备背包已从纯 UI 候选进入库存联动阶段：`initialSave.inventory` 提供装备持有数量，`InventoryManager.getItemCount/hasItem` 负责统一查询，`CatManager.equipItem` 负责保存前校验。
- 当前 UI 策略：已装备项可重复确认，持有项显示 `持有 xN` 并允许装备，未持有项置灰禁用；后续若接商店/掉落/邮件奖励，只需要写入 inventory 即可反映到装备背包。
- 下一阶段建议：在 `equipment.json` 中补 `levelMax`、`upgradeCost`、`source` 字段，并新增装备升级/来源提示 UI；库存仍由 `InventoryManager` 负责，不要把数量写回装备配置。
- 验证门槛：装备库存相关改动必须跑 `initialSave.json` parse、`check-client-ts`、`check-cat-text-regression.js`、`verify-ui-clicks-playwright.js`、`capture-cat-regression.js`，大 UI 改动继续跑 `capture-main-regression.js`。

# 2026-06-12 详细计划补充：装备升级预览

- 装备配置已新增 `levelMax`、`upgradeCost`、`source`，短期用于 UI 展示和升级预览，长期可直接映射到服务端装备规则。
- 当前升级按钮只做预览反馈，不修改存档也不扣金币；正式强化前需要先给 `CatSaveData.equipment` 或独立装备实例表增加等级字段。
- 推荐下一步数据结构：`equipmentLevels?: Record<string, number>` 存在猫咪存档或玩家装备存档里；若后续装备可被多个猫共享，则优先做玩家装备实例表，不要把等级绑死在猫身上。
- UI 方向：装备页继续补“来源入口”“升级材料缺口”“当前/下级属性对比”，并保持 360x800 小屏可点击回归。
- 验证门槛：正式升级上线前必须新增资源扣除测试、点击回归步骤和存档兼容逻辑；若接服务端，还需要新增 API DTO 与 C# 单元测试。

# 2026-06-12 详细计划补充：装备正式升级

- 装备升级已进入真实存档阶段：当前采用猫咪存档内的 `equipmentLevels` 保存装备等级，适合短期验证 UI 和经济循环。
- 当前规则：装备默认 Lv.1，升级消耗 `upgradeCost * 当前等级` 金币，达到 `levelMax` 后停止；金币不足或装备不存在会返回本地反馈。
- 中期重构建议：如果后续装备需要跨猫咪复用、分解或交易，应把等级迁移到玩家装备实例表，而不是继续绑定在猫咪身上。
- UI 下一步：在装备页加入“当前加成/下级加成”“材料缺口”“来源跳转”，并把升级按钮状态区分为可升级、金币不足、满级。
- 服务端下一步：C# DTO 需要补 `equipment` 和 `equipmentLevels`，升级动作应变为服务器权威接口，客户端只做展示和请求。

# 2026-06-12 详细计划补充：装备升级状态条

- 装备页已具备状态化升级 UI：当前等级、下级预览、升级消耗、按钮状态都由 `CatManager.getEquipmentUpgradeState()` 驱动。
- 当前按钮状态约定：可升级显示 `升级装备`，金币不足显示 `金币不足` 并禁用，满级显示 `已满级` 并禁用。
- 后续做材料消耗时，继续扩展 upgrade state 返回结构，不要让 `BottomNavUI.ts` 自己计算经济规则。
- UI 下一步可以把 `bonus` 文案解析成数值，展示“当前加成 -> 下级加成”；如果解析成本高，可先在 `equipment.json` 增加结构化 `effects` 字段。
- 验证要求：装备升级 UI 改动后继续跑 `verify-ui-clicks-playwright.js`，并保持 disabled 状态也有测试分支。

# 2026-06-12 详细计划补充：装备结构化 effects

- 装备配置已新增结构化 `effects`，当前用于装备页展示“当前加成 -> 下级加成”，后续应逐步替代纯展示用的 `bonus` 文案。
- 当前只展示每件装备的第一个 effect；如果后续出现多效果装备，建议在 UI 中折叠显示主效果，并在详情弹层展示完整 effects 列表。
- 公式接入方向：`materialOutput` 接生产，`mood` 接心情上限，`catFoodCost` 接喂食/维护消耗，`wageCost` 接猫咪工资或订单成本。
- 服务端方向：C# 配置 DTO 应包含 `effects`，升级和生产结算应以后端结构化 effects 为准，客户端只做展示。
- 验证要求：新增装备配置时必须检查每个装备都有 effects；若改动 effects 类型，需要同步 TypeScript 类型、服务端 DTO 和回归脚本。

# 2026-06-12 详细计划补充：materialOutput 公式接入

- 关键词：materialOutput 接入生产公式。
- `materialOutput` 已从展示字段接入 `CatManager.getCatProduction()`，当前会影响猫咪页生产力、建筑页猫咪产能和 `ProductionManager` 楼层结算。
- 新增通用入口 `getEquipmentEffectTotal(catId, effectType)`，后续 `mood/catFoodCost/wageCost` 应继续复用它，不要在 UI 或生产公式里重复遍历装备。
- 当前默认猫校验：初始基础 10，技能 +20%，默认项圈 materialOutput +15%，猫咪页可见生产力为 13/秒。
- 验证要求：改动装备 effects 或生产公式后必须跑 `node tools/check-equipment-production-effect.js`，防止装备数值只显示不生效。
- 下一步公式接入优先级：`catFoodCost` 接喂食/维护消耗，`mood` 接心情上限，`wageCost` 接工资或订单成本。

# 2026-06-12 详细计划补充：catFoodCost 接入喂食成本

- 关键词：catFoodCost 接入喂食成本。
- `catFoodCost` 已从展示字段接入 `CatManager.getFeedCost()` 和 `feedCat()`，当前会影响猫咪页喂食卡显示与实际猫粮扣除。
- 当前默认猫校验：初始喂食基础 10，默认幸运杯 catFoodCost -5%，猫咪页喂食卡显示 9。
- 取整策略：减耗后使用向下取整并保底 1，确保小百分比减耗能在低基础成本上产生可见收益。
- 验证要求：改动喂食成本、杯子装备或 catFoodCost 公式后必须跑 `node tools/check-equipment-feed-cost-effect.js`。

# 2026-06-12 详细计划补充：mood 接入心情显示

- 关键词：mood 接入心情显示。
- `mood` 已从展示字段接入 `CatManager.getMoodCap()` 和 `getMood()`，当前会影响猫咪页心情卡显示。
- 当前默认猫校验：初始体重 20 的基础心情为 95%，默认舒适坐垫 mood +10%，猫咪页心情卡显示 105%。
- 当前策略：心情可超过 100%，由装备上限提供溢出空间；后续若加入心情消耗/恢复系统，需要把当前心情和上限拆成两个存档字段。
- 验证要求：改动心情公式、坐垫装备或 mood effects 后必须跑 `node tools/check-equipment-mood-effect.js`。

# 2026-06-12 详细计划补充：wageCost 接入工资显示

- 关键词：wageCost 接入工资显示。
- `wageCost` 已从展示字段接入 `CatManager.getWageCost()`，当前会影响猫咪详情页工资卡显示。
- 当前校验路径：清空存档后进入猫咪页，将默认猫升级到 Lv.20，切换装备页坐垫槽，装备午睡坐垫；工资应从 20/分钟降为 19/分钟，装备详情应显示 `工资消耗 -5%`。
- 当前取整策略：工资公式保留小数计算，展示层仍走 `formatNumber()` 向下取整；后续接净收益结算时应优先使用未取整数值，UI 再做展示格式化。
- 验证要求：改动工资公式、坐垫装备或 wageCost effects 后必须跑 `node tools/check-equipment-wage-cost-effect.js`，并继续跑四尺寸截图回归观察小屏布局。
- 下一步公式方向：将 `getWageCost()` 接入建筑净收益、订单结算或服务端模拟结算，避免工资只停留在猫咪详情展示。

# 2026-06-12 详细计划补充：建筑净收益结算

- 关键词：wageCost 接入建筑净收益。
- `ProductionManager.calculateSnapshot()` 已拆出毛收益、工资成本和净金币收益；客户端发射、离线结算和 HUD/建筑页现在都使用净金币收益。
- 当前折算策略：猫咪工资仍以 `金币/分钟` 配置和展示，生产快照中按 `/60` 折算为每秒工资成本；建筑页使用 `formatRate()` 展示小于 1 的成本，避免显示成 0。
- UI 状态：建筑管理页运营卡为 `净金币/工资成本/咖啡豆消耗/值班猫咪`，桌面四列、小屏两列；结算说明展示 `毛收益 -> 工资 -> 净收益`。
- 验证要求：改动生产快照、发射结算或建筑面板时必须跑 `node tools/check-production-wage-net-effect.js`，并补跑 `verify-ui-clicks-playwright.js` 与主界面截图回归。
- 服务端方向：C# 结算 DTO 应包含 `grossCoinPerSecond`、`wageCostPerSecond`、`netCoinPerSecond` 以及楼层分项，保持和客户端快照字段一致。

# 2026-06-13 详细计划补充：服务端 production preview

- 关键词：production-preview 服务端契约。
- 服务端已具备 `/api/production/preview`，当前是无副作用预览接口，用于对齐客户端净收益快照字段；后续可升级为服务器权威结算或发射结算前校验。
- DTO 字段约定：总计包含 `grossCoinPerSecond`、`wageCostPerSecond`、`netCoinPerSecond`、`beanCostPerSecond`；楼层分项使用同一组字段并带 `buildingId`。
- 当前计算策略：服务端对输入做非负归一，`netCoinPerSecond = max(0, grossCoinPerSecond - wageCostPerSecond)`；客户端与服务端应保持一致。
- 客户端网络层已新增 `ApiClient.previewProduction()`，下一步可在设置页连接服务器后增加“结算预览联调”按钮，或在发射前用服务端结果做校验。
- 验证要求：改动 production preview 契约后必须跑 `dotnet test FATCATServer/FATCATServer.sln`、`tools/check-server-api.ps1`、`.\tools\check-client-ts.ps1`。

# 2026-06-13 详细计划补充：客户端联网结算预览

- 关键词：客户端 production preview 联调。
- 设置页已具备 `结算预览` 按钮，离线可见明确失败提示，连接服务器后会把客户端当前生产快照提交给 `/api/production/preview` 并展示服务端返回结果。
- `SyncManager.previewProduction()` 是客户端联网结算入口，后续发射/离线收益接服务端时应优先复用该方法的快照组装逻辑，避免多个模块重复拼 DTO。
- 当前 UI 只展示净收益和工资成本，下一步可以把服务端返回的楼层分项做成弹层或接入建筑页，辅助调试多人联网收益差异。
- 验证要求：改动设置页联网按钮、`SyncManager.previewProduction()` 或 production preview DTO 时，必须跑离线按钮脚本和在线脚本：`node tools/check-settings-production-preview-button.js`、`node tools/check-settings-production-preview-online.js`。
