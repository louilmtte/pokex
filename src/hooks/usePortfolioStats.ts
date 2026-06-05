import { useMemo } from 'react';
import { buildHistoryMap, Range } from '@/data/mock/priceHistory';
import {
  aggregatePortfolioSeries,
  computePortfolioStats,
  PortfolioStats,
  seriesDelta,
} from '@/domain/services/portfolio';
import { PricePoint } from '@/domain/types';
import { useCollectionStore } from '@/state/collectionStore';
import { useMarketStore } from '@/state/marketStore';

/**
 * Hook de présentation du tableau de bord. Compose collection + marché via
 * les services de domaine purs et mémoïse le résultat. Toute la logique
 * lourde reste dans `@/domain` — ce hook n'est qu'un câblage réactif.
 */
export interface DashboardModel {
  stats: PortfolioStats;
  series: PricePoint[];
  delta: { cents: number; ratio: number };
  topCard: {
    uid: string;
    name: string;
    imageUrl: string;
    valueCents: number;
  } | null;
}

export function usePortfolioStats(range: Range = '30D'): DashboardModel {
  const owned = useCollectionStore((s) => s.owned);
  const cardsById = useCollectionStore((s) => s.cardsById);
  const quotes = useMarketStore((s) => s.quotes);

  return useMemo(() => {
    const getQuote = (cardId: string) => quotes[cardId];
    const stats = computePortfolioStats(owned, getQuote);

    const historyMap = buildHistoryMap(
      [...new Set(owned.map((o) => o.cardId))],
      range,
    );
    const series = aggregatePortfolioSeries(owned, historyMap);
    const delta = seriesDelta(series);

    let topCard: DashboardModel['topCard'] = null;
    if (stats.topCardUid) {
      const owner = owned.find((o) => o.uid === stats.topCardUid);
      const card = owner ? cardsById[owner.cardId] : undefined;
      if (owner && card) {
        topCard = {
          uid: owner.uid,
          name: card.name,
          imageUrl: card.imageUrl,
          valueCents: stats.topCardValueCents,
        };
      }
    }

    return { stats, series, delta, topCard };
  }, [owned, cardsById, quotes, range]);
}
