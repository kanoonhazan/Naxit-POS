import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme';
import type { TabKey } from '../types';

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
  const leftTabs = sideTabs.slice(0, 2);
  const rightTabs = sideTabs.slice(2);

  return (
    <View style={[styles.safeWrap, { paddingBottom: Math.max(bottomInset, 16), paddingHorizontal: 18 }]}>
      <View style={[
        styles.surface, 
        { 
          backgroundColor: colors.panel, 
          borderColor: colors.border,
          ...shadow 
        }
      ]}>
        {leftTabs.map(tab => (
          <SideTab
            key={tab.key}
            active={activeTab === tab.key}
            label={tab.label}
            tabKey={tab.key}
            onPress={() => onChange(tab.key)}
          />
        ))}

        <Pressable
          onPress={() => onChange('sales')}
          style={({ pressed }) => [
            styles.centerTab,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              borderColor: colors.border,
            },
            pressed ? styles.centerTabPressed : null,
            activeTab === 'sales' ? [styles.centerTabActive, { borderColor: colors.border }] : null,
          ]}>
          <SalesGlyph />
        </Pressable>

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
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.sideTab, pressed ? styles.sidePressed : null]}>
      <View style={[
        styles.iconFrame, 
        { backgroundColor: active ? colors.primarySoft : 'transparent' }
      ]}>
        <TabGlyph tab={tabKey} active={active} />
      </View>
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
  active,
}: {
  tab: Exclude<TabKey, 'sales'>;
  active: boolean;
}) {
  const { colors } = useAppTheme();
  const ink = active ? colors.primary : colors.muted;

  if (tab === 'inventory') {
    return (
      <View style={styles.gridIcon}>
        {[0, 1, 2, 3].map(box => (
          <View key={box} style={[styles.gridCell, { backgroundColor: ink }]} />
        ))}
      </View>
    );
  }

  if (tab === 'products') {
    return (
      <View style={[styles.cardIcon, { borderColor: ink }]}>
        <View style={[styles.cardStripe, { backgroundColor: ink }]} />
      </View>
    );
  }

  if (tab === 'reports') {
    return (
      <View style={styles.reportIcon}>
        <View style={[styles.reportBarShort, { backgroundColor: ink }]} />
        <View style={[styles.reportBarMid, { backgroundColor: ink }]} />
        <View style={[styles.reportBarTall, { backgroundColor: ink }]} />
      </View>
    );
  }

  return (
    <View style={[styles.gearRing, { borderColor: ink }]}>
      <View style={[styles.gearCore, { backgroundColor: ink }]} />
    </View>
  );
}

function SalesGlyph() {
  const { colors } = useAppTheme();
  const ink = colors.panel;
  return (
    <View style={styles.salesGlyph}>
      <View style={[styles.salesScanCorners, { borderColor: ink }]} />
      <View style={[styles.salesCenterDot, { backgroundColor: ink }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  surface: {
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  centerTab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  centerTabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  centerTabActive: {
    borderWidth: 2,
  },
  sideTab: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  sidePressed: {
    opacity: 0.75,
  },
  iconFrame: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: "hidden"
  },
  sideLabel: {
    fontSize: 8,
    fontWeight: '700',
  },
  gridIcon: {
    width: 18,
    height: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridCell: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  cardIcon: {
    width: 20,
    height: 14,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardStripe: {
    height: 3,
    width: '100%',
  },
  reportIcon: {
    width: 18,
    height: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  reportBarShort: {
    width: 4,
    height: 8,
    borderRadius: 2,
  },
  reportBarMid: {
    width: 4,
    height: 12,
    borderRadius: 2,
  },
  reportBarTall: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  gearRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearCore: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  salesGlyph: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salesScanCorners: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2.5,
  },
  salesCenterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
