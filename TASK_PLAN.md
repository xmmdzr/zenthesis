# TASK_PLAN

## New policy from this milestone
- Update cadence: `TASK_PLAN.md`, `FINDINGS.md`, and `PROGRESS.md` are updated once per completed milestone.
- No action-level logging inside a milestone.

## Milestone Plan (2026-03-02 Vercel Build Patch: Prisma Generate)
- [x] Milestone 1: Ensure Prisma Client generation in install/build (`postinstall`, `build`)
- [x] Milestone 2: Update deployment doc with required Vercel env + database guidance
- [x] Final validation: local `npm run build` passes with `/api/ai/autocomplete` route collection

## Milestone Plan (2026-03-02 GitHub Launch + Collaboration)
- [x] Milestone 1: Repository cleanup and security prep (`.gitignore` media exclusions, local key placeholder)
- [x] Milestone 2: Initialize git and create initial commit baseline
- [x] Milestone 3: Collaboration guardrails (`README` contribution flow + PR template + CODEOWNERS + CI workflow)
- [x] Milestone 4: GitHub remote push and visibility verification
- [x] Milestone 5: Optional Vercel linkage checklist and final handoff verification

## Milestone Plan (2026-03-02 V3.2 Autocomplete Stability + Source Fallback)
- [x] Milestone 1: Align history conversation delete action column and keep confirm flow stable
- [x] Milestone 2: Refactor auto-complete toggle vs arrow panel open/close behavior
- [x] Milestone 3: Fix autocomplete request error propagation and DeepSeek observability chain
- [x] Milestone 4: Add unrestricted year/impact handling and library-empty => web-only effective source
- [x] Milestone 5: i18n additions + lint/test/build + DeepSeek runtime smoke verification

## Milestone Plan (2026-03-02 Chat Panel Enhancement V2)
- [x] Milestone 1: Conversation persistence data layer and APIs (`/api/ai/conversations`, `/api/ai/conversations/[id]`)
- [x] Milestone 2: Chat panel UI refactor (history dropdown, bubble spacing, remove `添加上下文`)
- [x] Milestone 3: Current document context wiring + chat persistence chain
- [x] Milestone 4: Attachment upload from chat (PDF/image) and library-conversation association
- [x] Final validation: lint + test + build + runtime smoke (`conversation + currentDoc + attachments`)

## Milestone Plan (2026-03-02 Chat + Autocomplete V3)
- [x] Milestone 1: Add conversation hard-delete API + store + UI action with confirm dialog
- [x] Milestone 2: Refine chat rendering (user adaptive bubbles, assistant paragraph style, thinking state)
- [x] Milestone 3: Add `/api/ai/autocomplete` and autocomplete settings/request types
- [x] Milestone 4: Wire editor autocomplete flow (debounced generation, grey suggestion, accept/retry, settings panel)
- [x] Milestone 5: i18n keys and server observability updates for delete/autocomplete
- [x] Final validation: lint + test + build

## Milestone Plan (2026-03-02 V3.1 Critical Fixes)
- [x] Milestone 1: Align history delete buttons and replace native confirm with in-panel confirmation modal
- [x] Milestone 2: Fix auto-complete panel open/close behavior and arrow toggle beside auto-complete button
- [x] Milestone 3: Stabilize auto-complete generation feedback (loading/error/retry) and settings effect chain
- [x] Milestone 4: i18n key completion for new error/confirmation copy
- [x] Final validation: lint + test + build

## Milestone Plan (2026-03-02 Panel Toggle + Chat Stability)
- [x] Milestone 1: Sidebar interaction refactor (`图书馆` / `AI聊天` click to expand, click again to collapse)
- [x] Milestone 2: DeepSeek fallback observability and root-cause tracing
- [x] Milestone 3: Chat input clearing + independent chat scroll area + workspace height constraints
- [x] Final validation: lint + test + build + runtime chat smoke check

