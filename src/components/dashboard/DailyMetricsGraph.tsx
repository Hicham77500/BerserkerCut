import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../Card';
import { BorderRadius, Spacing, Typography } from '@/utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';

type DailyMetricsGraphProps = {
  currentWeight: number;
  weeklyVariation: number;
  calories: { consumed: number; target: number };
  proteins: { consumed: number; target: number };
  water: { consumed: number; target: number };
  compact?: boolean;
};

type MetricRowProps = {
  label: string;
  value: string;
  percentage: number;
  color: string;
};

const MetricRow: React.FC<MetricRowProps> = ({ label, value, percentage, color }) => {
  return (
    <View style={baseStyles.row}>
      <View style={baseStyles.rowHeader}>
        <Text style={baseStyles.rowLabel}>{label}</Text>
        <Text style={baseStyles.rowValue}>{value}</Text>
      </View>
      <View style={baseStyles.track}>
        <View style={[baseStyles.fill, { width: `${Math.max(8, Math.min(percentage, 100))}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

export const DailyMetricsGraph: React.FC<DailyMetricsGraphProps> = ({
  currentWeight,
  weeklyVariation,
  calories,
  proteins,
  water,
  compact = false,
}) => {
  const { colors } = useThemeMode();
  const graphStyles = React.useMemo(() => createStyles(colors, compact), [colors, compact]);

  const caloriesPct = (calories.consumed / calories.target) * 100;
  const proteinsPct = (proteins.consumed / proteins.target) * 100;
  const waterPct = (water.consumed / water.target) * 100;

  return (
    <Card variant="elevated" padding={compact ? 'md' : 'lg'} style={graphStyles.card}>
      <View style={graphStyles.header}>
        <View>
          <Text style={graphStyles.kicker}>Vue combinée</Text>
          <Text style={graphStyles.title}>Ton tableau de bord du jour</Text>
        </View>
        <View style={graphStyles.scoreChip}>
          <Text style={graphStyles.scoreLabel}>Poids</Text>
          <Text style={graphStyles.scoreValue}>{currentWeight.toFixed(1)} kg</Text>
        </View>
      </View>

      <View style={graphStyles.graphStage}>
        <View style={graphStyles.gridLine} />
        <View style={graphStyles.gridLineSecondary} />
        <Text style={graphStyles.weightHint}>{weeklyVariation > 0 ? '+' : ''}{weeklyVariation.toFixed(1)} kg / semaine</Text>

        <MetricRow label="Calories" value={`${calories.consumed} / ${calories.target} kcal`} percentage={caloriesPct} color={colors.calories} />
        <MetricRow label="Protéines" value={`${proteins.consumed} / ${proteins.target} g`} percentage={proteinsPct} color={colors.protein} />
        <MetricRow label="Eau" value={`${water.consumed.toFixed(1)} / ${water.target.toFixed(1)} L`} percentage={waterPct} color={colors.carbs} />
      </View>

      <View style={graphStyles.legendRow}>
        <View style={graphStyles.legendItem}><View style={[graphStyles.dot, { backgroundColor: colors.calories }]} /><Text style={graphStyles.legendText}>Calories</Text></View>
        <View style={graphStyles.legendItem}><View style={[graphStyles.dot, { backgroundColor: colors.protein }]} /><Text style={graphStyles.legendText}>Protéines</Text></View>
        <View style={graphStyles.legendItem}><View style={[graphStyles.dot, { backgroundColor: colors.carbs }]} /><Text style={graphStyles.legendText}>Eau</Text></View>
      </View>
    </Card>
  );
};

const baseStyles = StyleSheet.create({
  row: {
    gap: Spacing.xs,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    ...Typography.bodySmall,
  },
  rowValue: {
    ...Typography.technical,
  },
  track: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});

const createStyles = (colors: any, compact: boolean) =>
  StyleSheet.create({
    card: {
      gap: compact ? Spacing.sm : Spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: Spacing.sm,
    },
    kicker: {
      ...Typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    title: {
      ...Typography.h4,
      color: colors.text,
    },
    scoreChip: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
      backgroundColor: colors.overlay,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 96,
      alignItems: 'flex-end',
    },
    scoreLabel: {
      ...Typography.bodySmall,
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    scoreValue: {
      ...Typography.label,
      color: colors.text,
    },
    graphStage: {
      gap: compact ? Spacing.sm : Spacing.md,
      padding: compact ? Spacing.sm : Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    gridLine: {
      position: 'absolute',
      left: Spacing.md,
      right: Spacing.md,
      top: '33%',
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.06)',
    },
    gridLineSecondary: {
      position: 'absolute',
      left: Spacing.md,
      right: Spacing.md,
      top: '66%',
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.06)',
    },
    weightHint: {
      ...Typography.bodySmall,
      color: colors.textLight,
      marginBottom: Spacing.xs,
    },
    legendRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 999,
    },
    legendText: {
      ...Typography.bodySmall,
      color: colors.textLight,
    },
  });