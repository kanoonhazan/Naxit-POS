import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {theme} from '../theme';
import type {SalesFeedback} from '../types';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  compact?: boolean;
  disabled?: boolean;
};

type ScreenProps = {
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  bottomPadding?: number;
};

type InputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  multiline?: boolean;
};

type ToggleProps = {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

type SheetProps = {
  visible: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function formatMoney(amount: number, currency = 'LKR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function Screen({
  children,
  headerAction,
  bottomPadding = 110,
}: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, {paddingBottom: bottomPadding}]}
        showsVerticalScrollIndicator={false}>
        {headerAction ? (
          <View style={[styles.headerRow, { justifyContent: 'flex-end' }]}>
            {headerAction}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionTextWrap}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  compact,
  disabled,
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.buttonBase,
        compact ? styles.buttonCompact : null,
        variant === 'primary' ? styles.buttonPrimary : null,
        variant === 'secondary' ? styles.buttonSecondary : null,
        variant === 'ghost' ? styles.buttonGhost : null,
        variant === 'danger' ? styles.buttonDanger : null,
        pressed && !disabled ? styles.buttonPressed : null,
        disabled ? styles.buttonDisabled : null,
      ]}>
      <Text
        style={[
          styles.buttonLabel,
          variant === 'primary' ? styles.buttonPrimaryLabel : null,
          variant === 'ghost' ? styles.buttonGhostLabel : null,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function MetricCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning';
}) {
  return (
    <View
      style={[
        styles.metricCard,
        tone === 'success' ? styles.metricCardSuccess : null,
        tone === 'warning' ? styles.metricCardWarning : null,
      ]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

export function StockPill({stock}: {stock: number}) {
  const tone =
    stock <= 5 ? 'danger' : stock <= 12 ? 'warning' : 'success';

  return (
    <View
      style={[
        styles.pill,
        tone === 'success' ? styles.pillSuccess : null,
        tone === 'warning' ? styles.pillWarning : null,
        tone === 'danger' ? styles.pillDanger : null,
      ]}>
      <Text
        style={[
          styles.pillText,
          tone === 'success' ? styles.pillSuccessText : null,
          tone === 'warning' ? styles.pillWarningText : null,
          tone === 'danger' ? styles.pillDangerText : null,
        ]}>
        {stock <= 0 ? 'Out of stock' : `${stock} in stock`}
      </Text>
    </View>
  );
}

export function Tag({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
  return (
    <View
      style={[
        styles.tag,
        tone === 'success' ? styles.pillSuccess : null,
        tone === 'warning' ? styles.pillWarning : null,
        tone === 'danger' ? styles.pillDanger : null,
      ]}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
}: {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryScrollContent}
      style={styles.categoryScroll}>
      <Pressable
        onPress={() => onSelect(null)}
        style={[
          styles.categoryPill,
          selectedCategory === null ? styles.categoryPillActive : null,
        ]}>
        <Text
          style={[
            styles.categoryPillText,
            selectedCategory === null ? styles.categoryPillTextActive : null,
          ]}>
          All
        </Text>
      </Pressable>
      {categories.map(cat => (
        <Pressable
          key={cat}
          onPress={() => onSelect(cat)}
          style={[
            styles.categoryPill,
            selectedCategory === cat ? styles.categoryPillActive : null,
          ]}>
          <Text
            style={[
              styles.categoryPillText,
              selectedCategory === cat ? styles.categoryPillTextActive : null,
            ]}>
            {cat}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline,
}: InputProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, multiline ? styles.inputMultiline : null]}
      />
    </View>
  );
}

export function ToggleRow({
  label,
  hint,
  value,
  onValueChange,
}: ToggleProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextWrap}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={theme.colors.panel}
        trackColor={{
          false: theme.colors.border,
          true: theme.colors.primary,
        }}
      />
    </View>
  );
}

export function FeedbackToast({feedback}: {feedback: SalesFeedback | null}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    if (!feedback) {
      return;
    }

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1800),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [feedback, opacity, translateY]);

  if (!feedback) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        feedback.tone === 'success' ? styles.toastSuccess : null,
        feedback.tone === 'warning' ? styles.toastWarning : null,
        feedback.tone === 'danger' ? styles.toastDanger : null,
        {
          opacity,
          transform: [{translateY}],
        },
      ]}>
      <Text style={styles.toastTitle}>{feedback.title}</Text>
      <Text style={styles.toastDetail}>{feedback.detail}</Text>
    </Animated.View>
  );
}

