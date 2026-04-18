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
  const [checkoutStage, setCheckoutStage] = useState<'cart' | 'billing'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [isBrowsing, setIsBrowsing] = useState(false);

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

  const discountNum = parseFloat(discountValue) || 0;
  const discountAmount = discountType === 'percentage' 
    ? Math.round((subtotal * discountNum) / 100) 
    : discountNum;
  
  const discountedTotal = Math.max(0, subtotal - discountAmount);

  const handleAddToCart = React.useCallback((
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
  }, [getProductById, pushFeedback, getItemQuantity, addToCart]);

  const handleScanCode = React.useCallback((code: string) => {
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
  }, [getProductByCode, pushFeedback, handleAddToCart]);

  const handleOpenCatalog = React.useCallback(() => {
    setIsBrowsing(true);
  }, []);

  const handleUpdateQuantity = React.useCallback((productId: string, delta: number) => {
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
  }, [getProductById, getItemQuantity, removeFromCart, pushFeedback, updateQuantity]);

  const handleRemoveItem = React.useCallback((productId: string) => {
    const product = getProductById(productId);
    removeFromCart(productId);

    if (product) {
      pushFeedback(
        'warning',
        'Removed from cart',
        `${product.name} was removed.`,
      );
    }
  }, [getProductById, removeFromCart, pushFeedback]);

  const handleCheckout = React.useCallback(async () => {
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
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      discount: discountNum,
      discountType,
      receiptCount: receipts.length,
    });

    clearCart();
    setCheckoutStage('cart');
    setCustomerName('');
    setCustomerPhone('');
    setDiscountValue('');
    setDiscountType('percentage');
    setPaymentMethod('cash');

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
  }, [
    settings,
    cartItems,
    cartProducts,
    adjustStock,
    checkout,
    receipts.length,
    clearCart,
    subtotal,
    paymentMethod,
    customerName,
    customerPhone,
    pushFeedback,
  ]);

  const printerConnected = settings?.printerConnected ?? false;

  const isSearching = searchQuery.length > 0 || selectedCategory !== null || isBrowsing;


  const dismissSearch = React.useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
    setIsBrowsing(false);
  }, []);

  const paymentMethods: PaymentMethod[] = ['cash', 'card', 'split'];

  return (
    <View style={styles.root}>
      <FeedbackToast feedback={feedback} />

      <Screen scrollEnabled={false} bottomPadding={100}>
        <View style={styles.contentWrap}>
          {isSearching && (
            <Pressable 
              style={[StyleSheet.absoluteFill, { zIndex: 5 }]} 
              onPress={dismissSearch} 
            />
          )}
          {checkoutStage === 'cart' ? (
            <View style={[styles.headerGap, isSearching && { zIndex: 10 }]}>
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
          ) : (
            <View style={[styles.billingHeader, { backgroundColor: colors.primary + '10', borderRadius: radius.lg, borderColor: colors.primary + '30' }]}>
              <View style={styles.billingHeaderInfo}>
                {discountAmount > 0 && (
                  <Text style={[styles.billingHeaderSubtotal, { color: colors.muted }]}>
                    Subtotal: {formatMoney(subtotal)}
                  </Text>
                )}
                <Text style={[styles.billingHeaderLabel, { color: colors.muted }]}>
                  {discountAmount > 0 ? 'Payable Total' : 'Total amount'}
                </Text>
                <Text style={[styles.billingHeaderTotal, { color: colors.primary }]}>{formatMoney(discountedTotal)}</Text>
              </View>
              <View style={[styles.billingHeaderTag, { backgroundColor: colors.primary, borderRadius: radius.pill }]}>
                <Text style={[styles.billingHeaderTagText, { color: colors.panel }]}>{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</Text>
              </View>
            </View>
          )}

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
            {checkoutStage === 'cart' ? (
              <>
                <CheckoutDock
                  subtotal={subtotal}
                  totalItems={totalItems}
                  hasItems={cartProducts.length > 0}
                  onPrepareCheckout={() => {
                    dismissSearch();
                    setCheckoutStage('billing');
                  }}
                />
                <ScrollView
                  style={styles.cartScroll}
                  showsVerticalScrollIndicator={false}>
                  <CartPanel
                    items={cartProducts}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onScanFirst={handleOpenCatalog}
                  />
                </ScrollView>
              </>
            ) : (
              <ScrollView style={styles.billingView} showsVerticalScrollIndicator={false}>
                <SectionTitle title="Billing information" detail="Enter customer details for receipt" />
                <View style={styles.billingForm}>
                  <TextField 
                    label="Customer name" 
                    value={customerName} 
                    onChangeText={setCustomerName} 
                    placeholder="e.g. John Doe"
                  />
                  <TextField 
                    label="Phone number" 
                    value={customerPhone} 
                    onChangeText={setCustomerPhone} 
                    placeholder="e.g. 077 123 4567"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.paymentGroup}>
                  <Text style={[styles.paymentLabel, { color: colors.ink }]}>Discount</Text>
                  <View style={styles.discountRow}>
                    <View style={{ flex: 1.5 }}>
                      <TextField
                        label=""
                        value={discountValue}
                        onChangeText={setDiscountValue}
                        placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={[styles.typeSelector, { backgroundColor: colors.background, borderRadius: radius.md }]}>
                      {(['percentage', 'fixed'] as const).map(type => {
                        const active = discountType === type;
                        return (
                          <Pressable
                            key={type}
                            onPress={() => setDiscountType(type)}
                            style={[
                              styles.typeOption,
                              { borderRadius: radius.sm },
                              active ? [styles.typeOptionActive, { backgroundColor: colors.panel }] : null,
                            ]}>
                            <Text
                              style={[
                                styles.typeOptionText,
                                { color: colors.muted },
                                active ? { color: colors.ink } : null,
                              ]}>
                              {type === 'percentage' ? '%' : 'LKR'}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </View>

                <View style={styles.paymentGroup}>
                  <Text style={[styles.paymentLabel, { color: colors.ink }]}>Payment method</Text>
                  <View style={[styles.paymentSelector, { backgroundColor: colors.background, borderRadius: radius.md }]}>
                    {paymentMethods.map(method => {
                      const active = paymentMethod === method;
                      return (
                        <Pressable
                          key={method}
                          onPress={() => setPaymentMethod(method)}
                          style={[
                            styles.paymentOption,
                            { borderRadius: radius.sm },
                            active ? [styles.paymentOptionActive, { backgroundColor: colors.panel }] : null,
                          ]}>
                          <Text
                            style={[
                              styles.paymentOptionText,
                              { color: colors.muted },
                              active ? { color: colors.ink } : null,
                            ]}>
                            {method.toUpperCase()}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.billingActions}>
                  <View style={{ flex: 1 }}>
                    <Button 
                      label="Back" 
                      variant="ghost" 
                      onPress={() => setCheckoutStage('cart')} 
                    />
                  </View>
                  <View style={{ flex: 2 }}>
                    <Button 
                      label={`Pay ${formatMoney(discountedTotal)}`} 
                      onPress={handleCheckout} 
                    />
                  </View>
                </View>
              </ScrollView>
            )}
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
  billingView: {
    flex: 1,
  },
  billingForm: {
    gap: 14,
    marginTop: 18,
  },
  paymentGroup: {
    marginTop: 24,
    gap: 10,
  },
  paymentLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  paymentSelector: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  paymentOption: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentOptionActive: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  paymentOptionText: {
    fontSize: 13,
    fontWeight: '800',
  },
  billingActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    alignItems: 'center',
    paddingBottom: 20,
  },
  billingHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    marginBottom: 4,
  },
  billingHeaderInfo: {
    gap: 2,
  },
  billingHeaderSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  billingHeaderLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  billingHeaderTotal: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  billingHeaderTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  billingHeaderTagText: {
    fontSize: 14,
    fontWeight: '800',
  },
  discountRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  typeSelector: {
    flex: 1,
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    height: 48,
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeOptionActive: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
