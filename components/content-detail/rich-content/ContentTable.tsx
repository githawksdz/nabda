type ContentTableProps = {
  caption?: string;
  headers: string[];
  rows: string[][];
};

export function ContentTable({ caption, headers, rows }: ContentTableProps) {
  return (
    <section>
      {caption ? (
        <h3 className="mb-2 text-body-md font-semibold">{caption}</h3>
      ) : null}
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li
            key={row.join("-")}
            className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
          >
            {row.map((cell, index) => (
              <p
                key={`${headers[index] ?? index}-${cell}`}
                className={
                  index === 0
                    ? "text-label-md"
                    : "mt-1 text-body-sm text-on-surface-variant"
                }
              >
                {cell}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
