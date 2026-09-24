-- Phase 1: provenance metadata for nabda_db identity imports.
-- Does not import rows, HTML, calculator logic, or CAT graphs.
-- Does not mark content validated.
-- RLS is intentionally unchanged: status = imported stays invisible to
-- anon/authenticated because public policies still require
-- status in ('seed_placeholder', 'published') and visibility in
-- ('public_free', 'premium'). Importer must also set visibility = admin_only.

-- ---------------------------------------------------------------------------
-- Shared provenance columns
-- ---------------------------------------------------------------------------

alter table public.protocols
  add column if not exists source_id text,
  add column if not exists source_prefix text,
  add column if not exists source_slug text,
  add column if not exists imported_from text,
  add column if not exists imported_at timestamptz,
  add column if not exists source_trace jsonb not null default '{}'::jsonb,
  add column if not exists local_adaptation_status text,
  add column if not exists clinical_payload_status text not null default 'locked';

alter table public.cat_maps
  add column if not exists source_id text,
  add column if not exists source_prefix text,
  add column if not exists source_slug text,
  add column if not exists imported_from text,
  add column if not exists imported_at timestamptz,
  add column if not exists source_trace jsonb not null default '{}'::jsonb,
  add column if not exists local_adaptation_status text,
  add column if not exists clinical_payload_status text not null default 'locked';

alter table public.calculators
  add column if not exists source_id text,
  add column if not exists source_prefix text,
  add column if not exists source_slug text,
  add column if not exists imported_from text,
  add column if not exists imported_at timestamptz,
  add column if not exists source_trace jsonb not null default '{}'::jsonb,
  add column if not exists local_adaptation_status text,
  add column if not exists clinical_payload_status text not null default 'locked';

alter table public.drugs
  add column if not exists source_id text,
  add column if not exists source_prefix text,
  add column if not exists source_slug text,
  add column if not exists imported_from text,
  add column if not exists imported_at timestamptz,
  add column if not exists source_trace jsonb not null default '{}'::jsonb,
  add column if not exists local_adaptation_status text,
  add column if not exists clinical_payload_status text not null default 'locked';

alter table public.home_feed_items
  add column if not exists source_id text,
  add column if not exists source_prefix text,
  add column if not exists source_slug text,
  add column if not exists imported_from text,
  add column if not exists imported_at timestamptz,
  add column if not exists source_trace jsonb not null default '{}'::jsonb,
  add column if not exists local_adaptation_status text,
  add column if not exists clinical_payload_status text not null default 'locked',
  add column if not exists review_status text not null default 'unreviewed';

alter table public.protocol_sections
  add column if not exists source_id text,
  add column if not exists source_prefix text,
  add column if not exists source_slug text,
  add column if not exists imported_from text,
  add column if not exists imported_at timestamptz,
  add column if not exists source_trace jsonb not null default '{}'::jsonb,
  add column if not exists local_adaptation_status text,
  add column if not exists clinical_payload_status text not null default 'locked';

alter table public.protocol_references
  add column if not exists source_id text,
  add column if not exists source_prefix text,
  add column if not exists source_slug text,
  add column if not exists imported_from text,
  add column if not exists imported_at timestamptz,
  add column if not exists source_trace jsonb not null default '{}'::jsonb,
  add column if not exists local_adaptation_status text,
  add column if not exists clinical_payload_status text not null default 'locked';

alter table public.protocol_links
  add column if not exists source_id text,
  add column if not exists source_prefix text,
  add column if not exists source_slug text,
  add column if not exists imported_from text,
  add column if not exists imported_at timestamptz,
  add column if not exists source_trace jsonb not null default '{}'::jsonb,
  add column if not exists local_adaptation_status text,
  add column if not exists clinical_payload_status text not null default 'locked';

alter table public.cat_blocks
  add column if not exists source_id text,
  add column if not exists source_prefix text,
  add column if not exists source_slug text,
  add column if not exists imported_from text,
  add column if not exists imported_at timestamptz,
  add column if not exists local_adaptation_status text,
  add column if not exists clinical_payload_status text not null default 'locked';

update public.cat_blocks
set source_trace = '{}'::jsonb
where source_trace is null;

alter table public.cat_blocks
  alter column source_trace set default '{}'::jsonb;

alter table public.cat_blocks
  alter column source_trace set not null;

