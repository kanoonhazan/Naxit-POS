import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {
  Button,
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
import {useAppTheme} from '../../../theme';
import {TransactionHistoryScreen} from './TransactionHistoryScreen';

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

export function ReportsScreen() {
  const {colors, spacing, radius} = useAppTheme();
  const products = useProductStore(state => state.products);
  const receipts = useSalesStore(state => state.receipts);
  const currency = useSettingsStore(
    state => state.settings?.currency ?? 'LKR',
  );

  const [showHistory, setShowHistory] = useState(false);

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
          <MetricCard label="Best seller" value={topProduct} />
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
                <Text style={[styles.chartLabel, {color: colors.ink}]}>{item.label}</Text>
                <View style={[styles.chartTrack, {backgroundColor: colors.panelMuted, borderRadius: radius.pill}]}>
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
                <Text style={[styles.chartAmount, {color: colors.muted}]}>
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
              <Text style={[styles.emptyHistoryText, {color: colors.muted}]}>No sales yet today.</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {todayReceipts.slice(0, 4).map(receipt => (
                <View key={receipt.id} style={[styles.historyRow, {borderBottomColor: colors.border}]}>
                  <View style={styles.historyLeft}>
                    <Text style={[styles.historyNum, {color: colors.ink}]}>#{receipt.number}</Text>
                    <Text style={[styles.historyTime, {color: colors.muted}]}>{formatTime(receipt.issuedAt)}</Text>
                  </View>
                  <Text style={[styles.historyAmount, {color: colors.ink}]}>
                    {formatMoney(receipt.total, currency)}
                  </Text>
                </View>
              ))}
              {todayReceipts.length > 4 && (
                <Text style={[styles.moreNote, {color: colors.muted}]}>
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
        <View style={[styles.insightCard, {backgroundColor: colors.primarySoft, borderRadius: radius.md}]}>
          <Text style={[styles.insightTitle, {color: colors.primary}]}>
            What the owner should do next
          </Text>
          <Text style={[styles.insightBody, {color: colors.ink}]}>
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

