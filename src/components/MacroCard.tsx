/**
 * Composant MacroCard pour afficher les macronutriments
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../utils/theme';
import { Card } from './Card';

interface MacroCardProps {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  title?: string;
  showPercentages?: boolean;
}

export const MacroCard: React.FC<MacroCardProps> = ({
  protein,
  carbs,
  fat,
  calories,
  title = "Macronutriments",
  showPercentages = false,
}) => {
  const totalMacros = protein + carbs + fat;
  const proteinPercentage = totalMacros > 0 ? (protein / totalMacros) * 100 : 0;
  const carbsPercentage = totalMacros > 0 ? (carbs / totalMacros) * 100 : 0;
  const fatPercentage = totalMacros > 0 ? (fat / totalMacros) * 100 : 0;

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
      <View style={[styles.macroBar, { backgroundColor: Colors.background }]}>
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
            <View style={[styles.macroColor, { backgroundColor: Colors.protein }]} />
            <Text style={styles.macroLabel}>Protéines</Text>
          </View>
          <Text style={styles.macroValue}>{protein}g</Text>
          {showPercentages && (
            <Text style={styles.macroPercentage}>{proteinPercentage.toFixed(1)}%</Text>
          )}
          <MacroBar value={protein} total={totalMacros} color={Colors.protein} />
        </View>

        <View style={styles.macroItem}>
          <View style={styles.macroHeader}>
            <View style={[styles.macroColor, { backgroundColor: Colors.carbs }]} />
            <Text style={styles.macroLabel}>Glucides</Text>
          </View>
          <Text style={styles.macroValue}>{carbs}g</Text>
          {showPercentages && (
            <Text style={styles.macroPercentage}>{carbsPercentage.toFixed(1)}%</Text>
          )}
          <MacroBar value={carbs} total={totalMacros} color={Colors.carbs} />
        </View>

        <View style={styles.macroItem}>
          <View style={styles.macroHeader}>
            <View style={[styles.macroColor, { backgroundColor: Colors.fat }]} />
            <Text style={styles.macroLabel}>Lipides</Text>
          </View>
          <Text style={styles.macroValue}>{fat}g</Text>
          {showPercentages && (
            <Text style={styles.macroPercentage}>{fatPercentage.toFixed(1)}%</Text>
          )}
          <MacroBar value={fat} total={totalMacros} color={Colors.fat} />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  } as ViewStyle,

  title: {
    ...Typography.h3,
    color: Colors.text,
  } as TextStyle,

  calories: {
    ...Typography.h3,
    color: Colors.calories,
    fontWeight: '700',
  } as TextStyle,

  macrosContainer: {
    gap: Spacing.md,
  } as ViewStyle,

  macroItem: {
    marginBottom: Spacing.sm,
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
    borderRadius: 6,
    marginRight: Spacing.sm,
  } as ViewStyle,

  macroLabel: {
    ...Typography.bodySmall,
    color: Colors.text,
    flex: 1,
  } as TextStyle,

  macroValue: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
  } as TextStyle,

  macroPercentage: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
  } as TextStyle,

  macroBarContainer: {
    marginTop: Spacing.xs,
  } as ViewStyle,

  macroBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  } as ViewStyle,

  macroBarFill: {
    height: '100%',
    borderRadius: 3,
  } as ViewStyle,
});
