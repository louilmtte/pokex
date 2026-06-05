import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/design/theme';
import { formatPercent } from '@/domain/money';
import { ScannerEngine } from '@/data/services/scannerService';
import { useScannerStore } from '@/state/scannerStore';
import { useCollectionStore } from '@/state/collectionStore';
import { ScanOverlay } from '@/components/scanner/ScanOverlay';
import { Text } from '@/components/primitives/Text';

/**
 * « Scanner de cartes intelligent ». Pipeline complet :
 *   caméra -> ScannerEngine (CV/OCR mock) -> store -> reconnaissance -> ajout.
 *
 * L'overlay réagit en direct au score de cadrage ; dès le verrouillage, on
 * déclenche la reconnaissance et on présente le candidat avec sa confiance.
 */
const FRAME_INTERVAL_MS = 90;

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const engineRef = useRef(new ScannerEngine());

  const phase = useScannerStore((s) => s.phase);
  const detection = useScannerStore((s) => s.detection);
  const candidates = useScannerStore((s) => s.candidates);
  const onFrame = useScannerStore((s) => s.onFrame);
  const identify = useScannerStore((s) => s.identify);
  const reset = useScannerStore((s) => s.reset);

  const addOwnedCard = useCollectionStore((s) => s.addOwnedCard);
  const [added, setAdded] = useState(false);

  // Boucle d'analyse de frames (mock du flux caméra).
  useEffect(() => {
    if (!permission?.granted) return;
    if (phase === 'matching' || phase === 'matched') return;

    const id = setInterval(() => {
      onFrame(engineRef.current.analyzeFrame());
    }, FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, [permission?.granted, phase, onFrame]);

  // Déclenche la reconnaissance au verrouillage + haptique de confirmation.
  useEffect(() => {
    if (phase === 'locked') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      identify();
    }
  }, [phase, identify]);

  const best = candidates[0];

  const handleAdd = () => {
    if (!best) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    addOwnedCard({
      cardId: best.card.id,
      condition: 'NearMint',
      grade: { company: 'Raw', score: null },
      acquiredCents: 0,
    });
    setAdded(true);
  };

  const handleReset = () => {
    setAdded(false);
    engineRef.current.reset();
    reset();
  };

  if (!permission) {
    return <View style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text variant="title">Scanner activé</Text>
        <Text variant="body" color="textTertiary" style={styles.permSub}>
          Autorisez la caméra pour identifier vos cartes en un éclair.
        </Text>
        <Pressable style={styles.cta} onPress={requestPermission}>
          <Text variant="bodyStrong">Autoriser la caméra</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />
      <ScanOverlay detection={detection} />

      {/* Bandeau OCR temps réel */}
      <View style={[styles.topBar, { top: insets.top + theme.space.md }]}>
        <BlurView intensity={30} tint="dark" style={styles.ocrCard}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    phase === 'locked' || phase === 'matched'
                      ? theme.color.focus
                      : theme.color.neutral,
                },
              ]}
            />
            <Text variant="caption" color="textSecondary">
              {labelForPhase(phase)}
            </Text>
          </View>
          {detection?.ocr.name ? (
            <Animated.View entering={FadeIn} style={styles.ocrLines}>
              <Text variant="bodyStrong">
                {detection.ocr.name}
                {detection.ocr.hp ? `  ${detection.ocr.hp} PV` : ''}
              </Text>
              <Text variant="caption" color="textTertiary">
                N° {detection.ocr.number ?? '—'} · ext.{' '}
                {detection.ocr.setSymbol ?? '—'}
              </Text>
            </Animated.View>
          ) : (
            <Text variant="caption" color="textTertiary">
              Alignez la carte dans le cadre…
            </Text>
          )}
        </BlurView>
      </View>

      {/* Résultat de reconnaissance */}
      {phase === 'matched' && best && (
        <Animated.View
          entering={FadeInUp.springify().damping(18)}
          style={[styles.result, { bottom: insets.bottom + 110 }]}
        >
          <BlurView intensity={50} tint="dark" style={styles.resultCard}>
            <Animated.Image
              source={{ uri: best.card.imageUrl }}
              style={styles.resultThumb}
              resizeMode="cover"
            />
            <View style={styles.resultInfo}>
              <Text variant="caption" color="textTertiary">
                IDENTIFIÉE · {formatPercent(best.confidence).replace('+', '')} de
                confiance
              </Text>
              <Text variant="headline" numberOfLines={1}>
                {best.card.name}
              </Text>
              <Text variant="caption" color="textSecondary">
                {best.card.numberInSet}/{best.card.setSize} ·{' '}
                {best.card.setName}
              </Text>

              <View style={styles.resultActions}>
                {added ? (
                  <View style={[styles.smallCta, styles.successCta]}>
                    <Text variant="caption" style={{ color: theme.color.bg }}>
                      ✓ Ajoutée au Vault
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    style={[styles.smallCta, styles.addCta]}
                    onPress={handleAdd}
                  >
                    <Text variant="caption" style={{ color: theme.color.bg }}>
                      Ajouter
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  style={[styles.smallCta, styles.ghostCta]}
                  onPress={handleReset}
                >
                  <Text variant="caption">Scanner une autre</Text>
                </Pressable>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

function labelForPhase(phase: string): string {
  switch (phase) {
    case 'searching':
      return 'Recherche de carte…';
    case 'locked':
      return 'Carte verrouillée';
    case 'matching':
      return 'Reconnaissance…';
    case 'matched':
      return 'Carte identifiée';
    case 'error':
      return 'Aucune correspondance';
    default:
      return 'Initialisation…';
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.bg },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.space.xl,
    gap: theme.space.md,
  },
  permSub: { textAlign: 'center', maxWidth: 280 },
  cta: {
    marginTop: theme.space.lg,
    paddingHorizontal: theme.space.xl,
    paddingVertical: theme.space.md,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.accent,
  },
  topBar: {
    position: 'absolute',
    left: theme.space.lg,
    right: theme.space.lg,
  },
  ocrCard: {
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.color.hairline,
    gap: theme.space.sm,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  ocrLines: { gap: 2 },
  result: {
    position: 'absolute',
    left: theme.space.lg,
    right: theme.space.lg,
  },
  resultCard: {
    flexDirection: 'row',
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.color.hairlineStrong,
    padding: theme.space.md,
    gap: theme.space.md,
  },
  resultThumb: {
    width: 72,
    height: 100,
    borderRadius: theme.radius.sm,
  },
  resultInfo: { flex: 1, gap: 3, justifyContent: 'center' },
  resultActions: {
    flexDirection: 'row',
    gap: theme.space.sm,
    marginTop: theme.space.sm,
  },
  smallCta: {
    paddingHorizontal: theme.space.md,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
  },
  addCta: { backgroundColor: theme.color.focus },
  successCta: { backgroundColor: theme.color.bull },
  ghostCta: {
    borderWidth: 1,
    borderColor: theme.color.hairlineStrong,
  },
});
