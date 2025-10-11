// Étend les matchers Jest pour React Native (ex. toHaveTextContent)
// afin de disposer d'assertions adaptées aux composants natifs.
import '@testing-library/jest-native/extend-expect';

// Mock des APIs d'Expo Secure Store pour éviter les accès natifs
// et contrôler les valeurs retournées pendant les tests.
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock du module d'accès à la caméra afin de simuler l'autorisation
// et empêcher l'ouverture d'une caméra réelle pendant les tests.
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: true }),
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
}));

// Mock minimal d'expo-constants pour fournir une configuration
// par défaut sans dépendre des métadonnées du projet Expo.
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {},
  },
}));

// Mock des APIs de gestion de fichiers Expo afin de simuler
// le système de fichiers natif dans un contexte de test.
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock-document/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  copyAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock des notifications Expo pour éviter les appels natifs et simplifier les tests.
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: 'granted', granted: true, canAskAgain: true }),
  getPermissionsAsync: jest
    .fn()
    .mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
      ios: { status: 3 },
    }),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  removeNotificationSubscription: jest.fn(),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id'),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
    DATE: 'date',
  },
  IosAuthorizationStatus: {
    PROVISIONAL: 3,
  },
}));

// Mock partiel de la navigation React Navigation pour :
// - conserver le comportement réel par défaut
// - fournir des implémentations Jest aux hooks critiques
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    // Fournit une version mockée de useNavigation avec les actions courantes stubées.
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      getParent: jest.fn(() => ({ navigate: jest.fn() })),
    }),
    // Exécute immédiatement la callback pour les tests afin de simplifier les assertions.
    useFocusEffect: (callback: () => void | (() => void)) => {
      return callback();
    },
  };
});

