# FINDINGS

## New policy from this milestone
- Logging cadence is milestone-based from now on.
- Keep historical detailed records intact; do not rewrite previous logs.

## Milestone Findings (2026-03-02 GitHub Launch + Collaboration)
### Milestone 1: Repository cleanup and secret-safety baseline
- Completed:
- Added media exclusion rules in `.gitignore` for local screenshots/recordings/reference PDF to keep repository lightweight.
- Replaced exposed `DEEPSEEK_API_KEY` value in `.env.local` with empty placeholder and rotation note.
- Confirmed `.env*` remains ignored by git policy.
- Residual risks:
- Key rotation must be completed in DeepSeek console by repository owner (cannot be automated from local codebase).
- Next milestone entry:
- Milestone 2: initialize git and create first commit baseline.

## Milestone Findings (2026-03-02 V3.2 Autocomplete Stability + Source Fallback)
### Milestone 1: History delete action alignment
- Completed:
- Updated chat history row layout to fixed content/action columns with consistent minimum row height.
- Vertically centered delete button and stabilized timestamp row height to avoid visual jitter.
- Kept existing custom confirm dialog behavior unchanged.
- Residual risks:
- Very long localized datetime strings may still need tighter truncation in narrow panel widths.
- Next milestone entry:
- Milestone 2: decouple autocomplete switch and settings-arrow panel behavior.

## Milestone Findings (2026-03-02 V3.1 Critical Fixes)
### Milestone 1: History delete alignment + custom confirmation modal
- Completed:
- Reworked history row layout to fixed content/action columns so delete icons stay vertically aligned regardless of preview length.
- Replaced `window.confirm` with in-panel confirmation modal for consistent visual style and better control.
- Residual risks:
- Modal is currently local to chat panel and not extracted as a shared dialog primitive.
- Next milestone entry:
- Milestone 2: auto-complete panel open/close behavior.

### Milestone 2: Auto-complete panel toggle correctness
- Completed:
- Separated concerns: `自动完成` button toggles enable state only; arrow button toggles settings panel only.
- Added upward/downward arrow behavior beside auto-complete control and click-outside close logic.
- Residual risks:
- Panel close on `Esc` is not yet implemented.
- Next milestone entry:
- Milestone 3: auto-complete flow stabilization.

### Milestone 3: Auto-complete generation visibility and reliability
- Completed:
- Added explicit non-blocking failure state in editor suggestion area with retry action.
- Kept debounce trigger path and ensured settings changes participate in next generation cycle.
- Closing auto-complete now clears current suggestion/error state immediately.
- Residual risks:
- Constraints are prompt-level only and do not enforce real retrieval filtering.
- Next milestone entry:
- Milestone 4: i18n completion.

### Milestone 4: i18n copy completion
- Completed:
- Added missing keys for delete failure and suggestion failure across zh/en/ru/fr.
- Residual risks:
- Non-Chinese wording may still need copy polishing.
- Next milestone entry:
- Final validation.

### Final validation
- Completed:
- `npm run lint` passed.
- `npm run test` passed.
- `npm run build` passed.
- Residual risks:
- None blocking for requested fix scope.
- Next milestone entry:
- Optional UX pass (Escape-to-close modal/panel, richer markdown assistant rendering).

## Milestone Findings (2026-03-02 Chat + Autocomplete V3)
### Milestone 1: Conversation delete capability
- Completed:
- Added `DELETE /api/ai/conversations/[id]`.
- Added `deleteConversation(userId, conversationId)` in chat store and wired hard-delete for conversation/message/link tables.
- Added history-item delete button with confirm dialog in chat dropdown.
- Residual risks:
- Hard delete is irreversible by design; no recycle bin.
- Next milestone entry:
- Milestone 2: chat rendering and thinking-state UX.

