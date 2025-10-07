const { sanitizeDateFields, defaultUserProfile } = require('./defaults');
const { mergeDeep } = require('./merge');

const SUPPLEMENT_TIMING_VALUES = new Set(['morning', 'pre_workout', 'post_workout', 'evening', 'with_meals']);
const SUPPLEMENT_TYPE_VALUES = new Set([
  'protein',
  'creatine',
  'pre_workout',
  'post_workout',
  'fat_burner',
  'multivitamin',
  'other',
]);
const SUPPLEMENT_UNIT_VALUES = new Set(['gram', 'capsule', 'milliliter']);

const SUPPLEMENT_TIMING_ALIASES = {
  morning: 'morning',
  matin: 'morning',
  preworkout: 'pre_workout',
  pre_workout: 'pre_workout',
  'pre-workout': 'pre_workout',
  postworkout: 'post_workout',
  post_workout: 'post_workout',
  'post-workout': 'post_workout',
  evening: 'evening',
  soir: 'evening',
  with_meals: 'with_meals',
  withmeals: 'with_meals',
  repas: 'with_meals',
};

const SUPPLEMENT_UNIT_ALIASES = {
  gram: 'gram',
  grams: 'gram',
  g: 'gram',
  capsule: 'capsule',
  capsules: 'capsule',
  gelule: 'capsule',
  gelules: 'capsule',
  gélule: 'capsule',
  gélules: 'capsule',
  ml: 'milliliter',
  milliliter: 'milliliter',
  milliliters: 'milliliter',
  millilitre: 'milliliter',
  millilitres: 'milliliter',
};

const BUDGET_RANGE_VALUES = new Set(['low', 'medium', 'high']);

function normalizeSupplementTiming(value) {
  if (!value) return 'with_meals';
  const raw = String(value).trim();
  const direct = SUPPLEMENT_TIMING_VALUES.has(raw) ? raw : null;
  if (direct) return direct;

  const aliasKey = SUPPLEMENT_TIMING_ALIASES[raw]
    || SUPPLEMENT_TIMING_ALIASES[raw.toLowerCase()]
    || SUPPLEMENT_TIMING_ALIASES[raw.toLowerCase().replace(/[^a-z]/g, '_')];

  return aliasKey || 'with_meals';
}

function normalizeSupplementUnit(value) {
  if (!value) return undefined;
  const raw = String(value).trim();
  if (SUPPLEMENT_UNIT_VALUES.has(raw)) return raw;
  return SUPPLEMENT_UNIT_ALIASES[raw] || SUPPLEMENT_UNIT_ALIASES[raw.toLowerCase()] || undefined;
}

function parseQuantity(value) {
  if (value === null || value === undefined) return undefined;
  const numeric = typeof value === 'number' ? value : Number.parseFloat(String(value));
  if (Number.isFinite(numeric) && numeric > 0) {
    return Number(numeric.toFixed(3));
  }
  return undefined;
}

function normalizeSupplementType(value) {
  if (!value) return 'other';
  const raw = String(value).trim();
  if (SUPPLEMENT_TYPE_VALUES.has(raw)) {
    return raw;
  }
  const alias = raw.toLowerCase().replace(/[^a-z]/g, '_');
  return SUPPLEMENT_TYPE_VALUES.has(alias) ? alias : 'other';
}

function normalizeSupplementEntry(entry = {}) {
  const plain = typeof entry.toObject === 'function' ? entry.toObject() : { ...entry };

  const normalized = {
    ...plain,
    id: plain.id ? String(plain.id) : undefined,
    name: plain.name ? String(plain.name).trim() : '',
    dosage: plain.dosage ? String(plain.dosage).trim() : '',
    timing: normalizeSupplementTiming(plain.timing),
    type: normalizeSupplementType(plain.type),
    available: plain.available !== false,
  };

  const unit = normalizeSupplementUnit(plain.unit);
  if (unit) {
    normalized.unit = unit;
  } else {
    delete normalized.unit;
  }

  const quantity = parseQuantity(plain.quantity);
  if (quantity !== undefined) {
    normalized.quantity = quantity;
  } else {
    delete normalized.quantity;
  }

  return normalized;
}

function normalizeSupplementProfile(profile = {}, { fillDefaults = false } = {}) {
  const plain = typeof profile.toObject === 'function' ? profile.toObject() : { ...profile };
  const normalized = {};

  if (Array.isArray(plain.available)) {
    normalized.available = plain.available
      .map((entry) => normalizeSupplementEntry(entry))
      .filter((entry) => entry && entry.name);
  } else if (fillDefaults) {
    normalized.available = [];
  }

  if (plain.preferences || fillDefaults) {
    const preferences = plain.preferences || {};
    normalized.preferences = {
      preferNatural: preferences.preferNatural === true,
      budgetRange: BUDGET_RANGE_VALUES.has(preferences.budgetRange)
        ? preferences.budgetRange
        : 'medium',
      allergies: Array.isArray(preferences.allergies)
        ? preferences.allergies.map((value) => String(value))
        : [],
    };
  }

  return normalized;
}

function normalizeProfileInput(profile = {}, options = {}) {
  const plainProfile = typeof profile.toObject === 'function' ? profile.toObject() : { ...profile };
  const normalized = { ...plainProfile };

  if (plainProfile.supplements || options.fillDefaults) {
    const supplements = normalizeSupplementProfile(plainProfile.supplements || {}, options);
    if (Object.keys(supplements).length > 0) {
      normalized.supplements = supplements;
    }
  }

  return normalized;
}

function toClientUser(userDoc) {
  if (!userDoc) return null;
  const plain = userDoc.toJSON({ getters: true });
  const baseProfile = defaultUserProfile();
  const normalizedProfile = normalizeProfileInput(plain.profile, { fillDefaults: true });
  const mergedProfile = mergeDeep(baseProfile, normalizedProfile);
  const safeProfile = sanitizeDateFields(mergedProfile);
  const safeUser = {
    id: plain.id || plain._id?.toString(),
    email: plain.email,
    profile: safeProfile,
    createdAt: plain.createdAt instanceof Date ? plain.createdAt.toISOString() : plain.createdAt,
    updatedAt: plain.updatedAt instanceof Date ? plain.updatedAt.toISOString() : plain.updatedAt,
  };

  return safeUser;
}

module.exports = {
  toClientUser,
  normalizeProfileInput,
};
