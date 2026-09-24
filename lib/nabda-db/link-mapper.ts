import {
  IMPORTED_FROM_NABDA_DB,
  type ContentLinkIdentity,
  type NabdaDbLink,
  type NabdaDbLinkEndpoint,
} from "@/lib/nabda-db/source-types";
import { detectSourcePrefix } from "@/lib/nabda-db/slugs";

function endpoint(
  value: NabdaDbLinkEndpoint | string | undefined,
): NabdaDbLinkEndpoint | null {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    const id = value.trim();
    if (!id) {
      return null;
    }
    return { type: detectSourcePrefix(id), id };
  }
  if (!value.id) {
    return null;
  }
  return {
    type: value.type || detectSourcePrefix(value.id),
    id: value.id,
  };
}

/**
 * Neutral link DTO. Does not write protocol_links.
 */
export function mapContentLink(source: NabdaDbLink): ContentLinkIdentity | null {
  const from = endpoint(source.from);
  const to = endpoint(source.to);
  if (!from || !to) {
    return null;
  }
  const relation =
    source.role ?? source.rel ?? source.type ?? source.kind ?? "related";
  return {
    source_from_id: from.id,
    source_to_id: to.id,
    from_type: from.type,
    to_type: to.type,
    relation_type: relation,
    confidence: source.confidence ?? null,
    imported_from: IMPORTED_FROM_NABDA_DB,
  };
}

export function mapContentLinks(records: NabdaDbLink[]): ContentLinkIdentity[] {
  const mapped: ContentLinkIdentity[] = [];
  for (const record of records) {
    const dto = mapContentLink(record);
    if (dto) {
      mapped.push(dto);
    }
  }
  return mapped;
}
