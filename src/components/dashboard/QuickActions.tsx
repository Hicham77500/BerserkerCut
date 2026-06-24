import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../Button';
import { Card } from '../Card';
import { Spacing, Typography } from '@/utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';

type QuickActionsProps = {
  onAddMeal?: () => void;
  onAddWeight?: () => void;
  onAddWater?: () => void;
  compact?: boolean;
};
export const QuickActions: React.FC<QuickActionsProps> = ({ onAddMeal, onAddWeight, onAddWater, compact = false }) => {
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors, compact), [colors, compact]);

  return (
    <Card padding={compact ? 'md' : 'lg'} style={styles.card}>
      <Text style={styles.title}>Actions rapides</Text>
      <View style={styles.actions}>
        <Button title="➕ Ajouter repas" onPress={onAddMeal} variant="secondary" fullWidth />
        <Button title="⚖️ Ajouter poids" onPress={onAddWeight} variant="secondary" fullWidth />
        <Button title="💧 Ajouter eau" onPress={onAddWater} variant="secondary" fullWidth />
      </View>
    </Card>
  );
};

const createStyles = (colors: any, compact: boolean) =>
  StyleSheet.create({
    card: {
      gap: compact ? Spacing.sm : Spacing.md,
    },
    title: {
      ...Typography.h4,
      color: colors.text,
    },
    actions: {
      gap: compact ? Spacing.xs : Spacing.sm,
    },
  });