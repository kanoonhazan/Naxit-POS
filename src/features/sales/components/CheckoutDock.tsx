import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, formatMoney } from '../../../components/Primitives';
import { useAppTheme } from '../../../theme';

type CheckoutDockProps = {
  subtotal: number;
  totalItems: number;
  hasItems: boolean;
  onPrepareCheckout: () => void;
};

export function CheckoutDock({
  subtotal,
  totalItems,
  hasItems,
  onPrepareCheckout,
}: CheckoutDockProps) {
  const { colors, radius } = useAppTheme();

  return (
    <View style={[styles.dock, { borderBottomColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={styles.amountWrap}>
          <Text style={[styles.total, { color: colors.ink }]}>{formatMoney(subtotal)}</Text>
          <View style={[styles.metaBubble, { backgroundColor: colors.panelMuted, borderRadius: radius.pill }]}>
            <Text style={[styles.metaText, { color: colors.muted }]}>
              {totalItems} item{totalItems === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionWrap}>
          <Button
            label="Checkout"
            onPress={onPrepareCheckout}
            disabled={!hasItems}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    gap: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionWrap: {
    minWidth: 120,
  },
  total: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  metaBubble: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '800',
  },
});

