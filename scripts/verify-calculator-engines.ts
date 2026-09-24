/**
 * Smoke-check typed calculator engines (no vitest dependency).
 * Usage: npx tsx scripts/verify-calculator-engines.ts
 */
import { additivePointsEngine } from "@/lib/calculators/engines/additive-points";
import { glasgowComaScaleEngine } from "@/lib/calculators/engines/glasgow-coma-scale-score-gcs";
import { cockcroftGaultEngine } from "@/lib/calculators/engines/creatinine-clearance-cockcroft-gault-equation";
import { hasSpecialtyEngine, loadCalculatorEngine } from "@/lib/calculators/engine-registry";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const add = additivePointsEngine.calculate({
    schema: [
      {
        name: "a",
        label: "A",
        type: "toggle",
        options: [
          { label: "No", value: 0 },
          { label: "Yes", value: 1 },
        ],
      },
    ],
    selections: { a: 1 },
  });
  assert(add.ok && add.output.total === 1, "additive sum failed");

  const incomplete = additivePointsEngine.calculate({
    schema: [
      {
        name: "a",
        label: "A",
        type: "toggle",
        options: [
          { label: "No", value: 0 },
          { label: "Yes", value: 1 },
        ],
      },
    ],
    selections: { a: null },
  });
  assert(!incomplete.ok, "additive should reject incomplete");

  const gcs = glasgowComaScaleEngine.calculate({
    eyes: 4,
    verbal: 5,
    motor: 6,
  });
  assert(gcs.ok, "gcs failed");

  const cg = cockcroftGaultEngine.calculate({
    sex: null,
    age: "",
    weight: "",
    creatinine: "",
    unit: "umol_l",
  });
  assert(!cg.ok, "cockcroft should be incomplete");

  assert(hasSpecialtyEngine("glasgow"), "registry glasgow");
  const loaded = await loadCalculatorEngine("cockcroft-gault");
  assert(loaded?.slug.includes("cockcroft") || loaded?.slug.includes("creatinine"), "load cockcroft");

  console.log("OK calculator engines smoke checks");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
