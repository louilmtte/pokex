import React, { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
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
import { AuroraBackground } from '@/components/background/AuroraBackground';
import { HolographicCard } from '@/components/card/HolographicCard';
import { PortfolioHeader } from '@/components/dashboard/PortfolioHeader';
import { StatTile } from '@/components/dashboard/StatTile';
import { PressableScale } from '@/components/primitives/PressableScale';
import { Text } from '@/components/primitives/Text';

const AnimatedView = Animated.View;

/**
 * « Le Dashboard de la Collection ».
 *
 * Toile de fond : une aurora animée (Skia) qui dérive en continu sous les
 * surfaces en verre. Le scroll pilote une parallaxe douce — l'aurora glisse
 * et s'estompe légèrement, donnant de la profondeur à l'ensemble.
 *
 * Aucune logique métier ici : tout est dérivé via les hooks/services.
 */
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [range, setRange] = useState<Range>('30D');
  const model = usePortfolioStats(range);
  const tilt = useGyroscope();

  const owned = useCollectionStore((s) => s.owned);
  const cardsById = useCollectionStore((s) => s.cardsById);
  const quotes = useMarketStore((s) => s.quotes);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // Parallaxe + estompage de l'aurora au scroll.
  const auroraStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 320], [1, 0.45], 'clamp'),
    transform: [
      { translateY: interpolate(scrollY.value, [-120, 0, 320], [60, 0, -90]) },
      { scale: interpolate(scrollY.value, [-120, 0], [1.15, 1], 'clamp') },
    ],
  }));

  // Le bloc valeur se rétracte/estompe légèrement quand on descend.
  const heroStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 180], [1, 0.7], 'clamp'),
    transform: [
      { translateY: interpolate(scrollY.value, [0, 180], [0, -16], 'clamp') },
    ],
  }));

  // Joyaux : top 5 exemplaires par valeur courante.
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

  const unrealizedColor = model.stats.unrealizedCents >= 0 ? 'bull' : 'bear';

  return (
    <View style={styles.screen}>
      {/* Fond aurora animé (fixe, parallaxé) */}
      <AnimatedView style={[StyleSheet.absoluteFill, auroraStyle]}>
        <AuroraBackground width={width} height={height} />
      </AnimatedView>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: insets.top + theme.space.md,
          paddingBottom: insets.bottom + 140,
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
          <PressableScale style={styles.avatar} haptic="selection">
            <Text style={styles.avatarGlyph}>⚡</Text>
          </PressableScale>
        </View>

        <Animated.View style={heroStyle}>
          <PortfolioHeader
            model={model}
            range={range}
            onRangeChange={setRange}
          />
        </Animated.View>

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

        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width * 0.56 + theme.space.lg}
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
        </Animated.ScrollView>
      </Animated.ScrollView>
    </View>
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
