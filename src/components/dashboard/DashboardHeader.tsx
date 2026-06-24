import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../Card';
import { BorderRadius, Spacing, Typography } from '@/utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';

type DashboardHeaderProps = {
  name: string;
  objectiveLabel: string;
  compact?: boolean;
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ name, objectiveLabel, compact = false }) => {
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors, compact), [colors, compact]);

  return (
    <Card variant="elevated" padding={compact ? 'md' : 'lg'} style={styles.card}>
      <Text style={styles.greeting}>Bonjour {name} 👋</Text>
      <View style={styles.objectivePill}>
        <Text style={styles.objectiveLabel}>Objectif</Text>
        <Text style={styles.objectiveValue}>{objectiveLabel}</Text>
      </View>
    </Card>
  );
};

const createStyles = (colors: any, compact: boolean) =>
  StyleSheet.create({
    card: {
      gap: compact ? Spacing.sm : Spacing.md,
    },
    greeting: {
      ...(compact ? Typography.h3 : Typography.h4),
      color: colors.text,
    },
    objectivePill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: BorderRadius.sm,
      backgroundColor: colors.overlay,
      paddingHorizontal: compact ? Spacing.sm : Spacing.md,
      paddingVertical: compact ? Spacing.xs : Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    objectiveLabel: {
      ...Typography.bodySmall,
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    objectiveValue: {
      ...Typography.label,
      color: colors.text,
    },
  });