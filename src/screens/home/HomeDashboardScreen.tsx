import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { usePlan } from '@/hooks/usePlan';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Card, IOSButton, ProgressBar } from '@/components';
import DesignSystem from '@/utils/designSystem';
import { Typography, Spacing, ThemePalette } from '@/utils/theme';

export const HomeDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { currentPlan, loading, supplementProgress } = usePlan();
  const name = user?.profile?.name?.trim() || user?.email?.split('@')[0] || 'Athlète';
  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const { colors } = useThemeMode();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const caloriesTarget = currentPlan?.nutritionPlan.totalCalories
    ? `${currentPlan.nutritionPlan.totalCalories} kcal`
    : '—';
  const trainingType =
    currentPlan?.dayType === 'training'
      ? 'Séance prévue'
      : currentPlan?.dayType === 'cheat'
        ? 'Jour libre'
        : 'Jour de repos';

  const macros = currentPlan?.nutritionPlan.macros;
  const macroTotal = macros ? macros.protein + macros.carbs + macros.fat : 0;

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour {name}</Text>
            <Text style={styles.subheading}>{formattedDate}</Text>
          </View>
          <IOSButton
            label="Profil"
            variant="ghost"
            align="leading"
            onPress={() =>
              navigation.navigate('ProfileStack' as never, { screen: 'Profil' } as never)
            }
          />
        </View>

        <View style={styles.cardsWrapper}>
          <Card style={styles.card}>
            <Text style={styles.cardLabel}>Plan du jour</Text>
            <Text style={styles.cardTitle}>
              {loading ? 'Chargement…' : trainingType}
            </Text>
            <Text style={styles.cardDescription}>
              {currentPlan?.dailyTip ??
                'Restez hydraté et gardez un œil sur votre fréquence cardiaque.'}
            </Text>
            <IOSButton
              label={currentPlan?.dayType === 'rest' ? 'Préparer demain' : 'Voir ma séance'}
              onPress={() =>
                navigation.navigate(
                  'ProfileStack' as never,
                  { screen: 'Entraînement' } as never,
                )
              }
              variant="primary"
              align="leading"
            />
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardLabel}>Nutrition</Text>
            <Text style={styles.cardTitle}>{caloriesTarget}</Text>
            {macros ? (
              <View style={styles.macros}>
                {([
                  { key: 'Protéines', value: macros.protein, color: colors.protein },
                  { key: 'Glucides', value: macros.carbs, color: colors.carbs },
                  { key: 'Lipides', value: macros.fat, color: colors.fat },
                ] as const).map((macro) => (
                  <View key={macro.key} style={styles.macroRow}>
                    <View style={styles.macroHeader}>
                      <Text style={styles.macroLabel}>{macro.key}</Text>
                      <Text style={styles.macroValue}>{macro.value} g</Text>
                    </View>
                    <ProgressBar
                      progress={macroTotal ? macro.value / macroTotal : 0}
                      indicatorColor={macro.color}
                      trackColor={colors.overlayLight}
                      size="sm"
                      showLabel={false}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.cardDescription}>
                Configurez vos macros pour activer le suivi.
              </Text>
            )}
            <IOSButton
              label="Adapter mon plan"
              variant="ghost"
              align="leading"
              onPress={() => navigation.navigate('NutritionStack' as never)}
            />
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardLabel}>Suppléments</Text>
            <Text style={styles.cardTitle}>
              {loading
                ? 'Synchronisation…'
                : `${Math.max(
                    supplementProgress.total - supplementProgress.completed,
                    0,
                  )}/${supplementProgress.total} à prendre`}
            </Text>
            <Text style={styles.cardDescription}>
              Suivez votre checklist pour optimiser vos performances.
            </Text>
            <IOSButton
              label="Ouvrir la checklist"
              align="leading"
              variant="secondary"
              onPress={() =>
                navigation.navigate(
                  'ProfileStack' as never,
                  { screen: 'Suppléments' } as never,
                )
              }
            />
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardLabel}>Profil santé</Text>
            <Text style={styles.cardTitle}>
              {user?.profile?.objective === 'recomposition'
                ? 'Recomposition'
                : user?.profile?.objective === 'maintenance'
                  ? 'Maintien'
                  : 'Sèche'}
            </Text>
            <Text style={styles.cardDescription}>
              Actualisez vos paramètres corporels pour garder un plan cohérent.
            </Text>
            <IOSButton
              label="Mettre à jour"
              align="leading"
              onPress={() =>
                navigation.navigate(
                  'ProfileStack' as never,
                  { screen: 'Profil santé' } as never,
                )
              }
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: DesignSystem.layout.screenPadding,
      paddingTop: DesignSystem.layout.screenPadding,
      paddingBottom: DesignSystem.layout.screenPadding,
      gap: DesignSystem.layout.sectionGap,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    greeting: {
      ...Typography.h1,
      color: colors.text,
    },
    subheading: {
      ...Typography.body,
      color: colors.textLight,
      textTransform: 'capitalize',
    },
    card: {
      gap: Spacing.md,
      backgroundColor: colors.surface,
      borderRadius: DesignSystem.components.card.borderRadius,
      padding: DesignSystem.components.card.padding,
    },
    cardsWrapper: {
      gap: DesignSystem.layout.contentGap,
    },
    cardLabel: {
      ...Typography.caption,
      textTransform: 'uppercase',
      color: colors.textLight,
    },
    cardTitle: {
      ...Typography.h2,
      color: colors.text,
    },
    cardDescription: {
      ...Typography.body,
      color: colors.textLight,
    },
    macros: {
      gap: Spacing.sm,
    },
    macroRow: {
      gap: Spacing.xs,
    },
    macroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    macroLabel: {
      ...Typography.bodySmall,
      color: colors.textLight,
    },
    macroValue: {
      ...Typography.bodySmall,
      color: colors.text,
    },
  });

export default HomeDashboardScreen;
