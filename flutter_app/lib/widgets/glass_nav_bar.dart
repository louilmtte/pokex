import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/motion/motion.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_gradients.dart';
import '../core/theme/app_typography.dart';

class NavDestination {
  const NavDestination(this.icon, this.label, {this.center = false});
  final IconData icon;
  final String label;
  final bool center;
}

/// Barre d'onglets flottante en verre dépoli : halo lumineux magnétique qui
/// glisse sous l'onglet actif, icônes qui grossissent, bouton central néon.
class GlassNavBar extends StatelessWidget {
  const GlassNavBar({
    super.key,
    required this.index,
    required this.destinations,
    required this.onSelect,
  });

  final int index;
  final List<NavDestination> destinations;
  final ValueChanged<int> onSelect;

  @override
  Widget build(BuildContext context) {
    final n = destinations.length;
    return Padding(
      padding: EdgeInsets.fromLTRB(
        16,
        0,
        16,
        MediaQuery.of(context).padding.bottom + 10,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(999),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
          child: Container(
            height: 66,
            decoration: BoxDecoration(
              color: AppColors.surface.withValues(alpha: 0.62),
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: AppColors.hairlineHi),
              boxShadow: const [
                BoxShadow(color: Color(0x66000000), blurRadius: 24, offset: Offset(0, 12)),
              ],
            ),
            child: LayoutBuilder(
              builder: (context, c) {
                final slot = c.maxWidth / n;
                return Stack(
                  children: [
                    // Halo glissant
                    AnimatedPositioned(
                      duration: Motion.base,
                      curve: Motion.emphasized,
                      left: slot * index,
                      top: 0,
                      bottom: 0,
                      width: slot,
                      child: Center(
                        child: Container(
                          width: 6,
                          height: 6,
                          margin: const EdgeInsets.only(top: 8),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.violet,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.violet.withValues(alpha: 0.9),
                                blurRadius: 10,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Row(
                      children: [
                        for (var i = 0; i < n; i++)
                          Expanded(
                            child: _NavItem(
                              dest: destinations[i],
                              active: i == index,
                              onTap: () {
                                HapticFeedback.lightImpact();
                                onSelect(i);
                              },
                            ),
                          ),
                      ],
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({required this.dest, required this.active, required this.onTap});
  final NavDestination dest;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    if (dest.center) {
      return GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Center(
          child: Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: AppGradients.accent,
              boxShadow: [
                BoxShadow(
                  color: AppColors.violet.withValues(alpha: 0.6),
                  blurRadius: 16,
                ),
              ],
            ),
            child: Icon(dest.icon, color: Colors.white, size: 26),
          ),
        ),
      );
    }

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedScale(
            scale: active ? 1.12 : 1.0,
            duration: Motion.fast,
            curve: Motion.emphasized,
            child: Icon(
              dest.icon,
              size: 22,
              color: active ? AppColors.violet : AppColors.textTertiary,
            ),
          ),
          const SizedBox(height: 3),
          AnimatedOpacity(
            opacity: active ? 1 : 0.6,
            duration: Motion.fast,
            child: Text(
              dest.label,
              style: AppType.micro.copyWith(
                color: active ? AppColors.textPrimary : AppColors.textTertiary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
