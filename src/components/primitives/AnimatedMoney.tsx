import React, { useEffect } from 'react';
import { StyleSheet, TextInput, TextStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { formatCents } from '@/domain/money';
import { typography } from '@/design/typography';
import { theme } from '@/design/theme';

/**
 * Montant animé "à la Revolut" : la valeur s'incrémente fluidement jusqu'au
 * nouveau total quand le portefeuille change. Le comptage se fait sur le
 * thread UI via un TextInput animé — aucune ré-exécution React par frame.
 */
Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedMoneyProps {
  cents: number;
  duration?: number;
  style?: TextStyle | TextStyle[];
}

export function AnimatedMoney({
  cents,
  duration = 900,
  style,
}: AnimatedMoneyProps) {
  const value = useSharedValue(cents);

  useEffect(() => {
    value.value = withTiming(cents, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [cents, duration, value]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: formatCents(value.value),
      defaultValue: formatCents(value.value),
    } as Partial<{ text: string; defaultValue: string }>;
  });

  return (
    <AnimatedTextInput
      editable={false}
      underlineColorAndroid="transparent"
      animatedProps={animatedProps}
      style={[styles.base, typography.display, style]}
      value={formatCents(cents)}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: theme.color.textPrimary,
    padding: 0,
    margin: 0,
  },
});