export function SheetModal({
  visible,
  title,
  subtitle,
  onClose,
  children,
}: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalScrim} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          <Text style={styles.sheetSubtitle}>{subtitle}</Text>
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function QrPreview({
  value = 'pos-product',
  accent = theme.colors.primary,
  size = 160,
}: {
  value?: string;
  accent?: string;
  size?: number;
}) {
  let QRCode: typeof import('react-native-qrcode-svg').default | null = null;

  try {
    const QRCodeModule = require('react-native-qrcode-svg');
    QRCode = QRCodeModule.default || QRCodeModule;
  } catch {
    // Fallback if library is not available
  }

  if (QRCode) {
    return (
      <View style={styles.qrFrame}>
        <QRCode
          value={value}
          size={size}
          color={accent}
          backgroundColor={theme.colors.panel}
          quietZone={8}
        />
      </View>
    );
  }

  // Fallback decorative preview
  const blocks = Array.from({length: 81}, (_, index) => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const isFinder =
      (row < 3 && col < 3) ||
      (row < 3 && col > 5) ||
      (row > 5 && col < 3);
    const active = isFinder || (row * 7 + col * 3) % 5 < 2;
    return active;
  });

  return (
    <View style={styles.qrFrame}>
      {blocks.map((active, index) => (
        <View
          key={`block-${index}`}
          style={[
            styles.qrBlock,
            active ? {backgroundColor: accent} : styles.qrBlockEmpty,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 110,
    gap: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  headerTextWrap: {
    flex: 1,
    gap: 4,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.colors.ink,
    letterSpacing: -0.7,
  },
  screenSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.muted,
  },
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadow,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionTextWrap: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  sectionDetail: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  buttonBase: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
  },
  buttonCompact: {
    minHeight: 42,
    paddingHorizontal: theme.spacing.md,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.panelMuted,
    borderColor: theme.colors.border,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border,
  },
  buttonDanger: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: theme.colors.danger,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  buttonPrimaryLabel: {
    color: theme.colors.panel,
  },
  buttonGhostLabel: {
    color: theme.colors.primary,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.panelMuted,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 6,
  },
  metricCardSuccess: {
    backgroundColor: theme.colors.successSoft,
  },
  metricCardWarning: {
    backgroundColor: theme.colors.warningSoft,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillSuccess: {
    backgroundColor: theme.colors.successSoft,
  },
  pillWarning: {
    backgroundColor: theme.colors.warningSoft,
  },
  pillDanger: {
    backgroundColor: theme.colors.dangerSoft,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  pillSuccessText: {
    color: theme.colors.success,
  },
  pillWarningText: {
    color: theme.colors.warning,
  },
  pillDangerText: {
    color: theme.colors.danger,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.panelMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.ink,
    fontWeight: '600',
  },
  categoryScroll: {
    marginHorizontal: -theme.spacing.lg,
  },
  categoryScrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.panel,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  categoryPillTextActive: {
    color: theme.colors.panel,
  },
  fieldWrap: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelMuted,
    paddingHorizontal: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.ink,
  },
  inputMultiline: {
    minHeight: 96,
    paddingTop: theme.spacing.md,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  toggleTextWrap: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  toggleHint: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  toast: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    top: theme.spacing.md,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 2,
    zIndex: 10,
    ...theme.shadow,
  },
  toastSuccess: {
    backgroundColor: theme.colors.success,
  },
  toastWarning: {
    backgroundColor: theme.colors.warning,
  },
  toastDanger: {
    backgroundColor: theme.colors.danger,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.panel,
  },
  toastDetail: {
    fontSize: 12,
    color: theme.colors.panel,
    opacity: 0.95,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(11, 21, 34, 0.28)',
  },
  modalScrim: {
    flex: 1,
  },
  sheet: {
    backgroundColor: theme.colors.panel,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    maxHeight: '86%',
    gap: theme.spacing.sm,
  },
  sheetHandle: {
    width: 54,
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  sheetSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.muted,
  },
  sheetContent: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  qrFrame: {
    width: 186,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignSelf: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.panel,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  qrBlock: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  qrBlockEmpty: {
    backgroundColor: theme.colors.panelMuted,
  },
});
