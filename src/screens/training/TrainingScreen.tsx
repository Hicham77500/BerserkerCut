import React, { useMemo } from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePlan } from '../../hooks/usePlan';
import { useAuth } from '../../hooks/useAuth';
import { Colors, Typography, Spacing, BorderRadius } from '../../utils/theme';
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

const formatDuration = (duration?: number) => {
  if (!duration) {
    return 'À planifier';
  }
  return `${duration} min`;
};

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

export const TrainingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentPlan, weeklySchedule } = usePlan();
  const { user } = useAuth();

  const trainingProfile = user?.profile?.training;

  const todaysTraining = useMemo(() => {
    if (!trainingProfile) return null;
    const today = new Date().getDay();
    return trainingProfile.trainingDays.find((day) => day.dayOfWeek === today) ?? null;
  }, [trainingProfile]);

  const todayIsTrainingDay = currentPlan?.dayType === 'training' && Boolean(todaysTraining);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Séance du jour</Text>
          {todayIsTrainingDay && todaysTraining ? (
            <View style={styles.sessionContainer}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionType}>
                  {SESSION_TYPE_LABELS[todaysTraining.type] ?? 'Séance programmée'}
                </Text>
                <Text style={styles.sessionDuration}>
                  {`Durée : ${formatDuration(todaysTraining.duration)}`}
                </Text>
              </View>
              <Text style={styles.sessionSlot}>
                {`Heure prévue : ${formatStartTime(todaysTraining)}`}
              </Text>
              <Text style={styles.sessionTip}>
                {currentPlan?.dailyTip ??
                  'Préparez votre échauffement et pensez à vous hydrater avant la séance.'}
              </Text>
            </View>
          ) : (
            <View style={styles.sessionContainer}>
              <Text style={styles.sessionType}>Jour de récupération</Text>
              <Text style={styles.sessionTip}>
                Profitez de cette journée pour vous reposer et optimiser la récupération musculaire.
              </Text>
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
                    day.isTrainingDay && styles.weekRowActive,
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: DesignSystem.layout.screenPadding,
    paddingVertical: DesignSystem.layout.sectionGap,
    gap: DesignSystem.layout.sectionGap,
  },
  card: {
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
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
    color: Colors.text,
  },
  sessionDuration: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  sessionSlot: {
    ...Typography.body,
    color: Colors.textLight,
  },
  sessionTip: {
    ...Typography.body,
    color: Colors.textLight,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  weekRowToday: {
    borderColor: Colors.primary,
  },
  weekRowActive: {
    backgroundColor: Colors.surfaceDark ?? Colors.surface,
  },
  weekRowInfo: {
    flex: 1,
  },
  weekDayLabel: {
    ...Typography.body,
    color: Colors.text,
  },
  weekDaySubtitle: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  weekRowMeta: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  weekRowTime: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  weekRowDuration: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  weekRowRest: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
});

export default TrainingScreen;
