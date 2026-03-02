# Zenthesis.ai

Zenthesis.ai MVP foundation built with Next.js App Router + TypeScript.

## Implemented scope

- Public pages:
  - `/` (masonry-style landing)
  - `/case-studies`
  - `/contact`
- Auth pages:
  - `/auth/login`
  - `/auth/register`
- Workspace pages (chat-first, parallel modules):
  - `/app/chat`
  - `/app/docs`
  - `/app/docs/[docId]`
  - `/app/library`
  - `/app/library/import`
  - `/app/settings`
- Theme system:
  - Light / dark / system toggle
  - Default follows system
  - Local persistence key: `zenthesis-theme`
  - Settings API persistence scaffold
- API scaffolding:
  - `/api/settings/preferences`
  - `/api/auth/phone/send-otp`
  - `/api/auth/phone/verify-otp`
  - `/api/ai/{chat,rewrite,continue,summarize,outline}`
  - `/api/docs`, `/api/docs/[id]`, `/api/docs/[id]/export`
  - `/api/library/items`
  - `/api/library/import/{pdf,bib-ris,zotero,mendeley,web}`
  - `/api/library/citations/format`
  - `/api/usage/quota`, `/api/usage/consume`
- Supabase schema scaffold:
  - `supabase/schema.sql` (includes `user_preferences` + RLS policies)

## Collaboration tracking files

Fallback mechanism is active in repo root:

- `TASK_PLAN.md`
- `FINDINGS.md`
- `PROGRESS.md`

Rule: before coding in a new thread, read these three files first.

## Local development

```bash
npm install --cache .npm-cache
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
npm run lint
npm run test
npm run build
```

## Environment setup

Copy `.env.example` to `.env.local` and fill in values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Notes

Current provider auth flows (Google/Apple/Phone) and library external connectors are UI/API scaffolds for MVP architecture. Production integration with real OAuth, SMS provider, and import pipelines is the next implementation phase.
