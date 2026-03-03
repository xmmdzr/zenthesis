# PROGRESS

## New policy from this milestone
- Progress updates are now written once per completed milestone.
- Action-level logs remain only for historical entries below this section.

## Milestone Logs (2026-03-02 GitHub Launch + Collaboration)
- Milestone: 1 - Repository cleanup and security prep
- Goal: Prepare codebase for public GitHub push without media bloat or secret leakage.
- Completed:
- Updated `.gitignore` with root media exclusions for screenshots, recordings, and reference PDF.
- Replaced local `DEEPSEEK_API_KEY` with placeholder and explicit rotation note.
- Kept `.env*` ignore rule active to prevent accidental secret commits.
- Residual risk: External key rotation still required in provider console.
- Next milestone: 2 - Git initialization and baseline commit.

## Milestone Logs (2026-03-02 V3.2 Autocomplete Stability + Source Fallback)
- Milestone: 1 - History dropdown delete alignment
- Goal: Eliminate visual misalignment of delete actions across variable preview heights.
- Completed:
- Refined history row container to fixed two-column track with stable min-height.
- Centered delete button in a fixed action column and stabilized time-line height.
- Residual risk: Datetime localization width may require follow-up clipping in very narrow layouts.
- Next milestone: 2 - Autocomplete switch/arrow panel behavior refactor.

## Milestone Logs (2026-03-02 V3.1 Critical Fixes)
- Milestone: 1 - History delete alignment and confirmation UX
- Goal: Fix misaligned delete icons and replace browser confirm with consistent in-app confirmation.
- Completed:
- Switched history row structure to stable two-column layout.
- Added in-panel delete confirmation modal and error feedback for failed delete.
- Residual risk: Dialog remains feature-local component.
- Next milestone: 2 - Auto-complete panel toggle behavior.

- Milestone: 2 - Auto-complete panel open/close correction
- Goal: Make settings panel actually collapsible and controlled by arrow button beside auto-complete.
- Completed:
- Decoupled enable toggle from panel open state.
- Added up/down arrow toggle and click-away collapse behavior.
- Residual risk: Escape-key close not yet wired.
- Next milestone: 3 - Auto-complete reliability and feedback.

- Milestone: 3 - Auto-complete reliability and feedback visibility
- Goal: Ensure users can see generation progress/failure and recover via retry.
- Completed:
- Added explicit failure message state in suggestion block.
- Preserved debounce generation and retry pipeline; settings changes now apply on next generation.
- Auto-complete disable now clears suggestion/error immediately.
- Residual risk: Retrieval constraints are still prompt-guidance only.
- Next milestone: 4 - i18n completion and regression checks.

- Milestone: 4 - i18n completion and regression checks
- Goal: Add missing copy keys and verify no regressions.
- Completed:
- Added missing keys in zh/en/ru/fr for delete failure and autocomplete failure.
- Passed `npm run lint`, `npm run test`, and `npm run build`.
- Residual risk: None blocking for requested hotfix scope.
- Next milestone: Optional interaction polish pass.

## Milestone Logs (2026-03-02 Chat + Autocomplete V3)
- Milestone: 1 - Conversation history hard delete
- Goal: Allow users to delete old history entries from the dropdown with explicit confirmation.
- Completed:
- Implemented `DELETE /api/ai/conversations/[id]`.
- Added store-level delete operation removing conversation/messages/attachment links.
- Added dropdown delete button and confirmation prompt in chat panel.
- Residual risk: Delete is irreversible (by design in this round).
- Next milestone: 2 - Chat rendering and processing state.

- Milestone: 2 - Chat message style + processing state
- Goal: Match reference by making user bubbles adaptive and assistant replies non-bubble, with visible waiting status.
- Completed:
- User messages now render as right-side adaptive bubbles.
- Assistant messages now render as left paragraph text blocks.
- Added spinner + elapsed seconds indicator while waiting for assistant response.
- Residual risk: Assistant markdown formatting remains plain text display.
- Next milestone: 3 - Autocomplete API and type contracts.

