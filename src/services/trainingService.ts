/**
 * Service pour la gestion des profils d'entraînement
 * Compatible avec Firebase v9 Modular SDK
 * Gestion du mode offline et demo
 */

import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { 
  ExtendedTrainingProfile, 
  TrainingProfileFirestore 
} from '../types/TrainingProfile';
import { AppConfig, getOptimalMode } from '../utils/config';

// Déterminer le mode optimal automatiquement
const getCurrentOperatingMode = () => getOptimalMode();

/**
 * Sauvegarde locale en mode demo
 */
const saveDemoProfile = async (userId: string, data: ExtendedTrainingProfile): Promise<void> => {
  try {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Sauvegarder dans AsyncStorage pour persistance locale
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const key = `training_profile_${userId}`;
    const dataToSave = {
      ...data,
      completedAt: new Date().toISOString(),
      savedAt: new Date().toISOString()
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(dataToSave));
    console.log('✅ Profil d\'entraînement sauvegardé en mode demo');
  } catch (error) {
    console.error('❌ Erreur sauvegarde demo:', error);
    throw new Error('Erreur de sauvegarde en mode demo');
  }
};

/**
 * Sauvegarde le profil d'entraînement dans Firestore
 * @param userId - ID de l'utilisateur
 * @param trainingData - Données du profil d'entraînement
 * @returns Promise<void>
 */
export const saveTrainingProfileToFirestore = async (
  userId: string,
  trainingData: ExtendedTrainingProfile
): Promise<void> => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Validation des données obligatoires
    if (!trainingData.healthDeclaration.declareGoodHealth) {
      throw new Error('La déclaration de santé est obligatoire');
    }

    if (!trainingData.healthDeclaration.acknowledgeDisclaimer) {
      throw new Error('L\'acceptation des conditions est obligatoire');
    }

    // Mode demo si Firebase n'est pas configuré
    if (getCurrentOperatingMode() === 'demo') {
      return await saveDemoProfile(userId, trainingData);
    }

    // Conversion des données pour Firestore
    const firestoreData: TrainingProfileFirestore = {
      objectives: {
        primary: trainingData.objectives.primary,
        secondary: trainingData.objectives.secondary
      },
      weeklySchedule: trainingData.weeklySchedule,
      preferredTimes: trainingData.preferredTimes,
      activityTypes: {
        ...trainingData.activityTypes,
        other_description: trainingData.activityTypes.other_description || undefined
      },
      neatLevel: trainingData.neatLevel,
      healthLimitations: {
        hasLimitations: trainingData.healthLimitations.hasLimitations,
        limitations: trainingData.healthLimitations.limitations || undefined
      },
      healthDeclaration: trainingData.healthDeclaration,
      completedAt: serverTimestamp(),
      isComplete: true
    };

    // Référence du document utilisateur
    const userDocRef = doc(db, 'users', userId);

    // Tentative de sauvegarde avec gestion d'erreur offline
    try {
      // Vérifier si le document utilisateur existe
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Mettre à jour le profil d'entraînement existant
        await updateDoc(userDocRef, {
          'profile.training': firestoreData,
          'updatedAt': serverTimestamp()
        });
      } else {
        // Créer un nouveau document utilisateur avec le profil d'entraînement
        await setDoc(userDocRef, {
          profile: {
            training: firestoreData
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      console.log('✅ Profil d\'entraînement sauvegardé avec succès dans Firestore');
    } catch (firestoreError: any) {
      // Gestion spécifique des erreurs Firestore
      if (firestoreError.code === 'unavailable' || 
          firestoreError.message?.includes('offline') ||
          firestoreError.message?.includes('Failed to get document because the client is offline')) {
        
        console.warn('⚠️ Firebase hors ligne, basculement en mode demo');
        return await saveDemoProfile(userId, trainingData);
      }
      throw firestoreError;
    }

    console.log('Profil d\'entraînement sauvegardé avec succès');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du profil d\'entraînement:', error);
    
    // Message d'erreur plus convivial
    if (error instanceof Error) {
      if (error.message.includes('offline') || error.message.includes('unavailable')) {
        throw new Error('Connexion internet requise pour sauvegarder votre profil');
      }
      if (error.message.includes('permission')) {
        throw new Error('Permissions insuffisantes pour sauvegarder les données');
      }
    }
    
    throw new Error('Impossible de sauvegarder le profil d\'entraînement');
  }
};

/**
 * Récupère le profil d'entraînement depuis Firestore
 * @param userId - ID de l'utilisateur
 * @returns Promise<ExtendedTrainingProfile | null>
 */
