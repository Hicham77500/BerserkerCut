import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Button } from '../../components';
import { Typography, Spacing, BorderRadius, ThemePalette } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { DailyPlan } from '../../types';
import { PLAN_RANGE_CACHE_KEY, PlanService } from '../../services/plan';
import { useThemeMode } from '../../hooks/useThemeMode';

interface CalendarEntry {
  date: Date;
  label: string;
  isToday: boolean;
  calories?: number;
  state: 'planned' | 'missing' | 'rest';
  tip?: string;
}

const DAYS_TO_DISPLAY = 7;

const toIsoDate = (date: Date): string => date.toISOString().split('T')[0];

const parseCachedPlans = (raw: string | null): DailyPlan[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.plans) {
      return [];
    }
    return parsed.plans.map((plan: any) => ({
      ...plan,
      date: new Date(plan.date),
      createdAt: new Date(plan.createdAt),
    }));
  } catch (error) {
    console.warn('[NutritionCalendarScreen] parse cache error', error);
    return [];
  }
};

const buildEntries = (startDate: Date, plans: DailyPlan[]): CalendarEntry[] => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: DAYS_TO_DISPLAY }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const iso = toIsoDate(current);
    const plan = plans.find((candidate) => toIsoDate(candidate.date) === iso);

    return {
      date: current,
      label: current.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: '2-digit',
      }),
      isToday: index === 0,
      calories: plan?.nutritionPlan?.totalCalories,
      tip: plan?.dailyTip,
      state: plan ? plan.dayType === 'rest' ? 'rest' : 'planned' : 'missing',
    };
  });
};

export const NutritionCalendarScreen: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useThemeMode();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const refresh = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const from = toIsoDate(today);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + (DAYS_TO_DISPLAY - 1));
      const to = toIsoDate(endDate);

      const plans = await PlanService.getPlansRange(user.id, from, to);
      setEntries(buildEntries(today, plans));
      setLastSync(new Date().toISOString());
    } catch (err) {
      console.warn('[NutritionCalendarScreen] refresh error', err);
      setError('Connexion impossible (TODO backend). Affichage des données locales.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, today]);

  useEffect(() => {
    (async () => {
      const cached = await AsyncStorage.getItem(PLAN_RANGE_CACHE_KEY);
      if (cached) {
        const cachedPlans = parseCachedPlans(cached);
        setEntries(buildEntries(today, cachedPlans));
        try {
          const { updatedAt } = JSON.parse(cached);
          if (updatedAt) {
            setLastSync(updatedAt);
          }
        } catch (error) {
          console.warn('[NutritionCalendarScreen] updatedAt parse error', error);
        }
      }
      await refresh();
    })();
  }, [refresh, today]);

  const lastSyncLabel = useMemo(() => {
    if (!lastSync) return null;
    try {
      const date = new Date(lastSync);
      return date.toLocaleString('fr-FR', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
      });
    } catch {
      return lastSync;
    }
  }, [lastSync]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        <Card style={styles.card}>
          <Text style={styles.title}>Planning nutritionnel – semaine</Text>
          <Text style={styles.subtitle}>
            Cette vue reflète les plans retournés par le service. Sans backend disponible, un mock local est utilisé.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {lastSyncLabel ? <Text style={styles.metaText}>Dernière sync : {lastSyncLabel}</Text> : null}

          <View style={styles.weekRow}>
            {entries.map((entry) => (
              <View
                key={entry.date.toISOString()}
                style={[
                  styles.dayCard,
                  entry.state === 'planned' ? styles.dayCardPlanned : undefined,
                  entry.state === 'rest' ? styles.dayCardRest : undefined,
                  entry.state === 'missing' ? styles.dayCardMissing : undefined,
                  entry.isToday && styles.dayCardToday,
                ]}
              >
                <Text style={styles.dayLabel}>{entry.label}</Text>
                <Text style={styles.dayCalories}>
                  {entry.calories ? `${entry.calories} kcal` : 'À définir'}
                </Text>
                {entry.tip ? <Text style={styles.dayTip}>{entry.tip}</Text> : null}
              </View>
            ))}
          </View>

          <Button
            title={loading ? 'Mise à jour…' : 'Mettre à jour'}
            onPress={refresh}
            loading={loading}
            fullWidth
            style={styles.refreshButton}
          />
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
    content: {
      flexGrow: 1,
      padding: Spacing.lg,
      gap: Spacing.lg,
    },
    card: {
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.surface,
      gap: Spacing.md,
    },
    title: {
      ...Typography.h2,
    },
    subtitle: {
      ...Typography.bodySmall,
      color: colors.textLight,
    },
    weekRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    dayCard: {
      flexBasis: '30%',
      minHeight: 80,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      justifyContent: 'space-between',
    },
    dayCardPlanned: {
      backgroundColor: colors.secondary,
    },
    dayCardRest: {
      backgroundColor: colors.secondaryLight,
    },
    dayCardMissing: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dayCardToday: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    dayLabel: {
      ...Typography.caption,
      color: colors.text,
    },
    dayCalories: {
      ...Typography.bodySmall,
      color: colors.textLight,
    },
    dayTip: {
      ...Typography.caption,
      color: colors.textLight,
    },
    errorText: {
      ...Typography.bodySmall,
      color: colors.error,
    },
    metaText: {
      ...Typography.caption,
      color: colors.textLight,
    },
    refreshButton: {
      marginTop: Spacing.md,
    },
  });

export default NutritionCalendarScreen;
