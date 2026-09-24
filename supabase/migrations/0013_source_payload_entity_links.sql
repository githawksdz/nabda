-- Links source-preserved payload rows to identity rows without forcing same source_id.
-- Service role only. No public RLS policies.

create table if not exists public.source_payload_entity_links (
  id uuid primary key default gen_random_uuid(),
  identity_table text not null,
  identity_slug text not null,
  identity_source_id text,
  payload_table text not null,
  payload_entity_slug text not null,
  payload_source_id text,
  relationship text not null,
  confidence text not null default 'inferred',
  imported_from text not null default 'nabda_db',
  source_trace jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint source_payload_entity_links_identity_table_check check (
    identity_table in ('protocols', 'cat_maps', 'drugs', 'calculators')
  ),
  constraint source_payload_entity_links_payload_table_check check (
    payload_table in (
      'source_protocol_sections',
      'source_cat_steps',
      'source_drug_sections',
      'source_drug_tables',
      'source_calculator_profiles'
    )
  ),
  constraint source_payload_entity_links_relationship_check check (
    relationship in (
      'primary_monograph',
      'presentation_monograph',
      'product_monograph',
      'availability_child',
      'source_payload'
    )
  ),
  constraint source_payload_entity_links_confidence_check check (
    confidence in ('exact', 'presentation_index', 'slug_prefix', 'inferred')
  )
);

create unique index if not exists source_payload_entity_links_unique_link_uidx
  on public.source_payload_entity_links (
    identity_table,
    identity_slug,
    payload_table,
    payload_entity_slug,
    relationship
  );

create index if not exists source_payload_entity_links_identity_idx
  on public.source_payload_entity_links (identity_table, identity_slug);

create index if not exists source_payload_entity_links_payload_idx
  on public.source_payload_entity_links (payload_table, payload_entity_slug);

create index if not exists source_payload_entity_links_payload_source_id_idx
  on public.source_payload_entity_links (payload_source_id);

create index if not exists source_payload_entity_links_relationship_idx
  on public.source_payload_entity_links (relationship);

create index if not exists source_payload_entity_links_imported_from_idx
  on public.source_payload_entity_links (imported_from);

drop trigger if exists source_payload_entity_links_set_updated_at on public.source_payload_entity_links;
create trigger source_payload_entity_links_set_updated_at
before update on public.source_payload_entity_links
for each row execute function public.update_updated_at_column();

alter table public.source_payload_entity_links enable row level security;

comment on table public.source_payload_entity_links is
  'Maps admin-only source payloads to identity rows (e.g. presentation monograph -> DCI drug).';
