/**
 * Service d'authentification Firebase avec fallback mode démo
 */

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserProfile } from '../types';
import { DemoAuthService } from './demoAuth';

// Configuration pour basculer entre Firebase et mode démo
const USE_DEMO_MODE = true; // Changez à false quand Firebase est configuré

export class AuthService {
  /**
   * Créer un nouveau compte utilisateur
   */
  static async register(email: string, password: string): Promise<User> {
    if (USE_DEMO_MODE) {
      return DemoAuthService.register(email, password);
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Créer le profil utilisateur initial
      const defaultProfile: UserProfile = {
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
      };

      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        profile: defaultProfile,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Sauvegarder dans Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString()
      });

      return newUser;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  /**
   * Connexion utilisateur
   */
  static async login(email: string, password: string): Promise<User> {
    if (USE_DEMO_MODE) {
      return DemoAuthService.login(email, password);
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Récupérer les données utilisateur depuis Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Profil utilisateur non trouvé');
      }

      const userData = userDoc.data();
      
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        profile: userData.profile,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt)
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  static async logout(): Promise<void> {
    if (USE_DEMO_MODE) {
      return DemoAuthService.logout();
    }
    
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  static async updateProfile(userId: string, profileUpdates: Partial<UserProfile>): Promise<void> {
    if (USE_DEMO_MODE) {
      await DemoAuthService.updateProfile(profileUpdates);
      return;
    }
    
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        profile: profileUpdates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  /**
   * Récupérer les données utilisateur
   */
  static async getUserData(userId: string): Promise<User | null> {
    if (USE_DEMO_MODE) {
      return DemoAuthService.getCurrentUser();
    }
    
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      
      return {
        id: userId,
        email: userData.email,
        profile: userData.profile,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt)
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  /**
   * Observer les changements d'état d'authentification
   */
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (USE_DEMO_MODE) {
      return DemoAuthService.onAuthStateChanged(callback);
    }
    
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Convertir Firebase User en notre User personnalisé
        const userData = await this.getUserData(firebaseUser.uid);
        callback(userData);
      } else {
        callback(null);
      }
    });
  }
}
