/**
 * Initialise Firebase et expose les instances partagées auth/db.
 * Utilisé par la couche application quelle que soit la plateforme.
 */

import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/** Configuration minimale nécessaire à l'initialisation Firebase. */
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

/** Valeurs de secours pour exécuter l'app sans clés Firebase réelles. */
const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "demo-api-key-for-development",
  authDomain: "berserkercut-app.firebaseapp.com",
  projectId: "berserkercut-app",
  storageBucket: "berserkercut-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

/**
 * Construit la configuration Firebase à partir d'Expo ou du fallback dev.
 * @returns Configuration prête pour `initializeApp`.
 */
function getFirebaseConfig(): FirebaseConfig {
  const expoExtra = Constants.expoConfig?.extra;
  
  // Préfère les variables d'environnement puis la configuration de démo.
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
 * Vérifie la cohérence de la configuration en développement.
 * @throws {Error} Si des champs critiques sont absents.
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
    
    // Check if Firebase is already initialized to prevent duplicate instances
    try {
      const existingApp = getApp();
      if (__DEV__) console.log('Firebase app already initialized, using existing instance');
      return existingApp;
    } catch (e) {
      // No app exists yet, continue with initialization
    }
    
    const app = initializeApp(config);
    
    if (__DEV__) {
      console.log('✅ [Firebase] Application initialisée avec succès');
      console.log('📝 [Firebase] Projet:', config.projectId);
      console.log('🔐 [Firebase] Auth Domain:', config.authDomain);
      console.log('📱 [Firebase] Platform:', Platform.OS);
    }
    
    return app;
    
  } catch (error) {
    console.error('❌ [Firebase] Erreur lors de l\'initialisation:', error);
    console.error('Details:', error);
    
    // Don't throw error - return a minimal app to prevent crashes
    try {
      return getApp();
    } catch {
      console.warn('Creating fallback Firebase app for error recovery');
      return initializeApp(DEFAULT_FIREBASE_CONFIG);
    }
  }
}

/** Application Firebase initialisée une seule fois. */
const app: FirebaseApp = initializeFirebaseApp();

/** Instance Auth partagée par les services applicatifs. */
export const auth: Auth = getAuth(app);

// On utilise getAuth standard pour le moment, mais pour résoudre le problème de persistence:

// Setup auth persistence appropriate for each platform
if (Platform.OS === 'web') {
  // Pour le web, nous utilisons l'implémentation standard pour le moment
  // TODO: Dans une future version, utiliser indexedDBLocalPersistence 
  // import { initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';
  // export const auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
} else {
  // Pour iOS/Android
  // TODO: Dans une future version, utiliser AsyncStorage persistence
  // import { getReactNativePersistence } from 'firebase/auth';
  // export const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
}

/** Instance Firestore utilisée pour toutes les opérations de persistance. */
export const db: Firestore = getFirestore(app);

/** Expose l'application Firebase pour les usages avancés. */
export default app;

/** Fournit un aperçu de la configuration Firebase en développement. */
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

/** Signale dans la console que le mode développement est actif. */
if (__DEV__) {
  // Hot reload support sera ajouté si nécessaire
  console.log('🔥 [Firebase] Mode développement actif');
}
