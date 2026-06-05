import { TextStyle } from 'react-native';

/**
 * Échelle typographique inspirée de Linear / Revolut : très resserrée,
 * graisses tranchées, tracking négatif sur les grands titres pour un
 * rendu "premium" et dense.
 *
 * On s'appuie sur la police système (SF Pro sur iOS, Roboto sur Android)
 * pour garantir le rendu natif à 120Hz sans coût de chargement de font.
 */
type Variant =
  | 'display'
  | 'title'
  | 'headline'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'mono'
  | 'micro';

export const typography: Record<Variant, TextStyle> = {
  display: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  headline: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  caption: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0,
  },
  micro: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  // Chiffres tabulaires pour les prix (alignement vertical parfait).
  mono: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
};
