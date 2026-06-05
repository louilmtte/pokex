import '../models/owned_card.dart';
import 'pricing.dart';

/// Statistiques agrégées du portefeuille pour le tableau de bord.
class PortfolioStats {
  const PortfolioStats({
    required this.totalValueCents,
    required this.totalCostCents,
    required this.unrealizedCents,
    required this.unrealizedRatio,
    required this.count,
    required this.uniqueCount,
    required this.topCardUid,
    required this.topCardValueCents,
  });

  final int totalValueCents;
  final int totalCostCents;
  final int unrealizedCents;
  final double unrealizedRatio;
  final int count;
  final int uniqueCount;
  final String? topCardUid;
  final int topCardValueCents;

  static const empty = PortfolioStats(
    totalValueCents: 0,
    totalCostCents: 0,
    unrealizedCents: 0,
    unrealizedRatio: 0,
    count: 0,
    uniqueCount: 0,
    topCardUid: null,
    topCardValueCents: 0,
  );
}

typedef QuoteLookup = MarketQuote? Function(String cardId);

/// Service portefeuille : agrégation pure et déterministe.
abstract final class Portfolio {
  static PortfolioStats compute(List<OwnedCard> owned, QuoteLookup getQuote) {
    var totalValue = 0;
    var totalCost = 0;
    var topValue = 0;
    String? topUid;
    final unique = <String>{};

    for (final card in owned) {
      final value = Pricing.valueOf(card, getQuote(card.cardId));
      totalValue += value;
      totalCost += card.acquiredCents;
      unique.add(card.cardId);
      if (value > topValue) {
        topValue = value;
        topUid = card.uid;
      }
    }

    final unrealized = totalValue - totalCost;
    return PortfolioStats(
      totalValueCents: totalValue,
      totalCostCents: totalCost,
      unrealizedCents: unrealized,
      unrealizedRatio: totalCost > 0 ? unrealized / totalCost : 0,
      count: owned.length,
      uniqueCount: unique.length,
      topCardUid: topUid,
      topCardValueCents: topValue,
    );
  }

  /// Variation entre premier et dernier point d'une série.
  static ({int cents, double ratio}) seriesDelta(List<int> series) {
    if (series.length < 2) return (cents: 0, ratio: 0);
    final first = series.first;
    final last = series.last;
    final cents = last - first;
    return (cents: cents, ratio: first > 0 ? cents / first : 0);
  }
}
