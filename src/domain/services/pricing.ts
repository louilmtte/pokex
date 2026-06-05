import { CONDITION_META, GRADE_MULTIPLIER } from '../taxonomy';
import { Grade, MarketQuote, OwnedCard } from '../types';

/**
 * Service de cotation : règles métier pures de calcul de valeur d'un
 * exemplaire à partir d'une cotation marché de référence. Aucune I/O.
 */

/**
 * Valeur courante (centimes) d'un exemplaire possédé, en tenant compte de
 * son état physique et de sa gradation.
 *
 * Logique : on part du spot Near Mint brut, on applique soit le
 * multiplicateur de gradation (si gradée), soit la décote d'état (si brute).
 */
export function valueOfOwnedCard(
  owned: OwnedCard,
  quote: MarketQuote | undefined,
): number {
  if (!quote) return 0;

  const base = quote.spotCents;

  if (owned.grade.company !== 'Raw' && owned.grade.score != null) {
    const ladder = GRADE_MULTIPLIER[owned.grade.company];
    const mult = ladder[owned.grade.score] ?? 1;
    return Math.round(base * mult);
  }

  const decote = CONDITION_META[owned.condition].multiplier;
  return Math.round(base * decote);
}

/** Libellé court d'une gradation pour les badges, ex: "PSA 10" ou "NM". */
export function gradeLabel(grade: Grade, condition: OwnedCard['condition']): string {
  if (grade.company === 'Raw' || grade.score == null) {
    return CONDITION_META[condition].short;
  }
  return `${grade.company} ${grade.score}`;
}

/**
 * Plus/moins-value latente d'un exemplaire : valeur courante - prix payé.
 */
export function unrealizedPnl(
  owned: OwnedCard,
  quote: MarketQuote | undefined,
): { cents: number; ratio: number } {
  const current = valueOfOwnedCard(owned, quote);
  const cents = current - owned.acquiredCents;
  const ratio = owned.acquiredCents > 0 ? cents / owned.acquiredCents : 0;
  return { cents, ratio };
}
