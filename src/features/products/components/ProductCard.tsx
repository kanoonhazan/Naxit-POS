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
  const {colors, spacing, radius} = useAppTheme();
  return (
    <Card style={styles.compactCard}>
      <View style={styles.topRow}>
        <View style={[styles.swatch, {backgroundColor: product.color}]}>
          <Text style={[styles.swatchText, {color: colors.panel}]}>{product.name.slice(0, 1)}</Text>
        </View>
        <View style={styles.main}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, {color: colors.ink}]} numberOfLines={1}>{product.name}</Text>
            <Text style={[styles.price, {color: colors.ink}]}>{formatMoney(product.price)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, {color: colors.muted}]}>
              {product.category} • {product.code}
            </Text>
            <View style={styles.badgeWrap}>
              <StockPill stock={product.stock} />
              <Tag label={product.unit} />
            </View>
          </View>
        </View>
      </View>

      {product.description ? (
        <Text style={[styles.description, {color: colors.muted}]} numberOfLines={1}>
          {product.description}
        </Text>
      ) : null}

      <View style={styles.actionRow}>
        <Button
          label="Edit"
          onPress={() => onEdit(product)}
          variant="secondary"
          compact
        />
        <Button
          label="QR"
          onPress={() => onShowQr(product)}
          variant="ghost"
          compact
        />
        <View style={{ flex: 1 }} />
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
  compactCard: {
    padding: 12,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchText: {
    fontSize: 16,
    fontWeight: '900',
  },
  main: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    fontSize: 12,
  },
  badgeWrap: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 2,
  },
});
