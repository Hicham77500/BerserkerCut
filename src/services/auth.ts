/**
 * Service d'authentification unifiant Firebase et le mode démo.
 * Dépend de `firebase.ts` pour les instances et de `demoAuth.ts` pour le fallback local.
 */

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { auth, db } from './firebase';
import { User, UserProfile } from '../types';
import { DemoAuthService } from './demoAuth';

/**
 * Configuration pour basculer entre Firebase et mode démo
 * @description Active le mode démo pendant le développement quand Firebase n'est pas configuré
 * @todo Passer à false quand Firebase est configuré en production
 */
export const USE_DEMO_MODE = true;

/**
 * Vérifie si une valeur est un objet simple (non Date, non Array)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

/**
 * Aplati les mises à jour de profil en chemins Firestore (profile.field.subfield)
 */
function flattenProfileUpdates(profileUpdates: Partial<UserProfile>): Record<string, any> {
  const updates: Record<string, any> = {};

  const traverse = (value: unknown, path: string[]): void => {
    if (value === undefined) {
      return;
    }

    if (isPlainObject(value)) {
      Object.entries(value).forEach(([key, nestedValue]) => {
        traverse(nestedValue, [...path, key]);
      });
      return;
    }

    updates[`profile.${path.join('.')}`] = value;
  };

  Object.entries(profileUpdates).forEach(([key, value]) => {
    traverse(value, [key]);
  });

  return updates;
}

/**
 * Regroupe les opérations d'authentification exposées à l'application.
 * Orchestré autour des SDK Firebase et du service démo local.
 */
