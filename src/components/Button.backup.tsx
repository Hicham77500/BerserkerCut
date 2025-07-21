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
  TouchableOpacityProps,
  Platform 
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
      activeOpacity={Platform.OS === 'android' ? 0.6 : 0.8}
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
    // Sur Android, les ombres peuvent causer des problèmes avec les bordures
    ...(Platform.OS === 'ios' ? Shadows.sm : {}),
  } as ViewStyle,

  // Variants
  primary: {
    backgroundColor: Colors.primary,
    // Ombre uniquement sur iOS pour éviter les conflits Android
    ...(Platform.OS === 'ios' ? {} : { elevation: 2 }),
  } as ViewStyle,

  secondary: {
    backgroundColor: Colors.secondary,
    ...(Platform.OS === 'ios' ? {} : { elevation: 1 }),
  } as ViewStyle,

  outline: {
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 107, 53, 0.02)' : 'transparent', // Encore plus léger sur Android
    borderWidth: Platform.OS === 'android' ? 2 : 2, // Bordure normale
    borderColor: Platform.OS === 'android' ? 'rgba(255, 107, 53, 0.8)' : Colors.primary,
    // Pas d'élévation pour éviter les carrés sur Android
    ...(Platform.OS === 'android' ? { 
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0, // Suppression complète de l'élévation
    } : {}),
  } as ViewStyle,

  ghost: {
    backgroundColor: 'transparent',
    // Pas d'ombre pour ghost
  } as ViewStyle,

  danger: {
    backgroundColor: Colors.error,
    ...(Platform.OS === 'ios' ? {} : { elevation: 2 }),
  } as ViewStyle,

  // Sizes avec ajustements pour Android
  sm: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: Platform.OS === 'android' ? 40 : 36, // Un peu plus haut sur Android
  } as ViewStyle,

  md: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: Platform.OS === 'android' ? 52 : 48,
  } as ViewStyle,

  lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: Platform.OS === 'android' ? 60 : 56,
  } as ViewStyle,

  // States
  disabled: {
    opacity: 0.5,
  } as ViewStyle,

  fullWidth: {
    width: '100%',
  } as ViewStyle,

  // Text styles avec meilleure lisibilité Android
  baseText: {
    ...Typography.button,
    textAlign: 'center',
    // Améliorer le contraste sur Android
    ...(Platform.OS === 'android' ? { 
      fontWeight: '600',
      letterSpacing: 0.5 
    } : {}),
  } as TextStyle,

  primaryText: {
    color: Colors.textDark,
    fontWeight: 'bold',
  } as TextStyle,

  secondaryText: {
    color: Colors.textDark,
    fontWeight: 'bold',
  } as TextStyle,

  outlineText: {
    color: Colors.primary,
    fontWeight: Platform.OS === 'android' ? '700' : 'bold', // Plus visible sur Android
    ...(Platform.OS === 'android' ? {
      letterSpacing: 0.8, // Espacement des lettres pour meilleure lisibilité
      textShadowColor: 'rgba(0,0,0,0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    } : {}),
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
