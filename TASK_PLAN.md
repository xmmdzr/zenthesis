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
