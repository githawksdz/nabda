import { CalculatorInputPreviewCard } from "@/components/content-renderers/calculator/CalculatorInputPreviewCard";
import type { CalculatorRenderInput } from "@/types/content-rendering-calculator";

type CalculatorInputSchemaPreviewProps = {
  inputs: CalculatorRenderInput[];
};

export function CalculatorInputSchemaPreview({ inputs }: CalculatorInputSchemaPreviewProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-body-md font-medium">Schéma d’entrées</h2>
      <p className="text-label-sm text-on-surface-variant">
        {inputs.length} champs · lecture seule, aucun calcul
      </p>
      {inputs.length === 0 ? (
        <p className="rounded-xl bg-surface-container-low p-3.5 text-body-sm text-on-surface-variant">
          Aucun champ d&apos;entrée dans le schéma source.
        </p>
      ) : (
        inputs.map((input, index) => (
          <CalculatorInputPreviewCard key={`${input.name || "input"}-${index}`} input={input} />
        ))
      )}
    </section>
  );
}
