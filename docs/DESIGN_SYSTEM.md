# Design System — PocketVault

> Direction artistique : **fintech premium × matière holographique**.
> Références : Revolut (data/marché), Apple Wallet (cartes, profondeur),
> Linear (densité, typographie tranchée).

## 1. Principes

1. **OLED-first.** Le fond est un noir absolu (`#000000`) : les pixels
   s'éteignent, les contenus flottent dans le vide. Aucune surface grise
   inutile.
2. **La lumière comme matière.** Pas d'ombres grises décoratives — on utilise
   des **halos néon colorés** (glow) et des **gradients holographiques** qui
   réagissent au mouvement.
3. **Le mouvement est physique.** Tout est ressort (`spring`), jamais linéaire.
   Chaque interaction a un retour haptique.
4. **Tokens sémantiques only.** L'UI ne touche jamais la palette brute, ni des
   tailles/poids arbitraires.

## 2. Couleurs (`src/design/`)

### Surfaces (empilement Z)
| Token | Usage |
|---|---|
| `bg` `#000000` | Fond global OLED |
| `surface` | Cartes, panneaux |
| `surfaceElevated` | Champs, chips, skeletons |
| `surfaceOverlay` | Pastilles actives |
| `hairline` / `hairlineStrong` | Bordures 1 px |

### Accents néon
`accent` (violet `#8B5CF6`) · `accentAlt` (cyan `#22D3EE`) · `focus` (vert fluo
`#22FF88`, réservé au scanner).

### Sémantique marché
`bull` (vert) hausse · `bear` (rouge) baisse · `neutral` (gris) stable.
Utilisés pour variations, sparklines, plus-value.

### Gradients holographiques (`theme.holo`)
`aurora` (violet→cyan→menthe), `sunset` (rose→or→violet), `prism` (arc-en-ciel
complet). Consommés par expo-linear-gradient **et** Skia.

## 3. Typographie (`typography.ts`)

Police système (SF Pro / Roboto) — rendu natif, zéro coût de chargement.
Échelle resserrée, **tracking négatif** sur les grands titres (look Linear).

| Variante | Taille / Poids | Usage |
|---|---|---|
| `display` | 40 / 800 | Valeur du portefeuille, prix |
| `title` | 28 / 700 | Titres d'écran |
| `headline` | 20 / 700 | Sections |
| `body` / `bodyStrong` | 15 / 500–700 | Texte courant |
| `caption` | 13 / 600 | Métadonnées |
| `micro` | 11 / 600 | Badges, labels |
| `mono` | tabular-nums | **Prix** (alignement vertical parfait) |

## 4. Espacement, rayons, élévation

- **Espacement** : échelle 4 → 48 (`xs`…`xxxl`).
- **Rayons** : `card` 18, `lg` 22, `xl` 28, `pill` 999.
- **Élévation** : halos néon (`glowSoft` violet, `glowStrong` cyan) plutôt
  qu'ombres grises.

## 5. Mouvement (`motion.ts`)

| Spring | Profil | Usage |
|---|---|---|
| `snappy` | raide, rapide | press, toggles |
| `magnetic` | doux | bottom sheets, pastille segmentée |
| `gyro` | très amorti, sans oscillation | inclinaison holographique |
| `bouncy` | expressif | célébrations (carte ajoutée) |

Timings : `fast` 140 ms, `base` 240 ms, `slow` 420 ms, `shimmer` 1100 ms.
Budget cible : **8,33 ms/frame** (120 Hz) — toutes les animations critiques
tournent sur le thread UI.

## 6. Composants signature

### La Carte Pokémon Virtuelle (`HolographicCard`)
Effet holo en couches superposées (CSS/Style) piloté par le gyroscope :
1. **Inclinaison 3D** — `perspective` + `rotateX/rotateY` ∝ tilt.
2. **Voile prismatique** — gradient arc-en-ciel translaté à contre-sens.
3. **Glare spéculaire** — point chaud blanc suivant la « lumière ».
4. **Halo coloré** — `shadowColor` interpolé entre couleur dominante et néons.

L'intensité est **proportionnelle à la rareté** (une Commune brille peu, une
Secrète irise fort), fidèle au matériau réel.

### Sparkline (`Sparkline`, Skia)
Courbe lissée (Catmull-Rom → Bézier), remplissage dégradé, point de tête
lumineux. Couleur bull/bear automatique. Rendu GPU pour la fluidité.

### Skeletons (`Skeleton`)
Shimmer balayé sur le thread UI (`withRepeat`), insensible à la charge JS.

### Bottom Sheet (`FilterSheet`)
Ancrages magnétiques (55 % / 92 %), backdrop progressif, poignée discrète.

### Barre d'onglets
Verre dépoli (`expo-blur`), bouton central Scanner en disque néon surélevé.

## 7. Accessibilité & feedback
- Cibles tactiles ≥ 44 px, labels d'accessibilité sur les cartes.
- Haptique systématique : `selection` (tri/onglets), `impact` (press carte),
  `notification.success` (verrouillage scan).
- Contrastes texte conformes sur fond OLED (primary/secondary/tertiary).
