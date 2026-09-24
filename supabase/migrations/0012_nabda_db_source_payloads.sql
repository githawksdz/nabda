-- Source-preserved render payloads from nabda_db dry-run JSON.
-- Identity-only public tables stay unchanged. No RLS loosening on protocols/cat_maps/drugs/calculators.
-- Service role bypasses RLS for import and server-side source rendering.

-- ---------------------------------------------------------------------------
-- Shared payload row shape
-- ---------------------------------------------------------------------------

create table if not exists public.source_protocol_sections (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  source_slug text not null,
  source_prefix text,
  entity_slug text not null,
  entity_type text not null default 'protocol_section',
  payload_item_id text not null,
  imported_from text not null default 'nabda_db',
  imported_at timestamptz not null default now(),
  activation_state text not null default 'source_preserved_locked',
  review_status text not null default 'unreviewed',
  visibility text not null default 'admin_only',
  clinical_payload_status text not null default 'locked',
  sort_order integer not null default 0,
  payload jsonb not null,
  plain_text text,
  warnings text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint source_protocol_sections_entity_type_check check (
    entity_type in ('protocol_section', 'protocol_bundle')
  ),
  constraint source_protocol_sections_activation_state_check check (
    activation_state in ('source_preserved_locked', 'source_preserved_active')
  ),
  constraint source_protocol_sections_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  ),
  constraint source_protocol_sections_visibility_check check (
    visibility in ('public_free', 'premium', 'preview_only', 'hidden', 'admin_only')
  ),
  constraint source_protocol_sections_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  )
);

create unique index if not exists source_protocol_sections_source_item_uidx
  on public.source_protocol_sections (source_id, payload_item_id);

create index if not exists source_protocol_sections_source_id_idx
  on public.source_protocol_sections (source_id);
create index if not exists source_protocol_sections_source_slug_idx
  on public.source_protocol_sections (source_slug);
create index if not exists source_protocol_sections_entity_slug_idx
  on public.source_protocol_sections (entity_slug);
create index if not exists source_protocol_sections_entity_type_idx
  on public.source_protocol_sections (entity_type);
create index if not exists source_protocol_sections_imported_from_idx
  on public.source_protocol_sections (imported_from);
create index if not exists source_protocol_sections_activation_state_idx
  on public.source_protocol_sections (activation_state);
create index if not exists source_protocol_sections_review_status_idx
  on public.source_protocol_sections (review_status);
create index if not exists source_protocol_sections_visibility_idx
  on public.source_protocol_sections (visibility);
create index if not exists source_protocol_sections_clinical_payload_status_idx
  on public.source_protocol_sections (clinical_payload_status);
create index if not exists source_protocol_sections_sort_order_idx
  on public.source_protocol_sections (entity_slug, sort_order);

create table if not exists public.source_cat_steps (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  source_slug text not null,
  source_prefix text,
  entity_slug text not null,
  entity_type text not null default 'cat_step',
  payload_item_id text not null,
  imported_from text not null default 'nabda_db',
  imported_at timestamptz not null default now(),
  activation_state text not null default 'source_preserved_locked',
  review_status text not null default 'unreviewed',
  visibility text not null default 'admin_only',
  clinical_payload_status text not null default 'locked',
  sort_order integer not null default 0,
  payload jsonb not null,
  plain_text text,
  warnings text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint source_cat_steps_entity_type_check check (
    entity_type in ('cat_step', 'cat_bundle')
  ),
  constraint source_cat_steps_activation_state_check check (
    activation_state in ('source_preserved_locked', 'source_preserved_active')
  ),
  constraint source_cat_steps_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  ),
  constraint source_cat_steps_visibility_check check (
    visibility in ('public_free', 'premium', 'preview_only', 'hidden', 'admin_only')
  ),
  constraint source_cat_steps_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  )
);

create unique index if not exists source_cat_steps_source_item_uidx
  on public.source_cat_steps (source_id, payload_item_id);

create index if not exists source_cat_steps_source_id_idx on public.source_cat_steps (source_id);
create index if not exists source_cat_steps_source_slug_idx on public.source_cat_steps (source_slug);
create index if not exists source_cat_steps_entity_slug_idx on public.source_cat_steps (entity_slug);
create index if not exists source_cat_steps_entity_type_idx on public.source_cat_steps (entity_type);
create index if not exists source_cat_steps_imported_from_idx on public.source_cat_steps (imported_from);
create index if not exists source_cat_steps_activation_state_idx on public.source_cat_steps (activation_state);
create index if not exists source_cat_steps_review_status_idx on public.source_cat_steps (review_status);
create index if not exists source_cat_steps_visibility_idx on public.source_cat_steps (visibility);
create index if not exists source_cat_steps_clinical_payload_status_idx
  on public.source_cat_steps (clinical_payload_status);
