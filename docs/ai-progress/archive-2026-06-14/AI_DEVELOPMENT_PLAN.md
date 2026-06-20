# 肥猫咖啡公司 Cocos 可落地开发计划

更新时间：2026-05-07

## 1. 当前项目盘点

项目根目录：`D:\Desktop\FATCATCOM`

现有内容：

- `FATCATUI/`：Cocos Creator 3.8.8 示例工程，TypeScript，当前为 3D 项目模板但主要资产是 2D UI。
- `计划.txt`：已有完整玩法构想，核心方向是竖屏放置经营、猫咪收集、工厂升级、商店、背包、研究、弹射互动。
- `主页面.png`：目标主工厂界面。
- `所有猫咪页面.png`：目标猫咪总览/角色详情复合页。
- `猫咪详情页面.png`：目标弹窗式猫咪详情页。
- `其他页面.png`：目标建筑详情、商店、背包、研究、建筑外观预览。

现有工程可复用内容：

- 场景：`assets/scene/home.scene`、`list-with-data.scene`、`rocker.scene`、`test-list.scene`。
- 示例脚本：`assets/scripts/HomeUI.ts`、`ShopUI.ts`、`BackPackUI.ts`、`HeroSlot.ts`、`ItemList.ts` 等。
- 示例贴图：`assets/textures/` 下已有背景、资源图标、按钮、背包、商店、英雄槽、底部导航等素材。
- 字体：`assets/font/haibao_outline.*`、`haibao_shadow.*`，适合卡通标题字。

需要新建的主要工程结构：

```text
FATCATUI/assets/
  resources/configs/
  scripts/core/
  scripts/data/
  scripts/model/
  scripts/manager/
  scripts/ui/
  scripts/ui/components/
  scripts/ui/panels/
  textures/fatcat/
  textures/fatcat/ui/
  textures/fatcat/cats/
  textures/fatcat/factory/
  textures/fatcat/items/
  prefab/fatcat/
```

## 2. 最终目标

做成一个可完整部署的 Cocos Creator 3.8.8 竖屏手机游戏项目，首版目标是 Web/Mobile Preview 可运行，后续可导出 APK。

目标体验：

- 玩家经营多层肥猫咖啡工厂。
- 猫咪消耗咖啡豆生产咖啡收益。
- 建筑升级影响产量、售价、容量、工资、防御。
- 猫咪可升级、喂养、装备、换肤、查看故事。
- 商店可买资源、道具、碎片、装饰。
- 背包可查看/使用/合成物品。
- 研究树提供全局加成。
- 发射猫咪是特色互动玩法，MVP 先做本地假好友目标和结算。
- 本地存档、离线收益、基础新手引导和部署构建完整。

视觉目标：

- 竖屏 1080 x 1920 设计基准。
- 暖色咖啡工厂、卡通猫咪、多层剖面建筑。
- UI 大量使用奶油纸张面板、木牌标题、咖啡棕描边、绿色确认按钮、橙色重点按钮、发光选中态。
- 所有目标页面都要达到预览图的布局观感，而不是只做功能灰盒。

## 3. 页面拆解与验收标准

### 3.1 主工厂页面

参考：`主页面.png`

模块：

- 顶部玩家信息卡：头像、公司名、等级、经验进度。
- 顶部资源栏：金币、咖啡豆、猫粮、钻石，每个有加号按钮。
- 左侧快捷入口：任务。
- 右侧快捷入口：成就、邮件、好友、设置。
- 中央多层工厂：B1、1F、2F、3F、4F、5F，每层有建筑名、等级、猫咪、机器、收益浮牌。
- 左侧电梯/猫咪竖槽。
- 底部订单、宝箱、发射猫咪、礼包倒计时。
- 底部导航：工厂、猫咪、建筑、商店、背包、研究。

验收：

