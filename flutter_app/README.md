# PocketVault — édition Flutter 🃏✨

Version **Flutter** de PocketVault : coffre-fort de collection Pokémon avec une
direction artistique **fintech premium** — fond dégradé violet profond fondu
vers le noir, halos aurora animés, glassmorphism, micro-interactions et
fluidité pensée pour iPhone (120 Hz).

> Le langage visuel (dégradés sombres, surfaces en verre, rangée d'actions
> rapides, header de solde, tab bar flottante) s'inspire des standards des
> apps fintech premium, appliqué au contenu propre de PocketVault.

## Lancer le projet

Ce dossier contient le code applicatif (`lib/`, `pubspec.yaml`, `test/`). Les
dossiers de plateforme (`android/`, `ios/`) se génèrent en une commande :

```bash
cd flutter_app
flutter create .            # génère android/ ios/ (config plateforme)
flutter pub get
flutter run                 # iPhone / simulateur
flutter test                # tests de la logique métier
```

> L'effet holographique utilise le gyroscope (`sensors_plus`) : il s'apprécie
> sur un appareil physique. Le reste tourne parfaitement sur simulateur.

## Architecture (couches)

```
UI (features/, widgets/)
      │  mise en page + animations, zéro calcul métier
      ▼
State (state/, Riverpod)     ← source de vérité + mutations
      ▼
Domain (domain/)             ← logique PURE : pricing, portfolio (testée)
      ▲
Data (data/)                 ← mocks, historiques, cotations
```

La couche `domain/` est **100 % pure** (aucune dépendance Flutter) et couverte
par `test/portfolio_test.dart`.

## Carte des fichiers

| Zone | Fichiers clés |
|---|---|
| Thème | `core/theme/` — couleurs, dégradés, typo, thème |
| Domaine | `domain/models/`, `domain/services/pricing.dart`, `portfolio.dart` |
| Données | `data/mock_data.dart`, `data/price_history.dart` |
| État | `state/providers.dart` (Riverpod) |
| Widgets | `widgets/` — `aurora_background`, `glass_card`, `holo_card`, `sparkline`, `glass_nav_bar`, `animated_money`, `range_selector`, `action_button`, `pressable` |
| Écrans | `features/home`, `collection`, `market`, `profile`, `scan`, `detail`, `shell` |

## Modules

- **Dashboard** (`features/home`) : header de valeur (odometer + courbe +
  période), rangée d'actions rondes, carte promo plus-value, carrousel
  holographique des joyaux, activité récente.
- **Classeur** (`features/collection`) : grille filtrable par classeur et
  rareté, tri par valeur, badges de gradation.
- **Marché** (`features/market`) : watchlist cotée avec mini-sparkline et
  variation bull/bear.
- **Scanner** (`features/scan`) : cadre de focus animé blanc → vert fluo,
  balayage laser, reconnaissance simulée et ajout au Vault.
- **Profil** (`features/profile`) : carte d'identité, plan, raccourcis.
- **Détail carte** (`features/detail`) : transition Hero, cotation par état et
  par gradation, plus-value latente.

## Signatures UX

- **AuroraBackground** : mesh gradient néon animé (CustomPainter + blur) en
  toile de fond continue de toute l'app.
- **GlassCard / GlassNavBar** : verre dépoli réel via `BackdropFilter` + reflet
  + arête de lumière + halo.
- **HoloCard** : inclinaison 3D au gyroscope + voile prismatique + glare.
- **AnimatedMoney** : montant qui défile (effet odometer).
- **Pressable** : ressort + haptique sur chaque surface tactile.
