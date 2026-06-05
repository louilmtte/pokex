import { RARITY_META } from '../taxonomy';
import {
  MarketQuote,
  OwnedCard,
  PokemonCard,
  PokemonType,
  Rarity,
} from '../types';
import { valueOfOwnedCard } from './pricing';

/**
 * Moteur de tri & filtrage du Classeur Virtuel. Pur et performant :
 * une seule passe de filtrage, tri stable, conçu pour des collections de
 * plusieurs milliers d'exemplaires sans bloquer le thread JS.
 */

export type SortKey =
  | 'valueDesc'
  | 'valueAsc'
  | 'rarityDesc'
  | 'yearDesc'
  | 'yearAsc'
  | 'nameAsc';

export interface CardFilter {
  types: PokemonType[];
  rarities: Rarity[];
  /** [min, max] année, inclusif. `null` = pas de borne. */
  yearRange: [number | null, number | null];
  binderId: string | null;
  search: string;
  favoritesOnly: boolean;
}

export const EMPTY_FILTER: CardFilter = {
  types: [],
  rarities: [],
  yearRange: [null, null],
  binderId: null,
  search: '',
  favoritesOnly: false,
};

/** Une ligne de collection résolue : exemplaire + référentiel + valeur. */
export interface ResolvedRow {
  owned: OwnedCard;
  card: PokemonCard;
  valueCents: number;
}

export interface QueryContext {
  cardsById: Record<string, PokemonCard>;
  getQuote: (cardId: string) => MarketQuote | undefined;
}

function matches(row: ResolvedRow, filter: CardFilter): boolean {
  const { card, owned } = row;

  if (filter.favoritesOnly && !owned.favorite) return false;
  if (filter.binderId && !owned.binderIds.includes(filter.binderId)) {
    return false;
  }
  if (filter.types.length && !card.types.some((t) => filter.types.includes(t))) {
    return false;
  }
  if (filter.rarities.length && !filter.rarities.includes(card.rarity)) {
    return false;
  }

  const [minY, maxY] = filter.yearRange;
  if (minY != null && card.year < minY) return false;
  if (maxY != null && card.year > maxY) return false;

  if (filter.search.trim()) {
    const needle = filter.search.trim().toLowerCase();
    const haystack = `${card.name} ${card.setName} ${card.numberInSet}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }

  return true;
}

const comparators: Record<SortKey, (a: ResolvedRow, b: ResolvedRow) => number> = {
  valueDesc: (a, b) => b.valueCents - a.valueCents,
  valueAsc: (a, b) => a.valueCents - b.valueCents,
  rarityDesc: (a, b) =>
    RARITY_META[b.card.rarity].rank - RARITY_META[a.card.rarity].rank,
  yearDesc: (a, b) => b.card.year - a.card.year,
  yearAsc: (a, b) => a.card.year - b.card.year,
  nameAsc: (a, b) => a.card.name.localeCompare(b.card.name, 'fr'),
};

/**
 * Résout, filtre puis trie la collection en une passe. Les exemplaires
 * orphelins (sans carte référentielle) sont ignorés silencieusement.
 */
export function queryCollection(
  owned: OwnedCard[],
  filter: CardFilter,
  sort: SortKey,
  ctx: QueryContext,
): ResolvedRow[] {
  const rows: ResolvedRow[] = [];

  for (const o of owned) {
    const card = ctx.cardsById[o.cardId];
    if (!card) continue;
    const row: ResolvedRow = {
      owned: o,
      card,
      valueCents: valueOfOwnedCard(o, ctx.getQuote(o.cardId)),
    };
    if (matches(row, filter)) rows.push(row);
  }

  return rows.sort(comparators[sort]);
}

/** Nombre de filtres actifs, pour le badge du bouton "Filtrer". */
export function activeFilterCount(filter: CardFilter): number {
  let n = 0;
  n += filter.types.length;
  n += filter.rarities.length;
  if (filter.yearRange[0] != null || filter.yearRange[1] != null) n += 1;
  if (filter.binderId) n += 1;
  if (filter.favoritesOnly) n += 1;
  if (filter.search.trim()) n += 1;
  return n;
}