- 1080x1920 下布局接近目标图，移动端安全区不遮挡。
- 工厂区域支持滚动或按屏幕高度缩放，底部导航固定。
- 资源数字能实时变化。
- 点击底部导航可以进入对应页面或弹窗。
- 点击楼层打开建筑详情。
- 点击猫咪打开猫咪详情。
- 点击发射猫咪进入发射面板或场景。

### 3.2 猫咪总览页面

参考：`所有猫咪页面.png`

模块：

- 顶部资源栏复用。
- 左侧垂直页签：信息、升级、技能、装备、皮肤。
- 中央大猫展示，左右切换箭头，气泡对白。
- 猫咪基础卡：名称、稀有度、类型、等级、星级。
- 心情、喂猫粮按钮、生产力大条。
- 属性横条：咖啡豆消耗、原料产量、工资、体重、品种。
- 体重阶段：正常、胖猫、巨胖。
- 技能卡、装备卡、故事卡。
- 底部猫咪列表和招募按钮。

验收：

- 底部猫咪列表可切换当前猫。
- 猫咪属性由配置驱动，不硬编码在 UI。
- 喂猫粮会改变体重值和阶段。
- 升级按钮会消耗资源并刷新等级、产量、消耗。

### 3.3 猫咪详情弹窗

参考：`猫咪详情页面.png`

模块：

- 背景遮罩和居中大弹窗。
- 木牌标题“猫咪详情”。
- 左侧猫咪立绘、稀有度、职业、星级、跟随状态。
- 右侧等级进度、升级按钮、属性列表、技能摘要。
- 中部页签：信息、升级、喂养、技能、故事。
- 下部属性、装备、伙伴加成。
- 底部按钮：解雇、更换、升级 1 级。

验收：

- 可从主工厂和猫咪总览打开。
- 弹窗层级、遮罩、关闭按钮、返回焦点正确。
- 页签切换不重建全部节点，只刷新内容。
- 解雇和更换先做二次确认或提示，避免误操作。

### 3.4 建筑详情

参考：`其他页面.png` 左上

模块：

- 建筑大图和名称等级。
- 建筑类型标签。
- 建筑说明。
- 当前等级效果和下级效果对比。
- 升级条件列表，未达成红字，达成勾选。
- 升级按钮。

验收：

- 点击主工厂任意楼层打开对应建筑详情。
- 升级后主工厂楼层卡、收益、外观刷新。
- 条件不足时按钮禁用并提示缺少资源或前置等级。

### 3.5 商店

参考：`其他页面.png` 上中

模块：

- 分类页签：资源商店、道具商店、猫咪商店、装饰商店。
- 纵向商品列表。
- 商品图标、名称、收益/说明、每日限购、价格按钮。
- 支持金币、钻石和模拟人民币礼包三类价格。

验收：

- 分类切换流畅。
- 购买成功进入资源或背包。
- 每日限购本地存档。
- 资源不足有提示。

### 3.6 背包

参考：`其他页面.png` 上右

模块：

- 分类页签：全部、资源、道具、碎片、其他。
- 物品九宫格/多列网格。
- 选中物品高亮。
- 底部详情：图标、名称、拥有数量、说明、来源。
- 可用物品显示使用按钮。

验收：

- 背包数据由 `InventoryModel` 驱动。
- 资源包可使用并增加资源。
- 碎片达到数量可合成猫咪。
- 装备类物品后续可跳转猫咪装备。

### 3.7 研究

参考：`其他页面.png` 左下

模块：

- 分类页签：生产研究、经营研究、猫咪研究、特殊研究。
- 左侧科技树节点和连线。
- 右侧选中节点详情、当前效果、下级效果、条件、研究按钮。
- 三种状态：未解锁、可研究、已完成/可升级。

验收：

- 前置条件正确控制解锁。
- 研究消耗资源并刷新全局加成。
- 生产公式能读取研究加成。

### 3.8 工厂外观预览

参考：`其他页面.png` 右下

模块：

- 工厂缩略预览。
- 外观卡：简陋工厂、经典工厂、蒸汽工厂、未来工厂。
- 外观属性加成。
- 使用中按钮。

验收：

