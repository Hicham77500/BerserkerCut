/**
 * Service d'authentification en mode démo (sans Firebase)
 * À utiliser temporairement pour tester l'interface
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserProfile } from '../types';

// Données de démo
const DEMO_USER: User = {
  id: 'demo-user-123',
  email: 'demo@berserkercut.com',
  profile: {
    name: 'Utilisateur Démo',
    objective: 'cutting',
    allergies: [],
    foodPreferences: [],
    health: {
      weight: 80,
      height: 180,
      age: 25,
      gender: 'male',
      activityLevel: 'moderate',
      averageSleepHours: 8,
      averageDailySteps: 8000,
      restingHeartRate: 65,
      dataSource: {
        type: 'manual',
        isConnected: false,
        permissions: []
      },
      lastUpdated: new Date(),
      isManualEntry: true
    },
    training: {
      trainingDays: [
        {
          dayOfWeek: 1, // Lundi
          type: 'strength',
          timeSlot: 'morning',
          duration: 60
        },
        {
          dayOfWeek: 3, // Mercredi
          type: 'strength',
          timeSlot: 'morning',
          duration: 60
        },
        {
          dayOfWeek: 5, // Vendredi
          type: 'strength',
          timeSlot: 'morning',
          duration: 60
        }
      ],
      experienceLevel: 'intermediate',
      preferredTimeSlots: ['morning']
    },
    supplements: {
      available: [
        {
          id: 'whey-protein',
          name: 'Whey Protein',
          type: 'protein',
          dosage: '30g',
          timing: 'post_workout',
          available: true
        },
        {
          id: 'creatine',
          name: 'Créatine Monohydrate',
          type: 'creatine',
          dosage: '5g',
          timing: 'post_workout',
          available: true
        }
      ],
      preferences: {
        preferNatural: false,
        budgetRange: 'medium',
        allergies: []
      }
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * Implémentation d'authentification locale stockée dans AsyncStorage.
 * Sert de remplacement à Firebase pour le développement hors connexion.
 */
export class DemoAuthService {
  private static currentUser: User | null = null;
  private static onAuthStateChangedCallbacks: Array<(user: User | null) => void> = [];

  /**
   * Recharge une éventuelle session de démo depuis le stockage persistant.
   */
  static async initialize(): Promise<void> {
    try {
      const userData = await AsyncStorage.getItem('demo_user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        this.notifyAuthStateChanged();
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des données démo:', error);
    }
  }

  /**
   * Authentifie l'utilisateur de démonstration connu.
   * @throws {Error} Si les identifiants ne correspondent pas.
   */
  static async login(email: string, password: string): Promise<User> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === 'demo@berserkercut.com' && password === 'demo123') {
      this.currentUser = DEMO_USER;
      await AsyncStorage.setItem('demo_user', JSON.stringify(DEMO_USER));
      this.notifyAuthStateChanged();
      return DEMO_USER;
    } else {
      throw new Error('Identifiants invalides');
    }
  }

  /**
   * Crée un profil de démo minimal et l'enregistre localement.
   */
  static async register(email: string, password: string): Promise<User> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: `demo-user-${Date.now()}`,
      email,
      profile: {
        name: '',
        objective: 'cutting',
        allergies: [],
        foodPreferences: [],
        health: {
          weight: 0,
          height: 0,
          age: 0,
          gender: 'male',
          activityLevel: 'moderate',
          averageSleepHours: 8,
          dataSource: {
            type: 'manual',
            isConnected: false,
            permissions: []
          },
          lastUpdated: new Date(),
          isManualEntry: true
        },
        training: {
          trainingDays: [],
          experienceLevel: 'beginner',
          preferredTimeSlots: ['evening']
        },
        supplements: {
          available: [],
          preferences: {
            preferNatural: false,
            budgetRange: 'medium',
            allergies: []
          }
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.currentUser = newUser;
    await AsyncStorage.setItem('demo_user', JSON.stringify(newUser));
    this.notifyAuthStateChanged();
    return newUser;
  }

  /**
   * Supprime la session locale de démo.
   */
  static async logout(): Promise<void> {
    this.currentUser = null;
    await AsyncStorage.removeItem('demo_user');
    this.notifyAuthStateChanged();
  }

  /**
   * Fusionne les mises à jour de profil avec l'utilisateur courant.
   */
  static async updateProfile(updates: Partial<UserProfile>): Promise<User> {
    if (!this.currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    const updatedUser: User = {
      ...this.currentUser,
      profile: {
        ...this.currentUser.profile,
        ...updates
      },
      updatedAt: new Date()
    };

    this.currentUser = updatedUser;
    await AsyncStorage.setItem('demo_user', JSON.stringify(updatedUser));
    this.notifyAuthStateChanged();
    return updatedUser;
  }

  /**
   * Renvoie l'utilisateur courant sans toucher au stockage.
   */
  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Retrouve un utilisateur de démo à partir de son identifiant.
   */
  static async getUserById(userId: string): Promise<User> {
    // In demo mode, we only have one user
    if (userId === DEMO_USER.id) {
      return DEMO_USER;
    }
    
    // If current user's ID matches, return current user
    if (this.currentUser && this.currentUser.id === userId) {
      return this.currentUser;
    }
    
    throw new Error('Utilisateur non trouvé');
  }

  /**
   * Enregistre un écouteur local sur les changements d'état demo.
   */
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.onAuthStateChangedCallbacks.push(callback);
    
    // Appeler immédiatement avec l'état actuel
    callback(this.currentUser);
    
    // Retourner une fonction pour se désinscrire
    return () => {
      const index = this.onAuthStateChangedCallbacks.indexOf(callback);
      if (index > -1) {
        this.onAuthStateChangedCallbacks.splice(index, 1);
      }
    };
  }

  private static notifyAuthStateChanged(): void {
    this.onAuthStateChangedCallbacks.forEach(callback => {
      callback(this.currentUser);
    });
  }
}

export default DemoAuthService;
