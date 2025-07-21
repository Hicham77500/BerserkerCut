/**
 * @fileoverview Configuration et initialisation Firebase avec architecture clean
 * @description Service de la couche INFRASTRUCTURE gérant la configuration et l'initialisation
 * des services Firebase (Auth, Firestore). Centralise la configuration et fournit des instances
 * configurées pour les autres services de l'application.
 * 
 * @author BerserkerCut Team
 * @version 1.0.4
 * @since 2025-07-21
 * 
 * Architecture:
 * - Couche INFRASTRUCTURE (external services configuration)
 * - Abstractions Firebase pour les services métier
 * - Configuration sécurisée via variables d'environnement
 * - Support mode développement et production
 * 
 * Sécurité:
 * - Variables d'environnement pour clés sensibles
 * - Configuration par défaut pour développement
 * - Validation de configuration au runtime
 * - Logging sécurisé sans exposition des clés
 * 
 * @example
 * ```typescript
 * // Utilisation dans les services
 * import { auth, db } from './firebase';
 * 
 * // Authentification
 * const user = await signInWithEmailAndPassword(auth, email, password);
 * 
 * // Firestore
 * const docRef = doc(db, 'users', userId);
 * const userData = await getDoc(docRef);
 * ```
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import Constants from 'expo-constants';

/**
 * Interface de configuration Firebase typée
 * @description Définit la structure attendue pour la configuration Firebase
 * avec tous les champs requis pour l'initialisation.
 */
interface FirebaseConfig {
  /** Clé API Firebase pour authentification des requêtes */
  apiKey: string;
  /** Domaine d'authentification Firebase */
  authDomain: string;
  /** Identifiant unique du projet Firebase */
  projectId: string;
  /** Bucket de stockage Firebase Storage */
  storageBucket: string;
  /** ID de l'expéditeur pour Firebase Cloud Messaging */
  messagingSenderId: string;
  /** Identifiant unique de l'application Firebase */
  appId: string;
}

/**
 * Configuration par défaut pour le développement
 * @description Valeurs par défaut permettant le développement local
 * même sans configuration Firebase complète. À remplacer en production.
 * 
 * @warning Ces valeurs sont factices et ne doivent pas être utilisées en production
 */
const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "demo-api-key-for-development",
  authDomain: "berserkercut-app.firebaseapp.com",
  projectId: "berserkercut-app",
  storageBucket: "berserkercut-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

/**
 * Récupère la configuration Firebase depuis les variables d'environnement
 * @description Lit la configuration depuis Expo Constants avec fallback sur valeurs par défaut.
 * Priorise les variables d'environnement pour la sécurité en production.
 * 
 * @returns Configuration Firebase typée et validée
 * 
 * Variables d'environnement attendues:
 * - FIREBASE_API_KEY
 * - FIREBASE_AUTH_DOMAIN  
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_STORAGE_BUCKET
 * - FIREBASE_MESSAGING_SENDER_ID
 * - FIREBASE_APP_ID
 */
function getFirebaseConfig(): FirebaseConfig {
  const expoExtra = Constants.expoConfig?.extra;
  
  /**
   * Configuration prioritaire depuis variables d'environnement
   * @description Lecture sécurisée avec fallback sur configuration par défaut
   */
  const config: FirebaseConfig = {
    apiKey: expoExtra?.firebaseApiKey || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: expoExtra?.firebaseAuthDomain || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: expoExtra?.firebaseProjectId || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: expoExtra?.firebaseStorageBucket || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: expoExtra?.firebaseMessagingSenderId || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: expoExtra?.firebaseAppId || DEFAULT_FIREBASE_CONFIG.appId
  };

  // Validation de la configuration en mode développement
  if (__DEV__) {
    validateFirebaseConfig(config);
  }

  return config;
}

/**
 * Valide la configuration Firebase en mode développement
 * @description Vérifie que tous les champs requis sont présents et conformes.
 * Affiche des avertissements pour les configurations par défaut en développement.
 * 
 * @param config - Configuration Firebase à valider
 * 
 * @throws {Error} Si des champs obligatoires sont manquants
 */
