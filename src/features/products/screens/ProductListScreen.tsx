import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, Text} from 'react-native';

import {
  Button,
  Card,
  CategoryFilter,
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [qrProduct, setQrProduct] = useState<Product | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category).filter(Boolean))),
    [products]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter(product => {
        const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
        const matchesQuery = `${product.name} ${product.category} ${product.code}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [products, query, selectedCategory],
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

  const listHeader = (
    <Card style={styles.headerSpacer}>
      <SectionTitle
        title="Product manager"
        detail="Search once, edit fast, generate a QR label right away."
        action={<Button label="Add item" onPress={openCreate} compact />}
      />
      <TextField
        label="Search products"
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name, category, or code"
      />
      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      )}
    </Card>
  );

  const listEmpty = (
    <Card>
      <Text style={styles.emptyTitle}>No products found</Text>
      <Text style={styles.emptyDetail}>
        Keep names short and obvious so the staff never has to think at the
        counter.
      </Text>
      <Button label="Create first product" onPress={openCreate} />
    </Card>
  );

  return (
    <Screen scrollEnabled={false} bottomPadding={0}>
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({item: product}) => (
          <ProductCard
            product={product}
            onEdit={openEdit}
            onDelete={handleDelete}
            onShowQr={setQrProduct}
          />
        )}
      />

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
  headerSpacer: {
    marginBottom: theme.spacing.lg,
  },
  listContent: {
    paddingTop: theme.spacing.md,
    paddingBottom: 110,
    gap: theme.spacing.lg,
  },
});
