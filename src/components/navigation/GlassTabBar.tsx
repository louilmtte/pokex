import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/design/theme';
import { springs } from '@/design/motion';
import { Text } from '@/components/primitives/Text';

/**
 * Barre d'onglets flottante en verre dépoli. Un halo lumineux "magnétique"
 * glisse en ressort sous l'onglet actif, les icônes grossissent et
 * s'illuminent à la sélection. Le bouton central "Scanner" est un disque néon
 * surélevé avec son propre glow. Tout est animé sur le thread UI.
 */

const META: Record<
  string,
  { glyph: string; label: string; center?: boolean }
> = {
  index: { glyph: '◈', label: 'Vault' },
  binder: { glyph: '▦', label: 'Classeur' },
  scan: { glyph: '⊡', label: 'Scan', center: true },
  market: { glyph: '＋', label: 'Marché' },
};

const BAR_HEIGHT = 64;

export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const tabCount = state.routes.length;

  // Position animée de l'indicateur (en index fractionnaire -> spring).
  const activeIndex = useDerivedValue(() =>
    withSpring(state.index, springs.magnetic),
  );

  return (
    <View
      style={[styles.wrap, { paddingBottom: insets.bottom || theme.space.md }]}
      pointerEvents="box-none"
    >
      <View style={styles.barShadow}>
        <View style={styles.barClip}>
          <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.barTint} />
          <LinearGradient
            colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* Halo glissant sous l'onglet actif */}
          <SlidingGlow activeIndex={activeIndex} tabCount={tabCount} />

          {/* Onglets */}
          <View style={styles.row}>
            {state.routes.map((route, index) => {
              const meta = META[route.name] ?? {
                glyph: '•',
                label: route.name,
              };
              const focused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate(route.name);
                }
              };

              if (meta.center) {
                return (
                  <CenterButton key={route.key} onPress={onPress} glyph={meta.glyph} />
                );
              }

              return (
                <TabItem
                  key={route.key}
                  glyph={meta.glyph}
                  label={meta.label}
                  focused={focused}
                  onPress={onPress}
                />
              );
            })}
          </View>

          <View style={styles.border} pointerEvents="none" />
        </View>
      </View>
    </View>
  );
}

function SlidingGlow({
  activeIndex,
  tabCount,
}: {
  activeIndex: Animated.SharedValue<number>;
  tabCount: number;
}) {
  const style = useAnimatedStyle(() => {
    const slot = 1 / tabCount;
    return {
      left: `${activeIndex.value * slot * 100}%`,
      width: `${slot * 100}%`,
    };
  });

  return (
    <Animated.View style={[styles.glowSlot, style]} pointerEvents="none">
      <View style={styles.glowDot} />
      <LinearGradient
        colors={['rgba(139,92,246,0.35)', 'transparent']}
        style={styles.glowBeam}
      />
    </Animated.View>
  );
}

function TabItem({
  glyph,
  label,
  focused,
  onPress,
}: {
  glyph: string;
  label: string;
  focused: boolean;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(focused ? 1.12 : 1, springs.snappy) },
      { translateY: withSpring(focused ? -2 : 0, springs.snappy) },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0.55, { duration: 180 }),
  }));

  return (
    <View style={styles.item}>
      <Animated.View
        style={style}
        onTouchEnd={onPress}
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.glyph,
            { color: focused ? theme.color.accent : theme.color.textTertiary },
          ]}
        >
          {glyph}
        </Text>
        <Animated.View style={labelStyle}>
          <Text variant="micro" color={focused ? 'textPrimary' : 'textTertiary'}>
            {label}
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function CenterButton({ onPress, glyph }: { onPress: () => void; glyph: string }) {
  return (
    <View style={styles.item}>
      <View
        style={styles.centerBtn}
        onTouchEnd={onPress}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[theme.color.accent, theme.color.accentAlt]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.centerGlyph}>{glyph}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: theme.space.lg,
  },
  barShadow: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 18,
  },
  barClip: {
    height: BAR_HEIGHT,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  barTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16,18,26,0.6)',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  row: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  glyph: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  glowSlot: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  glowDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 7,
    backgroundColor: theme.color.accent,
    shadowColor: theme.color.accent,
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  glowBeam: {
    position: 'absolute',
    top: 0,
    width: 60,
    height: 40,
  },
  centerBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: theme.color.accent,
    shadowOpacity: 0.7,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  centerGlyph: {
    fontSize: 24,
    color: '#fff',
  },
});
