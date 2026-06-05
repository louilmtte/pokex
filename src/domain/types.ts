/**
 * Modèle de domaine PocketVault.
 *
 * Ces types décrivent les règles métier du domaine "collection de cartes".
 * Ils sont volontairement découplés de toute préoccupation UI ou réseau :
 * aucune dépendance à React, à la navigation ou aux stores.
 */

export type PokemonType =
  | 'Fire'
  | 'Water'
  | 'Grass'
  | 'Lightning'
  | 'Psychic'
  | 'Fighting'
  | 'Darkness'
  | 'Metal'
  | 'Dragon'
  | 'Fairy'
  | 'Colorless';

export type Rarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'UltraRare'
  | 'SecretRare'
  | 'AlternativeArt'
  | 'Promo';

/** État physique d'une carte brute (non gradée). */
export type Condition = 'NearMint' | 'LightlyPlayed' | 'Played' | 'Poor';

/** Maison de gradation. `Raw` = carte non gradée. */
export type GradingCompany = 'Raw' | 'PSA' | 'PCA' | 'BGS';

export interface Grade {
  company: GradingCompany;
  /** Note numérique (ex: 10 pour PSA 10). `null` si Raw. */
  score: number | null;
}

/** Un point de cotation marché à une date donnée. */
export interface PricePoint {
  /** Timestamp epoch (ms). */
  t: number;
  /** Prix en centimes pour éviter les erreurs de flottants. */
  cents: number;
}

/** Grille de prix de marché par état/gradation, en centimes. */
export interface MarketQuote {
  cardId: string;
  currency: 'EUR';
  byCondition: Record<Condition, number>;
  byGrade: Partial<Record<`${GradingCompany}${number}`, number>>;
  /** Dernier prix de référence affiché (Near Mint par défaut), centimes. */
  spotCents: number;
  updatedAt: number;
}

export interface PokemonCard {
  id: string;
  name: string;
  hp: number | null;
  types: PokemonType[];
  rarity: Rarity;
  /** Numéro local ex: "4" dans "4/102". */
  numberInSet: string;
  /** Taille du set ex: "102". */
  setSize: string;
  setName: string;
  setSymbol: string;
  year: number;
  imageUrl: string;
  /** Couleur dominante extraite de l'artwork, pour les halos dynamiques. */
  dominantColor: string;
}

/**
 * Une carte effectivement possédée par l'utilisateur — distincte du
 * référentiel `PokemonCard` car on peut posséder plusieurs exemplaires
 * d'une même carte dans des états différents.
 */
export interface OwnedCard {
  /** Identifiant d'exemplaire (unique par possession). */
  uid: string;
  cardId: string;
  condition: Condition;
  grade: Grade;
  /** Prix d'acquisition en centimes (base de la plus-value). */
  acquiredCents: number;
  acquiredAt: number;
  binderIds: string[];
  favorite: boolean;
}

export interface Binder {
  id: string;
  name: string;
  /** Emoji ou clé d'icône. */
  icon: string;
  accent: string;
  createdAt: number;
}
