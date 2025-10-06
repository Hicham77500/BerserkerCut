/**
 * Types de base pour l'application BerserkerCut
 */

export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  // Informations de base
  name: string;
  
  // Objectifs et préférences
  objective: 'cutting' | 'recomposition' | 'maintenance';
  allergies: string[];
  foodPreferences: string[];
  
  // Données de santé et activité
  health: HealthProfile;
  
  // Entraînement
  training: TrainingProfile;
  
  // Suppléments
  supplements: SupplementProfile;
}

export interface HealthProfile {
  // Informations physiques de base
  weight: number; // en kg
  height: number; // en cm
  age: number;
  gender: 'male' | 'female';
  
  // Niveau d'activité général
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  
  // Données de sommeil
  averageSleepHours: number; // heures par nuit
  
  // Données d'activité (optionnelles)
  averageDailySteps?: number;
  restingHeartRate?: number; // bpm
  
  // Source des données pour future intégration
  dataSource: HealthDataSource;
  
  // Métadonnées
  lastUpdated: Date;
  isManualEntry: boolean;
}

/** Résume la structure d'entraînement utilisée pour générer les plans. */
export interface TrainingProfile {
  trainingDays: TrainingDay[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredTimeSlots: ('morning' | 'afternoon' | 'evening')[];
}

/** Répertorie les suppléments disponibles et les préférences associées. */
export interface SupplementProfile {
  available: Supplement[];
  preferences: {
    preferNatural: boolean;
    budgetRange: 'low' | 'medium' | 'high';
    allergies: string[];
  };
}

export interface HealthDataSource {
  type: 'manual' | 'apple_healthkit' | 'google_fit' | 'other';
  lastSyncDate?: Date;
  permissions?: string[];
  isConnected: boolean;
}

export interface TrainingDay {
  dayOfWeek: number; // 0-6 (dimanche-samedi)
  type: 'strength' | 'cardio' | 'mixed' | 'rest';
  timeSlot: 'morning' | 'afternoon' | 'evening';
  duration: number; // en minutes
}

export interface Supplement {
  id: string;
  name: string;
  type: 'protein' | 'creatine' | 'pre_workout' | 'post_workout' | 'fat_burner' | 'multivitamin' | 'other';
  dosage: string;
  timing: 'morning' | 'pre_workout' | 'post_workout' | 'evening' | 'with_meals';
  available: boolean;
}

export interface DailyPlan {
  id: string;
  userId: string;
  date: Date;
  dayType: 'training' | 'rest' | 'cheat';
  nutritionPlan: NutritionPlan;
  supplementPlan: SupplementPlan;
  dailyTip: string;
  completed: boolean;
  createdAt: Date;
}

export interface NutritionPlan {
  totalCalories: number;
  macros: {
    protein: number; // en grammes
    carbs: number; // en grammes
    fat: number; // en grammes
  };
  meals: Meal[];
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  foods: Food[];
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Food {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface SupplementPlan {
  morning: SupplementIntake[];
  preWorkout: SupplementIntake[];
  postWorkout: SupplementIntake[];
  evening: SupplementIntake[];
}

export interface SupplementIntake {
  supplementId: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

export interface OnboardingData {
  name: string;
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  objective: 'cutting' | 'recomposition' | 'maintenance';
  trainingDays: string[]; // Changé de TrainingDay[] à string[]
  availableSupplements: string[];
  allergies: string[];
  foodPreferences: string[];
}

export interface NavigationParams {
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Main: undefined;
  Dashboard: undefined;
  Profile: undefined;
  Settings: undefined;
  PlanDetails: { planId: string };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

export interface PlanContextType {
  currentPlan: DailyPlan | null;
  loading: boolean;
  error: string | null;
  generateDailyPlan: () => Promise<void>;
  updatePlan: (planId: string, updates: Partial<DailyPlan>) => Promise<void>;
  markSupplementTaken: (supplementId: string) => Promise<void>;
}
export type SupplementFormType = 'capsule' | 'gram' | 'milliliter';
