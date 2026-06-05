import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';

/// Sparkline boursière : courbe lissée (Catmull-Rom) + dégradé de remplissage
/// + point de tête lumineux. Couleur sémantique bull/bear automatique.
class Sparkline extends StatelessWidget {
  const Sparkline({
    super.key,
    required this.data,
    this.height = 96,
    this.fill = true,
    this.strokeWidth = 2.4,
    this.color,
  });

  final List<int> data;
  final double height;
  final bool fill;
  final double strokeWidth;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final bullish = data.length < 2 || data.last >= data.first;
    final c = color ?? (bullish ? AppColors.bull : AppColors.bear);
    return SizedBox(
      height: height,
      width: double.infinity,
      child: CustomPaint(
        painter: _SparkPainter(data, c, fill, strokeWidth),
      ),
    );
  }
}

class _SparkPainter extends CustomPainter {
  _SparkPainter(this.data, this.color, this.fill, this.strokeWidth);
  final List<int> data;
  final Color color;
  final bool fill;
  final double strokeWidth;

  @override
  void paint(Canvas canvas, Size size) {
    if (data.length < 2) return;
    final pad = strokeWidth + 2;
    final minV = data.reduce((a, b) => a < b ? a : b);
    final maxV = data.reduce((a, b) => a > b ? a : b);
    final span = (maxV - minV) == 0 ? 1 : (maxV - minV);

    final pts = <Offset>[];
    for (var i = 0; i < data.length; i++) {
      final x = pad + (i / (data.length - 1)) * (size.width - pad * 2);
      final y = size.height -
          pad -
          ((data[i] - minV) / span) * (size.height - pad * 2);
      pts.add(Offset(x, y));
    }

    final path = _smoothPath(pts);

    if (fill) {
      final area = Path.from(path)
        ..lineTo(pts.last.dx, size.height)
        ..lineTo(pts.first.dx, size.height)
        ..close();
      final fillPaint = Paint()
        ..shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [color.withValues(alpha: 0.34), color.withValues(alpha: 0.0)],
        ).createShader(Offset.zero & size);
      canvas.drawPath(area, fillPaint);
    }

    canvas.drawPath(
      path,
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );

    // Point de tête lumineux.
    final head = pts.last;
    canvas.drawCircle(head, 5, Paint()..color = color.withValues(alpha: 0.25));
    canvas.drawCircle(head, 2.6, Paint()..color = color);
  }

  Path _smoothPath(List<Offset> pts) {
    final path = Path()..moveTo(pts.first.dx, pts.first.dy);
    for (var i = 0; i < pts.length - 1; i++) {
      final p0 = pts[i == 0 ? 0 : i - 1];
      final p1 = pts[i];
      final p2 = pts[i + 1];
      final p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
      final cp1 = Offset(p1.dx + (p2.dx - p0.dx) / 6, p1.dy + (p2.dy - p0.dy) / 6);
      final cp2 = Offset(p2.dx - (p3.dx - p1.dx) / 6, p2.dy - (p3.dy - p1.dy) / 6);
      path.cubicTo(cp1.dx, cp1.dy, cp2.dx, cp2.dy, p2.dx, p2.dy);
    }
    return path;
  }

  @override
  bool shouldRepaint(_SparkPainter old) =>
      old.data != data || old.color != color;
}
