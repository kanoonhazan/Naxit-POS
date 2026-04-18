import React, { useEffect, useRef } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../theme';
import type { SalesFeedback } from '../types';

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
  scrollEnabled?: boolean;
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
  scrollEnabled = true,
}: ScreenProps) {
  const { colors } = useAppTheme();
  
  const content = (
    <>
      {headerAction ? (
        <View style={[styles.headerRow, { justifyContent: 'flex-end', gap: 14 }]}>
          {headerAction}
        </View>
      ) : null}
      {children}
    </>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {scrollEnabled ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: 18, paddingTop: 14, paddingBottom: bottomPadding, gap: 18 },
          ]}
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        <View style={[styles.scrollContent, { flex: 1, paddingHorizontal: 18, paddingTop: 14, paddingBottom: bottomPadding, gap: 18 }]}>
          {content}
        </View>
      )}
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
  const { colors, radius, shadow } = useAppTheme();
  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: colors.panel, 
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: 18,
        gap: 14,
        ...shadow,
      }, 
      style
    ]}>
      {children}
    </View>
  );
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
  const { colors } = useAppTheme();
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionTextWrap}>
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>{title}</Text>
        {detail ? <Text style={[styles.sectionDetail, { color: colors.muted }]}>{detail}</Text> : null}
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
  const { colors, radius } = useAppTheme();
  
  const getVariants = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: colors.primary,
          border: colors.primary,
          text: colors.panel,
        };
      case 'secondary':
        return {
          bg: colors.panelMuted,
          border: colors.border,
          text: colors.ink,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: colors.border,
          text: colors.primary,
        };
      case 'danger':
        return {
          bg: colors.dangerSoft,
          border: colors.danger,
          text: colors.danger,
        };
      default:
        return {
          bg: colors.primary,
          border: colors.primary,
          text: colors.panel,
        };
    }
  };

  const v = getVariants();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          borderRadius: radius.md,
          opacity: (pressed && !disabled) || disabled ? 0.6 : 1,
          paddingHorizontal: compact ? 14 : 18,
          minHeight: compact ? 42 : 52,
        },
      ]}>
      <Text
        style={[
          styles.buttonLabel,
          { color: v.text },
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
  const { colors, radius } = useAppTheme();
  
  const getToneStyle = () => {
    switch (tone) {
      case 'success':
        return { bg: colors.successSoft };
      case 'warning':
        return { bg: colors.warningSoft };
      default:
        return { bg: colors.panelMuted };
    }
  };

  return (
    <View
      style={[
        styles.metricCard,
        { 
          backgroundColor: getToneStyle().bg,
          borderRadius: radius.md,
          padding: 14,
        },
      ]}>
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.ink }]}>{value}</Text>
    </View>
  );
}