### Milestone 2: Chat rendering + thinking state
- Completed:
- User messages now use adaptive right bubbles (`w-fit + max-w`) matching text length.
- Assistant replies switched to paragraph-style text blocks (non-bubble).
- Added in-panel processing indicator with spinner + elapsed seconds during model response wait.
- Residual risks:
- Markdown-rich formatting is still plain text rendering in assistant block.
- Next milestone entry:
- Milestone 3: autocomplete API and type contract.

### Milestone 3: Autocomplete API and types
- Completed:
- Added `AutoCompleteSettings`, `AutoCompleteRequestPayload`, `AutoCompleteResponse` types.
- Added `POST /api/ai/autocomplete` with request validation and usage consumption.
- Added `aiAutocomplete(...)` in AI service, reusing provider path and fallback behavior.
- Residual risks:
- Constraints currently guide prompting only; no true retrieval/ranking enforcement pipeline.
- Next milestone entry:
- Milestone 4: editor-side interaction wiring.

### Milestone 4: Editor autocomplete interaction
- Completed:
- Added bottom `自动完成` enable control and settings panel (web/library toggles, year and impact filters).
- Implemented debounce-triggered autocomplete generation (1200ms idle).
- Added grey suggestion block with `接受/重试`; accept inserts into editor as normal content.
- Added per-document settings persistence via localStorage key `zenthesis:autocomplete:{docId}`.
- Residual risks:
- Suggestion is sentence-level generation and may require follow-up for multi-sentence workflows.
- Next milestone entry:
- Milestone 5: i18n and observability finish.

### Milestone 5: i18n + observability
- Completed:
- Added i18n keys for delete confirmation, thinking label, autocomplete settings/suggestion actions across zh/en/ru/fr.
- Added server logs for delete result and autocomplete fallback reason chain.
- Residual risks:
- Localization quality for non-zh strings is functional but can be copy-edited later.
- Next milestone entry:
- Validation closure.

### Final validation
- Completed:
- Passed `npm run lint`.
- Passed `npm run test`.
- Passed `npm run build` (new route `/api/ai/autocomplete` generated).
- Residual risks:
- None blocking for this milestone scope.
- Next milestone entry:
- Optional follow-up: add recoverable deletion and richer assistant markdown rendering.

## Milestone Findings (2026-03-02 Chat Panel Enhancement V2)
### Milestone 1: Conversation persistence data layer and APIs
- Completed:
- Added Prisma models for `AIConversation`, `AIMessage`, and `AIConversationLibraryItem`.
- Added `src/lib/chat-store.ts` with list/create/get/append/link operations and compatibility fallback.
- Added APIs: `GET/POST /api/ai/conversations` and `GET /api/ai/conversations/[id]`.
- Residual risks:
- Raw SQL bootstrap is used to guard local schema availability; a formal Prisma migration history is still recommended before production.
- Next milestone entry:
- Milestone 2: chat panel UI refactor for history dropdown and spacing.

### Milestone 2: Chat panel UI refactor (history dropdown + bubble spacing)
- Completed:
- Updated chat header actions to `历史对话(时钟)` + `新对话` and implemented dropdown session switching.
- Removed `添加上下文` button from chat panel.
- Reworked message rendering to left/right bubble layout with increased spacing and padding.
- Residual risks:
- The final visual micro-alignment against screenshot 17 can be tuned after receiving the exact reference image.
- Next milestone entry:
- Milestone 3: current document context wiring and message persistence.

### Milestone 3: Current document context + persistence chain
- Completed:
- Added `useCurrentDoc` toggle state and request payload passthrough to `/api/ai/chat`.
- API now reads active conversation history, optional current document full text, and stores user/assistant messages per round.
- `ai.ts` now assembles prompt context as: history -> current doc -> attachments -> current prompt.
- Residual risks:
- Full document injection may increase token usage on long documents; truncation strategy can be added later.
- Next milestone entry:
- Milestone 4: attachment upload and conversation-library linking.