create index if not exists source_cat_steps_sort_order_idx on public.source_cat_steps (entity_slug, sort_order);

create table if not exists public.source_drug_sections (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  source_slug text not null,
  source_prefix text,
  entity_slug text not null,
  entity_type text not null default 'drug_section',
  payload_item_id text not null,
  imported_from text not null default 'nabda_db',
  imported_at timestamptz not null default now(),
  activation_state text not null default 'source_preserved_locked',
  review_status text not null default 'unreviewed',
  visibility text not null default 'admin_only',
  clinical_payload_status text not null default 'locked',
  sort_order integer not null default 0,
  payload jsonb not null,
  plain_text text,
  warnings text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint source_drug_sections_entity_type_check check (
    entity_type in ('drug_section', 'drug_bundle')
  ),
  constraint source_drug_sections_activation_state_check check (
    activation_state in ('source_preserved_locked', 'source_preserved_active')
  ),
  constraint source_drug_sections_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  ),
  constraint source_drug_sections_visibility_check check (
    visibility in ('public_free', 'premium', 'preview_only', 'hidden', 'admin_only')
  ),
  constraint source_drug_sections_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  )
);

create unique index if not exists source_drug_sections_source_item_uidx
  on public.source_drug_sections (source_id, payload_item_id);

create index if not exists source_drug_sections_source_id_idx on public.source_drug_sections (source_id);
create index if not exists source_drug_sections_source_slug_idx on public.source_drug_sections (source_slug);
create index if not exists source_drug_sections_entity_slug_idx on public.source_drug_sections (entity_slug);
create index if not exists source_drug_sections_entity_type_idx on public.source_drug_sections (entity_type);
create index if not exists source_drug_sections_imported_from_idx on public.source_drug_sections (imported_from);
create index if not exists source_drug_sections_activation_state_idx on public.source_drug_sections (activation_state);
create index if not exists source_drug_sections_review_status_idx on public.source_drug_sections (review_status);
create index if not exists source_drug_sections_visibility_idx on public.source_drug_sections (visibility);
create index if not exists source_drug_sections_clinical_payload_status_idx
  on public.source_drug_sections (clinical_payload_status);
create index if not exists source_drug_sections_sort_order_idx on public.source_drug_sections (entity_slug, sort_order);

create table if not exists public.source_drug_tables (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  source_slug text not null,
  source_prefix text,
  entity_slug text not null,
  entity_type text not null default 'drug_table',
  payload_item_id text not null,
  imported_from text not null default 'nabda_db',
  imported_at timestamptz not null default now(),
  activation_state text not null default 'source_preserved_locked',
  review_status text not null default 'unreviewed',
  visibility text not null default 'admin_only',
  clinical_payload_status text not null default 'locked',
  sort_order integer not null default 0,
  payload jsonb not null,
  plain_text text,
  warnings text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint source_drug_tables_entity_type_check check (
    entity_type in ('drug_table')
  ),
  constraint source_drug_tables_activation_state_check check (
    activation_state in ('source_preserved_locked', 'source_preserved_active')
  ),
  constraint source_drug_tables_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  ),
  constraint source_drug_tables_visibility_check check (
    visibility in ('public_free', 'premium', 'preview_only', 'hidden', 'admin_only')
  ),
  constraint source_drug_tables_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  )
);

create unique index if not exists source_drug_tables_source_item_uidx
  on public.source_drug_tables (source_id, payload_item_id);

create index if not exists source_drug_tables_source_id_idx on public.source_drug_tables (source_id);
create index if not exists source_drug_tables_source_slug_idx on public.source_drug_tables (source_slug);
create index if not exists source_drug_tables_entity_slug_idx on public.source_drug_tables (entity_slug);
create index if not exists source_drug_tables_entity_type_idx on public.source_drug_tables (entity_type);
create index if not exists source_drug_tables_imported_from_idx on public.source_drug_tables (imported_from);
create index if not exists source_drug_tables_activation_state_idx on public.source_drug_tables (activation_state);
create index if not exists source_drug_tables_review_status_idx on public.source_drug_tables (review_status);
create index if not exists source_drug_tables_visibility_idx on public.source_drug_tables (visibility);
create index if not exists source_drug_tables_clinical_payload_status_idx
  on public.source_drug_tables (clinical_payload_status);
create index if not exists source_drug_tables_sort_order_idx on public.source_drug_tables (entity_slug, sort_order);

