import { MOCK_CARDS } from '@/data/mock/cards';
import { PokemonCard } from '@/domain/types';

/**
 * Mock du service de reconnaissance d'image. En production, on enverrait le
 * crop de la carte à un backend de vision (embedding visuel + recherche du
 * plus proche voisin dans l'index du référentiel TCG). Ici on simule la
 * latence réseau et un score de confiance pour exercer toute la chaîne UI.
 */

export interface RecognitionInput {
  /** Texte OCR brut remonté par le scanner (nom, PV, numéro…). */
  ocrText: string;
  /** Numéro détecté ex: "4/102". */
  detectedNumber?: string;
}

export interface RecognitionMatch {
  card: PokemonCard;
  /** Confiance 0..1. */
  confidence: number;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/**
 * Score lexical simple entre le texte OCR et une carte candidate.
 * Combine correspondance du numéro (fort signal) et présence du nom.
 */
function scoreCandidate(input: RecognitionInput, card: PokemonCard): number {
  const text = norm(input.ocrText);
  let score = 0;

  if (input.detectedNumber) {
    const target = `${card.numberInSet}/${card.setSize}`;
    if (norm(input.detectedNumber) === norm(target)) score += 0.65;
    else if (input.detectedNumber.startsWith(card.numberInSet)) score += 0.25;
  }

  const name = norm(card.name);
  if (text.includes(name)) score += 0.3;
  else {
    // Correspondance partielle par premiers tokens du nom.
    const head = name.split(' ')[0];
    if (head.length > 3 && text.includes(head)) score += 0.15;
  }

  if (card.hp != null && text.includes(String(card.hp))) score += 0.05;

  return Math.min(1, score);
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * Identifie la carte la plus probable. Renvoie jusqu'à 3 candidats triés
 * par confiance décroissante, pour permettre une confirmation manuelle si
 * la confiance du meilleur match est trop faible.
 */
export async function recognizeCard(
  input: RecognitionInput,
): Promise<RecognitionMatch[]> {
  const ranked = MOCK_CARDS.map((card) => ({
    card,
    confidence: scoreCandidate(input, card),
  }))
    .filter((m) => m.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  // Simule la latence d'un appel d'inférence distant (180–420ms).
  return delay(ranked, 180 + Math.round(Math.random() * 240));
}

/** Seuil au-dessus duquel on auto-valide sans confirmation manuelle. */
export const AUTO_ACCEPT_CONFIDENCE = 0.7;
