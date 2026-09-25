/**
 * Static checks for UI-4 search and index presentation.
 */
import fs from "node:fs";
import path from "node:path";
import {
  SEARCH_EMPTY_TITLE,
  SEARCH_ERROR_TITLE,
  SEARCH_LOADING_LABEL,
} from "@/lib/search/search-outcome";
import { SEARCH_FIELD_PLACEHOLDER } from "@/lib/ui/access-status-display";
import { SEARCH_FILTERS } from "@/lib/search/resolve-search";

const ROOT = process.cwd();

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const checks: { id: string; ok: boolean; detail: string }[] = [];

function check(id: string, ok: boolean, detail: string) {
  checks.push({ id, ok, detail });
}

const searchPage = read("components/search/SearchPage.tsx");
const zeroCanvas = read("components/search/ZeroResultCanvas.tsx");
const searchInput = read("components/search/SearchInputBar.tsx");
const filterChips = read("components/search/SearchFilterChips.tsx");
const resultCard = read("components/search/SearchResultCard.tsx");
const grouped = read("components/search/SearchGroupedResults.tsx");
const medicationCard = read("components/search/MedicationResultCard.tsx");
const userActions = read("lib/content-detail/user-content-actions.ts");
const constants = read("lib/search/search-ui-constants.ts");
const protocols = read("components/protocols/ProtocolsIndexPage.tsx");
const drugs = read("components/drugs/DrugsIndexPage.tsx");
const calculators = read("components/calculators/CalculatorsIndexPage.tsx");
const cat = read("components/cat/CatIndexPage.tsx");
const discoveryRow = read("components/discovery/DiscoveryListRow.tsx");

check(
  "search_placeholder",
  searchPage.includes("SEARCH_FIELD_PLACEHOLDER") &&
    SEARCH_FIELD_PLACEHOLDER === "DCI, marque, CAT, protocole, score…",
  "SearchPage placeholder",
);

check(
  "search_form_semantics",
  searchInput.includes('role="search"') && searchInput.includes("<form"),
  "SearchInputBar",
);

check(
  "search_loading_label",
  searchPage.includes("LoadingIndicator") &&
    searchPage.includes("SEARCH_LOADING_LABEL") &&
    SEARCH_LOADING_LABEL === "Recherche en cours…",
  "SearchPage loading",
);

check(
  "empty_copy",
  zeroCanvas.includes("SEARCH_EMPTY_TITLE") &&
    SEARCH_EMPTY_TITLE.startsWith("Ce contenu n") &&
  zeroCanvas.includes("SEARCH_EMPTY_HELP") ||
    zeroCanvas.includes("Essayez un autre terme"),
  "ZeroResultCanvas",
);

check(
  "error_copy_separate",
  searchPage.includes("SEARCH_ERROR_TITLE") &&
    SEARCH_ERROR_TITLE === "Impossible de charger les résultats." &&
    !zeroCanvas.includes("SEARCH_ERROR_TITLE") &&
    SEARCH_EMPTY_TITLE.includes("n’existe pas"),
  "empty vs error",
);

check(
  "supported_filters",
  JSON.stringify(SEARCH_FILTERS) ===
    JSON.stringify(["all", "cat", "protocols", "drugs", "calculators"]),
  "SEARCH_FILTERS",
);

check(
  "no_legacy_filter_labels",
  !constants.includes("Interactions") &&
    !constants.includes("Normes") &&
    constants.includes('"Scores"'),
  "search-ui-constants",
);

check(
  "filter_chip_row_fade",
  filterChips.includes("edgeFade"),
  "SearchFilterChips",
);

check(
  "discovery_result_row",
  resultCard.includes("DiscoveryListRow") &&
    read("components/search/search-type-display.tsx").includes(
      "searchResultTypeLabel",
    ),
  "SearchResultCard",
);

check(
  "no_ranking_label",
  !grouped.toLowerCase().includes("pertinence clinique") &&
    !searchPage.toLowerCase().includes("pertinence clinique") &&
    !read("components/search/SearchMedicationResults.tsx")
      .toLowerCase()
      .includes("pertinence clinique"),
  "doctor-facing search UI",
);

check(
  "no_fake_sort_menu",
  !grouped.includes("ChevronDown") &&
    !grouped.includes("ArrowUpDown") &&
    !grouped.toLowerCase().includes("trier"),
  "SearchGroupedResults",
);

check(
  "medication_favorite_wired",
  medicationCard.includes("toggleFavorite") &&
    medicationCard.includes("isFavorite") &&
    medicationCard.includes("user-content-actions") &&
    !medicationCard.includes("setSaved") &&
    (userActions.match(/export async function toggleFavorite/g) ?? []).length ===
      1,
  "MedicationResultCard uses existing server actions",
);

check(
  "medication_favorite_a11y",
  medicationCard.includes("aria-pressed") &&
    medicationCard.includes("aria-label") &&
    medicationCard.includes("Ajouter aux favoris") &&
    medicationCard.includes("Retirer des favoris") &&
    medicationCard.includes("disabled={pending") &&
    medicationCard.indexOf('type="button"') <
      medicationCard.indexOf("result.actions.map"),
  "bookmark button semantics",
);

check(
  "index_discovery_rows",
  protocols.includes("DiscoveryListRow") &&
    read("components/calculators/CalculatorListRow.tsx").includes(
      "DiscoveryListRow",
    ) &&
    read("components/drugs/DrugListRow.tsx").includes("DiscoveryListRow"),
  "index list rows",
);

check(
  "clinical_frame",
  protocols.includes('frame="clinical"') &&
    drugs.includes('frame="clinical"') &&
    calculators.includes('frame="clinical"') &&
    cat.includes('frame="clinical"'),
  "AppShell clinical frame",
);

check(
  "no_new_search_fetch",
  (searchPage.match(/\bsearchContent\(query/g) ?? []).length === 1,
  "single searchContent(query) call",
);

const legacyWording = [
  "Bientôt disponible",
  "En préparation",
  "Après relecture",
  "Révision médicale requise",
  "Me prévenir",
  "Suggérer",
];

for (const phrase of legacyWording) {
  check(
    `no_${phrase.replace(/\s+/g, "_")}_in_search_ui`,
    !zeroCanvas.includes(phrase) &&
      !grouped.includes(phrase) &&
      !resultCard.includes(phrase) &&
      !read("components/search/SearchZeroState.tsx").includes(phrase),
    phrase,
  );
}

check(
  "discovery_row_a11y_link",
  discoveryRow.includes("focus-visible:outline") &&
    discoveryRow.includes("<Link"),
  "DiscoveryListRow",
);

const failed = checks.filter((item) => !item.ok);
console.log(
  `search index ui ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length} checks)`,
);
for (const item of failed) {
  console.error(`- ${item.id}: ${item.detail}`);
}
if (failed.length > 0) {
  process.exitCode = 1;
}
