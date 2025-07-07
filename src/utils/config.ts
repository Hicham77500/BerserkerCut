/**
 * Configuration pour le développement et le mode demo
 * BerserkerCut
 */

export const AppConfig = {
  // Mode demo activé par défaut si Firebase n'est pas configuré
  DEMO_MODE: true,
  
  // Configuration Firebase
  FIREBASE_ENABLED: false,
  
  // Développement
  DEBUG_MODE: __DEV__,
  
  // Stockage local
  ENABLE_LOCAL_STORAGE: true,
  
  // Timeouts (en millisecondes)
  FIREBASE_TIMEOUT: 10000,
  DEMO_DELAY: 1000,
  
  // Messages
  MESSAGES: {
    DEMO_MODE_ACTIVE: '🔧 Mode développement activé - Les données sont sauvegardées localement',
    FIREBASE_OFFLINE: '⚠️ Connexion Firebase indisponible - Basculement en mode local',
    SAVE_SUCCESS_DEMO: '✅ Profil sauvegardé en mode développement',
    SAVE_SUCCESS_FIREBASE: '✅ Profil sauvegardé sur Firebase',
    FIREBASE_CONFIG_MISSING: '⚙️ Configuration Firebase requise pour la synchronisation cloud'
  }
};

/**
 * Vérifie si Firebase est correctement configuré
 */
export const isFirebaseConfigured = (): boolean => {
  // Vérifier que les variables d'environnement Firebase sont définies
  const config = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
  };

  const hasValidConfig = Object.values(config).every(
    value => value && value !== 'your-api-key' && !value.includes('example')
  );

  return hasValidConfig;
};

/**
 * Détermine le mode d'exécution optimal
 */
export const getOptimalMode = (): 'demo' | 'firebase' => {
  if (!AppConfig.FIREBASE_ENABLED) {
    return 'demo';
  }
  
  if (!isFirebaseConfigured()) {
    console.warn(AppConfig.MESSAGES.FIREBASE_CONFIG_MISSING);
    return 'demo';
  }
  
  return 'firebase';
};

/**
 * Configuration des messages utilisateur selon le mode
 */
export const getUIModeMessages = (mode: 'demo' | 'firebase') => {
  if (mode === 'demo') {
    return {
      saveButton: 'Terminer',
      saveSuccess: AppConfig.MESSAGES.SAVE_SUCCESS_DEMO,
      modeIndicator: AppConfig.MESSAGES.DEMO_MODE_ACTIVE,
      offlineNote: 'Vos données sont stockées localement sur cet appareil'
    };
  }
  
  return {
    saveButton: 'Terminer',
    saveSuccess: AppConfig.MESSAGES.SAVE_SUCCESS_FIREBASE,
    modeIndicator: '',
    offlineNote: ''
  };
};

export default AppConfig;
