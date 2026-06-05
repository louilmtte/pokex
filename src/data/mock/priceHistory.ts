import { PricePoint } from '@/domain/types';
import { MOCK_SPOT_CENTS } from './cards';

/**
 * Générateur déterministe d'historiques de prix. On simule une marche
 * aléatoire bornée (mouvement brownien géométrique discret) ancrée sur le
 * spot actuel, avec une graine par carte pour des courbes stables entre
 * les rendus (pas de scintillement de la Sparkline).
 */

export type Range = '7D' | '30D' | '1Y';

const RANGE_DAYS: Record<Range, number> = { '7D': 7, '30D': 30, '1Y': 365 };

/** PRNG déterministe (mulberry32) à partir d'une graine entière. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Reconstruit une série rétrograde : on part du spot actuel (dernier point)
 * et on remonte le temps en appliquant l'inverse des variations, de sorte
 * que le dernier point colle toujours au spot affiché ailleurs dans l'app.
 */
export function generateHistory(cardId: string, range: Range): PricePoint[] {
  const days = RANGE_DAYS[range];
  const spot = MOCK_SPOT_CENTS[cardId] ?? 10000;
  const rand = mulberry32(seedFromId(cardId) ^ days);

  // Volatilité quotidienne plus forte sur les courtes périodes affichées.
  const vol = range === '1Y' ? 0.012 : 0.02;
  const drift = -0.0008; // léger biais haussier en remontant le temps

  const points: PricePoint[] = [];
  const now = Date.now();
  const dayMs = 86400000;
  const step = Math.max(1, Math.round(days / 60)); // ~60 points max

  let value = spot;
  for (let d = 0; d <= days; d += step) {
    const t = now - d * dayMs;
    points.push({ t, cents: Math.round(value) });
    // Remontée du temps : on défait un mouvement brownien géométrique.
    const shock = (rand() - 0.5) * 2 * vol + drift;
    value = value / (1 + shock);
  }

  return points.reverse();
}

/** Pré-calcule les historiques 30J de toutes les cartes (pour l'agrégat). */
export function buildHistoryMap(
  cardIds: string[],
  range: Range,
): Record<string, PricePoint[]> {
  return Object.fromEntries(
    cardIds.map((id) => [id, generateHistory(id, range)]),
  );
}
