/**
 * @fileoverview Service de génération de plans nutritionnels et d'entraînement avec architecture clean
 * @description Service de la couche APPLICATION gérant la planification quotidienne personnalisée,
 * incluant les plans nutritionnels, de suppléments et les recommandations basées sur les objectifs utilisateur.
 * Implémente les use cases de génération, récupération et mise à jour des plans avec fallback démo.
 * 
 * @author BerserkerCut Team
 * @version 1.0.4
 * @since 2025-07-21
 * 
 * Architecture:
 * - Couche APPLICATION (business logic de planification)
 * - Abstractions Firestore pour la persistance (couche INFRASTRUCTURE)
 * - Types métier de la couche DOMAIN (DailyPlan, NutritionPlan, etc.)
 * - Calculs nutritionnels selon formules scientifiques validées
 * 
 * Algorithmes utilisés:
 * - Harris-Benedict pour le métabolisme de base (BMR)
 * - Facteurs d'activité TDEE standardisés
 * - Répartition macro optimisée selon objectifs (cutting/recomposition/maintenance)
 * - Timing de suppléments basé sur chronobiologie
 * 
 * @example
 * ```typescript
 * // Génération d'un plan quotidien personnalisé
 * const dailyPlan = await PlanService.generateDailyPlan(user);
 * 
 * // Récupération du plan du jour
 * const todaysPlan = await PlanService.getTodaysPlan(userId);
 * 
 * // Marquage d'un supplément comme pris
 * await PlanService.markSupplementTaken(planId, supplementId);
 * 
 * // Suivi de la progression
 * const progress = await PlanService.getWeeklyProgress(userId);
 * ```
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

/**
 * Configuration pour basculer entre Firebase et mode démo
 * @description Active le mode démo pendant le développement pour tester sans Firebase
 * @todo Passer à false quand Firebase est configuré en production
 */
const USE_DEMO_MODE = true;

/**
 * Constantes nutritionnelles scientifiquement validées
 * @description Valeurs de référence utilisées dans les calculs nutritionnels
 */
const NUTRITION_CONSTANTS = {
  /** Calories par gramme de protéine */
  PROTEIN_CALORIES_PER_GRAM: 4,
  /** Calories par gramme de glucides */
  CARBS_CALORIES_PER_GRAM: 4,
  /** Calories par gramme de lipides */
  FAT_CALORIES_PER_GRAM: 9,
  
  /** Facteurs d'activité TDEE standardisés */
  ACTIVITY_FACTORS: {
    sedentary: 1.2,      // Peu ou pas d'exercice
    light: 1.375,        // Exercice léger 1-3 jours/semaine
    moderate: 1.55,      // Exercice modéré 3-5 jours/semaine
    active: 1.725,       // Exercice intense 6-7 jours/semaine
    very_active: 1.9     // Exercice très intense, travail physique
  },
  
  /** Ajustements caloriques selon objectifs */
  OBJECTIVE_MULTIPLIERS: {
    cutting: 0.8,        // Déficit de 20% pour perte de poids
    recomposition: 0.9,  // Déficit léger de 10% pour recomposition
    maintenance: 1.0     // Maintenance calorique
  },
  
  /** Bonus calorique jour d'entraînement */
  TRAINING_DAY_MULTIPLIER: 1.1
} as const;

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
export class PlanService {
  
  /**
   * Génère un plan quotidien complet basé sur le profil utilisateur
   * @description Use case principal de génération de plan. Analyse le profil utilisateur,
   * calcule les besoins nutritionnels, génère les repas et suppléments adaptés au jour.
   * Prend en compte l'objectif, le niveau d'activité, et si c'est un jour d'entraînement.
   * 
   * @param user - Profil utilisateur complet avec données santé et préférences
   * 
   * @returns Promise<DailyPlan> Plan quotidien personnalisé avec nutrition et suppléments
   * 
   * @throws {Error} Si les données utilisateur sont insuffisantes pour les calculs
   * @throws {Error} Si la sauvegarde Firestore échoue
   * 
   * @example
   * ```typescript
   * const user = await AuthService.getCurrentUser();
   * const plan = await PlanService.generateDailyPlan(user);
   * console.log(`Plan généré: ${plan.nutritionPlan.totalCalories} calories`);
   * ```
   */
  static async generateDailyPlan(user: User): Promise<DailyPlan> {
    // Mode démo pour le développement
    if (USE_DEMO_MODE) {
      return DemoPlanService.generateDailyPlan(user);
    }
    
    try {
      // Étape 1: Analyse du contexte temporel
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      /**
       * Détermination du type de jour selon le planning d'entraînement
       * @description Analyse si aujourd'hui est un jour d'entraînement programmé
       */
      const trainingDay = user.profile.training.trainingDays.find(td => td.dayOfWeek === dayOfWeek);
      const dayType = trainingDay ? 'training' : 'rest';
      
      // Étape 2: Calculs nutritionnels personnalisés
      const totalCalories = this.calculateDailyCalories(user, dayType);
      
      // Étape 3: Génération des plans spécialisés
      const nutritionPlan = this.generateNutritionPlan(user, totalCalories, dayType);
      const supplementPlan = this.generateSupplementPlan(user, dayType, trainingDay);
      
      // Étape 4: Génération de recommandation intelligente
      const dailyTip = this.generateDailyTip(user, dayType);

      /**
       * Construction de l'entité DailyPlan complète
       * @description Agrège tous les éléments du plan avec métadonnées de traçabilité
       */
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

      // Étape 5: Persistance en base avec format Firestore
      await setDoc(doc(db, 'dailyPlans', dailyPlan.id), {
        ...dailyPlan,
        // Conversion des objets Date en ISO string pour Firestore
        date: dailyPlan.date.toISOString(),
        createdAt: dailyPlan.createdAt.toISOString()
      });

      return dailyPlan;
      
    } catch (error: any) {
      console.error('Erreur lors de la génération du plan quotidien:', error);
      throw new Error(`Impossible de générer le plan quotidien: ${error.message}`);
    }
  }

