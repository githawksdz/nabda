"use server";

import type { FavoriteMutationResult } from "@/lib/ui/favorite-result";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { FavoriteItemType, HistoryItemType } from "@/types/content";

const FAVORITE_TYPES = new Set<FavoriteItemType>([
  "protocol",
  "cat",
  "calculator",
  "drug",
]);

const HISTORY_TYPES = new Set<HistoryItemType>([
  "protocol",
  "cat",
  "calculator",
  "drug",
  "search",
]);

async function getSupabaseOrNull() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    return await createClient();
  } catch (error) {
    console.warn("user-content supabase client", error);
    return null;
  }
}

function isFavoriteType(value: string): value is FavoriteItemType {
  return FAVORITE_TYPES.has(value as FavoriteItemType);
}

function isHistoryType(value: string): value is HistoryItemType {
  return HISTORY_TYPES.has(value as HistoryItemType);
}

export async function isFavorite(
  entityType: FavoriteItemType,
  entityId: string,
): Promise<boolean> {
  if (!isFavoriteType(entityType) || !entityId) {
    return false;
  }

  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return false;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_type", entityType)
      .eq("item_slug", entityId)
      .maybeSingle();

    if (error) {
      console.warn("isFavorite", error.message);
      return false;
    }

    return Boolean(data);
  } catch (error) {
    console.warn("isFavorite", error);
    return false;
  }
}

export async function toggleFavorite(
  entityType: FavoriteItemType,
  entityId: string,
): Promise<FavoriteMutationResult> {
  if (!isFavoriteType(entityType) || !entityId) {
    return { saved: false, skipped: true, reason: "write_failed" };
  }

  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return { saved: false, skipped: true, reason: "write_failed" };
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { saved: false, skipped: true, reason: "unauthenticated" };
    }

    const { data: existing, error: readError } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_type", entityType)
      .eq("item_slug", entityId)
      .maybeSingle();

    if (readError) {
      console.warn("toggleFavorite read", readError.message);
      return { saved: false, skipped: true, reason: "write_failed" };
    }

    if (existing) {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("id", existing.id)
        .eq("user_id", user.id);
      if (error) {
        console.warn("toggleFavorite delete", error.message);
        return { saved: false, skipped: true, reason: "write_failed" };
      }
      return { saved: false };
    }

    const { error } = await supabase.from("user_favorites").insert({
      user_id: user.id,
      item_type: entityType,
      item_slug: entityId,
    });
    if (error) {
      console.warn("toggleFavorite insert", error.message);
      return { saved: false, skipped: true, reason: "write_failed" };
    }
    return { saved: true };
  } catch (error) {
    console.warn("toggleFavorite", error);
    return { saved: false, skipped: true, reason: "write_failed" };
  }
}

export async function recordContentView(
  entityType: HistoryItemType,
  entityId: string,
): Promise<void> {
  if (!isHistoryType(entityType) || !entityId) {
    return;
  }

  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return;
    }

    const { error } = await supabase.from("user_history").insert({
      user_id: user.id,
      item_type: entityType,
      item_slug: entityId,
    });
    if (error) {
      console.warn("recordContentView", error.message);
    }
  } catch (error) {
    console.warn("recordContentView", error);
  }
}
