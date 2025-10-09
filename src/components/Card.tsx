/**
 * Composant Card réutilisable
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '../utils/theme';

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

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden', // Ensures content respects border radius
  } as ViewStyle,

  default: {
    ...Shadows.sm,
  } as ViewStyle,

  elevated: {
    ...Shadows.md, // Use medium shadow for better hierarchy
  } as ViewStyle,

  outlined: {
    // No shadow for outlined variant, only border
    borderWidth: 1,
    borderColor: Colors.border,
  } as ViewStyle,
});
