import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  Button,
  Card,
  CategoryFilter,
  FeedbackToast,
  Screen,
  SectionTitle,
  Tag,
  TextField,
  formatMoney,
} from '../../../components/Primitives';
import { useCartStore } from '../../../stores/useCartStore';
import { useProductStore } from '../../../stores/useProductStore';
import { useSalesStore } from '../../../stores/useSalesStore';
import { useSettingsStore } from '../../../stores/useSettingsStore';
import {
  formatReceiptText,
  printReceipt,
} from '../../../services/receiptPrinter';
import { theme } from '../../../theme';
import type { PaymentMethod, Product } from '../../../types';

import { CartPanel } from '../components/CartPanel';
import { CheckoutDock } from '../components/CheckoutDock';
import { InlineCameraBlock } from '../components/InlineCameraBlock';
import { ReceiptModal } from '../components/ReceiptModal';

export function SalesScreen() {
  const products = useProductStore(state => state.products);
  const getProductById = useProductStore(state => state.getProductById);
  const getProductByCode = useProductStore(state => state.getProductByCode);
  const adjustStock = useProductStore(state => state.adjustStock);

  const cartItems = useCartStore(state => state.items);
  const addToCart = useCartStore(state => state.addToCart);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const clearCart = useCartStore(state => state.clearCart);
  const getItemQuantity = useCartStore(state => state.getItemQuantity);

  const receipts = useSalesStore(state => state.receipts);
  const feedback = useSalesStore(state => state.feedback);
  const lastReceipt = useSalesStore(state => state.lastReceipt);
  const pushFeedback = useSalesStore(state => state.pushFeedback);
  const checkout = useSalesStore(state => state.checkout);
  const clearLastReceipt = useSalesStore(state => state.clearLastReceipt);

  const settings = useSettingsStore(state => state.settings);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
          .includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [products, selectedCategory, searchQuery]
  );

  const cartProducts = useMemo(
    () =>
      cartItems
        .map(item => {
          const product = getProductById(item.productId);
          if (!product) {
            return null;
          }
          return {
            ...product,
            quantity: item.quantity,
            lineTotal: item.quantity * product.price,
          };
        })
        .filter(Boolean) as (Product & { quantity: number; lineTotal: number })[],
    [cartItems, getProductById],
  );

  const subtotal = cartProducts.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalItems = cartProducts.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const lastItem = cartProducts[cartProducts.length - 1];

  const handleAddToCart = (
    productId: string,
    source: 'scan' | 'tap' = 'tap',
  ) => {
    const product = getProductById(productId);

    if (!product) {
      pushFeedback(
        'danger',
        'Product missing',
        'This item is no longer in local stock.',
      );
      return;
    }

    const currentQty = getItemQuantity(productId);

    if (product.stock <= currentQty) {
      pushFeedback(
        'warning',
        'Stock limit reached',
        `${product.name} only has ${product.stock} left offline.`,
      );
      return;
    }

    addToCart(productId);
    pushFeedback(
      'success',
      source === 'scan' ? 'Scan accepted' : 'Added to cart',
      `${product.name} is ready to checkout.`,
    );
  };

  const handleScanCode = (code: string) => {
    const product = getProductByCode(code);

    if (!product) {
      pushFeedback(
        'warning',
        'QR not recognized',
        'No local product matches this code. Check the saved QR label first.',
      );
      return;
    }

    handleAddToCart(product.id, 'scan');
  };

  const handleDemoScan = () => {
    if (products.length === 0) {
      pushFeedback(
        'warning',
        'No products yet',
        'Add a product before scanning.',
      );
      return;
    }

    const nextProduct = products[Math.floor(Math.random() * products.length)];
    handleAddToCart(nextProduct.id, 'scan');
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const product = getProductById(productId);
    if (!product) {
      return;
    }

    const currentQty = getItemQuantity(productId);
    const nextQty = currentQty + delta;

    if (nextQty <= 0) {
      removeFromCart(productId);
      pushFeedback(
        'warning',
        'Item removed',
        `${product.name} was removed from cart.`,
      );
      return;
    }

    if (nextQty > product.stock) {
      pushFeedback(
        'warning',
        'Not enough stock',
        `${product.name} only has ${product.stock} available.`,
      );
      return;
    }

    updateQuantity(productId, delta);
  };

  const handleRemoveItem = (productId: string) => {
    const product = getProductById(productId);
    removeFromCart(productId);

    if (product) {
      pushFeedback(
        'warning',
        'Removed from cart',
        `${product.name} was removed.`,
      );
    }
  };

  const handleCheckout = async (paymentMethod: PaymentMethod) => {
    if (!settings) {
      return;
    }

    if (cartItems.length === 0) {
      pushFeedback(
        'warning',
        'Cart is empty',
        'Scan an item first to start selling.',
      );
      return;
    }

    const receiptItems = cartProducts.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    // Reduce stock for each sold item
    cartItems.forEach(item => {
      adjustStock(item.productId, -item.quantity);
    });

    const receipt = await checkout({
      items: receiptItems,
      subtotal,
      paymentMethod,
      receiptCount: receipts.length,
    });

    clearCart();

    // Auto-print if enabled
    if (settings.autoPrint && settings.printerConnected) {
      const escPos = formatReceiptText(receipt, settings);
      printReceipt(escPos).catch(() => { });
    }

    pushFeedback(
      'success',
      'Checkout complete',
      settings.autoPrint
        ? 'Receipt sent to printer.'
        : 'Receipt ready to view.',
    );
  };

  const printerConnected = settings?.printerConnected ?? false;

  const listHeader = (
    <View style={styles.headerGap}>
      <View style={styles.findGroup}>
        <View style={styles.quickFindRow}>
          <Text style={styles.quickFindLabel}>Quick find</Text>
          <Tag
            label={printerConnected ? 'Printer ready' : 'Printer offline'}
            tone={printerConnected ? 'success' : 'warning'}
          />
        </View>
        <View style={styles.actionBar}>
          <TextField
            label=""
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or code"
          />
          <InlineCameraBlock
            sleepSeconds={settings?.cameraSleepSeconds ?? 8}
            onScanCode={handleScanCode}
          />
        </View>
      </View>

      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      )}
    </View>
  );



  return (
    <View style={styles.root}>
      <FeedbackToast feedback={feedback} />

      <Screen scrollEnabled={false} bottomPadding={100}>
        <View style={styles.contentWrap}>
          <View style={styles.productsArea}>
            <FlatList
              data={filteredProducts}
              keyExtractor={item => item.id}
              ListHeaderComponent={listHeader}
              numColumns={2}
              columnWrapperStyle={styles.rowGap}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: product }) => {
                const isOutOfStock = product.stock <= 0;
                return (
                  <Pressable
                    onPress={() => !isOutOfStock && handleAddToCart(product.id)}
                    style={({ pressed }) => [
                      styles.productTile,
                      { borderColor: isOutOfStock ? theme.colors.border : product.color },
                      pressed && !isOutOfStock ? styles.productTilePressed : null,
                      isOutOfStock ? styles.productTileDisabled : null,
                    ]}>
                    <View
                      style={[
                        styles.productTileBadge,
                        { backgroundColor: isOutOfStock ? theme.colors.muted : product.color },
                      ]}
                    />
                    <Text style={[styles.productTileName, isOutOfStock && { color: theme.colors.muted }]}>
                      {product.name}
                    </Text>
                    <View style={styles.productTileFooter}>
                      <Text style={styles.productTilePrice}>
                        {formatMoney(product.price)}
                      </Text>
                      <Text style={styles.productTileStock}>
                        {product.stock} left
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>

          <Card style={styles.cartCard}>
            <CheckoutDock
              subtotal={subtotal}
              totalItems={totalItems}
              hasItems={cartProducts.length > 0}
              onCheckout={handleCheckout}
            />
            <ScrollView
              style={styles.cartScroll}
              showsVerticalScrollIndicator={false}>
              <CartPanel
                items={cartProducts}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onScanFirst={handleDemoScan}
              />
            </ScrollView>
          </Card>
        </View>
      </Screen>

      <ReceiptModal
        visible={Boolean(lastReceipt)}
        receipt={lastReceipt}
        printerConnected={printerConnected}
        storeName={settings?.storeName ?? 'POS'}
        onClose={clearLastReceipt}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  findGroup: {
    rowGap: theme.spacing.sm,
  },
  quickFindRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickFindLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  actionBar: {
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  productTile: {
    flex: 1,
    maxWidth: '48.5%',
    backgroundColor: theme.colors.panel,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 8,
    shadowColor: '#0B1522',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  productTilePressed: {
    opacity: 0.75,
  },
  productTileDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.panelMuted,
  },
  productTileBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  productTileName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  productTileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productTilePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  productTileStock: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  headerGap: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  rowGap: {
    justifyContent: 'space-between',
  },
  contentWrap: {
    flex: 1,
    gap: theme.spacing.md,
  },
  productsArea: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  cartCard: {
    flexShrink: 1,
    maxHeight: '45%',
    padding: theme.spacing.md,
  },
  cartScroll: {
    flexShrink: 1,
  },
});