### Milestone 4: Attachment upload (PDF/image) and linking
- Completed:
- Added `POST /api/library/import/upload` multipart upload endpoint with mime/size validation.
- Chat panel link button now uploads PDF/image and shows linked attachment chips in-session.
- Upload results are written to library store and linked to active conversation.
- Residual risks:
- Upload context currently uses file metadata only; no PDF parsing/OCR enrichment in this milestone.
- Next milestone entry:
- Validation closure and runtime smoke checks.

### Final validation and runtime smoke
- Completed:
- Quality gates passed: `npm run lint`, `npm run test`, `npm run build`.
- Runtime smoke succeeded for conversation create, file upload, chat send, conversation detail fetch.
- Residual risks:
- No blocking issues found for this milestone scope.
- Next milestone entry:
- Optional follow-up: add conversation delete/rename operations and attachment preview UX.

## Milestone Findings (2026-03-02 Panel Toggle + Chat Stability)
### Milestone 1: Sidebar interaction refactor (toggle panels)
- Completed:
- Added `leftPanelMode` state and panel actions in workspace UI context.
- Converted `图书馆` and `AI聊天` sidebar entries from route-style links to toggle buttons.
- Workspace shell now renders left secondary panel by state (`docs | library | null`) and keeps right chat panel state-driven.
- Residual risks:
- Direct `/app/library` and `/app/chat` routes remain compatible, but sidebar toggles now intentionally decouple panel visibility from route highlighting.
- Next milestone entry:
- Milestone 2: AI fallback observability and deepseek runtime diagnosis.

### Milestone 2: AI fallback observability + runtime diagnosis
- Completed:
- Upgraded DeepSeek provider return structure to include failure reasons (`missing_key`, `upstream_non_2xx`, `timeout`, `network_error`, `empty_content`).
- Added server-side fallback logging in `/api/ai/chat` with reason, status, model, and base URL (without exposing secrets).
- Fixed provider JSON-parse path to avoid unhandled throw and preserve reasoned fallback classification.
- Runtime verification via local API call now returns real DeepSeek content under `deepseek-chat`.
- Residual risks:
- Local startup logs still show unrelated Prisma table-missing warnings from `/api/auth/me` path; chat path works but auth bootstrap remains a separate cleanup item.
- Next milestone entry:
- Milestone 3: chat UX stability fixes (input clear + panel scroll isolation).

### Milestone 3: Chat UX stability (input + scroll + layout constraints)
- Completed:
- Chat input is cleared immediately on send (success/failure no longer leaves stale text).
- Chat panel now uses `h-full/min-h-0/flex-col`, with message area isolated to `overflow-y-auto`.
- Added auto-scroll-to-bottom behavior for new messages.
- Workspace shell, secondary panel, sidebar, and editor pane were updated with `h-screen`/`min-h-0`/`overflow` constraints to prevent whole-page growth from chat messages.
- Residual risks:
- Mobile breakpoint behavior for right chat panel remains intentionally conservative (`xl` display) and can be revisited in a dedicated responsive pass.
- Next milestone entry:
- Validation closure and regression tracking.

## Milestone Findings (2026-03-01 DeepSeek Provider Switch)
### Milestone 1: Provider replacement (MiniMax -> DeepSeek)
- Completed:
- Added `src/lib/ai/deepseek-provider.ts` with OpenAI-compatible `chat/completions` request flow.
- Implemented timeout via `AbortController` using `AI_TIMEOUT_MS`.
- Added robust content parsing for string and array-style `message.content`.
- Residual risks:
- DeepSeek may reject a model id even when API key and base URL are reachable.
- Next milestone entry:
- Milestone 2: switch AI service layer and keep protocol compatibility.

### Milestone 2: AI service layer switch
- Completed:
- `src/lib/ai.ts` now imports `requestDeepSeekChat(...)` and keeps output structure unchanged.
- Fallback copy updated to reference `DEEPSEEK_API_KEY`.
- Residual risks:
- Non-chat AI routes remain scaffold behavior; only chat path is real-provider backed.
- Next milestone entry:
- Milestone 3: environment variable migration.

