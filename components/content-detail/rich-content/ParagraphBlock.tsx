type ParagraphBlockProps = {
  text: string;
};

export function ParagraphBlock({ text }: ParagraphBlockProps) {
  return <p className="text-body-md text-on-surface">{text}</p>;
}
