import type { Metadata } from "next";
import { ContentUnavailable } from "@/components/app/ContentUnavailable";
import { CalculatorDetailPage } from "@/components/calculators/CalculatorDetailPage";
import { getCalculatorRenderData } from "@/lib/content-data/calculator-data";
import { summaryFromDbCalculator } from "@/lib/calculators/calculator-mappers";
import {
  isCockcroftSlug,
  isGlasgowSlug,
  resolveCalculatorSlug,
} from "@/lib/calculators/calculator-slugs";
import { hasAnyCompiledEngine } from "@/lib/calculators/engine-registry";
import { parseAdditiveSchemaFromPayload } from "@/lib/calculators/engines/additive-points";
import { getCalculators } from "@/features/content/api";
import {
  isFavorite,
  recordContentView,
} from "@/lib/content-detail/user-content-actions";
import type { CalculatorDetailMode } from "@/types/calculators";

type CalculatorDetailRouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    state?: string | string[];
  }>;
};

function additiveSchemaUsable(
  source: NonNullable<Awaited<ReturnType<typeof getCalculatorRenderData>>>,
): boolean {
  const schema = parseAdditiveSchemaFromPayload(
    source.inputs.map((input) => ({
      name: input.name,
      label: input.label,
      type: input.type,
      optional: input.optional,
      options: input.options.map((o) => ({
        label: o.label,
        value: Number(o.value),
      })),
    })),
  );
  return schema.length > 0;
}

function resolveMode(
  slug: string,
  source: Awaited<ReturnType<typeof getCalculatorRenderData>>,
): CalculatorDetailMode {
  if (isGlasgowSlug(slug)) return "glasgow";
  if (isCockcroftSlug(slug)) return "cockcroft";
  if (source?.formulaType === "additive_points" && source.inputs?.length) {
    return additiveSchemaUsable(source) ? "additive" : "unavailable";
  }
  if (source && hasAnyCompiledEngine(slug)) return "formula";
  if (source) return "unavailable";
  return "missing";
}

export async function generateMetadata({
  params,
}: CalculatorDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = resolveCalculatorSlug(slug);
  const source =
    isGlasgowSlug(canonicalSlug) || isCockcroftSlug(canonicalSlug)
      ? null
      : await getCalculatorRenderData(canonicalSlug, { linkMode: "public" });
  const title = isGlasgowSlug(canonicalSlug)
    ? "Score de Glasgow"
    : isCockcroftSlug(canonicalSlug)
      ? "Cockcroft-Gault"
      : (source?.title ?? "Calculateur");

  return {
    title: `${title} · Nabda`,
    description: "Calculateur clinique Nabda.",
  };
}

export default async function CalculatorDetailRoute({
  params,
  searchParams,
}: CalculatorDetailRouteProps) {
  const { slug } = await params;
  await searchParams;
  const canonicalSlug = resolveCalculatorSlug(slug);
  const isDemoEngine =
    isGlasgowSlug(canonicalSlug) || isCockcroftSlug(canonicalSlug);
  const source = isDemoEngine
    ? null
    : await getCalculatorRenderData(canonicalSlug, { linkMode: "public" });
  const mode = resolveMode(canonicalSlug, source);

  if (!isDemoEngine && !source) {
    return <ContentUnavailable kind="calculator" />;
  }

  const rows = await getCalculators();
  const row = rows.find(
    (item) =>
      item.slug === canonicalSlug ||
      resolveCalculatorSlug(item.slug) === canonicalSlug,
  );
  const calculator = row ? summaryFromDbCalculator(row) : undefined;

  await recordContentView(
    "calculator",
    calculator?.slug ?? source?.slug ?? canonicalSlug,
  );

  const initialBookmarked = await isFavorite(
    "calculator",
    calculator?.slug ?? source?.slug ?? canonicalSlug,
  );

  return (
    <CalculatorDetailPage
      key={canonicalSlug}
      slug={canonicalSlug}
      calculator={calculator}
      source={source}
      mode={mode}
      initialBookmarked={initialBookmarked}
    />
  );
}
