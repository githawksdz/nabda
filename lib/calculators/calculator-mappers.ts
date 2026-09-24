import type { Calculator as DbCalculator, Json } from "@/types/content";
import type {
  CalculatorDetailMode,
  CalculatorReviewStatus,
  CalculatorStatus,
  CalculatorSummary,
  CalculatorType,
  CalculatorVisibility,
} from "@/types/calculators";
import {
  isCockcroftSlug,
  isGlasgowSlug,
  resolveCalculatorSlug,
} from "@/lib/calculators/calculator-slugs";
import { parseCalculatorCategorySlug } from "@/lib/calculators/calculator-ui-config";
import { overlaySafeText } from "@/lib/content-source/readiness";

const CALCULATOR_ICONS: Record<string, string> = {
  glasgow: "brain",
  "cockcroft-gault": "droplets",
  "wells-ep": "wind",
  "curb-65": "wind",
  sofa: "activity",
  "sofa-qsofa": "activity",
  "cha2ds2-vasc": "heart-pulse",
  "chads-vasc": "heart-pulse",
  nihss: "brain",
  "score-puqe": "activity",
  puqe: "activity",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function mapCalculatorStatus(status: string): CalculatorStatus {
  if (status === "published") return "published";
  if (status === "validated") return "validated";
  if (status === "hidden") return "hidden";
  if (status === "draft") return "draft";
  if (status === "needs_validation") return "needs_validation";
  return "needs_validation";
}

export function mapCalculatorReviewStatus(
  status: string,
): CalculatorReviewStatus {
  if (status === "validated") return "validated";
  if (status === "needs_revision") return "needs_revision";
  if (status === "editorial_reviewed") return "editorial_reviewed";
  return "unreviewed";
}

export function mapCalculatorVisibility(
  visibility: string,
): CalculatorVisibility {
  if (visibility === "premium") return "premium";
  if (visibility === "preview_only") return "preview_only";
  if (visibility === "stub") return "stub";
  if (visibility === "hidden") return "stub";
  return "public_free";
}

export function formulaJsonHasLogic(formulaJson: Json | null | undefined): boolean {
  if (!isRecord(formulaJson)) {
    return false;
  }
  const inputs = formulaJson.inputs;
  const rules = formulaJson.rules;
  const inputCount = Array.isArray(inputs) ? inputs.length : 0;
  const ruleCount = Array.isArray(rules) ? rules.length : 0;
  return inputCount > 0 || ruleCount > 0;
}

export function inferCalculatorType(
  slug: string,
  fallback?: CalculatorType,
): CalculatorType {
  if (isCockcroftSlug(slug)) {
    return "formula";
  }
  if (isGlasgowSlug(slug) || resolveCalculatorSlug(slug) === "score-puqe") {
    return "score";
  }
  return fallback ?? "score";
}

function neverValidatePlaceholder(
  row: DbCalculator,
  reviewStatus: CalculatorReviewStatus,
): CalculatorReviewStatus {
  if (
    reviewStatus === "validated" &&
    (row.status === "draft" ||
      row.status === "seed_placeholder" ||
      row.status === "imported" ||
      row.status === "cleaned" ||
      row.visibility === "hidden" ||
      row.visibility === "stub" ||
      row.review_status === "editorial_placeholder")
  ) {
    return "unreviewed";
  }
  return reviewStatus;
}

export function summaryFromDbCalculator(row: DbCalculator): CalculatorSummary {
  const slug = resolveCalculatorSlug(row.slug);
  const category = parseCalculatorCategorySlug(row.category_slug);
  return {
    id: row.id,
    slug,
    name: row.title,
    shortName: row.short_title ?? undefined,
    type: inferCalculatorType(slug),
    categorySlugs: category ? [category] : [],
    categoryLabel: row.category_slug || "Score",
    description: overlaySafeText(
      row.description,
      row.usage_context,
      row.review_status,
      row.status,
    ) ?? "",
    status: mapCalculatorStatus(row.status),
    reviewStatus: neverValidatePlaceholder(
      row,
      mapCalculatorReviewStatus(row.review_status),
    ),
    visibility: mapCalculatorVisibility(row.visibility),
    href: `/calculators/${slug}`,
    iconName: CALCULATOR_ICONS[slug] ?? CALCULATOR_ICONS[row.slug] ?? "activity",
    searchTerms: [row.slug, row.title, row.short_title ?? "", row.description ?? ""],
    frequentlyUsed: row.is_featured,
  };
}

export function overlayDbCalculator(
  mock: CalculatorSummary | undefined,
  row: DbCalculator | null | undefined,
): CalculatorSummary | undefined {
  if (!mock && !row) {
    return undefined;
  }
  if (!row) {
    return mock;
  }
  const base = mock ?? summaryFromDbCalculator(row);
  return {
    ...base,
    id: row.id || base.id,
    name: row.title || base.name,
    shortName: row.short_title || base.shortName,
    categorySlugs:
      parseCalculatorCategorySlug(row.category_slug)
        ? [parseCalculatorCategorySlug(row.category_slug)!]
        : base.categorySlugs,
    categoryLabel: row.category_slug || base.categoryLabel,
    description:
      overlaySafeText(
        row.description,
        base.description,
        row.review_status,
        row.status,
      ) ?? base.description,
    status: mapCalculatorStatus(row.status),
    reviewStatus: neverValidatePlaceholder(
      row,
      mapCalculatorReviewStatus(row.review_status),
    ),
    visibility: mapCalculatorVisibility(row.visibility),
    frequentlyUsed: row.is_featured || base.frequentlyUsed,
  };
}

export function resolveCalculatorDetailMode(
  slug: string,
  calculator?: CalculatorSummary,
): CalculatorDetailMode {
  // Local demo engines. formula_json is ignored until a validated calculator
  // import ships with canRenderClinicalDetails === true.
  if (isGlasgowSlug(slug)) {
    return "glasgow";
  }
  if (isCockcroftSlug(slug)) {
    return "cockcroft";
  }
  return calculator ? "preparation" : "missing";
}

export function catalogFromDbCalculators(rows: DbCalculator[]): CalculatorSummary[] {
  return rows.map(summaryFromDbCalculator);
}

export function overlayCalculatorCatalog(
  mocks: CalculatorSummary[],
  rows: DbCalculator[],
): CalculatorSummary[] {
  const bySlug = new Map<string, DbCalculator>();
  for (const row of rows) {
    bySlug.set(resolveCalculatorSlug(row.slug), row);
    bySlug.set(row.slug, row);
  }

  const used = new Set<string>();
  const merged: CalculatorSummary[] = mocks.map((mock) => {
    const row = bySlug.get(mock.slug);
    if (row) {
      used.add(resolveCalculatorSlug(row.slug));
      used.add(row.slug);
    }
    return overlayDbCalculator(mock, row) ?? mock;
  });

  for (const row of rows) {
    const slug = resolveCalculatorSlug(row.slug);
    if (used.has(slug) || used.has(row.slug)) {
      continue;
    }
    const summary = overlayDbCalculator(undefined, row);
    if (summary) {
      merged.push(summary);
      used.add(slug);
    }
  }

  return merged;
}

export function pickCalculatorRow(
  rows: DbCalculator[] | null | undefined,
  lookupSlugs: string[],
): DbCalculator | null {
  if (!rows?.length) {
    return null;
  }
  for (const slug of lookupSlugs) {
    const match = rows.find((row) => row.slug === slug);
    if (match) {
      return match;
    }
  }
  return rows[0] ?? null;
}
