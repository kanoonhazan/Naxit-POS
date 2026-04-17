import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Card,
  CategoryFilter,
  MetricCard,
  Screen,
  SectionTitle,
  StockPill,
  formatMoney,
} from '../../../components/Primitives';
import { useProductStore } from '../../../stores/useProductStore';
import { useSalesStore } from '../../../stores/useSalesStore';
import { theme } from '../../../theme';

export function InventoryScreen() {
  const products = useProductStore(state => state.products);
  const adjustStock = useProductStore(state => state.adjustStock);
  const pushFeedback = useSalesStore(state => state.pushFeedback);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStockFilter, setSelectedStockFilter] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category).filter(Boolean))),
    [products]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter(product => {
        const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
        let matchesStock = true;
        if (selectedStockFilter === 'Danger') {
          matchesStock = product.stock <= 5;
        } else if (selectedStockFilter === 'Low') {
          matchesStock = product.stock > 5 && product.stock <= 12;
        } else if (selectedStockFilter === 'Healthy') {
          matchesStock = product.stock > 12;
        }
        return matchesCategory && matchesStock;
      }),
    [products, selectedCategory, selectedStockFilter]
  );

  const lowStock = filteredProducts.filter(product => product.stock <= 5);
  const healthyStock = filteredProducts.filter(product => product.stock > 12).length;

  const handleAdjust = (productId: string, delta: number) => {
    const product = products.find(item => item.id === productId);
    adjustStock(productId, delta);

    if (product) {
      const verb = delta > 0 ? 'added' : 'removed';
      pushFeedback(
        'success',
        'Stock updated',
        `${Math.abs(delta)} ${verb} for ${product.name}.`,
      );
    }
  };

  const listHeader = (
    <View style={styles.headerGap}>
      <Card>
        <SectionTitle
          title="Stock health"
          detail="Color coding keeps the risky items obvious."
        />
        <View style={styles.metricRow}>
          <MetricCard
            label="Low stock"
            value={String(lowStock.length)}
            tone="warning"
          />
          <MetricCard
            label="Healthy items"
            value={String(healthyStock)}
            tone="success"
          />
          <MetricCard
            label="Tracked SKUs"
            value={String(filteredProducts.length)}
          />
        </View>
        <View style={styles.filterWrap}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Stock Level</Text>
            <CategoryFilter
              categories={['Danger', 'Low', 'Healthy']}
              selectedCategory={selectedStockFilter}
              onSelect={setSelectedStockFilter}
            />
          </View>
        </View>
      </Card>

      {lowStock.length ? (
        <Card>
          <SectionTitle
            title="Needs attention"
            detail="These items are close to selling out."
          />
          {lowStock.map(product => (
            <View key={product.id} style={styles.alertRow}>
              <View style={styles.alertTextWrap}>
                <Text style={styles.alertName}>{product.name}</Text>
                <Text style={styles.alertMeta}>
                  {product.category}  |  {product.stock} left
                </Text>
              </View>
              <StockPill stock={product.stock} />
            </View>
          ))}
        </Card>
      ) : (
        <Card>
          <Text style={styles.goodTitle}>All shelves look healthy</Text>
          <Text style={styles.goodDetail}>
            No urgent replenishment alerts right now. Staff can stay focused on
            selling.
          </Text>
        </Card>
      )}

      <View style={styles.filterWrap}>
        {categories.length > 0 && (
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Product Category</Text>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Screen scrollEnabled={false} bottomPadding={0}>
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        ListHeaderComponent={listHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({item: product}) => (
          <Card>
            <View style={styles.inventoryHeader}>
              <View>
                <Text style={styles.inventoryName}>{product.name}</Text>
                <Text style={styles.inventoryMeta}>
                  {product.category}  |  {formatMoney(product.price)}
                </Text>
              </View>
              <StockPill stock={product.stock} />
            </View>

            <View style={styles.adjustRow}>
              {[-1, 1, 5].map(delta => (
                <Pressable
                  key={`${product.id}-${delta}`}
                  onPress={() => handleAdjust(product.id, delta)}
                  style={({ pressed }) => [
                    styles.adjustButton,
                    delta < 0 ? styles.adjustButtonDanger : null,
                    pressed ? styles.adjustPressed : null,
                  ]}>
                  <Text style={styles.adjustLabel}>
                    {delta > 0 ? `+${delta}` : String(delta)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  alertTextWrap: {
    flex: 1,
    gap: 4,
  },
  alertName: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  alertMeta: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  goodTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  goodDetail: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.muted,
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  inventoryName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  inventoryMeta: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.muted,
  },
  adjustRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  adjustButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.panelMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonDanger: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: theme.colors.danger,
  },
  adjustPressed: {
    opacity: 0.84,
  },
  adjustLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  filterWrap: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  headerGap: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  listContent: {
    paddingBottom: 110,
    gap: theme.spacing.lg,
  },
});
