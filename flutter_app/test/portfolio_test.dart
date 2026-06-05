import 'package:flutter_test/flutter_test.dart';
import 'package:pocketvault/domain/models/enums.dart';
import 'package:pocketvault/domain/models/owned_card.dart';
import 'package:pocketvault/domain/services/portfolio.dart';
import 'package:pocketvault/domain/services/pricing.dart';

/// Tests de la logique métier pure : aucune dépendance Flutter/UI, ce qui
/// valide l'isolation de la couche domaine.
MarketQuote quote(int spot) => MarketQuote(
      cardId: 'x',
      spotCents: spot,
      byCondition: {
        for (final c in Condition.values) c: (spot * c.multiplier).round(),
      },
      byGrade: const {},
    );

OwnedCard owned({
  Condition condition = Condition.nearMint,
  Grade grade = const Grade(company: GradingCompany.raw),
  int acquired = 0,
  String uid = 'u',
  String cardId = 'x',
}) =>
    OwnedCard(
      uid: uid,
      cardId: cardId,
      condition: condition,
      grade: grade,
      acquiredCents: acquired,
      acquiredAt: DateTime(2024),
      binderIds: const [],
      favorite: false,
    );

void main() {
  group('Pricing', () {
    test('décote d\'état pour carte brute', () {
      expect(
        Pricing.valueOf(owned(condition: Condition.lightlyPlayed), quote(10000)),
        7800,
      );
    });

    test('multiplicateur PSA 10', () {
      expect(
        Pricing.valueOf(
          owned(grade: const Grade(company: GradingCompany.psa, score: 10)),
          quote(10000),
        ),
        75000,
      );
    });

    test('plus-value latente', () {
      final pnl = Pricing.unrealizedPnl(
        owned(
          grade: const Grade(company: GradingCompany.psa, score: 10),
          acquired: 20000,
        ),
        quote(10000),
      );
      expect(pnl.cents, 55000);
      expect(pnl.ratio, closeTo(2.75, 1e-9));
    });
  });

  group('Portfolio', () {
    test('agrège valeur, coût et top carte', () {
      final cards = [
        owned(uid: 'a', acquired: 1000),
        owned(
          uid: 'b',
          cardId: 'y',
          grade: const Grade(company: GradingCompany.psa, score: 9),
          acquired: 5000,
        ),
      ];
      MarketQuote? lookup(String id) => quote(id == 'y' ? 8000 : 2000);

      final stats = Portfolio.compute(cards, lookup);
      expect(stats.totalCostCents, 6000);
      expect(stats.totalValueCents, 2000 + (8000 * 3.1).round());
      expect(stats.topCardUid, 'b');
    });

    test('seriesDelta mesure la variation', () {
      final d = Portfolio.seriesDelta([100, 150]);
      expect(d.cents, 50);
      expect(d.ratio, closeTo(0.5, 1e-9));
    });
  });
}
