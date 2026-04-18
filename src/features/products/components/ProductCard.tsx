import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {
  Button,
  Card,
  StockPill,
  Tag,
  formatMoney,
} from '../../../components/Primitives';
import {useAppTheme} from '../../../theme';
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
  const {colors, spacing} = useAppTheme();
  return (
    <Card>
      <View style={styles.topRow}>
        <View style={[styles.swatch, {backgroundColor: product.color}]}>
          <Text style={[styles.swatchText, {color: colors.panel}]}>{product.name.slice(0, 1)}</Text>
        </View>
        <View style={styles.main}>
          <Text style={[styles.name, {color: colors.ink}]}>{product.name}</Text>
          <Text style={[styles.meta, {color: colors.muted}]}>
            {product.category}  |  {product.code}
          </Text>
        </View>
        <Text style={[styles.price, {color: colors.ink}]}>{formatMoney(product.price)}</Text>
      </View>

      <Text style={[styles.description, {color: colors.muted}]}>{product.description}</Text>

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
    gap: 14,
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
  },
  main: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
  },
  meta: {
    fontSize: 13,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
