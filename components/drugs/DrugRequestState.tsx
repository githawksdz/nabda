"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { StatusChip } from "@/components/content-detail/StatusChip";
import { DrugLinkedResources } from "./DrugLinkedResources";
import {
  DRUG_ALTERNATIVES_NOTE,
  DRUG_ALTERNATIVES_TITLE,
  DRUG_INDEXATION_NOTE,
  DRUG_STATUS_UNINDEXED,
  DRUG_UNAVAILABLE_BODY,
  humanizeDrugSlug,
} from "@/lib/drugs/drug-ui-config";
import type { LinkedDrugResource } from "@/types/drugs";

export type DrugIndexationPayload = {
  molecule: string;
  notify: boolean;
};

type DrugIndexationFormProps = {
  defaultMolecule: string;
  submitted: boolean;
  onSubmit: (payload: DrugIndexationPayload) => void;
};

export function DrugIndexationForm({
  defaultMolecule,
  submitted,
  onSubmit,
}: DrugIndexationFormProps) {
  const [molecule, setMolecule] = useState(defaultMolecule);
  const [notify, setNotify] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      molecule: molecule.trim() || defaultMolecule,
      notify,
    });
  }

  return (
    <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <h2 className="text-headline-sm">Demander l&apos;indexation</h2>
      <p className="mt-2 text-body-sm text-on-surface-variant">
        {DRUG_INDEXATION_NOTE}
      </p>
      {submitted ? (
        <p className="mt-4 rounded-xl bg-surface-container-low px-3.5 py-3 text-body-sm text-on-surface">
          Demande d&apos;indexation enregistrée localement.
        </p>
      ) : (
        <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5">
            <span className="text-label-md">Molécule recherchée</span>
            <input
              value={molecule}
              onChange={(event) => setMolecule(event.target.value)}
              name="molecule"
              autoComplete="off"
              className="h-11 rounded-xl bg-surface-container-low px-3 text-body-md outline-none focus:bg-surface-container-lowest"
            />
          </label>
          <label className="flex items-center gap-2 text-body-sm text-on-surface">
            <input
              type="checkbox"
              checked={notify}
              onChange={(event) => setNotify(event.target.checked)}
              className="size-4 rounded border-outline-variant"
            />
            M&apos;avertir dès sa publication (optionnel)
          </label>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-label-md text-on-primary"
          >
            Envoyer la demande d&apos;indexation
          </button>
        </form>
      )}
    </section>
  );
}

type DrugRequestStateProps = {
  slug: string;
  moleculeName?: string;
  alternatives: LinkedDrugResource[];
  submitted: boolean;
  onSubmit: (payload: DrugIndexationPayload) => void;
};

export function DrugRequestState({
  slug,
  moleculeName,
  alternatives,
  submitted,
  onSubmit,
}: DrugRequestStateProps) {
  const title = moleculeName || humanizeDrugSlug(slug);

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl bg-surface-container-lowest p-4 text-center shadow-sm">
        <StatusChip label={DRUG_STATUS_UNINDEXED} />
        <h1 className="mt-3 text-headline-md">{title}</h1>
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
