import { computePortfolioStats, seriesDelta } from '../portfolio';
import { unrealizedPnl, valueOfOwnedCard } from '../pricing';
import { MarketQuote, OwnedCard } from '../../types';

/**
 * Tests de la logique métier pure. Aucune dépendance React/native : la
 * couche domaine est entièrement vérifiable en isolation — c'est tout
 * l'intérêt de la séparation logique/UI.
 */

function quote(spotCents: number): MarketQuote {
  return {
    cardId: 'x',
    currency: 'EUR',
    spotCents,
    byCondition: {
      NearMint: spotCents,
      LightlyPlayed: Math.round(spotCents * 0.78),
      Played: Math.round(spotCents * 0.55),
      Poor: Math.round(spotCents * 0.3),
    },
    byGrade: {},
    updatedAt: 0,
  };
}

function owned(partial: Partial<OwnedCard>): OwnedCard {
  return {
    uid: 'u',
    cardId: 'x',
    condition: 'NearMint',
    grade: { company: 'Raw', score: null },
    acquiredCents: 0,
    acquiredAt: 0,
    binderIds: [],
    favorite: false,
    ...partial,
  };
}

describe('pricing', () => {
  it('applique la décote d état pour une carte brute', () => {
    const card = owned({ condition: 'LightlyPlayed' });
    expect(valueOfOwnedCard(card, quote(10000))).toBe(7800);
  });

  it('applique le multiplicateur de gradation PSA 10', () => {
    const card = owned({ grade: { company: 'PSA', score: 10 } });
    expect(valueOfOwnedCard(card, quote(10000))).toBe(75000);
  });

  it('calcule une plus-value latente positive', () => {
    const card = owned({
      grade: { company: 'PSA', score: 10 },
      acquiredCents: 20000,
    });
    const pnl = unrealizedPnl(card, quote(10000));
    expect(pnl.cents).toBe(55000);
    expect(pnl.ratio).toBeCloseTo(2.75);
  });
});

describe('portfolio', () => {
  it('agrège valeur, coût et carte la plus chère', () => {
    const cards = [
      owned({ uid: 'a', acquiredCents: 1000, condition: 'NearMint' }),
      owned({
        uid: 'b',
        cardId: 'y',
        grade: { company: 'PSA', score: 9 },
        acquiredCents: 5000,
      }),
    ];
    const lookup = (id: string) => quote(id === 'y' ? 8000 : 2000);

    const stats = computePortfolioStats(cards, lookup);
    expect(stats.totalCostCents).toBe(6000);
    // a: 2000 (NM) ; b: 8000 * 3.1 = 24800
    expect(stats.totalValueCents).toBe(26800);
    expect(stats.topCardUid).toBe('b');
    expect(stats.unrealizedCents).toBe(20800);
  });
});

describe('seriesDelta', () => {
  it('mesure la variation entre premier et dernier point', () => {
    const d = seriesDelta([{ cents: 100 }, { cents: 150 }] as never);
    expect(d.cents).toBe(50);
    expect(d.ratio).toBeCloseTo(0.5);
  });
});