- 可切换已解锁外观。
- 主工厂背景/楼体皮肤刷新。
- 未解锁外观禁用并显示条件。

### 3.9 发射猫咪玩法

参考：计划文档，无目标 UI 图，需延续主图大橙色火箭按钮风格。

MVP 模块：

- 选择猫咪。
- 拖拽蓄力。
- 抛物线预览。
- 假好友工厂目标。
- 碰撞奖励结算。
- 每日 5 次发射次数。

验收：

- 可以完整完成一次发射并获得奖励。
- 体重影响距离和撞击力。
- 次数限制本地存档。

## 4. 数据与架构

### 4.1 核心原则

- 所有数值走 JSON 配置，不写死在 UI 脚本。
- Manager 只处理业务逻辑，UI 只负责展示和事件转发。
- 本地存档先用 `sys.localStorage`，结构保留版本号，便于迁移。
- 事件通信用轻量 `EventBus`，避免 UI 互相硬引用。
- 单文件尽量不超过 400 行。

### 4.2 推荐脚本模块

```text
scripts/core/
  GameApp.ts              启动入口，初始化配置、存档、全局服务
  GameConfig.ts           常量、版本号、设计分辨率
  EventBus.ts             全局事件派发
  TimerService.ts         每秒 tick、日刷新、离线秒数
  Logger.ts               开发期游戏内日志封装

scripts/model/
  PlayerModel.ts
  ResourceModel.ts
  CatModel.ts
  BuildingModel.ts
  InventoryModel.ts
  ResearchModel.ts
  ShopModel.ts
  LaunchModel.ts

scripts/manager/
  SaveManager.ts
  ConfigManager.ts
  ResourceManager.ts
  CatManager.ts
  BuildingManager.ts
  ProductionManager.ts
  InventoryManager.ts
  ShopManager.ts
  ResearchManager.ts
  LaunchManager.ts
  PopupManager.ts

scripts/ui/
  MainUI.ts
  TopBarUI.ts
  BottomNavUI.ts
  FactoryView.ts

scripts/ui/components/
  ResourceCounter.ts
  BuildingFloorItem.ts
  CatCardItem.ts
  ItemGridCell.ts
  ShopListItem.ts
  ResearchNodeItem.ts
  UpgradeButton.ts
  TabButton.ts
  RewardToast.ts

scripts/ui/panels/
  CatListPanel.ts
  CatDetailPanel.ts
  BuildingDetailPanel.ts
  ShopPanel.ts
  InventoryPanel.ts
  ResearchPanel.ts
  FactorySkinPanel.ts
  LaunchPanel.ts
```

### 4.3 配置表

存放位置：`assets/resources/configs/`

```text
cats.json
buildings.json
items.json
shops.json
research.json
factorySkins.json
launchTargets.json
initialSave.json
```

最小字段：

```ts
type CatConfig = {
  id: string;
  name: string;
  rarity: "B" | "A" | "S" | "SS";
  role: "producer" | "saver" | "launcher" | "support";
  breed: string;
  personality: string;
  baseProduction: number;
  baseBeanCost: number;
  baseSalary: number;
  baseWeight: number;
  skillId: string;
  portrait: string;
  fullArt: string;
};

type BuildingConfig = {
  id: string;
  name: string;
  floor: string;
  type: "storage" | "production" | "ferment" | "roast" | "office" | "cafe" | "launch" | "defense";
  maxLevel: number;
  baseEffect: number;
  effectPerLevel: number;
  costBase: number;
  icon: string;
  art: string;
};
```

## 5. 生产与数值 MVP

资源：

- `coin` 金币
- `bean` 咖啡豆
- `catFood` 猫粮
- `diamond` 钻石
- `coffee` 咖啡原料或成品，可内部计算不一定在顶栏显示
- `researchPoint` 研究点

每秒生产：

