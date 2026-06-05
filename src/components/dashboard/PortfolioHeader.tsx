import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Range } from '@/data/mock/priceHistory';
import { theme } from '@/design/theme';
import { formatCents, formatPercent, trendSign } from '@/domain/money';
import { DashboardModel } from '@/hooks/usePortfolioStats';
import { Sparkline } from '@/components/charts/Sparkline';
import { Skeleton } from '@/components/primitives/Skeleton';
import { AnimatedMoney } from '@/components/primitives/AnimatedMoney';
import { Text } from '@/components/primitives/Text';
import { RangeSelector } from './RangeSelector';

/**
 * En-tête « portefeuille » du Dashboard : valeur totale animée (odometer),
 * variation colorée dans une puce, courbe agrégée plein-largeur et sélecteur
 * de période. C'est l'âme "Bourse/Crypto" de l'app.
 */
interface PortfolioHeaderProps {
  model: DashboardModel;
  range: Range;
  onRangeChange: (range: Range) => void;
  loading?: boolean;
}

export function PortfolioHeader({
  model,
  range,
  onRangeChange,
  loading,
}: PortfolioHeaderProps) {
  const { width } = useWindowDimensions();
  const chartWidth = width - theme.space.lg * 2;
  const sign = trendSign(model.delta.ratio);
  const trendColor =
    sign === 'up'
      ? theme.color.bull
      : sign === 'down'
        ? theme.color.bear
        : theme.color.neutral;

  if (loading) {
    return (
      <View style={styles.container}>
        <Skeleton width={140} height={14} />
        <Skeleton width={220} height={44} style={{ marginTop: 10 }} />
        <Skeleton width={120} height={18} style={{ marginTop: 10 }} />
        <Skeleton
          width={chartWidth}
          height={96}
          radius={theme.radius.lg}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(320)} style={styles.container}>
      <Text variant="caption" color="textTertiary">
        VALEUR DU PORTEFEUILLE
      </Text>

      <AnimatedMoney cents={model.stats.totalValueCents} style={styles.total} />

      <View style={styles.deltaRow}>
        <View style={[styles.deltaChip, { borderColor: `${trendColor}55` }]}>
          <Text variant="caption" style={{ color: trendColor }}>
            {sign === 'up' ? '▲' : sign === 'down' ? '▼' : '—'}{' '}
            {formatCents(Math.abs(model.delta.cents))}
          </Text>
        </View>
        <Text variant="caption" style={{ color: trendColor }}>
          {formatPercent(model.delta.ratio)}
        </Text>
        <Text variant="caption" color="textTertiary">
          · {range === '7D' ? '7 jours' : range === '30D' ? '30 jours' : '1 an'}
        </Text>
      </View>

      <View style={styles.chart}>
        <Sparkline
          data={model.series}
          width={chartWidth}
          height={96}
          color={trendColor}
        />
      </View>

      <View style={styles.rangeRow}>
        <RangeSelector value={range} onChange={onRangeChange} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.sm,
    paddingBottom: theme.space.lg,
  },
  total: { marginTop: 2, height: 48 },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    marginTop: theme.space.sm,
  },
  deltaChip: {
    paddingHorizontal: theme.space.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  chart: {
    marginTop: theme.space.lg,
  },
  rangeRow: {
    marginTop: theme.space.lg,
    alignItems: 'flex-start',
  },
});
