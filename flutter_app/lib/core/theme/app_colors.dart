import 'package:flutter/material.dart';

/// Palette PocketVault.
///
/// Direction artistique : fond dégradé violet profond fondu vers le noir
/// (esthétique fintech premium), surfaces en verre, accents néon.
/// Les composants ne consomment que ces tokens — jamais de couleur en dur.
abstract final class AppColors {
  // Fonds (du haut violet au bas quasi-noir)
  static const Color violetDeep = Color(0xFF2E1D52);
  static const Color violetMid = Color(0xFF1B1430);
  static const Color ink = Color(0xFF0C0A12);
  static const Color black = Color(0xFF060509);

  // Surfaces verre / cartes
  static const Color surface = Color(0xFF15111F);
  static const Color surfaceHi = Color(0xFF1E1830);
  static const Color hairline = Color(0x14FFFFFF); // 8% blanc
  static const Color hairlineHi = Color(0x24FFFFFF);

  // Texte
  static const Color textPrimary = Color(0xFFF5F3FA);
  static const Color textSecondary = Color(0xFFB7AECB);
  static const Color textTertiary = Color(0xFF7D7596);

  // Accents néon
  static const Color violet = Color(0xFF8B5CF6);
  static const Color indigo = Color(0xFF6366F1);
  static const Color magenta = Color(0xFFC026D3);
  static const Color cyan = Color(0xFF22D3EE);
  static const Color mint = Color(0xFF34F5C5);

  // Marché
  static const Color bull = Color(0xFF3DDC97);
  static const Color bear = Color(0xFFFF5C7A);
  static const Color neutral = Color(0xFF8A82A0);

  // Or (cartes précieuses / accents premium)
  static const Color gold = Color(0xFFF5C451);
}
