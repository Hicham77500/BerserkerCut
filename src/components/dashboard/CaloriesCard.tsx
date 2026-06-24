import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../Card';
import { Spacing, Typography } from '@/utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';

type CaloriesCardProps = {
  consumed: number;
  target: number;
  compact?: boolean;
};

export const CaloriesCard: React.FC<CaloriesCardProps> = ({ consumed, target, compact = false }) => {
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors, compact), [colors, compact]);
  const percentage = Math.min((consumed / target) * 100, 100);

  return (
    <Card padding={compact ? 'md' : 'lg'} style={styles.card}>
      <Text style={styles.title}>🔥 Calories</Text>
      <Text style={styles.value}>{consumed} / {target} kcal</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.percent}>{Math.round(percentage)}%</Text>
    </Card>
  );
};
const createStyles = (colors: any, compact: boolean) =>
  StyleSheet.create({
    card: {
      gap: compact ? Spacing.xs : Spacing.sm,
    },
    title: {
      ...Typography.label,
      color: colors.textMuted,
    },
    value: {
      ...Typography.h4,
      color: colors.text,
    },
    barTrack: {
      height: compact ? 10 : 12,
      borderRadius: 999,
      backgroundColor: colors.overlay,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    barFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: colors.calories,
    },
    percent: {
      ...Typography.bodySmall,
      color: colors.textLight,
      textAlign: 'right',
    },
  });