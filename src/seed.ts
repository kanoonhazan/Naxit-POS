import type {Product, Receipt, StoreSettings} from './types';

const now = Date.now();
const hours = (count: number) => count * 60 * 60 * 1000;

export const seedProducts: Product[] = [];

export const seedReceipts: Receipt[] = [];

export const seedSettings: StoreSettings = {
  storeName: 'NAXIT',
  storeSubtitle: 'Offline counter mode',
  printerName: 'Thermal Printer T82',
  printerConnected: true,
  autoPrint: true,
  currency: 'LKR',
  cameraSleepSeconds: 8,
  hasSeenOnboarding: false,
};