```text
猫咪产量 = baseProduction * levelMultiplier * weightProductionMultiplier * moodMultiplier * equipmentMultiplier
楼层产量 = 楼层猫咪产量总和 * buildingMultiplier
总金币每秒 = 楼层产量总和 * coffeePriceMultiplier * researchMultiplier * buffMultiplier
咖啡豆每秒消耗 = 猫咪豆耗总和 * beanCostReduction
```

体重阶段：

```text
正常：0-39，产量 x1.00，弹射距离 x1.00，撞击 x1.00
胖猫：40-79，产量 x1.30，弹射距离 x0.85，撞击 x1.20
巨胖：80-100，产量 x1.80，弹射距离 x0.60，撞击 x1.50
```

离线收益：

```text
离线秒数 = min(now - lastSaveAt, 8小时)
离线金币 = 当前每秒金币 * 离线秒数 * 0.5
离线咖啡豆消耗 = 当前每秒豆耗 * 离线秒数 * 0.5
豆不足时按可生产时长截断
```

## 6. 素材策略

优先复用：

- 示例工程现有 UI 贴图、图标、按钮、字体。
- 四张目标图仅作为视觉参考，不直接切图进工程，避免版权/压缩/适配问题。

需要生成的素材：

- 猫咪全身立绘：橘猫、黑白猫、奶牛猫、灰猫、黑猫等，正常/胖/巨胖三阶段。
- 工厂楼层背景：仓库、咖啡厅、原料车间、发酵车间、烘焙车间、管理室。
- 建筑皮肤缩略图：简陋、经典、蒸汽、未来。
- 商店/背包物品图标：豆包、猫粮、钻石箱、加速药水、防护盾、优惠券、碎片、装备。
- 发射玩法目标：咖啡豆袋、猫粮桶、金币箱、防御门。

生成规范：

- 使用可用 skills 生成位图素材时，优先用 `imagegen` 或游戏资产相关 skills。
- 透明图标/角色建议输出 PNG，统一放到 `assets/textures/fatcat/...`。
- 每批素材生成后记录 prompt、文件名、用途到 `AI_WORK_LOG.md`。
- 角色素材需要保持相同视角、光照和描边厚度，避免同屏风格漂移。

## 7. 开发里程碑

### M0：工程整理和可启动验证

目标：确认 Cocos 工程可打开，建立开发文档和日志规范。

任务：

- 新增 `AI_DEVELOPMENT_PLAN.md`、`AI_WORK_LOG.md`、`AI_HANDOFF.md`。
- 确认 Cocos Creator 版本为 3.8.8。
- 记录现有资产、场景、脚本。
- 不改动原示例场景行为。

验收：

- 后续 AI 能通过 `AI_HANDOFF.md` 快速知道下一步。

### M1：基础框架和存档

目标：游戏能初始化、保存、显示资源。

任务：

- 建 `core`、`manager`、`model`、`resources/configs` 目录。
- 实现 `EventBus`、`ConfigManager`、`SaveManager`、`ResourceManager`、`GameApp`。
- 创建 `initialSave.json`。
- 做一个开发测试 UI 或在现有 home 场景挂载资源测试。

验收：

- 首次进入生成初始存档。
- 点击测试按钮可增减资源。
- 刷新/重进资源不丢。
- 控制台有清晰初始化日志。

### M2：主工厂 UI 灰盒

目标：主页面结构接近目标图，先用占位块和现有素材。

任务：

- 新建 `Main.scene` 或复制 `home.scene` 改造。
- 实现 `TopBarUI`、`BottomNavUI`、`FactoryView`、`BuildingFloorItem`。
- 用配置生成 B1-5F 楼层。
- 底部导航能打开空面板。

验收：

- 1080x1920 预览下顶栏、工厂、底栏位置正确。
- 楼层由配置生成。
- 点击楼层能打印建筑 id。

### M3：猫咪系统和猫咪 UI

目标：完成猫咪数据、列表、详情、升级、喂养。

任务：

- `cats.json` 写 5 只初始猫。
- 实现 `CatModel`、`CatManager`。
- 实现 `CatListPanel` 和 `CatDetailPanel`。
- 先用占位猫图或现有 portrait，缺素材时生成猫咪立绘。

