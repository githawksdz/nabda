"use client";

import { useEffect, useMemo, useState } from "react";
import { loadCalculatorEngine } from "@/lib/calculators/engine-registry";
import { measureSync } from "@/lib/calculators/calculator-perf";
import type { CalculatorEngine } from "@/lib/calculators/engine-types";
import type { CalculatorRenderData } from "@/types/content-rendering";

type GeneratedFormulaCalculatorProps = {
  data: CalculatorRenderData;
};

/**
 * Generic numeric/formula UI for compiled specialty/generated engines.
 * After the engine chunk loads, calculation is synchronous and local.
 */
export function GeneratedFormulaCalculator({
  data,
}: GeneratedFormulaCalculatorProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(data.inputs.map((i) => [i.name, ""])),
  );
  const [engineError, setEngineError] = useState<string | null>(null);
  const [engine, setEngine] = useState<CalculatorEngine<unknown, unknown> | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const loaded = await loadCalculatorEngine(data.slug);
      if (cancelled) return;
      if (!loaded) {
        setEngineError("Calculateur temporairement indisponible");
        setEngine(null);
        return;
      }
      setEngine(loaded);
      setEngineError(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [data.slug]);

  const resultText = useMemo(() => {
    if (!engine) return "Saisie incomplète";
    const input: Record<string, string | number | boolean | null> = { ...values };
    for (const field of data.inputs) {
      const raw = values[field.name];
      if (field.options.length && raw !== undefined && raw !== "") {
        const asNum = Number(raw);
        input[field.name] = Number.isFinite(asNum) ? asNum : raw;
      }
    }
    const result = measureSync(data.slug, () => engine.calculate(input));
    if (!result.ok) {
      return result.error.message;
    }
    const out = result.output as {
      value?: unknown;
      label?: string;
      unit?: string;
      dueDate?: string;
      expectedPco2?: number;
      low?: number;
      high?: number;
    };
    if (out.dueDate) {
      return `DPA ${out.dueDate}`;
    }
    if (typeof out.expectedPco2 === "number") {
      return `PCO₂ attendu ${out.expectedPco2} mmHg (intervalle ${out.low}–${out.high})`;
    }
    const unit = out.unit ? ` ${out.unit}` : "";
    const label = out.label ? `${out.label}: ` : "";
    return `${label}${String(out.value)}${unit}`;
  }, [engine, values, data.slug, data.inputs]);

  const fields = useMemo(() => data.inputs, [data.inputs]);

  if (engineError) {
    return (
      <aside
        role="status"
        className="rounded-xl bg-surface-container-low px-3.5 py-3 text-on-surface"
      >
        <p className="text-label-md">{engineError}</p>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Aucun résultat fictif. Réessayez plus tard.
        </p>
      </aside>
    );
  }

  if (!engine) {
    return (
      <p className="rounded-xl bg-surface-container-low px-3.5 py-3 text-body-sm text-on-surface-variant">
        Chargement du moteur de calcul…
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      <header className="space-y-1 lg:col-span-2">
        <p className="text-label-md text-on-surface-variant">Formule</p>
        <h2 className="text-headline-sm">{data.title}</h2>
        <p className="text-body-sm text-on-surface-variant">
          Calcul local · aucun appel réseau
        </p>
      </header>

      <div className="flex min-w-0 flex-col gap-4">
      {fields.map((field) => (
        <label key={field.name} className="flex flex-col gap-1.5">
          <span className="text-body-md font-medium">
            {field.label}
            {field.unit ? ` (${field.unit})` : ""}
          </span>
          {field.options.length ? (
            <div className="flex flex-col gap-1.5">
              {field.options.map((opt) => {
                const selected = values[field.name] === opt.value;
                return (
                  <button
                    key={`${field.name}-${opt.value}`}
                    type="button"
                    onClick={() =>
                      setValues((prev) => ({ ...prev, [field.name]: opt.value }))
                    }
                    className={`rounded-xl px-3.5 py-2.5 text-left text-body-sm ${
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
          ) : field.type === "date" ? (
            <input
              type="date"
              value={values[field.name] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
              }
              className="rounded-xl bg-surface-container-low px-3.5 py-2.5 text-body-sm"
            />
          ) : (
            <input
              type="text"
              inputMode="decimal"
              value={values[field.name] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
              }
              className="rounded-xl bg-surface-container-low px-3.5 py-2.5 text-body-sm"
              placeholder="Valeur"
            />
          )}
        </label>
      ))}
      </div>

      <div className="rounded-xl bg-surface-container-low px-3.5 py-3 lg:sticky lg:top-[calc(72px+env(safe-area-inset-top,0px))]">
        <p className="text-label-md text-on-surface-variant">Résultat</p>
        <p className="mt-1 text-body-md">{resultText}</p>
      </div>
    </div>
  );
}
