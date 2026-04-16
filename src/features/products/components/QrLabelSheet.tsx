import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {Button, Card, SheetModal, formatMoney} from '../../../components/Primitives';
import {theme} from '../../../theme';
import type {Product} from '../../../types';

type QrLabelSheetProps = {
  product: Product | null;
  onClose: () => void;
};

export function QrLabelSheet({product, onClose}: QrLabelSheetProps) {
  return (
    <SheetModal
      visible={Boolean(product)}
      title="QR label"
      subtitle="Use this layout for shelf labels, carton stickers, or quick checkout scanning."
      onClose={onClose}>
      {product ? (
        <Card>
          <View style={styles.qrWrap}>
            <View style={styles.qrContainer}>
              <QRCode
                value={product.id}
                size={160}
                color={product.color}
                backgroundColor={theme.colors.panel}
                quietZone={12}
              />
            </View>
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productMeta}>{product.code}</Text>
            <Text style={styles.productMeta}>
              {formatMoney(product.price)}
            </Text>
          </View>
          <View style={styles.actionRow}>
            <Button label="Print label" onPress={onClose} compact />
            <Button
              label="Close"
              onPress={onClose}
              variant="secondary"
              compact
            />
          </View>
        </Card>
      ) : null}
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  qrWrap: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  qrContainer: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.panel,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textBlock: {
    alignItems: 'center',
    gap: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  productMeta: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});
