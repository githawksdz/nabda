-- Phase 2 staff offline management (additive).
-- Requires 0022_offline_packs.sql.
-- Publishing hub only: draft | published, public_free | premium.
-- No medical-review, provenance, or extra lifecycle states.
-- Writes stay on SECURITY DEFINER RPCs checked for editor/admin.
-- anon and authenticated still have no table UPDATE/INSERT/DELETE.

create or replace function public.has_staff_editor()
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
      and p.staff_role in ('editor', 'admin')
  );
$$;

revoke all on function public.has_staff_editor() from public;
grant execute on function public.has_staff_editor() to authenticated, service_role;

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
    when 'cat' then (
      select m.visibility from public.cat_maps m where m.slug = p_content_slug
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

revoke all on function public.pack_item_visibility(text, text) from public;
grant execute on function public.pack_item_visibility(text, text) to authenticated, service_role;

create or replace function public.pack_item_is_eligible(
  p_pack_visibility text,
  p_content_type text,
  p_content_slug text
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    public.pack_item_parent_downloadable(p_content_type, p_content_slug)
    and not (
      p_pack_visibility = 'public_free'
      and coalesce(public.pack_item_visibility(p_content_type, p_content_slug), '') = 'premium'
    );
$$;

revoke all on function public.pack_item_is_eligible(text, text, text) from public;
grant execute on function public.pack_item_is_eligible(text, text, text) to authenticated, service_role;

create or replace function public.assert_pack_items_publishable()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_visibility text;
begin
  select visibility into v_visibility from public.content_packs where id = new.pack_id;
  if v_visibility is null then
    raise exception 'pack not found' using errcode = '23514';
  end if;
  if not public.pack_item_parent_downloadable(new.content_type, new.content_slug) then
    raise exception 'pack items must be published and offline-available'
      using errcode = '23514';
  end if;
  if v_visibility = 'public_free'
     and coalesce(public.pack_item_visibility(new.content_type, new.content_slug), '') = 'premium' then
    raise exception 'premium content cannot enter a free pack'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function public.assert_pack_publishable()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status = 'published' then
    if not exists (
      select 1 from public.content_pack_items i where i.pack_id = new.id
    ) then
      raise exception 'cannot publish empty pack'
        using errcode = '23514';
    end if;
    if exists (
      select 1
      from public.content_pack_items i
      where i.pack_id = new.id
        and not public.pack_item_is_eligible(new.visibility, i.content_type, i.content_slug)
    ) then
      raise exception 'cannot publish pack with ineligible items'
        using errcode = '23514';
    end if;
    if new.published_at is null then
      new.published_at := now();
    end if;
  end if;
  return new;
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

revoke all on function public.staff_set_offline_available(text, text, boolean) from public, anon;
grant execute on function public.staff_set_offline_available(text, text, boolean) to authenticated;

create or replace function public.staff_upsert_content_pack(
  p_id uuid,
  p_slug text,
  p_title text,
  p_description text,
  p_visibility text,
  p_version integer
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  if not public.has_staff_editor() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'invalid pack slug' using errcode = '23514';
  end if;
  if p_title is null or length(trim(p_title)) = 0 then
    raise exception 'pack title required' using errcode = '23514';
  end if;
  if p_visibility not in ('public_free', 'premium') then
    raise exception 'invalid pack visibility' using errcode = '23514';
  end if;
  if p_version is null or p_version < 1 then
    raise exception 'invalid pack version' using errcode = '23514';
  end if;

  if p_id is null then
    insert into public.content_packs (slug, title, description, visibility, version, status)
    values (p_slug, trim(p_title), p_description, p_visibility, p_version, 'draft')
    returning id into v_id;
    return v_id;
  end if;

  update public.content_packs
  set
    slug = p_slug,
    title = trim(p_title),
    description = p_description,
    visibility = p_visibility,
    version = p_version,
    updated_at = now()
  where id = p_id
  returning id into v_id;

  if v_id is null then
    raise exception 'pack not found' using errcode = 'P0002';
  end if;
  return v_id;
end;
$$;

revoke all on function public.staff_upsert_content_pack(uuid, text, text, text, text, integer) from public, anon;
grant execute on function public.staff_upsert_content_pack(uuid, text, text, text, text, integer) to authenticated;

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
    if v_type not in ('protocol', 'cat', 'drug', 'calculator') or v_slug is null or length(v_slug) = 0 then
      raise exception 'invalid pack item' using errcode = '23514';
    end if;
    insert into public.content_pack_items (pack_id, content_type, content_slug, sort_order)
    values (p_pack_id, v_type, v_slug, v_order);
  end loop;

  update public.content_packs set updated_at = now() where id = p_pack_id;
end;
$$;

revoke all on function public.staff_replace_pack_items(uuid, jsonb) from public, anon;
grant execute on function public.staff_replace_pack_items(uuid, jsonb) to authenticated;

create or replace function public.staff_set_pack_status(
  p_pack_id uuid,
  p_status text
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
  if p_status not in ('draft', 'published') then
    raise exception 'invalid pack status' using errcode = '23514';
  end if;
  update public.content_packs
  set status = p_status, updated_at = now()
  where id = p_pack_id;
  if not found then
    raise exception 'pack not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.staff_set_pack_status(uuid, text) from public, anon;
grant execute on function public.staff_set_pack_status(uuid, text) to authenticated;
