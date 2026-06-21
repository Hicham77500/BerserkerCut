import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Keyboard, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NutritionGoalsModal } from '../src/components/NutritionGoalsModal';
import { MealEditModal } from '../src/components/MealEditModal';
import { Meal, NutritionPlan } from '../src/types';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

const plan: NutritionPlan = {
  totalCalories: 2200,
  macros: {
    protein: 180,
    carbs: 220,
    fat: 70,
  },
  meals: [
    {
      id: 'meal-1',
      name: 'Petit dejeuner',
      time: '08:00',
      calories: 600,
      macros: {
        protein: 40,
        carbs: 65,
        fat: 18,
      },
      foods: [],
    },
  ],
};

const meal: Meal = {
  id: 'meal-1',
  name: 'Petit dejeuner',
  time: '08:00',
  calories: 600,
  macros: {
    protein: 40,
    carbs: 65,
    fat: 18,
  },
  foods: [],
};

const withSafeArea = (node: React.ReactElement) =>
  render(<SafeAreaProvider initialMetrics={safeAreaMetrics}>{node}</SafeAreaProvider>);

describe('Modal keyboard UX', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalPlatform,
    });
    jest.restoreAllMocks();
  });

  it('affiche un bouton explicite Fermer le clavier sur iOS dans NutritionGoalsModal', () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'ios',
    });

    const dismissSpy = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => undefined);

    const { getByLabelText } = withSafeArea(
      <NutritionGoalsModal
        visible
        onClose={jest.fn()}
        onSave={jest.fn()}
        nutritionPlan={plan}
        isTrainingDay
      />
    );

    fireEvent.press(getByLabelText('Fermer le clavier'));
    expect(dismissSpy).toHaveBeenCalledTimes(1);
  });

  it('affiche un bouton explicite Fermer le clavier sur iOS dans MealEditModal', () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'ios',
    });

    const dismissSpy = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => undefined);

    const { getByLabelText } = withSafeArea(
      <MealEditModal visible onClose={jest.fn()} onSave={jest.fn()} meal={meal} />
    );

    fireEvent.press(getByLabelText('Fermer le clavier'));
    expect(dismissSpy).toHaveBeenCalledTimes(1);
  });

  it('ne montre pas le bouton Fermer le clavier sur Android', () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'android',
    });

    const { queryByLabelText } = withSafeArea(
      <NutritionGoalsModal
        visible
        onClose={jest.fn()}
        onSave={jest.fn()}
        nutritionPlan={plan}
        isTrainingDay={false}
      />
    );

    expect(queryByLabelText('Fermer le clavier')).toBeNull();
  });

  it('reinitialise les valeurs du formulaire nutrition a la reouverture du modal', () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'ios',
    });

    const { getByPlaceholderText, rerender } = withSafeArea(
      <NutritionGoalsModal
        visible
        onClose={jest.fn()}
        onSave={jest.fn()}
        nutritionPlan={plan}
        isTrainingDay
      />
    );

    const caloriesInput = getByPlaceholderText('Entrez les calories totales');
    fireEvent.changeText(caloriesInput, '3000');
    expect(caloriesInput.props.value).toBe('3000');

    rerender(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <NutritionGoalsModal
          visible={false}
          onClose={jest.fn()}
          onSave={jest.fn()}
          nutritionPlan={plan}
          isTrainingDay
        />
      </SafeAreaProvider>
    );

    rerender(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <NutritionGoalsModal
          visible
          onClose={jest.fn()}
          onSave={jest.fn()}
          nutritionPlan={plan}
          isTrainingDay
        />
      </SafeAreaProvider>
    );

    expect(getByPlaceholderText('Entrez les calories totales').props.value).toBe('2200');
  });
});
