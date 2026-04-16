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
    <View style={[styles.safeWrap, {paddingBottom: Math.max(bottomInset, 10)}]}>
      <View style={styles.outer}>
        <View style={styles.surface}>
          <View style={styles.sideRow}>
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

          <View style={styles.centerGap}>
            <Text style={[styles.centerLabel, activeTab === 'sales' ? styles.centerLabelActive : null]}>
              Sales
            </Text>
          </View>

          <View style={styles.sideRow}>
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

        <Pressable
          onPress={() => onChange('sales')}
          style={({pressed}) => [
            styles.centerActionWrap,
            pressed ? styles.centerPressed : null,
          ]}>
          <View style={styles.centerHalo} />
          <View
            style={[
              styles.centerAction,
              activeTab === 'sales' ? styles.centerActionActive : null,
            ]}>
            <SalesGlyph />
          </View>
        </Pressable>
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
  return (
    <View style={styles.salesGlyph}>
      <View style={styles.salesScanCorners} />
      <View style={styles.salesCenterDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeWrap: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 8,
  },
  outer: {
    position: 'relative',
  },
  surface: {
    minHeight: 92,
    backgroundColor: theme.colors.panel,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#DCE4ED',
    paddingHorizontal: 10,
    paddingTop: 22,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    ...theme.shadow,
  },
  sideRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
  },
  centerGap: {
    width: 92,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  centerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#96A4B5',
  },
  centerLabelActive: {
    color: theme.colors.primary,
  },
  centerActionWrap: {
    position: 'absolute',
    alignSelf: 'center',
    top: -34,
    left: '50%',
    marginLeft: -40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPressed: {
    opacity: 0.92,
  },
  centerHalo: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(23, 58, 99, 0.12)',
  },
  centerAction: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#386FC7',
    borderWidth: 6,
    borderColor: '#F7FAFD',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#173A63',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },
  centerActionActive: {
    transform: [{scale: 1.02}],
  },
  sideTab: {
    width: 68,
    alignItems: 'center',
    gap: 8,
  },
  sidePressed: {
    opacity: 0.8,
  },
  iconFrame: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    width: 20,
    height: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  gridCell: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  cardIcon: {
    width: 22,
    height: 16,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardStripe: {
    height: 4,
    width: '100%',
  },
  reportIcon: {
    width: 20,
    height: 20,
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
    height: 13,
    borderRadius: 2,
  },
  reportBarTall: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  gearRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  salesGlyph: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salesScanCorners: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  salesCenterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
