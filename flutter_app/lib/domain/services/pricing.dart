import '../models/enums.dart';
import '../models/owned_card.dart';

/// Cotation marché d'une carte, en centimes, par état et par gradation.
class MarketQuote {
  const MarketQuote({
    required this.cardId,
    required this.spotCents,
    required this.byCondition,
    required this.byGrade,
  });

  final String cardId;
  final int spotCents; // Near Mint brut de référence
  final Map<Condition, int> byCondition;
  final Map<String, int> byGrade; // ex: "PSA 10" -> cents
}

/// Service de cotation : règles pures de calcul de valeur. Aucune I/O.
abstract final class Pricing {
  /// Valeur courante (centimes) d'un exemplaire selon état/gradation.
  static int valueOf(OwnedCard owned, MarketQuote? quote) {
    if (quote == null) return 0;
    final base = quote.spotCents;
    if (owned.grade.isGraded) {
      final ladder = gradeMultipliers[owned.grade.company] ?? const {};
      final mult = ladder[owned.grade.score] ?? 1.0;
      return (base * mult).round();
    }
    return (base * owned.condition.multiplier).round();
  }

  /// Plus/moins-value latente d'un exemplaire.
  static ({int cents, double ratio}) unrealizedPnl(
    OwnedCard owned,
    MarketQuote? quote,
  ) {
    final current = valueOf(owned, quote);
    final cents = current - owned.acquiredCents;
    final ratio = owned.acquiredCents > 0 ? cents / owned.acquiredCents : 0.0;
    return (cents: cents, ratio: ratio);
  }
}
