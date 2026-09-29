import { Skeleton as ShadcnSkeleton } from "@/components/shadcn/skeleton";
import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <ShadcnSkeleton
      className={cn("motion-skeleton", className)}
      aria-hidden
    />
  );
}

type PageSkeletonVariant = "page" | "list" | "detail";

type PageSkeletonProps = {
  variant?: PageSkeletonVariant;
  label?: string;
  className?: string;
};

function ListRows({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-[var(--radius-card)] bg-surface-elevated p-4 shadow-[var(--shadow-card)]"
        >
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({
  variant = "page",
  label = "Chargement…",
  className,
}: PageSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("flex w-full min-w-0 flex-col gap-6 pt-2", className)}
    >
      <span className="sr-only">{label}</span>

      {variant === "page" ? (
        <>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="size-6 rounded-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-[var(--radius-control)]" />
          <div className="flex gap-2">
            <Skeleton className="h-11 w-20 rounded-full" />
            <Skeleton className="h-11 w-24 rounded-full" />
            <Skeleton className="h-11 w-16 rounded-full" />
            <Skeleton className="h-11 w-28 rounded-full" />
          </div>
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <section className="flex flex-col gap-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-48" />
              <div className="rounded-[var(--radius-card)] bg-surface-elevated p-4 shadow-[var(--shadow-card)]">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-3 h-3 w-1/2" />
              </div>
            </section>
            <section className="flex flex-col gap-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-40" />
              <ListRows count={2} />
            </section>
          </div>
        </>
      ) : null}

      {variant === "list" ? <ListRows count={5} /> : null}

      {variant === "detail" ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-7 w-56" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="mt-2 h-28 w-full rounded-[var(--radius-card)]" />
        </div>
      ) : null}
    </div>
  );
}
