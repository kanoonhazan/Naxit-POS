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
          <View>
            <Text style={styles.caption}>Ready to charge</Text>
            <Text style={styles.total}>{formatMoney(subtotal)}</Text>
          </View>
          <View style={styles.metaBubble}>
            <Text style={styles.metaText}>
              {totalItems} item{totalItems === 1 ? '' : 's'}
            </Text>
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

        <Button
          label={
            hasItems ? `Checkout ${formatMoney(subtotal)}` : 'Checkout'
          }
          onPress={() => onCheckout(paymentMethod)}
          disabled={!hasItems}
        />

        <Text style={styles.hint}>
          {printerConnected
            ? 'Receipt prints right after payment.'
            : 'Receipt stays on screen until a printer is connected.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrap: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: 108,
  },
  dock: {
    backgroundColor: theme.colors.panel,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    shadowColor: '#0B1522',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 7,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  caption: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  total: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.ink,
    letterSpacing: -0.8,
  },
  metaBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  paymentSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.panelMuted,
    borderRadius: theme.radius.pill,
    padding: 4,
    gap: 4,
  },
  paymentOption: {
    flex: 1,
    minHeight: 40,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentOptionActive: {
    backgroundColor: theme.colors.panel,
  },
  paymentOptionText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.muted,
  },
  paymentOptionTextActive: {
    color: theme.colors.primary,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    color: theme.colors.muted,
  },
});
