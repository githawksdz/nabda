import { cn } from "@/lib/utils";

type SlideProgressProps = {
  total: number;
  activeIndex: number;
  onChange: (index: number) => void;
};

export function SlideProgress({
  total,
  activeIndex,
  onChange,
}: SlideProgressProps) {
  return (
    <div
      role="tablist"
      aria-label="Progression des diapositives"
      className="flex items-center justify-center gap-2"
    >
      {Array.from({ length: total }, (_, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-label={`Diapositive ${index + 1}`}
            aria-selected={isActive}
            aria-current={isActive ? "step" : undefined}
            onClick={() => onChange(index)}
            className={cn(
              "h-1.5 rounded-full transition-[width,background-color] duration-200 ease-out",
              isActive
                ? "w-6 bg-primary"
                : "w-1.5 bg-surface-variant",
            )}
          />
        );
      })}
    </div>
  );
}
