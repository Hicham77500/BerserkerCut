import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
  Shadows,
} from '../utils/theme';

type IOSButtonVariant = 'primary' | 'secondary' | 'ghost';

interface IOSButtonProps extends PressableProps {
  label: string;
  variant?: IOSButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  align?: 'center' | 'leading';
}

export const IOSButton: React.FC<IOSButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  align = 'center',
  style: styleProp,
  ...rest
}) => {
  const labelColor = variant === 'ghost' ? Colors.primary : Colors.text;
  const contentAlignment =
    align === 'leading' ? styles.contentLeading : styles.contentCenter;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      onPress={loading ? undefined : onPress}
      style={(state) => {
        const { pressed } = state;
        const resolvedExternalStyle =
          typeof styleProp === 'function' ? styleProp(state) : styleProp;

        return [
          styles.base,
          styles[variant],
          (disabled || loading) && styles.disabled,
          fullWidth && styles.fullWidth,
          pressed && !disabled && !loading && styles.pressed,
          resolvedExternalStyle,
        ];
      }}
      {...rest}
    >
      <View style={[styles.content, contentAlignment]}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[Typography.button, styles.label, { color: labelColor }]}>
          {label}
        </Text>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'ghost' ? Colors.primary : Colors.text}
            style={styles.loader}
          />
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    // Use standardized border radius and spacing from design system
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
    justifyContent: 'center',
    ...Shadows.sm,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: Colors.overlayLight,
    borderWidth: 1,
    borderColor: 'transparent', // Improved for better appearance
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95, // Slight opacity change for better feedback
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentCenter: {
    justifyContent: 'center',
  },
  contentLeading: {
    justifyContent: 'flex-start',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  label: {
    textAlign: 'center',
  },
  loader: {
    marginLeft: Spacing.sm,
  },
});
