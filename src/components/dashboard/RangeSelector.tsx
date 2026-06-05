import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Range } from '@/data/mock/priceHistory';
import { theme } from '@/design/theme';
import { springs } from '@/design/motion';
import { Text } from '@/components/primitives/Text';

/**
 * Sélecteur de période segmenté (7J / 30J / 1A) avec pastille de sélection
 * magnétique qui glisse en spring sous l'onglet actif.
 */
const RANGES: Range[] = ['7D', '30D', '1Y'];
const LABELS: Record<Range, string> = { '7D': '7J', '30D': '30J', '1Y': '1A' };

interface RangeSelectorProps {
  value: Range;
  onChange: (range: Range) => void;
  width?: number;
}

export function RangeSelector({ value, onChange, width = 200 }: RangeSelectorProps) {
  const segWidth = width / RANGES.length;
  const index = RANGES.indexOf(value);

  const pill = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(index * segWidth, springs.magnetic) }],
  }));

  return (
    <View style={[styles.track, { width }]}>
      <Animated.View
        style={[styles.pill, { width: segWidth }, pill]}
        pointerEvents="none"
      />
      {RANGES.map((r) => (
        <Pressable
          key={r}
          style={[styles.segment, { width: segWidth }]}
          onPress={() => {
            Haptics.selectionAsync();
            onChange(r);
          }}
        >
          <Text
            variant="caption"
            color={r === value ? 'textPrimary' : 'textTertiary'}
          >
            {LABELS[r]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.surfaceElevated,
    flexDirection: 'row',
    padding: 3,
  },
  pill: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.surfaceOverlay,
  },
  segment: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