alter table public.cat_edges
  add column if not exists source_id text,
  add column if not exists source_prefix text,
  add column if not exists source_slug text,
  add column if not exists imported_from text,
  add column if not exists imported_at timestamptz,
  add column if not exists source_trace jsonb not null default '{}'::jsonb,
  add column if not exists local_adaptation_status text,
  add column if not exists clinical_payload_status text not null default 'locked';

-- ---------------------------------------------------------------------------
-- Publication status: allow imported (and cleaned) without dropping existing
-- values. Do not treat these as published.
-- ---------------------------------------------------------------------------

alter table public.protocols drop constraint if exists protocols_status_check;
alter table public.protocols
  add constraint protocols_status_check check (
    status in (
      'draft',
      'seed_placeholder',
      'imported',
      'cleaned',
      'review_needed',
      'published',
      'hidden',
      'archived'
    )
  );

alter table public.cat_maps drop constraint if exists cat_maps_status_check;
alter table public.cat_maps
  add constraint cat_maps_status_check check (
    status in (
      'not_available',
      'seed_placeholder',
      'imported',
      'cleaned',
      'draft_extracted',
      'manual_authoring',
      'ready_for_review',
      'approved',
      'published',
      'needs_revision',
      'hidden'
    )
  );

alter table public.calculators drop constraint if exists calculators_status_check;
alter table public.calculators
  add constraint calculators_status_check check (
    status in (
      'draft',
      'seed_placeholder',
      'imported',
      'cleaned',
      'needs_validation',
      'validated',
      'published',
      'hidden'
    )
  );

alter table public.drugs drop constraint if exists drugs_status_check;
alter table public.drugs
  add constraint drugs_status_check check (
    status in (
      'draft',
      'seed_placeholder',
      'imported',
      'cleaned',
      'needs_pharmacist_review',
      'reviewed',
      'published',
      'hidden'
    )
  );

-- Align CAT/calculator/drug visibility with protocols. RLS is not loosened.
alter table public.cat_maps drop constraint if exists cat_maps_visibility_check;
alter table public.cat_maps
  add constraint cat_maps_visibility_check check (
    visibility in ('public_free', 'premium', 'preview_only', 'hidden', 'admin_only')
  );

alter table public.calculators drop constraint if exists calculators_visibility_check;
alter table public.calculators
  add constraint calculators_visibility_check check (
    visibility in ('public_free', 'premium', 'preview_only', 'hidden', 'admin_only')
  );

alter table public.drugs drop constraint if exists drugs_visibility_check;
alter table public.drugs
  add constraint drugs_visibility_check check (
    visibility in ('public_free', 'premium', 'preview_only', 'hidden', 'admin_only')
  );

alter table public.home_feed_items drop constraint if exists home_feed_items_visibility_check;
alter table public.home_feed_items
  add constraint home_feed_items_visibility_check check (
    visibility in ('public_free', 'premium', 'preview_only', 'hidden', 'admin_only')
  );

alter table public.home_feed_items drop constraint if exists home_feed_items_review_status_check;
alter table public.home_feed_items
  add constraint home_feed_items_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  );

-- ---------------------------------------------------------------------------
-- Provenance vocabulary
-- ---------------------------------------------------------------------------

alter table public.protocols drop constraint if exists protocols_local_adaptation_status_check;
alter table public.protocols
  add constraint protocols_local_adaptation_status_check check (
    local_adaptation_status is null
    or local_adaptation_status in ('pending', 'in_progress', 'to_verify', 'adapted')
  );

alter table public.cat_maps drop constraint if exists cat_maps_local_adaptation_status_check;
alter table public.cat_maps
  add constraint cat_maps_local_adaptation_status_check check (
    local_adaptation_status is null
    or local_adaptation_status in ('pending', 'in_progress', 'to_verify', 'adapted')
  );

alter table public.calculators drop constraint if exists calculators_local_adaptation_status_check;
alter table public.calculators
  add constraint calculators_local_adaptation_status_check check (
    local_adaptation_status is null
    or local_adaptation_status in ('pending', 'in_progress', 'to_verify', 'adapted')
  );

alter table public.drugs drop constraint if exists drugs_local_adaptation_status_check;
alter table public.drugs
  add constraint drugs_local_adaptation_status_check check (
    local_adaptation_status is null
    or local_adaptation_status in ('pending', 'in_progress', 'to_verify', 'adapted')
  );

