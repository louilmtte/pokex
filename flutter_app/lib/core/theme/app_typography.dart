import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Échelle typographique : titres resserrés à tracking négatif (look premium),
/// chiffres tabulaires pour les montants. S'appuie sur la police système
/// (SF Pro sur iOS) pour un rendu natif sans coût de chargement.
abstract final class AppType {
  static const String? _family = null; // police système

  static const TextStyle display = TextStyle(
    fontFamily: _family,
    fontSize: 40,
    height: 1.05,
    fontWeight: FontWeight.w800,
    letterSpacing: -1.4,
    color: AppColors.textPrimary,
  );

  static const TextStyle title = TextStyle(
    fontFamily: _family,
    fontSize: 28,
    height: 1.1,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.6,
    color: AppColors.textPrimary,
  );

  static const TextStyle headline = TextStyle(
    fontFamily: _family,
    fontSize: 20,
    height: 1.15,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.3,
    color: AppColors.textPrimary,
  );

  static const TextStyle body = TextStyle(
    fontFamily: _family,
    fontSize: 15,
    height: 1.35,
    fontWeight: FontWeight.w500,
    letterSpacing: -0.1,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodyStrong = TextStyle(
    fontFamily: _family,
    fontSize: 15,
    height: 1.35,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.1,
    color: AppColors.textPrimary,
  );

  static const TextStyle caption = TextStyle(
    fontFamily: _family,
    fontSize: 13,
    height: 1.25,
    fontWeight: FontWeight.w600,
    color: AppColors.textSecondary,
  );

  static const TextStyle micro = TextStyle(
    fontFamily: _family,
    fontSize: 11,
    height: 1.2,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.3,
    color: AppColors.textTertiary,
  );

  /// Montants : grand, gras, chiffres tabulaires alignés.
  static const TextStyle money = TextStyle(
    fontFamily: _family,
    fontSize: 44,
    height: 1.0,
    fontWeight: FontWeight.w800,
    letterSpacing: -1.6,
    color: AppColors.textPrimary,
    fontFeatures: [FontFeature.tabularFigures()],
  );

  static const TextStyle moneyRow = TextStyle(
    fontFamily: _family,
    fontSize: 15,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.2,
    color: AppColors.textPrimary,
    fontFeatures: [FontFeature.tabularFigures()],
  );
}
