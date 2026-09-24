import Link from "next/link";
import type { CatFlowchartNode } from "@/types/cat-flowchart";

type CatSelectedNodeCardProps = {
  node: CatFlowchartNode;
};

export function CatSelectedNodeCard({ node }: CatSelectedNodeCardProps) {
  return (
    <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3.5 shadow-sm">
      <p className="text-label-sm text-on-surface-variant">Nœud sélectionné</p>
      <h2 className="mt-0.5 text-headline-sm">{node.title}</h2>
      <p className="mt-1.5 text-body-sm text-on-surface-variant">{node.description}</p>
      <div className="mt-3 flex gap-2">
        <Link
          href={node.detailHref}
          className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-primary px-3 text-label-md text-on-primary"
        >
          Voir détail
        </Link>
        {node.toolHref ? (
          <Link
            href={node.toolHref}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-surface-container-low px-3 text-label-md"
          >
            {node.toolLabel ?? "Ouvrir outil lié"}
          </Link>
        ) : (
          <span className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-surface-container-low px-3 text-label-md text-on-surface-variant">
            Outil selon contexte local
          </span>
        )}
      </div>
    </section>
  );
}
