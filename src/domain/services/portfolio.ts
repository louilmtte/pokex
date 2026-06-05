import { MarketQuote, OwnedCard, PokemonCard } from '../types';
import { unrealizedPnl, valueOfOwnedCard } from './pricing';

/**
 * Service portefeuille : agrège la collection en statistiques de tableau de
 * bord. Pur, déterministe, testable sans React.
 */

export interface PortfolioStats {
  /** Valeur totale estimée du portefeuille (centimes). */
  totalValueCents: number;
  /** Coût total d'acquisition (centimes). */
  totalCostCents: number;
  /** Plus-value latente (centimes) et ratio. */
  unrealizedCents: number;
  unrealizedRatio: number;
  /** Nombre d'exemplaires et de cartes uniques. */
  count: number;
  uniqueCount: number;
  /** Exemplaire le plus cher du deck. */
  topCardUid: string | null;
  topCardValueCents: number;
}

export interface QuoteLookup {
  (cardId: string): MarketQuote | undefined;
}

export function computePortfolioStats(
  owned: OwnedCard[],
  getQuote: QuoteLookup,
): PortfolioStats {
  let totalValueCents = 0;
  let totalCostCents = 0;
  let topCardUid: string | null = null;
  let topCardValueCents = 0;
  const uniqueCards = new Set<string>();

  for (const card of owned) {
    const quote = getQuote(card.cardId);
    const value = valueOfOwnedCard(card, quote);

    totalValueCents += value;
    totalCostCents += card.acquiredCents;
    uniqueCards.add(card.cardId);

    if (value > topCardValueCents) {
      topCardValueCents = value;
      topCardUid = card.uid;
    }
  }

  const unrealizedCents = totalValueCents - totalCostCents;
  const unrealizedRatio =
    totalCostCents > 0 ? unrealizedCents / totalCostCents : 0;

  return {
    totalValueCents,
    totalCostCents,
    unrealizedCents,
    unrealizedRatio,
    count: owned.length,
    uniqueCount: uniqueCards.size,
    topCardUid,
    topCardValueCents,
  };
}

/**
 * Reconstruit une courbe de valeur agrégée du portefeuille en superposant
 * les historiques de prix de chaque carte possédée. Utilisé par la
 * Sparkline du header (tendance globale du "fonds").
 */
export function aggregatePortfolioSeries(
  owned: OwnedCard[],
  historyByCard: Record<string, { t: number; cents: number }[]>,
): { t: number; cents: number }[] {
  const buckets = new Map<number, number>();

  for (const card of owned) {
    const history = historyByCard[card.cardId];
    if (!history) continue;
    for (const point of history) {
      buckets.set(point.t, (buckets.get(point.t) ?? 0) + point.cents);
    }
  }

  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([t, cents]) => ({ t, cents }));
}

/** Variation d'une série entre son premier et son dernier point. */
export function seriesDelta(series: { cents: number }[]): {
  cents: number;
  ratio: number;
} {
  if (series.length < 2) return { cents: 0, ratio: 0 };
  const first = series[0].cents;
  const last = series[series.length - 1].cents;
  const cents = last - first;
  return { cents, ratio: first > 0 ? cents / first : 0 };
}

/** Index pratique carte référentielle par id, pour les jointures UI. */
export function indexCards(cards: PokemonCard[]): Record<string, PokemonCard> {
  return Object.fromEntries(cards.map((c) => [c.id, c]));
}
