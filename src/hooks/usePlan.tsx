import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlanService } from '@/services/plan';
import {
  DailyPlan,
  PlanContextType,
  SupplementPlan,
  SupplementProgress,
  WeeklyTrainingSession,
  TrainingProfile,
  SupplementIntake,
} from '@/types';
import { useAuth } from '@/hooks/useAuth';

const PlanContext = createContext<PlanContextType | undefined>(undefined);

interface PlanProviderProps {
  children: ReactNode;
}

const SUPPLEMENT_STATUS_PREFIX = 'BERSERKERCUT_SUPPLEMENT_STATUS_';
const WEEKDAY_LABELS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DEFAULT_PROGRESS: SupplementProgress = { total: 0, completed: 0, percentage: 0 };

const normalizePlanDates = (plan: DailyPlan): DailyPlan => ({
  ...plan,
  date: plan.date instanceof Date ? plan.date : new Date(plan.date),
  createdAt: plan.createdAt instanceof Date ? plan.createdAt : new Date(plan.createdAt),
});

const deriveStatusFromPlan = (plan: DailyPlan): Record<string, boolean> => {
  const status: Record<string, boolean> = {};
  Object.values(plan.supplementPlan).forEach((supplements) => {
    (supplements as SupplementIntake[]).forEach((supplement) => {
      status[supplement.supplementId] = Boolean(supplement.taken);
    });
  });
  return status;
};

const applyStatusToPlan = (plan: DailyPlan, status: Record<string, boolean>): DailyPlan => {
  const nextPlan: DailyPlan = {
    ...plan,
    supplementPlan: Object.entries(plan.supplementPlan).reduce(
      (acc, [slot, supplements]) => {
        const typedSlot = slot as keyof SupplementPlan;
        const items = supplements as SupplementIntake[];
        acc[typedSlot] = items.map((supplement: SupplementIntake) => ({
          ...supplement,
          taken: status[supplement.supplementId] ?? Boolean(supplement.taken),
        }));
        return acc;
      },
      {} as SupplementPlan,
    ),
  };
  return nextPlan;
};

const computeSupplementProgress = (
  plan: DailyPlan | null,
  status: Record<string, boolean>,
): SupplementProgress => {
  if (!plan) {
    return DEFAULT_PROGRESS;
  }
  const supplements = Object.values(plan.supplementPlan).flat();
  const total = supplements.length;
  if (total === 0) {
    return DEFAULT_PROGRESS;
  }
  const completed = supplements.filter((supplement) => status[supplement.supplementId]).length;
  return {
    total,
    completed,
    percentage: Math.round((completed / total) * 100),
  };
};

const buildWeeklySchedule = (profile?: TrainingProfile): WeeklyTrainingSession[] => {
  if (!profile) return [];

  const today = new Date();
  const currentDay = today.getDay();
  const mondayIndex = (currentDay + 6) % 7;
  const startOfWeek = new Date(today);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(today.getDate() - mondayIndex);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    const dayOfWeek = date.getDay();
    const trainingDay = profile.trainingDays.find((day) => day.dayOfWeek === dayOfWeek);

    return {
      date,
      dayOfWeek,
      label: WEEKDAY_LABELS[dayOfWeek],
      isTrainingDay: Boolean(trainingDay),
      training: trainingDay,
      isToday: dayOfWeek === currentDay,
    };
  });
};

