import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/money.dart';
import '../../domain/models/enums.dart';
import '../../domain/models/owned_card.dart';
import '../../domain/models/pokemon_card.dart';
import '../../domain/services/pricing.dart';
import '../../state/providers.dart';
import '../../widgets/pressable.dart';
import '../detail/card_detail_screen.dart';

/// État local de filtrage du Classeur (UI-only, isolé du domaine).
final _binderFilterProvider = StateProvider<String?>((ref) => null);
final _rarityFilterProvider = StateProvider<Rarity?>((ref) => null);

class CollectionScreen extends ConsumerWidget {
  const CollectionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final owned = ref.watch(collectionProvider);
    final cardsById = ref.watch(cardsByIdProvider);
    final getQuote = ref.watch(quoteLookupProvider);
    final binders = ref.watch(bindersProvider);
    final binderId = ref.watch(_binderFilterProvider);
    final rarity = ref.watch(_rarityFilterProvider);

    // Résolution + filtre + tri (valeur décroissante).
    final rows = <({OwnedCard owned, PokemonCard card, int value})>[];
    for (final o in owned) {
      final card = cardsById[o.cardId];
      if (card == null) continue;
      if (binderId != null && !o.binderIds.contains(binderId)) continue;
      if (rarity != null && card.rarity != rarity) continue;
      rows.add((owned: o, card: card, value: Pricing.valueOf(o, getQuote(o.cardId))));
    }
    rows.sort((a, b) => b.value.compareTo(a.value));

    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
              child: Text('Classeur', style: AppType.title),
            ),
          ),
          // Classeurs (chips horizontaux)
          SliverToBoxAdapter(
            child: SizedBox(
              height: 40,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  _Chip(
                    label: 'Tout',
                    active: binderId == null,
                    onTap: () =>
                        ref.read(_binderFilterProvider.notifier).state = null,
                  ),
                  for (final b in binders)
                    _Chip(
                      label: '${b.icon}  ${b.name}',
                      active: binderId == b.id,
                      color: b.accent,
                      onTap: () => ref
                          .read(_binderFilterProvider.notifier)
                          .state = b.id,
                    ),
                ],
              ),
            ),
          ),
          // Raretés
          SliverToBoxAdapter(
            child: SizedBox(
              height: 40,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  _Chip(
                    label: 'Toutes raretés',
                    active: rarity == null,
                    onTap: () =>
                        ref.read(_rarityFilterProvider.notifier).state = null,
                  ),
                  for (final r in Rarity.values)
                    _Chip(
                      label: r.label,
                      active: rarity == r,
                      color: r.color,
                      onTap: () =>
                          ref.read(_rarityFilterProvider.notifier).state = r,
                    ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
              child: Text(
                '${rows.length} exemplaire${rows.length > 1 ? 's' : ''}',
                style: AppType.caption.copyWith(color: AppColors.textTertiary),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 140),
            sliver: SliverGrid(
              gridDelegate:
                  const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 1 / 1.55,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, i) {
                  final row = rows[i];
                  return _GridCard(
                    card: row.card,
                    owned: row.owned,
                    value: row.value,
                    onTap: () => _open(context, row.owned.uid, row.card.id),
                  )
                      .animate()
                      .fadeIn(delay: (24 * i).ms, duration: 280.ms)
                      .scaleXY(begin: 0.96, end: 1);
                },
                childCount: rows.length,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _open(BuildContext context, String uid, String cardId) {
    Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        barrierColor: Colors.black54,
        transitionDuration: const Duration(milliseconds: 420),
        reverseTransitionDuration: const Duration(milliseconds: 320),
        pageBuilder: (_, __, ___) =>
            CardDetailScreen(uid: uid, cardId: cardId, heroTag: 'grid-$uid'),
      ),
    );
  }
}

class _GridCard extends StatelessWidget {
  const _GridCard({
    required this.card,
    required this.owned,
    required this.value,
    required this.onTap,
  });

  final PokemonCard card;
  final OwnedCard owned;
  final int value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onTap: onTap,
      scale: 0.95,
      child: Stack(
        children: [
          Hero(
            tag: 'grid-${owned.uid}',
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: AspectRatio(
                aspectRatio: 1 / 1.395,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: card.rarity.color.withValues(alpha: 0.7),
                        width: 1.5),
                  ),
                  child: Image.network(
                    card.imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) =>
                        Container(color: AppColors.surfaceHi),
                  ),
                ),
              ),
            ),
          ),
          if (owned.favorite)
            const Positioned(
              top: 6,
              left: 6,
              child: Icon(Icons.star_rounded,
                  size: 16, color: AppColors.gold),
            ),
          Positioned(
            bottom: 6,
            left: 6,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(Money.compact(value), style: AppType.micro),
            ),
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({
    required this.label,
    required this.active,
    required this.onTap,
    this.color = AppColors.violet,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Pressable(
        onTap: onTap,
        scale: 0.96,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: active
                ? color.withValues(alpha: 0.18)
                : AppColors.surfaceHi.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
                color: active ? color : AppColors.hairline, width: 1),
          ),
          child: Text(
            label,
            style: AppType.caption.copyWith(
              color: active ? color : AppColors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }
}
