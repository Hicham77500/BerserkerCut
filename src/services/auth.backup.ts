/**
 * @fileoverview Service d'authentification Firebase avec architecture clean
 * @description Service de la couche APPLICATION gérant l'authentification utilisateur,
 * la création de comptes et la gestion des sessions. Implémente le pattern Repository
 * avec fallback mode démo pour le développement.
 * 
 * @author BerserkerCut Team
 * @version 1.0.4
 * @since 2025-07-21
 * 
 * Architecture:
 * - Couche APPLICATION (business logic)
 * - Abstractions des APIs Firebase (couche INFRASTRUCTURE)
 * - Types métier de la couche DOMAIN
 * 
 * @example
 * ```typescript
 * // Inscription d'un nouvel utilisateur
 * const user = await AuthService.register('user@example.com', 'password123');
 * 
 * // Connexion utilisateur existant
 * const user = await AuthService.login('user@example.com', 'password123');
 * 
 * // Écoute des changements d'état d'authentification
 * const unsubscribe = AuthService.onAuthStateChanged((user) => {
 *   if (user) {
 *     console.log('Utilisateur connecté:', user.email);
 *   }
 * });
 * ```
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

/**
 * Configuration pour basculer entre Firebase et mode démo
 * @description Active le mode démo pendant le développement quand Firebase n'est pas configuré
 * @todo Passer à false quand Firebase est configuré en production
 */
const USE_DEMO_MODE = true;

/**
 * Service d'authentification principal
 * @description Implémente les use cases d'authentification selon les principes de Clean Architecture.
 * Centralise toute la logique d'authentification et abstrait les détails d'implémentation Firebase.
 * 
 * Responsabilités:
 * - Gestion du cycle de vie des sessions utilisateur
 * - Création et mise à jour des profils utilisateur
 * - Validation et gestion des erreurs d'authentification
 * - Abstraction de la couche de persistance (Firebase/Demo)
 */