alter table public.home_feed_items drop constraint if exists home_feed_items_local_adaptation_status_check;
alter table public.home_feed_items
  add constraint home_feed_items_local_adaptation_status_check check (
    local_adaptation_status is null
    or local_adaptation_status in ('pending', 'in_progress', 'to_verify', 'adapted')
  );

alter table public.protocol_sections drop constraint if exists protocol_sections_local_adaptation_status_check;
alter table public.protocol_sections
  add constraint protocol_sections_local_adaptation_status_check check (
    local_adaptation_status is null
    or local_adaptation_status in ('pending', 'in_progress', 'to_verify', 'adapted')
  );

alter table public.protocol_references drop constraint if exists protocol_references_local_adaptation_status_check;
alter table public.protocol_references
  add constraint protocol_references_local_adaptation_status_check check (
    local_adaptation_status is null
    or local_adaptation_status in ('pending', 'in_progress', 'to_verify', 'adapted')
  );

alter table public.protocol_links drop constraint if exists protocol_links_local_adaptation_status_check;
alter table public.protocol_links
  add constraint protocol_links_local_adaptation_status_check check (
    local_adaptation_status is null
    or local_adaptation_status in ('pending', 'in_progress', 'to_verify', 'adapted')
  );

alter table public.cat_blocks drop constraint if exists cat_blocks_local_adaptation_status_check;
alter table public.cat_blocks
  add constraint cat_blocks_local_adaptation_status_check check (
    local_adaptation_status is null
    or local_adaptation_status in ('pending', 'in_progress', 'to_verify', 'adapted')
  );

alter table public.cat_edges drop constraint if exists cat_edges_local_adaptation_status_check;
alter table public.cat_edges
  add constraint cat_edges_local_adaptation_status_check check (
    local_adaptation_status is null
    or local_adaptation_status in ('pending', 'in_progress', 'to_verify', 'adapted')
  );

alter table public.protocols drop constraint if exists protocols_clinical_payload_status_check;
alter table public.protocols
  add constraint protocols_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  );

alter table public.cat_maps drop constraint if exists cat_maps_clinical_payload_status_check;
alter table public.cat_maps
  add constraint cat_maps_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  );

alter table public.calculators drop constraint if exists calculators_clinical_payload_status_check;
alter table public.calculators
  add constraint calculators_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  );

alter table public.drugs drop constraint if exists drugs_clinical_payload_status_check;
alter table public.drugs
  add constraint drugs_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  );

alter table public.home_feed_items drop constraint if exists home_feed_items_clinical_payload_status_check;
alter table public.home_feed_items
  add constraint home_feed_items_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  );

alter table public.protocol_sections drop constraint if exists protocol_sections_clinical_payload_status_check;
alter table public.protocol_sections
  add constraint protocol_sections_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  );

alter table public.protocol_references drop constraint if exists protocol_references_clinical_payload_status_check;
alter table public.protocol_references
  add constraint protocol_references_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  );

alter table public.protocol_links drop constraint if exists protocol_links_clinical_payload_status_check;
alter table public.protocol_links
  add constraint protocol_links_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  );

alter table public.cat_blocks drop constraint if exists cat_blocks_clinical_payload_status_check;
alter table public.cat_blocks
  add constraint cat_blocks_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  );

alter table public.cat_edges drop constraint if exists cat_edges_clinical_payload_status_check;
alter table public.cat_edges
  add constraint cat_edges_clinical_payload_status_check check (
    clinical_payload_status in ('locked', 'unlocked')
  );

-- Existing seed rows stay locked and untraced. Do not backfill as nabda_db.
update public.protocols
set clinical_payload_status = 'locked'
where clinical_payload_status is distinct from 'locked';

update public.cat_maps
set clinical_payload_status = 'locked'
where clinical_payload_status is distinct from 'locked';

update public.calculators
set clinical_payload_status = 'locked'
where clinical_payload_status is distinct from 'locked';

update public.drugs
set clinical_payload_status = 'locked'
where clinical_payload_status is distinct from 'locked';

update public.home_feed_items
set clinical_payload_status = 'locked'
where clinical_payload_status is distinct from 'locked';

update public.protocol_sections
set clinical_payload_status = 'locked'
where clinical_payload_status is distinct from 'locked';

update public.protocol_references
set clinical_payload_status = 'locked'
where clinical_payload_status is distinct from 'locked';

