// Demo-mode fixture only. Do not import from production runtime providers.

import type {
  CatDetail,
  CatDetailViewMode,
  CatTab,
  ProtocolDetail,
  ProtocolSection,
  ProtocolViewMode,
  RichContentDocument,
  SectionNavItem,
} from "@/types/content-detail";

// Demo placeholder only — replace with validated source data before production.
// Design-approved mock fallbacks. Not medically validated.
// Keep when Supabase is down or records have no article/graph payload.

const HSA_ID = "protocol-cephalees-brutales-hsa";
const MENINGE_ID = "protocol-syndrome-meninge-aigu";

function doc(blocks: RichContentDocument["blocks"]): RichContentDocument {
  return { blocks };
}

function placeholderSection(input: {
  id: string;
  protocolId: string;
  slug: string;
  title: string;
  nav_label: string;
  order: number;
  summary: string;
  tags?: string[];
  show_in_cards?: boolean;
  card_index?: string;
  extra?: RichContentDocument["blocks"];
}): ProtocolSection {
  return {
    id: input.id,
    protocol_id: input.protocolId,
    slug: input.slug,
    title: input.title,
    short_title: input.nav_label,
    nav_label: input.nav_label,
    summary: input.summary,
    order: input.order,
    tags: input.tags,
    reading_time_minutes: 2,
    show_in_cards: input.show_in_cards,
    card_index: input.card_index,
    content: doc([
      {
        id: `${input.id}-h`,
        type: "heading",
        level: 2,
        text: input.title,
      },
      {
        id: `${input.id}-p`,
        type: "paragraph",
        text: input.summary,
      },
      ...(input.extra ?? []),
    ]),
  };
}

const hsaPriseEnCharge: ProtocolSection = {
  id: `${HSA_ID}-sec-pec`,
  protocol_id: HSA_ID,
  slug: "prise-en-charge",
  title: "Prise en charge initiale",
  short_title: "Prise en charge",
  nav_label: "Prise en charge",
  summary:
    "Cadre d'orientation pour une céphalée brutale inhabituelle, à adapter selon le contexte et le protocole local.",
  order: 4,
  tags: ["Urgences", "Orientation"],
  reading_time_minutes: 2,
  show_in_cards: true,
  card_index: "03",
  content: doc([
    {
      id: "hsa-pec-h",
      type: "heading",
      level: 2,
      text: "Prise en charge initiale",
    },
    {
      id: "hsa-pec-p1",
      type: "paragraph",
      text: "Une céphalée brutale inhabituelle reste une urgence diagnostique. L'imagerie, l'avis spécialisé et l'orientation se décident selon le délai d'évolution, les signes de gravité et le protocole local.",
    },
    {
      id: "hsa-pec-clinical",
      type: "callout",
      variant: "clinical",
      title: "Point clinique",
      body: "Une amélioration spontanée n'élimine pas une suspicion persistante. Poursuivre l'évaluation selon le contexte clinique et l'organisation locale.",
    },
    {
      id: "hsa-pec-warning",
      type: "callout",
      variant: "warning",
      title: "Vigilance",
      body: "Les signes de gravité justifient une filière urgente selon le protocole local. Cette fiche ne remplace pas le jugement clinique et n'indique aucune prescription.",
    },
    {
      id: "hsa-pec-h2",
      type: "heading",
      level: 3,
      text: "Repères d'organisation",
    },
    {
      id: "hsa-pec-bullets",
      type: "bullet_list",
      items: [
        "Stabiliser les fonctions vitales selon le protocole local",
        "Préciser le début brutal, le caractère inhabituel et le délai",
        "Rechercher des signes de gravité neurologiques",
        "Anticiper l'imagerie selon le contexte et la disponibilité locale",
      ],
    },
    {
      id: "hsa-pec-h3",
      type: "heading",
      level: 3,
      text: "Séquence à confirmer localement",
    },
    {
      id: "hsa-pec-steps",
      type: "numbered_list",
      items: [
        "Confirmer le contexte d'urgence diagnostique",
        "Organiser l'examen initial selon la filière locale",
        "Demander un avis spécialisé si la suspicion persiste",
        "Documenter l'orientation et le suivi prévu",
      ],
    },
    {
      id: "hsa-pec-table",
      type: "table",
      caption: "Scénarios d'orientation — à adapter localement",
      headers: ["Situation", "Conduite à préciser localement"],
      rows: [
        [
          "Suspicion élevée, délai court",
          "Imagerie initiale selon le protocole local et le contexte",
        ],
        [
          "Suspicion persistante après évaluation",
          "Avis spécialisé ; ne pas banaliser une amélioration spontanée",
        ],
        [
          "Signes de gravité",
          "Filière urgente selon l'organisation locale",
        ],
      ],
    },
    {
      id: "hsa-pec-cat",
      type: "protocol_mention",
      label: "CAT Céphalée brutale",
      href: "/cat/cephalees-brutales-hsa",
      subtitle: "Carte clinique liée",
    },
    {
      id: "hsa-pec-ottawa",
      type: "calculator_mention",
      label: "Score d'Ottawa HSA",
      href: "/calculators/ottawa-hsa",
      subtitle: "Outil d'aide",
    },
    {
      id: "hsa-pec-gcs",
      type: "calculator_mention",
      label: "Échelle de Glasgow",
      href: "/calculators/glasgow",
      subtitle: "Score clinique",
    },
    {
      id: "hsa-pec-drug",
      type: "drug_mention",
      label: "Fiche thérapeutique associée",
      href: "/drugs",
      subtitle: "À vérifier localement",
    },
    {
      id: "hsa-pec-ref",
      type: "reference_mention",
      label: "Sources à consolider",
      href: "/protocols/cephalees-brutales-hsa?section=sources",
      subtitle: "Relecture en cours",
    },
  ]),
};

