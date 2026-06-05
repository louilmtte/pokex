import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '@/design/theme';
import { Text } from './Text';

/**
 * Pastille sélectionnable (filtre, tri). Bordure et fond colorés à l'état
 * actif, retour haptique au tap.
 */
interface ChipProps {
  label: string;
  active?: boolean;
  color?: string;
  onPress: () => void;
  glyph?: string;
}

export function Chip({ label, active, color = theme.color.accent, onPress, glyph }: ChipProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? `${color}22` : theme.color.surfaceElevated,
          borderColor: active ? color : theme.color.hairline,
        },
      ]}
    >
      {glyph ? <Text style={styles.glyph}>{glyph}</Text> : null}
      <Text
        variant="caption"
        style={{ color: active ? color : theme.color.textSecondary }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.space.md,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  glyph: { fontSize: 13 },
});
