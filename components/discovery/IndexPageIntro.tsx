type IndexPageIntroProps = {
  title: string;
  description?: string;
};

export function IndexPageIntro({ title, description }: IndexPageIntroProps) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-headline-lg text-text-primary">{title}</h1>
      {description ? (
        <p className="max-w-[var(--layout-reading)] text-body-md text-text-secondary">
          {description}
        </p>
      ) : null}
    </header>
  );
}
