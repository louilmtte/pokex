import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/mock_data.dart';
import '../data/price_history.dart';
import '../domain/models/enums.dart';
import '../domain/models/owned_card.dart';
import '../domain/models/pokemon_card.dart';
import '../domain/services/portfolio.dart';
import '../domain/services/pricing.dart';

/// Référentiel des cartes indexé par id (immuable).
final cardsByIdProvider = Provider<Map<String, PokemonCard>>((ref) {
  return {for (final c in MockData.cards) c.id: c};
});

/// Cotations indexées par cardId.
final quoteLookupProvider = Provider<QuoteLookup>((ref) {
  return MockData.quoteFor;
});

/// Classeurs.
final bindersProvider = Provider((ref) => MockData.binders);

/// Contrôleur de la collection : source de vérité des exemplaires possédés.
/// Toutes les mutations métier passent par ici (favori, ajout, rangement).
class CollectionController extends StateNotifier<List<OwnedCard>> {
  CollectionController() : super(MockData.owned);

  void toggleFavorite(String uid) {
    state = [
      for (final o in state)
        if (o.uid == uid) o.copyWith(favorite: !o.favorite) else o,
    ];
  }

  void setCondition(String uid, Condition condition) {
    state = [
      for (final o in state)
        if (o.uid == uid) o.copyWith(condition: condition) else o,
    ];
  }

  String addCard({
    required String cardId,
    Grade grade = const Grade(company: GradingCompany.raw),
  }) {
    final uid = 'o-${DateTime.now().microsecondsSinceEpoch}';
    state = [
      OwnedCard(
        uid: uid,
        cardId: cardId,
        condition: Condition.nearMint,
        grade: grade,
        acquiredCents: 0,
        acquiredAt: DateTime.now(),
        binderIds: const [],
        favorite: false,
      ),
      ...state,
    ];
    return uid;
  }
}

final collectionProvider =
    StateNotifierProvider<CollectionController, List<OwnedCard>>(
  (ref) => CollectionController(),
);

/// Période sélectionnée (partagée Dashboard/Marché/Détail).
final rangeProvider = StateProvider<ChartRange>((ref) => ChartRange.d30);

/// Statistiques du portefeuille (dérivé pur).
final portfolioStatsProvider = Provider<PortfolioStats>((ref) {
  final owned = ref.watch(collectionProvider);
  final getQuote = ref.watch(quoteLookupProvider);
  return Portfolio.compute(owned, getQuote);
});

/// Série agrégée du portefeuille pour la courbe du header.
final portfolioSeriesProvider = Provider<List<int>>((ref) {
  final owned = ref.watch(collectionProvider);
  final range = ref.watch(rangeProvider);
  final ids = owned.map((o) => o.cardId).toSet().toList();
  return PriceHistory.portfolioSeries(ids, range);
});
