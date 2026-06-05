import 'dart:ui';
import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_gradients.dart';

/// Surface en verre dépoli — le matériau signature de l'app.
///
/// Empile : flou gaussien du fond (BackdropFilter) + teinte translucide +
/// reflet diagonal + liseré clair (arête du verre) + halo optionnel.
class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.radius = 22,
    this.blur = 24,
    this.tint = const Color(0x33161226),
    this.glow,
    this.sheen = true,
  });

  final Widget child;
  final EdgeInsets padding;
  final double radius;
  final double blur;
  final Color tint;
  final Color? glow;
  final bool sheen;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(radius),
        boxShadow: [
          BoxShadow(
            color: glow?.withValues(alpha: 0.45) ?? Colors.black.withValues(alpha: 0.35),
            blurRadius: glow != null ? 28 : 22,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            decoration: BoxDecoration(
              color: tint,
              borderRadius: BorderRadius.circular(radius),
              gradient: sheen ? AppGradients.glassSheen : null,
              border: Border.all(color: AppColors.hairlineHi, width: 1),
            ),
            child: Stack(
              children: [
                // Arête de lumière en haut
                Positioned(
                  top: 0,
                  left: 14,
                  right: 14,
                  child: Container(
                    height: 1.5,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0x80FFFFFF), Color(0x00FFFFFF)],
                      ),
                    ),
                  ),
                ),
                Padding(padding: padding, child: child),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
