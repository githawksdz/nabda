-- Phase 1 offline/PWA data model (additive, idempotent).
-- Publishing hub only: draft | published, public_free | premium.
-- No medical-review, provenance, or editorial workflow fields.
-- Pack membership is explicit. Nothing is auto-included.

alter table public.protocols
  add column if not exists offline_available boolean not null default false;

alter table public.cat_maps
  add column if not exists offline_available boolean not null default false;

alter table public.drugs
  add column if not exists offline_available boolean not null default false;

alter table public.calculators
  add column if not exists offline_available boolean not null default false;

comment on column public.protocols.offline_available is
  'Staff flag: published item may be downloaded for offline use. Default false.';
comment on column public.cat_maps.offline_available is
  'Staff flag: published item may be downloaded for offline use. Default false.';
comment on column public.drugs.offline_available is
  'Staff flag: published item may be downloaded for offline use. Default false.';
comment on column public.calculators.offline_available is
  'Staff flag: published calculator may be downloaded for offline use. Default false.';

create table if not exists public.content_packs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  version integer not null default 1,
  visibility text not null default 'public_free',
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_packs_visibility_check check (
    visibility in ('public_free', 'premium')
  ),
  constraint content_packs_status_check check (
    status in ('draft', 'published')
  ),
  constraint content_packs_version_positive check (version >= 1)
);

create table if not exists public.content_pack_items (
  pack_id uuid not null references public.content_packs (id) on delete cascade,
  content_type text not null,
  content_slug text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (pack_id, content_type, content_slug),
  constraint content_pack_items_type_check check (
    content_type in ('protocol', 'cat', 'drug', 'calculator')
  )
);

create index if not exists content_packs_status_idx on public.content_packs (status);
create index if not exists content_packs_visibility_idx on public.content_packs (visibility);
create index if not exists content_pack_items_slug_idx
  on public.content_pack_items (content_type, content_slug);

drop trigger if exists content_packs_set_updated_at on public.content_packs;
create trigger content_packs_set_updated_at
before update on public.content_packs
for each row
execute function public.update_updated_at_column();

-- Referenced identity must be published + offline_available when the pack is published.
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
    when 'cat' then exists (
      select 1 from public.cat_maps m
      where m.slug = p_content_slug
        and m.status = 'published'
        and m.offline_available = true
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

create or replace function public.assert_pack_items_publishable()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
begin
  select status into v_status from public.content_packs where id = new.pack_id;
  if v_status = 'published'
     and not public.pack_item_parent_downloadable(new.content_type, new.content_slug) then
    raise exception 'pack items must reference published offline-available content'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists content_pack_items_assert_parent on public.content_pack_items;
create trigger content_pack_items_assert_parent
before insert or update on public.content_pack_items
for each row
execute function public.assert_pack_items_publishable();

create or replace function public.assert_pack_publishable()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status = 'published' then
    if exists (
      select 1
      from public.content_pack_items i
      where i.pack_id = new.id
        and not public.pack_item_parent_downloadable(i.content_type, i.content_slug)
    ) then
      raise exception 'cannot publish pack with unpublished or offline-disabled items'
        using errcode = '23514';
    end if;
    if new.published_at is null then
      new.published_at := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists content_packs_assert_publishable on public.content_packs;
create trigger content_packs_assert_publishable
before insert or update on public.content_packs
for each row
execute function public.assert_pack_publishable();

alter table public.content_packs enable row level security;
alter table public.content_pack_items enable row level security;

drop policy if exists "content_packs_select_visible" on public.content_packs;
create policy "content_packs_select_visible"
on public.content_packs
for select
to anon, authenticated
using (
  public.has_staff_access()
  or (
    status = 'published'
    and (
      visibility = 'public_free'
      or (visibility = 'premium' and public.has_active_pro())
    )
  )
);

drop policy if exists "content_pack_items_select_visible" on public.content_pack_items;
create policy "content_pack_items_select_visible"
on public.content_pack_items
for select
to anon, authenticated
using (
  public.has_staff_access()
  or exists (
    select 1
    from public.content_packs p
    where p.id = pack_id
      and p.status = 'published'
      and (
        p.visibility = 'public_free'
        or (p.visibility = 'premium' and public.has_active_pro())
      )
  )
);

grant select on public.content_packs to anon, authenticated;
grant select on public.content_pack_items to anon, authenticated;

revoke insert, update, delete on public.content_packs from anon, authenticated, public;
revoke insert, update, delete on public.content_pack_items from anon, authenticated, public;

-- Staff/admin writes stay on service_role (import jobs / dashboard RPCs).
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
  elsif p_content_type = 'cat' then
    update public.cat_maps set offline_available = p_available, updated_at = now()
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

revoke all on function public.set_offline_available(text, text, boolean) from public, anon, authenticated;
grant execute on function public.set_offline_available(text, text, boolean) to service_role;

revoke all on function public.pack_item_parent_downloadable(text, text) from public;
grant execute on function public.pack_item_parent_downloadable(text, text) to anon, authenticated, service_role;
