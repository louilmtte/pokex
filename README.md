# PocketVault 🃏✨

> Le coffre-fort holographique de votre collection Pokémon.
> Une application mobile de collection pensée comme une app fintech premium —
> fluidité 120 Hz, mode sombre OLED, cartes holographiques vivantes sous le
> gyroscope, et un module de cotation digne de Revolut.

PocketVault transforme une collection de cartes en **portefeuille d'actifs** :
on scanne, on range, on suit la cote, on visualise la plus-value latente.

---

## 1. Choix du framework — React Native (Skia + Reanimated)

Le cahier des charges impose **du graphisme à 120 Hz** (holo-gradients réactifs
au gyroscope, transitions partagées, skeletons fluides). Voici l'arbitrage.

| Critère | **Flutter (Impeller)** | **React Native + Skia + Reanimated 3** |
|---|---|---|
| Rendu GPU custom (shaders holo) | Excellent (Impeller, fragments shaders) | Excellent (`@shopify/react-native-skia`, runtime Skia identique au moteur de Flutter) |
| Animations sur thread UI | Très bon (`vsync`, 120 Hz natif) | **Excellent** — Reanimated 3 exécute les worklets sur le thread UI ; le gyroscope pilote les `SharedValue` **sans repasser par le JS thread** |
| Transitions partagées | Hero widgets | `sharedTransitionTag` (Reanimated) |
| Accès capteurs (gyroscope/DeviceMotion) | `sensors_plus` | `expo-sensors` (`DeviceMotion`) |
| Caméra + ML/OCR | `camera` + MLKit | `expo-camera` + VisionCamera/MLKit |
| Écosystème fintech / time-to-market | Bon | **Très bon** (TS partagé front/back, hot reload, OTA Expo) |
| Équipe & recrutement | Dart | **TypeScript** (réutilisable web/back) |

**Décision : React Native + Skia + Reanimated 3 (via Expo SDK 52, New
Architecture / Fabric activée).**

La raison décisive : **Skia donne le même moteur de rendu que Flutter** pour les
effets holographiques, **tandis que Reanimated 3 garantit que l'inclinaison du
téléphone anime les cartes intégralement sur le thread UI** (zéro frame perdue
même si le thread JS recalcule la collection). On obtient le meilleur des deux
mondes — rendu GPU de classe Flutter **et** un seul langage (TypeScript) du
domaine métier jusqu'au shader.

---

## 2. Stack technique

| Domaine | Techno |
|---|---|
| Runtime | Expo SDK 52 · React Native 0.76 · New Architecture (Fabric) |
| Navigation | Expo Router 4 (file-based, tabs + transitions partagées) |
| Animations | Reanimated 3 (worklets UI thread, springs) |
| Rendu GPU | React Native Skia (Sparklines, voiles holo) |
| Capteurs | expo-sensors (`DeviceMotion` → tilt) |
| Caméra / Scan | expo-camera + pipeline CV/OCR (mock `ScannerEngine`) |
| Bottom Sheets | @gorhom/bottom-sheet (magnétiques) |
| Verre dépoli | expo-blur |
| Haptique | expo-haptics |
| State | Zustand (stores fins, sélecteurs dérivés) |
| Langage | TypeScript strict |

---

## 3. Démarrage

```bash
npm install
npm run start      # Expo Dev Server
npm run ios        # ou: npm run android
npm run typecheck  # vérification TS stricte
npm run test       # tests de la logique métier (Jest)
```

> Note : le scanner exige un appareil physique (caméra + gyroscope). Le reste
> de l'app tourne sur simulateur/web ; sur web les cartes restent au repos
> (pas de capteur de mouvement).

---

## 4. Architecture en couches

```
UI (app/, components/)
        │  ne contient que mise en page + interactions
        ▼
Hooks (src/hooks/)        ← câblage réactif, mémoïsation
        ▼
State (src/state/)        ← Zustand : état + mutations métier
        ▼
Domain (src/domain/)      ← logique pure : pricing, portfolio, query
        ▲
Data (src/data/)          ← repositories, mocks, services (OCR, reco)
```

