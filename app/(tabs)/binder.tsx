import React, { useCallback, useRef } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AuroraBackground } from '@/components/background/AuroraBackground';
import { theme } from '@/design/theme';
import { activeFilterCount, ResolvedRow } from '@/domain/services/query';
import { useFilteredCards } from '@/hooks/useFilteredCards';
import { useCollectionStore } from '@/state/collectionStore';
import { useFilterStore } from '@/state/filterStore';
import { CardThumb } from '@/components/card/CardThumb';
import { Chip } from '@/components/primitives/Chip';
import { Text } from '@/components/primitives/Text';
import { FilterSheet } from '@/components/binder/FilterSheet';

/**
 * « Le Classeur Virtuel ». Grille performante (FlatList virtualisée) des
 * cartes possédées, filtrable par classeur via les chips du haut et triable/
 * filtrable finement via la feuille de bas de page magnétique.
 */
const COLUMNS = 3;

export default function BinderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const sheetRef = useRef<BottomSheet>(null);

  const rows = useFilteredCards();
  const binders = useCollectionStore((s) => s.binders);
  const filter = useFilterStore((s) => s.filter);
  const setBinder = useFilterStore((s) => s.setBinder);

  const gap = theme.space.sm;
  const itemWidth =
    (width - theme.space.lg * 2 - gap * (COLUMNS - 1)) / COLUMNS;

  const openCard = useCallback(
    (row: ResolvedRow) => {
      router.push({
        pathname: '/card/[uid]',
        params: { uid: row.owned.uid, cardId: row.card.id },
      });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: ResolvedRow }) => (
      <CardThumb row={item} width={itemWidth} onPress={openCard} />
    ),
    [itemWidth, openCard],
  );

  const filterCount = activeFilterCount(filter);

  return (
    <View style={styles.screen}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <AuroraBackground width={width} height={height} opacity={0.5} />
      </View>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.owned.uid}
        renderItem={renderItem}
        numColumns={COLUMNS}
        columnWrapperStyle={{ gap }}
        contentContainerStyle={{
          paddingTop: insets.top + theme.space.md,
          paddingHorizontal: theme.space.lg,
          paddingBottom: insets.bottom + 120,
          gap,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text variant="title">Classeur</Text>
              <Pressable
                style={styles.filterBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  sheetRef.current?.expand();
                }}
              >
                <Text variant="caption">Filtrer</Text>
                {filterCount > 0 && (
                  <View style={styles.badge}>
                    <Text variant="micro">{filterCount}</Text>
                  </View>
                )}
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.binderRail}
            >
              <Chip
                label="Tout"
                active={filter.binderId === null}
                onPress={() => setBinder(null)}
              />
              {binders.map((b) => (
                <Chip
                  key={b.id}
                  label={b.name}
                  glyph={b.icon}
                  color={b.accent}
                  active={filter.binderId === b.id}
                  onPress={() => setBinder(b.id)}
                />
              ))}
            </ScrollView>

            <Text variant="caption" color="textTertiary" style={styles.count}>
              {rows.length} exemplaire{rows.length > 1 ? 's' : ''}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="headline" color="textSecondary">
              Aucune carte
            </Text>
            <Text variant="body" color="textTertiary" style={styles.emptySub}>
              Ajustez vos filtres ou scannez une nouvelle carte.
            </Text>
          </View>
        }
      />

      <FilterSheet ref={sheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.bg },
  header: { marginBottom: theme.space.md },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.space.lg,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.space.md,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.color.hairline,
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: theme.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  binderRail: {
    gap: theme.space.sm,
    paddingRight: theme.space.lg,
  },
  count: { marginTop: theme.space.md },
  empty: {
    alignItems: 'center',
    paddingTop: theme.space.xxxl * 2,
    gap: theme.space.sm,
  },
  emptySub: { textAlign: 'center', maxWidth: 240 },
});
