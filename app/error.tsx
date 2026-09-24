"use client";

import { AppErrorBoundaryFallback } from "@/components/app/AppErrorState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AppErrorBoundaryFallback error={error} reset={reset} />;
}
