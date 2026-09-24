const SOURCE_PREFIXES = [
  "calc.",
  "atc.",
  "ind.",
  "g.",
  "s.",
  "p.",
  "c.",
  "m.",
  "ci.",
  "eff.",
] as const;

export type SourcePrefix =
  | "calc"
  | "g"
  | "s"
  | "p"
  | "c"
  | "m"
  | "atc"
  | "ind"
  | "ci"
  | "eff"
  | "unknown";

export function detectSourcePrefix(sourceId: string): SourcePrefix {
  const id = sourceId.trim();
  if (id.startsWith("calc.")) return "calc";
  if (id.startsWith("atc.")) return "atc";
  if (id.startsWith("ind.")) return "ind";
  if (id.startsWith("g.")) return "g";
  if (id.startsWith("s.")) return "s";
  if (id.startsWith("p.")) return "p";
  if (id.startsWith("c.")) return "c";
  if (id.startsWith("m.")) return "m";
  if (id.startsWith("ci.")) return "ci";
  if (id.startsWith("eff.")) return "eff";
  return "unknown";
}

export function stripSourcePrefix(sourceId: string): string {
  const id = sourceId.trim();
  for (const prefix of SOURCE_PREFIXES) {
    if (id.startsWith(prefix)) {
      return id.slice(prefix.length);
    }
  }
  return id;
}

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * URL / table slug from a nabda_db id.
 * g.douleur-thoracique → douleur-thoracique
 * s.amoxicilline → amoxicilline
 * calc.glasgow-coma-scale-score-gcs → glasgow-coma-scale-score-gcs
 */
export function sourceIdToSlug(sourceId: string): string {
  return normalizeSlug(stripSourcePrefix(sourceId));
}

export function calculatorSlug(source: {
  id: string;
  slug?: string | null;
}): string {
  const explicit = source.slug?.trim();
  if (explicit) {
    return normalizeSlug(explicit);
  }
  return sourceIdToSlug(source.id);
}
