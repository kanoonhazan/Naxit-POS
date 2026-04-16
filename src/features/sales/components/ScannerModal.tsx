import React, {useRef, useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {Camera, CameraType} from 'react-native-camera-kit';

import {Button} from '../../../components/Primitives';
import {
  ensureCameraPermission,
  openDeviceSettings,
} from '../../../device/cameraPermissions';
import {theme} from '../../../theme';

type ScannerModalProps = {
  visible: boolean;
  onClose: () => void;
  onScanCode: (code: string) => void;
  onDemoScan: () => void;
};

export function ScannerModal({
  visible,
  onClose,
  onScanCode,
  onDemoScan,
}: ScannerModalProps) {
  const [scannerState, setScannerState] = useState<
    'idle' | 'requesting' | 'ready' | 'denied' | 'blocked' | 'unavailable'
  >('idle');
  const [message, setMessage] = useState(
    'Camera access is needed to scan real QR labels from the device.',
  );
  const scanLock = useRef(false);

  const requestPermission = async () => {
    setScannerState('requesting');
    const result = await ensureCameraPermission();

    if (result === 'granted') {
      setScannerState('ready');
      setMessage('Point the camera at a saved product QR code.');
      return;
    }

    if (result === 'blocked') {
      setScannerState('blocked');
      setMessage(
        'Camera permission is blocked. Open device settings to allow scanning.',
      );
      return;
    }

    if (result === 'unavailable') {
      setScannerState('unavailable');
      setMessage(
        'This device or simulator cannot provide a usable camera feed.',
      );
      return;
    }

    setScannerState('denied');
    setMessage(
      'Camera permission was denied. You can still use demo scan or quick-add.',
    );
  };

  const handleReadCode = (code: string) => {
    if (scanLock.current) {
      return;
    }

    scanLock.current = true;
    onScanCode(code);
    onClose();

    setTimeout(() => {
      scanLock.current = false;
    }, 500);
  };

  React.useEffect(() => {
    if (visible) {
      requestPermission().catch(() => {});
    } else {
      setScannerState('idle');
    }
    // Remove unused comment
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Scan QR code</Text>
              <Text style={styles.subtitle}>{message}</Text>
            </View>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>

          {scannerState === 'ready' ? (
            <View style={styles.cameraWrap}>
              <Camera
                style={styles.camera}
                cameraType={CameraType.Back}
                scanBarcode
                showFrame
                laserColor="#52E0A1"
                frameColor="#9CC0FF"
                onReadCode={event =>
                  handleReadCode(event.nativeEvent.codeStringValue)
                }
                onError={() => {
                  setScannerState('denied');
                  setMessage(
                    'The camera feed could not start. Try again or use demo scan.',
                  );
                }}
              />
            </View>
          ) : (
            <View style={styles.permissionCard}>
              <Text style={styles.permissionTitle}>
                {scannerState === 'requesting'
                  ? 'Requesting camera access'
                  : 'Scanner not ready'}
              </Text>
              <Text style={styles.permissionBody}>{message}</Text>
              <View style={styles.permissionActions}>
                {scannerState === 'blocked' ? (
                  <Button
                    label="Open device settings"
                    onPress={() => {
                      openDeviceSettings().catch(() => {});
                    }}
                  />
                ) : null}
                {scannerState !== 'requesting' ? (
                  <Button
                    label="Try again"
                    onPress={() => {
                      requestPermission().catch(() => {});
                    }}
                    variant="secondary"
                  />
                ) : null}
                <Button
                  label="Use demo scan"
                  onPress={() => {
                    onClose();
                    onDemoScan();
                  }}
                  variant="ghost"
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(11, 21, 34, 0.42)',
  },
  sheet: {
    backgroundColor: theme.colors.black,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
    minHeight: '76%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.panel,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#B9C7D8',
  },
  close: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9CC0FF',
  },
  cameraWrap: {
    flex: 1,
    minHeight: 420,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#294867',
  },
  camera: {
    flex: 1,
    backgroundColor: '#102030',
  },
  permissionCard: {
    minHeight: 280,
    borderRadius: 28,
    backgroundColor: '#16273A',
    padding: theme.spacing.xl,
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.panel,
  },
  permissionBody: {
    fontSize: 14,
    lineHeight: 21,
    color: '#B9C7D8',
  },
  permissionActions: {
    gap: theme.spacing.sm,
  },
});
