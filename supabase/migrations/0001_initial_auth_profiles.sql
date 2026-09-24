create extension if not exists "pgcrypto";

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  profession text,
  usage_mode text,
  profile_status text not null default 'incomplete',
  onboarding_completed boolean not null default false,
  onboarding_completed_at timestamptz,
  onboarding_skipped boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_profession_check check (
    profession is null
    or profession in (
      'student',
      'intern',
      'resident',
      'generalist',
      'specialist',
      'dentist',
      'pharmacist'
    )
  ),
  constraint profiles_usage_mode_check check (
    usage_mode is null
    or usage_mode in ('shift', 'consultation', 'learning', 'mixed')
  ),
  constraint profiles_profile_status_check check (
    profile_status in ('incomplete', 'complete')
  )
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_profile_status_idx on public.profiles (profile_status);
create index if not exists profiles_onboarding_completed_idx on public.profiles (onboarding_completed);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

create table if not exists public.clinical_interests (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists clinical_interests_active_sort_idx
  on public.clinical_interests (is_active, sort_order);

create table if not exists public.user_clinical_interests (
  user_id uuid not null references auth.users (id) on delete cascade,
  interest_id uuid not null references public.clinical_interests (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, interest_id)
);

create index if not exists user_clinical_interests_user_id_idx
  on public.user_clinical_interests (user_id);
create index if not exists user_clinical_interests_interest_id_idx
  on public.user_clinical_interests (interest_id);

create or replace function public.enforce_max_user_interests()
returns trigger
language plpgsql
as $$
begin
  if (
    select count(*)
    from public.user_clinical_interests
    where user_id = new.user_id
  ) >= 5 then
    raise exception 'Maximum of 5 clinical interests';
  end if;
  return new;
end;
$$;

drop trigger if exists user_clinical_interests_max_five on public.user_clinical_interests;
create trigger user_clinical_interests_max_five
before insert on public.user_clinical_interests
for each row
execute function public.enforce_max_user_interests();

create table if not exists public.clinical_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  consent_type text not null default 'clinical_judgment',
  consent_version text not null default 'v1',
  accepted boolean not null default true,
  accepted_at timestamptz not null default now(),
  consent_text text not null,
  created_at timestamptz not null default now(),
  constraint clinical_consents_unique unique (user_id, consent_type, consent_version)
);

create index if not exists clinical_consents_user_id_idx
  on public.clinical_consents (user_id);

create table if not exists public.onboarding_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_events_user_id_idx
  on public.onboarding_events (user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, profile_status, onboarding_completed)
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
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.clinical_interests enable row level security;
alter table public.user_clinical_interests enable row level security;
alter table public.clinical_consents enable row level security;
alter table public.onboarding_events enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "clinical_interests_select_active" on public.clinical_interests;
create policy "clinical_interests_select_active"
on public.clinical_interests
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "user_clinical_interests_select_own" on public.user_clinical_interests;
create policy "user_clinical_interests_select_own"
on public.user_clinical_interests
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_clinical_interests_insert_own" on public.user_clinical_interests;
create policy "user_clinical_interests_insert_own"
on public.user_clinical_interests
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_clinical_interests_delete_own" on public.user_clinical_interests;
create policy "user_clinical_interests_delete_own"
on public.user_clinical_interests
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "clinical_consents_select_own" on public.clinical_consents;
create policy "clinical_consents_select_own"
on public.clinical_consents
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "clinical_consents_insert_own" on public.clinical_consents;
create policy "clinical_consents_insert_own"
on public.clinical_consents
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "clinical_consents_update_own" on public.clinical_consents;
create policy "clinical_consents_update_own"
on public.clinical_consents
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "onboarding_events_insert_own" on public.onboarding_events;
create policy "onboarding_events_insert_own"
on public.onboarding_events
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "onboarding_events_select_own" on public.onboarding_events;
create policy "onboarding_events_select_own"
on public.onboarding_events
for select
to authenticated
using (auth.uid() = user_id);

grant select, insert, update on public.profiles to authenticated;
grant select on public.clinical_interests to anon, authenticated;
grant select, insert, delete on public.user_clinical_interests to authenticated;
grant select, insert, update on public.clinical_consents to authenticated;
grant select, insert on public.onboarding_events to authenticated;
