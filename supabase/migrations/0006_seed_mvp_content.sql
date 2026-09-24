-- Minimal editorial-placeholder seed. Not medically validated. No dosages.

insert into public.content_categories (slug, name, sort_order, is_active)
values
  ('urgences', 'Urgences', 1, true),
  ('cardiologie', 'Cardiologie', 2, true),
  ('pediatrie', 'Pédiatrie', 3, true),
  ('infectiologie', 'Infectiologie', 4, true),
  ('pneumologie', 'Pneumologie', 5, true),
  ('neurologie', 'Neurologie', 6, true),
  ('gyneco_obstetrique', 'Gynéco-obstétrique', 7, true),
  ('endocrinologie', 'Endocrinologie', 8, true),
  ('medicaments', 'Médicaments', 9, true),
  ('scores', 'Scores', 10, true)
on conflict (slug) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.protocols (
  slug, title, short_title, summary, category_slug, content_type,
  status, review_status, visibility, is_featured, source_note
)
values
  (
    'douleur-thoracique',
    'Douleur thoracique',
    'Douleur thoracique',
    'CAT de départ pour explorer les causes urgentes et organiser l''orientation initiale.',
    'urgences',
    'protocol',
    'seed_placeholder',
    'editorial_placeholder',
    'public_free',
    true,
    'Placeholder for UI development. Not medically validated.'
  ),
  (
    'fievre-enfant',
    'Fièvre chez l''enfant',
    'Fièvre enfant',
    'Repères initiaux pour la fièvre pédiatrique et les signes d''alerte.',
    'pediatrie',
    'protocol',
    'seed_placeholder',
    'editorial_placeholder',
    'public_free',
    false,
    'Placeholder for UI development. Not medically validated.'
  ),
  (
    'antibiotherapie-probabiliste',
    'Antibiothérapie probabiliste',
    'ATB probabiliste',
    'Point d''entrée pour les situations fréquentes d''antibiothérapie initiale.',
    'infectiologie',
    'recommendation',
    'seed_placeholder',
    'editorial_placeholder',
    'public_free',
    false,
    'Placeholder for UI development. Not medically validated.'
  ),
  (
    'cephalees-brutales-hsa',
    'Céphalées brutales et suspicion d''HSA',
    'Céphalées / HSA',
    'Repères initiaux pour la suspicion d''hémorragie sous-arachnoïdienne.',
    'urgences',
    'protocol',
    'seed_placeholder',
    'editorial_placeholder',
    'premium',
    true,
    'Placeholder for UI development. Not medically validated.'
  ),
  (
    'intoxication-medicamenteuse',
    'Intoxication médicamenteuse aiguë',
    'Intoxication médicamenteuse',
    'Conduite actualisée — fiche éditoriale de développement, non validée.',
    'urgences',
    'protocol',
    'seed_placeholder',
    'editorial_placeholder',
    'public_free',
    false,
    'Placeholder for UI development. Not medically validated.'
  )
on conflict (slug) do update
set
  title = excluded.title,
  short_title = excluded.short_title,
  summary = excluded.summary,
  category_slug = excluded.category_slug,
  content_type = excluded.content_type,
  status = excluded.status,
  review_status = excluded.review_status,
  visibility = excluded.visibility,
  is_featured = excluded.is_featured,
  source_note = excluded.source_note,
  updated_at = now();

insert into public.cat_maps (
  protocol_id, slug, title, summary, status, review_status, visibility, map_json, is_featured, source_note
)
select
  p.id,
  v.slug,
  v.title,
  v.summary,
  'seed_placeholder',
  'editorial_placeholder',
  v.visibility,
  '{"version":"seed_v1","nodes":[],"edges":[],"note":"Placeholder CAT map for UI development only."}'::jsonb,
  v.is_featured,
  'Placeholder CAT map. Empty graph. Not for clinical use.'
from (
  values
    ('douleur-thoracique'::text, 'douleur-thoracique-cat'::text, 'CAT douleur thoracique'::text, 'Carte clinique placeholder — nœuds à rédiger.'::text, 'public_free'::text, true),
    ('fievre-enfant'::text, 'fievre-enfant-cat'::text, 'CAT fièvre chez l''enfant'::text, 'Carte clinique placeholder — nœuds à rédiger.'::text, 'public_free'::text, false),
    ('cephalees-brutales-hsa'::text, 'cephalees-brutales-hsa-cat'::text, 'CAT céphalées brutales / HSA'::text, 'Carte clinique placeholder — nœuds à rédiger.'::text, 'premium'::text, true)
) as v(protocol_slug, slug, title, summary, visibility, is_featured)
join public.protocols p on p.slug = v.protocol_slug
on conflict (slug) do update
set
  protocol_id = excluded.protocol_id,
  title = excluded.title,
  summary = excluded.summary,
  status = excluded.status,
  review_status = excluded.review_status,
  visibility = excluded.visibility,
  map_json = excluded.map_json,
  is_featured = excluded.is_featured,
  source_note = excluded.source_note,
  updated_at = now();

