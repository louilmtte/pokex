import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Range } from '@/data/mock/priceHistory';
import { theme } from '@/design/theme';
import { PokemonCard } from '@/domain/types';
import { useCollectionStore } from '@/state/collectionStore';
import { useMarketStore } from '@/state/marketStore';
import { MarketRow } from '@/components/market/MarketRow';
import { RangeSelector } from '@/components/dashboard/RangeSelector';
import { Text } from '@/components/primitives/Text';

/**
 * « Marché ». Watchlist des cartes du portefeuille, cotées en temps réel
 * avec Sparkline et variation. La période choisie se propage à toutes les
 * lignes simultanément.
 */
export default function MarketScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [range, setRange] = useState<Range>('7D');

  const cardsById = useCollectionStore((s) => s.cardsById);
  const owned = useCollectionStore((s) => s.owned);
  const quotes = useMarketStore((s) => s.quotes);

  // Cartes uniques possédées, triées par valeur spot décroissante.
  const watchlist = useMemo(() => {
    const uniqueIds = [...new Set(owned.map((o) => o.cardId))];
    return uniqueIds
      .map((id) => ({ card: cardsById[id], spot: quotes[id]?.spotCents ?? 0 }))
      .filter((r) => r.card)
      .sort((a, b) => b.spot - a.spot);
  }, [owned, cardsById, quotes]);

  const openCard = (card: PokemonCard) => {
    const anyOwned = owned.find((o) => o.cardId === card.id);
    router.push({
      pathname: '/card/[uid]',
      params: { uid: anyOwned?.uid ?? card.id, cardId: card.id },
    });
  };

  return (
    <FlatList
      style={styles.screen}
      data={watchlist}
      keyExtractor={(r) => r.card.id}
      renderItem={({ item }) => (
        <MarketRow
          card={item.card}
          spotCents={item.spot}
          range={range}
          onPress={openCard}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
      contentContainerStyle={{
        paddingTop: insets.top + theme.space.md,
        paddingHorizontal: theme.space.lg,
        paddingBottom: insets.bottom + 120,
      }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text variant="title">Marché</Text>
          <Text variant="caption" color="textTertiary" style={styles.sub}>
            Cotation Near Mint · {watchlist.length} cartes suivies
          </Text>
          <View style={styles.rangeRow}>
            <RangeSelector value={range} onChange={setRange} width={220} />
          </View>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.bg },
  header: { marginBottom: theme.space.md },
  sub: { marginTop: 4 },
  rangeRow: { marginTop: theme.space.lg },
  sep: { height: 1, backgroundColor: theme.color.hairline },
});
