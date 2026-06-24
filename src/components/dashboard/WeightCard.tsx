import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components';
import { BorderRadius, Spacing, Typography } from '@/utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';

type WeightCardProps = {
  currentWeight: number;
  weeklyVariation: number;
  compact?: boolean;
};

export const WeightCard: React.FC<WeightCardProps> = ({ currentWeight, weeklyVariation, compact = false }) => {
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors, compact), [colors, compact]);

  const variationLabel = `${weeklyVariation > 0 ? '+' : ''}${weeklyVariation.toFixed(1)} kg cette semaine`;

  return (
    <Card padding={compact ? 'md' : 'lg'} style={styles.card}>
      <Text style={styles.title}>⚖️ Poids</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{currentWeight.toFixed(1)} kg</Text>
        <Text style={styles.variation}>{variationLabel}</Text>
      </View>
    </Card>
  );
};
const createStyles = (colors: any, compact: boolean) =>
  StyleSheet.create({
    card: {
      gap: compact ? Spacing.xs : Spacing.sm,
    },
    title: {
      ...Typography.bodySmall,
      color: colors.textMuted,
    },
    valueRow: {
      gap: compact ? Spacing.xs : Spacing.xs,
    },
    value: {
      ...(compact ? Typography.h4 : Typography.h3),
      color: colors.text,
    },
    variation: {
      ...Typography.bodySmall,
      color: colors.textLight,
    },
  });