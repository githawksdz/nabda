import { ShieldAlert } from "lucide-react";
import {
  DRUG_PRUDENCE_FOOTER,
  DRUG_SAFETY_BANNER_TITLE,
  DRUG_SAFETY_NOTE,
} from "@/lib/drugs/drug-ui-config";

type DrugSafetyNoticeProps = {
  variant?: "banner" | "prudence";
};

export function DrugSafetyNotice({
  variant = "banner",
}: DrugSafetyNoticeProps) {
  if (variant === "prudence") {
    return (
      <p className="text-center text-label-sm text-on-surface-variant">
        {DRUG_PRUDENCE_FOOTER}
      </p>
    );
  }

  return (
    <section className="rounded-xl bg-surface-container-low px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-label-md text-on-surface">
        <ShieldAlert
          className="size-4 shrink-0"
          strokeWidth={1.75}
        />
        {DRUG_SAFETY_BANNER_TITLE}
      </p>
      <p className="mt-1.5 text-body-sm text-on-surface-variant">
        {DRUG_SAFETY_NOTE}
      </p>
    </section>
  );
}
