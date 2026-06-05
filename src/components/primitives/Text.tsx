import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { typography } from '@/design/typography';
import { theme } from '@/design/theme';

/**
 * Composant texte unifié : applique l'échelle typographique et les couleurs
 * sémantiques. Empêche l'usage de tailles/poids arbitraires dans l'app.
 */
type Variant = keyof typeof typography;
type ColorToken = 'textPrimary' | 'textSecondary' | 'textTertiary' | 'bull' | 'bear' | 'accent';

interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: ColorToken;
}

export function Text({
  variant = 'body',
  color = 'textPrimary',
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      {...rest}
      style={[typography[variant], { color: theme.color[color] }, style]}
    />
  );
}
