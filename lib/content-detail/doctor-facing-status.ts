/**
 * Honest product-facing status labels for doctor UI.
 * Does not expose editorial/review workflow states.
 */

export function doctorPublicationLabel(
  publicationStatus?: string | null,
): string {
  if (publicationStatus === "published") {
    return "Publié";
  }
  return "Contenu indisponible";
}

export function doctorVisibilityLabel(visibility?: string | null): string | undefined {
  if (visibility === "public_free") {
    return "Gratuit";
  }
  if (visibility === "premium") {
    return "Pro";
  }
  return undefined;
}

export function doctorCatalogStatusLabel(input: {
  publicationStatus?: string | null;
  visibility?: string | null;
  available?: boolean;
}): string | undefined {
  if (input.available === false) {
    return "Plus disponible dans Nabda";
  }
  const visibility = doctorVisibilityLabel(input.visibility);
  const publication = doctorPublicationLabel(input.publicationStatus);
  return visibility ?? publication;
}