const hsaDetail: ProtocolDetail = {
  protocol: {
    id: HSA_ID,
    slug: "cephalees-brutales-hsa",
    title: "Céphalées brutales et suspicion d'HSA",
    subtitle: "Urgence diagnostique — orientation selon contexte local",
    summary:
      "Fiche d'orientation pour une céphalée brutale inhabituelle. L'imagerie et l'avis spécialisé se discutent selon le délai, les signes de gravité et le protocole local.",
    short_title: "Céphalées brutales",
    categories: ["Urgences", "Neurologie"],
    tags: ["céphalée", "HSA", "garde"],
    audiences: ["intern", "resident", "generalist"],
    urgency: "urgent",
    status: "needs_medical_review",
    visibility: "stub",
    review_status: "unreviewed",
    local_adaptation_status: "to_verify",
    has_full_recommendation: true,
    has_cat: true,
    has_drug_links: true,
    has_calculator_links: true,
    category_slug: "neurologie",
    content_type: "recommendation",
    source_note: "Sources à consolider après relecture éditoriale et médicale.",
  },
  article: {
    id: `${HSA_ID}-article`,
    protocol_id: HSA_ID,
    reading_time_minutes: 8,
    section_count: 6,
    intro:
      "Cette recommandation structure le raisonnement. Elle n'est pas une validation finale et ne remplace pas le jugement clinique.",
    metric: {
      value: "Urgence",
      label: "Orientation diagnostique",
      caption: "selon délai, gravité et protocole local",
    },
  },
  sections: [
    placeholderSection({
      id: `${HSA_ID}-sec-dx`,
      protocolId: HSA_ID,
      slug: "diagnostic",
      title: "Diagnostic clinique",
      nav_label: "Diagnostic",
      order: 2,
      summary:
        "Repérer une céphalée brutale inhabituelle, le délai de début et les signes de gravité. Le diagnostic définitif reste du ressort de la filière locale.",
      tags: ["Clinique", "Gravité"],
      show_in_cards: true,
      card_index: "01",
      extra: [
        {
          id: "hsa-dx-list",
          type: "bullet_list",
          items: [
            "Caractère brutal et inhabituel à faire préciser",
            "Contexte et signes associés à documenter",
            "Ne pas conclure trop tôt si les symptômes s'atténuent",
          ],
        },
      ],
    }),
    placeholderSection({
      id: `${HSA_ID}-sec-ex`,
      protocolId: HSA_ID,
      slug: "examens",
      title: "Examens initiaux",
      nav_label: "Examens",
      order: 3,
      summary:
        "L'imagerie initiale et les examens complémentaires se choisissent selon le délai, le contexte et la disponibilité locale. Aucun schéma définitif n'est validé ici.",
      tags: ["Imagerie", "Local"],
      show_in_cards: true,
      card_index: "02",
    }),
    hsaPriseEnCharge,
    placeholderSection({
      id: `${HSA_ID}-sec-trt`,
      protocolId: HSA_ID,
      slug: "traitement",
      title: "Traitement",
      nav_label: "Traitement",
      order: 5,
      summary:
        "Les mesures thérapeutiques seront détaillées après relecture. En attendant, se référer au protocole local et à l'avis spécialisé. Aucune posologie n'est indiquée ici.",
      tags: ["Local", "Relecture"],
    }),
    placeholderSection({
      id: `${HSA_ID}-sec-or`,
      protocolId: HSA_ID,
      slug: "orientation",
      title: "Orientation et filière",
      nav_label: "Orientation",
      order: 6,
      summary:
        "L'orientation dépend des signes de gravité et de l'organisation locale. Une amélioration spontanée ne justifie pas à elle seule une sortie précoce.",
      tags: ["Filière", "Suivi"],
      show_in_cards: true,
      card_index: "04",
    }),
    placeholderSection({
      id: `${HSA_ID}-sec-src`,
      protocolId: HSA_ID,
      slug: "sources",
      title: "Sources",
      nav_label: "Sources",
      order: 7,
      summary:
        "Les références définitives seront ajoutées après relecture. Les libellés ci-dessous restent des placeholders éditoriaux.",
      tags: ["Relecture"],
      extra: [
        {
          id: "hsa-src-ref",
          type: "reference_mention",
          label: "Sources à consolider",
          href: "/protocols/cephalees-brutales-hsa",
          subtitle: "Métadonnées non validées",
        },
      ],
    }),
  ],
  key_points: [
    {
      id: "kp-1",
      text: "Céphalée brutale inhabituelle = urgence diagnostique",
    },
    {
      id: "kp-2",
      text: "Imagerie initiale selon délai et contexte",
    },
    {
      id: "kp-3",
      text: "Avis spécialisé si suspicion persistante",
    },
    {
      id: "kp-4",
      text: "Ne pas banaliser une amélioration spontanée",
    },
  ],
  linked_content: [
    {
      id: "link-cat",
      type: "cat",
      title: "CAT Céphalée brutale",
      subtitle: "Carte clinique · Urgences",
      href: "/cat/cephalees-brutales-hsa",
    },
    {
      id: "link-ottawa",
      type: "calculator",
      title: "Score d'Ottawa HSA",
      subtitle: "Outil d'aide · à confirmer localement",
      href: "/calculators/ottawa-hsa",
    },
    {
      id: "link-gcs",
      type: "calculator",
      title: "Échelle de Glasgow",
      subtitle: "Score clinique",
      href: "/calculators/glasgow",
    },
    {
      id: "link-drugs",
      type: "drug",
      title: "Fiche thérapeutique associée",
      subtitle: "Posologies non indiquées ici",
      href: "/drugs",
    },
  ],
  references: [
    {
      id: "ref-hsa-1",
      title: "Référence clinique à consolider",
      note: "La source définitive sera ajoutée après relecture éditoriale et médicale.",
      review_status: "unreviewed",
    },
    {
      id: "ref-hsa-2",
      title: "Adaptation locale à documenter",
      note: "Disponibilité des filières et examens à vérifier selon le site.",
      review_status: "unreviewed",
    },
  ],
  timeline: [
    {
      id: "tl-hsa-1",
      title: "Structure éditoriale & guidelines",
      status: "created",
    },
    {
      id: "tl-hsa-2",
      title: "Rédaction thérapeutique & posologies",
      status: "in_progress",
    },
    {
      id: "tl-hsa-3",
      title: "Relecture médicale collégiale",
      status: "upcoming",
    },
    {
      id: "tl-hsa-4",
      title: "Adaptation locale Algérie & disponibilité locale",
      status: "pending",
    },
  ],
};

