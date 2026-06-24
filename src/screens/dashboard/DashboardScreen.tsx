import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useThemeMode } from '@/hooks/useThemeMode';
import { BorderRadius, Spacing, Typography } from '@/utils/theme';
import {
  DashboardHeader,
  QuickActions,
  DailyMetricsGraph,
  SupplementCarousel,
} from '@/components';

const createDashboardData = (objective: string) => ({
  calories: { consumed: 1450, target: 2200 },
  proteins: { consumed: 132, target: 180 },
  water: { consumed: 2.0, target: 3.0 },
  supplements: { taken: 3, total: 5 },
  weight: { current: 92.4, weeklyVariation: -0.6 },
  objectiveLabel:
    objective === 'cutting' ? 'Sèche' : objective === 'recomposition' ? 'Recomposition' : 'Maintenance',
});

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useThemeMode();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const dashboard = createDashboardData(user?.profile.objective ?? 'cutting');
  const name = user?.profile.name?.trim() || 'Hicham';
  const compact = width <= 375 || height <= 720;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top > 0 ? Spacing.md : Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl * 2,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader name={name} objectiveLabel={dashboard.objectiveLabel} compact={compact} />

        <QuickActions
          onAddMeal={() => {}}
          onAddWeight={() => {}}
          onAddWater={() => {}}
          compact={compact}
        />

        <DailyMetricsGraph
          currentWeight={dashboard.weight.current}
          weeklyVariation={dashboard.weight.weeklyVariation}
          calories={dashboard.calories}
          proteins={dashboard.proteins}
          water={dashboard.water}
          compact={compact}
        />

        <SupplementCarousel compact={compact} />

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Comment se passe ma journée aujourd'hui ?</Text>
          <Text style={styles.footerText}>
            Vue Tracker V1: capture quotidienne avant tout conseil, score ou analyse.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: Spacing.lg,
      gap: Spacing.md,
      paddingBottom: Spacing.xl * 2,
    },
    footer: {
      marginTop: Spacing.sm,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.overlay,
      padding: Spacing.lg,
      gap: Spacing.xs,
    },
    footerTitle: {
      ...Typography.h4,
      color: colors.text,
    },
    footerText: {
      ...Typography.bodySmall,
      color: colors.textLight,
    },
  });