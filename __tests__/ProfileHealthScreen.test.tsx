import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ProfileHealthScreen } from '../src/screens/profile/ProfileHealthScreen';

const mockUpdateProfile = jest.fn().mockResolvedValue(undefined);

jest.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      profile: {
        health: {
          weight: 75,
          height: 180,
          age: 30,
          gender: 'male',
          activityLevel: 'moderate',
          averageSleepHours: 7,
          dataSource: {
            type: 'manual',
            isConnected: false,
            permissions: [],
          },
          lastUpdated: new Date('2024-01-01T00:00:00Z'),
          isManualEntry: true,
        },
      },
    },
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
  beforeEach(() => {
    mockUpdateProfile.mockClear();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('soumet les valeurs converties lors de la sauvegarde et correspond au snapshot', async () => {
    const { getByTestId, getByText, toJSON } = render(<ProfileHealthScreen />);

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

    expect(toJSON()).toMatchSnapshot();
  });
});
