import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/money.dart';
import '../../data/price_history.dart';
import '../../domain/models/pokemon_card.dart';
import '../../domain/services/portfolio.dart';
import '../../domain/services/pricing.dart';
import '../../state/providers.dart';
import '../../widgets/action_button.dart';
import '../../widgets/animated_money.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/holo_card.dart';
import '../../widgets/pressable.dart';
import '../../widgets/sparkline.dart';
import '../../widgets/range_selector.dart';
import '../detail/card_detail_screen.dart';

/// « Le Dashboard de la Collection ».
/// Header de valeur (odometer + courbe), rangée d'actions rapides, carte
/// promo, carrousel holographique des joyaux, et activité récente.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(portfolioStatsProvider);
    final series = ref.watch(portfolioSeriesProvider);
    final range = ref.watch(rangeProvider);
    final owned = ref.watch(collectionProvider);
    final cardsById = ref.watch(cardsByIdProvider);
    final getQuote = ref.watch(quoteLookupProvider);

    final delta = Portfolio.seriesDelta(series);
    final trendColor = delta.cents >= 0 ? AppColors.bull : AppColors.bear;

    // Joyaux : top 5 exemplaires par valeur.
    final gems = [...owned]
      ..sort((a, b) => Pricing.valueOf(b, getQuote(b.cardId))
          .compareTo(Pricing.valueOf(a, getQuote(a.cardId))));
    final topGems = gems.take(5).toList();

    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(child: _TopBar()),

          // En-tête de valeur
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text('Valeur du portefeuille',
                          style: AppType.caption.copyWith(
                              color: AppColors.textTertiary)),
                      const SizedBox(width: 6),
                      const Icon(Icons.keyboard_arrow_down_rounded,
                          size: 16, color: AppColors.textTertiary),
                    ],
                  ),
                  const SizedBox(height: 6),
                  AnimatedMoney(cents: stats.totalValueCents),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: trendColor.withValues(alpha: 0.14),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          '${delta.cents >= 0 ? '▲' : '▼'} ${Money.euros(delta.cents.abs())}',
                          style: AppType.caption.copyWith(color: trendColor),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(Money.percent(delta.ratio),
                          style: AppType.caption.copyWith(color: trendColor)),
                      const SizedBox(width: 6),
                      Text('· ${range.long}',
                          style: AppType.caption
                              .copyWith(color: AppColors.textTertiary)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Sparkline(data: series, color: trendColor, height: 92),
                  const SizedBox(height: 14),
                  RangeSelector(
                    value: range,
                    onChanged: (r) =>
                        ref.read(rangeProvider.notifier).state = r,
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 350.ms).slideY(begin: 0.04, end: 0),
          ),

          // Rangée d'actions
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 26, 12, 6),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: const [
                  ActionButton(icon: Icons.center_focus_strong_rounded, label: 'Scanner'),
                  ActionButton(icon: Icons.swap_vert_rounded, label: 'Trier', accent: AppColors.cyan),
                  ActionButton(icon: Icons.insights_rounded, label: 'Stats', accent: AppColors.mint),
                  ActionButton(icon: Icons.more_horiz_rounded, label: 'Plus', accent: AppColors.magenta),
                ],
              ),
            ),
          ),

          // Carte promo « joyaux »
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 4),
              child: _PromoCard(stats: stats),
            ),
          ),

          // Section joyaux (carrousel holo)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Joyaux de la collection', style: AppType.headline),
                  Text('${topGems.length}',
                      style: AppType.caption
                          .copyWith(color: AppColors.textTertiary)),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: 348,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: topGems.length,
                separatorBuilder: (_, __) => const SizedBox(width: 16),
                itemBuilder: (context, i) {
                  final o = topGems[i];
                  final card = cardsById[o.cardId];
                  if (card == null) return const SizedBox.shrink();
                  final value = Pricing.valueOf(o, getQuote(o.cardId));
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      HoloCard(
                        card: card,
                        width: 200,
                        heroTag: 'gem-${o.uid}',
                        onTap: () => _openCard(context, o.uid, o.cardId),
                      ),
                      const SizedBox(height: 10),
                      Text(Money.euros(value), style: AppType.bodyStrong),
                      Text(card.setName,
                          style: AppType.micro
                              .copyWith(color: AppColors.textTertiary)),
                    ],
                  )
                      .animate()
                      .fadeIn(delay: (80 * i).ms, duration: 360.ms)
                      .slideX(begin: 0.1, end: 0);
                },
              ),
            ),
          ),

          // Activité récente
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 26, 20, 12),
              child: Text('Activité récente', style: AppType.headline),
            ),
          ),
          SliverList.separated(
            itemCount: owned.length > 6 ? 6 : owned.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, i) {
              final o = owned[i];
              final card = cardsById[o.cardId];
              if (card == null) return const SizedBox.shrink();
              final value = Pricing.valueOf(o, getQuote(o.cardId));
              final pnl = Pricing.unrealizedPnl(o, getQuote(o.cardId));
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: _ActivityRow(
                  card: card,
                  value: value,
                  pnlCents: pnl.cents,
                  onTap: () => _openCard(context, o.uid, o.cardId),
                ),
              );
            },
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 120)),
        ],
      ),
    );
  }

  void _openCard(BuildContext context, String uid, String cardId) {
    Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        barrierColor: Colors.black54,
        transitionDuration: const Duration(milliseconds: 420),
        reverseTransitionDuration: const Duration(milliseconds: 320),
        pageBuilder: (_, __, ___) =>
            CardDetailScreen(uid: uid, cardId: cardId, heroTag: 'gem-$uid'),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 16, 8),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(
                colors: [AppColors.violet, AppColors.indigo],
              ),
              border: Border.all(color: AppColors.hairlineHi),
            ),
            child: const Text('NB',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Bonjour, Dresseur',
                    style: AppType.micro.copyWith(color: AppColors.textTertiary)),
                Text('Votre Vault', style: AppType.headline),
              ],
            ),
          ),
          _circleIcon(Icons.search_rounded),
          const SizedBox(width: 8),
          _circleIcon(Icons.notifications_none_rounded),
        ],
      ),
    );
  }

  Widget _circleIcon(IconData icon) {
    return Pressable(
      onTap: () {},
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: AppColors.surfaceHi.withValues(alpha: 0.6),
          border: Border.all(color: AppColors.hairline),
        ),
        child: Icon(icon, size: 20, color: AppColors.textSecondary),
      ),
    );
  }
}

