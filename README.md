# Nabda

Mobile clinical reference app (French): CAT, protocols, drugs, calculators, search, and a personal workspace. Next.js 16 + Supabase.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On a phone on the same network:

```bash
npm run dev:lan
```

Set `ALLOWED_DEV_ORIGINS` in `.env.local` to your LAN IP if the phone cannot load `/_next` assets (see `.env.staging.example`).

## Environment

Copy names from `.env.example` (local) or `.env.staging.example` (staging). Never commit secrets. Never prefix `SUPABASE_SERVICE_ROLE_KEY` or `STAGING_ACCESS_SECRET` with `NEXT_PUBLIC_`.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `NEXT_PUBLIC_SITE_URL` | App origin (auth redirects) |
| `NABDA_CONTENT_MODE` | `production` (default), `demo`, or `internal_preview` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only catalog / import |
| `STAGING_ACCESS_SECRET` | Optional cookie gate for private staging |

Content modes and renderer import rules: [docs/runtime-content-source-of-truth.md](docs/runtime-content-source-of-truth.md), [docs/renderer-architecture-boundaries.md](docs/renderer-architecture-boundaries.md).

## Project layout

```
app/           App Router (pages, auth, API, content-media)
components/    UI (app shell, domain screens, content renderers)
features/      Server actions / API layer
lib/           Domain logic, Supabase, import mappers, calculator engines
types/         Shared TypeScript types
scripts/       Import and verification (manual CLI)
supabase/      SQL migrations
data/          Taxonomy map used by import mappers
docs/          Runtime, renderer, staging, and safety notes
```

`nabda_db/` is a local source pack (JSON + media) used for import and `/content-media/*`. It is gitignored (~1 GB) and is not required to run production mode against Supabase.

## App map

- `/home`, `/search`, `/cat`, `/protocols`, `/drugs`, `/calculators`
- `/favorites`, `/history`, `/profile`
- Auth + `/onboarding/personalisation`
- `/internal/*` — local/source preview when content mode allows it
- `/api/health`, `/api/readiness`

## Verification

```bash
npm run lint
npm run check:renderer-imports
npx tsx scripts/verify-runtime-content-source.ts
npx tsx scripts/verify-no-runtime-mock-imports.ts
npx tsx scripts/verify-production-runtime-cleanup.ts
```

## Staging

See [docs/staging.md](docs/staging.md) for Vercel deploy, auth URLs, the access gate, test personas, and rollback.

## Safety

Clinical payloads only render when review status is `validated` on a non-placeholder row. Calculator engines are Nabda-owned code — imported JavaScript is never `eval`’d. Details: [docs/validation-and-safety.md](docs/validation-and-safety.md).
