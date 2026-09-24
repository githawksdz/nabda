insert into public.clinical_interests (slug, label, sort_order, is_active)
values
  ('urgences', 'Urgences', 1, true),
  ('cardiologie', 'Cardiologie', 2, true),
  ('pediatrie', 'Pédiatrie', 3, true),
  ('infectiologie', 'Infectiologie', 4, true),
  ('gyneco_obstetrique', 'Gynéco-obstétrique', 5, true),
  ('antibiotherapie', 'Antibiothérapie', 6, true),
  ('ecg', 'ECG', 7, true),
  ('medicaments', 'Médicaments', 8, true),
  ('scores', 'Scores', 9, true),
  ('diabete', 'Diabète', 10, true),
  ('pneumologie', 'Pneumologie', 11, true),
  ('gastro_enterologie', 'Gastro-entérologie', 12, true),
  ('neurologie', 'Neurologie', 13, true),
  ('dermatologie', 'Dermatologie', 14, true),
  ('residanat', 'Résidanat', 15, true)
on conflict (slug) do update
set
  label = excluded.label,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
