import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { springs } from '@/design/motion';

/**
 * Pressable universel à ressort. Toute surface interactive de l'app passe par
 * lui pour garantir une réponse tactile cohérente (enfoncement + légère
 * désaturation) et un retour haptique — comme sur Revolut où *tout* réagit.
 */
interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Échelle minimale à l'enfoncement (0.92 par défaut). */
  activeScale?: number;
  /** Intensité haptique au tap. `null` pour désactiver. */
  haptic?: 'light' | 'medium' | 'selection' | null;
  /** Atténuation d'opacité à l'enfoncement. */
  dimOnPress?: boolean;
}

export function PressableScale({
  children,
  style,
  activeScale = 0.92,
  haptic = 'light',
  dimOnPress = true,
  onPress,
  ...rest
}: PressableScaleProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 - pressed.value * (1 - activeScale) },
    ],
    opacity: dimOnPress ? 1 - pressed.value * 0.12 : 1,
  }));

  const fireHaptic = () => {
    if (haptic === null) return;
    if (haptic === 'selection') Haptics.selectionAsync();
    else if (haptic === 'medium')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Pressable
      onPressIn={() => {
        pressed.value = withSpring(1, springs.snappy);
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 220 });
      }}
      onPress={(e) => {
        fireHaptic();
        onPress?.(e);
      }}
      {...rest}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
