/**
 * Module: src/utils/config.ts
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
import Constants from 'expo-constants';

const expoExtra = Constants.expoConfig?.extra ?? {};

/**
 * Fonction: deriveLocalApiUrl
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const deriveLocalApiUrl = (): string | null => {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  if (!hostUri) return null;
  const host = hostUri.split(':')[0];
  if (!host || host === 'localhost') return null;
  return `http://${host}:4000`;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  expoExtra.apiBaseUrl ||
  deriveLocalApiUrl() ||
  '';
const FORCE_DEMO = process.env.EXPO_PUBLIC_FORCE_DEMO_MODE === 'true';
const ENABLE_NEW_UI_ENV = process.env.EXPO_PUBLIC_ENABLE_NEW_UI;
const ENABLE_NEW_UI_EXTRA = expoExtra.enableNewUi;
const ENABLE_NEW_UI = ENABLE_NEW_UI_ENV
  ? ENABLE_NEW_UI_ENV === 'true'
  : typeof ENABLE_NEW_UI_EXTRA === 'boolean'
    ? ENABLE_NEW_UI_EXTRA
    : true;

/**
 * Configuration globale de l'application (mode démo vs backend cloud).
 */
export const AppConfig = {
  API_BASE_URL,
  DEMO_MODE: FORCE_DEMO || !API_BASE_URL,
  DEBUG_MODE: __DEV__,
  ENABLE_LOCAL_STORAGE: true,
  API_TIMEOUT: 10000,
  DEMO_DELAY: 1000,
  NEW_UI_ENABLED: ENABLE_NEW_UI,
  MESSAGES: {
    DEMO_MODE_ACTIVE: '🔧 Mode développement activé - Les données sont stockées localement',
    BACKEND_OFFLINE: '⚠️ Backend indisponible - Basculement en mode local',
    SAVE_SUCCESS_DEMO: '✅ Profil sauvegardé en mode développement',
    SAVE_SUCCESS_CLOUD: '✅ Profil sauvegardé sur le backend',
    BACKEND_CONFIG_MISSING: '⚙️ Configurez EXPO_PUBLIC_API_BASE_URL pour activer la synchronisation cloud',
  },
};

/** Vérifie si un backend distant est configuré. */
export const isBackendConfigured = (): boolean => {
  return Boolean(API_BASE_URL && !FORCE_DEMO);
};

/** Détermine le mode d'exécution optimal. */
export const getOptimalMode = (): 'demo' | 'cloud' => {
  if (!isBackendConfigured()) {
    return 'demo';
  }
  return 'cloud';
};

/** Messages UI en fonction du mode courant. */
export const getUIModeMessages = (mode: 'demo' | 'cloud') => {
  if (mode === 'demo') {
    return {
      saveButton: 'Terminer',
      saveSuccess: AppConfig.MESSAGES.SAVE_SUCCESS_DEMO,
      modeIndicator: AppConfig.MESSAGES.DEMO_MODE_ACTIVE,
      offlineNote: 'Vos données sont stockées localement sur cet appareil',
    };
  }

  return {
    saveButton: 'Terminer',
    saveSuccess: AppConfig.MESSAGES.SAVE_SUCCESS_CLOUD,
    modeIndicator: '',
    offlineNote: '',
  };
};

export default AppConfig;
