-- Personal workspace persistence: profile preference fields, interest seeds,
-- and own-row history delete. No public writes.

alter table public.profiles
  add column if not exists experience_level text,
  add column if not exists region text,
  add column if not exists institution text,
  add column if not exists practice_context text,
  add column if not exists preferences jsonb not null default '{}'::jsonb;

insert into public.clinical_interests (slug, label, sort_order, is_active)
values
  ('medecine_generale', 'Médecine générale', 16, true),
  ('reanimation', 'Réanimation', 17, true),
  ('chirurgie', 'Chirurgie', 18, true),
  ('cat_decisionnels', 'CAT décisionnels', 19, true),
  ('scores_rapides', 'Scores rapides', 20, true),
  ('fiches_medicaments', 'Fiches médicaments', 21, true),
  ('recommandations', 'Recommandations', 22, true)
on conflict (slug) do update
set
  label = excluded.label,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

drop policy if exists "Users can delete own history" on public.user_history;
drop policy if exists "user_history_delete_own" on public.user_history;
create policy "Users can delete own history"
on public.user_history
for delete
to authenticated
using (auth.uid() = user_id);

grant delete on public.user_history to authenticated;
