import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {Button, formatMoney} from '../../../components/Primitives';
import {theme} from '../../../theme';
import type {PaymentMethod} from '../../../types';

const paymentMethods: PaymentMethod[] = ['cash', 'card', 'split'];

type CheckoutDockProps = {
  subtotal: number;
  totalItems: number;
  hasItems: boolean;
  printerConnected: boolean;
  onCheckout: (paymentMethod: PaymentMethod) => void;
};

export function CheckoutDock({
  subtotal,
  totalItems,
  hasItems,
  printerConnected,
  onCheckout,
}: CheckoutDockProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  return (
    <View style={styles.dockWrap} pointerEvents="box-none">
      <View style={styles.dock}>
        <View style={styles.topRow}>
          <View style={styles.metaBubble}>
            <Text style={styles.metaText}>
              {totalItems} item{totalItems === 1 ? '' : 's'}
            </Text>
          </View>
          <Text style={styles.total}>{formatMoney(subtotal)}</Text>
        </View>

        <View style={styles.paymentSelector}>
          {paymentMethods.map(method => {
            const active = paymentMethod === method;
            return (
              <Pressable
                key={method}
                onPress={() => setPaymentMethod(method)}
                style={[
                  styles.paymentOption,
                  active ? styles.paymentOptionActive : null,
                ]}>
                <Text
                  style={[
                    styles.paymentOptionText,
                    active ? styles.paymentOptionTextActive : null,
                  ]}>
                  {method.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button
          label={hasItems ? `Checkout ${formatMoney(subtotal)}` : 'Checkout'}
          onPress={() => onCheckout(paymentMethod)}
          disabled={!hasItems}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrap: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: 48,
  },
  dock: {
    backgroundColor: theme.colors.panel,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8EDF2',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    shadowColor: '#0B1522',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  total: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.ink,
    letterSpacing: -0.6,
  },
  metaBubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.panelMuted,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.muted,
  },
  paymentSelector: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F6',
    borderRadius: theme.radius.md,
    padding: 3,
    gap: 3,
  },
  paymentOption: {
    flex: 1,
    minHeight: 38,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentOptionActive: {
    backgroundColor: theme.colors.panel,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  paymentOptionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#95A4B5',
  },
  paymentOptionTextActive: {
    color: theme.colors.ink,
  },
});