const meningeDetail: ProtocolDetail = {
  protocol: {
    id: MENINGE_ID,
    slug: "syndrome-meninge-aigu",
    title: "Syndrome méningé aigu",
    subtitle: "Synthèse disponible — recommandation intégrale en préparation",
    summary:
      "Le syndrome méningé aigu oriente vers une évaluation urgente. Cette synthèse rappelle le cadre clinique ; la version complète sera publiée après relecture.",
    short_title: "Syndrome méningé",
    categories: ["Urgences", "Infectiologie"],
    tags: ["méningé", "garde"],
    audiences: ["intern", "resident", "generalist"],
    urgency: "urgent",
    status: "draft",
    visibility: "stub",
    review_status: "unreviewed",
    local_adaptation_status: "pending",
    has_full_recommendation: false,
    has_cat: false,
    has_drug_links: false,
    has_calculator_links: true,
    category_slug: "infectiologie",
    content_type: "recommendation",
    source_note: "Sources à consolider. Aucune validation finale n'est revendiquée.",
  },
  article: {
    id: `${MENINGE_ID}-article`,
    protocol_id: MENINGE_ID,
    reading_time_minutes: 3,
    section_count: 0,
    intro: "Le résumé existe déjà. La version complète sera publiée après relecture.",
    metric: {
      value: "Synthèse",
      label: "Version courte",
      caption: "recommandation intégrale à venir",
    },
  },
  sections: [],
  key_points: [
    {
      id: "meninge-kp-1",
      text: "Tableau méningé aigu = évaluation urgente selon le protocole local",
    },
    {
      id: "meninge-kp-2",
      text: "La conduite détaillée sera publiée après relecture",
    },
  ],
  linked_content: [
    {
      id: "meninge-gcs",
      type: "calculator",
      title: "Échelle de Glasgow",
      subtitle: "Score déjà disponible",
      href: "/calculators/glasgow",
    },
    {
      id: "meninge-cat",
      type: "cat",
      title: "Module CAT",
      subtitle: "Cartes cliniques d'urgence",
      href: "/cat",
    },
    {
      id: "meninge-search",
      type: "protocol",
      title: "Autres recommandations",
      subtitle: "Recherche filtrée",
      href: "/search?type=protocols",
    },
  ],
  references: [
    {
      id: "ref-meninge-1",
      title: "Sources à consolider",
      note: "Aucun corpus définitif n'est associé à cette fiche pour le moment.",
      review_status: "unreviewed",
    },
  ],
  timeline: [
    {
      id: "tl-meninge-1",
      title: "Structure éditoriale & guidelines",
      status: "created",
    },
    {
      id: "tl-meninge-2",
      title: "Rédaction thérapeutique & posologies",
      status: "in_progress",
    },
    {
      id: "tl-meninge-3",
      title: "Relecture médicale collégiale",
      status: "upcoming",
    },
    {
      id: "tl-meninge-4",
      title: "Adaptation locale Algérie & disponibilité locale",
      status: "pending",
    },
  ],
  available_summary:
    "Le syndrome méningé aigu oriente vers une évaluation urgente. Stabilisation, examen clinique et avis spécialisé se discutent selon le contexte et le protocole local. La recommandation intégrale, y compris les examens et la thérapeutique, sera ajoutée après relecture. Aucune posologie n'est indiquée ici.",
};

