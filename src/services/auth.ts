/**
 * Service d'authentification unifiant backend MongoDB (via API) et mode démo local.
 */

import { User, UserProfile, Supplement, SupplementProfile, SupplementFormType } from '../types';
import { DemoAuthService } from './demoAuth';
import { apiClient } from './apiClient';
import {
  saveSession,
  clearSession,
  getStoredUser,
  updateStoredUser,
} from './sessionStorage';
import { enableDemoModeAfterNetworkError } from '../utils/networkFallback';
import { isDemoMode } from './appModeService';

/**
 * Fonction: isDemoEnvironment
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const isDemoEnvironment = () => isDemoMode();

type AuthResponse = {
  user: User;
  token: string;
  refreshToken: string;
};

type AuthListener = (user: User | null) => void;

const listeners = new Set<AuthListener>();
let initialised = false;

/**
 * Fonction: notifyAuthListeners
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
function notifyAuthListeners(user: User | null) {
  listeners.forEach((listener) => {
    try {
      listener(user);
    } catch (error) {
      console.error('Auth listener error', error);
    }
  });
}

/**
 * Fonction: ensureInitialisation
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
async function ensureInitialisation() {
  if (initialised) return;
  initialised = true;
  const storedUser = await getStoredUser();
  notifyAuthListeners(storedUser);
}

const SUPPLEMENT_TYPES = new Set<Supplement['type']>([
  'protein',
  'creatine',
  'pre_workout',
  'post_workout',
  'fat_burner',
  'multivitamin',
  'other',
]);

const BUDGET_RANGE_VALUES = new Set(['low', 'medium', 'high']);

const DEFAULT_SUPPLEMENT_PROFILE: SupplementProfile = {
  available: [],
  preferences: {
    preferNatural: false,
    budgetRange: 'medium',
    allergies: [],
  },
};

/**
 * Fonction: normalizeSupplementTiming
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
function normalizeSupplementTiming(rawValue: unknown): Supplement['timing'] {
  if (!rawValue) return 'with_meals';
  const formatted = String(rawValue)
    .toLowerCase()
    .replace(/[^a-z]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  switch (formatted) {
    case 'morning':
      return 'morning';
    case 'preworkout':
    case 'pre_workout':
      return 'pre_workout';
    case 'postworkout':
    case 'post_workout':
      return 'post_workout';
    case 'evening':
      return 'evening';
    case 'with_meals':
    case 'withmeals':
      return 'with_meals';
    default:
      return 'with_meals';
  }
}

/**
 * Fonction: normalizeSupplementUnit
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
function normalizeSupplementUnit(rawValue: unknown): SupplementFormType {
  if (!rawValue) return 'gram';
  const formatted = String(rawValue)
    .toLowerCase()
    .trim();

  switch (formatted) {
    case 'gram':
    case 'grams':
    case 'g':
      return 'gram';
    case 'capsule':
    case 'capsules':
    case 'gélule':
    case 'gelule':
    case 'gélules':
    case 'gelules':
      return 'capsule';
    case 'ml':
    case 'millilitre':
    case 'milliliter':
    case 'milliliters':
    case 'millilitres':
      return 'milliliter';
    default:
      return 'gram';
  }
}

/**
 * Fonction: parseOptionalQuantity
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
function parseOptionalQuantity(rawValue: unknown): number | undefined {
  if (rawValue === null || rawValue === undefined) {
    return undefined;
  }
  const numberValue = typeof rawValue === 'number' ? rawValue : Number.parseFloat(String(rawValue));
  if (Number.isFinite(numberValue) && numberValue > 0) {
    return Number(numberValue.toFixed(3));
  }
  return undefined;
}

/**
 * Fonction: sanitizeSupplementEntry
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
function sanitizeSupplementEntry(entry: Partial<Supplement> & { id?: string }): Supplement | null {
  if (!entry) return null;

  const name = typeof entry.name === 'string' ? entry.name.trim() : '';
  if (!name) {
    return null;
  }

  const timing = normalizeSupplementTiming(entry.timing);
  const unit = normalizeSupplementUnit(entry.unit);
  const quantity = parseOptionalQuantity(entry.quantity);
  const dosage = typeof entry.dosage === 'string' ? entry.dosage.trim() : entry.dosage ?? '';
  const type = SUPPLEMENT_TYPES.has(entry.type as Supplement['type'])
    ? (entry.type as Supplement['type'])
    : 'other';

  const sanitized: Supplement = {
    id: String(entry.id ?? `supp-${Date.now()}`),
    name,
    dosage,
    timing,
    type,
    available: entry.available !== false,
  };

  if (quantity !== undefined) {
    sanitized.quantity = quantity;
  }

  if (unit) {
    sanitized.unit = unit;
  }

  return sanitized;
}

/**
 * Fonction: sanitizeSupplementProfile
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
function sanitizeSupplementProfile(
  profile?: Partial<SupplementProfile>,
  options: { fillDefaults?: boolean } = {}
): SupplementProfile | undefined {
  const { fillDefaults = false } = options;
  if (!profile && !fillDefaults) return undefined;

  const available = Array.isArray(profile?.available)
    ? profile!.available
        .map((supplement) => sanitizeSupplementEntry(supplement))
        .filter((supplement): supplement is Supplement => Boolean(supplement))
    : [];

/**
 * Fonction: preferencesSource
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const preferencesSource = (profile?.preferences ?? {}) as Partial<SupplementProfile['preferences']>;
  const preferences = {
    preferNatural: preferencesSource.preferNatural === true,
    budgetRange: BUDGET_RANGE_VALUES.has(preferencesSource.budgetRange ?? '')
      ? (preferencesSource.budgetRange as 'low' | 'medium' | 'high')
      : 'medium',
    allergies: Array.isArray(preferencesSource.allergies)
      ? preferencesSource.allergies.map((value: any) => String(value))
      : [],
  };

  if (!fillDefaults && !profile && available.length === 0 && preferences.allergies.length === 0) {
    return undefined;
  }

  return {
    available,
    preferences,
  };
}

/**
 * Fonction: sanitizeProfileUpdates
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
function sanitizeProfileUpdates(profileUpdates: Partial<UserProfile>): Partial<UserProfile> {
  if (!profileUpdates) {
    return profileUpdates;
  }

  const sanitized: Partial<UserProfile> = { ...profileUpdates };

  if (typeof sanitized.name === 'string') {
    sanitized.name = sanitized.name.trim();
  }

  if ('supplements' in sanitized) {
    const supplements = sanitizeSupplementProfile(sanitized.supplements, { fillDefaults: true }) ?? DEFAULT_SUPPLEMENT_PROFILE;
    sanitized.supplements = supplements;
  }

  if (sanitized.health?.lastUpdated) {
    const lastUpdated = sanitized.health.lastUpdated;
    sanitized.health = {
      ...sanitized.health,
      lastUpdated: lastUpdated instanceof Date
        ? lastUpdated
        : new Date(lastUpdated),
    };
  }

  return sanitized;
}

/**
 * Fonction: normalizeProfileFromApi
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
function normalizeProfileFromApi(rawProfile: any): UserProfile {
  const base = createDefaultProfile();
  if (!rawProfile) {
    return base;
  }

  const supplementsSanitised =
    sanitizeSupplementProfile(rawProfile.supplements, { fillDefaults: true }) ?? DEFAULT_SUPPLEMENT_PROFILE;
  const health = {
    ...base.health,
    ...(rawProfile.health ?? {}),
  } as typeof base.health;

  if (health.lastUpdated && !(health.lastUpdated instanceof Date)) {
    health.lastUpdated = new Date(health.lastUpdated);
  }

  return {
    ...base,
    ...rawProfile,
    name: typeof rawProfile.name === 'string' ? rawProfile.name : base.name,
    objective: rawProfile.objective ?? base.objective,
    allergies: Array.isArray(rawProfile.allergies) ? rawProfile.allergies : base.allergies,
    foodPreferences: Array.isArray(rawProfile.foodPreferences) ? rawProfile.foodPreferences : base.foodPreferences,
    health,
    training: {
      ...base.training,
      ...(rawProfile.training ?? {}),
    },
    supplements: supplementsSanitised,
  };
}

/**
 * Fonction: createDefaultProfile
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
function createDefaultProfile(): UserProfile {
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
    supplements: { ...DEFAULT_SUPPLEMENT_PROFILE },
  };
}

/**
 * Fonction: normalizeUser
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
function normalizeUser(raw: any): User {
  return {
    ...raw,
    profile: normalizeProfileFromApi(raw.profile),
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  } as User;
}

/**
 * Service centralisé pour l'authentification.
 */
