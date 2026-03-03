# Zenthesis.ai

Academic writing assistant workspace built with Next.js App Router + TypeScript.

## Core Scope

- Public pages: `/`, `/case-studies`, `/contact`
- Auth pages: `/auth/login`, `/auth/register`
- Workspace pages: `/app/docs`, `/app/docs/[docId]`, `/app/library`, `/app/chat`, `/app/settings`
- Shared route: `/app/shared/[token]` (login required before resolving share token)
- Theme system: light/dark/system with persisted preference
- Username-first identity (6-10 chars, letters/numbers/underscore, at least one letter)
- Document export: DOCX / PDF
- Share link collaboration: generate/revoke link + collaborator access record
- APIs:
  - `/api/ai/*` (chat + autocomplete + rewrite/continue/summarize/outline)
  - `/api/docs*`
  - `/api/library/*`
  - `/api/settings/preferences`
  - `/api/usage/*`
  - `/api/auth/*`

## Repository Rules

- This repository is source-code first: do not commit local screenshots, recordings, or large reference files.
- Secrets are never committed. `.env.local` is local-only and ignored.
- Collaboration docs are milestone-based and must stay in sync:
  - `TASK_PLAN.md`
  - `FINDINGS.md`
  - `PROGRESS.md`

## Local Development

```bash
npm install --cache .npm-cache
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Setup

1. Copy `.env.example` to `.env.local`.
2. Fill real values for:
   - `DATABASE_URL`
   - `DIRECT_URL` (recommended for migrations with Supabase)
   - `DEEPSEEK_API_KEY`
   - `DEEPSEEK_MODEL`
   - `DEEPSEEK_BASE_URL`
   - `AI_TIMEOUT_MS`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only, optional but recommended)
3. If any key was exposed, rotate it before use.

## Collaboration Notes

- Share links are resolved via `/api/shared/[token]`; users must be authenticated.
- Link visits create/update `DocumentCollaborator` access rows.
- Realtime document sync uses Supabase Realtime channel `doc:{docId}`.
- If Supabase public env vars are missing, editor falls back to autosave-only mode (no realtime merge).

## Quality Gates

```bash
npm run lint
npm run test
npm run build
```

CI runs the same checks for pushes and pull requests.

## GitHub Collaboration Flow

1. Create a feature branch from `main`.
2. Implement and run local quality gates.
3. Open a Pull Request using the template.
4. Wait for CI green + review approval.
5. Merge PR (do not push directly to protected `main`).

## Deployment (Vercel)

1. Import this repository in Vercel.
2. Configure environment variables in Vercel project settings (`DATABASE_URL`, `DIRECT_URL`, `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, `DEEPSEEK_BASE_URL`, `AI_TIMEOUT_MS`).
3. Use external persistent PostgreSQL for production (recommended: Supabase Postgres). Do not use local SQLite files in Vercel runtime.
4. Enable Preview Deployments for PRs.
5. Use production URL for public viewing and PR preview URLs for review.
