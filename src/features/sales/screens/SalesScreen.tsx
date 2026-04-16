import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {
  Button,
  Card,
  FeedbackToast,
  Screen,
  SectionTitle,
  Tag,
  formatMoney,
} from '../../../components/Primitives';
import {useCartStore} from '../../../stores/useCartStore';
import {useProductStore} from '../../../stores/useProductStore';
import {useSalesStore} from '../../../stores/useSalesStore';
import {useSettingsStore} from '../../../stores/useSettingsStore';
import {
  formatReceiptText,
  printReceipt,
} from '../../../services/receiptPrinter';
import {theme} from '../../../theme';
import type {PaymentMethod, Product} from '../../../types';

import {CartPanel} from '../components/CartPanel';
import {CheckoutDock} from '../components/CheckoutDock';
import {ReceiptModal} from '../components/ReceiptModal';
import {ScannerModal} from '../components/ScannerModal';

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

  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanIndex, setScanIndex] = useState(0);

  const featuredProducts = products.slice(0, 6);

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
        .filter(Boolean) as (Product & {quantity: number; lineTotal: number})[],
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
    if (featuredProducts.length === 0) {
      pushFeedback(
        'warning',
        'No products yet',
        'Add a product before scanning.',
      );
      return;
    }

    const nextProduct = featuredProducts[scanIndex % featuredProducts.length];
    setScanIndex(prev => prev + 1);
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
      printReceipt(escPos).catch(() => {});
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

  return (
    <View style={styles.root}>
      <FeedbackToast feedback={feedback} />

      <Screen
        title="Sales"
        subtitle="Built for one hand, fast scanning, and no wasted taps."
        bottomPadding={254}
        headerAction={
          <Tag
            label={printerConnected ? 'Printer ready' : 'Printer offline'}
            tone={printerConnected ? 'success' : 'warning'}
          />
        }>
        <Card style={styles.speedLaneCard}>
          <View style={styles.speedLaneHeader}>
            <View style={styles.speedLaneTextWrap}>
              <Text style={styles.speedLaneEyebrow}>Fastest flow</Text>
              <Text style={styles.speedLaneTitle}>
                Scan to paid receipt in one lane
              </Text>
              <Text style={styles.speedLaneBody}>
                QR scan adds instantly. Cart stays visible. Checkout stays fixed
                at the bottom.
              </Text>
            </View>
            <Tag label="< 5 sec target" tone="success" />
          </View>

          <View style={styles.stepStrip}>
            {['Scan', 'Cart', 'Pay', 'Receipt'].map((step, index) => (
              <View key={step} style={styles.stepItem}>
                <View style={styles.stepDot}>
                  <Text style={styles.stepDotText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepLabel}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.scanStage}>
            <View style={styles.scanFrame}>
              <View style={styles.scanPulse} />
              <View style={styles.scanTarget}>
                <View style={styles.scanCornerTopLeft} />
                <View style={styles.scanCornerTopRight} />
                <View style={styles.scanCornerBottomLeft} />
                <View style={styles.scanCornerBottomRight} />
                <Text style={styles.scanTargetText}>Ready for QR</Text>
                <Text style={styles.scanTargetHint}>
                  Center the code and tap once.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setScannerVisible(true)}
              style={({pressed}) => [
                styles.scanButton,
                pressed ? styles.scanButtonPressed : null,
              ]}>
              <View style={styles.scanButtonGlyph}>
                <View style={styles.scanButtonGlyphFrame} />
                <View style={styles.scanButtonGlyphDot} />
              </View>
              <View style={styles.scanButtonTextWrap}>
                <Text style={styles.scanButtonTitle}>Scan with camera</Text>
                <Text style={styles.scanButtonSubtitle}>
                  Instant product add on device
                </Text>
              </View>
            </Pressable>

            <View style={styles.fallbackRow}>
              <Button
                label="Demo scan"
                onPress={handleDemoScan}
                variant="secondary"
                compact
              />
              <Text style={styles.fallbackHint}>
                Use this in simulator when no real QR is available.
              </Text>
            </View>

            <View style={styles.microFeedbackRow}>
              <View style={styles.microFeedbackCard}>
                <Text style={styles.microFeedbackLabel}>Last action</Text>
                <Text style={styles.microFeedbackValue}>
                  {lastItem
                    ? `${lastItem.name} added`
                    : 'Waiting for first scan'}
                </Text>
              </View>
              <View style={styles.microFeedbackCard}>
                <Text style={styles.microFeedbackLabel}>Cart count</Text>
                <Text style={styles.microFeedbackValue}>
                  {totalItems} items
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card>
          <SectionTitle
            title="Quick add"
            detail="Use this if the cashier already knows the item and wants to skip camera time."
          />
          <View style={styles.quickGrid}>
            {featuredProducts.slice(0, 4).map(product => (
              <Pressable
                key={product.id}
                onPress={() => handleAddToCart(product.id)}
                style={({pressed}) => [
                  styles.quickTile,
                  {borderColor: product.color},
                  pressed ? styles.quickTilePressed : null,
                ]}>
                <View
                  style={[
                    styles.quickTileBadge,
                    {backgroundColor: product.color},
                  ]}
                />
                <Text style={styles.quickTileName}>{product.name}</Text>
                <Text style={styles.quickTilePrice}>
                  {formatMoney(product.price)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <SectionTitle
            title="Live cart"
            detail={
              cartProducts.length
                ? 'Every item stays editable without leaving the page.'
                : 'Empty by design. Scan once and checkout stays ready below.'
            }
          />
          <CartPanel
            items={cartProducts}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onScanFirst={handleDemoScan}
          />
        </Card>
      </Screen>

      <CheckoutDock
        subtotal={subtotal}
        totalItems={totalItems}
        hasItems={cartProducts.length > 0}
        printerConnected={printerConnected}
        onCheckout={handleCheckout}
      />

      <ReceiptModal
        visible={Boolean(lastReceipt)}
        receipt={lastReceipt}
        printerConnected={printerConnected}
        storeName={settings?.storeName ?? 'POS'}
        onClose={clearLastReceipt}
      />

      <ScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanCode={handleScanCode}
        onDemoScan={handleDemoScan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  speedLaneCard: {
    backgroundColor: theme.colors.black,
    borderColor: theme.colors.black,
    gap: theme.spacing.lg,
  },
  speedLaneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  speedLaneTextWrap: {
    flex: 1,
    gap: 6,
  },
  speedLaneEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9CC0FF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  speedLaneTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: theme.colors.panel,
    letterSpacing: -0.8,
  },
  speedLaneBody: {
    fontSize: 14,
    lineHeight: 20,
    color: '#B9C7D8',
  },
  stepStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: '#16273A',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#386FC7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.panel,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DAE6F4',
  },
  scanStage: {
    gap: theme.spacing.md,
  },
  scanFrame: {
    minHeight: 190,
    borderRadius: 28,
    backgroundColor: '#112033',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scanPulse: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(57, 111, 199, 0.18)',
  },
  scanTarget: {
    width: '76%',
    aspectRatio: 1.1,
    maxHeight: 150,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#3D6BA8',
    backgroundColor: '#152B42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanCornerTopLeft: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#8EC1FF',
  },
  scanCornerTopRight: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#8EC1FF',
  },
  scanCornerBottomLeft: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#8EC1FF',
  },
  scanCornerBottomRight: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#8EC1FF',
  },
  scanTargetText: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.panel,
  },
  scanTargetHint: {
    marginTop: 6,
    fontSize: 13,
    color: '#ADC3DB',
  },
  scanButton: {
    minHeight: 72,
    borderRadius: 24,
    backgroundColor: '#386FC7',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  scanButtonPressed: {
    opacity: 0.88,
  },
  scanButtonGlyph: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonGlyphFrame: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.panel,
  },
  scanButtonGlyphDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.panel,
  },
  scanButtonTextWrap: {
    flex: 1,
    gap: 2,
  },
  scanButtonTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.panel,
  },
  scanButtonSubtitle: {
    fontSize: 13,
    color: '#D8E8FF',
  },
  fallbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  fallbackHint: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#AFC5DB',
  },
  microFeedbackRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  microFeedbackCard: {
    flex: 1,
    backgroundColor: '#172C43',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 6,
  },
  microFeedbackLabel: {
    fontSize: 12,
    color: '#9FB6CE',
  },
  microFeedbackValue: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.panel,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  quickTile: {
    width: '48%',
    backgroundColor: theme.colors.panelMuted,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 8,
  },
  quickTilePressed: {
    opacity: 0.82,
  },
  quickTileBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  quickTileName: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  quickTilePrice: {
    fontSize: 13,
    color: theme.colors.muted,
  },
});
