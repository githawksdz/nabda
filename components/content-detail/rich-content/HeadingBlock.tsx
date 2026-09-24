type HeadingBlockProps = {
  level: 2 | 3 | 4;
  text: string;
};

export function HeadingBlock({ level, text }: HeadingBlockProps) {
  if (level === 2) {
    return <h2 className="text-headline-sm">{text}</h2>;
  }
  if (level === 3) {
    return <h3 className="text-body-md font-semibold">{text}</h3>;
  }
  return <h4 className="text-label-md">{text}</h4>;
}
