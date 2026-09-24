type InternalPreviewBannerProps = {
  locked?: boolean;
  title?: string;
  body?: string;
};

export function InternalPreviewBanner({
  locked = false,
  title,
  body,
}: InternalPreviewBannerProps) {
  return (
    <aside className="rounded-xl bg-secondary-container px-3.5 py-3 text-on-secondary-container">
      <p className="text-label-md">
        {locked
          ? "Aperçu interne verrouillé"
          : (title ?? "Aperçu interne · Source préservée")}
      </p>
      <p className="mt-1 text-body-sm">
        {locked
          ? "Ajoutez ?preview=internal ou ouvrez cette route en développement."
          : (body ?? "Inspection produit uniquement. Non publié, non Validé.")}
      </p>
    </aside>
  );
}
