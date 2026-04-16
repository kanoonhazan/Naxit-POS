import {loadSnapshot} from '../database/posDb';
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
