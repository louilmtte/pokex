import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Range } from '@/data/mock/priceHistory';
import { theme } from '@/design/theme';
import { formatCents, formatCentsCompact, formatPercent } from '@/domain/money';
import { valueOfOwnedCard } from '@/domain/services/pricing';
import { PokemonCard } from '@/domain/types';
import { useGyroscope } from '@/hooks/useGyroscope';
import { usePortfolioStats } from '@/hooks/usePortfolioStats';
import { useCollectionStore } from '@/state/collectionStore';
import { useMarketStore } from '@/state/marketStore';
import { HolographicCard } from '@/components/card/HolographicCard';
import { PortfolioHeader } from '@/components/dashboard/PortfolioHeader';
import { StatTile } from '@/components/dashboard/StatTile';
import { Text } from '@/components/primitives/Text';

/**
 * « Le Dashboard de la Collection ».
 *
 * Compose, de haut en bas :
 *   1. L'en-tête portefeuille (valeur totale + courbe + période).
 *   2. La rangée de KPI (plus-value latente, carte la plus chère, volume).
 *   3. Le carrousel holographique « Joyaux de la collection » : les cartes
 *      les plus précieuses, vivantes sous le gyroscope.
 *
 * Aucune logique métier ici : tout est dérivé via les hooks/services. L'écran
 * n'orchestre que la mise en page et la navigation.
 */
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [range, setRange] = useState<Range>('30D');
  const model = usePortfolioStats(range);
  const tilt = useGyroscope();

  const owned = useCollectionStore((s) => s.owned);
  const cardsById = useCollectionStore((s) => s.cardsById);
  const quotes = useMarketStore((s) => s.quotes);

  // Joyaux : top 5 exemplaires par valeur courante, résolus en cartes.
  const gems = useMemo(() => {
    return owned
      .map((o) => ({
        owned: o,
        card: cardsById[o.cardId],
        value: valueOfOwnedCard(o, quotes[o.cardId]),
      }))
      .filter((r) => r.card)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [owned, cardsById, quotes]);

  const openCard = (card: PokemonCard, uid: string) => {
    router.push({ pathname: '/card/[uid]', params: { uid, cardId: card.id } });
  };

  const unrealizedColor =
    model.stats.unrealizedCents >= 0 ? 'bull' : 'bear';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + theme.space.md,
        paddingBottom: insets.bottom + 120,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Salutation */}
      <View style={styles.greeting}>
        <View>
          <Text variant="caption" color="textTertiary">
            BONJOUR, DRESSEUR
          </Text>
          <Text variant="title">Votre Vault</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarGlyph}>⚡</Text>
        </View>
      </View>

      <PortfolioHeader model={model} range={range} onRangeChange={setRange} />

      {/* KPI secondaires */}
      <Animated.View
        entering={FadeInDown.duration(360).delay(60)}
        style={styles.statsRow}
      >
        <StatTile
          label="Plus-value latente"
          value={formatCents(Math.abs(model.stats.unrealizedCents))}
          caption={formatPercent(model.stats.unrealizedRatio)}
          captionColor={unrealizedColor}
          accent={
            model.stats.unrealizedCents >= 0
              ? theme.color.bull
              : theme.color.bear
          }
        />
        <StatTile
          label="Exemplaires"
          value={String(model.stats.count)}
          caption={`${model.stats.uniqueCount} cartes uniques`}
        />
      </Animated.View>

      {model.topCard && (
        <Animated.View
          entering={FadeInDown.duration(360).delay(120)}
          style={styles.topCardRow}
        >
          <StatTile
            label="Carte la plus chère"
            value={model.topCard.name}
            caption={formatCentsCompact(model.topCard.valueCents)}
            captionColor="textTertiary"
            accent={theme.color.accentAlt}
          />
        </Animated.View>
      )}

      {/* Carrousel holographique */}
      <View style={styles.sectionHeader}>
        <Text variant="headline">Joyaux de la collection</Text>
        <Text variant="caption" color="textTertiary">
          {gems.length}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width * 0.62 + theme.space.lg}
        decelerationRate="fast"
        contentContainerStyle={styles.rail}
      >
        {gems.map((gem, i) => (
          <Animated.View
            key={gem.owned.uid}
            entering={FadeInDown.duration(420).delay(160 + i * 70)}
            style={styles.gemWrap}
          >
            <HolographicCard
              card={gem.card}
              tilt={tilt}
              width={width * 0.56}
              sharedTag={`card-${gem.owned.uid}`}
              onPress={(c) => openCard(c, gem.owned.uid)}
            />
            <View style={styles.gemMeta}>
              <Text variant="bodyStrong">{formatCents(gem.value)}</Text>
              <Text variant="micro" color="textTertiary">
                {gem.card.setName}
              </Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.color.bg,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space.lg,
    marginBottom: theme.space.lg,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.color.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.color.hairline,
  },
  avatarGlyph: { fontSize: 20 },
  statsRow: {
    flexDirection: 'row',
    gap: theme.space.md,
    paddingHorizontal: theme.space.lg,
    marginTop: theme.space.sm,
  },
  topCardRow: {
    paddingHorizontal: theme.space.lg,
    marginTop: theme.space.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space.lg,
    marginTop: theme.space.xxl,
    marginBottom: theme.space.md,
  },
  rail: {
    paddingHorizontal: theme.space.lg,
    gap: theme.space.lg,
    paddingVertical: theme.space.sm,
  },
  gemWrap: {
    gap: theme.space.sm,
  },
  gemMeta: {
    paddingHorizontal: theme.space.xs,
    gap: 2,
  },
});
