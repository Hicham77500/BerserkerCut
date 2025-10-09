import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModeBadge } from '@/components/ModeBadge';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Spacing, Typography, BorderRadius } from '@/utils/theme';

export const AppToolbar: React.FC = () => {
  const { colors } = useThemeMode();

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.leftGroup}>
          <ModeBadge style={styles.badge} />
          <Text style={[styles.brand, { color: colors.text }]}>BerserkerCut</Text>
        </View>
        <View style={styles.placeholder} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brand: {
    ...Typography.h3,
  },
  badge: {
    borderRadius: BorderRadius.sm,
  },
  placeholder: {
    width: 1,
    height: 1,
  },
});

export default AppToolbar;
