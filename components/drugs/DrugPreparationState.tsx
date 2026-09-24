"use client";

import Link from "next/link";
import { StatusChip } from "@/components/content-detail/StatusChip";
import {
  DrugIndexationForm,
  type DrugIndexationPayload,
} from "./DrugRequestState";
import { DrugLinkedResources } from "./DrugLinkedResources";
import {
  DRUG_ALTERNATIVES_NOTE,
  DRUG_ALTERNATIVES_TITLE,
  DRUG_STATUS_PREPARATION,
  DRUG_UNAVAILABLE_BODY,
  humanizeDrugSlug,
} from "@/lib/drugs/drug-ui-config";
import type { DrugDetail, LinkedDrugResource } from "@/types/drugs";

type DrugPreparationStateProps = {
  slug: string;
  drug?: DrugDetail;
  alternatives: LinkedDrugResource[];
  submitted: boolean;
  onSubmit: (payload: DrugIndexationPayload) => void;
};

export function DrugPreparationState({
  slug,
  drug,
  alternatives,
  submitted,
  onSubmit,
}: DrugPreparationStateProps) {
  const title = drug?.genericName || humanizeDrugSlug(slug);
  const classLabel = drug?.shortClassName || drug?.className;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl bg-surface-container-lowest p-4 text-center shadow-sm">
        <StatusChip label={DRUG_STATUS_PREPARATION} />
        <h1 className="mt-3 text-headline-md">{title}</h1>
        {classLabel ? (
          <p className="mt-1 text-body-sm text-on-surface-variant">{classLabel}</p>
        ) : null}
        <p className="mt-2 text-body-sm text-on-surface-variant">
          {DRUG_UNAVAILABLE_BODY}
        </p>
      </section>

      <DrugIndexationForm
        defaultMolecule={title}
        submitted={submitted}
        onSubmit={onSubmit}
      />

      <DrugLinkedResources
        title={DRUG_ALTERNATIVES_TITLE}
        items={alternatives}
        note={DRUG_ALTERNATIVES_NOTE}
      />

      <Link
        href="/drugs"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-surface-container-low px-4 text-label-md text-on-surface"
      >
        Retour aux médicaments
      </Link>
    </div>
  );
}
