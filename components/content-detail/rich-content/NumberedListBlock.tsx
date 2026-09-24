type NumberedListBlockProps = {
  items: string[];
};

export function NumberedListBlock({ items }: NumberedListBlockProps) {
  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3 text-body-md">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-label-sm">
            {index + 1}
          </span>
          <span className="pt-0.5">{item}</span>
        </li>
      ))}
    </ol>
  );
}
