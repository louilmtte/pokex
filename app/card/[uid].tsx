import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generateHistory, Range } from '@/data/mock/priceHistory';
import { theme } from '@/design/theme';
import { formatCents, formatPercent, trendSign } from '@/domain/money';
import { seriesDelta } from '@/domain/services/portfolio';
import { gradeLabel, unrealizedPnl, valueOfOwnedCard } from '@/domain/services/pricing';
import { CONDITION_META } from '@/domain/taxonomy';
import { Condition } from '@/domain/types';
import { useGyroscope } from '@/hooks/useGyroscope';
import { useCollectionStore } from '@/state/collectionStore';
import { useMarketStore } from '@/state/marketStore';
import { HolographicCard } from '@/components/card/HolographicCard';
import { Sparkline } from '@/components/charts/Sparkline';
import { RangeSelector } from '@/components/dashboard/RangeSelector';
import { Text } from '@/components/primitives/Text';

/**
 * Écran de détail d'une carte, ouvert en transition partagée depuis la
 * grille / le carrousel. La carte holographique "vole" de la liste vers ce
 * plan (sharedTransitionTag identique), puis se déploie la fiche de cotation.
 */
export default function CardDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const tilt = useGyroscope();
  const [range, setRange] = useState<Range>('30D');

  const { uid, cardId } = useLocalSearchParams<{ uid: string; cardId: string }>();

  const cardsById = useCollectionStore((s) => s.cardsById);
  const owned = useCollectionStore((s) => s.owned);
  const toggleFavorite = useCollectionStore((s) => s.toggleFavorite);
  const getQuote = useMarketStore((s) => s.getQuote);

  const card = cardsById[cardId];
  const ownedCard = owned.find((o) => o.uid === uid);
  const quote = getQuote(cardId);

  const { series, delta } = useMemo(() => {
    const s = generateHistory(cardId, range);
    return { series: s, delta: seriesDelta(s) };
  }, [cardId, range]);

  const pnl = ownedCard ? unrealizedPnl(ownedCard, quote) : null;
  const value = ownedCard ? valueOfOwnedCard(ownedCard, quote) : quote?.spotCents ?? 0;

  if (!card) {
    return (
      <Pressable style={styles.backdrop} onPress={() => router.back()}>
        <Text variant="body" color="textSecondary">
          Carte introuvable
        </Text>
      </Pressable>
    );
  }

  const sign = trendSign(delta.ratio);
  const trendColor =
    sign === 'up' ? theme.color.bull : sign === 'down' ? theme.color.bear : theme.color.neutral;

  const close = () => router.back();

  return (
    <View style={styles.root}>
      <Animated.View entering={FadeIn.duration(220)} style={StyleSheet.absoluteFill}>
        <Pressable style={styles.backdrop} onPress={close} />
      </Animated.View>

      <ScrollView
        style={styles.sheet}
        contentContainerStyle={{
          paddingTop: insets.top + theme.space.xl,
          paddingBottom: insets.bottom + theme.space.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Carte holographique partagée */}
        <View style={styles.hero}>
          <HolographicCard
            card={card}
            tilt={tilt}
            width={width * 0.66}
            sharedTag={`card-${uid}`}
          />
        </View>

        <Animated.View
          entering={SlideInDown.springify().damping(20).delay(60)}
          style={styles.panel}
        >
          {/* En-tête prix */}
          <View style={styles.priceHead}>
            <View>
              <Text variant="caption" color="textTertiary">
                {ownedCard
                  ? `VOTRE EXEMPLAIRE · ${gradeLabel(ownedCard.grade, ownedCard.condition)}`
                  : 'COTE NEAR MINT'}
              </Text>
              <Text variant="display" style={styles.price}>
                {formatCents(value)}
              </Text>
            </View>
            {ownedCard && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleFavorite(ownedCard.uid);
                }}
                style={styles.favBtn}
              >
                <Text style={styles.favGlyph}>
                  {ownedCard.favorite ? '★' : '☆'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Variation + courbe */}
          <View style={styles.deltaRow}>
            <Text variant="caption" style={{ color: trendColor }}>
              {sign === 'up' ? '▲' : sign === 'down' ? '▼' : '—'}{' '}
              {formatCents(Math.abs(delta.cents))} ({formatPercent(delta.ratio)})
            </Text>
          </View>

          <View style={styles.chart}>
            <Sparkline
              data={series}
              width={width - theme.space.lg * 2}
              height={120}
              color={trendColor}
            />
          </View>
          <RangeSelector value={range} onChange={setRange} width={width - theme.space.lg * 2} />

          {/* Plus-value latente */}
          {pnl && ownedCard && (
            <Animated.View entering={FadeInDown.delay(120)} style={styles.pnlCard}>
              <View style={styles.pnlCol}>
                <Text variant="micro" color="textTertiary">
                  PRIX D'ACHAT
                </Text>
                <Text variant="bodyStrong">
                  {formatCents(ownedCard.acquiredCents)}
                </Text>
              </View>
              <View style={styles.pnlCol}>
                <Text variant="micro" color="textTertiary">
                  PLUS-VALUE LATENTE
                </Text>
                <Text
                  variant="bodyStrong"
                  style={{
                    color: pnl.cents >= 0 ? theme.color.bull : theme.color.bear,
                  }}
                >
                  {pnl.cents >= 0 ? '+' : '−'}
                  {formatCents(Math.abs(pnl.cents))} ({formatPercent(pnl.ratio)})
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Grille de cotation par état */}
          <Text variant="caption" color="textTertiary" style={styles.gridLabel}>
            COTE PAR ÉTAT
          </Text>
          <View style={styles.grid}>
            {(Object.keys(CONDITION_META) as Condition[]).map((c) => (
              <View key={c} style={styles.gridCell}>
                <Text variant="micro" color="textTertiary">
                  {CONDITION_META[c].label}
                </Text>
                <Text variant="mono">
                  {formatCents(quote?.byCondition[c] ?? 0)}
                </Text>
              </View>
            ))}
          </View>

          {/* Grille de cotation par gradation */}
          {quote && Object.keys(quote.byGrade).length > 0 && (
            <>
              <Text variant="caption" color="textTertiary" style={styles.gridLabel}>
                COTE GRADÉE (PSA · PCA · BECKETT)
              </Text>
              <View style={styles.grid}>
                {Object.entries(quote.byGrade)
                  .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
                  .map(([key, cents]) => (
                    <View key={key} style={styles.gridCell}>
                      <Text variant="micro" color="textTertiary">
                        {key.replace(/(\d)/, ' $1')}
                      </Text>
                      <Text variant="mono">{formatCents(cents ?? 0)}</Text>
                    </View>
                  ))}
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bouton fermer */}
      <Pressable
        style={[styles.close, { top: insets.top + theme.space.sm }]}
        onPress={close}
      >
        <BlurView intensity={40} tint="dark" style={styles.closeBlur}>
          <Text style={styles.closeGlyph}>✕</Text>
        </BlurView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.82)',
  },
  sheet: { flex: 1 },
  hero: {
    alignItems: 'center',
    paddingVertical: theme.space.xl,
  },
  panel: {
    backgroundColor: theme.color.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.color.hairline,
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.xl,
    minHeight: 460,
  },
  priceHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  price: { marginTop: 4 },
  favBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.color.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favGlyph: { fontSize: 22, color: theme.color.accent },
  deltaRow: { marginTop: theme.space.sm },
  chart: { marginTop: theme.space.lg, marginBottom: theme.space.md },
  pnlCard: {
    flexDirection: 'row',
    backgroundColor: theme.color.surfaceElevated,
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
    marginTop: theme.space.lg,
    gap: theme.space.lg,
  },
  pnlCol: { flex: 1, gap: 4 },
  gridLabel: { marginTop: theme.space.xl, marginBottom: theme.space.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space.sm,
  },
  gridCell: {
    width: '31.5%',
    backgroundColor: theme.color.surfaceElevated,
    borderRadius: theme.radius.md,
    padding: theme.space.md,
    gap: 4,
  },
  close: {
    position: 'absolute',
    right: theme.space.lg,
  },
  closeBlur: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: { color: theme.color.textPrimary, fontSize: 16 },
});
