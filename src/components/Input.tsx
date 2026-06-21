/**
 * Composant Input réutilisable
 */

import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  TextInputProps,
  TouchableOpacity
} from 'react-native';
import { Typography, BorderRadius, Spacing, Shadows, ThemePalette } from '../utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  variant = 'outlined',
  size = 'md',
  isPassword = false,
  style,
  returnKeyType = 'done',
  blurOnSubmit = true,
  onSubmitEditing,
  ...rest
}) => {
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = [
    styles.container,
    styles[variant],
    styles[size],
    isFocused && styles.focused,
    error && styles.error,
    style,
  ];

  const inputStyle: TextStyle[] = [
    styles.input,
    ...(leftIcon ? [styles.inputWithLeftIcon] : []),
    ...(rightIcon ? [styles.inputWithRightIcon] : []),
  ];

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={containerStyle}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={inputStyle}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          onSubmitEditing={onSubmitEditing}
          {...rest}
        />
        
        {isPassword && (
          <TouchableOpacity 
            style={styles.rightIcon} 
            onPress={togglePasswordVisibility}
          >
            <Text style={styles.passwordToggle}>
              {isPasswordVisible ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helper && !error && <Text style={styles.helperText}>{helper}</Text>}
    </View>
  );
};

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: Spacing.md,
    } as ViewStyle,

    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: BorderRadius.md,
      backgroundColor: colors.surface,
    } as ViewStyle,

    default: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: 'transparent',
    } as ViewStyle,

    outlined: {
      borderWidth: 1,
      borderColor: colors.border,
      ...Shadows.xs,
    } as ViewStyle,

    filled: {
      backgroundColor: colors.backgroundDark,
      ...Shadows.xs,
    } as ViewStyle,

    sm: {
      minHeight: 36,
      paddingHorizontal: Spacing.md,
    } as ViewStyle,

    md: {
      minHeight: 44,
      paddingHorizontal: Spacing.md,
    } as ViewStyle,

    lg: {
      minHeight: 52,
      paddingHorizontal: Spacing.lg,
    } as ViewStyle,

    focused: {
      borderColor: colors.primary,
      borderWidth: 2,
      ...Shadows.sm,
    } as ViewStyle,

    error: {
      borderColor: colors.error,
    } as ViewStyle,

    input: {
      flex: 1,
      ...Typography.body,
      color: colors.text,
    } as TextStyle,

    inputWithLeftIcon: {
      marginLeft: Spacing.sm,
    } as TextStyle,

    inputWithRightIcon: {
      marginRight: Spacing.sm,
    } as TextStyle,

    leftIcon: {
      marginRight: Spacing.sm,
    } as ViewStyle,

    rightIcon: {
      marginLeft: Spacing.sm,
    } as ViewStyle,

    passwordToggle: {
      fontSize: 16,
    } as TextStyle,

    label: {
      ...Typography.label,
      color: colors.text,
      marginBottom: Spacing.xs,
    } as TextStyle,

    errorText: {
      ...Typography.footnote,
      color: colors.error,
      marginTop: Spacing.xs,
    } as TextStyle,

    helperText: {
      ...Typography.footnote,
      color: colors.textMuted,
      marginTop: Spacing.xs,
    } as TextStyle,
  });

export default Input;
