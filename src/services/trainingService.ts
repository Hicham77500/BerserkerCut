/**
 * Service pour la gestion des profils d'entraînement
 * Supporte un backend MongoDB (via API) ainsi qu'un mode démo local.
 */

import { ExtendedTrainingProfile } from '../types/TrainingProfile';
import { getOptimalMode } from '../utils/config';
import { apiClient } from './apiClient';

// Déterminer le mode optimal automatiquement
const getCurrentOperatingMode = () => getOptimalMode();

/**
 * Sauvegarde locale en mode demo
 */
const saveDemoProfile = async (userId: string, data: ExtendedTrainingProfile): Promise<void> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const key = `training_profile_${userId}`;
    const dataToSave = {
      ...data,
      completedAt: new Date().toISOString(),
      savedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(key, JSON.stringify(dataToSave));
    console.log('✅ Profil d\'entraînement sauvegardé en mode démo');
  } catch (error) {
    console.error('❌ Erreur sauvegarde demo:', error);
    throw new Error('Erreur de sauvegarde en mode démo');
  }
};

/**
 * Sauvegarde le profil d'entraînement via l'API MongoDB
 */
export const saveTrainingProfile = async (
  userId: string,
  trainingData: ExtendedTrainingProfile
): Promise<void> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!trainingData.healthDeclaration.declareGoodHealth) {
    throw new Error('La déclaration de santé est obligatoire');
  }

  if (!trainingData.healthDeclaration.acknowledgeDisclaimer) {
    throw new Error('L\'acceptation des conditions est obligatoire');
  }

  if (getCurrentOperatingMode() === 'demo') {
    return saveDemoProfile(userId, trainingData);
  }

  try {
    await apiClient.put(`/users/${userId}/training-profile`, trainingData);
  } catch (error: any) {
    throw new Error(error?.message || 'Impossible de sauvegarder le profil d\'entraînement');
  }
};

/**
 * Récupère le profil d'entraînement depuis l'API
 */
export const getTrainingProfile = async (userId: string): Promise<ExtendedTrainingProfile | null> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (getCurrentOperatingMode() === 'demo') {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const key = `training_profile_${userId}`;
      const data = await AsyncStorage.getItem(key);

      if (data) {
        const parsed = JSON.parse(data);
        parsed.completedAt = new Date(parsed.completedAt);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération demo:', error);
      return null;
    }
  }

  try {
    const profile = await apiClient.get<ExtendedTrainingProfile | null>(`/users/${userId}/training-profile`);
    if (!profile) return null;

    return {
      ...profile,
      completedAt: profile.completedAt ? new Date(profile.completedAt) : new Date(),
    };
  } catch (error: any) {
    throw new Error(error?.message || 'Impossible de récupérer le profil d\'entraînement');
  }
};

/**
 * Valide les données du profil d'entraînement
 */
export const validateTrainingProfile = (
  data: Partial<ExtendedTrainingProfile>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.objectives?.primary) {
    errors.push('L\'objectif principal est obligatoire');
  }

  if (data.weeklySchedule) {
    const selectedDays = Object.values(data.weeklySchedule).some((day) => day === true);
    if (!selectedDays) {
      errors.push('Sélectionnez au moins un jour d\'entraînement');
    }
  } else {
    errors.push('Le planning hebdomadaire est obligatoire');
  }

  if (data.preferredTimes) {
    const selectedTimes = Object.values(data.preferredTimes).some((time) => time === true);
    if (!selectedTimes) {
      errors.push('Sélectionnez au moins un créneau horaire');
    }
  } else {
    errors.push('Les créneaux horaires sont obligatoires');
  }

  if (data.activityTypes) {
    const selectedActivities = Object.entries(data.activityTypes)
      .filter(([key]) => key !== 'other_description')
      .some(([, value]) => value === true);
    if (!selectedActivities) {
      errors.push('Sélectionnez au moins un type d\'activité');
    }

    if (data.activityTypes.other && !data.activityTypes.other_description?.trim()) {
      errors.push('Précisez le type d\'activité « autre »');
    }
  } else {
    errors.push('Les types d\'activités sont obligatoires');
  }

  if (!data.neatLevel?.level) {
    errors.push('Le niveau d\'activité quotidienne est obligatoire');
  }

  if (data.healthLimitations?.hasLimitations && !data.healthLimitations.limitations?.trim()) {
    errors.push('Précisez vos limitations de santé');
  }

  if (!data.healthDeclaration?.declareGoodHealth) {
    errors.push('La déclaration de santé est obligatoire');
  }

  if (!data.healthDeclaration?.acknowledgeDisclaimer) {
    errors.push('L\'acceptation des conditions est obligatoire');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Vérifie le statut de la connexion backend
 */
export const checkBackendConnection = async (): Promise<boolean> => {
  if (getCurrentOperatingMode() === 'demo') {
    return false;
  }

  try {
    await apiClient.get('/health', { skipAuth: true });
    return true;
  } catch (error) {
    console.warn('⚠️ Backend indisponible:', error);
    return false;
  }
};

/**
 * Obtient le mode de fonctionnement actuel
 */
export const getCurrentMode = (): string => getCurrentOperatingMode();

/**
 * Liste les profils sauvegardés localement (mode démo)
 */
export const listLocalProfiles = async (): Promise<string[]> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const keys = await AsyncStorage.getAllKeys();
    return keys.filter((key: string) => key.startsWith('training_profile_'));
  } catch (error) {
    console.error('❌ Erreur listage profils locaux:', error);
    return [];
  }
};

/**
 * Supprime un profil local (mode démo)
 */
export const deleteLocalProfile = async (userId: string): Promise<void> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const key = `training_profile_${userId}`;
    await AsyncStorage.removeItem(key);
    console.log('✅ Profil local supprimé');
  } catch (error) {
    console.error('❌ Erreur suppression profil local:', error);
    throw new Error('Impossible de supprimer le profil local');
  }
};

export const AppMode = {
  DEMO: 'demo',
  CLOUD: 'cloud',
} as const;

export default {
  saveTrainingProfile,
  getTrainingProfile,
  validateTrainingProfile,
  checkBackendConnection,
  getCurrentMode,
  listLocalProfiles,
  deleteLocalProfile,
};
