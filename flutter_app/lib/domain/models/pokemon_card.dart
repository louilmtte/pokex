import 'package:flutter/material.dart';
import 'enums.dart';

/// Carte du référentiel TCG (immuable). Distincte de l'exemplaire possédé.
@immutable
class PokemonCard {
  const PokemonCard({
    required this.id,
    required this.name,
    required this.hp,
    required this.types,
    required this.rarity,
    required this.numberInSet,
    required this.setSize,
    required this.setName,
    required this.year,
    required this.imageUrl,
    required this.dominantColor,
  });

  final String id;
  final String name;
  final int? hp;
  final List<PokemonType> types;
  final Rarity rarity;
  final String numberInSet;
  final String setSize;
  final String setName;
  final int year;
  final String imageUrl;
  final Color dominantColor;

  String get number => '$numberInSet/$setSize';
}
