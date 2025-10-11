import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeDashboardScreen } from '../src/screens/home/HomeDashboardScreen';
import { ThemeModeProvider } from '../src/hooks/useThemeMode';
import { DailyPlan } from '../src/types';

jest.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'user@example.com',
      profile: {
        name: 'Test User',
        objective: 'cutting',
      },
    },
  }),
}));

jest.mock('../src/hooks/usePlan', () => ({
  usePlan: () => ({
    currentPlan: {
      id: 'plan-1',
      userId: 'user-1',
      date: new Date(),
      dayType: 'training',
      nutritionPlan: {
        totalCalories: 2200,
        macros: { protein: 180, carbs: 230, fat: 70 },
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
      createdAt: new Date(),
    } as DailyPlan,
    supplementProgress: {
      total: 0,
      completed: 0,
      percentage: 0,
    },
    loading: false,
    error: null,
    generateDailyPlan: jest.fn(),
    updatePlan: jest.fn(),
    markSupplementTaken: jest.fn(),
  }),
}));

const mockSafeAreaMetrics = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe('HomeDashboardScreen', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-10-09T07:30:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('rend les cartes principales et correspond au snapshot', async () => {
    const { getByText, toJSON } = render(
      <ThemeModeProvider>
        <SafeAreaProvider initialMetrics={mockSafeAreaMetrics}>
          <HomeDashboardScreen />
        </SafeAreaProvider>
      </ThemeModeProvider>
    );

    await waitFor(() => {
      expect(getByText('Plan du jour')).toBeTruthy();
      expect(getByText('Nutrition')).toBeTruthy();
      expect(getByText('Suppléments')).toBeTruthy();
      expect(getByText('Profil santé')).toBeTruthy();
    });

    expect(toJSON()).toMatchSnapshot();
  });
});
