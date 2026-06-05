import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { theme } from '@/design/theme';
import { SortKey } from '@/domain/services/query';
import {
  CONDITION_META,
  RARITY_META,
  TYPE_META,
} from '@/domain/taxonomy';
import { PokemonType, Rarity } from '@/domain/types';
import { useFilterStore } from '@/state/filterStore';
import { Chip } from '@/components/primitives/Chip';
import { Text } from '@/components/primitives/Text';

/**
 * Feuille de bas de page « magnétique » des filtres & tri du Classeur.
 * Points d'ancrage à 55% et 92% : on peut la tirer pour révéler l'ensemble
 * des critères, le backdrop s'assombrit progressivement.
 */

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'valueDesc', label: 'Valeur ↓' },
  { key: 'valueAsc', label: 'Valeur ↑' },
  { key: 'rarityDesc', label: 'Rareté' },
  { key: 'yearDesc', label: 'Récent' },
  { key: 'yearAsc', label: 'Ancien' },
  { key: 'nameAsc', label: 'A–Z' },
];

const ALL_TYPES = Object.keys(TYPE_META) as PokemonType[];
const ALL_RARITIES = Object.keys(RARITY_META) as Rarity[];

export const FilterSheet = forwardRef<BottomSheet>((_, ref) => {
  const snapPoints = useMemo(() => ['55%', '92%'], []);

  const filter = useFilterStore((s) => s.filter);
  const sort = useFilterStore((s) => s.sort);
  const setSort = useFilterStore((s) => s.setSort);
  const toggleType = useFilterStore((s) => s.toggleType);
  const toggleRarity = useFilterStore((s) => s.toggleRarity);
  const toggleFavoritesOnly = useFilterStore((s) => s.toggleFavoritesOnly);
  const reset = useFilterStore((s) => s.reset);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.6}
        />
      )}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="headline">Trier & filtrer</Text>
          <Chip label="Réinitialiser" onPress={reset} color={theme.color.bear} />
        </View>

        <Text variant="caption" color="textTertiary" style={styles.label}>
          TRI
        </Text>
        <View style={styles.wrap}>
          {SORTS.map((s) => (
            <Chip
              key={s.key}
              label={s.label}
              active={sort === s.key}
              onPress={() => setSort(s.key)}
            />
          ))}
        </View>

        <Text variant="caption" color="textTertiary" style={styles.label}>
          TYPE
        </Text>
        <View style={styles.wrap}>
          {ALL_TYPES.map((t) => (
            <Chip
              key={t}
              label={TYPE_META[t].label}
              glyph={TYPE_META[t].glyph}
              color={TYPE_META[t].color}
              active={filter.types.includes(t)}
              onPress={() => toggleType(t)}
            />
          ))}
        </View>

        <Text variant="caption" color="textTertiary" style={styles.label}>
          RARETÉ
        </Text>
        <View style={styles.wrap}>
          {ALL_RARITIES.map((r) => (
            <Chip
              key={r}
              label={RARITY_META[r].label}
              color={RARITY_META[r].color}
              active={filter.rarities.includes(r)}
              onPress={() => toggleRarity(r)}
            />
          ))}
        </View>

        <Text variant="caption" color="textTertiary" style={styles.label}>
          ÉTAT
        </Text>
        <View style={styles.wrap}>
          <Chip
            label="Favoris uniquement"
            glyph="★"
            active={filter.favoritesOnly}
            onPress={toggleFavoritesOnly}
          />
        </View>

        <Text variant="micro" color="textTertiary" style={styles.footnote}>
          {Object.values(CONDITION_META).length} états · cotation mise à jour en
          continu
        </Text>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

FilterSheet.displayName = 'FilterSheet';

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: theme.color.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
  },
  handle: {
    backgroundColor: theme.color.hairlineStrong,
    width: 44,
  },
  content: {
    paddingHorizontal: theme.space.lg,
    paddingBottom: theme.space.xxxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.space.md,
  },
  label: {
    marginTop: theme.space.xl,
    marginBottom: theme.space.md,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space.sm,
  },
  footnote: {
    marginTop: theme.space.xxl,
    textAlign: 'center',
  },
});
