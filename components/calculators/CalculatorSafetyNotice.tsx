import { ShieldCheck } from "lucide-react";
import {
  CALCULATOR_PROFESSIONAL_NOTICE,
  CALCULATOR_SAFETY_NOTE,
} from "@/lib/calculators/calculator-ui-config";

type CalculatorSafetyNoticeProps = {
  variant?: "banner" | "professional";
};

export function CalculatorSafetyNotice({
  variant = "banner",
}: CalculatorSafetyNoticeProps) {
  if (variant === "professional") {
    return (
      <p className="text-center text-label-sm text-on-surface-variant">
        {CALCULATOR_PROFESSIONAL_NOTICE}
      </p>
    );
  }

  return (
    <p className="flex items-start gap-2 rounded-xl bg-surface-container-low px-3 py-2.5 text-label-sm text-on-surface-variant">
      <ShieldCheck
        className="mt-0.5 size-3.5 shrink-0 text-on-surface"
        strokeWidth={1.75}
      />
      <span>{CALCULATOR_SAFETY_NOTE}</span>
    </p>
  );
}