const PROTOCOL_DETAILS: Record<string, ProtocolDetail> = {
  [hsaDetail.protocol.slug]: hsaDetail,
  [meningeDetail.protocol.slug]: meningeDetail,
};

export function getProtocolDetail(slug: string): ProtocolDetail | undefined {
  return PROTOCOL_DETAILS[slug];
}

export function listProtocolDetails(): ProtocolDetail[] {
  return Object.values(PROTOCOL_DETAILS);
}

export function firstQueryValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function resolveProtocolViewMode(input: {
  detail?: ProtocolDetail;
  section?: string;
  state?: string;
}): ProtocolViewMode {
  if (!input.detail) {
    return "missing";
  }
  if (input.state === "preparation" || !input.detail.protocol.has_full_recommendation) {
    return "preparation";
  }
  if (
    input.section &&
    input.detail.sections.some((section) => section.slug === input.section)
  ) {
    return "section";
  }
  return "overview";
}

export function getSectionNavItems(detail: ProtocolDetail): SectionNavItem[] {
  return [
    { slug: null, label: "Points clés" },
    ...detail.sections.map((section) => ({
      slug: section.slug,
      label: section.nav_label,
    })),
  ];
}

export function protocolHref(
  slug: string,
  query?: { section?: string; state?: string },
): string {
  const params = new URLSearchParams();
  if (query?.section) {
    params.set("section", query.section);
  }
  if (query?.state) {
    params.set("state", query.state);
  }
  const qs = params.toString();
  return qs ? `/protocols/${slug}?${qs}` : `/protocols/${slug}`;
}

