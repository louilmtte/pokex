import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/motion/motion.dart';

/// Surface tactile universelle : enfoncement en ressort + retour haptique.
/// Toute interaction de l'app passe par lui (cohérence "Apple/Revolut").
class Pressable extends StatefulWidget {
  const Pressable({
    super.key,
    required this.child,
    this.onTap,
    this.scale = 0.94,
    this.haptic = true,
  });

  final Widget child;
  final VoidCallback? onTap;
  final double scale;
  final bool haptic;

  @override
  State<Pressable> createState() => _PressableState();
}

class _PressableState extends State<Pressable> {
  bool _down = false;

  void _set(bool v) {
    if (_down != v) setState(() => _down = v);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: widget.onTap == null ? null : (_) => _set(true),
      onTapUp: widget.onTap == null ? null : (_) => _set(false),
      onTapCancel: widget.onTap == null ? null : () => _set(false),
      onTap: widget.onTap == null
          ? null
          : () {
              if (widget.haptic) HapticFeedback.lightImpact();
              widget.onTap!();
            },
      child: AnimatedScale(
        scale: _down ? widget.scale : 1.0,
        duration: Motion.fast,
        curve: Motion.standard,
        child: AnimatedOpacity(
          opacity: _down ? 0.88 : 1.0,
          duration: Motion.fast,
          child: widget.child,
        ),
      ),
    );
  }
}
