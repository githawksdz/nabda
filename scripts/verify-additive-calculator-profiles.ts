/**
 * Verify all additive calculator profiles against shared additive engine compatibility.
 * Output: data/additive-calculator-profile-verification.json
 */
import fs from "node:fs";
import path from "node:path";
import {
  additivePointsEngine,
  parseAdditiveSchemaFromPayload,
} from "@/lib/calculators/engines/additive-points";

const ROOT = process.cwd();
const INV = path.join(ROOT, "data", "calculator-engine-inventory.json");
const CALCS = path.join(ROOT, "nabda_db", "calcs");
const OUT = path.join(ROOT, "data", "additive-calculator-profile-verification.json");

type Issue = { slug: string; sourceId: string; reason: string };

function loadCalc(sourceId: string): {
  input_schema?: unknown[];
  slug?: string;
} | null {
  const file = path.join(CALCS, `${sourceId}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function main() {
  const inv = JSON.parse(fs.readFileSync(INV, "utf8")) as {
    calculators: Array<{
      slug: string;
      source_id: string;
      engine_status: string;
    }>;
  };

  const additive = inv.calculators.filter(
    (c) => c.engine_status === "generic_additive_ready",
  );

  const malformed: Issue[] = [];
  const okSlugs: string[] = [];
  let minScoresChecked = 0;

  for (const row of additive) {
    const calc = loadCalc(row.source_id);
    if (!calc?.input_schema?.length) {
      malformed.push({
        slug: row.slug,
        sourceId: row.source_id,
        reason: "no_inputs",
      });
      continue;
    }

    const schema = parseAdditiveSchemaFromPayload(calc.input_schema);
    if (!schema.length) {
      malformed.push({
        slug: row.slug,
        sourceId: row.source_id,
        reason: "no_numeric_option_inputs",
      });
      continue;
    }

    for (const field of schema) {
      if (!field.label?.trim()) {
        malformed.push({
          slug: row.slug,
          sourceId: row.source_id,
          reason: `missing_label:${field.name}`,
        });
      }
      const values = field.options.map((o) => o.value);
      if (values.some((v) => !Number.isFinite(v))) {
        malformed.push({
          slug: row.slug,
          sourceId: row.source_id,
          reason: `non_finite_option:${field.name}`,
        });
      }
      const labels = field.options.map((o) => o.label);
      if (labels.some((l) => !String(l).trim())) {
        malformed.push({
          slug: row.slug,
          sourceId: row.source_id,
          reason: `empty_option_label:${field.name}`,
        });
      }
    }

    if (malformed.some((m) => m.slug === row.slug)) continue;

    const selections = Object.fromEntries(
      schema.map((f) => [f.name, f.options[0]!.value]),
    );
    const requiredFields = schema.filter((f) => !f.optional);
    if (requiredFields.length) {
      const incomplete = additivePointsEngine.calculate({
        schema,
        selections: Object.fromEntries(schema.map((f) => [f.name, null])),
      });
      if (incomplete.ok) {
        malformed.push({
          slug: row.slug,
          sourceId: row.source_id,
          reason: "incomplete_should_fail",
        });
        continue;
      }
    }

    const result = additivePointsEngine.calculate({ schema, selections });
    if (!result.ok) {
      malformed.push({
        slug: row.slug,
        sourceId: row.source_id,
        reason: `calc_failed:${result.error.code}`,
      });
      continue;
    }

    const maxSel = Object.fromEntries(
      schema.map((f) => [
        f.name,
        f.options.reduce((m, o) => Math.max(m, o.value), -Infinity),
      ]),
    );
    const maxResult = additivePointsEngine.calculate({
      schema,
      selections: maxSel,
    });
    if (!maxResult.ok || !Number.isFinite(maxResult.output.total)) {
      malformed.push({
        slug: row.slug,
        sourceId: row.source_id,
        reason: "max_score_failed",
      });
      continue;
    }

    minScoresChecked += 1;
    okSlugs.push(row.slug);
  }

  // Shared engine unit-style checks
  const sharedTests = [
    {
      id: "positive_points",
      ok: (() => {
        const r = additivePointsEngine.calculate({
          schema: [
            {
              name: "a",
              label: "A",
              type: "toggle",
              options: [
                { label: "0", value: 0 },
                { label: "2", value: 2 },
              ],
            },
          ],
          selections: { a: 2 },
        });
        return r.ok && r.output.total === 2;
      })(),
    },
    {
      id: "zero_points",
      ok: (() => {
        const r = additivePointsEngine.calculate({
          schema: [
            {
              name: "a",
              label: "A",
              type: "toggle",
              options: [
                { label: "0", value: 0 },
                { label: "1", value: 1 },
              ],
            },
          ],
          selections: { a: 0 },
        });
        return r.ok && r.output.total === 0;
      })(),
    },
    {
      id: "negative_points",
      ok: (() => {
        const r = additivePointsEngine.calculate({
          schema: [
            {
              name: "a",
              label: "A",
              type: "toggle",
              options: [
                { label: "-1", value: -1 },
                { label: "0", value: 0 },
              ],
            },
          ],
          selections: { a: -1 },
        });
        return r.ok && r.output.total === -1;
      })(),
    },
    {
      id: "incomplete",
      ok: !additivePointsEngine.calculate({
        schema: [
          {
            name: "a",
            label: "A",
            type: "toggle",
            options: [
              { label: "0", value: 0 },
              { label: "1", value: 1 },
            ],
          },
        ],
        selections: { a: null },
      }).ok,
    },
    {
      id: "invalid_option",
      ok: !additivePointsEngine.calculate({
        schema: [
          {
            name: "a",
            label: "A",
            type: "toggle",
            options: [
              { label: "0", value: 0 },
              { label: "1", value: 1 },
            ],
          },
        ],
        selections: { a: 99 },
      }).ok,
    },
  ];

  const uniqueMalformed = [
    ...new Map(malformed.map((m) => [`${m.slug}:${m.reason}`, m])).values(),
  ];

  const report = {
    generated_at: new Date().toISOString(),
    total_additive_inventory: additive.length,
    ok_count: okSlugs.length,
    malformed_count: uniqueMalformed.length,
    malformed: uniqueMalformed,
    shared_engine_tests: sharedTests,
    shared_tests_ok: sharedTests.every((t) => t.ok),
    min_max_checked: minScoresChecked,
    ok: sharedTests.every((t) => t.ok) && uniqueMalformed.length < 50,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `OK additive verify total=${additive.length} ok=${okSlugs.length} malformed=${uniqueMalformed.length}`,
  );
  if (!report.ok) process.exitCode = 1;
}

main();
