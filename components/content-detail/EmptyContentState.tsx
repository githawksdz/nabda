import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

type EmptyContentStateProps = {
  title?: string;
  description?: string;
  href?: string;
  actionLabel?: string;
};

export function EmptyContentState({
  title = "Contenu introuvable",
  description = "Cette fiche n'est pas disponible dans Nabda.",
  href = "/search?type=protocols",
  actionLabel = "Retour aux recommandations",
}: EmptyContentStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<FileText className="size-5" strokeWidth={1.75} />}
      actionLabel={actionLabel}
      actionHref={href}
    />
  );
}
