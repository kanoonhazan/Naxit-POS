import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions, Animated } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { useAppTheme } from '../theme';
import type { TabKey } from '../types';
import { TabBg } from './TabBg';

const sideTabs: Array<{ key: Exclude<TabKey, 'sales'>; label: string }> = [
  { key: 'inventory', label: 'Inventory' },
  { key: 'products', label: 'Products' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
];

export function TabBar({
  activeTab,
  onChange,
  bottomInset,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  bottomInset: number;
}) {
  const { colors, shadow } = useAppTheme();
  const { width } = useWindowDimensions();
  
  const leftTabs = sideTabs.slice(0, 2);
  const rightTabs = sideTabs.slice(2);

  return (
    <View style={[styles.safeWrap, { paddingBottom: Math.max(bottomInset, 4) }]}>
      <TabBg color={colors.panel} width={width} />
      
      <View style={styles.content}>
        <View style={styles.sideSection}>
          {leftTabs.map(tab => (
            <SideTab
              key={tab.key}
              active={activeTab === tab.key}
              label={tab.label}
              tabKey={tab.key}
              onPress={() => onChange(tab.key)}
            />
          ))}
        </View>

        <View style={styles.centerSection}>
          <Pressable
            onPress={() => onChange('sales')}
            style={({ pressed }) => [
              styles.centerTab,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
              },
              pressed ? styles.centerTabPressed : null,
            ]}>
            <View style={styles.glow} />
            <SalesGlyph color={colors.panel} />
          </Pressable>
        </View>

        <View style={styles.sideSection}>
          {rightTabs.map(tab => (
            <SideTab
              key={tab.key}
              active={activeTab === tab.key}
              label={tab.label}
              tabKey={tab.key}
              onPress={() => onChange(tab.key)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export function SideTab({
  active,
  label,
  tabKey,
  onPress,
}: {
  active: boolean;
  label: string;
  tabKey: Exclude<TabKey, 'sales'>;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable 
      onPress={onPress} 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.sideTab}
    >
      <Animated.View style={[
        styles.iconFrame, 
        { 
          backgroundColor: active ? colors.primarySoft : 'transparent',
          transform: [{ scale }]
        }
      ]}>
        <TabGlyph tab={tabKey} color={active ? colors.primary : colors.muted} />
      </Animated.View>
      <Text style={[
        styles.sideLabel, 
        { color: active ? colors.primary : colors.muted }
      ]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function TabGlyph({
  tab,
  color,
}: {
  tab: Exclude<TabKey, 'sales'>;
  color: string;
}) {
  if (tab === 'inventory') {
    return (
      <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <Path d="m3.3 7 8.7 5 8.7-5" />
        <Path d="M12 22V12" />
      </Svg>
    );
  }

  if (tab === 'products') {
    return (
      <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <Path d="M7 7h.01" />
      </Svg>
    );
  }

  if (tab === 'reports') {
    return (
      <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 20V10" />
        <Path d="M18 20V4" />
        <Path d="M6 20v-4" />
      </Svg>
    );
  }

  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

function SalesGlyph({ color }: { color: string }) {
  return (
    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <Path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <Path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <Path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <Rect x="7" y="7" width="10" height="10" rx="2" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safeWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    height: 95, // Increased from 85 to accommodate taller bar
  },
  content: {
    flexDirection: 'row',
    height: 82, // Matched with TabBg height
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  sideSection: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerTab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -35, // Adjusted to keep same screen position as before
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  centerTabPressed: {
    transform: [{ scale: 0.94 }],
  },
  glow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(23, 58, 99, 0.15)', // Light overlay of primary blue
  },
  sideTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconFrame: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

