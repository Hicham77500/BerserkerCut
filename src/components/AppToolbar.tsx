import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModeBadge } from '@/components/ModeBadge';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Spacing, Typography, BorderRadius } from '@/utils/theme';

export const AppToolbar: React.FC = () => {
  const { colors } = useThemeMode();

  const handleOpenDrawer = useCallback(() => {
    if (typeof global !== 'undefined' && global.navigation?.openDrawer) {
      global.navigation.openDrawer();
    }
  }, []);

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
        <TouchableOpacity 
          onPress={handleOpenDrawer}
          style={styles.menuButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.menuIcon, { color: colors.text }]}>☰</Text>
        </TouchableOpacity>
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
    flex: 1,
    justifyContent: 'center',
  },
  brand: {
    ...Typography.h3,
  },
  badge: {
    borderRadius: BorderRadius.sm,
  },
  placeholder: {
    width: 24,
    height: 24,
  },
  menuButton: {
    padding: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default AppToolbar;
