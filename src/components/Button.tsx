/**
 * Composant Button réutilisable avec variants
 */

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator,
  TouchableOpacityProps 
} from 'react-native';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../utils/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  ...props
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? Colors.textDark : Colors.primary} 
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  } as ViewStyle,

  // Variants
  primary: {
    backgroundColor: Colors.primary,
  } as ViewStyle,

  secondary: {
    backgroundColor: Colors.secondary,
  } as ViewStyle,

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  } as ViewStyle,

  ghost: {
    backgroundColor: 'transparent',
  } as ViewStyle,

  danger: {
    backgroundColor: Colors.error,
  } as ViewStyle,

  // Sizes
  sm: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  } as ViewStyle,

  md: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  } as ViewStyle,

  lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 56,
  } as ViewStyle,

  // States
  disabled: {
    opacity: 0.5,
  } as ViewStyle,

  fullWidth: {
    width: '100%',
  } as ViewStyle,

  // Text styles
  baseText: {
    ...Typography.button,
    textAlign: 'center',
  } as TextStyle,

  primaryText: {
    color: Colors.textDark,
  } as TextStyle,

  secondaryText: {
    color: Colors.textDark,
  } as TextStyle,

  outlineText: {
    color: Colors.primary,
  } as TextStyle,

  ghostText: {
    color: Colors.primary,
  } as TextStyle,

  dangerText: {
    color: Colors.textDark,
  } as TextStyle,

  disabledText: {
    opacity: 0.7,
  } as TextStyle,

  // Size text
  smText: {
    fontSize: 14,
  } as TextStyle,

  mdText: {
    fontSize: 16,
  } as TextStyle,

  lgText: {
    fontSize: 18,
  } as TextStyle,
});
