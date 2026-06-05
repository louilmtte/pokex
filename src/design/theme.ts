import { palette } from './palette';

/**
 * Tokens sémantiques. C'est l'unique surface de contact entre le design
 * system et les composants. On ne référence jamais `palette.*` dans l'UI.
 */
export const theme = {
  color: {
    // Surfaces (empilement Z, du fond vers l'avant)
    bg: palette.black,
    surface: palette.ink800,
    surfaceElevated: palette.ink700,
    surfaceOverlay: palette.ink600,
    hairline: palette.ink500,
    hairlineStrong: palette.ink400,

    // Texte
    textPrimary: palette.white,
    textSecondary: palette.slate200,
    textTertiary: palette.slate300,

    // Accents
    accent: palette.neonViolet,
    accentAlt: palette.neonCyan,
    focus: palette.neonGreen,

    // Marché
    bull: palette.bull,
    bear: palette.bear,
    neutral: palette.neutral,
  },

  /**
   * Gradients holographiques. Utilisés pour les lueurs réactives au
   * gyroscope et les bordures de carte. Définis comme tableaux de stops
   * pour être consommés indifféremment par expo-linear-gradient et Skia.
   */
  holo: {
    aurora: [palette.neonViolet, palette.neonCyan, palette.neonMint],
    sunset: [palette.neonPink, palette.neonGold, palette.neonViolet],
    prism: [
      palette.neonViolet,
      palette.neonIndigo,
      palette.neonCyan,
      palette.neonMint,
      palette.neonLime,
    ],
  },

  radius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 22,
    xl: 28,
    card: 18,
    pill: 999,
  },

  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  /**
   * Élévations : ombres + halos néon. Sur OLED on privilégie le halo
   * coloré (glow) plutôt que l'ombre portée grise classique.
   */
  elevation: {
    glowSoft: {
      shadowColor: palette.neonViolet,
      shadowOpacity: 0.35,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 0 },
      elevation: 8,
    },
    glowStrong: {
      shadowColor: palette.neonCyan,
      shadowOpacity: 0.55,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 0 },
      elevation: 14,
    },
  },
} as const;

export type Theme = typeof theme;
