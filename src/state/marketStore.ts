import { create } from 'zustand';
import { getAllQuotes } from '@/data/repositories/marketRepository';
import { MarketQuote } from '@/domain/types';

/**
 * Store marché : cache des cotations indexées par cardId. Séparé de la
 * collection car son cycle de vie diffère (rafraîchissement périodique,
 * invalidation, source réseau distincte).
 */

interface MarketState {
  quotes: Record<string, MarketQuote>;
  lastSync: number;
  getQuote: (cardId: string) => MarketQuote | undefined;
  refresh: () => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  quotes: getAllQuotes(),
  lastSync: Date.now(),

  getQuote: (cardId) => get().quotes[cardId],

  refresh: () => set({ quotes: getAllQuotes(), lastSync: Date.now() }),
}));

/**
 * Sélecteur stable d'une fonction de lookup, à passer aux services de
 * domaine (`computePortfolioStats`, `queryCollection`). On lit le store hors
 * React pour éviter de recréer la closure à chaque rendu.
 */
export function quoteLookup(cardId: string): MarketQuote | undefined {
  return useMarketStore.getState().quotes[cardId];
}