export class AuthService {
  /**
   * Crée un compte Firebase et initialise le profil utilisateur.
   * @param email Adresse de connexion du nouvel utilisateur.
   * @param password Mot de passe conforme aux règles Firebase.
   * @returns Utilisateur consolidé avec son profil Firestore.
   * @throws {Error} Si Firebase ou Firestore refusent la création.
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
      
      // Prépare un profil par défaut pour lancer l'onboarding.
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

      // Compose une entité utilisateur cohérente entre Auth et métier.
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
      // Harmonise le message d'erreur Firebase pour l'interface.
      throw new Error(AuthService.formatAuthError(error.code, error.message));
    }
  }

  /**
   * Authentifie un utilisateur puis charge son profil Firestore.
   * @param email Identifiant Firebase.
   * @param password Mot de passe saisi.
   * @returns Profil utilisateur enrichi de ses métadonnées.
   * @throws {Error} Si les identifiants ou le profil sont invalides.
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
        // Gère le cas où l'utilisateur Firebase n'a pas encore de document Firestore.
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
      throw new Error(AuthService.formatAuthError(error.code, error.message));
    }
  }

  /**
   * Termine la session active côté Firebase ou en mode démo.
   * @throws {Error} Si Firebase refuse la déconnexion.
   */
  static async logout(): Promise<void> {
    if (USE_DEMO_MODE) {
      return DemoAuthService.logout();
    }

    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(`Erreur lors de la déconnexion: ${error.message}`);
    }
  }

  /**
   * Applique des modifications partielles sur le profil utilisateur.
   * @param userId Identifiant Firebase de l'utilisateur ciblé.
   * @param profileUpdates Champs à fusionner dans `profile`.
   * @throws {Error} Quand l'écriture Firestore échoue.
   */
  static async updateProfile(userId: string, profileUpdates: Partial<UserProfile>): Promise<void> {
    if (USE_DEMO_MODE) {
      await DemoAuthService.updateProfile(profileUpdates);
      return;
    }

    try {
      const profileUpdateData = flattenProfileUpdates(profileUpdates);
      const updatePayload: Record<string, any> = {
        ...profileUpdateData,
        updatedAt: new Date() // Mise à jour du timestamp
      };

      await updateDoc(doc(db, 'users', userId), updatePayload);
    } catch (error: any) {
      throw new Error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    }
  }

  /**
   * Charge le profil Firestore associé à un identifiant Firebase.
   * @param userId Identifiant Firebase.
   * @returns Entité utilisateur consolidée.
   * @throws {Error} Si le document est introuvable ou illisible.
   */
  static async getUserProfile(userId: string): Promise<User> {
    if (USE_DEMO_MODE) {
      return DemoAuthService.getUserById(userId);
    }

    // Special handling for web platform during development
    if (__DEV__ && Platform.OS === 'web') {
      console.log('Web platform detected - checking for user profile');
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (!userDoc.exists()) {
          console.warn('User profile not found in Firestore - using a demo profile for development');
          // Return a demo profile for development on web
          return {
            id: userId,
            email: "web-demo@berserkercut.com",
            profile: {
              name: "Utilisateur Web Démo",
              objective: 'cutting',
              allergies: [],
              foodPreferences: [],
              health: {
                weight: 75,
                height: 175,
                age: 30,
                gender: 'male',
                activityLevel: 'moderate',
                averageSleepHours: 7,
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
                preferredTimeSlots: ['morning']
              },
              supplements: {
                available: [],
                preferences: {
                  preferNatural: true,
                  budgetRange: 'medium',
                  allergies: []
                }
              }
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }

        const userData = userDoc.data();
        
        // Handle potential missing date conversion 
        let createdAt: Date;
        let updatedAt: Date;
        
        try {
          createdAt = userData.createdAt.toDate();
        } catch (e) {
          createdAt = new Date();
        }
        
        try {
          updatedAt = userData.updatedAt.toDate(); 
        } catch (e) {
          updatedAt = new Date();
        }
        
        // Reconstruction de l'entité utilisateur avec données Firestore
        const user: User = {
          id: userId,
          email: userData.email || 'default@example.com',
          profile: userData.profile || {
            name: 'Utilisateur Web',
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
          createdAt,
          updatedAt
        };
  
        return user;
      } catch (error: any) {
        console.error('Error getting web user profile:', error);
        // Don't block web development - return a demo user
        return {
          id: userId,
          email: "fallback@berserkercut.com",
          profile: {
            name: "Utilisateur Fallback",
            objective: 'cutting',
            allergies: [],
            foodPreferences: [],
            health: {
              weight: 80,
              height: 180,
              age: 35,
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
      }
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('Profil utilisateur non trouvé.');
      }

      const userData = userDoc.data();
      
      // Reconstruction de l'entité utilisateur avec données Firestore
      const user: User = {
        id: userId,
        email: userData.email,
        profile: userData.profile,
        createdAt: userData.createdAt.toDate(), // Conversion Timestamp Firestore -> Date JS
        updatedAt: userData.updatedAt.toDate()
      };

      return user;
    } catch (error: any) {
      throw new Error(`Erreur lors de la récupération du profil: ${error.message}`);
    }
  }

  /**
   * Abonne un écouteur aux changements de session.
   * @param callback Handler invoqué avec l'utilisateur courant ou `null`.
   * @returns Fonction de désabonnement.
   */
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    if (USE_DEMO_MODE) {
      return DemoAuthService.onAuthStateChanged((demoUser) => {
        if (demoUser) {
          const firebaseUserLike = {
            uid: demoUser.id,
            email: demoUser.email,
            displayName: demoUser.profile?.name ?? null,
            providerId: 'demo',
            isAnonymous: false,
            emailVerified: true,
            getIdToken: async () => ''
          } as unknown as FirebaseUser;

          callback(firebaseUserLike);
        } else {
          callback(null);
        }
      });
    }

    // Wrap in try/catch to handle potential initialization issues
    try {
      // Ensure auth is properly initialized
      if (!auth) {
        console.error('Firebase Auth is not initialized');
        // Call callback with null to ensure loading state completes
        setTimeout(() => callback(null), 0);
        return () => {};
      }
      
      // Use a timeout to ensure callback is called even if Firebase is slow to respond
      const timeoutId = setTimeout(() => {
        console.warn('Firebase auth state change timeout - forcing completion');
        callback(null);
      }, 3000);
      
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        clearTimeout(timeoutId); // Clear timeout since auth responded
        callback(user);
      });
      
      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (error) {
      console.error('Error in onAuthStateChanged:', error);
      // Ensure callback is called with null on error
      setTimeout(() => callback(null), 0);
      return () => {};
    }
  }

  /**
   * Transforme un code Firebase en message lisible côté client.
   */
  private static formatAuthError(errorCode: string, originalMessage: string): string {
    // Table de correspondance pour les codes fréquents Firebase.
    const errorMessages: Record<string, string> = {
      // Erreurs d'inscription
      'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
      'auth/invalid-email': 'Adresse email invalide.',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
      
      // Erreurs de connexion
      'auth/user-not-found': 'Aucun compte associé à cette adresse email.',
      'auth/wrong-password': 'Mot de passe incorrect.',
      'auth/invalid-credential': 'Email ou mot de passe incorrect.',
      
      // Erreurs réseau et système
      'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre connexion internet.',
      'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
      
      // Erreurs de session
      'auth/user-disabled': 'Ce compte a été désactivé.',
      'auth/operation-not-allowed': 'Cette opération n\'est pas autorisée.'
    };

    // Retourne le message personnalisé ou le message original si non mappé
    return errorMessages[errorCode] || `Erreur d'authentification: ${originalMessage}`;
  }
}
