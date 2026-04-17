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
import {testPrint} from '../../../services/receiptPrinter';
import {exportBackup} from '../../../services/backupService';
import {theme} from '../../../theme';

export function SettingsScreen() {
  const settings = useSettingsStore(state => state.settings);
  const updateSettings = useSettingsStore(state => state.updateSettings);
  const pushFeedback = useSalesStore(state => state.pushFeedback);

  const [storeName, setStoreName] = useState(settings?.storeName ?? '');
  const [subtitle, setSubtitle] = useState(settings?.storeSubtitle ?? '');
  const [printerName, setPrinterName] = useState(
    settings?.printerName ?? '',
  );
  const [autoPrint, setAutoPrint] = useState(settings?.autoPrint ?? true);
  const [printerConnected, setPrinterConnected] = useState(
    settings?.printerConnected ?? false,
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
    updateSettings({
      printerName,
      printerConnected,
      autoPrint,
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
      const json = await exportBackup();
      // In production, use Share API or FileSystem to save
      console.log('[BACKUP] Data exported:', json.length, 'bytes');
      Alert.alert(
        'Backup ready',
        `Exported ${json.length} bytes of local data. In production, this would be saved as a file or shared.`,
      );
      pushFeedback(
        'success',
        'Backup created',
        'All local data has been exported as JSON.',
      );
    } catch {
      pushFeedback(
        'danger',
        'Backup failed',
        'Could not export the local database.',
      );
    }
  };

  const handleRestoreBackup = () => {
    Alert.alert(
      'Restore backup',
      'In production, this would open a file picker to select a backup JSON file. The data would then be validated and imported into the local database.',
      [{text: 'OK'}],
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
