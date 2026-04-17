import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {
  Card,
  MetricCard,
  Screen,
  SectionTitle,
  Tag,
  formatMoney,
} from '../../../components/Primitives';
import {useProductStore} from '../../../stores/useProductStore';
import {useSalesStore} from '../../../stores/useSalesStore';
import {useSettingsStore} from '../../../stores/useSettingsStore';
import {theme} from '../../../theme';

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function ReportsScreen() {
  const products = useProductStore(state => state.products);
  const receipts = useSalesStore(state => state.receipts);
  const currency = useSettingsStore(
    state => state.settings?.currency ?? 'LKR',
  );

  const today = new Date();

  const todayReceipts = receipts.filter(receipt =>
    sameDay(new Date(receipt.issuedAt), today),
  );
  const todayRevenue = todayReceipts.reduce(
    (sum, receipt) => sum + receipt.total,
    0,
  );

  const chartData = Array.from({length: 7}, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    const amount = receipts
      .filter(receipt => sameDay(new Date(receipt.issuedAt), date))
      .reduce((sum, receipt) => sum + receipt.total, 0);

    return {
      label: date.toLocaleDateString([], {weekday: 'short'}),
      amount,
    };
  });

  const topProduct = useMemo(() => {
    const totals: Record<string, number> = {};

    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        totals[item.productId] =
          (totals[item.productId] || 0) + item.quantity;
      });
    });

    const winner = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    return (
      products.find(product => product.id === winner?.[0])?.name ?? 'Milk Tea'
    );
  }, [products, receipts]);

  const maxChartAmount = Math.max(
    ...chartData.map(item => item.amount),
    1,
  );

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
          <MetricCard label="Best seller" value={topProduct} />
        </View>
      </Card>

      <Card>
        <SectionTitle
          title="7 day trend"
          detail="Big bars, clear labels, no chart clutter."
        />
        <View style={styles.chartWrap}>
          {chartData.map(item => (
            <View key={item.label} style={styles.chartRow}>
              <Text style={styles.chartLabel}>{item.label}</Text>
              <View style={styles.chartTrack}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      width: `${Math.max(
                        (item.amount / maxChartAmount) * 100,
                        4,
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.chartAmount}>
                {formatMoney(item.amount, currency)}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle
          title="Quick read"
          detail="The app explains what matters so owners do not need to interpret graphs."
        />
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>
            What the owner should do next
          </Text>
          <Text style={styles.insightBody}>
            {todayRevenue > 0
              ? `Sales are active today. Restock ${topProduct} first and keep the scanner view open at the counter.`
              : 'No sales logged today yet. Open the Sales tab and keep fast keys visible for walk-in orders.'}
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  chartWrap: {
    gap: theme.spacing.md,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  chartLabel: {
    width: 42,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  chartTrack: {
    flex: 1,
    height: 18,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.panelMuted,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  chartAmount: {
    width: 84,
    textAlign: 'right',
    fontSize: 12,
    color: theme.colors.muted,
  },
  insightCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    gap: theme.spacing.sm,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  insightBody: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.ink,
  },
});
