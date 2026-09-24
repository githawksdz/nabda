import type { ReactNode } from "react";
import type { MentionBlock, RichContentBlock, RichContentDocument } from "@/types/content-detail";
import { ParagraphBlock } from "./ParagraphBlock";
import { HeadingBlock } from "./HeadingBlock";
import { BulletListBlock } from "./BulletListBlock";
import { NumberedListBlock } from "./NumberedListBlock";
import { ClinicalCallout } from "./ClinicalCallout";
import { WarningCallout } from "./WarningCallout";
import { ContentTable } from "./ContentTable";
import { MentionChip } from "./MentionChip";

type RichContentRendererProps = {
  document: RichContentDocument;
};

function isMention(block: RichContentBlock): block is MentionBlock {
  return (
    block.type === "drug_mention" ||
    block.type === "calculator_mention" ||
    block.type === "protocol_mention" ||
    block.type === "reference_mention"
  );
}

function renderBlock(block: RichContentBlock) {
  switch (block.type) {
    case "paragraph":
      return <ParagraphBlock text={block.text} />;
    case "heading":
      return <HeadingBlock level={block.level} text={block.text} />;
    case "bullet_list":
      return <BulletListBlock items={block.items} />;
    case "numbered_list":
      return <NumberedListBlock items={block.items} />;
    case "callout":
      return block.variant === "warning" ? (
        <WarningCallout title={block.title} body={block.body} />
      ) : (
        <ClinicalCallout title={block.title} body={block.body} />
      );
    case "table":
      return (
        <ContentTable
          caption={block.caption}
          headers={block.headers}
          rows={block.rows}
        />
      );
    default:
      return null;
  }
}

export function RichContentRenderer({ document }: RichContentRendererProps) {
  const nodes: ReactNode[] = [];
  let mentionBuffer: MentionBlock[] = [];

  function flushMentions(key: string) {
    if (mentionBuffer.length === 0) {
      return;
    }
    nodes.push(
      <div key={key} className="flex flex-wrap gap-1.5">
        {mentionBuffer.map((mention) => (
          <MentionChip
            key={mention.id}
            type={mention.type}
            label={mention.label}
            href={mention.href}
            subtitle={mention.subtitle}
          />
        ))}
      </div>,
    );
    mentionBuffer = [];
  }

  document.blocks.forEach((block, index) => {
    if (isMention(block)) {
      mentionBuffer.push(block);
      return;
    }
    flushMentions(`mentions-${index}`);
    nodes.push(
      <div key={block.id} className="min-w-0">
        {renderBlock(block)}
      </div>,
    );
  });
  flushMentions("mentions-end");

  return <div className="flex flex-col gap-4">{nodes}</div>;
}
