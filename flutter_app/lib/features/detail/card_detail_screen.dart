import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/money.dart';
import '../../data/mock_data.dart';
import '../../data/price_history.dart';
import '../../domain/models/enums.dart';
import '../../domain/models/owned_card.dart';
import '../../domain/services/portfolio.dart';
import '../../domain/services/pricing.dart';
import '../../state/providers.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/holo_card.dart';
import '../../widgets/pressable.dart';
import '../../widgets/range_selector.dart';
import '../../widgets/sparkline.dart';

/// Détail d'une carte, ouvert en transition Hero. Carte holo en grand +
/// fiche de cotation (variation, courbe, plus-value, grille par état/gradation).
class CardDetailScreen extends ConsumerStatefulWidget {
  const CardDetailScreen({
    super.key,
    required this.uid,
    required this.cardId,
    required this.heroTag,
  });

  final String uid;
  final String cardId;
  final Object heroTag;

  @override
  ConsumerState<CardDetailScreen> createState() => _CardDetailScreenState();
}

class _CardDetailScreenState extends ConsumerState<CardDetailScreen> {
  ChartRange _range = ChartRange.d30;

  @override
  Widget build(BuildContext context) {
    final cardsById = ref.watch(cardsByIdProvider);
    final owned = ref.watch(collectionProvider);
    final card = cardsById[widget.cardId];
    OwnedCard? ownedCard;
    for (final o in owned) {
      if (o.uid == widget.uid) {
        ownedCard = o;
        break;
      }
    }
    final quote = MockData.quoteFor(widget.cardId);

    if (card == null) {
      return const SizedBox.shrink();
    }

    final series = PriceHistory.series(widget.cardId, _range);
    final delta = Portfolio.seriesDelta(series);
    final trendColor = delta.cents >= 0 ? AppColors.bull : AppColors.bear;
    final value = ownedCard != null
        ? Pricing.valueOf(ownedCard, quote)
        : quote?.spotCents ?? 0;
    final pnl =
        ownedCard != null ? Pricing.unrealizedPnl(ownedCard, quote) : null;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          // Fond flouté du dessous
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
              child: Container(color: Colors.black.withValues(alpha: 0.5)),
            ),
          ),
          GestureDetector(onTap: () => Navigator.pop(context)),
          SafeArea(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Column(
                children: [
                  const SizedBox(height: 12),
                  Center(
                    child: HoloCard(
                      card: card,
                      width: MediaQuery.of(context).size.width * 0.62,
                      heroTag: widget.heroTag,
                    ),
                  ),
                  const SizedBox(height: 18),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: GlassCard(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      ownedCard != null
                                          ? 'VOTRE EXEMPLAIRE · ${ownedCard.gradeLabel}'
                                          : 'COTE NEAR MINT',
                                      style: AppType.micro,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(Money.euros(value),
                                        style: AppType.title),
                                  ],
                                ),
                              ),
                              if (ownedCard != null)
                                Pressable(
                                  onTap: () {
                                    HapticFeedback.mediumImpact();
                                    ref
                                        .read(collectionProvider.notifier)
                                        .toggleFavorite(ownedCard.uid);
                                  },
                                  child: Container(
                                    width: 44,
                                    height: 44,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppColors.surfaceHi,
                                    ),
                                    child: Icon(
                                      ownedCard.favorite
                                          ? Icons.star_rounded
                                          : Icons.star_border_rounded,
                                      color: AppColors.violet,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            '${delta.cents >= 0 ? '▲' : '▼'} ${Money.euros(delta.cents.abs())} (${Money.percent(delta.ratio)})',
                            style: AppType.caption.copyWith(color: trendColor),
                          ),
                          const SizedBox(height: 16),
                          Sparkline(
                              data: series, color: trendColor, height: 110),
                          const SizedBox(height: 14),
                          RangeSelector(
                            value: _range,
                            width: MediaQuery.of(context).size.width - 72,
                            onChanged: (r) => setState(() => _range = r),
                          ),
                          if (pnl != null) ...[
                            const SizedBox(height: 18),
                            _PnlRow(
                              acquired: ownedCard!.acquiredCents,
                              pnlCents: pnl.cents,
                              ratio: pnl.ratio,
                            ),
                          ],
                          const SizedBox(height: 22),
                          Text('COTE PAR ÉTAT', style: AppType.micro),
                          const SizedBox(height: 10),
                          _Grid(
                            entries: [
                              for (final c in Condition.values)
                                (c.label, quote?.byCondition[c] ?? 0),
                            ],
                          ),
                          if (quote != null && quote.byGrade.isNotEmpty) ...[
                            const SizedBox(height: 18),
                            Text('COTE GRADÉE', style: AppType.micro),
                            const SizedBox(height: 10),
                            _Grid(
                              entries: (quote.byGrade.entries.toList()
                                    ..sort((a, b) => b.value.compareTo(a.value)))
                                  .map((e) => (e.key, e.value))
                                  .toList(),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.06, end: 0),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
          // Bouton fermer
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
            right: 16,
            child: Pressable(
              onTap: () => Navigator.pop(context),
              child: Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.surface.withValues(alpha: 0.7),
                  border: Border.all(color: AppColors.hairlineHi),
                ),
                child: const Icon(Icons.close_rounded,
                    size: 18, color: AppColors.textPrimary),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PnlRow extends StatelessWidget {
  const _PnlRow({
    required this.acquired,
    required this.pnlCents,
    required this.ratio,
  });
  final int acquired;
  final int pnlCents;
  final double ratio;

  @override
  Widget build(BuildContext context) {
    final up = pnlCents >= 0;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceHi.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("PRIX D'ACHAT", style: AppType.micro),
                const SizedBox(height: 4),
                Text(Money.euros(acquired), style: AppType.bodyStrong),
              ],
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('PLUS-VALUE LATENTE', style: AppType.micro),
                const SizedBox(height: 4),
                Text(
                  '${up ? '+' : '-'}${Money.euros(pnlCents.abs())} (${Money.percent(ratio)})',
                  style: AppType.bodyStrong
                      .copyWith(color: up ? AppColors.bull : AppColors.bear),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Grid extends StatelessWidget {
  const _Grid({required this.entries});
  final List<(String, int)> entries;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final e in entries)
          Container(
            width: (MediaQuery.of(context).size.width - 72 - 16) / 3,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surfaceHi.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(e.$1, style: AppType.micro),
                const SizedBox(height: 4),
                Text(Money.euros(e.$2), style: AppType.moneyRow),
              ],
            ),
          ),
      ],
    );
  }
}
