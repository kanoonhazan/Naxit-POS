import {useEffect, useState} from 'react';

import {initializeDatabase, loadSnapshot} from '../database/posDb';
import {useProductStore} from '../stores/useProductStore';
import {useSalesStore} from '../stores/useSalesStore';
import {useSettingsStore} from '../stores/useSettingsStore';

type AppInitState = {
  loading: boolean;
  error: string | null;
  retry: () => void;
};

export function useAppInit(): AppInitState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setProducts = useProductStore(state => state.setProducts);
  const setReceipts = useSalesStore(state => state.setReceipts);
  const setSettings = useSettingsStore(state => state.setSettings);
  const loadFromStorage = useSettingsStore(state => state.loadFromStorage);
  const persistToStorage = useSettingsStore(state => state.persistToStorage);

  const loadApp = async () => {
    setLoading(true);
    setError(null);

    try {
      await initializeDatabase();
      const snapshot = await loadSnapshot();

      setProducts(snapshot.products);
      setReceipts(snapshot.receipts);

      // Try AsyncStorage first, fall back to DB settings
      const storedSettings = await loadFromStorage();

      if (!storedSettings) {
        // First run: use DB settings and persist to AsyncStorage
        setSettings(snapshot.settings);
        await persistToStorage(snapshot.settings);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'The offline database could not be opened.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApp().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loading,
    error,
    retry: () => {
      loadApp().catch(() => {});
    },
  };
}
