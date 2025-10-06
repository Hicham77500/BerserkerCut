/** Types complémentaires utilisés pendant l'onboarding entraînement/santé. */

export interface TrainingObjective {
  primary: 'muscle_gain' | 'weight_maintenance' | 'cutting' | 'strength' | 'endurance' | 'general_fitness';
  secondary?: 'muscle_gain' | 'weight_maintenance' | 'cutting' | 'strength' | 'endurance' | 'general_fitness';
}

export interface WeeklyTrainingSchedule {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface PreferredTrainingTime {
  morning: boolean; // 6h-10h
  afternoon: boolean; // 12h-16h
  evening: boolean; // 18h-22h
}

export interface ActivityType {
  strength_training: boolean; // Musculation
  cardio: boolean; // Cardio
  yoga: boolean; // Yoga/Pilates
  sports: boolean; // Sports
  other: boolean; // Autre
  other_description?: string; // Description si "autre" sélectionné
}

export interface NEATLevel {
  level: 'low' | 'moderate' | 'high';
  description: string;
}

export interface HealthLimitations {
  hasLimitations: boolean;
  limitations?: string; // Description des limitations si présentes
}

export interface HealthDeclaration {
  declareGoodHealth: boolean;
  acknowledgeDisclaimer: boolean;
}

/** Profil d'entraînement détaillé stocké en complément du UserProfile. */
export interface ExtendedTrainingProfile {
  // Objectifs d'entraînement
  objectives: TrainingObjective;
  
  // Planning hebdomadaire
  weeklySchedule: WeeklyTrainingSchedule;
  
  // Heures préférées
  preferredTimes: PreferredTrainingTime;
  
  // Types d'activités
  activityTypes: ActivityType;
  
  // Niveau NEAT (Non-Exercise Activity Thermogenesis)
  neatLevel: NEATLevel;
  
  // Limitations de santé
  healthLimitations: HealthLimitations;
  
  // Déclaration de santé
  healthDeclaration: HealthDeclaration;
  
  // Métadonnées
  completedAt: Date;
  isComplete: boolean;
}

/** Version sérialisable du profil d'entraînement pour Firestore. */
export interface TrainingProfileFirestore {
  objectives: {
    primary: string;
    secondary?: string;
  };
  weeklySchedule: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  preferredTimes: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  activityTypes: {
    strength_training: boolean;
    cardio: boolean;
    yoga: boolean;
    sports: boolean;
    other: boolean;
    other_description?: string;
  };
  neatLevel: {
    level: string;
    description: string;
  };
  healthLimitations: {
    hasLimitations: boolean;
    limitations?: string;
  };
  healthDeclaration: {
    declareGoodHealth: boolean;
    acknowledgeDisclaimer: boolean;
  };
  completedAt: any; // Timestamp (ISO string côté API)
  isComplete: boolean;
}

/**
 * Options pour les sélecteurs du formulaire
 */
export const TRAINING_OBJECTIVES = [
  { key: 'muscle_gain', label: 'Prise de masse', emoji: '💪', description: 'Développer la masse musculaire et prendre du poids' },
  { key: 'weight_maintenance', label: 'Maintien du poids', emoji: '⚖️', description: 'Maintenir le poids actuel et la composition corporelle' },
  { key: 'cutting', label: 'Sèche', emoji: '🔥', description: 'Réduire le pourcentage de graisse corporelle tout en préservant le muscle' },
  { key: 'strength', label: 'Force', emoji: '🏋️', description: 'Améliorer la force maximale' },
  { key: 'endurance', label: 'Endurance', emoji: '🏃', description: 'Améliorer l\'endurance cardiovasculaire' },
  { key: 'general_fitness', label: 'Forme générale', emoji: '💚', description: 'Maintenir une bonne condition physique' }
] as const;

export const NEAT_LEVELS = [
  {
    key: 'low',
    label: 'Faible',
    description: 'Travail de bureau, peu de déplacements, mode de vie sédentaire'
  },
  {
    key: 'moderate',
    label: 'Modéré',
    description: 'Quelques déplacements, activités quotidiennes normales'
  },
  {
    key: 'high',
    label: 'Élevé',
    description: 'Travail physique, beaucoup de déplacements, vie active'
  }
] as const;

export const WEEKDAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' }
] as const;

export const TIME_SLOTS = [
  { key: 'morning', label: 'Matin', description: '6h - 10h' },
  { key: 'afternoon', label: 'Après-midi', description: '12h - 16h' },
  { key: 'evening', label: 'Soir', description: '18h - 22h' }
] as const;

export const ACTIVITY_TYPES = [
  { key: 'strength_training', label: 'Musculation', icon: '💪' },
  { key: 'cardio', label: 'Cardio', icon: '🏃' },
  { key: 'yoga', label: 'Yoga/Pilates', icon: '🧘' },
  { key: 'sports', label: 'Sports', icon: '⚽' },
  { key: 'other', label: 'Autre', icon: '🎯' }
] as const;
