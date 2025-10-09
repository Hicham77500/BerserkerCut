import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Meal, Food } from '@/types';
import { IOSButton } from './IOSButton';
import { IOSCheckbox } from './IOSCheckbox';

interface MealEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedMeal: Meal) => void;
  meal: Meal;
}

export const MealEditModal: React.FC<MealEditModalProps> = ({
  visible,
  onClose,
  onSave,
  meal,
}) => {
  const { colors } = useThemeMode();
  const [mealName, setMealName] = useState(meal.name);
  const [mealTime, setMealTime] = useState(meal.time);
  const [foods, setFoods] = useState<Food[]>(meal.foods);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [foodName, setFoodName] = useState('');
  const [foodQuantity, setFoodQuantity] = useState('');
  const [foodUnit, setFoodUnit] = useState('g');
  const [foodCalories, setFoodCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [isEditingFood, setIsEditingFood] = useState(false);

  useEffect(() => {
    // Reset form when modal becomes visible
    if (visible) {
      setMealName(meal.name);
      setMealTime(meal.time);
      setFoods([...meal.foods]);
      resetFoodForm();
    }
  }, [visible, meal]);

  const resetFoodForm = () => {
    setFoodName('');
    setFoodQuantity('');
    setFoodUnit('g');
    setFoodCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setSelectedFood(null);
    setIsAddingFood(false);
    setIsEditingFood(false);
  };

  const handleAddFood = () => {
    setIsAddingFood(true);
  };

  const handleEditFood = (food: Food) => {
    setSelectedFood(food);
    setFoodName(food.name);
    setFoodQuantity(food.quantity.toString());
    setFoodUnit(food.unit);
    setFoodCalories(food.calories.toString());
    setProtein(food.macros.protein.toString());
    setCarbs(food.macros.carbs.toString());
    setFat(food.macros.fat.toString());
    setIsEditingFood(true);
  };

  const handleDeleteFood = (foodId: string) => {
    Alert.alert(
      'Supprimer cet aliment',
      'Êtes-vous sûr de vouloir supprimer cet aliment du repas ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const updatedFoods = foods.filter((f) => f.id !== foodId);
            setFoods(updatedFoods);
          },
        },
      ]
    );
  };

  const calculateMacros = () => {
    const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
    const totalProtein = foods.reduce((sum, food) => sum + food.macros.protein, 0);
    const totalCarbs = foods.reduce((sum, food) => sum + food.macros.carbs, 0);
    const totalFat = foods.reduce((sum, food) => sum + food.macros.fat, 0);

    return {
      calories: totalCalories,
      macros: {
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
      },
    };
  };

  const handleSaveFood = () => {
    if (!foodName || !foodQuantity || !foodCalories || !protein || !carbs || !fat) {
      Alert.alert('Information manquante', 'Veuillez remplir tous les champs.');
      return;
    }

    const newFood: Food = {
      id: isEditingFood && selectedFood ? selectedFood.id : `food_${Date.now()}`,
      name: foodName,
      quantity: parseFloat(foodQuantity),
      unit: foodUnit,
      calories: parseFloat(foodCalories),
      macros: {
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
      },
    };

    let updatedFoods: Food[];
    
    if (isEditingFood && selectedFood) {
      // Update existing food
      updatedFoods = foods.map((f) => (f.id === selectedFood.id ? newFood : f));
    } else {
      // Add new food
      updatedFoods = [...foods, newFood];
    }

    setFoods(updatedFoods);
    resetFoodForm();
  };

  const handleSaveMeal = () => {
    if (!mealName || !mealTime) {
      Alert.alert('Information manquante', 'Veuillez remplir le nom et l\'heure du repas.');
      return;
    }

    const { calories, macros } = calculateMacros();

    const updatedMeal: Meal = {
      id: meal.id,
      name: mealName,
      time: mealTime,
      foods,
      calories,
      macros,
    };

    onSave(updatedMeal);
  };

  const containerStyle = [styles.container, { backgroundColor: colors.overlay }];

  const cardStyle = [styles.card, { backgroundColor: colors.surface }];

  const textStyle = {
    color: colors.text,
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.surfaceDark,
      color: colors.text,
      borderColor: colors.border,
    },
  ];

  const buttonContainerStyle = [
    styles.buttonContainer,
    { backgroundColor: colors.surface },
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={containerStyle}>
        <View style={cardStyle}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[Typography.h2, textStyle, styles.title]}>
              {isEditingFood || isAddingFood ? 'Éditer Aliment' : 'Éditer Repas'}
            </Text>
            
            {!isEditingFood && !isAddingFood ? (
              // Meal editing view
              <>
                <View style={styles.formGroup}>
                  <Text style={[Typography.body, textStyle]}>Nom du repas</Text>
                  <TextInput
                    style={inputStyle}
                    value={mealName}
                    onChangeText={setMealName}
                    placeholder="Nom du repas"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[Typography.body, textStyle]}>Heure</Text>
                  <TextInput
                    style={inputStyle}
                    value={mealTime}
                    onChangeText={setMealTime}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <Text style={[Typography.h3, textStyle, styles.sectionTitle]}>
                  Aliments ({foods.length})
                </Text>

                {foods.map((food) => (
                  <View key={food.id} style={styles.foodItem}>
                    <View style={styles.foodInfo}>
                      <Text style={[Typography.body, textStyle]}>{food.name}</Text>
                      <Text style={[Typography.caption, styles.foodDetail, textStyle]}>
                        {food.quantity} {food.unit} • {food.calories} kcal
                      </Text>
                      <Text style={[Typography.caption, styles.foodDetail, textStyle]}>
                        P: {food.macros.protein}g • C: {food.macros.carbs}g • L: {food.macros.fat}g
                      </Text>
                    </View>
                    <View style={styles.foodActions}>
                      <TouchableOpacity
                        style={styles.foodActionButton}
                        onPress={() => handleEditFood(food)}
                      >
                        <Text style={styles.actionText}>Éditer</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.foodActionButton, styles.deleteButton]}
                        onPress={() => handleDeleteFood(food.id)}
                      >
                        <Text style={styles.deleteText}>Supprimer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <IOSButton
                  label="Ajouter un aliment"
                  onPress={handleAddFood}
                  variant="secondary"
                  style={styles.addButton}
                />

                <View style={styles.summaryContainer}>
                  <Text style={[Typography.h3, textStyle]}>Total du repas</Text>
                  <Text style={[Typography.body, textStyle]}>
                    {calculateMacros().calories} kcal
                  </Text>
                  <Text style={[Typography.body, textStyle]}>
                    P: {calculateMacros().macros.protein}g • C: {calculateMacros().macros.carbs}g • L:{' '}
                    {calculateMacros().macros.fat}g
                  </Text>
                </View>
              </>
            ) : (
              // Food editing view
              <>
                <View style={styles.formGroup}>
                  <Text style={[Typography.body, textStyle]}>Nom de l'aliment</Text>
                  <TextInput
                    style={inputStyle}
                    value={foodName}
                    onChangeText={setFoodName}
                    placeholder="Nom de l'aliment"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <View style={styles.rowFormGroup}>
                  <View style={[styles.formGroup, { flex: 2, marginRight: 8 }]}>
                    <Text style={[Typography.body, textStyle]}>Quantité</Text>
                    <TextInput
                      style={inputStyle}
                      value={foodQuantity}
                      onChangeText={setFoodQuantity}
                      placeholder="100"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[Typography.body, textStyle]}>Unité</Text>
                    <TextInput
                      style={inputStyle}
                      value={foodUnit}
                      onChangeText={setFoodUnit}
                      placeholder="g"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[Typography.body, textStyle]}>Calories</Text>
                  <TextInput
                    style={inputStyle}
                    value={foodCalories}
                    onChangeText={setFoodCalories}
                    placeholder="Calories par portion"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                <Text style={[Typography.h3, textStyle, styles.sectionTitle]}>Macronutriments</Text>

                <View style={styles.formGroup}>
                  <Text style={[Typography.body, textStyle]}>Protéines (g)</Text>
                  <TextInput
                    style={inputStyle}
                    value={protein}
                    onChangeText={setProtein}
                    placeholder="Grammes de protéines"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[Typography.body, textStyle]}>Glucides (g)</Text>
                  <TextInput
                    style={inputStyle}
                    value={carbs}
                    onChangeText={setCarbs}
                    placeholder="Grammes de glucides"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[Typography.body, textStyle]}>Lipides (g)</Text>
                  <TextInput
                    style={inputStyle}
                    value={fat}
                    onChangeText={setFat}
                    placeholder="Grammes de lipides"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.foodActionButtons}>
                  <IOSButton
                    label="Annuler"
                    onPress={resetFoodForm}
                    variant="ghost"
                    style={styles.cancelButton}
                  />
                  <IOSButton
                    label="Enregistrer"
                    onPress={handleSaveFood}
                    variant="secondary"
                  />
                </View>
              </>
            )}
          </ScrollView>

          <View style={buttonContainerStyle}>
            <IOSButton label="Annuler" onPress={onClose} variant="ghost" />
            {!isEditingFood && !isAddingFood && (
              <IOSButton label="Enregistrer" onPress={handleSaveMeal} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  rowFormGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  foodInfo: {
    flex: 1,
  },
  foodDetail: {
    marginTop: 4,
  },
  foodActions: {
    flexDirection: 'row',
  },
  foodActionButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.xs,
  },
  actionText: {
    ...Typography.button,
    color: Colors.primary,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  deleteText: {
    ...Typography.button,
    color: Colors.error,
  },
  addButton: {
    marginTop: Spacing.md,
  },
  summaryContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  foodActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  cancelButton: {
    marginRight: Spacing.sm,
  },
});