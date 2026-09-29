type IndexPageIntroProps = {
  description?: string;
};

export function IndexPageIntro({ description }: IndexPageIntroProps) {
  if (!description) {
    return null;
  }

  return (
    <p className="max-w-[var(--layout-reading)] text-body-sm text-text-secondary">
      {description}
    </p>
  );
}
