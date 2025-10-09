import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { DailyPlan, Meal } from '../src/types';
import {
  DarkColors,
  DarkNavigationTheme,
  LightColors,
  LightNavigationTheme,
} from '../src/utils/theme';

const mockUpdatePlan = jest.fn();
const mockGetSecureItem = jest.fn();
const mockPhotoStorage = {
  MAX_GALLERY_PHOTOS: Number.MAX_SAFE_INTEGER,
  ensureLocalCopy: jest.fn((uri: string) => Promise.resolve(uri)),
  deleteLocalCopy: jest.fn().mockResolvedValue(undefined),
  isManagedUri: jest.fn().mockReturnValue(true),
  loadMealPhotosByMeal: jest.fn().mockResolvedValue({}),
  appendMealPhoto: jest.fn().mockResolvedValue(undefined),
  saveMealPhotoMap: jest.fn().mockResolvedValue(undefined),
  clearMealPhotos: jest.fn().mockResolvedValue(undefined),
  removeMealPhotosByTimestamp: jest.fn().mockResolvedValue({ removed: [], keep: [] }),
  loadGallery: jest.fn().mockResolvedValue([]),
  setGallery: jest.fn().mockResolvedValue(undefined),
  pushToGallery: jest.fn().mockResolvedValue([]),
  removeFromGallery: jest.fn().mockResolvedValue({ next: [], removed: null }),
  clearGallery: jest.fn().mockResolvedValue(undefined),
  clearAll: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@/hooks/usePlan', () => ({
  usePlan: jest.fn(),
}));

jest.mock('@/hooks/useThemeMode', () => ({
  useThemeMode: jest.fn(),
}));

jest.mock('@/services/photoStorage', () => ({
  __esModule: true,
  default: mockPhotoStorage,
  photoStorage: mockPhotoStorage,
}));

jest.mock('@/services/photo', () => ({
  __esModule: true,
  default: {
    uploadPhoto: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock('@/utils/storage/secureStorage', () => ({
  getSecureItem: jest.fn((key: string) => mockGetSecureItem(key)),
}));

jest.mock('@/components', () => {
  const actual = jest.requireActual('../src/components');
  return {
    ...actual,
    NutritionGoalsModal: () => null,
    MealEditModal: () => null,
    TimePickerModal: () => null,
  };
});

const { usePlan } = require('@/hooks/usePlan');
const { useThemeMode } = require('@/hooks/useThemeMode');
const { NutritionScreen } = require('../src/screens/nutrition/NutritionScreen');

const createMeal = (overrides: Partial<Meal>): Meal => ({
  id: 'meal-1',
  name: 'Petit déjeuner',
  time: '08:00',
  calories: 550,
  macros: {
    protein: 30,
    carbs: 60,
    fat: 15,
  },
  foods: [
    {
      id: 'food-1',
      name: 'Porridge aux fruits',
      quantity: 150,
      unit: 'g',
      calories: 350,
      macros: {
        protein: 12,
        carbs: 55,
        fat: 8,
      },
    },
    {
      id: 'food-2',
      name: 'Skyr',
      quantity: 150,
      unit: 'g',
      calories: 200,
      macros: {
        protein: 18,
        carbs: 5,
        fat: 2,
      },
    },
  ],
  ...overrides,
});

const createPlan = (): DailyPlan => ({
  id: 'plan-1',
  userId: 'user-1',
  date: new Date('2024-10-09T00:00:00.000Z'),
  dayType: 'training',
  nutritionPlan: {
    totalCalories: 2200,
    macros: {
      protein: 180,
      carbs: 230,
      fat: 70,
    },
    meals: [
      createMeal({ id: 'meal-1', name: 'Petit déjeuner', time: '08:00' }),
      createMeal({ id: 'meal-2', name: 'Déjeuner', time: '12:30' }),
    ],
  },
  supplementPlan: {
    morning: [],
    preWorkout: [],
    postWorkout: [],
    evening: [],
  },
  dailyTip: 'Hydrate-toi bien',
  completed: false,
  createdAt: new Date('2024-10-08T18:00:00.000Z'),
});

const createThemeValue = (palette: typeof DarkColors | typeof LightColors) => ({
  mode: palette === DarkColors ? 'dark' : 'light',
  preference: palette === DarkColors ? 'dark' : 'light',
  isDark: palette === DarkColors,
  colors: palette,
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
  navigationTheme: palette === DarkColors ? DarkNavigationTheme : LightNavigationTheme,
  ready: true,
  isSystemPreferred: false,
});

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <NutritionScreen />
    </SafeAreaProvider>
  );

describe('NutritionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdatePlan.mockReset();
    mockGetSecureItem.mockResolvedValue('false');
    mockPhotoStorage.loadMealPhotosByMeal.mockResolvedValue({});
    mockPhotoStorage.pushToGallery.mockResolvedValue([]);

    (usePlan as jest.Mock).mockReturnValue({
      currentPlan: createPlan(),
      loading: false,
      updatePlan: mockUpdatePlan,
    });

    (useThemeMode as jest.Mock).mockReturnValue(createThemeValue(DarkColors));

    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('affiche les objectifs nutritionnels et les repas planifiés', async () => {
    const { findByText, findAllByText } = renderScreen();

    await expect(findByText('Objectifs nutritionnels')).resolves.toBeTruthy();
    await expect(findByText('2200 kcal')).resolves.toBeTruthy();
    await expect(findByText('Petit déjeuner')).resolves.toBeTruthy();
    await expect(findByText('Déjeuner')).resolves.toBeTruthy();
    const foods = await findAllByText('Porridge aux fruits');
    expect(foods).toHaveLength(2);
  });

  it('applique la palette sombre au conteneur principal', async () => {
    const { findByTestId } = renderScreen();

    const root = await findByTestId('nutrition-screen');
    const flattenedStyle = Array.isArray(root.props.style)
      ? Object.assign({}, ...root.props.style)
      : root.props.style;

    expect(flattenedStyle.backgroundColor).toBe(DarkColors.background);
  });

  it("s'adapte à la palette claire", async () => {
    (useThemeMode as jest.Mock).mockReturnValue(createThemeValue(LightColors));

    const { findByTestId } = renderScreen();

    const root = await findByTestId('nutrition-screen');
    const flattenedStyle = Array.isArray(root.props.style)
      ? Object.assign({}, ...root.props.style)
      : root.props.style;

    expect(flattenedStyle.backgroundColor).toBe(LightColors.background);
  });
});
