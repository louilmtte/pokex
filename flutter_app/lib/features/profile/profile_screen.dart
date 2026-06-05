import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/money.dart';
import '../../state/providers.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/pressable.dart';

/// Écran « Profil » : carte d'identité du dresseur, plan, raccourcis.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(portfolioStatsProvider);

    return SafeArea(
      bottom: false,
      child: ListView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 140),
        children: [
          // En-tête identité
          Row(
            children: [
              Container(
                width: 64,
                height: 64,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: [AppColors.violet, AppColors.magenta],
                  ),
                  border: Border.all(color: AppColors.hairlineHi, width: 1.5),
                ),
                child: const Text('NB',
                    style:
                        TextStyle(fontWeight: FontWeight.w800, fontSize: 22)),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Naïm Bada', style: AppType.headline),
                    const SizedBox(height: 2),
                    Text('@dresseur_holo',
                        style: AppType.caption
                            .copyWith(color: AppColors.textTertiary)),
                  ],
                ),
              ),
              Pressable(
                onTap: () {},
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.surfaceHi.withValues(alpha: 0.6),
                    border: Border.all(color: AppColors.hairline),
                  ),
                  child: const Icon(Icons.qr_code_rounded,
                      size: 20, color: AppColors.textSecondary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Carte plan « Collector »
          GlassCard(
            glow: AppColors.violet,
            padding: const EdgeInsets.all(18),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text('Collector', style: AppType.bodyStrong),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.gold.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text('PRO',
                                style: AppType.micro
                                    .copyWith(color: AppColors.gold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Portefeuille suivi en continu',
                        style: AppType.caption
                            .copyWith(color: AppColors.textTertiary),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(Money.compact(stats.totalValueCents),
                        style: AppType.headline),
                    Text('${stats.count} cartes',
                        style: AppType.micro
                            .copyWith(color: AppColors.textTertiary)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          _Section(title: 'Collection', tiles: const [
            (Icons.group_add_rounded, 'Inviter des amis', 'Gagnez des boosters'),
            (Icons.workspace_premium_rounded, 'Passer Collector+', 'Cotation temps réel'),
          ]),
          const SizedBox(height: 16),
          _Section(title: 'Compte', tiles: const [
            (Icons.help_outline_rounded, 'Aide', null),
            (Icons.settings_rounded, 'Réglages', null),
            (Icons.menu_book_rounded, 'Apprendre', null),
          ]),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.tiles});
  final String title;
  final List<(IconData, String, String?)> tiles;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 10),
          child: Text(title.toUpperCase(), style: AppType.micro),
        ),
        GlassCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              for (var i = 0; i < tiles.length; i++) ...[
                _Tile(
                  icon: tiles[i].$1,
                  title: tiles[i].$2,
                  subtitle: tiles[i].$3,
                ),
                if (i < tiles.length - 1)
                  const Divider(
                      height: 1, thickness: 1, color: AppColors.hairline),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({required this.icon, required this.title, this.subtitle});
  final IconData icon;
  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onTap: () {},
      scale: 0.98,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.surfaceHi.withValues(alpha: 0.7),
              ),
              child: Icon(icon, size: 19, color: AppColors.textSecondary),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppType.body),
                  if (subtitle != null)
                    Text(subtitle!,
                        style: AppType.micro
                            .copyWith(color: AppColors.textTertiary)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded,
                color: AppColors.textTertiary),
          ],
        ),
      ),
    );
  }
}
