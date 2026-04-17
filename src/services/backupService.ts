import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

import {loadSnapshot, restoreFromSnapshot} from '../database/posDb';
import type {Product, Receipt, StoreSettings} from '../types';

type BackupData = {
  version: 1;
  exportedAt: string;
  products: Product[];
  receipts: Receipt[];
  settings: StoreSettings;
};

/**
 * Export all local data as a JSON string.
 * This can be saved to a file or shared.
 */
export async function exportBackup(): Promise<string> {
  const snapshot = await loadSnapshot();

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    products: snapshot.products,
    receipts: snapshot.receipts,
    settings: snapshot.settings,
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Parse a backup JSON string and validate its structure.
 * Returns the parsed data or null if invalid.
 */
export function parseBackup(json: string): BackupData | null {
  try {
    const parsed = JSON.parse(json);

    if (
      parsed &&
      parsed.version === 1 &&
      Array.isArray(parsed.products) &&
      Array.isArray(parsed.receipts) &&
      parsed.settings
    ) {
      return parsed as BackupData;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Validate backup data has the expected shape.
 */
export function validateBackup(data: BackupData): {valid: boolean; errors: string[]} {
  const errors: string[] = [];

  if (!data.products || !Array.isArray(data.products)) {
    errors.push('Missing products array');
  }

  if (!data.receipts || !Array.isArray(data.receipts)) {
    errors.push('Missing receipts array');
  }

  if (!data.settings || !data.settings.storeName) {
    errors.push('Missing or invalid settings');
  }

  data.products?.forEach((product, index) => {
    if (!product.id || !product.name) {
      errors.push(`Product at index ${index} is missing id or name`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generates a backup file and opens the share dialog to let the user save it.
 */
export async function saveBackupToDevice(): Promise<boolean> {
  try {
    const json = await exportBackup();
    const fileName = `naxit_pos_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    await RNFS.writeFile(filePath, json, 'utf8');

    await Share.open({
      url: `file://${filePath}`,
      type: 'application/json',
      title: 'Save POS Backup',
      saveToFiles: true, // Specific for iOS but helps on Android too
    });

    return true;
  } catch (error) {
    if (error instanceof Error && error.message === 'User did not share') {
      return false;
    }
    console.error('[BACKUP] Failed to save backup:', error);
    throw error;
  }
}

/**
 * Opens the file picker, reads the selected file, validates it, and restores data.
 */
export async function pickAndRestoreBackup(): Promise<{success: boolean; error?: string}> {
  try {
    const res = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.allFiles, 'application/json'],
      copyTo: 'cachesDirectory',
    });

    if (!res.fileCopyUri) {
      return {success: false, error: 'Could not access file'};
    }

    const content = await RNFS.readFile(res.fileCopyUri, 'utf8');
    const backup = parseBackup(content);

    if (!backup) {
      return {success: false, error: 'Invalid backup file format'};
    }

    const validation = validateBackup(backup);
    if (!validation.valid) {
      return {success: false, error: `Validation failed: ${validation.errors.join(', ')}`};
    }

    await restoreFromSnapshot({
      products: backup.products,
      receipts: backup.receipts,
      settings: backup.settings,
    });

    return {success: true};
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      return {success: false};
    }
    console.error('[BACKUP] Restore failed:', err);
    return {success: false, error: err instanceof Error ? err.message : 'Unknown error'};
  }
}
