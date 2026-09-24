"use client";

import { useEffect, useMemo, useState } from "react";
import { loadCalculatorEngine } from "@/lib/calculators/engine-registry";
import type { CalculatorRenderData } from "@/types/content-rendering";

type GeneratedFormulaCalculatorProps = {
  data: CalculatorRenderData;
};

/**
 * Generic numeric/formula UI for compiled specialty/generated engines.
 * Calculation is client-side only after the engine chunk loads.
 */
export function GeneratedFormulaCalculator({
  data,
}: GeneratedFormulaCalculatorProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(data.inputs.map((i) => [i.name, ""])),
  );
  const [engineError, setEngineError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [resultText, setResultText] = useState<string>("Saisie incomplète");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const engine = await loadCalculatorEngine(data.slug);
      if (cancelled) return;
      if (!engine) {
        setEngineError("Calculateur temporairement indisponible");
        setReady(false);
        return;
      }
      setReady(true);
      setEngineError(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [data.slug]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void (async () => {
      const engine = await loadCalculatorEngine(data.slug);
      if (!engine || cancelled) return;
      const input: Record<string, string | number | boolean | null> = {
        ...values,
      };
      // Map toggle/radio string values to numbers when possible
      for (const field of data.inputs) {
        const raw = values[field.name];
        if (field.options.length && raw !== undefined && raw !== "") {
          const asNum = Number(raw);
          input[field.name] = Number.isFinite(asNum) ? asNum : raw;
        }
      }
      const result = engine.calculate(input);
      if (cancelled) return;
      if (!result.ok) {
        setResultText(result.error.message);
        return;
      }
      const out = result.output as {
        value?: unknown;
        label?: string;
        unit?: string;
        dueDate?: string;
        expectedPco2?: number;
        low?: number;
        high?: number;
        extras?: Array<{ label: string; value: unknown }>;
      };
      if (out.dueDate) {
        setResultText(`DPA ${out.dueDate}`);
        return;
      }
      if (typeof out.expectedPco2 === "number") {
        setResultText(
          `PCO₂ attendu ${out.expectedPco2} mmHg (intervalle ${out.low}–${out.high})`,
        );
        return;
      }
      const unit = out.unit ? ` ${out.unit}` : "";
      const label = out.label ? `${out.label}: ` : "";
      setResultText(`${label}${String(out.value)}${unit}`);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, values, data.slug, data.inputs]);

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

  return (
    <div className="flex flex-col gap-4">
      <header className="space-y-1">
        <p className="text-label-md text-on-surface-variant">Formule</p>
        <h2 className="text-headline-sm">{data.title}</h2>
        <p className="text-body-sm text-on-surface-variant">
          Calcul local · aucun script source exécuté
        </p>
      </header>

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

      <div className="rounded-xl bg-surface-container-low px-3.5 py-3">
        <p className="text-label-md text-on-surface-variant">Résultat</p>
        <p className="mt-1 text-body-md">{resultText}</p>
      </div>
    </div>
  );
}
