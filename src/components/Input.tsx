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
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../utils/theme';

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
          placeholderTextColor={Colors.textMuted}
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

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  } as ViewStyle,

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  } as ViewStyle,

  // Variants with improved iOS styling
  default: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'transparent',
  } as ViewStyle,

  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.xs, // Subtle shadow for depth
  } as ViewStyle,

  filled: {
    backgroundColor: Colors.backgroundDark,
    ...Shadows.xs, // Subtle shadow for depth
  } as ViewStyle,

  // Sizes with iOS standards
  sm: {
    minHeight: 36,
    paddingHorizontal: Spacing.md, // Increased for better touch targets
  } as ViewStyle,

  md: {
    minHeight: 44, // iOS standard height
    paddingHorizontal: Spacing.md,
  } as ViewStyle,

  lg: {
    minHeight: 52, // iOS larger input
    paddingHorizontal: Spacing.lg,
  } as ViewStyle,

  // States with improved transitions
  focused: {
    borderColor: Colors.primary,
    borderWidth: 2,
    ...Shadows.sm, // Enhanced shadow when focused
  } as ViewStyle,

  error: {
    borderColor: Colors.error,
  } as ViewStyle,

  // Input
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  } as TextStyle,

  inputWithLeftIcon: {
    marginLeft: Spacing.sm,
  } as TextStyle,

  inputWithRightIcon: {
    marginRight: Spacing.sm,
  } as TextStyle,

  // Icons
  leftIcon: {
    marginRight: Spacing.sm,
  } as ViewStyle,

  rightIcon: {
    marginLeft: Spacing.sm,
  } as ViewStyle,

  passwordToggle: {
    fontSize: 16,
  } as TextStyle,

  // Labels and helpers with iOS-optimized typography
  label: {
    ...Typography.label, // Using our new iOS-specific label style
    color: Colors.text,
    marginBottom: Spacing.xs,
  } as TextStyle,

  errorText: {
    ...Typography.footnote, // Using our new iOS-specific footnote style
    color: Colors.error,
    marginTop: Spacing.xs,
  } as TextStyle,

  helperText: {
    ...Typography.footnote, // Using our new iOS-specific footnote style
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  } as TextStyle,
});

export default Input;
