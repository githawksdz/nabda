-- Minimal structured content for protocol detail + CAT flowchart.
-- Placeholder seed only. Not medically validated. No dosages.

create table if not exists public.protocol_sections (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.protocols (id) on delete cascade,
  heading text not null,
  section_type text not null,
  order_index integer not null default 0,
  visibility text not null default 'default',
  adaptation_flags text[] not null default '{}'::text[],
  content_json jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  plain_text text,
  review_status text not null default 'unreviewed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint protocol_sections_section_type_check check (
    section_type in (
      'key_points',
      'clinical_presentation',
      'diagnosis',
      'exams',
      'management',
      'treatment',
      'referral',
      'follow_up',
      'special_situations',
      'prevention',
      'background',
      'references',
      'custom'
    )
  ),
  constraint protocol_sections_visibility_check check (
    visibility in ('default', 'collapsed', 'hidden_until_adapted', 'admin_only')
  ),
  constraint protocol_sections_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  )
);

create index if not exists protocol_sections_protocol_order_idx
  on public.protocol_sections (protocol_id, order_index);

create table if not exists public.protocol_references (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.protocols (id) on delete cascade,
  section_id uuid references public.protocol_sections (id) on delete set null,
  label text not null,
  url text,
  reference_type text not null default 'source_reference',
  year integer,
  order_index integer not null default 0,
  review_status text not null default 'unreviewed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint protocol_references_type_check check (
    reference_type in (
      'guideline',
      'journal',
      'book',
      'official_recommendation',
      'drug_monograph',
      'calculator_validation',
      'source_reference',
      'other'
    )
  ),
  constraint protocol_references_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  )
);

create index if not exists protocol_references_protocol_order_idx
  on public.protocol_references (protocol_id, order_index);

create table if not exists public.protocol_links (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.protocols (id) on delete cascade,
  target_type text not null,
  target_id uuid,
  target_slug text,
  label text not null,
  relationship text not null default 'related',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  constraint protocol_links_target_type_check check (
    target_type in ('protocol', 'cat', 'drug', 'calculator', 'external')
  ),
  constraint protocol_links_relationship_check check (
    relationship in (
      'related',
      'primary_cat',
      'linked_drug',
      'linked_calculator',
      'differential',
      'reference',
      'continuation'
    )
  )
);

create index if not exists protocol_links_protocol_order_idx
  on public.protocol_links (protocol_id, order_index);

create table if not exists public.cat_blocks (
  id uuid primary key default gen_random_uuid(),
  cat_map_id uuid not null references public.cat_maps (id) on delete cascade,
  block_key text not null,
  block_type text not null,
  title text,
  text text,
  rich_content jsonb,
  x numeric not null default 0,
  y numeric not null default 0,
  width numeric not null default 220,
  height numeric not null default 90,
  style jsonb not null default '{}'::jsonb,
  order_index integer default 0,
  flags text[] not null default '{}'::text[],
  linked_drug_ids uuid[] not null default '{}'::uuid[],
  linked_calculator_ids uuid[] not null default '{}'::uuid[],
  linked_protocol_ids uuid[] not null default '{}'::uuid[],
  source_trace jsonb,
  review_status text not null default 'unreviewed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cat_blocks_block_type_check check (
    block_type in (
      'title',
      'context',
      'clinical_note',
      'clinical_gate',
      'usual_scenario',
      'red_flag',
      'urgent_action',
      'action',
      'workup',
      'treatment',
      'referral',
      'follow_up',
      'reassessment',
      'reference',
      'table_reference',
      'calculator_reference',
      'drug_reference',
      'level_marker',
      'image',
      'unknown'
    )
  ),
  constraint cat_blocks_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  ),
  constraint cat_blocks_map_key_unique unique (cat_map_id, block_key)
);

create index if not exists cat_blocks_map_order_idx
  on public.cat_blocks (cat_map_id, order_index);

create table if not exists public.cat_edges (
  id uuid primary key default gen_random_uuid(),
  cat_map_id uuid not null references public.cat_maps (id) on delete cascade,
  from_block_id uuid not null references public.cat_blocks (id) on delete cascade,
  to_block_id uuid not null references public.cat_blocks (id) on delete cascade,
  label text,
  relationship text not null default 'visual_flow',
  confidence text not null default 'editorial_uncertain',
  path jsonb,
  style jsonb not null default '{}'::jsonb,
  order_index integer default 0,
  review_status text not null default 'unreviewed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cat_edges_relationship_check check (
    relationship in (
      'visual_flow',
      'probable_logic_flow',
      'explicit_arrow',
      'branch',
      'convergence',
      'loop',
      'reference_link',
      'uncertain'
    )
  ),
  constraint cat_edges_confidence_check check (
    confidence in (
      'explicit_svg_connector',
      'strong_layout_connection',
      'weak_layout_connection',
      'editorial_uncertain',
      'manual_verified'
    )
  ),
  constraint cat_edges_review_status_check check (
    review_status in (
      'unreviewed',
      'editorial_placeholder',
      'editorial_reviewed',
      'medical_reviewed',
      'validated',
      'needs_revision'
    )
  )
);

