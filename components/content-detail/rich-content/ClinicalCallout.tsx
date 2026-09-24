import { Info } from "lucide-react";

type ClinicalCalloutProps = {
  title?: string;
  body: string;
};

export function ClinicalCallout({
  title = "Point clinique",
  body,
}: ClinicalCalloutProps) {
  return (
    <aside className="rounded-xl bg-surface-container-low p-3.5">
      <p className="flex items-center gap-1.5 text-label-md">
        <Info className="size-4" strokeWidth={1.75} />
        {title}
      </p>
      <p className="mt-2 text-body-sm text-on-surface-variant">{body}</p>
    </aside>
  );
}
