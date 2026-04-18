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
import { useAppTheme } from '../../../theme';

export function InventoryScreen() {
  const { colors, spacing, radius } = useAppTheme();
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
            <Text style={[styles.filterLabel, { color: colors.ink }]}>Stock Level</Text>
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
                <Text style={[styles.alertName, { color: colors.ink }]}>{product.name}</Text>
                <Text style={[styles.alertMeta, { color: colors.muted }]}>
                  {product.category}  |  {product.stock} left
                </Text>
              </View>
              <StockPill stock={product.stock} />
            </View>
          ))}
        </Card>
      ) : (
        <Card>
          <Text style={[styles.goodTitle, { color: colors.ink }]}>All shelves look healthy</Text>
          <Text style={[styles.goodDetail, { color: colors.muted }]}>
            No urgent replenishment alerts right now. Staff can stay focused on
            selling.
          </Text>
        </Card>
      )}

      <View style={styles.filterWrap}>
        {categories.length > 0 && (
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: colors.ink }]}>Product Category</Text>
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
                <Text style={[styles.inventoryName, { color: colors.ink }]}>{product.name}</Text>
                <Text style={[styles.inventoryMeta, { color: colors.muted }]}>
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
                    { 
                      backgroundColor: colors.panelMuted, 
                      borderColor: colors.border,
                      borderRadius: radius.md 
                    },
                    delta < 0 ? { backgroundColor: colors.dangerSoft, borderColor: colors.danger } : null,
                    pressed ? styles.adjustPressed : null,
                  ]}>
                  <Text style={[styles.adjustLabel, { color: colors.ink }]}>
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
    gap: 8,
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
  },
  alertTextWrap: {
    flex: 1,
    gap: 4,
  },
  alertName: {
    fontSize: 15,
    fontWeight: '800',
  },
  alertMeta: {
    fontSize: 13,
  },
  goodTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  goodDetail: {
    fontSize: 14,
    lineHeight: 20,
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  inventoryName: {
    fontSize: 16,
    fontWeight: '800',
  },
  inventoryMeta: {
    marginTop: 4,
    fontSize: 13,
  },
  adjustRow: {
    flexDirection: 'row',
    gap: 10,
  },
  adjustButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustPressed: {
    opacity: 0.84,
  },
  adjustLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  filterWrap: {
    gap: 14,
    marginTop: 8,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  headerGap: {
    gap: 18,
    marginBottom: 18,
  },
  listContent: {
    paddingBottom: 110,
    gap: 18,
  },
});
