import 'package:flutter/animation.dart';

/// Langage de mouvement : durées et courbes partagées. Tout repose sur des
/// courbes douces (easeOutCubic) et des ressorts pour un ressenti "Apple".
abstract final class Motion {
  static const Duration fast = Duration(milliseconds: 160);
  static const Duration base = Duration(milliseconds: 280);
  static const Duration slow = Duration(milliseconds: 460);
  static const Duration counter = Duration(milliseconds: 900);

  static const Curve standard = Curves.easeOutCubic;
  static const Curve emphasized = Curves.easeOutBack;
  static const Curve inOut = Curves.easeInOutCubic;
}