**Règle d'or : la logique métier (`src/domain`) est 100 % pure** — aucune
dépendance à React, à la navigation ou aux capteurs. Elle est testable en
isolation (voir `src/domain/services/__tests__`). L'UI ne fait *jamais* de
calcul de valeur/plus-value : elle consomme les services via des hooks.

Détails complets : [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
Charte graphique : [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

---

## 5. Modules livrés

### A. Scanner intelligent (`app/(tabs)/scan.tsx`)
- Overlay `ScanOverlay` : rectangle de focus qui interpole **blanc → vert
  fluo** selon le score de cadrage, coins magnétiques au verrouillage, ligne
  laser de balayage — tout sur le thread UI.
- Pipeline `ScannerEngine` (CV/OCR mock) → extraction **nom, PV, numéro
  (145/192), symbole d'extension**.
- `recognitionService` : mock de reconnaissance d'image avec score de
  confiance et auto-validation au-delà d'un seuil.

### B. Cotation & marché (`app/(tabs)/market.tsx`, écran de détail)
- `Sparkline` Skia (courbe lissée Catmull-Rom, dégradé, point de tête) sur
  **7 J / 30 J / 1 an**, couleur **bull/bear** sémantique.
- Grille de prix **par état** (NM, LP, PL, PO) et **par gradation** (PSA, PCA,
  Beckett) calculée par `marketRepository` à partir du spot.

### C. Classeur virtuel (`app/(tabs)/binder.tsx`)
- Classeurs customisés (« Mes Dracaufeu », « Série Épée et Bouclier »…).
- Moteur de tri/filtre pur (`domain/services/query.ts`) : Type, Rareté, Année,
  Valeur décroissante, favoris, recherche — en une seule passe.
- Feuille de bas de page magnétique des filtres (`FilterSheet`).

### Dashboard (`app/(tabs)/index.tsx`)
- Valeur totale du portefeuille, plus-value latente, carte la plus chère.
- Courbe agrégée du portefeuille + carrousel holographique des « Joyaux ».

### La Carte Pokémon Virtuelle (`components/card/HolographicCard.tsx`)
- Effet holographique **CSS/Style** en couches : inclinaison 3D (perspective +
  rotateX/Y), voile prismatique arc-en-ciel à contre-sens du gyroscope, glare
  spéculaire, halo coloré dynamique. Intensité modulée par la rareté.

---

## 6. Arborescence

```
pocketvault/
├── app/                          # Routes (Expo Router)
│   ├── _layout.tsx               # Stack racine + transitions partagées
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Barre d'onglets verre dépoli
│   │   ├── index.tsx             # ★ Dashboard de la Collection
│   │   ├── binder.tsx            # Classeur virtuel
│   │   ├── scan.tsx              # Scanner intelligent
│   │   └── market.tsx            # Watchlist marché
│   └── card/[uid].tsx            # Détail carte (cotation + holo)
├── src/
│   ├── design/                   # Charte : palette, theme, typo, motion
│   ├── domain/                   # Logique métier PURE
│   │   ├── types.ts
│   │   ├── taxonomy.ts
│   │   ├── money.ts
│   │   └── services/             # pricing, portfolio, query (+ tests)
│   ├── data/                     # mocks, repositories, services CV/OCR
│   ├── state/                    # Zustand stores
│   ├── hooks/                    # useGyroscope, usePortfolioStats, …
│   └── components/               # primitives, card, charts, dashboard…
├── docs/                         # ARCHITECTURE.md · DESIGN_SYSTEM.md
└── …config (app.json, babel, tsconfig)
```

---

## 7. Données

Les mocks (`src/data/mock`) simulent un référentiel TCG et des historiques de
prix **déterministes** (PRNG seedé par carte → courbes stables, pas de
scintillement). En production, on branche les repositories sur une API réelle
(ex : `pokemontcg.io` pour le référentiel, un agrégateur de cotation pour les
prix) sans toucher au domaine ni à l'UI.
