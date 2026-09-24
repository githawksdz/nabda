# Renderer architecture boundaries

Shared/public content renderers must not depend on internal preview chrome, mock-named modules, demo fixtures (except the gated loader), local JSON, or nabda_db imports.

See also: [runtime-content-source-of-truth.md](./runtime-content-source-of-truth.md)

## Allowed

```
app/internal/*                 →  components/internal/*, lib/internal/*, types/internal-preview, types/content-rendering-*
components/internal/*          →  components/content-renderers/*, types/content-rendering-*, types/internal-preview
lib/internal/*                 →  lib/content-rendering/*, lib/content-data/*, types/content-rendering-*, types/internal-preview
lib/nabda-db/*                 →  data/*.json, nabda_db/* (import tooling)
scripts/*                      →  fixtures, local JSON, nabda_db (import / verify)
public routes                  →  components/content-renderers/*, lib/content-data/* (Supabase providers), lib/**/**-ui-config, types/content-rendering-*
app/content-media/*            →  lib/content-data/* (no *-local in production)
components/content-renderers/* →  lib/content-rendering/*, types/content-rendering-*
lib/content-data/*             →  lib/content-rendering/*, types/content-rendering-*, source-payload-supabase only at runtime
lib/content-rendering/*        →  types/content-rendering-*
lib/demo-fixtures/load.ts      →  lib/demo-fixtures/* (only when NABDA_CONTENT_MODE=demo)
```

## UI config vs demo fixtures

- Production runtime imports **UI config** (interface constants only): chips, tabs, labels, hrefs, empty-state copy — not medical detail payloads.
- Demo fixtures live under `lib/demo-fixtures/` and are gated by `NABDA_CONTENT_MODE=demo`.
- Index/filter **counts are derived from Supabase catalog data** at runtime (`generalFilterChipsForCatalog`, `filterChipsForCatalog`, etc.).
- Media is served by **safe route handlers** (`/content-media/*`), not by bundling or globbing `nabda_db` media folders.
- Supabase remains the only normal runtime content source.

## Forbidden on public/runtime paths

Scanned roots include: `app/home`, `app/search`, `app/cat`, `app/protocols`, `app/drugs`, `app/calculators`, `app/favorites`, `app/history`, `app/profile`, `components/`, `features/`, `lib/content-data`, `lib/content-rendering`, and domain `lib/*` UI layers.

```
→  @/components/internal/*
→  @/lib/internal/*
→  @/types/internal-*
→  @/lib/**/mock* / mock-* / *-mock*
→  @/lib/demo-fixtures/* (except load.ts)
→  @/lib/content-data/*-local
→  data/*.json
→  nabda_db/*
```

Allowed importers of the above: `scripts/`, `app/internal/`, `lib/internal/`, `lib/nabda-db/`, `lib/demo-fixtures/` (fixture files themselves).

Exception: `lib/demo-fixtures/load.ts` may import fixture modules when demo mode is enabled.

## Shared types

Shared/public renderer types live under `types/content-rendering-*`:

- `types/content-rendering-core.ts`
- `types/content-rendering-protocol.ts`
- `types/content-rendering-cat.ts`
- `types/content-rendering-drug.ts`
- `types/content-rendering-calculator.ts`
- `types/content-rendering.ts` (barrel)

Internal preview/debug types live under `types/internal-*`.

## Shared modules

Reusable mapper/label/render-state logic lives in:

- `lib/content-rendering/protocol.ts`
- `lib/content-rendering/cat.ts`
- `lib/content-rendering/drug.ts`
- `lib/content-rendering/calculator.ts`
- `lib/content-rendering/source-labels.ts`
- `lib/content-rendering/render-state.ts`

Runtime public providers (`lib/content-data/*-data.ts`) load **Supabase only**.

Local JSON loaders live under `lib/internal/*-local.ts` — **internal preview / import tooling only**.

## Internal-only

Keep under `components/internal/*`, `lib/internal/*`, and `types/internal-preview.ts`:

- `InternalPreviewBanner` / `InternalPreviewLocked`
- `*WarningsPanel` and warning-label helpers
- `*PreviewHeader` / `*PreviewIndex` / catalog cards, filters, metrics
- featured preview slug lists
- `canAccessInternalPreview` and `?preview=internal` gating
- internal preview hrefs for preview chrome
- calculator catalog filter / group-by / metrics types
- `*-local.ts` disk JSON loaders (`protocol-local`, `cat-local`, `drug-local`, `calculator-local`)

## Check

```bash
npx tsx scripts/verify-production-runtime-cleanup.ts
npx tsx scripts/check-renderer-import-boundaries.ts
npx tsx scripts/verify-no-runtime-mock-imports.ts
```

Writes:

- `data/production-runtime-cleanup-report.json`
- `data/renderer-import-boundary-report.json`
- `data/no-runtime-mock-imports-report.json`

Exit code 1 on violations.
