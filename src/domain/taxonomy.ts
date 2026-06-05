import { Condition, GradingCompany, PokemonType, Rarity } from './types';

/**
 * Métadonnées de présentation et de classement pour les énumérations du
 * domaine. Centralisé ici pour que l'UI ET la logique de tri partagent la
 * même source de vérité (couleurs, libellés, ordres).
 */

export const TYPE_META: Record<
  PokemonType,
  { label: string; color: string; glyph: string }
> = {
  Fire: { label: 'Feu', color: '#FF6B4A', glyph: '🔥' },
  Water: { label: 'Eau', color: '#4AA8FF', glyph: '💧' },
  Grass: { label: 'Plante', color: '#4ED66B', glyph: '🍃' },
  Lightning: { label: 'Électrik', color: '#F5C451', glyph: '⚡' },
  Psychic: { label: 'Psy', color: '#C77DFF', glyph: '🔮' },
  Fighting: { label: 'Combat', color: '#D9763C', glyph: '🥊' },
  Darkness: { label: 'Obscurité', color: '#6B7280', glyph: '🌑' },
  Metal: { label: 'Métal', color: '#9CA8B8', glyph: '⚙️' },
  Dragon: { label: 'Dragon', color: '#E0B341', glyph: '🐉' },
  Fairy: { label: 'Fée', color: '#F472B6', glyph: '✨' },
  Colorless: { label: 'Incolore', color: '#D7DCE6', glyph: '⭐' },
};

export const RARITY_META: Record<
  Rarity,
  { label: string; rank: number; color: string }
> = {
  Common: { label: 'Commune', rank: 0, color: '#8A92A6' },
  Uncommon: { label: 'Peu commune', rank: 1, color: '#AEB6C8' },
  Rare: { label: 'Rare', rank: 2, color: '#22D3EE' },
  UltraRare: { label: 'Ultra-Rare', rank: 3, color: '#8B5CF6' },
  AlternativeArt: { label: 'Alternative', rank: 4, color: '#F472B6' },
  SecretRare: { label: 'Secrète', rank: 5, color: '#F5C451' },
  Promo: { label: 'Promo', rank: 1, color: '#34F5C5' },
};

export const CONDITION_META: Record<
  Condition,
  { label: string; short: string; multiplier: number }
> = {
  // `multiplier` : décote appliquée au prix Near Mint de référence.
  NearMint: { label: 'Near Mint', short: 'NM', multiplier: 1 },
  LightlyPlayed: { label: 'Lightly Played', short: 'LP', multiplier: 0.78 },
  Played: { label: 'Played', short: 'PL', multiplier: 0.55 },
  Poor: { label: 'Poor', short: 'PO', multiplier: 0.3 },
};

export const GRADING_META: Record<
  GradingCompany,
  { label: string; color: string }
> = {
  Raw: { label: 'Brute', color: '#8A92A6' },
  PSA: { label: 'PSA', color: '#FF4D6D' },
  PCA: { label: 'PCA', color: '#22D3EE' },
  BGS: { label: 'Beckett', color: '#F5C451' },
};

/** Multiplicateurs de cote selon la note de gradation (vs Near Mint brut). */
export const GRADE_MULTIPLIER: Record<GradingCompany, Record<number, number>> = {
  Raw: { 0: 1 },
  PSA: { 7: 1.4, 8: 1.9, 9: 3.1, 10: 7.5 },
  PCA: { 7: 1.3, 8: 1.7, 9: 2.6, 10: 5.8 },
  BGS: { 8: 2.0, 9: 3.4, 9.5: 5.2, 10: 12.0 },
};
