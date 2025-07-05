/**
 * Service de plans en mode démo
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyPlan, User } from '../types';

export class DemoPlanService {
  /**
   * Générer un plan quotidien de démonstration
   */
  static async generateDailyPlan(user: User): Promise<DailyPlan> {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Déterminer si c'est un jour d'entraînement
    const isTrainingDay = user.profile.trainingDays.some(td => td.dayOfWeek === dayOfWeek);
    const dayType = isTrainingDay ? 'training' : 'rest';
    
    const dailyPlan: DailyPlan = {
      id: `demo_${today.toISOString().split('T')[0]}`,
      userId: user.id,
      date: today,
      dayType,
      nutritionPlan: {
        totalCalories: dayType === 'training' ? 2200 : 1800,
        macros: {
          protein: dayType === 'training' ? 180 : 150,
          carbs: dayType === 'training' ? 220 : 160,
          fat: dayType === 'training' ? 70 : 60
        },
        meals: [
          {
            id: '1',
            name: 'Petit-déjeuner',
            time: '08:00',
            foods: [
              {
                id: 'oats',
                name: 'Flocons d\'avoine',
                quantity: 80,
                unit: 'g',
                calories: 311,
                macros: { protein: 10, carbs: 54, fat: 6 }
              },
              {
                id: 'banana',
                name: 'Banane',
                quantity: 150,
                unit: 'g',
                calories: 134,
                macros: { protein: 2, carbs: 34, fat: 0 }
              },
              {
                id: 'almonds',
                name: 'Amandes',
                quantity: 20,
                unit: 'g',
                calories: 116,
                macros: { protein: 4, carbs: 4, fat: 10 }
              }
            ],
            calories: 561,
            macros: { protein: 16, carbs: 92, fat: 16 }
          },
          {
            id: '2',
            name: 'Déjeuner',
            time: '12:30',
            foods: [
              {
                id: 'chicken',
                name: 'Blanc de poulet',
                quantity: 150,
                unit: 'g',
                calories: 248,
                macros: { protein: 47, carbs: 0, fat: 5 }
              },
              {
                id: 'rice',
                name: 'Riz basmati',
                quantity: 80,
                unit: 'g',
                calories: 279,
                macros: { protein: 6, carbs: 62, fat: 1 }
              },
              {
                id: 'broccoli',
                name: 'Brocolis',
                quantity: 200,
                unit: 'g',
                calories: 68,
                macros: { protein: 6, carbs: 14, fat: 0 }
              }
            ],
            calories: 595,
            macros: { protein: 59, carbs: 76, fat: 6 }
          },
          {
            id: '3',
            name: 'Collation',
            time: '16:00',
            foods: [
              {
                id: 'yogurt',
                name: 'Yaourt grec 0%',
                quantity: 200,
                unit: 'g',
                calories: 118,
                macros: { protein: 20, carbs: 8, fat: 0 }
              },
              {
                id: 'berries',
                name: 'Myrtilles',
                quantity: 100,
                unit: 'g',
                calories: 57,
                macros: { protein: 1, carbs: 14, fat: 0 }
              }
            ],
            calories: 175,
            macros: { protein: 21, carbs: 22, fat: 0 }
          },
          {
            id: '4',
            name: 'Dîner',
            time: '19:00',
            foods: [
              {
                id: 'salmon',
                name: 'Saumon',
                quantity: 120,
                unit: 'g',
                calories: 250,
                macros: { protein: 30, carbs: 0, fat: 14 }
              },
              {
                id: 'sweet_potato',
                name: 'Patate douce',
                quantity: 200,
                unit: 'g',
                calories: 172,
                macros: { protein: 4, carbs: 40, fat: 0 }
              },
              {
                id: 'spinach',
                name: 'Épinards',
                quantity: 150,
                unit: 'g',
                calories: 35,
                macros: { protein: 4, carbs: 6, fat: 0 }
              }
            ],
            calories: 457,
            macros: { protein: 38, carbs: 46, fat: 14 }
          }
        ]
      },
      supplementPlan: {
        morning: [
          {
            supplementId: 'multivitamin',
            name: 'Multivitamines',
            dosage: '1 comprimé',
            time: '08:00',
            taken: false
          },
          {
            supplementId: 'creatine',
            name: 'Créatine',
            dosage: '5g',
            time: '08:00',
            taken: false
          }
        ],
        preWorkout: dayType === 'training' ? [
          {
            supplementId: 'preworkout',
            name: 'Pre-workout',
            dosage: '1 scoop',
            time: '07:30',
            taken: false
          }
        ] : [],
        postWorkout: dayType === 'training' ? [
          {
            supplementId: 'whey',
            name: 'Whey Protein',
            dosage: '30g',
            time: '10:00',
            taken: false
          }
        ] : [],
        evening: [
          {
            supplementId: 'omega3',
            name: 'Oméga-3',
            dosage: '2 capsules',
            time: '20:00',
            taken: false
          }
        ]
      },
      dailyTip: dayType === 'training' 
        ? '💪 Jour d\'entraînement ! N\'oubliez pas de vous hydrater et prenez votre protéine après l\'effort.'
        : '😴 Jour de repos parfait pour la récupération. Profitez-en pour préparer vos repas !',
      completed: false,
      createdAt: today
    };

    // Sauvegarder le plan en local
    await AsyncStorage.setItem(`plan_${dailyPlan.id}`, JSON.stringify(dailyPlan));
    
    return dailyPlan;
  }

  /**
   * Récupérer le plan du jour
   */
  static async getTodaysPlan(userId: string): Promise<DailyPlan | null> {
    const today = new Date().toISOString().split('T')[0];
    const planId = `demo_${today}`;
    
    const storedPlan = await AsyncStorage.getItem(`plan_${planId}`);
    if (storedPlan) {
      const plan = JSON.parse(storedPlan);
      plan.date = new Date(plan.date);
      plan.createdAt = new Date(plan.createdAt);
      return plan;
    }
    
    return null;
  }

  /**
   * Marquer un supplément comme pris
   */
  static async markSupplementTaken(planId: string, supplementId: string): Promise<void> {
    const storedPlan = await AsyncStorage.getItem(`plan_${planId}`);
    if (storedPlan) {
      const plan: DailyPlan = JSON.parse(storedPlan);
      
      // Marquer le supplément comme pris
      Object.keys(plan.supplementPlan).forEach(timeSlot => {
        const supplements = plan.supplementPlan[timeSlot as keyof typeof plan.supplementPlan];
        supplements.forEach(supplement => {
          if (supplement.supplementId === supplementId) {
            supplement.taken = true;
          }
        });
      });
      
      await AsyncStorage.setItem(`plan_${planId}`, JSON.stringify(plan));
    }
  }
}
