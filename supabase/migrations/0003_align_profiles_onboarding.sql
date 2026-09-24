-- Alignment for databases that already applied 0001/0002.
-- Adds missing indexes and consent UPDATE RLS required for upsert.

create index if not exists profiles_profile_status_idx on public.profiles (profile_status);
create index if not exists profiles_onboarding_completed_idx on public.profiles (onboarding_completed);
create index if not exists clinical_interests_active_sort_idx
  on public.clinical_interests (is_active, sort_order);
create index if not exists user_clinical_interests_interest_id_idx
  on public.user_clinical_interests (interest_id);

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

drop policy if exists "clinical_consents_update_own" on public.clinical_consents;
create policy "clinical_consents_update_own"
on public.clinical_consents
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update on public.clinical_consents to authenticated;
