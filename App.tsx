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
import {useAppTheme} from './src/theme';
import type {TabKey} from './src/types';

import {SalesScreen} from './src/features/sales/screens/SalesScreen';
import {ProductListScreen} from './src/features/products/screens/ProductListScreen';
import {InventoryScreen} from './src/features/inventory/screens/InventoryScreen';
import {ReportsScreen} from './src/features/reports/screens/ReportsScreen';
import {SettingsScreen} from './src/features/settings/screens/SettingsScreen';

function App() {
  return (
    <SafeAreaProvider>
      <AppThemeWrapper />
    </SafeAreaProvider>
  );
}

function AppThemeWrapper() {
  const {colors, isDark} = useAppTheme();
  
  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </View>
  );
}

function AppContent() {
  const {colors} = useAppTheme();
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
      <View style={[styles.appShell, {backgroundColor: colors.background}]}>
        <IntroScreen />
      </View>
    );
  }

  if (settings && !settings.hasSeenOnboarding) {
    return (
      <View style={[styles.appShell, {backgroundColor: colors.background}]}>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </View>
    );
  }

  if (error || !settings) {
    return (
      <View style={[styles.centerState, {backgroundColor: colors.background, paddingHorizontal: 24, gap: 14}]}>
        <Text style={[styles.centerTitle, {color: colors.ink}]}>Device setup needs attention</Text>
        <Text style={[styles.centerBody, {color: colors.muted}]}>
          {error ?? 'The local database is not ready yet.'}
        </Text>
        <Pressable onPress={retry} style={[styles.retryButton, {backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 18}]}>
          <Text style={[styles.retryButtonText, {color: colors.panel}]}>Retry local startup</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.appShell, {backgroundColor: colors.background}]}>
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
  },
  screenWrap: {
    flex: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  centerBody: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
});

export default App;
