import 'dart:async';
import 'package:flutter/material.dart';
import 'package:sensors_plus/sensors_plus.dart';

import '../core/theme/app_colors.dart';
import '../core/theme/app_gradients.dart';
import '../core/theme/app_typography.dart';
import '../domain/models/pokemon_card.dart';

/// « La Carte Pokémon Virtuelle ».
///
/// Effet holographique piloté par le gyroscope : inclinaison 3D (perspective)
/// + voile prismatique qui glisse à contre-sens + glare spéculaire + halo
/// coloré. L'intensité suit la rareté (une carte secrète irise plus fort).
class HoloCard extends StatefulWidget {
  const HoloCard({
    super.key,
    required this.card,
    this.width = 230,
    this.heroTag,
    this.onTap,
    this.intensity = 1.0,
  });

  final PokemonCard card;
  final double width;
  final Object? heroTag;
  final VoidCallback? onTap;
  final double intensity;

  static const aspect = 1.395; // ratio carte 63x88mm

  @override
  State<HoloCard> createState() => _HoloCardState();
}

class _HoloCardState extends State<HoloCard> {
  double _roll = 0; // -1..1 gauche/droite
  double _pitch = 0; // -1..1 avant/arrière
  StreamSubscription? _sub;

  @override
  void initState() {
    super.initState();
    // Le gyroscope renvoie des vitesses angulaires (rad/s) ; on intègre une
    // inclinaison amortie et bornée pour un mouvement doux, sans dérive.
    _sub = gyroscopeEventStream().listen((e) {
      if (!mounted) return;
      setState(() {
        _roll = ((_roll + e.y * 0.04).clamp(-1.0, 1.0) * 0.92).toDouble();
        _pitch = ((_pitch + e.x * 0.04).clamp(-1.0, 1.0) * 0.92).toDouble();
      });
    }, onError: (_) {});
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  double get _strength {
    final rank = widget.card.rarity.rank; // 0..5
    return (0.25 + (rank / 5) * 0.75) * widget.intensity;
  }

  @override
  Widget build(BuildContext context) {
    final w = widget.width;
    final h = w * HoloCard.aspect;
    final s = _strength;

    final transform = Matrix4.identity()
      ..setEntry(3, 2, 0.0012)
      ..rotateY(_roll * 0.18)
      ..rotateX(-_pitch * 0.18);

    Widget card = Transform(
      alignment: Alignment.center,
      transform: transform,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: SizedBox(
          width: w,
          height: h,
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Artwork
              _Artwork(card: widget.card, tag: widget.heroTag),

              // Voile prismatique (translation inverse à l'inclinaison)
              Transform.translate(
                offset: Offset(_roll * w * 0.5, _pitch * h * 0.3),
                child: Transform.rotate(
                  angle: 0.45,
                  child: Opacity(
                    opacity:
                        (s * (0.18 + _roll.abs() * 0.4)).clamp(0.0, 0.7).toDouble(),
                    child: const DecoratedBox(
                      decoration: BoxDecoration(gradient: AppGradients.holo),
                    ),
                  ),
                ),
              ),

              // Glare spéculaire (suit la lumière)
              Transform.translate(
                offset: Offset(-_roll * w * 0.4, -_pitch * h * 0.3),
                child: Opacity(
                  opacity: s * 0.5,
                  child: const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Color(0x00FFFFFF),
                          Color(0x8CFFFFFF),
                          Color(0x00FFFFFF),
                        ],
                        stops: [0.35, 0.5, 0.65],
                      ),
                    ),
                  ),
                ),
              ),

              // Bordure de rareté
              IgnorePointer(
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: widget.card.rarity.color.withValues(alpha: 0.6),
                      width: 1.5,
                    ),
                  ),
                ),
              ),

              // Bandeau d'info bas
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: _InfoBar(card: widget.card),
              ),
            ],
          ),
        ),
      ),
    );

    return GestureDetector(
      onTap: widget.onTap,
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: widget.card.dominantColor.withValues(alpha: 0.35 * s + 0.12),
              blurRadius: 28,
              spreadRadius: -4,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: card,
      ),
    );
  }
}

class _Artwork extends StatelessWidget {
  const _Artwork({required this.card, required this.tag});
  final PokemonCard card;
  final Object? tag;

  @override
  Widget build(BuildContext context) {
    final img = Image.network(
      card.imageUrl,
      fit: BoxFit.cover,
      loadingBuilder: (_, child, progress) => progress == null
          ? child
          : Container(color: AppColors.surfaceHi),
      errorBuilder: (_, __, ___) => Container(
        color: AppColors.surfaceHi,
        alignment: Alignment.center,
        child: Text(card.types.first.glyph, style: const TextStyle(fontSize: 48)),
      ),
    );
    return tag != null ? Hero(tag: tag!, child: img) : img;
  }
}

class _InfoBar extends StatelessWidget {
  const _InfoBar({required this.card});
  final PokemonCard card;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 28, 12, 12),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0x00000000), Color(0xD1000000)],
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(card.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppType.bodyStrong),
              ),
              Container(
                width: 22,
                height: 22,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: card.types.first.color,
                  shape: BoxShape.circle,
                ),
                child: Text(card.types.first.glyph,
                    style: const TextStyle(fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            '${card.number} · ${card.rarity.label.toUpperCase()}',
            style: AppType.micro.copyWith(color: card.rarity.color),
          ),
        ],
      ),
    );
  }
}
