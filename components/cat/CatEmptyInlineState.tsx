import { CatIcon } from "./cat-icons";
import { EmptyState } from "@/components/ui/EmptyState";

type CatEmptyInlineStateProps = {
  title?: string;
  subtitle?: string;
};

export function CatEmptyInlineState({
  title = "Aucun protocole d'urgence trouvé",
  subtitle = "Vérifiez l'orthographe ou basculez vers la vue complète des CAT.",
}: CatEmptyInlineStateProps) {
  return (
    <EmptyState
      title={title}
      description={subtitle}
      icon={<CatIcon name="search-off" className="size-5" />}
      className="py-6"
    />
  );
}
