"use client";

import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import { PERSONALIZATION_COPY } from "@/lib/personal/personal-ui-config";
import {
  PERSONALIZATION_PRIORITIES,
  PERSONALIZATION_REWARD_CHIPS,
  PERSONALIZATION_SPECIALTIES,
} from "@/lib/personal/personalization-options";
import { emptyPersonalizationDraft } from "@/lib/personal/profile-completion";
import { savePersonalizationDraft } from "@/lib/personal/personal-actions";
import type { PersonalizationChip, PersonalizationDraft } from "@/types/personal";

type SaveState = "idle" | "saving" | "saved";

type PersonalizationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDraft?: PersonalizationDraft;
  onSaved?: (draft: PersonalizationDraft) => void;
};

function toggleId(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}

function ChipGroup({
  label,
  chips,
  selected,
  onToggle,
}: {
  label: string;
  chips: PersonalizationChip[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-headline-sm">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const isSelected = selected.includes(chip.id);
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(chip.id)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3.5 text-label-md",
                isSelected
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function PersonalizationSheet({
  open,
  onOpenChange,
  initialDraft,
  onSaved,
}: PersonalizationSheetProps) {
  const seed = initialDraft ?? emptyPersonalizationDraft();
  const [specialties, setSpecialties] = useState(seed.specialties);
  const [priorities, setPriorities] = useState(seed.priorities);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  useEffect(() => {
    if (saveState !== "saved") {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      onOpenChangeRef.current(false);
    }, 700);
    return () => window.clearTimeout(timeoutId);
  }, [saveState]);

  async function activate() {
    if (saveState !== "idle") {
      return;
    }
    const draft: PersonalizationDraft = {
      specialties,
      priorities,
    };
    setSaveState("saving");
    setSaveError(null);
    const result = await savePersonalizationDraft(draft);
    const savedDraft: PersonalizationDraft = {
      ...draft,
      savedAt: new Date().toISOString(),
    };
    if (!result.ok) {
      setSaveState("idle");
      setSaveError(result.message ?? PERSONALIZATION_COPY.saveError);
      return;
    }
    setSaveState("saved");
    onSaved?.(savedDraft);
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        if (saveState === "saving") {
          return;
        }
        onOpenChange(next);
      }}
      shouldScaleBackground={false}
      setBackgroundColorOnScale={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed right-0 bottom-0 left-0 z-[70] mx-auto flex h-[85dvh] max-h-[85dvh] w-full max-w-[390px] flex-col rounded-t-[28px] bg-surface-container-lowest outline-none">
          <div className="flex shrink-0 items-center justify-center pt-3 pb-1">
            <Drawer.Handle className="!mx-0 !h-1 !w-9 !bg-surface-container-highest" />
          </div>

          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-4">
            <p className="inline-flex rounded-full bg-surface-container px-2.5 py-1 text-label-sm text-on-surface-variant">
              {PERSONALIZATION_COPY.stepper}
            </p>
            <Drawer.Title className="mt-3 text-headline-lg">
              {PERSONALIZATION_COPY.title}
            </Drawer.Title>
            <Drawer.Description className="mt-1 text-body-md text-on-surface-variant">
              {PERSONALIZATION_COPY.subtitle}
            </Drawer.Description>

            <div className="mt-5 flex flex-col gap-5">
              <ChipGroup
                label={PERSONALIZATION_COPY.specialtiesLabel}
                chips={PERSONALIZATION_SPECIALTIES}
                selected={specialties}
                onToggle={(id) => setSpecialties((current) => toggleId(current, id))}
              />
              <ChipGroup
                label={PERSONALIZATION_COPY.prioritiesLabel}
                chips={PERSONALIZATION_PRIORITIES}
                selected={priorities}
                onToggle={(id) => setPriorities((current) => toggleId(current, id))}
              />

              <section className="rounded-xl bg-surface-container-low p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-headline-sm">
                    {PERSONALIZATION_COPY.rewardTitle}
                  </h3>
                  <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
                    {PERSONALIZATION_COPY.rewardStatus}
                  </span>
                </div>
                <p className="mt-2 text-body-sm text-on-surface-variant">
                  {PERSONALIZATION_COPY.rewardBody}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {PERSONALIZATION_REWARD_CHIPS.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-surface-container-lowest px-2.5 py-1 text-label-sm text-on-surface"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="shrink-0 border-t border-surface-variant px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
            {saveError ? (
              <p className="mb-2 text-body-sm text-on-surface-variant">
                {saveError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void activate()}
              disabled={saveState !== "idle"}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-label-md text-on-primary disabled:opacity-70"
            >
              {saveState === "saving"
                ? PERSONALIZATION_COPY.activating
                : saveState === "saved"
                  ? PERSONALIZATION_COPY.saved
                  : PERSONALIZATION_COPY.activate}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={saveState === "saving"}
              className="mt-2 flex h-10 w-full items-center justify-center text-label-md text-on-surface-variant disabled:opacity-40"
            >
              {PERSONALIZATION_COPY.skip}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
