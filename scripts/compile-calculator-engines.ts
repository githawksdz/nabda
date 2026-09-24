/**
 * Compile specialty calculator engines from nabda_db equation_logic_text.
 * Build-time only — never executes source JS.
 *
 * Usage:
 *   npx tsx scripts/compile-calculator-engines.ts --dry-run
 *   npx tsx scripts/compile-calculator-engines.ts
 */
import fs from "node:fs";
import path from "node:path";
import {
  codegenEngineModule,
  parseEquationLogicToProgram,
  stableEngineHash,
  validateFormulaProgram,
} from "@/lib/calculators/compiler";

const ROOT = process.cwd();
const PLAN = path.join(ROOT, "data", "calculator-specialty-engine-plan.json");
const CALCS = path.join(ROOT, "nabda_db", "calcs");
const OUT_DIR = path.join(ROOT, "lib", "calculators", "generated-engines");
const REPORT = path.join(ROOT, "data", "calculator-engine-compile-report.json");

type PlanEntry = {
  sourceId: string;
  slug: string;
  title: string;
  category: string;
  implementationStrategy: string;
  hasEquationLogicText?: boolean;
};

function loadCalc(sourceId: string): {
  equation_logic_text?: string | null;
  input_schema?: Array<{ name?: string }>;
} | null {
  const file = path.join(CALCS, `${sourceId}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function compileAll(options: { dryRun: boolean; writeFiles: boolean }) {
  const plan = JSON.parse(fs.readFileSync(PLAN, "utf8")) as {
    calculators: PlanEntry[];
  };

  const candidates = plan.calculators.filter((c) => {
    if (["generated_ast", "generated_rules"].includes(c.implementationStrategy)) {
      return true;
    }
    // Also attempt dosing/explicit entries that have equation_logic_text
    if (
      c.hasEquationLogicText &&
      ["explicit_typescript", "dosing_formula"].includes(c.implementationStrategy)
    ) {
      return true;
    }
    if (c.hasEquationLogicText && c.category === "dosing_formula") {
      return true;
    }
    return false;
  });

  const generated: Array<Record<string, unknown>> = [];
  const failed: Array<Record<string, unknown>> = [];

  for (const entry of candidates) {
    const calc = loadCalc(entry.sourceId);
    const eq = String(calc?.equation_logic_text ?? "").trim();
    if (!eq) {
      failed.push({
        slug: entry.slug,
        sourceId: entry.sourceId,
        reason: "missing_equation_logic_text",
      });
      continue;
    }
    const inputNames = (calc?.input_schema ?? [])
      .map((i) => i.name)
      .filter((n): n is string => Boolean(n));

    const parsed = parseEquationLogicToProgram({
      sourceId: entry.sourceId,
      slug: entry.slug,
      equationLogicText: eq,
      inputNames,
      version: "1.0.0",
    });

    if (!parsed.ok) {
      failed.push({
        slug: entry.slug,
        sourceId: entry.sourceId,
        reason: parsed.reason,
        detail: parsed.detail,
      });
      continue;
    }

    const errors = validateFormulaProgram(parsed.program);
    if (errors.length) {
      failed.push({
        slug: entry.slug,
        sourceId: entry.sourceId,
        reason: "validation_failed",
        detail: errors.join("; "),
      });
      continue;
    }

    const { relativePath, source, folder } = codegenEngineModule(
      parsed.program,
      entry.category,
    );
    const hash = stableEngineHash(source);
    const versioned = source.replace(
      /version: "1\.0\.0"/,
      `version: "1.0.0-${hash.slice(0, 6)}"`,
    );

    if (options.writeFiles) {
      const abs = path.join(OUT_DIR, relativePath);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, versioned, "utf8");
    }

    generated.push({
      slug: entry.slug,
      sourceId: entry.sourceId,
      category: entry.category,
      folder,
      relativePath,
      hash,
      inputs: parsed.program.inputs,
      outputCount: parsed.program.outputs.length,
    });
  }

  return { candidates: candidates.length, generated, failed, dryRun: options.dryRun };
}

function writeManifest(
  generated: Array<{ slug: string; relativePath: string; hash: string }>,
) {
  const lines = [
    "/** GENERATED engine manifest — dynamic import map. */",
    "export const GENERATED_ENGINE_MANIFEST = {",
    ...generated.map(
      (g) =>
        `  ${JSON.stringify(g.slug)}: {\n    path: ${JSON.stringify(g.relativePath)},\n    hash: ${JSON.stringify(g.hash)},\n    loader: () => import(${JSON.stringify(`./${g.relativePath.replace(/\.ts$/, "")}`)}),\n  },`,
    ),
    "} as const;",
    "",
    "export type GeneratedEngineSlug = keyof typeof GENERATED_ENGINE_MANIFEST;",
    "",
  ];
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "manifest.ts"), lines.join("\n"), "utf8");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run") || process.argv[1]?.includes("dry-run");
  const result = compileAll({ dryRun, writeFiles: !dryRun });

  if (!dryRun) {
    writeManifest(
      result.generated.map((g) => ({
        slug: String(g.slug),
        relativePath: String(g.relativePath),
        hash: String(g.hash),
      })),
    );
  }

  const report = {
    generated_at: new Date().toISOString(),
    dry_run: dryRun,
    candidates: result.candidates,
    generated_count: result.generated.length,
    failed_count: result.failed.length,
    generated: result.generated,
    failed: result.failed,
  };
  fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `${dryRun ? "DRY-RUN" : "OK"} compile candidates=${result.candidates} generated=${result.generated.length} failed=${result.failed.length}`,
  );
  if (result.failed.length && result.failed.length <= 20) {
    console.log(JSON.stringify(result.failed, null, 2));
  } else if (result.failed.length) {
    console.log("failed sample", JSON.stringify(result.failed.slice(0, 10), null, 2));
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
