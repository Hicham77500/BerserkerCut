/**
 * Module: src/components/ProgressBar.tsx
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Spacing, Typography, ThemePalette } from '../utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';

type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  progress: number;
  size?: ProgressSize;
  label?: string;
  showLabel?: boolean;
  trackColor?: string;
  indicatorColor?: string;
  animated?: boolean;
}

/**
 * Fonction: clampProgress
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const clampProgress = (value: number): number => {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
};

/**
 * Composant: ProgressBar
 * Utilite: Gere le rendu UI et les interactions utilisateur de cet ecran/composant.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  label,
  showLabel = true,
  trackColor,
  indicatorColor,
  animated = true,
}) => {
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const clamped = useMemo(() => clampProgress(progress), [progress]);
  const animatedValue = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    if (!animated) {
      animatedValue.setValue(clamped);
      return;
    }

    Animated.timing(animatedValue, {
      toValue: clamped,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [animated, animatedValue, clamped]);

  const widthInterpolation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Standardized height values based on size
  const height =
    size === 'sm' ? 4 : size === 'lg' ? 16 : 8;

  const resolvedTrackColor = trackColor ?? (colors.surfaceDark ?? colors.surface);
  const resolvedIndicatorColor = indicatorColor ?? colors.primary;

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.header}>
          <Text style={[Typography.caption, styles.label]}>
            {label ?? `${Math.round(clamped * 100)} %`}
          </Text>
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: resolvedTrackColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: resolvedIndicatorColor,
              width: widthInterpolation,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
};

/**
 * Fonction: createStyles
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const createStyles = (colors: ThemePalette) => StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    color: colors.textLight,
    letterSpacing: 0.4, // iOS-optimized letter spacing
  },
  track: {
    width: '100%',
    borderRadius: BorderRadius.sm, // Changed to more appropriate size
    overflow: 'hidden',
  },
  indicator: {
    borderRadius: BorderRadius.sm, // Matching track radius
  },
});

