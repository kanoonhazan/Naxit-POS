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
import {theme} from '../../../theme';
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

  const totalRevenue = filtered.reduce((s, r) => s + r.total, 0);

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
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <View style={styles.backArrow} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <Text style={styles.headerSub}>{filtered.length} record{filtered.length === 1 ? '' : 's'}</Text>
        </View>
        <View style={styles.revenuePill}>
          <Text style={styles.revenueLabel}>{formatMoney(totalRevenue, currency)}</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search receipts, items, payment…"
          placeholderTextColor={theme.colors.muted}
          style={styles.searchInput}
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
            style={[styles.filterPill, filter === f.key ? styles.filterPillActive : null]}>
            <Text style={[styles.filterPillText, filter === f.key ? styles.filterPillTextActive : null]}>
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
              style={[styles.monthPill, selectedMonth === m.value ? styles.filterPillActive : null]}>
              <Text style={[styles.filterPillText, selectedMonth === m.value ? styles.filterPillTextActive : null]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
          {availableMonths.length === 0 && (
            <Text style={styles.emptyNote}>No receipts recorded yet.</Text>
          )}
        </View>
      )}

      {/* Transaction list */}
      <FlatList<Receipt>
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptyBody}>Try adjusting the search or date filter.</Text>
          </View>
        }
        renderItem={({item}) => {
          const expanded = expandedId === item.id;
          return (
            <Pressable
              onPress={() => setExpandedId(expanded ? null : item.id)}
              style={styles.txCard}>
              <View style={styles.txHeader}>
                <View>
                  <Text style={styles.txNumber}>#{item.number}</Text>
                  <Text style={styles.txMeta}>
                    {formatDate(item.issuedAt)}  ·  {formatTime(item.issuedAt)}
                  </Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txTotal}>{formatMoney(item.total, currency)}</Text>
                  <View style={[styles.methodBadge, item.paymentMethod === 'cash' ? styles.methodCash : item.paymentMethod === 'card' ? styles.methodCard : styles.methodSplit]}>
                    <Text style={styles.methodText}>{item.paymentMethod.toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              {expanded && (
                <View style={styles.txDetail}>
                  <View style={styles.txDivider} />
                  {item.items.map((line, idx) => (
                    <View key={idx} style={styles.txLine}>
                      <Text style={styles.txLineName}>{line.name}</Text>
                      <Text style={styles.txLineQty}>×{line.quantity}</Text>
                      <Text style={styles.txLineTotal}>{formatMoney(line.price * line.quantity, currency)}</Text>
                    </View>
                  ))}
                  <View style={styles.txDivider} />
                  {item.tax > 0 && (
                    <View style={styles.txSummaryRow}>
                      <Text style={styles.txSummaryLabel}>Tax</Text>
                      <Text style={styles.txSummaryValue}>{formatMoney(item.tax, currency)}</Text>
                    </View>
                  )}
                  <View style={styles.txSummaryRow}>
                    <Text style={[styles.txSummaryLabel, styles.txSummaryBold]}>Total</Text>
                    <Text style={[styles.txSummaryValue, styles.txSummaryBold]}>{formatMoney(item.total, currency)}</Text>
                  </View>
                  {item.changeDue > 0 && (
                    <View style={styles.txSummaryRow}>
                      <Text style={styles.txSummaryLabel}>Change due</Text>
                      <Text style={styles.txSummaryValue}>{formatMoney(item.changeDue, currency)}</Text>
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
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 56,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.panelMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: theme.colors.ink,
    transform: [{rotate: '45deg'}, {translateX: 2}],
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.ink,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  revenuePill: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  revenueLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  searchWrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.panel,
  },
  searchInput: {
    height: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelMuted,
    paddingHorizontal: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.ink,
  },
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panel,
  },
  filterPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  filterPillTextActive: {
    color: theme.colors.panel,
  },
  monthRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  monthPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelMuted,
  },
  emptyNote: {
    fontSize: 13,
    color: theme.colors.muted,
    paddingVertical: 8,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: 120,
    gap: theme.spacing.sm,
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
    color: theme.colors.ink,
  },
  emptyBody: {
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: 'center',
  },
  txCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  txMeta: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txTotal: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.ink,
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  methodCash: {backgroundColor: theme.colors.successSoft},
  methodCard: {backgroundColor: theme.colors.primarySoft},
  methodSplit: {backgroundColor: theme.colors.warningSoft},
  methodText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  txDetail: {
    gap: 6,
  },
  txDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
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
    color: theme.colors.ink,
  },
  txLineQty: {
    fontSize: 13,
    color: theme.colors.muted,
    width: 32,
    textAlign: 'right',
  },
  txLineTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.ink,
    width: 80,
    textAlign: 'right',
  },
  txSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txSummaryLabel: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  txSummaryValue: {
    fontSize: 13,
    color: theme.colors.ink,
  },
  txSummaryBold: {
    fontWeight: '800',
    color: theme.colors.ink,
  },
});
