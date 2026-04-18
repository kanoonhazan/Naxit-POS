import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {Button, formatMoney} from '../../../components/Primitives';
import {useAppTheme} from '../../../theme';
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
  const {colors, radius} = useAppTheme();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

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
            onPress={() => onCheckout(paymentMethod)}
            disabled={!hasItems}
          />
        </View>
      </View>

      <View style={[styles.paymentSelector, { backgroundColor: colors.background, borderRadius: radius.md }]}>
        {paymentMethods.map(method => {
          const active = paymentMethod === method;
          return (
            <Pressable
              key={method}
              onPress={() => setPaymentMethod(method)}
              style={[
                styles.paymentOption,
                { borderRadius: radius.sm },
                active ? [styles.paymentOptionActive, { backgroundColor: colors.panel }] : null,
              ]}>
              <Text
                style={[
                  styles.paymentOptionText,
                  { color: colors.muted },
                  active ? { color: colors.ink } : null,
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
  paymentSelector: {
    flexDirection: 'row',
    padding: 3,
    gap: 3,
  },
  paymentOption: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentOptionActive: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  paymentOptionText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
