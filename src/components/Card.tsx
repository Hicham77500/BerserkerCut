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

/**
 * Composant: Card
 * Utilite: Gere le rendu UI et les interactions utilisateur de cet ecran/composant.
 */
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

/**
 * Fonction: createStyles
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    base: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.sm,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    default: {
      ...Shadows.xs,
    } as ViewStyle,

    elevated: {
      ...Shadows.sm,
    } as ViewStyle,

    outlined: {
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,
  });