export function findSection(
  detail: ProtocolDetail,
  slug: string | undefined,
): ProtocolSection | undefined {
  if (!slug) {
    return undefined;
  }
  return detail.sections.find((section) => section.slug === slug);
}

export function adjacentSections(
  detail: ProtocolDetail,
  slug: string,
): { previous?: ProtocolSection; next?: ProtocolSection } {
  const index = detail.sections.findIndex((section) => section.slug === slug);
  if (index < 0) {
    return {};
  }
  return {
    previous: detail.sections[index - 1],
    next: detail.sections[index + 1],
  };
}

export function readingTrackerLabel(
  detail: ProtocolDetail,
  section: ProtocolSection,
): string {
  const shortTitle =
    detail.protocol.short_title ?? detail.protocol.title.split(" et ")[0];
  const minutes = section.reading_time_minutes ?? 2;
  if (section.slug === "sources") {
    return `${shortTitle} · Sources · à consolider`;
  }
  return `${shortTitle} · Section ${section.order} sur ${detail.article.section_count} · ${minutes} min`;
}

export const CARD_SECTIONS_TITLE = "Parcours séquentiel";
export const KEY_POINTS_TITLE = "Points clés";
export const LINKED_CONTENT_TITLE = "Outils et contenus liés";
export const REVIEW_PANEL_TITLE = "Statut éditorial";
export const PREPARATION_TITLE = "Protocole intégral en préparation";
export const PREPARATION_SUBTITLE =
  "Le résumé existe déjà. La version complète sera publiée après relecture.";

export const CAT_TABS: { id: CatTab; label: string }[] = [
  { id: "carte", label: "Carte" },
  { id: "etapes", label: "Étapes" },
  { id: "notes", label: "Notes" },
  { id: "sources", label: "Sources" },
];

export const CAT_LINKED_TOOLS_TITLE = "Outils décisionnels liés";
export const CAT_RED_FLAGS_TITLE = "Signaux d’alerte";
export const CAT_MAP_PREPARATION_TITLE = "Carte CAT en préparation";
export const CAT_MAP_PREPARATION_SUBTITLE =
  "La fiche existe déjà. La carte décisionnelle sera ajoutée après validation.";
export const CAT_CARTE_PLACEHOLDER_TITLE = "Carte interactive à intégrer";
export const CAT_CARTE_PLACEHOLDER_SUBTITLE =
  "Le canevas zoomable sera ajouté dans l’étape suivante.";

const THORAX_ID = "cat-douleur-thoracique";

