import React, { useMemo } from 'react';
import { View } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  LinearGradient as SkiaGradient,
  vec,
  Circle,
  Group,
} from '@shopify/react-native-skia';
import { theme } from '@/design/theme';
import { PricePoint } from '@/domain/types';

/**
 * Sparkline boursière dessinée en Skia (GPU) : courbe lissée + dégradé de
 * remplissage + point de tête lumineux. Le rendu Skia garantit l'antialiasing
 * et la fluidité à 120Hz, là où un SVG saturerait le thread JS.
 *
 * La couleur est sémantique : verte (bull) si la série monte, rouge (bear)
 * sinon — exactement comme une courbe d'action sur Revolut.
 */
interface SparklineProps {
  data: PricePoint[];
  width: number;
  height: number;
  /** Affiche le remplissage dégradé sous la courbe. */
  fill?: boolean;
  strokeWidth?: number;
  /** Force une couleur (sinon dérivée de la tendance). */
  color?: string;
}

/** Construit un chemin lissé (Catmull-Rom -> Bézier) à partir des points. */
function buildSmoothPath(
  points: { x: number; y: number }[],
): ReturnType<typeof Skia.Path.Make> {
  const path = Skia.Path.Make();
  if (points.length === 0) return path;

  path.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path.cubicTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  return path;
}

export function Sparkline({
  data,
  width,
  height,
  fill = true,
  strokeWidth = 2,
  color,
}: SparklineProps) {
  const { stroke, area, headPoint, lineColor } = useMemo(() => {
    if (data.length < 2) {
      return {
        stroke: Skia.Path.Make(),
        area: Skia.Path.Make(),
        headPoint: null as { x: number; y: number } | null,
        lineColor: theme.color.neutral,
      };
    }

    const pad = strokeWidth + 2;
    const values = data.map((d) => d.cents);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;

    const pts = data.map((d, i) => ({
      x: (i / (data.length - 1)) * (width - pad * 2) + pad,
      y:
        height -
        pad -
        ((d.cents - min) / span) * (height - pad * 2),
    }));

    const bullish = values[values.length - 1] >= values[0];
    const resolvedColor =
      color ?? (bullish ? theme.color.bull : theme.color.bear);

    const strokePath = buildSmoothPath(pts);

    const areaPath = strokePath.copy();
    areaPath.lineTo(pts[pts.length - 1].x, height);
    areaPath.lineTo(pts[0].x, height);
    areaPath.close();

    return {
      stroke: strokePath,
      area: areaPath,
      headPoint: pts[pts.length - 1],
      lineColor: resolvedColor,
    };
  }, [data, width, height, strokeWidth, color]);

  return (
    <View style={{ width, height }}>
      <Canvas style={{ width, height }}>
        {fill && (
          <Path path={area} style="fill">
            <SkiaGradient
              start={vec(0, 0)}
              end={vec(0, height)}
              colors={[`${lineColor}55`, `${lineColor}00`]}
            />
          </Path>
        )}
        <Path
          path={stroke}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          strokeJoin="round"
          color={lineColor}
        />
        {headPoint && (
          <Group>
            <Circle
              cx={headPoint.x}
              cy={headPoint.y}
              r={5}
              color={`${lineColor}33`}
            />
            <Circle
              cx={headPoint.x}
              cy={headPoint.y}
              r={2.5}
              color={lineColor}
            />
          </Group>
        )}
      </Canvas>
    </View>
  );
}
