import 'dart:math';
import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_gradients.dart';

/// Toile de fond : dégradé violet→noir fixe + halos néon qui dérivent
/// lentement sous un fort flou (mesh gradient vivant). C'est le mouvement
/// perpétuel derrière le verre qui rend le glassmorphism "liquide".
class AuroraBackground extends StatefulWidget {
  const AuroraBackground({super.key, this.child});
  final Widget? child;

  @override
  State<AuroraBackground> createState() => _AuroraBackgroundState();
}

class _AuroraBackgroundState extends State<AuroraBackground>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 24),
  )..repeat();

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(gradient: AppGradients.appBackground),
      child: Stack(
        fit: StackFit.expand,
        children: [
          RepaintBoundary(
            child: AnimatedBuilder(
              animation: _c,
              builder: (_, __) => CustomPaint(
                painter: _AuroraPainter(_c.value),
                size: Size.infinite,
              ),
            ),
          ),
          if (widget.child != null) widget.child!,
        ],
      ),
    );
  }
}

class _Blob {
  const _Blob(this.color, this.bx, this.by, this.ampX, this.ampY, this.r, this.phase);
  final Color color;
  final double bx, by, ampX, ampY, r, phase;
}

class _AuroraPainter extends CustomPainter {
  _AuroraPainter(this.t);
  final double t;

  static const _blobs = [
    _Blob(AppColors.violet, 0.22, 0.16, 0.16, 0.05, 0.75, 0.0),
    _Blob(AppColors.magenta, 0.85, 0.10, 0.14, 0.06, 0.6, 1.6),
    _Blob(AppColors.indigo, 0.12, 0.42, 0.12, 0.07, 0.7, 3.0),
    _Blob(AppColors.cyan, 0.78, 0.40, 0.16, 0.05, 0.55, 4.4),
  ];

  @override
  void paint(Canvas canvas, Size size) {
    final tau = 2 * pi;
    final blurPaint = Paint()
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 80);

    for (final b in _blobs) {
      final cx = (b.bx + sin(t * tau + b.phase) * b.ampX) * size.width;
      final cy = (b.by + cos(t * tau * 1.3 + b.phase) * b.ampY) * size.height;
      final radius = b.r * size.width;
      final rect = Rect.fromCircle(center: Offset(cx, cy), radius: radius);
      blurPaint.shader = RadialGradient(
        colors: [b.color.withValues(alpha: 0.40), b.color.withValues(alpha: 0.0)],
      ).createShader(rect);
      canvas.drawCircle(Offset(cx, cy), radius, blurPaint);
    }
  }

  @override
  bool shouldRepaint(_AuroraPainter old) => old.t != t;
}