create index if not exists cat_edges_map_order_idx
  on public.cat_edges (cat_map_id, order_index);

create table if not exists public.content_review_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  from_status text,
  to_status text not null,
  note text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  constraint content_review_events_entity_type_check check (
    entity_type in (
      'protocol',
      'protocol_section',
      'protocol_reference',
      'cat_map',
      'cat_block',
      'cat_edge',
      'drug',
      'calculator'
    )
  )
);

drop trigger if exists protocol_sections_set_updated_at on public.protocol_sections;
create trigger protocol_sections_set_updated_at
before update on public.protocol_sections
for each row
execute function public.update_updated_at_column();

drop trigger if exists protocol_references_set_updated_at on public.protocol_references;
create trigger protocol_references_set_updated_at
before update on public.protocol_references
for each row
execute function public.update_updated_at_column();

drop trigger if exists cat_blocks_set_updated_at on public.cat_blocks;
create trigger cat_blocks_set_updated_at
before update on public.cat_blocks
for each row
execute function public.update_updated_at_column();

drop trigger if exists cat_edges_set_updated_at on public.cat_edges;
create trigger cat_edges_set_updated_at
before update on public.cat_edges
for each row
execute function public.update_updated_at_column();

alter table public.protocol_sections enable row level security;
alter table public.protocol_references enable row level security;
alter table public.protocol_links enable row level security;
alter table public.cat_blocks enable row level security;
alter table public.cat_edges enable row level security;
alter table public.content_review_events enable row level security;

-- Reads follow parent protocol / CAT visibility. No public or authenticated writes
-- until an editor/admin role exists. Service role bypasses RLS.

drop policy if exists "protocol_sections_select_visible" on public.protocol_sections;
create policy "protocol_sections_select_visible"
on public.protocol_sections
for select
to anon, authenticated
using (
  visibility <> 'admin_only'
  and exists (
    select 1
    from public.protocols p
    where p.id = protocol_id
      and p.visibility in ('public_free', 'premium', 'preview_only')
      and p.status in ('seed_placeholder', 'published')
  )
);

drop policy if exists "protocol_references_select_visible" on public.protocol_references;
create policy "protocol_references_select_visible"
on public.protocol_references
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.protocols p
    where p.id = protocol_id
      and p.visibility in ('public_free', 'premium', 'preview_only')
      and p.status in ('seed_placeholder', 'published')
  )
);

drop policy if exists "protocol_links_select_visible" on public.protocol_links;
create policy "protocol_links_select_visible"
on public.protocol_links
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.protocols p
    where p.id = protocol_id
      and p.visibility in ('public_free', 'premium', 'preview_only')
      and p.status in ('seed_placeholder', 'published')
  )
);

drop policy if exists "cat_blocks_select_visible" on public.cat_blocks;
create policy "cat_blocks_select_visible"
on public.cat_blocks
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.cat_maps m
    where m.id = cat_map_id
      and m.visibility in ('public_free', 'premium')
      and m.status in ('seed_placeholder', 'published')
  )
);

drop policy if exists "cat_edges_select_visible" on public.cat_edges;
create policy "cat_edges_select_visible"
on public.cat_edges
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.cat_maps m
    where m.id = cat_map_id
      and m.visibility in ('public_free', 'premium')
      and m.status in ('seed_placeholder', 'published')
  )
);

grant select on public.protocol_sections to anon, authenticated;
grant select on public.protocol_references to anon, authenticated;
grant select on public.protocol_links to anon, authenticated;
grant select on public.cat_blocks to anon, authenticated;
grant select on public.cat_edges to anon, authenticated;

