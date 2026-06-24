/**
 * Service de gestion des données de santé et d'activité
 * Architecture évolutive pour HealthKit/Google Fit
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HealthProfile, HealthDataSource } from '../types';
import { AppleHealthProvider } from './providers/appleHealthProvider';

export interface HealthData {
  weight?: number;
  height?: number;
  steps?: number;
  heartRate?: number;
  sleepHours?: number;
  timestamp: Date;
}

export interface HealthServiceProvider {
  isAvailable(): Promise<boolean>;
  requestPermissions(): Promise<boolean>;
  getLatestData(): Promise<HealthData | null>;
  syncData(): Promise<HealthData[]>;
}

/**
 * Service principal de gestion des données de santé
 */
export class HealthService {
  private static providers: Map<string, HealthServiceProvider> = new Map();

  /**
   * Enregistrer un provider (HealthKit, Google Fit, etc.)
   */
  static registerProvider(type: string, provider: HealthServiceProvider) {
    this.providers.set(type, provider);
  }

  static async connectAppleHealthKit(): Promise<boolean> {
    const provider = this.providers.get('apple_healthkit');
    if (!provider) {
      return false;
    }

    const available = await provider.isAvailable();
    if (!available) {
      return false;
    }

    return provider.requestPermissions();
  }

  static async syncHealthDataFromSource(
    profile: HealthProfile,
  ): Promise<HealthProfile | null> {
    const provider = this.providers.get(profile.dataSource.type);
    if (!provider) {
      return null;
    }

    const latestData = await provider.getLatestData();
    if (!latestData) {
      return null;
    }

    const nextProfile: HealthProfile = {
      ...profile,
      weight: typeof latestData.weight === 'number' ? latestData.weight : profile.weight,
      averageDailySteps:
        typeof latestData.steps === 'number' ? latestData.steps : profile.averageDailySteps,
      restingHeartRate:
        typeof latestData.heartRate === 'number'
          ? latestData.heartRate
          : profile.restingHeartRate,
      averageSleepHours:
        typeof latestData.sleepHours === 'number'
          ? latestData.sleepHours
          : profile.averageSleepHours,
      dataSource: {
        ...profile.dataSource,
        isConnected: true,
        lastSyncDate: latestData.timestamp,
      },
      lastUpdated: latestData.timestamp,
      isManualEntry: false,
    };

    return nextProfile;
  }

  static disconnectHealthSource(profile: HealthProfile): HealthProfile {
    return {
      ...profile,
      dataSource: {
        type: 'manual',
        isConnected: false,
        permissions: [],
      },
      isManualEntry: true,
      lastUpdated: new Date(),
    };
  }

  /**
   * Obtenir les données de santé depuis la source configurée
   */
  static async getHealthData(dataSource: HealthDataSource): Promise<HealthData | null> {
    try {
      if (dataSource.type === 'manual') {
        return await this.getManualData();
      }

      const provider = this.providers.get(dataSource.type);
      if (!provider) {
        throw new Error(`Provider ${dataSource.type} not registered`);
      }

      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        console.warn(`Provider ${dataSource.type} not available, falling back to manual`);
        return await this.getManualData();
      }

      return await provider.getLatestData();
    } catch (error) {
      console.error('Error getting health data:', error);
      return await this.getManualData();
    }
  }

  /**
   * Sauvegarder les données de santé manuelles
   */
  static async saveManualHealthData(data: Partial<HealthData>): Promise<void> {
    try {
      const existingData = await this.getManualData();
      const updatedData = {
        ...existingData,
        ...data,
        timestamp: new Date(),
      };

      await AsyncStorage.setItem('manual_health_data', JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving manual health data:', error);
      throw error;
    }
  }

  /**
   * Récupérer les données manuelles stockées
   */
  private static async getManualData(): Promise<HealthData | null> {
    try {
      const data = await AsyncStorage.getItem('manual_health_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting manual data:', error);
      return null;
    }
  }

  /**
   * Créer un profil de santé par défaut
   */
  static createDefaultHealthProfile(): HealthProfile {
    return {
      weight: 0,
      height: 0,
      age: 0,
      gender: 'male',
      activityLevel: 'moderate',
      averageSleepHours: 7,
      dataSource: {
        type: 'manual',
        isConnected: false,
        permissions: []
      },
      lastUpdated: new Date(),
      isManualEntry: true,
    };
  }

  /**
   * Valider les données de santé
   */
  static validateHealthData(data: Partial<HealthData>): boolean {
    if (data.weight && (data.weight < 30 || data.weight > 300)) return false;
    if (data.height && (data.height < 100 || data.height > 250)) return false;
    if (data.steps && (data.steps < 0 || data.steps > 50000)) return false;
    if (data.heartRate && (data.heartRate < 40 || data.heartRate > 200)) return false;
    if (data.sleepHours && (data.sleepHours < 1 || data.sleepHours > 12)) return false;
    
    return true;
  }

  /**
   * Calculer l'IMC
   */
  static calculateBMI(weight: number, height: number): number {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }

  /**
   * Obtenir la catégorie d'IMC
   */
  static getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Insuffisance pondérale';
    if (bmi < 25) return 'Poids normal';
    if (bmi < 30) return 'Surpoids';
    return 'Obésité';
  }

  /**
   * Estimer le niveau d'activité basé sur les pas
   */
  static estimateActivityLevel(dailySteps: number): HealthProfile['activityLevel'] {
    if (dailySteps < 3000) return 'sedentary';
    if (dailySteps < 6000) return 'light';
    if (dailySteps < 10000) return 'moderate';
    if (dailySteps < 15000) return 'active';
    return 'very_active';
  }
}

/**
 * Provider pour données manuelles (implémentation par défaut)
 */
export class ManualHealthProvider implements HealthServiceProvider {
  async isAvailable(): Promise<boolean> {
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    return true;
  }

  async getLatestData(): Promise<HealthData | null> {
    return HealthService.getHealthData({
      type: 'manual',
      isConnected: true,
    });
  }

  async syncData(): Promise<HealthData[]> {
    const data = await this.getLatestData();
    return data ? [data] : [];
  }
}

// Enregistrer le provider manuel par défaut
HealthService.registerProvider('manual', new ManualHealthProvider());
HealthService.registerProvider('apple_healthkit', new AppleHealthProvider());

export default HealthService;