export class AuthService {
  static async register(email: string, password: string): Promise<User> {
    if (isDemoEnvironment()) {
      const user = await DemoAuthService.register(email, password);
      notifyAuthListeners(user);
      return user;
    }

    try {
      const defaultProfile = createDefaultProfile();
      const { user: rawUser, token, refreshToken } = await apiClient.post<AuthResponse>('/auth/register', {
        email,
        password,
        profile: defaultProfile,
      });

      const user = normalizeUser(rawUser);
      await saveSession(token, refreshToken, user);
      notifyAuthListeners(user);
      return user;
    } catch (error: any) {
      // Tenter de basculer automatiquement en mode démo si erreur réseau
      if (enableDemoModeAfterNetworkError(error)) {
        console.log('🔄 Basculement automatique en mode démo après erreur réseau');
        // Basculer vers le mode démo via le service
        await import('./appModeService').then(service => service.setDemoMode(true));
        // Réessayer avec le mode démo
        return AuthService.register(email, password);
      }
      
      throw new Error(formatAuthError(error));
    }
  }

  static async login(email: string, password: string): Promise<User> {
    if (isDemoEnvironment()) {
      const user = await DemoAuthService.login(email, password);
      notifyAuthListeners(user);
      return user;
    }

    try {
      const { user: rawUser, token, refreshToken } = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const user = normalizeUser(rawUser);
      await saveSession(token, refreshToken, user);
      notifyAuthListeners(user);
      return user;
    } catch (error: any) {
      // Tenter de basculer automatiquement en mode démo si erreur réseau
      if (enableDemoModeAfterNetworkError(error)) {
        console.log('🔄 Basculement automatique en mode démo après erreur réseau');
        // Basculer vers le mode démo via le service
        await import('./appModeService').then(service => service.setDemoMode(true));
        // Réessayer avec le mode démo
        return AuthService.login(email, password);
      }
      
      throw new Error(formatAuthError(error));
    }
  }

