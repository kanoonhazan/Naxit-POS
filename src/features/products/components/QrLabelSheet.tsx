import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {Button, Card, SheetModal, formatMoney} from '../../../components/Primitives';
import {useAppTheme} from '../../../theme';
import type {Product} from '../../../types';

type QrLabelSheetProps = {
  product: Product | null;
  onClose: () => void;
};

export function QrLabelSheet({product, onClose}: QrLabelSheetProps) {
  const {colors, spacing, radius} = useAppTheme();
  return (
    <SheetModal
      visible={Boolean(product)}
      title="QR label"
      subtitle="Use this layout for shelf labels, carton stickers, or quick checkout scanning."
      onClose={onClose}>
      {product ? (
        <Card>
          <View style={styles.qrWrap}>
            <View style={[styles.qrContainer, {backgroundColor: colors.panel, borderColor: colors.border, borderRadius: radius.md}]}>
              <QRCode
                value={product.id}
                size={160}
                color={product.color}
                backgroundColor={colors.panel}
                quietZone={12}
              />
            </View>
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.productName, {color: colors.ink}]}>{product.name}</Text>
            <Text style={[styles.productMeta, {color: colors.muted}]}>{product.code}</Text>
            <Text style={[styles.productMeta, {color: colors.muted}]}>
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
    paddingVertical: 14,
  },
  qrContainer: {
    padding: 14,
    borderWidth: 1,
  },
  textBlock: {
    alignItems: 'center',
    gap: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: '800',
  },
  productMeta: {
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
