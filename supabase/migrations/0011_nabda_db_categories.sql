-- Identity categories for nabda_db import.
-- Does not import clinical content. Does not create tags.
-- Idempotent: insert on conflict (slug). Existing names/labels are kept.

insert into public.content_categories (slug, name, description, sort_order, is_active)
values
  ('urgences', 'Urgences', 'Urgences et CAT aigus', 1, true),
  ('cardiologie', 'Cardiologie', null, 2, true),
  ('pediatrie', 'Pédiatrie', null, 3, true),
  ('infectiologie', 'Infectiologie', null, 4, true),
  ('pneumologie', 'Pneumologie', null, 5, true),
  ('neurologie', 'Neurologie', null, 6, true),
  ('gyneco_obstetrique', 'Gynéco-obstétrique', null, 7, true),
  ('endocrinologie', 'Endocrinologie', 'Slug canonique. Affichage possible: Endocrino-diabétologie.', 8, true),
  ('medicaments', 'Médicaments', null, 9, true),
  ('scores', 'Scores', 'Calculateurs et scores. Fallback calculateur si la spécialité n''est pas classée.', 10, true),
  ('gastro_enterologie', 'Gastro-entérologie', null, 11, true),
  ('nephrologie', 'Néphrologie', null, 12, true),
  ('endocrino_diabetologie', 'Endocrino-diabétologie', 'Alias d''affichage. Le slug canonique reste endocrinologie.', 13, true),
  ('dermatologie', 'Dermatologie', null, 14, true),
  ('psychiatrie', 'Psychiatrie', null, 15, true),
  ('reanimation', 'Réanimation', null, 16, true),
  ('hematologie', 'Hématologie', null, 17, true),
  ('rhumatologie', 'Rhumatologie', null, 18, true),
  ('oncologie', 'Oncologie', null, 19, true),
  ('geriatrie', 'Gériatrie', null, 20, true),
  ('chirurgie', 'Chirurgie', null, 21, true),
  ('medecine_generale', 'Médecine générale', null, 22, true),
  ('prevention_suivi', 'Prévention / Suivi', null, 23, true),
  ('allergologie', 'Allergologie', null, 24, true),
  ('anesthesie', 'Anesthésie', null, 25, true),
  ('dietetique', 'Diététique', null, 26, true),
  ('reeducation', 'Rééducation', null, 27, true),
  ('ophtalmologie', 'Ophtalmologie', null, 28, true),
  ('urologie', 'Urologie', null, 29, true),
  ('uncategorized', 'Non classé', 'Fallback d''identité. Pas une spécialité clinique validée.', 99, true)
on conflict (slug) do update
set
  is_active = true,
  sort_order = excluded.sort_order,
  description = coalesce(public.content_categories.description, excluded.description);

update public.content_categories as child
set parent_id = parent.id
from public.content_categories as parent
where child.slug = 'endocrino_diabetologie'
  and parent.slug = 'endocrinologie'
  and child.parent_id is distinct from parent.id;

comment on table public.content_categories is
  'Catalog identity only. Adding a slug does not validate clinical content.';
