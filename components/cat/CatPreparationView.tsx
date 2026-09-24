"use client";

import { useState } from "react";
import { CatSearchBar } from "./CatSearchBar";
import { CatFilterChips } from "./CatFilterChips";
import { CatPreparationPanel } from "./CatPreparationPanel";
import { CatConnectedModules } from "./CatConnectedModules";
import { CatSafetyFootnote } from "./CatSafetyFootnote";
import {
  PREPARATION_FILTER_CHIPS,
  SAFETY_FOOTNOTE,
} from "@/lib/cat/cat-ui-config";
import type { CatCategorySlug } from "@/types/cat";

type CatPreparationViewProps = {
  query: string;
  onQueryChange: (value: string) => void;
  category: CatCategorySlug;
  onCategoryChange: (id: CatCategorySlug) => void;
  onMic: () => void;
};

export function CatPreparationView({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  onMic,
}: CatPreparationViewProps) {
  const [suggested, setSuggested] = useState(false);
  const [notified, setNotified] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <CatSearchBar
        value={query}
        onChange={onQueryChange}
        placeholder="Rechercher une CAT..."
        showMic
        onMic={onMic}
      />
      <CatFilterChips
        chips={PREPARATION_FILTER_CHIPS}
        active={category}
        onSelect={onCategoryChange}
        variant="preparation"
      />
      <CatPreparationPanel
        suggested={suggested}
        notified={notified}
        onSuggest={() => setSuggested(true)}
        onNotify={() => setNotified((value) => !value)}
      />
      <CatConnectedModules />
      <CatSafetyFootnote text={SAFETY_FOOTNOTE} />
    </div>
  );
}
