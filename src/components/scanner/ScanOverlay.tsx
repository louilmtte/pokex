import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/design/theme';
import { springs } from '@/design/motion';
import { ScanDetection } from '@/data/services/scannerService';

/**
 * Overlay de scan. Le rectangle de focus interpole sa couleur du blanc au
 * vert fluo en fonction du score de cadrage (`framing`). Quand la carte est
 * verrouillée, les coins « happent » vers l'intérieur (spring) et une ligne
 * de balayage laser parcourt la zone. Tout est animé sur l'UI thread.
 */
interface ScanOverlayProps {
  detection: ScanDetection | null;
}

const CORNER = 30;

export function ScanOverlay({ detection }: ScanOverlayProps) {
  const { width, height } = useWindowDimensions();
  const framing = useSharedValue(0);
  const locked = useSharedValue(0);
  const sweep = useSharedValue(0);

  // Cadre dimensionné au ratio carte (0.76 de large, centré).
  const frameW = width * 0.76;
  const frameH = frameW * 1.395;
  const left = (width - frameW) / 2;
  const top = (height - frameH) / 2;

  useEffect(() => {
    framing.value = withTiming(detection?.framing ?? 0, { duration: 120 });
    locked.value = withSpring(detection?.locked ? 1 : 0, springs.snappy);
  }, [detection?.framing, detection?.locked, framing, locked]);

  useEffect(() => {
    sweep.value = withRepeat(withTiming(1, { duration: 1600 }), -1, true);
  }, [sweep]);

  const borderColor = useDerivedValue(() =>
    interpolateColor(
      framing.value,
      [0, 0.5, 0.82, 1],
      ['#FFFFFF', '#D7DCE6', theme.color.focus, theme.color.focus],
    ),
  );

  const frameStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    transform: [{ scale: 1 - locked.value * 0.02 }],
    shadowColor: theme.color.focus,
    shadowOpacity: locked.value * 0.8,
    shadowRadius: 24,
  }));

  const sweepStyle = useAnimatedStyle(() => ({
    opacity: framing.value * 0.9,
    transform: [{ translateY: sweep.value * (frameH - 4) }],
  }));

  // Couleur partagée des coins + léger "happement" vers l'intérieur au
  // verrouillage (un seul style animé réutilisé par les quatre coins).
  const cornerStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    transform: [{ scale: 1 + locked.value * 0.06 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Masque sombre autour du cadre */}
      <View style={[styles.mask, { height: top }]} />
      <View style={[styles.mask, { top: top + frameH, bottom: 0 }]} />
      <View
        style={[styles.mask, { top, height: frameH, width: left }]}
      />
      <View
        style={[
          styles.mask,
          { top, height: frameH, left: left + frameW, right: 0 },
        ]}
      />

      {/* Cadre de focus */}
      <Animated.View
        style={[
          styles.frame,
          { left, top, width: frameW, height: frameH },
          frameStyle,
        ]}
      >
        <Animated.View style={[styles.corner, styles.tl, cornerStyle]} />
        <Animated.View style={[styles.corner, styles.tr, cornerStyle]} />
        <Animated.View style={[styles.corner, styles.bl, cornerStyle]} />
        <Animated.View style={[styles.corner, styles.br, cornerStyle]} />

        {/* Ligne de balayage laser */}
        <Animated.View style={[styles.sweepLine, sweepStyle]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mask: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  frame: {
    position: 'absolute',
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: '#fff',
  },
  tl: { borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: theme.radius.lg },
  tr: { borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: theme.radius.lg },
  bl: { borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: theme.radius.lg },
  br: { borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: theme.radius.lg },
  sweepLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.color.focus,
    shadowColor: theme.color.focus,
    shadowOpacity: 1,
    shadowRadius: 8,
  },
});
