/**
 * Génère et persiste les plans quotidiens nutritionnels et de suppléments.
 * Peut fonctionner via un backend MongoDB ou un mode démo en mémoire.
 */

import { DailyPlan, User, NutritionPlan, SupplementPlan, Meal, Food, TrainingDay, Supplement } from '../types';
import { DemoPlanService } from './demoPlan';
import { apiClient } from './apiClient';
import { isDemoMode } from './appModeService';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Valeurs de référence utilisées pour les calculs nutritionnels. */
const NUTRITION_CONSTANTS = {
  // Calories par gramme de protéines, glucides et lipides.
  PROTEIN_CALORIES_PER_GRAM: 4,
  CARBS_CALORIES_PER_GRAM: 4,
  FAT_CALORIES_PER_GRAM: 9,
  
  // Facteurs d'activité appliqués au TDEE.
  ACTIVITY_FACTORS: {
    sedentary: 1.2,      // Peu ou pas d'exercice
    light: 1.375,        // Exercice léger 1-3 jours/semaine
    moderate: 1.55,      // Exercice modéré 3-5 jours/semaine
    active: 1.725,       // Exercice intense 6-7 jours/semaine
    very_active: 1.9     // Exercice très intense, travail physique
  },
  
  // Ajustements caloriques en fonction de la stratégie.
  OBJECTIVE_MULTIPLIERS: {
    cutting: 0.8,        // Déficit de 20% pour perte de poids
    recomposition: 0.9,  // Déficit léger de 10% pour recomposition
    maintenance: 1.0     // Maintenance calorique
  },
  
  // Bonus calorique appliqué les jours d'entraînement.
  TRAINING_DAY_MULTIPLIER: 1.1
} as const;

const SUPPLEMENT_TYPE_ALIASES: Record<string, Supplement['type']> = {
  preWorkout: 'pre_workout',
  'pre-workout': 'pre_workout',
  postWorkout: 'post_workout',
  'post-workout': 'post_workout',
  fatBurner: 'fat_burner',
  'fat-burner': 'fat_burner',
};

const SUPPLEMENT_TIMING_ALIASES: Record<string, Supplement['timing']> = {
  morning: 'morning',
  matin: 'morning',
  preworkout: 'pre_workout',
  preWorkout: 'pre_workout',
  'pre-workout': 'pre_workout',
  pre_workout: 'pre_workout',
  postworkout: 'post_workout',
  postWorkout: 'post_workout',
  'post-workout': 'post_workout',
  post_workout: 'post_workout',
  evening: 'evening',
  soir: 'evening',
  with_meals: 'with_meals',
  withMeals: 'with_meals',
};

/**
 * Fonction: normalizeSupplementType
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
function normalizeSupplementType(type: Supplement['type'] | string | undefined): Supplement['type'] {
  if (!type) return 'other';
  if (typeof type === 'string' && SUPPLEMENT_TYPE_ALIASES[type]) {
    return SUPPLEMENT_TYPE_ALIASES[type];
  }
  return ['protein', 'creatine', 'pre_workout', 'post_workout', 'fat_burner', 'multivitamin', 'other'].includes(type as string)
    ? (type as Supplement['type'])
    : 'other';
}

/**
 * Fonction: normalizeSupplementTiming
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
function normalizeSupplementTiming(timing: Supplement['timing'] | string | undefined): Supplement['timing'] {
  if (!timing) return 'with_meals';
  if (typeof timing === 'string' && SUPPLEMENT_TIMING_ALIASES[timing]) {
    return SUPPLEMENT_TIMING_ALIASES[timing];
  }
  return ['morning', 'pre_workout', 'post_workout', 'evening', 'with_meals'].includes(timing as string)
    ? (timing as Supplement['timing'])
    : 'with_meals';
}

/**
 * Service principal de planification nutritionnelle et d'entraînement
 * @description Implémente tous les use cases liés à la génération et gestion des plans quotidiens.
 * Centralise la logique métier de planification et abstrait les détails de persistance.
 * 
 * Responsabilités:
 * - Génération de plans personnalisés basés sur les profils utilisateur
 * - Calculs nutritionnels précis (TDEE, macros, timing)
 * - Gestion des plans de suppléments selon les objectifs
 * - Suivi de l'adhérence et des progressions
 * - Recommandations intelligentes basées sur les données historiques
 */
const useDemoMode = () => isDemoMode();

