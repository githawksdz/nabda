"use client";

import { useEffect, useRef, useState } from "react";
import { AppDrawer } from "@/components/ui/AppDrawer";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import {
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ContentCard,
} from "@/components/ui/ContentCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PERSONALIZATION_COPY } from "@/lib/personal/personal-ui-config";
import {
  PERSONALIZATION_PRIORITIES,
  PERSONALIZATION_REWARD_CHIPS,
  PERSONALIZATION_SPECIALTIES,
} from "@/lib/personal/personalization-options";
import { emptyPersonalizationDraft } from "@/lib/personal/profile-completion";
import { savePersonalizationDraft } from "@/lib/personal/personal-actions";
import type { PersonalizationDraft } from "@/types/personal";

type SaveState = "idle" | "saving" | "saved";

type PersonalizationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDraft?: PersonalizationDraft;
  onSaved?: (draft: PersonalizationDraft) => void;
};

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
    <AppDrawer
      open={open}
      tall
      shouldScaleBackground={false}
      overlayClassName="z-[var(--z-backdrop)]"
      contentClassName="z-[var(--z-sheet)]"
      footerClassName="pb-[calc(12px+env(safe-area-inset-bottom,0px))]"
      onOpenChange={(next) => {
        if (saveState === "saving") {
          return;
        }
        onOpenChange(next);
      }}
      badge={<StatusBadge tone="muted">{PERSONALIZATION_COPY.stepper}</StatusBadge>}
      title={PERSONALIZATION_COPY.title}
      description={PERSONALIZATION_COPY.subtitle}
      footer={
        <>
          {saveError ? (
            <p className="text-body-sm text-muted-foreground">{saveError}</p>
          ) : null}
          <Button
            onClick={() => void activate()}
            disabled={saveState !== "idle"}
            loading={saveState === "saving"}
          >
            {saveState === "saving"
              ? PERSONALIZATION_COPY.activating
              : saveState === "saved"
                ? PERSONALIZATION_COPY.saved
                : PERSONALIZATION_COPY.activate}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={saveState === "saving"}
          >
            {PERSONALIZATION_COPY.skip}
          </Button>
        </>
      }
    >
      <ChoiceGroup
        label={PERSONALIZATION_COPY.specialtiesLabel}
        options={PERSONALIZATION_SPECIALTIES}
        value={specialties}
        onValueChange={setSpecialties}
      />
      <ChoiceGroup
        label={PERSONALIZATION_COPY.prioritiesLabel}
        options={PERSONALIZATION_PRIORITIES}
        value={priorities}
        onValueChange={setPriorities}
      />
      <ContentCard size="sm">
        <CardHeader>
          <CardTitle>{PERSONALIZATION_COPY.rewardTitle}</CardTitle>
          <CardDescription>{PERSONALIZATION_COPY.rewardBody}</CardDescription>
          <CardAction>
            <StatusBadge tone="muted">{PERSONALIZATION_COPY.rewardStatus}</StatusBadge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {PERSONALIZATION_REWARD_CHIPS.map((chip) => (
            <StatusBadge key={chip} tone="outline">
              {chip}
            </StatusBadge>
          ))}
        </CardContent>
      </ContentCard>
    </AppDrawer>
  );
}
