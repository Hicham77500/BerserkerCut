import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../Card';
import { Spacing, Typography } from '@/utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';

type SupplementCardProps = {
  taken: number;
  total: number;
  compact?: boolean;
};

export const SupplementCard: React.FC<SupplementCardProps> = ({ taken, total, compact = false }) => {
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors, compact), [colors, compact]);
  const percentage = total > 0 ? Math.min((taken / total) * 100, 100) : 0;

  return (
    <Card padding={compact ? 'md' : 'lg'} style={styles.card}>
      <Text style={styles.title}>💊 Compléments</Text>
      <Text style={styles.value}>{taken} / {total} pris aujourd'hui</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
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
      backgroundColor: colors.secondary,
    },
  });