## Milestone Plan (2026-03-01 DeepSeek Provider Switch)
- [x] Milestone 1: Replace MiniMax provider with DeepSeek provider implementation
- [x] Milestone 2: Switch AI service layer to `requestDeepSeekChat(...)` while keeping chat API contract unchanged
- [x] Milestone 3: Migrate env contract to `DEEPSEEK_*` and `AI_TIMEOUT_MS`
- [x] Milestone 4: Remove stale MiniMax provider references from active code paths
- [x] Milestone 5: Validation run (lint + test + build) and runtime connectivity verification

## Milestone Plan (2026-03-01 MiniMax Provider Switch)
- [x] Milestone 1: Replace OpenAI provider implementation with MiniMax chat-completions provider
- [x] Milestone 2: Switch environment contract to `MINIMAX_*` and remove stale OpenAI dependency
- [x] Final validation: lint + test + build

## Milestone Plan (2026-02-28 UI + Rich Editor + Temp Backend + OpenAI)
- [x] Milestone 1: Workspace detail fixes (secondary panel title size, language dropdown, collapsible chat panel)
- [x] Milestone 2: Four-language i18n baseline (provider, dictionary, locale persistence)
- [x] Milestone 3: Tiptap rich editor integration (replace textarea, editable flow after create)
- [x] Milestone 4: Editor insertion toolbar (image, table, formula, code)
- [x] Milestone 5: Temporary backend with Prisma + SQLite (auth/session APIs, cookie-driven user identity)
- [x] Milestone 6: Real AI provider integration (OpenAI Responses API with fallback behavior)
- [x] Final validation: lint + test + build

## Milestone Plan (2026-02-28 Workspace Functionalization)
- [x] Milestone 1: Workspace state context + user profile menu
- [x] Milestone 2: New document flow + docs API/type extensions
- [x] Milestone 3: History docs switching + editable save flow
- [x] Milestone 4: Source upload modal tabs + card action wiring
- [x] Milestone 5: UI cleanup + ThemeDock emphasis + dev indicator removal
- [x] Final validation: lint + test + build

## Milestone Plan (2026-02-27 UI Revamp)
- [x] Milestone 1: Collaboration docs policy refactor
- [x] Milestone 2: Visual baseline + theme entry relocation
- [x] Milestone 3: Home page redesign (Jenni-style hero + masonry)
- [x] Milestone 4: Auth pages redesign (Chinese, Google + email/password)
- [x] Milestone 5: Workspace shell refactor + `/app/docs/new`
- [x] Milestone 6: Chat toggles (`网络`/`图书馆`) + API passthrough
- [x] Final validation: lint + test + build

## Goal
Build the Zenthesis.ai MVP foundation with theme switching, core routes/shell pages, basic APIs, and collaboration tracking docs.

## Task Breakdown
- [x] Validate plugin command availability and environment state
- [x] Create planning fallback docs (`TASK_PLAN.md`, `FINDINGS.md`, `PROGRESS.md`)
- [x] Initialize Next.js + TypeScript project scaffold
- [x] Implement global theme system (`system` default + manual toggle + persistence)
- [x] Build landing pages (`/`, `/case-studies`, `/contact`)
- [x] Build auth pages (`/auth/login`, `/auth/register`)
- [x] Build app shell and routes (`/app/chat`, `/app/docs`, `/app/docs/[docId]`, `/app/library`, `/app/library/import`, `/app/settings`)
- [x] Add API routes for settings, docs, library imports, AI endpoints, usage, phone OTP stubs
- [x] Add Supabase integration scaffolding and SQL schema for `user_preferences`
- [x] Add basic tests for theme/API smoke checks
- [x] Run lint/build/test validations

## Blockers
- `plugin` CLI unavailable in current environment; plugin install flow cannot be executed here.

## Next Step
Bind temporary session/document flows to real auth and persistent backend storage.

