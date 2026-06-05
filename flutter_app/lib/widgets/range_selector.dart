import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/motion/motion.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import '../data/price_history.dart';

/// Segment de période (7J / 30J / 1A) avec pastille de sélection magnétique.
class RangeSelector extends StatelessWidget {
  const RangeSelector({
    super.key,
    required this.value,
    required this.onChanged,
    this.width = 210,
  });

  final ChartRange value;
  final ValueChanged<ChartRange> onChanged;
  final double width;

  @override
  Widget build(BuildContext context) {
    const ranges = ChartRange.values;
    final seg = width / ranges.length;
    final index = ranges.indexOf(value);

    return Container(
      width: width,
      height: 34,
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppColors.surfaceHi.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Stack(
        children: [
          AnimatedAlign(
            duration: Motion.base,
            curve: Motion.emphasized,
            alignment: Alignment(-1 + (index / (ranges.length - 1)) * 2, 0),
            child: Container(
              width: seg - 6,
              height: 28,
              decoration: BoxDecoration(
                color: AppColors.violet.withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ),
          Row(
            children: [
              for (final r in ranges)
                Expanded(
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () {
                      HapticFeedback.selectionClick();
                      onChanged(r);
                    },
                    child: Center(
                      child: Text(
                        r.label,
                        style: AppType.caption.copyWith(
                          color: r == value
                              ? Colors.white
                              : AppColors.textTertiary,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
