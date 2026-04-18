import React, {useEffect, useState} from 'react';
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
import {IntroScreen} from './src/components/IntroScreen';
import {OnboardingScreen} from './src/components/OnboardingScreen';
import {ErrorBoundary} from './src/components/ErrorBoundary';
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
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('sales');
  const {loading, error, retry} = useAppInit();
  const settings = useSettingsStore(state => state.settings);
  
  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);

  // Handle minimum intro duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroFinished(true);
    }, 2000); // 2 seconds minimum for the intro
    return () => clearTimeout(timer);
  }, []);

  // When both loading is done AND minimum intro time has passed, we can hide the intro
  useEffect(() => {
    if (!loading && introFinished && settings) {
      // Small delay before unmounting to ensure smooth transition
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, introFinished, settings]);

  const updateSettings = useSettingsStore(state => state.updateSettings);

  const handleOnboardingComplete = () => {
    updateSettings({hasSeenOnboarding: true});
  };

  if (showIntro || (loading && !error)) {
    return (
      <View style={styles.appShell}>
        <IntroScreen />
      </View>
    );
  }

  if (settings && !settings.hasSeenOnboarding) {
    return (
      <View style={styles.appShell}>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
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