class _PromoCard extends StatelessWidget {
  const _PromoCard({required this.stats});
  final PortfolioStats stats;

  @override
  Widget build(BuildContext context) {
    final up = stats.unrealizedCents >= 0;
    return GlassCard(
      glow: AppColors.gold,
      tint: const Color(0x33231A0A),
      padding: const EdgeInsets.all(18),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.gold.withValues(alpha: 0.16),
            ),
            child: const Text('💎', style: TextStyle(fontSize: 24)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Plus-value latente', style: AppType.bodyStrong),
                const SizedBox(height: 2),
                Text(
                  '${up ? 'Vous gagnez' : 'Vous perdez'} ${Money.compact(stats.unrealizedCents.abs())}',
                  style: AppType.caption,
                ),
              ],
            ),
          ),
          Text(
            Money.percent(stats.unrealizedRatio),
            style: AppType.bodyStrong.copyWith(
              color: up ? AppColors.bull : AppColors.bear,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActivityRow extends StatelessWidget {
  const _ActivityRow({
    required this.card,
    required this.value,
    required this.pnlCents,
    required this.onTap,
  });

  final PokemonCard card;
  final int value;
  final int pnlCents;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final up = pnlCents >= 0;
    return Pressable(
      onTap: onTap,
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Image.network(
              card.imageUrl,
              width: 42,
              height: 58,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                width: 42,
                height: 58,
                color: AppColors.surfaceHi,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(card.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppType.bodyStrong),
                const SizedBox(height: 2),
                Text(card.setName,
                    style: AppType.micro
                        .copyWith(color: AppColors.textTertiary)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(Money.euros(value), style: AppType.moneyRow),
              Text(
                '${up ? '+' : '-'}${Money.compact(pnlCents.abs())}',
                style: AppType.micro
                    .copyWith(color: up ? AppColors.bull : AppColors.bear),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
