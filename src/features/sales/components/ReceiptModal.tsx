import React from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';

import {Button, Tag, formatMoney} from '../../../components/Primitives';
import {theme} from '../../../theme';
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
        <View style={styles.card}>
          <Tag label="Receipt ready" tone="success" />
          <Text style={styles.store}>{storeName}</Text>
          <Text style={styles.number}>{receipt.number}</Text>
          <Text style={styles.time}>
            {new Date(receipt.issuedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>

          <View style={styles.divider} />

          {receipt.items.map(item => (
            <View
              key={`${receipt.id}-${item.productId}`}
              style={styles.row}>
              <Text style={styles.item}>
                {item.name} x{item.quantity}
              </Text>
              <Text style={styles.item}>
                {formatMoney(item.price * item.quantity)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Paid by</Text>
            <Text style={styles.summaryValue}>
              {receipt.paymentMethod.toUpperCase()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryTotal}>
              {formatMoney(receipt.total)}
            </Text>
          </View>

          <View style={styles.banner}>
            <Text style={styles.bannerText}>
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
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(11, 21, 34, 0.42)',
  },
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: 30,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  store: {
    fontSize: 23,
    fontWeight: '900',
    color: theme.colors.ink,
  },
  number: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  time: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  item: {
    fontSize: 14,
    color: theme.colors.ink,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  summaryTotal: {
    fontSize: 21,
    fontWeight: '900',
    color: theme.colors.ink,
  },
  banner: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.panelMuted,
  },
  bannerText: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.muted,
  },
  actionRow: {
    gap: theme.spacing.sm,
  },
});
