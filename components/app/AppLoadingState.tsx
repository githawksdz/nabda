import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export function AppLoadingState({
  label = "Chargement…",
}: {
  label?: string;
}) {
  return (
    <div className="layout-gutter layout-workspace mx-auto flex min-h-dvh w-full flex-col items-center justify-center bg-canvas text-text-primary">
      <LoadingIndicator label={label} className="flex-col gap-3" />
    </div>
  );
}
