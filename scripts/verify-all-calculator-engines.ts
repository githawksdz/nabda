/**
 * Verify calculator engine coverage + safety inventory.
 */
import fs from "node:fs";
import path from "node:path";
import {
  hasAnyCompiledEngine,
  listGeneratedEngineSlugs,
  listRegisteredSpecialtySlugs,
  loadCalculatorEngine,
} from "@/lib/calculators/engine-registry";

const ROOT = process.cwd();
const INV = path.join(ROOT, "data", "calculator-engine-inventory.json");
const VECTORS = path.join(ROOT, "data", "calculator-engine-test-vectors.json");
const OUT = path.join(ROOT, "data", "all-calculator-engines-report.json");
const GAPS = path.join(ROOT, "data", "calculator-engine-implementation-gaps.json");

async function main() {
  const inv = JSON.parse(fs.readFileSync(INV, "utf8")) as {
    calculators: Array<{
      slug: string;
      engine_status: string;
      formula_type: string;
      title: string;
      source_id: string;
    }>;
  };

  let additive = 0;
  let generated = 0;
  let specialty = 0;
  const gaps: Array<Record<string, unknown>> = [];
  const implemented: string[] = [];

  const generatedSet = new Set(listGeneratedEngineSlugs());
  const specialtySet = new Set(listRegisteredSpecialtySlugs());

  for (const c of inv.calculators) {
    if (c.engine_status === "generic_additive_ready") {
      additive += 1;
      implemented.push(c.slug);
      continue;
    }
    if (c.engine_status === "implemented" || specialtySet.has(c.slug)) {
      if (hasAnyCompiledEngine(c.slug)) {
        specialty += 1;
        implemented.push(c.slug);
        continue;
      }
    }
    if (generatedSet.has(c.slug)) {
      generated += 1;
      implemented.push(c.slug);
      continue;
    }
    if (hasAnyCompiledEngine(c.slug)) {
      specialty += 1;
      implemented.push(c.slug);
      continue;
    }
    gaps.push({
      slug: c.slug,
      sourceId: c.source_id,
      title: c.title,
      formula_type: c.formula_type,
      reason:
        c.engine_status === "pending_manual_engine"
          ? "No safe compiled engine (missing/unparsable source logic)"
          : `status=${c.engine_status}`,
    });
  }

  // Registry integrity: load a sample of generated engines
  let loadFailures = 0;
  for (const slug of [...generatedSet].slice(0, 15)) {
    const eng = await loadCalculatorEngine(slug);
    if (!eng) loadFailures += 1;
  }

  let vectorCount = 0;
  if (fs.existsSync(VECTORS)) {
    const v = JSON.parse(fs.readFileSync(VECTORS, "utf8")) as {
      count?: number;
    };
    vectorCount = v.count ?? 0;
  }

  const total = inv.calculators.length;
  const liveUnique = new Set(implemented).size;

  const report = {
    generated_at: new Date().toISOString(),
    total_calculators: total,
    additive_engine_coverage: additive,
    generated_engine_coverage: generatedSet.size,
    generated_matched_in_inventory: generated,
    specialty_matched_in_inventory: specialty,
    explicit_specialty_slugs: [...specialtySet],
    implemented_unique: liveUnique,
    missing_total: gaps.length,
    coverage_ratio: `${liveUnique}/${total}`,
    registry_sample_load_failures: loadFailures,
    test_vector_engine_count: vectorCount,
    ok: gaps.length < total && loadFailures === 0,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(
    GAPS,
    `${JSON.stringify({ generated_at: report.generated_at, count: gaps.length, gaps }, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