## Milestone Update (2026-03-02 23:42:27 CST) - M1 完成
- 目标：账号模型与注册链路升级（username 强校验 + 唯一）
- 完成项：
  - [x] Prisma `User` 增加 `username` 唯一字段（迁移兼容为 nullable + 启动回填）
  - [x] 注册 API 增加 `username` 入参、正则校验、唯一性冲突处理
  - [x] 注册页增加用户名输入与规则提示
  - [x] 登录/`/api/auth/me` 返回 `username`
  - [x] 左上角展示优先使用 `username`
- 风险：历史数据存在空用户名，需要依赖启动回填在运行中补齐
- 下一入口：M2 文档示例标注与删除能力

## Milestone Update (2026-03-02 23:42:27 CST) - M2 完成
- 目标：文档示例标注 + 文档删除（含二次确认）
- 完成项：
  - [x] `DocumentItem` 增加 `isSample/isOwner`
  - [x] seed 文档改为唯一 ID，并标记 `isSample=true`
  - [x] 新增 `DELETE /api/docs/[id]`，仅 owner 可删
  - [x] 文档侧栏增加“示例”标签和删除确认弹层
  - [x] 删除当前文档后自动跳转到下一文档或 `/app/docs/new`
- 风险：Prisma 不可用时会回退内存存储，协作权限仅在 Prisma 路径完整
- 下一入口：M3 导出链路真文件下载

## Milestone Update (2026-03-02 23:48:17 CST) - M3 完成
- 目标：导出能力从占位改为真实文件下载（DOCX/PDF）
- 完成项：
  - [x] 接入 `docx`、`pdf-lib`、`@tiptap/html` 相关导出依赖
  - [x] 新增 `document-export` 转换模块，支持从 Tiptap JSON 生成导出内容
  - [x] `POST /api/docs/[id]/export` 改为直接返回文件流
  - [x] 编辑页右上新增导出菜单（Word/PDF）并触发真实下载
- 风险：复杂富文本（高阶表格/公式）当前按首版策略降级保留，非像素级一致
- 下一入口：M4 分享链接与协作编辑

## Milestone Update (2026-03-02 23:48:17 CST) - M4 完成
- 目标：分享链接 + 登录后协作编辑（实时协同）
- 完成项：
  - [x] Prisma 增加 `DocumentShareLink`、`DocumentCollaborator`
  - [x] 新增分享 API：`GET/POST/DELETE /api/docs/[id]/share`
  - [x] 新增链接解析 API：`GET /api/shared/[token]`
  - [x] 新增 `/app/shared/[token]` 页面，登录后解析链接并进入文档
  - [x] 编辑器接入 Supabase Realtime broadcast（`doc:{docId}`）+ presence track
  - [x] 远端内容更新可同步到本地编辑器，断连时回退现有 autosave
- 风险：未配置 `NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY` 时仅走非实时 autosave
- 下一入口：M5 质量门槛与 GitHub 同步

## Milestone Update (2026-03-02 23:48:17 CST) - M5 完成
- 目标：联调回归 + 发布准备
- 完成项：
  - [x] `npm run lint` 通过
  - [x] `npm run test` 通过
  - [x] `npm run build` 通过
  - [x] `bootstrap.sql` 已与最新 Prisma schema 对齐更新
  - [x] 登录页补充 `next` 跳转，确保分享链接登录后可回跳
- 风险：分享链接为“创建时返回明文一次”，刷新后需重新生成链接才能再次复制
- 下一入口：提交代码并推送到 GitHub 分支，发起 PR 合并

## Milestone Update (2026-03-03 22:46:00 CST) - V5 M1 完成
- 目标：DeepSeek 可用性检查 + 自动完成严格失败语义。
- 完成项：
  - [x] 新增 `GET /api/ai/health` 健康检查路由。
  - [x] `POST /api/ai/autocomplete` 改为 provider 失败时返回 `502`，不再伪成功。
  - [x] 编辑页自动完成开关旁新增 AI 可用性提示。
  - [x] 自动完成 prompt 增加章节标题、文档摘录、文档级约束；加入一次相关性重试。
