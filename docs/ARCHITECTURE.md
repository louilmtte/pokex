# Architecture — PocketVault

## Principe directeur : Clean Architecture mobile

Le code est organisé en couches concentriques. **Les dépendances pointent
toujours vers l'intérieur** (UI → hooks → state → domain ; data → domain).
Le **domaine** est le cœur stable, sans aucune dépendance externe.

```
┌─────────────────────────────────────────────────────────┐
│  app/  ·  components/        (Présentation — React)       │
│   - mise en page, gestes, animations                      │
│   - AUCUN calcul métier                                   │
│ ┌───────────────────────────────────────────────────────┐│
│ │  hooks/                    (Adaptateurs réactifs)       ││
│ │   - composent domain + state, mémoïsent                ││
│ │ ┌─────────────────────────────────────────────────────┐││
│ │ │  state/  (Zustand)       (État applicatif)           │││
│ │ │   - source de vérité + mutations métier              │││
│ │ │ ┌───────────────────────────────────────────────────┐│││
│ │ │ │  domain/               (Logique PURE)              ││││
│ │ │ │   types · taxonomy · pricing · portfolio · query   ││││
│ │ │ └───────────────────────────────────────────────────┘│││
│ │ └─────────────────────────────────────────────────────┘││
│ └───────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
        ▲
   data/ (repositories, mocks, services CV/OCR) — implémente, dépend du domaine
```

## Couche par couche

### `domain/` — le cœur pur
- **`types.ts`** : modèle (`PokemonCard`, `OwnedCard`, `Binder`, `MarketQuote`…).
  Distinction clé : `PokemonCard` (référentiel) vs `OwnedCard` (exemplaire
  possédé, avec état + gradation + prix d'achat).
- **`taxonomy.ts`** : métadonnées partagées (couleurs/labels des types,
  raretés, états, multiplicateurs de gradation). Source unique de vérité pour
  UI **et** logique de tri.
- **`money.ts`** : tout est en **centimes entiers** dans le domaine ; le
  formatage `Intl` n'a lieu qu'à la frontière UI.
- **`services/pricing.ts`** : valeur d'un exemplaire (décote d'état OU
  multiplicateur de gradation), plus-value latente.
- **`services/portfolio.ts`** : agrégation en `PortfolioStats`, série agrégée
  du portefeuille, delta.
- **`services/query.ts`** : moteur de filtrage/tri en une passe, conçu pour des
  milliers d'exemplaires.

> Garantie : ces fichiers n'importent ni React, ni Reanimated, ni Expo. Ils
> sont couverts par `__tests__/portfolio.test.ts`.

### `data/` — implémentations
- **`mock/`** : référentiel de démo + générateur d'historique **déterministe**
  (mulberry32 seedé par carte → courbes reproductibles).
- **`repositories/marketRepository.ts`** : construit les `MarketQuote`
  complètes depuis le spot. Remplaçable par un client HTTP sans impact amont.
- **`services/scannerService.ts`** : `ScannerEngine`, machine d'état CV/OCR
  (framing progressif → verrouillage, extraction OCR).
- **`services/recognitionService.ts`** : reconnaissance d'image mock (scoring
  lexical OCR ↔ référentiel, latence simulée, seuil d'auto-validation).

### `state/` — Zustand
Stores **fins et orthogonaux**, séparés par cycle de vie :
- `collectionStore` : cartes possédées, référentiel, classeurs (+ mutations).
- `marketStore` : cache des cotations (rafraîchissement indépendant).
- `filterStore` : critères de tri/filtre (état d'UI, pas de domaine).
- `scannerStore` : orchestration asynchrone du scan → reconnaissance.

Les **données dérivées** (stats, listes filtrées) ne sont pas stockées : elles
sont recalculées par des hooks mémoïsés pour garder les stores stables.

### `hooks/` — adaptateurs
- `useGyroscope` : `DeviceMotion` → `SharedValue` (tilt) consommables par
  Reanimated/Skia **sur le thread UI**.
- `usePortfolioStats` : compose collection + marché via les services domaine.
- `useFilteredCards` : applique `query.ts` sur la collection.

### `app/` + `components/` — présentation
File-based routing (Expo Router). Les écrans n'orchestrent que mise en page,
navigation et animations. Toute valeur affichée provient d'un hook/service.

## Flux de données — exemples

**Scan → ajout**
```
CameraView (frame) → ScannerEngine.analyzeFrame()
  → scannerStore.onFrame() → overlay blanc→vert
  → (locked) → recognitionService.recognizeCard()
  → scannerStore.candidates → UI résultat
  → collectionStore.addOwnedCard() → Dashboard/Classeur réagissent
```

**Affichage Dashboard**
```
collectionStore.owned + marketStore.quotes
  → usePortfolioStats() → computePortfolioStats() (domain)
  → PortfolioHeader / StatTile / carrousel holo
```

## Performance & 120 Hz
- **Animations sur thread UI** : gyroscope → `SharedValue` → `useAnimatedStyle`,
  jamais de `setState` par frame.
- **Skia** pour les courbes (GPU, antialiasing) au lieu de SVG (coûteux en JS).
- **Mémoïsation** stricte des sélecteurs (tri/filtre) pour ne pas recalculer la
  collection à chaque frame d'animation.
- **Virtualisation** (`FlatList`) du Classeur ; le gyroscope n'est pas attaché
  par vignette (une seule source de tilt partagée).
- **Centimes entiers** : pas d'arithmétique flottante répétée.

## Évolutivité
- Brancher une API réelle = réécrire les `repositories`, rien d'autre.
- Persistance locale = middleware `persist` de Zustand sur `collectionStore` +
  `filterStore`.
- Synchronisation cloud = couche `data/remote` derrière les mêmes interfaces.
