import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, Linking, Platform } from 'react-native';
import { ProfileHealthScreen } from '../src/screens/profile/ProfileHealthScreen';
import { HealthService } from '../src/services/healthService';

const mockUpdateProfile = jest.fn().mockResolvedValue(undefined);

const mockUser = {
  id: 'user-1',
  profile: {
    health: {
      weight: 75,
      height: 180,
      age: 30,
      gender: 'male' as const,
      activityLevel: 'moderate' as const,
      averageSleepHours: 7,
      dataSource: {
        type: 'manual' as const,
        isConnected: false,
        permissions: [],
      },
      lastUpdated: new Date('2024-01-01T00:00:00Z'),
      isManualEntry: true,
    },
  },
};

jest.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    updateProfile: mockUpdateProfile,
  }),
}));

jest.mock('../src/hooks/useThemeMode', () => {
  const { DarkColors, DarkNavigationTheme } = require('../src/utils/theme');
  return {
    useThemeMode: () => ({
      mode: 'dark',
      preference: 'dark',
      isDark: true,
      colors: DarkColors,
      toggleTheme: jest.fn(),
      setTheme: jest.fn(),
      navigationTheme: DarkNavigationTheme,
      ready: true,
      isSystemPreferred: false,
    }),
  };
});

describe('ProfileHealthScreen', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    mockUpdateProfile.mockClear();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'ios',
    });

    mockUser.profile.health = {
      ...mockUser.profile.health,
      dataSource: {
        type: 'manual',
        isConnected: false,
        permissions: [],
      },
      isManualEntry: true,
      weight: 75,
    };
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalPlatform,
    });
    jest.restoreAllMocks();
  });

  it('soumet les valeurs converties lors de la sauvegarde', async () => {
    const { getByTestId, getByText } = render(<ProfileHealthScreen />);

    fireEvent.changeText(getByTestId('profile-health-weight'), '80');
    fireEvent.changeText(getByTestId('profile-health-height'), '182');
    fireEvent.changeText(getByTestId('profile-health-age'), '31');
    fireEvent.changeText(getByTestId('profile-health-sleep'), '7.5');

    fireEvent.press(getByText('Enregistrer'));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          health: expect.objectContaining({
            weight: 80,
            height: 182,
            age: 31,
            averageSleepHours: 7.5,
            lastUpdated: expect.any(Date),
          }),
        })
      );
    });
  });

  it('connecte Apple Santé et passe la source en apple_healthkit', async () => {
    const connectSpy = jest
      .spyOn(HealthService, 'connectAppleHealthKit')
      .mockResolvedValue(true);

    const { getByText } = render(<ProfileHealthScreen />);

    fireEvent.press(getByText('Connecter Apple Santé'));

    await waitFor(() => {
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          health: expect.objectContaining({
            dataSource: expect.objectContaining({
              type: 'apple_healthkit',
              isConnected: true,
            }),
            isManualEntry: false,
          }),
        })
      );
    });
  });

  it('synchronise le poids depuis Apple Santé quand deja connecte', async () => {
    mockUser.profile.health = {
      ...mockUser.profile.health,
      dataSource: {
        type: 'apple_healthkit',
        isConnected: true,
        permissions: ['Weight'],
      },
      isManualEntry: false,
    };

    const syncSpy = jest.spyOn(HealthService, 'syncHealthDataFromSource').mockResolvedValue({
      ...mockUser.profile.health,
      weight: 72.4,
      lastUpdated: new Date('2026-06-24T08:00:00.000Z'),
      dataSource: {
        ...mockUser.profile.health.dataSource,
        lastSyncDate: new Date('2026-06-24T08:00:00.000Z'),
      },
      isManualEntry: false,
    });

    const { getByText } = render(<ProfileHealthScreen />);
    fireEvent.press(getByText('Synchroniser mon poids'));

    await waitFor(() => {
      expect(syncSpy).toHaveBeenCalledTimes(1);
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          health: expect.objectContaining({
            weight: 72.4,
            dataSource: expect.objectContaining({ type: 'apple_healthkit' }),
          }),
        })
      );
    });
  });

  it('ouvre les reglages iOS natifs pour gerer les autorisations', async () => {
    const openSettingsSpy = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    const { getByText } = render(<ProfileHealthScreen />);

    fireEvent.press(getByText('Ouvrir les réglages iOS'));

    await waitFor(() => {
      expect(openSettingsSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('couvre le flux complet connecter puis synchroniser puis desactiver Apple Santé', async () => {
    const connectSpy = jest
      .spyOn(HealthService, 'connectAppleHealthKit')
      .mockResolvedValue(true);
    const syncSpy = jest.spyOn(HealthService, 'syncHealthDataFromSource').mockResolvedValue({
      ...mockUser.profile.health,
      dataSource: {
        type: 'apple_healthkit',
        isConnected: true,
        permissions: ['Weight'],
        lastSyncDate: new Date('2026-06-24T09:00:00.000Z'),
      },
      weight: 71.8,
      isManualEntry: false,
      lastUpdated: new Date('2026-06-24T09:00:00.000Z'),
    });
    const disconnectSpy = jest.spyOn(HealthService, 'disconnectHealthSource');

    const { getByText, rerender } = render(<ProfileHealthScreen />);

    fireEvent.press(getByText('Connecter Apple Santé'));

    await waitFor(() => {
      expect(connectSpy).toHaveBeenCalledTimes(1);
    });

    mockUser.profile.health = {
      ...mockUser.profile.health,
      dataSource: {
        type: 'apple_healthkit',
        isConnected: true,
        permissions: ['Weight'],
      },
      isManualEntry: false,
    };

    rerender(<ProfileHealthScreen />);
    fireEvent.press(getByText('Synchroniser mon poids'));

    await waitFor(() => {
      expect(syncSpy).toHaveBeenCalledTimes(1);
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          health: expect.objectContaining({
            weight: 71.8,
            dataSource: expect.objectContaining({ type: 'apple_healthkit' }),
          }),
        })
      );
    });

    fireEvent.press(getByText('Désactiver Apple Santé'));

    await waitFor(() => {
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          health: expect.objectContaining({
            dataSource: expect.objectContaining({
              type: 'manual',
              isConnected: false,
            }),
            isManualEntry: true,
          }),
        })
      );
    });
  });
});