- Milestone: 3 - Autocomplete API + type expansion
- Goal: Add backend endpoint and contracts for editor auto-complete suggestions.
- Completed:
- Added autocomplete request/response/settings types.
- Added `/api/ai/autocomplete` with validation and fallback logging.
- Added `aiAutocomplete(...)` to AI service.
- Residual risk: Settings act as prompt constraints only, not retrieval execution filters.
- Next milestone: 4 - Editor integration.

- Milestone: 4 - Editor integration (settings + suggestion accept/retry)
- Goal: Make bottom auto-complete control functional with screenshot-like interaction.
- Completed:
- Added toggle + settings panel for source/year/impact controls.
- Added per-document localStorage persistence for settings.
- Added debounced generation (1200ms), gray suggestion text, and `接受/重试` actions.
- Accept action inserts suggestion into normal editor content.
- Residual risk: Generation granularity is single-sentence by default.
- Next milestone: 5 - i18n and observability.

- Milestone: 5 - i18n and observability
- Goal: Complete key copy additions and logging visibility.
- Completed:
- Added chat delete/thinking and autocomplete settings keys in zh/en/ru/fr.
- Added delete and autocomplete fallback server logs for debugging.
- Residual risk: Non-Chinese copy can be refined by native-language QA later.
- Next milestone: Final validation.

- Milestone: Final validation
- Goal: Ensure no regressions after full V3 integration.
- Completed:
- `npm run lint` passed.
- `npm run test` passed (4 files, 8 tests).
- `npm run build` passed; new route `/api/ai/autocomplete` present.
- Residual risk: None blocking for requested scope.
- Next milestone: Optional enhancement pass (undo delete, richer assistant rendering).

## Milestone Logs (2026-03-02 Chat Panel Enhancement V2)
- Milestone: 1 - Conversation persistence data layer and APIs
- Goal: Persist account-level chat sessions/messages and expose history endpoints for dropdown selection.
- Completed:
- Added chat schema models (`AIConversation`, `AIMessage`, `AIConversationLibraryItem`) and chat store operations.
- Added `/api/ai/conversations` (GET/POST) and `/api/ai/conversations/[id]` (GET).
- Residual risk: Formal migration versioning still needed beyond local bootstrap.
- Next milestone: 2 - Chat panel UI refactor.

- Milestone: 2 - Chat panel UI refactor (history dropdown + message spacing)
- Goal: Implement history dropdown interaction and improve dialogue readability.
- Completed:
- Added clock-triggered history dropdown and selectable conversation list.
- Removed `添加上下文` button from the chat panel.
- Switched to left/right bubble layout with looser spacing between messages.
- Residual risk: Minor visual tuning may still be needed against final design references.
- Next milestone: 3 - Current document context and persistence.

- Milestone: 3 - Current document context + conversation persistence
- Goal: Make `当前文档` switch effective and inject active document into AI context.
- Completed:
- Extended chat request with `conversationId`, `useCurrentDoc`, and `attachmentItemIds`.
- `/api/ai/chat` now reads conversation history/current doc/attachments and persists user+assistant messages.
- Added context assembly logic in AI service while preserving public response contract.
- Residual risk: Full-document context can increase token cost for large docs.
- Next milestone: 4 - Attachment upload and library linking.

- Milestone: 4 - Attachment upload and conversation-library linking
- Goal: Enable chat link button to upload PDF/image and associate files with current conversation.
- Completed:
- Added multipart upload route `/api/library/import/upload` with mime and size checks.
- Chat panel link action now uploads files, creates library items, and surfaces removable attachment chips.
- Conversation attachment linkage is persisted and restored when reopening history sessions.
- Residual risk: No OCR/PDF text extraction yet; metadata-level context only.
- Next milestone: Final validation.

- Milestone: Final validation
- Goal: Confirm no regression in quality gates and key runtime paths.
- Completed:
- `npm run lint` passed.
- `npm run test` passed (4 files, 8 tests).
- `npm run build` passed and includes new conversation/upload APIs.
- Runtime smoke passed for create conversation, upload files, chat send, and fetch conversation detail.
- Residual risk: None blocking for requested milestone scope.
- Next milestone: Optional UX enhancements (conversation rename/delete, attachment preview).

