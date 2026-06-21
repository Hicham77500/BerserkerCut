/**
 * Composant Card réutilisable
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { BorderRadius, Spacing, Shadows, ThemePalette } from '../utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof Spacing;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  style,
  ...props
}) => {
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const cardStyle = [
    styles.base,
    styles[variant],
    { padding: Spacing[padding] },
    style,
  ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    base: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
    } as ViewStyle,

    default: {
      ...Shadows.sm,
    } as ViewStyle,

    elevated: {
      ...Shadows.md,
    } as ViewStyle,

    outlined: {
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,
  });
