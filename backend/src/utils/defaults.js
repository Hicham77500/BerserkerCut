/**
 * Module: backend/src/utils/defaults.js
 * Utilite: Definit la logique backend de cette fonctionnalite BerserkerCut.
 * Navigation: Commencer par les exports publics (routes, modeles, services).
 */
function defaultUserProfile() {
  const now = new Date();
  return {
    name: '',
    objective: 'cutting',
    allergies: [],
    foodPreferences: [],
    health: {
      weight: 0,
      height: 0,
      age: 0,
      gender: 'male',
      activityLevel: 'moderate',
      averageSleepHours: 8,
      dataSource: {
        type: 'manual',
        isConnected: false,
        permissions: [],
      },
      lastUpdated: now,
      isManualEntry: true,
    },
    training: {
      trainingDays: [],
      experienceLevel: 'beginner',
      preferredTimeSlots: ['evening'],
    },
    supplements: {
      available: [],
      preferences: {
        preferNatural: false,
        budgetRange: 'medium',
        allergies: [],
      },
    },
  };
}

/**
 * Fonction: sanitizeDateFields
 * Utilite: Execute une partie de la logique backend/metier.
 */
function sanitizeDateFields(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }

  const data = Array.isArray(value) ? [...value] : { ...value };

  Object.entries(data).forEach(([key, entry]) => {
    if (entry instanceof Date) {
      data[key] = entry.toISOString();
    } else if (typeof entry === 'string' && isIsoDate(entry)) {
      data[key] = entry;
    } else {
      data[key] = sanitizeDateFields(entry);
    }
  });

  return data;
}

/**
 * Fonction: isIsoDate
 * Utilite: Execute une partie de la logique backend/metier.
 */
function isIsoDate(value) {
  return typeof value === 'string' && /\d{4}-\d{2}-\d{2}T/.test(value);
}

module.exports = {
  defaultUserProfile,
  sanitizeDateFields,
};
