import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
};

/** Shared indeterminate mark. Mount only while work is pending. */
export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      className={cn(
        "motion-spin inline-block size-5 shrink-0 rounded-full border-2 border-current border-t-transparent",
        className,
      )}
      aria-hidden
    />
  );
}

type LoadingIndicatorProps = {
  label?: string;
  className?: string;
};

export function LoadingIndicator({
  label = "Chargement…",
  className,
}: LoadingIndicatorProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center gap-3 text-text-secondary", className)}
    >
      <Spinner />
      <p className="text-body-md">{label}</p>
    </div>
  );
}
