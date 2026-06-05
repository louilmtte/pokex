import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_typography.dart';

/// Thème Material sombre de l'app. On reste minimal : la majorité du style
/// vient des widgets custom (verre, dégradés). Material ne sert qu'au socle.
abstract final class AppTheme {
  static ThemeData get dark {
    final base = ThemeData.dark(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: Colors.transparent,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.violet,
        secondary: AppColors.cyan,
        surface: AppColors.surface,
        onSurface: AppColors.textPrimary,
      ),
      textTheme: base.textTheme.copyWith(
        displayLarge: AppType.display,
        titleLarge: AppType.title,
        headlineSmall: AppType.headline,
        bodyMedium: AppType.body,
        labelSmall: AppType.micro,
      ),
      splashFactory: NoSplash.splashFactory,
      highlightColor: Colors.transparent,
      splashColor: Colors.transparent,
    );
  }
}
