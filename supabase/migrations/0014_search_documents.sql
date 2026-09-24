-- Search Stage B: public-safe search documents derived from identities + source payloads.
-- Stores titles, headings, and short excerpts only. No raw admin payload exposure.
-- Service role manages rows; anon/authenticated can SELECT public_free/premium only.

create extension if not exists pg_trgm;

create table if not exists public.search_documents (
  id uuid primary key default gen_random_uuid(),

  entity_type text not null,
  entity_slug text not null,
  entity_source_id text null,

  content_type text not null,
  content_id text not null,
  content_order integer not null default 0,

  title text not null,
  subtitle text null,
  snippet text null,
  searchable_text text not null,

  route_href text not null,
  section_anchor text null,

  category_slug text null,
  tags text[] not null default '{}',
  priority integer not null default 0,

  visibility text not null default 'public_free',
  review_status text not null default 'unreviewed',
  activation_state text not null default 'source_preserved_active',

  imported_from text not null default 'nabda_db',
  source_trace jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint search_documents_entity_type_check check (
    entity_type in ('protocol', 'cat', 'drug', 'calculator')
  ),
  constraint search_documents_content_type_check check (
    content_type in (
      'identity',
      'section',
      'step',
      'drug_section',
      'drug_table',
      'calculator_profile'
    )
  ),
  constraint search_documents_visibility_check check (
    visibility in ('public_free', 'premium', 'preview_only', 'hidden', 'admin_only')
  ),
  constraint search_documents_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  ),
  constraint search_documents_route_public_check check (
    route_href like '/%' and route_href not like '/internal%'
  ),
  unique (entity_type, entity_slug, content_type, content_id)
);

create index if not exists search_documents_entity_idx
  on public.search_documents (entity_type, entity_slug);

create index if not exists search_documents_type_idx
  on public.search_documents (entity_type, content_type);

create index if not exists search_documents_category_idx
  on public.search_documents (category_slug);

create index if not exists search_documents_visibility_idx
  on public.search_documents (visibility);

create index if not exists search_documents_priority_idx
  on public.search_documents (priority desc);

create index if not exists search_documents_tags_idx
  on public.search_documents using gin (tags);

create index if not exists search_documents_text_idx
  on public.search_documents using gin (to_tsvector('french', searchable_text));

create index if not exists search_documents_title_trgm_idx
  on public.search_documents using gin (title gin_trgm_ops);

create index if not exists search_documents_searchable_trgm_idx
  on public.search_documents using gin (searchable_text gin_trgm_ops);

alter table public.search_documents enable row level security;

drop policy if exists "Public can read searchable documents" on public.search_documents;

create policy "Public can read searchable documents"
on public.search_documents
for select
to anon, authenticated
using (
  visibility in ('public_free', 'premium')
);

-- No insert/update/delete policies for anon/authenticated (service role bypasses RLS).

-- Lightweight excerpt views for indexing (caps plain_text to avoid timeouts).
create or replace view public.search_payload_protocol_excerpts as
select
  source_id,
  source_slug,
  entity_slug,
  entity_type,
  payload_item_id,
  sort_order,
  left(coalesce(plain_text, ''), 500) as plain_text,
  review_status,
  activation_state,
  visibility
from public.source_protocol_sections
where entity_type = 'protocol_section';

create or replace view public.search_payload_cat_excerpts as
select
  source_id,
  source_slug,
  entity_slug,
  entity_type,
  payload_item_id,
  sort_order,
  left(coalesce(plain_text, ''), 500) as plain_text,
  review_status,
  activation_state,
  visibility
from public.source_cat_steps
where entity_type = 'cat_step';

create or replace view public.search_payload_drug_section_excerpts as
select
  source_id,
  source_slug,
  entity_slug,
  entity_type,
  payload_item_id,
  sort_order,
  left(coalesce(plain_text, ''), 500) as plain_text,
  review_status,
  activation_state,
  visibility
from public.source_drug_sections
where entity_type = 'drug_section';

create or replace view public.search_payload_drug_table_excerpts as
select
  source_id,
  source_slug,
  entity_slug,
  entity_type,
  payload_item_id,
  sort_order,
  left(coalesce(plain_text, ''), 400) as plain_text,
  review_status,
  activation_state,
  visibility,
  payload->>'title' as title,
  payload->>'sourceHeading' as "sourceHeading",
  payload->>'tableKind' as "tableKind",
  payload->>'textPreview' as "textPreview",
  payload->'headers' as headers
from public.source_drug_tables
where entity_type = 'drug_table';

create or replace view public.search_payload_calculator_excerpts as
select
  source_id,
  source_slug,
  entity_slug,
  entity_type,
  payload_item_id,
  sort_order,
  left(coalesce(plain_text, ''), 400) as plain_text,
  review_status,
  activation_state,
  visibility,
  payload->>'id' as id,
  payload->>'title' as title,
  payload->>'slug' as slug,
  payload->>'risk' as risk,
  payload->>'uxPattern' as "uxPattern",
  payload->>'kind' as kind,
  payload->>'titleFrCandidate' as "titleFrCandidate",
  payload->>'titleEn' as "titleEn",
  left(coalesce(payload->>'formulaHtmlPreview', ''), 300) as "formulaHtmlPreview",
  left(coalesce(payload->>'formulaPreview', ''), 300) as "formulaPreview",
  payload->>'equationLogicText' as "equationLogicText",
  payload->>'jsPreview' as "jsPreview",
  payload->'inputSchemaPreview' as "inputSchemaPreview",
  payload->>'shouldStayLocked' as "shouldStayLocked",
  payload->>'hasRawJs' as "hasRawJs",
  payload->>'hasDosingLanguage' as "hasDosingLanguage"
from public.source_calculator_profiles
where entity_type = 'calculator_profile';

-- Views inherit underlying table RLS; service role still used for generation.
grant select on public.search_payload_protocol_excerpts to service_role;
grant select on public.search_payload_cat_excerpts to service_role;
grant select on public.search_payload_drug_section_excerpts to service_role;
grant select on public.search_payload_drug_table_excerpts to service_role;
grant select on public.search_payload_calculator_excerpts to service_role;
