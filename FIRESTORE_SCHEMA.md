# 🗄️ Schéma Firestore Étendu - BerserkerCut

## 📋 Vue d'ensemble

Structure Firestore optimisée pour BerserkerCut avec support des données de santé et préparation pour les intégrations HealthKit/Google Fit.

## 🏗️ Collections Principales

### `users/{userId}`

Document principal contenant toutes les informations utilisateur structurées.

```typescript
{
  // Métadonnées utilisateur
  id: string,
  email: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Informations de base
  profile: {
    name: string,
    objective: "cutting" | "recomposition" | "maintenance",
    allergies: string[],
    foodPreferences: string[],
    
    // Données de santé et activité
    health: {
      // Informations physiques
      weight: number,           // kg
      height: number,           // cm
      age: number,
      gender: "male" | "female",
      
      // Activité et style de vie
      activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active",
      averageSleepHours: number,
      
      // Données optionnelles
      averageDailySteps?: number,
      restingHeartRate?: number, // bpm
      
      // Source des données
      dataSource: {
        type: "manual" | "apple_healthkit" | "google_fit" | "other",
        lastSyncDate?: Timestamp,
        permissions?: string[],
        isConnected: boolean
      },
      
      // Métadonnées
      lastUpdated: Timestamp,
      isManualEntry: boolean
    },
    
    // Configuration d'entraînement
    training: {
      trainingDays: [
        {
          dayOfWeek: number,     // 0-6 (dimanche-samedi)
          type: "strength" | "cardio" | "mixed" | "rest",
          timeSlot: "morning" | "afternoon" | "evening",
          duration: number       // minutes
        }
      ],
      experienceLevel: "beginner" | "intermediate" | "advanced",
      preferredTimeSlots: ("morning" | "afternoon" | "evening")[]
    },
    
    // Configuration des suppléments
    supplements: {
      available: [
        {
          id: string,
          name: string,
          type: "protein" | "creatine" | "pre_workout" | "post_workout" | "fat_burner" | "multivitamin" | "other",
          dosage: string,
          timing: "morning" | "pre_workout" | "post_workout" | "evening" | "with_meals",
          available: boolean
        }
      ],
      preferences: {
        preferNatural: boolean,
        budgetRange: "low" | "medium" | "high",
        allergies: string[]
      }
    }
  }
}
```

### `dailyPlans/{planId}`

Plans quotidiens avec structure optimisée.

```typescript
{
  id: string,                    // Format: {userId}_{YYYY-MM-DD}
  userId: string,
  date: Timestamp,
  dayType: "training" | "rest" | "cheat",
  
  // Plan nutritionnel
  nutrition: {
    totalCalories: number,
    macros: {
      protein: number,           // grammes
      carbs: number,            // grammes
      fat: number               // grammes
    },
    meals: [
      {
        id: string,
        name: string,
        time: string,
        calories: number,
        macros: {
          protein: number,
          carbs: number,
          fat: number
        },
        foods: [
          {
            id: string,
            name: string,
            quantity: number,
            unit: string,
            calories: number,
            macros: {
              protein: number,
              carbs: number,
              fat: number
            }
          }
        ]
      }
    ]
  },
  
  // Plan de suppléments
  supplements: {
    morning: [
      {
        supplementId: string,
        name: string,
        dosage: string,
        time: string,
        taken: boolean
      }
    ],
    preWorkout: [...],
    postWorkout: [...],
    evening: [...]
  },
  
  // Métadonnées
  dailyTip: string,
  completed: boolean,
  createdAt: Timestamp,
  
  // Données de santé du jour (optionnel)
  healthSnapshot?: {
    weight?: number,
    steps?: number,
    sleepHours?: number,
    heartRate?: number,
    dataSource: string
  }
}
```

### `healthData/{userId}/daily/{date}`

Sous-collection pour le stockage détaillé des données de santé quotidiennes.

