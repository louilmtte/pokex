import { Easing } from 'react-native-reanimated';

/**
 * Langage de mouvement. Toutes les animations de l'app puisent dans ces
 * presets pour garantir une cohérence "physique" — comme Apple Wallet,
 * tout repose sur des ressorts (spring) plutôt que des durées linéaires.
 */
export const springs = {
  // Réaction tactile immédiate (press, toggle).
  snappy: { mass: 0.6, damping: 18, stiffness: 320 },
  // Mouvement de panneaux / bottom sheets magnétiques.
  magnetic: { mass: 0.9, damping: 22, stiffness: 180 },
  // Inclinaison holographique : doux, jamais oscillant.
  gyro: { mass: 1, damping: 30, stiffness: 120 },
  // Rebond expressif pour les célébrations (carte ajoutée).
  bouncy: { mass: 0.8, damping: 12, stiffness: 260 },
} as const;

export const timings = {
  fast: { duration: 140, easing: Easing.out(Easing.cubic) },
  base: { duration: 240, easing: Easing.out(Easing.cubic) },
  slow: { duration: 420, easing: Easing.inOut(Easing.cubic) },
  // Balayage du shimmer des skeletons.
  shimmer: { duration: 1100, easing: Easing.inOut(Easing.ease) },
} as const;

/** Durée cible d'une frame à 120Hz (ms). Utile pour caler les budgets. */
export const FRAME_120HZ_MS = 1000 / 120;
