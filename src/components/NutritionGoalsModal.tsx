import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { useThemeMode } from '../hooks/useThemeMode';
import { NutritionPlan, Meal } from '../types';
import { NUTRITION_CONSTANTS } from '../utils/nutritionConstants';

interface NutritionGoalsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedNutritionPlan: NutritionPlan) => void;
  nutritionPlan: NutritionPlan | null;
  isTrainingDay: boolean;
}

export const NutritionGoalsModal: React.FC<NutritionGoalsModalProps> = ({
  visible,
  onClose,
  onSave,
  nutritionPlan,
  isTrainingDay,
}) => {
  const { colors } = useThemeMode();
  const styles = createStyles(colors);
  
  const [totalCalories, setTotalCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  
  // Initialize form with current nutrition plan values
  useEffect(() => {
    if (nutritionPlan) {
      setTotalCalories(nutritionPlan.totalCalories.toString());
      setProtein(nutritionPlan.macros.protein.toString());
      setCarbs(nutritionPlan.macros.carbs.toString());
      setFat(nutritionPlan.macros.fat.toString());
    }
  }, [nutritionPlan]);
  
  const validateMacros = () => {
    // Convert inputs to numbers
    const totalCals = Number(totalCalories);
    const proteinGrams = Number(protein);
    const carbsGrams = Number(carbs);
    const fatGrams = Number(fat);
    
    // Check if all values are positive numbers
    if (isNaN(totalCals) || isNaN(proteinGrams) || isNaN(carbsGrams) || isNaN(fatGrams)) {
      Alert.alert('Valeurs invalides', 'Veuillez entrer des nombres valides.');
      return false;
    }
    
    // Check if all values are positive
    if (totalCals <= 0 || proteinGrams <= 0 || carbsGrams <= 0 || fatGrams <= 0) {
      Alert.alert('Valeurs invalides', 'Toutes les valeurs doivent être positives.');
      return false;
    }
    
    // Calculate total calories from macros
    const calculatedCalories = 
      proteinGrams * NUTRITION_CONSTANTS.PROTEIN_CALORIES_PER_GRAM +
      carbsGrams * NUTRITION_CONSTANTS.CARBS_CALORIES_PER_GRAM +
      fatGrams * NUTRITION_CONSTANTS.FAT_CALORIES_PER_GRAM;
    
    // Check if the calculated calories are within 5% of the entered total calories
    const difference = Math.abs(calculatedCalories - totalCals);
    const percentageDifference = (difference / totalCals) * 100;
    
    if (percentageDifference > 5) {
      Alert.alert(
        'Incohérence des macros',
        `Les macronutriments saisis (${calculatedCalories} kcal) ne correspondent pas au total calorique (${totalCals} kcal). Ajustez vos valeurs.`
      );
      return false;
    }
    
    return true;
  };
  
  const updateMealDistribution = (meals: Meal[], newTotalCalories: number, newMacros: { protein: number; carbs: number; fat: number }): Meal[] => {
    if (!meals || meals.length === 0) return [];
    
    // Calculate the calorie ratio for each meal from the original plan
    const mealRatios = meals.map(meal => ({
      id: meal.id,
      name: meal.name,
      time: meal.time,
      calorieRatio: meal.calories / (nutritionPlan?.totalCalories || 1), // Prevent division by zero
      proteinRatio: meal.macros.protein / (nutritionPlan?.macros.protein || 1),
      carbsRatio: meal.macros.carbs / (nutritionPlan?.macros.carbs || 1),
      fatRatio: meal.macros.fat / (nutritionPlan?.macros.fat || 1),
      foods: meal.foods,
    }));
    
    // Create updated meals based on the new total calories and macros
    return mealRatios.map(meal => {
      // Calculate new calorie and macro values based on ratios
      const newCalories = Math.round(meal.calorieRatio * newTotalCalories);
      const newProtein = Math.round(meal.proteinRatio * newMacros.protein);
      const newCarbs = Math.round(meal.carbsRatio * newMacros.carbs);
      const newFat = Math.round(meal.fatRatio * newMacros.fat);
      
      // TODO: In a full implementation, we would recalculate food quantities
      // For now, we just keep the existing foods and update the total values
      
      return {
        id: meal.id,
        name: meal.name,
        time: meal.time,
        foods: meal.foods,
        calories: newCalories,
        macros: {
          protein: newProtein,
          carbs: newCarbs,
          fat: newFat,
        }
      };
    });
  };
  
  const handleSave = () => {
    if (!validateMacros()) return;
    if (!nutritionPlan) return;
    
    // Convert inputs to numbers
    const newTotalCalories = Number(totalCalories);
    const newProtein = Number(protein);
    const newCarbs = Number(carbs);
    const newFat = Number(fat);
    
    // Create new macros object
    const newMacros = {
      protein: newProtein,
      carbs: newCarbs,
      fat: newFat,
    };
    
    // Update meal distribution proportionally
    const updatedMeals = updateMealDistribution(nutritionPlan.meals, newTotalCalories, newMacros);
    
    // Create updated nutrition plan
    const updatedNutritionPlan: NutritionPlan = {
      totalCalories: newTotalCalories,
      macros: newMacros,
      meals: updatedMeals,
    };
    
    // Send updated plan back to parent component
    onSave(updatedNutritionPlan);
    onClose();
  };
  
  // Calculate percentage of each macro based on total calories
  const calculateMacroPercentage = () => {
    if (!totalCalories || !protein || !carbs || !fat) return null;
    
    const proteinCals = Number(protein) * NUTRITION_CONSTANTS.PROTEIN_CALORIES_PER_GRAM;
    const carbsCals = Number(carbs) * NUTRITION_CONSTANTS.CARBS_CALORIES_PER_GRAM;
    const fatCals = Number(fat) * NUTRITION_CONSTANTS.FAT_CALORIES_PER_GRAM;
    const totalCals = Number(totalCalories);
    
    if (isNaN(proteinCals) || isNaN(carbsCals) || isNaN(fatCals) || isNaN(totalCals) || totalCals === 0) {
      return null;
    }
    
    return {
      protein: Math.round((proteinCals / totalCals) * 100),
      carbs: Math.round((carbsCals / totalCals) * 100),
      fat: Math.round((fatCals / totalCals) * 100),
    };
  };
  
  const macroPercentages = calculateMacroPercentage();
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Adapter mes objectifs nutritionnels</Text>
          <Text style={styles.modalSubtitle}>
            Jour {isTrainingDay ? 'd\'entraînement' : 'de repos'}
          </Text>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Total calorique (kcal)</Text>
              <TextInput
                style={styles.input}
                value={totalCalories}
                onChangeText={setTotalCalories}
                keyboardType="numeric"
                placeholder="Entrez les calories totales"
              />
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Macronutriments (en grammes)</Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.protein }]}>Protéines</Text>
              <View style={styles.inputWithPercentage}>
                <TextInput
                  style={[styles.input, styles.macroInput]}
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  placeholder="Protéines (g)"
                />
                {macroPercentages && (
                  <View style={[styles.percentageBadge, { backgroundColor: colors.protein }]}>
                    <Text style={styles.percentageText}>{macroPercentages.protein}%</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.carbs }]}>Glucides</Text>
              <View style={styles.inputWithPercentage}>
                <TextInput
                  style={[styles.input, styles.macroInput]}
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                  placeholder="Glucides (g)"
                />
                {macroPercentages && (
                  <View style={[styles.percentageBadge, { backgroundColor: colors.carbs }]}>
                    <Text style={styles.percentageText}>{macroPercentages.carbs}%</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.fat }]}>Lipides</Text>
              <View style={styles.inputWithPercentage}>
                <TextInput
                  style={[styles.input, styles.macroInput]}
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                  placeholder="Lipides (g)"
                />
                {macroPercentages && (
                  <View style={[styles.percentageBadge, { backgroundColor: colors.fat }]}>
                    <Text style={styles.percentageText}>{macroPercentages.fat}%</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.info}>
              <Text style={styles.infoText}>
                Les repas seront automatiquement ajustés selon vos nouveaux objectifs.
              </Text>
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancel]}
              onPress={onClose}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalConfirm]}
              onPress={handleSave}
            >
              <Text style={styles.modalConfirmText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (palette: typeof Colors) => 
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: palette.surface,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      padding: Spacing.lg,
      paddingBottom: Spacing.xl,
      minHeight: '70%',
      maxHeight: '90%',
    },
    scrollView: {
      marginVertical: Spacing.md,
    },
    modalTitle: {
      ...Typography.h2,
      color: palette.text,
      marginBottom: Spacing.xs,
    },
    modalSubtitle: {
      ...Typography.bodySmall,
      color: palette.textLight,
      marginBottom: Spacing.md,
    },
    formGroup: {
      marginBottom: Spacing.md,
    },
    label: {
      ...Typography.bodySmall,
      color: palette.text,
      marginBottom: Spacing.xs,
      fontWeight: '600',
    },
    input: {
      backgroundColor: palette.background,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      borderWidth: 1,
      borderColor: palette.border,
      ...Typography.body,
      color: palette.text,
    },
    macroInput: {
      flex: 1,
    },
    inputWithPercentage: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    percentageBadge: {
      marginLeft: Spacing.sm,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.md,
    },
    percentageText: {
      ...Typography.caption,
      color: '#FFFFFF', // Using literal white color
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: palette.border,
      marginVertical: Spacing.md,
    },
    sectionTitle: {
      ...Typography.bodySmall,
      color: palette.textLight,
      marginBottom: Spacing.sm,
    },
    info: {
      backgroundColor: palette.background,
      padding: Spacing.sm,
      borderRadius: BorderRadius.md,
      marginTop: Spacing.md,
    },
    infoText: {
      ...Typography.caption,
      color: palette.textLight,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Spacing.md,
    },
    modalButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      marginHorizontal: Spacing.xs,
    },
    modalCancel: {
      backgroundColor: palette.background,
      borderWidth: 1,
      borderColor: palette.border,
    },
    modalConfirm: {
      backgroundColor: palette.primary,
    },
    modalCancelText: {
      ...Typography.bodySmall,
      color: palette.text,
    },
    modalConfirmText: {
      ...Typography.bodySmall,
      color: palette.textDark,
      fontWeight: '600',
    },
  });