const thoraxDetail: CatDetail = {
  map: {
    id: THORAX_ID,
    protocol_id: null,
    slug: "douleur-thoracique",
    title: "Douleur thoracique aiguë",
    subtitle: "Carte clinique de référence — à adapter selon le protocole local",
    short_title: "Douleur thoracique",
    summary:
      "Repères d'orientation pour une douleur thoracique aiguë en garde. Cette CAT n'établit pas de diagnostic et ne remplace pas le jugement clinique.",
    status: "needs_medical_review",
    review_status: "unreviewed",
    visibility: "stub",
    local_adaptation_status: "to_verify",
    rendering_mode: "static_clinical_map",
    safety_note:
      "Carte de référence. Pas un moteur de diagnostic. Orienter selon le contexte clinique et le protocole local.",
    categories: ["Urgences", "Cardiologie"],
    tags: ["garde", "douleur thoracique"],
    blocks: [],
    edges: [],
    source_note: "Sources à consolider après relecture éditoriale et médicale.",
  },
  steps: [
    {
      id: "thorax-step-1",
      order: 1,
      title: "Identifier le contexte clinique",
      description:
        "Préciser le délai, le terrain et les circonstances. Cadre d’orientation, pas un diagnostic automatique.",
      chips: ["Garde", "Contexte"],
    },
    {
      id: "thorax-step-2",
      order: 2,
      title: "Rechercher les signes de gravité",
      description:
        "Repérer une instabilité ou un signe d’alerte. Filière urgente selon le protocole local si besoin.",
      chips: ["Alerte", "Local"],
      branchNote:
        "Instabilité vitale : orientation urgente selon l’organisation locale.",
    },
    {
      id: "thorax-step-3",
      order: 3,
      title: "Réaliser l’examen initial",
      description:
        "Examen ciblé et outils disponibles sur site. Les délais se confirment selon l’organisation locale.",
      chips: ["Examen"],
      linkedTool: {
        id: "tool-ecg",
        type: "protocol",
        title: "Guide ECG",
        subtitle: "Fiche liée",
        href: "/protocols/guide-ecg",
      },
    },
    {
      id: "thorax-step-4",
      order: 4,
      title: "Classer le niveau de risque",
      description:
        "Stratification clinique à croiser avec les scores liés et le protocole local. Aucune décision automatique.",
      chips: ["Score lié"],
      linkedTool: {
        id: "tool-heart",
        type: "calculator",
        title: "Score HEART",
        subtitle: "Outil d’aide",
        href: "/calculators/heart",
      },
    },
    {
      id: "thorax-step-5",
      order: 5,
      title: "Orienter selon protocole local",
      description:
        "Filière, surveillance ou avis spécialisé selon le contexte. Cette carte reste une référence, pas une prescription.",
      chips: ["Filière", "Local"],
    },
  ],
  red_flags: [
    { id: "rf-1", label: "Instabilité hémodynamique" },
    { id: "rf-2", label: "Syncope" },
    { id: "rf-3", label: "Douleur transfixiante" },
    { id: "rf-4", label: "Désaturation" },
    { id: "rf-5", label: "Trouble du rythme" },
    { id: "rf-6", label: "SCA ST+" },
  ],
  linked_tools: [
    {
      id: "cat-tool-heart",
      type: "calculator",
      title: "Score HEART",
      subtitle: "Aide à la stratification · à confirmer localement",
      href: "/calculators/heart",
    },
    {
      id: "cat-tool-wells",
      type: "calculator",
      title: "Score Wells",
      subtitle: "Outil d’aide · EP selon contexte",
      href: "/calculators/wells-ep",
    },
    {
      id: "cat-tool-tropo",
      type: "calculator",
      title: "Cinétique hs-cTn",
      subtitle: "Repère d’interprétation · protocole local",
      href: "/calculators/troponine-hs",
    },
    {
      id: "cat-tool-ecg",
      type: "protocol",
      title: "Guide ECG",
      subtitle: "Fiche liée",
      href: "/protocols/guide-ecg",
    },
  ],
  linked_protocols: [
    {
      id: "cat-protocol-ecg",
      type: "protocol",
      title: "Guide ECG",
      subtitle: "Protocole lié",
      href: "/protocols/guide-ecg",
    },
  ],
  references: [
    {
      id: "cat-ref-1",
      title: "Référence clinique à consolider",
      note: "La source définitive sera ajoutée après relecture éditoriale et médicale.",
      review_status: "unreviewed",
    },
    {
      id: "cat-ref-2",
      title: "Adaptation locale à documenter",
      note: "Filières, délais d’examen et disponibilité à vérifier selon le site.",
      review_status: "unreviewed",
    },
  ],
  timeline: [
    {
      id: "cat-tl-1",
      title: "Structure éditoriale créée",
      status: "created",
    },
    {
      id: "cat-tl-2",
      title: "Carte décisionnelle à compléter",
      status: "in_progress",
    },
    {
      id: "cat-tl-3",
      title: "Révision médicale à venir",
      status: "upcoming",
    },
    {
      id: "cat-tl-4",
      title: "Adaptation locale Algérie à vérifier",
      status: "pending",
    },
  ],
};

const CAT_DETAILS: Record<string, CatDetail> = {
  [thoraxDetail.map.slug]: thoraxDetail,
};

export function getCatDetail(slug: string): CatDetail | undefined {
  return CAT_DETAILS[slug];
}

export function catHref(
  slug: string,
  query?: { tab?: CatTab; state?: string },
): string {
  const params = new URLSearchParams();
  if (query?.tab) {
    params.set("tab", query.tab);
  }
  if (query?.state) {
    params.set("state", query.state);
  }
  const qs = params.toString();
  return qs ? `/cat/${slug}?${qs}` : `/cat/${slug}`;
}

export function resolveCatTab(tab?: string): CatTab {
  if (tab === "carte" || tab === "etapes" || tab === "notes" || tab === "sources") {
    return tab;
  }
  return "carte";
}

export function resolveCatDetailMode(input: {
  detail?: CatDetail;
  state?: string;
}): CatDetailViewMode {
  if (!input.detail) {
    return "missing";
  }
  if (input.state === "preparation") {
    return "preparation";
  }
  return "tabs";
}