-- Placeholder sections for existing seed protocols.
insert into public.protocol_sections (
  protocol_id, heading, section_type, order_index, content_json, plain_text, review_status
)
select
  p.id,
  v.heading,
  v.section_type,
  v.order_index,
  jsonb_build_object(
    'type', 'doc',
    'blocks', jsonb_build_array(
      jsonb_build_object(
        'id', v.section_type || '-h',
        'type', 'heading',
        'level', 2,
        'text', v.heading
      ),
      jsonb_build_object(
        'id', v.section_type || '-p',
        'type', 'paragraph',
        'text', v.body
      ),
      jsonb_build_object(
        'id', v.section_type || '-l',
        'type', 'bullet_list',
        'items', v.bullets
      )
    )
  ),
  v.body,
  'unreviewed'
from public.protocols p
cross join (
  values
    (
      'Points clés'::text,
      'key_points'::text,
      1,
      'Placeholder éditorial. Cadre d''orientation uniquement. Aucune conduite définitive ni posologie n''est indiquée ici.'::text,
      '["Fiche en préparation — non validée","Adapter selon le protocole local","Aucune posologie n''est indiquée ici"]'::jsonb
    ),
    (
      'Diagnostic',
      'diagnosis',
      2,
      'Repères diagnostiques à rédiger après relecture. Cette section est une structure éditoriale, pas une recommandation finale.',
      '["Préciser le contexte clinique","Documenter les signes de gravité","Confirmer selon la filière locale"]'::jsonb
    ),
    (
      'Examens',
      'exams',
      3,
      'Les examens complémentaires se choisissent selon le contexte et la disponibilité locale. Aucun schéma définitif n''est validé ici.',
      '["Examens initiaux selon protocole local","Délais à confirmer sur site","Pas de liste exhaustive validée"]'::jsonb
    ),
    (
      'Prise en charge',
      'management',
      4,
      'Cadre d''orientation pour la prise en charge initiale. À adapter localement. Aucune prescription n''est indiquée ici.',
      '["Stabiliser selon le protocole local","Organiser l''orientation","Avis spécialisé si la suspicion persiste"]'::jsonb
    ),
    (
      'Orientation',
      'referral',
      5,
      'L''orientation dépend des signes de gravité et de l''organisation locale. Fiche en préparation.',
      '["Filière urgente selon le contexte","Suivi à documenter localement","Ne pas banaliser une amélioration spontanée"]'::jsonb
    ),
    (
      'Sources',
      'references',
      6,
      'Les références définitives seront ajoutées après relecture éditoriale et médicale. Sources à consolider.',
      '["Corpus non consolidé","Relecture médicale requise","Adaptation locale à vérifier"]'::jsonb
    )
) as v(heading, section_type, order_index, body, bullets)
where p.status = 'seed_placeholder'
  and not exists (
    select 1
    from public.protocol_sections existing
    where existing.protocol_id = p.id
      and existing.section_type = v.section_type
  );

insert into public.protocol_references (
  protocol_id, section_id, label, reference_type, order_index, review_status
)
select
  p.id,
  s.id,
  v.label,
  v.reference_type,
  v.order_index,
  'unreviewed'
from public.protocols p
join public.protocol_sections s
  on s.protocol_id = p.id
 and s.section_type = 'references'
cross join (
  values
    ('Référence clinique à consolider'::text, 'source_reference'::text, 1),
    ('Adaptation locale à documenter', 'other', 2)
) as v(label, reference_type, order_index)
where p.status = 'seed_placeholder'
  and not exists (
    select 1
    from public.protocol_references existing
    where existing.protocol_id = p.id
      and existing.label = v.label
  );

insert into public.protocol_links (
  protocol_id, target_type, target_id, target_slug, label, relationship, order_index
)
select
  p.id,
  'cat',
  m.id,
  regexp_replace(m.slug, '-cat$', ''),
  m.title,
  'primary_cat',
  1
from public.protocols p
join public.cat_maps m on m.protocol_id = p.id
where not exists (
  select 1
  from public.protocol_links existing
  where existing.protocol_id = p.id
    and existing.relationship = 'primary_cat'
);

insert into public.protocol_links (
  protocol_id, target_type, target_id, target_slug, label, relationship, order_index
)
select
  p.id,
  'calculator',
  c.id,
  c.slug,
  coalesce(c.short_title, c.title),
  'linked_calculator',
  2
from public.protocols p
join public.calculators c on c.slug = 'glasgow'
where p.status = 'seed_placeholder'
  and not exists (
    select 1
    from public.protocol_links existing
    where existing.protocol_id = p.id
      and existing.target_type = 'calculator'
      and existing.target_slug = c.slug
  );

-- CAT graphs intentionally empty: UI keeps the douleur-thoracique design mock
-- or the preparation state. Do not seed a clinical tree here.
