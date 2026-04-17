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
  onCheckout,
}: CheckoutDockProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  return (
    <View style={styles.dock}>
      <View style={styles.topRow}>
        <View style={styles.amountWrap}>
          <Text style={styles.total}>{formatMoney(subtotal)}</Text>
          <View style={styles.metaBubble}>
            <Text style={styles.metaText}>
              {totalItems} item{totalItems === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionWrap}>
          <Button
            label="Checkout"
            onPress={() => onCheckout(paymentMethod)}
            disabled={!hasItems}
          />
        </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionWrap: {
    minWidth: 120,
  },
  total: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.ink,
    letterSpacing: -0.6,
  },
  metaBubble: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.panelMuted,
  },
  metaText: {
    fontSize: 12,
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