export class AuthService {
  /**
   * Crée un nouveau compte utilisateur avec profil initial
   * @description Use case de création de compte. Crée l'authentification Firebase
   * et initialise le profil utilisateur avec des valeurs par défaut cohérentes.
   * 
   * @param email - Adresse email de l'utilisateur (doit être valide)
   * @param password - Mot de passe (minimum 6 caractères requis par Firebase)
   * 
   * @returns Promise<User> Utilisateur créé avec profil initial
   * 
   * @throws {Error} Si l'email est déjà utilisé
   * @throws {Error} Si le mot de passe est trop faible
   * @throws {Error} Si la création du profil Firestore échoue
   * 
   * @example
   * ```typescript
   * try {
   *   const newUser = await AuthService.register('john@example.com', 'securePassword123');
   *   console.log('Compte créé pour:', newUser.email);
   * } catch (error) {
   *   console.error('Erreur création compte:', error.message);
   * }
   * ```
   */
  static async register(email: string, password: string): Promise<User> {
    // Utilisation du mode démo pendant le développement
    if (USE_DEMO_MODE) {
      return DemoAuthService.register(email, password);
    }
    
    try {
      // Étape 1: Création du compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      /**
       * Profil utilisateur par défaut avec valeurs cohérentes
       * @description Initialise un profil avec des valeurs par défaut saines
       * pour permettre à l'utilisateur de commencer immédiatement le processus d'onboarding
       */
      const defaultProfile: UserProfile = {
        // Informations de base - seront remplies pendant l'onboarding
        name: '',
        objective: 'cutting', // Objectif par défaut aligné avec l'app
        allergies: [],
        foodPreferences: [],
        
        // Données de santé - valeurs neutres pour éviter les calculs incorrects
        health: {
          weight: 0,           // À remplir obligatoirement
          height: 0,           // À remplir obligatoirement  
          age: 0,              // À remplir obligatoirement
          gender: 'male',      // Valeur par défaut, modifiable
          activityLevel: 'moderate', // Niveau moyen comme baseline
          averageSleepHours: 8,      // Recommandation standard adulte
          
          // Configuration des sources de données santé
          dataSource: {
            type: 'manual',        // Mode manuel par défaut
            isConnected: false,    // Pas de connexion HealthKit/Google Fit
            permissions: []        // Aucune permission accordée initialement
          },
          lastUpdated: new Date(),        // Timestamp de dernière mise à jour
          isManualEntry: true              // Indique une saisie manuelle vs automatique
        },
        
        // Configuration d'entraînement par défaut
        training: {
          trainingDays: [],                    // Sera configuré pendant l'onboarding
          experienceLevel: 'beginner',         // Niveau débutant par sécurité
          preferredTimeSlots: ['evening']      // Créneau le plus commun
        },
        
        // Préférences suppléments par défaut
        supplements: {
          available: [],                       // Aucun supplément disponible initialement
          preferences: {
            preferNatural: false,              // Pas de préférence par défaut
            budgetRange: 'medium',             // Budget moyen comme baseline
            allergies: []                      // Sera synchronisé avec allergies alimentaires
          }
        }
      };

      /**
       * Création de l'entité utilisateur complète
       * @description Combine les données Firebase Auth avec le profil métier
       * pour créer une entité utilisateur cohérente
       */
      const newUser: User = {
        id: firebaseUser.uid,               // ID unique Firebase
        email: firebaseUser.email!,         // Email vérifié par Firebase
        profile: defaultProfile,            // Profil initialisé avec valeurs par défaut
        createdAt: new Date(),             // Timestamp de création
        updatedAt: new Date()              // Timestamp de dernière modification
      };

      // Étape 2: Sauvegarde du profil dans Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        // Conversion des dates en Timestamp Firestore pour la persistance
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return newUser;
      
    } catch (error: any) {
      /**
       * Gestion centralisée des erreurs d'authentification
       * @description Transforme les erreurs Firebase en messages utilisateur compréhensibles
       */
      throw new Error(this.formatAuthError(error.code, error.message));
    }
  }

  /**
   * Authentifie un utilisateur existant
   * @description Use case de connexion. Vérifie les credentials et charge le profil utilisateur
   * depuis Firestore pour maintenir la cohérence des données.
   * 
   * @param email - Adresse email du compte existant
   * @param password - Mot de passe du compte
   * 
   * @returns Promise<User> Utilisateur authentifié avec profil complet
   * 
   * @throws {Error} Si les credentials sont incorrects
   * @throws {Error} Si le compte n'existe pas
   * @throws {Error} Si le profil Firestore est inaccessible
   * 
   * @example
   * ```typescript
   * try {
   *   const user = await AuthService.login('john@example.com', 'password123');
   *   console.log('Connexion réussie:', user.profile.name);
   * } catch (error) {
   *   console.error('Erreur connexion:', error.message);
   * }
   * ```
   */
  static async login(email: string, password: string): Promise<User> {
    // Mode démo pour le développement
    if (USE_DEMO_MODE) {
      return DemoAuthService.login(email, password);
    }

    try {
      // Étape 1: Authentification Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Étape 2: Récupération du profil utilisateur depuis Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        /**
         * Gestion du cas edge: utilisateur Auth existe mais pas de profil Firestore
         * @description Peut arriver si la création du profil a échoué lors de l'inscription
         * TODO: Implémenter une migration automatique ou redirection vers onboarding
         */
        throw new Error('Profil utilisateur non trouvé. Veuillez contacter le support.');
      }

      // Reconstruction de l'entité utilisateur avec données Firestore
      const userData = userDoc.data();
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        profile: userData.profile,
        createdAt: userData.createdAt.toDate(), // Conversion Timestamp Firestore -> Date JS
        updatedAt: userData.updatedAt.toDate()
      };

      return user;
      
    } catch (error: any) {
      throw new Error(this.formatAuthError(error.code, error.message));
    }
  }

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
