"use client";

import { useMemo, useState } from "react";
import { CalculatorFieldControl } from "./CalculatorFieldControl";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";
import {
  additivePointsEngine,
  parseAdditiveSchemaFromPayload,
} from "@/lib/calculators/engines/additive-points";
import { measureSync } from "@/lib/calculators/calculator-perf";
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
    return measureSync(data.slug, () =>
      additivePointsEngine.calculate({ selections, schema }),
    );
  }, [selections, schema, data.slug]);

  if (!schema.length) {
    return (
      <p className="rounded-xl bg-surface-container-low px-3.5 py-3 text-body-sm text-on-surface-variant">
        Schéma d&apos;entrées insuffisant pour le moteur additif. Aucun JavaScript
        source n&apos;est exécuté.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      <header className="space-y-1 lg:col-span-2">
        <p className="text-label-md text-on-surface-variant">Score additif</p>
        <h2 className="text-headline-sm">{data.title}</h2>
        <p className="text-body-sm text-on-surface-variant">
          Moteur typé · aucun script source exécuté
        </p>
      </header>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={() =>
              setSelections(Object.fromEntries(schema.map((field) => [field.name, null])))
            }
          >
            Réinitialiser
          </Button>
        </div>
      {schema.map((field) => (
        <CalculatorFieldControl
          key={field.name}
          name={field.name}
          label={field.label}
          type={field.type}
          options={field.options.map((option) => ({
            label: option.label,
            value: String(option.value),
          }))}
          value={
            selections[field.name] == null ? "" : String(selections[field.name])
          }
          onChange={(next) =>
            setSelections((prev) => ({
              ...prev,
              [field.name]: next === "" ? null : Number(next),
            }))
          }
        />
      ))}
      </div>

      <Surface
        variant="muted"
        className="lg:sticky lg:top-[calc(var(--layout-header-height)+env(safe-area-inset-top,0px))]"
      >
        {result.ok ? (
          <>
            <p className="text-label-md text-text-secondary">Résultat</p>
            <p className="mt-1 text-headline-sm text-text-primary">
              {result.output.total}
              <span className="text-body-md text-text-secondary">
                {" "}
                / {result.output.max}
              </span>
            </p>
          </>
        ) : (
          <p className="text-body-sm text-text-secondary">{result.error.message}</p>
        )}
      </Surface>
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