### Milestone 3: Environment contract migration
- Completed:
- `.env.example` migrated to `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, `DEEPSEEK_BASE_URL`, `AI_TIMEOUT_MS`.
- Local `.env.local` switched to DeepSeek config for runtime checks.
- Residual risks:
- Keys shared in chat/log contexts should be rotated before production use.
- Next milestone entry:
- Milestone 4: old provider cleanup.

### Milestone 4: Old provider cleanup
- Completed:
- Removed `src/lib/ai/minimax-provider.ts`.
- Confirmed no `MINIMAX`/`minimax-provider` references in active source/env/readme paths.
- Residual risks:
- Historical collaboration logs intentionally retain older MiniMax notes for audit trace.
- Next milestone entry:
- Milestone 5: validation and runtime verification.

### Milestone 5: Validation + runtime verification
- Completed:
- Quality gates passed: `npm run lint`, `npm run test`, `npm run build`.
- Runtime result:
- Direct DeepSeek endpoint connectivity works, but configured `DeepSeek-V3.2` returns provider error `"Model Not Exist"` in this environment/account.
- `/api/ai/chat` local runtime probing from this execution environment returns `502`, so route-level live check is blocked here.
- Residual risks:
- Need a valid DeepSeek model id for successful real replies; otherwise chat falls back to local response.
- Next milestone entry:
- Confirm available model ids under current DeepSeek account and update `DEEPSEEK_MODEL`.

## Milestone Findings (2026-03-01 MiniMax Provider Switch)
### Milestone 1: Provider implementation replacement
- Completed:
- Replaced `OpenAI Responses` path with MiniMax official OpenAI-compatible `chat/completions` path.
- Added `src/lib/ai/minimax-provider.ts` and updated `aiChat` to use it.
- Residual risks:
- Current implementation is non-streaming; future optimization may need SSE/stream mode.
- Next milestone entry:
- Milestone 2: environment contract cleanup and validation.

### Milestone 2: Environment contract + dependency cleanup + validation
- Completed:
- Updated env contract to `MINIMAX_API_KEY`, `MINIMAX_MODEL`, `MINIMAX_BASE_URL`, `AI_TIMEOUT_MS`.
- Removed obsolete `openai` package dependency.
- Full validation passed: `npm run lint`, `npm run test`, `npm run build`.
- Residual risks:
- Existing docs from prior milestone still mention OpenAI conceptually and should be refreshed in later documentation pass.
- Next milestone entry:
- Add model-agnostic provider interface to support multi-vendor fallback strategy.

## Milestone Findings (2026-02-28 UI + Rich Editor + Temp Backend + OpenAI)
### Milestone 1: Workspace detail fixes
- Completed:
- Reduced secondary panel titles (`文档/图书馆`) to one-step-above username visual size.
- Replaced static `ZH` with dropdown language selector in ThemeDock (中文/English/Русский/Français).
- Implemented collapsible right chat panel with width reflow in center area.
- Residual risks:
- Chat panel open/close is route-aware and stateful; product may later want dedicated `/app/chat` empty state.
- Next milestone entry:
- Milestone 2: full i18n layer and locale persistence.

### Milestone 2: Four-language i18n baseline
- Completed:
- Added i18n dictionaries (`zh/en/ru/fr`) and `I18nProvider/useI18n`.
- Added locale persistence via `/api/settings/preferences` (`theme + locale`).
- Refactored major UI texts (home, auth, workspace core panels, modals) to key-based rendering.
- Residual risks:
- Some non-core preview/demo copy remains locale-conditional, not fully dictionary-keyed.
- Next milestone entry:
- Milestone 3: rich text editor integration.

### Milestone 3: Tiptap rich editor integration
- Completed:
- Replaced textarea editing with Tiptap editor in document pane.
- Added structured `contentJson` persistence path (`DocumentItem` + API PATCH payload).
- Updated new document creation flow so newly created docs are directly editable.
- Residual risks:
- Advanced editor capabilities (collaboration, history timeline) are intentionally out of scope.
- Next milestone entry:
- Milestone 4: insertion toolbar and command wiring.

### Milestone 4: Insertion toolbar and editor commands
- Completed:
- Added bottom insertion actions for image/table/formula/code.
- Added quick formatting actions (H1/H2/H3, bullet/ordered list, quote, code block).
- Added inline formula creation flow (LaTeX input -> inline math node insertion).
- Residual risks:
- Formula UX is currently lightweight popover input; no advanced equation builder yet.
- Next milestone entry:
- Milestone 5: temporary backend and auth session.

### Milestone 5: Prisma + SQLite temporary backend with auth
- Completed:
- Added Prisma schema/models for `User`, `UserSession`, `UserPreference`, `Document`, `LibraryItem`, `UsageQuota`.
- Added auth routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.
- Switched request identity to cookie-session-first (`getRequestUserId`), with header fallback for dev.
- Refactored docs/library/usage/preferences stores to Prisma-first + in-memory fallback.
- Residual risks:
- `prisma db push` is unstable in this runtime; schema bootstrap is currently created via generated SQL script.
- Next milestone entry:
- Milestone 6: OpenAI provider integration.

### Milestone 6: OpenAI Responses API integration + final validation
- Completed:
- Added provider module at `src/lib/ai/openai-provider.ts`.
- Refactored `aiChat` to async real-model call with fallback response when no API key.
- Preserved existing chat response contract including `toolContext` echo.
- Passed quality gates: `npm run lint`, `npm run test`, `npm run build`.
- Residual risks:
- Only chat route is model-backed in this round; other AI routes remain scaffold behavior.
- Next milestone entry:
- Production hardening (rate limits, billing guardrails, audit logging, privacy policy wiring).

## Milestone Findings (2026-02-27 UI Revamp)
### Milestone 1: Collaboration docs policy refactor
- Completed:
- Added explicit policy to all three collaboration docs for milestone-only updates.
- Introduced milestone checklist for current UI revamp stream.
- Residual risks:
- Team may still accidentally write action-level updates unless policy is followed consistently.
- Next milestone entry:
- Milestone 2: visual baseline update and theme toggle relocation.

### Milestone 2: Visual baseline + theme entry relocation
- Completed:
- Removed global top-right theme toggle from root layout.
- Moved theme toggle into workspace sidebar bottom area only.
- Updated core color tokens to light-gray + indigo accent visual baseline.
- Residual risks:
- Existing settings page still offers theme controls, which is acceptable but creates a second entry point.
- Next milestone entry:
- Milestone 3: home page redesign with Jenni-like hero while keeping masonry content.

### Milestone 3: Home page redesign (Jenni-style hero + masonry)
- Completed:
- Rebuilt home hero section to match reference style: centered title, concise subtitle, primary CTA.
- Added a workspace preview block under hero to align with the reference page narrative.
- Retained masonry layout section for feature cards per original requirement.
- Updated public header with Chinese-first navigation and simplified button treatment.
- Residual risks:
- Navigation labels use placeholder destinations for pricing/about/blog semantics.
- Next milestone entry:
- Milestone 4: auth pages redesign.

### Milestone 4: Auth pages redesign (Chinese style)
- Completed:
- Rebuilt login page with top color strip, centered brand, Google button, divider, email/password fields, and register link.
- Rebuilt register page with matching visual language and Chinese-first text.
- Removed public header from auth pages to align with clean centered reference layout.
- Residual risks:
- OAuth and email-password submit actions are still UI scaffolds without production auth binding.
- Next milestone entry:
- Milestone 5: workspace shell and default post-login landing route.

### Milestone 5: Workspace shell refactor + `/app/docs/new`
- Completed:
- Replaced workspace layout with route-aware shell: left nav fixed, left secondary panel for docs/library, right chat panel for chat/library routes.
- Changed `/app` default redirect target from `/app/chat` to `/app/docs/new`.
- Added `/app/docs/new` center empty-state page with primary `新建文档` button.
- Refactored central workspace canvas into reusable component to align with screenshot structure.
- Residual risks:
- Current center cards and toolbar are static UI and not yet bound to real editor actions.
- Next milestone entry:
- Milestone 6: chat tool toggles and API passthrough.

### Milestone 6: Chat toggles + API passthrough + final validation
- Completed:
- Added `网络` and `图书馆` toggles in right chat panel input area.
- Implemented request passthrough to `/api/ai/chat` with `useWeb`, `useLibrary`, and `contextDocId`.
- Extended AI response with `toolContext` echo fields and kept backward compatibility for prompt-only requests.
- Added chat tool-context unit tests and reran full validation successfully.
- Residual risks:
- Web/library toggles currently only affect API payload and echo context, not real retrieval systems.
- Next milestone entry:
- Integrate real auth and persistent document/library backends.

## Milestone Findings (2026-02-28 Workspace Functionalization)
### Milestone 1: Workspace state context + user profile menu
- Completed:
- Added `WorkspaceUIContext` to coordinate active doc, modal visibility, right chat panel state, and temporary user profile.
- Replaced fixed username text with avatar + username menu including settings/logout and quota entries.
- Residual risks:
- User profile is still mock session data.
- Next milestone entry:
- Milestone 2: document creation flow and API/type extensions.

### Milestone 2: New document flow + docs API/type extensions
- Completed:
- Extended `DocumentItem` with `status/draftType/createdAt`.
- Expanded `POST /api/docs` to accept draft type and seed prompt.
- Implemented screenshot-7 style `NewDocumentModal` with three creation modes.
- Residual risks:
- Smart title currently uses placeholder derivation, not model-generated titles.
- Next milestone entry:
- Milestone 3: history docs switching and editable save flow.

### Milestone 3: History docs switching + editable save flow
- Completed:
- Document side panel now reads from API docs list and supports switching between history items.
- Main editor supports direct editing with auto-save debounce and manual save button.
- Empty docs now render four starter action cards.
- Residual risks:
- Editor is plain text, not rich-text.
- Next milestone entry:
- Milestone 4: source upload modal tabs and action wiring.

### Milestone 4: Source upload modal tabs + card action wiring
- Completed:
- Added multi-tab source modal for PDF/Zotero/Mendeley/bib-ris/ID flows (screenshots 8-12).
- Wired starter cards: prompt -> new doc modal, Word import -> local upload modal, AI chat -> right panel, source -> source modal.
- Library panel now shows uploaded resources first, then source action entries.
- Residual risks:
- External provider connections remain placeholder actions.
- Next milestone entry:
- Milestone 5: cleanup, theme dock enhancement, dev indicator removal.

### Milestone 5: UI cleanup + ThemeDock emphasis + dev indicator removal
- Completed:
- Removed left-bottom `完成设置` block and replaced with independent `ThemeDock` (icon row + ZH + pricing CTA).
- Disabled Next.js dev indicator by setting `devIndicators: false` in `next.config.ts`.
- Verified full pipeline with lint/test/build.
- Residual risks:
- None blocking for scaffold-level behavior expectations.
- Next milestone entry:
- Integrate real auth + persistent data storage.

## Verified
- Repository started empty (`/Users/xmmdzr/projects/zenthesis`).
- `plugin` command is not installed in this shell environment.
- Theme system implemented with `next-themes`, default `system`, persisted under `zenthesis-theme`.
- Planned routes implemented: public pages, auth pages, app workspace pages, and all requested API endpoints.
- Supabase schema scaffold created at `supabase/schema.sql` for `user_preferences`.
- Validation commands passed: `npm run lint`, `npm run test`, `npm run build`.

## Pitfalls / Unavailable APIs
- Attempting `plugin --help` returns `zsh: command not found: plugin`.
- `create-next-app` cannot initialize directly in non-empty root when tracking files already exist.
- NPM global cache in `~/.npm` has permission issue (`EACCES`); local cache flag avoids this.

## Docs / Plans Used
- User-approved "Zenthesis.ai 规划 V2（含主题切换与开发协作文档机制）".
- Fallback collaboration-file workflow (`TASK_PLAN.md`, `FINDINGS.md`, `PROGRESS.md`) applied during implementation.

## Conclusions
- Must use fallback collaboration files in repo root.
- Implementation should proceed directly in project codebase.
- Scaffold strategy: generate app in temp folder then copy into root.
- Use `npm install --cache .npm-cache` for deterministic local install.
- Current auth/provider and import connectors are scaffolded endpoints/UI stubs; production integration remains a next-phase item.
### Milestone 2: Auto-complete switch and arrow panel decoupling
- Completed:
- Separated responsibilities: `自动完成` only toggles enable state; arrow button only controls settings panel visibility.
- Disabled arrow interaction when auto-complete is off, preventing accidental panel re-open.
- Kept close-on-disable behavior so turning auto-complete off always retracts settings.
- Residual risks:
- Arrow control is icon-only now; if users need text label we can add a tooltip in a follow-up.
- Next milestone entry:
- Milestone 3: autocomplete error propagation and DeepSeek observability.
### Milestone 3: Autocomplete failure chain and request normalization
- Completed:
- Frontend autocomplete request now parses non-2xx error payloads and surfaces readable backend messages instead of silent `null`.
- Rich editor suggestion workflow now handles request exceptions in `catch` and shows concrete error text.
- `/api/ai/autocomplete` now normalizes numeric fields and range ordering, reducing avoidable 400 responses from stale settings data.
- Residual risks:
- Users can still enter highly restrictive settings that yield weak suggestions; this is expected until real retrieval filtering exists.
- Next milestone entry:
- Milestone 4: library-empty source fallback and unrestricted filter behavior.
### Milestone 4: Unrestricted filters and library-empty source fallback
- Completed:
- Added frontend settings normalization so `yearPreset=all` and `impactPreset=all` clear range inputs and keep "no limit" mode stable.
- Added backend effective-source logic: if `useLibrary=true` but no file-based library resources exist, autocomplete downgrades to `useLibrary=false` + `useWeb=true`.
- Added explicit effective source constraints in AI autocomplete prompt assembly.
- Removed library seed auto-injection from store path to avoid fake non-empty library state.
- Residual risks:
- Existing historical DB rows from older runs may still include demo web items, but they no longer count as file resources.
- Next milestone entry:
- Milestone 5: i18n completion and regression validation.
### Milestone 5: i18n completion and regression validation
- Completed:
- Added i18n keys in zh/en/ru/fr for network-error autocomplete feedback, no-limit hints, and library-empty web fallback hint.
- Passed quality gates: `npm run lint`, `npm run test`, `npm run build`.
- DeepSeek smoke passed on `/api/ai/autocomplete` with `DEEPSEEK_MODEL=deepseek-chat` and returned live suggestion content.
- Residual risks:
- Existing local DB data may contain historical demo rows; behavior now depends on file-based source-type filtering, so functionality remains correct.
- Next milestone entry:
- V3.2 closed; next thread can focus on UX polish only if needed.
### Milestone 2: Git initialization and baseline commit
- Completed:
- Initialized local git repository and created first baseline commit for project source tree.
- Confirmed media files and `.env.local` were excluded from tracking by ignore rules.
- Residual risks:
- Initial baseline commit included `prisma/dev.db`; cleanup is completed in current working tree and will be committed in next milestone.
- Next milestone entry:
- Milestone 3: collaboration guardrails and CI.

### Milestone 3: Collaboration guardrails and CI baseline
- Completed:
- Added GitHub Actions workflow to enforce `lint/test/build` on push/PR to `main`.
- Added pull request template with quality and security checklist.
- Added CODEOWNERS bootstrap file for review ownership.
- Refreshed README with repository rules, contribution flow, and Vercel deployment checklist.
- Residual risks:
- CODEOWNERS handle must be updated to actual GitHub account/team after remote repo creation.
- Next milestone entry:
- Milestone 4: remote setup and push verification.
