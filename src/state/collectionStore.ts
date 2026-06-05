import { create } from 'zustand';
import {
  MOCK_BINDERS,
  MOCK_CARDS,
  MOCK_OWNED,
} from '@/data/mock/cards';
import { indexCards } from '@/domain/services/portfolio';
import { Binder, Condition, Grade, OwnedCard, PokemonCard } from '@/domain/types';

/**
 * Store de la collection : source de vérité des cartes possédées, du
 * référentiel et des classeurs. Ne contient AUCUNE logique de présentation —
 * uniquement l'état et les mutations métier (ajouter, ranger, noter).
 *
 * Les sélecteurs dérivés (stats, listes filtrées) vivent dans des hooks
 * dédiés (`@/hooks`) pour garder ce store mince et stable.
 */

interface CollectionState {
  cardsById: Record<string, PokemonCard>;
  owned: OwnedCard[];
  binders: Binder[];

  // Mutations
  addOwnedCard: (input: NewOwnedCardInput) => string;
  removeOwnedCard: (uid: string) => void;
  toggleFavorite: (uid: string) => void;
  setGrade: (uid: string, grade: Grade) => void;
  setCondition: (uid: string, condition: Condition) => void;
  assignToBinder: (uid: string, binderId: string) => void;
  removeFromBinder: (uid: string, binderId: string) => void;
  createBinder: (input: Omit<Binder, 'id' | 'createdAt'>) => string;
}

export interface NewOwnedCardInput {
  cardId: string;
  condition: Condition;
  grade: Grade;
  acquiredCents: number;
  binderIds?: string[];
}

let uidCounter = MOCK_OWNED.length;
const nextUid = () => `o-${++uidCounter}-${Date.now().toString(36)}`;

export const useCollectionStore = create<CollectionState>((set) => ({
  cardsById: indexCards(MOCK_CARDS),
  owned: MOCK_OWNED,
  binders: MOCK_BINDERS,

  addOwnedCard: (input) => {
    const uid = nextUid();
    const card: OwnedCard = {
      uid,
      cardId: input.cardId,
      condition: input.condition,
      grade: input.grade,
      acquiredCents: input.acquiredCents,
      acquiredAt: Date.now(),
      binderIds: input.binderIds ?? [],
      favorite: false,
    };
    set((s) => ({ owned: [card, ...s.owned] }));
    return uid;
  },

  removeOwnedCard: (uid) =>
    set((s) => ({ owned: s.owned.filter((o) => o.uid !== uid) })),

  toggleFavorite: (uid) =>
    set((s) => ({
      owned: s.owned.map((o) =>
        o.uid === uid ? { ...o, favorite: !o.favorite } : o,
      ),
    })),

  setGrade: (uid, grade) =>
    set((s) => ({
      owned: s.owned.map((o) => (o.uid === uid ? { ...o, grade } : o)),
    })),

  setCondition: (uid, condition) =>
    set((s) => ({
      owned: s.owned.map((o) => (o.uid === uid ? { ...o, condition } : o)),
    })),

  assignToBinder: (uid, binderId) =>
    set((s) => ({
      owned: s.owned.map((o) =>
        o.uid === uid && !o.binderIds.includes(binderId)
          ? { ...o, binderIds: [...o.binderIds, binderId] }
          : o,
      ),
    })),

  removeFromBinder: (uid, binderId) =>
    set((s) => ({
      owned: s.owned.map((o) =>
        o.uid === uid
          ? { ...o, binderIds: o.binderIds.filter((b) => b !== binderId) }
          : o,
      ),
    })),

  createBinder: (input) => {
    const id = `b-${Date.now().toString(36)}`;
    const binder: Binder = { ...input, id, createdAt: Date.now() };
    set((s) => ({ binders: [...s.binders, binder] }));
    return id;
  },
}));