验收：

- 猫咪列表可切换。
- 详情属性正确显示。
- 升级消耗金币/钻石并提升属性。
- 喂猫粮改变体重阶段和生产倍率。

### M4：生产系统和建筑系统

目标：主循环能产生收益，建筑升级影响收益。

任务：

- `buildings.json` 写 B1-5F 初始建筑。
- 实现 `BuildingManager`、`ProductionManager`。
- 实现 `BuildingDetailPanel`。
- 每秒刷新楼层收益浮牌和顶栏资源。

验收：

- 咖啡豆足够时自动增加金币。
- 咖啡豆不足时暂停生产并提示。
- 建筑升级改变收益/容量等效果。
- 离线收益弹窗可显示并领取。

### M5：商店和背包

目标：资源闭环完整，玩家能购买、获得、使用物品。

任务：

- `items.json`、`shops.json`。
- 实现 `InventoryManager`、`ShopManager`。
- 实现 `ShopPanel`、`InventoryPanel`、`ItemGridCell`、`ShopListItem`。

验收：

- 商店分类和每日限购生效。
- 购买资源直接入账，购买道具进入背包。
- 背包物品可查看详情和使用。
- 碎片能合成猫咪。

### M6：研究系统

目标：科技树可升级并影响生产。

任务：

- `research.json`。
- 实现 `ResearchManager`、`ResearchPanel`、`ResearchNodeItem`。
- 接入生产公式。

验收：

- 前置节点控制解锁。
- 研究消耗资源，完成后加成生效。
- UI 状态与配置一致。

### M7：工厂外观和视觉精修

目标：页面观感开始贴近预览图。

任务：

- 生成或整理工厂楼层、角色、图标、面板素材。
- 实现 `FactorySkinPanel`。
- 精修主页面、猫咪页、建筑页、商店、背包、研究面板。
- 统一按钮、页签、卡片、弹窗样式。

验收：

- 主页面第一眼接近 `主页面.png`。
- 其他页面布局接近 `其他页面.png`。
- 所有文字不溢出、不遮挡。
- 常用按钮有按压/禁用/选中状态。

### M8：发射猫咪玩法

目标：完成可玩的特色互动。

任务：

- 实现 `LaunchManager`、`LaunchPanel`。
- 使用 Cocos 2D 物理或手写抛物线运动。
- 生成目标素材。
- 接入奖励和每日次数。

验收：

- 选择猫咪、拖拽、发射、碰撞、结算完整。
- 体重、等级、技能影响结果。
- 发射次数每日刷新并保存。

### M9：发布准备

目标：可部署。

任务：

- 新手引导最小版。
- 音效和按钮反馈。
- 存档版本迁移。
- Web 构建验证。
- Android APK 构建配置文档。
- 性能检查和资源压缩。

验收：

- Web 预览无报错。
- 主流程 15 分钟游玩不阻塞。
- 删除存档后能重新开始。
- 构建产物可部署到静态服务器。

## 8. 每次开发任务必须写日志

每次 AI 完成任务后，必须更新 `AI_WORK_LOG.md`，追加一条日志。

日志必须包含：

- 日期时间。
- 本次目标。
- 修改文件。
- 新增文件。
- 实现内容。
- 测试/验证结果。
- 已知问题。
- 下一步建议。

如果生成了素材，还必须记录：

- 生成工具/skill。
- prompt 摘要。
- 输出文件路径。
- 用途。
- 是否已导入 Cocos。

## 9. 下一次 AI 推荐第一步

从 M1 开始：

1. 读取 `AI_HANDOFF.md`、`AI_WORK_LOG.md`、`AI_DEVELOPMENT_PLAN.md`。
2. 在 `FATCATUI/assets/` 下建立新目录结构。
3. 实现 `EventBus`、`SaveManager`、`ResourceManager`、`GameApp`。
4. 新增 `initialSave.json`。
5. 在不破坏原示例的前提下创建一个最小启动验证入口。
