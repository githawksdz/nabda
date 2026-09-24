import { cn } from "@/lib/utils";
import type { CockcroftResult } from "@/types/calculators";

const MARKERS = [
  { label: "<15", at: 15 },
  { label: "30", at: 30 },
  { label: "60", at: 60 },
  { label: "90+", at: 90 },
] as const;

const METER_MAX = 120;

type CockcroftSpectrumMeterProps = {
  result: CockcroftResult;
};

export function CockcroftSpectrumMeter({
  result,
}: CockcroftSpectrumMeterProps) {
  const position =
    result.clcr == null
      ? null
      : Math.min(100, Math.max(0, (result.clcr / METER_MAX) * 100));

  return (
    <div className="mt-4">
      <div className="relative h-2 overflow-hidden rounded-full bg-surface-container-high">
        <div className="flex h-full">
          <span className="flex-[15] bg-surface-container-highest" />
          <span className="flex-[15] bg-surface-container-high" />
          <span className="flex-[30] bg-surface-container" />
          <span className="flex-[30] bg-surface-container-low" />
          <span className="flex-[30] bg-surface-container-lowest" />
        </div>
        {position != null ? (
          <span
            aria-hidden
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-sm"
            style={{ left: `${position}%` }}
          />
        ) : null}
      </div>
      <div className="relative mt-1.5 h-4">
        {MARKERS.map((marker) => (
          <span
            key={marker.label}
            className={cn(
              "absolute -translate-x-1/2 text-label-sm text-on-surface-variant",
              marker.at === 15 && "-translate-x-0",
              marker.at === 90 && "-translate-x-full",
            )}
            style={{ left: `${(marker.at / METER_MAX) * 100}%` }}
          >
            {marker.label}
          </span>
        ))}
      </div>
    </div>
  );
}
