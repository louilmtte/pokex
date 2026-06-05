import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/aurora_background.dart';
import '../../widgets/glass_nav_bar.dart';
import '../collection/collection_screen.dart';
import '../home/home_screen.dart';
import '../market/market_screen.dart';
import '../profile/profile_screen.dart';
import '../scan/scan_screen.dart';

/// Conteneur principal : fond aurora partagé + pile d'écrans + barre flottante.
/// L'aurora vit ici (une seule instance) pour rester continue d'un onglet à
/// l'autre — sensation d'app "monolithique" et fluide.
class AppShell extends ConsumerStatefulWidget {
  const AppShell({super.key});

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
  int _index = 0;

  static const _destinations = [
    NavDestination(Icons.dashboard_rounded, 'Vault'),
    NavDestination(Icons.grid_view_rounded, 'Classeur'),
    NavDestination(Icons.center_focus_strong_rounded, 'Scan', center: true),
    NavDestination(Icons.show_chart_rounded, 'Marché'),
    NavDestination(Icons.person_rounded, 'Profil'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      backgroundColor: Colors.transparent,
      body: AuroraBackground(
        child: IndexedStack(
          index: _index,
          children: const [
            HomeScreen(),
            CollectionScreen(),
            ScanScreen(),
            MarketScreen(),
            ProfileScreen(),
          ],
        ),
      ),
      bottomNavigationBar: GlassNavBar(
        index: _index,
        destinations: _destinations,
        onSelect: (i) => setState(() => _index = i),
      ),
    );
  }
}
