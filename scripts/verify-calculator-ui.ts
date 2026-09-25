/**
 * Static checks for UI-6 calculator presentation controls.
 */
import fs from "node:fs";
import path from "node:path";
import { resolveCalculatorControl, isYesNoProposition } from "@/lib/calculators/input-control";

const ROOT = process.cwd();

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const checks: { id: string; ok: boolean; detail: string }[] = [];

function check(id: string, ok: boolean, detail: string) {
  checks.push({ id, ok, detail });
}

const generated = read("components/calculators/GeneratedFormulaCalculator.tsx");
const additive = read("components/calculators/AdditivePointsCalculator.tsx");
const glasgow = read("components/calculators/glasgow/GlasgowOptionGroup.tsx");
const glasgowResult = read("components/calculators/glasgow/GlasgowResultCard.tsx");
const cockcroft = read("components/calculators/cockcroft/CockcroftInputForm.tsx");
const detail = read("components/calculators/CalculatorDetailPage.tsx");
const engine = read("lib/calculators/engines/additive-points.ts");

check(
  "yes_no_not_switch",
  resolveCalculatorControl({
    type: "toggle",
    yesNo: true,
    options: [
      { label: "Oui", value: "1" },
      { label: "Non", value: "0" },
    ],
  }) === "yes_no" &&
    isYesNoProposition({
      type: "toggle",
      options: [
        { label: "Oui", value: "1" },
        { label: "Non", value: "0" },
      ],
    }),
  "oui/non",
);

check(
  "numeric_control",
  resolveCalculatorControl({ type: "number", options: [] }) === "number" &&
    resolveCalculatorControl({ type: "unit_value", options: [] }) === "number",
  "number",
);

check(
  "date_control",
  resolveCalculatorControl({ type: "date", options: [] }) === "date",
  "date",
);

check(
  "small_set_segmented",
  resolveCalculatorControl({
    type: "radio",
    options: [
      { label: "A", value: "1" },
      { label: "B", value: "2" },
      { label: "C", value: "3" },
    ],
  }) === "segmented",
  "radio",
);

check(
  "large_set_select",
  resolveCalculatorControl({
    type: "select",
    options: Array.from({ length: 6 }, (_, index) => ({
      label: `Option ${index}`,
      value: String(index),
    })),
  }) === "select",
  "select",
);

check(
  "generic_uses_field_control",
  generated.includes("CalculatorFieldControl") &&
    additive.includes("CalculatorFieldControl") &&
    generated.includes("whitespace-pre-wrap") &&
    additive.includes("result.output.total") &&
    additive.includes("result.output.max"),
  "shared renderer",
);

check(
  "no_network_on_input",
  !generated.includes("fetch(") && !additive.includes("fetch("),
  "local calculate",
);

check(
  "glasgow_result_visible",
  glasgow.includes('role="radiogroup"') &&
    glasgowResult.includes("Score total"),
  "Glasgow",
);

check(
  "cockcroft_units",
  cockcroft.includes("Âge") &&
    cockcroft.includes("kg") &&
    cockcroft.includes("µmol/L"),
  "Cockcroft",
);

check(
  "favorite_and_reset",
  detail.includes("toggleFavorite") &&
    detail.includes("Réinit.") &&
    generated.includes("Réinitialiser") &&
    additive.includes("Réinitialiser"),
  "actions",
);

check(
  "engine_file_untouched_marker",
  engine.includes("export const additivePointsEngine"),
  "additive engine still present",
);

const failed = checks.filter((item) => !item.ok);
console.log(
  `calculator ui ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length} checks)`,
);
for (const item of failed) {
  console.error(`- ${item.id}: ${item.detail}`);
}
if (failed.length > 0) {
  process.exitCode = 1;
}
