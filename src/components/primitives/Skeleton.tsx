import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/design/theme';

/**
 * Skeleton shimmer à 120Hz. Le balayage est piloté 100% sur l'UI thread
 * (useSharedValue + withRepeat), donc aucune frame n'est perdue même si le
 * JS thread est occupé à résoudre la collection.
 */
interface SkeletonProps {
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  radius?: number;
  style?: ViewStyle;
}

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export function Skeleton({
  width = '100%',
  height = 16,
  radius = theme.radius.sm,
  style,
}: SkeletonProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [progress]);

  const sweep = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [-220, 220]) },
    ],
  }));

  return (
    <View
      style={[
        styles.base,
        { width, height, borderRadius: radius },
        style,
      ]}
    >
      <AnimatedGradient
        colors={[
          'transparent',
          'rgba(255,255,255,0.06)',
          'rgba(255,255,255,0.12)',
          'rgba(255,255,255,0.06)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFill, sweep]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.color.surfaceElevated,
    overflow: 'hidden',
  },
});
