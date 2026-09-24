-- Calculator engine metadata (connect identity → compiled TypeScript engine).
-- Does not execute formulas. Does not change RLS. Risk metadata stays display-only.

alter table public.calculators
  add column if not exists engine_slug text,
  add column if not exists engine_version text,
  add column if not exists engine_implemented boolean not null default false;

comment on column public.calculators.engine_slug is
  'Compiled app engine slug (TypeScript). Null when no specialty engine is wired yet.';
comment on column public.calculators.engine_version is
  'Semver of the compiled engine module.';
comment on column public.calculators.engine_implemented is
  'True when a typed client engine exists. Independent of clinical_payload_status / risk.';

-- Seed known specialty engines (idempotent).
update public.calculators
set
  engine_slug = 'glasgow-coma-scale-score-gcs',
  engine_version = '1.0.0',
  engine_implemented = true,
  updated_at = now()
where slug in ('glasgow-coma-scale-score-gcs', 'glasgow')
  and coalesce(engine_implemented, false) = false;

update public.calculators
set
  engine_slug = 'creatinine-clearance-cockcroft-gault-equation',
  engine_version = '1.0.0',
  engine_implemented = true,
  updated_at = now()
where slug in (
  'creatinine-clearance-cockcroft-gault-equation',
  'cockcroft-gault'
)
  and coalesce(engine_implemented, false) = false;

-- Product decision: risk / clinical_payload_status must not hide verified calculators.
-- Keep clinical_payload_status for analytics; mark additive-ready profiles active for search.
-- Do not set review_status to validated here.
