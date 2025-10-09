import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../utils/theme';

interface IOSCheckboxProps extends Omit<PressableProps, 'onPress'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const IOSCheckbox: React.FC<IOSCheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  style: styleProp,
  ...rest
}) => {
  const handlePress = () => {
    if (disabled) return;
    onChange(!checked);
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      onPress={handlePress}
      style={(state) => {
        const { pressed } = state;
        const resolvedExternalStyle =
          typeof styleProp === 'function' ? styleProp(state) : styleProp;

        return [
          styles.container,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
          resolvedExternalStyle,
        ];
      }}
      {...rest}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      {(label || description) && (
        <View style={styles.textContainer}>
          {label ? (
            <Text style={[Typography.body, styles.label]}>{label}</Text>
          ) : null}
          {description ? (
            <Text style={[Typography.bodySmall, styles.description]}>
              {description}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark ?? Colors.surface,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  textContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  label: {
    color: Colors.text,
  },
  description: {
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
});
