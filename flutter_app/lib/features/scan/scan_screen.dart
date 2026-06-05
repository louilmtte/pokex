import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../data/mock_data.dart';
import '../../domain/models/pokemon_card.dart';
import '../../state/providers.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/pressable.dart';

/// « Scanner intelligent » : simulation du pipeline caméra → OCR → matching.
/// Le cadre de focus passe du blanc au vert fluo à mesure que le « cadrage »
/// se stabilise, puis une carte est identifiée et proposée à l'ajout.
class ScanScreen extends ConsumerStatefulWidget {
  const ScanScreen({super.key});

  @override
  ConsumerState<ScanScreen> createState() => _ScanScreenState();
}

enum _Phase { searching, locked, matched }

class _ScanScreenState extends ConsumerState<ScanScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _sweep = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1500),
  )..repeat(reverse: true);

  double _framing = 0;
  _Phase _phase = _Phase.searching;
  PokemonCard? _match;
  Timer? _timer;
  bool _added = false;

  @override
  void initState() {
    super.initState();
    _start();
  }

  void _start() {
    _framing = 0;
    _phase = _Phase.searching;
    _match = null;
    _added = false;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(milliseconds: 110), (t) {
      setState(() {
        _framing = (_framing + 0.08).clamp(0.0, 1.0).toDouble();
        if (_framing >= 0.82 && _phase == _Phase.searching) {
          _phase = _Phase.locked;
          HapticFeedback.mediumImpact();
          _identify();
        }
      });
    });
  }

  Future<void> _identify() async {
    await Future.delayed(const Duration(milliseconds: 700));
    if (!mounted) return;
    setState(() {
      _match = MockData.cards[2]; // Pikachu VMAX (démo)
      _phase = _Phase.matched;
    });
    HapticFeedback.selectionClick();
  }

  @override
  void dispose() {
    _sweep.dispose();
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final locked = _framing >= 0.82;
    final frameColor = Color.lerp(
      Colors.white,
      AppColors.mint,
      (_framing / 0.82).clamp(0.0, 1.0).toDouble(),
    )!;

    return SafeArea(
      bottom: false,
      child: Stack(
        children: [
          // Viewport simulé
          Positioned.fill(
            child: Container(color: Colors.black.withValues(alpha: 0.35)),
          ),

          // Cadre de focus
          Center(
            child: AspectRatio(
              aspectRatio: 1 / 1.395,
              child: FractionallySizedBox(
                widthFactor: 0.74,
                child: AnimatedBuilder(
                  animation: _sweep,
                  builder: (context, _) {
                    return CustomPaint(
                      painter: _FramePainter(
                        color: frameColor,
                        sweep: _sweep.value,
                        active: _framing,
                      ),
                    );
                  },
                ),
              ),
            ),
          ),

          // Bandeau OCR
          Positioned(
            top: 16,
            left: 20,
            right: 20,
            child: GlassCard(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: locked ? AppColors.mint : AppColors.neutral,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      switch (_phase) {
                        _Phase.searching => 'Recherche de carte…',
                        _Phase.locked => 'Carte verrouillée · OCR…',
                        _Phase.matched => 'Carte identifiée',
                      },
                      style: AppType.caption,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Résultat
          if (_phase == _Phase.matched && _match != null)
            Positioned(
              bottom: 120,
              left: 20,
              right: 20,
              child: GlassCard(
                glow: AppColors.violet,
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(_match!.imageUrl,
                          width: 64,
                          height: 89,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                              width: 64,
                              height: 89,
                              color: AppColors.surfaceHi)),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('IDENTIFIÉE · 96% de confiance',
                              style: AppType.micro),
                          const SizedBox(height: 2),
                          Text(_match!.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppType.headline),
                          Text(
                              '${_match!.number} · ${_match!.setName}',
                              style: AppType.micro.copyWith(
                                  color: AppColors.textTertiary)),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Pressable(
                                onTap: _added
                                    ? () {}
                                    : () {
                                        HapticFeedback.heavyImpact();
                                        ref
                                            .read(collectionProvider.notifier)
                                            .addCard(cardId: _match!.id);
                                        setState(() => _added = true);
                                      },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: _added
                                        ? AppColors.bull
                                        : AppColors.violet,
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: Text(
                                      _added ? '✓ Ajoutée' : 'Ajouter',
                                      style: AppType.caption
                                          .copyWith(color: Colors.white)),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Pressable(
                                onTap: () => setState(_start),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 8),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(999),
                                    border: Border.all(
                                        color: AppColors.hairlineHi),
                                  ),
                                  child: Text('Rescanner',
                                      style: AppType.caption),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.2, end: 0),
            ),
        ],
      ),
    );
  }
}

class _FramePainter extends CustomPainter {
  _FramePainter({required this.color, required this.sweep, required this.active});
  final Color color;
  final double sweep;
  final double active;

  @override
  void paint(Canvas canvas, Size size) {
    final rrect = RRect.fromRectAndRadius(
      Offset.zero & size,
      const Radius.circular(20),
    );

    // Lueur du cadre quand verrouillé
    if (active > 0.4) {
      canvas.drawRRect(
        rrect,
        Paint()
          ..color = color.withValues(alpha: (active - 0.4) * 0.6)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 14)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 3,
      );
    }

    // Coins
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round;
    const len = 30.0;
    final c = [
      [Offset(0, len), Offset.zero, Offset(len, 0)],
      [Offset(size.width - len, 0), Offset(size.width, 0), Offset(size.width, len)],
      [Offset(0, size.height - len), Offset(0, size.height), Offset(len, size.height)],
      [
        Offset(size.width - len, size.height),
        Offset(size.width, size.height),
        Offset(size.width, size.height - len)
      ],
    ];
    for (final corner in c) {
      final path = Path()
        ..moveTo(corner[0].dx, corner[0].dy)
        ..lineTo(corner[1].dx, corner[1].dy)
        ..lineTo(corner[2].dx, corner[2].dy);
      canvas.drawPath(path, paint);
    }

    // Ligne de balayage laser
    final y = sweep * size.height;
    canvas.drawLine(
      Offset(4, y),
      Offset(size.width - 4, y),
      Paint()
        ..color = color.withValues(alpha: active * 0.9)
        ..strokeWidth = 2
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4),
    );
  }

  @override
  bool shouldRepaint(_FramePainter old) =>
      old.sweep != sweep || old.color != color || old.active != active;
}
