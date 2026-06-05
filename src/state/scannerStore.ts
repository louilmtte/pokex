import { create } from 'zustand';
import {
  AUTO_ACCEPT_CONFIDENCE,
  recognizeCard,
  RecognitionMatch,
} from '@/data/services/recognitionService';
import { ScanDetection } from '@/data/services/scannerService';

/**
 * Store du scanner : orchestre la machine d'état caméra -> OCR -> matching.
 * La logique de reconnaissance (asynchrone) est encapsulée ici, l'écran ne
 * fait que consommer `phase`, `detection` et `candidates`.
 */

export type ScanPhase =
  | 'idle'
  | 'searching' // caméra active, pas encore verrouillée
  | 'locked' // carte cadrée, OCR disponible
  | 'matching' // appel reconnaissance en cours
  | 'matched' // candidats disponibles
  | 'error';

interface ScannerState {
  phase: ScanPhase;
  detection: ScanDetection | null;
  candidates: RecognitionMatch[];
  autoAccepted: boolean;

  onFrame: (detection: ScanDetection) => void;
  identify: () => Promise<void>;
  reset: () => void;
}

export const useScannerStore = create<ScannerState>((set, get) => ({
  phase: 'idle',
  detection: null,
  candidates: [],
  autoAccepted: false,

  onFrame: (detection) => {
    const phase = get().phase;
    // On ne régresse pas l'état si une reconnaissance est déjà engagée.
    if (phase === 'matching' || phase === 'matched') return;
    set({
      detection,
      phase: detection.locked ? 'locked' : 'searching',
    });
  },

  identify: async () => {
    const detection = get().detection;
    if (!detection || !detection.ocr.name) {
      set({ phase: 'error' });
      return;
    }

    set({ phase: 'matching' });
    try {
      const candidates = await recognizeCard({
        ocrText: [detection.ocr.name, detection.ocr.hp]
          .filter(Boolean)
          .join(' '),
        detectedNumber: detection.ocr.number,
      });
      const best = candidates[0];
      set({
        candidates,
        phase: 'matched',
        autoAccepted: best ? best.confidence >= AUTO_ACCEPT_CONFIDENCE : false,
      });
    } catch {
      set({ phase: 'error' });
    }
  },

  reset: () =>
    set({
      phase: 'idle',
      detection: null,
      candidates: [],
      autoAccepted: false,
    }),
}));
