import React, {useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';

import {
  Button,
  Card,
  Screen,
  SectionTitle,
  Tag,
  TextField,
  ToggleRow,
} from '../../../components/Primitives';
import {useSettingsStore} from '../../../stores/useSettingsStore';
import {useSalesStore} from '../../../stores/useSalesStore';
import {useProductStore} from '../../../stores/useProductStore';
import {testPrint} from '../../../services/receiptPrinter';
import {
  saveBackupToDevice,
  pickAndRestoreBackup,
} from '../../../services/backupService';
import {theme} from '../../../theme';

export function SettingsScreen() {
  const settings = useSettingsStore(state => state.settings);
  const updateSettings = useSettingsStore(state => state.updateSettings);
  const setSettings = useSettingsStore(state => state.setSettings);
  const pushFeedback = useSalesStore(state => state.pushFeedback);
  const setReceipts = useSalesStore(state => state.setReceipts);
  const setProducts = useProductStore(state => state.setProducts);

  const [storeName, setStoreName] = useState(settings?.storeName ?? '');
  const [subtitle, setSubtitle] = useState(settings?.storeSubtitle ?? '');
  const [printerName, setPrinterName] = useState(
    settings?.printerName ?? '',
  );
  const [autoPrint, setAutoPrint] = useState(settings?.autoPrint ?? true);
  const [printerConnected, setPrinterConnected] = useState(
    settings?.printerConnected ?? false,
  );
  const [cameraSleep, setCameraSleep] = useState(
    String(settings?.cameraSleepSeconds ?? 8),
  );

  const handleSaveStore = () => {
    updateSettings({
      storeName,
      storeSubtitle: subtitle,
    });
    pushFeedback(
      'success',
      'Settings saved',
      'Store details updated. This device is still fully offline.',
    );
  };

  const handleSavePrinter = () => {
    const sleepNum = Math.max(3, Math.min(60, parseInt(cameraSleep, 10) || 8));
    updateSettings({
      printerName,
      printerConnected,
      autoPrint,
      cameraSleepSeconds: sleepNum,
    });
    pushFeedback(
      'success',
      'Printer saved',
      'Printer settings updated. This device is still fully offline.',
    );
  };

  const handleTestPrint = async () => {
    try {
      const success = await testPrint(storeName || 'POS');
      if (success) {
        pushFeedback(
          'success',
          'Test print sent',
          'Check your thermal printer for the test page.',
        );
      }
    } catch {
      pushFeedback(
        'danger',
        'Print failed',
        'Could not reach the printer. Check Bluetooth connection.',
      );
    }
  };

  const handleExportBackup = async () => {
    try {
      const success = await saveBackupToDevice();
      if (success) {
        pushFeedback(
          'success',
          'Backup Created',
          'Database snapshot saved to your device.',
        );
      }
    } catch (error) {
      pushFeedback(
        'danger',
        'Backup Failed',
        error instanceof Error ? error.message : 'Could not save backup file.',
      );
    }
  };

  const handleRestoreBackup = () => {
    Alert.alert(
      'Restore Backup',
      'This will overwrite all current local data (products, receipts, settings). Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await pickAndRestoreBackup();
              if (result.success) {
                // Refresh local stores from the new database state
                const {loadSnapshot} = await import('../../../database/posDb');
                const snapshot = await loadSnapshot();

                setProducts(snapshot.products);
                setReceipts(snapshot.receipts);
                setSettings(snapshot.settings);

                pushFeedback(
                  'success',
                  'Restore Successful',
                  'Local database has been updated with backup data.',
                );
              } else if (result.error) {
                pushFeedback('danger', 'Restore Failed', result.error);
              }
            } catch (error) {
              pushFeedback(
                'danger',
                'Restore Failed',
                error instanceof Error ? error.message : 'Unknown error',
              );
            }
          },
        },
      ],
    );
  };

  if (!settings) {
    return null;
  }

  return (
    <Screen>
      <Card>
        <SectionTitle
          title="Store details"
          detail="Displayed on receipts and reports."
        />
        <TextField
          label="Store name"
          value={storeName}
          onChangeText={setStoreName}
          placeholder="Corner Shop POS"
        />
        <TextField
          label="Counter subtitle"
          value={subtitle}
          onChangeText={setSubtitle}
          placeholder="Offline counter mode"
        />
        <Button label="Save store details" onPress={handleSaveStore} />
      </Card>

      <Card>
        <SectionTitle
          title="Printer setup"
          detail="Bluetooth thermal printer pairing and test actions."
          action={
            <Tag
              label={printerConnected ? 'Connected' : 'Disconnected'}
              tone={printerConnected ? 'success' : 'danger'}
            />
          }
        />
        <TextField
          label="Printer name"
          value={printerName}
          onChangeText={setPrinterName}
          placeholder="Thermal Printer T82"
        />
        <ToggleRow
          label="Printer connected"
          hint="Lets the app show print-ready feedback inside the sales flow."
          value={printerConnected}
          onValueChange={value => setPrinterConnected(value)}
        />
        <ToggleRow
          label="Auto print receipts"
          hint="Print instantly right after checkout."
          value={autoPrint}
          onValueChange={value => setAutoPrint(value)}
        />
        <TextField
          label="Camera sleep timer (seconds)"
          value={cameraSleep}
          onChangeText={setCameraSleep}
          placeholder="8"
          keyboardType="numeric"
        />
        <View style={styles.settingsActions}>
          <Button label="Save printer setup" onPress={handleSavePrinter} />
          <Button
            label="Test print"
            onPress={() => {
              handleTestPrint().catch(() => {});
            }}
            variant="secondary"
          />
        </View>
      </Card>

      <Card>
        <SectionTitle
          title="Offline reliability"
          detail="Critical behavior stays visible so users trust the device."
        />
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>SQLite local mode</Text>
          <Text style={styles.statusDetail}>
            All products, stock changes, and receipts stay on device. No login.
            No internet required.
          </Text>
        </View>
        <View style={styles.settingsActions}>
          <Button label="Create local backup" onPress={handleExportBackup} />
          <Button
            label="Restore backup"
            onPress={handleRestoreBackup}
            variant="secondary"
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  settingsActions: {
    gap: theme.spacing.sm,
  },
  statusPanel: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.panelMuted,
    gap: theme.spacing.sm,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  statusDetail: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.muted,
  },
});