interface ApiDailyPlan extends Omit<DailyPlan, 'date' | 'createdAt'> {
  date: string;
  createdAt: string;
}

export const PLAN_RANGE_CACHE_KEY = 'BERSERKER_PLAN_RANGE_CACHE';

/**
 * Fonction: parseApiPlan
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const parseApiPlan = (plan: ApiDailyPlan | DailyPlan): DailyPlan => ({
  ...plan,
  date: plan.date instanceof Date ? plan.date : new Date(plan.date),
  createdAt: plan.createdAt instanceof Date ? plan.createdAt : new Date(plan.createdAt),
});

/**
 * Fonction: ensureDateOrdering
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const ensureDateOrdering = (from: string, to: string): { start: Date; end: Date } => {
  const start = new Date(from);
  const end = new Date(to);
  if (!Number.isFinite(start.valueOf()) || !Number.isFinite(end.valueOf())) {
    const today = new Date();
    const fallbackEnd = new Date(today);
    fallbackEnd.setDate(today.getDate() + 6);
    return { start: today, end: fallbackEnd };
  }
  return start <= end ? { start, end } : { start: end, end: start };
};

/**
 * Fonction: buildLocalRangeMock
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const buildLocalRangeMock = (userId: string, from: string, to: string): DailyPlan[] => {
  const { start, end } = ensureDateOrdering(from, to);
  const results: DailyPlan[] = [];
  const cursor = new Date(start);

  while (cursor <= end && results.length < 14) {
    const iso = cursor.toISOString().split('T')[0];
    const isTraining = cursor.getDay() % 2 === 0;
    const calories = isTraining ? 2200 : 1900;
    const protein = isTraining ? 180 : 150;
    const carbs = isTraining ? 230 : 160;
    const fat = isTraining ? 70 : 60;

    results.push({
      id: `local_${userId}_${iso}`,
      userId,
      date: new Date(cursor),
      dayType: isTraining ? 'training' : 'rest',
      nutritionPlan: {
        totalCalories: calories,
        macros: { protein, carbs, fat },
        meals: [],
      },
      supplementPlan: {
        morning: [],
        preWorkout: [],
        postWorkout: [],
        evening: [],
      },
      dailyTip: 'Synchronisation nécessaire (TODO backend)',
      completed: false,
      createdAt: new Date(),
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return results;
};

/**
 * Classe: PlanService
 * Utilite: Regroupe des comportements et etats lies a un domaine precis.
 */
export class PlanService {
  
  /**
   * Calcule et enregistre le plan quotidien d'un utilisateur.
   * @param user Profil complet comprenant santé et préférences.
   * @returns Plan consolidé avec nutrition et suppléments.
   * @throws {Error} Si les calculs ou la persistance backend échouent.
   */
  static async generateDailyPlan(user: User): Promise<DailyPlan> {
    // Mode démo pour le développement
    if (useDemoMode()) {
      return DemoPlanService.generateDailyPlan(user);
    }
    
    try {
      // Étape 1: Analyse du contexte temporel
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      // Vérifie si aujourd'hui correspond à un entraînement planifié.
      const trainingDay = user.profile.training.trainingDays.find(td => td.dayOfWeek === dayOfWeek);
      const dayType = trainingDay ? 'training' : 'rest';
      
      // Étape 2: Calculs nutritionnels personnalisés
      const totalCalories = this.calculateDailyCalories(user, dayType);
      
      // Étape 3: Génération des plans spécialisés
      const nutritionPlan = this.generateNutritionPlan(user, totalCalories, dayType);
      const supplementPlan = this.generateSupplementPlan(user, dayType, trainingDay);
      
      // Étape 4: Génération de recommandation intelligente
      const dailyTip = this.generateDailyTip(user, dayType);

      // Agrège les sections calculées avec leurs métadonnées.
      const dailyPlan: DailyPlan = {
        id: `${user.id}_${today.toISOString().split('T')[0]}`,  // Format: userId_YYYY-MM-DD
        userId: user.id,
        date: today,
        dayType,
        nutritionPlan,
        supplementPlan,
        dailyTip,
        completed: false,         // Statut initial non complété
        createdAt: new Date()    // Timestamp de génération
      };

      // Étape 5: Persistance via l'API MongoDB
      await apiClient.put(`/plans/${dailyPlan.id}`, {
        ...dailyPlan,
        date: dailyPlan.date.toISOString(),
        createdAt: dailyPlan.createdAt.toISOString(),
      });

      return dailyPlan;
      
    } catch (error: any) {
      console.error('Erreur lors de la génération du plan quotidien:', error);
      throw new Error(`Impossible de générer le plan quotidien: ${error.message}`);
    }
  }

