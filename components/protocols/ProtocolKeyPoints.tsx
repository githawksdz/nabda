import type { ProtocolKeyPoint } from "@/types/content-detail";
import { KEY_POINTS_TITLE } from "@/lib/content-detail/content-detail-ui-config";
import { cn } from "@/lib/utils";

type ProtocolKeyPointsProps = {
  points: ProtocolKeyPoint[];
};

export function ProtocolKeyPoints({ points }: ProtocolKeyPointsProps) {
  if (points.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-3 text-headline-sm">{KEY_POINTS_TITLE}</h2>
      <div className="grid grid-cols-1 gap-2">
        {points.map((point, index) => (
          <article
            key={point.id}
            className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
          >
            <p
              className={cn(
                "text-on-surface",
                index === 0 ? "text-body-md font-medium" : "text-body-sm",
              )}
            >
              {point.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