export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supplementStatus, setSupplementStatus] = useState<Record<string, boolean>>({});
  const [supplementProgress, setSupplementProgress] =
    useState<SupplementProgress>(DEFAULT_PROGRESS);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyTrainingSession[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  const mergePlanWithUpdates = useCallback(
    (plan: DailyPlan, updates: Partial<DailyPlan>): DailyPlan => {
      const nextPlan: DailyPlan = {
        ...plan,
        ...updates,
      };

      if (updates.date) {
        nextPlan.date = updates.date instanceof Date ? updates.date : new Date(updates.date);
      }

      if (updates.createdAt) {
        nextPlan.createdAt =
          updates.createdAt instanceof Date ? updates.createdAt : new Date(updates.createdAt);
      }

      if (updates.nutritionPlan) {
        nextPlan.nutritionPlan = {
          ...plan.nutritionPlan,
          ...updates.nutritionPlan,
          macros: updates.nutritionPlan.macros
            ? {
                ...plan.nutritionPlan.macros,
                ...updates.nutritionPlan.macros,
              }
            : plan.nutritionPlan.macros,
          meals: updates.nutritionPlan.meals ?? plan.nutritionPlan.meals,
        };
      }

      if (updates.supplementPlan) {
        nextPlan.supplementPlan = {
          ...plan.supplementPlan,
          ...updates.supplementPlan,
        };
      }

      return nextPlan;
    },
    [],
  );

  const hydratePlan = useCallback(
    async (plan: DailyPlan | null) => {
      if (!plan) {
        setCurrentPlan(null);
        setSupplementStatus({});
        setSupplementProgress(DEFAULT_PROGRESS);
        setActivePlanId(null);
        return;
      }

      const normalizedPlan = normalizePlanDates(plan);
      const baseStatus = deriveStatusFromPlan(normalizedPlan);
      const storageKey = `${SUPPLEMENT_STATUS_PREFIX}${plan.id}`;
      let storedStatus: Record<string, boolean> = {};

      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          storedStatus = JSON.parse(raw);
        }
      } catch (storageError) {
        console.warn('[PlanProvider] unable to load supplement status', storageError);
      }

      const mergedStatus = { ...baseStatus, ...storedStatus };
      const planWithStatus = applyStatusToPlan(normalizedPlan, mergedStatus);

      setSupplementStatus(mergedStatus);
      setCurrentPlan(planWithStatus);
      setActivePlanId(plan.id);
      setSupplementProgress(computeSupplementProgress(planWithStatus, mergedStatus));
    },
    [],
  );

  const loadTodaysPlan = useCallback(async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let plan = await PlanService.getTodaysPlan(user.id);

      if (!plan) {
        plan = await PlanService.generateDailyPlan(user);
      }

      await hydratePlan(plan);
    } catch (err) {
      console.error('Erreur lors du chargement du plan:', err);
      setError('Erreur lors du chargement du plan quotidien');
    } finally {
      setLoading(false);
    }
  }, [hydratePlan, user]);

  const generateDailyPlan = useCallback(async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const plan = await PlanService.generateDailyPlan(user);
      await hydratePlan(plan);
    } catch (err) {
      console.error('Erreur lors de la génération du plan:', err);
      setError('Erreur lors de la génération du plan quotidien');
    } finally {
      setLoading(false);
    }
  }, [hydratePlan, user]);

  const updatePlan = useCallback(
    async (planId: string, updates: Partial<DailyPlan>): Promise<void> => {
      if (!planId) {
        return;
      }

      const previousPlan = currentPlan;
      let optimisticPlan: DailyPlan | null = null;

      if (previousPlan && previousPlan.id === planId) {
        optimisticPlan = mergePlanWithUpdates(previousPlan, updates);
        setCurrentPlan(optimisticPlan);
        setSupplementProgress(computeSupplementProgress(optimisticPlan, supplementStatus));
      }

      try {
        const persistedPlan = await PlanService.updateDailyPlan(planId, updates);
        await hydratePlan(persistedPlan);
      } catch (err) {
        console.error('[PlanProvider] updatePlan error', err);
        if (previousPlan && previousPlan.id === planId) {
          setCurrentPlan(previousPlan);
          setSupplementProgress(computeSupplementProgress(previousPlan, supplementStatus));
        }
        setError('Erreur lors de la mise à jour du plan quotidien');
        throw err;
      }
    },
    [currentPlan, hydratePlan, mergePlanWithUpdates, supplementStatus],
  );

  const persistSupplementStatus = useCallback(
    async (planId: string, status: Record<string, boolean>) => {
      try {
        await AsyncStorage.setItem(`${SUPPLEMENT_STATUS_PREFIX}${planId}`, JSON.stringify(status));
      } catch (storageError) {
        console.warn('[PlanProvider] unable to persist supplement status', storageError);
      }
    },
    [],
  );

  const toggleSupplement = useCallback(
    async (supplementId: string): Promise<void> => {
      if (!currentPlan) return;

      const previousStatus = supplementStatus[supplementId] ?? false;
      const nextStatus = { ...supplementStatus, [supplementId]: !previousStatus };

      setSupplementStatus(nextStatus);
      const updatedPlan = applyStatusToPlan(currentPlan, nextStatus);
      setCurrentPlan(updatedPlan);
      const nextProgress = computeSupplementProgress(updatedPlan, nextStatus);
      setSupplementProgress(nextProgress);

      if (activePlanId) {
        persistSupplementStatus(activePlanId, nextStatus);
      }

      if (!previousStatus) {
        try {
          await PlanService.markSupplementTaken(currentPlan.id, supplementId);
        } catch (err) {
          console.error('Erreur lors de la mise à jour du supplément:', err);
          const revertedStatus = { ...nextStatus, [supplementId]: previousStatus };
          setSupplementStatus(revertedStatus);
          const revertedPlan = applyStatusToPlan(currentPlan, revertedStatus);
          setCurrentPlan(revertedPlan);
          setSupplementProgress(computeSupplementProgress(revertedPlan, revertedStatus));
          if (activePlanId) {
            persistSupplementStatus(activePlanId, revertedStatus);
          }
          setError('Erreur lors de la mise à jour du supplément');
          throw err;
        }
      }
    },
    [activePlanId, currentPlan, persistSupplementStatus, supplementStatus],
  );

  const markSupplementTaken = useCallback(
    async (supplementId: string): Promise<void> => {
      if (supplementStatus[supplementId]) {
        return;
      }
      await toggleSupplement(supplementId);
    },
    [supplementStatus, toggleSupplement],
  );

  useEffect(() => {
    if (user) {
      loadTodaysPlan();
      setWeeklySchedule(buildWeeklySchedule(user.profile?.training));
    } else {
      hydratePlan(null);
      setWeeklySchedule([]);
    }
  }, [hydratePlan, loadTodaysPlan, user]);

  const value: PlanContextType = {
    currentPlan,
    loading,
    error,
    generateDailyPlan,
    updatePlan,
    markSupplementTaken,
    toggleSupplement,
    supplementStatus,
    supplementProgress,
    weeklySchedule,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

export const usePlan = (): PlanContextType => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};
