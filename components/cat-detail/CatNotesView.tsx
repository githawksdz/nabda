"use client";

import { useState } from "react";

type CatNotesViewProps = {
  catTitle: string;
};

export function CatNotesView({ catTitle }: CatNotesViewProps) {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <h2 className="text-headline-sm">Notes cliniques</h2>
      <p className="mt-2 text-body-sm text-on-surface-variant">
        Ajoutez plus tard des notes de service ou rappels locaux liés à cette CAT.
      </p>
      <p className="mt-2 text-label-sm text-on-surface-variant">
        Enregistrement local uniquement — ce n&apos;est pas un contenu médical
        publié, ni une consigne partagée pour {catTitle}.
      </p>
      <label className="sr-only" htmlFor="cat-local-note">
        Note locale
      </label>
      <textarea
        id="cat-local-note"
        value={note}
        onChange={(event) => {
          setNote(event.target.value);
          setSaved(false);
        }}
        rows={4}
        placeholder="Rappels d'équipe, filière locale, points d'organisation…"
        className="mt-3 w-full resize-none rounded-xl bg-surface-container-low px-3 py-2.5 text-body-sm text-on-surface outline-none"
      />
      <button
        type="button"
        onClick={() => setSaved(true)}
        className="mt-3 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-label-md text-on-primary"
      >
        {saved ? "Note locale enregistrée" : "Enregistrer en local"}
      </button>
    </section>
  );
}