  /**
   * Récupère le plan prévu pour la date du jour.
   * @param userId Identifiant de l'utilisateur.
   * @returns Plan existant ou `null` si aucun document.
   */
  static async getTodaysPlan(userId: string): Promise<DailyPlan | null> {
    if (useDemoMode()) {
      return DemoPlanService.getTodaysPlan(userId);
    }
    
    try {
      // Construction de l'ID du plan pour aujourd'hui
      const planData = await apiClient.get<DailyPlan | null>('/plans/today', {
        query: { userId },
      });

      if (!planData) {
        return null;
      }

      return {
        ...planData,
        date: new Date(planData.date),
        createdAt: new Date(planData.createdAt),
      };
      
    } catch (error: any) {
      console.error('Erreur lors de la récupération du plan du jour:', error);
      return null; // Retour gracieux en cas d'erreur
    }
  }

  static async getPlansRange(userId: string, from: string, to: string): Promise<DailyPlan[]> {
    if (!userId) {
      return [];
    }

    try {
      const apiPlans = await apiClient.get<ApiDailyPlan[] | DailyPlan[] | null>('/plans', {
        query: { userId, from, to },
      });

      if (!apiPlans || !Array.isArray(apiPlans)) {
        console.warn('[PlanService] getPlansRange – réponse vide (TODO backend)');
        return buildLocalRangeMock(userId, from, to);
      }

      const normalized = apiPlans.map(parseApiPlan);
      await AsyncStorage.setItem(
        PLAN_RANGE_CACHE_KEY,
        JSON.stringify({
          userId,
          from,
          to,
          updatedAt: new Date().toISOString(),
          plans: normalized.map((plan) => ({
            ...plan,
            date: plan.date.toISOString(),
            createdAt: plan.createdAt.toISOString(),
          })),
        })
      );
      return normalized;
    } catch (error) {
      console.warn('[PlanService] getPlansRange error', error);
      const cached = await AsyncStorage.getItem(PLAN_RANGE_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed?.plans) {
            return parsed.plans.map(parseApiPlan);
          }
        } catch (parseError) {
          console.warn('[PlanService] cache parse error', parseError);
        }
      }
      return buildLocalRangeMock(userId, from, to);
    }
  }

  static async updateDailyPlan(
    planId: string,
    updates: Partial<DailyPlan>,
  ): Promise<DailyPlan> {
    if (useDemoMode()) {
      return DemoPlanService.updateDailyPlan(planId, updates);
    }

    try {
      const response = await apiClient.patch(`/plans/${planId}`, updates);
      const payload = response?.data?.plan ?? response?.data;

      if (!payload) {
        throw new Error('Réponse vide du serveur');
      }

      return parseApiPlan(payload as ApiDailyPlan);
    } catch (error: any) {
      console.error('[PlanService] updateDailyPlan error', error);
      throw new Error(
        error?.message
          ? `Impossible de mettre à jour le plan quotidien: ${error.message}`
          : 'Impossible de mettre à jour le plan quotidien',
      );
    }
  }

  /**
   * Marque un supplément comme consommé dans un plan donné.
   * @param planId Identifiant du plan quotidien.
   * @param supplementId Identifiant du supplément ciblé.
   */
  static async markSupplementTaken(planId: string, supplementId: string): Promise<void> {
    if (useDemoMode()) {
      return DemoPlanService.markSupplementTaken(planId, supplementId);
    }
    
    try {
      // Récupération du plan existant
      await apiClient.post(`/plans/${planId}/supplements/${supplementId}/taken`, {});
      
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du supplément:', error);
      throw new Error(`Impossible de marquer le supplément: ${error.message}`);
    }
  }

  /** Calcule le besoin calorique quotidien en fonction du profil et du jour. */
  private static calculateDailyCalories(user: User, dayType: 'training' | 'rest'): number {
    const { weight, height, age, gender, activityLevel } = user.profile.health;
    const { objective } = user.profile;
    
    // Estime le métabolisme de base (BMR) via la formule Harris-Benedict révisée.
    let bmr: number;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Multiplie le BMR par le facteur d'activité pour obtenir le TDEE.
    let tdee = bmr * NUTRITION_CONSTANTS.ACTIVITY_FACTORS[activityLevel];
    
    // Ajoute une marge supplémentaire les jours d'entraînement.
    if (dayType === 'training') {
      tdee *= NUTRITION_CONSTANTS.TRAINING_DAY_MULTIPLIER;
    }

    // Ajuste selon l'objectif nutritionnel sélectionné.
    const objectiveMultiplier = NUTRITION_CONSTANTS.OBJECTIVE_MULTIPLIERS[objective] || 1.0;
    return Math.round(tdee * objectiveMultiplier);
  }

  /**
   * Répartit les calories du jour en macros et repas cohérents avec l'objectif.
   */
  private static generateNutritionPlan(user: User, totalCalories: number, dayType: 'training' | 'rest'): NutritionPlan {
    const { weight } = user.profile.health;
    const { objective } = user.profile;
    
    // Fixe les ratios macro selon l'objectif courant.
    let proteinPerKg: number;    // Grammes de protéines par kg de poids corporel
    let fatPercentage: number;   // Pourcentage des calories provenant des lipides
    
    switch (objective) {
      case 'cutting':
        proteinPerKg = 2.2;      // Plus de protéines pour préserver la masse musculaire
        fatPercentage = 0.25;    // Moins de lipides pour maximiser la satiété
        break;
      case 'recomposition':
        proteinPerKg = 2.0;      // Équilibre pour maintien/gain musculaire
        fatPercentage = 0.3;     // Lipides modérés pour hormones
        break;
      case 'maintenance':
        proteinPerKg = 1.8;      // Apport suffisant pour maintenance
        fatPercentage = 0.3;     // Répartition équilibrée
        break;
      default:
        proteinPerKg = 2.0;      // Valeur par défaut sécurisée
        fatPercentage = 0.3;
    }

    // Convertit les ratios en grammes à partir du budget calorique.
    const proteinGrams = Math.round(weight * proteinPerKg);
    const fatGrams = Math.round((totalCalories * fatPercentage) / NUTRITION_CONSTANTS.FAT_CALORIES_PER_GRAM);
    const carbGrams = Math.round(
      (totalCalories - (proteinGrams * NUTRITION_CONSTANTS.PROTEIN_CALORIES_PER_GRAM) - (fatGrams * NUTRITION_CONSTANTS.FAT_CALORIES_PER_GRAM)) 
      / NUTRITION_CONSTANTS.CARBS_CALORIES_PER_GRAM
    );

    // Génération des repas avec répartition intelligente
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
   * Compose la liste des repas et leur répartition calorique.
   */
  private static generateMeals(totalCalories: number, macros: { protein: number; carbs: number; fat: number }, dayType: 'training' | 'rest'): Meal[] {
    const meals: Meal[] = [];

    // Ajuste la répartition calorique selon qu'il s'agit d'un jour d'entraînement.
    const mealDistribution = dayType === 'training' 
      ? { 
          breakfast: 0.25,   // 25% - Démarrage énergétique
          lunch: 0.35,       // 35% - Repas principal pré-entraînement
          dinner: 0.3,       // 30% - Récupération post-entraînement
          snack: 0.1         // 10% - Collation stratégique
        }
      : { 
          breakfast: 0.25,   // 25% - Activation métabolique
          lunch: 0.4,        // 40% - Repas principal jour repos
          dinner: 0.35       // 35% - Dîner copieux jour repos
        };

    let mealId = 1;
    
    /**
     * Génération de chaque repas avec calcul précis des macros
     * @description Création séquentielle des repas avec répartition proportionnelle
     */
    Object.entries(mealDistribution).forEach(([mealName, percentage]) => {
      const mealCalories = Math.round(totalCalories * percentage);
      const mealMacros = {
        protein: Math.round(macros.protein * percentage),
        carbs: Math.round(macros.carbs * percentage),
        fat: Math.round(macros.fat * percentage)
      };

      // Génération des aliments pour ce repas
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
   * Génère les aliments spécifiques pour un repas donné
   * @description Sélectionne et calcule les quantités d'aliments depuis une base de données
   * nutritionnelle pour atteindre les objectifs caloriques et macronutriments du repas.
   * 
   * @private
   * @param mealName - Nom du repas (breakfast, lunch, dinner, snack)
   * @param calories - Objectif calorique du repas
   * @param macros - Objectifs macronutriments du repas
   * 
   * @returns Liste d'aliments avec quantités calculées
   * 
   * Base de données alimentaire:
   * - Aliments sélectionnés pour qualité nutritionnelle
   * - Valeurs nutritionnelles pour 100g
   * - Répartition par type de repas pour cohérence gustative
   */
  private static generateFoodsForMeal(mealName: string, calories: number, _macros: { protein: number; carbs: number; fat: number }): Food[] {
    const foods: Food[] = [];
    
    /**
     * Base de données nutritionnelle simplifiée mais précise
     * @description Aliments de référence avec profils macro équilibrés
     * Valeurs nutritionnelles pour 100g d'aliment
     */
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

    // Sélection des aliments appropriés au repas
    const availableFoods = foodDatabase[mealName as keyof typeof foodDatabase] || foodDatabase.lunch;
    
    /**
     * Algorithme de sélection et calcul des quantités
     * @description Répartition équitable des calories entre aliments sélectionnés
     * TODO: Implémenter un algorithme plus sophistiqué basé sur les ratios macro exacts
     */
    availableFoods.forEach((food, index) => {
      if (index < 3) { // Limitation à 3 aliments par repas pour simplicité
        // Calcul de quantité basé sur répartition calorique équitable
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
   * Génère un plan de suppléments personnalisé selon objectifs et timing
   * @description Crée un protocole de supplémentation adapté au profil utilisateur,
   * avec timing optimisé selon la chronobiologie et les jours d'entraînement.
   * 
   * @private
   * @param user - Profil utilisateur avec suppléments disponibles
   * @param dayType - Type de jour influençant le timing
   * @param trainingDay - Détails du jour d'entraînement si applicable
   * 
   * @returns Plan de suppléments avec créneaux et dosages
   * 
   * Logique de timing:
   * - Matin: Multivitamines, créatine, fat burners
   * - Pré-entraînement: Stimulants, boosters performance
   * - Post-entraînement: Protéines, récupération
   * - Soir: Magnésium, récupération nocturne
   */
  private static generateSupplementPlan(user: User, dayType: 'training' | 'rest', trainingDay?: TrainingDay): SupplementPlan {
    /**
     * Initialisation des créneaux de supplémentation
     * @description Structure organisée par moment de prise optimal
     */
    const supplementPlan: SupplementPlan = {
      morning: [],      // Suppléments matinaux
      preWorkout: [],   // Pré-entraînement
      postWorkout: [],  // Post-entraînement 
      evening: []       // Suppléments du soir
    };

    /**
     * Traitement de chaque supplément disponible selon sa catégorie
     * @description Assignation intelligente aux créneaux selon propriétés pharmacologiques
     */
    user.profile.supplements.available.forEach((supplement) => {
      if (!supplement || supplement.available === false) return;

      const normalizedType = normalizeSupplementType(supplement.type);

      switch (normalizedType) {
        case 'multivitamin':
          // Multivitamines le matin pour absorption optimale
          supplementPlan.morning.push({
            supplementId: supplement.id,
            name: supplement.name,
            dosage: supplement.dosage,
            time: '08:00',
            taken: false,
            unit: supplement.unit,
            quantity: supplement.quantity,
          });
          break;
        
        case 'protein':
          // Protéines post-entraînement les jours d'entraînement
          if (dayType === 'training') {
            const postWorkoutTime = trainingDay?.timeSlot === 'morning' ? '10:00' : '18:00';
            supplementPlan.postWorkout.push({
              supplementId: supplement.id,
              name: supplement.name,
              dosage: supplement.dosage,
              time: postWorkoutTime,
              taken: false,
              unit: supplement.unit,
              quantity: supplement.quantity,
            });
          }
          break;
        
        case 'creatine':
          // Créatine le matin pour timing optimal (pas dépendant de l'entraînement)
          supplementPlan.morning.push({
            supplementId: supplement.id,
            name: supplement.name,
            dosage: supplement.dosage,
            time: '08:00',
            taken: false,
            unit: supplement.unit,
            quantity: supplement.quantity,
          });
          break;
        
        case 'pre_workout':
          // Pré-workout uniquement les jours d'entraînement
          if (dayType === 'training') {
            const preWorkoutTime = trainingDay?.timeSlot === 'morning' ? '07:30' : '17:30';
            supplementPlan.preWorkout.push({
              supplementId: supplement.id,
              name: supplement.name,
              dosage: supplement.dosage,
              time: preWorkoutTime,
              taken: false,
              unit: supplement.unit,
              quantity: supplement.quantity,
            });
          }
          break;
        
        case 'fat_burner':
          // Fat burners le matin à jeun pour efficacité maximale
          supplementPlan.morning.push({
            supplementId: supplement.id,
            name: supplement.name,
            dosage: supplement.dosage,
            time: '08:00',
            taken: false,
            unit: supplement.unit,
            quantity: supplement.quantity,
          });
          break;
        default: {
          const mappedTiming = normalizeSupplementTiming(supplement.timing);
          const slot = mappedTiming === 'pre_workout'
            ? 'preWorkout'
            : mappedTiming === 'post_workout'
              ? 'postWorkout'
              : mappedTiming === 'evening'
                ? 'evening'
                : 'morning';

          const collection = supplementPlan[slot as keyof SupplementPlan];
          collection.push({
            supplementId: supplement.id,
            name: supplement.name,
            dosage: supplement.dosage,
            time: slot === 'preWorkout' ? '07:30' : slot === 'postWorkout' ? '20:30' : slot === 'evening' ? '21:00' : '08:00',
            taken: false,
            unit: supplement.unit,
            quantity: supplement.quantity,
          });
        }
      }
    });

    return supplementPlan;
  }

  /**
   * Génère un conseil quotidien contextuel et motivant
   * @description Sélectionne aléatoirement un conseil adapté au type de jour
   * pour maintenir l'engagement et fournir des rappels utiles.
   * 
   * @private
   * @param user - Profil utilisateur pour personnalisation future
   * @param dayType - Type de jour déterminant la catégorie de conseil
   * 
   * @returns Conseil du jour avec emoji pour engagement
   * 
   * Catégories de conseils:
   * - Jours d'entraînement: Hydratation, échauffement, technique, récupération
   * - Jours de repos: Récupération active, préparation, sommeil, hydratation
   */
  private static generateDailyTip(_user: User, dayType: 'training' | 'rest'): string {
    /**
     * Base de données de conseils catégorisés
     * @description Conseils validés scientifiquement pour optimiser résultats
     */
    const tips = {
      training: [
        'Hydratez-vous bien avant, pendant et après l\'entraînement ! 💧',
        'N\'oubliez pas de vous échauffer correctement avant votre séance. 🔥',
        'Concentrez-vous sur la qualité de vos mouvements plutôt que sur la quantité. 💪',
        'Votre récupération est aussi importante que votre entraînement. 😴',
        'Prenez votre protéine dans les 30 minutes après l\'entraînement. 🥤',
        'Respirez correctement pendant vos exercices pour maximiser les performances. 🫁',
        'N\'hésitez pas à vous filmer pour corriger votre technique. 📱',
        'Un bon échauffement prévient 80% des blessures. ⚡'
      ],
      rest: [
        'Jour de repos = jour de récupération. Prenez soin de vous ! 🛋️',
        'Profitez de ce jour pour préparer vos repas de la semaine. 🍱',
        'Une marche légère favorise la récupération active. 🚶‍♂️',
        'Dormez bien, c\'est pendant le sommeil que vos muscles se reconstruisent. 😴',
        'Hydratez-vous même les jours de repos ! 💧',
        'Prenez le temps de vous étirer et de faire de la mobilité. 🧘‍♂️',
        'La récupération mentale est aussi importante que physique. 🧠',
        'Profitez-en pour planifier vos prochaines séances. 📅'
      ]
    };

    // Sélection aléatoire d'un conseil approprié
    const dayTips = tips[dayType];
    return dayTips[Math.floor(Math.random() * dayTips.length)];
  }

  /**
   * Convertit les noms de repas anglais en français
   * @description Mapping pour interface utilisateur française
   * 
   * @private
   * @param mealName - Nom du repas en anglais
   * @returns Nom du repas en français
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
   * Définit les heures recommandées pour chaque repas
   * @description Timing optimisé selon chronobiologie nutritionnelle
   * 
   * @private
   * @param mealName - Nom du repas
   * @returns Heure recommandée au format HH:MM
   */
  private static getMealTime(mealName: string): string {
    const times = {
      breakfast: '08:00',   // Activation métabolique matinale
      lunch: '12:30',       // Pic naturel d'appétit
      dinner: '19:00',      // Dîner avant ralentissement métabolique
      snack: '16:00'        // Creux énergétique après-midi
    };
    return times[mealName as keyof typeof times] || '12:00';
  }
}
