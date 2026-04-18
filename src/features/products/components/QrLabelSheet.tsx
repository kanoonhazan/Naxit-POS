import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {Button, Card, SheetModal, TextField} from '../../../components/Primitives';
import {useAppTheme} from '../../../theme';
import type {Product} from '../../../types';
import {formatQrLabel, printReceipt} from '../../../services/receiptPrinter';
import {useSalesStore} from '../../../stores/useSalesStore';

type QrLabelSheetProps = {
  product: Product | null;
  onClose: () => void;
};

export function QrLabelSheet({product, onClose}: QrLabelSheetProps) {
  const {colors, spacing, radius} = useAppTheme();
  const pushFeedback = useSalesStore(state => state.pushFeedback);
  const [batchCount, setBatchCount] = React.useState('1');
  const [printing, setPrinting] = React.useState(false);

  const handlePrint = async () => {
    if (!product) { return; }
    
    const count = parseInt(batchCount, 10);
    if (isNaN(count) || count <= 0) {
      pushFeedback('warning', 'Invalid count', 'Please enter a number greater than 0.');
      return;
    }

    setPrinting(true);
    const escPos = formatQrLabel(product, count);
    const success = await printReceipt(escPos);
    setPrinting(false);

    if (success) {
      pushFeedback('success', 'Labels queued', `${count} QR labels sent to printer.`);
      onClose();
    } else {
      pushFeedback('danger', 'Printing failed', 'Could not send data to the printer.');
    }
  };

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
          </View>

          <View style={styles.batchWrap}>
             <TextField
               label="Batch count"
               placeholder="1"
               value={batchCount}
               onChangeText={setBatchCount}
               keyboardType="numeric"
             />
          </View>

          <View style={styles.actionRow}>
            <Button 
              label={printing ? 'Printing...' : 'Print label'} 
              onPress={handlePrint} 
              disabled={printing}
              compact 
            />
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
    marginTop: 10,
  },
  batchWrap: {
    paddingVertical: 14,
  },
});
