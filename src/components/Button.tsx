import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  TouchableOpacityProps,
  Platform,
  View,
} from 'react-native';
import { BorderRadius, Spacing, Shadows, Typography, ThemePalette } from '../utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';

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
  textColor?: string;
  backgroundColor?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  textColor,
  backgroundColor,
  style,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    backgroundColor && { backgroundColor },
    style,
  ].filter(Boolean);

  const textStyle = [
    styles.baseText,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
    (disabled || loading) && styles.disabledText,
    textColor && { color: textColor },
  ].filter(Boolean);

  const spinnerColor = variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textDark;

  const accessibilityProps = {
    accessible,
    accessibilityRole: 'button' as const,
    accessibilityLabel: accessibilityLabel || title,
    accessibilityHint: accessibilityHint || undefined,
    accessibilityState: {
      disabled: disabled || loading,
      busy: loading,
    },
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={variant === 'outline' || variant === 'ghost' ? 0.85 : 0.8}
      {...accessibilityProps}
      {...props}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={spinnerColor} style={styles.spinner} />
          <Text style={[textStyle, styles.loadingText]}>{title}</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text style={textStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.xl,
      overflow: 'hidden',
      ...(Platform.OS === 'ios' ? Shadows.md : {}),
    } as ViewStyle,

    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    iconContainer: {
      marginRight: Spacing.xs,
    } as ViewStyle,

    spinner: {
      marginRight: Spacing.xs,
    } as ViewStyle,

    loadingText: {
      opacity: 0.85,
    } as TextStyle,

    primary: {
      backgroundColor: colors.primary,
      ...(Platform.OS === 'android' ? { elevation: 2 } : {}),
    } as ViewStyle,

    secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      ...(Platform.OS === 'android' ? { elevation: 1 } : {}),
    } as ViewStyle,

    outline: {
      backgroundColor: Platform.OS === 'android' ? colors.overlay : 'transparent',
      borderWidth: 2,
      borderColor: colors.primary,
      ...(Platform.OS === 'android'
        ? {
            shadowColor: 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
          }
        : {}),
    } as ViewStyle,

    ghost: {
      backgroundColor: 'transparent',
    } as ViewStyle,

    danger: {
      backgroundColor: colors.error,
      ...(Platform.OS === 'android' ? { elevation: 2 } : {}),
    } as ViewStyle,

    sm: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      minHeight: Platform.OS === 'android' ? 40 : 36,
    } as ViewStyle,

    md: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      minHeight: Platform.OS === 'android' ? 52 : 44,
    } as ViewStyle,

    lg: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.lg,
      minHeight: Platform.OS === 'android' ? 60 : 52,
    } as ViewStyle,

    disabled: {
      opacity: 0.5,
    } as ViewStyle,

    fullWidth: {
      width: '100%',
    } as ViewStyle,

    baseText: {
      ...Typography.button,
      textAlign: 'center',
      ...(Platform.OS === 'android'
        ? { fontWeight: '600', letterSpacing: 0.5, includeFontPadding: false }
        : { fontWeight: '600', letterSpacing: 0.35 }),
    } as TextStyle,

    primaryText: {
      color: colors.textDark,
      fontWeight: '700',
    } as TextStyle,

    secondaryText: {
      color: colors.text,
      fontWeight: '700',
    } as TextStyle,

    outlineText: {
      color: colors.primary,
      fontWeight: Platform.OS === 'android' ? '700' : '700',
    } as TextStyle,

    ghostText: {
      color: colors.text,
      fontWeight: '600',
    } as TextStyle,

    dangerText: {
      color: colors.text,
      fontWeight: '700',
    } as TextStyle,

    disabledText: {
      opacity: 0.75,
    } as TextStyle,

    smText: {
      fontSize: 14,
      lineHeight: 20,
    } as TextStyle,

    mdText: {
      fontSize: 16,
      lineHeight: 24,
    } as TextStyle,

    lgText: {
      fontSize: 18,
      lineHeight: 28,
    } as TextStyle,
  });

export default Button;
