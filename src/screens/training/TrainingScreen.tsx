/**
 * Module: src/screens/training/TrainingScreen.tsx
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
import React, { useMemo } from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePlan } from '../../hooks/usePlan';
import { useAuth } from '../../hooks/useAuth';
import { useThemeMode } from '../../hooks/useThemeMode';
import { Typography, Spacing, BorderRadius, ThemePalette } from '../../utils/theme';
import { Card, IOSButton } from '../../components';
import DesignSystem from '../../utils/designSystem';
import { TrainingDay } from '../../types';

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: 'Matin (6h - 10h)',
  afternoon: 'Après-midi (12h - 16h)',
  evening: 'Soir (18h - 22h)',
};

const SESSION_TYPE_LABELS: Record<string, string> = {
  strength: 'Musculation',
  cardio: 'Cardio',
  mixed: 'Mixte',
  rest: 'Repos',
  active_recovery: 'Repos actif',
};

/**
 * Fonction: formatDuration
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const formatDuration = (duration?: number) => {
  if (!duration) {
    return 'À planifier';
  }
  return `${duration} min`;
};

/**
 * Fonction: formatStartTime
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const formatStartTime = (training?: TrainingDay | null) => {
  if (!training) {
    return 'À planifier';
  }

  if (training.startTime) {
    return training.startTime;
  }

  if (training.timeSlot) {
    return TIME_SLOT_LABELS[training.timeSlot] ?? 'À planifier';
  }

  return 'À planifier';
};

/**
 * Composant: TrainingScreen
 * Utilite: Gere le rendu UI et les interactions utilisateur de cet ecran/composant.
 */
export const TrainingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentPlan, weeklySchedule } = usePlan();
  const { user } = useAuth();
  const { colors } = useThemeMode();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const trainingProfile = user?.profile?.training;

  const todaysTraining = useMemo(() => {
    if (!trainingProfile) return null;
    const today = new Date().getDay();
    return trainingProfile.trainingDays.find((day) => day.dayOfWeek === today) ?? null;
  }, [trainingProfile]);

  const todayIsTrainingDay = currentPlan?.dayType === 'training' && Boolean(todaysTraining);

  const sessionTone = todayIsTrainingDay ? colors.primary : colors.accent;

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={[styles.card, styles.heroCard]}>
          <Text style={styles.sectionTitle}>Séance du jour</Text>
          {todayIsTrainingDay && todaysTraining ? (
            <View style={styles.sessionContainer}>
              <View style={styles.sessionHeader}>
                <Text style={[styles.sessionType, { color: sessionTone }]}>
                  {SESSION_TYPE_LABELS[todaysTraining.type] ?? 'Séance programmée'}
                </Text>
                <Text style={styles.sessionDuration}>
                  {`Durée : ${formatDuration(todaysTraining.duration)}`}
                </Text>
              </View>
              <Text style={styles.sessionSlot}>
                {`Heure prévue : ${formatStartTime(todaysTraining)}`}
              </Text>
              <View style={styles.tipBox}>
                <Text style={styles.sessionTip}>
                  {currentPlan?.dailyTip ??
                    'Préparez votre échauffement et pensez à vous hydrater avant la séance.'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.sessionContainer}>
              <Text style={[styles.sessionType, { color: sessionTone }]}>Jour de récupération</Text>
              <View style={styles.tipBox}>
                <Text style={styles.sessionTip}>
                  Profitez de cette journée pour vous reposer et optimiser la récupération musculaire.
                </Text>
              </View>
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.weekHeader}>
            <Text style={styles.sectionTitle}>Planning hebdomadaire</Text>
            <IOSButton
              label="Modifier"
              variant="ghost"
              align="leading"
              onPress={() =>
                navigation.navigate('ProfileStack' as never, { screen: 'Entraînement' } as never)
              }
              accessibilityLabel="Modifier les préférences d'entraînement"
            />
          </View>

          {weeklySchedule.length === 0 ? (
            <Text style={styles.emptyText}>
              Configurez vos préférences d’entraînement pour générer un planning personnalisé.
            </Text>
          ) : (
            <View style={styles.weekList}>
              {weeklySchedule.map((day) => (
                <View
                  key={day.label}
                  style={[
                    styles.weekRow,
                    day.isToday && styles.weekRowToday,
                    day.isTrainingDay ? styles.weekRowActive : styles.weekRowRestCard,
                  ]}
                >
                  <View style={styles.weekRowInfo}>
                    <Text style={styles.weekDayLabel}>
                      {day.label}
                      {day.isToday ? ' • Aujourd’hui' : ''}
                    </Text>
                    <Text style={styles.weekDaySubtitle}>
                      {day.isTrainingDay && day.training
                        ? SESSION_TYPE_LABELS[day.training.type] ?? 'Séance programmée'
                        : 'Repos'}
                    </Text>
                  </View>
                  {day.isTrainingDay && day.training ? (
                    <View style={styles.weekRowMeta}>
                      <Text style={styles.weekRowTime}>
                        {`Heure : ${formatStartTime(day.training)}`}
                      </Text>
                      <Text style={styles.weekRowDuration}>
                        {`Durée : ${formatDuration(day.training.duration)}`}
                      </Text>
                    </View>
                  ) : (
                      <Text style={styles.weekRowRest}>Récupération</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Fonction: createStyles
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const createStyles = (colors: ThemePalette) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.secondaryBackground,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: DesignSystem.layout.screenPadding,
    paddingVertical: DesignSystem.layout.sectionGap,
    gap: DesignSystem.layout.sectionGap,
    backgroundColor: colors.secondaryBackground,
  },
  card: {
    gap: Spacing.md,
  },
  heroCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    ...Typography.h3,
    color: colors.text,
  },
  sessionContainer: {
    gap: Spacing.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionType: {
    ...Typography.h2,
    color: colors.text,
  },
  sessionDuration: {
    ...Typography.bodySmall,
    color: colors.textLight,
  },
  sessionSlot: {
    ...Typography.body,
    color: colors.textLight,
  },
  tipBox: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionTip: {
    ...Typography.body,
    color: colors.text,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekList: {
    gap: Spacing.sm,
  },
  weekRow: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  weekRowToday: {
    borderColor: colors.primary,
  },
  weekRowActive: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary + '45',
  },
  weekRowRestCard: {
    backgroundColor: colors.surface,
  },
  weekRowInfo: {
    flex: 1,
  },
  weekDayLabel: {
    ...Typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  weekDaySubtitle: {
    ...Typography.bodySmall,
    color: colors.textLight,
    marginTop: Spacing.xs,
  },
  weekRowMeta: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  weekRowTime: {
    ...Typography.bodySmall,
    color: colors.text,
  },
  weekRowDuration: {
    ...Typography.caption,
    color: colors.textLight,
  },
  weekRowRest: {
    ...Typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  emptyText: {
    ...Typography.bodySmall,
    color: colors.textLight,
  },
});

export default TrainingScreen;