  static async logout(): Promise<void> {
    if (isDemoEnvironment()) {
      await DemoAuthService.logout();
      notifyAuthListeners(null);
      return;
    }

    try {
      await apiClient.post('/auth/logout', undefined).catch(() => undefined);
    } finally {
      await clearSession();
      notifyAuthListeners(null);
    }
  }

  static async deleteAccount(userId: string): Promise<void> {
    if (isDemoEnvironment()) {
      await DemoAuthService.logout();
      notifyAuthListeners(null);
      return;
    }

    try {
      await apiClient.delete(`/users/${userId}`);
    } finally {
      await clearSession();
      notifyAuthListeners(null);
    }
  }

  static async updateProfile(userId: string, profileUpdates: Partial<UserProfile>): Promise<User> {
    const sanitizedPayload = sanitizeProfileUpdates(profileUpdates);

    if (isDemoEnvironment()) {
      await DemoAuthService.updateProfile(sanitizedPayload);
      const user = await DemoAuthService.getCurrentUser();
      notifyAuthListeners(user);
      return user as User;
    }

    try {
      await apiClient.patch(`/users/${userId}/profile`, sanitizedPayload);
      const updatedUser = await this.getUserProfile(userId);
      await updateStoredUser(updatedUser);
      notifyAuthListeners(updatedUser);
      return updatedUser;
    } catch (error: any) {
      throw new Error(formatAuthError(error));
    }
  }

  static async getUserProfile(userId: string): Promise<User> {
    if (isDemoEnvironment()) {
      const user = await DemoAuthService.getUserById(userId);
      notifyAuthListeners(user);
      return user;
    }

    try {
      const rawUser = await apiClient.get<User>(`/users/${userId}`);
      return normalizeUser(rawUser);
    } catch (error: any) {
      throw new Error(formatAuthError(error));
    }
  }

  static onAuthStateChanged(callback: AuthListener): () => void {
    if (isDemoEnvironment()) {
      const unsubscribeDemo = DemoAuthService.onAuthStateChanged((demoUser) => {
        notifyAuthListeners(demoUser);
      });
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
        unsubscribeDemo();
      };
    }

    listeners.add(callback);
    ensureInitialisation();
    return () => {
      listeners.delete(callback);
    };
  }
}

/**
 * Fonction: formatAuthError
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
function formatAuthError(error: any): string {
  const status = error?.status;
  const message = error?.details?.message || error?.message || 'Erreur inconnue';

  if (status === 401 || status === 403) {
    return 'Identifiants invalides ou session expirée.';
  }

  if (status === 409) {
    return 'Cette adresse email est déjà utilisée.';
  }

  if (status === 400) {
    return message;
  }
  
  // Gestion explicite des erreurs réseau pour un message plus clair
  if (error?.message?.includes('Network request failed')) {
    console.error('Détails erreur réseau:', error);
    return 'Impossible de contacter le serveur. Vérifiez votre connexion Internet ou essayez le mode démo.';
  }

  return message || 'Erreur d\'authentification.';
}

export default AuthService;