insert into public.calculators (
  slug, title, short_title, description, category_slug, status, review_status,
  visibility, formula_json, is_featured, usage_context
)
values
  (
    'glasgow',
    'Glasgow',
    'GCS',
    'Évaluation neurologique et niveau de conscience.',
    'scores',
    'seed_placeholder',
    'editorial_placeholder',
    'public_free',
    '{"version":"seed_v1","inputs":[],"rules":[],"note":"Placeholder calculator definition for UI development only."}'::jsonb,
    true,
    'Coma & conscience'
  ),
  (
    'cockcroft-gault',
    'Cockcroft-Gault',
    'Cockcroft',
    'Estimation de la clairance de la créatinine.',
    'scores',
    'seed_placeholder',
    'editorial_placeholder',
    'public_free',
    '{"version":"seed_v1","inputs":[],"rules":[],"note":"Placeholder calculator definition for UI development only."}'::jsonb,
    true,
    'Clairance rénale'
  ),
  (
    'wells-ep',
    'Wells EP',
    'Wells EP',
    'Probabilité clinique d''embolie pulmonaire.',
    'scores',
    'seed_placeholder',
    'editorial_placeholder',
    'public_free',
    '{"version":"seed_v1","inputs":[],"rules":[],"note":"Placeholder calculator definition for UI development only."}'::jsonb,
    true,
    'Probabilité embolie'
  ),
  (
    'curb-65',
    'CURB-65',
    'CURB-65',
    'Évaluation initiale de la sévérité d''une pneumopathie.',
    'scores',
    'seed_placeholder',
    'editorial_placeholder',
    'public_free',
    '{"version":"seed_v1","inputs":[],"rules":[],"note":"Placeholder calculator definition for UI development only."}'::jsonb,
    true,
    'Pneumopathie aiguë'
  ),
  (
    'sofa-qsofa',
    'SOFA / qSOFA',
    'SOFA',
    'Évaluation du sepsis.',
    'scores',
    'seed_placeholder',
    'editorial_placeholder',
    'premium',
    '{"version":"seed_v1","inputs":[],"rules":[],"note":"Placeholder calculator definition for UI development only."}'::jsonb,
    true,
    'Évaluation du sepsis'
  ),
  (
    'chads-vasc',
    'CHA₂DS₂-VASc',
    'CHA₂DS₂-VASc',
    'Risque thromboembolique.',
    'scores',
    'seed_placeholder',
    'editorial_placeholder',
    'public_free',
    '{"version":"seed_v1","inputs":[],"rules":[],"note":"Placeholder calculator definition for UI development only."}'::jsonb,
    false,
    'Risque thromboembolique'
  ),
  (
    'nihss',
    'Score NIHSS',
    'NIHSS',
    'Évaluation initiale d''un AVC ischémique aigu.',
    'scores',
    'seed_placeholder',
    'editorial_placeholder',
    'premium',
    '{"version":"seed_v1","inputs":[],"rules":[],"note":"Placeholder calculator definition for UI development only."}'::jsonb,
    false,
    'AVC ischémique aigu'
  )
on conflict (slug) do update
set
  title = excluded.title,
  short_title = excluded.short_title,
  description = excluded.description,
  category_slug = excluded.category_slug,
  status = excluded.status,
  review_status = excluded.review_status,
  visibility = excluded.visibility,
  formula_json = excluded.formula_json,
  is_featured = excluded.is_featured,
  usage_context = excluded.usage_context,
  updated_at = now();

