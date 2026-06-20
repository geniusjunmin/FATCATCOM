# 肥猫咖啡公司素材生成记录

更新时间：2026-06-08

## 使用规则

- 每次使用 Codex 图片生成或接入外部素材后，都在本文件追加记录。
- 素材必须保存到 `FATCATUI/assets/resources/textures/generated/` 下的分类目录。
- 接入游戏 UI 后，记录接入文件、验证方式和剩余问题。

## 固定目录

- `FATCATUI/assets/resources/textures/generated/factory/`：主工厂楼层、机器、管线、室内道具。
- `FATCATUI/assets/resources/textures/generated/cats/`：猫咪立绘、头像、动作图。
- `FATCATUI/assets/resources/textures/generated/ui/`：按钮、徽章、资源条、面板部件。
- `FATCATUI/assets/resources/textures/generated/items/`：商店、背包、装备、消耗品图标。
- `FATCATUI/assets/resources/textures/generated/backgrounds/`：页面背景、室内背景、弹窗背景。

## 记录模板

```text
### YYYY-MM-DD 素材名称

- Task：
- 用途：
- Prompt 摘要：
- 输出文件：
- 接入位置：
- 验证结果：
- 剩余问题：
```

## 已知内嵌素材

### 2026-06-08 猫咪统一风格参考图

- Task：B007 / E003
- 用途：作为猫咪图鉴大立绘风格基准，后续可切分为单只透明立绘。
- 生成方式：Codex 内置图片生成功能。
- Prompt 摘要：五只圆润可爱的肥猫，暖色手绘咖啡工坊风格，橘猫、黑猫、白猫、三花猫、奶牛猫，带咖啡杯、火箭护目镜、豆罐、围巾、徽章等道具。
- 输出文件：`FATCATUI/assets/resources/textures/generated/cats/cat_lineup_reference_20260608.png`
- 接入位置：`FATCATUI/assets/scripts/ui/BottomNavUI.ts` 猫咪图鉴故事照片区域。
- 验证结果：已通过 `tools/check-client-ts.ps1`；已刷新 Cocos asset-db。
- 剩余问题：还需要切成单只透明立绘，替换当前猫咪缩略图放大展示。

### 2026-06-08 主工厂楼层补充素材

- Task：B002 / E002
- 用途：主工厂楼层中的机器、储物、发酵/储罐视觉补充。
- 生成方式：本地确定性 PNG 脚本 `tools/generate-ui-assets.ps1`。
- 输出文件：
  - `FATCATUI/assets/resources/textures/generated/factory/prop_roaster.png`
  - `FATCATUI/assets/resources/textures/generated/factory/prop_silos.png`
  - `FATCATUI/assets/resources/textures/generated/factory/prop_storage.png`
- 接入位置：`FATCATUI/assets/scripts/ui/BottomNavUI.ts` 主工厂楼层 `prop-asset` 叠加层。
- 验证结果：已通过 `tools/check-client-ts.ps1`；已刷新 Cocos asset-db。
- 剩余问题：后续可继续生成更接近目标图的逐层完整室内道具组合。

### 2026-06-08 商店与背包物品图标

- Task：E004
- 用途：商店商品卡、背包物品卡、背包资源卡图标。
- 生成方式：本地确定性 PNG 脚本 `tools/generate-ui-assets.ps1`。
- 输出文件：
  - `FATCATUI/assets/resources/textures/generated/items/icon_coffee_bean.png`
  - `FATCATUI/assets/resources/textures/generated/items/icon_cat_food.png`
  - `FATCATUI/assets/resources/textures/generated/items/icon_coin_pack.png`
  - `FATCATUI/assets/resources/textures/generated/items/icon_diamond.png`
- 接入位置：`FATCATUI/assets/scripts/ui/BottomNavUI.ts` 商店行、背包物品卡、背包资源卡。
- 验证结果：已通过 `tools/check-client-ts.ps1`；已刷新 Cocos asset-db。

### 2026-06-08 主界面功能图标

- Task：E005
- 用途：邮件、好友、成就、设置功能入口和提示卡图标。
- 生成方式：本地确定性 PNG 脚本 `tools/generate-ui-assets.ps1`。
- 输出文件：
  - `FATCATUI/assets/resources/textures/generated/ui/icon_mail.png`
  - `FATCATUI/assets/resources/textures/generated/ui/icon_friend.png`
  - `FATCATUI/assets/resources/textures/generated/ui/icon_achievement.png`
  - `FATCATUI/assets/resources/textures/generated/ui/icon_settings.png`
- 接入位置：`FATCATUI/assets/scripts/ui/BottomNavUI.ts` 主工厂右侧功能提示卡。
- 验证结果：已通过 `tools/check-client-ts.ps1`；已刷新 Cocos asset-db。

### 2026-06-08 单猫大立绘第一批

- Task：B003 / B007 / E008
- 用途：猫咪总览中央角色展示区，替换原先缩略图放大方案。
- 生成方式：本地确定性 PNG 脚本 `tools/generate-ui-assets.ps1`。
- 输出文件：
  - `FATCATUI/assets/resources/textures/generated/cats/cat_full_orange.png`
  - `FATCATUI/assets/resources/textures/generated/cats/cat_full_black.png`
  - `FATCATUI/assets/resources/textures/generated/cats/cat_full_white.png`
  - `FATCATUI/assets/resources/textures/generated/cats/cat_full_calico.png`
  - `FATCATUI/assets/resources/textures/generated/cats/cat_full_tuxedo.png`
