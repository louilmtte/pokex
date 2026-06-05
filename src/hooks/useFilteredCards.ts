import { useMemo } from 'react';
import { queryCollection, ResolvedRow } from '@/domain/services/query';
import { useCollectionStore } from '@/state/collectionStore';
import { useFilterStore } from '@/state/filterStore';
import { useMarketStore } from '@/state/marketStore';

/**
 * Résout la collection visible (filtrée + triée) pour le Classeur Virtuel.
 * Mémoïsé sur les seules dépendances pertinentes pour ne pas re-trier des
 * milliers de cartes à chaque frame d'animation.
 */
export function useFilteredCards(): ResolvedRow[] {
  const owned = useCollectionStore((s) => s.owned);
  const cardsById = useCollectionStore((s) => s.cardsById);
  const quotes = useMarketStore((s) => s.quotes);
  const filter = useFilterStore((s) => s.filter);
  const sort = useFilterStore((s) => s.sort);

  return useMemo(
    () =>
      queryCollection(owned, filter, sort, {
        cardsById,
        getQuote: (id) => quotes[id],
      }),
    [owned, cardsById, quotes, filter, sort],
  );
}
