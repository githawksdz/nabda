/**
 * Static checks for the pre-UI correctness pass.
 * Search outcome, calculator result fields, and a single public h1 per shell.
 */
import fs from "node:fs";
import path from "node:path";
import { interpretGlasgow, GLASGOW_DEFAULT_SELECTION } from "@/lib/calculators/glasgow";
import { computeCockcroft } from "@/lib/calculators/cockcroft-gault";
import {
  SEARCH_EMPTY_HELP,
  SEARCH_EMPTY_TITLE,
  SEARCH_ERROR_HELP,
  SEARCH_ERROR_TITLE,
  SEARCH_LOADING_LABEL,
  resolveSearchOutcome,
} from "@/lib/search/search-outcome";
import type { SearchResult } from "@/types/search";
import { calculatorStatusLabel } from "@/lib/calculators/calculator-ui-config";
import { doctorPublicationLabel } from "@/lib/content-detail/doctor-facing-status";
import {
  drugDetailStatusLabel,
  drugIndexStatusLabel,
  drugSourceStatusLabel,
} from "@/lib/drugs/status-labels";
import { identityStatusLabel } from "@/lib/search/search-result-mappers";
import type { CalculatorSummary } from "@/types/calculators";
import type { IdentitySearchHit } from "@/types/search";

const ROOT = process.cwd();

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const checks: { id: string; ok: boolean; detail: string }[] = [];

function check(id: string, ok: boolean, detail: string) {
  checks.push({ id, ok, detail });
}

const sample = (title: string): SearchResult => ({
  id: title,
  type: "drug",
  slug: title,
  title,
  href: "/drugs/example",
});

const empty = resolveSearchOutcome({
  hasQuery: true,
  pending: false,
  failed: false,
  results: [],
});
check(
  "empty_search_message",
  empty.kind === "empty",
  SEARCH_EMPTY_TITLE,
);
check(
  "empty_help_kept",
  SEARCH_EMPTY_HELP.includes("Essayez un autre terme"),
  SEARCH_EMPTY_HELP,
);

const failed = resolveSearchOutcome({
  hasQuery: true,
  pending: false,
  failed: true,
  results: [],
});
check("failed_is_error", failed.kind === "error", SEARCH_ERROR_TITLE);
check(
  "failed_not_missing_copy",
  failed.kind === "error" && !SEARCH_ERROR_TITLE.includes("n’existe pas"),
  SEARCH_ERROR_HELP,
);

const loading = resolveSearchOutcome({
  hasQuery: true,
  pending: true,
  failed: true,
  results: [],
});
check(
  "loading_hides_both_messages",
  loading.kind === "loading" &&
    !SEARCH_LOADING_LABEL.includes("n’existe pas") &&
    !SEARCH_LOADING_LABEL.includes("Impossible de charger"),
  SEARCH_LOADING_LABEL,
);

const unknown = resolveSearchOutcome({
  hasQuery: true,
  pending: false,
  failed: false,
  results: [],
});
const unpublished = resolveSearchOutcome({
  hasQuery: true,
  pending: false,
  failed: false,
  results: [],
});
check(
  "unknown_and_unpublished_match",
  unknown.kind === "empty" && unpublished.kind === unknown.kind,
  "same public empty outcome",
);

const success = resolveSearchOutcome({
  hasQuery: true,
  pending: false,
  failed: false,
  results: [sample("Amoxicilline")],
});
check(
  "success_keeps_results",
  success.kind === "success" && success.kind === "success" && success.results.length === 1,
  success.kind,
);

const glasgow = interpretGlasgow(GLASGOW_DEFAULT_SELECTION);
const glasgowCard = read("components/calculators/glasgow/GlasgowResultCard.tsx");
check(
  "glasgow_complete_result",
  glasgow.fraction === "15/15" &&
    glasgow.formula === "E4 V5 M6" &&
    Boolean(glasgow.label && glasgow.note && glasgow.safety) &&
    glasgowCard.includes("interpretation.fraction") &&
    glasgowCard.includes("interpretation.formula") &&
    glasgowCard.includes("interpretation.label") &&
    glasgowCard.includes("interpretation.note") &&
    glasgowCard.includes("interpretation.safety") &&
    !glasgowCard.includes("line-clamp") &&
    !glasgowCard.includes("truncate"),
  `${glasgow.fraction} ${glasgow.formula} ${glasgow.label}`,
);

const cockcroft = computeCockcroft({
  age: "40",
  weight: "70",
  creatinine: "80",
  unit: "umol_l",
  sex: "male",
});
const cockcroftCard = read("components/calculators/cockcroft/CockcroftResultCard.tsx");
check(
  "cockcroft_result_displayed",
  cockcroft.display.length > 0 &&
    cockcroftCard.includes("result.display") &&
    !cockcroftCard.includes("line-clamp"),
  cockcroft.display,
);

