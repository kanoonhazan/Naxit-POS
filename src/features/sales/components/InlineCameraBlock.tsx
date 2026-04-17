/**
 * InlineCameraBlock
 *
 * A compact, inline camera preview that lives directly on the Sales screen
 * next to the Quick Find search field. The camera activates on first mount
 * (after permission is granted) and auto-sleeps after `sleepSeconds` seconds
 * of inactivity (no scan detected). Tapping the dormant block wakes the
 * camera back up immediately.
 *
 * Logic:
 *  - On mount → request permission → start camera + start sleep timer
 *  - On successful scan → call onScanCode → reset sleep timer
 *  - After sleepSeconds with no scan → camera turns off (isAwake = false)
 *  - User taps the block → isAwake = true → camera restarts + sleep timer resets
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';

import {
  ensureCameraPermission,
  openDeviceSettings,
} from '../../../device/cameraPermissions';
import { theme } from '../../../theme';

type InlineCameraBlockProps = {
  /** Seconds of inactivity before camera sleeps. Comes from settings. */
  sleepSeconds: number;
  onScanCode: (code: string) => void;
  paused?: boolean;
};

type CamState = 'idle' | 'requesting' | 'ready' | 'denied' | 'blocked' | 'unavailable';

export function InlineCameraBlock({ sleepSeconds, onScanCode, paused }: InlineCameraBlockProps) {
  const [camState, setCamState] = useState<CamState>('idle');
  const [isAwake, setIsAwake] = useState(false);
  const sleepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanLock = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing indicator when awake
  useEffect(() => {
    if (isAwake) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.55, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isAwake, pulseAnim]);

  const startSleepTimer = useCallback(() => {
    if (sleepTimer.current) {
      clearTimeout(sleepTimer.current);
    }
    sleepTimer.current = setTimeout(() => {
      setIsAwake(false);
    }, sleepSeconds * 1000);
  }, [sleepSeconds]);

  // Handle external pause (e.g. during search)
  useEffect(() => {
    if (paused) {
      setIsAwake(false);
      if (sleepTimer.current) {
        clearTimeout(sleepTimer.current);
      }
    }
  }, [paused]);

  const wake = useCallback(async () => {
    if (camState === 'idle' || camState === 'denied') {
      setCamState('requesting');
      const result = await ensureCameraPermission();
      if (result === 'granted') {
        setCamState('ready');
      } else if (result === 'blocked') {
        setCamState('blocked');
        return;
      } else if (result === 'unavailable') {
        setCamState('unavailable');
        return;
      } else {
        setCamState('denied');
        return;
      }
    }
    setIsAwake(true);
    startSleepTimer();
  }, [camState, startSleepTimer]);

  // Auto-start on first render
  useEffect(() => {
    wake().catch(() => { });
    return () => {
      if (sleepTimer.current) {
        clearTimeout(sleepTimer.current);
      }
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReadCode = (code: string) => {
    if (scanLock.current) {
      return;
    }
    scanLock.current = true;
    onScanCode(code);
    // Reset sleep timer after a scan
    startSleepTimer();
    setTimeout(() => {
      scanLock.current = false;
    }, 700);
  };

  const handleTap = () => {
    if (!isAwake) {
      wake().catch(() => { });
    }
  };

  return (
    <Pressable onPress={handleTap} style={styles.block}>
      {/* AWAKE — camera live */}
      {isAwake && camState === 'ready' ? (
        <View style={styles.cameraWrap}>
          <Camera
            style={styles.camera}
            cameraType={CameraType.Back}
            scanBarcode
            showFrame={false}
            onReadCode={event => handleReadCode(event.nativeEvent.codeStringValue)}
            onError={() => {
              setCamState('denied');
              setIsAwake(false);
            }}
          />
          {/* Overlay: scan frame */}
          <View style={styles.frameOverlay} pointerEvents="none">
            <View style={styles.frameCornerTL} />
            <View style={styles.frameCornerTR} />
            <View style={styles.frameCornerBL} />
            <View style={styles.frameCornerBR} />
          </View>
          {/* Live indicator */}
          <View style={styles.liveBadge} pointerEvents="none">
            <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          {/* Sleep countdown hint */}
          <View style={styles.sleepHint} pointerEvents="none">
            <Text style={styles.sleepHintText}>Sleeps in {sleepSeconds}s of inactivity</Text>
          </View>
        </View>
      ) : (
        /* ASLEEP / not ready */
        <View style={styles.dormant}>
          {camState === 'requesting' ? (
            <>
              <View style={styles.dormantIcon}>
                <View style={styles.dormantDot} />
              </View>
              <Text style={styles.dormantLabel}>Starting camera…</Text>
            </>
          ) : camState === 'blocked' ? (
            <>
              <View style={[styles.dormantIcon, styles.dormantIconWarning]}>
                <View style={[styles.dormantCross, styles.dormantCrossH]} />
                <View style={[styles.dormantCross, styles.dormantCrossV]} />
              </View>
              <Text style={styles.dormantLabel}>Camera blocked</Text>
              <Pressable
                onPress={() => openDeviceSettings().catch(() => { })}
                style={styles.dormantAction}>
                <Text style={styles.dormantActionText}>Open Settings</Text>
              </Pressable>
            </>
          ) : camState === 'unavailable' ? (
            <>
              <View style={[styles.dormantIcon, styles.dormantIconWarning]}>
                <View style={[styles.dormantCross, styles.dormantCrossH]} />
                <View style={[styles.dormantCross, styles.dormantCrossV]} />
              </View>
              <Text style={styles.dormantLabel}>No camera</Text>
            </>
          ) : (
            /* idle / denied / asleep */
            <>
              <View style={styles.dormantIcon}>
                <View style={styles.scannerSquare} />
                <View style={styles.scannerDot} />
              </View>
              <Text style={styles.dormantLabel}>
                {camState === 'denied' ? 'Permission denied' : 'Tap to scan'}
              </Text>
              {camState === 'denied' ? (
                <Text style={styles.dormantSub}>Tap to try again</Text>
              ) : (
                <Text style={styles.dormantSub}>Camera sleeps automatically</Text>
              )}
            </>
          )}
        </View>
      )}
    </Pressable>
  );
}

const CORNER = 10;
const CORNER_W = 2.5;

const styles = StyleSheet.create({
  block: {
    width: '100%',
    height: 110,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: '#0D1F30',
    borderWidth: 1,
    borderColor: '#1E3550',
  },
  cameraWrap: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
    backgroundColor: '#0D1F30',
  },
  frameOverlay: {
    ...StyleSheet.absoluteFill,
    margin: 14,
  },
  frameCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CORNER,
    height: CORNER,
    borderTopWidth: CORNER_W,
    borderLeftWidth: CORNER_W,
    borderColor: '#52E0A1',
    borderRadius: 2,
  },
  frameCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: CORNER,
    height: CORNER,
    borderTopWidth: CORNER_W,
    borderRightWidth: CORNER_W,
    borderColor: '#52E0A1',
    borderRadius: 2,
  },
  frameCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: CORNER,
    height: CORNER,
    borderBottomWidth: CORNER_W,
    borderLeftWidth: CORNER_W,
    borderColor: '#52E0A1',
    borderRadius: 2,
  },
  frameCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CORNER,
    height: CORNER,
    borderBottomWidth: CORNER_W,
    borderRightWidth: CORNER_W,
    borderColor: '#52E0A1',
    borderRadius: 2,
  },
  liveBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#52E0A1',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#52E0A1',
    letterSpacing: 0.5,
  },
  sleepHint: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  sleepHintText: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
  },
  dormant: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
  },
  dormantIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A3350',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dormantIconWarning: {
    backgroundColor: '#3D1A1A',
  },
  dormantDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4A6FA5',
  },
  dormantCross: {
    position: 'absolute',
    backgroundColor: '#E05252',
    borderRadius: 2,
  },
  dormantCrossH: {
    width: 16,
    height: 2.5,
  },
  dormantCrossV: {
    width: 2.5,
    height: 16,
  },
  scannerSquare: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4A7FAA',
  },
  scannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6AA0CC',
  },
  dormantLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A9BBF',
    textAlign: 'center',
  },
  dormantSub: {
    fontSize: 9,
    color: '#4A6480',
    textAlign: 'center',
  },
  dormantAction: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#1E3550',
  },
  dormantActionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7ABAFF',
  },
});