update public.protocol_links
set clinical_payload_status = 'locked'
where clinical_payload_status is distinct from 'locked';

update public.cat_blocks
set clinical_payload_status = 'locked'
where clinical_payload_status is distinct from 'locked';

update public.cat_edges
set clinical_payload_status = 'locked'
where clinical_payload_status is distinct from 'locked';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create unique index if not exists protocols_source_id_uidx
  on public.protocols (source_id)
  where source_id is not null;
create index if not exists protocols_source_prefix_idx
  on public.protocols (source_prefix);
create index if not exists protocols_imported_from_idx
  on public.protocols (imported_from);
create index if not exists protocols_review_status_idx
  on public.protocols (review_status);

create unique index if not exists cat_maps_source_id_uidx
  on public.cat_maps (source_id)
  where source_id is not null;
create index if not exists cat_maps_source_prefix_idx
  on public.cat_maps (source_prefix);
create index if not exists cat_maps_imported_from_idx
  on public.cat_maps (imported_from);
create index if not exists cat_maps_review_status_idx
  on public.cat_maps (review_status);

create unique index if not exists calculators_source_id_uidx
  on public.calculators (source_id)
  where source_id is not null;
create index if not exists calculators_source_prefix_idx
  on public.calculators (source_prefix);
create index if not exists calculators_imported_from_idx
  on public.calculators (imported_from);
create index if not exists calculators_review_status_idx
  on public.calculators (review_status);

create unique index if not exists drugs_source_id_uidx
  on public.drugs (source_id)
  where source_id is not null;
create index if not exists drugs_source_prefix_idx
  on public.drugs (source_prefix);
create index if not exists drugs_imported_from_idx
  on public.drugs (imported_from);
create index if not exists drugs_review_status_idx
  on public.drugs (review_status);

create index if not exists home_feed_items_source_id_idx
  on public.home_feed_items (source_id);
create index if not exists home_feed_items_source_prefix_idx
  on public.home_feed_items (source_prefix);
create index if not exists home_feed_items_imported_from_idx
  on public.home_feed_items (imported_from);
create index if not exists home_feed_items_review_status_idx
  on public.home_feed_items (review_status);
create index if not exists home_feed_items_visibility_idx
  on public.home_feed_items (visibility);

create index if not exists protocol_sections_source_id_idx
  on public.protocol_sections (source_id);
create index if not exists protocol_sections_imported_from_idx
  on public.protocol_sections (imported_from);
create index if not exists protocol_sections_review_status_idx
  on public.protocol_sections (review_status);

create index if not exists protocol_references_source_id_idx
  on public.protocol_references (source_id);
create index if not exists protocol_references_imported_from_idx
  on public.protocol_references (imported_from);
create index if not exists protocol_references_review_status_idx
  on public.protocol_references (review_status);

create index if not exists protocol_links_source_id_idx
  on public.protocol_links (source_id);
create index if not exists protocol_links_imported_from_idx
  on public.protocol_links (imported_from);

create index if not exists cat_blocks_source_id_idx
  on public.cat_blocks (source_id);
create index if not exists cat_blocks_source_prefix_idx
  on public.cat_blocks (source_prefix);
create index if not exists cat_blocks_imported_from_idx
  on public.cat_blocks (imported_from);
create index if not exists cat_blocks_review_status_idx
  on public.cat_blocks (review_status);

create index if not exists cat_edges_source_id_idx
  on public.cat_edges (source_id);
create index if not exists cat_edges_imported_from_idx
  on public.cat_edges (imported_from);
create index if not exists cat_edges_review_status_idx
  on public.cat_edges (review_status);

comment on column public.protocols.source_id is
  'Stable nabda_db id, e.g. g.asthme-aigu-grave. Null for seed placeholders.';
comment on column public.cat_maps.source_id is
  'Same g.* id as the parent reco. protocol_id remains the Nabda protocol FK.';
comment on column public.calculators.source_id is
  'Stable nabda_db id, e.g. calc.abcd2-score-tia. App slug stays prefix-free.';
comment on column public.drugs.source_id is
  'Stable nabda_db substance id, e.g. s.abacavir.';
comment on column public.protocols.clinical_payload_status is
  'locked until human validation. Importer must not set unlocked.';
comment on column public.home_feed_items.review_status is
  'Editorial feed rows default unreviewed. Do not treat as clinical validation.';