insert into public.drugs (
  slug, dci, display_name, therapeutic_class, summary, status, review_status, visibility, source_note
)
values
  ('paracetamol', 'Paracétamol', 'Paracétamol', 'Antalgique / antipyrétique', 'Fiche préliminaire destinée au développement de l''interface. Données cliniques à compléter et valider.', 'seed_placeholder', 'editorial_placeholder', 'public_free', 'No dosages. Editorial placeholder only.'),
  ('amoxicilline', 'Amoxicilline', 'Amoxicilline', 'Antibiotique bêta-lactamine', 'Fiche préliminaire destinée au développement de l''interface. Données cliniques à compléter et valider.', 'seed_placeholder', 'editorial_placeholder', 'public_free', 'No dosages. Editorial placeholder only.'),
  ('ibuprofene', 'Ibuprofène', 'Ibuprofène', 'AINS', 'Fiche préliminaire destinée au développement de l''interface. Données cliniques à compléter et valider.', 'seed_placeholder', 'editorial_placeholder', 'public_free', 'No dosages. Editorial placeholder only.'),
  ('ceftriaxone', 'Ceftriaxone', 'Ceftriaxone', 'Céphalosporine de 3e génération', 'Fiche préliminaire destinée au développement de l''interface. Données cliniques à compléter et valider.', 'seed_placeholder', 'editorial_placeholder', 'public_free', 'No dosages. Editorial placeholder only.'),
  ('metformine', 'Metformine', 'Metformine', 'Antidiabétique oral', 'Fiche préliminaire destinée au développement de l''interface. Données cliniques à compléter et valider.', 'seed_placeholder', 'editorial_placeholder', 'public_free', 'No dosages. Editorial placeholder only.'),
  ('salbutamol', 'Salbutamol', 'Salbutamol', 'Bronchodilatateur', 'Fiche préliminaire destinée au développement de l''interface. Données cliniques à compléter et valider.', 'seed_placeholder', 'editorial_placeholder', 'public_free', 'No dosages. Editorial placeholder only.'),
  ('omeprazole', 'Oméprazole', 'Oméprazole', 'Inhibiteur de la pompe à protons', 'Fiche préliminaire destinée au développement de l''interface. Données cliniques à compléter et valider.', 'seed_placeholder', 'editorial_placeholder', 'public_free', 'No dosages. Editorial placeholder only.'),
  ('enoxaparine', 'Énoxaparine', 'Énoxaparine', 'Anticoagulant HBPM', 'Fiche préliminaire destinée au développement de l''interface. Données cliniques à compléter et valider.', 'seed_placeholder', 'editorial_placeholder', 'public_free', 'No dosages. Editorial placeholder only.')
on conflict (slug) do update
set
  dci = excluded.dci,
  display_name = excluded.display_name,
  therapeutic_class = excluded.therapeutic_class,
  summary = excluded.summary,
  status = excluded.status,
  review_status = excluded.review_status,
  visibility = excluded.visibility,
  source_note = excluded.source_note,
  updated_at = now();

insert into public.home_feed_items (
  title, description, label, category_slug, item_type, target_type, target_slug,
  visibility, plan_required, is_active, priority
)
select * from (
  values
    (
      'Nouvelle CAT : douleur thoracique',
      'Prise en charge diagnostique initiale — fiche éditoriale placeholder, non validée.',
      'Nouveau',
      'urgences',
      'new_cat',
      'cat',
      'douleur-thoracique',
      'public_free',
      'freemium',
      true,
      80
    ),
    (
      'Douleur thoracique',
      'CAT de départ pour explorer les causes urgentes.',
      'Nouveau',
      'urgences',
      'update',
      'protocol',
      'douleur-thoracique',
      'public_free',
      'freemium',
      true,
      70
    ),
    (
      'Fièvre chez l''enfant',
      'Repères initiaux pour la fièvre pédiatrique.',
      'Mis à jour',
      'pediatrie',
      'update',
      'protocol',
      'fievre-enfant',
      'public_free',
      'freemium',
      true,
      60
    ),
    (
      'Céphalées brutales et suspicion d''HSA',
      'Intégration du score d''Ottawa — contenu placeholder non validé.',
      'Mise à jour majeure',
      'urgences',
      'new_cat',
      'cat',
      'cephalees-brutales-hsa',
      'premium',
      'pro',
      true,
      90
    ),
    (
      'Intoxication médicamenteuse aiguë : conduite actualisée',
      'Fiche éditoriale de développement, non validée.',
      'Toxicologie',
      'urgences',
      'recommendation',
      'protocol',
      'intoxication-medicamenteuse',
      'public_free',
      'freemium',
      true,
      50
    ),
    (
      'Débloquez les packs hors ligne',
      'Consultez CAT, posologies et calculateurs sans réseau.',
      'Nabda Pro',
      null::text,
      'pro_feature',
      'premium',
      null::text,
      'public_free',
      'freemium',
      true,
      40
    ),
    (
      'Le score de Glasgow est accessible directement dans vos raccourcis sans connexion réseau.',
      'À retenir aujourd''hui — message éditorial de développement.',
      'À retenir aujourd''hui',
      'scores',
      'insight',
      'calculator',
      'glasgow',
      'public_free',
      'freemium',
      true,
      30
    ),
    (
      '3 nouveautés publiées ce mois-ci correspondent à vos centres d''intérêt (Urgences & Soins Intensifs).',
      'Message éditorial de développement. Aucune validation médicale.',
      null::text,
      'urgences',
      'insight',
      'none',
      null::text,
      'premium',
      'pro',
      true,
      20
    )
) as v(
  title, description, label, category_slug, item_type, target_type, target_slug,
  visibility, plan_required, is_active, priority
)
where not exists (
  select 1
  from public.home_feed_items existing
  where existing.title = v.title
    and existing.item_type = v.item_type
);