export const getTrainingProfileFromFirestore = async (
  userId: string
): Promise<ExtendedTrainingProfile | null> => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Mode demo
    if (getCurrentOperatingMode() === 'demo') {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const key = `training_profile_${userId}`;
        const data = await AsyncStorage.getItem(key);
        
        if (data) {
          const parsed = JSON.parse(data);
          // Convertir la date string en Date object
          parsed.completedAt = new Date(parsed.completedAt);
          console.log('✅ Profil récupéré depuis le stockage local');
          return parsed;
        }
        return null;
      } catch (error) {
        console.error('❌ Erreur récupération demo:', error);
        return null;
      }
    }

    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    const trainingData = userData?.profile?.training;

    if (!trainingData) {
      return null;
    }

    // Conversion des données Firestore vers le type TypeScript
    const profile: ExtendedTrainingProfile = {
      objectives: {
        primary: trainingData.objectives.primary,
        secondary: trainingData.objectives.secondary
      },
      weeklySchedule: trainingData.weeklySchedule,
      preferredTimes: trainingData.preferredTimes,
      activityTypes: trainingData.activityTypes,
      neatLevel: trainingData.neatLevel,
      healthLimitations: trainingData.healthLimitations,
      healthDeclaration: trainingData.healthDeclaration,
      completedAt: trainingData.completedAt?.toDate() || new Date(),
      isComplete: trainingData.isComplete || false
    };

    return profile;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil d\'entraînement:', error);
    
    // En cas d'erreur Firebase, essayer le mode demo
    if (error instanceof Error && 
        (error.message.includes('offline') || error.message.includes('unavailable'))) {
      console.warn('⚠️ Firebase hors ligne, tentative de récupération locale');
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const key = `training_profile_${userId}`;
        const data = await AsyncStorage.getItem(key);
        
        if (data) {
          const parsed = JSON.parse(data);
          parsed.completedAt = new Date(parsed.completedAt);
          return parsed;
        }
      } catch (localError) {
        console.error('❌ Erreur récupération locale:', localError);
      }
    }
    
    throw new Error('Impossible de récupérer le profil d\'entraînement');
  }
};

/**
 * Valide les données du profil d'entraînement
 * @param data - Données à valider
 * @returns Object avec isValid et errors
 */
export const validateTrainingProfile = (
  data: Partial<ExtendedTrainingProfile>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validation des objectifs
  if (!data.objectives?.primary) {
    errors.push('L\'objectif principal est obligatoire');
  }

  // Validation du planning hebdomadaire (au moins 1 jour)
  if (data.weeklySchedule) {
    const selectedDays = Object.values(data.weeklySchedule).some(day => day === true);
    if (!selectedDays) {
      errors.push('Sélectionnez au moins un jour d\'entraînement');
    }
  } else {
    errors.push('Le planning hebdomadaire est obligatoire');
  }

  // Validation des heures préférées (au moins 1 créneau)
  if (data.preferredTimes) {
    const selectedTimes = Object.values(data.preferredTimes).some(time => time === true);
    if (!selectedTimes) {
      errors.push('Sélectionnez au moins un créneau horaire');
    }
  } else {
    errors.push('Les créneaux horaires sont obligatoires');
  }

  // Validation des types d'activités (au moins 1)
  if (data.activityTypes) {
    const selectedActivities = Object.entries(data.activityTypes)
      .filter(([key]) => key !== 'other_description')
      .some(([, value]) => value === true);
    if (!selectedActivities) {
      errors.push('Sélectionnez au moins un type d\'activité');
    }

    // Si "autre" est sélectionné, vérifier la description
    if (data.activityTypes.other && !data.activityTypes.other_description?.trim()) {
      errors.push('Précisez le type d\'activité "autre"');
    }
  } else {
    errors.push('Les types d\'activités sont obligatoires');
  }

  // Validation du niveau NEAT
  if (!data.neatLevel?.level) {
    errors.push('Le niveau d\'activité quotidienne est obligatoire');
  }

  // Validation des limitations de santé
  if (data.healthLimitations?.hasLimitations && !data.healthLimitations.limitations?.trim()) {
    errors.push('Précisez vos limitations de santé');
  }

  // Validation de la déclaration de santé
  if (!data.healthDeclaration?.declareGoodHealth) {
    errors.push('La déclaration de santé est obligatoire');
  }

  if (!data.healthDeclaration?.acknowledgeDisclaimer) {
    errors.push('L\'acceptation des conditions est obligatoire');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Vérifie le statut de la connexion Firebase
 * @returns Promise<boolean>
 */
export const checkFirebaseConnection = async (): Promise<boolean> => {
  if (getCurrentOperatingMode() === 'demo') {
    return false; // Mode demo activé
  }
  
  try {
    // Tentative de lecture d'un document test
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    return true;
  } catch (error) {
    console.warn('⚠️ Firebase indisponible:', error);
    return false;
  }
};

/**
 * Obtient le mode de fonctionnement actuel
 * @returns string
 */
export const getCurrentMode = (): string => {
  return getCurrentOperatingMode();
};

/**
 * Liste les profils sauvegardés localement (mode demo)
 * @returns Promise<string[]>
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
 * Supprime un profil local (mode demo)
 * @param userId - ID de l'utilisateur
 * @returns Promise<void>
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
