import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '@/design/theme';
import { Text } from '@/components/primitives/Text';

/**
 * Tuile de statistique secondaire (verre dépoli). Utilisée pour la plus-value
 * latente, le nombre de cartes, la carte la plus chère.
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
    <View style={styles.wrap}>
      <BlurView intensity={24} tint="dark" style={styles.blur}>
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
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.color.hairline,
  },
  blur: {
    padding: theme.space.lg,
    gap: 4,
    minHeight: 96,
    justifyContent: 'center',
    backgroundColor: theme.color.surface,
  },
  value: { marginTop: 2 },
  accentDot: {
    position: 'absolute',
    top: theme.space.lg,
    right: theme.space.lg,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
