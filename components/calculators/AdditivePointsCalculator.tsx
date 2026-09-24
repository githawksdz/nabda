"use client";

import { useMemo, useState } from "react";
import {
  additivePointsEngine,
  parseAdditiveSchemaFromPayload,
} from "@/lib/calculators/engines/additive-points";
import type { CalculatorRenderData } from "@/types/content-rendering";

type AdditivePointsCalculatorProps = {
  data: CalculatorRenderData;
};

/**
 * Generic additive-points UI. Uses typed engine + option values from content schema.
 * Never executes imported source scripts.
 */
export function AdditivePointsCalculator({ data }: AdditivePointsCalculatorProps) {
  const schema = useMemo(() => {
    // Rebuild from render inputs (string values → numbers).
    return data.inputs
      .filter((input) =>
        ["radio", "toggle", "select", "multi_select"].includes(input.type),
      )
      .map((input) => ({
        name: input.name,
        label: input.label,
        type: input.type as "radio" | "toggle" | "select" | "multi_select",
        optional: input.optional,
        options: input.options
          .map((opt) => {
            const value = Number(opt.value);
            if (!Number.isFinite(value)) return null;
            return { label: opt.label, value };
          })
          .filter((o): o is { label: string; value: number } => Boolean(o)),
      }))
      .filter((field) => field.options.length > 0);
  }, [data.inputs]);

  const [selections, setSelections] = useState<Record<string, number | null>>(
    () => Object.fromEntries(schema.map((f) => [f.name, null])),
  );

  const result = useMemo(() => {
    return additivePointsEngine.calculate({ selections, schema });
  }, [selections, schema]);

  if (!schema.length) {
    return (
      <p className="rounded-xl bg-surface-container-low px-3.5 py-3 text-body-sm text-on-surface-variant">
        Schéma d&apos;entrées insuffisant pour le moteur additif. Aucun JavaScript
        source n&apos;est exécuté.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="space-y-1">
        <p className="text-label-md text-on-surface-variant">Score additif</p>
        <h2 className="text-headline-sm">{data.title}</h2>
        <p className="text-body-sm text-on-surface-variant">
          Moteur typé · aucun script source exécuté
        </p>
      </header>

      {schema.map((field) => (
        <fieldset key={field.name} className="space-y-2">
          <legend className="text-body-md font-medium">{field.label}</legend>
          <div className="flex flex-col gap-1.5">
            {field.options.map((opt) => {
              const selected = selections[field.name] === opt.value;
              return (
                <button
                  key={`${field.name}-${opt.value}-${opt.label}`}
                  type="button"
                  onClick={() =>
                    setSelections((prev) => ({ ...prev, [field.name]: opt.value }))
                  }
                  className={`rounded-xl px-3.5 py-2.5 text-left text-body-sm transition ${
                    selected
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="rounded-xl bg-surface-container-low px-3.5 py-3">
        {result.ok ? (
          <>
            <p className="text-label-md text-on-surface-variant">Résultat</p>
            <p className="mt-1 text-headline-sm">
              {result.output.total}
              <span className="text-body-md text-on-surface-variant">
                {" "}
                / {result.output.max}
              </span>
            </p>
          </>
        ) : (
          <p className="text-body-sm text-on-surface-variant">
            {result.error.message}
          </p>
        )}
      </div>
    </div>
  );
}

/** True when content can run on the shared additive engine. */
export function canUseAdditiveEngine(data: CalculatorRenderData): boolean {
  if (data.formulaType !== "additive_points") return false;
  const schema = parseAdditiveSchemaFromPayload(
    data.inputs.map((input) => ({
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
