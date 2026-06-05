import 'package:flutter/material.dart';
import '../domain/models/enums.dart';
import '../domain/models/owned_card.dart';
import '../domain/models/pokemon_card.dart';
import '../domain/services/pricing.dart';

/// Données de démonstration. En production, ces objets proviennent d'une API
/// (référentiel TCG + agrégateur de cotation) injectée dans les repositories.
abstract final class MockData {
  static const List<PokemonCard> cards = [
    PokemonCard(
      id: 'base1-4',
      name: 'Dracaufeu',
      hp: 120,
      types: [PokemonType.fire],
      rarity: Rarity.rare,
      numberInSet: '4',
      setSize: '102',
      setName: 'Set de Base',
      year: 1999,
      imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
      dominantColor: Color(0xFFFF6B4A),
    ),
    PokemonCard(
      id: 'swsh45-188',
      name: 'Dracaufeu VMAX',
      hp: 330,
      types: [PokemonType.fire],
      rarity: Rarity.alternativeArt,
      numberInSet: '188',
      setSize: '185',
      setName: 'Voltage Éclatant',
      year: 2020,
      imageUrl: 'https://images.pokemontcg.io/swsh45/188_hires.png',
      dominantColor: Color(0xFFFF8C42),
    ),
    PokemonCard(
      id: 'swsh7-215',
      name: 'Pikachu VMAX',
      hp: 310,
      types: [PokemonType.lightning],
      rarity: Rarity.secretRare,
      numberInSet: '215',
      setSize: '203',
      setName: 'Évolution Céleste',
      year: 2021,
      imageUrl: 'https://images.pokemontcg.io/swsh7/215_hires.png',
      dominantColor: Color(0xFFF5C451),
    ),
    PokemonCard(
      id: 'swsh9-154',
      name: 'Mewtwo VSTAR',
      hp: 280,
      types: [PokemonType.psychic],
      rarity: Rarity.ultraRare,
      numberInSet: '154',
      setSize: '172',
      setName: 'Stars Étincelantes',
      year: 2022,
      imageUrl: 'https://images.pokemontcg.io/swsh9/154_hires.png',
      dominantColor: Color(0xFFC77DFF),
    ),
    PokemonCard(
      id: 'sv1-245',
      name: 'Miraidon ex',
      hp: 220,
      types: [PokemonType.lightning],
      rarity: Rarity.ultraRare,
      numberInSet: '245',
      setSize: '198',
      setName: 'Écarlate et Violet',
      year: 2023,
      imageUrl: 'https://images.pokemontcg.io/sv1/245_hires.png',
      dominantColor: Color(0xFF22D3EE),
    ),
    PokemonCard(
      id: 'swsh12-197',
      name: 'Rayquaza VMAX',
      hp: 320,
      types: [PokemonType.dragon],
      rarity: Rarity.alternativeArt,
      numberInSet: '197',
      setSize: '195',
      setName: 'Zénith Suprême',
      year: 2022,
      imageUrl: 'https://images.pokemontcg.io/swsh12/197_hires.png',
      dominantColor: Color(0xFF4ED66B),
    ),
    PokemonCard(
      id: 'base1-2',
      name: 'Florizarre',
      hp: 100,
      types: [PokemonType.grass],
      rarity: Rarity.rare,
      numberInSet: '2',
      setSize: '102',
      setName: 'Set de Base',
      year: 1999,
      imageUrl: 'https://images.pokemontcg.io/base1/2_hires.png',
      dominantColor: Color(0xFF4ED66B),
    ),
    PokemonCard(
      id: 'sv4-231',
      name: 'Carmadura ex',
      hp: 300,
      types: [PokemonType.fighting],
      rarity: Rarity.secretRare,
      numberInSet: '231',
      setSize: '182',
      setName: 'Faille Paradoxe',
      year: 2023,
      imageUrl: 'https://images.pokemontcg.io/sv4/231_hires.png',
      dominantColor: Color(0xFFD9763C),
    ),
  ];

