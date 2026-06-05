import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Types Pokémon avec métadonnées de présentation (couleur, libellé, glyphe).
enum PokemonType {
  fire('Feu', Color(0xFFFF6B4A), '🔥'),
  water('Eau', Color(0xFF4AA8FF), '💧'),
  grass('Plante', Color(0xFF4ED66B), '🍃'),
  lightning('Électrik', Color(0xFFF5C451), '⚡'),
  psychic('Psy', Color(0xFFC77DFF), '🔮'),
  fighting('Combat', Color(0xFFD9763C), '🥊'),
  dragon('Dragon', Color(0xFFE0B341), '🐉'),
  colorless('Incolore', Color(0xFFD7DCE6), '⭐');

  const PokemonType(this.label, this.color, this.glyph);
  final String label;
  final Color color;
  final String glyph;
}

/// Rareté avec rang (pour le tri) et couleur.
enum Rarity {
  common('Commune', 0, AppColors.neutral),
  rare('Rare', 2, AppColors.cyan),
  ultraRare('Ultra-Rare', 3, AppColors.violet),
  alternativeArt('Alternative', 4, AppColors.magenta),
  secretRare('Secrète', 5, AppColors.gold);

  const Rarity(this.label, this.rank, this.color);
  final String label;
  final int rank;
  final Color color;
}

/// État physique d'une carte brute (avec décote appliquée au prix Near Mint).
enum Condition {
  nearMint('Near Mint', 'NM', 1.0),
  lightlyPlayed('Lightly Played', 'LP', 0.78),
  played('Played', 'PL', 0.55),
  poor('Poor', 'PO', 0.30);

  const Condition(this.label, this.short, this.multiplier);
  final String label;
  final String short;
  final double multiplier;
}

/// Maison de gradation.
enum GradingCompany {
  raw('Brute', AppColors.neutral),
  psa('PSA', AppColors.bear),
  pca('PCA', AppColors.cyan),
  bgs('Beckett', AppColors.gold);

  const GradingCompany(this.label, this.color);
  final String label;
  final Color color;
}

/// Multiplicateurs de cote selon note de gradation (vs Near Mint brut).
const Map<GradingCompany, Map<num, double>> gradeMultipliers = {
  GradingCompany.raw: {0: 1.0},
  GradingCompany.psa: {7: 1.4, 8: 1.9, 9: 3.1, 10: 7.5},
  GradingCompany.pca: {7: 1.3, 8: 1.7, 9: 2.6, 10: 5.8},
  GradingCompany.bgs: {8: 2.0, 9: 3.4, 9.5: 5.2, 10: 12.0},
};
