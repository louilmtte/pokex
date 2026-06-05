import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/design/theme';
import { springs } from '@/design/motion';
import { RARITY_META, TYPE_META } from '@/domain/taxonomy';
import { PokemonCard } from '@/domain/types';
import { Tilt } from '@/hooks/useGyroscope';
import { Text } from '@/components/primitives/Text';

/**
 * « La Carte Pokémon Virtuelle ».
 *
 * Effet holographique en deux couches CSS/Style superposées, pilotées par le
 * gyroscope sur l'UI thread :
 *   1. Inclinaison 3D (perspective + rotateX/rotateY) -> volume physique.
 *   2. Voile prismatique (gradient arc-en-ciel) qui glisse à contre-sens de
 *      l'inclinaison -> reflet holo.
 *   3. Glare spéculaire (gradient blanc radial-like) suivant la lumière.
 *
 * Les cartes non-holo (Common/Uncommon) reçoivent un effet atténué pour
 * rester fidèles au matériau réel.
 */

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedImage = Animated.createAnimatedComponent(Image);

interface HolographicCardProps {
  card: PokemonCard;
  tilt: Tilt;
  width?: number;
  /** Tag pour la transition partagée (shared element) vers le détail. */
  sharedTag?: string;
  onPress?: (card: PokemonCard) => void;
  /** Intensité globale 0..1 (réduite pour les listes denses). */
  intensity?: number;
}

const ASPECT = 1.395; // ratio officiel d'une carte (63mm x 88mm)

function holoStrength(card: PokemonCard): number {
  const rank = RARITY_META[card.rarity].rank;
  // Commune=0 ... Secrète=5 -> 0.25..1
  return 0.25 + (rank / 5) * 0.75;
}

function HolographicCardBase({
  card,
  tilt,
  width = 230,
  sharedTag,
  onPress,
  intensity = 1,
}: HolographicCardProps) {
  const height = width * ASPECT;
  const strength = holoStrength(card) * intensity;
  const pressed = useSharedValue(0);

  // ----- Inclinaison 3D + ressort de pression -----
  const containerStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.965]);
    return {
      transform: [
        { perspective: 900 },
        { rotateY: `${tilt.roll.value * 10}deg` },
        { rotateX: `${-tilt.pitch.value * 10}deg` },
        { scale },
      ],
    };
  });

  // ----- Voile prismatique : translation inverse à l'inclinaison -----
  const prismStyle = useAnimatedStyle(() => {
    const tx = interpolate(tilt.roll.value, [-1, 1], [-width * 0.5, width * 0.5]);
    const ty = interpolate(tilt.pitch.value, [-1, 1], [-height * 0.3, height * 0.3]);
    const opacity =
      strength * interpolate(Math.abs(tilt.roll.value), [0, 1], [0.18, 0.55]);
    return {
      opacity,
      transform: [{ translateX: tx }, { translateY: ty }, { rotate: '25deg' }],
    };
  });

  // ----- Glare spéculaire : point chaud qui suit la lumière -----
  const glareStyle = useAnimatedStyle(() => {
    const tx = interpolate(tilt.roll.value, [-1, 1], [width * 0.4, -width * 0.4]);
    const ty = interpolate(tilt.pitch.value, [-1, 1], [height * 0.3, -height * 0.3]);
    return {
      opacity: strength * 0.5,
      transform: [{ translateX: tx }, { translateY: ty }],
    };
  });

  // ----- Halo coloré dynamique sous la carte -----
  const glowStyle = useAnimatedStyle(() => {
    const c = interpolateColor(
      tilt.roll.value,
      [-1, 0, 1],
      [theme.holo.aurora[2], card.dominantColor, theme.holo.aurora[0]],
    );
    return {
      shadowColor: c as string,
      shadowOpacity: 0.45 * strength + 0.15,
    };
  });

  const handlePressIn = () => {
    pressed.value = withSpring(1, springs.snappy);
  };
  const handlePressOut = () => {
    pressed.value = withSpring(0, springs.snappy);
  };
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.(card);
  };

  const typeMeta = TYPE_META[card.types[0]];
  const rarityMeta = RARITY_META[card.rarity];

  return (
    <Animated.View style={[styles.glow, { width, height }, glowStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${card.name}, ${rarityMeta.label}`}
      >
        <Animated.View
          style={[
            styles.card,
            { width, height, borderRadius: theme.radius.card },
            containerStyle,
          ]}
        >
          {/* Artwork */}
          <AnimatedImage
            sharedTransitionTag={sharedTag}
            source={{ uri: card.imageUrl }}
            style={styles.artwork}
            resizeMode="cover"
          />

          {/* Couche 1 — Voile prismatique holographique */}
          <View style={styles.clip} pointerEvents="none">
            <AnimatedLinearGradient
              colors={[
                'rgba(139,92,246,0.0)',
                'rgba(139,92,246,0.65)',
                'rgba(34,211,238,0.65)',
                'rgba(52,245,197,0.65)',
                'rgba(163,230,53,0.0)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.sheen, prismStyle]}
            />
          </View>

          {/* Couche 2 — Glare spéculaire */}
          <View style={styles.clip} pointerEvents="none">
            <AnimatedLinearGradient
              colors={[
                'rgba(255,255,255,0.0)',
                'rgba(255,255,255,0.55)',
                'rgba(255,255,255,0.0)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.glare, glareStyle]}
            />
          </View>

          {/* Bordure interne lumineuse */}
          <View
            style={[styles.innerBorder, { borderColor: rarityMeta.color }]}
            pointerEvents="none"
          />

          {/* Bandeau d'info bas */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.82)']}
            style={styles.infoBar}
            pointerEvents="none"
          >
            <View style={styles.infoRow}>
              <Text variant="bodyStrong" numberOfLines={1} style={styles.flex}>
                {card.name}
              </Text>
              <View
                style={[styles.typeChip, { backgroundColor: typeMeta.color }]}
              >
                <Text variant="micro" style={styles.chipText}>
                  {typeMeta.glyph}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text variant="micro" color="textTertiary">
                {card.numberInSet}/{card.setSize} · {card.setName}
              </Text>
              <Text variant="micro" style={{ color: rarityMeta.color }}>
                {rarityMeta.label.toUpperCase()}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: {
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 26,
    elevation: 16,
  },
  card: {
    backgroundColor: theme.color.surface,
    overflow: 'hidden',
  },
  artwork: {
    ...StyleSheet.absoluteFillObject,
  },
  clip: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    width: '220%',
    height: '220%',
    left: '-60%',
    top: '-60%',
  },
  glare: {
    position: 'absolute',
    width: '160%',
    height: '160%',
    left: '-30%',
    top: '-30%',
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.card,
    borderWidth: 1.5,
    opacity: 0.6,
  },
  infoBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.xl,
    paddingBottom: theme.space.md,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.sm,
  },
  flex: { flex: 1 },
  typeChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 12 },
});

export const HolographicCard = memo(HolographicCardBase);
