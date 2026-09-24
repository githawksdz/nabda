import { AlertTriangle } from "lucide-react";

type WarningCalloutProps = {
  title?: string;
  body: string;
};

export function WarningCallout({
  title = "Vigilance",
  body,
}: WarningCalloutProps) {
  return (
    <aside className="rounded-xl bg-error-container/70 p-3.5">
      <p className="flex items-center gap-1.5 text-label-md text-error">
        <AlertTriangle className="size-4" strokeWidth={1.75} />
        {title}
      </p>
      <p className="mt-2 text-body-sm text-on-surface">{body}</p>
    </aside>
  );
}
