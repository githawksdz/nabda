"use client";

import { useState } from "react";
import { HISTORY_COPY } from "@/lib/personal/personal-ui-config";

type HistoryRetentionFooterProps = {
  disabled?: boolean;
  error?: string | null;
  onClear: () => boolean | Promise<boolean>;
};

export function HistoryRetentionFooter({
  disabled = false,
  error,
  onClear,
}: HistoryRetentionFooterProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  function requestClear() {
    if (disabled) {
      return;
    }
    setConfirming(true);
  }

  async function confirmClear() {
    setPending(true);
    const ok = await onClear();
    setPending(false);
    setConfirming(false);
    if (!ok) {
      return;
    }
  }

  return (
    <section className="rounded-xl bg-surface-container-low p-4">
      <p className="text-body-sm text-on-surface-variant">
        {HISTORY_COPY.retentionHint}
      </p>
      {error ? (
        <p className="mt-2 text-body-sm text-on-surface">{error}</p>
      ) : null}
      {confirming ? (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-body-sm text-on-surface">
            {HISTORY_COPY.clearConfirm}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void confirmClear()}
              disabled={pending}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-label-md text-on-primary disabled:opacity-50"
            >
              {HISTORY_COPY.clearLabel}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="inline-flex h-9 items-center rounded-lg bg-surface-container-high px-3 text-label-md text-on-surface disabled:opacity-50"
            >
              {HISTORY_COPY.clearCancel}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={requestClear}
          disabled={disabled}
          className="mt-3 inline-flex h-9 items-center text-label-md text-on-surface-variant disabled:opacity-40"
        >
          {HISTORY_COPY.clearLabel}
        </button>
      )}
    </section>
  );
}
