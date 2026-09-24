import { CatIcon } from "./cat-icons";

type CatEmptyInlineStateProps = {
  title?: string;
  subtitle?: string;
};

export function CatEmptyInlineState({
  title = "Aucun protocole d'urgence trouvé",
  subtitle = "Vérifiez l'orthographe ou basculez vers la vue complète des CAT.",
}: CatEmptyInlineStateProps) {
  return (
    <section className="rounded-xl bg-surface-container-low px-4 py-6 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-container">
        <CatIcon name="search-off" className="size-5 text-on-surface-variant" />
      </span>
      <h2 className="mt-3 text-headline-sm">{title}</h2>
      <p className="mt-1 text-body-sm text-on-surface-variant">{subtitle}</p>
    </section>
  );
}
