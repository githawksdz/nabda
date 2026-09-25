import { hasAnyCompiledEngine, hasSpecialtyEngine } from "@/lib/calculators/engine-registry";
import { parseAdditiveSchemaFromPayload } from "@/lib/calculators/engines/additive-points";
import { resolveCalculatorSlug } from "@/lib/calculators/calculator-slugs";
import { specialtyCalculatorUiKind } from "@/lib/calculators/specialty-calculator-ui";
import type { CalculatorRenderData } from "@/types/content-rendering";
import type { CalculatorDetailMode } from "@/types/calculators";

function additiveSchemaUsable(source: CalculatorRenderData): boolean {
  const schema = parseAdditiveSchemaFromPayload(
    source.inputs.map((input) => ({
      name: input.name,
      label: input.label,
      type: input.type,
      optional: input.optional,
      options: input.options.map((o) => ({
        label: o.label,
        value: Number(o.value),
      })),
    })),
  );
  return schema.length > 0;
}

/**
 * Public calculator render mode after DB gate + optional source payload.
 * Returns `missing` when the calculator must not render (route should redirect).
 */
export function resolveCalculatorRenderMode(
  slug: string,
  source: CalculatorRenderData | null,
): CalculatorDetailMode {
  const resolved = resolveCalculatorSlug(slug);

  if (specialtyCalculatorUiKind(resolved)) {
    return hasSpecialtyEngine(resolved) ? "specialty" : "missing";
  }

  if (!source) {
    return "missing";
  }

  if (source.formulaType === "additive_points" && source.inputs.length > 0) {
    return additiveSchemaUsable(source) ? "additive" : "missing";
  }

  if (hasAnyCompiledEngine(resolved)) {
    return "formula";
  }

  if (source.inputs.length > 0 || source.references.length > 0) {
    return "source";
  }

  return "missing";
}
