import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/design/theme';

/**
 * Surface en verre dépoli — le matériau signature de l'app.
 *
 * Empile cinq strates pour un rendu "liquid glass" crédible :
 *   1. Flou gaussien du fond (BlurView) — capte l'aurora derrière.
 *   2. Teinte translucide pour la densité du verre.
 *   3. Reflet diagonal (gradient blanc haut-gauche) — la lumière sur la vitre.
 *   4. Bordure en dégradé (hairline lumineuse en haut, sombre en bas) qui
 *      simule l'épaisseur biseautée du verre.
 *   5. Halo coloré optionnel sous la carte.
 *
 * Pensé pour être posé sur un fond animé (AuroraBackground) : c'est le
 * mouvement du fond derrière le flou qui rend le verre vivant.
 */
interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  radius?: number;
  padding?: number;
  /** Teinte du verre. */
  tint?: 'neutral' | 'violet' | 'cyan';
  /** Halo coloré projeté (glow). */
  glow?: string;
  /** Reflet diagonal visible (désactivable pour les grandes surfaces). */
  highlight?: boolean;
}

const TINTS: Record<NonNullable<GlassCardProps['tint']>, string> = {
  neutral: 'rgba(20,24,32,0.55)',
  violet: 'rgba(40,28,72,0.5)',
  cyan: 'rgba(16,40,52,0.5)',
};

export function GlassCard({
  children,
  style,
  intensity = 28,
  radius = theme.radius.lg,
  padding = theme.space.lg,
  tint = 'neutral',
  glow,
  highlight = true,
}: GlassCardProps) {
  return (
    <View
      style={[
        styles.shadow,
        { borderRadius: radius },
        glow
          ? {
              shadowColor: glow,
              shadowOpacity: 0.5,
              shadowRadius: 24,
              elevation: 12,
            }
          : null,
        style,
      ]}
    >
      <View style={[styles.clip, { borderRadius: radius }]}>
        <BlurView
          intensity={intensity}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        {/* Densité du verre */}
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: TINTS[tint] }]}
        />

        {/* Reflet diagonal */}
        {highlight && (
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.14)',
              'rgba(255,255,255,0.03)',
              'transparent',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        )}

        {/* Contenu */}
        <View style={{ padding }}>{children}</View>

        {/* Hairline périphérique (épaisseur du verre) */}
        <View
          style={[styles.border, { borderRadius: radius }]}
          pointerEvents="none"
        />
        {/* Arête de lumière en haut (le verre accroche la lumière) */}
        <LinearGradient
          colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topEdge}
          pointerEvents="none"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  clip: {
    overflow: 'hidden',
    backgroundColor: 'rgba(10,12,18,0.2)',
  },
  // Liseré périphérique : une fine bordure blanche très translucide qui
  // dessine l'arête du verre tout autour de la carte.
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  // Bande de lumière en haut, plus marquée que le reste du liseré.
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1.5,
  },
});
