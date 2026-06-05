import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { generateHistory, Range } from '@/data/mock/priceHistory';
import { theme } from '@/design/theme';
import { formatCents, formatPercent, trendSign } from '@/domain/money';
import { seriesDelta } from '@/domain/services/portfolio';
import { PokemonCard } from '@/domain/types';
import { Sparkline } from '@/components/charts/Sparkline';
import { Text } from '@/components/primitives/Text';

/**
 * Ligne de cotation façon « watchlist crypto » : miniature, nom, mini
 * Sparkline, spot et variation colorée. Réutilise les services de domaine
 * pour la variation — aucune duplication de logique.
 */
interface MarketRowProps {
  card: PokemonCard;
  spotCents: number;
  range: Range;
  onPress: (card: PokemonCard) => void;
}

export function MarketRow({ card, spotCents, range, onPress }: MarketRowProps) {
  const { series, delta } = useMemo(() => {
    const s = generateHistory(card.id, range);
    return { series: s, delta: seriesDelta(s) };
  }, [card.id, range]);

  const sign = trendSign(delta.ratio);
  const color =
    sign === 'up'
      ? theme.color.bull
      : sign === 'down'
        ? theme.color.bear
        : theme.color.neutral;

  return (
    <Pressable style={styles.row} onPress={() => onPress(card)}>
      <Image source={{ uri: card.imageUrl }} style={styles.thumb} />
      <View style={styles.id}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {card.name}
        </Text>
        <Text variant="micro" color="textTertiary">
          {card.setName}
        </Text>
      </View>

      <Sparkline data={series} width={64} height={34} fill={false} strokeWidth={1.8} />

      <View style={styles.price}>
        <Text variant="mono">{formatCents(spotCents)}</Text>
        <Text variant="micro" style={{ color }}>
          {formatPercent(delta.ratio)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    paddingVertical: theme.space.md,
  },
  thumb: {
    width: 40,
    height: 56,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.color.surface,
  },
  id: { flex: 1, gap: 2 },
  price: { alignItems: 'flex-end', gap: 2, minWidth: 84 },
});
