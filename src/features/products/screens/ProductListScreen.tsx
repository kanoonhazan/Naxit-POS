import React, {useMemo, useState} from 'react';
import {StyleSheet, Text} from 'react-native';

import {
  Button,
  Card,
  Screen,
  SectionTitle,
  TextField,
} from '../../../components/Primitives';
import {useProductStore} from '../../../stores/useProductStore';
import {useSalesStore} from '../../../stores/useSalesStore';
import {theme} from '../../../theme';
import type {Product} from '../../../types';

import {ProductCard} from '../components/ProductCard';
import {QrLabelSheet} from '../components/QrLabelSheet';
import {ProductFormSheet} from './ProductFormSheet';

export function ProductListScreen() {
  const products = useProductStore(state => state.products);
  const saveProduct = useProductStore(state => state.saveProduct);
  const deleteProduct = useProductStore(state => state.deleteProduct);
  const pushFeedback = useSalesStore(state => state.pushFeedback);

  const [query, setQuery] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [qrProduct, setQrProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(
    () =>
      products.filter(product =>
        `${product.name} ${product.category} ${product.code}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [products, query],
  );

  const openCreate = () => {
    setEditProduct(null);
    setFormVisible(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setFormVisible(true);
  };

  const handleSave = async (
    values: Omit<Product, 'id' | 'code'> & {id?: string; code?: string},
    showQr: boolean,
  ) => {
    const savedId = await saveProduct(values);

    if (!savedId) {
      pushFeedback('warning', 'Name required', 'Products need a clear label.');
      return;
    }

    pushFeedback(
      'success',
      values.id ? 'Product updated' : 'Product saved',
      `${values.name} is ready to sell.`,
    );

    setFormVisible(false);

    if (showQr) {
      const savedProduct =
        products.find(item => item.id === savedId) ?? {
          id: savedId,
          name: values.name,
          category: values.category || 'General',
          price: Number(values.price || 0),
          stock: Number(values.stock || 0),
          unit: values.unit || 'unit',
          description: values.description || '',
          code: `${values.name.slice(0, 2).toUpperCase()}0000`,
          color: '#173A63',
        };
      setQrProduct(savedProduct as Product);
    }
  };

  const handleDelete = (productId: string) => {
    const product = products.find(item => item.id === productId);
    deleteProduct(productId);

    if (product) {
      pushFeedback('warning', 'Product deleted', `${product.name} was removed.`);
    }
  };

  return (
    <Screen
      title="Products"
      subtitle="Everything a cashier needs to create, edit, and label items without extra setup."
      headerAction={<Button label="Add item" onPress={openCreate} compact />}>
      <Card>
        <SectionTitle
          title="Product manager"
          detail="Search once, edit fast, generate a QR label right away."
        />
        <TextField
          label="Search products"
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name, category, or code"
        />
      </Card>

      {filteredProducts.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptyDetail}>
            Keep names short and obvious so the staff never has to think at the
            counter.
          </Text>
          <Button label="Create first product" onPress={openCreate} />
        </Card>
      ) : (
        filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={openEdit}
            onDelete={handleDelete}
            onShowQr={setQrProduct}
          />
        ))
      )}

      <ProductFormSheet
        visible={formVisible}
        editProduct={editProduct}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
      />

      <QrLabelSheet product={qrProduct} onClose={() => setQrProduct(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  emptyDetail: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.muted,
  },
});
