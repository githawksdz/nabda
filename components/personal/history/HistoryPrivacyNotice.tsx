import { Shield } from "lucide-react";
import { HISTORY_COPY } from "@/lib/personal/personal-ui-config";

export function HistoryPrivacyNotice() {
  return (
    <section className="flex items-start gap-3 rounded-xl bg-surface-container-low px-3.5 py-3">
      <Shield
        className="mt-0.5 size-4 shrink-0 text-on-surface-variant"
        strokeWidth={1.75}
      />
      <p className="text-body-sm text-on-surface-variant">
        {HISTORY_COPY.privacyNote}
      </p>
    </section>
  );
}