create table if not exists public.source_calculator_profiles (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  source_slug text not null,
  source_prefix text,
  entity_slug text not null,
  entity_type text not null default 'calculator_profile',
  payload_item_id text not null,
  imported_from text not null default 'nabda_db',
  imported_at timestamptz not null default now(),
  activation_state text not null default 'source_preserved_locked',
  review_status text not null default 'unreviewed',
  visibility text not null default 'admin_only',
  clinical_payload_status text not null default 'locked',
  sort_order integer not null default 0,
  payload jsonb not null,
  plain_text text,
  warnings text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint source_calculator_profiles_entity_type_check check (
    entity_type in ('calculator_profile')
  ),
  constraint source_calculator_profiles_activation_state_check check (
    activation_state in ('source_preserved_locked', 'source_preserved_active')
  ),
  constraint source_calculator_profiles_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  ),
  constraint source_calculator_profiles_visibility_check check (
    visibility in ('public_free', 'premium', 'preview_only', 'hidden', 'admin_only')
  ),
  constraint source_calculator_profiles_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  )
);

create unique index if not exists source_calculator_profiles_source_item_uidx
  on public.source_calculator_profiles (source_id, payload_item_id);

create index if not exists source_calculator_profiles_source_id_idx on public.source_calculator_profiles (source_id);
create index if not exists source_calculator_profiles_source_slug_idx on public.source_calculator_profiles (source_slug);
create index if not exists source_calculator_profiles_entity_slug_idx on public.source_calculator_profiles (entity_slug);
create index if not exists source_calculator_profiles_imported_from_idx on public.source_calculator_profiles (imported_from);
create index if not exists source_calculator_profiles_activation_state_idx
  on public.source_calculator_profiles (activation_state);
create index if not exists source_calculator_profiles_review_status_idx on public.source_calculator_profiles (review_status);
create index if not exists source_calculator_profiles_visibility_idx on public.source_calculator_profiles (visibility);
create index if not exists source_calculator_profiles_clinical_payload_status_idx
  on public.source_calculator_profiles (clinical_payload_status);

-- ---------------------------------------------------------------------------
-- Optional identity flags (metadata only)
-- ---------------------------------------------------------------------------

alter table public.protocols
  add column if not exists has_source_payload boolean not null default false,
  add column if not exists source_payload_types text[] not null default '{}'::text[];

alter table public.cat_maps
  add column if not exists has_source_payload boolean not null default false,
  add column if not exists source_payload_types text[] not null default '{}'::text[];

alter table public.drugs
  add column if not exists has_source_payload boolean not null default false,
  add column if not exists source_payload_types text[] not null default '{}'::text[];

alter table public.calculators
  add column if not exists has_source_payload boolean not null default false,
  add column if not exists source_payload_types text[] not null default '{}'::text[];

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

drop trigger if exists source_protocol_sections_set_updated_at on public.source_protocol_sections;
create trigger source_protocol_sections_set_updated_at
before update on public.source_protocol_sections
for each row execute function public.update_updated_at_column();

drop trigger if exists source_cat_steps_set_updated_at on public.source_cat_steps;
create trigger source_cat_steps_set_updated_at
before update on public.source_cat_steps
for each row execute function public.update_updated_at_column();

drop trigger if exists source_drug_sections_set_updated_at on public.source_drug_sections;
create trigger source_drug_sections_set_updated_at
before update on public.source_drug_sections
for each row execute function public.update_updated_at_column();

drop trigger if exists source_drug_tables_set_updated_at on public.source_drug_tables;
create trigger source_drug_tables_set_updated_at
before update on public.source_drug_tables
for each row execute function public.update_updated_at_column();

drop trigger if exists source_calculator_profiles_set_updated_at on public.source_calculator_profiles;
create trigger source_calculator_profiles_set_updated_at
before update on public.source_calculator_profiles
for each row execute function public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- RLS: no anon/authenticated access. Service role bypasses RLS.
-- ---------------------------------------------------------------------------

alter table public.source_protocol_sections enable row level security;
alter table public.source_cat_steps enable row level security;
alter table public.source_drug_sections enable row level security;
alter table public.source_drug_tables enable row level security;
alter table public.source_calculator_profiles enable row level security;

comment on table public.source_protocol_sections is
  'Source-preserved protocol section payloads. Admin-only. Not publicly activated.';
comment on table public.source_cat_steps is
  'Source-preserved CAT linear steps. No graph edges.';
comment on table public.source_drug_sections is
  'Source-preserved drug section payloads. Not posology rules.';
comment on table public.source_drug_tables is
  'Source-preserved drug table candidates. preserveCells only; not interaction/dose engines.';
comment on table public.source_calculator_profiles is
  'Source-preserved calculator analysis profiles. No executable JS or formula_json engines.';
