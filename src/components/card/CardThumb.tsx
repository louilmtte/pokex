import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '@/design/theme';
import { springs } from '@/design/motion';
import { formatCentsCompact } from '@/domain/money';
import { RARITY_META } from '@/domain/taxonomy';
import { gradeLabel } from '@/domain/services/pricing';
import { ResolvedRow } from '@/domain/services/query';
import { Text } from '@/components/primitives/Text';

/**
 * Vignette de carte pour la grille du Classeur. Plus légère que la carte
 * holographique (pas de gyroscope par item, pour préserver les FPS sur de
 * longues listes), mais conserve la bordure de rareté, le badge de gradation
 * et la valeur. La transition partagée renvoie vers la vraie carte holo.
 */
interface CardThumbProps {
  row: ResolvedRow;
  width: number;
  onPress: (row: ResolvedRow) => void;
}

const ASPECT = 1.395;

function CardThumbBase({ row, width, onPress }: CardThumbProps) {
  const { card, owned, valueCents } = row;
  const height = width * ASPECT;
  const scale = useSharedValue(1);
  const rarity = RARITY_META[card.rarity];

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.95, springs.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.snappy);
      }}
      onPress={() => {
        Haptics.selectionAsync();
        onPress(row);
      }}
    >
      <Animated.View
        style={[
          styles.card,
          { width, height, borderColor: rarity.color },
          style,
        ]}
      >
        <Animated.Image
          // @ts-expect-error sharedTransitionTag injecté par le plugin Reanimated
          sharedTransitionTag={`card-${owned.uid}`}
          source={{ uri: card.imageUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {owned.favorite && (
          <View style={styles.fav}>
            <Text style={styles.favGlyph}>★</Text>
          </View>
        )}

        <View style={[styles.gradeBadge, { borderColor: rarity.color }]}>
          <Text variant="micro">{gradeLabel(owned.grade, owned.condition)}</Text>
        </View>

        <View style={styles.valueBadge}>
          <Text variant="micro">{formatCentsCompact(valueCents)}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    backgroundColor: theme.color.surface,
    borderWidth: 1.5,
  },
  fav: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favGlyph: { color: theme.color.accent, fontSize: 12 },
  gradeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
  },
  valueBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
});

export const CardThumb = memo(CardThumbBase);
