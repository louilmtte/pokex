/**
 * Utilitaires monétaires. Toute la valeur transite en CENTIMES (entiers)
 * dans le domaine pour éviter les imprécisions de flottants. Le formatage
 * n'a lieu qu'à la frontière UI.
 *
 * Implémentation autonome (sans `Intl`) : le moteur Hermes n'embarque qu'un
 * support `Intl` partiel selon les plateformes ; on garantit ici un rendu
 * identique et sans crash sur iOS comme Android.
 */

/** Insère les séparateurs de milliers à la française (espace fine). */
function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** 145099 -> "1 450,99 €" */
export function formatCents(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const euros = Math.floor(abs / 100);
  const rest = (abs % 100).toString().padStart(2, '0');
  const body = `${groupThousands(String(euros))},${rest} €`;
  return negative ? `-${body}` : body;
}

/** 145099 -> "1,5 k€" · 1250000 -> "12,5 k€" · 2500000 -> "2,5 M€" */
export function formatCentsCompact(cents: number): string {
  const negative = cents < 0;
  const euros = Math.abs(cents) / 100;
  let body: string;

  if (euros >= 1_000_000) {
    body = `${(euros / 1_000_000).toFixed(1).replace('.', ',')} M€`;
  } else if (euros >= 1_000) {
    body = `${(euros / 1_000).toFixed(1).replace('.', ',')} k€`;
  } else {
    body = `${euros.toFixed(0)} €`;
  }
  return negative ? `-${body}` : body;
}

/** +0.123 -> "+12,3 %" */
export function formatPercent(ratio: number): string {
  const sign = ratio > 0 ? '+' : ratio < 0 ? '-' : '';
  const value = Math.abs(ratio * 100)
    .toFixed(1)
    .replace('.', ',');
  return `${sign}${value} %`;
}

/** Signe sémantique d'une variation, pour piloter la couleur bull/bear. */
export function trendSign(delta: number): 'up' | 'down' | 'flat' {
  if (delta > 0) return 'up';
  if (delta < 0) return 'down';
  return 'flat';
}
