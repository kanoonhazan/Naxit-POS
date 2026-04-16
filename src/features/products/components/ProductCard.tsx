import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {
  Button,
  Card,
  StockPill,
  Tag,
  formatMoney,
} from '../../../components/Primitives';
import {theme} from '../../../theme';
import type {Product} from '../../../types';

type ProductCardProps = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onShowQr: (product: Product) => void;
};

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onShowQr,
}: ProductCardProps) {
  return (
    <Card>
      <View style={styles.topRow}>
        <View style={[styles.swatch, {backgroundColor: product.color}]}>
          <Text style={styles.swatchText}>{product.name.slice(0, 1)}</Text>
        </View>
        <View style={styles.main}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.meta}>
            {product.category}  |  {product.code}
          </Text>
        </View>
        <Text style={styles.price}>{formatMoney(product.price)}</Text>
      </View>

      <Text style={styles.description}>{product.description}</Text>

      <View style={styles.badgeRow}>
        <StockPill stock={product.stock} />
        <Tag label={product.unit} />
      </View>

      <View style={styles.actionRow}>
        <Button
          label="Edit"
          onPress={() => onEdit(product)}
          variant="secondary"
          compact
        />
        <Button
          label="Show QR"
          onPress={() => onShowQr(product)}
          variant="ghost"
          compact
        />
        <Button
          label="Delete"
          onPress={() => onDelete(product.id)}
          variant="danger"
          compact
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchText: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.panel,
  },
  main: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  meta: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.muted,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});
