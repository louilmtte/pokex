import { useEffect } from 'react';
import { Platform } from 'react-native';
import { DeviceMotion } from 'expo-sensors';
import {
  SharedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { springs } from '@/design/motion';

/**
 * Expose l'inclinaison du téléphone sous forme de SharedValues normalisées
 * (-1..1) directement consommables par les animations Reanimated/Skia, sans
 * jamais repasser par le thread JS — condition sine qua non du 120Hz.
 *
 * `roll`  : inclinaison gauche/droite (axe Y de l'écran).
 * `pitch` : inclinaison avant/arrière (axe X de l'écran).
 *
 * Ces deux valeurs pilotent le déplacement du voile holographique des
 * cartes pour simuler le reflet réagissant à la lumière.
 */
export interface Tilt {
  roll: SharedValue<number>;
  pitch: SharedValue<number>;
}

const CLAMP = (v: number, max: number) => Math.max(-max, Math.min(max, v));

export function useGyroscope(updateIntervalMs = 16): Tilt {
  const roll = useSharedValue(0);
  const pitch = useSharedValue(0);

  useEffect(() => {
    // Pas de capteurs sur le web : on laisse les cartes au repos.
    if (Platform.OS === 'web') return;

    let mounted = true;
    DeviceMotion.setUpdateInterval(updateIntervalMs);

    const sub = DeviceMotion.addListener((data) => {
      if (!mounted || !data.rotation) return;
      const { gamma, beta } = data.rotation; // radians

      // Normalisation : ~±0.6 rad (≈35°) couvre toute l'amplitude utile.
      const nextRoll = CLAMP(gamma / 0.6, 1);
      const nextPitch = CLAMP(beta / 0.6, 1);

      // Spring doux pour absorber le bruit du capteur sans lag perceptible.
      roll.value = withSpring(nextRoll, springs.gyro);
      pitch.value = withSpring(nextPitch, springs.gyro);
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, [updateIntervalMs, roll, pitch]);

  return { roll, pitch };
}
