# 肥猫咖啡公司 AI 开发进度更新规则

更新时间：2026-06-08

## 1. 每次开发前

必须先读取：

1. `docs/ai-progress/00_PROJECT_DIRECTION.md`
2. `docs/ai-progress/01_DETAILED_PLAN.md`
3. `docs/ai-progress/02_TASKS.md`
4. `docs/ai-progress/03_UPDATE_RULES.md`
5. `docs/ai-progress/04_ASSET_LOG.md`
6. `AI_WORK_LOG.md` 最近记录

然后确定本轮要推进的 task 编号，例如：

```text
本轮推进：B003、B004、B005
```

## 2. 每次开发中

如果修改 UI：

- 对照项目根目录目标 UI 图片。
- 如果缺少元素图片，优先判断是否需要生成本地素材。
- 使用 Codex 图片生成功能生成素材时，保存到 `FATCATUI/assets/resources/textures/generated/` 下对应分类。
- 刷新 Cocos asset-db。
- 记录素材路径和用途到 `docs/ai-progress/04_ASSET_LOG.md`。

如果修改逻辑：

- 保持配置驱动。
- 不把经济数值硬编码进 UI。
- 尽量通过 Manager 修改存档和资源。
- 重要状态通过 EventBus 或明确回调刷新 UI。

如果修改 `BottomNavUI.ts`：

- 优先小步修改。
- 注意它已是高风险大文件。
- 能拆分时优先拆分。

## 3. 每次开发后必须更新

### 3.1 更新 `02_TASKS.md`

修改对应 task 状态：

- 未开始 `[ ]`
- 进行中 `[~]`
- 完成 `[x]`
- 阻塞 `[!]`

并在 task 下追加：

```text
- 更新：YYYY-MM-DD，完成了什么，验证了什么，剩余什么。
```

### 3.2 更新 `01_DETAILED_PLAN.md`

如果某个模块状态发生变化，修改对应“现状/差距/推进方式”。

### 3.3 更新 `AI_WORK_LOG.md`

按照已有模板追加日志：

```text
## YYYY-MM-DD HH:mm 任务名

本次目标：

- 

新增文件：

- 

修改文件：

- 

实现内容：

- 

测试/验证结果：

- 

素材生成记录：

- 未生成素材。

已知问题：

- 

下一步建议：

- 
```

### 3.4 必要时更新 `AI_HANDOFF.md`

当出现新的重大入口、重大阻塞、服务端工程创建、运行方式变化时，更新 `AI_HANDOFF.md`。

## 4. 验证记录规范

客户端 UI 任务至少记录：

- TypeScript 检查是否通过。
- Cocos asset-db 是否刷新。
- 浏览器是否验证。
- 验证的分辨率。
- console 是否有新增错误。

当前固定命令和目录：

- TypeScript 相关文件过滤检查：`.\tools\check-client-ts.ps1`
- 浏览器点击验证脚本：`tools/verify-ui-clicks.browser.js`
- 截图目录：`docs/verification/screenshots/`
- 详细命令说明：`docs/verification/CLIENT_CHECKS.md`

服务端任务至少记录：

- `dotnet build`。
- `dotnet test`。
- API 手动或自动验证。
- 数据库迁移情况。

## 5. 素材记录规范

每个生成素材必须记录：

- Task 编号。
- Prompt 摘要。
- 保存路径。
- 是否已接入。
- 视觉验证结果。
- 记录文件：`docs/ai-progress/04_ASSET_LOG.md`

推荐路径：

```text
FATCATUI/assets/resources/textures/generated/factory/
FATCATUI/assets/resources/textures/generated/cats/
FATCATUI/assets/resources/textures/generated/ui/
FATCATUI/assets/resources/textures/generated/items/
FATCATUI/assets/resources/textures/generated/backgrounds/
```

## 6. 阶段完成定义

一个阶段只有同时满足以下条件才算完成：

- 对应 task 全部为 `[x]`。
- 代码已验证。
- UI 已截图或浏览器确认。
- 计划和 task 文件已更新。
- `AI_WORK_LOG.md` 已记录。

## 7. 当前最高优先级

1. 继续让 UI 向四张目标图靠拢。
2. 先完成猫咪总览页，因为它是当前和目标图差距最大的核心页面。
3. 同步开始拆分 `BottomNavUI.ts`，避免后续 UI 越做越难维护。
4. UI 达到阶段性可接受后，再创建 .NET Core 服务端。
