import 'dart:math';
import 'mock_data.dart';

enum ChartRange { d7, d30, y1 }

extension ChartRangeX on ChartRange {
  String get label => switch (this) {
        ChartRange.d7 => '7J',
        ChartRange.d30 => '30J',
        ChartRange.y1 => '1A',
      };
  String get long => switch (this) {
        ChartRange.d7 => '7 jours',
        ChartRange.d30 => '30 jours',
        ChartRange.y1 => '1 an',
      };
  int get days => switch (this) {
        ChartRange.d7 => 7,
        ChartRange.d30 => 30,
        ChartRange.y1 => 365,
      };
}

/// Générateur déterministe d'historiques de prix (marche aléatoire bornée,
/// graine par carte) : courbes stables entre les rebuilds, dernier point
/// toujours ancré au spot affiché ailleurs dans l'app.
abstract final class PriceHistory {
  static int _seed(String id, int salt) {
    var h = 2166136261;
    for (final c in id.codeUnits) {
      h ^= c;
      h = (h * 16777619) & 0xFFFFFFFF;
    }
    return h ^ salt;
  }

  static List<int> series(String cardId, ChartRange range) {
    final spot = MockData.spotCents[cardId] ?? 10000;
    final rand = Random(_seed(cardId, range.days));
    final vol = range == ChartRange.y1 ? 0.012 : 0.02;
    const drift = -0.0008;

    final days = range.days;
    final step = max(1, (days / 60).round());
    final points = <int>[];
    var value = spot.toDouble();

    for (var d = 0; d <= days; d += step) {
      points.add(value.round());
      final shock = (rand.nextDouble() - 0.5) * 2 * vol + drift;
      value = value / (1 + shock);
    }
    return points.reversed.toList();
  }

  /// Série agrégée du portefeuille : somme des historiques des cartes possédées.
  static List<int> portfolioSeries(List<String> cardIds, ChartRange range) {
    List<int>? acc;
    for (final id in cardIds) {
      final s = series(id, range);
      if (acc == null) {
        acc = List<int>.from(s);
      } else {
        for (var i = 0; i < acc.length && i < s.length; i++) {
          acc[i] += s[i];
        }
      }
    }
    return acc ?? const [];
  }
}