- 风险：若环境变量中的 `DEEPSEEK_API_KEY` 为空，自动完成会被显式拦截。
- 下一入口：M2 新建文档双步骤流。

## Milestone Update (2026-03-03 22:46:00 CST) - V5 M2 完成
- 目标：新建文档改造为 Step1 -> Step2。
- 完成项：
  - [x] 重写 `new-document-modal`，实现双步骤流程。
  - [x] Step1 增加题目质量进度条（本地规则实时评分）。
  - [x] Step2 实现来源、年份、影响因子、引用格式、页码开关。
  - [x] `blank` 模式保持直达创建。
- 风险：评分规则是启发式，不等价于学术质量最终判定。
- 下一入口：M3 标准模式大纲注入。

## Milestone Update (2026-03-03 22:46:00 CST) - V5 M3 完成
- 目标：标准模式创建后自动注入基础大纲。
- 完成项：
  - [x] 新增 `doc-bootstrap`，实现标准模板大纲生成（H1/H2）。
  - [x] `POST /api/docs` 支持创建时注入 `contentJson/content`。
  - [x] `docs-store` 支持初始化内容写入。
- 风险：标准模板为首版结构，后续可按学科细分模板。
- 下一入口：M4 智能模式细纲生成。

## Milestone Update (2026-03-03 22:46:00 CST) - V5 M4 完成
- 目标：智能模式调用 DeepSeek 生成标题 + 分层细纲。
- 完成项：
  - [x] `ai.ts` 新增智能模式生成逻辑与输入意图判定（标题/上下文）。
  - [x] 模型输出 JSON 解析后转为 Tiptap 文档结构（H1/H2/H3）。
  - [x] 智能模式失败时返回明确错误并支持前端降级按钮。
- 风险：模型返回非结构化 JSON 时会触发错误提示并需重试。
- 下一入口：M5 文档级设置持久化与回归。

## Milestone Update (2026-03-03 22:46:00 CST) - V5 M5 完成
- 目标：文档级设置持久化 + 全量回归。
- 完成项：
  - [x] `Document` 增加 `creationSettings` 字段（schema + bootstrap）。
  - [x] `DocumentItem`、`AutoCompleteRequestPayload` 扩展新字段。
  - [x] `npm run lint` / `npm run test` / `npm run build` 全通过。
- 风险：本地已有旧 SQLite 库时，首次运行依赖运行时列补齐逻辑。
- 下一入口：联调 DeepSeek 真 key，并验证自动完成/智能模式内容相关性。

## V5.1 Milestone Update (2026-03-03)

### Goal
Fix DeepSeek key fallback reliability and make document deletion work for owner and collaborator scenarios.

### Milestones
- [x] M1 DeepSeek provider failover (`DEEPSEEK_API_KEY` -> backup -> key pool) and timeout alias support.
- [x] M2 Health/autocomplete observability and user-facing status clarity.
- [x] M3 Backend delete flow refactor (`hard_deleted` vs `removed_from_list`).
- [x] M4 Sidebar delete UX update with role-based confirmation text and error passthrough.

### Risks
- Existing leaked API keys should be rotated after validation.
- Fallback in-memory store does not fully model collaborator removal semantics.

### Next
- Verify on Vercel environment variables include backup key and timeout alias expectations.

## V5.2 Milestone Update (2026-03-04)

### Goal
Fix doc deletion reliability and update document activity time display rules.

### Completed
- [x] Added delete fallback in docs store to reduce false `document not found` under fallback/mixed state.
- [x] Stabilized frontend delete flow: await docs refresh and preserve role-based secondary confirmation.
- [x] Replaced doc list time label with 3-level display: minutes (<1h), hours (<24h), date (>=24h).
- [x] Added i18n keys for new time labels in zh/en/ru/fr.
- [x] Ran lint/test/build and API smoke checks.

### Risks
- In-memory fallback remains a local dev fallback only; production should rely on DB path.

### Next
- Push branch and open PR for full workspace sync to GitHub.
