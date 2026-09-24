import type {
  ProtocolLinkRow,
  ProtocolReferenceRow,
  ProtocolSectionRow,
  Protocol as DbProtocol,
} from "@/types/content";
import type {
  EditorialTimelineItem,
  LinkedContentItem,
  LinkedContentType,
  Protocol,
  ProtocolDetail,
  ProtocolKeyPoint,
  ProtocolSection,
  Reference,
  RichContentBlock,
  RichContentDocument,
} from "@/types/content-detail";
import {
  DEFAULT_STATUS_LABELS,
  safeSourceNote,
  sanitizeReviewStatus,
} from "./status-labels";
import {
  canRenderClinicalDetails,
  overlaySafeText,
} from "@/lib/content-source/readiness";

export const CATEGORY_LABELS: Record<string, string> = {
  urgences: "Urgences",
  cardiologie: "Cardiologie",
  pediatrie: "Pédiatrie",
  infectiologie: "Infectiologie",
  pneumologie: "Pneumologie",
  neurologie: "Neurologie",
  gyneco_obstetrique: "Gynéco-obstétrique",
  endocrinologie: "Endocrinologie",
  medicaments: "Médicaments",
  scores: "Scores",
};

export function categoryLabel(slug: string | null | undefined): string {
  if (!slug) {
    return "Urgences";
  }
  return CATEGORY_LABELS[slug] ?? slug;
}

export const PLACEHOLDER_TIMELINE: EditorialTimelineItem[] = [
  {
    id: "tl-structure",
    title: "Structure éditoriale créée",
    status: "created",
  },
  {
    id: "tl-content",
    title: "Contenu clinique à compléter",
    status: "in_progress",
  },
  {
    id: "tl-review",
    title: "Révision médicale à venir",
    status: "upcoming",
  },
  {
    id: "tl-local",
    title: "Adaptation locale à vérifier",
    status: "pending",
  },
];

export const PLACEHOLDER_REFERENCES: Reference[] = [
  {
    id: "ref-placeholder-1",
    title: "Sources à consolider",
    note: "Aucun corpus définitif n'est associé à cette fiche pour le moment.",
    review_status: "unreviewed",
  },
  {
    id: "ref-placeholder-2",
    title: "Adaptation locale à documenter",
    note: "Filières et disponibilité à vérifier selon le site.",
    review_status: "unreviewed",
  },
];

export type ProtocolStructuredContent = {
  sections: ProtocolSection[];
  key_points: ProtocolKeyPoint[];
  references: Reference[];
};

const SECTION_SLUGS: Record<string, string> = {
  key_points: "points-cles",
  clinical_presentation: "presentation",
  diagnosis: "diagnostic",
  exams: "examens",
  management: "prise-en-charge",
  treatment: "traitement",
  referral: "orientation",
  follow_up: "suivi",
  special_situations: "situations-particulieres",
  prevention: "prevention",
  background: "contexte",
  references: "sources",
  custom: "custom",
};

