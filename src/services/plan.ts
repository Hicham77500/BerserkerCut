/**
 * Service de génération de plans nutritionnels et de suppléments avec mode démo
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import { DailyPlan, User, NutritionPlan, SupplementPlan, Meal, Food, TrainingDay } from '../types';
import { DemoPlanService } from './demoPlan';

// Configuration pour basculer entre Firebase et mode démo
const USE_DEMO_MODE = true; // Changez à false quand Firebase est configuré

export class PlanService {
  /**
   * Générer un plan quotidien basé sur le profil utilisateur
   */
  static async generateDailyPlan(user: User): Promise<DailyPlan> {
    if (USE_DEMO_MODE) {
      return DemoPlanService.generateDailyPlan(user);
    }
    
    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      // Déterminer le type de jour (training/rest)
      const trainingDay = user.profile.trainingDays.find(td => td.dayOfWeek === dayOfWeek);
      const dayType = trainingDay ? 'training' : 'rest';
      
      // Calculer les besoins caloriques
      const totalCalories = this.calculateDailyCalories(user, dayType);
      
      // Générer le plan nutritionnel
      const nutritionPlan = this.generateNutritionPlan(user, totalCalories, dayType);
      
      // Générer le plan de suppléments
      const supplementPlan = this.generateSupplementPlan(user, dayType, trainingDay);
      
      // Générer un conseil du jour
      const dailyTip = this.generateDailyTip(user, dayType);

      const dailyPlan: DailyPlan = {
        id: `${user.id}_${today.toISOString().split('T')[0]}`,
        userId: user.id,
        date: today,
        dayType,
        nutritionPlan,
        supplementPlan,
        dailyTip,
        completed: false,
        createdAt: new Date()
      };

      // Sauvegarder dans Firestore
      await setDoc(doc(db, 'dailyPlans', dailyPlan.id), {
        ...dailyPlan,
        date: dailyPlan.date.toISOString(),
        createdAt: dailyPlan.createdAt.toISOString()
      });

      return dailyPlan;
    } catch (error) {
      console.error('Erreur lors de la génération du plan quotidien:', error);
      throw error;
    }
  }

  /**
   * Récupérer le plan du jour
   */
  static async getTodaysPlan(userId: string): Promise<DailyPlan | null> {
    if (USE_DEMO_MODE) {
      return DemoPlanService.getTodaysPlan(userId);
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const planId = `${userId}_${today}`;
      
      const planDoc = await getDoc(doc(db, 'dailyPlans', planId));
      
      if (!planDoc.exists()) {
        return null;
      }

      const planData = planDoc.data();
      
      return {
        ...planData,
        date: new Date(planData.date),
        createdAt: new Date(planData.createdAt)
      } as DailyPlan;
    } catch (error) {
      console.error('Erreur lors de la récupération du plan du jour:', error);
      return null;
    }
  }

  /**
   * Marquer un supplément comme pris
   */
  static async markSupplementTaken(planId: string, supplementId: string): Promise<void> {
    if (USE_DEMO_MODE) {
      return DemoPlanService.markSupplementTaken(planId, supplementId);
    }
    
    try {
      const planRef = doc(db, 'dailyPlans', planId);
      const planDoc = await getDoc(planRef);
      
      if (!planDoc.exists()) {
        throw new Error('Plan non trouvé');
      }

      const planData = planDoc.data() as DailyPlan;
      
      // Marquer le supplément comme pris dans tous les créneaux
      const updateSupplementPlan = (plan: SupplementPlan) => {
        Object.keys(plan).forEach(timeSlot => {
          const supplements = plan[timeSlot as keyof SupplementPlan];
          supplements.forEach(supplement => {
            if (supplement.supplementId === supplementId) {
              supplement.taken = true;
            }
          });
        });
        return plan;
      };

      const updatedSupplementPlan = updateSupplementPlan(planData.supplementPlan);
      
      await updateDoc(planRef, {
        supplementPlan: updatedSupplementPlan
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du supplément:', error);
      throw error;
    }
  }

  /**
   * Calculer les calories quotidiennes nécessaires
   */
  private static calculateDailyCalories(user: User, dayType: 'training' | 'rest'): number {
    const { weight, height, age, gender, activityLevel, objective } = user.profile;
    
    // Calcul du métabolisme de base (Harris-Benedict)
    let bmr: number;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Facteur d'activité
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    let tdee = bmr * activityFactors[activityLevel];
    
    // Ajustement pour jour d'entraînement
    if (dayType === 'training') {
      tdee *= 1.1; // 10% de plus les jours d'entraînement
    }

    // Ajustement selon l'objectif
    switch (objective) {
      case 'cutting':
        return Math.round(tdee * 0.8); // Déficit de 20%
      case 'recomposition':
        return Math.round(tdee * 0.9); // Déficit léger de 10%
      case 'maintenance':
        return Math.round(tdee);
      default:
        return Math.round(tdee);
    }
  }

  /**
   * Générer un plan nutritionnel
   */
  private static generateNutritionPlan(user: User, totalCalories: number, dayType: 'training' | 'rest'): NutritionPlan {
    const { weight, objective } = user.profile;
    
    // Calcul des macros
    let proteinPerKg: number;
    let fatPercentage: number;
    
    switch (objective) {
      case 'cutting':
        proteinPerKg = 2.2;
        fatPercentage = 0.25;
        break;
      case 'recomposition':
        proteinPerKg = 2.0;
        fatPercentage = 0.3;
        break;
      case 'maintenance':
        proteinPerKg = 1.8;
        fatPercentage = 0.3;
        break;
      default:
        proteinPerKg = 2.0;
        fatPercentage = 0.3;
    }

    const proteinGrams = Math.round(weight * proteinPerKg);
    const fatGrams = Math.round((totalCalories * fatPercentage) / 9);
    const carbGrams = Math.round((totalCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4);

    // Génération des repas
    const meals = this.generateMeals(totalCalories, { protein: proteinGrams, carbs: carbGrams, fat: fatGrams }, dayType);

    return {
      totalCalories,
      macros: {
        protein: proteinGrams,
        carbs: carbGrams,
        fat: fatGrams
      },
      meals
    };
  }

  /**
   * Générer les repas de la journée
   */
  private static generateMeals(totalCalories: number, macros: { protein: number; carbs: number; fat: number }, dayType: 'training' | 'rest'): Meal[] {
    const meals: Meal[] = [];

    // Répartition des calories par repas
    const mealDistribution = dayType === 'training' 
      ? { breakfast: 0.25, lunch: 0.35, dinner: 0.3, snack: 0.1 }
      : { breakfast: 0.25, lunch: 0.4, dinner: 0.35 };

    let mealId = 1;
    
    Object.entries(mealDistribution).forEach(([mealName, percentage]) => {
      const mealCalories = Math.round(totalCalories * percentage);
      const mealMacros = {
        protein: Math.round(macros.protein * percentage),
        carbs: Math.round(macros.carbs * percentage),
        fat: Math.round(macros.fat * percentage)
      };

      const foods = this.generateFoodsForMeal(mealName, mealCalories, mealMacros);
      
      meals.push({
        id: mealId.toString(),
        name: this.getMealName(mealName),
        time: this.getMealTime(mealName),
        foods,
        calories: mealCalories,
        macros: mealMacros
      });

      mealId++;
    });

    return meals;
  }

  /**
   * Générer les aliments pour un repas
   */
  private static generateFoodsForMeal(mealName: string, calories: number, macros: { protein: number; carbs: number; fat: number }): Food[] {
    const foods: Food[] = [];
    
    // Base de données simplifiée d'aliments
    const foodDatabase = {
      breakfast: [
        { name: 'Flocons d\'avoine', protein: 13, carbs: 68, fat: 7, caloriesPer100g: 389 },
        { name: 'Œufs entiers', protein: 13, carbs: 1, fat: 11, caloriesPer100g: 155 },
        { name: 'Blanc d\'œuf', protein: 11, carbs: 0, fat: 0, caloriesPer100g: 52 },
        { name: 'Banane', protein: 1, carbs: 23, fat: 0, caloriesPer100g: 89 }
      ],
      lunch: [
        { name: 'Blanc de poulet', protein: 31, carbs: 0, fat: 3, caloriesPer100g: 165 },
        { name: 'Riz basmati', protein: 7, carbs: 78, fat: 1, caloriesPer100g: 349 },
        { name: 'Brocolis', protein: 3, carbs: 7, fat: 0, caloriesPer100g: 34 },
        { name: 'Huile d\'olive', protein: 0, carbs: 0, fat: 100, caloriesPer100g: 884 }
      ],
      dinner: [
        { name: 'Saumon', protein: 25, carbs: 0, fat: 12, caloriesPer100g: 208 },
        { name: 'Patate douce', protein: 2, carbs: 20, fat: 0, caloriesPer100g: 86 },
        { name: 'Épinards', protein: 3, carbs: 4, fat: 0, caloriesPer100g: 23 },
        { name: 'Avocat', protein: 2, carbs: 9, fat: 15, caloriesPer100g: 160 }
      ],
      snack: [
        { name: 'Yaourt grec 0%', protein: 10, carbs: 4, fat: 0, caloriesPer100g: 59 },
        { name: 'Amandes', protein: 21, carbs: 22, fat: 50, caloriesPer100g: 579 },
        { name: 'Pomme', protein: 0, carbs: 14, fat: 0, caloriesPer100g: 52 }
      ]
    };

    const availableFoods = foodDatabase[mealName as keyof typeof foodDatabase] || foodDatabase.lunch;
    
    // Sélection simple d'aliments pour atteindre les macros
    availableFoods.forEach((food, index) => {
      if (index < 3) { // Limite à 3 aliments par repas
        const quantity = Math.round((calories / availableFoods.length) / food.caloriesPer100g * 100);
        
        foods.push({
          id: `${mealName}_${index}`,
          name: food.name,
          quantity,
          unit: 'g',
          calories: Math.round(quantity * food.caloriesPer100g / 100),
          macros: {
            protein: Math.round(quantity * food.protein / 100),
            carbs: Math.round(quantity * food.carbs / 100),
            fat: Math.round(quantity * food.fat / 100)
          }
        });
      }
    });

    return foods;
  }

  /**
   * Générer un plan de suppléments
   */
  private static generateSupplementPlan(user: User, dayType: 'training' | 'rest', trainingDay?: TrainingDay): SupplementPlan {
    const supplementPlan: SupplementPlan = {
      morning: [],
      preWorkout: [],
      postWorkout: [],
      evening: []
    };

    user.profile.availableSupplements.forEach(supplement => {
      if (!supplement.available) return;

      switch (supplement.type) {
        case 'multivitamin':
          supplementPlan.morning.push({
            supplementId: supplement.id,
            name: supplement.name,
            dosage: supplement.dosage,
            time: '08:00',
            taken: false
          });
          break;
        
        case 'protein':
          if (dayType === 'training') {
            supplementPlan.postWorkout.push({
              supplementId: supplement.id,
              name: supplement.name,
              dosage: supplement.dosage,
              time: trainingDay?.timeSlot === 'morning' ? '10:00' : '18:00',
              taken: false
            });
          }
          break;
        
        case 'creatine':
          supplementPlan.morning.push({
            supplementId: supplement.id,
            name: supplement.name,
            dosage: supplement.dosage,
            time: '08:00',
            taken: false
          });
          break;
        
        case 'pre_workout':
          if (dayType === 'training') {
            supplementPlan.preWorkout.push({
              supplementId: supplement.id,
              name: supplement.name,
              dosage: supplement.dosage,
              time: trainingDay?.timeSlot === 'morning' ? '07:30' : '17:30',
              taken: false
            });
          }
          break;
        
        case 'fat_burner':
          supplementPlan.morning.push({
            supplementId: supplement.id,
            name: supplement.name,
            dosage: supplement.dosage,
            time: '08:00',
            taken: false
          });
          break;
      }
    });

    return supplementPlan;
  }

  /**
   * Générer un conseil du jour
   */
  private static generateDailyTip(user: User, dayType: 'training' | 'rest'): string {
    const tips = {
      training: [
        'Hydratez-vous bien avant, pendant et après l\'entraînement ! 💧',
        'N\'oubliez pas de vous échauffer correctement avant votre séance. 🔥',
        'Concentrez-vous sur la qualité de vos mouvements plutôt que sur la quantité. 💪',
        'Votre récupération est aussi importante que votre entraînement. 😴',
        'Prenez votre protéine dans les 30 minutes après l\'entraînement. 🥤'
      ],
      rest: [
        'Jour de repos = jour de récupération. Prenez soin de vous ! 🛋️',
        'Profitez de ce jour pour préparer vos repas de la semaine. 🍱',
        'Une marche légère favorise la récupération active. 🚶‍♂️',
        'Dormez bien, c\'est pendant le sommeil que vos muscles se reconstruisent. 😴',
        'Hydratez-vous même les jours de repos ! 💧'
      ]
    };

    const dayTips = tips[dayType];
    return dayTips[Math.floor(Math.random() * dayTips.length)];
  }

  /**
   * Obtenir le nom du repas en français
   */
  private static getMealName(mealName: string): string {
    const names = {
      breakfast: 'Petit-déjeuner',
      lunch: 'Déjeuner',
      dinner: 'Dîner',
      snack: 'Collation'
    };
    return names[mealName as keyof typeof names] || mealName;
  }

  /**
   * Obtenir l'heure du repas
   */
  private static getMealTime(mealName: string): string {
    const times = {
      breakfast: '08:00',
      lunch: '12:30',
      dinner: '19:00',
      snack: '16:00'
    };
    return times[mealName as keyof typeof times] || '12:00';
  }
}
