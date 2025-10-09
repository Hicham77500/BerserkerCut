/**
 * Constantes nutritionnelles utilisées pour les calculs de macros
 */

export const NUTRITION_CONSTANTS = {
  // Calories par gramme de macronutriments
  PROTEIN_CALORIES_PER_GRAM: 4,
  CARBS_CALORIES_PER_GRAM: 4,
  FAT_CALORIES_PER_GRAM: 9,
  
  // Facteurs d'activité pour le TDEE
  ACTIVITY_FACTORS: {
    sedentary: 1.2,      // Peu ou pas d'exercice
    light: 1.375,        // Exercice léger 1-3 fois par semaine
    moderate: 1.55,      // Exercice modéré 3-5 fois par semaine
    active: 1.725,       // Exercice intense 6-7 fois par semaine
    very_active: 1.9,    // Exercice intense + travail physique quotidien
  },
  
  // Ratios de macronutriments recommandés selon objectif (en % des calories totales)
  RECOMMENDED_RATIOS: {
    cutting: {
      protein: 0.4,      // 40% des calories
      fat: 0.25,         // 25% des calories
      carbs: 0.35        // 35% des calories
    },
    maintenance: {
      protein: 0.3,      // 30% des calories
      fat: 0.3,          // 30% des calories
      carbs: 0.4         // 40% des calories
    },
    recomposition: {
      protein: 0.35,     // 35% des calories
      fat: 0.3,          // 30% des calories
      carbs: 0.35        // 35% des calories
    }
  }
};