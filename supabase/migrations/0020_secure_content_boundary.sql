-- Secure content boundary: entitlement columns, staff roles, subscription
-- uniqueness, publication RLS, and safe public projections.
-- Public access is status=published AND visibility in (public_free, premium).
-- review_status is not an authorization signal.
-- Service role still bypasses RLS for import and administrative jobs.

-- ---------------------------------------------------------------------------
-- Staff role on profiles
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists staff_role text not null default 'none';

alter table public.profiles
  drop constraint if exists profiles_staff_role_check;

alter table public.profiles
  add constraint profiles_staff_role_check
  check (staff_role in ('none', 'reviewer', 'editor', 'admin'));

-- ---------------------------------------------------------------------------
-- One active subscription per user; expire duplicates first
-- ---------------------------------------------------------------------------

update public.user_subscriptions
set status = 'expired', updated_at = now()
where status = 'active'
  and ends_at is not null
  and ends_at <= now();

with ranked as (
  select
    id,
    row_number() over (
      partition by user_id
      order by starts_at desc, created_at desc, id desc
    ) as rn
  from public.user_subscriptions
  where status = 'active'
)
update public.user_subscriptions s
set status = 'expired', updated_at = now()
from ranked r
where s.id = r.id
  and r.rn > 1;

drop index if exists user_subscriptions_one_active_uidx;
create unique index user_subscriptions_one_active_uidx
  on public.user_subscriptions (user_id)
  where status = 'active';

-- ---------------------------------------------------------------------------
-- Auth helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_service_role()
returns boolean
language sql
stable
as $$
  select coalesce(auth.role(), '') = 'service_role';
$$;

create or replace function public.has_staff_access()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.staff_role in ('reviewer', 'editor', 'admin')
  );
$$;

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
      and (
        s.plan_slug = 'pro_yearly'
        or s.plan_slug like 'pro%'
      )
  );
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
  -- p_review_status is unused. Public access is published + free/premium only.
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

revoke all on function public.is_service_role() from public, anon, authenticated;
grant execute on function public.is_service_role() to service_role;

revoke all on function public.has_staff_access() from public;
grant execute on function public.has_staff_access() to anon, authenticated, service_role;

revoke all on function public.has_active_pro() from public;
grant execute on function public.has_active_pro() to anon, authenticated, service_role;

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

-- ---------------------------------------------------------------------------
-- Lock entitlement / staff columns on profiles
-- ---------------------------------------------------------------------------

create or replace function public.protect_profile_entitlement_columns()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.is_service_role() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.plan_slug := 'freemium';
    new.plan_status := 'active';
    new.staff_role := 'none';
    return new;
  end if;

  if new.plan_slug is distinct from old.plan_slug
     or new.plan_status is distinct from old.plan_status
     or new.staff_role is distinct from old.staff_role then
    raise exception 'entitlement fields are server-owned'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_entitlement on public.profiles;
create trigger profiles_protect_entitlement
before insert or update on public.profiles
for each row
execute function public.protect_profile_entitlement_columns();

revoke update on table public.profiles from anon, authenticated, public;
grant update (
  email,
  full_name,
  avatar_url,
  profession,
  usage_mode,
  profile_status,
  onboarding_completed,
  onboarding_completed_at,
  onboarding_skipped,
  experience_level,
  region,
  institution,
  practice_context,
  preferences,
  last_seen_at
) on table public.profiles to authenticated;

revoke insert on table public.profiles from anon, authenticated, public;
grant insert (
  id,
  email,
  full_name,
  avatar_url,
  profession,
  usage_mode,
  profile_status,
  onboarding_completed,
  onboarding_completed_at,
  onboarding_skipped,
  experience_level,
  region,
  institution,
  practice_context,
  preferences,
  last_seen_at
) on table public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Administrative entitlement RPCs (service_role only)
-- ---------------------------------------------------------------------------