export function StockPill({ stock }: { stock: number }) {
  const { colors, radius } = useAppTheme();
  const tone =
    stock <= 5 ? 'danger' : stock <= 12 ? 'warning' : 'success';

  const getToneStyle = () => {
    switch (tone) {
      case 'success':
        return { bg: colors.successSoft, text: colors.success };
      case 'warning':
        return { bg: colors.warningSoft, text: colors.warning };
      case 'danger':
        return { bg: colors.dangerSoft, text: colors.danger };
    }
  };

  const s = getToneStyle();

  return (
    <View
      style={[
        styles.pill,
        { 
          backgroundColor: s.bg,
          borderRadius: radius.pill,
        },
      ]}>
      <Text
        style={[
          styles.pillText,
          { color: s.text },
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
  const { colors, radius } = useAppTheme();
  
  const getToneStyle = () => {
    switch (tone) {
      case 'success':
        return { bg: colors.successSoft, text: colors.success };
      case 'warning':
        return { bg: colors.warningSoft, text: colors.warning };
      case 'danger':
        return { bg: colors.dangerSoft, text: colors.danger };
      default:
        return { bg: colors.panelMuted, text: colors.ink };
    }
  };

  const s = getToneStyle();

  return (
    <View
      style={[
        styles.tag,
        { 
          backgroundColor: s.bg,
          borderRadius: radius.pill,
        },
      ]}>
      <Text style={[styles.tagText, { color: s.text }]}>{label}</Text>
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
  const { colors, radius } = useAppTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.categoryScrollContent, { paddingHorizontal: 18, gap: 10 }]}
      style={[styles.categoryScroll, { marginHorizontal: -18 }]}>
      <Pressable
        onPress={() => onSelect(null)}
        style={[
          styles.categoryPill,
          { 
            backgroundColor: selectedCategory === null ? colors.primary : colors.panel,
            borderColor: selectedCategory === null ? colors.primary : colors.border,
            borderRadius: radius.pill,
          },
        ]}>
        <Text
          style={[
            styles.categoryPillText,
            { color: selectedCategory === null ? colors.panel : colors.ink },
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
            { 
              backgroundColor: selectedCategory === cat ? colors.primary : colors.panel,
              borderColor: selectedCategory === cat ? colors.primary : colors.border,
              borderRadius: radius.pill,
            },
          ]}>
          <Text
            style={[
              styles.categoryPillText,
              { color: selectedCategory === cat ? colors.panel : colors.ink },
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
  const { colors, radius } = useAppTheme();
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={[styles.fieldLabel, { color: colors.ink }]}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholderTextColor={colors.muted}
        style={[
          styles.input, 
          { 
            backgroundColor: colors.panelMuted,
            borderColor: colors.border,
            color: colors.ink,
            borderRadius: radius.md,
            paddingHorizontal: 14,
          },
          multiline ? styles.inputMultiline : null
        ]}
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
  const { colors } = useAppTheme();
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextWrap}>
        <Text style={[styles.toggleLabel, { color: colors.ink }]}>{label}</Text>
        <Text style={[styles.toggleHint, { color: colors.muted }]}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={colors.panel}
        trackColor={{
          false: colors.border,
          true: colors.primary,
        }}
      />
    </View>
  );
}

export function FeedbackToast({ feedback }: { feedback: SalesFeedback | null }) {
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

  const { colors, radius, shadow } = useAppTheme();
  
  if (!feedback) {
    return null;
  }

  const getToneStyle = () => {
    switch (feedback.tone) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'danger':
        return colors.danger;
      default:
        return colors.primary;
    }
  };

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          backgroundColor: getToneStyle(),
          borderRadius: radius.md,
          padding: 14,
          marginHorizontal: 18,
          ...shadow,
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      <Text style={[styles.toastTitle, { color: colors.panel }]}>{feedback.title}</Text>
      <Text style={[styles.toastDetail, { color: colors.panel }]}>{feedback.detail}</Text>
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
  const { colors, radius } = useAppTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalScrim} onPress={onClose} />
        <View style={[
          styles.sheet, 
          { 
            backgroundColor: colors.panel,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: 14,
            paddingHorizontal: 18,
            paddingBottom: 24,
            gap: 10,
          }
        ]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border, borderRadius: radius.pill }]} />
          <Text style={[styles.sheetTitle, { color: colors.ink }]}>{title}</Text>
          <Text style={[styles.sheetSubtitle, { color: colors.muted }]}>{subtitle}</Text>
          <ScrollView
            contentContainerStyle={[styles.sheetContent, { gap: 14, paddingTop: 10, paddingBottom: 32 }]}
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
  accent,
  size = 160,
}: {
  value?: string;
  accent?: string;
  size?: number;
}) {
  const { colors, radius } = useAppTheme();
  const activeAccent = accent || colors.primary;
  
  let QRCode: typeof import('react-native-qrcode-svg').default | null = null;

  try {
    const QRCodeModule = require('react-native-qrcode-svg');
    QRCode = QRCodeModule.default || QRCodeModule;
  } catch {
    // Fallback if library is not available
  }

  if (QRCode) {
    return (
      <View style={[
        styles.qrFrame, 
        { 
          backgroundColor: colors.panel,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: 14,
        }
      ]}>
        <QRCode
          value={value}
          size={size}
          color={activeAccent}
          backgroundColor={colors.panel}
          quietZone={8}
        />
      </View>
    );
  }

  // Fallback decorative preview
  const blocks = Array.from({ length: 81 }, (_, index) => {
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
    <View style={[
      styles.qrFrame, 
      { 
        backgroundColor: colors.panel,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: 14,
      }
    ]}>
      {blocks.map((active, index) => (
        <View
          key={`block-${index}`}
          style={[
            styles.qrBlock,
            active ? { backgroundColor: activeAccent } : { backgroundColor: colors.border + '30' },
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextWrap: {
    flex: 1,
    gap: 4,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  screenSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  sectionTextWrap: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionDetail: {
    fontSize: 13,
  },
  buttonBase: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  metricCard: {
    flex: 1,
    gap: 6,
  },
  metricLabel: {
    fontSize: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryScroll: {
  },
  categoryScrollContent: {
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '700',
  },
  fieldWrap: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 96,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
  },
  toggleTextWrap: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  toggleHint: {
    fontSize: 13,
  },
  toast: {
    position: 'absolute',
    top: 14,
    gap: 2,
    zIndex: 10,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  toastDetail: {
    fontSize: 12,
    opacity: 0.95,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(11, 21, 34, 0.42)',
  },
  modalScrim: {
    flex: 1,
  },
  sheet: {
    maxHeight: '86%',
  },
  sheetHandle: {
    width: 54,
    height: 6,
    alignSelf: 'center',
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  sheetSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  sheetContent: {
  },
  qrFrame: {
    width: 186,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignSelf: 'center',
    borderWidth: 1,
  },
  qrBlock: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
});
