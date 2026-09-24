import {
  identityImportDefaults,
  mapLocaleStatus,
  type CatIdentity,
  type NabdaDbGuideline,
  type ProtocolIdentity,
} from "@/lib/nabda-db/source-types";
import { sourceIdToSlug } from "@/lib/nabda-db/slugs";
import { mapGuidelineTaxonomy } from "@/lib/nabda-db/taxonomy";

const FLOWCHART_PATTERN =
  /class=["']arbre|class=["']titarbre|<map[\s>]|<area[\s>]/i;

export function hasFlowchartImage(bodyHtml?: string): boolean {
  if (!bodyHtml) {
    return false;
  }
  return FLOWCHART_PATTERN.test(bodyHtml);
}

export function countFlowchartMedia(bodyHtml?: string): number {
  if (!bodyHtml) {
    return 0;
  }
  const withMap = bodyHtml.match(/<img[^>]+usemap=/gi) ?? [];
  if (withMap.length > 0) {
    return withMap.length;
  }
  const inTree = bodyHtml.match(
    /class=["']arbre[\s\S]*?<img[^>]+src=["']media\/g-[^"']+["']/gi,
  ) ?? [];
  if (inTree.length > 0) {
    return inTree.length;
  }
  return 0;
}

export function countSourceBlocks(bodyHtml?: string, sources?: Record<string, unknown>): number {
  const htmlCount = (bodyHtml?.match(/class=["']tsource["']/g) ?? []).length;
  const objectCount = sources && Object.keys(sources).length > 0 ? 1 : 0;
  return htmlCount + objectCount;
}

export function mapGuidelineToProtocolIdentity(
  source: NabdaDbGuideline,
): ProtocolIdentity {
  const taxonomy = mapGuidelineTaxonomy(source.id, source.title);
  const bodyHtml = source.body_html ?? "";
  return {
    ...identityImportDefaults(),
    source_id: source.id,
    source_prefix: "g",
    source_slug: sourceIdToSlug(source.id),
    slug: sourceIdToSlug(source.id),
    title: source.title,
    category_slug: taxonomy.category_slug,
    tag_slugs: taxonomy.tag_slugs,
    has_body_html: Boolean(source.body_html && source.body_html.trim()),
    has_flowchart_image: hasFlowchartImage(bodyHtml),
    source_count: countSourceBlocks(bodyHtml, source.sources),
    linked_drug_ids: [...(source.substance_ids ?? [])],
    linked_calc_ids: [...(source.calc_ids ?? [])],
    linked_protocol_ids: [...(source.related_cat_ids ?? [])],
    local_adaptation_status: mapLocaleStatus(source.locale_status),
    source_trace: {
      pack: "nabda_db",
      file: `cat/${source.id}.json`,
      source_context: source.source_context ?? null,
      locale_status: source.locale_status ?? null,
      taxonomy_unmapped: taxonomy.unmapped,
      has_body_html: Boolean(source.body_html && source.body_html.trim()),
      body_html_not_mapped: true,
      vidal_reco_id:
        source.sources && "vidal_reco_id" in source.sources
          ? source.sources.vidal_reco_id
          : null,
      db_local_adaptation_status_candidate:
        source.locale_status === "adapted" ? "in_progress" : mapLocaleStatus(source.locale_status),
    },
  };
}

export function shouldMapGuidelineToCat(source: NabdaDbGuideline): boolean {
  return hasFlowchartImage(source.body_html);
}

export function mapGuidelineToCatIdentity(
  source: NabdaDbGuideline,
): CatIdentity | null {
  if (!shouldMapGuidelineToCat(source)) {
    return null;
  }
  const taxonomy = mapGuidelineTaxonomy(source.id, source.title);
  const bodyHtml = source.body_html ?? "";
  return {
    ...identityImportDefaults(),
    source_id: source.id,
    source_prefix: "g",
    protocol_source_id: source.id,
    source_slug: sourceIdToSlug(source.id),
    slug: sourceIdToSlug(source.id),
    title: source.title,
    category_slug: taxonomy.category_slug,
    tag_slugs: taxonomy.tag_slugs,
    has_flowchart_image: true,
    flowchart_media_count: countFlowchartMedia(bodyHtml),
    local_adaptation_status: mapLocaleStatus(source.locale_status),
    source_trace: {
      pack: "nabda_db",
      file: `cat/${source.id}.json`,
      source_context: source.source_context ?? null,
      locale_status: source.locale_status ?? null,
      protocol_source_id: source.id,
      graph_not_extracted: true,
      cat_blocks: [],
      cat_edges: [],
      db_local_adaptation_status_candidate:
        source.locale_status === "adapted" ? "in_progress" : mapLocaleStatus(source.locale_status),
    },
  };
}
