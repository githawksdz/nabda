-- Content taxonomy, protocols, CAT maps, calculators, drugs, feed, favorites, history.

create table if not exists public.content_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  parent_id uuid references public.content_categories (id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.protocols (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  short_title text,
  summary text,
  category_slug text references public.content_categories (slug),
  content_type text not null default 'protocol',
  status text not null default 'draft',
  review_status text not null default 'unreviewed',
  visibility text not null default 'public_free',
  is_featured boolean not null default false,
  published_at timestamptz,
  source_note text,
  search_text text generated always as (
    coalesce(title, '') || ' ' || coalesce(short_title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(category_slug, '')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint protocols_content_type_check check (
    content_type in ('protocol', 'recommendation', 'guide')
  ),
  constraint protocols_status_check check (
    status in ('draft', 'seed_placeholder', 'review_needed', 'published', 'hidden', 'archived')
  ),
  constraint protocols_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  ),
  constraint protocols_visibility_check check (
    visibility in ('public_free', 'premium', 'preview_only', 'hidden', 'admin_only')
  )
);

create index if not exists protocols_slug_idx on public.protocols (slug);
create index if not exists protocols_category_slug_idx on public.protocols (category_slug);
create index if not exists protocols_status_idx on public.protocols (status);
create index if not exists protocols_visibility_idx on public.protocols (visibility);
create index if not exists protocols_is_featured_idx on public.protocols (is_featured);
create index if not exists protocols_search_tsv_idx
  on public.protocols using gin (to_tsvector('simple', search_text));

create table if not exists public.cat_maps (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid references public.protocols (id) on delete cascade,
  slug text unique not null,
  title text not null,
  summary text,
  status text not null default 'not_available',
  review_status text not null default 'unreviewed',
  visibility text not null default 'public_free',
  map_json jsonb not null default '{}'::jsonb,
  is_featured boolean not null default false,
  published_at timestamptz,
  source_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cat_maps_status_check check (
    status in (
      'not_available',
      'seed_placeholder',
      'draft_extracted',
      'manual_authoring',
      'ready_for_review',
      'approved',
      'published',
      'needs_revision',
      'hidden'
    )
  ),
  constraint cat_maps_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  ),
  constraint cat_maps_visibility_check check (
    visibility in ('public_free', 'premium', 'hidden', 'admin_only')
  )
);

create index if not exists cat_maps_slug_idx on public.cat_maps (slug);
create index if not exists cat_maps_protocol_id_idx on public.cat_maps (protocol_id);
create index if not exists cat_maps_status_idx on public.cat_maps (status);
create index if not exists cat_maps_visibility_idx on public.cat_maps (visibility);

create table if not exists public.calculators (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  short_title text,
  description text,
  category_slug text references public.content_categories (slug),
  status text not null default 'draft',
  review_status text not null default 'unreviewed',
  visibility text not null default 'public_free',
  formula_json jsonb not null default '{}'::jsonb,
  is_featured boolean not null default false,
  usage_context text,
  search_text text generated always as (
    coalesce(title, '') || ' ' || coalesce(short_title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(usage_context, '')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calculators_status_check check (
    status in ('draft', 'seed_placeholder', 'needs_validation', 'validated', 'published', 'hidden')
  ),
  constraint calculators_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  ),
  constraint calculators_visibility_check check (
    visibility in ('public_free', 'premium', 'hidden', 'admin_only')
  )
);

create index if not exists calculators_slug_idx on public.calculators (slug);
create index if not exists calculators_category_slug_idx on public.calculators (category_slug);
create index if not exists calculators_status_idx on public.calculators (status);
create index if not exists calculators_visibility_idx on public.calculators (visibility);
create index if not exists calculators_is_featured_idx on public.calculators (is_featured);
create index if not exists calculators_search_tsv_idx
  on public.calculators using gin (to_tsvector('simple', search_text));

create table if not exists public.drugs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  dci text not null,
  display_name text not null,
  therapeutic_class text,
  summary text,
  status text not null default 'draft',
  review_status text not null default 'unreviewed',
  visibility text not null default 'public_free',
  is_featured boolean not null default false,
  source_note text,
  search_text text generated always as (
    coalesce(dci, '') || ' ' || coalesce(display_name, '') || ' ' || coalesce(therapeutic_class, '') || ' ' || coalesce(summary, '')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint drugs_status_check check (
    status in (
      'draft',
      'seed_placeholder',
      'needs_pharmacist_review',
      'reviewed',
      'published',
      'hidden'
    )
  ),
  constraint drugs_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  ),
  constraint drugs_visibility_check check (
    visibility in ('public_free', 'premium', 'hidden', 'admin_only')
  )
);

create index if not exists drugs_slug_idx on public.drugs (slug);
create index if not exists drugs_status_idx on public.drugs (status);
create index if not exists drugs_visibility_idx on public.drugs (visibility);
create index if not exists drugs_search_tsv_idx
  on public.drugs using gin (to_tsvector('simple', search_text));

create table if not exists public.home_feed_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  label text,
  category_slug text references public.content_categories (slug),
  item_type text not null,
  target_type text,
  target_slug text,
  visibility text not null default 'public_free',
  plan_required text not null default 'freemium',
  audience_professions text[] not null default '{}'::text[],
  audience_interests text[] not null default '{}'::text[],
  is_active boolean not null default true,
  priority integer not null default 0,
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint home_feed_items_item_type_check check (
    item_type in (
      'update',
      'new_protocol',
      'new_cat',
      'recommendation',
      'insight',
      'pro_feature',
      'starter'
    )
  ),
  constraint home_feed_items_target_type_check check (
    target_type is null
    or target_type in (
      'protocol',
      'cat',
      'calculator',
      'drug',
      'premium',
      'offline',
      'profile',
      'external',
      'none'
    )
  ),
  constraint home_feed_items_visibility_check check (
    visibility in ('public_free', 'premium', 'hidden')
  ),
  constraint home_feed_items_plan_required_check check (
    plan_required in ('freemium', 'pro')
  )
);

