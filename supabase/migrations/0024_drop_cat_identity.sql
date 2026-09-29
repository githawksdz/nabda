-- CAT is no longer a content identity. Guidelines stay protocols.
-- Flowchart HTML remains in source_protocol_sections.

-- ---------------------------------------------------------------------------
-- Remap user rows, then delete CAT-only records
-- ---------------------------------------------------------------------------

update public.user_favorites
set item_slug = regexp_replace(item_slug, '-cat$', '')
where item_type = 'cat'
  and item_slug ~ '-cat$';

delete from public.user_favorites cat_row
where cat_row.item_type = 'cat'
  and exists (
    select 1
    from public.user_favorites protocol_row
    where protocol_row.user_id = cat_row.user_id
      and protocol_row.item_type = 'protocol'
      and protocol_row.item_slug = cat_row.item_slug
  );

update public.user_favorites
set item_type = 'protocol'
where item_type = 'cat';

update public.user_history
set item_slug = regexp_replace(item_slug, '-cat$', '')
where item_type = 'cat'
  and item_slug ~ '-cat$';

delete from public.user_history cat_row
where cat_row.item_type = 'cat'
  and exists (
    select 1
    from public.user_history protocol_row
    where protocol_row.user_id = cat_row.user_id
      and protocol_row.item_type = 'protocol'
      and protocol_row.item_slug = cat_row.item_slug
  );

update public.user_history
set item_type = 'protocol'
where item_type = 'cat';

delete from public.protocol_links
where target_type = 'cat'
   or relationship = 'primary_cat';

delete from public.search_documents
where entity_type = 'cat';

delete from public.content_pack_items
where content_type = 'cat';

delete from public.source_payload_entity_links
where identity_table = 'cat_maps'
   or payload_table = 'source_cat_steps';

update public.home_feed_items
set
  target_type = 'protocol',
  target_slug = regexp_replace(coalesce(target_slug, ''), '-cat$', '')
where target_type = 'cat';

-- ---------------------------------------------------------------------------
-- Checks: protocol | drug | calculator only
-- ---------------------------------------------------------------------------

alter table public.user_favorites drop constraint if exists user_favorites_item_type_check;
alter table public.user_favorites
  add constraint user_favorites_item_type_check check (
    item_type in ('protocol', 'calculator', 'drug')
  );

alter table public.user_history drop constraint if exists user_history_item_type_check;
alter table public.user_history
  add constraint user_history_item_type_check check (
    item_type in ('protocol', 'calculator', 'drug', 'search')
  );

alter table public.home_feed_items drop constraint if exists home_feed_items_target_type_check;
alter table public.home_feed_items
  add constraint home_feed_items_target_type_check check (
    target_type is null
    or target_type in (
      'protocol',
      'calculator',
      'drug',
      'premium',
      'offline',
      'profile',
      'external',
      'none'
    )
  );

alter table public.protocol_links drop constraint if exists protocol_links_target_type_check;
alter table public.protocol_links
  add constraint protocol_links_target_type_check check (
    target_type in ('protocol', 'drug', 'calculator', 'external')
  );

alter table public.search_documents drop constraint if exists search_documents_entity_type_check;
alter table public.search_documents
  add constraint search_documents_entity_type_check check (
    entity_type in ('protocol', 'drug', 'calculator')
  );

alter table public.content_pack_items drop constraint if exists content_pack_items_type_check;
alter table public.content_pack_items
  add constraint content_pack_items_type_check check (
    content_type in ('protocol', 'drug', 'calculator')
  );

alter table public.source_payload_entity_links
  drop constraint if exists source_payload_entity_links_identity_table_check;
alter table public.source_payload_entity_links
  add constraint source_payload_entity_links_identity_table_check check (
    identity_table in ('protocols', 'drugs', 'calculators')
  );

alter table public.source_payload_entity_links
  drop constraint if exists source_payload_entity_links_payload_table_check;
alter table public.source_payload_entity_links
  add constraint source_payload_entity_links_payload_table_check check (
    payload_table in (
      'source_protocol_sections',
      'source_drug_sections',
      'source_drug_tables',
      'source_calculator_profiles'
    )
  );