create or replace function public.set_user_entitlement(
  p_user_id uuid,
  p_plan_slug text,
  p_status text default 'active',
  p_ends_at timestamptz default null,
  p_source text default 'admin'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_profile_status text;
begin
  if p_status not in ('active', 'pending', 'expired', 'cancelled', 'rejected') then
    raise exception 'invalid subscription status';
  end if;

  if not exists (
    select 1 from public.subscription_plans sp where sp.slug = p_plan_slug
  ) then
    raise exception 'unknown plan slug';
  end if;

  if p_status = 'active' then
    update public.user_subscriptions
    set status = 'expired', updated_at = now()
    where user_id = p_user_id
      and status = 'active';
  end if;

  insert into public.user_subscriptions (
    user_id, plan_slug, status, starts_at, ends_at, source
  )
  values (
    p_user_id,
    p_plan_slug,
    p_status,
    now(),
    p_ends_at,
    coalesce(p_source, 'admin')
  )
  returning id into v_id;

  v_profile_status := case
    when p_status = 'active' and (p_ends_at is null or p_ends_at > now()) then 'active'
    when p_status = 'pending' then 'pending'
    when p_status = 'cancelled' then 'cancelled'
    else 'expired'
  end;

  update public.profiles
  set
    plan_slug = case
      when v_profile_status = 'active' then p_plan_slug
      else 'freemium'
    end,
    plan_status = v_profile_status,
    updated_at = now()
  where id = p_user_id;

  return v_id;
end;
$$;

create or replace function public.set_staff_role(
  p_user_id uuid,
  p_staff_role text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_staff_role not in ('none', 'reviewer', 'editor', 'admin') then
    raise exception 'invalid staff role';
  end if;

  update public.profiles
  set staff_role = p_staff_role, updated_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'profile not found';
  end if;
end;
$$;

revoke all on function public.set_user_entitlement(uuid, text, text, timestamptz, text) from public, anon, authenticated;
grant execute on function public.set_user_entitlement(uuid, text, text, timestamptz, text) to service_role;

revoke all on function public.set_staff_role(uuid, text) from public, anon, authenticated;
grant execute on function public.set_staff_role(uuid, text) to service_role;

-- ---------------------------------------------------------------------------
-- Replace parent content policies
-- ---------------------------------------------------------------------------

drop policy if exists "protocols_select_visible" on public.protocols;
create policy "protocols_select_visible"
on public.protocols
for select
to anon, authenticated
using (
  public.content_row_visible(visibility, status, review_status)
);

drop policy if exists "cat_maps_select_visible" on public.cat_maps;
create policy "cat_maps_select_visible"
on public.cat_maps
for select
to anon, authenticated
using (
  public.content_row_visible(visibility, status, review_status)
);

drop policy if exists "calculators_select_visible" on public.calculators;
create policy "calculators_select_visible"
on public.calculators
for select
to anon, authenticated
using (
  public.content_row_visible(visibility, status, review_status)
);

drop policy if exists "drugs_select_visible" on public.drugs;
create policy "drugs_select_visible"
on public.drugs
for select
to anon, authenticated
using (
  public.content_row_visible(visibility, status, review_status)
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
-- Child content policies (published parent is the source of truth)
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
      and public.content_row_visible(p.visibility, p.status, p.review_status)
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
      and public.content_row_visible(p.visibility, p.status, p.review_status)
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
      and public.content_row_visible(p.visibility, p.status, p.review_status)
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
      and public.content_row_visible(m.visibility, m.status, m.review_status)
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
      and public.content_row_visible(m.visibility, m.status, m.review_status)
  )
);

-- ---------------------------------------------------------------------------
-- Search documents
-- ---------------------------------------------------------------------------

drop policy if exists "Public can read searchable documents" on public.search_documents;
create policy "search_documents_select_visible"
on public.search_documents
for select
to anon, authenticated
using (
  (
    visibility = 'public_free'
    or (visibility = 'premium' and public.has_active_pro())
  )
  and visibility not in ('hidden', 'admin_only', 'preview_only')
  and public.parent_is_published(entity_type, entity_slug)
);

grant select on public.search_documents to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Source payloads: RLS for approved public rows + staff
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
      and public.content_row_visible(p.visibility, p.status, p.review_status)
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
      and public.content_row_visible(m.visibility, m.status, m.review_status)
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
    where public.content_row_visible(d.visibility, d.status, d.review_status)
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
    where public.content_row_visible(d.visibility, d.status, d.review_status)
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
      and public.content_row_visible(c.visibility, c.status, c.review_status)
  )
);

