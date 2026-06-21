/**
 * Composant MacroCard pour afficher les macronutriments
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Typography, BorderRadius, Spacing, ThemePalette } from '../utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Card } from './Card';

interface MacroCardProps {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  title?: string;
  showPercentages?: boolean;
}

/**
 * Composant: MacroCard
 * Utilite: Gere le rendu UI et les interactions utilisateur de cet ecran/composant.
 */
export const MacroCard: React.FC<MacroCardProps> = ({
  protein,
  carbs,
  fat,
  calories,
  title = "Macronutriments",
  showPercentages = false,
}) => {
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const totalMacros = protein + carbs + fat;
  const proteinPercentage = totalMacros > 0 ? (protein / totalMacros) * 100 : 0;
  const carbsPercentage = totalMacros > 0 ? (carbs / totalMacros) * 100 : 0;
  const fatPercentage = totalMacros > 0 ? (fat / totalMacros) * 100 : 0;

/**
 * Fonction: MacroBar
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const MacroBar = ({ 
    value, 
    total, 
    color 
  }: { 
    value: number; 
    total: number; 
    color: string; 
  }) => (
    <View style={styles.macroBarContainer}>
      <View style={[styles.macroBar, { backgroundColor: colors.background }]}>
        <View 
          style={[
            styles.macroBarFill, 
            { 
              backgroundColor: color, 
              width: `${total > 0 ? (value / total) * 100 : 0}%` 
            }
          ]} 
        />
      </View>
    </View>
  );

  return (
    <Card variant="elevated" padding="lg">
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.calories}>{calories} cal</Text>
      </View>

      <View style={styles.macrosContainer}>
        <View style={styles.macroItem}>
          <View style={styles.macroHeader}>
            <View style={[styles.macroColor, { backgroundColor: colors.protein }]} />
            <Text style={styles.macroLabel}>Protéines</Text>
          </View>
          <Text style={styles.macroValue}>{protein}g</Text>
          {showPercentages && (
            <Text style={styles.macroPercentage}>{proteinPercentage.toFixed(1)}%</Text>
          )}
          <MacroBar value={protein} total={totalMacros} color={colors.protein} />
        </View>

        <View style={styles.macroItem}>
          <View style={styles.macroHeader}>
            <View style={[styles.macroColor, { backgroundColor: colors.carbs }]} />
            <Text style={styles.macroLabel}>Glucides</Text>
          </View>
          <Text style={styles.macroValue}>{carbs}g</Text>
          {showPercentages && (
            <Text style={styles.macroPercentage}>{carbsPercentage.toFixed(1)}%</Text>
          )}
          <MacroBar value={carbs} total={totalMacros} color={colors.carbs} />
        </View>

        <View style={styles.macroItem}>
          <View style={styles.macroHeader}>
            <View style={[styles.macroColor, { backgroundColor: colors.fat }]} />
            <Text style={styles.macroLabel}>Lipides</Text>
          </View>
          <Text style={styles.macroValue}>{fat}g</Text>
          {showPercentages && (
            <Text style={styles.macroPercentage}>{fatPercentage.toFixed(1)}%</Text>
          )}
          <MacroBar value={fat} total={totalMacros} color={colors.fat} />
        </View>
      </View>
    </Card>
  );
};

/**
 * Fonction: createStyles
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const createStyles = (colors: ThemePalette) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  } as ViewStyle,

  title: {
    ...Typography.h3,
    color: colors.text,
  } as TextStyle,

  calories: {
    ...Typography.h3,
    color: colors.calories,
    fontWeight: '700',
  } as TextStyle,

  macrosContainer: {
    gap: Spacing.md,
  } as ViewStyle,

  macroItem: {
    marginBottom: Spacing.md, // Standardized spacing
  } as ViewStyle,

  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  } as ViewStyle,

  macroColor: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.xs, // Standardized border radius
    marginRight: Spacing.sm,
  } as ViewStyle,

  macroLabel: {
    ...Typography.bodySmall,
    color: colors.text,
    flex: 1,
    letterSpacing: 0.25, // iOS typography enhancement
  } as TextStyle,

  macroValue: {
    ...Typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    letterSpacing: 0.25, // iOS typography enhancement
  } as TextStyle,

  macroPercentage: {
    ...Typography.caption,
    color: colors.textMuted,
    marginLeft: Spacing.xs,
  } as TextStyle,

  macroBarContainer: {
    marginTop: Spacing.xs,
  } as ViewStyle,

  macroBar: {
    height: 6,
    borderRadius: BorderRadius.xs, // Standardized border radius
    overflow: 'hidden',
  } as ViewStyle,

  macroBarFill: {
    height: '100%',
    borderRadius: BorderRadius.xs, // Standardized border radius
  } as ViewStyle,
});
