// Configuration Jest dédiée au projet React Native / Expo.
module.exports = {
  // Utilise le preset officiel Expo pour bénéficier des transformations adaptées.
  preset: 'jest-expo',
  // Fichiers exécutés après le setup Jest pour enrichir les matchers et mocks personnalisés.
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', '<rootDir>/jest.setup.ts'],
  // Liste des modules à ne pas transformer (sauf exceptions whitelisting pour Expo & RN).
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-navigation|expo|expo-.*|@expo|@unimodules|unimodules|sentry-expo|native-base|react-native-vector-icons)/)'
  ],
  // Alias de modules pour reproduire les résolutions de chemins utilisés par TypeScript.
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$': '@react-native-async-storage/async-storage/jest/async-storage-mock',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Répertoires exclus de la recherche de tests (builds natifs, dépendances).
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
