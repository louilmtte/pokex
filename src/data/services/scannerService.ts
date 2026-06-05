/**
 * Mock du pipeline OCR / Computer Vision du scanner.
 *
 * En production ce module orchestrerait :
 *   1. La détection des contours de la carte (modèle de segmentation) pour
 *      verrouiller le rectangle de focus.
 *   2. Un OCR (ex: VisionKit / MLKit Text Recognition) sur les zones
 *      d'intérêt (bandeau supérieur = nom + PV, coin inférieur = numéro).
 *   3. La classification du symbole d'extension.
 *
 * Ici on simule un flux de frames produisant progressivement une détection,
 * pour piloter l'overlay (blanc -> vert) et alimenter la reconnaissance.
 */

export interface DetectedRegion {
  /** Coordonnées normalisées 0..1 dans le repère caméra. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ScanDetection {
  /** La carte est-elle suffisamment cadrée/nette pour déclencher ? */
  locked: boolean;
  /** Score de "cadrage" 0..1, pilote la couleur de l'overlay. */
  framing: number;
  region: DetectedRegion;
  ocr: {
    name?: string;
    hp?: number;
    number?: string; // ex: "4/102"
    setSymbol?: string;
  };
}

/** Échantillons OCR plausibles renvoyés lorsqu'une carte est "détectée". */
const OCR_SAMPLES: ScanDetection['ocr'][] = [
  { name: 'Dracaufeu', hp: 120, number: '4/102', setSymbol: '◐' },
  { name: 'Pikachu VMAX', hp: 310, number: '215/203', setSymbol: '☄' },
  { name: 'Mewtwo VSTAR', hp: 280, number: '154/172', setSymbol: '✦' },
  { name: 'Rayquaza VMAX', hp: 320, number: '197/195', setSymbol: '♛' },
];

/**
 * Machine d'état du scanner. Émet une `ScanDetection` à chaque frame
 * analysée. Le "framing" monte progressivement pour simuler la stabilisation
 * de la main, puis verrouille au-delà du seuil.
 */
export class ScannerEngine {
  private framing = 0;
  private sample: ScanDetection['ocr'];
  private readonly lockThreshold = 0.82;

  constructor(seed = Math.floor(Math.random() * OCR_SAMPLES.length)) {
    this.sample = OCR_SAMPLES[seed % OCR_SAMPLES.length];
  }

  /** Analyse la frame courante et renvoie la détection mise à jour. */
  analyzeFrame(): ScanDetection {
    // Convergence amortie vers 1 avec un bruit léger (main qui tremble).
    const noise = (Math.random() - 0.5) * 0.06;
    this.framing = Math.min(
      1,
      Math.max(0, this.framing + 0.07 + noise),
    );

    const locked = this.framing >= this.lockThreshold;

    return {
      locked,
      framing: this.framing,
      region: { x: 0.12, y: 0.18, w: 0.76, h: 0.64 },
      // On ne révèle l'OCR qu'une fois le cadrage suffisant (réaliste).
      ocr: this.framing > 0.5 ? this.sample : {},
    };
  }

  reset(): void {
    this.framing = 0;
  }
}
