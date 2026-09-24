/**
 * Generate data/calculator-engine-inventory.json from analysis candidates + local engines.
 * Does not write to the database.
 *
 * Usage: npx tsx scripts/generate-calculator-engine-inventory.ts
 */
import fs from "node:fs";
import path from "node:path";

type Candidate = {
  sourceId: string;
  slug: string;
  titleFrCandidate?: string | null;
  titleEn?: string | null;
  kind: string;
  formulaType: string;
  risk: string;
  inputCount: number;
  inputTypes: string[];
  hasUnits: boolean;
  shouldStayLocked: boolean;
  alreadyHasLocalDemoEngine: boolean;
  hasRawJs: boolean;
  canBecomeTapScoreCandidate: boolean;
  canBecomeNumericFormulaCandidate: boolean;
  inputSchemaPreview?: unknown;
  formulaHtmlPreview?: string;
};

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "data", "calculator-analysis-candidates.json");
const OUTPUT = path.join(ROOT, "data", "calculator-engine-inventory.json");

const IMPLEMENTED: Record<
  string,
  { engine_file: string; engine_slug: string; version: string }
> = {
  "glasgow-coma-scale-score-gcs": {
    engine_file: "lib/calculators/engines/glasgow-coma-scale-score-gcs.ts",
    engine_slug: "glasgow-coma-scale-score-gcs",
    version: "1.0.0",
  },
  glasgow: {
    engine_file: "lib/calculators/engines/glasgow-coma-scale-score-gcs.ts",
    engine_slug: "glasgow-coma-scale-score-gcs",
    version: "1.0.0",
  },
  "creatinine-clearance-cockcroft-gault-equation": {
    engine_file:
      "lib/calculators/engines/creatinine-clearance-cockcroft-gault-equation.ts",
    engine_slug: "creatinine-clearance-cockcroft-gault-equation",
    version: "1.0.0",
  },
  "cockcroft-gault": {
    engine_file:
      "lib/calculators/engines/creatinine-clearance-cockcroft-gault-equation.ts",
    engine_slug: "creatinine-clearance-cockcroft-gault-equation",
    version: "1.0.0",
  },
};

function mapFormulaBucket(kind: string, formulaType: string): string {
  if (kind === "dosing_or_high_risk" || formulaType === "dosing_formula") {
    return "dosing_or_high_risk";
  }
  if (kind === "date_calculator" || formulaType === "date_arithmetic") {
    return "date_calculator";
  }
  if (kind === "rule_based" || formulaType === "algorithmic_branching") {
    return "rule_based_calculator";
  }
  if (kind === "diagnostic_criteria") return "diagnostic_criteria";
  if (kind === "simple_score") return "simple_score";
  if (kind === "formula_calculator") return "formula_calculator";
  if (
    formulaType === "unknown" ||
    formulaType === "free_text_only" ||
    kind === "mixed" ||
    kind === "unknown"
  ) {
    return "unsupported_or_ambiguous";
  }
  return kind || "unsupported_or_ambiguous";
}

function requiredInputsFromPreview(preview: unknown): string[] {
  if (!Array.isArray(preview)) return [];
  return preview
    .map((item) =>
      item && typeof item === "object" && "name" in item
        ? String((item as { name: unknown }).name)
        : null,
    )
    .filter((name): name is string => Boolean(name));
}

function engineStatusFor(c: Candidate): {
  engine_status: string;
  engine_file: string | null;
  test_vector_status: string;
} {
  const impl = IMPLEMENTED[c.slug];
  if (impl || c.alreadyHasLocalDemoEngine) {
    return {
      engine_status: "implemented",
      engine_file: impl?.engine_file ?? null,
      test_vector_status: "present",
    };
  }

  const bucket = mapFormulaBucket(c.kind, c.formulaType);
  // Additive radio/toggle scores can use the shared typed primitive engine.
  if (
    c.formulaType === "additive_points" &&
    (c.canBecomeTapScoreCandidate ||
      c.inputTypes.every((t) =>
        ["radio", "toggle", "select", "multi_select"].includes(t),
      ))
  ) {
    return {
      engine_status: "generic_additive_ready",
      engine_file: "lib/calculators/engines/additive-points.ts",
      test_vector_status: "pending",
    };
  }

  if (bucket === "unsupported_or_ambiguous") {
    return {
      engine_status: "needs_manual",
      engine_file: null,
      test_vector_status: "missing",
    };
  }

  return {
    engine_status: "pending_manual_engine",
    engine_file: null,
    test_vector_status: "missing",
  };
}

function main() {
  const raw = JSON.parse(fs.readFileSync(INPUT, "utf8")) as {
    generated_at?: string;
    calculators: Candidate[];
  };

  const entries = raw.calculators.map((c) => {
    const status = engineStatusFor(c);
    const impl = IMPLEMENTED[c.slug];
    return {
      slug: c.slug,
      source_id: c.sourceId,
      title: c.titleFrCandidate || c.titleEn || c.slug,
      input_schema: c.inputSchemaPreview ?? null,
      formula_type: mapFormulaBucket(c.kind, c.formulaType),
      source_kind: c.kind,
      source_formula_type: c.formulaType,
      required_inputs: requiredInputsFromPreview(c.inputSchemaPreview),
      units: c.hasUnits,
      output_schema: { type: "calculator_result", fields: ["value", "label"] },
      source_formula_reference: c.formulaHtmlPreview
        ? String(c.formulaHtmlPreview).slice(0, 240)
        : null,
      risk: c.risk,
      engine_status: status.engine_status,
      engine_slug: impl?.engine_slug ?? c.slug,
      engine_version: impl?.version ?? "0.0.0",
      engine_file: status.engine_file,
      test_vector_status: status.test_vector_status,
      has_raw_js: c.hasRawJs,
    };
  });

  const byStatus: Record<string, number> = {};
  const byFormula: Record<string, number> = {};
  for (const e of entries) {
    byStatus[e.engine_status] = (byStatus[e.engine_status] || 0) + 1;
    byFormula[e.formula_type] = (byFormula[e.formula_type] || 0) + 1;
  }

  const report = {
    generated_at: new Date().toISOString(),
    source_analysis_generated_at: raw.generated_at ?? null,
    total: entries.length,
    by_engine_status: byStatus,
    by_formula_type: byFormula,
    notes: [
      "Inventory only — no database writes.",
      "Raw equation_logic_text is never executed.",
      "generic_additive_ready uses typed additive-points engine + content input_schema option values.",
      "pending_manual_engine requires an explicit TypeScript engine (no eval).",
    ],
    calculators: entries,
  };

  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(
    `OK inventory ${entries.length} → ${path.relative(ROOT, OUTPUT)}`,
  );
  console.log(JSON.stringify({ byStatus, byFormula }, null, 2));
}

main();