## Milestone Logs (2026-03-02 Panel Toggle + Chat Stability)
- Milestone: 1 - Sidebar interaction refactor
- Goal: Make `图书馆` and `AI聊天` behave as open/close panel toggles instead of one-way navigation.
- Completed:
- Added `leftPanelMode` + panel actions to workspace context.
- Updated sidebar to use toggle buttons for `图书馆` and `AI聊天` with no active highlight.
- Updated shell to render left secondary panel from state and let center region auto-expand when panel is closed.
- Residual risk: Need follow-up runtime checks for route-entry edge cases (`/app/library`, `/app/chat`).
- Next milestone: 2 - AI fallback observability.

- Milestone: 2 - AI fallback observability and root-cause tracing
- Goal: Explain exactly why chat enters fallback without changing public API response shape.
- Completed:
- Refactored DeepSeek provider to return structured result with reason/status/upstream message.
- Added fallback logging in `/api/ai/chat` to surface reason and upstream status.
- Fixed provider JSON parse failure handling so route no longer falls back due uncaught exceptions.
- Runtime check (node -> local `/api/ai/chat`) now returns real DeepSeek response with `deepseek-chat`.
- Residual risk: Auth bootstrap still emits Prisma table-missing warnings in local logs.
- Next milestone: 3 - input clearing and scroll isolation.

- Milestone: 3 - Chat UX stability and layout containment
- Goal: Stop stale input retention and prevent chat history from extending page height.
- Completed:
- Input is cleared immediately after submit.
- Added chat message auto-scroll and isolated scroll container (`overflow-y-auto`).
- Added workspace height/overflow constraints so center area expands/collapses with side panels instead of expanding document height.
- Validation passed: `npm run lint`, `npm run test`, `npm run build`.
- Residual risk: None blocking for requested behavior.
- Next milestone: Monitor real-user interaction and tune responsive behavior if needed.

## Milestone Logs (2026-03-01 DeepSeek Provider Switch)
- Milestone: 1 - Replace MiniMax provider with DeepSeek provider
- Goal: Switch chat model integration to DeepSeek without changing front-end contract.
- Completed:
- Added `src/lib/ai/deepseek-provider.ts` and wired OpenAI-compatible `chat/completions` call.
- Preserved timeout, parse, and failure-return-null behavior for fallback compatibility.
- Residual risk: Provider success depends on model id availability in the current DeepSeek account.
- Next milestone: 2 - Switch AI service layer.

- Milestone: 2 - AI service layer migration
- Goal: Keep `/api/ai/chat` request/response protocol stable while changing backend provider.
- Completed:
- Updated `src/lib/ai.ts` import/call path to `requestDeepSeekChat(...)`.
- Updated fallback copy to `DEEPSEEK_API_KEY`.
- Residual risk: Only chat path is provider-backed in this milestone.
- Next milestone: 3 - Env migration.

