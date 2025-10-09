import '@testing-library/jest-native/extend-expect';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: true }),
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {},
  },
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock-document/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  copyAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      getParent: jest.fn(() => ({ navigate: jest.fn() })),
    }),
    useFocusEffect: (callback: () => void | (() => void)) => {
      return callback();
    },
  };
});