- 接入位置：`FATCATUI/assets/scripts/ui/BottomNavUI.ts` 猫咪总览中央 `portrait-cat img`。
- 验证结果：已通过 `tools/check-client-ts.ps1`；已刷新 Cocos asset-db。
- 剩余问题：后续可继续使用 Codex 图片生成更精致的手绘单猫透明立绘替换当前确定性版本。

### 2026-06-08 猫咪装备图标第一批

- Task：B008 / D002 / E009
- 用途：猫咪总览装备栏和装备信息卡。
- 生成方式：本地确定性 PNG 脚本 `tools/generate-ui-assets.ps1`。
- 输出文件：
  - `FATCATUI/assets/resources/textures/generated/items/equip_collar.png`
  - `FATCATUI/assets/resources/textures/generated/items/equip_cup.png`
  - `FATCATUI/assets/resources/textures/generated/items/equip_cushion.png`
  - `FATCATUI/assets/resources/textures/generated/items/equip_locked.png`
- 接入位置：`FATCATUI/assets/scripts/ui/BottomNavUI.ts` 猫咪总览装备栏、装备焦点卡。
- 验证结果：已通过 `tools/check-client-ts.ps1`；已刷新 Cocos asset-db。

### 2026-06-08 猫咪技能图标第一批

- Task：B008 / D002 / E010
- 用途：猫咪总览信息、技能、招募、默认焦点卡。
- 生成方式：本地确定性 PNG 脚本 `tools/generate-ui-assets.ps1`。
- 输出文件：
  - `FATCATUI/assets/resources/textures/generated/ui/skill_producer.png`
  - `FATCATUI/assets/resources/textures/generated/ui/skill_launcher.png`
  - `FATCATUI/assets/resources/textures/generated/ui/skill_saver.png`
  - `FATCATUI/assets/resources/textures/generated/ui/skill_support.png`
- 接入位置：`FATCATUI/assets/scripts/ui/BottomNavUI.ts` 猫咪总览焦点信息卡。
- 验证结果：已通过 `tools/check-client-ts.ps1`；已刷新 Cocos asset-db。

### 2026-06-08 历史内嵌素材盘点

- Task：E006
- 用途：记录当前已存在的内嵌视觉资源，避免后续重复生成。
- 输出文件：`FATCATUI/assets/scripts/ui/GeneratedUiAssets.ts`
- 已知内容：主工厂背景、猫咪详情背景、橘/黑/白猫缩略图 Data URI。
- 接入位置：`FATCATUI/assets/scripts/ui/BottomNavUI.ts`
- 验证结果：本轮未重新生成素材，仅建立后续素材记录表。

# 2026-06-10 工厂 PNG 与 Data URI 桥接记录

- Task：B001、B002、D002、D004、H005。
- 用途：主界面楼层机器/家具/仓储道具显示。
- 输出 PNG：
  - `FATCATUI/assets/resources/textures/generated/factory/prop_office.png`
  - `FATCATUI/assets/resources/textures/generated/factory/prop_roaster.png`
  - `FATCATUI/assets/resources/textures/generated/factory/prop_silos.png`
  - `FATCATUI/assets/resources/textures/generated/factory/prop_mill.png`
  - `FATCATUI/assets/resources/textures/generated/factory/prop_cafe.png`
  - `FATCATUI/assets/resources/textures/generated/factory/prop_storage.png`
- 输出注册表：`FATCATUI/assets/scripts/ui/FactoryPropDataUris.ts`
- 生成脚本：
  - `tools/generate-ui-assets.ps1`
  - `tools/generate-factory-prop-data-uris.ps1`
- 接入位置：`BottomNavUI.ts` 主工厂楼层 `.prop-asset` 背景图。
- 验证结果：四尺寸截图回归无 console error、无 failed request；DOM 直链资源已被 Data URI 替代。
# 2026-06-10 DOM 图片 Data URI 注册表

- Task：B003、D004、H005。
- 用途：猫咪详情页、商店、背包、右侧功能按钮等 DOM overlay 图片资源稳定显示。
- 新增生成脚本：`tools/generate-dom-asset-data-uris.ps1`。
- 新增注册表：`FATCATUI/assets/scripts/ui/DomAssetDataUris.ts`。
- 覆盖素材：猫咪详情背景、猫咪缩略图、5 张猫咪立绘、咖啡豆/猫粮/金币/钻石商品图标、装备图标、邮件/好友/成就/设置图标、技能图标。
- 接入位置：`FATCATUI/assets/scripts/ui/BottomNavUI.ts` 的 `getDomAssetDataUri()`、猫咪页背景/立绘/缩略图、装备/技能图标、商店/背包/功能入口图标。
- 验证结果：`node tools/verify-ui-clicks-playwright.js` 通过，猫咪按钮与底部导航全部可点击，`messages=[]`，`failedRequests=[]`；四尺寸主界面截图回归仍无资源失败。
- 注意：未把 `cat_lineup_reference_20260608.png` 放入 Data URI 注册表，该图体积过大；猫咪故事照片改用当前猫咪立绘。
