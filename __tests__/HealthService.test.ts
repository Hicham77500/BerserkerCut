import { HealthService } from '../src/services/healthService';
import { HealthProfile } from '../src/types';

describe('HealthService non-regression', () => {
  const baseProfile: HealthProfile = {
    weight: 80,
    height: 180,
    age: 30,
    gender: 'male',
    activityLevel: 'moderate',
    averageSleepHours: 7,
    averageDailySteps: 6000,
    dataSource: {
      type: 'manual',
      isConnected: false,
      permissions: [],
    },
    lastUpdated: new Date('2026-06-20T10:00:00.000Z'),
    isManualEntry: true,
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('connectAppleHealthKit retourne true quand provider disponible et autorise', async () => {
    HealthService.registerProvider('apple_healthkit', {
      isAvailable: jest.fn().mockResolvedValue(true),
      requestPermissions: jest.fn().mockResolvedValue(true),
      getLatestData: jest.fn().mockResolvedValue(null),
      syncData: jest.fn().mockResolvedValue([]),
    });

    await expect(HealthService.connectAppleHealthKit()).resolves.toBe(true);
  });

  it('connectAppleHealthKit retourne false si provider indisponible', async () => {
    HealthService.registerProvider('apple_healthkit', {
      isAvailable: jest.fn().mockResolvedValue(false),
      requestPermissions: jest.fn().mockResolvedValue(true),
      getLatestData: jest.fn().mockResolvedValue(null),
      syncData: jest.fn().mockResolvedValue([]),
    });

    await expect(HealthService.connectAppleHealthKit()).resolves.toBe(false);
  });

  it('syncHealthDataFromSource fusionne les donnees provider avec le profil', async () => {
    HealthService.registerProvider('apple_healthkit', {
      isAvailable: jest.fn().mockResolvedValue(true),
      requestPermissions: jest.fn().mockResolvedValue(true),
      getLatestData: jest.fn().mockResolvedValue({
        weight: 77.3,
        steps: 9200,
        heartRate: 58,
        sleepHours: 7.8,
        timestamp: new Date('2026-06-24T09:30:00.000Z'),
      }),
      syncData: jest.fn().mockResolvedValue([]),
    });

    const result = await HealthService.syncHealthDataFromSource({
      ...baseProfile,
      dataSource: {
        type: 'apple_healthkit',
        isConnected: true,
        permissions: ['Weight'],
      },
      isManualEntry: false,
    });

    expect(result).toEqual(
      expect.objectContaining({
        weight: 77.3,
        averageDailySteps: 9200,
        restingHeartRate: 58,
        averageSleepHours: 7.8,
        isManualEntry: false,
        dataSource: expect.objectContaining({
          type: 'apple_healthkit',
          isConnected: true,
          lastSyncDate: new Date('2026-06-24T09:30:00.000Z'),
        }),
      })
    );
  });

  it('disconnectHealthSource repasse en manuel sans casser les autres mesures', () => {
    const disconnected = HealthService.disconnectHealthSource({
      ...baseProfile,
      dataSource: {
        type: 'apple_healthkit',
        isConnected: true,
        permissions: ['Weight'],
        lastSyncDate: new Date('2026-06-24T09:00:00.000Z'),
      },
      isManualEntry: false,
    });

    expect(disconnected.dataSource.type).toBe('manual');
    expect(disconnected.dataSource.isConnected).toBe(false);
    expect(disconnected.dataSource.permissions).toEqual([]);
    expect(disconnected.isManualEntry).toBe(true);
    expect(disconnected.weight).toBe(80);
  });
});
