import { Platform } from 'react-native';
import AppleHealthKit, { HealthInputOptions, HealthKitPermissions, HealthUnitOptions } from 'react-native-health';
import type { HealthData, HealthServiceProvider } from '@/services/healthService';

const KG_UNIT = AppleHealthKit.Constants.Units.kilogram;

const HEALTHKIT_PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Weight,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.HeartRate,
    ],
    write: [],
  },
};

const isIOS = () => Platform.OS === 'ios';

function isHealthKitAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isIOS()) {
      resolve(false);
      return;
    }

    AppleHealthKit.isAvailable((_error, available) => {
      resolve(Boolean(available));
    });
  });
}

function initHealthKitPermissions(): Promise<boolean> {
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS, (error) => {
      resolve(!error);
    });
  });
}

function getLatestWeight(): Promise<HealthData | null> {
  const options: HealthUnitOptions = {
    unit: KG_UNIT,
  };

  return new Promise((resolve) => {
    AppleHealthKit.getLatestWeight(options, (error, result) => {
      if (error || !result || typeof result.value !== 'number') {
        resolve(null);
        return;
      }

      resolve({
        weight: Number(result.value.toFixed(2)),
        timestamp: result.startDate ? new Date(result.startDate) : new Date(),
      });
    });
  });
}

function getTodayStepCount(): Promise<number | undefined> {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  const options: HealthInputOptions = {
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
  };

  return new Promise((resolve) => {
    AppleHealthKit.getStepCount(options, (error, result) => {
      if (error || !result || typeof result.value !== 'number') {
        resolve(undefined);
        return;
      }
      resolve(Math.round(result.value));
    });
  });
}

export class AppleHealthProvider implements HealthServiceProvider {
  async isAvailable(): Promise<boolean> {
    return isHealthKitAvailable();
  }

  async requestPermissions(): Promise<boolean> {
    if (!(await isHealthKitAvailable())) {
      return false;
    }

    return initHealthKitPermissions();
  }

  async getLatestData(): Promise<HealthData | null> {
    const weight = await getLatestWeight();
    if (!weight) {
      return null;
    }

    const steps = await getTodayStepCount();
    return {
      ...weight,
      steps,
    };
  }

  async syncData(): Promise<HealthData[]> {
    const latest = await this.getLatestData();
    return latest ? [latest] : [];
  }
}

export default AppleHealthProvider;
