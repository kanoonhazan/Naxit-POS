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
import { useAppTheme } from '../../../theme';
import type { PaymentMethod, Product } from '../../../types';

import { CartPanel } from '../components/CartPanel';
import { CheckoutDock } from '../components/CheckoutDock';
import { InlineCameraBlock } from '../components/InlineCameraBlock';
import { ReceiptModal } from '../components/ReceiptModal';

export function SalesScreen() {
  const { colors, spacing, radius, shadow } = useAppTheme();
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

  const isSearching = searchQuery.length > 0 || selectedCategory !== null;



  return (
    <View style={styles.root}>
      <FeedbackToast feedback={feedback} />

      <Screen scrollEnabled={false} bottomPadding={100}>
        <View style={styles.contentWrap}>
          <View style={styles.headerGap}>
            <View style={styles.findGroup}>
              <View style={styles.quickFindRow}>
                <Text style={[styles.quickFindLabel, { color: colors.ink }]}>Quick find</Text>
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
                  paused={isSearching}
                />
              </View>
            </View>
          </View>

          {isSearching && (
            <View style={[styles.resultsOverlay, { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: radius.md, ...shadow }]}>
              <FlatList
                data={filteredProducts}
                keyExtractor={item => item.id}
                numColumns={1}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: product }) => {
                  const isOutOfStock = product.stock <= 0;
                  return (
                    <Pressable
                      onPress={() => !isOutOfStock && handleAddToCart(product.id)}
                      style={({ pressed }) => [
                        styles.compactProductTile,
                        { borderBottomColor: colors.border },
                        pressed && !isOutOfStock ? styles.productTilePressed : null,
                        isOutOfStock ? styles.productTileDisabled : null,
                      ]}>
                      <View
                        style={[
                          styles.productTileBadge,
                          { backgroundColor: isOutOfStock ? colors.muted : product.color },
                        ]}
                      />
                      <View style={styles.compactProductInfo}>
                        <Text style={[styles.productTileName, { color: colors.ink }, isOutOfStock && { color: colors.muted, fontSize: 14 }]}>
                          {product.name}
                        </Text>
                        <Text style={[styles.productTileStock, { color: colors.muted }]}>
                          {product.stock} left
                        </Text>
                      </View>
                      <Text style={[styles.productTilePrice, { color: colors.ink }]}>
                        {formatMoney(product.price)}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>
          )}

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
    rowGap: 8,
  },
  quickFindRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickFindLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionBar: {
    flexDirection: 'column',
    gap: 8,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productTile: {
    flex: 1,
    maxWidth: '48.5%',
    borderWidth: 1,
    padding: 14,
    gap: 8,
    elevation: 2,
  },
  productTilePressed: {
    opacity: 0.75,
  },
  productTileDisabled: {
    opacity: 0.5,
  },
  productTileBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  productTileName: {
    fontSize: 16,
    fontWeight: '800',
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
  },
  productTileStock: {
    fontSize: 12,
  },
  headerGap: {
    gap: 18,
    marginBottom: 18,
  },
  rowGap: {
    justifyContent: 'space-between',
  },
  contentWrap: {
    flex: 1,
    gap: 14,
  },
  resultsOverlay: {
    position: 'absolute',
    top: 100, 
    left: 0,
    right: 0,
    zIndex: 100,
    borderWidth: 1,
    maxHeight: '60%',
    elevation: 10,
    overflow: 'hidden',
  },
  compactProductTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
    borderBottomWidth: 1,
  },
  compactProductInfo: {
    flex: 1,
    gap: 2,
  },
  listContent: {
    paddingBottom: 24,
  },
  cartCard: {
    flex: 1,
    padding: 14,
  },
  cartScroll: {
    flexShrink: 1,
  },
});
