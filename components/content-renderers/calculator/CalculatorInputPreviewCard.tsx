import { StatusChip } from "@/components/content-detail/StatusChip";
import type { CalculatorRenderInput } from "@/types/content-rendering-calculator";

type CalculatorInputPreviewCardProps = {
  input: CalculatorRenderInput;
};

function OptionPreview({ input }: { input: CalculatorRenderInput }) {
  if (input.options.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-col gap-1.5 opacity-60">
      {input.options.map((option) => (
        <li
          key={`${input.name}-${option.value}-${option.label}`}
          className="flex min-h-11 w-full items-center justify-between rounded-xl bg-surface-container-low px-3 text-left text-body-sm text-on-surface-variant"
        >
          <span>{option.label || option.value}</span>
          {option.value && option.value !== option.label ? (
            <span className="text-label-sm">{option.value}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function CalculatorInputPreviewCard({ input }: CalculatorInputPreviewCardProps) {
  const showNumeric = input.type === "number" || input.type === "unit_value";
  const showDate = input.type === "date";
  const showOptions =
    input.type === "radio" ||
    input.type === "toggle" ||
    input.type === "select" ||
    input.type === "multi_select" ||
    input.yesNo;
  const showUnknown = input.type === "unknown" || input.type === "computed" || input.type === "text";

  return (
    <article className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-body-md font-medium">{input.label}</h3>
        <StatusChip label="Aperçu" variant="outline" />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatusChip label={input.required ? "Requis" : "Optionnel"} variant="outline" />
        {input.unit ? <StatusChip label={input.unit} /> : null}
        {input.optionCount > 0 ? (
          <StatusChip label={`${input.optionCount} options`} />
        ) : null}
      </div>
      {showOptions ? <OptionPreview input={input} /> : null}
      {showNumeric ? (
        <div className="mt-2 flex flex-col gap-1 opacity-60">
          <span className="text-label-sm text-on-surface-variant">
            Valeur{input.unit ? ` (${input.unit})` : ""}
          </span>
          <div className="flex h-11 items-center rounded-xl bg-surface-container-low px-3 text-body-md text-on-surface-variant">
            Lecture seule
          </div>
        </div>
      ) : null}
      {showDate ? (
        <div className="mt-2 flex flex-col gap-1 opacity-60">
          <span className="text-label-sm text-on-surface-variant">Date</span>
          <div className="flex h-11 items-center rounded-xl bg-surface-container-low px-3 text-body-md text-on-surface-variant">
            Lecture seule
          </div>
        </div>
      ) : null}
      {showUnknown ? (
        <p className="mt-2 text-label-sm text-on-surface-variant">
          Champ source en lecture seule
        </p>
      ) : null}
    </article>
  );
}
