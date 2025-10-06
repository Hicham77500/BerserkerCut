/**
 * Exemple d'utilisation du composant OnboardingTrainingStep
 * 
 * Ce fichier montre comment intégrer le composant dans une application
 * et comment traiter les données récupérées.
 */

import React from 'react';
import { View, Alert } from 'react-native';
import { OnboardingTrainingStep } from '../components';
import { ExtendedTrainingProfile } from '../types/TrainingProfile';

interface ExampleUsageProps {
  userId: string;
  onNavigateNext: () => void;
  onNavigateBack: () => void;
}

export const ExampleUsage: React.FC<ExampleUsageProps> = ({
  userId,
  onNavigateNext,
  onNavigateBack
}) => {
  const handleTrainingComplete = (data: ExtendedTrainingProfile) => {
    // Les données sont automatiquement sauvegardées via l'API backend
    // par le composant OnboardingTrainingStep
    
    console.log('Données d\'entraînement reçues:', {
      objectives: data.objectives,
      weeklySchedule: data.weeklySchedule,
      preferredTimes: data.preferredTimes,
      activityTypes: data.activityTypes,
      neatLevel: data.neatLevel,
      healthLimitations: data.healthLimitations,
      healthDeclaration: data.healthDeclaration
    });

    // Exemple de traitement des données
    if (data.objectives.primary === 'cutting') {
      console.log('Utilisateur en phase de sèche - Plan calorique restrictif recommandé');
    }

    if (data.healthLimitations.hasLimitations) {
      console.log('Utilisateur avec limitations:', data.healthLimitations.limitations);
      Alert.alert(
        'Limitations de santé notées',
        'Nous avons pris en compte vos limitations de santé pour personnaliser votre plan.'
      );
    }

    // Continuer vers l'étape suivante
    onNavigateNext();
  };

  return (
    <View style={{ flex: 1 }}>
      <OnboardingTrainingStep
        userId={userId}
        onComplete={handleTrainingComplete}
        onBack={onNavigateBack}
      />
    </View>
  );
};

/**
 * Exemple de récupération des données depuis le backend
 */
export const ExampleDataRetrieval = async (userId: string) => {
  try {
    // Import du service
    const { getTrainingProfile } = await import('../services/trainingService');
    
    // Récupération des données
    const trainingProfile = await getTrainingProfile(userId);
    
    if (trainingProfile) {
      console.log('Profil d\'entraînement récupéré:', trainingProfile);
      
      // Exemple d'utilisation des données pour générer un plan
      const weeklyTrainingDays = Object.entries(trainingProfile.weeklySchedule)
        .filter(([day, isSelected]) => isSelected)
        .map(([day]) => day);
      
      console.log('Jours d\'entraînement:', weeklyTrainingDays);
      
      return trainingProfile;
    } else {
      console.log('Aucun profil d\'entraînement trouvé pour cet utilisateur');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
};

/**
 * Exemple de validation personnalisée
 */
export const ExampleCustomValidation = (data: Partial<ExtendedTrainingProfile>) => {
  // Import du service de validation
  const { validateTrainingProfile } = require('../services/trainingService');
  
  const validation = validateTrainingProfile(data);
  
  if (!validation.isValid) {
    console.log('Erreurs de validation:', validation.errors);
    return false;
  }
  
  // Validations métier supplémentaires
  if (data.objectives?.primary === 'muscle_gain' && data.neatLevel?.level === 'high') {
    console.log('Recommandation: Augmentation des calories pour compenser le NEAT élevé');
  }
  
  if (data.activityTypes?.strength_training && data.activityTypes?.cardio) {
    console.log('Programme mixte détecté - Plans nutrition adaptés aux deux types d\'exercices');
  }
  
  return true;
};

/**
 * Exemple de génération de plan basé sur les données d'entraînement
 */
export const ExamplePlanGeneration = (trainingProfile: ExtendedTrainingProfile) => {
  const plan = {
    trainingDays: 0,
    restDays: 0,
    recommendedCalorieAdjustment: 0,
    supplementTimings: [] as string[]
  };

  // Compter les jours d'entraînement
  plan.trainingDays = Object.values(trainingProfile.weeklySchedule)
    .filter(day => day).length;
  plan.restDays = 7 - plan.trainingDays;

  // Ajustement calorique basé sur l'objectif
  switch (trainingProfile.objectives.primary) {
    case 'cutting':
      plan.recommendedCalorieAdjustment = -300; // Déficit calorique
      break;
    case 'muscle_gain':
      plan.recommendedCalorieAdjustment = 300; // Surplus calorique
      break;
    case 'weight_maintenance':
      plan.recommendedCalorieAdjustment = 0; // Maintien calorique
      break;
    case 'strength':
      plan.recommendedCalorieAdjustment = 100; // Léger surplus
      break;
    case 'endurance':
      plan.recommendedCalorieAdjustment = 200; // Surplus pour l'énergie
      break;
    default:
      plan.recommendedCalorieAdjustment = 0; // Maintenance
  }

  // Ajustement NEAT
  switch (trainingProfile.neatLevel.level) {
    case 'low':
      plan.recommendedCalorieAdjustment -= 100;
      break;
    case 'high':
      plan.recommendedCalorieAdjustment += 150;
      break;
  }

  // Suggestions de suppléments basées sur les créneaux
  if (trainingProfile.preferredTimes.morning) {
    plan.supplementTimings.push('Caféine avant l\'entraînement matinal');
  }
  if (trainingProfile.preferredTimes.evening) {
    plan.supplementTimings.push('Éviter la caféine en soirée');
  }

  console.log('Plan généré:', plan);
  return plan;
};
