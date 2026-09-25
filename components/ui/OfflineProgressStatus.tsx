import { Check } from "lucide-react";
import { Spinner } from "@/components/ui/LoadingIndicator";

type OfflineProgressStatusProps = {
  label: string;
};

const COMPLETE_LABEL = "Disponible hors-ligne";

export function OfflineProgressStatus({ label }: OfflineProgressStatusProps) {
  const match = label.match(/(\d+)\/(\d+)/);
  const done = match ? Number(match[1]) : undefined;
  const total = match ? Number(match[2]) : undefined;
  const determinate = done != null && total != null && total > 0;
  const complete = label === COMPLETE_LABEL;

  return (
    <div className="flex flex-col gap-2">
      <p role="status" className="inline-flex items-center gap-2 text-body-sm text-text-primary">
        {!determinate && !complete ? <Spinner className="size-4" /> : null}
        {complete ? <Check className="size-4 shrink-0" strokeWidth={1.75} aria-hidden /> : null}
        <span>{label}</span>
      </p>
      {determinate ? (
        <progress
          className="motion-progress"
          value={done}
          max={total}
          aria-label={label}
        />
      ) : null}
    </div>
  );
}
