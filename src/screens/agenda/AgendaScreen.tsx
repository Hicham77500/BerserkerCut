/**
 * Module: src/screens/agenda/AgendaScreen.tsx
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, IOSButton } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { usePlan } from '@/hooks/usePlan';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Spacing, ThemePalette, Typography, BorderRadius } from '@/utils/theme';
import { WeeklyTrainingSession } from '@/types';

const WEEK_PROGRESS_STORAGE_KEY = 'BERSERKERCUT_AGENDA_WEEK_PROGRESS_V1';
const WEEKDAY_SHORT_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const WEEKDAY_FULL_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const ESTIMATED_BURN_PER_MINUTE = {
  strength: 8,
  cardio: 10,
  mixed: 9,
  active_recovery: 4,
  rest: 0,
} as const;

type DayProgressMap = Record<number, boolean>;

const getWeekStart = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const mondayIndex = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - mondayIndex);
  return next;
};

const getWeekStorageKey = (userId: string, weekStart: Date): string => {
  return `${WEEK_PROGRESS_STORAGE_KEY}:${userId}:${weekStart.toISOString().split('T')[0]}`;
};

const estimateBurnedCalories = (day: WeeklyTrainingSession): number => {
  if (!day.isTrainingDay || !day.training) {
    return 0;
  }

  const duration = day.training.duration ?? 45;
  const intensity = ESTIMATED_BURN_PER_MINUTE[day.training.type] ?? ESTIMATED_BURN_PER_MINUTE.mixed;
  return Math.round(duration * intensity);
};

const formatWeekday = (date: Date): string =>
  date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
  });

const initialProgress = (days: WeeklyTrainingSession[]): DayProgressMap =>
  days.reduce<DayProgressMap>((acc, day) => {
    if (day.isTrainingDay) {
      acc[day.dayOfWeek] = false;
    }
    return acc;
  }, {});

export const AgendaScreen: React.FC = () => {
  const { user } = useAuth();
  const { currentPlan, weeklySchedule } = usePlan();
  const { colors } = useThemeMode();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [progress, setProgress] = useState<DayProgressMap>({});
  const [loading, setLoading] = useState(true);

  const weekStart = useMemo(() => getWeekStart(new Date()), []);
  const storageKey = useMemo(() => {
    if (!user?.id) return null;
    return getWeekStorageKey(user.id, weekStart);
  }, [user?.id, weekStart]);

  useEffect(() => {
    let mounted = true;

    const hydrateProgress = async () => {
      if (!storageKey) {
        if (mounted) {
          setProgress(initialProgress(weeklySchedule));
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        const parsed = stored ? (JSON.parse(stored) as DayProgressMap) : {};
        const defaults = initialProgress(weeklySchedule);
        if (mounted) {
          setProgress({ ...defaults, ...parsed });
        }
      } catch (error) {
        console.warn('[AgendaScreen] hydrate progress error', error);
        if (mounted) {
          setProgress(initialProgress(weeklySchedule));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void hydrateProgress();

    return () => {
      mounted = false;
    };
  }, [storageKey, weeklySchedule]);

  const weekDays = useMemo(
    () =>
      weeklySchedule.map((day) => {
        const completed = Boolean(progress[day.dayOfWeek]);
        return {
          ...day,
          completed,
          burn: estimateBurnedCalories(day),
        };
      }),
    [progress, weeklySchedule],
  );

  const trainingDays = useMemo(() => weekDays.filter((day) => day.isTrainingDay), [weekDays]);
  const completedTrainingDays = useMemo(
    () => trainingDays.filter((day) => day.completed),
    [trainingDays],
  );
  const estimatedBurn = useMemo(
    () => completedTrainingDays.reduce((sum, day) => sum + day.burn, 0),
    [completedTrainingDays],
  );

  const persistProgress = useCallback(
    async (nextProgress: DayProgressMap) => {
      if (!storageKey) return;
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(nextProgress));
      } catch (error) {
        console.warn('[AgendaScreen] persist progress error', error);
      }
    },
    [storageKey],
  );

  const toggleDay = useCallback(
    async (day: WeeklyTrainingSession) => {
      if (!day.isTrainingDay) {
        return;
      }

      const nextProgress = {
        ...progress,
        [day.dayOfWeek]: !progress[day.dayOfWeek],
      };
      setProgress(nextProgress);
      await persistProgress(nextProgress);
    },
    [persistProgress, progress],
  );

  const resetWeek = useCallback(async () => {
    const nextProgress = initialProgress(weeklySchedule);
    setProgress(nextProgress);
    await persistProgress(nextProgress);
  }, [persistProgress, weeklySchedule]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.title}>Semaine d'entraînement</Text>
            <Text style={styles.subtitle}>
              Valide tes séances au fil de la semaine. Les flammes se remplissent quand tu coches tes trainings.
            </Text>
          </View>
          <IOSButton
            label="Réinitialiser"
            variant="ghost"
            align="leading"
            onPress={resetWeek}
            loading={loading}
          />
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Vue rapide</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryValue}>{completedTrainingDays.length}/{trainingDays.length || 0}</Text>
              <Text style={styles.summaryLabel}>séances validées</Text>
            </View>
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryValue}>{estimatedBurn} kcal</Text>
              <Text style={styles.summaryLabel}>brûlées cette semaine</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${trainingDays.length ? Math.round((completedTrainingDays.length / trainingDays.length) * 100) : 0}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.cardDescription}>
            Déplace-toi simplement dans la semaine et tape sur une flamme pour marquer une séance comme faite.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Calendrier hebdo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekScroll}>
            {weekDays.map((day) => {
              const active = day.isTrainingDay && day.completed;
              const flameCount = day.isTrainingDay ? Math.max(1, Math.min(3, Math.round((day.burn || 0) / 200))) : 0;

              return (
                <Pressable
                  key={`${day.dayOfWeek}-${day.date.toISOString()}`}
                  accessibilityRole="button"
                  accessibilityLabel={day.isTrainingDay ? `Valider ${day.label}` : `${day.label} repos`}
                  accessibilityState={{ selected: Boolean(day.completed) }}
                  onPress={() => toggleDay(day)}
                  style={({ pressed }) => [
                    styles.dayCard,
                    day.isToday && styles.dayCardToday,
                    day.isTrainingDay ? styles.dayCardTraining : styles.dayCardRest,
                    active && styles.dayCardCompleted,
                    pressed && styles.dayCardPressed,
                  ]}
                >
                  <Text style={styles.dayShortLabel}>{WEEKDAY_SHORT_LABELS[day.dayOfWeek]}</Text>
                  <Text style={styles.dayDate}>{formatWeekday(day.date)}</Text>
                  <View style={styles.dayIconRow}>
                    {day.isTrainingDay ? (
                      Array.from({ length: flameCount }).map((_, index) => (
                        <Text key={`${day.dayOfWeek}-flame-${index}`} style={[styles.flame, active && styles.flameActive]}>
                          {active ? '🔥' : '🔥'}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.restIcon}>•</Text>
                    )}
                  </View>
                  <Text style={[styles.dayMeta, active && styles.dayMetaActive]}>
                    {day.isTrainingDay
                      ? active
                        ? 'Validé'
                        : `${day.burn} kcal`
                      : 'Repos'}
                  </Text>
                  <Text style={styles.dayHint}>
                    {day.isTrainingDay ? 'Tape pour valider' : 'Récupération'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Semaine active</Text>
          <Text style={styles.cardDescription}>
            {currentPlan?.dailyTip ?? 'Continue à valider tes séances pour garder le cap sur la sèche.'}
          </Text>
        </Card>
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
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: Spacing.lg,
      gap: Spacing.lg,
      paddingBottom: Spacing.xxl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: Spacing.md,
    },
    headerTextGroup: {
      flex: 1,
      gap: Spacing.xs,
    },
    title: {
      ...Typography.h1,
      color: colors.text,
    },
    subtitle: {
      ...Typography.body,
      color: colors.textLight,
    },
    card: {
      gap: Spacing.md,
      padding: Spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
    },
    cardLabel: {
      ...Typography.caption,
      color: colors.textLight,
      textTransform: 'uppercase',
    },
    cardDescription: {
      ...Typography.body,
      color: colors.textLight,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    summaryBlock: {
      flex: 1,
      gap: Spacing.xs,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.secondaryBackground,
    },
    summaryValue: {
      ...Typography.h2,
      color: colors.text,
    },
    summaryLabel: {
      ...Typography.bodySmall,
      color: colors.textLight,
    },
    progressTrack: {
      height: 10,
      borderRadius: 999,
      backgroundColor: colors.border,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: colors.primary,
    },
    weekScroll: {
      gap: Spacing.sm,
      paddingRight: Spacing.sm,
    },
    dayCard: {
      width: 88,
      minHeight: 136,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.sm,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.secondaryBackground,
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    dayCardTraining: {
      backgroundColor: colors.surface,
    },
    dayCardRest: {
      backgroundColor: colors.secondaryBackground,
    },
    dayCardToday: {
      borderColor: colors.primary,
    },
    dayCardCompleted: {
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary,
    },
    dayCardPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.95,
    },
    dayShortLabel: {
      ...Typography.caption,
      color: colors.textLight,
      textTransform: 'uppercase',
    },
    dayDate: {
      ...Typography.bodySmall,
      color: colors.text,
      textAlign: 'center',
    },
    dayIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      minHeight: 34,
      gap: 2,
    },
    flame: {
      fontSize: 18,
      opacity: 0.7,
    },
    flameActive: {
      opacity: 1,
    },
    restIcon: {
      ...Typography.h2,
      color: colors.textLight,
    },
    dayMeta: {
      ...Typography.bodySmall,
      color: colors.textLight,
      fontWeight: '600',
    },
    dayMetaActive: {
      color: colors.primary,
    },
    dayHint: {
      ...Typography.caption,
      color: colors.textLight,
      textAlign: 'center',
    },
  });

export default AgendaScreen;