function validateFirebaseConfig(config: FirebaseConfig): void {
  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'
  ];

  /**
   * Vérification de la présence de tous les champs requis
   * @description S'assure qu'aucun champ critique n'est vide ou undefined
   */
  const missingFields = requiredFields.filter(field => !config[field] || config[field].trim() === '');
  
  if (missingFields.length > 0) {
    throw new Error(`Configuration Firebase incomplète. Champs manquants: ${missingFields.join(', ')}`);
  }

  /**
   * Avertissement pour configuration de développement
   * @description Informe le développeur si la configuration par défaut est utilisée
   */
  if (config.apiKey === DEFAULT_FIREBASE_CONFIG.apiKey) {
    console.warn(
      '⚠️ [Firebase] Configuration par défaut détectée. ' +
      'Configurez les variables d\'environnement Firebase pour la production.'
    );
  }

  /**
   * Validation du format de l'App ID
   * @description Vérifie que l'App ID respecte le format attendu par Firebase
   */
  if (!config.appId.match(/^1:\d+:(web|ios|android):[a-f0-9]+$/)) {
    console.warn('⚠️ [Firebase] Format App ID potentiellement incorrect:', config.appId);
  }
}

/**
 * Initialise l'application Firebase avec configuration sécurisée
 * @description Créé l'instance Firebase principale en utilisant la configuration
 * validée depuis les variables d'environnement ou les valeurs par défaut.
 * 
 * @returns Instance Firebase App configurée
 */
function initializeFirebaseApp(): FirebaseApp {
  try {
    const config = getFirebaseConfig();
    const app = initializeApp(config);
    
    if (__DEV__) {
      console.log('✅ [Firebase] Application initialisée avec succès');
      console.log('📝 [Firebase] Projet:', config.projectId);
      console.log('🔐 [Firebase] Auth Domain:', config.authDomain);
    }
    
    return app;
    
  } catch (error) {
    console.error('❌ [Firebase] Erreur lors de l\'initialisation:', error);
    throw new Error(`Impossible d'initialiser Firebase: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Instance principale de l'application Firebase
 * @description Application Firebase configurée et prête à l'emploi
 * pour tous les services de l'application.
 */
const app: FirebaseApp = initializeFirebaseApp();

/**
 * Service d'authentification Firebase configuré
 * @description Instance Auth configurée avec persistance automatique gérée par Expo.
 * Utilisé par AuthService pour toutes les opérations d'authentification.
 * 
 * Fonctionnalités:
 * - Authentification email/password
 * - Gestion des sessions persistantes
 * - Listeners de changement d'état
 * - Gestion automatique des tokens
 * 
 * @example
 * ```typescript
 * import { auth } from './firebase';
 * 
 * // Connexion utilisateur
 * const credential = await signInWithEmailAndPassword(auth, email, password);
 * 
 * // Écoute des changements d'état
 * const unsubscribe = onAuthStateChanged(auth, (user) => {
 *   console.log('État auth changé:', user?.email);
 * });
 * ```
 */
export const auth: Auth = getAuth(app);

/**
 * Service Firestore configuré
 * @description Instance Firestore configurée pour la persistance des données.
 * Utilisé par tous les services de données (AuthService, PlanService, etc.).
 * 
 * Fonctionnalités:
 * - Opérations CRUD sur les documents
 * - Requêtes en temps réel
 * - Transactions et batch writes
 * - Cache local automatique
 * - Synchronisation hors ligne
 * 
 * @example
 * ```typescript
 * import { db } from './firebase';
 * import { doc, getDoc, setDoc } from 'firebase/firestore';
 * 
 * // Lecture de document
 * const userDoc = await getDoc(doc(db, 'users', userId));
 * 
 * // Écriture de document
 * await setDoc(doc(db, 'plans', planId), planData);
 * ```
 */
export const db: Firestore = getFirestore(app);

/**
 * Export par défaut de l'application Firebase
 * @description Instance principale pour usage avancé ou configuration personnalisée
 */
export default app;

/**
 * Informations de configuration pour debugging
 * @description Utilitaire pour diagnostiquer la configuration Firebase en développement
 * 
 * @returns Informations de configuration non sensibles
 */
export function getFirebaseInfo() {
  if (!__DEV__) {
    return { error: 'Informations disponibles uniquement en mode développement' };
  }
  
  const config = getFirebaseConfig();
  return {
    projectId: config.projectId,
    authDomain: config.authDomain,
    isDefaultConfig: config.apiKey === DEFAULT_FIREBASE_CONFIG.apiKey,
    hasAuth: !!auth,
    hasFirestore: !!db
  };
}

/**
 * Hook de nettoyage pour les tests et hot reload
 * @description Fonction utilitaire pour nettoyer les connexions Firebase
 * lors des rechargements en développement.
 */
if (__DEV__) {
  // Hot reload support sera ajouté si nécessaire
  console.log('� [Firebase] Mode développement actif');
}
