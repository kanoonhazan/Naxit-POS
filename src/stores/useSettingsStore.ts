import {createMMKV} from 'react-native-mmkv';
import {create} from 'zustand';

import type {StoreSettings} from '../types';

const storage = createMMKV({id: 'settings-storage'});
const SETTINGS_KEY = 'pos_store_settings';

type SettingsStore = {
  settings: StoreSettings | null;

  setSettings: (settings: StoreSettings) => void;

  updateSettings: (patch: Partial<StoreSettings>) => void;

  loadFromStorage: () => Promise<StoreSettings | null>;

  persistToStorage: (settings: StoreSettings) => Promise<void>;
};

const defaultSettings: StoreSettings = {
  storeName: 'Corner Shop POS',
  storeSubtitle: 'Offline counter mode',
  printerName: 'Thermal Printer T82',
  printerConnected: true,
  autoPrint: true,
  currency: 'LKR',
  cameraSleepSeconds: 8,
  hasSeenOnboarding: false,
  themeMode: 'system',
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,

  setSettings: (settings: StoreSettings) => set({settings}),

  updateSettings: (patch: Partial<StoreSettings>) => {
    set(state => {
      if (!state.settings) {
        return state;
      }

      const nextSettings = {...state.settings, ...patch};

      get()
        .persistToStorage(nextSettings)
        .catch(() => {});

      return {settings: nextSettings};
    });
  },

  loadFromStorage: async () => {
    try {
      const stored = storage.getString(SETTINGS_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as StoreSettings;
        set({settings: parsed});
        return parsed;
      }
    } catch {
      // Fall through to defaults
    }

    return null;
  },

  persistToStorage: async (settings: StoreSettings) => {
    try {
      storage.set(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Silent failure
    }
  },
}));

export {defaultSettings};