create index if not exists home_feed_items_active_priority_idx
  on public.home_feed_items (is_active, priority desc);
create index if not exists home_feed_items_category_slug_idx
  on public.home_feed_items (category_slug);

create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null,
  item_slug text not null,
  created_at timestamptz not null default now(),
  constraint user_favorites_item_type_check check (
    item_type in ('protocol', 'cat', 'calculator', 'drug')
  ),
  constraint user_favorites_unique unique (user_id, item_type, item_slug)
);

create index if not exists user_favorites_user_id_idx
  on public.user_favorites (user_id);

create table if not exists public.user_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null,
  item_slug text not null,
  viewed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint user_history_item_type_check check (
    item_type in ('protocol', 'cat', 'calculator', 'drug', 'search')
  )
);

create index if not exists user_history_user_viewed_idx
  on public.user_history (user_id, viewed_at desc);
create index if not exists user_history_item_idx
  on public.user_history (item_type, item_slug);

drop trigger if exists protocols_set_updated_at on public.protocols;
create trigger protocols_set_updated_at
before update on public.protocols
for each row
execute function public.update_updated_at_column();

drop trigger if exists cat_maps_set_updated_at on public.cat_maps;
create trigger cat_maps_set_updated_at
before update on public.cat_maps
for each row
execute function public.update_updated_at_column();

drop trigger if exists calculators_set_updated_at on public.calculators;
create trigger calculators_set_updated_at
before update on public.calculators
for each row
execute function public.update_updated_at_column();

drop trigger if exists drugs_set_updated_at on public.drugs;
create trigger drugs_set_updated_at
before update on public.drugs
for each row
execute function public.update_updated_at_column();

drop trigger if exists home_feed_items_set_updated_at on public.home_feed_items;
create trigger home_feed_items_set_updated_at
before update on public.home_feed_items
for each row
execute function public.update_updated_at_column();

alter table public.content_categories enable row level security;
alter table public.protocols enable row level security;
alter table public.cat_maps enable row level security;
alter table public.calculators enable row level security;
alter table public.drugs enable row level security;
alter table public.home_feed_items enable row level security;
alter table public.user_favorites enable row level security;
alter table public.user_history enable row level security;

drop policy if exists "content_categories_select_active" on public.content_categories;
create policy "content_categories_select_active"
on public.content_categories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "protocols_select_visible" on public.protocols;
create policy "protocols_select_visible"
on public.protocols
for select
to anon, authenticated
using (
  visibility in ('public_free', 'premium')
  and status in ('seed_placeholder', 'published')
);

drop policy if exists "cat_maps_select_visible" on public.cat_maps;
create policy "cat_maps_select_visible"
on public.cat_maps
for select
to anon, authenticated
using (
  visibility in ('public_free', 'premium')
  and status in ('seed_placeholder', 'published')
);

drop policy if exists "calculators_select_visible" on public.calculators;
create policy "calculators_select_visible"
on public.calculators
for select
to anon, authenticated
using (
  visibility in ('public_free', 'premium')
  and status in ('seed_placeholder', 'published')
);

drop policy if exists "drugs_select_visible" on public.drugs;
create policy "drugs_select_visible"
on public.drugs
for select
to anon, authenticated
using (
  visibility in ('public_free', 'premium')
  and status in ('seed_placeholder', 'published')
);

drop policy if exists "home_feed_items_select_visible" on public.home_feed_items;
create policy "home_feed_items_select_visible"
on public.home_feed_items
for select
to anon, authenticated
using (
  is_active = true
  and visibility in ('public_free', 'premium')
);

drop policy if exists "user_favorites_select_own" on public.user_favorites;
create policy "user_favorites_select_own"
on public.user_favorites
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_favorites_insert_own" on public.user_favorites;
create policy "user_favorites_insert_own"
on public.user_favorites
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_favorites_delete_own" on public.user_favorites;
create policy "user_favorites_delete_own"
on public.user_favorites
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_history_select_own" on public.user_history;
create policy "user_history_select_own"
on public.user_history
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_history_insert_own" on public.user_history;
create policy "user_history_insert_own"
on public.user_history
for insert
to authenticated
with check (auth.uid() = user_id);

grant select on public.content_categories to anon, authenticated;
grant select on public.protocols to anon, authenticated;
grant select on public.cat_maps to anon, authenticated;
grant select on public.calculators to anon, authenticated;
grant select on public.drugs to anon, authenticated;
grant select on public.home_feed_items to anon, authenticated;
grant select, insert, delete on public.user_favorites to authenticated;
grant select, insert on public.user_history to authenticated;
