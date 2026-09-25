import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
  normalizeDoctorContentSlug,
  requirePublishedDoctorContent,
} from "@/lib/authz/require-published-doctor-content";
import { viewerCanReadSlug } from "@/lib/authz/access";
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
  const normalized = normalizeDoctorContentSlug(canonicalSlug);
  if (!normalized || !(await viewerCanReadSlug("calculator", normalized))) {
    return {
      title: "Calculateur · Nabda",
      description: "Calculateur clinique Nabda.",
    };
  }
  const title = isGlasgowSlug(normalized)
    ? "Score de Glasgow"
    : isCockcroftSlug(normalized)
      ? "Cockcroft-Gault"
      : (await getCalculatorRenderData(normalized, { linkMode: "public" }))?.title ??
        "Calculateur";

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
  const gatedSlug = await requirePublishedDoctorContent("calculator", canonicalSlug);

  const isBuiltinEngine =
    isGlasgowSlug(gatedSlug) || isCockcroftSlug(gatedSlug);
  const source = isBuiltinEngine
    ? null
    : await getCalculatorRenderData(gatedSlug, { linkMode: "public" });

  if (!isBuiltinEngine && !source) {
    redirect("/home");
  }

  const mode = resolveMode(gatedSlug, source);
  if (mode === "missing") {
    redirect("/home");
  }

  const rows = await getCalculators();
  const row = rows.find(
    (item) =>
      item.slug === gatedSlug ||
      resolveCalculatorSlug(item.slug) === gatedSlug,
  );
  const calculator = row ? summaryFromDbCalculator(row) : undefined;

  if (!calculator && !isBuiltinEngine) {
    redirect("/home");
  }

  await recordContentView(
    "calculator",
    calculator?.slug ?? source?.slug ?? gatedSlug,
  );

  const initialBookmarked = await isFavorite(
    "calculator",
    calculator?.slug ?? source?.slug ?? gatedSlug,
  );

  return (
    <CalculatorDetailPage
      key={gatedSlug}
      slug={gatedSlug}
      calculator={calculator}
      source={source}
      mode={mode}
      initialBookmarked={initialBookmarked}
    />
  );
}