  /**
   * Récupère le plan du jour actuel pour un utilisateur
   * @description Use case de récupération du plan. Cherche le plan généré pour aujourd'hui
   * ou retourne null si aucun plan n'a été généré. Gère la conversion des formats Firestore.
   * 
   * @param userId - Identifiant unique de l'utilisateur
   * 
   * @returns Promise<DailyPlan | null> Plan du jour ou null si inexistant
   * 
   * @example
   * ```typescript
   * const todaysPlan = await PlanService.getTodaysPlan(user.id);
   * if (todaysPlan) {
   *   console.log(`Vous avez ${todaysPlan.nutritionPlan.meals.length} repas prévus`);
   * } else {
   *   console.log('Aucun plan généré pour aujourd\'hui');
   * }
   * ```
   */
  static async getTodaysPlan(userId: string): Promise<DailyPlan | null> {
    if (USE_DEMO_MODE) {
      return DemoPlanService.getTodaysPlan(userId);
    }
    
    try {
      // Construction de l'ID du plan pour aujourd'hui
      const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
      const planId = `${userId}_${today}`;
      
      // Récupération depuis Firestore
      const planDoc = await getDoc(doc(db, 'dailyPlans', planId));
      
      if (!planDoc.exists()) {
        return null; // Aucun plan généré pour aujourd'hui
      }

      // Reconstruction de l'entité avec conversion des timestamps
      const planData = planDoc.data();
      return {
        ...planData,
        // Conversion des ISO strings Firestore vers objets Date JS
        date: new Date(planData.date),
        createdAt: new Date(planData.createdAt)
      } as DailyPlan;
      
    } catch (error: any) {
      console.error('Erreur lors de la récupération du plan du jour:', error);
      return null; // Retour gracieux en cas d'erreur
    }
  }

  /**
   * Marque un supplément comme pris dans le plan quotidien
   * @description Use case de suivi d'adhérence. Met à jour le statut d'un supplément
   * dans tous les créneaux où il apparaît pour maintenir la cohérence.
   * 
   * @param planId - Identifiant du plan quotidien
   * @param supplementId - Identifiant du supplément à marquer
   * 
   * @returns Promise<void>
   * 
   * @throws {Error} Si le plan n'existe pas
   * @throws {Error} Si la mise à jour échoue
   * 
   * @example
   * ```typescript
   * // Marquer la créatine comme prise
   * await PlanService.markSupplementTaken(planId, 'creatine_001');
   * ```
   */
  static async markSupplementTaken(planId: string, supplementId: string): Promise<void> {
    if (USE_DEMO_MODE) {
      return DemoPlanService.markSupplementTaken(planId, supplementId);
    }
    
    try {
      // Récupération du plan existant
      const planRef = doc(db, 'dailyPlans', planId);
      const planDoc = await getDoc(planRef);
      
      if (!planDoc.exists()) {
        throw new Error('Plan quotidien non trouvé');
      }

      const planData = planDoc.data() as DailyPlan;
      
      /**
       * Fonction de mise à jour du statut des suppléments
       * @description Parcourt tous les créneaux et marque le supplément comme pris
       * @param plan Plan de suppléments à mettre à jour
       * @returns Plan mis à jour avec nouveau statut
       */
      const updateSupplementPlan = (plan: SupplementPlan): SupplementPlan => {
        // Parcours de tous les créneaux (morning, preWorkout, postWorkout, evening)
        Object.keys(plan).forEach(timeSlot => {
          const supplements = plan[timeSlot as keyof SupplementPlan];
          supplements.forEach(supplement => {
            if (supplement.supplementId === supplementId) {
              supplement.taken = true; // Marquage comme pris
            }
          });
        });
        return plan;
      };

      // Application de la mise à jour
      const updatedSupplementPlan = updateSupplementPlan(planData.supplementPlan);
      
      // Sauvegarde en base
      await updateDoc(planRef, {
        supplementPlan: updatedSupplementPlan
      });
      
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du supplément:', error);
      throw new Error(`Impossible de marquer le supplément: ${error.message}`);
    }
  }