const CARD_SECTION_TYPES = new Set([
  "diagnosis",
  "exams",
  "management",
  "referral",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

export function contentJsonToDocument(
  contentJson: unknown,
  fallbackText?: string | null,
): RichContentDocument {
  const record = isRecord(contentJson) ? contentJson : {};
  const rawBlocks = Array.isArray(record.blocks)
    ? record.blocks
    : Array.isArray(record.content)
      ? record.content
      : [];

  const blocks: RichContentBlock[] = [];
  rawBlocks.forEach((item, index) => {
    const mapped = mapContentBlock(item, index);
    if (mapped) {
      blocks.push(mapped);
    }
  });

  if (blocks.length === 0 && fallbackText) {
    blocks.push({
      id: "plain-text",
      type: "paragraph",
      text: fallbackText,
    });
  }

  return { blocks };
}

function mapContentBlock(
  value: unknown,
  index: number,
): RichContentBlock | null {
  if (!isRecord(value)) {
    return null;
  }
  const id = typeof value.id === "string" ? value.id : `block-${index}`;
  const type = typeof value.type === "string" ? value.type : "";

  if (type === "heading") {
    const level = value.level === 3 || value.level === 4 ? value.level : 2;
    return {
      id,
      type: "heading",
      level,
      text: typeof value.text === "string" ? value.text : "",
    };
  }
  if (type === "paragraph" || type === "text") {
    const text =
      typeof value.text === "string"
        ? value.text
        : typeof value.content === "string"
          ? value.content
          : "";
    return { id, type: "paragraph", text };
  }
  if (type === "bullet_list") {
    return { id, type: "bullet_list", items: asStringArray(value.items) };
  }
  if (type === "numbered_list") {
    return { id, type: "numbered_list", items: asStringArray(value.items) };
  }
  if (type === "callout") {
    return {
      id,
      type: "callout",
      variant: value.variant === "warning" ? "warning" : "clinical",
      title: typeof value.title === "string" ? value.title : undefined,
      body:
        typeof value.body === "string"
          ? value.body
          : typeof value.text === "string"
            ? value.text
            : "",
    };
  }
  return null;
}

export function mapProtocolSections(
  rows: ProtocolSectionRow[],
): ProtocolSection[] {
  const visible = rows
    .filter(
      (row) =>
        row.visibility !== "admin_only" && row.section_type !== "key_points",
    )
    .sort((a, b) => a.order_index - b.order_index);

  let cardIndex = 0;
  return visible.map((row) => {
    if (CARD_SECTION_TYPES.has(row.section_type)) {
      cardIndex += 1;
    }
    const slug = SECTION_SLUGS[row.section_type] ?? row.section_type;
    const showInCards = CARD_SECTION_TYPES.has(row.section_type);
    return {
      id: row.id,
      protocol_id: row.protocol_id,
      slug,
      title: row.heading,
      short_title: row.heading,
      nav_label: row.heading,
      summary: row.plain_text ?? undefined,
      order: row.order_index,
      tags: row.adaptation_flags,
      reading_time_minutes: 2,
      show_in_cards: showInCards,
      card_index: showInCards ? String(cardIndex).padStart(2, "0") : undefined,
      content: contentJsonToDocument(row.content_json, row.plain_text),
    };
  });
}

export function keyPointsFromSections(
  rows: ProtocolSectionRow[],
): ProtocolKeyPoint[] {
  const keySection = rows.find((row) => row.section_type === "key_points");
  if (!keySection) {
    return [];
  }
  const document = contentJsonToDocument(
    keySection.content_json,
    keySection.plain_text,
  );
  const bullets = document.blocks.find(
    (block): block is Extract<RichContentBlock, { type: "bullet_list" }> =>
      block.type === "bullet_list",
  );
  if (bullets) {
    return bullets.items.map((text, index) => ({
      id: `${keySection.id}-kp-${index + 1}`,
      text,
    }));
  }
  if (keySection.plain_text) {
    return [{ id: `${keySection.id}-kp-1`, text: keySection.plain_text }];
  }
  return [];
}

export function mapProtocolReferences(
  rows: ProtocolReferenceRow[],
): Reference[] {
  return [...rows]
    .sort((a, b) => a.order_index - b.order_index)
    .map((row) => ({
      id: row.id,
      title: row.label,
      citation: row.reference_type,
      year: row.year != null ? String(row.year) : null,
      url: row.url,
      note: "Source placeholder — à consolider après relecture.",
      review_status: sanitizeReviewStatus(row.review_status),
    }));
}

function linkHref(row: ProtocolLinkRow): string | null {
  const slug = row.target_slug?.trim();
  if (row.target_type === "protocol" && slug) {
    return `/protocols/${slug}`;
  }
  if (row.target_type === "cat" && slug) {
    return `/cat/${slug.replace(/-cat$/, "")}`;
  }
  if (row.target_type === "drug" && slug) {
    return `/drugs/${slug}`;
  }
  if (row.target_type === "calculator" && slug) {
    return `/calculators/${slug}`;
  }
  if (row.target_type === "external" && slug && slug.startsWith("/")) {
    return slug;
  }
  return null;
}

function linkType(targetType: string): LinkedContentType {
  if (
    targetType === "cat" ||
    targetType === "calculator" ||
    targetType === "drug" ||
    targetType === "protocol"
  ) {
    return targetType;
  }
  return "reference";
}

export function mapProtocolLinks(rows: ProtocolLinkRow[]): LinkedContentItem[] {
  return [...rows]
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap((row) => {
      const href = linkHref(row);
      if (!href) {
        return [];
      }
      return [
        {
          id: row.id,
          type: linkType(row.target_type),
          title: row.label,
          subtitle:
            row.relationship === "primary_cat"
              ? "Carte clinique liée · fiche en préparation"
              : "Lien éditorial · à confirmer",
          href,
        },
      ];
    });
}

export type LinkedCatalogs = {
  protocols: Array<{ slug: string; title: string; short_title?: string | null }>;
  cats: Array<{ slug: string; title: string; protocol_id?: string | null }>;
  calculators: Array<{
    slug: string;
    title: string;
    short_title?: string | null;
    description?: string | null;
  }>;
  drugs: Array<{ slug: string; display_name: string; summary?: string | null }>;
};

function uniqueLabels(labels: string[]): string[] {
  return [...new Set(labels.filter(Boolean))];
}

function hrefSlug(
  href: string,
  kind: "protocols" | "cat" | "calculators" | "drugs",
): string | null {
  const match = href.match(new RegExp(`/${kind}/([^/?#]+)`));
  return match?.[1] ?? null;
}

export function overlayLinkedContentTitles(
  items: LinkedContentItem[],
  catalogs: LinkedCatalogs,
): LinkedContentItem[] {
  return items.map((item) => {
    if (item.type === "calculator") {
      const slug = hrefSlug(item.href, "calculators");
      const row = slug
        ? catalogs.calculators.find((entry) => entry.slug === slug)
        : undefined;
      if (!row) {
        return item;
      }
      return {
        ...item,
        title: row.short_title || row.title,
      };
    }
    if (item.type === "drug") {
      const slug = hrefSlug(item.href, "drugs");
      const row = slug
        ? catalogs.drugs.find((entry) => entry.slug === slug)
        : undefined;
      if (!row) {
        return item;
      }
      return { ...item, title: row.display_name };
    }
    if (item.type === "protocol") {
      const slug = hrefSlug(item.href, "protocols");
      const row = slug
        ? catalogs.protocols.find((entry) => entry.slug === slug)
        : undefined;
      if (!row) {
        return item;
      }
      return { ...item, title: row.short_title || row.title };
    }
    if (item.type === "cat") {
      const slug = hrefSlug(item.href, "cat");
      const row = slug
        ? catalogs.cats.find(
            (entry) => entry.slug === slug || entry.slug === `${slug}-cat`,
          )
        : undefined;
      if (!row) {
        return item;
      }
      return { ...item, title: row.title };
    }
    return item;
  });
}

export function overlayProtocolIdentity(
  mock: Protocol,
  row: DbProtocol,
): Protocol {
  return {
    ...mock,
    id: row.id,
    slug: row.slug,
    title: row.title,
    short_title: row.short_title ?? mock.short_title,
    summary: overlaySafeText(
      row.summary,
      mock.summary,
      row.review_status,
      row.status,
    ) ?? mock.summary,
    category_slug: row.category_slug ?? mock.category_slug,
    categories: uniqueLabels([
      categoryLabel(row.category_slug),
      ...mock.categories,
    ]),
    status: row.status,
    review_status: sanitizeReviewStatus(row.review_status, row.status),
    visibility: row.visibility,
    is_featured: row.is_featured,
    published_at: row.published_at,
    source_note: safeSourceNote(row.source_note, mock.source_note ?? DEFAULT_STATUS_LABELS.sources),
    content_type: row.content_type,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function deriveLinkedContentForProtocol(input: {
  protocolId: string;
  protocolSlug: string;
  fallback?: LinkedContentItem[];
  catalogs: LinkedCatalogs;
  catRouteSlug?: string | null;
  catTitle?: string | null;
  dbLinks?: LinkedContentItem[];
}): LinkedContentItem[] {
  if (input.dbLinks && input.dbLinks.length > 0) {
    return overlayLinkedContentTitles(input.dbLinks, input.catalogs);
  }

  if (input.fallback && input.fallback.length > 0) {
    return overlayLinkedContentTitles(input.fallback, input.catalogs);
  }

  // Fallback when protocol_links is empty.
  const items: LinkedContentItem[] = [];
  if (input.catRouteSlug) {
    items.push({
      id: `${input.protocolId}-link-cat`,
      type: "cat",
      title: input.catTitle ?? "CAT liée",
      subtitle: "Carte clinique · fiche en préparation",
      href: `/cat/${input.catRouteSlug}`,
    });
  }

  const glasgow = input.catalogs.calculators.find((item) => item.slug === "glasgow");
  if (glasgow) {
    items.push({
      id: `${input.protocolId}-link-gcs`,
      type: "calculator",
      title: glasgow.short_title || glasgow.title,
      subtitle: "Score clinique · fiche en préparation",
      href: `/calculators/${glasgow.slug}`,
    });
  }

  items.push({
    id: `${input.protocolId}-link-search`,
    type: "protocol",
    title: "Autres recommandations",
    subtitle: "Recherche filtrée",
    href: "/search?type=protocols",
  });

  return items;
}

export function protocolDetailFromDbRow(
  row: DbProtocol,
  mock: ProtocolDetail | undefined,
  linked: LinkedContentItem[],
  hasCat: boolean,
  structured?: ProtocolStructuredContent,
): ProtocolDetail {
  const dbSections = structured?.sections ?? [];
  const dbKeyPoints = structured?.key_points ?? [];
  const dbReferences = structured?.references ?? [];
  const useDbArticle =
    dbSections.length > 0 &&
    canRenderClinicalDetails(row.review_status, row.status);
  const useDbKeyPoints =
    dbKeyPoints.length > 0 &&
    canRenderClinicalDetails(row.review_status, row.status);
  const useDbReferences =
    dbReferences.length > 0 &&
    canRenderClinicalDetails(row.review_status, row.status);

  if (mock) {
    const sections = useDbArticle ? dbSections : mock.sections;
    return {
      ...mock,
      protocol: overlayProtocolIdentity(
        {
          ...mock.protocol,
          has_full_recommendation:
            useDbArticle || mock.protocol.has_full_recommendation,
          has_cat: hasCat || mock.protocol.has_cat,
          has_calculator_links: linked.some((item) => item.type === "calculator"),
          has_drug_links: linked.some((item) => item.type === "drug"),
        },
        row,
      ),
      article: {
        ...mock.article,
        protocol_id: row.id,
        section_count: sections.length,
      },
      sections,
      key_points: useDbKeyPoints ? dbKeyPoints : mock.key_points,
      linked_content: linked.length > 0 ? linked : mock.linked_content,
      references: useDbReferences ? dbReferences : mock.references,
    };
  }

  const title = row.title;
  return {
    protocol: {
      id: row.id,
      slug: row.slug,
      title,
      subtitle: "Fiche éditoriale — structure en préparation",
      summary: overlaySafeText(
        row.summary,
        undefined,
        row.review_status,
        row.status,
      ),
      short_title: row.short_title ?? title,
      categories: [categoryLabel(row.category_slug)],
      tags: [],
      audiences: [],
      urgency: "standard",
      status: row.status,
      visibility: row.visibility,
      review_status: sanitizeReviewStatus(row.review_status, row.status),
      local_adaptation_status: "pending",
      has_full_recommendation: useDbArticle,
      has_cat: hasCat,
      has_drug_links: linked.some((item) => item.type === "drug"),
      has_calculator_links: linked.some((item) => item.type === "calculator"),
      category_slug: row.category_slug,
      content_type: row.content_type,
      is_featured: row.is_featured,
      published_at: row.published_at,
      source_note: safeSourceNote(row.source_note),
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    article: {
      id: `${row.id}-article`,
      protocol_id: row.id,
      reading_time_minutes: useDbArticle ? 6 : 3,
      section_count: useDbArticle ? dbSections.length : 0,
      intro:
        overlaySafeText(
          row.summary,
          "Le résumé existe déjà. La version complète sera publiée après relecture.",
          row.review_status,
          row.status,
        ) ?? "Le résumé existe déjà. La version complète sera publiée après relecture.",
      metric: {
        value: "Synthèse",
        label: "Version courte",
        caption: "recommandation intégrale à venir",
      },
    },
    sections: useDbArticle ? dbSections : [],
    key_points: useDbKeyPoints
      ? dbKeyPoints
      : [
            {
              id: `${row.id}-kp-1`,
              text: "Cette fiche est une structure éditoriale. Aucune conduite définitive n'est validée ici.",
            },
            {
              id: `${row.id}-kp-2`,
              text: "Adapter selon le protocole local et le jugement clinique.",
            },
          ],
    linked_content: linked,
    references: useDbReferences
      ? dbReferences
      : PLACEHOLDER_REFERENCES.map((item, index) => ({
            ...item,
            id: `${row.id}-ref-${index + 1}`,
          })),
    timeline: PLACEHOLDER_TIMELINE.map((item, index) => ({
      ...item,
      id: `${row.id}-tl-${index + 1}`,
    })),
    available_summary:
      overlaySafeText(
        row.summary,
        "Fiche en préparation. Aucune posologie n'est indiquée ici.",
        row.review_status,
        row.status,
      ) ?? "Fiche en préparation. Aucune posologie n'est indiquée ici.",
  };
}
