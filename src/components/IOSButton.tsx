/**
 * Module: src/components/IOSButton.tsx
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
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
  Spacing,
  Typography,
  Shadows,
  ThemePalette,
} from '../utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';

type IOSButtonVariant = 'primary' | 'secondary' | 'ghost';

interface IOSButtonProps extends PressableProps {
  label: string;
  variant?: IOSButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  align?: 'center' | 'leading';
}

/**
 * Composant: IOSButton
 * Utilite: Gere le rendu UI et les interactions utilisateur de cet ecran/composant.
 */
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
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const labelColor = variant === 'ghost' ? colors.primary : colors.text;
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
            color={variant === 'ghost' ? colors.primary : colors.text}
            style={styles.loader}
          />
        ) : null}
      </View>
    </Pressable>
  );
};

/**
 * Fonction: createStyles
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    base: {
      borderRadius: BorderRadius.xl,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      minHeight: 48,
      justifyContent: 'center',
      ...Shadows.sm,
    },
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: colors.overlayLight,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    disabled: {
      opacity: 0.6,
    },
    pressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.95,
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
