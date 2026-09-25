import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalculatorDetailPage } from "@/components/calculators/CalculatorDetailPage";
import { getCalculatorRenderData } from "@/lib/content-data/calculator-data";
import { summaryFromDbCalculator } from "@/lib/calculators/calculator-mappers";
import { resolveCalculatorSlug } from "@/lib/calculators/calculator-slugs";
import { resolveCalculatorRenderMode } from "@/lib/calculators/resolve-calculator-render-mode";
import { specialtyCalculatorUiKind } from "@/lib/calculators/specialty-calculator-ui";
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

type CalculatorDetailRouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    state?: string | string[];
  }>;
};

function findReadableCalculatorRow(
  rows: Awaited<ReturnType<typeof getCalculators>>,
  gatedSlug: string,
) {
  return rows.find(
    (item) =>
      item.slug === gatedSlug ||
      resolveCalculatorSlug(item.slug) === gatedSlug ||
      resolveCalculatorSlug(gatedSlug) === resolveCalculatorSlug(item.slug),
  );
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
  const rows = await getCalculators();
  const row = findReadableCalculatorRow(rows, normalized);
  const title = row?.title ?? row?.short_title ?? "Calculateur";

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

  const rows = await getCalculators();
  const row = findReadableCalculatorRow(rows, gatedSlug);
  if (!row) {
    redirect("/home");
  }

  const calculator = summaryFromDbCalculator(row);
  const source = await getCalculatorRenderData(gatedSlug, { linkMode: "public" });
  const mode = resolveCalculatorRenderMode(gatedSlug, source);

  if (mode === "missing") {
    redirect("/home");
  }

  const specialtyUi = specialtyCalculatorUiKind(gatedSlug);
  if (mode === "specialty" && !specialtyUi) {
    redirect("/home");
  }

  if (mode !== "specialty" && !source) {
    redirect("/home");
  }

  await recordContentView("calculator", calculator.slug);

  const initialBookmarked = await isFavorite("calculator", calculator.slug);

  return (
    <CalculatorDetailPage
      key={gatedSlug}
      slug={gatedSlug}
      calculator={calculator}
      source={source}
      mode={mode}
      specialtyUi={specialtyUi}
      initialBookmarked={initialBookmarked}
    />
  );
}
