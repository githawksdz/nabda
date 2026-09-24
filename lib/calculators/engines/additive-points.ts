import { add } from "@/lib/calculators/engine-primitives";
import {
  incompleteInput,
  invalidValue,
  validationFail,
  validationOk,
} from "@/lib/calculators/engine-errors";
import type {
  AdditivePointsInput,
  AdditivePointsOutput,
  CalculatorEngine,
  CalculatorValidationResult,
} from "@/lib/calculators/engine-types";

export const additivePointsEngine: CalculatorEngine<
  AdditivePointsInput,
  AdditivePointsOutput
> = {
  slug: "additive-points",
  version: "1.0.0",
  formulaType: "simple_score",

  validate(input): CalculatorValidationResult {
    if (!input.schema?.length) {
      return validationFail([
        { code: "missing_schema", message: "Schéma d'entrées manquant" },
      ]);
    }
    const issues = [];
    for (const field of input.schema) {
      if (field.optional) continue;
      const raw = input.selections?.[field.name];
      if (raw === null || raw === undefined) {
        issues.push({
          code: "required",
          field: field.name,
          message: `${field.label} requis`,
        });
        continue;
      }
      if (!field.options.some((opt) => opt.value === raw)) {
        issues.push({
          code: "invalid_option",
          field: field.name,
          message: `Valeur invalide pour ${field.label}`,
        });
      }
    }
    return issues.length ? validationFail(issues) : validationOk();
  },

  calculate(input) {
    const validation = this.validate(input);
    if (!validation.ok) {
      const fields = validation.issues
        .map((i) => i.field)
        .filter((f): f is string => Boolean(f));
      return incompleteInput(fields, validation.issues[0]?.message);
    }

    const breakdown: AdditivePointsOutput["breakdown"] = [];
    for (const field of input.schema) {
      const raw = input.selections[field.name];
      if (raw === null || raw === undefined) {
        if (field.optional) continue;
        return incompleteInput([field.name]);
      }
      if (!field.options.some((opt) => opt.value === raw)) {
        return invalidValue(field.name, `Valeur invalide pour ${field.label}`);
      }
      breakdown.push({ name: field.name, label: field.label, value: raw });
    }

    const total = add(...breakdown.map((b) => b.value));
    const max = add(
      ...input.schema.map((field) =>
        field.options.reduce((m, opt) => Math.max(m, opt.value), 0),
      ),
    );

    return {
      ok: true,
      output: { total, max, breakdown },
    };
  },
};

export function parseAdditiveSchemaFromPayload(
  inputSchema: unknown,
): AdditivePointsInput["schema"] {
  if (!Array.isArray(inputSchema)) return [];
  const allowed = new Set(["radio", "toggle", "select", "multi_select"]);
  const schema: AdditivePointsInput["schema"] = [];

  for (const raw of inputSchema) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const type = String(row.type ?? "");
    if (!allowed.has(type)) continue;
    const name = typeof row.name === "string" ? row.name : null;
    if (!name) continue;
    const optionsRaw = Array.isArray(row.options) ? row.options : [];
    const options = optionsRaw
      .map((opt) => {
        if (!opt || typeof opt !== "object") return null;
        const o = opt as Record<string, unknown>;
        const value = typeof o.value === "number" ? o.value : Number(o.value);
        if (!Number.isFinite(value)) return null;
        const label = typeof o.label === "string" ? o.label.trim() : "";
        if (!label) return null;
        return { label, value };
      })
      .filter((o): o is { label: string; value: number } => Boolean(o));
    if (!options.length) continue;
    schema.push({
      name,
      label: typeof row.label === "string" ? row.label : name,
      type: type as AdditivePointsInput["schema"][number]["type"],
      optional: Boolean(row.optional),
      options,
    });
  }
  return schema;
}
