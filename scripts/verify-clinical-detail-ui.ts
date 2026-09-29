/**
 * Static checks for clinical detail presentation (protocol, drug, calculator).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const checks: { id: string; ok: boolean; detail: string }[] = [];

function check(id: string, ok: boolean, detail: string) {
  checks.push({ id, ok, detail });
}

const frame = read("components/content-detail/ClinicalDetailFrame.tsx");
const dock = read("components/content-detail/BottomReadingDock.tsx");
const protocol = read("components/protocols/ProtocolDetailPage.tsx");
const drug = read("components/drugs/DrugDetailPage.tsx");
const calculator = read("components/calculators/CalculatorDetailPage.tsx");
const library = read("components/content-detail/DetailLibraryStatus.tsx");
const sectionNav = read("components/content-detail/SectionNav.tsx");

check(
  "clinical_frame",
  frame.includes("READING_DOCK_CONTENT_CLASS") &&
    !frame.includes("showBottomNav") &&
    !frame.includes("@/components/app/AppShell") &&
    read("lib/navigation/doctor-route-state.ts").includes('prefix: "/protocols/"') &&
    read("lib/navigation/doctor-route-state.ts").includes('frame: "clinical"'),
  "ClinicalDetailFrame",
);

check(
  "one_dock_clearance_owner",
  frame.includes("READING_DOCK_CONTENT_CLASS") &&
    dock.includes("export const READING_DOCK_CONTENT_CLASS"),
  "dock reserve",
);

for (const [name, src] of [
  ["protocol", protocol],
  ["drug", drug],
] as const) {
  check(
    `${name}_uses_frame`,
    src.includes("ClinicalDetailFrame"),
    name,
  );
  check(
    `${name}_favorite_action`,
    src.includes("toggleFavorite"),
    name,
  );
  const h1 = (src.match(/<h1/g) ?? []).length;
  check(`${name}_page_h1_not_duplicated_in_page`, h1 <= 1, `${name} h1 count ${h1}`);
}

check(
  "protocol_section_param",
  sectionNav.includes("section:") && sectionNav.includes("aria-current"),
  "SectionNav",
);

check(
  "drug_tab_param",
  read("components/drugs/DrugTabs.tsx").includes("drugDetailHref") &&
    read("components/drugs/DrugTabs.tsx").includes("aria-current"),
  "DrugTabs",
);

check(
  "protocol_has_no_cat_route",
  !protocol.includes('href: "/cat') && !protocol.includes("`/cat/"),
  "ProtocolDetailPage",
);

check(
  "library_existing_download",
  library.includes("contentRepository.downloadItem") &&
    library.includes("contentRepository.downloadPack") &&
    library.includes("Disponible hors-ligne") &&
    library.includes("Pro requis"),
  "DetailLibraryStatus",
);

check(
  "no_editorial_dock_meta",
    !protocol.includes("Source préservée") &&
    !drug.includes("Source préservée"),
  "detail pages",
);

check(
  "drug_reading_column",
  drug.includes("layout-reading"),
  "DrugDetailPage",
);

check(
  "calculator_detail_untouched_favorite",
  calculator.includes("toggleFavorite") &&
    calculator.includes("ClinicalDetailFrame"),
  "CalculatorDetailPage still uses existing frame",
);

check(
  "no_service_role_in_detail",
  !frame.includes("service_role") &&
    !protocol.includes("service_role") &&
    !drug.includes("service_role"),
  "public detail components",
);

const failed = checks.filter((item) => !item.ok);
console.log(
  `clinical detail ui ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length} checks)`,
);
for (const item of failed) {
  console.error(`- ${item.id}: ${item.detail}`);
}
if (failed.length > 0) {
  process.exitCode = 1;
}