const additive = read("components/calculators/AdditivePointsCalculator.tsx");
const formula = read("components/calculators/GeneratedFormulaCalculator.tsx");
check(
  "additive_and_formula_results",
  additive.includes("result.output.total") &&
    additive.includes("result.output.max") &&
    formula.includes("{resultText}") &&
    !formula.includes("resultText.slice") &&
    !formula.includes("fetch("),
  "complete local result text",
);

const glasgowUi = read("components/calculators/glasgow/GlasgowCalculator.tsx");
check(
  "glasgow_input_stays_local",
  !glasgowUi.includes("fetch(") && !glasgowUi.includes("searchContent"),
  "no request on input change",
);

const header = read("components/app/AppHeader.tsx");
const detail = read("components/content-detail/ClinicalDetailFrame.tsx");
check(
  "detail_shell_is_not_second_h1",
  header.includes("pageHeading") &&
    detail.includes("pageHeading={false}") &&
    read("components/calculators/CalculatorIdentity.tsx").includes("<h1"),
  "clinical title remains the h1",
);

check(
  "doctor_publication_label_has_no_preparation_fallback",
  !read("lib/content-detail/doctor-facing-status.ts").includes(
    "Contenu en préparation",
  ),
  "doctor-facing-status.ts",
);

check(
  "doctor_publication_label_published",
  doctorPublicationLabel("published") === "Publié",
  doctorPublicationLabel("published"),
);

check(
  "doctor_publication_label_neutral_fallback",
  doctorPublicationLabel("draft") === "Contenu indisponible" &&
    doctorPublicationLabel(null) === "Contenu indisponible" &&
    doctorPublicationLabel(undefined) === "Contenu indisponible" &&
    doctorPublicationLabel("") === "Contenu indisponible",
  "Contenu indisponible",
);

check(
  "doctor_publication_label_not_preparation",
  doctorPublicationLabel("hidden") !== "Contenu en préparation",
  doctorPublicationLabel("hidden"),
);

const publicationBoundary = read("scripts/verify-publication-boundary.ts");
check(
  "publication_boundary_script_unchanged",
  publicationBoundary.includes("verify-publication-boundary") &&
    read("lib/authz/require-published-doctor-content.ts").includes(
      "requirePublishedDoctorContent",
    ),
  "requirePublishedDoctorContent gate retained",
);

const publishedDrug = {
  status: "published" as const,
  reviewStatus: "validated" as const,
  visibility: "public_free" as const,
};
const proDrug = {
  status: "published" as const,
  reviewStatus: "validated" as const,
  visibility: "premium" as const,
};
const draftDrug = {
  status: "draft" as const,
  reviewStatus: "unreviewed" as const,
  visibility: "public_free" as const,
};

check(
  "drug_index_status_published",
  drugIndexStatusLabel(publishedDrug) === "Publié" &&
    drugIndexStatusLabel(proDrug) === "Pro",
  `${drugIndexStatusLabel(publishedDrug)} / ${drugIndexStatusLabel(proDrug)}`,
);
check(
  "drug_index_status_neutral_fallback",
  drugIndexStatusLabel(draftDrug) === "Contenu indisponible" &&
    drugIndexStatusLabel({
      status: "hidden",
      reviewStatus: "validated",
      visibility: "public_free",
    }) === "Contenu indisponible",
  "Contenu indisponible",
);
check(
  "drug_detail_status_matches_index",
  drugDetailStatusLabel(publishedDrug) === drugIndexStatusLabel(publishedDrug) &&
    drugDetailStatusLabel(draftDrug) === "Contenu indisponible",
  "detail/index parity",
);
check(
  "drug_source_status_neutral",
  drugSourceStatusLabel("validated") === "Source documentée" &&
    drugSourceStatusLabel("to_verify") === "Contenu indisponible",
  drugSourceStatusLabel("to_verify"),
);

const calculatorBase = (): CalculatorSummary => ({
  id: "calc-test",
  slug: "calc-test",
  name: "Test",
  type: "score",
  categorySlugs: [],
  categoryLabel: "Test",
  description: "",
  status: "published",
  reviewStatus: "validated",
  visibility: "public_free",
  href: "/calculators/calc-test",
  iconName: "calculator",
  searchTerms: [],
});

