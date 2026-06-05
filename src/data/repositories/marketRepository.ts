import { CONDITION_META, GRADE_MULTIPLIER } from '@/domain/taxonomy';
import { Condition, GradingCompany, MarketQuote } from '@/domain/types';
import { MOCK_SPOT_CENTS } from '@/data/mock/cards';

/**
 * Repository marché. Construit des `MarketQuote` complètes (grille par état
 * et par gradation) à partir du spot Near Mint brut. En production il
 * interrogerait une API de cotation et mettrait en cache les réponses.
 */

function buildConditionGrid(spot: number): Record<Condition, number> {
  const out = {} as Record<Condition, number>;
  (Object.keys(CONDITION_META) as Condition[]).forEach((c) => {
    out[c] = Math.round(spot * CONDITION_META[c].multiplier);
  });
  return out;
}

function buildGradeGrid(
  spot: number,
): Partial<Record<`${GradingCompany}${number}`, number>> {
  const out: Partial<Record<`${GradingCompany}${number}`, number>> = {};
  (Object.keys(GRADE_MULTIPLIER) as GradingCompany[]).forEach((company) => {
    if (company === 'Raw') return;
    const ladder = GRADE_MULTIPLIER[company];
    Object.entries(ladder).forEach(([score, mult]) => {
      out[`${company}${score}` as `${GradingCompany}${number}`] = Math.round(
        spot * mult,
      );
    });
  });
  return out;
}

export function getQuote(cardId: string): MarketQuote | undefined {
  const spot = MOCK_SPOT_CENTS[cardId];
  if (spot == null) return undefined;
  return {
    cardId,
    currency: 'EUR',
    spotCents: spot,
    byCondition: buildConditionGrid(spot),
    byGrade: buildGradeGrid(spot),
    updatedAt: Date.now(),
  };
}

/** Table de toutes les cotations connues, indexée par cardId. */
export function getAllQuotes(): Record<string, MarketQuote> {
  return Object.fromEntries(
    Object.keys(MOCK_SPOT_CENTS).map((id) => [id, getQuote(id)!]),
  );
}
