import { useQuery } from "@tanstack/react-query";
import type { SavedCard } from "@/lib/square/cards";

export interface SavedCardsResult {
  cards: SavedCard[];
  /** True when the request was authorized — distinguishes a guest from a
   * signed-in user who simply has no saved cards (drives the "save card" opt-in). */
  authenticated: boolean;
}

/**
 * The signed-in user's saved cards. Returns `authenticated: false` for guests
 * (the API 401s) so checkout can hide saved-card UI + the save-card checkbox.
 */
export function useSavedCards() {
  return useQuery<SavedCardsResult>({
    queryKey: ["saved-cards"],
    queryFn: async () => {
      const res = await fetch("/api/account/cards");
      if (!res.ok) return { cards: [], authenticated: false };
      const data = await res.json();
      return {
        cards: (data.cards ?? []) as SavedCard[],
        authenticated: true,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
