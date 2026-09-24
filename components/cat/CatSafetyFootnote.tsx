import { CatIcon } from "./cat-icons";

type CatSafetyFootnoteProps = {
  text: string;
};

export function CatSafetyFootnote({ text }: CatSafetyFootnoteProps) {
  return (
    <p className="flex items-center justify-center gap-1.5 text-center text-label-sm text-on-surface-variant">
      <CatIcon name="shield" className="size-3.5" />
      {text}
    </p>
  );
}