  static final List<Binder> binders = [
    const Binder(
      id: 'b-charizard',
      name: 'Mes Dracaufeu',
      icon: '🔥',
      accent: Color(0xFFFF6B4A),
    ),
    const Binder(
      id: 'b-swsh',
      name: 'Épée et Bouclier',
      icon: '⚔️',
      accent: Color(0xFF6366F1),
    ),
    const Binder(
      id: 'b-vintage',
      name: 'Vintage 1999',
      icon: '🏛️',
      accent: Color(0xFFF5C451),
    ),
  ];

  static List<OwnedCard> owned = [
    OwnedCard(
      uid: 'o-1',
      cardId: 'base1-4',
      condition: Condition.nearMint,
      grade: const Grade(company: GradingCompany.psa, score: 9),
      acquiredCents: 180000,
      acquiredAt: DateTime(2022, 6, 1),
      binderIds: const ['b-charizard', 'b-vintage'],
      favorite: true,
    ),
    OwnedCard(
      uid: 'o-2',
      cardId: 'swsh45-188',
      condition: Condition.nearMint,
      grade: const Grade(company: GradingCompany.raw),
      acquiredCents: 24000,
      acquiredAt: DateTime(2023, 2, 14),
      binderIds: const ['b-charizard', 'b-swsh'],
      favorite: true,
    ),
    OwnedCard(
      uid: 'o-3',
      cardId: 'swsh7-215',
      condition: Condition.nearMint,
      grade: const Grade(company: GradingCompany.psa, score: 10),
      acquiredCents: 41000,
      acquiredAt: DateTime(2023, 5, 30),
      binderIds: const ['b-swsh'],
      favorite: false,
    ),
    OwnedCard(
      uid: 'o-4',
      cardId: 'swsh9-154',
      condition: Condition.lightlyPlayed,
      grade: const Grade(company: GradingCompany.raw),
      acquiredCents: 6000,
      acquiredAt: DateTime(2023, 8, 11),
      binderIds: const ['b-swsh'],
      favorite: false,
    ),
    OwnedCard(
      uid: 'o-5',
      cardId: 'sv1-245',
      condition: Condition.nearMint,
      grade: const Grade(company: GradingCompany.bgs, score: 9.5),
      acquiredCents: 9000,
      acquiredAt: DateTime(2023, 11, 2),
      binderIds: const [],
      favorite: false,
    ),
    OwnedCard(
      uid: 'o-6',
      cardId: 'swsh12-197',
      condition: Condition.nearMint,
      grade: const Grade(company: GradingCompany.raw),
      acquiredCents: 13000,
      acquiredAt: DateTime(2023, 1, 20),
      binderIds: const ['b-swsh'],
      favorite: true,
    ),
    OwnedCard(
      uid: 'o-7',
      cardId: 'sv4-231',
      condition: Condition.nearMint,
      grade: const Grade(company: GradingCompany.psa, score: 10),
      acquiredCents: 28000,
      acquiredAt: DateTime(2024, 3, 15),
      binderIds: const [],
      favorite: false,
    ),
    OwnedCard(
      uid: 'o-8',
      cardId: 'base1-2',
      condition: Condition.played,
      grade: const Grade(company: GradingCompany.raw),
      acquiredCents: 8000,
      acquiredAt: DateTime(2021, 12, 1),
      binderIds: const ['b-vintage'],
      favorite: false,
    ),
  ];

  /// Spot Near Mint brut de référence par carte (centimes).
  static const Map<String, int> spotCents = {
    'base1-4': 52000,
    'swsh45-188': 38000,
    'swsh7-215': 22000,
    'swsh9-154': 4500,
    'sv1-245': 3200,
    'swsh12-197': 19000,
    'sv4-231': 9500,
    'base1-2': 14000,
  };

  /// Construit une cotation complète (par état + gradation) depuis le spot.
  static MarketQuote? quoteFor(String cardId) {
    final spot = spotCents[cardId];
    if (spot == null) return null;
    final byCondition = {
      for (final c in Condition.values) c: (spot * c.multiplier).round(),
    };
    final byGrade = <String, int>{};
    for (final entry in gradeMultipliers.entries) {
      if (entry.key == GradingCompany.raw) continue;
      for (final g in entry.value.entries) {
        byGrade['${entry.key.label} ${g.key}'] = (spot * g.value).round();
      }
    }
    return MarketQuote(
      cardId: cardId,
      spotCents: spot,
      byCondition: byCondition,
      byGrade: byGrade,
    );
  }
}
