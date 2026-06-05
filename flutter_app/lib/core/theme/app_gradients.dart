import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Dégradés réutilisables de l'app.
abstract final class AppGradients {
  /// Fond global : violet profond en haut, fondu vers le noir en bas.
  static const LinearGradient appBackground = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      AppColors.violetDeep,
      AppColors.violetMid,
      AppColors.ink,
      AppColors.black,
    ],
    stops: [0.0, 0.32, 0.66, 1.0],
  );

  /// Disque d'accent (bouton scan, avatars).
  static const LinearGradient accent = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.violet, AppColors.indigo],
  );

  /// Voile holographique prismatique des cartes.
  static const LinearGradient holo = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0x008B5CF6),
      Color(0xCC8B5CF6),
      Color(0xCC22D3EE),
      Color(0xCC34F5C5),
      Color(0x00A3E635),
    ],
    stops: [0.0, 0.28, 0.5, 0.72, 1.0],
  );

  /// Reflet diagonal du verre.
  static const LinearGradient glassSheen = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment(0.9, 1.0),
    colors: [Color(0x24FFFFFF), Color(0x08FFFFFF), Color(0x00FFFFFF)],
  );
}
