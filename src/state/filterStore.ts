import { create } from 'zustand';
import {
  CardFilter,
  EMPTY_FILTER,
  SortKey,
} from '@/domain/services/query';
import { PokemonType, Rarity } from '@/domain/types';

/**
 * Store UI du Classeur Virtuel : critères de tri/filtre. Volontairement
 * séparé de la donnée (collectionStore) — c'est de l'état d'interface, pas
 * du domaine. Persisterait dans l'AsyncStorage en production.
 */

interface FilterState {
  filter: CardFilter;
  sort: SortKey;

  setSort: (sort: SortKey) => void;
  setSearch: (search: string) => void;
  toggleType: (type: PokemonType) => void;
  toggleRarity: (rarity: Rarity) => void;
  setYearRange: (range: [number | null, number | null]) => void;
  setBinder: (binderId: string | null) => void;
  toggleFavoritesOnly: () => void;
  reset: () => void;
}

const toggle = <T>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export const useFilterStore = create<FilterState>((set) => ({
  filter: EMPTY_FILTER,
  sort: 'valueDesc',

  setSort: (sort) => set({ sort }),

  setSearch: (search) =>
    set((s) => ({ filter: { ...s.filter, search } })),

  toggleType: (type) =>
    set((s) => ({
      filter: { ...s.filter, types: toggle(s.filter.types, type) },
    })),

  toggleRarity: (rarity) =>
    set((s) => ({
      filter: { ...s.filter, rarities: toggle(s.filter.rarities, rarity) },
    })),

  setYearRange: (yearRange) =>
    set((s) => ({ filter: { ...s.filter, yearRange } })),

  setBinder: (binderId) =>
    set((s) => ({ filter: { ...s.filter, binderId } })),

  toggleFavoritesOnly: () =>
    set((s) => ({
      filter: { ...s.filter, favoritesOnly: !s.filter.favoritesOnly },
    })),

  reset: () => set({ filter: EMPTY_FILTER, sort: 'valueDesc' }),
}));
