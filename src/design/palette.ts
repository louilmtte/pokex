/**
 * PocketVault — Palette de base (raw tokens).
 *
 * Ces valeurs ne sont JAMAIS consommées directement par les composants.
 * Elles alimentent `theme.ts` qui expose des tokens sémantiques.
 * Mode sombre OLED : le fond le plus profond est un noir absolu (#000000)
 * pour exploiter l'extinction des pixels des dalles OLED.
 */
export const palette = {
  // Noirs profonds OLED (du plus sombre au plus clair)
  black: '#000000',
  ink900: '#06070A',
  ink800: '#0B0D12',
  ink700: '#12151C',
  ink600: '#1A1E27',
  ink500: '#242A36',
  ink400: '#323947',

  // Gris / texte
  slate300: '#8A92A6',
  slate200: '#AEB6C8',
  slate100: '#D7DCE6',
  white: '#FFFFFF',

  // Néons holographiques (accents premium)
  neonViolet: '#8B5CF6',
  neonIndigo: '#6366F1',
  neonCyan: '#22D3EE',
  neonMint: '#34F5C5',
  neonLime: '#A3E635',
  neonGreen: '#22FF88',
  neonGold: '#F5C451',
  neonPink: '#F472B6',
  neonRed: '#FF4D6D',

  // États sémantiques marché
  bull: '#22FF88', // plus-value
  bear: '#FF4D6D', // moins-value
  neutral: '#8A92A6',
} as const;

export type PaletteToken = keyof typeof palette;