grant select on public.source_protocol_sections to anon, authenticated;
grant select on public.source_cat_steps to anon, authenticated;
grant select on public.source_drug_sections to anon, authenticated;
grant select on public.source_drug_tables to anon, authenticated;
grant select on public.source_calculator_profiles to anon, authenticated;

revoke select on public.source_payload_entity_links from anon, public;
grant select on public.source_payload_entity_links to authenticated;

drop policy if exists "source_payload_entity_links_select_visible" on public.source_payload_entity_links;
create policy "source_payload_entity_links_select_visible"
on public.source_payload_entity_links
for select
to authenticated
using (public.has_staff_access() or true);

-- ---------------------------------------------------------------------------
-- Security-barrier views (safe catalog + gated payload identity)
-- ---------------------------------------------------------------------------

create or replace view public.catalog_protocols
with (security_barrier = true, security_invoker = true) as
select
  id, slug, title, short_title, summary, category_slug, content_type,
  status, review_status, visibility, is_featured, published_at, source_note,
  created_at, updated_at
from public.protocols;

create or replace view public.catalog_cat_maps
with (security_barrier = true, security_invoker = true) as
select
  id, protocol_id, slug, title, summary, status, review_status, visibility,
  is_featured, published_at, source_note, created_at, updated_at
from public.cat_maps;

create or replace view public.catalog_calculators
with (security_barrier = true, security_invoker = true) as
select
  id, slug, title, short_title, description, category_slug, status, review_status,
  visibility, is_featured, usage_context, engine_slug, engine_version,
  engine_implemented, created_at, updated_at
from public.calculators;

create or replace view public.catalog_drugs
with (security_barrier = true, security_invoker = true) as
select
  id, slug, dci, display_name, therapeutic_class, summary, status, review_status,
  visibility, is_featured, source_note, created_at, updated_at
from public.drugs;

create or replace view public.public_source_protocol_sections
with (security_barrier = true, security_invoker = true) as
select
  source_id, payload_item_id, entity_type, entity_slug, sort_order,
  payload, warnings, review_status, visibility, activation_state
from public.source_protocol_sections;

create or replace view public.public_source_cat_steps
with (security_barrier = true, security_invoker = true) as
select
  source_id, payload_item_id, entity_type, entity_slug, sort_order,
  payload, warnings, review_status, visibility, activation_state
from public.source_cat_steps;

create or replace view public.public_source_drug_sections
with (security_barrier = true, security_invoker = true) as
select
  source_id, payload_item_id, entity_type, entity_slug, sort_order,
  payload, warnings, review_status, visibility, activation_state
from public.source_drug_sections;

create or replace view public.public_source_drug_tables
with (security_barrier = true, security_invoker = true) as
select
  source_id, payload_item_id, entity_type, entity_slug, sort_order,
  payload, warnings, review_status, visibility, activation_state
from public.source_drug_tables;

create or replace view public.public_source_calculator_profiles
with (security_barrier = true, security_invoker = true) as
select
  source_id, payload_item_id, entity_type, entity_slug, sort_order,
  payload, warnings, review_status, visibility, activation_state
from public.source_calculator_profiles;

grant select on public.catalog_protocols to anon, authenticated;
grant select on public.catalog_cat_maps to anon, authenticated;
grant select on public.catalog_calculators to anon, authenticated;
grant select on public.catalog_drugs to anon, authenticated;
grant select on public.public_source_protocol_sections to anon, authenticated;
grant select on public.public_source_cat_steps to anon, authenticated;
grant select on public.public_source_drug_sections to anon, authenticated;
grant select on public.public_source_drug_tables to anon, authenticated;
grant select on public.public_source_calculator_profiles to anon, authenticated;

-- ---------------------------------------------------------------------------
-- New-user trigger: default staff_role
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (
    id, email, full_name, avatar_url, profile_status, onboarding_completed,
    plan_slug, plan_status, staff_role
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    ),
    'incomplete',
    false,
    'freemium',
    'active',
    'none'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
