import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  RadialGradient,
  Blur,
  Paint,
  vec,
  useClock,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { palette } from '@/design/palette';

/**
 * Fond "aurora" : nappe de halos néon qui dérivent lentement et se mélangent
 * sous un fort flou gaussien — un mesh gradient vivant rendu par le GPU (Skia).
 *
 * C'est la toile de fond de l'app : posé derrière les surfaces en verre, son
 * mouvement perpétuel est ce qui donne au glassmorphism son côté "liquide".
 * Tout est animé sur le thread UI via l'horloge Skia ; le thread JS n'est
 * jamais sollicité.
 */
interface AuroraBackgroundProps {
  width: number;
  height: number;
  /** Intensité globale 0..1 (réduite quand on scrolle, par ex.). */
  opacity?: number;
}

interface Blob {
  color: string;
  radius: number;
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  speed: number;
  phase: number;
}

export function AuroraBackground({
  width,
  height,
  opacity = 1,
}: AuroraBackgroundProps) {
  // Skia ne rend pas sur le web : on retombe sur un dégradé statique discret
  // (cohérent avec le reste des garde-fous web de l'app).
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          { opacity, backgroundColor: 'rgba(40,28,72,0.35)' },
        ]}
        pointerEvents="none"
      />
    );
  }

  const clock = useClock();

  const blobs = useMemo<Blob[]>(
    () => [
      {
        color: palette.neonViolet,
        radius: width * 0.7,
        baseX: width * 0.2,
        baseY: height * 0.18,
        ampX: width * 0.18,
        ampY: height * 0.06,
        speed: 0.00018,
        phase: 0,
      },
      {
        color: palette.neonCyan,
        radius: width * 0.6,
        baseX: width * 0.85,
        baseY: height * 0.3,
        ampX: width * 0.16,
        ampY: height * 0.08,
        speed: 0.00023,
        phase: 1.8,
      },
      {
        color: palette.neonMint,
        radius: width * 0.55,
        baseX: width * 0.65,
        baseY: height * 0.62,
        ampX: width * 0.2,
        ampY: height * 0.07,
        speed: 0.0002,
        phase: 3.2,
      },
      {
        color: palette.neonIndigo,
        radius: width * 0.65,
        baseX: width * 0.1,
        baseY: height * 0.7,
        ampX: width * 0.14,
        ampY: height * 0.09,
        speed: 0.00016,
        phase: 4.5,
      },
    ],
    [width, height],
  );

  return (
    <Canvas style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      {/* Le flou fort fusionne les halos en une nappe continue. */}
      <Group layer={<Paint><Blur blur={70} /></Paint>}>
        {blobs.map((b, i) => (
          <AuroraBlob key={i} blob={b} clock={clock} />
        ))}
      </Group>
    </Canvas>
  );
}

function AuroraBlob({
  blob,
  clock,
}: {
  blob: Blob;
  clock: ReturnType<typeof useClock>;
}) {
  const cx = useDerivedValue(
    () => blob.baseX + Math.sin(clock.value * blob.speed + blob.phase) * blob.ampX,
  );
  const cy = useDerivedValue(
    () =>
      blob.baseY +
      Math.cos(clock.value * blob.speed * 1.3 + blob.phase) * blob.ampY,
  );
  const center = useDerivedValue(() => vec(cx.value, cy.value));

  return (
    <Circle cx={cx} cy={cy} r={blob.radius}>
      <RadialGradient
        c={center}
        r={blob.radius}
        colors={[`${blob.color}66`, `${blob.color}00`]}
      />
    </Circle>
  );
}
