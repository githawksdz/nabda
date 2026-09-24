-- Batched drug search indexing (avoids API gateway timeouts).
-- Prefetch allowed slugs; process by entity_slug prefix.

create or replace function public.refresh_search_documents_drugs_batch(p_prefix text)
returns jsonb
language plpgsql
security definer
set search_path = public
set statement_timeout = '90s'
as $$
declare
  started timestamptz := clock_timestamp();
  inserted_sections int := 0;
  inserted_tables int := 0;
begin
  create temporary table if not exists _search_allowed_drug_slugs (
    entity_slug text primary key,
    route_slug text not null,
    display_title text,
    therapeutic_class text
  ) on commit drop;

  truncate _search_allowed_drug_slugs;

  insert into _search_allowed_drug_slugs (entity_slug, route_slug, display_title, therapeutic_class)
  select d.slug, d.slug, coalesce(d.display_name, d.dci, d.slug), d.therapeutic_class
  from public.drugs d
  where coalesce(d.slug, '') <> ''
    and (p_prefix = '' or d.slug like p_prefix || '%')
  on conflict (entity_slug) do nothing;

  insert into _search_allowed_drug_slugs (entity_slug, route_slug, display_title, therapeutic_class)
  select
    l.payload_entity_slug,
    l.identity_slug,
    coalesce(d.display_name, d.dci, l.identity_slug),
    d.therapeutic_class
  from public.source_payload_entity_links l
  left join public.drugs d on d.slug = l.identity_slug
  where l.identity_table = 'drugs'
    and l.payload_table in ('source_drug_sections', 'source_drug_tables')
    and coalesce(l.payload_entity_slug, '') <> ''
    and (p_prefix = '' or l.payload_entity_slug like p_prefix || '%')
  on conflict (entity_slug) do nothing;

  insert into public.search_documents (
    entity_type, entity_slug, entity_source_id, content_type, content_id,
    content_order, title, subtitle, snippet, searchable_text, route_href,
    section_anchor, category_slug, tags, priority, visibility, review_status,
    activation_state, imported_from, source_trace, updated_at
  )
  select
    'drug', s.entity_slug, s.source_id, 'drug_section', s.payload_item_id, s.sort_order,
    left(
      coalesce(a.display_title, s.entity_slug) || ' · ' ||
      coalesce(s.payload->>'title', s.payload->>'sourceHeading', 'Section'),
      240
    ),
    coalesce(s.payload->>'kind', 'Section médicament'),
    nullif(left(regexp_replace(coalesce(s.plain_text, ''), '\s+', ' ', 'g'), 220), ''),
    trim(both from concat_ws(
      ' ', a.display_title, a.route_slug,
      s.payload->>'title', s.payload->>'sourceHeading',
      left(coalesce(s.plain_text, ''), 500)
    )),
    '/drugs/' || a.route_slug,
    'drug-section-' || regexp_replace(coalesce(s.payload->>'id', s.payload_item_id), '[^a-zA-Z0-9_-]', '-', 'g'),
    a.therapeutic_class, '{}'::text[], 50, 'public_free',
    coalesce(s.review_status, 'unreviewed'), coalesce(s.activation_state, 'source_preserved_active'),
    'nabda_db', jsonb_build_object('kind', 'source_drug_sections', 'payload_item_id', s.payload_item_id), now()
  from public.source_drug_sections s
  inner join _search_allowed_drug_slugs a on a.entity_slug = s.entity_slug
  where s.entity_type = 'drug_section'
    and coalesce(s.payload_item_id, '') <> ''
  on conflict (entity_type, entity_slug, content_type, content_id) do update set
    title = excluded.title, subtitle = excluded.subtitle, snippet = excluded.snippet,
    searchable_text = excluded.searchable_text, route_href = excluded.route_href,
    section_anchor = excluded.section_anchor, priority = excluded.priority,
    review_status = excluded.review_status, source_trace = excluded.source_trace,
    updated_at = now();

  get diagnostics inserted_sections = row_count;

  insert into public.search_documents (
    entity_type, entity_slug, entity_source_id, content_type, content_id,
    content_order, title, subtitle, snippet, searchable_text, route_href,
    section_anchor, category_slug, tags, priority, visibility, review_status,
    activation_state, imported_from, source_trace, updated_at
  )
  select
    'drug', s.entity_slug, s.source_id, 'drug_table', s.payload_item_id, s.sort_order,
    left(
      coalesce(a.display_title, s.entity_slug) || ' · ' ||
      coalesce(s.payload->>'sourceHeading', s.payload->>'title', 'Tableau'),
      240
    ),
    coalesce(s.payload->>'tableKind', 'Tableau source'),
    nullif(left(coalesce(s.payload->>'textPreview', left(coalesce(s.plain_text, ''), 160), s.payload->>'sourceHeading'), 160), ''),
    trim(both from concat_ws(
      ' ', a.display_title, a.route_slug, s.payload->>'sourceHeading',
      s.payload->>'tableKind', s.payload->>'textPreview', left(coalesce(s.plain_text, ''), 200)
    )),
    '/drugs/' || a.route_slug,
    null, a.therapeutic_class, '{}'::text[], 40, 'public_free',
    coalesce(s.review_status, 'unreviewed'), coalesce(s.activation_state, 'source_preserved_active'),
    'nabda_db', jsonb_build_object('kind', 'source_drug_tables', 'payload_item_id', s.payload_item_id), now()
  from public.source_drug_tables s
  inner join _search_allowed_drug_slugs a on a.entity_slug = s.entity_slug
  where s.entity_type = 'drug_table'
    and coalesce(s.payload_item_id, '') <> ''
  on conflict (entity_type, entity_slug, content_type, content_id) do update set
    title = excluded.title, subtitle = excluded.subtitle, snippet = excluded.snippet,
    searchable_text = excluded.searchable_text, route_href = excluded.route_href,
    priority = excluded.priority, review_status = excluded.review_status,
    source_trace = excluded.source_trace, updated_at = now();

  get diagnostics inserted_tables = row_count;

  return jsonb_build_object(
    'ok', true,
    'step', 'drugs_batch',
    'prefix', p_prefix,
    'sections', inserted_sections,
    'tables', inserted_tables,
    'elapsed_ms', round(extract(epoch from (clock_timestamp() - started)) * 1000)
  );
end;
$$;

revoke all on function public.refresh_search_documents_drugs_batch(text) from public, anon, authenticated;
grant execute on function public.refresh_search_documents_drugs_batch(text) to service_role;

-- Keep old drugs function as a thin wrapper that processes empty-prefix only when small.
create or replace function public.refresh_search_documents_drugs()
returns jsonb
language plpgsql
security definer
set search_path = public
set statement_timeout = '90s'
as $$
begin
  -- Prefer batched caller from TS. Empty prefix still attempts full linked set.
  return public.refresh_search_documents_drugs_batch('');
end;
$$;
