# Zenthesis.ai

Academic writing assistant workspace built with Next.js App Router + TypeScript.

## Core Scope

- Public pages: `/`, `/case-studies`, `/contact`
- Auth pages: `/auth/login`, `/auth/register`
- Workspace pages: `/app/docs`, `/app/docs/[docId]`, `/app/library`, `/app/chat`, `/app/settings`
- Theme system: light/dark/system with persisted preference
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
   - `DEEPSEEK_API_KEY`
   - `DEEPSEEK_MODEL`
   - `DEEPSEEK_BASE_URL`
   - `AI_TIMEOUT_MS`
3. If any key was exposed, rotate it before use.

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
2. Configure environment variables in Vercel project settings.
3. Enable Preview Deployments for PRs.
4. Use production URL for public viewing and PR preview URLs for review.
