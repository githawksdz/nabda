# Runtime content source of truth

## Production default

`NABDA_CONTENT_MODE` unset or `production`:

- Public routes list and open content **only from Supabase**.
- Identity catalog queries use the **server admin client** (imported corpus is `admin_only` under RLS).
- Source-preserved payloads load from Supabase via `lib/content-data/source-payload-supabase.ts`.
- Missing slug → `ContentUnavailable` (not mock, not local JSON).
- No local JSON fallback and no mock content fixtures on public content providers.

## UI config vs demo fixtures

- **UI config** = interface constants only (chips, tabs, labels, hrefs, empty-state copy). No medical detail payloads.
- Production runtime must **not** import `mock-*` files.
- **Demo fixtures** live under `lib/demo-fixtures/` and are gated by `NABDA_CONTENT_MODE=demo` (plus optional `NEXT_PUBLIC_NABDA_CONTENT_MODE=demo` for client UI).
- Runtime code may import only `lib/demo-fixtures/load.ts` — never individual fixture files.
- **Index chip counts** are derived from Supabase catalog rows at runtime (not hardcoded).
- Supabase remains the only normal runtime content source.

## Media

- On-disk `nabda_db/*/media` assets are served only by `/content-media/*` route handlers.
- Handlers validate basename + extension allowlist, resolve under the expected media directory, and 404 if missing.
- Payload loaders must not `existsSync`/glob the media tree (avoids bundling and broad file-trace warnings).

## Modes

| Mode | Env | Behavior |
|------|-----|----------|
| `production` | default | Supabase only on public routes |
| `demo` | `NABDA_CONTENT_MODE=demo` (+ optional `NEXT_PUBLIC_NABDA_CONTENT_MODE=demo` for client UI) | Demo fixtures via `lib/demo-fixtures/load.ts` allowed |
| `internal_preview` | `NABDA_CONTENT_MODE=internal_preview` | Local JSON / nabda_db on `/internal/*` only |

## Deprecated flags

- `NABDA_SOURCE_RENDER=1` — no longer required. Source rendering is on in production unless `NABDA_SOURCE_RENDER=0`.
- `source_preview` / `source_active` — not used; use `production` or `internal_preview`.

## Not runtime sources

These remain for import/tooling only:

- `data/nabda-db-taxonomy-map.json` (import mappers); other `data/*.json` reports are generated locally
- `nabda_db/*` (local source pack, not in git — except on-disk media served by `/content-media/*`)
- `lib/internal/*-local.ts` (internal preview loaders)
- `lib/demo-fixtures/*` (demo mode only, via `load.ts`)

## Missing content UX

`components/app/ContentUnavailable.tsx` — shared not-found state for protocol, CAT, drug, and calculator detail routes.

## Provider order

```
production public:  Supabase → null (ContentUnavailable)
demo:               fixtures via lib/demo-fixtures/load.ts on search/home/personal overlays
internal:           local JSON via lib/internal/*-local.ts
```

## Verification

```bash
npx tsx scripts/verify-production-runtime-cleanup.ts
npx tsx scripts/verify-no-runtime-mock-imports.ts
npx tsx scripts/verify-runtime-content-source.ts
npx tsx scripts/check-renderer-import-boundaries.ts
```

Reports:

- `data/production-runtime-cleanup-report.json`
- `data/no-runtime-mock-imports-report.json`
- `data/runtime-content-source-verification.json`
- `data/renderer-import-boundary-report.json`
