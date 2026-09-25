type ParagraphBlockProps = {
  text: string;
};

export function ParagraphBlock({ text }: ParagraphBlockProps) {
  return <p className="text-body-md leading-relaxed text-text-primary [overflow-wrap:anywhere]">{text}</p>;
}
