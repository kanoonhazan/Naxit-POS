import React, {useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';

import {TabBar} from './src/navigation/TabBar';
import {useAppInit} from './src/hooks/useAppInit';
import {useSettingsStore} from './src/stores/useSettingsStore';
import {theme} from './src/theme';
import type {TabKey} from './src/types';

import {SalesScreen} from './src/features/sales/screens/SalesScreen';
import {ProductListScreen} from './src/features/products/screens/ProductListScreen';
import {InventoryScreen} from './src/features/inventory/screens/InventoryScreen';
import {ReportsScreen} from './src/features/reports/screens/ReportsScreen';
import {SettingsScreen} from './src/features/settings/screens/SettingsScreen';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('sales');
  const {loading, error, retry} = useAppInit();
  const settings = useSettingsStore(state => state.settings);

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.centerTitle}>Opening offline POS</Text>
        <Text style={styles.centerBody}>
          Loading your local database, products, receipts, and settings.
        </Text>
      </View>
    );
  }

  if (error || !settings) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.centerTitle}>Device setup needs attention</Text>
        <Text style={styles.centerBody}>
          {error ?? 'The local database is not ready yet.'}
        </Text>
        <Pressable onPress={retry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry local startup</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.appShell}>
      <View style={styles.screenWrap}>
        {activeTab === 'sales' ? <SalesScreen /> : null}
        {activeTab === 'products' ? <ProductListScreen /> : null}
        {activeTab === 'inventory' ? <InventoryScreen /> : null}
        {activeTab === 'reports' ? <ReportsScreen /> : null}
        {activeTab === 'settings' ? <SettingsScreen /> : null}
      </View>

      <TabBar activeTab={activeTab} bottomInset={insets.bottom} onChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screenWrap: {
    flex: 1,
  },
  centerState: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  centerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.ink,
    textAlign: 'center',
  },
  centerBody: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.muted,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.panel,
  },
});

export default App;
