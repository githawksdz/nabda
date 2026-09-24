export function AppLoadingState({
  label = "Chargement…",
}: {
  label?: string;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col items-center justify-center gap-3 bg-background px-4 text-on-surface">
      <div
        className="size-8 animate-pulse rounded-full bg-surface-container-high"
        aria-hidden
      />
      <p className="text-body-md text-on-surface-variant">{label}</p>
    </div>
  );
}
