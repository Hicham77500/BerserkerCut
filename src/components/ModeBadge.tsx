import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { isDemoMode } from '../services/appModeService';
import { Typography, Spacing, BorderRadius } from '../utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';

/**
 * Badge indiquant le mode actuel de l'application (démo ou production)
 */
interface ModeBadgeProps {
  style?: ViewStyle;
}

export const ModeBadge: React.FC<ModeBadgeProps> = ({ style }) => {
  const { colors } = useThemeMode();
  const demoMode = isDemoMode();
  
  if (!demoMode) return null; // Ne pas afficher le badge en mode production
  
  return (
    <View style={[styles.container, { backgroundColor: colors.primary }, style]}>
      <Text style={[styles.text, { color: colors.background }]}>MODE DÉMO</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.xs,
  },
  text: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5, // iOS-optimized letter spacing for small caps
  },
});

export default ModeBadge;
