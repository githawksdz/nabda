-- Publishing hub boundary (additive, idempotent).
-- Do not rewrite 0020: this file replaces functions/policies if an older
-- 0020 still required review_status = validated.
--
-- Public rule:
--   status = published AND visibility = public_free
--   OR status = published AND visibility = premium AND active Pro
-- Staff may read unpublished rows (dashboard/internal). Staff roles are
-- access roles, not medical-review states.
--
-- LEGACY COLUMNS — leave in place; do not drop in this migration:
--   *.review_status
--   *.clinical_payload_status
--   public.content_review_events
-- Public authorization must not depend on those columns.
-- A later cleanup migration may remove them after a compatibility window.

-- ---------------------------------------------------------------------------
-- Entitlement: active unexpired pro_yearly only
-- ---------------------------------------------------------------------------

create or replace function public.has_active_pro()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_subscriptions s
    where s.user_id = auth.uid()
      and s.status = 'active'
      and (s.ends_at is null or s.ends_at > now())
      and s.plan_slug = 'pro_yearly'
  );
$$;

revoke all on function public.has_active_pro() from public;
grant execute on function public.has_active_pro() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Publication visibility (review_status unused)
-- ---------------------------------------------------------------------------

create or replace function public.content_row_visible(
  p_visibility text,
  p_status text
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    case
      when public.has_staff_access() then true
      when p_status = 'published'
        and p_visibility = 'public_free' then true
      when p_status = 'published'
        and p_visibility = 'premium'
        and public.has_active_pro() then true
      else false
    end;
$$;

create or replace function public.content_row_visible(
  p_visibility text,
  p_status text,
  p_review_status text
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  -- p_review_status is ignored. Kept so existing 3-arg policy calls stay valid.
  select public.content_row_visible(p_visibility, p_status);
$$;

revoke all on function public.content_row_visible(text, text) from public;
grant execute on function public.content_row_visible(text, text) to anon, authenticated, service_role;

revoke all on function public.content_row_visible(text, text, text) from public;
grant execute on function public.content_row_visible(text, text, text) to anon, authenticated, service_role;

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
    when 'cat' then exists (
      select 1 from public.cat_maps m
      where m.slug = p_entity_slug and m.status = 'published'
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

revoke all on function public.parent_is_published(text, text) from public;
grant execute on function public.parent_is_published(text, text) to anon, authenticated, service_role;

-- Search must not use staff bypass or review_status.
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
    when 'cat' then exists (
      select 1 from public.cat_maps m
      where m.slug = p_entity_slug
        and m.status = 'published'
        and (
          m.visibility = 'public_free'
          or (m.visibility = 'premium' and public.has_active_pro())
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

revoke all on function public.parent_is_publicly_readable(text, text) from public;
grant execute on function public.parent_is_publicly_readable(text, text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Subscription writes: service_role / set_user_entitlement only
-- ---------------------------------------------------------------------------

create or replace function public.protect_user_subscription_writes()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  -- Invoker: authenticated users are blocked. service_role JWT and
  -- set_user_entitlement (owner postgres) may write.
  if public.is_service_role() then
    return coalesce(new, old);
  end if;
  if current_user in ('postgres', 'supabase_admin') then
    return coalesce(new, old);
  end if;
  raise exception 'subscriptions are server-owned'
    using errcode = '42501';
end;
$$;

drop trigger if exists user_subscriptions_protect_writes on public.user_subscriptions;
create trigger user_subscriptions_protect_writes
before insert or update or delete on public.user_subscriptions
for each row
execute function public.protect_user_subscription_writes();

revoke insert, update, delete on table public.user_subscriptions from anon, authenticated, public;
grant select on table public.user_subscriptions to authenticated;

-- ---------------------------------------------------------------------------
-- Parent content policies (published + free/premium; no review_status)
-- ---------------------------------------------------------------------------

drop policy if exists "protocols_select_visible" on public.protocols;
create policy "protocols_select_visible"
on public.protocols
for select
to anon, authenticated
using (
  public.content_row_visible(visibility, status)
);

drop policy if exists "cat_maps_select_visible" on public.cat_maps;
create policy "cat_maps_select_visible"
on public.cat_maps
for select
to anon, authenticated
using (
  public.content_row_visible(visibility, status)
);

drop policy if exists "calculators_select_visible" on public.calculators;
create policy "calculators_select_visible"
on public.calculators
for select
to anon, authenticated
using (
  public.content_row_visible(visibility, status)
);

drop policy if exists "drugs_select_visible" on public.drugs;
create policy "drugs_select_visible"
on public.drugs
for select
to anon, authenticated
using (
  public.content_row_visible(visibility, status)
);

drop policy if exists "home_feed_items_select_visible" on public.home_feed_items;
create policy "home_feed_items_select_visible"
on public.home_feed_items
for select
to anon, authenticated
using (
  public.has_staff_access()
  or (
    is_active = true
    and (
      visibility = 'public_free'
      or (visibility = 'premium' and public.has_active_pro())
    )
    and (
      plan_required is distinct from 'pro'
      or public.has_active_pro()
    )
  )
);

-- ---------------------------------------------------------------------------
-- Child rows follow the published parent
-- ---------------------------------------------------------------------------

drop policy if exists "protocol_sections_select_visible" on public.protocol_sections;
create policy "protocol_sections_select_visible"
on public.protocol_sections
for select
to anon, authenticated
using (
  public.has_staff_access()
  or exists (
    select 1
    from public.protocols p
    where p.id = protocol_id
      and public.content_row_visible(p.visibility, p.status)
  )
);

drop policy if exists "protocol_references_select_visible" on public.protocol_references;
create policy "protocol_references_select_visible"
on public.protocol_references
for select
to anon, authenticated
using (
  public.has_staff_access()
  or exists (
    select 1
    from public.protocols p
    where p.id = protocol_id
      and public.content_row_visible(p.visibility, p.status)
  )
);

drop policy if exists "protocol_links_select_visible" on public.protocol_links;
create policy "protocol_links_select_visible"
on public.protocol_links
for select
to anon, authenticated
using (
  public.has_staff_access()
  or exists (
    select 1
    from public.protocols p
    where p.id = protocol_id
      and public.content_row_visible(p.visibility, p.status)
  )
);

drop policy if exists "cat_blocks_select_visible" on public.cat_blocks;
create policy "cat_blocks_select_visible"
on public.cat_blocks
for select
to anon, authenticated
using (
  public.has_staff_access()
  or exists (
    select 1
    from public.cat_maps m
    where m.id = cat_map_id
      and public.content_row_visible(m.visibility, m.status)
  )
);

drop policy if exists "cat_edges_select_visible" on public.cat_edges;
create policy "cat_edges_select_visible"
on public.cat_edges
for select
to anon, authenticated
using (
  public.has_staff_access()
  or exists (
    select 1
    from public.cat_maps m
    where m.id = cat_map_id
      and public.content_row_visible(m.visibility, m.status)
  )
);

-- ---------------------------------------------------------------------------
-- Search: published parent + free/premium. No review_status. No staff leak.
-- ---------------------------------------------------------------------------

drop policy if exists "Public can read searchable documents" on public.search_documents;
drop policy if exists "search_documents_select_visible" on public.search_documents;
create policy "search_documents_select_visible"
on public.search_documents
for select
to anon, authenticated
using (
  visibility in ('public_free', 'premium')
  and visibility not in ('hidden', 'admin_only', 'preview_only')
  and public.parent_is_publicly_readable(entity_type, entity_slug)
);

grant select on public.search_documents to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Source payloads: parent publication is the source of truth
-- ---------------------------------------------------------------------------

drop policy if exists "source_protocol_sections_select_visible" on public.source_protocol_sections;
create policy "source_protocol_sections_select_visible"
on public.source_protocol_sections
for select
to anon, authenticated
using (
  public.has_staff_access()
  or exists (
    select 1
    from public.protocols p
    where p.slug = entity_slug
      and public.content_row_visible(p.visibility, p.status)
  )
);

drop policy if exists "source_cat_steps_select_visible" on public.source_cat_steps;
create policy "source_cat_steps_select_visible"
on public.source_cat_steps
for select
to anon, authenticated
using (
  public.has_staff_access()
  or exists (
    select 1
    from public.cat_maps m
    where m.slug = entity_slug
      and public.content_row_visible(m.visibility, m.status)
  )
);

drop policy if exists "source_drug_sections_select_visible" on public.source_drug_sections;
create policy "source_drug_sections_select_visible"
on public.source_drug_sections
for select
to anon, authenticated
using (
  public.has_staff_access()
  or exists (
    select 1
    from public.drugs d
    where public.content_row_visible(d.visibility, d.status)
      and (
        d.slug = entity_slug
        or exists (
          select 1
          from public.source_payload_entity_links l
          where l.identity_table = 'drugs'
            and l.identity_slug = d.slug
            and l.payload_entity_slug = entity_slug
        )
      )
  )
);

drop policy if exists "source_drug_tables_select_visible" on public.source_drug_tables;
create policy "source_drug_tables_select_visible"
on public.source_drug_tables
for select
to anon, authenticated
using (
  public.has_staff_access()
  or exists (
    select 1
    from public.drugs d
    where public.content_row_visible(d.visibility, d.status)
      and (
        d.slug = entity_slug
        or exists (
          select 1
          from public.source_payload_entity_links l
          where l.identity_table = 'drugs'
            and l.identity_slug = d.slug
            and l.payload_entity_slug = entity_slug
        )
      )
  )
);

drop policy if exists "source_calculator_profiles_select_visible" on public.source_calculator_profiles;
create policy "source_calculator_profiles_select_visible"
on public.source_calculator_profiles
for select
to anon, authenticated
using (
  public.has_staff_access()
  or exists (
    select 1
    from public.calculators c
    where c.slug = entity_slug
      and public.content_row_visible(c.visibility, c.status)
  )
);

grant select on public.source_protocol_sections to anon, authenticated;
grant select on public.source_cat_steps to anon, authenticated;
grant select on public.source_drug_sections to anon, authenticated;
grant select on public.source_drug_tables to anon, authenticated;
grant select on public.source_calculator_profiles to anon, authenticated;

drop policy if exists "source_payload_entity_links_select_visible" on public.source_payload_entity_links;
create policy "source_payload_entity_links_select_visible"
on public.source_payload_entity_links
for select
to anon, authenticated
using (
  public.has_staff_access()
  or (
    identity_table = 'drugs'
    and exists (
      select 1
      from public.drugs d
      where d.slug = identity_slug
        and public.content_row_visible(d.visibility, d.status)
    )
  )
);

grant select on public.source_payload_entity_links to anon, authenticated;

comment on function public.content_row_visible(text, text) is
  'Publishing hub ACL: published + public_free, or published + premium + active Pro. review_status is not used.';

comment on function public.has_active_pro() is
  'True when the current user has status=active, unexpired, plan_slug=pro_yearly. Profile plan fields are not consulted.';

comment on column public.protocols.review_status is
  'Legacy compatibility column. Not an authorization signal. Candidate for a later cleanup migration.';

comment on column public.protocols.clinical_payload_status is
  'Legacy compatibility column. Not an authorization signal. Candidate for a later cleanup migration.';
