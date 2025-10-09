import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../utils/theme';

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

const clampProgress = (value: number): number => {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  label,
  showLabel = true,
  trackColor = Colors.surfaceDark ?? Colors.surface,
  indicatorColor = Colors.primary,
  animated = true,
}) => {
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
            backgroundColor: trackColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: indicatorColor,
              width: widthInterpolation,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    color: Colors.textLight,
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

