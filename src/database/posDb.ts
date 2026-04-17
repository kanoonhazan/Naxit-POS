import {createMMKV} from 'react-native-mmkv';

import {seedProducts, seedReceipts, seedSettings} from '../seed';
import type {Product, Receipt, StoreSettings} from '../types';

const storage = createMMKV({
  id: 'pos_secure_db',
  encryptionKey: 'naxit_pos_secure_base_key_1',
});

type Snapshot = {
  products: Product[];
  receipts: Receipt[];
  settings: StoreSettings;
};

const PRODUCTS_KEY = 'pos_products';
const RECEIPTS_KEY = 'pos_receipts';
const SETTINGS_KEY = 'pos_settings';
const SEED_KEY = 'pos_seeded';

function getProducts(): Product[] {
  try {
    const data = storage.getString(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn('[DATABASE] Failed to parse products:', error);
    return [];
  }
}

function getReceipts(): Receipt[] {
  try {
    const data = storage.getString(RECEIPTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn('[DATABASE] Failed to parse receipts:', error);
    return [];
  }
}

function getSettings(): StoreSettings | null {
  try {
    const data = storage.getString(SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('[DATABASE] Failed to parse settings:', error);
    return null;
  }
}

export async function initializeDatabase() {
  const isSeeded = storage.getBoolean(SEED_KEY);

  if (isSeeded) {
    return;
  }

  // Seeding
  storage.set(PRODUCTS_KEY, JSON.stringify(seedProducts));
  storage.set(RECEIPTS_KEY, JSON.stringify(seedReceipts));
  storage.set(SETTINGS_KEY, JSON.stringify(seedSettings));
  storage.set(SEED_KEY, true);
}

export async function loadSnapshot(): Promise<Snapshot> {
  const products = getProducts();
  const receipts = getReceipts();
  let settings = getSettings();

  products.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {sensitivity: 'base'}),
  );
  receipts.sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
  );

  if (!settings) {
    settings = seedSettings;
  }

  return {
    products,
    receipts,
    settings,
  };
}

export async function upsertProduct(product: Product) {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);

  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }

  storage.set(PRODUCTS_KEY, JSON.stringify(products));
}

export async function deleteProductById(productId: string) {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);
  storage.set(PRODUCTS_KEY, JSON.stringify(filtered));
}

export async function updateProductStock(productId: string, stock: number) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);

  if (product) {
    product.stock = stock;
    storage.set(PRODUCTS_KEY, JSON.stringify(products));
  }
}

export async function saveStoreSettings(settings: StoreSettings) {
  storage.set(SETTINGS_KEY, JSON.stringify(settings));
}

export async function persistReceipt(receipt: Receipt) {
  const receipts = getReceipts();

  receipts.push(receipt);
  storage.set(RECEIPTS_KEY, JSON.stringify(receipts));

  // Deduct stock for receipt items
  const products = getProducts();
  let productsChanged = false;

  receipt.items.forEach(item => {
    const p = products.find(prod => prod.id === item.productId);
    if (p) {
      p.stock = Math.max(p.stock - item.quantity, 0);
      productsChanged = true;
    }
  });

  if (productsChanged) {
    storage.set(PRODUCTS_KEY, JSON.stringify(products));
  }
}

export async function restoreFromSnapshot(snapshot: Snapshot) {
  storage.set(PRODUCTS_KEY, JSON.stringify(snapshot.products));
  storage.set(RECEIPTS_KEY, JSON.stringify(snapshot.receipts));
  storage.set(SETTINGS_KEY, JSON.stringify(snapshot.settings));
  storage.set(SEED_KEY, true); // Mark as seeded since we have data
}
