import 'package:flutter/material.dart';
import '../core/motion/motion.dart';
import '../core/theme/app_typography.dart';
import '../core/utils/money.dart';

/// Montant animé : la valeur défile en douceur jusqu'au nouveau total quand
/// le portefeuille change (effet "odometer" des apps fintech premium).
class AnimatedMoney extends StatelessWidget {
  const AnimatedMoney({super.key, required this.cents, this.style});

  final int cents;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: cents.toDouble(), end: cents.toDouble()),
      duration: Motion.counter,
      curve: Motion.standard,
      builder: (_, value, __) => Text(
        Money.euros(value.round()),
        style: style ?? AppType.money,
      ),
    );
  }
}
