import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Button,
  Card,
  MetricCard,
  Screen,
  SectionTitle,
  Tag,
  formatMoney,
} from '../../../components/Primitives';
import { useProductStore } from '../../../stores/useProductStore';
import { useSalesStore } from '../../../stores/useSalesStore';
import { useSettingsStore } from '../../../stores/useSettingsStore';
import { useAppTheme } from '../../../theme';
import { TransactionHistoryScreen } from './TransactionHistoryScreen';

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ReportsScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const products = useProductStore(state => state.products);
  const receipts = useSalesStore(state => state.receipts);
  const currency = useSettingsStore(
    state => state.settings?.currency ?? 'LKR',
  );

  const [showHistory, setShowHistory] = useState(false);

  const today = useMemo(() => new Date(), []);

  const yesterday = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() - 1);
    return d;
  }, [today]);

  const { todayReceipts, yesterdayReceipts, totalRevenue, yesterdayRevenue, todayRevenue } = useMemo(() => {
    let tRecs: typeof receipts = [];
    let yRecs: typeof receipts = [];
    let tRev = 0;
    let yRev = 0;
    let totalRev = 0;

    receipts.forEach(r => {
      const rDate = new Date(r.issuedAt);
      const isToday = sameDay(rDate, today);
      const isYesterday = sameDay(rDate, yesterday);

      if (isToday) {
        tRecs.push(r);
        tRev += r.total;
      }
      if (isYesterday) {
        yRecs.push(r);
        yRev += r.total;
      }
      totalRev += r.total;
    });

    return {
      todayReceipts: tRecs,
      yesterdayReceipts: yRecs,
      todayRevenue: tRev,
      yesterdayRevenue: yRev,
      totalRevenue: totalRev,
    };
  }, [receipts, today, yesterday]);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));

      const amount = receipts
        .filter(receipt => sameDay(new Date(receipt.issuedAt), date))
        .reduce((sum, receipt) => sum + receipt.total, 0);

      return {
        label: date.toLocaleDateString([], { weekday: 'short' }),
        amount,
      };
    });
  }, [receipts, today]);

  const { topProduct, topCategory } = useMemo(() => {
    const productSales: Record<string, number> = {};
    const categorySales: Record<string, number> = {};

    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        // Find product to get its category
        const product = products.find(p => p.id === item.productId);
        const qty = item.quantity;

        productSales[item.productId] = (productSales[item.productId] || 0) + qty;

        if (product && product.category) {
          categorySales[product.category] = (categorySales[product.category] || 0) + (item.price * qty);
        }
      });
    });

    const topProdId = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topCatName = Object.entries(categorySales).sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      topProduct: products.find(p => p.id === topProdId)?.name ?? 'N/A',
      topCategory: topCatName ?? 'N/A',
    };
  }, [products, receipts]);

  const growthRate = useMemo(() => {
    if (yesterdayRevenue === 0) return todayRevenue > 0 ? 100 : 0;
    return Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100);
  }, [todayRevenue, yesterdayRevenue]);

  const aov = useMemo(() => {
    return todayReceipts.length > 0 ? Math.round(todayRevenue / todayReceipts.length) : 0;
  }, [todayRevenue, todayReceipts.length]);

  const lowStockCount = useMemo(() => {
    const threshold = useSettingsStore.getState().settings?.lowStockThreshold ?? 5;
    return products.filter(p => p.stock <= threshold).length;
  }, [products]);

  const maxChartAmount = useMemo(() => {
    return Math.max(
      ...chartData.map(item => item.amount),
      1,
    );
  }, [chartData]);

  // Show the full history screen as an overlay
  if (showHistory) {
    return <TransactionHistoryScreen onBack={() => setShowHistory(false)} />;
  }

  return (
    <Screen>
      <Card>
        <SectionTitle
          title="Today"
          detail="Numbers update from local sales history instantly."
          action={<Tag label="Offline only" />}
        />
        <View style={styles.metricRow}>
          <MetricCard
            label="Revenue"
            value={formatMoney(todayRevenue, currency)}
            tone="success"
          />
          <MetricCard
            label="Transactions"
            value={String(todayReceipts.length)}
          />
          <MetricCard
            label="Growth"
            value={`${growthRate >= 0 ? '+' : ''}${growthRate}%`}
            tone={growthRate >= 0 ? 'success' : 'danger'}
          />
        </View>

      </Card>

      {/* 7-day trend + Today's transactions side by side */}
      <View style={styles.twoCol}>
        <Card style={styles.colFlex}>
          <SectionTitle
            title="7 day trend"
            detail="Clear bars, no clutter."
          />
          <View style={styles.chartWrap}>
            {chartData.map(item => (
              <View key={item.label} style={styles.chartRow}>
                <Text style={[styles.chartLabel, { color: colors.ink }]}>{item.label}</Text>
                <View style={[styles.chartTrack, { backgroundColor: colors.panelMuted, borderRadius: radius.pill }]}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        backgroundColor: colors.primary,
                        borderRadius: radius.pill,
                        width: `${Math.max(
                          (item.amount / maxChartAmount) * 100,
                          4,
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.chartAmount, { color: colors.muted }]}>
                  {formatMoney(item.amount, currency)}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.colFlex}>
          <SectionTitle
            title="Today's sales"
            detail={`${todayReceipts.length} transaction${todayReceipts.length === 1 ? '' : 's'} so far.`}
          />
          {todayReceipts.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={[styles.emptyHistoryText, { color: colors.muted }]}>No sales yet today.</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {todayReceipts.slice(0, 4).map(receipt => (
                <View key={receipt.id} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.historyLeft}>
                    <Text style={[styles.historyNum, { color: colors.ink }]}>#{receipt.number}</Text>
                    <Text style={[styles.historyTime, { color: colors.muted }]}>{formatTime(receipt.issuedAt)}</Text>
                  </View>
                  <Text style={[styles.historyAmount, { color: colors.ink }]}>
                    {formatMoney(receipt.total, currency)}
                  </Text>
                </View>
              ))}
              {todayReceipts.length > 4 && (
                <Text style={[styles.moreNote, { color: colors.muted }]}>
                  +{todayReceipts.length - 4} more…
                </Text>
              )}
            </View>
          )}
          <Button
            label="View full history"
            variant="secondary"
            compact
            onPress={() => setShowHistory(true)}
          />
        </Card>
      </View>

      <Card>
        <SectionTitle
          title="Quick read"
          detail="The app explains what matters so owners do not need to interpret graphs."
        />
        <View style={[styles.insightCard, { backgroundColor: colors.primarySoft, borderRadius: radius.md }]}>
          <Text style={[styles.insightTitle, { color: colors.primary }]}>
            {growthRate >= 0 ? 'Positive trend detected' : 'Attention needed'}
          </Text>
          <Text style={[styles.insightBody, { color: colors.ink }]}>
            {todayRevenue > 0
              ? `${growthRate >= 0 ? 'Your sales are up!' : 'Sales are slower than yesterday.'} ${topProduct} is your star performer. ${lowStockCount > 0 ? `Alert: You have ${lowStockCount} items running low; restock these to maintain momentum.` : 'Inventory is healthy.'} Focus on your ${topCategory} category for maximum impact.`
              : 'No sales logged today yet. Check if your store is open and keep fast keys visible for quick orders.'}
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 18,
    flexWrap: 'wrap',
  },
  colFlex: {
    flex: 1,
    minWidth: 240,
  },
  chartWrap: {
    gap: 10,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chartLabel: {
    width: 36,
    fontSize: 12,
    fontWeight: '700',
  },
  chartTrack: {
    flex: 1,
    height: 14,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
  },
  chartAmount: {
    width: 76,
    textAlign: 'right',
    fontSize: 11,
  },
  historyList: {
    gap: 6,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  historyLeft: {
    gap: 1,
  },
  historyNum: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyTime: {
    fontSize: 11,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyHistory: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 13,
  },
  moreNote: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 4,
  },
  insightCard: {
    padding: 18,
    gap: 10,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  insightBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});

