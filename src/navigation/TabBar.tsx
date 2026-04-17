import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {theme} from '../theme';
import type {TabKey} from '../types';

const sideTabs: Array<{key: Exclude<TabKey, 'sales'>; label: string}> = [
  {key: 'inventory', label: 'Inventory'},
  {key: 'products', label: 'Products'},
  {key: 'reports', label: 'Reports'},
  {key: 'settings', label: 'Settings'},
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
  const leftTabs = sideTabs.slice(0, 2);
  const rightTabs = sideTabs.slice(2);

  return (
    <View style={[styles.safeWrap, {paddingBottom: Math.max(bottomInset, 16)}]}>
      <View style={styles.surface}>
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
          style={({pressed}) => [
            styles.centerTab,
            pressed ? styles.centerTabPressed : null,
            activeTab === 'sales' ? styles.centerTabActive : null,
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

function SideTab({
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
  return (
    <Pressable onPress={onPress} style={({pressed}) => [styles.sideTab, pressed ? styles.sidePressed : null]}>
      <View style={[styles.iconFrame, active ? styles.iconFrameActive : null]}>
        <TabGlyph tab={tabKey} active={active} />
      </View>
      <Text style={[styles.sideLabel, active ? styles.sideLabelActive : null]} numberOfLines={1}>
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
  const ink = active ? theme.colors.primary : '#8290A3';

  if (tab === 'inventory') {
    return (
      <View style={styles.gridIcon}>
        {[0, 1, 2, 3].map(box => (
          <View key={box} style={[styles.gridCell, {backgroundColor: ink}]} />
        ))}
      </View>
    );
  }

  if (tab === 'products') {
    return (
      <View style={[styles.cardIcon, {borderColor: ink}]}>
        <View style={[styles.cardStripe, {backgroundColor: ink}]} />
      </View>
    );
  }

  if (tab === 'reports') {
    return (
      <View style={styles.reportIcon}>
        <View style={[styles.reportBarShort, {backgroundColor: ink}]} />
        <View style={[styles.reportBarMid, {backgroundColor: ink}]} />
        <View style={[styles.reportBarTall, {backgroundColor: ink}]} />
      </View>
    );
  }

  return (
    <View style={[styles.gearRing, {borderColor: ink}]}>
      <View style={[styles.gearCore, {backgroundColor: ink}]} />
    </View>
  );
}

function SalesGlyph() {
  const ink = theme.colors.panel;
  return (
    <View style={styles.salesGlyph}>
      <View style={[styles.salesScanCorners, {borderColor: ink}]} />
      <View style={[styles.salesCenterDot, {backgroundColor: ink}]} />
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
    paddingHorizontal: theme.spacing.lg,
  },
  surface: {
    height: 72,
    backgroundColor: theme.colors.panel,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#DCE4ED',
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#0B1522',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  centerTab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  centerTabPressed: {
    opacity: 0.9,
    transform: [{scale: 0.96}],
  },
  centerTabActive: {
    borderWidth: 2,
    borderColor: '#DCE4ED',
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
  },
  iconFrameActive: {
    backgroundColor: theme.colors.primarySoft,
  },
  sideLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#96A4B5',
  },
  sideLabelActive: {
    color: theme.colors.primary,
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
    borderColor: theme.colors.panel,
  },
  salesCenterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.panel,
  },
});