-- ---------------------------------------------------------------------------
-- Functions that previously branched on cat_maps
-- ---------------------------------------------------------------------------

create or replace function public.pack_item_parent_downloadable(
  p_content_type text,
  p_content_slug text
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case p_content_type
    when 'protocol' then exists (
      select 1 from public.protocols p
      where p.slug = p_content_slug
        and p.status = 'published'
        and p.offline_available = true
    )
    when 'drug' then exists (
      select 1 from public.drugs d
      where d.slug = p_content_slug
        and d.status = 'published'
        and d.offline_available = true
    )
    when 'calculator' then exists (
      select 1 from public.calculators c
      where c.slug = p_content_slug
        and c.status = 'published'
        and c.offline_available = true
    )
    else false
  end;
$$;

create or replace function public.pack_item_visibility(
  p_content_type text,
  p_content_slug text
)
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case p_content_type
    when 'protocol' then (
      select p.visibility from public.protocols p where p.slug = p_content_slug
    )
    when 'drug' then (
      select d.visibility from public.drugs d where d.slug = p_content_slug
    )
    when 'calculator' then (
      select c.visibility from public.calculators c where c.slug = p_content_slug
    )
    else null
  end;
$$;

create or replace function public.set_offline_available(
  p_content_type text,
  p_content_slug text,
  p_available boolean
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_content_type = 'protocol' then
    update public.protocols set offline_available = p_available, updated_at = now()
    where slug = p_content_slug;
  elsif p_content_type = 'drug' then
    update public.drugs set offline_available = p_available, updated_at = now()
    where slug = p_content_slug;
  elsif p_content_type = 'calculator' then
    update public.calculators set offline_available = p_available, updated_at = now()
    where slug = p_content_slug;
  else
    raise exception 'invalid content type';
  end if;
end;
$$;

create or replace function public.staff_set_offline_available(
  p_content_type text,
  p_content_slug text,
  p_available boolean
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.has_staff_editor() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_available = false and exists (
    select 1
    from public.content_pack_items i
    join public.content_packs p on p.id = i.pack_id
    where i.content_type = p_content_type
      and i.content_slug = p_content_slug
      and p.status = 'published'
  ) then
    raise exception 'cannot disable offline for an item in a published pack'
      using errcode = '23514';
  end if;
  if p_content_type = 'protocol' then
    update public.protocols set offline_available = p_available, updated_at = now()
    where slug = p_content_slug;
  elsif p_content_type = 'drug' then
    update public.drugs set offline_available = p_available, updated_at = now()
    where slug = p_content_slug;
  elsif p_content_type = 'calculator' then
    update public.calculators set offline_available = p_available, updated_at = now()
    where slug = p_content_slug;
  else
    raise exception 'invalid content type';
  end if;
end;
$$;

create or replace function public.staff_replace_pack_items(
  p_pack_id uuid,
  p_items jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_item jsonb;
  v_type text;
  v_slug text;
  v_order integer;
begin
  if not public.has_staff_editor() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'pack items must be an array' using errcode = '23514';
  end if;

  select status into v_status from public.content_packs where id = p_pack_id;
  if v_status is null then
    raise exception 'pack not found' using errcode = 'P0002';
  end if;
  if v_status = 'published' and jsonb_array_length(p_items) = 0 then
    raise exception 'cannot publish empty pack' using errcode = '23514';
  end if;

  delete from public.content_pack_items where pack_id = p_pack_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_type := v_item->>'content_type';
    v_slug := v_item->>'content_slug';
    v_order := coalesce((v_item->>'sort_order')::integer, 0);
    if v_type not in ('protocol', 'drug', 'calculator') or v_slug is null or length(v_slug) = 0 then
      raise exception 'invalid pack item' using errcode = '23514';
    end if;
    insert into public.content_pack_items (pack_id, content_type, content_slug, sort_order)
    values (p_pack_id, v_type, v_slug, v_order);
  end loop;

  update public.content_packs set updated_at = now() where id = p_pack_id;
end;
$$;

create or replace function public.parent_is_published(
  p_entity_type text,
  p_entity_slug text
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case p_entity_type
    when 'protocol' then exists (
      select 1 from public.protocols p
      where p.slug = p_entity_slug and p.status = 'published'
    )
    when 'drug' then exists (
      select 1 from public.drugs d
      where d.slug = p_entity_slug and d.status = 'published'
    )
    when 'calculator' then exists (
      select 1 from public.calculators c
      where c.slug = p_entity_slug and c.status = 'published'
    )
    else false
  end;
$$;

create or replace function public.parent_is_publicly_readable(
  p_entity_type text,
  p_entity_slug text
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case p_entity_type
    when 'protocol' then exists (
      select 1 from public.protocols p
      where p.slug = p_entity_slug
        and p.status = 'published'
        and (
          p.visibility = 'public_free'
          or (p.visibility = 'premium' and public.has_active_pro())
        )
    )
    when 'drug' then exists (
      select 1 from public.drugs d
      where d.slug = p_entity_slug
        and d.status = 'published'
        and (
          d.visibility = 'public_free'
          or (d.visibility = 'premium' and public.has_active_pro())
        )
    )
    when 'calculator' then exists (
      select 1 from public.calculators c
      where c.slug = p_entity_slug
        and c.status = 'published'
        and (
          c.visibility = 'public_free'
          or (c.visibility = 'premium' and public.has_active_pro())
        )
    )
    else false
  end;
$$;

create or replace function public.refresh_search_documents_identities()
returns jsonb
language plpgsql
security definer
set search_path = public
set statement_timeout = '120s'
as $$
declare
  started timestamptz := clock_timestamp();
begin
  insert into public.search_documents (
    entity_type, entity_slug, entity_source_id, content_type, content_id,
    content_order, title, subtitle, snippet, searchable_text, route_href,
    section_anchor, category_slug, tags, priority, visibility, review_status,
    activation_state, imported_from, source_trace, updated_at
  )
  select
    'protocol', p.slug, p.source_id, 'identity', 'identity', 0,
    coalesce(nullif(p.title, ''), nullif(p.short_title, ''), p.slug),
    coalesce(p.category_slug, 'Recommandation'),
    left(coalesce(nullif(p.short_title, ''), p.title, p.slug), 220),
    trim(both from concat_ws(' ', p.title, p.short_title, p.slug, p.category_slug, p.source_id)),
    '/protocols/' || p.slug, null, p.category_slug, '{}'::text[], 100,
    'public_free', coalesce(p.review_status, 'unreviewed'), 'source_preserved_active',
    'nabda_db', jsonb_build_object('kind', 'identity', 'table', 'protocols'), now()
  from public.protocols p
  where coalesce(p.slug, '') <> ''
  on conflict (entity_type, entity_slug, content_type, content_id) do update set
    title = excluded.title, subtitle = excluded.subtitle, snippet = excluded.snippet,
    searchable_text = excluded.searchable_text, route_href = excluded.route_href,
    category_slug = excluded.category_slug, priority = excluded.priority,
    review_status = excluded.review_status, source_trace = excluded.source_trace,
    updated_at = now();

  insert into public.search_documents (
    entity_type, entity_slug, entity_source_id, content_type, content_id,
    content_order, title, subtitle, snippet, searchable_text, route_href,
    section_anchor, category_slug, tags, priority, visibility, review_status,
    activation_state, imported_from, source_trace, updated_at
  )
  select
    'drug', d.slug, d.source_id, 'identity', 'identity', 0,
    coalesce(nullif(d.display_name, ''), nullif(d.dci, ''), d.slug),
    coalesce(d.therapeutic_class, d.dci, 'Médicament'),
    left(coalesce(d.dci, d.display_name, d.slug), 220),
    trim(both from concat_ws(' ', d.display_name, d.dci, d.therapeutic_class, d.slug, d.source_id)),
    '/drugs/' || d.slug, null, d.therapeutic_class, '{}'::text[], 100,
    'public_free', coalesce(d.review_status, 'unreviewed'), 'source_preserved_active',
    'nabda_db', jsonb_build_object('kind', 'identity', 'table', 'drugs'), now()
  from public.drugs d
  where coalesce(d.slug, '') <> ''
  on conflict (entity_type, entity_slug, content_type, content_id) do update set
    title = excluded.title, subtitle = excluded.subtitle, snippet = excluded.snippet,
    searchable_text = excluded.searchable_text, route_href = excluded.route_href,
    category_slug = excluded.category_slug, priority = excluded.priority,
    review_status = excluded.review_status, source_trace = excluded.source_trace,
    updated_at = now();

  insert into public.search_documents (
    entity_type, entity_slug, entity_source_id, content_type, content_id,
    content_order, title, subtitle, snippet, searchable_text, route_href,
    section_anchor, category_slug, tags, priority, visibility, review_status,
    activation_state, imported_from, source_trace, updated_at
  )
  select
    'calculator', calc.slug, calc.source_id, 'identity', 'identity', 0,
    coalesce(nullif(calc.title, ''), nullif(calc.short_title, ''), calc.slug),
    coalesce(calc.category_slug, 'Score'),
    case
      when calc.clinical_payload_status = 'locked' or calc.visibility = 'admin_only' or calc.status = 'draft'
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
    null, calc.category_slug, '{}'::text[],
    case when calc.clinical_payload_status = 'locked' or calc.visibility = 'admin_only' or calc.status = 'draft' then 90 else 100 end,
    'public_free', coalesce(calc.review_status, 'unreviewed'),
    case when calc.clinical_payload_status = 'locked' or calc.visibility = 'admin_only' or calc.status = 'draft'
      then 'source_preserved_locked' else 'source_preserved_active' end,
    'nabda_db', jsonb_build_object('kind', 'identity', 'table', 'calculators'), now()
  from public.calculators calc
  where coalesce(calc.slug, '') <> ''
  on conflict (entity_type, entity_slug, content_type, content_id) do update set
    title = excluded.title, subtitle = excluded.subtitle, snippet = excluded.snippet,
    searchable_text = excluded.searchable_text, route_href = excluded.route_href,
    category_slug = excluded.category_slug, priority = excluded.priority,
    activation_state = excluded.activation_state, review_status = excluded.review_status,
    source_trace = excluded.source_trace, updated_at = now();

  return jsonb_build_object(
    'ok', true,
    'step', 'identities',
    'elapsed_ms', round(extract(epoch from (clock_timestamp() - started)) * 1000)
  );
end;
$$;

create or replace function public.refresh_search_documents_cats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return jsonb_build_object('ok', true, 'step', 'cats', 'skipped', true);
end;
$$;

create or replace function public.refresh_search_documents()
returns jsonb
language plpgsql
security definer
set search_path = public
set statement_timeout = '600s'
as $$
declare
  started timestamptz := clock_timestamp();
  steps jsonb := '[]'::jsonb;
  step jsonb;
begin
  step := public.refresh_search_documents_identities();
  steps := steps || jsonb_build_array(step);
  step := public.refresh_search_documents_protocols();
  steps := steps || jsonb_build_array(step);
  step := public.refresh_search_documents_drugs();
  steps := steps || jsonb_build_array(step);
  step := public.refresh_search_documents_calculators();
  steps := steps || jsonb_build_array(step);

  return jsonb_build_object(
    'ok', true,
    'elapsed_ms', round(extract(epoch from (clock_timestamp() - started)) * 1000),
    'steps', steps,
    'total_docs', (select count(*) from public.search_documents),
    'by_entity', (
      select coalesce(jsonb_object_agg(entity_type, cnt), '{}'::jsonb)
      from (select entity_type, count(*)::int as cnt from public.search_documents group by entity_type) t
    ),
    'by_content', (
      select coalesce(jsonb_object_agg(content_type, cnt), '{}'::jsonb)
      from (select content_type, count(*)::int as cnt from public.search_documents group by content_type) t
    )
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Drop CAT views and tables
-- ---------------------------------------------------------------------------

drop view if exists public.public_source_cat_steps;
drop view if exists public.catalog_cat_maps;
drop view if exists public.search_payload_cat_excerpts;

drop table if exists public.cat_edges;
drop table if exists public.cat_blocks;
drop table if exists public.source_cat_steps;
drop table if exists public.cat_maps;
