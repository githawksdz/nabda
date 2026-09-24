-- Server-side search document refresh (avoids REST timeouts on large plain_text).
-- Service role only. Upserts identities + safe excerpts into search_documents.

create or replace function public.refresh_search_documents()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  upserted int := 0;
  skipped_locked_calc int := 0;
  started timestamptz := clock_timestamp();
begin
  -- -------------------------------------------------------------------------
  -- Protocol identities
  -- -------------------------------------------------------------------------
  insert into public.search_documents (
    entity_type, entity_slug, entity_source_id, content_type, content_id,
    content_order, title, subtitle, snippet, searchable_text, route_href,
    section_anchor, category_slug, tags, priority, visibility, review_status,
    activation_state, imported_from, source_trace, updated_at
  )
  select
    'protocol',
    p.slug,
    p.source_id,
    'identity',
    'identity',
    0,
    coalesce(nullif(p.title, ''), nullif(p.short_title, ''), p.slug),
    coalesce(p.category_slug, 'Recommandation'),
    left(coalesce(nullif(p.short_title, ''), p.title, p.slug), 220),
    trim(both from concat_ws(' ', p.title, p.short_title, p.slug, p.category_slug, p.source_id)),
    '/protocols/' || p.slug,
    null,
    p.category_slug,
    coalesce(
      case
        when jsonb_typeof(p.source_trace->'tag_slugs') = 'array'
          then array(select jsonb_array_elements_text(p.source_trace->'tag_slugs'))
        else '{}'::text[]
      end,
      '{}'::text[]
    ),
    100,
    'public_free',
    coalesce(p.review_status, 'unreviewed'),
    'source_preserved_active',
    'nabda_db',
    jsonb_build_object('kind', 'identity', 'table', 'protocols'),
    now()
  from public.protocols p
  where coalesce(p.slug, '') <> ''
  on conflict (entity_type, entity_slug, content_type, content_id)
  do update set
    title = excluded.title,
    subtitle = excluded.subtitle,
    snippet = excluded.snippet,
    searchable_text = excluded.searchable_text,
    route_href = excluded.route_href,
    category_slug = excluded.category_slug,
    tags = excluded.tags,
    priority = excluded.priority,
    review_status = excluded.review_status,
    source_trace = excluded.source_trace,
    updated_at = now();

  get diagnostics upserted = row_count;

  -- -------------------------------------------------------------------------
  -- CAT identities
  -- -------------------------------------------------------------------------
  insert into public.search_documents (
    entity_type, entity_slug, entity_source_id, content_type, content_id,
    content_order, title, subtitle, snippet, searchable_text, route_href,
    section_anchor, category_slug, tags, priority, visibility, review_status,
    activation_state, imported_from, source_trace, updated_at
  )
  select
    'cat',
    c.slug,
    c.source_id,
    'identity',
    'identity',
    0,
    coalesce(nullif(c.title, ''), c.slug),
    'Conduite à tenir',
    left(coalesce(c.title, c.slug), 220),
    trim(both from concat_ws(' ', c.title, c.slug, c.source_id)),
    '/cat/' || c.slug,
    null,
    null,
    '{}'::text[],
    100,
    'public_free',
    coalesce(c.review_status, 'unreviewed'),
    'source_preserved_active',
    'nabda_db',
    jsonb_build_object('kind', 'identity', 'table', 'cat_maps'),
    now()
  from public.cat_maps c
  where coalesce(c.slug, '') <> ''
  on conflict (entity_type, entity_slug, content_type, content_id)
  do update set
    title = excluded.title,
    subtitle = excluded.subtitle,
    snippet = excluded.snippet,
    searchable_text = excluded.searchable_text,
    route_href = excluded.route_href,
    priority = excluded.priority,
    review_status = excluded.review_status,
    source_trace = excluded.source_trace,
    updated_at = now();

  -- -------------------------------------------------------------------------
  -- Drug identities
  -- -------------------------------------------------------------------------
  insert into public.search_documents (
    entity_type, entity_slug, entity_source_id, content_type, content_id,
    content_order, title, subtitle, snippet, searchable_text, route_href,
    section_anchor, category_slug, tags, priority, visibility, review_status,
    activation_state, imported_from, source_trace, updated_at
  )
  select
    'drug',
    d.slug,
    d.source_id,
    'identity',
    'identity',
    0,
    coalesce(nullif(d.display_name, ''), nullif(d.dci, ''), d.slug),
    coalesce(d.therapeutic_class, d.dci, 'Médicament'),
    left(coalesce(d.dci, d.display_name, d.slug), 220),
    trim(both from concat_ws(' ', d.display_name, d.dci, d.therapeutic_class, d.slug, d.source_id)),
    '/drugs/' || d.slug,
    null,
    d.therapeutic_class,
    '{}'::text[],
    100,
    'public_free',
    coalesce(d.review_status, 'unreviewed'),
    'source_preserved_active',
    'nabda_db',
    jsonb_build_object('kind', 'identity', 'table', 'drugs'),
    now()
  from public.drugs d
  where coalesce(d.slug, '') <> ''
  on conflict (entity_type, entity_slug, content_type, content_id)
  do update set
    title = excluded.title,
    subtitle = excluded.subtitle,
    snippet = excluded.snippet,
    searchable_text = excluded.searchable_text,
    route_href = excluded.route_href,
    category_slug = excluded.category_slug,
    priority = excluded.priority,
    review_status = excluded.review_status,
    source_trace = excluded.source_trace,
    updated_at = now();

  -- -------------------------------------------------------------------------
  -- Calculator identities (locked → catalogue snippet, no formula)
  -- -------------------------------------------------------------------------
  insert into public.search_documents (
    entity_type, entity_slug, entity_source_id, content_type, content_id,
    content_order, title, subtitle, snippet, searchable_text, route_href,
    section_anchor, category_slug, tags, priority, visibility, review_status,
    activation_state, imported_from, source_trace, updated_at
  )
  select
    'calculator',
    calc.slug,
    calc.source_id,
    'identity',
    'identity',
    0,
    coalesce(nullif(calc.title, ''), nullif(calc.short_title, ''), calc.slug),
    coalesce(calc.category_slug, 'Score'),
    case
      when calc.clinical_payload_status = 'locked'
        or calc.visibility = 'admin_only'
        or calc.status = 'draft'
      then 'Calculateur catalogue · saisie non activée'
      else left(coalesce(calc.short_title, calc.title, calc.slug), 220)
    end,
    trim(both from concat_ws(' ', calc.title, calc.short_title, calc.slug, calc.category_slug, calc.source_id)),
    case
      when calc.slug in ('glasgow', 'glasgow-coma-scale-score-gcs') then '/calculators/glasgow'
      when calc.slug in ('cockcroft-gault', 'creatinine-clearance-cockcroft-gault-equation')
        then '/calculators/cockcroft-gault'
      else '/calculators/' || calc.slug
    end,
    null,
    calc.category_slug,
    '{}'::text[],
    case
      when calc.clinical_payload_status = 'locked'
        or calc.visibility = 'admin_only'
        or calc.status = 'draft'
      then 90
      else 100
    end,
    'public_free',
    coalesce(calc.review_status, 'unreviewed'),
    case
      when calc.clinical_payload_status = 'locked'
        or calc.visibility = 'admin_only'
        or calc.status = 'draft'
      then 'source_preserved_locked'
      else 'source_preserved_active'
    end,
    'nabda_db',
    jsonb_build_object('kind', 'identity', 'table', 'calculators'),
    now()
  from public.calculators calc
  where coalesce(calc.slug, '') <> ''
  on conflict (entity_type, entity_slug, content_type, content_id)
  do update set
    title = excluded.title,
    subtitle = excluded.subtitle,
    snippet = excluded.snippet,
    searchable_text = excluded.searchable_text,
    route_href = excluded.route_href,
    category_slug = excluded.category_slug,
    priority = excluded.priority,
    activation_state = excluded.activation_state,
    review_status = excluded.review_status,
    source_trace = excluded.source_trace,
    updated_at = now();

  -- -------------------------------------------------------------------------
  -- Protocol sections (capped plain_text)
  -- -------------------------------------------------------------------------
  insert into public.search_documents (
    entity_type, entity_slug, entity_source_id, content_type, content_id,
    content_order, title, subtitle, snippet, searchable_text, route_href,
    section_anchor, category_slug, tags, priority, visibility, review_status,
    activation_state, imported_from, source_trace, updated_at
  )
  select
    'protocol',
    s.entity_slug,
    s.source_id,
    'section',
    s.payload_item_id,
    s.sort_order,
    left(
      coalesce(p.title, s.entity_slug) || ' · ' ||
      coalesce(s.payload->>'title', s.payload->>'sourceHeading', 'Section'),
      240
    ),
    coalesce(s.payload->>'kind', s.payload->>'display', 'Section'),
    nullif(left(regexp_replace(coalesce(s.plain_text, ''), '\s+', ' ', 'g'), 220), ''),
    trim(both from concat_ws(
      ' ',
      p.title,
      s.payload->>'title',
      s.payload->>'sourceHeading',
      left(coalesce(s.plain_text, ''), 500)
    )),
    '/protocols/' || s.entity_slug,
    'section-' || regexp_replace(
      coalesce(s.payload->>'id', s.payload_item_id),
      '[^a-zA-Z0-9_-]',
      '-',
      'g'
    ),
    p.category_slug,
    '{}'::text[],
    50,
    'public_free',
    coalesce(s.review_status, 'unreviewed'),
    coalesce(s.activation_state, 'source_preserved_active'),
    'nabda_db',
    jsonb_build_object('kind', 'source_protocol_sections', 'payload_item_id', s.payload_item_id),
    now()
  from public.source_protocol_sections s
  left join public.protocols p on p.slug = s.entity_slug
  where s.entity_type = 'protocol_section'
    and coalesce(s.entity_slug, '') <> ''
    and coalesce(s.payload_item_id, '') <> ''
    and length(trim(both from concat_ws(
      ' ',
      s.payload->>'title',
      s.payload->>'sourceHeading',
      left(coalesce(s.plain_text, ''), 500)
    ))) > 0
  on conflict (entity_type, entity_slug, content_type, content_id)
  do update set
    title = excluded.title,
    subtitle = excluded.subtitle,
    snippet = excluded.snippet,
    searchable_text = excluded.searchable_text,
    route_href = excluded.route_href,
    section_anchor = excluded.section_anchor,
    priority = excluded.priority,
    review_status = excluded.review_status,
    source_trace = excluded.source_trace,
    updated_at = now();

  -- -------------------------------------------------------------------------
  -- CAT steps
  -- -------------------------------------------------------------------------
  insert into public.search_documents (
    entity_type, entity_slug, entity_source_id, content_type, content_id,
    content_order, title, subtitle, snippet, searchable_text, route_href,
    section_anchor, category_slug, tags, priority, visibility, review_status,
    activation_state, imported_from, source_trace, updated_at
  )
  select
    'cat',
    s.entity_slug,
    s.source_id,
    'step',
    s.payload_item_id,
    s.sort_order,
    left(
      coalesce(c.title, s.entity_slug) || ' · ' ||
      coalesce(s.payload->>'title', s.payload->>'sourceHeading', 'Étape'),
      240
    ),
    coalesce(s.payload->>'kind', s.payload->>'priority', 'Étape'),
    nullif(left(regexp_replace(coalesce(s.plain_text, ''), '\s+', ' ', 'g'), 220), ''),
    trim(both from concat_ws(
      ' ',
      c.title,
      s.payload->>'title',
      left(coalesce(s.plain_text, ''), 500)
    )),
    '/cat/' || s.entity_slug,
    coalesce(s.payload->>'id', s.payload_item_id),
    null,
    '{}'::text[],
    case
      when s.payload->>'priority' in ('critical', 'urgent') then 80
      else 50
    end,
    'public_free',
    coalesce(s.review_status, 'unreviewed'),
    coalesce(s.activation_state, 'source_preserved_active'),
    'nabda_db',
    jsonb_build_object('kind', 'source_cat_steps', 'payload_item_id', s.payload_item_id),
    now()
  from public.source_cat_steps s
  left join public.cat_maps c on c.slug = s.entity_slug
  where s.entity_type = 'cat_step'
    and coalesce(s.entity_slug, '') <> ''
    and coalesce(s.payload_item_id, '') <> ''
  on conflict (entity_type, entity_slug, content_type, content_id)
  do update set
    title = excluded.title,
    subtitle = excluded.subtitle,
    snippet = excluded.snippet,
    searchable_text = excluded.searchable_text,
    route_href = excluded.route_href,
    section_anchor = excluded.section_anchor,
    priority = excluded.priority,
    review_status = excluded.review_status,
    source_trace = excluded.source_trace,
    updated_at = now();

  -- -------------------------------------------------------------------------
  -- Drug sections (capped text; skip empty)
  -- -------------------------------------------------------------------------
  insert into public.search_documents (
    entity_type, entity_slug, entity_source_id, content_type, content_id,
    content_order, title, subtitle, snippet, searchable_text, route_href,
    section_anchor, category_slug, tags, priority, visibility, review_status,
    activation_state, imported_from, source_trace, updated_at
  )
  select
    'drug',
    s.entity_slug,
    s.source_id,
    'drug_section',
    s.payload_item_id,
    s.sort_order,
    left(
      coalesce(d.display_name, d.dci, s.entity_slug) || ' · ' ||
      coalesce(s.payload->>'title', s.payload->>'sourceHeading', 'Section'),
      240
    ),
    coalesce(s.payload->>'kind', 'Section médicament'),
    nullif(left(regexp_replace(coalesce(s.plain_text, ''), '\s+', ' ', 'g'), 220), ''),
    trim(both from concat_ws(
      ' ',
      d.display_name,
      d.dci,
      s.payload->>'title',
      s.payload->>'sourceHeading',
      left(coalesce(s.plain_text, ''), 500)
    )),
    '/drugs/' || s.entity_slug,
    'drug-section-' || regexp_replace(
      coalesce(s.payload->>'id', s.payload_item_id),
      '[^a-zA-Z0-9_-]',
      '-',
      'g'
    ),
    d.therapeutic_class,
    '{}'::text[],
    50,
    'public_free',
    coalesce(s.review_status, 'unreviewed'),
    coalesce(s.activation_state, 'source_preserved_active'),
    'nabda_db',
    jsonb_build_object('kind', 'source_drug_sections', 'payload_item_id', s.payload_item_id),
    now()
  from public.source_drug_sections s
  left join public.drugs d on d.slug = s.entity_slug
  where s.entity_type = 'drug_section'
    and coalesce(s.entity_slug, '') <> ''
    and coalesce(s.payload_item_id, '') <> ''
    and length(trim(both from concat_ws(
      ' ',
      s.payload->>'title',
      s.payload->>'sourceHeading',
      left(coalesce(s.plain_text, ''), 200)
    ))) > 0
  on conflict (entity_type, entity_slug, content_type, content_id)
  do update set
    title = excluded.title,
    subtitle = excluded.subtitle,
    snippet = excluded.snippet,
    searchable_text = excluded.searchable_text,
    route_href = excluded.route_href,
    section_anchor = excluded.section_anchor,
    priority = excluded.priority,
    review_status = excluded.review_status,
    source_trace = excluded.source_trace,
    updated_at = now();

  -- -------------------------------------------------------------------------
  -- Drug tables (headers / short preview only)
  -- -------------------------------------------------------------------------
  insert into public.search_documents (
    entity_type, entity_slug, entity_source_id, content_type, content_id,
    content_order, title, subtitle, snippet, searchable_text, route_href,
    section_anchor, category_slug, tags, priority, visibility, review_status,
    activation_state, imported_from, source_trace, updated_at
  )
  select
    'drug',
    s.entity_slug,
    s.source_id,
    'drug_table',
    s.payload_item_id,
    s.sort_order,
    left(
      coalesce(d.display_name, d.dci, s.entity_slug) || ' · ' ||
      coalesce(s.payload->>'sourceHeading', s.payload->>'title', 'Tableau'),
      240
    ),
    coalesce(s.payload->>'tableKind', 'Tableau source'),
    nullif(
      left(
        coalesce(
          s.payload->>'textPreview',
          left(coalesce(s.plain_text, ''), 160),
          s.payload->>'sourceHeading'
        ),
        160
      ),
      ''
    ),
    trim(both from concat_ws(
      ' ',
      d.display_name,
      s.payload->>'sourceHeading',
      s.payload->>'tableKind',
      s.payload->>'textPreview',
      left(coalesce(s.plain_text, ''), 200)
    )),
    '/drugs/' || s.entity_slug,
    null,
    d.therapeutic_class,
    '{}'::text[],
    40,
    'public_free',
    coalesce(s.review_status, 'unreviewed'),
    coalesce(s.activation_state, 'source_preserved_active'),
    'nabda_db',
    jsonb_build_object('kind', 'source_drug_tables', 'payload_item_id', s.payload_item_id),
    now()
  from public.source_drug_tables s
  left join public.drugs d on d.slug = s.entity_slug
  where s.entity_type = 'drug_table'
    and coalesce(s.entity_slug, '') <> ''
    and coalesce(s.payload_item_id, '') <> ''
  on conflict (entity_type, entity_slug, content_type, content_id)
  do update set
    title = excluded.title,
    subtitle = excluded.subtitle,
    snippet = excluded.snippet,
    searchable_text = excluded.searchable_text,
    route_href = excluded.route_href,
    priority = excluded.priority,
    review_status = excluded.review_status,
    source_trace = excluded.source_trace,
    updated_at = now();

  -- -------------------------------------------------------------------------
  -- Calculator profiles: only non-high-risk / non-JS (identity already covers locked)
  -- -------------------------------------------------------------------------
  insert into public.search_documents (
    entity_type, entity_slug, entity_source_id, content_type, content_id,
    content_order, title, subtitle, snippet, searchable_text, route_href,
    section_anchor, category_slug, tags, priority, visibility, review_status,
    activation_state, imported_from, source_trace, updated_at
  )
  select
    'calculator',
    s.entity_slug,
    s.source_id,
    'calculator_profile',
    s.payload_item_id,
    s.sort_order,
    coalesce(
      nullif(s.payload->>'titleFrCandidate', ''),
      nullif(s.payload->>'titleEn', ''),
      calc.title,
      s.entity_slug
    ),
    nullif(concat_ws(' · ', s.payload->>'uxPattern', s.payload->>'risk'), ''),
    'Profil catalogue · saisie non exécutée',
    trim(both from concat_ws(
      ' ',
      s.payload->>'titleFrCandidate',
      s.payload->>'titleEn',
      s.payload->>'kind',
      s.payload->>'uxPattern',
      left(coalesce(s.payload->>'formulaHtmlPreview', s.payload->>'formulaPreview', ''), 200)
    )),
    case
      when s.entity_slug in ('glasgow', 'glasgow-coma-scale-score-gcs') then '/calculators/glasgow'
      when s.entity_slug in ('cockcroft-gault', 'creatinine-clearance-cockcroft-gault-equation')
        then '/calculators/cockcroft-gault'
      else '/calculators/' || s.entity_slug
    end,
    null,
    calc.category_slug,
    '{}'::text[],
    60,
    'public_free',
    coalesce(s.review_status, 'unreviewed'),
    coalesce(s.activation_state, 'source_preserved_active'),
    'nabda_db',
    jsonb_build_object('kind', 'source_calculator_profiles', 'payload_item_id', s.payload_item_id),
    now()
  from public.source_calculator_profiles s
  left join public.calculators calc on calc.slug = s.entity_slug
  where s.entity_type = 'calculator_profile'
    and coalesce(s.entity_slug, '') <> ''
    and coalesce(s.payload_item_id, '') <> ''
    and coalesce(s.payload->>'risk', '') <> 'high'
    and coalesce(s.payload->>'shouldStayLocked', 'false') not in ('true', 't', '1')
    and coalesce(s.payload->>'hasRawJs', 'false') not in ('true', 't', '1')
    and coalesce(s.payload->>'hasDosingLanguage', 'false') not in ('true', 't', '1')
    and coalesce(s.payload->>'equationLogicText', '') = ''
    and coalesce(s.payload->>'jsPreview', '') = ''
  on conflict (entity_type, entity_slug, content_type, content_id)
  do update set
    title = excluded.title,
    subtitle = excluded.subtitle,
    snippet = excluded.snippet,
    searchable_text = excluded.searchable_text,
    route_href = excluded.route_href,
    priority = excluded.priority,
    review_status = excluded.review_status,
    source_trace = excluded.source_trace,
    updated_at = now();

  get diagnostics skipped_locked_calc = row_count;

  return jsonb_build_object(
    'ok', true,
    'elapsed_ms', round(extract(epoch from (clock_timestamp() - started)) * 1000),
    'total_docs', (select count(*) from public.search_documents),
    'by_entity', (
      select coalesce(jsonb_object_agg(entity_type, cnt), '{}'::jsonb)
      from (
        select entity_type, count(*)::int as cnt
        from public.search_documents
        group by entity_type
      ) t
    ),
    'by_content', (
      select coalesce(jsonb_object_agg(content_type, cnt), '{}'::jsonb)
      from (
        select content_type, count(*)::int as cnt
        from public.search_documents
        group by content_type
      ) t
    )
  );
end;
$$;

revoke all on function public.refresh_search_documents() from public;
revoke all on function public.refresh_search_documents() from anon, authenticated;
grant execute on function public.refresh_search_documents() to service_role;
