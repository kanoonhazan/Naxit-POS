import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  Card,
  Screen,
  SectionTitle,
  formatMoney,
} from '../../../components/Primitives';
import {useSalesStore} from '../../../stores/useSalesStore';
import {useSettingsStore} from '../../../stores/useSettingsStore';
import {useAppTheme} from '../../../theme';
import type {Receipt} from '../../../types';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';
type MonthOption = {label: string; value: string}; // 'YYYY-MM'

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString([], {day: '2-digit', month: 'short', year: 'numeric'});
}
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}
function isoYearMonth(iso: string) {
  return iso.slice(0, 7); // 'YYYY-MM'
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function TransactionHistoryScreen({onBack}: {onBack: () => void}) {
  const {colors, spacing, radius} = useAppTheme();
  const receipts = useSalesStore(state => state.receipts);
  const currency = useSettingsStore(
    state => state.settings?.currency ?? 'LKR',
  );

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<DateFilter>('all');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const availableMonths: MonthOption[] = useMemo(() => {
    const months = Array.from(new Set(receipts.map(r => isoYearMonth(r.issuedAt)))).sort().reverse();
    return months.map(m => {
      const [year, month] = m.split('-');
      const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString([], {month: 'long', year: 'numeric'});
      return {label, value: m};
    });
  }, [receipts]);

  const filtered = useMemo(() => {
    const now = new Date();
    return receipts
      .filter(r => {
        const date = new Date(r.issuedAt);
        if (filter === 'today') { return isSameDay(date, now); }
        if (filter === 'week') {
          const cutoff = new Date(now);
          cutoff.setDate(now.getDate() - 6);
          return date >= cutoff;
        }
        if (filter === 'month') {
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }
        if (filter === 'custom' && selectedMonth) {
          return isoYearMonth(r.issuedAt) === selectedMonth;
        }
        return true;
      })
      .filter(r => {
        if (!search.trim()) { return true; }
        const q = search.toLowerCase();
        return (
          r.number.toLowerCase().includes(q) ||
          r.paymentMethod.toLowerCase().includes(q) ||
          r.items.some(i => i.name.toLowerCase().includes(q))
        );
      })
      .slice()
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }, [receipts, filter, selectedMonth, search]);

  const totalRevenue = useMemo(() => filtered.reduce((s, r) => s + r.total, 0), [filtered]);

  const DATE_FILTERS: Array<{key: DateFilter; label: string}> = [
    {key: 'all', label: 'All time'},
    {key: 'today', label: 'Today'},
    {key: 'week', label: '7 days'},
    {key: 'month', label: 'This month'},
    {key: 'custom', label: 'By month'},
  ];

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: colors.panel, borderBottomColor: colors.border}]}>
        <Pressable onPress={onBack} style={[styles.backButton, {backgroundColor: colors.panelMuted}]}>
          <View style={[styles.backArrow, {borderColor: colors.ink}]} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, {color: colors.ink}]}>Transaction History</Text>
          <Text style={[styles.headerSub, {color: colors.muted}]}>{filtered.length} record{filtered.length === 1 ? '' : 's'}</Text>
        </View>
        <View style={[styles.revenuePill, {backgroundColor: colors.primarySoft, borderRadius: radius.pill}]}>
          <Text style={[styles.revenueLabel, {color: colors.primary}]}>{formatMoney(totalRevenue, currency)}</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchWrap, {backgroundColor: colors.panel}]}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search receipts, items, payment…"
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, {borderColor: colors.border, backgroundColor: colors.panelMuted, color: colors.ink, borderRadius: radius.md}]}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Date filter pills */}
      <View style={styles.filterRow}>
        {DATE_FILTERS.map(f => (
          <Pressable
            key={f.key}
            onPress={() => {
              setFilter(f.key);
              if (f.key !== 'custom') { setSelectedMonth(null); }
            }}
            style={[
              styles.filterPill, 
              { borderColor: colors.border, backgroundColor: colors.panel, borderRadius: radius.pill },
              filter === f.key ? { backgroundColor: colors.primary, borderColor: colors.primary } : null
            ]}>
            <Text style={[
              styles.filterPillText, 
              { color: colors.ink },
              filter === f.key ? { color: colors.panel } : null
            ]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Month selector — only visible when "By month" filter is active */}
      {filter === 'custom' && (
        <View style={styles.monthRow}>
          {availableMonths.map(m => (
            <Pressable
              key={m.value}
              onPress={() => setSelectedMonth(m.value)}
              style={[
                styles.monthPill, 
                { borderColor: colors.border, backgroundColor: colors.panelMuted, borderRadius: radius.pill },
                selectedMonth === m.value ? { backgroundColor: colors.primary, borderColor: colors.primary } : null
              ]}>
              <Text style={[
                styles.filterPillText, 
                { color: colors.ink },
                selectedMonth === m.value ? { color: colors.panel } : null
              ]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
          {availableMonths.length === 0 && (
            <Text style={[styles.emptyNote, { color: colors.muted }]}>No receipts recorded yet.</Text>
          )}
        </View>
      )}

      {/* Transaction list */}
      <FlatList<Receipt>
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.ink }]}>No transactions found</Text>
            <Text style={[styles.emptyBody, { color: colors.muted }]}>Try adjusting the search or date filter.</Text>
          </View>
        }
        renderItem={({item}) => {
          const expanded = expandedId === item.id;
          return (
            <Pressable
              onPress={() => setExpandedId(expanded ? null : item.id)}
              style={[styles.txCard, { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: radius.md }]}>
              <View style={styles.txHeader}>
                <View>
                  <Text style={[styles.txNumber, { color: colors.ink }]}>#{item.number}</Text>
                  <Text style={[styles.txMeta, { color: colors.muted }]}>
                    {formatDate(item.issuedAt)}  ·  {formatTime(item.issuedAt)}
                  </Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={[styles.txTotal, { color: colors.ink }]}>{formatMoney(item.total, currency)}</Text>
                  <View style={[
                    styles.methodBadge, 
                    { borderRadius: radius.pill },
                    item.paymentMethod === 'cash' ? { backgroundColor: colors.successSoft } : item.paymentMethod === 'card' ? { backgroundColor: colors.primarySoft } : { backgroundColor: colors.warningSoft }
                  ]}>
                    <Text style={[styles.methodText, { color: colors.ink }]}>{item.paymentMethod.toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              {expanded && (
                <View style={styles.txDetail}>
                  <View style={[styles.txDivider, { backgroundColor: colors.border }]} />
                  {item.items.map((line, idx) => (
                    <View key={idx} style={styles.txLine}>
                      <Text style={[styles.txLineName, { color: colors.ink }]}>{line.name}</Text>
                      <Text style={[styles.txLineQty, { color: colors.muted }]}>×{line.quantity}</Text>
                      <Text style={[styles.txLineTotal, { color: colors.ink }]}>{formatMoney(line.price * line.quantity, currency)}</Text>
                    </View>
                  ))}
                  <View style={[styles.txDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.txSummaryRow}>
                    <Text style={[styles.txSummaryLabel, { color: colors.muted }]}>Subtotal</Text>
                    <Text style={[styles.txSummaryValue, { color: colors.ink }]}>{formatMoney(item.subtotal, currency)}</Text>
                  </View>
                  {item.discount > 0 && (
                    <View style={styles.txSummaryRow}>
                      <Text style={[styles.txSummaryLabel, { color: colors.muted }]}>
                        Discount ({item.discountType === 'percentage' ? `${item.discount}%` : 'FIXED'})
                      </Text>
                      <Text style={[styles.txSummaryValue, { color: colors.danger }]}>
                        -{formatMoney(item.discountType === 'percentage' ? Math.round((item.subtotal * item.discount) / 100) : item.discount, currency)}
                      </Text>
                    </View>
                  )}
                  {item.tax > 0 && (
                    <View style={styles.txSummaryRow}>
                      <Text style={[styles.txSummaryLabel, { color: colors.muted }]}>Tax</Text>
                      <Text style={[styles.txSummaryValue, { color: colors.ink }]}>{formatMoney(item.tax, currency)}</Text>
                    </View>
                  )}
                  <View style={styles.txSummaryRow}>
                    <Text style={[styles.txSummaryLabel, { color: colors.muted, fontWeight: '800' }]}>Total</Text>
                    <Text style={[styles.txSummaryValue, { color: colors.ink, fontWeight: '800' }]}>{formatMoney(item.total, currency)}</Text>
                  </View>
                  {item.changeDue > 0 && (
                    <View style={styles.txSummaryRow}>
                      <Text style={[styles.txSummaryLabel, { color: colors.muted }]}>Change due</Text>
                      <Text style={[styles.txSummaryValue, { color: colors.ink }]}>{formatMoney(item.changeDue, currency)}</Text>
                    </View>
                  )}
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{rotate: '45deg'}, {translateX: 2}],
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 13,
  },
  revenuePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  revenueLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  searchWrap: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  monthRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  monthPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
  },
  emptyNote: {
    fontSize: 13,
    paddingVertical: 8,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 8,
  },
  emptyState: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyBody: {
    fontSize: 14,
    textAlign: 'center',
  },
  txCard: {
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txNumber: {
    fontSize: 15,
    fontWeight: '800',
  },
  txMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txTotal: {
    fontSize: 16,
    fontWeight: '900',
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  methodText: {
    fontSize: 10,
    fontWeight: '800',
  },
  txDetail: {
    gap: 6,
  },
  txDivider: {
    height: 1,
    marginVertical: 4,
  },
  txLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  txLineName: {
    flex: 1,
    fontSize: 13,
  },
  txLineQty: {
    fontSize: 13,
    width: 32,
    textAlign: 'right',
  },
  txLineTotal: {
    fontSize: 13,
    fontWeight: '700',
    width: 80,
    textAlign: 'right',
  },
  txSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txSummaryLabel: {
    fontSize: 13,
  },
  txSummaryValue: {
    fontSize: 13,
  },
});
