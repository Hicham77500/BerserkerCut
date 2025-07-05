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
    weight: 80,
    height: 180,
    age: 25,
    gender: 'male',
    activityLevel: 'moderate',
    objective: 'cutting',
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
    availableSupplements: [
      {
        id: 'whey',
        name: 'Whey Protein',
        type: 'protein',
        dosage: '30g',
        timing: 'post_workout',
        available: true
      },
      {
        id: 'creatine',
        name: 'Créatine',
        type: 'creatine',
        dosage: '5g',
        timing: 'morning',
        available: true
      }
    ],
    allergies: [],
    foodPreferences: []
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

export class DemoAuthService {
  /**
   * Connexion en mode démo
   */
  static async login(email: string, password: string): Promise<User> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email.includes('demo') || email === 'test@test.com') {
      await AsyncStorage.setItem('demoUser', JSON.stringify(DEMO_USER));
      return DEMO_USER;
    }
    
    throw new Error('Utilisateur non trouvé (mode démo - utilisez "demo@berserkercut.com")');
  }

  /**
   * Inscription en mode démo
   */
  static async register(email: string, password: string): Promise<User> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      ...DEMO_USER,
      email,
      profile: {
        ...DEMO_USER.profile,
        name: '', // Profil vide pour déclencher l'onboarding
        weight: 0,
        height: 0,
        age: 0,
        trainingDays: [],
        availableSupplements: []
      }
    };
    
    await AsyncStorage.setItem('demoUser', JSON.stringify(newUser));
    return newUser;
  }

  /**
   * Déconnexion
   */
  static async logout(): Promise<void> {
    await AsyncStorage.removeItem('demoUser');
  }

  /**
   * Mettre à jour le profil
   */
  static async updateProfile(userId: string, profileUpdates: Partial<UserProfile>): Promise<void> {
    const storedUser = await AsyncStorage.getItem('demoUser');
    if (storedUser) {
      const user: User = JSON.parse(storedUser);
      user.profile = { ...user.profile, ...profileUpdates };
      user.updatedAt = new Date();
      await AsyncStorage.setItem('demoUser', JSON.stringify(user));
    }
  }

  /**
   * Récupérer les données utilisateur
   */
  static async getUserData(userId: string): Promise<User | null> {
    const storedUser = await AsyncStorage.getItem('demoUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  /**
   * Observer les changements (simulé)
   */
  static onAuthStateChanged(callback: (user: any) => void): () => void {
    // Vérifier immédiatement s'il y a un utilisateur stocké
    AsyncStorage.getItem('demoUser').then(storedUser => {
      if (storedUser) {
        callback({ uid: 'demo-user-123' });
      } else {
        callback(null);
      }
    });

    // Retourner une fonction de nettoyage vide
    return () => {};
  }
}
