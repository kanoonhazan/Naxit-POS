import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {Button, SheetModal, TextField} from '../../../components/Primitives';
import {useAppTheme} from '../../../theme';
import type {Product} from '../../../types';

type ProductDraft = {
  id: string | undefined;
  name: string;
  category: string;
  price: string;
  stock: string;
  unit: string;
  description: string;
};

const emptyDraft: ProductDraft = {
  id: undefined,
  name: '',
  category: '',
  price: '',
  stock: '',
  unit: '',
  description: '',
};

type ProductFormSheetProps = {
  visible: boolean;
  editProduct: Product | null;
  onClose: () => void;
  onSave: (
    values: Omit<Product, 'id' | 'code'> & {id?: string; code?: string},
    showQr: boolean,
  ) => void;
};

export function ProductFormSheet({
  visible,
  editProduct,
  onClose,
  onSave,
}: ProductFormSheetProps) {
  const {colors, spacing} = useAppTheme();
  const [draft, setDraft] = useState<ProductDraft>(
    editProduct
      ? {
          id: editProduct.id,
          name: editProduct.name,
          category: editProduct.category,
          price: String(editProduct.price),
          stock: String(editProduct.stock),
          unit: editProduct.unit,
          description: editProduct.description,
        }
      : emptyDraft,
  );

  // Reset draft when editProduct changes
  React.useEffect(() => {
    if (visible) {
      if (editProduct) {
        setDraft({
          id: editProduct.id,
          name: editProduct.name,
          category: editProduct.category,
          price: String(editProduct.price),
          stock: String(editProduct.stock),
          unit: editProduct.unit,
          description: editProduct.description,
        });
      } else {
        setDraft(emptyDraft);
      }
    }
  }, [visible, editProduct]);

  const handleSave = (showQr: boolean) => {
    onSave(
      {
        id: draft.id,
        name: draft.name,
        category: draft.category || 'General',
        price: Number(draft.price || 0),
        stock: Number(draft.stock || 0),
        unit: draft.unit || 'unit',
        color: draft.id
          ? editProduct?.color || colors.primary
          : '#173A63',
        description: draft.description || 'Quick-sell product stored offline.',
      },
      showQr,
    );
  };

  return (
    <SheetModal
      visible={visible}
      title={draft.id ? 'Edit product' : 'Add product'}
      subtitle="Keep this form short so anyone at the counter can create an item in under a minute."
      onClose={onClose}>
      <TextField
        label="Product name"
        value={draft.name}
        onChangeText={value => setDraft(prev => ({...prev, name: value}))}
        placeholder="Example: Lemon Soda"
      />
      <TextField
        label="Category"
        value={draft.category}
        onChangeText={value => setDraft(prev => ({...prev, category: value}))}
        placeholder="Drinks"
      />
      <View style={styles.dualRow}>
        <View style={styles.flexOne}>
          <TextField
            label="Price"
            value={draft.price}
            onChangeText={value =>
              setDraft(prev => ({...prev, price: value}))
            }
            keyboardType="numeric"
            placeholder="250"
          />
        </View>
        <View style={styles.flexOne}>
          <TextField
            label="Opening stock"
            value={draft.stock}
            onChangeText={value =>
              setDraft(prev => ({...prev, stock: value}))
            }
            keyboardType="numeric"
            placeholder="10"
          />
        </View>
      </View>
      <TextField
        label="Unit"
        value={draft.unit}
        onChangeText={value => setDraft(prev => ({...prev, unit: value}))}
        placeholder="bottle"
      />
      <TextField
        label="Short note"
        value={draft.description}
        onChangeText={value =>
          setDraft(prev => ({...prev, description: value}))
        }
        placeholder="Optional shelf or selling note"
        multiline
      />
      <Button
        label="Save product"
        onPress={() => handleSave(false)}
      />
      <Button
        label="Save and preview QR"
        onPress={() => handleSave(true)}
        variant="secondary"
      />
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  dualRow: {
    flexDirection: 'row',
    gap: 14,
  },
  flexOne: {
    flex: 1,
  },
});