  /**
   * Calcule les besoins caloriques quotidiens personnalisés
   * @description Applique la formule Harris-Benedict pour le métabolisme de base (BMR),
   * puis ajuste selon le niveau d'activité (TDEE), le type de jour et l'objectif utilisateur.
   * 
   * @private
   * @param user - Profil utilisateur avec données anthropométriques
   * @param dayType - Type de jour (entraînement ou repos)
   * 
   * @returns Nombre de calories quotidiennes recommandées
   * 
   * Formules utilisées:
   * - BMR Homme: 88.362 + (13.397 × poids) + (4.799 × taille) - (5.677 × âge)
   * - BMR Femme: 447.593 + (9.247 × poids) + (3.098 × taille) - (4.330 × âge)
   * - TDEE = BMR × facteur d'activité
   * - Ajustements selon objectif et jour d'entraînement
   */
  private static calculateDailyCalories(user: User, dayType: 'training' | 'rest'): number {
    const { weight, height, age, gender, activityLevel } = user.profile.health;
    const { objective } = user.profile;
    
    /**
     * Calcul du métabolisme de base selon la formule Harris-Benedict révisée
     * @description Formule scientifiquement validée pour estimer les besoins énergétiques au repos
     */
    let bmr: number;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    /**
     * Calcul de la dépense énergétique totale (TDEE)
     * @description Multiplication du BMR par le facteur d'activité approprié
     */
    let tdee = bmr * NUTRITION_CONSTANTS.ACTIVITY_FACTORS[activityLevel];
    
    /**
     * Ajustement pour les jours d'entraînement
     * @description Bonus de 10% les jours d'entraînement pour compenser la dépense supplémentaire
     */
    if (dayType === 'training') {
      tdee *= NUTRITION_CONSTANTS.TRAINING_DAY_MULTIPLIER;
    }

    /**
     * Application du multiplicateur selon l'objectif
     * @description Ajustement final selon la stratégie nutritionnelle choisie
     */
    const objectiveMultiplier = NUTRITION_CONSTANTS.OBJECTIVE_MULTIPLIERS[objective] || 1.0;
    return Math.round(tdee * objectiveMultiplier);
  }

  /**
   * Génère un plan nutritionnel équilibré avec répartition macro optimisée
   * @description Calcule les macronutriments selon l'objectif, génère les repas
   * et assure une répartition calorique cohérente tout au long de la journée.
   * 
   * @private
   * @param user - Profil utilisateur pour personnalisation
   * @param totalCalories - Budget calorique quotidien calculé
   * @param dayType - Type de jour pour ajuster la répartition
   * 
   * @returns Plan nutritionnel complet avec macros et repas détaillés
   * 
   * Répartitions macro selon objectifs:
   * - Cutting: 2.2g/kg protéines, 25% lipides, reste en glucides
   * - Recomposition: 2.0g/kg protéines, 30% lipides, reste en glucides  
   * - Maintenance: 1.8g/kg protéines, 30% lipides, reste en glucides
   */
  private static generateNutritionPlan(user: User, totalCalories: number, dayType: 'training' | 'rest'): NutritionPlan {
    const { weight } = user.profile.health;
    const { objective } = user.profile;
    
    /**
     * Configuration des macronutriments selon l'objectif
     * @description Ratios scientifiquement optimisés pour chaque stratégie nutritionnelle
     */
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

    /**
     * Calculs des macronutriments en grammes
     * @description Conversion des ratios en quantités absolues selon les calories
     */
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
   * Génère les repas quotidiens avec répartition calorique optimisée
   * @description Crée une séquence de repas équilibrés selon le type de jour,
   * avec timing et macronutriments adaptés aux besoins physiologiques.
   * 
   * @private
   * @param totalCalories - Budget calorique total à répartir
   * @param macros - Objectifs macronutriments globaux
   * @param dayType - Type de jour influençant la répartition
   * 
   * @returns Liste des repas avec détail nutritionnel complet
   * 
   * Répartitions caloriques:
   * - Jour d'entraînement: 25% petit-déj, 35% déjeuner, 30% dîner, 10% collation
   * - Jour de repos: 25% petit-déj, 40% déjeuner, 35% dîner
   */
  private static generateMeals(totalCalories: number, macros: { protein: number; carbs: number; fat: number }, dayType: 'training' | 'rest'): Meal[] {
    const meals: Meal[] = [];

    /**
     * Répartition calorique optimisée selon chronobiologie
     * @description Adaptation selon le type de jour pour optimiser la performance et récupération
     */
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
  private static generateFoodsForMeal(mealName: string, calories: number, macros: { protein: number; carbs: number; fat: number }): Food[] {
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
    user.profile.supplements.available.forEach(supplement => {
      if (!supplement.available) return; // Skip suppléments non disponibles

      switch (supplement.type) {
        case 'multivitamin':
          // Multivitamines le matin pour absorption optimale
          supplementPlan.morning.push({
            supplementId: supplement.id,
            name: supplement.name,
            dosage: supplement.dosage,
            time: '08:00',
            taken: false
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
              taken: false
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
            taken: false
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
              taken: false
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
            taken: false
          });
          break;
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
  private static generateDailyTip(user: User, dayType: 'training' | 'rest'): string {
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
