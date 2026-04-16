import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {Button, formatMoney} from '../../../components/Primitives';
import {theme} from '../../../theme';
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
  if (items.length === 0) {
    return (
      <View style={styles.emptyCart}>
        <Text style={styles.emptyCartTitle}>No items yet</Text>
        <Text style={styles.emptyCartBody}>
          The first scan should be the only decision the cashier makes.
        </Text>
        <Button label="Scan first item" onPress={onScanFirst} />
      </View>
    );
  }

  return (
    <View style={styles.cartList}>
      {items.map(item => (
        <View key={item.id} style={styles.cartRow}>
          <View style={[styles.cartAvatar, {backgroundColor: item.color}]}>
            <Text style={styles.cartAvatarText}>{item.name.slice(0, 1)}</Text>
          </View>

          <View style={styles.cartTextWrap}>
            <Text style={styles.cartName}>{item.name}</Text>
            <Text style={styles.cartMeta}>{formatMoney(item.price)} each</Text>
          </View>

          <View style={styles.cartActionWrap}>
            <View style={styles.qtyStepper}>
              <Pressable
                onPress={() => onUpdateQuantity(item.id, -1)}
                style={styles.qtyTap}>
                <Text style={styles.qtyTapText}>-</Text>
              </Pressable>
              <Text style={styles.qtyCount}>{item.quantity}</Text>
              <Pressable
                onPress={() => onUpdateQuantity(item.id, 1)}
                style={styles.qtyTap}>
                <Text style={styles.qtyTapText}>+</Text>
              </Pressable>
            </View>

            <Text style={styles.cartLineTotal}>
              {formatMoney(item.lineTotal)}
            </Text>
            <Pressable onPress={() => onRemoveItem(item.id)}>
              <Text style={styles.cartRemove}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCart: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.panelMuted,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.ink,
  },
  emptyCartBody: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.muted,
  },
  cartList: {
    gap: theme.spacing.md,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
    color: theme.colors.panel,
  },
  cartTextWrap: {
    flex: 1,
    gap: 4,
  },
  cartName: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  cartMeta: {
    fontSize: 13,
    color: theme.colors.muted,
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
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.panelMuted,
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
    color: theme.colors.primary,
  },
  qtyCount: {
    fontSize: 15,
    fontWeight: '900',
    color: theme.colors.ink,
    minWidth: 18,
    textAlign: 'center',
  },
  cartLineTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: theme.colors.ink,
  },
  cartRemove: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.danger,
  },
});
