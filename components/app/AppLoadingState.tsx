import { PageSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export function AppLoadingState({
  label = "Chargement…",
  fill = "viewport",
}: {
  label?: string;
  fill?: "viewport" | "content";
}) {
  if (fill === "content") {
    return <PageSkeleton label={label} />;
  }

  return (
    <div className="min-h-dvh bg-canvas text-text-primary">
      <div
        className="h-[calc(var(--layout-header-height)+env(safe-area-inset-top,0px))] bg-surface/85 pt-safe shadow-[var(--shadow-subtle)]"
        aria-hidden
      />
      <div
        className={cn(
          "layout-gutter layout-workspace mx-auto w-full pb-[calc(var(--layout-nav-clearance)+env(safe-area-inset-bottom,0px))]",
        )}
      >
        <PageSkeleton label={label} />
      </div>
    </div>
  );
}
