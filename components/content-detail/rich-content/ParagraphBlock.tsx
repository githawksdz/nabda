type ParagraphBlockProps = {
  text: string;
};

export function ParagraphBlock({ text }: ParagraphBlockProps) {
  return <p className="text-body-lg text-text-primary [overflow-wrap:anywhere]">{text}</p>;
}
