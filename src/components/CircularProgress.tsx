import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../utils/theme';

interface CircularProgressProps {
  progress: number; // 0 - 1
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  trackColor = Colors.overlayLight,
  progressColor = Colors.primary,
  children,
}) => {
  const { radius, circumference, dashOffset } = useMemo(() => {
    const clamped = Math.min(1, Math.max(0, progress));
    const computedRadius = (size - strokeWidth) / 2;
    const computedCircumference = 2 * Math.PI * computedRadius;
    const computedOffset = computedCircumference - computedCircumference * clamped;
    return {
      radius: computedRadius,
      circumference: computedCircumference,
      dashOffset: computedOffset,
    };
  }, [progress, size, strokeWidth]);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          stroke={trackColor}
          fill="transparent"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={progressColor}
          fill="transparent"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.centerContent}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CircularProgress;
