import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/money.dart';
import '../../data/mock_data.dart';
import '../../data/price_history.dart';
import '../../domain/services/portfolio.dart';
import '../../state/providers.dart';
import '../../widgets/pressable.dart';
import '../../widgets/range_selector.dart';
import '../../widgets/sparkline.dart';
import '../detail/card_detail_screen.dart';

/// « Marché » : watchlist des cartes possédées, cotées avec mini-courbe et
/// variation, façon liste de valeurs boursières.
class MarketScreen extends ConsumerStatefulWidget {
  const MarketScreen({super.key});

  @override
  ConsumerState<MarketScreen> createState() => _MarketScreenState();
}

class _MarketScreenState extends ConsumerState<MarketScreen> {
  ChartRange _range = ChartRange.d7;

  @override
  Widget build(BuildContext context) {
    final owned = ref.watch(collectionProvider);
    final cardsById = ref.watch(cardsByIdProvider);

    final ids = owned.map((o) => o.cardId).toSet().toList()
      ..sort((a, b) =>
          (MockData.spotCents[b] ?? 0).compareTo(MockData.spotCents[a] ?? 0));

    return SafeArea(
      bottom: false,
      child: ListView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 140),
        children: [
          Text('Marché', style: AppType.title),
          const SizedBox(height: 4),
          Text('Cotation Near Mint · ${ids.length} cartes suivies',
              style: AppType.caption.copyWith(color: AppColors.textTertiary)),
          const SizedBox(height: 16),
          RangeSelector(
            value: _range,
            onChanged: (r) => setState(() => _range = r),
          ),
          const SizedBox(height: 16),
          for (final id in ids)
            Builder(builder: (context) {
              final card = cardsById[id];
              if (card == null) return const SizedBox.shrink();
              final series = PriceHistory.series(id, _range);
              final delta = Portfolio.seriesDelta(series);
              final color =
                  delta.cents >= 0 ? AppColors.bull : AppColors.bear;
              final spot = MockData.spotCents[id] ?? 0;
              return Pressable(
                onTap: () => Navigator.of(context).push(
                  PageRouteBuilder(
                    opaque: false,
                    barrierColor: Colors.black54,
                    transitionDuration: const Duration(milliseconds: 420),
                    pageBuilder: (_, __, ___) => CardDetailScreen(
                        uid: id, cardId: id, heroTag: 'mkt-$id'),
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(card.imageUrl,
                            width: 40,
                            height: 56,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                                width: 40,
                                height: 56,
                                color: AppColors.surfaceHi)),
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
                            Text(card.setName,
                                style: AppType.micro.copyWith(
                                    color: AppColors.textTertiary)),
                          ],
                        ),
                      ),
                      SizedBox(
                        width: 64,
                        height: 34,
                        child: Sparkline(
                            data: series,
                            color: color,
                            fill: false,
                            strokeWidth: 1.8,
                            height: 34),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(Money.euros(spot), style: AppType.moneyRow),
                          Text(Money.percent(delta.ratio),
                              style: AppType.micro.copyWith(color: color)),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}
