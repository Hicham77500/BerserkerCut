import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../Card';
import { BorderRadius, Spacing, Typography } from '@/utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';

type SupplementCardEntry = {
  name: string;
  taken: boolean;
};

type SupplementSlot = {
  label: 'Matin' | 'Midi' | 'Soir';
  items: SupplementCardEntry[];
};

type SupplementCarouselProps = {
  compact?: boolean;
};

const supplementSlots: SupplementSlot[] = [
  {
    label: 'Matin',
    items: [
      { name: 'Multivitamine', taken: true },
      { name: 'Créatine', taken: true },
    ],
  },
  {
    label: 'Midi',
    items: [
      { name: 'Oméga-3', taken: false },
      { name: 'Magnésium', taken: true },
    ],
  },
  {
    label: 'Soir',
    items: [
      { name: 'ZMA', taken: false },
      { name: 'Protéines', taken: true },
    ],
  },
];

export const SupplementCarousel: React.FC<SupplementCarouselProps> = ({ compact = false }) => {
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors, compact), [colors, compact]);

  return (
    <Card variant="elevated" padding={compact ? 'md' : 'lg'} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Compléments</Text>
        <Text style={styles.subtitle}>Matin · Midi · Soir</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
      >
        {supplementSlots.map((slot) => (
          <View key={slot.label} style={styles.slide}>
            <Text style={styles.slotLabel}>{slot.label}</Text>
            <View style={styles.slotProgressBar}>
              <View
                style={[
                  styles.slotProgressFill,
                  { width: `${(slot.items.filter((item) => item.taken).length / slot.items.length) * 100}%`, backgroundColor: colors.secondary },
                ]}
              />
            </View>

            <View style={styles.list}>
              {slot.items.map((item) => (
                <View key={item.name} style={styles.itemRow}>
                  <View style={[styles.checkbox, item.taken && styles.checkboxTaken]}>
                    <Text style={styles.checkboxMark}>{item.taken ? '✓' : ''}</Text>
                  </View>
                  <Text style={styles.itemText}>{item.name}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.footerText}>
              {slot.items.filter((item) => item.taken).length} / {slot.items.length} pris
            </Text>
          </View>
        ))}
      </ScrollView>
    </Card>
  );
};

const createStyles = (colors: any, compact: boolean) =>
  StyleSheet.create({
    card: {
      gap: Spacing.md,
    },
    header: {
      gap: Spacing.xs,
    },
    title: {
      ...Typography.h4,
      color: colors.text,
    },
    subtitle: {
      ...Typography.bodySmall,
      color: colors.textMuted,
    },
    carouselContent: {
      gap: Spacing.md,
      paddingRight: Spacing.lg,
    },
    slide: {
      width: compact ? 250 : 280,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.border,
      gap: Spacing.sm,
    },
    slotLabel: {
      ...Typography.h4,
      color: colors.text,
    },
    slotProgressBar: {
      height: 10,
      borderRadius: 999,
      backgroundColor: colors.overlay,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    slotProgressFill: {
      height: '100%',
      borderRadius: 999,
    },
    list: {
      gap: Spacing.sm,
      marginTop: Spacing.xs,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    checkbox: {
      width: 28,
      height: 28,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.overlay,
    },
    checkboxTaken: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary,
    },
    checkboxMark: {
      ...Typography.button,
      fontSize: 14,
      color: colors.textDark,
    },
    itemText: {
      ...Typography.label,
      color: colors.text,
      flex: 1,
    },
    footerText: {
      ...Typography.bodySmall,
      color: colors.textMuted,
      textAlign: 'right',
    },
  });