-- Editorial "new" flags, drug specialty, and compact per-user visit state for list cards.
-- Staff sets protocols/calculators/drugs.is_new = true; visiting a fiche does not clear it.

alter table public.protocols
  add column if not exists is_new boolean not null default false;

alter table public.calculators
  add column if not exists is_new boolean not null default false;

alter table public.drugs
  add column if not exists is_new boolean not null default false;

alter table public.drugs
  add column if not exists category_slug text references public.content_categories (slug);

create index if not exists drugs_category_slug_idx on public.drugs (category_slug);
create index if not exists protocols_is_new_idx on public.protocols (is_new) where is_new;
create index if not exists calculators_is_new_idx on public.calculators (is_new) where is_new;
create index if not exists drugs_is_new_idx on public.drugs (is_new) where is_new;

create table if not exists public.user_content_visits (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null,
  item_slug text not null,
  first_viewed_at timestamptz not null default now(),
  last_viewed_at timestamptz not null default now(),
  primary key (user_id, item_type, item_slug),
  constraint user_content_visits_item_type_check check (
    item_type in ('protocol', 'calculator', 'drug')
  )
);

create index if not exists user_content_visits_user_idx
  on public.user_content_visits (user_id, last_viewed_at desc);

alter table public.user_content_visits enable row level security;

drop policy if exists "user_content_visits_select_own" on public.user_content_visits;
create policy "user_content_visits_select_own"
on public.user_content_visits
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_content_visits_insert_own" on public.user_content_visits;
create policy "user_content_visits_insert_own"
on public.user_content_visits
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_content_visits_update_own" on public.user_content_visits;
create policy "user_content_visits_update_own"
on public.user_content_visits
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update on public.user_content_visits to authenticated;

insert into public.user_content_visits (
  user_id, item_type, item_slug, first_viewed_at, last_viewed_at
)
select
  user_id,
  item_type,
  item_slug,
  min(viewed_at),
  max(viewed_at)
from public.user_history
where item_type in ('protocol', 'calculator', 'drug')
group by user_id, item_type, item_slug
on conflict (user_id, item_type, item_slug) do nothing;

-- CREATE OR REPLACE VIEW cannot rename/reorder columns (42P16). Drop first.
drop view if exists public.catalog_protocols;
drop view if exists public.catalog_calculators;
drop view if exists public.catalog_drugs;

create view public.catalog_protocols
with (security_barrier = true, security_invoker = true) as
select
  id, slug, title, short_title, summary, category_slug, content_type,
  status, review_status, visibility, is_featured, is_new, published_at, source_note,
  created_at, updated_at
from public.protocols;

create view public.catalog_calculators
with (security_barrier = true, security_invoker = true) as
select
  id, slug, title, short_title, description, category_slug, status, review_status,
  visibility, is_featured, is_new, usage_context, engine_slug, engine_version,
  engine_implemented, created_at, updated_at
from public.calculators;

create view public.catalog_drugs
with (security_barrier = true, security_invoker = true) as
select
  id, slug, dci, display_name, therapeutic_class, category_slug, summary, status,
  review_status, visibility, is_featured, is_new, source_note, created_at, updated_at
from public.drugs;

grant select on public.catalog_protocols to anon, authenticated;
grant select on public.catalog_calculators to anon, authenticated;
grant select on public.catalog_drugs to anon, authenticated;