```typescript
{
  date: Timestamp,
  userId: string,
  
  // Données collectées
  data: {
    weight?: number,
    steps?: number,
    activeCalories?: number,
    restingHeartRate?: number,
    sleepHours?: number,
    sleepQuality?: number,     // 1-10
    workoutDuration?: number,  // minutes
    workoutType?: string
  },
  
  // Source et métadonnées
  sources: {
    [key: string]: {           // "weight", "steps", etc.
      source: "manual" | "apple_healthkit" | "google_fit" | "other",
      timestamp: Timestamp,
      confidence?: number      // 0-1 pour la fiabilité
    }
  },
  
  // Synchronisation
  lastSync: Timestamp,
  syncStatus: "synced" | "pending" | "error"
}
```

### `userPreferences/{userId}`

Préférences et paramètres utilisateur séparés pour optimiser les performances.

```typescript
{
  // Paramètres de notification
  notifications: {
    meals: boolean,
    supplements: boolean,
    workouts: boolean,
    dailyTips: boolean,
    pushToken?: string
  },
  
  // Paramètres d'interface
  ui: {
    theme: "light" | "dark" | "auto",
    language: string,
    units: {
      weight: "kg" | "lbs",
      height: "cm" | "ft",
      temperature: "celsius" | "fahrenheit"
    }
  },
  
  // Intégrations
  integrations: {
    healthKit: {
      enabled: boolean,
      permissions: string[],
      lastSync?: Timestamp
    },
    googleFit: {
      enabled: boolean,
      permissions: string[],
      lastSync?: Timestamp
    },
    wearables: {
      connected: boolean,
      deviceType?: string,
      deviceId?: string
    }
  },
  
  // Préférences avancées
  advanced: {
    autoGeneratePlans: boolean,
    adaptBasedOnProgress: boolean,
    shareDataForResearch: boolean
  }
}
```

## 🔒 Règles de Sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Utilisateurs - accès à ses propres données uniquement
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Plans quotidiens - accès basé sur userId
    match /dailyPlans/{planId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Données de santé - accès restreint
    match /healthData/{userId}/daily/{date} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Préférences utilisateur
    match /userPreferences/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Bloquer tout autre accès
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 📊 Index Recommandés

```javascript
// Pour optimiser les requêtes fréquentes
Collection: dailyPlans
- userId (Ascending), date (Descending)
- userId (Ascending), dayType (Ascending), date (Descending)

Collection: healthData/{userId}/daily
- date (Descending)
- syncStatus (Ascending), date (Descending)
```

## 🚀 Migration depuis l'Ancien Schéma

Si vous avez des données existantes, voici un script de migration :

```typescript
// Migration script pour adapter l'ancien schéma
const migrateUserProfile = async (userId: string) => {
  const userDoc = await firestore.collection('users').doc(userId).get();
  const oldData = userDoc.data();
  
  if (oldData && !oldData.profile?.health) {
    const newProfile = {
      ...oldData.profile,
      health: {
        weight: oldData.profile.weight,
        height: oldData.profile.height,
        age: oldData.profile.age,
        gender: oldData.profile.gender,
        activityLevel: oldData.profile.activityLevel,
        averageSleepHours: 7, // valeur par défaut
        dataSource: {
          type: 'manual',
          isConnected: true
        },
        lastUpdated: new Date(),
        isManualEntry: true
      },
      training: {
        trainingDays: oldData.profile.trainingDays || [],
        experienceLevel: 'intermediate',
        preferredTimeSlots: ['morning']
      },
      supplements: {
        available: oldData.profile.availableSupplements || [],
        preferences: {
          preferNatural: false,
          budgetRange: 'medium',
          allergies: []
        }
      }
    };
    
    await firestore.collection('users').doc(userId).update({
      profile: newProfile,
      updatedAt: new Date()
    });
  }
};
```

## 🔮 Évolutions Futures

Cette structure permet facilement :

1. **Intégration HealthKit/Google Fit** - Ajout de nouveaux `dataSource.type`
2. **Données de capteurs** - Extension de `healthData` avec nouvelles métriques
3. **Machine Learning** - Collecte de données pour prédictions personnalisées
4. **Partage social** - Ajout de collections `friends`, `challenges`
5. **Coaching avancé** - Extension avec `coaches`, `programs`

Cette architecture est scalable et maintient la performance même avec une croissance importante des données utilisateur.