- Milestone: 3 - Environment contract migration
- Goal: Replace `MINIMAX_*` config contract with `DEEPSEEK_*`.
- Completed:
- Updated `.env.example` keys to `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, `DEEPSEEK_BASE_URL`, `AI_TIMEOUT_MS`.
- Updated local `.env.local` for DeepSeek runtime config.
- Residual risk: Exposed keys should be rotated before any shared deployment.
- Next milestone: 4 - Remove stale provider references.

- Milestone: 4 - Cleanup old provider
- Goal: Eliminate MiniMax runtime dependency and dead references.
- Completed:
- Removed `src/lib/ai/minimax-provider.ts`.
- Verified no MiniMax markers in active source/env/readme paths.
- Residual risk: Historical logs still mention MiniMax by design.
- Next milestone: 5 - Validation and runtime checks.

- Milestone: 5 - Validation and runtime checks
- Goal: Confirm build quality and runtime behavior after provider switch.
- Completed:
- Validation passed: `npm run lint`, `npm run test`, `npm run build`.
- Runtime notes:
- Local `/api/ai/chat` probes from this environment return `502` at transport layer.
- Direct DeepSeek HTTP probe succeeds in reaching provider but returns `Model Not Exist` for configured `DeepSeek-V3.2`.
- Residual risk: Real-model responses require correcting `DEEPSEEK_MODEL` to an available id.
- Next milestone: Align configured model id with account-available DeepSeek model and rerun runtime route check.

## Milestone Logs (2026-03-01 MiniMax Provider Switch)
- Milestone: 1 - Replace OpenAI provider with MiniMax provider
- Goal: Route chat generation through MiniMax API/model without changing front-end chat contract.
- Completed:
- Added MiniMax provider module using official compatible `chat/completions` endpoint.
- Updated AI service import path and fallback prompt for missing provider key.
- Residual risk: Provider implementation is request/response only, not streaming.
- Next milestone: 2 - Env/dependency alignment and validation.

- Milestone: 2 - Env contract migration and final validation
- Goal: Align runtime config and dependencies to MiniMax-only path.
- Completed:
- Switched `.env.example` keys from `OPENAI_*` to `MINIMAX_*`.
- Removed `openai` dependency and created local `.env.local` with MiniMax model config for runtime verification.
- Validation passed: `npm run lint`, `npm run test`, `npm run build`.
- Residual risk: Security/compliance review is still needed before production secret rotation.
- Next milestone: Provider abstraction for multi-model failover.

## Milestone Logs (2026-02-28 UI + Rich Editor + Temp Backend + OpenAI)
- Milestone: 1 - Workspace detail fixes
- Goal: Adjust secondary panel typography, add language selector dropdown, and enable chat panel collapse.
- Completed:
- Updated workspace secondary panel heading sizes.
- Implemented language dropdown in ThemeDock with 4 language options.
- Moved chat message state into workspace context and enabled panel collapse without losing history.
- Residual risk: `/app/chat` uses route-entry auto-open; product may later want custom empty placeholder when collapsed.
- Next milestone: 2 - i18n foundation and locale persistence.

- Milestone: 2 - Four-language i18n infrastructure
- Goal: Introduce key-based translations and locale persistence (`zh/en/ru/fr`) across core UI.
- Completed:
- Added dictionaries and i18n provider/hook.
- Wired locale persistence into preferences API and client state.
- Migrated major public/auth/workspace UI strings to i18n keys.
- Residual risk: A small subset of demo text is locale-conditional inline copy.
- Next milestone: 3 - rich editor integration.

- Milestone: 3 - Rich editor replacement
- Goal: Replace plain textarea with Tiptap-based rich text editing.
- Completed:
- Added Tiptap editor with starter kit, heading/list/quote/code support.
- Added `contentJson` handling in types, editor state, and docs API update payload.
- Ensured newly created docs open directly in editable mode.
- Residual risk: Rich collaboration/versioning not included in this milestone.
- Next milestone: 4 - insertion toolbar.

- Milestone: 4 - Insertion toolbar and formatting actions
- Goal: Provide bottom toolbar for image/table/formula/code insertion and quick structure controls.
- Completed:
- Implemented bottom insertion controls with actual editor commands.
- Added formula input popover and inline math insertion.
- Added text structure quick actions matching requested screenshot trend.
- Residual risk: Formula input UX is intentionally lightweight.
- Next milestone: 5 - temporary backend.

- Milestone: 5 - Prisma+SQLite temporary backend and auth
- Goal: Validate user registration/login/session persistence in repository-local backend.
- Completed:
- Added Prisma schema and generated client.
- Added auth APIs (`register/login/logout/me`) with bcrypt hashing + httpOnly session cookie.
- Updated request-user flow to cookie session first, header fallback second.
- Refactored docs/library/usage/preferences stores to Prisma-first behavior.
- Residual risk: `prisma db push` failed in this environment; schema bootstrap was done via SQL diff script and SQLite apply.
- Next milestone: 6 - OpenAI model integration.

- Milestone: 6 - OpenAI integration + full validation
- Goal: Replace chat mock behavior with real model provider while keeping backward-compatible response structure.
- Completed:
- Added OpenAI provider integration using Responses API.
- Kept model-off fallback response path when API key is absent.
- Passed validation: `npm run lint`, `npm run test`, `npm run build`.
- Residual risk: Non-chat AI routes still use scaffold logic.
- Next milestone: Production-grade AI governance (rate limits, observability, billing and privacy controls).

## Milestone Logs (2026-02-27 UI Revamp)
- Milestone: 1 - Collaboration docs policy refactor
- Goal: Switch TASK/FINDINGS/PROGRESS to milestone-level update cadence.
- Completed:
- Added policy section in all three docs.
- Added milestone checklist and next-step pointers.
- Residual risk: Policy drift if future updates are done at action granularity.
- Next milestone: 2 - Visual baseline update and theme entry relocation.

- Milestone: 2 - Visual baseline + theme entry relocation
- Goal: Move theme entry to workspace sidebar and align core color direction.
- Completed:
- Removed root-level floating theme button from global layout.
- Added compact theme control in workspace left sidebar bottom.
- Shifted global CSS palette to reference-aligned light gray background and indigo accent.
- Residual risk: Sidebar-only theme entry is unavailable on unauthenticated pages by design.
- Next milestone: 3 - Home page redesign.

- Milestone: 3 - Home page redesign (Jenni-style hero + masonry)
- Goal: Align landing page to reference style while preserving masonry requirement.
- Completed:
- Replaced old landing page with centered hero, CTA, social-proof text, and preview workspace panel.
- Kept masonry feature section and moved it below hero.
- Updated public header styling and Chinese-first nav labels.
- Residual risk: Marketing nav destinations are currently mapped to existing placeholder routes.
- Next milestone: 4 - Auth pages redesign.

- Milestone: 4 - Auth pages redesign (Chinese, Google + email/password)
- Goal: Match login/register visual structure from reference screenshot.
- Completed:
- Implemented centered login card with Google action, divider, email/password inputs, and primary CTA.
- Implemented parallel register page with same layout and Chinese text.
- Added top decorative strip and removed public navigation from auth screens.
- Residual risk: Submit buttons remain non-integrated UI stubs.
- Next milestone: 5 - Workspace shell refactor and `/app/docs/new`.

- Milestone: 5 - Workspace shell refactor and `/app/docs/new`
- Goal: Match post-login structure with route-driven side panels and new default landing page.
- Completed:
- Added route-aware workspace shell with left nav, conditional left secondary panel, and conditional right chat panel.
- Redirected `/app` to `/app/docs/new`.
- Implemented `/app/docs/new` center empty state with `新建文档` CTA.
- Unified main workspace content into reusable Chinese-first document canvas component.
- Residual risk: Editor behavior remains scaffolded UI.
- Next milestone: 6 - Chat tool toggles and API passthrough.

- Milestone: 6 - Chat toggles and API passthrough
- Goal: Add `网络`/`图书馆` switches and send them through `/api/ai/chat`.
- Completed:
- Implemented interactive right-panel chat with prompt submission.
- Added payload fields `useWeb`, `useLibrary`, and `contextDocId` to chat requests.
- Extended API validation and AI response with `toolContext` passthrough echo.
- Added `ai.test.ts` to verify default and explicit tool-context behavior.
- Residual risk: Tool switches are payload-level controls only; no real retrieval wiring yet.
- Next milestone: Final validation.

- Milestone: Final validation
- Goal: Ensure the full UI/API refactor compiles and passes quality gates.
- Completed:
- `npm run lint` passed.
- `npm run test` passed (4 files, 8 tests).
- `npm run build` passed and generated planned routes including `/app/docs/new`.
- Residual risk: None blocking for scaffold-level delivery.
- Next milestone: Backend integration for production auth/editor/library flows.

## Milestone Logs (2026-02-28 Workspace Functionalization)
- Milestone: 1 - Workspace state context and user profile menu
- Goal: Replace static sidebar identity with interactive user menu and unified workspace UI state.
- Completed:
- Added context state for active doc, modals, chat panel, source tab, and user menu.
- Added avatar/username dropdown with quota lines, settings, and logout action.
- Residual risk: User session remains mock-only.
- Next milestone: 2 - New document flow and API/type extensions.

- Milestone: 2 - New document flow and docs API contract
- Goal: Make new document creation interactive and typed by draft mode.
- Completed:
- Expanded document types/store/API (`status`, `draftType`, `createdAt`).
- Implemented screenshot-7 style new-document modal with three modes.
- Residual risk: Smart title generation is placeholder logic.
- Next milestone: 3 - Docs switching and save flow.

- Milestone: 3 - Docs switching and editable save flow
- Goal: Enable switching among historical docs with editable right-side content.
- Completed:
- Document panel now fetches history docs and supports route-based switching.
- Editor now supports direct edit with auto-save + manual save.
- Empty docs render starter action cards.
- Residual risk: Rich-text behavior not included in this phase.
- Next milestone: 4 - Source modal and starter action wiring.

- Milestone: 4 - Source modal tabs and action wiring
- Goal: Deliver screenshot 8-12 source upload interactions and connect starter cards.
- Completed:
- Added tabbed source modal (PDF/Zotero/Mendeley/bib-ris/ID) and local Word import modal.
- Wired card interactions and library-entry modal triggers.
- Residual risk: External service auth flows are placeholders.
- Next milestone: 5 - Cleanup and theme emphasis.

- Milestone: 5 - Cleanup, ThemeDock emphasis, dev indicator removal, validation
- Goal: Remove redundant UI and align left-bottom controls with screenshot 13.
- Completed:
- Removed `完成设置` block; added standalone ThemeDock.
- Disabled black `N` dev indicator with `devIndicators: false`.
- Passed `npm run lint`, `npm run test`, `npm run build`.
- Residual risk: None blocking for current functional scope.
- Next milestone: Real backend session and persistence integration.

## 2026-02-27
- Action: Checked repository and plugin availability.
- Command Summary: `ls -la`, `command -v plugin`, `plugin --help`.
- Result: Repo empty; plugin command missing.
- Rollback Point: No code changes yet.

- Action: Created fallback collaboration tracking docs.
- Command Summary: Wrote `TASK_PLAN.md`, `FINDINGS.md`, `PROGRESS.md` templates.
- Result: Tracking system established in repo root.
- Rollback Point: Remove the three markdown files to revert.

- Action: Initialized Next.js scaffold through temp directory workaround.
- Command Summary: `npx create-next-app` in `tmp_next_init_20260227`, then copied files to repo root.
- Result: Base Next.js (App Router + TS + Tailwind + ESLint) project files are present in root.
- Rollback Point: Restore project root from clean commit.

- Action: Installed dependencies with local npm cache.
- Command Summary: `npm install --cache .npm-cache`.
- Result: All dependencies installed successfully; avoids `~/.npm` permission issue.
- Rollback Point: Remove `node_modules` and reinstall if needed.

- Action: Added architecture code scaffolding and app routes.
- Command Summary: Created components, pages, workspace shell, route handlers, data stores, and Supabase schema file.
- Result: Implemented `/`, `/case-studies`, `/contact`, `/auth/*`, `/app/*`, and all requested `/api/*` endpoint skeletons.
- Rollback Point: Revert files under `src/` and `supabase/schema.sql`.

- Action: Implemented theme system.
- Command Summary: Added `next-themes` provider, global toggle button, persisted theme key, and no-FOUC init script.
- Result: Theme defaults to system with manual light/dark/system cycle and settings page sync API call.
- Rollback Point: Revert `src/app/layout.tsx`, `src/app/globals.css`, and theme components/lib.

- Action: Added test suite and fixed lint issue.
- Command Summary: Created Vitest config + tests; adjusted `theme-toggle` to satisfy eslint rule.
- Result: `npm run lint` and `npm run test` now pass.
- Rollback Point: Revert `vitest.config.ts` and `src/lib/__tests__`.

- Action: Ran production build validation.
- Command Summary: `npm run build`.
- Result: Build passed; all planned routes compiled and generated successfully.
- Rollback Point: N/A (no tracked source mutation from build artifacts).

- Action: Added project docs and env template.
- Command Summary: Wrote `.env.example` and replaced `README.md` with implementation-specific instructions.
- Result: Setup and handoff documentation now matches implemented architecture.
- Rollback Point: Restore previous README and env template.
- Milestone: 2 - Autocomplete toggle/arrow behavior
- Goal: Ensure `自动完成` and settings panel controls do not conflict.
- Completed:
- Updated footer controls so `自动完成` toggles enable state only.
- Updated arrow control to toggle panel only when autocomplete is enabled.
- Preserved deterministic close behavior when autocomplete is turned off.
- Residual risk: Icon-only arrow may need tooltip if discoverability issues appear.
- Next milestone: 3 - Autocomplete request failure chain and DeepSeek observability.
- Milestone: 3 - Autocomplete error propagation and normalization
- Goal: Stop opaque autocomplete failures and improve resiliency of settings input.
- Completed:
- Updated autocomplete request path to throw and expose backend `error/message` on non-2xx responses.
- Added explicit catch handling in rich editor suggestion generation flow.
- Added backend settings normalization for numeric parsing, preset validation, and min/max ordering.
- Residual risk: Prompt-level constraints remain heuristic, not hard retrieval filters.
- Next milestone: 4 - Library-empty effective source fallback.
- Milestone: 4 - Unrestricted filters + effective source fallback
- Goal: Allow no year/impact limits and keep autocomplete usable when library has no file resources.
- Completed:
- Implemented frontend setting normalization and preset-driven clearing for year/impact ranges.
- Implemented backend source fallback to web when library file resources are absent.
- Updated AI autocomplete prompt metadata with explicit effective source constraints.
- Removed automatic library seed insertion that previously masked empty-library state.
- Residual risk: Legacy seeded data may still exist in local DB from prior runs.
- Next milestone: 5 - i18n completion + lint/test/build + DeepSeek smoke validation.
- Milestone: 5 - i18n, verification, and DeepSeek smoke
- Goal: Finalize copy additions and prove regression-free behavior for V3.2.
- Completed:
- Added new i18n keys for autocomplete network error, no-limit hints, and library-empty fallback notice.
- Quality checks passed: `npm run lint`, `npm run test`, `npm run build`.
- Runtime smoke passed: `POST /api/ai/autocomplete` returned 200 with DeepSeek-generated suggestion using `deepseek-chat`.
- Residual risk: None blocking for V3.2 scope.
- Next milestone: Closed.
- Milestone: 2 - Git initialization and baseline commit
- Goal: Start version control and establish first reproducible repository snapshot.
- Completed:
- Ran `git init` and created baseline commit `chore: initial zenthesis baseline`.
- Verified source tree is tracked while ignored files remain excluded.
- Residual risk: `prisma/dev.db` appeared in baseline and requires cleanup commit.
- Next milestone: 3 - Collaboration files and CI.

- Milestone: 3 - Collaboration guardrails and CI
- Goal: Make external collaboration safe and review-driven.
- Completed:
- Added `.github/workflows/ci.yml` for lint/test/build checks.
- Added PR template and CODEOWNERS bootstrap.
- Updated README with contribution and deployment process.
- Residual risk: CODEOWNERS username may need replacement after GitHub repo is created.
- Next milestone: 4 - Remote push and visibility verification.

- Milestone: 4 - GitHub remote push and visibility verification
- Goal: Publish repository publicly and validate remote accessibility.
- Completed:
- Created GitHub repository `https://github.com/xmmdzr/zenthesis`.
- Pushed `main` branch and set upstream tracking.
- Added local SSH public key to GitHub to resolve push permission errors.
- Verified remote state and repository visibility (`PUBLIC`, default `main`).
- Residual risk: collaborator accounts are not yet invited.
- Next milestone: 5 - Final governance checks and handoff closure.

- Milestone: 5 - Final governance checks and handoff
- Goal: Ensure repository is collaboration-ready and secure by default.
- Completed:
- Verified no tracked `.env.local`, no tracked media files, and no plain-text DeepSeek key in repository files.
- Applied branch protection rules on `main` (required PR review + required status check `quality`).
- Kept README deployment checklist for Vercel handoff.
- Addressed GitHub Actions `npm ci` lock mismatch and synchronized dependency graph (`@floating-ui/dom@1.7.5`, `magicast@0.3.5`) so CI can install reliably.
- Residual risk: external key rotation and collaborator invitations are manual owner actions.
- Next milestone: Closed.

## Milestone Logs (2026-03-02 Vercel Build Patch: Prisma Generate)
- Milestone: 1 - Prisma generate hook for build stability
- Goal: Prevent Vercel build-time failure when collecting page data for `/api/ai/autocomplete`.
- Completed:
- Added `postinstall: prisma generate` and updated `build` to `prisma generate && next build`.
- Residual risk: Production still depends on correct `DATABASE_URL` in Vercel.
- Next milestone: 2 - deployment documentation update.

- Milestone: 2 - Deployment documentation update
- Goal: Make Vercel setup requirements explicit for runtime success.
- Completed:
- Added required env var list and persistent DB recommendation in README deployment section.
- Residual risk: Manual env sync in Vercel dashboard still required.
- Next milestone: Final validation.

- Milestone: Final validation
- Goal: Verify patch solves local build chain.
- Completed:
- `npm run build` passed and route collection completed for `/api/ai/autocomplete`.
- Residual risk: Vercel may need cache-clear redeploy once.
- Next milestone: Closed.

## Milestone Log (2026-03-02 23:42:27 CST) - M1
- 动作摘要：完成用户模型与注册链路改造（username 字段、注册校验、登录态返回统一、左上展示来源切换）。
- 命令/操作：更新 Prisma schema、auth routes、register page、workspace user 映射。
- 测试结果：静态代码检查通过（待全量 lint/test/build 在 M5 统一执行）。
- 回滚点：`git checkout -- prisma/schema.prisma src/app/api/auth/* src/app/auth/register/page.tsx src/components/workspace-ui-context.tsx`。

## Milestone Log (2026-03-02 23:42:27 CST) - M2
- 动作摘要：完成示例文档标注与删除流程（后端 DELETE + 侧栏确认弹层 + 删除后路由回退）。
- 命令/操作：更新 docs-store、docs id route、workspace-secondary-panel、workspace-ui-context。
- 测试结果：手动代码复核通过（待 M5 统一跑自动化）。
- 回滚点：`git checkout -- src/lib/docs-store.ts src/app/api/docs/[id]/route.ts src/components/workspace-secondary-panel.tsx src/components/workspace-ui-context.tsx`。

## Milestone Log (2026-03-02 23:48:17 CST) - M3
- 动作摘要：完成文档导出真下载链路（DOCX/PDF）。
- 命令/操作：安装 `docx pdf-lib @tiptap/html`；新增 `document-export`；改造 `/api/docs/[id]/export` 与编辑页导出菜单。
- 测试结果：导出路由通过 TypeScript 构建检查。
- 回滚点：`git checkout -- src/lib/document-export.ts src/app/api/docs/[id]/export/route.ts src/components/document-editor-pane.tsx package.json package-lock.json`。

## Milestone Log (2026-03-02 23:48:17 CST) - M4
- 动作摘要：完成分享链接与协作访问主链，接入 Supabase Realtime 广播同步。
- 命令/操作：新增 share store、分享 API、`/api/shared/[token]`、`/app/shared/[token]`；编辑器加入 realtime channel 同步。
- 测试结果：构建通过，路由生成清单包含新增分享与协作路由。
- 回滚点：`git checkout -- src/lib/share-store.ts src/app/api/docs/[id]/share/route.ts src/app/api/shared/[token]/route.ts src/app/app/shared/[token]/page.tsx src/components/rich-document-editor.tsx`。

## Milestone Log (2026-03-02 23:48:17 CST) - M5
- 动作摘要：完成全量回归与发布前检查。
- 命令/操作：执行 `npm run lint`、`npm run test`、`npm run build`；执行 `prisma db push` 与 `prisma migrate diff` 更新 `bootstrap.sql`。
- 测试结果：三项门槛全部通过；Next build 成功输出新增 API/页面路由。
- 回滚点：`git checkout -- prisma/bootstrap.sql prisma/schema.prisma src/app/auth/login/page.tsx src/lib/i18n/messages/*.ts`。


## Milestone Log (2026-03-03 21:18:02 CST) - PostgreSQL 基线切换
- 动作摘要：完成 `schema.prisma`、`.env.example`、`db.ts` 的 PostgreSQL 化和防呆处理。
- 命令/操作：执行 `npm run lint`、`DATABASE_URL=... npm run test`、`DATABASE_URL=... npm run build`，全部通过。
- 测试结果：构建成功，路由收集包含 `/api/ai/autocomplete`，无 SQLite 文件访问错误。
- 回滚点：`git checkout -- prisma/schema.prisma .env.example src/lib/db.ts README.md TASK_PLAN.md FINDINGS.md PROGRESS.md`。
