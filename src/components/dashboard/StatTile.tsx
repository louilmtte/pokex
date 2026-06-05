import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '@/design/theme';
import { GlassCard } from '@/components/primitives/GlassCard';
import { Text } from '@/components/primitives/Text';

/**
 * Tuile de statistique en verre dépoli. Utilisée pour la plus-value latente,
 * le nombre de cartes, la carte la plus chère. S'appuie sur `GlassCard` pour
 * un rendu cohérent avec le reste du tableau de bord.
 */
interface StatTileProps {
  label: string;
  value: string;
  caption?: string;
  captionColor?: 'textTertiary' | 'bull' | 'bear';
  accent?: string;
}

export function StatTile({
  label,
  value,
  caption,
  captionColor = 'textTertiary',
  accent,
}: StatTileProps) {
  return (
    <GlassCard
      style={styles.card}
      radius={theme.radius.lg}
      padding={theme.space.lg}
      glow={accent}
      tint={accent ? 'violet' : 'neutral'}
    >
      <View style={styles.inner}>
        {accent && (
          <View style={[styles.accentDot, { backgroundColor: accent }]} />
        )}
        <Text variant="micro" color="textTertiary">
          {label.toUpperCase()}
        </Text>
        <Text variant="headline" style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        {caption && (
          <Text variant="caption" color={captionColor}>
            {caption}
          </Text>
        )}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  inner: {
    minHeight: 72,
    justifyContent: 'center',
    gap: 4,
  },
  value: { marginTop: 2 },
  accentDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
