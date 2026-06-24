import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgendaScreen } from '../src/screens/agenda/AgendaScreen';

const mockWeeklySchedule = [
  {
    date: new Date('2026-06-22T00:00:00.000Z'),
    dayOfWeek: 1,
    label: 'Lundi',
    isTrainingDay: true,
    training: {
      dayOfWeek: 1,
      type: 'strength' as const,
      duration: 60,
      startTime: '18:00',
      timeSlot: 'evening' as const,
    },
    isToday: true,
  },
  {
    date: new Date('2026-06-23T00:00:00.000Z'),
    dayOfWeek: 2,
    label: 'Mardi',
    isTrainingDay: false,
    training: undefined,
    isToday: false,
  },
  {
    date: new Date('2026-06-24T00:00:00.000Z'),
    dayOfWeek: 3,
    label: 'Mercredi',
    isTrainingDay: true,
    training: {
      dayOfWeek: 3,
      type: 'cardio' as const,
      duration: 45,
      startTime: '18:00',
      timeSlot: 'evening' as const,
    },
    isToday: false,
  },
  {
    date: new Date('2026-06-25T00:00:00.000Z'),
    dayOfWeek: 4,
    label: 'Jeudi',
    isTrainingDay: false,
    training: undefined,
    isToday: false,
  },
  {
    date: new Date('2026-06-26T00:00:00.000Z'),
    dayOfWeek: 5,
    label: 'Vendredi',
    isTrainingDay: true,
    training: {
      dayOfWeek: 5,
      type: 'mixed' as const,
      duration: 50,
      startTime: '18:30',
      timeSlot: 'evening' as const,
    },
    isToday: false,
  },
  {
    date: new Date('2026-06-27T00:00:00.000Z'),
    dayOfWeek: 6,
    label: 'Samedi',
    isTrainingDay: false,
    training: undefined,
    isToday: false,
  },
  {
    date: new Date('2026-06-28T00:00:00.000Z'),
    dayOfWeek: 0,
    label: 'Dimanche',
    isTrainingDay: false,
    training: undefined,
    isToday: false,
  },
];

jest.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      profile: {
        training: {
          trainingDays: [
            { dayOfWeek: 1, type: 'strength', duration: 60, startTime: '18:00', timeSlot: 'evening' },
            { dayOfWeek: 3, type: 'cardio', duration: 45, startTime: '18:00', timeSlot: 'evening' },
            { dayOfWeek: 5, type: 'mixed', duration: 50, startTime: '18:30', timeSlot: 'evening' },
          ],
          experienceLevel: 'intermediate',
          preferredTimeSlots: ['evening'],
        },
      },
    },
  }),
}));

jest.mock('../src/hooks/usePlan', () => ({
  usePlan: () => ({
    currentPlan: {
      id: 'plan-1',
      userId: 'user-1',
      date: new Date('2026-06-24T00:00:00.000Z'),
      dayType: 'training',
      nutritionPlan: {
        totalCalories: 2200,
        macros: { protein: 180, carbs: 220, fat: 70 },
        meals: [],
      },
      supplementPlan: {
        morning: [],
        preWorkout: [],
        postWorkout: [],
        evening: [],
      },
      dailyTip: 'Hydrate-toi bien',
      completed: false,
      createdAt: new Date('2026-06-24T00:00:00.000Z'),
    },
    weeklySchedule: mockWeeklySchedule,
  }),
}));

jest.mock('../src/hooks/useThemeMode', () => {
  const { DarkColors } = require('../src/utils/theme');
  return {
    useThemeMode: () => ({
      colors: DarkColors,
    }),
  };
});

describe('AgendaScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('affiche une semaine simple avec validation des trainings', async () => {
    const { getByText, findByLabelText } = render(<AgendaScreen />);

    expect(getByText("Semaine d'entraînement")).toBeTruthy();
    expect(getByText('Vue rapide')).toBeTruthy();

    const mondayCard = await findByLabelText('Valider Lundi');
    fireEvent.press(mondayCard);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(getByText('Validé')).toBeTruthy();
    });
  });

  it('ne permet pas de valider un jour de repos', async () => {
    const { getByLabelText, queryByText } = render(<AgendaScreen />);

    fireEvent.press(getByLabelText('Mardi repos'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(queryByText('Validé')).toBeNull();
    });
  });
});