check(
  "calculator_status_published",
  calculatorStatusLabel(calculatorBase()) === "Publié" &&
    calculatorStatusLabel({ ...calculatorBase(), visibility: "premium" }) === "Pro",
  calculatorStatusLabel(calculatorBase()),
);
check(
  "calculator_status_neutral_fallback",
  calculatorStatusLabel({ ...calculatorBase(), status: "draft" }) ===
    "Contenu indisponible" &&
    calculatorStatusLabel({ ...calculatorBase(), visibility: "preview_only" }) ===
      "Contenu indisponible" &&
    calculatorStatusLabel({ ...calculatorBase(), status: "hidden" }) ===
      "Contenu indisponible",
  "Contenu indisponible",
);

function publicHelperBody(file: string, fnName: string): string {
  const src = read(file);
  const marker = `export function ${fnName}`;
  const start = src.indexOf(marker);
  if (start < 0) {
    return "";
  }
  const rest = src.slice(start);
  const nextExport = rest.indexOf("\nexport ", marker.length);
  return nextExport < 0 ? rest : rest.slice(0, nextExport);
}

for (const fn of [
  "drugIndexStatusLabel",
  "drugDetailStatusLabel",
  "drugSourceStatusLabel",
] as const) {
  const body = publicHelperBody("lib/drugs/status-labels.ts", fn);
  check(
    `drug_${fn}_no_preparation_wording`,
    !body.includes("Contenu en préparation") && !body.includes("En préparation"),
    fn,
  );
}

const calculatorStatusBody = publicHelperBody(
  "lib/calculators/calculator-ui-config.ts",
  "calculatorStatusLabel",
);
check(
  "calculator_status_label_no_preparation_wording",
  !calculatorStatusBody.includes("Contenu en préparation") &&
    !calculatorStatusBody.includes("En préparation"),
  "calculatorStatusLabel",
);

check(
  "map_raw_drug_status_label_internal_retained",
  read("lib/drugs/status-labels.ts").includes(
    "export function mapRawDrugStatusLabel",
  ),
  "import/internal mapper unchanged",
);

const searchHit = (overrides: Partial<IdentitySearchHit> = {}): IdentitySearchHit => ({
  type: "drug",
  slug: "example",
  title: "Example",
  status: "published",
  reviewStatus: "validated",
  visibility: "public_free",
  ...overrides,
});

check(
  "identity_search_status_published",
  identityStatusLabel(searchHit()) === "Publié" &&
    identityStatusLabel(searchHit({ visibility: "premium" })) === "Pro",
  "Publié / Pro",
);
check(
  "identity_search_status_neutral_fallback",
  identityStatusLabel(searchHit({ status: "draft" })) === "Contenu indisponible" &&
    identityStatusLabel(searchHit({ status: "published", clinicalPayloadStatus: "locked" })) ===
      "Contenu indisponible",
  "Contenu indisponible",
);

const identityStatusBody = publicHelperBody(
  "lib/search/search-result-mappers.ts",
  "identityStatusLabel",
);
check(
  "identity_status_label_no_preparation_wording",
  !identityStatusBody.includes("En préparation") &&
    !identityStatusBody.includes("Contenu en préparation"),
  "identityStatusLabel",
);

const forbidden = [
  "Contenu en préparation",
  "Bientôt disponible",
  "Ce contenu sera disponible prochainement",
  "Section en préparation",
  "Fiche en préparation",
  "Après relecture",
  "Révision médicale requise",
  "Sources à consolider",
  "Me prévenir",
  "Suggérer ce contenu",
];
const publicDirs = ["app", "components"];
const hits: string[] = [];
for (const dir of publicDirs) {
  const walk = (current: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "internal") continue;
        walk(full);
      } else if (/\.(tsx|ts)$/.test(entry.name)) {
        const text = fs.readFileSync(full, "utf8");
        for (const phrase of forbidden) {
          if (text.includes(phrase)) {
            hits.push(`${path.relative(ROOT, full)}: ${phrase}`);
          }
        }
      }
    }
  };
  walk(path.join(ROOT, dir));
}
check("no_public_preparation_copy", hits.length === 0, hits.join("; ") || "clean");

const zero = read("components/search/ZeroResultCanvas.tsx");
const searchPage = read("components/search/SearchPage.tsx");
check(
  "ui_uses_separate_search_states",
  zero.includes("SEARCH_EMPTY_TITLE") &&
    searchPage.includes("SEARCH_ERROR_TITLE") &&
    searchPage.includes("SEARCH_LOADING_LABEL") &&
    searchPage.includes('visibleScreen === "error"'),
  "empty, error, and loading are separate",
);

const failedChecks = checks.filter((item) => !item.ok);
console.log(
  `pre-ui corrections ${failedChecks.length === 0 ? "PASS" : "FAIL"} (${checks.length} checks)`,
);
for (const item of failedChecks) {
  console.error(`- ${item.id}: ${item.detail}`);
}
if (failedChecks.length > 0) {
  process.exitCode = 1;
}
