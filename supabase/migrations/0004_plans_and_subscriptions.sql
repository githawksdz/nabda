-- Plans, subscriptions, and profile plan fields.

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  price_dzd integer,
  billing_period text not null default 'yearly',
  is_active boolean not null default true,
  features jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscription_plans_billing_period_check check (
    billing_period in ('monthly', 'yearly', 'manual', 'lifetime')
  )
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_slug text not null references public.subscription_plans (slug),
  status text not null default 'active',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  source text not null default 'manual',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_subscriptions_status_check check (
    status in ('active', 'pending', 'expired', 'cancelled', 'rejected')
  ),
  constraint user_subscriptions_source_check check (
    source in ('manual', 'admin', 'test_seed', 'payment_proof')
  )
);

create index if not exists user_subscriptions_user_id_idx
  on public.user_subscriptions (user_id);
create index if not exists user_subscriptions_plan_slug_idx
  on public.user_subscriptions (plan_slug);
create index if not exists user_subscriptions_status_idx
  on public.user_subscriptions (status);

insert into public.subscription_plans (
  slug, name, description, price_dzd, billing_period, is_active, features, sort_order
)
values
  (
    'freemium',
    'Freemium',
    'Accès essentiel à Nabda.',
    null,
    'manual',
    true,
    '["Recherche essentielle", "Contenus gratuits", "Favoris limités"]'::jsonb,
    1
  ),
  (
    'pro_yearly',
    'Nabda Pro',
    'Packs hors ligne et contenus avancés.',
    null,
    'yearly',
    true,
    '["Packs hors ligne", "CAT avancées", "Favoris illimités", "Historique complet"]'::jsonb,
    2
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  billing_period = excluded.billing_period,
  is_active = excluded.is_active,
  features = excluded.features,
  sort_order = excluded.sort_order,
  updated_at = now();

alter table public.profiles
  add column if not exists plan_slug text not null default 'freemium';

alter table public.profiles
  add column if not exists plan_status text not null default 'active';

alter table public.profiles
  drop constraint if exists profiles_plan_status_check;

alter table public.profiles
  add constraint profiles_plan_status_check
  check (plan_status in ('active', 'pending', 'expired', 'cancelled'));

update public.profiles
set plan_slug = 'freemium'
where plan_slug is null or plan_slug = '';

alter table public.profiles
  drop constraint if exists profiles_plan_slug_fkey;

alter table public.profiles
  add constraint profiles_plan_slug_fkey
  foreign key (plan_slug) references public.subscription_plans (slug);

create index if not exists profiles_plan_slug_idx on public.profiles (plan_slug);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (
    id, email, full_name, avatar_url, profile_status, onboarding_completed, plan_slug, plan_status
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
    'active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists subscription_plans_set_updated_at on public.subscription_plans;
create trigger subscription_plans_set_updated_at
before update on public.subscription_plans
for each row
execute function public.update_updated_at_column();

drop trigger if exists user_subscriptions_set_updated_at on public.user_subscriptions;
create trigger user_subscriptions_set_updated_at
before update on public.user_subscriptions
for each row
execute function public.update_updated_at_column();

alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;

drop policy if exists "subscription_plans_select_active" on public.subscription_plans;
create policy "subscription_plans_select_active"
on public.subscription_plans
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "user_subscriptions_select_own" on public.user_subscriptions;
create policy "user_subscriptions_select_own"
on public.user_subscriptions
for select
to authenticated
using (auth.uid() = user_id);

grant select on public.subscription_plans to anon, authenticated;
grant select on public.user_subscriptions to authenticated;
