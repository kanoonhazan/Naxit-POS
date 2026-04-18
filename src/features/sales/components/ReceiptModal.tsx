import React from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';

import {Button, Tag, formatMoney} from '../../../components/Primitives';
import {useAppTheme} from '../../../theme';
import type {Receipt} from '../../../types';

type ReceiptModalProps = {
  visible: boolean;
  receipt: Receipt | null;
  printerConnected: boolean;
  storeName: string;
  onClose: () => void;
};

export function ReceiptModal({
  visible,
  receipt,
  printerConnected,
  storeName,
  onClose,
}: ReceiptModalProps) {
  const {colors, radius} = useAppTheme();
  
  if (!receipt) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.panel, borderRadius: 30 }]}>
          <Tag label="Receipt ready" tone="success" />
          <Text style={[styles.store, { color: colors.ink }]}>{storeName}</Text>
          <Text style={[styles.number, { color: colors.primary }]}>{receipt.number}</Text>
          <Text style={[styles.time, { color: colors.muted }]}>
            {new Date(receipt.issuedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          
          {(receipt.customerName || receipt.customerPhone) && (
            <View style={[styles.customerSection, { backgroundColor: colors.panelMuted, borderRadius: radius.md }]}>
              {receipt.customerName && (
                <Text style={[styles.customerLabel, { color: colors.ink }]}>
                  Client: <Text style={styles.customerValue}>{receipt.customerName}</Text>
                </Text>
              )}
              {receipt.customerPhone && (
                <Text style={[styles.customerLabel, { color: colors.ink }]}>
                  Phone: <Text style={styles.customerValue}>{receipt.customerPhone}</Text>
                </Text>
              )}
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {receipt.items.map(item => (
            <View
              key={`${receipt.id}-${item.productId}`}
              style={styles.row}>
              <Text style={[styles.item, { color: colors.ink }]}>
                {item.name} x{item.quantity}
              </Text>
              <Text style={[styles.item, { color: colors.ink }]}>
                {formatMoney(item.price * item.quantity)}
              </Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.ink }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.ink }]}>
              {formatMoney(receipt.subtotal)}
            </Text>
          </View>
          {receipt.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.ink }]}>
                Discount ({receipt.discountType === 'percentage' ? `${receipt.discount}%` : 'FIXED'})
              </Text>
              <Text style={[styles.summaryValue, { color: colors.danger }]}>
                -{formatMoney(receipt.discountType === 'percentage' ? Math.round((receipt.subtotal * receipt.discount) / 100) : receipt.discount)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.ink }]}>Paid by</Text>
            <Text style={[styles.summaryValue, { color: colors.ink }]}>
              {receipt.paymentMethod.toUpperCase()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.ink }]}>Total</Text>
            <Text style={[styles.summaryTotal, { color: colors.ink }]}>
              {formatMoney(receipt.total)}
            </Text>
          </View>

          <View style={[styles.banner, { backgroundColor: colors.panelMuted, borderRadius: radius.md }]}>
            <Text style={[styles.bannerText, { color: colors.muted }]}>
              {printerConnected
                ? 'Thermal print queued automatically.'
                : 'No printer connected. Share or print later from device.'}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <Button label="New sale" onPress={onClose} />
            <Button label="Close" onPress={onClose} variant="secondary" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
    backgroundColor: 'rgba(11, 21, 34, 0.42)',
  },
  card: {
    padding: 24,
    gap: 14,
  },
  store: {
    fontSize: 23,
    fontWeight: '900',
  },
  number: {
    fontSize: 17,
    fontWeight: '800',
  },
  time: {
    fontSize: 13,
  },
  divider: {
    height: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  item: {
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  summaryTotal: {
    fontSize: 21,
    fontWeight: '900',
  },
  banner: {
    padding: 14,
  },
  bannerText: {
    fontSize: 13,
    lineHeight: 19,
  },
  actionRow: {
    gap: 10,
  },
  customerSection: {
    padding: 10,
    gap: 4,
  },
  customerLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  customerValue: {
    fontWeight: '400',
  },
});
