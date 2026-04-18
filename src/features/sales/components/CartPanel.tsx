import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {Button, formatMoney} from '../../../components/Primitives';
import {useAppTheme} from '../../../theme';
import type {Product} from '../../../types';

type CartProduct = Product & {
  quantity: number;
  lineTotal: number;
};

type CartPanelProps = {
  items: CartProduct[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onScanFirst: () => void;
};

export function CartPanel({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onScanFirst,
}: CartPanelProps) {
  const {colors, spacing, radius} = useAppTheme();
  
  if (items.length === 0) {
    return (
      <View style={[styles.emptyCart, { backgroundColor: colors.panelMuted, borderRadius: radius.md }]}>
        <Text style={[styles.emptyCartTitle, { color: colors.ink }]}>No items yet</Text>
        <Text style={[styles.emptyCartBody, { color: colors.muted }]}>
          The first scan should be the only decision the cashier makes.
        </Text>
        <Button label="Browse Catalog" onPress={onScanFirst} />
      </View>
    );
  }

  return (
    <View style={styles.cartList}>
      {items.map(item => (
        <View key={item.id} style={[styles.cartRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.cartAvatar, {backgroundColor: item.color}]}>
            <Text style={[styles.cartAvatarText, { color: colors.panel }]}>{item.name.slice(0, 1)}</Text>
          </View>

          <View style={styles.cartTextWrap}>
            <Text style={[styles.cartName, { color: colors.ink }]}>{item.name}</Text>
            <Text style={[styles.cartMeta, { color: colors.muted }]}>{formatMoney(item.price)} each</Text>
          </View>

          <View style={styles.cartActionWrap}>
            <View style={[styles.qtyStepper, { backgroundColor: colors.panelMuted, borderRadius: radius.pill }]}>
              <Pressable
                onPress={() => onUpdateQuantity(item.id, -1)}
                style={styles.qtyTap}>
                <Text style={[styles.qtyTapText, { color: colors.primary }]}>-</Text>
              </Pressable>
              <Text style={[styles.qtyCount, { color: colors.ink }]}>{item.quantity}</Text>
              <Pressable
                onPress={() => onUpdateQuantity(item.id, 1)}
                style={styles.qtyTap}>
                <Text style={[styles.qtyTapText, { color: colors.primary }]}>+</Text>
              </Pressable>
            </View>

            <Text style={[styles.cartLineTotal, { color: colors.ink }]}>
              {formatMoney(item.lineTotal)}
            </Text>
            <Pressable onPress={() => onRemoveItem(item.id)}>
              <Text style={[styles.cartRemove, { color: colors.danger }]}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCart: {
    gap: 14,
    padding: 18,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  emptyCartBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  cartList: {
    gap: 14,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  cartAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartAvatarText: {
    fontSize: 18,
    fontWeight: '900',
  },
  cartTextWrap: {
    flex: 1,
    gap: 4,
  },
  cartName: {
    fontSize: 15,
    fontWeight: '800',
  },
  cartMeta: {
    fontSize: 13,
  },
  cartActionWrap: {
    alignItems: 'flex-end',
    gap: 8,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 6,
    minHeight: 36,
  },
  qtyTap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyTapText: {
    fontSize: 20,
    fontWeight: '700',
  },
  qtyCount: {
    fontSize: 15,
    fontWeight: '900',
    minWidth: 18,
    textAlign: 'center',
  },
  cartLineTotal: {
    fontSize: 15,
    fontWeight: '900',
  },
  cartRemove: {
    fontSize: 12,
    fontWeight: '700',
  },
});
